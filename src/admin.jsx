/* ShareID Studio — Admin: Manage Users (§4.6) + Product Demo (§4.8). */


import React from "react";
import { EidasTag, Ico } from "./core.jsx";
import { ROLES, creatableRoles, can } from "./access.js";
import { useSession } from "./session.jsx";
import { USERS, orgById, orgBusinesses, visibleOrgIds } from "./seed.js";
import { DataTable } from "./datatable.jsx";

/* Libellés de type de parcours (cf. DEFAULT_CFG.verifType). */
const VERIF_LABEL = { onboarding: "Onboarding", authentication: "Ré-authentification", extraction: "Extraction" };

/* Role display metadata is derived from the access-model SSoT so labels/keys
   never drift from the canonical roles. */
const ROLE_META = ROLES;
/* Ownership-eligible roles, derived from the SSoT: an owner is the propriétaire
   admin (Business / Group / Retailer Admin). ShareID Admin is the platform
   authority, not an org owner. Used to gate the "Transférer la propriété" action. */
const OWNER_ELIGIBLE = Object.keys(ROLES).filter((r) => r.endsWith("_admin") && r !== "sid_admin");
const USER_STATUS = { active: { nm: "Actif", cls: "active" }, disabled: { nm: "Désactivé", cls: "fail" }, pending: { nm: "En attente", cls: "review" } };

/* Liste des utilisateurs dérivée du seed (source unique) : on décore chaque user
   du nom de son org et des business qu'il « touche » pour l'affichage. */
