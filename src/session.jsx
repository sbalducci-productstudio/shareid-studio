/* ShareID Studio — session.jsx
   The active-session context: who is logged in, which org is active, and the
   role they hold IN that org. Multi-org rule from the access model: one unique
   email may belong to several orgs, with EXACTLY ONE role per org; the org
   switcher changes the active org and UI/permissions follow.

   Since this is a frontend prototype with no real auth, we seed a demo user who
   belongs to several orgs across the 4 entity types, and expose a role/org
   "impersonator" so every gating + PII rule can be demoed live. In production
   the active (org, role) would come from the authenticated session, not from a
   client-side switcher. */
import React from "react";
import { ROLES, ENTITIES } from "./access.js";

const LS_KEY = "shareid_session_v1";

/* Demo memberships — one role per org, spanning every entity type so each
   access path is reachable from the impersonator.
   - `subsidiaryAllowsPII` models the Group rule (a subsidiary may disable the
     group's PII view).
   - `businesses` is the set of business names (matching the data in charts.jsx)
     this org may see; `null` means "all" (ShareID). Used by the data selector
     to scope the requests list. */
export const DEMO_ORGS = [
  { id: "atlas",    nm: "Néobanque Atlas",   entity: "business", role: "biz_admin", owner: true, businesses: ["Néobanque Atlas"] },
  { id: "atlas_ag", nm: "Néobanque Atlas",   entity: "business", role: "agent",       businesses: ["Néobanque Atlas"] },
  // Operator/Expert are partner roles that may handle several clients' requests
  // (operator-only business). Scoped across both client businesses so the
  // review queue actually contains work to do.
  { id: "atlas_op", nm: "Pôle anti-fraude",  entity: "business", role: "operator",    businesses: ["Néobanque Atlas", "Assurance Prévia"] },
  { id: "atlas_ex", nm: "Pôle anti-fraude",  entity: "business", role: "expert",      businesses: ["Néobanque Atlas", "Assurance Prévia"] },
  { id: "previa",   nm: "Assurance Prévia",  entity: "business", role: "biz_admin",   businesses: ["Assurance Prévia"] },
  { id: "sg_group", nm: "Groupe Société Générale", entity: "group", role: "group_admin", subsidiaryAllowsPII: true, businesses: ["Néobanque Atlas", "Assurance Prévia"] },
  { id: "tessi",    nm: "Tessi (Retailer)",  entity: "retailer", role: "retailer_admin", businesses: [] },
  { id: "shareid",  nm: "ShareID",           entity: "shareid",  role: "sid_admin", owner: true, businesses: null },
  { id: "shareid_s",nm: "ShareID",           entity: "shareid",  role: "sid_sales",  businesses: null },
];

export const DEMO_USER = { name: "Marie Bernard", email: "marie.bernard@atlas.io" };

const SessionContext = React.createContext(null);

export function SessionProvider({ children }) {
  const saved = (() => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) { return {}; } })();
  // Default to the Business Admin org — the most common, fully-featured case.
  const [activeOrgId, setActiveOrgId] = React.useState(saved.activeOrgId || "atlas");

  /* "View As" — QA impersonation. A ShareID Admin can render the Studio exactly
     as any of the 8 roles would see it, WITHOUT changing their real membership.
     `viewAsRole === null` means no impersonation (the real role applies). This is
     intentionally NOT persisted: it's a transient, read-only QA mode. */
  const [viewAsRole, setViewAsRole] = React.useState(null);

  /* Configurable ◐ conditionals (Data & visibilité tab). Lets the QA tool exercise
     both branches of a conditional rule live — e.g. a Group Admin's PII view that a
     subsidiary may disable. An explicit override wins over the org's own setting. */
  const [condOverrides, setCondOverrides] = React.useState({}); // { subsidiaryAllowsPII?: bool }

  React.useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ activeOrgId })); } catch (e) {}
  }, [activeOrgId]);

  const org = DEMO_ORGS.find((o) => o.id === activeOrgId) || DEMO_ORGS[0];
  const realRole = org.role;
  // The role the UI renders as: the impersonated role in View As, else the real one.
  const role = viewAsRole || realRole;
  const isViewAs = viewAsRole != null;

  /* Switching real org always exits any impersonation. */
  function switchOrg(id) { setViewAsRole(null); setActiveOrgId(id); }
  /* Enter/leave View As. `null` exits. */
  function setViewAs(r) { setViewAsRole(r); }
  /* Override a ◐ conditional flag (e.g. { subsidiaryAllowsPII: false }). */
  function setCond(patch) { setCondOverrides((c) => ({ ...c, ...patch })); }

  // Subsidiary PII: explicit override wins, otherwise the org's own setting (default on).
  const subsidiaryAllowsPII = "subsidiaryAllowsPII" in condOverrides
    ? !!condOverrides.subsidiaryAllowsPII
    : org.subsidiaryAllowsPII !== false;

  const value = {
    user: DEMO_USER,
    orgs: DEMO_ORGS,
    org,
    role,            // effective role (impersonated when in View As)
    realRole,        // the user's actual role in the active org
    roleMeta: ROLES[role],
    entity: ENTITIES[ROLES[role].entity],
    switchOrg,
    // View As (QA)
    isViewAs,
    viewAsRole,
    setViewAs,
    readOnly: isViewAs,        // View As never mutates data — see App mutator guards
    // Configurable ◐ conditionals
    condOverrides,
    setCond,
    /* Context flags consumed by the PII selector (see selectors.js). */
    ctx: {
      subsidiaryAllowsPII,
      // ShareID Sales only ever operates on demo data in this prototype.
      isDemo: role === "sid_sales",
    },
  };
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = React.useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within <SessionProvider>");
  return ctx;
}
