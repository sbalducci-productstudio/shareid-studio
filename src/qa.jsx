/* ShareID Studio — qa.jsx
   "Contrôle des accès" — the roles & permissions QA tool (ShareID Admin only).

   Everything rendered here is DERIVED from access.js (the SSoT encoding of the
   Excel model): the 8 roles, the action matrix, the data-visibility matrix, the
   data levels and the visibility rules. Nothing about roles/permissions is typed
   in this file — change the Excel → update access.js → this view follows.

   It does three things the QA spec asks for:
   1. "View As" launcher — impersonate any of the 8 roles (onViewAs), read-only.
   2. Shows, per role, its allowed actions and its data level.
   3. Lets a ◐ conditional be configured live (Group Admin PII per subsidiary). */
import React from "react";
import { Ico } from "./core.jsx";
import {
  ROLES, ROLE_KEYS, ENTITIES,
  ACTIONS, ACTION_KEYS, ACTION_LABELS, actionPerm,
  VISIBILITY, VISIBILITY_SURFACES, SURFACE_LABELS,
  DATA_LEVELS, VISIBILITY_RULES, dataLevel, isConditional,
} from "./access.js";
import { useSession } from "./session.jsx";

/* A single ✔ / — / ◐ cell, driven by the raw matrix value (true | false | "cond"). */
function Mark({ v }) {
  if (v === true) return <span className="perm-mark yes" title="Autorisé / visible">✔</span>;
  if (v === "cond") return <span className="perm-mark cond" title="Conditionnel / selon paramètre">◐</span>;
  return <span className="perm-mark no" title="Non">—</span>;
}

function RolePill({ role }) {
  const m = ROLES[role];
  return <span className={"role-tag " + m.cls}>{m.nm}</span>;
}

