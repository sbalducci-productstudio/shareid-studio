/* ShareID Studio — selectors.js
   The data-access layer for the prototype. Components MUST read request data
   through these selectors rather than touching the raw arrays, so that scoping
   and PII redaction happen BEFORE data reaches the render tree — the closest
   thing to server-side enforcement available without a backend.

   SERVER-SIDE REQUIRED: in production, every filter here must be re-applied in
   the backend / data-access layer. Client-side redaction stops a curious user
   in the UI; it does not stop someone reading the network response. */
import { piiAccess } from "./access.js";

/* A request "belongs" to the operator/expert queue when it needs human review
   (status "review"). This is our prototype proxy for "assigned / escalated". */
function isAssignedTo(role, row) {
  if (role === "operator" || role === "expert") return row.status === "review";
  return true;
}

/* Does this row fall inside the active org's business scope? */
function inBusinessScope(org, row) {
  if (!org || org.businesses === null) return true;       // ShareID: all
  return org.businesses.includes(row.business);
}

/* Scope a flat list of requests to what the active session may list at all.
   Retailers get nothing (data wall); Sales get demo (test-mode) data only;
   Operator/Expert get only their review queue; others get their business scope. */
export function scopeRequests(session, requests) {
  const { role, org } = session;
  if (role === "retailer_admin") return [];               // DATA WALL — no request list
  return requests.filter((r) => {
    if (!inBusinessScope(org, r)) return false;
    if (role === "sid_sales") return r.mode === "test";   // demo data only
    if (!isAssignedTo(role, r)) return false;             // operator/expert scoping
    return true;
  });
}

/* Resolve PII access for ONE row given the active session. Merges row-specific
   context (assignment, same-business, demo) with the session context. */
export function piiForRow(session, row) {
  const { role, org, ctx } = session;
  return piiAccess(role, {
    ...ctx,
    isAssigned: isAssignedTo(role, row),
    sameBusiness: inBusinessScope(org, row),
    isDemo: ctx.isDemo ? row.mode === "test" : false,
  });
}
