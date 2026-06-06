/* ShareID Studio — Console: Requests History + Operator Queue. */


import React from "react";
import { OPERATOR_QUEUE, OPERATOR_STATS, REQUESTS } from "./charts.jsx";
import { EidasTag, Ico } from "./core.jsx";

const STATUS_META = {
  ok: { label: "Accepté", cls: "ok" }, retry: { label: "Reprise", cls: "retry" },
  review: { label: "En revue", cls: "review" }, fail: { label: "Rejeté", cls: "fail" },
};
function PII({ blur, children }) { return <span className={"pii" + (blur ? " blurred" : "")}>{children}</span>; }

/* ----------------------------- Requests History ----------------------------- */
export function RequestsHistory() {
  const [blur, setBlur] = React.useState(() => localStorage.getItem("req_blur") === "1");
  const [tab, setTab] = React.useState("active");
  const [status, setStatus] = React.useState("all");
  const [sel, setSel] = React.useState(null);
  function toggleBlur() { const v = !blur; setBlur(v); try { localStorage.setItem("req_blur", v ? "1" : "0"); } catch (e) {} }
  const rows = REQUESTS.filter((r) => status === "all" || r.status === status);
  return (
    <React.Fragment>
      <div className="dash-topbar">
        <div className="dt-head"><div className="eyebrow">Console</div><h1>Requêtes</h1></div>
        <div className="topbar-controls">
          <button className={"sid-btn outline sm-btn" + (blur ? " on" : "")} onClick={toggleBlur}><Ico name="eye" size={14} sw={1.8} />{blur ? "Données masquées" : "Masquer les données"}</button>
          <button className="sid-btn inverse sm-btn"><Ico name="share" size={13} sw={1.8} />Export CSV</button>
        </div>
      </div>
      <div className="dash-body console-body">
        <div className="req-tabs">
          <button className={"req-tab" + (tab === "active" ? " on" : "")} onClick={() => setTab("active")}>Actif<span className="req-tab-n">{REQUESTS.length}</span></button>
          <button className={"req-tab" + (tab === "archived" ? " on" : "")} onClick={() => setTab("archived")}>Archivé<span className="req-tab-n">2 410</span></button>
        </div>
        <div className="filter-row">
          {[["all", "Tous"], ["ok", "Succès"], ["retry", "Reprise"], ["fail", "Échec"], ["review", "En attente operator"]].map(([id, nm]) =>
            <button key={id} className={"filter-chip" + (status === id ? " on" : "")} onClick={() => setStatus(id)}>{nm}</button>)}
          <div className="ctrl-div" />
          <button className="filter-chip"><Ico name="layers" size={13} sw={1.8} />Workflow</button>
          <button className="filter-chip"><Ico name="globe" size={13} sw={1.8} />Pays</button>
        </div>

        {tab === "archived" ?
          <div className="panel"><div className="panel-body"><div className="panel-empty"><Ico name="lock" size={20} /><span>Requêtes anonymisées au-delà de la rétention — métadonnées de comptage uniquement, PII et assets purgés.</span></div></div></div> :
          <div className="wf-table-wrap">
            <div className="wf-table-scroll">
              <table className="wf-table req-table">
                <thead><tr><th>Nom</th><th>Naissance</th><th>Document</th><th>Business</th><th>Date</th><th>Méthode</th><th>Niveau</th><th>Verdict</th></tr></thead>
                <tbody>
                  {rows.map((r) => {
                    const sm = STATUS_META[r.status];
                    return (
                      <tr key={r.id} className="wf-row" onClick={() => setSel(r)}>
                        <td><div className="req-name"><span className="req-ava">{r.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span><PII blur={blur}>{r.name}</PII></div></td>
                        <td><PII blur={blur}>{r.dob}</PII></td>
                        <td><span className="wf-row-sub">{r.doc}</span></td>
                        <td><span className="wf-row-sub">{r.business}</span></td>
                        <td><span className="wf-row-sub mono" style={{ fontSize: 11.5 }}>{r.date.slice(5)}</span></td>
                        <td><span className="method-tag">{r.method}</span></td>
                        <td><EidasTag levelKey={r.level} prefix="" /></td>
                        <td><span className={"status-pill " + sm.cls}><span className="d" />{sm.label}{r.status !== "review" && <b className="vscore">{r.score}</b>}</span></td>
                      </tr>);
                  })}
                </tbody>
              </table>
            </div>
          </div>}
      </div>
      {sel && <RequestDrawer r={sel} blur={blur} onClose={() => setSel(null)} />}
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
function RequestDrawer({ r, blur, onClose }) {
  const sm = STATUS_META[r.status];
  const ocr = [["Nom", r.name.split(" ").slice(-1)[0].toUpperCase()], ["Prénom", r.name.split(" ")[0]], ["Date de naissance", r.dob], ["N° de document", "X4" + r.id.slice(3).toUpperCase() + "92"], ["Expiration", "2031-08-14"], ["Nationalité", r.country]];
  return (
    <div className="drawer-scrim" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-h">
          <div><div className="drawer-id mono">{r.id}</div><h3><PII blur={blur}>{r.name}</PII></h3><div className="drawer-meta">{r.business} · {r.workflow}</div></div>
          <button className="modal-x" onClick={onClose}><Ico name="x" size={16} sw={2.2} /></button>
        </div>
        <div className="drawer-body">
          <div className="verdict-banner">
            <div className={"verdict-badge " + sm.cls}><Ico name={r.status === "ok" ? "check" : r.status === "fail" ? "x" : "clock"} size={18} sw={2.4} /></div>
            <div><div className="verdict-label">Verdict IA — {sm.label}</div><div className="verdict-sub">Score global de confiance</div></div>
            <div className="verdict-score">{r.score}<small>/100</small></div>
          </div>

          <div className="drawer-sec"><div className="drawer-sec-t">Données extraites du document</div>
            <div className="ocr-grid">{ocr.map((o, i) => <div className="ocr-cell" key={i}><span className="ocr-k">{o[0]}</span><span className="ocr-v"><PII blur={blur}>{o[1]}</PII></span></div>)}</div>
          </div>

          <div className="drawer-sec"><div className="drawer-sec-t">Données utilisateur</div>
            <div className="assets-row">
              <div className={"asset" + (blur ? " blurred" : "")}><Ico name="doc" size={22} /><span>Recto</span></div>
              <div className={"asset" + (blur ? " blurred" : "")}><Ico name="doc" size={22} /><span>Verso</span></div>
              <div className={"asset" + (blur ? " blurred" : "")}><Ico name="faceScan" size={22} /><span>Selfie</span></div>
              {r.method === "Vidéo" && <div className={"asset" + (blur ? " blurred" : "")}><Ico name="video" size={22} /><span>Vidéo</span></div>}
            </div>
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
      {sel && <OperatorDrawer q={sel} onClose={() => setSel(null)} onResolve={resolve} />}
    </React.Fragment>);
}
function OperatorDrawer({ q, onClose, onResolve }) {
  const [note, setNote] = React.useState("");
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
          <button className="sid-btn ghost" onClick={() => onResolve(q.id)}><Ico name="share" size={14} sw={1.8} />Escalader à un Expert</button>
          <div className="spacer" style={{ flex: 1 }} />
          <button className="op-btn reject" onClick={() => onResolve(q.id)}><Ico name="x" size={15} sw={2.2} />Rejeter</button>
          <button className="op-btn accept" onClick={() => onResolve(q.id)}><Ico name="check" size={15} sw={2.4} />Valider</button>
        </div>
      </div>
    </div>);
}