const USERS_SEED = USERS.map((u) => {
  const o = orgById(u.org);
  const bizNames = orgBusinesses(o);
  return { ...u, orgNm: o ? o.nm : "—", biz: bizNames == null ? ["Tous"] : (bizNames.length ? bizNames : ["—"]) };
});
function userInitials(n) { return (n || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(); }

/* ----------------------------- Manage Users ----------------------------- */
export function ManageUsers() {
  const { role: myRole, org } = useSession();
  const creatable = creatableRoles(myRole); // USER-CREATION RULE — roles I may grant
  /* ShareID (Admin/Sales) voit l'annuaire global ; tout autre rôle est scopé aux
     users de son organisation active. (Le scope fin par requête est SERVER-SIDE.) */
  const isGlobal = myRole === "sid_admin" || myRole === "sid_sales";
  const [users, setUsers] = React.useState(USERS_SEED);
  const [sel, setSel] = React.useState(null);
  const [invite, setInvite] = React.useState(false);

  // Périmètre d'accès résolu en amont : annuaire global pour ShareID, sinon l'org active.
  const scoped = users.filter((u) => isGlobal || u.org === org.id);

  /* Description des colonnes passée au DataTable partagé (source unique en-tête /
     rendu / filtre / tri). La colonne Organisation n'apparaît que pour ShareID. */
  const cols = [
    { id: "name", h: "Nom", kind: "text", sortable: true, lock: true, get: (u) => u.name,
      cell: (u) => <div className="req-name"><span className="req-ava">{userInitials(u.name)}</span><div><span className="wf-row-t" style={{ fontSize: 13 }}>{u.name}</span>{u.owner && <span className="owner-tag">Owner</span>}</div></div> },
    { id: "email", h: "Email", kind: "text", get: (u) => u.email,
      cell: (u) => <span className="wf-row-sub mono" style={{ fontSize: 11.5 }}>{u.email}</span> },
    ...(isGlobal ? [{ id: "org", h: "Organisation", kind: "cat", sortable: true, get: (u) => u.orgNm,
      cell: (u) => <span className="wf-row-sub">{u.orgNm}</span> }] : []),
    { id: "role", h: "Rôle", kind: "cat", sortable: true, get: (u) => u.role, label: (v) => ROLE_META[v]?.nm || v,
      cell: (u) => { const rm = ROLE_META[u.role]; return <span className={"role-tag " + rm.cls}>{rm.nm}</span>; } },
    { id: "biz", h: "Business accessibles", kind: "text", get: (u) => u.biz.join(", "),
      cell: (u) => <span className="wf-row-sub">{u.biz.join(", ")}</span> },
    { id: "created", h: "Créé le", kind: "none", sortable: true, get: (u) => u.created,
      cell: (u) => <span className="wf-row-sub">{u.created}</span> },
    { id: "status", h: "Statut", kind: "cat", sortable: true, get: (u) => u.status, label: (v) => USER_STATUS[v]?.nm || v,
      cell: (u) => { const sm = USER_STATUS[u.status]; return <span className={"status-pill " + sm.cls}><span className="d" />{sm.nm}</span>; } },
  ];

  function update(id, patch) { setUsers((us) => us.map((u) => u.id === id ? { ...u, ...patch } : u)); setSel((s) => s && s.id === id ? { ...s, ...patch } : s); }
  function addUser(u) { setUsers((us) => [...us, u]); setInvite(false); }
  /* Ownership transfer — a single owner, transferable, never recreated: flip
     the owner flag from the current owner to the target user. */
  function transferOwnership(id) { setUsers((us) => us.map((u) => ({ ...u, owner: u.id === id }))); setSel((s) => s && { ...s, owner: s.id === id }); }

  return (
    <React.Fragment>
      <div className="dash-topbar">
        <div className="dt-head"><div className="eyebrow">Admin</div><h1>Utilisateurs</h1></div>
        {creatable.length > 0 && <button className="sid-btn primary" onClick={() => setInvite(true)}><Ico name="plus" size={16} sw={2.2} />Ajouter un utilisateur</button>}
      </div>
      <div className="dash-body console-body">
        {/* key = rôle : on remonte le tableau si le périmètre/colonnes changent (View As). */}
        <DataTable key={"users-" + myRole + "-" + org.id}
          rows={scoped} cols={cols}
          searchPlaceholder="Rechercher un utilisateur (nom ou email)…"
          searchGet={(u) => u.name + " " + u.email}
          onRowClick={setSel} rowKey={(u) => u.id}
          emptyLabel="Aucun utilisateur ne correspond à ces filtres." />
      </div>
      {sel && <UserDrawer u={sel} creatable={creatable} onClose={() => setSel(null)} onUpdate={update} onTransfer={transferOwnership} />}
      {invite && <InviteModal creatable={creatable} org={org} onClose={() => setInvite(false)} onAdd={addUser} />}
    </React.Fragment>);
}

function UserDrawer({ u, creatable = [], onClose, onUpdate, onTransfer }) {
  const rm = ROLE_META[u.role], sm = USER_STATUS[u.status];
  /* Assignable roles follow the user-creation rule; always include the user's
     current role so it stays selected/visible even if not otherwise creatable. */
  const roleIds = Array.from(new Set([u.role, ...creatable]));
  const roles = roleIds.map((id) => [id, ROLE_META[id]?.nm || id]);
  return (
    <div className="drawer-scrim" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-h">
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <span className="req-ava" style={{ width: 42, height: 42, borderRadius: 12, fontSize: 14 }}>{userInitials(u.name)}</span>
            <div><h3 style={{ margin: 0 }}>{u.name}{u.owner && <span className="owner-tag">Owner</span>}</h3><div className="drawer-meta mono">{u.email}</div></div>
          </div>
          <button className="modal-x" onClick={onClose}><Ico name="x" size={16} sw={2.2} /></button>
        </div>
        <div className="drawer-body">
          <div className="user-meta-grid">
            <div className="umeta"><span className="umeta-k">Statut</span><span className={"status-pill " + sm.cls}><span className="d" />{sm.nm}</span></div>
            <div className="umeta"><span className="umeta-k">Dernière connexion</span><span className="umeta-v">{u.last}</span></div>
            <div className="umeta"><span className="umeta-k">Créé le</span><span className="umeta-v">{u.created}</span></div>
            <div className="umeta"><span className="umeta-k">MFA</span><span className="umeta-v">{u.mfa ? "Activée" : "Non configurée"}</span></div>
          </div>

          <div className="drawer-sec"><div className="drawer-sec-t">Rôle</div>
            <div className="role-picker">
              {roles.map(([id, nm]) => <button key={id} className={"role-opt" + (u.role === id ? " on" : "")} disabled={u.owner} onClick={() => onUpdate(u.id, { role: id })}>{nm}</button>)}
            </div>
            {u.owner && <div className="hint" style={{ marginTop: 8 }}>L'owner ne peut être ni rétrogradé ni désactivé. Transférez d'abord la propriété à un autre admin (depuis sa fiche) — façon Figma : on ne recrée pas l'owner.</div>}
          </div>

          <div className="drawer-sec"><div className="drawer-sec-t">Connexion</div>
            <div className="logs">
              {[["Connexion réussie", u.last === "—" ? "jamais connecté" : u.last, "ok"], ["Connexion réussie", "il y a 1 j · iOS", "ok"], ["MFA validée", "il y a 1 j", "ok"]].map((l, i) =>
                <div className="log-row" key={i}><span className={"log-dot " + l[2]} /><span className="log-t">{l[0]}</span><span className="log-d">{l[1]}</span></div>)}
            </div>
          </div>
        </div>
        <div className="drawer-foot op-foot">
          <button className="sid-btn ghost"><Ico name="refresh" size={14} sw={1.9} />Forcer reset MFA</button>
          {!u.owner && u.status === "active" && onTransfer && OWNER_ELIGIBLE.includes(u.role) &&
            <button className="sid-btn ghost" onClick={() => onTransfer(u.id)}><Ico name="key" size={14} sw={1.9} />Transférer la propriété</button>}
          <div style={{ flex: 1 }} />
          {u.status === "disabled" ?
            <button className="sid-btn outline" onClick={() => onUpdate(u.id, { status: "active" })}>Réactiver</button> :
            <button className="op-btn reject" disabled={u.owner} onClick={() => !u.owner && onUpdate(u.id, { status: "disabled" })}><Ico name="lock" size={14} sw={2} />Désactiver</button>}
        </div>
      </div>
    </div>);
}

function InviteModal({ creatable = [], org, onClose, onAdd }) {
  const [email, setEmail] = React.useState("");
  // Default to the lowest-privilege creatable role (Agent if available).
  const [role, setRole] = React.useState(() => creatable.includes("agent") ? "agent" : creatable[0]);
  const valid = /\S+@\S+\.\S+/.test(email) && !!role;
  function send() {
    // L'invité rejoint l'organisation active de l'admin qui l'invite.
    onAdd({ id: "u" + Date.now(), name: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), email, role, org: org ? org.id : "shareid", orgNm: org ? org.nm : "—", biz: org ? [org.nm] : ["—"], created: "à l'instant", status: "pending", last: "—", mfa: false });
  }
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: "left", maxWidth: 440 }}>
        <button className="modal-x" onClick={onClose}><Ico name="x" size={16} sw={2.2} /></button>
        <div className="mi" style={{ background: "var(--info-bg)", color: "var(--color-main)" }}><Ico name="userCheck" size={22} /></div>
        <h3>Inviter un utilisateur</h3>
        <p>Un magic-link sera envoyé. L'invitation expire après 7 jours et reste renvoyable.</p>
        <div className="field" style={{ marginTop: 16 }}><span className="lab">Email</span><input className="inp" value={email} placeholder="prenom.nom@entreprise.com" onChange={(e) => setEmail(e.target.value)} autoFocus /></div>
        <div className="field" style={{ marginTop: 14 }}><span className="lab">Rôle</span>
          <div className="role-picker">{creatable.map((id) => <button key={id} className={"role-opt" + (role === id ? " on" : "")} onClick={() => setRole(id)}>{ROLE_META[id]?.nm || id}</button>)}</div>
        </div>
        <div className="mactions" style={{ marginTop: 22 }}>
          <button className="sid-btn ghost" onClick={onClose}>Annuler</button>
          <button className="sid-btn primary" disabled={!valid} onClick={send}><Ico name="share" size={14} sw={1.9} />Envoyer le magic-link</button>
        </div>
      </div>
    </div>);
}

