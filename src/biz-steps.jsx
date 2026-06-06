/* ShareID Studio — Business Setup: constants, end-user preview, wizard steps. */


import React from "react";
import { fmt } from "./charts.jsx";
import { DOC_TYPES, DocArt, Ico, LEVELS, LEVEL_KEYS } from "./core.jsx";

/* ----------------------------- constants ----------------------------- */
export const BIZ_TYPES = [
  { id: "standard", t: "Standard", icon: "building", d: "Entreprise cliente classique, mono-business. Le live est activé dès la création.", cycle: "Live activé · test sur demande", owner: "Sales" },
  { id: "pilot", t: "Pilot", icon: "zap", d: "Éprouver ShareID avant de signer. Test d'abord, live au premier workflow répliqué.", cycle: "Test d'abord · deadline indicative", owner: "Sales" },
  { id: "retailer", t: "Retailer", icon: "layers", d: "Partenaire intégrateur qui revend ShareID et refacture ses propres clients (B2B2B).", cycle: "Hiérarchie 2 niveaux", owner: "Admin ShareID", soon: true },
  { id: "group", t: "Group", icon: "globe", d: "Grand groupe multi-entités, contrat unique et consommation consolidée (B2B).", cycle: "Hiérarchie 2 niveaux", owner: "Admin ShareID", soon: true },
];

export const BIZ_DRIVERS = [
  { id: "compliance", icon: "fileCheck", t: "Conformité réglementaire", d: "eIDAS, Code monétaire et financier, obligations KYC." },
  { id: "fraud", icon: "shieldAlert", t: "Lutte contre la fraude", d: "Détecter et bloquer les usurpations d'identité." },
  { id: "experience", icon: "zap", t: "Expérience utilisateur", d: "Fluidifier le parcours et réduire les frictions." },
];

export const RETENTION = [
  { h: 12, l: "12 heures" }, { h: 24, l: "1 jour" }, { h: 48, l: "2 jours" }, { h: 72, l: "3 jours" },
  { h: 96, l: "4 jours" }, { h: 720, l: "30 jours" }, { h: 1440, l: "60 jours" }, { h: 2160, l: "90 jours" }, { h: 8760, l: "1 an" },
];
export function retLabel(h) { return (RETENTION.find((r) => r.h === h) || RETENTION[7]).l; }

export const TOKEN_PKGS = [
  { id: "pkg_2m", t: "S", tokens: 2000000, price: 0.11, envelope: 220000 },
  { id: "pkg_5m", t: "M", tokens: 5000000, price: 0.08, envelope: 400000 },
  { id: "pkg_10m", t: "L", tokens: 10000000, price: 0.06, envelope: 600000 },
  { id: "pkg_15m", t: "XL", tokens: 15000000, price: 0.05, envelope: 750000 },
];
export function pkgOf(id) { return TOKEN_PKGS.find((p) => p.id === id) || TOKEN_PKGS[1]; }
export function eur(n) { return n.toLocaleString("fr-FR") + " €"; }

export const BIZ_COUNTRIES = [
  "France", "Belgique", "Luxembourg", "Suisse", "Allemagne", "Espagne", "Italie", "Portugal",
  "Pays-Bas", "Irlande", "Autriche", "Pologne", "Suède", "Danemark", "Finlande", "Grèce",
  "Royaume-Uni", "Maroc", "Tunisie", "Sénégal", "Côte d'Ivoire", "Canada", "États-Unis",
];
const COUNTRY_FLAGS = { France: "🇫🇷", Belgique: "🇧🇪", Luxembourg: "🇱🇺", Suisse: "🇨🇭", Allemagne: "🇩🇪", Espagne: "🇪🇸", Italie: "🇮🇹", Portugal: "🇵🇹", "Pays-Bas": "🇳🇱", Irlande: "🇮🇪", Autriche: "🇦🇹", Pologne: "🇵🇱", Suède: "🇸🇪", Danemark: "🇩🇰", Finlande: "🇫🇮", Grèce: "🇬🇷", "Royaume-Uni": "🇬🇧", Maroc: "🇲🇦", Tunisie: "🇹🇳", Sénégal: "🇸🇳", "Côte d'Ivoire": "🇨🇮", Canada: "🇨🇦", "États-Unis": "🇺🇸" };
export function flagOf(c) { return COUNTRY_FLAGS[c] || "🏳️"; }

