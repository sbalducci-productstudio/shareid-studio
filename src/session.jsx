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

  React.useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ activeOrgId })); } catch (e) {}
  }, [activeOrgId]);

  const org = DEMO_ORGS.find((o) => o.id === activeOrgId) || DEMO_ORGS[0];
  const role = org.role;

  const value = {
    user: DEMO_USER,
    orgs: DEMO_ORGS,
    org,
    role,
    roleMeta: ROLES[role],
    entity: ENTITIES[org.entity],
    switchOrg: setActiveOrgId,
    /* Context flags consumed by the PII selector (see selectors.js). */
    ctx: {
      subsidiaryAllowsPII: org.subsidiaryAllowsPII !== false,
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
