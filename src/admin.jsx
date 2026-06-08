/* ShareID Studio — Admin: Manage Users (§4.6) + Product Demo (§4.8). */


import React from "react";
import { EidasTag, Ico } from "./core.jsx";
import { ROLES, creatableRoles } from "./access.js";
import { useSession } from "./session.jsx";

/* Role display metadata is derived from the access-model SSoT so labels/keys
   never drift from the canonical roles. */
const ROLE_META = ROLES;
/* Ownership-eligible roles, derived from the SSoT: an owner is the propriétaire
   admin (Business / Group / Retailer Admin). ShareID Admin is the platform
   authority, not an org owner. Used to gate the "Transférer la propriété" action. */
const OWNER_ELIGIBLE = Object.keys(ROLES).filter((r) => r.endsWith("_admin") && r !== "sid_admin");
const USER_STATUS = { active: { nm: "Actif", cls: "active" }, disabled: { nm: "Désactivé", cls: "fail" }, pending: { nm: "En attente", cls: "review" } };

const USERS_SEED = [
  { id: "u1", name: "Marie Bernard", email: "marie.bernard@atlas.io", role: "biz_admin", owner: true, biz: ["Néobanque Atlas"], created: "2026-01-14", status: "active", last: "il y a 2 h", mfa: true },
  { id: "u2", name: "Lucas Petit", email: "lucas.petit@atlas.io", role: "agent", biz: ["Néobanque Atlas"], created: "2026-02-03", status: "active", last: "hier", mfa: true },
  { id: "u3", name: "Sofia Nguyen", email: "sofia.nguyen@atlas.io", role: "operator", biz: ["Néobanque Atlas"], created: "2026-02-20", status: "active", last: "il y a 18 min", mfa: true },
  { id: "u4", name: "Karim Haddad", email: "karim.haddad@atlas.io", role: "expert", biz: ["Néobanque Atlas"], created: "2026-03-01", status: "active", last: "il y a 3 j", mfa: true },
  { id: "u5", name: "Thomas Mercier", email: "thomas.mercier@atlas.io", role: "agent", biz: ["Néobanque Atlas"], created: "2026-05-28", status: "pending", last: "—", mfa: false },
  { id: "u6", name: "Emma Laurent", email: "emma.laurent@atlas.io", role: "agent", biz: ["Néobanque Atlas"], created: "2026-01-30", status: "disabled", last: "il y a 2 mois", mfa: true },
];
function userInitials(n) { return n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(); }

/* ----------------------------- Manage Users ----------------------------- */
export function ManageUsers() {
  const { role: myRole } = useSession();
  const creatable = creatableRoles(myRole); // USER-CREATION RULE — roles I may grant
  const [users, setUsers] = React.useState(USERS_SEED);
  const [q, setQ] = React.useState("");
  const [role, setRole] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [sel, setSel] = React.useState(null);
  const [invite, setInvite] = React.useState(false);
  const rows = users.filter((u) =>
    (q === "" || u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())) &&
    (role === "all" || u.role === role) &&
    (status === "all" || u.status === status));
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
        <div className="filter-row">
          <div className="input-wrap" style={{ maxWidth: 260 }}>
            <span className="ico"><Ico name="search" size={15} /></span>
            <input className="inp with-icon" style={{ padding: "9px 12px 9px 34px", fontSize: 13 }} value={q} placeholder="Rechercher nom ou email…" onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="ctrl-div" />
          <span className="ctrl-lab">Rôle</span>
          {[["all", "Tous"], ["biz_admin", "Admin"], ["agent", "Agent"], ["operator", "Operator"], ["expert", "Expert"]].map(([id, nm]) =>
            <button key={id} className={"filter-chip" + (role === id ? " on" : "")} onClick={() => setRole(id)}>{nm}</button>)}
          <div className="ctrl-div" />
          <span className="ctrl-lab">Statut</span>
          {[["all", "Tous"], ["active", "Actifs"], ["disabled", "Inactifs"]].map(([id, nm]) =>
            <button key={id} className={"filter-chip" + (status === id ? " on" : "")} onClick={() => setStatus(id)}>{nm}</button>)}
        </div>
        <div className="wf-table-wrap">
          <div className="wf-table-scroll">
            <table className="wf-table">
              <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Business accessibles</th><th>Créé le</th><th>Statut</th></tr></thead>
              <tbody>
                {rows.map((u) => {
                  const rm = ROLE_META[u.role], sm = USER_STATUS[u.status];
                  return (
                    <tr key={u.id} className="wf-row" onClick={() => setSel(u)}>
                      <td><div className="req-name"><span className="req-ava">{userInitials(u.name)}</span><div><span className="wf-row-t" style={{ fontSize: 13 }}>{u.name}</span>{u.owner && <span className="owner-tag">Owner</span>}</div></div></td>
                      <td><span className="wf-row-sub mono" style={{ fontSize: 11.5 }}>{u.email}</span></td>
                      <td><span className={"role-tag " + rm.cls}>{rm.nm}</span></td>
                      <td><span className="wf-row-sub">{u.biz.join(", ")}</span></td>
                      <td><span className="wf-row-sub">{u.created}</span></td>
                      <td><span className={"status-pill " + sm.cls}><span className="d" />{sm.nm}</span></td>
                    </tr>);
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {sel && <UserDrawer u={sel} creatable={creatable} onClose={() => setSel(null)} onUpdate={update} onTransfer={transferOwnership} />}
      {invite && <InviteModal creatable={creatable} onClose={() => setInvite(false)} onAdd={addUser} />}
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

function InviteModal({ creatable = [], onClose, onAdd }) {
  const [email, setEmail] = React.useState("");
  // Default to the lowest-privilege creatable role (Agent if available).
  const [role, setRole] = React.useState(() => creatable.includes("agent") ? "agent" : creatable[0]);
  const valid = /\S+@\S+\.\S+/.test(email) && !!role;
  function send() {
    onAdd({ id: "u" + Date.now(), name: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), email, role, biz: ["Néobanque Atlas"], created: "à l'instant", status: "pending", last: "—", mfa: false });
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
