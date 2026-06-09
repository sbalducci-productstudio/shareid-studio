/* ShareID Studio — access.js
   SINGLE SOURCE OF TRUTH for the access model (entities, roles, actions, data
   visibility). This module is the canonical encoding of the product's access
   model; the UI MUST derive every gating/redaction decision from here, never
   from ad-hoc checks. It is pure (no React, no DOM) so it can be unit-tested in
   isolation — see access.test.js.

   IMPORTANT — enforcement boundary: this repo is a frontend-only prototype.
   The helpers below drive UI gating and a client-side PII redaction selector
   (see selectors.js). They are NOT a security boundary on their own: anything
   the browser receives, a determined user can read. The rules flagged
   "SERVER-SIDE REQUIRED" below (the Retailer data wall, Operator/Expert request
   scoping, all PII filtering) MUST also be enforced in the real ShareID backend
   / data-access layer. Here we encode them once so both layers can share the
   same matrix and so the prototype demoes the correct behaviour. */

/* ----------------------------- entities ----------------------------- */
/* The 4 entity types. Every access decision is scoped to the active org's
   entity. `hosts` lists the roles that live inside each entity. */
export const ENTITIES = {
  shareid: {
    id: "shareid", nm: "ShareID",
    d: "Autorité suprême — voit et fait tout.",
    hosts: ["sid_admin", "sid_sales"],
  },
  business: {
    id: "business", nm: "Business",
    d: "Unité de base (une organisation). Variantes : standard · operator-only.",
    variants: ["standard", "operator_only"],
    hosts: ["biz_admin", "agent", "operator", "expert"],
  },
  group: {
    id: "group", nm: "Groupe",
    d: "Consolide plusieurs Businesses sous une vue unifiée.",
    hosts: ["group_admin"],
  },
  retailer: {
    id: "retailer", nm: "Retailer",
    d: "Revendeur : crée et vend des Businesses et des Groupes.",
    hosts: ["retailer_admin"],
  },
};

/* ----------------------------- roles ----------------------------- */
/* 8 canonical roles. `level` is a coarse ordering used only for display and as
   a sanity backstop; the authoritative creation rule is the explicit CREATABLE
   map below (the model gives explicit lists, not a pure hierarchy). */
export const ROLES = {
  sid_admin:      { id: "sid_admin",      nm: "ShareID Admin",   entity: "shareid",  level: 100, cls: "role-sid" },
  sid_sales:      { id: "sid_sales",      nm: "ShareID Sales",   entity: "shareid",  level: 80,  cls: "role-sales" },
  retailer_admin: { id: "retailer_admin", nm: "Retailer Admin",  entity: "retailer", level: 70,  cls: "role-retailer" },
  group_admin:    { id: "group_admin",    nm: "Group Admin",     entity: "group",    level: 60,  cls: "role-group" },
  biz_admin:      { id: "biz_admin",      nm: "Business Admin",  entity: "business", level: 50,  cls: "role-ba" },
  agent:          { id: "agent",          nm: "Agent",           entity: "business", level: 20,  cls: "role-agent" },
  operator:       { id: "operator",       nm: "Operator",        entity: "business", level: 20,  cls: "role-op" },
  expert:         { id: "expert",         nm: "Expert",          entity: "business", level: 30,  cls: "role-expert" },
};
export const ROLE_KEYS = Object.keys(ROLES);

/* USER-CREATION RULE — a user may only create the roles listed here, within its
   own scope. Encoded explicitly from the model (more faithful than a numeric
   hierarchy, e.g. Sales is high-level but may only create Business Admin/Agent). */
export const CREATABLE = {
  sid_admin:      [...ROLE_KEYS],                                          // all roles
  sid_sales:      ["biz_admin", "agent"],                                  // creates Businesses, runs demos
  retailer_admin: ["retailer_admin", "group_admin", "biz_admin"],          // sold groups & businesses
  group_admin:    ["group_admin", "biz_admin", "agent", "operator", "expert"],
  biz_admin:      ["biz_admin", "agent", "operator", "expert"],            // own Business only
  agent:          [],
  operator:       [],
  expert:         [],
};

/* ----------------------------- action matrix ----------------------------- */
/* ✔ → true · — → false · ◐ → "cond" (allowed, but scoped/contextual — the
   scope is resolved by the caller via context, e.g. the data selector). */
