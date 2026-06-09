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
import { USERS, orgById, orgBusinesses } from "./seed.js";

const LS_KEY = "shareid_session_v2";

/* Qui est connecté par défaut : Simon, ShareID Admin (l'autorité plateforme). On
   démarre en Admin pour que toute l'arborescence soit visible et que le « View
   As » (outil QA) soit accessible d'emblée — c'est le rôle qui voit tout. */
const ME = USERS.find((u) => u.role === "sid_admin");
export const DEMO_USER = { name: ME.name, email: ME.email };

/* MULTI-ORG — le sélecteur d'org (en haut de la sidebar) liste les organisations
   où l'EMAIL connecté est membre, un rôle par org. C'est la vraie feature
   multi-org du modèle d'accès : basculer change l'org active et le rôle suit.
   (Pour observer d'AUTRES rôles sans changer d'org, c'est « View As », un outil
   admin distinct, en bas de la sidebar.) Dérivé du seed → source unique.
   `businesses` (null = tout) alimente le scope des requêtes côté sélecteur. */
export const DEMO_ORGS = USERS
  .filter((u) => u.email === ME.email)
  .map((u) => {
    const o = orgById(u.org);
    return {
      id: o.id, nm: o.nm, entity: o.entity, role: u.role, owner: !!u.owner,
      businesses: orgBusinesses(o),
      ...(o.entity === "group" ? { subsidiaryAllowsPII: true } : {}),
    };
  });

// On démarre sur l'org ShareID (rôle Admin → voit tout + View As accessible).
const DEFAULT_ORG_ID = ME.org;

const SessionContext = React.createContext(null);

export function SessionProvider({ children }) {
  const saved = (() => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) { return {}; } })();
  // Default to Simon's ShareID Admin org — voit tout, View As accessible.
  const [activeOrgId, setActiveOrgId] = React.useState(saved.activeOrgId || DEFAULT_ORG_ID);

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
  // L'identité reste celle de l'utilisateur connecté (Simon) : on change d'ORG,
  // pas de personne. Seul le rôle change selon l'org active.
  const user = DEMO_USER;
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
    user,
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