/* ----------------------------- Product Demo ----------------------------- */
const DEMO_SCENARIOS = [
  { id: "onb_nfc", icon: "fileCheck", t: "Onboarding NFC", d: "Lecture de puce + liveness. Niveau de risque élevé.", level: "high" },
  { id: "onb_photo", icon: "doc", t: "Onboarding photo", d: "Capture photo simple du document et selfie.", level: "low" },
  { id: "auth_smile", icon: "smile", t: "Réauthentification MFA Smile", d: "Ré-identification rapide, sans nouvelle capture.", level: "subst" },
];
export function ProductDemo() {
  const [scenario, setScenario] = React.useState("onb_nfc");
  const [session, setSession] = React.useState(() => "demo_" + Math.random().toString(36).slice(2, 8).toUpperCase());
  return (
    <React.Fragment>
      <div className="dash-topbar"><div className="dt-head"><div className="eyebrow">Console</div><h1>Démo produit</h1></div></div>
      <div className="dash-body console-body">
        <div className="note warn" style={{ maxWidth: 760 }}>
          <span className="ico"><Ico name="info" size={15} sw={1.9} /></span>
          <div>Le mécanisme de démo est en cours de refonte : l'ancien business démo personnel a été supprimé au niveau Business Setup. Le nouveau mécanisme reste à spécifier (V1 · TBC).</div>
        </div>
        <div className="demo-grid">
          <div className="demo-pick">
            <div className="cfg-sec-t" style={{ marginBottom: 12 }}>Choisissez un scénario</div>
            <div className="opts">
              {DEMO_SCENARIOS.map((s) => {
                const sel = scenario === s.id;
                return (
                  <button key={s.id} className={"opt" + (sel ? " sel" : "")} onClick={() => setScenario(s.id)}>
                    <span className={"ico-tile" + (sel ? "" : " dim")}><Ico name={s.icon} size={19} /></span>
                    <div className="obody"><div className="otop"><span className="ot">{s.t}</span><EidasTag levelKey={s.level} /></div><div className="od">{s.d}</div></div>
                    <span className="mark" style={{ marginTop: 2 }}><Ico name="check" size={12} sw={3} /><span className="dot" /></span>
                  </button>);
              })}
            </div>
          </div>
          <div className="demo-launch">
            <div className="demo-card">
              <div className="demo-card-h">Lancer la démonstration</div>
              <div className="qr demo-qr" />
              <div className="demo-meta">Session <b className="mono">{session}</b></div>
              <p className="demo-hint">Scannez ce QR avec l'app ShareID pour lancer une démonstration en clientèle. Aucune donnée n'est conservée.</p>
              <div className="demo-actions">
                <button className="sid-btn ghost" onClick={() => setSession("demo_" + Math.random().toString(36).slice(2, 8).toUpperCase())}><Ico name="refresh" size={14} sw={2} />Régénérer</button>
                <button className="sid-btn primary"><Ico name="play" size={14} fill />Lancer</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>);
}