export const DEFAULT_BIZ = {
  type: "standard",
  name: "", logo: null, color: "#3253D1",
  euTitle: "Vérifiez votre identité", euSubtitle: "Préparez votre pièce d'identité, cela prend moins d'une minute.", euCta: "Commencer la vérification",
  drivers: [], eidasMin: "subst",
  scopeAll: false, countries: ["France"], docTypes: ["id_card", "passport"],
  retentionH: 2160,
  owner: { name: "", email: "" }, agents: [],
  pkg: "pkg_5m", alert80: true,
  pilotEnd: "", prodStart: "",
};

/* ----------------------------- end-user preview ----------------------------- */
export function EndUserPreview({ biz, scale = 1 }) {
  const initials = (biz.name || "?").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="eu-frame" style={{ transform: `scale(${scale})` }}>
      <div className="eu-notch" />
      <div className="eu-screen">
        <div className="eu-top">
          <div className="eu-logo" style={{ background: biz.logo ? "transparent" : "color-mix(in srgb," + biz.color + " 14%,#fff)", color: biz.color }}>
            {biz.logo ? <img src={biz.logo} alt="" /> : initials}
          </div>
          <span className="eu-secure"><Ico name="lock" size={11} sw={2} />Sécurisé par ShareID</span>
        </div>
        <div className="eu-body">
          <div className="eu-illus" style={{ borderColor: "color-mix(in srgb," + biz.color + " 26%,#fff)" }}>
            <Ico name="userCheck" size={30} style={{ color: biz.color }} />
          </div>
          <h4 className="eu-title">{biz.euTitle || "Titre principal"}</h4>
          <p className="eu-sub">{biz.euSubtitle || "Titre secondaire de l'écran."}</p>
        </div>
        <button className="eu-cta" style={{ background: biz.color }}>{biz.euCta || "Bouton d'action"}</button>
        <div className="eu-foot"><span className="eu-dots"><i /><i /><i /></span></div>
      </div>
    </div>);
}

/* ----------------------------- shared wizard head ----------------------------- */
function BizHead({ n, total, title, sub }) {
  return <div className="wzh"><div className="se">Étape {n} / {total}</div><h2>{title}</h2><p className="sub">{sub}</p></div>;
}

/* ----------------------------- Step 1 — Type ----------------------------- */
export function BizType({ biz, set, n, total }) {
  return (
    <div className="body-inner step-anim">
      <BizHead n={n} total={total} title="Type de business" sub="Choisissez la structure commerciale du business client. Elle conditionne le cycle test/live et la suite du parcours." />
      <div className="opts" style={{ maxWidth: 680 }}>
        {BIZ_TYPES.map((bt) => {
          const sel = biz.type === bt.id;
          return (
            <button key={bt.id} className={"opt" + (sel ? " sel" : "")} onClick={() => set({ type: bt.id })}>
              <span className={"ico-tile" + (sel ? "" : " dim")}><Ico name={bt.icon} size={19} /></span>
              <div className="obody">
                <div className="otop"><span className="ot">{bt.t}</span><span className="biz-cycle-chip">{bt.cycle}</span>{bt.soon && <span className="chip sm" style={{ fontSize: 10 }}>{bt.owner}</span>}</div>
                <div className="od">{bt.d}</div>
              </div>
              <span className="mark sq" style={{ marginTop: 2 }}><Ico name="check" size={12} sw={3} /></span>
            </button>);
        })}
      </div>
      {(biz.type === "retailer" || biz.type === "group") &&
        <div className="note" style={{ maxWidth: 680, marginTop: 16 }}>
          <span className="ico"><Ico name="info" size={15} sw={1.9} /></span>
          <div>En V1, les business <b>Retailer</b> et Group sont créés par un Admin ShareID. Leur tooling complet (sous-businesses autonomes, dashboards consolidés) arrive en V2 — les étapes spécifiques restent à itérer.</div>
        </div>}
    </div>);
}