const Y = true, N = false, C = "cond";
export const ACTIONS = {
  //                  sid_admin sid_sales retailer  group   biz    agent  operator expert
  validateRejected:   { sid_admin: Y, sid_sales: N, retailer_admin: N, group_admin: N, biz_admin: N, agent: Y, operator: N, expert: C },
  humanReview:        { sid_admin: Y, sid_sales: N, retailer_admin: N, group_admin: N, biz_admin: N, agent: N, operator: Y, expert: Y },
  arbitrate:          { sid_admin: Y, sid_sales: N, retailer_admin: N, group_admin: N, biz_admin: N, agent: N, operator: N, expert: Y },
  createBizGroup:     { sid_admin: Y, sid_sales: Y, retailer_admin: Y, group_admin: Y, biz_admin: N, agent: N, operator: N, expert: N },
  configureBusiness:  { sid_admin: Y, sid_sales: Y, retailer_admin: Y, group_admin: Y, biz_admin: Y, agent: N, operator: N, expert: N },
  buildWorkflows:     { sid_admin: Y, sid_sales: C, retailer_admin: C, group_admin: Y, biz_admin: Y, agent: N, operator: N, expert: N },
  toggleLive:         { sid_admin: Y, sid_sales: Y, retailer_admin: Y, group_admin: Y, biz_admin: Y, agent: N, operator: N, expert: N },
  configureTokenCost: { sid_admin: Y, sid_sales: N, retailer_admin: N, group_admin: N, biz_admin: N, agent: N, operator: N, expert: N },
  demos:              { sid_admin: Y, sid_sales: Y, retailer_admin: Y, group_admin: C, biz_admin: C, agent: Y, operator: N, expert: N },
  contactSupport:     { sid_admin: Y, sid_sales: Y, retailer_admin: Y, group_admin: Y, biz_admin: Y, agent: Y, operator: Y, expert: Y },
};
export const ACTION_KEYS = Object.keys(ACTIONS);

/* Human labels for actions — verbatim from the Permissions tab. Kept here so the
   QA tool (and any consumer) reads labels from the SSoT, never re-typing them.
   Same order as ACTIONS so a matrix renders in the model's row order. */
export const ACTION_LABELS = {
  validateRejected:   "Valider les requêtes rejetées",
  humanReview:        "Revue humaine des requêtes",
  arbitrate:          "Arbitrer les requêtes escaladées",
  createBizGroup:     "Créer des Business / Groupes",
  configureBusiness:  "Configurer le scope & le branding",
  buildWorkflows:     "Construire les workflows",
  toggleLive:         "Basculer Test ↔ Live",
  configureTokenCost: "Configurer le coût du token",
  demos:              "Faire des démos / Run Authenticity",
  contactSupport:     "Contacter le support",
};

/* ----------------------------- visibility matrix ----------------------------- */
/* Data visibility per surface. Levels in the model:
   Aggregated/Billing/Metadata = no PII · Result/PII = PII · Raw documents = sensitive PII.
   Values: true (full) · "cond" (conditional, see VISIBILITY RULES) · false (none). */
export const VISIBILITY = {
  //                dashboard requests  detailPII  rawDocs
  sid_admin:      { dashboard: Y, requests: Y, detailPII: Y, rawDocs: Y },
  sid_sales:      { dashboard: C, requests: C, detailPII: C, rawDocs: N }, // demo data only
  retailer_admin: { dashboard: Y, requests: N, detailPII: N, rawDocs: N }, // DATA WALL
  group_admin:    { dashboard: Y, requests: Y, detailPII: C, rawDocs: N }, // PII by default, subsidiary can disable
  biz_admin:      { dashboard: Y, requests: Y, detailPII: Y, rawDocs: Y },
  agent:          { dashboard: Y, requests: Y, detailPII: Y, rawDocs: C }, // raw docs only within own business
  operator:       { dashboard: N, requests: Y, detailPII: Y, rawDocs: Y }, // assigned requests only
  expert:         { dashboard: N, requests: Y, detailPII: Y, rawDocs: Y }, // escalated requests only
};
export const VISIBILITY_SURFACES = ["dashboard", "requests", "detailPII", "rawDocs"];

/* Column labels for the visibility surfaces — verbatim from the Data & visibilité tab. */
export const SURFACE_LABELS = {
  dashboard: "Dashboard & stats",
  requests:  "Requêtes",
  detailPII: "Détail / PII",
  rawDocs:   "Documents bruts",
};

/* The 5 data levels (Data & visibilité tab), ordered least → most sensitive.
   `pii` flags whether the level carries personal data. */
export const DATA_LEVELS = [
  { key: "aggregated", nm: "Agrégé",          pii: false, ex: "Volumes, taux de succès" },
  { key: "billing",    nm: "Facturation",     pii: false, ex: "Conso de tokens, coût" },
  { key: "metadata",   nm: "Métadonnées",     pii: false, ex: "Date, statut, type de doc, verdict" },
  { key: "result",     nm: "Résultat / PII",  pii: true,  ex: "Nom, date de naissance, crops du document" },
  { key: "raw",        nm: "Documents bruts", pii: "sensitive", ex: "Photo, vidéo" },
];

/* The visibility rules (Data & visibilité tab) — verbatim, displayed as-is by the QA tool. */
export const VISIBILITY_RULES = [
  "ShareID voit tout. Business Admin voit tout sur son Business.",
  "Groupe : voit la PII de ses Business PAR DÉFAUT ; chaque filiale peut la désactiver dans ses paramètres.",
  "Retailer : data wall — agrégé + facturation uniquement, jamais la PII.",
  "ShareID Sales : démo uniquement. Operator / Expert : seulement leurs requêtes assignées / escaladées.",
];

