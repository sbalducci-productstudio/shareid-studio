/* ShareID Studio — Business Setup: list/landing, wizard orchestration, edit view. */


import React from "react";
import { BIZ_TYPES, BizBilling, BizCond, BizIdentity, BizObjective, BizRetention, BizReview, BizScope, BizType, BizUsers, EndUserPreview, RETENTION, TOKEN_PKGS, eur, flagOf, pkgOf, retLabel } from "./biz-steps.jsx";
import { fmt, pct } from "./charts.jsx";
import { DOC_TYPES, DocArt, EidasTag, Ico, LEVELS, LEVEL_KEYS } from "./core.jsx";

function condName(type) { return { pilot: "Pilote", retailer: "Hiérarchie retailer", group: "Groupe" }[type] || "Spécifique"; }
function bizSteps(type) {
  const base = [
    { key: "type", nm: "Type de business", Comp: BizType },
    { key: "identity", nm: "Identité", Comp: BizIdentity },
    { key: "objective", nm: "Objectif & eIDAS", Comp: BizObjective },
    { key: "scope", nm: "Périmètre", Comp: BizScope },
    { key: "retention", nm: "Rétention", Comp: BizRetention },
    { key: "users", nm: "Utilisateurs", Comp: BizUsers },
  ];
  if (type !== "standard") base.push({ key: "cond", nm: condName(type), Comp: BizCond });
  base.push({ key: "billing", nm: "Facturation", Comp: BizBilling });
  base.push({ key: "review", nm: "Récapitulatif", Comp: BizReview });
  return base;
}
function bizValid(key, b) {
  switch (key) {
    case "identity": return b.name.trim().length > 0;
    case "objective": return b.drivers.length >= 1;
    case "scope": return b.countries.length >= 1 && b.docTypes.length >= 1;
    case "users": return b.owner.name.trim() && b.owner.email.trim();
    default: return true;
  }
}
export function bizStatus(b) {
  if (b.type === "pilot") return { label: "Pilote · test", cls: "pilot" };
  if (b.type === "retailer") return { label: "Retailer · actif", cls: "active" };
  if (b.type === "group") return { label: "Groupe · actif", cls: "active" };
  return { label: "Actif · live", cls: "active" };
}
export function bizInitials(name) { return (name || "?").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase(); }

/* ----------------------------- List / landing ----------------------------- */
export function BizList({ businesses, onCreate, onOpen }) {
  const [q, setQ] = React.useState("");
  const empty = businesses.length === 0;
  const filtered = businesses.filter((b) => (b.name || "").toLowerCase().includes(q.toLowerCase()));
  return (
    <React.Fragment>
      <div className="dash-topbar">
        <div className="dt-head"><div className="eyebrow">Business setup</div><h1>Businesses</h1></div>
        {!empty && <button className="sid-btn primary" onClick={onCreate}><Ico name="plus" size={16} sw={2.2} />Créer un business</button>}
      </div>
      <div className="dash-body">
        {empty ?
          <div className="dash-empty biz-empty">
            <div className="biz-empty-ico"><Ico name="globe" size={26} /></div>
            <h2>Créer un business</h2>
            <p className="biz-empty-sub">Le business est la surface fondatrice du Studio : il porte l'identité, le scope et la facturation. Sans business, pas de workflow.</p>
            <div className="de-cta"><button className="sid-btn primary" onClick={onCreate}><Ico name="plus" size={16} sw={2.2} />Créer un business</button></div>
          </div> :
          <div className="wf-list">
            <div className="wf-list-h">
              <div className="input-wrap" style={{ maxWidth: 280 }}>
                <span className="ico"><Ico name="search" size={15} /></span>
                <input className="inp with-icon" style={{ padding: "9px 12px 9px 34px", fontSize: 13 }} value={q} placeholder="Rechercher un business…" onChange={(e) => setQ(e.target.value)} />
              </div>
            </div>
            <div className="wf-table-wrap">
              <div className="wf-table-scroll">
                <table className="wf-table biz-table">
                  <thead><tr><th>Nom</th><th>Type</th><th>Statut</th><th>Consommation</th><th>Owner BA</th><th className="ta-r">Dernière modif</th></tr></thead>
                  <tbody>
                    {filtered.map((b, i) => {
                      const st = bizStatus(b);
                      const bt = BIZ_TYPES.find((t) => t.id === b.type);
                      const conso = b.conso || 0;
                      return (
                        <tr key={i} className="wf-row" onClick={() => onOpen(businesses.indexOf(b))}>
                          <td><div className="wf-row-nm"><span className="biz-mk sm" style={{ background: "color-mix(in srgb," + b.color + " 14%,#fff)", color: b.color }}>{b.logo ? <img src={b.logo} alt="" style={{ width: 16 }} /> : bizInitials(b.name)}</span><span className="wf-row-t">{b.name || "Business sans nom"}</span></div></td>
                          <td><span className="type-badge">{bt.t}</span></td>
                          <td><span className={"status-pill " + st.cls}><span className="d" />{st.label}</span></td>
                          <td>{b.type === "pilot" ? <span className="wf-row-sub">—</span> : <div className="conso-cell"><div className="conso-track"><div className="conso-bar" style={{ width: conso + "%", background: conso >= 80 ? "var(--color-error)" : "var(--color-main)" }} /></div><span className="conso-pct">{conso} %</span></div>}</td>
                          <td><span className="wf-row-sub">{b.owner && b.owner.name ? b.owner.name : "—"}</span></td>
                          <td className="ta-r"><span className="wf-row-sub">{b.modified || "à l'instant"}</span><Ico name="chevR" size={15} sw={2} style={{ marginLeft: 10, color: "var(--muted-soft)", verticalAlign: "middle" }} /></td>
                        </tr>);
                    })}
                  </tbody>
                </table>
              </div>
              <button className="wf-row-new" onClick={onCreate}><Ico name="plus" size={15} sw={2.1} />Créer un business</button>
            </div>
          </div>}
      </div>
    </React.Fragment>);
}

