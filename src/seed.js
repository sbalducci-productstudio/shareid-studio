/* ShareID Studio — seed.js
   SOURCE DE VÉRITÉ du graphe de démo : les ORGANISATIONS (entités + hiérarchie)
   et les UTILISATEURS (un email = une org = un rôle ici). session.jsx et
   admin.jsx en dérivent leurs seeds ; la vue Entreprise (org.jsx) affiche ce
   graphe tel quel. AUCUNE donnée de requête/PII ici — c'est volontairement vide
   tant que la couche « requêtes » n'est pas implémentée.

   Ce module est pur (pas de React/DOM) : il encode juste les données du casting
   validé avec le PM. Tout le gating reste piloté par access.js — seed.js ne fait
   que fournir QUI existe, pas QUI a le droit de quoi. */

/* ----------------------------- organisations ----------------------------- */
/* Champs :
   - `entity` ∈ shareid | business | group | retailer (cf. access.js ENTITIES)
   - `parent`  : id de l'org parente — filiale d'un groupe / business revendu par un retailer
   - `kind`    : "standard" | "operator_only" (variante business)
   - `subsidiaryAllowsPII` (filiales de groupe) : false = la filiale a coupé la PII
                 au groupe → exerce le conditionnel ◐ du modèle d'accès
   - `serves`  (pôles operator-only) : noms des business dont le pôle traite les requêtes
   - `color`   : couleur de marque (donnée, pas du CSS — utilisée par les aperçus client) */
export const ORGS = [
  { id: "shareid", nm: "ShareID", entity: "shareid", color: "#3253D1" },

  // — 3 business indépendants (équipes volontairement variées) —
  { id: "atlas",  nm: "Néobanque Atlas",  entity: "business", kind: "standard", color: "#3253D1" },
  { id: "volt",   nm: "Crypto Volt",      entity: "business", kind: "standard", color: "#6D5AE6" },
  { id: "previa", nm: "Assurance Prévia", entity: "business", kind: "standard", color: "#1FA37A" },

  // — Groupe 1 : Société Générale — 2 filiales, dont une a coupé la PII (cas ◐) —
  { id: "sg",     nm: "Groupe Société Générale", entity: "group", color: "#E5202E" },
  { id: "sgpart", nm: "SG Particuliers", entity: "business", kind: "standard", parent: "sg", subsidiaryAllowsPII: true,  color: "#E5202E" },
  { id: "bourso", nm: "Boursorama",      entity: "business", kind: "standard", parent: "sg", subsidiaryAllowsPII: false, color: "#FF6B2C" },

  // — Groupe 2 : Crédit Mutuel — 2 filiales —
  { id: "cm",    nm: "Groupe Crédit Mutuel", entity: "group", color: "#C8102E" },
  { id: "cic",   nm: "CIC Pro",              entity: "business", kind: "standard", parent: "cm", subsidiaryAllowsPII: true, color: "#005EB8" },
  { id: "bpsud", nm: "Banque Populaire Sud", entity: "business", kind: "standard", parent: "cm", subsidiaryAllowsPII: true, color: "#0B3D91" },

  // — Retailer : Tessi (mur de données) revend un business operator-only —
  { id: "tessi",  nm: "Tessi", entity: "retailer", color: "#00A3A1" },
  { id: "origin", nm: "Mutuelle Origin", entity: "business", kind: "operator_only", parent: "tessi", color: "#7A4FBF" },

  // — Pôle anti-fraude : business operator-only partenaire qui traite les requêtes
  //   de plusieurs clients (illustre le scope multi-business operator/expert) —
  { id: "antifraude", nm: "Pôle anti-fraude", entity: "business", kind: "operator_only", serves: ["Néobanque Atlas", "Assurance Prévia"], color: "#0E1116" },
];

/* ----------------------------- utilisateurs ----------------------------- */
/* Champs : id, name, email, org (id), role (cf. access.js ROLES), owner?,
   status ∈ active|pending|disabled, mfa, created (ISO), last (libellé relatif). */