/* ----------------------------- Parcours (Admin) ----------------------------- */
/* Vue de consultation : la liste des workflows rendus accessibles (test / live).
   Construire un workflow se fait dans Build › Workflow builder ; une fois validé,
   il apparaît ici. Scopé par organisation : ShareID voit tout, une org voit ses
   propres parcours (et ceux de ses entités rattachées). Même tableau partagé que
   Utilisateurs / Organisations. */
const MODE_META = { live: { nm: "Live", cls: "live" }, test: { nm: "Test", cls: "test" } };
export function ParcoursView({ workflows = [], onNav }) {
  const { role, org } = useSession();
  // Décoration : nom d'org pour l'affichage + le filtre/scope.
  const rows = workflows.map((w) => ({ ...w, orgNm: orgById(w.org)?.nm || "—" }));
  // Périmètre d'accès résolu en amont (doublé SERVER-SIDE en prod).
  const scopeIds = visibleOrgIds(role, org.id); // null = tout
  const scoped = scopeIds == null ? rows : rows.filter((w) => scopeIds.includes(w.org));

  const cols = [
    { id: "name", h: "Nom du parcours", kind: "text", sortable: true, lock: true, get: (w) => w.name,
      cell: (w) => <div className="req-name"><span className="req-ava"><Ico name="layers" size={14} /></span><span className="wf-row-t" style={{ fontSize: 13 }}>{w.name}</span></div> },
    { id: "orgNm", h: "Organisation", kind: "cat", sortable: true, get: (w) => w.orgNm,
      cell: (w) => <span className="wf-row-sub">{w.orgNm}</span> },
    { id: "verifType", h: "Type de parcours", kind: "cat", sortable: true, get: (w) => VERIF_LABEL[w.verifType] || w.verifType,
      cell: (w) => <span className="wf-row-sub">{VERIF_LABEL[w.verifType] || w.verifType}</span> },
    { id: "eidasTarget", h: "Niveau de risque", kind: "cat", get: (w) => w.eidasTarget, label: (v) => ({ low: "Faible", subst: "Moyen", high: "Élevé", none: "Aucun" }[v] || v),
      cell: (w) => <EidasTag levelKey={w.eidasTarget} prefix="" /> },
    { id: "mode", h: "Mode", kind: "cat", sortable: true, get: (w) => w.mode, label: (v) => MODE_META[v]?.nm || v,
      cell: (w) => { const m = MODE_META[w.mode] || MODE_META.test; return <span className={"mode-pill " + m.cls}><span className="d" />{m.nm}</span>; } },
    { id: "modified", h: "Modifié le", kind: "none", get: (w) => w.modified,
      cell: (w) => <span className="wf-row-sub">{w.modified}</span> },
  ];

  return (
    <React.Fragment>
      <div className="dash-topbar">
        <div className="dt-head"><div className="eyebrow">Admin</div><h1>Parcours</h1></div>
        {can(role, "buildWorkflows") && <button className="sid-btn primary" onClick={() => onNav && onNav("wf_builder")}><Ico name="plus" size={16} sw={2.2} />Créer un parcours</button>}
      </div>
      <div className="dash-body console-body">
        <div className="note" style={{ maxWidth: 820, marginBottom: 18 }}>
          <span className="ico"><Ico name="layers" size={15} sw={1.9} /></span>
          <div>Les workflows rendus accessibles (test ou live). La construction se fait dans <b>Build › Workflow builder</b> ;
            une fois validé, un parcours apparaît ici. Cliquez une ligne pour l'ouvrir dans le builder.</div>
        </div>
        <DataTable
          rows={scoped} cols={cols}
          searchPlaceholder="Rechercher un parcours…"
          searchGet={(w) => w.name + " " + w.orgNm}
          onRowClick={() => onNav && onNav("wf_builder")} rowKey={(w) => w.id}
          emptyLabel="Aucun parcours accessible — construisez-en un dans le Workflow builder." />
      </div>
    </React.Fragment>);
}