/* ----------------------------- Wizard ----------------------------- */
export function BizWizard({ draft, setDraft, onFinish, onExit }) {
  const steps = bizSteps(draft.type);
  const [key, setKey] = React.useState("type");
  const idx = Math.max(0, steps.findIndex((s) => s.key === key));
  const step = steps[idx];
  const set = (patch) => setDraft({ ...draft, ...patch });
  const canNext = bizValid(step.key, draft);
  const bt = BIZ_TYPES.find((t) => t.id === draft.type);

  function next() { if (step.key === "review") { onFinish(); return; } const nx = steps[idx + 1]; if (nx) setKey(nx.key); }
  function back() { if (idx <= 0) { onExit(); return; } setKey(steps[idx - 1].key); }

  const Comp = step.Comp;
  return (
    <div className="app">
      <div className="wiz">
        <aside className="rail">
          <div className="rail-brand"><img src={import.meta.env.BASE_URL + "ds/logo-shareid.svg"} alt="ShareID" /><span className="crumb">Business setup</span><button className="rail-back" onClick={onExit} title="Quitter"><Ico name="back" size={16} /></button></div>
          <div className="steplist">
            {steps.map((s, i) => {
              const done = i < idx, active = i === idx;
              return (
                <button key={s.key} className={"step" + (done ? " done clickable" : "") + (active ? " active" : "")} disabled={!done} onClick={() => done && setKey(s.key)}>
                  <span className="idx">{done ? <Ico name="check" size={12} sw={3} /> : i + 1}</span><span className="nm">{s.nm}</span>
                </button>);
            })}
          </div>
          <div className="biz-rail-meta">
            <div className="brm-row"><span className="brm-k">Type</span><span className="brm-v">{bt.t}</span></div>
            <div className="brm-row"><span className="brm-k">eIDAS min.</span><EidasTag levelKey={draft.eidasMin} prefix="" /></div>
            <div className="brm-row"><span className="brm-k">Facturation</span><span className="brm-v">{pkgOf(draft.pkg).t} · {fmt(pkgOf(draft.pkg).tokens)}</span></div>
          </div>
        </aside>
        <div className="main">
          <div className="topbar"><span className="wf"><span className="muted">{draft.name ? "Business · " : "Nouveau business · "}</span>{draft.name || "sans nom"}</span><span className="type-badge">{bt.t}</span></div>
          <div className="body"><Comp biz={draft} set={set} n={idx + 1} total={steps.length} /></div>
          <div className="footer">
            <button className="sid-btn ghost" onClick={back}><Ico name="chevL" size={15} sw={2} />{idx <= 0 ? "Quitter" : "Retour"}</button>
            <div className="spacer" />
            <button className="sid-btn primary" disabled={!canNext} onClick={next}>{step.key === "review" ? "Créer le business" : "Continuer"}{step.key !== "review" && <Ico name="arrow" size={15} sw={2} />}</button>
          </div>
        </div>
      </div>
    </div>);
}