/* ----------------------------- Step 2 — Identité ----------------------------- */
export function BizIdentity({ biz, set, n, total }) {
  const COLORS = ["#3253D1", "#1F6F5B", "#7A3DBE", "#C0392B", "#0E1116", "#D98324"];
  return (
    <div className="body-inner wide step-anim">
      <BizHead n={n} total={total} title="Identité" sub="Le nom, le branding et les textes de l'écran que verra l'utilisateur final. L'aperçu se met à jour en direct." />
      <div className="biz-split">
        <div className="biz-form">
          <section className="cfg-sec">
            <div className="cfg-sec-h"><span className="cfg-sec-t">Nom du business</span></div>
            <input className="inp" value={biz.name} placeholder="ex. Néobanque Atlas" onChange={(e) => set({ name: e.target.value })} />
            <span className="hint" style={{ marginTop: 6 }}>Unique sur la plateforme ShareID.</span>
          </section>
          <div className="step-sep" style={{ margin: "22px 0" }} />
          <section className="cfg-sec">
            <div className="cfg-sec-h"><span className="cfg-sec-t">Branding</span></div>
            <div className="brand-row">
              <div className="field" style={{ flex: 1 }}>
                <span className="lab">Logo</span>
                <button className="logo-drop" onClick={() => set({ logo: biz.logo ? null : "ds/logo-shareid.svg" })}>
                  {biz.logo ? <img src={biz.logo} alt="" /> : <><Ico name="plus" size={16} sw={2} /><span>Ajouter</span></>}
                </button>
              </div>
              <div className="field" style={{ flex: 1 }}>
                <span className="lab">Couleur principale</span>
                <div className="swatches">
                  {COLORS.map((c) =>
                    <button key={c} className={"swatch" + (biz.color === c ? " on" : "")} style={{ background: c }} onClick={() => set({ color: c })} aria-label={c}>
                      {biz.color === c && <Ico name="check" size={12} sw={3} />}
                    </button>)}
                </div>
              </div>
            </div>
          </section>
          <div className="step-sep" style={{ margin: "22px 0" }} />
          <section className="cfg-sec">
            <div className="cfg-sec-h"><span className="cfg-sec-t">Écran end-user</span></div>
            <div className="field"><span className="lab">Titre principal</span><input className="inp" value={biz.euTitle} onChange={(e) => set({ euTitle: e.target.value })} /></div>
            <div className="field" style={{ marginTop: 12 }}><span className="lab">Titre secondaire</span><input className="inp" value={biz.euSubtitle} onChange={(e) => set({ euSubtitle: e.target.value })} /></div>
            <div className="field" style={{ marginTop: 12 }}><span className="lab">Libellé du bouton</span><input className="inp" value={biz.euCta} onChange={(e) => set({ euCta: e.target.value })} /></div>
          </section>
        </div>
        <div className="biz-preview-col">
          <div className="biz-preview-label">Aperçu end-user</div>
          <EndUserPreview biz={biz} />
        </div>
      </div>
    </div>);
}