/* ----------------------------- helpers ----------------------------- */
/* Raw matrix value for an action (true | false | "cond"). */
export function actionPerm(role, action) {
  const row = ACTIONS[action];
  if (!row) throw new Error("Unknown action: " + action);
  return row[role] ?? false;
}
/* Boolean gate: a conditional ("cond") counts as allowed — the affordance is
   shown and the scope is resolved downstream (selector / context). */
export function can(role, action) {
  return actionPerm(role, action) !== false;
}
/* True when the permission is conditional (caller must apply context). */
export function isConditional(role, action) {
  return actionPerm(role, action) === "cond";
}

/* Raw visibility value for a surface (true | false | "cond"). */
export function visibility(role, surface) {
  const row = VISIBILITY[role];
  if (!row) throw new Error("Unknown role: " + role);
  return row[surface] ?? false;
}

/* Resolve PII access for a role given context. This is the heart of the data
   wall + scoping rules. SERVER-SIDE REQUIRED: mirror this in the backend.
   ctx: { isDemo, sameBusiness, subsidiaryAllowsPII, isAssigned }
     - sales: PII only on demo data
     - group_admin: PII unless the subsidiary disabled it (default allowed)
     - agent: raw docs only within own business
     - operator/expert: only their assigned/escalated requests
   Returns { detail: bool, raw: bool }. */
export function piiAccess(role, ctx = {}) {
  const resolve = (level, condValue) => {
    if (level === true) return true;
    if (level === false) return false;
    return !!condValue; // "cond"
  };
  const detailLvl = visibility(role, "detailPII");
  const rawLvl = visibility(role, "rawDocs");

  // per-role condition resolution
  let detailCond = true, rawCond = true;
  if (role === "sid_sales") { detailCond = !!ctx.isDemo; rawCond = false; }
  if (role === "group_admin") { detailCond = ctx.subsidiaryAllowsPII !== false; rawCond = false; }
  if (role === "agent") { rawCond = !!ctx.sameBusiness; }

  let detail = resolve(detailLvl, detailCond);
  let raw = resolve(rawLvl, rawCond);

  // Operator/Expert: scoped to assigned/escalated requests only.
  if ((role === "operator" || role === "expert") && ctx.isAssigned === false) {
    detail = false; raw = false;
  }
  // Retailer data wall is absolute — belt and braces even if matrix changes.
  if (role === "retailer_admin") { detail = false; raw = false; }
  return { detail, raw };
}

/* Highest data level a role can reach, derived from its visibility row (never
   hardcoded per role). Returns the most sensitive level the role can see plus a
   `conditional` flag when that level is gated by a ◐ rule. Used by the QA tool to
   answer "what data level does this role have?". */
export function dataLevel(role) {
  const lvl = (k) => DATA_LEVELS.find((d) => d.key === k);
  const raw = visibility(role, "rawDocs");
  const detail = visibility(role, "detailPII");
  const requests = visibility(role, "requests");
  const dash = visibility(role, "dashboard");
  if (raw) return { ...lvl("raw"), conditional: raw === "cond" };
  if (detail) return { ...lvl("result"), conditional: detail === "cond" };
  if (requests) return { ...lvl("metadata"), conditional: requests === "cond" };
  if (dash) return { ...lvl("billing"), nm: "Agrégé & facturation", conditional: dash === "cond" };
  return { key: "none", nm: "Aucune donnée", pii: false, ex: "—", conditional: false };
}

/* Roles this actor may create (USER-CREATION RULE). */
export function creatableRoles(role) {
  return CREATABLE[role] ? [...CREATABLE[role]] : [];
}
export function canCreateRole(actorRole, targetRole) {
  return creatableRoles(actorRole).includes(targetRole);
}

/* ----------------------------- section access ----------------------------- */
/* Maps a Studio nav section id to a predicate over the role. Single place that
   decides which sections appear in the rail and which are guarded. */
export const SECTION_ACCESS = {
  // Console
  home:       (r) => visibility(r, "dashboard") !== false,
  stats:      (r) => visibility(r, "dashboard") !== false,
  requests:   (r) => visibility(r, "requests") !== false,
  operator:   (r) => can(r, "humanReview"),
  demo:       (r) => can(r, "demos"),
  // Build
  wf_builder:  (r) => can(r, "buildWorkflows"),
  biz_setup:   (r) => can(r, "configureBusiness") || can(r, "createBizGroup"),
  user_create: (r) => creatableRoles(r).length > 0, // créer un utilisateur = même droit que la gestion
  // Admin
  users:      (r) => creatableRoles(r).length > 0,
  business:   (r) => can(r, "configureBusiness"),
  parcours:   (r) => can(r, "buildWorkflows") || can(r, "configureBusiness") || visibility(r, "requests") !== false, // voir les parcours accessibles
  access:     (r) => r === "sid_admin", // Roles & permissions QA tool — ShareID Admin only
  settings:   (r) => can(r, "configureBusiness") || can(r, "createBizGroup"), // paramètres de l'organisation
};
export function canAccessSection(role, sectionId) {
  const pred = SECTION_ACCESS[sectionId];
  return pred ? pred(role) : false;
}
