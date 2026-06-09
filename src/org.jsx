/* ShareID Studio — org.jsx
   Vue « Entreprise » : l'arborescence complète des organisations et de leurs
   utilisateurs, dérivée du seed (seed.js, source unique). Lecture seule pour
   l'instant — l'édition d'org (transfert, hiérarchie) viendra dans une itération
   dédiée ; la création de business passe par Business Setup.

   Organisée par famille d'entité : ShareID · business indépendants · groupes ·
   retailers · pôles operator-only (partenaires). Chaque carte d'org se déplie
   pour montrer son équipe (rôle, owner, statut). */
import React from "react";
import { Ico } from "./core.jsx";
import { ROLES, ENTITIES } from "./access.js";
import { ORGS, usersOf, childrenOf, orgBusinesses } from "./seed.js";

const STATUS = { active: { nm: "Actif", cls: "active" }, disabled: { nm: "Désactivé", cls: "fail" }, pending: { nm: "En attente", cls: "review" } };
function initials(n) { return (n || "?").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase(); }

/* Une ligne utilisateur : avatar, nom (+ owner), rôle, statut. */
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

/* Une carte d'organisation dépliable. `badge` = libellé d'entité ; `note` =
   précision contextuelle (ex. PII coupée, business servis, mur de données). */
function OrgCard({ org, note, defaultOpen = false }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const team = usersOf(org.id);
  const owner = team.find((u) => u.owner);
  const ent = ENTITIES[org.entity];
  return (
    <div className="org-card">
      <button className="org-card-h" onClick={() => setOpen((v) => !v)}>
        <span className="org-mark" style={{ background: "color-mix(in srgb," + org.color + " 14%,#fff)", color: org.color }}>{initials(org.nm)}</span>
        <div className="org-card-id">
          <span className="org-card-nm">{org.nm}</span>
          <span className="org-card-sub">{ent.nm}{org.kind === "operator_only" ? " · operator-only" : ""}{owner ? " · " + owner.name : ""}</span>
        </div>
        <span className="org-card-n">{team.length} membre{team.length > 1 ? "s" : ""}</span>
        <Ico name={open ? "chevUp" : "chevDown"} size={16} sw={2} />
      </button>
      {note && <div className="org-note"><Ico name="info" size={13} sw={1.9} /><span>{note}</span></div>}
      {open && (
        <div className="org-card-body">
          {team.length === 0
            ? <div className="hint" style={{ padding: "4px 2px" }}>Aucun utilisateur — opéré par un pôle partenaire.</div>
            : team.map((u) => <UserRow key={u.id} u={u} />)}
        </div>)}
    </div>);
}

/* Un groupe / retailer + ses entités enfants imbriquées. */
function ParentBlock({ org }) {
  const kids = childrenOf(org.id);
  const note = org.entity === "retailer"
    ? "Mur de données : volume & facturation uniquement, jamais la PII de ses clients."
    : "Vue consolidée sur ses filiales. PII des filiales visible par défaut (chaque filiale peut la couper).";
  return (
    <div className="org-tree">
      <OrgCard org={org} note={note} defaultOpen />
      <div className="org-children">
        {kids.map((k) => (
          <OrgCard key={k.id} org={k}
            note={k.subsidiaryAllowsPII === false
              ? "Cette filiale a coupé la visibilité PII pour le groupe (cas conditionnel ◐)."
              : k.kind === "operator_only" ? "Business operator-only revendu — opéré pour le compte du retailer." : null} />
        ))}
      </div>
    </div>);
}

function Section({ title, sub, children }) {
  return (
    <div className="org-section">
      <div className="org-section-h"><h3>{title}</h3>{sub && <p className="biz-empty-sub">{sub}</p>}</div>
      {children}
    </div>);
}

export function CompanyView() {
  const shareid = ORGS.find((o) => o.entity === "shareid");
  const standalone = ORGS.filter((o) => o.entity === "business" && !o.parent && !o.serves);
  const groups = ORGS.filter((o) => o.entity === "group");
  const retailers = ORGS.filter((o) => o.entity === "retailer");
  const pools = ORGS.filter((o) => o.serves); // pôles operator-only

  return (
    <React.Fragment>
      <div className="dash-topbar">
        <div className="dt-head"><div className="eyebrow">Admin</div><h1>Entreprise</h1></div>
      </div>
      <div className="dash-body console-body">
        <div className="note" style={{ maxWidth: 820, marginBottom: 22 }}>
          <span className="ico"><Ico name="building" size={15} sw={1.9} /></span>
          <div>Cartographie des organisations clientes de ShareID et de leurs équipes. Chaque carte se déplie
            pour montrer ses utilisateurs et leurs rôles. Pour parcourir le Studio tel qu'un rôle le voit,
            utilisez « Voir en tant que » dans <b>Contrôle des accès</b>.</div>
        </div>

        <Section title="ShareID" sub="L'autorité plateforme — voit et configure tout.">
          <OrgCard org={shareid} defaultOpen />
        </Section>

        <Section title="Business indépendants" sub="Des entités autonomes, chacune avec son équipe.">
          {standalone.map((o) => <OrgCard key={o.id} org={o} />)}
        </Section>

        <Section title="Groupes" sub="Une org de groupe consolide plusieurs business sous une vue unifiée.">
          {groups.map((o) => <ParentBlock key={o.id} org={o} />)}
        </Section>

        <Section title="Retailers" sub="Revendeurs de ShareID — facturation uniquement, jamais la PII.">
          {retailers.map((o) => <ParentBlock key={o.id} org={o} />)}
        </Section>

        <Section title="Pôles partenaires (operator-only)" sub="Des équipes anti-fraude qui traitent les requêtes de plusieurs clients.">
          {pools.map((o) => <OrgCard key={o.id} org={o} note={"Traite les requêtes de : " + orgBusinesses(o).join(", ") + "."} />)}
        </Section>
      </div>
    </React.Fragment>);
}