/* ----------------------------- Step 3 — Objectif & eIDAS ----------------------------- */
export function BizObjective({ biz, set, n, total }) {
  function toggle(id) {
    const has = biz.drivers.includes(id);
    if (has) set({ drivers: biz.drivers.filter((d) => d !== id) });
    else if (biz.drivers.length < 3) set({ drivers: [...biz.drivers, id] });
  }
  const fric = { low: "l1", subst: "l2", high: "l3" };
  return (
    <div className="body-inner step-anim">
      <BizHead n={n} total={total} title="Objectif & niveau eIDAS" sub="Pourquoi ce client vérifie ses utilisateurs, et le niveau d'assurance minimum accepté pour ses workflows." />
      <section className="cfg-sec">
        <div className="cfg-sec-h" style={{ maxWidth: 680 }}><span className="cfg-sec-t">Pourquoi vérifient-ils ?</span><span className="counter">{biz.drivers.length} / 3</span></div>
        <div className="opts g3" style={{ maxWidth: 680 }}>
          {BIZ_DRIVERS.map((d) => {
            const sel = biz.drivers.includes(d.id);
            return (
              <button key={d.id} className={"opt col" + (sel ? " sel" : "")} onClick={() => toggle(d.id)}>
                <div className="otop" style={{ width: "100%" }}><span className={"ico-tile" + (sel ? "" : " dim")}><Ico name={d.icon} size={19} /></span><span className="mark sq" style={{ marginLeft: "auto" }}><Ico name="check" size={12} sw={3} /></span></div>
                <div className="obody"><div className="ot">{d.t}</div><div className="od">{d.d}</div></div>
              </button>);
          })}
        </div>
      </section>
      <div className="step-sep" />
      <section className="cfg-sec">
        <div className="cfg-sec-h"><span className="cfg-sec-t">Niveau eIDAS minimum</span></div>
        <div className="opts g3" style={{ maxWidth: 680 }}>
          {LEVEL_KEYS.map((k) => {
            const sel = biz.eidasMin === k;
            const desc = { low: "Assurance légère, friction minimale.", subst: "Recommandé pour le KYC régulé.", high: "Assurance maximale — NFC + liveness." }[k];
            return (
              <button key={k} className={"opt col" + (sel ? " sel" : "")} onClick={() => set({ eidasMin: k })} style={{ paddingTop: 16 }}>
                {sel && <span className="mark" style={{ position: "absolute", top: 14, right: 14 }}><Ico name="check" size={12} sw={3} /><span className="dot" /></span>}
                <div className="obody" style={{ width: "100%" }}>
                  <div className="otop"><span className="ot">{LEVELS[k].name}</span></div>
                  <div className="od">{desc}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 10 }}><span className={"fric-meter " + fric[k]}><i /><i /><i /></span></div>
                </div>
              </button>);
          })}
        </div>
        <div className="note" style={{ maxWidth: 680, marginTop: 16 }}>
          <span className="ico"><Ico name="info" size={15} sw={1.9} /></span>
          <div>C'est le plancher d'assurance du business. Chaque workflow pourra <b>élever</b> ce niveau, jamais descendre en dessous.</div>
        </div>
      </section>
    </div>);
}

/* ----------------------------- Step 4 — Scope ----------------------------- */
export function BizScope({ biz, set, n, total }) {
  const [q, setQ] = React.useState("");
  const matches = q ? BIZ_COUNTRIES.filter((c) => c.toLowerCase().includes(q.toLowerCase()) && !biz.countries.includes(c)).slice(0, 6) : [];
  function add(c) { set({ countries: [...biz.countries, c] }); setQ(""); }
  function remove(c) { set({ countries: biz.countries.filter((x) => x !== c) }); }
  function toggleDoc(id) {
    const has = biz.docTypes.includes(id);
    if (has && biz.docTypes.length > 1) set({ docTypes: biz.docTypes.filter((d) => d !== id) });
    else if (!has) set({ docTypes: [...biz.docTypes, id] });
  }
  return (
    <div className="body-inner step-anim">
      <BizHead n={n} total={total} title="Périmètre : pays & documents" sub="Les pays couverts et les types de documents acceptés. C'est le scope maximum du business — ses workflows pourront le restreindre." />
      <section className="cfg-sec" style={{ maxWidth: 680 }}>
        <div className="cfg-sec-h"><span className="cfg-sec-t">Pays autorisés</span><span className="counter">{biz.countries.length}</span></div>
        <div className="input-wrap" style={{ maxWidth: 360 }}>
          <span className="ico"><Ico name="search" size={16} /></span>
          <input className="inp with-icon" value={q} placeholder="Rechercher un pays…" onChange={(e) => setQ(e.target.value)} />
          {matches.length > 0 &&
            <div className="combo-pop">
              {matches.map((c) => <button key={c} className="combo-opt" onClick={() => add(c)}><span className="br-flag">{flagOf(c)}</span>{c}<Ico name="plus" size={13} sw={2} style={{ marginLeft: "auto", color: "var(--muted-soft)" }} /></button>)}
            </div>}
        </div>
        <div className="chips-wrap">
          {biz.countries.map((c) => <span key={c} className="chip"><span className="br-flag">{flagOf(c)}</span>{c}<span className="x" onClick={() => remove(c)}>×</span></span>)}
        </div>
      </section>
      <div className="step-sep" />
      <section className="cfg-sec" style={{ maxWidth: 680 }}>
        <div className="cfg-sec-h"><span className="cfg-sec-t">Types de documents</span><span className="counter">{biz.docTypes.length} / 4</span></div>
        <div className="opts g2-doc">
          {DOC_TYPES.map((d) => {
            const sel = biz.docTypes.includes(d.id);
            return (
              <button key={d.id} className={"doc-pick" + (sel ? " sel" : "")} onClick={() => toggleDoc(d.id)}>
                <span className="doc-art" style={{ color: sel ? "var(--color-main)" : "var(--muted-soft)" }}><DocArt art={d.art} w={62} /></span>
                <span className="doc-pick-nm">{d.t}</span>
                <span className="mark sq"><Ico name="check" size={12} sw={3} /></span>
              </button>);
          })}
        </div>
      </section>
    </div>);
}