export function AccessQA({ onViewAs }) {
  const { realRole, condOverrides, setCond } = useSession();
  // Entities in display order, each with the roles it hosts (from the SSoT).
  const entityOrder = ["shareid", "business", "group", "retailer"];

  // Is the subsidiary-PII conditional currently overridden? (drives the ◐ toggle)
  const subsidiaryPII = "subsidiaryAllowsPII" in condOverrides ? !!condOverrides.subsidiaryAllowsPII : true;

  return (
    <React.Fragment>
      <div className="dash-topbar">
        <div className="dt-head"><div className="eyebrow">Admin · QA</div><h1>Contrôle des accès</h1></div>
      </div>
      <div className="dash-body console-body">
        <div className="note" style={{ maxWidth: 820, marginBottom: 22 }}>
          <span className="ico"><Ico name="shieldAlert" size={15} sw={1.9} /></span>
          <div>Vérifiez la calibration des rôles. Choisissez « Voir en tant que » pour parcourir le Studio
            tel que ce rôle le voit — <b>en lecture seule, sans aucune modification de données</b>. La matrice
            ci-dessous est dérivée du modèle d'accès (onglets Permissions et Data &amp; visibilité).</div>
        </div>

        {/* ---------- 1. View As launcher ---------- */}
        <h3 style={{ margin: "0 0 4px" }}>Voir le Studio en tant que…</h3>
        <p className="biz-empty-sub" style={{ margin: "0 0 14px", maxWidth: 720 }}>
          Chaque rôle, son organisation d'origine, son niveau de donnée et le nombre d'actions autorisées.
        </p>
        {entityOrder.map((eid) => {
          const ent = ENTITIES[eid];
          const hosts = ent.hosts.filter((r) => ROLE_KEYS.includes(r));
          return (
            <div key={eid} style={{ marginBottom: 16 }}>
              <div className="nav-group-l" style={{ marginBottom: 8 }}>{ent.nm}</div>
              <div className="qa-grid">
                {hosts.map((role) => {
                  const dl = dataLevel(role);
                  const allowed = ACTION_KEYS.filter((a) => actionPerm(role, a) !== false).length;
                  const cond = ACTION_KEYS.filter((a) => isConditional(role, a)).length;
                  return (
                    <div className="qa-card" key={role}>
                      <div className="qa-card-h">
                        <RolePill role={role} />
                        {role === realRole && <span className="hint" style={{ fontSize: 10.5 }}>vous</span>}
                      </div>
                      <div className="qa-data">
                        <Ico name="eye" size={14} />
                        <span>{dl.nm}{dl.conditional ? " ◐" : ""}</span>
                        {dl.pii ? <span className="pii on">PII</span> : <span className="pii off">sans PII</span>}
                      </div>
                      <div className="qa-actions-mini">
                        {allowed} action{allowed > 1 ? "s" : ""} autorisée{allowed > 1 ? "s" : ""}
                        {cond > 0 ? ` · dont ${cond} ◐` : ""}
                      </div>
                      <button className="sid-btn outline" style={{ justifyContent: "center" }} onClick={() => onViewAs(role)}>
                        <Ico name="eye" size={14} sw={1.9} />Voir en tant que ce rôle
                      </button>
                    </div>);
                })}
              </div>
            </div>);
        })}

        {/* ---------- 2. Permissions matrix (actions × roles) ---------- */}
        <h3 style={{ margin: "26px 0 4px" }}>Permissions — actions × rôles</h3>
        <p className="biz-empty-sub" style={{ margin: "0 0 12px" }}>Dérivé de l'onglet Permissions. ✔ autorisé · — non · ◐ conditionnel.</p>
        <div className="wf-table-wrap"><div className="wf-table-scroll">
          <table className="wf-table qa-matrix">
            <thead><tr>
              <th>Action</th>
              {ROLE_KEYS.map((r) => <th key={r} className="rot">{ROLES[r].nm}</th>)}
            </tr></thead>
            <tbody>
              {ACTION_KEYS.map((a) => (
                <tr key={a}>
                  <td className="act-lab">{ACTION_LABELS[a]}</td>
                  {ROLE_KEYS.map((r) => <td key={r} className="ctr"><Mark v={ACTIONS[a][r]} /></td>)}
                </tr>))}
            </tbody>
          </table>
        </div></div>

        {/* ---------- 3. Data & visibility matrix ---------- */}
        <h3 style={{ margin: "26px 0 4px" }}>Data &amp; visibilité — qui voit quoi</h3>
        <p className="biz-empty-sub" style={{ margin: "0 0 12px" }}>Dérivé de l'onglet Data &amp; visibilité.</p>
        <div className="wf-table-wrap"><div className="wf-table-scroll">
          <table className="wf-table qa-matrix">
            <thead><tr>
              <th>Rôle</th>
              {VISIBILITY_SURFACES.map((s) => <th key={s} className="rot">{SURFACE_LABELS[s]}</th>)}
            </tr></thead>
            <tbody>
              {ROLE_KEYS.map((r) => (
                <tr key={r}>
                  <td className="act-lab"><RolePill role={r} /></td>
                  {VISIBILITY_SURFACES.map((s) => <td key={s} className="ctr"><Mark v={VISIBILITY[r][s]} /></td>)}
                </tr>))}
            </tbody>
          </table>
        </div></div>

        {/* data levels legend */}
        <h3 style={{ margin: "24px 0 4px" }}>Les niveaux de donnée</h3>
        <div className="data-levels" style={{ marginTop: 10 }}>
          {DATA_LEVELS.map((d) => (
            <div className="data-level" key={d.key}>
              <div className="dl-h">
                <span className="dl-nm">{d.nm}</span>
                {d.pii ? <span className="role-tag role-retailer" style={{ fontSize: 9.5, padding: "1px 6px" }}>{d.pii === "sensitive" ? "PII sensible" : "PII"}</span>
                       : <span className="role-tag role-sales" style={{ fontSize: 9.5, padding: "1px 6px" }}>sans PII</span>}
              </div>
              <div className="dl-ex">{d.ex}</div>
            </div>))}
        </div>

        {/* visibility rules — verbatim from the model */}
        <h3 style={{ margin: "24px 0 4px" }}>Règles de visibilité</h3>
        <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 13, lineHeight: 1.7, color: "var(--ink)" }}>
          {VISIBILITY_RULES.map((rule, i) => <li key={i}>{rule}</li>)}
        </ul>

        {/* ---------- 4. Configurable ◐ conditional ---------- */}
        <h3 style={{ margin: "26px 0 4px" }}>Conditionnels ◐ configurables</h3>
        <p className="biz-empty-sub" style={{ margin: "0 0 12px", maxWidth: 720 }}>
          Les règles ◐ dépendent d'un paramètre. Ajustez-le ici pour vérifier les deux cas dans la vue « Voir en tant que ».
        </p>
        <div className="tgl-row" style={{ maxWidth: 720 }}>
          <div className="tinfo">
            <div className="tt">Group Admin — PII des filiales visible</div>
            <div className="td">Par défaut, le Groupe voit la PII de ses Business. Chaque filiale peut la désactiver
              dans ses paramètres ; basculez ici pour simuler une filiale qui l'a coupée.</div>
          </div>
          <button className={"sw" + (subsidiaryPII ? " on" : "")} aria-label="PII filiales"
            onClick={() => setCond({ subsidiaryAllowsPII: !subsidiaryPII })} />
        </div>
      </div>
    </React.Fragment>);
}