/* ----------------------------- Edit view ----------------------------- */
function EditSection({ icon, title, guard, children }) {
  return (
    <section className="edit-sec">
      <div className="edit-sec-h"><span className="ico-tile sm"><Ico name={icon} size={16} /></span><h3>{title}</h3>{guard && <span className="edit-guard"><Ico name="lock" size={11} sw={2} />{guard}</span>}</div>
      <div className="edit-sec-body">{children}</div>
    </section>);
}
export function BizEdit({ biz, onSave, onBack }) {
  const [b, setB] = React.useState(biz);
  const set = (patch) => setB({ ...b, ...patch });
  const dirty = JSON.stringify(b) !== JSON.stringify(biz);
  const bt = BIZ_TYPES.find((t) => t.id === b.type);
  const st = bizStatus(b);
  const pkg = pkgOf(b.pkg);
  function toggleDoc(id) { const has = b.docTypes.includes(id); if (has && b.docTypes.length > 1) set({ docTypes: b.docTypes.filter((d) => d !== id) }); else if (!has) set({ docTypes: [...b.docTypes, id] }); }
  return (
    <React.Fragment>
      <div className="dash-topbar edit-topbar">
        <div className="dt-head">
          <button className="back-link" onClick={onBack}><Ico name="back" size={14} sw={2} />Businesses</button>
          <div className="edit-title-row">
            <span className="biz-mk" style={{ background: "color-mix(in srgb," + b.color + " 14%,#fff)", color: b.color, width: 36, height: 36, fontSize: 13 }}>{b.logo ? <img src={b.logo} alt="" style={{ width: 18 }} /> : bizInitials(b.name)}</span>
            <h1>{b.name || "Business"}</h1>
            <span className="type-badge">{bt.t}</span>
            <span className={"status-pill " + st.cls}><span className="d" />{st.label}</span>
          </div>
        </div>
        <button className="sid-btn primary" disabled={!dirty} onClick={() => onSave(b)}>Enregistrer</button>
      </div>
      <div className="dash-body edit-body">
        <EditSection icon="building" title="Identité & branding">
          <div className="biz-split edit-split">
            <div className="biz-form">
              <div className="field"><span className="lab">Nom</span><input className="inp" value={b.name} onChange={(e) => set({ name: e.target.value })} /></div>
              <div className="field" style={{ marginTop: 12 }}><span className="lab">Titre principal end-user</span><input className="inp" value={b.euTitle} onChange={(e) => set({ euTitle: e.target.value })} /></div>
              <div className="field" style={{ marginTop: 12 }}><span className="lab">Titre secondaire</span><input className="inp" value={b.euSubtitle} onChange={(e) => set({ euSubtitle: e.target.value })} /></div>
              <div className="field" style={{ marginTop: 12 }}><span className="lab">Libellé du bouton</span><input className="inp" value={b.euCta} onChange={(e) => set({ euCta: e.target.value })} /></div>
              <div className="field" style={{ marginTop: 12 }}><span className="lab">Couleur</span><div className="swatches">{["#3253D1", "#1F6F5B", "#7A3DBE", "#C0392B", "#0E1116", "#D98324"].map((c) => <button key={c} className={"swatch" + (b.color === c ? " on" : "")} style={{ background: c }} onClick={() => set({ color: c })}>{b.color === c && <Ico name="check" size={12} sw={3} />}</button>)}</div></div>
            </div>
            <div className="biz-preview-col"><EndUserPreview biz={b} scale={0.82} /></div>
          </div>
        </EditSection>

        <EditSection icon="fileCheck" title="Objectif & eIDAS" guard="≥ niveau des workflows live">
          <div className="opts g3" style={{ maxWidth: 560 }}>
            {LEVEL_KEYS.map((k) => <button key={k} className={"opt col" + (b.eidasMin === k ? " sel" : "")} onClick={() => set({ eidasMin: k })} style={{ paddingTop: 14 }}>{b.eidasMin === k && <span className="mark" style={{ position: "absolute", top: 12, right: 12 }}><Ico name="check" size={12} sw={3} /><span className="dot" /></span>}<div className="ot">{LEVELS[k].name}</div></button>)}
          </div>
        </EditSection>

        <EditSection icon="globe" title="Périmètre" guard="≥ scope des workflows live">
          <span className="lab">Pays ({b.countries.length})</span>
          <div className="chips-wrap" style={{ marginTop: 8 }}>{b.countries.map((c) => <span key={c} className="chip"><span className="br-flag">{flagOf(c)}</span>{c}<span className="x" onClick={() => set({ countries: b.countries.filter((x) => x !== c) })}>×</span></span>)}</div>
          <span className="lab" style={{ display: "block", marginTop: 16 }}>Documents</span>
          <div className="opts g2-doc" style={{ marginTop: 8 }}>{DOC_TYPES.map((d) => { const sel = b.docTypes.includes(d.id); return <button key={d.id} className={"doc-pick" + (sel ? " sel" : "")} onClick={() => toggleDoc(d.id)}><span className="doc-art" style={{ color: sel ? "var(--color-main)" : "var(--muted-soft)" }}><DocArt art={d.art} w={54} /></span><span className="doc-pick-nm">{d.short}</span><span className="mark sq"><Ico name="check" size={12} sw={3} /></span></button>; })}</div>
        </EditSection>

        <EditSection icon="clock" title="Rétention" guard="non réductible rétroactivement">
          <div className="ret-value" style={{ marginBottom: 14 }}><span className="ret-num" style={{ fontSize: 22 }}>{retLabel(b.retentionH)}</span></div>
          <div className="slider" style={{ maxWidth: 520 }}>
            <div className="track"><div className="fill" style={{ width: (RETENTION.findIndex((r) => r.h === b.retentionH)) / (RETENTION.length - 1) * 100 + "%" }} /><div className="knob" style={{ left: (RETENTION.findIndex((r) => r.h === b.retentionH)) / (RETENTION.length - 1) * 100 + "%" }} /></div>
            <input type="range" min="0" max={RETENTION.length - 1} value={RETENTION.findIndex((r) => r.h === b.retentionH)} onChange={(e) => set({ retentionH: RETENTION[+e.target.value].h })} className="slider-input" />
          </div>
        </EditSection>

        <EditSection icon="users" title="Utilisateurs" guard="≥ 1 BA owner actif">
          <div className="user-card owner"><span className="user-ava"><Ico name="userCheck" size={17} /></span><div className="user-fields"><input className="inp sm" value={b.owner.name} onChange={(e) => set({ owner: { ...b.owner, name: e.target.value } })} /><input className="inp sm" value={b.owner.email} onChange={(e) => set({ owner: { ...b.owner, email: e.target.value } })} /></div><span className="chip brand sm" style={{ alignSelf: "center" }}>Owner</span></div>
          {b.agents.map((a, i) => <div className="user-card" key={i} style={{ marginTop: 8 }}><span className="user-ava dim"><Ico name="users" size={16} /></span><div className="user-fields"><input className="inp sm" value={a.name} onChange={(e) => set({ agents: b.agents.map((x, j) => j === i ? { ...x, name: e.target.value } : x) })} /><input className="inp sm" value={a.email} onChange={(e) => set({ agents: b.agents.map((x, j) => j === i ? { ...x, email: e.target.value } : x) })} /></div><button className="user-rm" onClick={() => set({ agents: b.agents.filter((_, j) => j !== i) })}><Ico name="x" size={15} sw={2} /></button></div>)}
          <button className="add-row" onClick={() => set({ agents: [...b.agents, { name: "", email: "" }] })}><Ico name="plus" size={15} sw={2.1} />Ajouter un agent</button>
        </EditSection>

        <EditSection icon="wallet" title="Facturation" guard="pas de rétrogradation en cours d'année">
          <div className="pkg-grid">{TOKEN_PKGS.map((p) => <button key={p.id} className={"pkg-card" + (b.pkg === p.id ? " sel" : "")} onClick={() => set({ pkg: p.id })}><span className="pkg-t">{p.t}</span><span className="pkg-tok">{fmt(p.tokens)}<small> tokens/an</small></span><span className="pkg-env">{eur(p.envelope)}<small> / an</small></span>{b.pkg === p.id && <span className="pkg-check"><Ico name="check" size={12} sw={3} /></span>}</button>)}</div>
          <div className="tgl-row" style={{ marginTop: 14 }}><div className="tinfo"><div className="tt">Alerte à 80 %</div><div className="td">Email Business Admin + Sales à 80 % de l'enveloppe.</div></div><button className={"sw" + (b.alert80 ? " on" : "")} onClick={() => set({ alert80: !b.alert80 })} /></div>
        </EditSection>
      </div>
    </React.Fragment>);
}