/* ----------------------------- Step 5 — Rétention ----------------------------- */
export function BizRetention({ biz, set, n, total }) {
  const idx = RETENTION.findIndex((r) => r.h === biz.retentionH);
  const cur = idx < 0 ? 7 : idx;
  return (
    <div className="body-inner step-anim">
      <BizHead n={n} total={total} title="Rétention des données" sub="Durée maximale de conservation des données de vérification avant anonymisation automatique." />
      <section className="cfg-sec" style={{ maxWidth: 620 }}>
        <div className="ret-value"><span className="ret-num">{retLabel(biz.retentionH)}</span><span className="ret-cap">durée de conservation</span></div>
        <div className="slider">
          <div className="track"><div className="fill" style={{ width: cur / (RETENTION.length - 1) * 100 + "%" }} /><div className="knob" style={{ left: cur / (RETENTION.length - 1) * 100 + "%" }} /></div>
          <input type="range" min="0" max={RETENTION.length - 1} value={cur} onChange={(e) => set({ retentionH: RETENTION[+e.target.value].h })} className="slider-input" />
          <div className="ticks">
            {RETENTION.map((r, i) => <button key={r.h} className={i === cur ? "cur" : ""} onClick={() => set({ retentionH: r.h })}>{i === 0 || i === RETENTION.length - 1 || i === cur ? r.l : "·"}</button>)}
          </div>
        </div>
        <div className="note" style={{ marginTop: 22 }}>
          <span className="ico"><Ico name="info" size={15} sw={1.9} /></span>
          <div>Au-delà de cette durée, les requêtes sont <b>anonymisées</b> (RGPD) : assets et données personnelles purgés, seules les métadonnées de comptage sont conservées. Pas d'option illimitée. Défaut recommandé : 90 jours.</div>
        </div>
      </section>
    </div>);
}

/* ----------------------------- Step 6 — Utilisateurs ----------------------------- */
export function BizUsers({ biz, set, n, total }) {
  function setOwner(p) { set({ owner: { ...biz.owner, ...p } }); }
  function addAgent() { set({ agents: [...biz.agents, { name: "", email: "" }] }); }
  function setAgent(i, p) { set({ agents: biz.agents.map((a, j) => j === i ? { ...a, ...p } : a) }); }
  function rmAgent(i) { set({ agents: biz.agents.filter((_, j) => j !== i) }); }
  return (
    <div className="body-inner step-anim">
      <BizHead n={n} total={total} title="Utilisateurs" sub="Le Business Admin owner reçoit le magic-link. Vous pouvez pré-inviter des agents — le BA pourra en ajouter d'autres ensuite." />
      <section className="cfg-sec" style={{ maxWidth: 620 }}>
        <div className="cfg-sec-h"><span className="cfg-sec-t">Business Admin owner</span><span className="chip brand sm">obligatoire</span></div>
        <div className="user-card owner">
          <span className="user-ava"><Ico name="userCheck" size={17} /></span>
          <div className="user-fields">
            <input className="inp sm" value={biz.owner.name} placeholder="Nom complet" onChange={(e) => setOwner({ name: e.target.value })} />
            <input className="inp sm" value={biz.owner.email} placeholder="email@entreprise.com" onChange={(e) => setOwner({ email: e.target.value })} />
          </div>
        </div>
      </section>
      <div className="step-sep" />
      <section className="cfg-sec" style={{ maxWidth: 620 }}>
        <div className="cfg-sec-h"><span className="cfg-sec-t">Agents</span><span className="counter">{biz.agents.length}</span></div>
        {biz.agents.map((a, i) =>
          <div className="user-card" key={i}>
            <span className="user-ava dim"><Ico name="users" size={16} /></span>
            <div className="user-fields">
              <input className="inp sm" value={a.name} placeholder="Nom complet" onChange={(e) => setAgent(i, { name: e.target.value })} />
              <input className="inp sm" value={a.email} placeholder="email@entreprise.com" onChange={(e) => setAgent(i, { email: e.target.value })} />
            </div>
            <button className="user-rm" onClick={() => rmAgent(i)}><Ico name="x" size={15} sw={2} /></button>
          </div>)}
        <button className="add-row" onClick={addAgent}><Ico name="plus" size={15} sw={2.1} />Ajouter un agent</button>
      </section>
    </div>);
}