/* ----------------------------- Créer un utilisateur (Build) ----------------------------- */
/* Écran de construction : ajouter un utilisateur à l'organisation active. La
   consultation des utilisateurs reste dans Admin › Utilisateurs (qui garde aussi
   son propre bouton d'ajout). Front-only : l'envoi affiche une confirmation. */
export function UserCreate() {
  const { role, org } = useSession();
  const creatable = creatableRoles(role); // USER-CREATION RULE — roles I may grant
  const [email, setEmail] = React.useState("");
  const [r, setR] = React.useState(() => creatable.includes("agent") ? "agent" : creatable[0]);
  const [sent, setSent] = React.useState(null); // email confirmé
  const valid = /\S+@\S+\.\S+/.test(email) && !!r;
  function send() { if (!valid) return; setSent(email); setEmail(""); }
  return (
    <React.Fragment>
      <div className="dash-topbar"><div className="dt-head"><div className="eyebrow">Build</div><h1>Créer un utilisateur</h1></div></div>
      <div className="dash-body console-body">
        {creatable.length === 0 ?
          <div className="note warn" style={{ maxWidth: 620 }}><span className="ico"><Ico name="lock" size={15} sw={1.9} /></span><div>Votre rôle ne permet pas de créer des utilisateurs.</div></div> :
          <div className="panel" style={{ maxWidth: 560 }}>
            <div className="panel-body" style={{ padding: 22 }}>
              {sent &&
                <div className="note" style={{ marginBottom: 18 }}><span className="ico"><Ico name="check" size={15} sw={2.2} /></span><div>Invitation envoyée à <b>{sent}</b> — magic-link valable 7 jours. Le nouvel utilisateur apparaîtra dans <b>Admin › Utilisateurs</b> une fois l'invitation acceptée.</div></div>}
              <p className="biz-empty-sub" style={{ marginTop: 0 }}>Le nouvel utilisateur rejoint l'organisation active : <b>{org.nm}</b>. Un magic-link lui est envoyé pour activer son compte.</p>
              <div className="field" style={{ marginTop: 16 }}><span className="lab">Email</span><input className="inp" value={email} placeholder="prenom.nom@organisation.com" onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="field" style={{ marginTop: 14 }}><span className="lab">Rôle</span>
                <div className="role-picker">{creatable.map((id) => <button key={id} className={"role-opt" + (r === id ? " on" : "")} onClick={() => setR(id)}>{ROLE_META[id]?.nm || id}</button>)}</div>
              </div>
              <div className="mactions" style={{ marginTop: 22 }}>
                <button className="sid-btn primary" disabled={!valid} onClick={send}><Ico name="share" size={14} sw={1.9} />Envoyer le magic-link</button>
              </div>
            </div>
          </div>}
      </div>
    </React.Fragment>);
}
