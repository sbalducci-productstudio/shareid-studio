/* ShareID Studio — Business Setup: list/landing, wizard orchestration, edit view. */


import React from "react";
import { BIZ_COUNTRIES, BIZ_DRIVERS, BIZ_TYPES, BizBilling, BizBranding, BizDrivers, BizIdentity, BizRetention, BizReview, BizRisk, BizScope, BizType, BizUsers, DEFAULT_BIZ, EndUserPreview, RETENTION, TOKEN_PKGS, eur, flagOf, pkgOf, retLabel } from "./biz-steps.jsx";
import { fmt, pct } from "./charts.jsx";
import { DOC_TYPES, DocArt, EidasTag, Ico, LEVELS, RISK_KEYS } from "./core.jsx";

/* Ordre du wizard (cf. refonte Business Setup) : identité → type → objectif → risque →
   périmètre → rétention → rôles → branding → facturation → récap. */
function bizSteps() {
  return [
    { key: "identity", nm: "Identité", Comp: BizIdentity },
    { key: "type", nm: "Type de business", Comp: BizType },
    { key: "drivers", nm: "Objectif", Comp: BizDrivers },
    { key: "risk", nm: "Niveau de risque", Comp: BizRisk },
    { key: "scope", nm: "Périmètre", Comp: BizScope },
    { key: "retention", nm: "Rétention", Comp: BizRetention },
    { key: "users", nm: "Rôles & contacts", Comp: BizUsers },
    { key: "branding", nm: "Branding", Comp: BizBranding },
    { key: "billing", nm: "Facturation", Comp: BizBilling },
    { key: "review", nm: "Récapitulatif", Comp: BizReview },
  ];
}
function bizValid(key, b) {
  switch (key) {
    case "identity": return b.name.trim().length > 0;
    case "drivers": return b.drivers.length >= 1;
    case "scope": return b.countries.length >= 1 && b.docTypes.length >= 1;
    case "users": return b.owner.name.trim() && b.owner.email.trim();
    case "branding": return !!(b.color && b.colorSecondary);
    default: return true;
  }
}
export function bizStatus(b) {
  if (b.isPilot) return { label: "Pilote · test", cls: "pilot" };
  if (b.type === "retailer") return { label: "Retailer · actif", cls: "active" };
  if (b.type === "group") return { label: "Groupe · actif", cls: "active" };
  if (b.type === "payg") return { label: "Pay-as-you-go · actif", cls: "active" };
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
                          <td>{b.isPilot ? <span className="wf-row-sub">—</span> : <div className="conso-cell"><div className="conso-track"><div className="conso-bar" style={{ width: conso + "%", background: conso >= 80 ? "var(--color-error)" : "var(--color-main)" }} /></div><span className="conso-pct">{conso} %</span></div>}</td>
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
  const steps = bizSteps();
  const [key, setKey] = React.useState("identity");
  const idx = Math.max(0, steps.findIndex((s) => s.key === key));
  const step = steps[idx];
  const set = (patch) => setDraft({ ...draft, ...patch });
  const canNext = bizValid(step.key, draft);
  const bt = BIZ_TYPES.find((t) => t.id === draft.type);

  function next() { if (step.key === "review") { onFinish(); return; } const nx = steps[idx + 1]; if (nx) setKey(nx.key); }
  function back() { if (idx <= 0) { onExit(); return; } setKey(steps[idx - 1].key); }

  // Accessibilité : Entrée valide l'étape (= clic sur « Continuer »). On laisse passer les boutons
  // (toggles, options, sélecteurs : Entrée les active nativement) et les textareas/champs éditables.
  // Les sous-champs qui ont un sens propre pour Entrée (recherche de pays) stoppent la propagation.
  function onKeyDown(e) {
    if (e.key !== "Enter" || e.shiftKey) return;
    const t = e.target;
    if (t.tagName === "BUTTON" || t.tagName === "TEXTAREA" || t.isContentEditable) return;
    if (!canNext) return;
    e.preventDefault();
    next();
  }

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
            <div className="brm-row"><span className="brm-k">Risque max.</span><EidasTag levelKey={draft.riskMax} prefix="" /></div>
            <div className="brm-row"><span className="brm-k">Facturation</span><span className="brm-v">{pkgOf(draft.pkg).t} · {fmt(pkgOf(draft.pkg).tokens)}</span></div>
          </div>
        </aside>
        <div className="main" onKeyDown={onKeyDown}>
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
  // Normalise le business sur DEFAULT_BIZ : un business créé sur une ancienne version du Studio
  // (champs manquants : riskMax, contacts, billingMode…) récupère ainsi tous les réglages, et
  // l'enregistrement le met à niveau vers le schéma courant. `initial` sert de référence « dirty ».
  const [b, setB] = React.useState(() => ({ ...DEFAULT_BIZ, ...biz }));
  const [initial] = React.useState(() => ({ ...DEFAULT_BIZ, ...biz }));
  const [cq, setCq] = React.useState(""); // champ de recherche d'un pays à ajouter
  const set = (patch) => setB((prev) => ({ ...prev, ...patch }));
  const dirty = JSON.stringify(b) !== JSON.stringify(initial);
  const bt = BIZ_TYPES.find((t) => t.id === b.type) || BIZ_TYPES[0];
  const st = bizStatus(b);
  const annual = b.billingMode !== "payg";
  const SWATCHES = ["#3253D1", "#1F6F5B", "#7A3DBE", "#C0392B", "#0E1116", "#D98324"];
  const CONTACTS = [
    { k: "security", lab: "Cybersécurité", icon: "shieldAlert" },
    { k: "dpo", lab: "DPO / données personnelles", icon: "lock" },
    { k: "contract", lab: "Contrat / facturation", icon: "fileCheck" },
  ];
  function toggleDoc(id) { const has = b.docTypes.includes(id); if (has && b.docTypes.length > 1) set({ docTypes: b.docTypes.filter((d) => d !== id) }); else if (!has) set({ docTypes: [...b.docTypes, id] }); }
  function toggleDriver(id) { const has = b.drivers.includes(id); if (has) set({ drivers: b.drivers.filter((d) => d !== id) }); else if (b.drivers.length < 3) set({ drivers: [...b.drivers, id] }); }
  function addCountry(c) { if (!b.countries.includes(c)) set({ countries: [...b.countries, c] }); setCq(""); }
  function setContact(p) { set({ contacts: { ...b.contacts, ...p } }); }
  const countryMatches = cq ? BIZ_COUNTRIES.filter((c) => c.toLowerCase().includes(cq.toLowerCase()) && !b.countries.includes(c)).slice(0, 6) : [];
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
        <EditSection icon="building" title="Type & statut">
          <div className="opts" style={{ maxWidth: 680 }}>
            {BIZ_TYPES.map((t) => { const sel = b.type === t.id; return (
              <button key={t.id} className={"opt" + (sel ? " sel" : "")} onClick={() => set({ type: t.id })}>
                <span className={"ico-tile" + (sel ? "" : " dim")}><Ico name={t.icon} size={18} /></span>
                <div className="obody"><div className="otop"><span className="ot">{t.t}</span><span className="biz-cycle-chip">{t.cycle}</span>{t.soon && <span className="chip sm" style={{ fontSize: 10 }}>tooling V2</span>}</div></div>
                <span className="mark sq"><Ico name="check" size={12} sw={3} /></span>
              </button>); })}
          </div>
          <div className="tgl-row" style={{ marginTop: 16 }}>
            <div className="tinfo"><div className="tt">Pilote</div><div className="td">Statut transitoire ; se transforme ensuite en business définitif sans perte de configuration.</div></div>
            <button className={"sw" + (b.isPilot ? " on" : "")} onClick={() => set({ isPilot: !b.isPilot })} aria-label="Pilote" />
          </div>
          {b.isPilot &&
            <div className="brand-row" style={{ marginTop: 12 }}>
              <div className="field" style={{ flex: 1 }}><span className="lab">Fin de pilote (indicative)</span><input className="inp" type="date" value={b.pilotEnd} onChange={(e) => set({ pilotEnd: e.target.value })} /></div>
              <div className="field" style={{ flex: 1 }}><span className="lab">Mise en production estimée</span><input className="inp" type="date" value={b.prodStart} onChange={(e) => set({ prodStart: e.target.value })} /></div>
            </div>}
          <div className="tgl-row" style={{ marginTop: 14 }}>
            <div className="tinfo"><div className="tt">Vérification par opérateur</div><div className="td">Autorise une revue humaine. Le détail (systématique / sur seuil) se règle par workflow.</div></div>
            <button className={"sw" + (b.operatorEnabled ? " on" : "")} onClick={() => set({ operatorEnabled: !b.operatorEnabled })} aria-label="Opérateur" />
          </div>
        </EditSection>

        <EditSection icon="building" title="Identité & branding">
          <div className="biz-split edit-split">
            <div className="biz-form">
              <div className="field"><span className="lab">Nom</span><input className="inp" value={b.name} onChange={(e) => set({ name: e.target.value })} /></div>
              <div className="field" style={{ marginTop: 12 }}><span className="lab">Titre principal end-user</span><input className="inp" value={b.euTitle} onChange={(e) => set({ euTitle: e.target.value })} /></div>
              <div className="field" style={{ marginTop: 12 }}><span className="lab">Titre secondaire</span><input className="inp" value={b.euSubtitle} onChange={(e) => set({ euSubtitle: e.target.value })} /></div>
              <div className="field" style={{ marginTop: 12 }}><span className="lab">Libellé du bouton</span><input className="inp" value={b.euCta} onChange={(e) => set({ euCta: e.target.value })} /></div>
              <div className="field" style={{ marginTop: 12 }}><span className="lab">Couleur primaire</span><div className="swatches">{SWATCHES.map((c) => <button key={c} className={"swatch" + (b.color === c ? " on" : "")} style={{ background: c }} onClick={() => set({ color: c })}>{b.color === c && <Ico name="check" size={12} sw={3} />}</button>)}</div></div>
              <div className="field" style={{ marginTop: 12 }}><span className="lab">Couleur secondaire</span><div className="swatches">{SWATCHES.map((c) => <button key={c} className={"swatch" + (b.colorSecondary === c ? " on" : "")} style={{ background: c }} onClick={() => set({ colorSecondary: c })}>{b.colorSecondary === c && <Ico name="check" size={12} sw={3} />}</button>)}</div></div>
              <div className="field" style={{ marginTop: 12 }}><span className="lab">Logo</span><button className="logo-drop" onClick={() => set({ logo: b.logo ? null : "ds/logo-shareid.svg" })}>{b.logo ? <img src={b.logo} alt="" /> : <React.Fragment><Ico name="plus" size={16} sw={2} /><span>Importer un logo</span></React.Fragment>}</button></div>
              <div className="tgl-row" style={{ marginTop: 14 }}><div className="tinfo"><div className="tt">Co-branding dans le SDK</div><div className="td">Afficher votre marque dans le parcours SDK à la place de « ShareID ».</div></div><button className={"sw" + (b.coBrandSdk ? " on" : "")} onClick={() => set({ coBrandSdk: !b.coBrandSdk })} aria-label="Co-branding SDK" /></div>
            </div>
            <div className="biz-preview-col"><EndUserPreview biz={b} scale={0.82} /></div>
          </div>
        </EditSection>

        <EditSection icon="fileCheck" title="Objectif & risque maximum" guard="plafond ≥ niveau des workflows live">
          <span className="lab">Pourquoi vérifient-ils ? ({b.drivers.length}/3)</span>
          <div className="opts g3" style={{ marginTop: 8, maxWidth: 680 }}>
            {BIZ_DRIVERS.map((d) => { const sel = b.drivers.includes(d.id); return (
              <button key={d.id} className={"opt col" + (sel ? " sel" : "")} onClick={() => toggleDriver(d.id)}>
                <div className="otop" style={{ width: "100%" }}><span className={"ico-tile" + (sel ? "" : " dim")}><Ico name={d.icon} size={18} /></span><span className="mark sq" style={{ marginLeft: "auto" }}><Ico name="check" size={12} sw={3} /></span></div>
                <div className="obody"><div className="ot">{d.t}</div></div>
              </button>); })}
          </div>
          <span className="lab" style={{ display: "block", marginTop: 16 }}>Niveau de risque maximum</span>
          <div className="opts g2-doc" style={{ marginTop: 8, maxWidth: 560 }}>
            {RISK_KEYS.map((k) => <button key={k} className={"opt col" + (b.riskMax === k ? " sel" : "")} onClick={() => set({ riskMax: k })} style={{ paddingTop: 14 }}>{b.riskMax === k && <span className="mark" style={{ position: "absolute", top: 12, right: 12 }}><Ico name="check" size={12} sw={3} /><span className="dot" /></span>}<div className="ot">{LEVELS[k].name}</div></button>)}
          </div>
        </EditSection>

        <EditSection icon="globe" title="Périmètre" guard="≥ scope des workflows live">
          <span className="lab">Pays ({b.countries.length})</span>
          <div className="input-wrap" style={{ maxWidth: 320, marginTop: 8 }}>
            <span className="ico"><Ico name="search" size={15} /></span>
            <input className="inp with-icon" value={cq} placeholder="Ajouter un pays…" onChange={(e) => setCq(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && countryMatches.length) { e.preventDefault(); addCountry(countryMatches[0]); } }} />
            {countryMatches.length > 0 &&
              <div className="combo-pop">{countryMatches.map((c) => <button key={c} className="combo-opt" onClick={() => addCountry(c)}><span className="br-flag">{flagOf(c)}</span>{c}<Ico name="plus" size={13} sw={2} style={{ marginLeft: "auto", color: "var(--muted-soft)" }} /></button>)}</div>}
          </div>
          <div className="chips-wrap" style={{ marginTop: 10 }}>{b.countries.map((c) => <span key={c} className="chip"><span className="br-flag">{flagOf(c)}</span>{c}{b.countries.length > 1 && <span className="x" onClick={() => set({ countries: b.countries.filter((x) => x !== c) })}>×</span>}</span>)}</div>
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

        <EditSection icon="users" title="Utilisateurs & contacts" guard="≥ 1 BA owner actif">
          <div className="user-card owner"><span className="user-ava"><Ico name="userCheck" size={17} /></span><div className="user-fields"><input className="inp sm" value={b.owner.name} placeholder="Nom complet" onChange={(e) => set({ owner: { ...b.owner, name: e.target.value } })} /><input className="inp sm" value={b.owner.email} placeholder="email@entreprise.com" onChange={(e) => set({ owner: { ...b.owner, email: e.target.value } })} /></div><span className="chip brand sm" style={{ alignSelf: "center" }}>Owner</span></div>
          {b.agents.map((a, i) => <div className="user-card" key={i} style={{ marginTop: 8 }}><span className="user-ava dim"><Ico name="users" size={16} /></span><div className="user-fields"><input className="inp sm" value={a.name} placeholder="Nom complet" onChange={(e) => set({ agents: b.agents.map((x, j) => j === i ? { ...x, name: e.target.value } : x) })} /><input className="inp sm" value={a.email} placeholder="email@entreprise.com" onChange={(e) => set({ agents: b.agents.map((x, j) => j === i ? { ...x, email: e.target.value } : x) })} /></div><button className="user-rm" onClick={() => set({ agents: b.agents.filter((_, j) => j !== i) })}><Ico name="x" size={15} sw={2} /></button></div>)}
          <button className="add-row" onClick={() => set({ agents: [...b.agents, { name: "", email: "" }] })}><Ico name="plus" size={15} sw={2.1} />Ajouter un agent</button>
          <div className="step-sep" style={{ margin: "18px 0" }} />
          <span className="lab" style={{ display: "block" }}>Contacts & escalade</span>
          <div style={{ marginTop: 10 }}>
            {CONTACTS.map((c) => <div className="contact-row" key={c.k}><span className="contact-ico"><Ico name={c.icon} size={15} /></span><span className="contact-lab">{c.lab}</span><input className="inp sm" value={b.contacts[c.k]} placeholder="email@entreprise.com" onChange={(e) => setContact({ [c.k]: e.target.value })} /></div>)}
            <div className="contact-row"><span className="contact-ico"><Ico name="arrow" size={15} /></span><span className="contact-lab">Contact d'escalade</span><input className="inp sm" value={b.contacts.escalation} placeholder="email@entreprise.com" onChange={(e) => setContact({ escalation: e.target.value })} /></div>
          </div>
          <div className="tgl-row" style={{ marginTop: 14 }}><div className="tinfo"><div className="tt">Mails automatiques</div><div className="td">Notifications politique de confidentialité, PRA/BCP et communications réglementaires.</div></div><button className={"sw" + (b.autoMails ? " on" : "")} onClick={() => set({ autoMails: !b.autoMails })} aria-label="Mails automatiques" /></div>
        </EditSection>

        <EditSection icon="wallet" title="Facturation" guard="pas de rétrogradation en cours d'année">
          <div className="bill-modes">
            <button className={"bill-mode" + (annual ? " sel" : "")} onClick={() => set({ billingMode: "annual" })}>
              <div className="bm-h"><span className="ot">Package de jetons annuel</span><span className="mark sq" style={annual ? { borderColor: "var(--color-main)", background: "var(--color-main)" } : null}><Ico name="check" size={12} sw={3} style={{ opacity: annual ? 1 : 0 }} /></span></div>
              <div className="od">Licence + enveloppe annuelle à tarif dégressif.</div>
            </button>
            <button className={"bill-mode" + (!annual ? " sel" : "")} onClick={() => set({ billingMode: "payg" })}>
              <div className="bm-h"><span className="ot">Pay-as-you-go</span><span className="mark sq" style={!annual ? { borderColor: "var(--color-main)", background: "var(--color-main)" } : null}><Ico name="check" size={12} sw={3} style={{ opacity: !annual ? 1 : 0 }} /></span></div>
              <div className="od">Petit droit d'entrée + paiement à l'usage. Idéal petites structures.</div>
            </button>
          </div>
          {annual ? (
            <React.Fragment>
              <div className="pkg-grid" style={{ marginTop: 14 }}>{TOKEN_PKGS.map((p) => <button key={p.id} className={"pkg-card" + (b.pkg === p.id ? " sel" : "")} onClick={() => set({ pkg: p.id })}><span className="pkg-t">{p.t}</span><span className="pkg-tok">{fmt(p.tokens)}<small> tokens/an</small></span><span className="pkg-env">{eur(p.envelope)}<small> / an</small></span>{b.pkg === p.id && <span className="pkg-check"><Ico name="check" size={12} sw={3} /></span>}</button>)}</div>
              <div className="tgl-row" style={{ marginTop: 14 }}><div className="tinfo"><div className="tt">Alerte à 80 %</div><div className="td">Email Business Admin + Sales à 80 % de l'enveloppe.</div></div><button className={"sw" + (b.alert80 ? " on" : "")} onClick={() => set({ alert80: !b.alert80 })} aria-label="Alerte 80%" /></div>
            </React.Fragment>
          ) : (
            <div style={{ marginTop: 14 }}>
              <div className="payg-card">
                <div className="payg-line"><span>Droit d'entrée</span><b>petit forfait fixe</b></div>
                <div className="payg-line"><span>Accès dashboard</span><b>réduit</b></div>
                <div className="payg-line"><span>Jetons inclus</span><b>0</b></div>
                <div className="payg-line"><span>Facturation</span><b>à l'usage, par requête</b></div>
              </div>
              <div className="tgl-row" style={{ marginTop: 14 }}><div className="tinfo"><div className="tt">Self-onboarding</div><div className="td">Le client final porte lui-même son parcours. Activé par défaut en pay-as-you-go.</div></div><button className={"sw" + ((b.selfOnboarding || !annual) ? " on" : "")} onClick={() => set({ selfOnboarding: !b.selfOnboarding })} aria-label="Self-onboarding" /></div>
            </div>
          )}
        </EditSection>
      </div>
    </React.Fragment>);
}