/* ----------------------------- Conditional step (stub) ----------------------------- */
export function BizCond({ biz, set, n, total }) {
  const map = {
    pilot: { title: "Pilote", sub: "Paramètres spécifiques au cycle pilote.", icon: "zap" },
    retailer: { title: "Hiérarchie retailer", sub: "Configuration du retailer et de ses sous-businesses.", icon: "layers" },
    group: { title: "Groupe", sub: "Configuration du groupe et de ses filiales.", icon: "globe" },
  }[biz.type] || { title: "Spécifique", sub: "", icon: "info" };
  return (
    <div className="body-inner step-anim">
      <BizHead n={n} total={total} title={map.title} sub={map.sub} />
      {biz.type === "pilot" ?
        <section className="cfg-sec" style={{ maxWidth: 560 }}>
          <div className="field"><span className="lab">Date de fin du pilote (indicative)</span><input className="inp" type="date" value={biz.pilotEnd} onChange={(e) => set({ pilotEnd: e.target.value })} /></div>
          <div className="field" style={{ marginTop: 14 }}><span className="lab">Date estimée de mise en production</span><input className="inp" type="date" value={biz.prodStart} onChange={(e) => set({ prodStart: e.target.value })} /></div>
          <div className="note" style={{ marginTop: 18 }}><span className="ico"><Ico name="info" size={15} sw={1.9} /></span><div>La date de fin de pilote est <b>purement indicative</b> : aucune bascule ni rappel automatique. Le live s'active au premier workflow répliqué par le BA.</div></div>
        </section> :
        <section className="cfg-sec" style={{ maxWidth: 560 }}>
          <div className="stub-card">
            <span className="ico-tile" style={{ width: 44, height: 44 }}><Ico name={map.icon} size={22} /></span>
            <div><div className="ot" style={{ fontSize: 15 }}>Étape à itérer</div><div className="od" style={{ marginTop: 4 }}>Le tooling complet {map.title} (sous-businesses, hiérarchie, contrat groupé) sera spécifié dans une itération dédiée. En V1 ces business sont configurés par un Admin ShareID.</div></div>
          </div>
        </section>}
    </div>);
}

