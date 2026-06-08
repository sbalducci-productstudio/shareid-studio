/* ShareID Studio — Console: Requests History + Operator Queue. */


import React from "react";
import { OPERATOR_QUEUE, OPERATOR_STATS, REQUESTS } from "./charts.jsx";
import { EidasTag, Ico } from "./core.jsx";
import { useSession } from "./session.jsx";
import { scopeRequests, piiForRow } from "./selectors.js";

const STATUS_META = {
  ok: { label: "Accepté", cls: "ok" }, retry: { label: "Reprise", cls: "retry" },
  review: { label: "En revue", cls: "review" }, fail: { label: "Rejeté", cls: "fail" },
};
function PII({ blur, children }) { return <span className={"pii" + (blur ? " blurred" : "")}>{children}</span>; }

/* §18 — deux usages : « finance / conformité » (colonnes, vues sauvegardées, export Excel)
   et « dev / debug » (détail d'une requête via le drawer). Vues prédéfinies = presets de colonnes. */
const ALL_COLS = [
  { id: "name", h: "Nom", cell: (r, blur) => <div className="req-name"><span className="req-ava">{r.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span><PII blur={blur}>{r.name}</PII></div> },
  { id: "dob", h: "Naissance", cell: (r, blur) => <PII blur={blur}>{r.dob}</PII> },
  { id: "doc", h: "Document", cell: (r) => <span className="wf-row-sub">{r.doc}</span> },
  { id: "business", h: "Business", cell: (r) => <span className="wf-row-sub">{r.business}</span> },
  { id: "date", h: "Date", cell: (r) => <span className="wf-row-sub mono" style={{ fontSize: 11.5 }}>{r.date.slice(5)}</span> },
  { id: "method", h: "Méthode", cell: (r) => <span className="method-tag">{r.method}</span> },
  { id: "level", h: "Niveau", cell: (r) => <EidasTag levelKey={r.level} prefix="" /> },
  { id: "verdict", h: "Verdict", cell: (r) => { const sm = STATUS_META[r.status]; return <span className={"status-pill " + sm.cls}><span className="d" />{sm.label}{r.status !== "review" && <b className="vscore">{r.score}</b>}</span>; } },
];
const SAVED_VIEWS = {
  standard: ["name", "dob", "doc", "business", "date", "method", "level", "verdict"],
  finance: ["business", "date", "method", "level", "verdict"],
  compliance: ["name", "dob", "doc", "date", "level", "verdict"],
};
export function RequestsHistory() {
  const session = useSession();
  const [blur, setBlur] = React.useState(() => localStorage.getItem("req_blur") === "1");
  const [tab, setTab] = React.useState("active");
  const [status, setStatus] = React.useState("all");
  const [sel, setSel] = React.useState(null);
  const [savedView, setSavedView] = React.useState("standard");
  const [cols, setCols] = React.useState(SAVED_VIEWS.standard);
  const [colMenu, setColMenu] = React.useState(false);
  function toggleBlur() { const v = !blur; setBlur(v); try { localStorage.setItem("req_blur", v ? "1" : "0"); } catch (e) {} }
  function applyView(v) { setSavedView(v); setCols(SAVED_VIEWS[v]); }
  function toggleCol(id) { setSavedView("custom"); setCols((c) => c.includes(id) ? c.filter((x) => x !== id) : ALL_COLS.filter((x) => c.includes(x.id) || x.id === id).map((x) => x.id)); }
  const visCols = ALL_COLS.filter((c) => cols.includes(c.id));
  /* Data-access layer: scope the rows to what this role/org may see BEFORE the
     status filter. Retailers get an empty list (data wall); operator/expert get
     only their queue; others get their business scope. */
  const scoped = scopeRequests(session, REQUESTS);
  const rows = scoped.filter((r) => status === "all" || r.status === status);
  return (
    <React.Fragment>
      <div className="dash-topbar">
        <div className="dt-head"><div className="eyebrow">Console</div><h1>Requêtes</h1></div>
        <div className="topbar-controls">
          <button className={"sid-btn outline sm-btn" + (blur ? " on" : "")} onClick={toggleBlur}><Ico name="eye" size={14} sw={1.8} />{blur ? "Données masquées" : "Masquer les données"}</button>
          <button className="sid-btn outline sm-btn"><Ico name="share" size={13} sw={1.8} />Export CSV</button>
          <button className="sid-btn inverse sm-btn"><Ico name="doc" size={13} sw={1.8} />Export Excel</button>
        </div>
      </div>
      <div className="dash-body console-body">
        <div className="req-tabs">
          <button className={"req-tab" + (tab === "active" ? " on" : "")} onClick={() => setTab("active")}>Actif<span className="req-tab-n">{scoped.length}</span></button>
          <button className={"req-tab" + (tab === "archived" ? " on" : "")} onClick={() => setTab("archived")}>Archivé<span className="req-tab-n">2 410</span></button>
        </div>
        <div className="filter-row">
          {[["all", "Tous"], ["ok", "Succès"], ["retry", "Reprise"], ["fail", "Échec"], ["review", "En attente operator"]].map(([id, nm]) =>
            <button key={id} className={"filter-chip" + (status === id ? " on" : "")} onClick={() => setStatus(id)}>{nm}</button>)}
          <div className="ctrl-div" />
          {/* §18 — vues récurrentes sauvegardées (presets de colonnes) */}
          {[["standard", "Standard"], ["finance", "Finance"], ["compliance", "Conformité"]].map(([id, nm]) =>
            <button key={id} className={"filter-chip" + (savedView === id ? " on" : "")} onClick={() => applyView(id)}><Ico name="book" size={13} sw={1.8} />{nm}</button>)}
          <div className="ctrl-div" />
          <div style={{ position: "relative" }}>
            <button className={"filter-chip" + (colMenu ? " on" : "")} onClick={() => setColMenu((v) => !v)}><Ico name="rows" size={13} sw={1.8} />Colonnes</button>
            {colMenu &&
              <div className="combo-pop" style={{ right: 0, left: "auto", minWidth: 190 }}>
                {ALL_COLS.map((c) => <button key={c.id} className="combo-opt" onClick={() => toggleCol(c.id)}><span className={"mark sq" + (cols.includes(c.id) ? "" : "")} style={cols.includes(c.id) ? { borderColor: "var(--color-main)", background: "var(--color-main)" } : null}><Ico name="check" size={11} sw={3} style={cols.includes(c.id) ? { opacity: 1 } : { opacity: 0 }} /></span>{c.h}</button>)}
              </div>}
          </div>
        </div>

        {tab === "archived" ?
          <div className="panel"><div className="panel-body"><div className="panel-empty"><Ico name="lock" size={20} /><span>Requêtes anonymisées au-delà de la rétention — métadonnées de comptage uniquement, PII et assets purgés.</span></div></div></div> :
          rows.length === 0 ?
          <div className="panel"><div className="panel-body"><div className="panel-empty"><Ico name="lock" size={20} /><span>Aucune requête accessible avec ce rôle — la liste des requêtes (et toute donnée personnelle) n'est pas disponible pour cette organisation.</span></div></div></div> :
          <div className="wf-table-wrap">
            <div className="wf-table-scroll">
              <table className="wf-table req-table">
                <thead><tr>{visCols.map((c) => <th key={c.id}>{c.h}</th>)}</tr></thead>
                <tbody>
                  {rows.map((r) => {
                    /* Effective blur = manual toggle OR a hard redaction when
                       this role has no PII detail access for this row. The
                       toggle can only tighten, never reveal. */
                    const pii = piiForRow(session, r);
                    const rowBlur = blur || !pii.detail;
                    return (
                      <tr key={r.id} className="wf-row" onClick={() => setSel({ r, pii })}>
                        {visCols.map((c) => <td key={c.id}>{c.cell(r, rowBlur)}</td>)}
                      </tr>);
                  })}
                </tbody>
              </table>
            </div>
            <div className="req-foot-hint"><Ico name="info" size={13} sw={1.8} />Vue <b>{savedView === "custom" ? "personnalisée" : savedView}</b> · cliquez une ligne pour le détail dev / debug · les vues sont sauvegardées et ré-applicables.</div>
          </div>}
      </div>
      {sel && <RequestDrawer r={sel.r} pii={sel.pii} blur={blur} onClose={() => setSel(null)} />}
    </React.Fragment>);
}

function VerdictBar({ label, score }) {
  const tone = score >= 80 ? "good" : score >= 60 ? "warn" : "bad";
  return (
    <div className="vb-row">
      <span className="vb-label">{label}</span>
      <div className="vb-track"><div className={"vb-bar " + tone} style={{ width: score + "%" }} /></div>
      <span className={"vb-score " + tone}>{score}</span>
    </div>);
}
function RequestDrawer({ r, pii = { detail: true, raw: true }, blur, onClose }) {
  const sm = STATUS_META[r.status];
  /* Detail/PII fields blur when the toggle is on OR the role lacks PII access.
     Raw documents (assets) are a stricter tier — gated on pii.raw. */
  const detailBlur = blur || !pii.detail;
  const ocr = [["Nom", r.name.split(" ").slice(-1)[0].toUpperCase()], ["Prénom", r.name.split(" ")[0]], ["Date de naissance", r.dob], ["N° de document", "X4" + r.id.slice(3).toUpperCase() + "92"], ["Expiration", "2031-08-14"], ["Nationalité", r.country]];
  return (
    <div className="drawer-scrim" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-h">
          <div><div className="drawer-id mono">{r.id}</div><h3><PII blur={detailBlur}>{r.name}</PII></h3><div className="drawer-meta">{r.business} · {r.workflow}</div></div>
          <button className="modal-x" onClick={onClose}><Ico name="x" size={16} sw={2.2} /></button>
        </div>
        <div className="drawer-body">
          <div className="verdict-banner">
            <div className={"verdict-badge " + sm.cls}><Ico name={r.status === "ok" ? "check" : r.status === "fail" ? "x" : "clock"} size={18} sw={2.4} /></div>
            <div><div className="verdict-label">Verdict IA — {sm.label}</div><div className="verdict-sub">Score global de confiance</div></div>
            <div className="verdict-score">{r.score}<small>/100</small></div>
          </div>

          <div className="drawer-sec"><div className="drawer-sec-t">Données extraites du document</div>
            <div className="ocr-grid">{ocr.map((o, i) => <div className="ocr-cell" key={i}><span className="ocr-k">{o[0]}</span><span className="ocr-v"><PII blur={detailBlur}>{o[1]}</PII></span></div>)}</div>
          </div>

          <div className="drawer-sec"><div className="drawer-sec-t">Données utilisateur</div>
            {pii.raw ?
              <div className="assets-row">
                <div className="asset"><Ico name="doc" size={22} /><span>Recto</span></div>
                <div className="asset"><Ico name="doc" size={22} /><span>Verso</span></div>
                <div className="asset"><Ico name="faceScan" size={22} /><span>Selfie</span></div>
                {r.method === "Vidéo" && <div className="asset"><Ico name="video" size={22} /><span>Vidéo</span></div>}
              </div> :
              <div className="panel-empty" style={{ padding: "18px 12px" }}><Ico name="lock" size={18} /><span>Documents sources non accessibles avec ce rôle.</span></div>}
          </div>

          <div className="drawer-sec"><div className="drawer-sec-t">Verdicts IA détaillés</div>
            <VerdictBar label="Authenticité du document" score={Math.min(99, r.score + 1)} />
            <VerdictBar label="Liveness (PAD)" score={r.status === "fail" ? 28 : r.score - 4} />
            <VerdictBar label="Expiration & validité" score={r.status === "fail" ? 40 : 96} />
          </div>

          <div className="drawer-sec"><div className="drawer-sec-t">Méthode</div>
            <div className="method-summary"><span className="method-tag">{r.method}</span><span className="hint">Onboarding · capture {r.method.toLowerCase()}</span><EidasTag levelKey={r.level} /></div>
          </div>

          <details className="json-block"><summary><Ico name="copy" size={13} sw={1.8} />JSON output complet</summary>
            <pre>{JSON.stringify({ id: r.id, verdict: sm.label, score: r.score, method: r.method, level: r.level, country: r.country }, null, 2)}</pre>
          </details>
        </div>
        <div className="drawer-foot">
          <button className="sid-btn ghost" onClick={onClose}>Fermer</button>
          <button className="sid-btn outline"><Ico name="doc" size={14} sw={1.8} />Exporter le rapport</button>
        </div>
      </div>
    </div>);
}

/* ----------------------------- Operator Queue ----------------------------- */
const REASON_CLS = { uncertainty: "review", rejected: "fail", accepted: "ok" };
export function OperatorQueue() {
  const { role } = useSession();
  const [sel, setSel] = React.useState(null);
  const [filter, setFilter] = React.useState("all");
  const [queue, setQueue] = React.useState(OPERATOR_QUEUE);
  const rows = queue.filter((q) => filter === "all" || q.reason === filter);
  function resolve(id) { setQueue((q) => q.filter((x) => x.id !== id)); setSel(null); }
  return (
    <React.Fragment>
      <div className="dash-topbar">
        <div className="dt-head"><div className="eyebrow">Anti-fraude</div><h1>File de revue</h1></div>
        <div className="op-stats">
          <div className="op-stat"><b>{OPERATOR_STATS.handled}</b><span>traitées aujourd'hui</span></div>
          <div className="op-stat"><b>{OPERATOR_STATS.avgTime}</b><span>temps moyen</span></div>
          <div className="op-stat"><b>{OPERATOR_STATS.aiAgree} %</b><span>accord IA</span></div>
        </div>
      </div>
      <div className="dash-body console-body">
        <div className="filter-row">
          {[["all", "Toutes"], ["uncertainty", "Incertitude"], ["rejected", "Rejet à valider"], ["accepted", "Contrôle aléatoire"]].map(([id, nm]) =>
            <button key={id} className={"filter-chip" + (filter === id ? " on" : "")} onClick={() => setFilter(id)}>{nm}</button>)}
          <div className="ctrl-div" />
          <span className="queue-count">{rows.length} en attente</span>
        </div>
        {rows.length === 0 ?
          <div className="panel"><div className="panel-body"><div className="panel-empty"><Ico name="check" size={22} /><span>File vide — toutes les requêtes ont été traitées.</span></div></div></div> :
          <div className="wf-table-wrap">
            <div className="wf-table-scroll">
              <table className="wf-table">
                <thead><tr><th>Requête</th><th>Workflow</th><th>Raison</th><th>Pays</th><th>Reçue</th><th>SLA</th></tr></thead>
                <tbody>
                  {rows.map((q) =>
                    <tr key={q.id} className="wf-row" onClick={() => setSel(q)}>
                      <td><div className="req-name"><span className="req-ava">{q.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span><div><div className="wf-row-t" style={{ fontSize: 13 }}>{q.name}</div><div className="mono" style={{ fontSize: 10.5, color: "var(--muted-soft)" }}>{q.id}</div></div></div></td>
                      <td><span className="wf-row-sub">{q.workflow}</span></td>
                      <td><span className={"reason-tag " + REASON_CLS[q.reason]}>{q.reasonLabel}</span></td>
                      <td><span className="wf-row-sub">{q.flag} {q.country}</span></td>
                      <td><span className="wf-row-sub">{q.date}</span></td>
                      <td><span className={"sla-pill " + q.sla}><span className="d" />{q.slaLabel}</span></td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </div>}
      </div>
      {sel && <OperatorDrawer q={sel} role={role} onClose={() => setSel(null)} onResolve={resolve} />}
    </React.Fragment>);
}
function OperatorDrawer({ q, role = "operator", onClose, onResolve }) {
  const [note, setNote] = React.useState("");
  /* Operators escalate suspected fraud to an Expert; Experts receive the
     escalation and arbitrate (valid / invalid) — they don't re-escalate. */
  const isExpert = role === "expert";
  return (
    <div className="drawer-scrim" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-h">
          <div><div className="drawer-id mono">{q.id}</div><h3>{q.name}</h3><div className="drawer-meta">{q.workflow} · {q.flag} {q.country}</div></div>
          <button className="modal-x" onClick={onClose}><Ico name="x" size={16} sw={2.2} /></button>
        </div>
        <div className="drawer-body">
          <div className="op-reason-banner"><span className={"reason-tag " + REASON_CLS[q.reason]}>{q.reasonLabel}</span><span className={"sla-pill " + q.sla}><span className="d" />{q.slaLabel}</span></div>
          <div className="drawer-sec"><div className="drawer-sec-t">Assets</div>
            <div className="assets-row"><div className="asset"><Ico name="doc" size={22} /><span>Recto</span></div><div className="asset"><Ico name="doc" size={22} /><span>Verso</span></div><div className="asset"><Ico name="faceScan" size={22} /><span>Selfie</span></div>{q.method === "Vidéo" && <div className="asset"><Ico name="video" size={22} /><span>Vidéo</span></div>}</div>
          </div>
          <div className="drawer-sec"><div className="drawer-sec-t">Scores IA</div>
            <VerdictBar label="PAD — anti-spoofing" score={q.scorePad} />
            <VerdictBar label="IAD — anti-deepfake" score={q.scoreIad} />
            <VerdictBar label="Authenticité" score={q.scoreAuth} />
          </div>
          <div className="drawer-sec"><div className="drawer-sec-t">Note interne</div>
            <textarea className="inp" rows="3" value={note} placeholder="Visible Operator + Expert…" onChange={(e) => setNote(e.target.value)} style={{ resize: "vertical" }} />
          </div>
        </div>
        <div className="drawer-foot op-foot">
          {!isExpert &&
            <button className="sid-btn ghost" onClick={() => onResolve(q.id)}><Ico name="share" size={14} sw={1.8} />Escalader à un Expert</button>}
          <div className="spacer" style={{ flex: 1 }} />
          <button className="op-btn reject" onClick={() => onResolve(q.id)}><Ico name="x" size={15} sw={2.2} />{isExpert ? "Trancher invalide" : "Rejeter"}</button>
          <button className="op-btn accept" onClick={() => onResolve(q.id)}><Ico name="check" size={15} sw={2.4} />{isExpert ? "Trancher valide" : "Valider"}</button>
        </div>
      </div>
    </div>);
}