export const USERS = [
  // ShareID — le siège : un admin propriétaire + un sales
  { id: "u_simon",  name: "Simon Balducci", email: "simon@shareid.ai",  org: "shareid", role: "sid_admin", owner: true, status: "active", mfa: true,  created: "2025-09-01", last: "à l'instant" },
  { id: "u_hanane", name: "Hanane Wahibi",  email: "hanane@shareid.ai", org: "shareid", role: "sid_sales",              status: "active", mfa: true,  created: "2025-10-12", last: "il y a 1 h" },

  // Néobanque Atlas — équipe COMPLÈTE (les 4 rôles business représentés)
  { id: "u_marie", name: "Marie Bernard", email: "marie.bernard@atlas.io", org: "atlas", role: "biz_admin", owner: true, status: "active", mfa: true, created: "2026-01-14", last: "il y a 2 h" },
  { id: "u_lucas", name: "Lucas Petit",   email: "lucas.petit@atlas.io",   org: "atlas", role: "agent",                  status: "active", mfa: true, created: "2026-02-03", last: "hier" },
  { id: "u_emma",  name: "Emma Laurent",  email: "emma.laurent@atlas.io",  org: "atlas", role: "agent",                  status: "active", mfa: true, created: "2026-01-30", last: "il y a 3 j" },
  { id: "u_sofia", name: "Sofia Nguyen",  email: "sofia.nguyen@atlas.io",  org: "atlas", role: "operator",               status: "active", mfa: true, created: "2026-02-20", last: "il y a 18 min" },
  { id: "u_karim", name: "Karim Haddad",  email: "karim.haddad@atlas.io",  org: "atlas", role: "expert",                 status: "active", mfa: true, created: "2026-03-01", last: "il y a 1 j" },

  // Crypto Volt — équipe SANS expert
  { id: "u_julien", name: "Julien Roy",    email: "julien.roy@cryptovolt.io",   org: "volt", role: "biz_admin", owner: true, status: "active", mfa: true,  created: "2026-03-10", last: "hier" },
  { id: "u_lea",    name: "Léa Fontaine",  email: "lea.fontaine@cryptovolt.io", org: "volt", role: "agent",                  status: "active", mfa: true,  created: "2026-03-15", last: "il y a 5 h" },
  { id: "u_marco",  name: "Marco Bianchi", email: "marco.bianchi@cryptovolt.io",org: "volt", role: "operator",               status: "active", mfa: false, created: "2026-04-02", last: "il y a 2 j" },

  // Assurance Prévia — équipe MINIMALE (admin + 1 agent)
  { id: "u_nathalie", name: "Nathalie Girard", email: "nathalie.girard@previa.fr", org: "previa", role: "biz_admin", owner: true, status: "active", mfa: true, created: "2026-02-08", last: "il y a 4 h" },
  { id: "u_paul",     name: "Paul Tessier",    email: "paul.tessier@previa.fr",    org: "previa", role: "agent",                  status: "active", mfa: true, created: "2026-02-18", last: "hier" },

  // Groupe Société Générale — l'admin de groupe + ses 2 filiales
  { id: "u_philippe", name: "Philippe Durand", email: "philippe.durand@socgen.com", org: "sg", role: "group_admin", owner: true, status: "active", mfa: true, created: "2025-11-20", last: "il y a 1 j" },
  { id: "u_aicha",  name: "Aïcha Benali", email: "aicha.benali@sgpart.fr", org: "sgpart", role: "biz_admin", owner: true, status: "active",  mfa: true,  created: "2025-12-01", last: "il y a 2 h" },
  { id: "u_yanis",  name: "Yanis Cohen",  email: "yanis.cohen@sgpart.fr",  org: "sgpart", role: "agent",                  status: "pending", mfa: false, created: "2026-06-07", last: "—" },
  { id: "u_thomas", name: "Thomas Klein", email: "thomas.klein@boursorama.com", org: "bourso", role: "biz_admin", owner: true, status: "active", mfa: true, created: "2025-12-05", last: "il y a 6 h" },
  { id: "u_chloe",  name: "Chloé Marin",  email: "chloe.marin@boursorama.com",  org: "bourso", role: "agent",                  status: "active", mfa: true, created: "2026-01-09", last: "hier" },

  // Groupe Crédit Mutuel — l'admin de groupe + ses 2 filiales
  { id: "u_bernard", name: "Bernard Roux", email: "bernard.roux@creditmutuel.fr", org: "cm", role: "group_admin", owner: true, status: "active", mfa: true, created: "2025-11-28", last: "il y a 3 j" },
  { id: "u_sarah", name: "Sarah Lévy",   email: "sarah.levy@cic.fr", org: "cic", role: "biz_admin", owner: true, status: "active",   mfa: true, created: "2026-01-22", last: "il y a 5 h" },
  { id: "u_hugo",  name: "Hugo Brun",    email: "hugo.brun@cic.fr",  org: "cic", role: "agent",                  status: "disabled", mfa: true, created: "2026-02-11", last: "il y a 1 mois" },
  { id: "u_antoine", name: "Antoine Faure", email: "antoine.faure@bpsud.fr", org: "bpsud", role: "biz_admin", owner: true, status: "active", mfa: true, created: "2026-02-15", last: "hier" },
  { id: "u_nora",    name: "Nora Saïdi",    email: "nora.saidi@bpsud.fr",    org: "bpsud", role: "agent",                  status: "active", mfa: true, created: "2026-03-04", last: "il y a 7 h" },

  // Tessi (retailer) — l'admin retailer (mur de données : jamais la PII)
  { id: "u_sandrine", name: "Sandrine Lopez", email: "sandrine.lopez@tessi.fr", org: "tessi", role: "retailer_admin", owner: true, status: "active", mfa: true, created: "2025-12-18", last: "il y a 1 j" },
  // Mutuelle Origin — business operator-only revendu par Tessi (opéré par le pôle)
  { id: "u_marc", name: "Marc Olivier", email: "marc.olivier@mutuelle-origin.fr", org: "origin", role: "biz_admin", owner: true, status: "active", mfa: true, created: "2026-03-20", last: "il y a 2 j" },

  // Pôle anti-fraude — admin + operator + expert qui traitent Atlas ET Prévia (multi-business)
  { id: "u_farid", name: "Farid Cherki",  email: "farid.cherki@antifraude.io", org: "antifraude", role: "biz_admin", owner: true, status: "active", mfa: true, created: "2025-12-22", last: "il y a 4 h" },
  { id: "u_ines",  name: "Inès Rahmani",  email: "ines.rahmani@antifraude.io", org: "antifraude", role: "operator",              status: "active", mfa: true, created: "2026-01-05", last: "il y a 22 min" },
  { id: "u_david", name: "David Lefort",  email: "david.lefort@antifraude.io", org: "antifraude", role: "expert",                status: "active", mfa: true, created: "2026-01-15", last: "il y a 1 h" },

  /* MULTI-ORG — le même email (simon@shareid.ai) est membre de plusieurs orgs,
     un seul rôle par org : ShareID Admin chez ShareID (ci-dessus, u_simon) +
     Business Admin chez Crypto Volt + Agent chez Néobanque Atlas. Le sélecteur
     d'org de la sidebar bascule entre ces 3 organisations (le rôle suit). */
  { id: "u_simon_volt",  name: "Simon Balducci", email: "simon@shareid.ai", org: "volt",  role: "biz_admin", status: "active", mfa: true, created: "2026-04-10", last: "à l'instant" },
  { id: "u_simon_atlas", name: "Simon Balducci", email: "simon@shareid.ai", org: "atlas", role: "agent",     status: "active", mfa: true, created: "2026-04-10", last: "à l'instant" },
];