/* ----------------------------- Step 7 — Facturation ----------------------------- */
function SimCard({ tone, title, lines }) {
  return (
    <div className={"sim-card " + tone}>
      <div className="sim-h">{title}</div>
      <div className="sim-lines">{lines.map((l, i) => <div className="sim-l" key={i}><span>{l[0]}</span><b>{l[1]}</b></div>)}</div>
    </div>);
}
export function BizBilling({ biz, set, n, total }) {
  const pkg = pkgOf(biz.pkg);
  return (
    <div className="body-inner wide step-anim">
      <BizHead n={n} total={total} title="Facturation" sub="Un token = une vérification. Le client achète une enveloppe annuelle de tokens à tarif dégressif." />
      <div className="bill-modes">
        <div className="bill-mode disabled">
          <div className="bm-h"><span className="ot">Self-serve à la carte</span><span className="chip sm">bientôt disponible</span></div>
          <div className="od">Facturation à la consommation. Disponible en V2.</div>
        </div>
        <div className="bill-mode sel">
          <div className="bm-h"><span className="ot">Package de tokens annuel</span><span className="mark sq" style={{ borderColor: "var(--color-main)", background: "var(--color-main)" }}><Ico name="check" size={12} sw={3} style={{ opacity: 1 }} /></span></div>
          <div className="od">Enveloppe annuelle à tarif dégressif, report en année 1, upgrade fluide avec avoir.</div>
        </div>
      </div>
      <section className="cfg-sec" style={{ marginTop: 22 }}>
        <div className="cfg-sec-h"><span className="cfg-sec-t">Enveloppe annuelle</span></div>
        <div className="pkg-grid">
          {TOKEN_PKGS.map((p) => {
            const sel = biz.pkg === p.id;
            return (
              <button key={p.id} className={"pkg-card" + (sel ? " sel" : "")} onClick={() => set({ pkg: p.id })}>
                <span className="pkg-t">{p.t}</span>
                <span className="pkg-tok">{fmt(p.tokens)}<small> tokens/an</small></span>
                <span className="pkg-price">{p.price.toFixed(2).replace(".", ",")} € <small>/ token</small></span>
                <span className="pkg-env">{eur(p.envelope)}<small> / an</small></span>
                {sel && <span className="pkg-check"><Ico name="check" size={12} sw={3} /></span>}
              </button>);
          })}
        </div>
      </section>
      <section className="cfg-sec" style={{ marginTop: 20 }}>
        <div className="cfg-sec-h"><span className="cfg-sec-t">Simulations</span></div>
        <div className="sim-grid">
          <SimCard tone="good" title="Sous-consommation année 1" lines={[["Package " + pkg.t, fmt(pkg.tokens)], ["Consommé", fmt(Math.round(pkg.tokens * 0.5))], ["Reporté en année 2", fmt(Math.round(pkg.tokens * 0.5))]]} />
          <SimCard tone="neutral" title="Régime établi (année 2+)" lines={[["Package " + pkg.t, fmt(pkg.tokens)], ["Consommé", fmt(Math.round(pkg.tokens * 0.8))], ["Perdu en fin d'année", fmt(Math.round(pkg.tokens * 0.2))]]} />
          <SimCard tone="brand" title="Dépassement → upgrade" lines={[["Épuisé avant échéance", "oui"], ["Avoir crédité", eur(pkg.envelope)], ["Bascule tarif supérieur", "fluide"]]} />
        </div>
      </section>
      <div className="tgl-row" style={{ marginTop: 18, maxWidth: 680 }}>
        <div className="tinfo"><div className="tt">Alerte à 80 %</div><div className="td">Email au Business Admin + Sales à 80 % de l'enveloppe. L'alerte 100 % est systématique. Jamais bloquant en live.</div></div>
        <button className={"sw" + (biz.alert80 ? " on" : "")} onClick={() => set({ alert80: !biz.alert80 })} aria-label="Alerte 80%" />
      </div>
    </div>);
}

/* ----------------------------- Step 8 — Récapitulatif ----------------------------- */
export function BizReview({ biz, n, total }) {
  const pkg = pkgOf(biz.pkg);
  const bt = BIZ_TYPES.find((t) => t.id === biz.type);
  const rows = [
    ["Type de business", bt.t],
    ["Nom", biz.name || "—"],
    ["Couleur", <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 13, height: 13, borderRadius: 4, background: biz.color, display: "inline-block" }} />{biz.color}</span>],
    ["Objectifs", biz.drivers.length ? biz.drivers.map((d) => BIZ_DRIVERS.find((x) => x.id === d).t).join(", ") : "—"],
    ["Niveau eIDAS min.", LEVELS[biz.eidasMin].name],
    ["Pays", biz.countries.length + " (" + biz.countries.slice(0, 3).join(", ") + (biz.countries.length > 3 ? "…" : "") + ")"],
    ["Documents", biz.docTypes.map((d) => DOC_TYPES.find((x) => x.id === d).short).join(", ")],
    ["Rétention", retLabel(biz.retentionH)],
    ["Owner BA", biz.owner.name ? biz.owner.name + " · " + biz.owner.email : "—"],
    ["Agents", biz.agents.length],
    ["Facturation", "Package " + pkg.t + " · " + fmt(pkg.tokens) + " tokens/an · " + eur(pkg.envelope)],
  ];
  return (
    <div className="body-inner step-anim">
      <BizHead n={n} total={total} title="Récapitulatif & création" sub="Vérifiez la configuration. Le business sera créé et le BA owner recevra un magic-link vers le Workflow Builder." />
      <div className="biz-review-split">
        <div className="recap" style={{ flex: 1, marginTop: 0 }}>
          <div className="recap-h">Configuration du business</div>
          {rows.map((r, i) => <div className="recap-row" key={i}><span className="rk">{r[0]}</span><span className="rv">{r[1]}</span></div>)}
        </div>
        <div className="biz-preview-col"><div className="biz-preview-label">Aperçu end-user</div><EndUserPreview biz={biz} scale={0.9} /></div>
      </div>
    </div>);
}
