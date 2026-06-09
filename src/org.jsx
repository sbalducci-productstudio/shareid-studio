/* ShareID Studio — org.jsx
   Vue « Organisations » : annuaire des organisations clientes de ShareID, dérivé du
   seed (seed.js, source unique). Même structure d'écran que la vue Utilisateurs
   (tableau partagé DataTable : recherche, tri, filtres par colonne, pagination).
   Un clic sur une ligne ouvre la fiche de l'organisation (équipe, périmètre,
   rattachement). Lecture seule pour l'instant — l'édition d'org (transfert,
   hiérarchie) viendra dans une itération dédiée ; la création de business passe
   par Business Setup. */
import React from "react";
import { Ico } from "./core.jsx";
import { ROLES, ENTITIES } from "./access.js";
import { ORGS, usersOf, orgById, ownerOf, orgBusinesses, visibleOrgIds } from "./seed.js";
import { useSession } from "./session.jsx";
import { DataTable } from "./datatable.jsx";

const STATUS = { active: { nm: "Actif", cls: "active" }, disabled: { nm: "Désactivé", cls: "fail" }, pending: { nm: "En attente", cls: "review" } };
const ENTITY_LABEL = { shareid: "ShareID", business: "Business", group: "Groupe", retailer: "Retailer" };
function initials(n) { return (n || "?").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase(); }

/* Une ligne utilisateur dans la fiche d'org : avatar, nom (+ owner), rôle, statut. */
function UserRow({ u }) {
  const rm = ROLES[u.role], sm = STATUS[u.status] || STATUS.active;
  return (
    <div className="org-user">
      <span className="req-ava sm">{initials(u.name)}</span>
      <div className="org-user-id">
        <span className="org-user-nm">{u.name}{u.owner && <span className="owner-tag">Owner</span>}</span>
        <span className="org-user-mail mono">{u.email}</span>
      </div>
      <span className={"role-tag " + rm.cls}>{rm.nm}</span>
      <span className={"status-pill " + sm.cls}><span className="d" />{sm.nm}</span>
    </div>);
}

/* Décore chaque org du seed des champs dérivés affichés/filtrés/triés en table.
   `variant` = standard / operator-only (business) ; `parentNm` = groupe ou
   retailer de rattachement ; `note` = précision domaine (PII coupée, mur de
   données, revente operator-only…) surfacée dans la fiche. */
function buildRows() {
  // ShareID est la plateforme, pas une organisation cliente → exclue de l'annuaire.
  return ORGS.filter((o) => o.entity !== "shareid").map((o) => {
    const team = usersOf(o.id);
    const owner = team.find((u) => u.owner) || ownerOf(o.id);
    const parent = o.parent ? orgById(o.parent) : null;
    const variant = o.kind === "operator_only" ? "Operator-only" : (o.entity === "business" ? "Standard" : "—");
    let note = null;
    if (o.entity === "retailer") note = "Mur de données : volume & facturation uniquement, jamais la PII de ses clients.";
    else if (o.entity === "group") note = "Vue consolidée sur ses filiales. PII des filiales visible par défaut (chaque filiale peut la couper).";
    else if (o.subsidiaryAllowsPII === false) note = "Cette filiale a coupé la visibilité PII pour le groupe (cas conditionnel ◐).";
    else if (o.kind === "operator_only" && parent) note = "Business operator-only revendu — opéré pour le compte du retailer.";
    else if (o.serves) note = "Traite les requêtes de : " + o.serves.join(", ") + ".";
    return {
      ...o, team, owner,
      entityLabel: ENTITY_LABEL[o.entity] || o.entity,
      variant, note,
      parentNm: parent ? parent.nm : "—",
      ownerNm: owner ? owner.name : "—",
      members: team.length,
    };
  });
}

/* Fiche d'une organisation (lecture seule) — même langage visuel que la fiche
   utilisateur (drawer). Périmètre business + équipe complète. */