/* ----------------------------- helpers ----------------------------- */
export function orgById(id) { return ORGS.find((o) => o.id === id) || null; }
export function usersOf(orgId) { return USERS.filter((u) => u.org === orgId); }
export function childrenOf(orgId) { return ORGS.filter((o) => o.parent === orgId); }
export function ownerOf(orgId) { return USERS.find((u) => u.org === orgId && u.owner) || null; }

/* Noms des business qu'une org « touche » — sert au libellé « business
   accessibles » et, plus tard, au scope des requêtes (SERVER-SIDE REQUIRED) :
   - ShareID  → null (tout)
   - groupe / retailer → ses entités enfants
   - pôle operator-only → les business qu'il sert
   - business → lui-même */
export function orgBusinesses(org) {
  if (!org) return [];
  if (org.entity === "shareid") return null;
  if (org.entity === "group" || org.entity === "retailer") return childrenOf(org.id).map((o) => o.nm);
  if (org.serves) return org.serves.slice();
  return [org.nm];
}

/* Descripteurs business pour le Business Setup (8 entités business, hors pôle
   partenaire). Spread par-dessus DEFAULT_BIZ dans App.jsx → source unique avec
   la vue Entreprise. owner/agents dérivent des USERS de l'org. */
export const SEED_BUSINESSES = ORGS
  .filter((o) => o.entity === "business" && o.id !== "antifraude")
  .map((o) => {
    const owner = ownerOf(o.id);
    const agents = usersOf(o.id).filter((u) => u.role === "agent").map((u) => ({ name: u.name, email: u.email }));
    return {
      seedId: o.id,
      name: o.nm,
      type: "standard",
      color: o.color,
      operatorEnabled: o.kind === "operator_only" ? true : true,
      owner: owner ? { name: owner.name, email: owner.email } : { name: "", email: "" },
      agents,
    };
  });
