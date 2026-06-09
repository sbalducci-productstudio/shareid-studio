/* ShareID Studio — session.jsx
   The active-session context: who is logged in, which org is active, and the
   role they hold IN that org. Multi-org rule from the access model: one unique
   email may belong to several orgs, with EXACTLY ONE role per org; the org
   switcher changes the active org and UI/permissions follow.

   Since this is a frontend prototype with no real auth, we seed a demo user who
   belongs to several orgs across the 4 entity types, and expose a role/org
   "impersonator" so every gating + PII rule can be demoed live. In production
   the active (org, role) would come from the authenticated session, not from a
   client-side switcher.

   "View As" — QA impersonation. EXCEPTIONNEL pour le prototype : le sélecteur
   « View As » (en bas du rail) permet de se connecter EN TANT QUE n'importe quel
   utilisateur du seed et de voir EXACTEMENT ce qu'il voit (son identité, son
   organisation, son rôle, donc ses sections + sa donnée). C'est un outil de QA
   produit pour Simon : il reste accessible quel que soit le rôle observé, pour
   pouvoir cueillir tous les utilisateurs et revenir à son compte. C'est en
   lecture seule (jamais persisté) — ce n'est PAS une barrière de sécurité
   (cf. frontière d'enforcement dans CLAUDE.md). */
import React from "react";
import { ROLES, ENTITIES } from "./access.js";
import { USERS, orgById, orgBusinesses } from "./seed.js";

const LS_KEY = "shareid_session_v2";

/* Qui est connecté par défaut : Simon, ShareID Admin (l'autorité plateforme). On
   démarre en Admin pour que toute l'arborescence soit visible et que le « View
   As » soit accessible d'emblée — c'est le rôle qui voit tout. */
const ME = USERS.find((u) => u.role === "sid_admin");
export const DEMO_USER = { name: ME.name, email: ME.email };

/* Construit un descripteur d'org « de session » à partir d'un id d'org + rôle.
   Sert à la fois à la liste multi-org réelle et à l'impersonation complète d'un
   utilisateur. `businesses` (null = tout) alimente le scope des requêtes. */
function orgDesc(orgId, role, owner) {
  const o = orgById(orgId);
  return {
    id: o.id, nm: o.nm, entity: o.entity, role, owner: !!owner,
    businesses: orgBusinesses(o),
    color: o.color,
    ...(o.entity === "group" ? { subsidiaryAllowsPII: true } : {}),
  };
}

/* Les organisations d'un email (règle multi-org : un rôle par org). */
function orgsForEmail(email) {
  return USERS.filter((u) => u.email === email).map((u) => orgDesc(u.org, u.role, u.owner));
}

/* MULTI-ORG — le sélecteur d'org (en haut de la sidebar) liste les organisations
   où l'EMAIL connecté est membre, un rôle par org. Basculer change l'org active
   et le rôle suit. (Pour observer d'AUTRES utilisateurs, c'est « View As », en
   bas de la sidebar.) Dérivé du seed → source unique. */
export const DEMO_ORGS = orgsForEmail(ME.email);

// On démarre sur l'org ShareID (rôle Admin → voit tout + View As accessible).
const DEFAULT_ORG_ID = ME.org;

const SessionContext = React.createContext(null);

export function SessionProvider({ children }) {
  const saved = (() => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) { return {}; } })();
  // Default to Simon's ShareID Admin org — voit tout, View As accessible.
  const [activeOrgId, setActiveOrgId] = React.useState(saved.activeOrgId || DEFAULT_ORG_ID);

  /* "View As" — full-user impersonation. Holds the seed USER id currently being
     observed, or null for the real session. The Studio then renders exactly as
     that user sees it (identity + org + role). Intentionally NOT persisted: it's
     a transient, read-only QA mode. */
  const [viewAsId, setViewAsId] = React.useState(null);

  /* Configurable ◐ conditionals (Data & visibilité tab). Lets the QA tool exercise
     both branches of a conditional rule live — e.g. a Group Admin's PII view that a
     subsidiary may disable. An explicit override wins over the org's own setting. */
  const [condOverrides, setCondOverrides] = React.useState({}); // { subsidiaryAllowsPII?: bool }

  React.useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ activeOrgId })); } catch (e) {}
  }, [activeOrgId]);

  // L'utilisateur du seed observé en View As (null = session réelle).
  const impUser = viewAsId ? USERS.find((u) => u.id === viewAsId) : null;
  const isViewAs = !!impUser;

  // Session réelle (l'utilisateur authentifié — Simon, ShareID Admin).
  const realOrg = DEMO_ORGS.find((o) => o.id === activeOrgId) || DEMO_ORGS[0];

  /* Session effective : l'utilisateur impersoné en View As, sinon le réel. On
     change DE PERSONNE en View As — identité, org et rôle suivent l'utilisateur
     observé, donc l'UI montre exactement ce qu'il voit. */
  const user = impUser ? { name: impUser.name, email: impUser.email } : DEMO_USER;
  const org = impUser ? orgDesc(impUser.org, impUser.role, impUser.owner) : realOrg;
  const orgs = impUser ? orgsForEmail(impUser.email) : DEMO_ORGS;
  const role = org.role;
  // En View As, le rôle effectif EST le rôle observé (impersonation complète).
  const realRole = role;

  /* Switching org. En session réelle : change l'org active de Simon. En View As :
     bascule sur la même PERSONNE dans son autre organisation (réutilise
     l'impersonation), sans sortir de l'observation. */
  function switchOrg(id) {
    if (impUser) {
      const target = USERS.find((u) => u.email === impUser.email && u.org === id);
      if (target) setViewAsId(target.id);
      return;
    }
    setActiveOrgId(id);
  }
  /* Entrer/sortir du View As. Passer un id d'utilisateur du seed ; null = revenir
     à la session réelle (Simon). */
  function setViewAs(userId) { setViewAsId(userId || null); }
  /* Override a ◐ conditional flag (e.g. { subsidiaryAllowsPII: false }). */
  function setCond(patch) { setCondOverrides((c) => ({ ...c, ...patch })); }

  // Subsidiary PII: explicit override wins, otherwise the org's own setting (default on).
  const subsidiaryAllowsPII = "subsidiaryAllowsPII" in condOverrides
    ? !!condOverrides.subsidiaryAllowsPII
    : org.subsidiaryAllowsPII !== false;

  const value = {
    user,
    orgs,
    org,
    role,            // effective role (impersonated user's role when in View As)
    realRole,        // the role of the session currently rendered
    roleMeta: ROLES[role],
    entity: ENTITIES[ROLES[role].entity],
    switchOrg,
    // View As (QA) — full-user impersonation
    isViewAs,
    viewAsId,
    viewAsUser: impUser,    // the seed USER object being observed (or null)
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