function OrgDrawer({ org, onClose }) {
  const ent = ENTITIES[org.entity];
  const biz = orgBusinesses(org); // null = toutes les organisations (ShareID)
  return (
    <div className="drawer-scrim" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-h">
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <span className="org-mark" style={{ width: 42, height: 42, borderRadius: 12, fontSize: 14, background: "color-mix(in srgb," + org.color + " 14%,#fff)", color: org.color }}>{initials(org.nm)}</span>
            <div><h3 style={{ margin: 0 }}>{org.nm}</h3><div className="drawer-meta">{ent.nm}{org.variant !== "—" ? " · " + org.variant : ""}</div></div>
          </div>
          <button className="modal-x" onClick={onClose}><Ico name="x" size={16} sw={2.2} /></button>
        </div>
        <div className="drawer-body">
          <div className="user-meta-grid">
            <div className="umeta"><span className="umeta-k">Type</span><span className="umeta-v">{org.entityLabel}</span></div>
            <div className="umeta"><span className="umeta-k">Variante</span><span className="umeta-v">{org.variant}</span></div>
            <div className="umeta"><span className="umeta-k">Rattaché à</span><span className="umeta-v">{org.parentNm}</span></div>
            <div className="umeta"><span className="umeta-k">Propriétaire</span><span className="umeta-v">{org.ownerNm}</span></div>
          </div>

          {org.note && <div className="org-note" style={{ marginBottom: 16 }}><Ico name="info" size={13} sw={1.9} /><span>{org.note}</span></div>}

          <div className="drawer-sec"><div className="drawer-sec-t">Périmètre business</div>
            <div className="hint" style={{ padding: "2px 0" }}>{biz == null ? "Toutes les organisations (autorité plateforme)." : (biz.length ? biz.join(", ") : "Lui-même uniquement.")}</div>
          </div>

          <div className="drawer-sec"><div className="drawer-sec-t">Équipe ({org.members})</div>
            {org.team.length === 0
              ? <div className="hint" style={{ padding: "4px 2px" }}>Aucun utilisateur — opéré par un pôle partenaire.</div>
              : <div className="org-card-body" style={{ padding: 0 }}>{org.team.map((u) => <UserRow key={u.id} u={u} />)}</div>}
          </div>
        </div>
      </div>
    </div>);
}

export function CompanyView() {
  const { role, org } = useSession();
  const [sel, setSel] = React.useState(null);
  const allRows = React.useMemo(buildRows, []);
  /* Périmètre d'accès : ShareID voit toutes les orgs clientes ; une org voit la
     sienne + ses entités rattachées (filiales / business revendus). */
  const scopeIds = visibleOrgIds(role, org.id); // null = tout
  const rows = scopeIds == null ? allRows : allRows.filter((o) => scopeIds.includes(o.id));

  const cols = [
    { id: "name", h: "Nom", kind: "text", sortable: true, lock: true, get: (o) => o.nm,
      cell: (o) => <div className="req-name"><span className="org-mark sm" style={{ background: "color-mix(in srgb," + o.color + " 14%,#fff)", color: o.color }}>{initials(o.nm)}</span><span className="wf-row-t" style={{ fontSize: 13 }}>{o.nm}</span></div> },
    { id: "entityLabel", h: "Type d'organisation", kind: "cat", sortable: true, get: (o) => o.entityLabel,
      cell: (o) => <span className="wf-row-sub">{o.entityLabel}</span> },
    { id: "variant", h: "Variante", kind: "cat", get: (o) => o.variant,
      cell: (o) => <span className="wf-row-sub">{o.variant}</span> },
    { id: "parentNm", h: "Rattaché à", kind: "cat", sortable: true, get: (o) => o.parentNm,
      cell: (o) => <span className="wf-row-sub">{o.parentNm}</span> },
    { id: "ownerNm", h: "Propriétaire", kind: "text", sortable: true, get: (o) => o.ownerNm,
      cell: (o) => <span className="wf-row-sub">{o.ownerNm}</span> },
    { id: "members", h: "Membres", kind: "none", sortable: true, get: (o) => o.members, sortAccessor: (o) => o.members,
      cell: (o) => <span className="wf-row-sub">{o.members}</span> },
  ];

  return (
    <React.Fragment>
      <div className="dash-topbar">
        <div className="dt-head"><div className="eyebrow">Admin</div><h1>Organisations</h1></div>
      </div>
      <div className="dash-body console-body">
        <div className="note" style={{ maxWidth: 820, marginBottom: 18 }}>
          <span className="ico"><Ico name="building" size={15} sw={1.9} /></span>
          <div>Annuaire des organisations clientes de ShareID et de leurs équipes. Cliquez une ligne pour
            ouvrir la fiche (équipe, périmètre, rattachement). Pour parcourir le Studio tel qu'un rôle le voit,
            utilisez « Voir en tant que » dans <b>Contrôle des accès</b>.</div>
        </div>
        <DataTable
          rows={rows} cols={cols}
          searchPlaceholder="Rechercher une organisation…"
          searchGet={(o) => o.nm + " " + o.ownerNm + " " + o.parentNm}
          onRowClick={setSel} rowKey={(o) => o.id}
          emptyLabel="Aucune organisation ne correspond à ces filtres." />
      </div>
      {sel && <OrgDrawer org={sel} onClose={() => setSel(null)} />}
    </React.Fragment>);
}
