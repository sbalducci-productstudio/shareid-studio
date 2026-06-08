/* ShareID Studio — Business Setup: constants, end-user preview, wizard steps. */


import React from "react";
import { fmt } from "./charts.jsx";
import { DOC_TYPES, DocArt, Ico, LEVELS, RISK_KEYS } from "./core.jsx";
import { can } from "./access.js";
import { useSession } from "./session.jsx";

/* ----------------------------- constants ----------------------------- */
/* L'unité atomique d'un business = une ENTITÉ (une société unique, ex. Crédit du Maroc).
   Le type décrit comment cette/ces entité(s) sont structurées et facturées. Le statut « pilote »
   est transverse à tous les types (voir isPilot). « Partenaire opérateur » est une typologie
   d'ACCÈS (humains qui traitent les requêtes de plusieurs clients), pas un type d'entité — gardé
   optionnel. La base business est commune ; les types ne sont que des surcouches. */
export const BIZ_TYPES = [
  { id: "standard", t: "Standard", icon: "building", d: "Une entité unique (ex. Crédit du Maroc). Le cas le plus courant.", cycle: "Une entité" },
  { id: "group", t: "Groupe", icon: "globe", d: "Plusieurs entités réunies, avec une vue consolidée par-dessus (ex. Société Générale : Bourso, Crédit du Nord…).", cycle: "Multi-entités + vue globale", soon: true },
  { id: "retailer", t: "Retailer", icon: "layers", d: "Revendeur de ShareID (ex. Tessi) qui vend à des entités. Voit le volume/usage pour la facturation, jamais les données personnelles de ses clients.", cycle: "Revend à des entités", soon: true },
  { id: "payg", t: "Pay-as-you-go", icon: "zap", d: "Petites structures : facturation à l'usage et accès dashboard réduit. Même socle, setup par défaut allégé.", cycle: "Petite structure · à l'usage" },
];

export const BIZ_DRIVERS = [
  { id: "compliance", icon: "fileCheck", t: "Obligations réglementaires", d: "KYC/AML, lutte anti-blanchiment et obligations sectorielles." },
  { id: "fraud", icon: "shieldAlert", t: "Lutte contre la fraude", d: "Détecter et bloquer les usurpations d'identité." },
  { id: "experience", icon: "zap", t: "Expérience utilisateur", d: "Fluidifier le parcours et réduire les frictions." },
];

/* §5 — rétention bornée : minimum 12 h, maximum 60 jours (pas d'option au-delà). */
export const RETENTION = [
  { h: 12, l: "12 heures" }, { h: 24, l: "1 jour" }, { h: 72, l: "3 jours" },
  { h: 168, l: "7 jours" }, { h: 336, l: "14 jours" }, { h: 720, l: "30 jours" }, { h: 1440, l: "60 jours" },
];
export function retLabel(h) { return (RETENTION.find((r) => r.h === h) || RETENTION[RETENTION.length - 1]).l; }

/* §7 — un seul et même jeton pour tous ; c'est le COÛT du jeton (par setup) qui varie et reste
   paramétrable. L'enveloppe annuelle est juste un volume acheté à tarif dégressif. */
export const TOKEN_PKGS = [
  { id: "pkg_2m", t: "S", tokens: 2000000, price: 0.11, envelope: 220000 },
  { id: "pkg_5m", t: "M", tokens: 5000000, price: 0.08, envelope: 400000 },
  { id: "pkg_10m", t: "L", tokens: 10000000, price: 0.06, envelope: 600000 },
  { id: "pkg_20m", t: "XL", tokens: 20000000, price: 0.05, envelope: 1000000 },
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
  isPilot: false,             // §1 — pilote = statut transitoire, transverse aux types
  operatorEnabled: true,      // §1 — réglage opérateur au niveau business/global
  name: "", logo: null,
  color: "#3253D1",           // §2 — couleur primaire (obligatoire)
  colorSecondary: "#0E1116",  // §2 — couleur secondaire (obligatoire)
  coBrandSdk: true,           // §2 — co-branding : afficher la marque client dans le SDK, pas « ShareID »
  euTitle: "Vérifiez votre identité", euSubtitle: "Préparez votre pièce d'identité, cela prend moins d'une minute.", euCta: "Commencer la vérification",
  drivers: [],
  riskMax: "subst",           // §3 — niveau de risque MAXIMUM de consommation (plafond de coût). Pas de minimum au niveau business.
  scopeAll: false, countries: ["France"], docTypes: ["id_card", "passport"],
  docOverrides: {},           // §4 — exceptions par pays : { "France": ["id_card","passport","driving_licence"] }
  retentionH: 720,            // §5 — défaut 30 jours (borne 12 h – 60 j)
  owner: { name: "", email: "" }, agents: [],
  contacts: { security: "", dpo: "", contract: "", escalation: "" }, // §6 — contacts & escalade
  autoMails: true,            // §6 — mails automatiques (politique de confidentialité, PRA/BCP)
  billingMode: "annual",      // §7 — "annual" | "payg"
  selfOnboarding: false,      // §19 — parcours porté par le client final (auto si paiement non-token)
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
        <div className="eu-foot"><span className="eu-dots" style={biz.colorSecondary ? { color: biz.colorSecondary } : null}><i /><i /><i /></span></div>
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
      <BizHead n={n} total={total} title="Type de business" sub="L'unité atomique est une entité (une société, ex. Crédit du Maroc). Tous les types partagent le même socle — ils n'en sont que des surcouches." />
      <div className="opts" style={{ maxWidth: 680 }}>
        {BIZ_TYPES.map((bt) => {
          const sel = biz.type === bt.id;
          return (
            <button key={bt.id} className={"opt" + (sel ? " sel" : "")} onClick={() => set({ type: bt.id })}>
              <span className={"ico-tile" + (sel ? "" : " dim")}><Ico name={bt.icon} size={19} /></span>
              <div className="obody">
                <div className="otop"><span className="ot">{bt.t}</span><span className="biz-cycle-chip">{bt.cycle}</span>{bt.soon && <span className="chip sm" style={{ fontSize: 10 }}>tooling V2</span>}</div>
                <div className="od">{bt.d}</div>
              </div>
              <span className="mark sq" style={{ marginTop: 2 }}><Ico name="check" size={12} sw={3} /></span>
            </button>);
        })}
      </div>

      {biz.type === "retailer" &&
        <div className="note" style={{ maxWidth: 680, marginTop: 16 }}>
          <span className="ico"><Ico name="info" size={15} sw={1.9} /></span>
          <div>Le <b>Retailer</b> a des droits de type « sales » (créer des standards / pilotes pour ses clients) mais <b>ne peut pas créer de groupes</b> et n'accède jamais aux données personnelles de ses clients.</div>
        </div>}

      <div className="step-sep" style={{ margin: "22px 0", maxWidth: 680 }} />

      {/* §1 — Pilote = statut transitoire, pas un type. */}
      <section className="cfg-sec" style={{ maxWidth: 680 }}>
        <div className="tgl-row">
          <div className="tinfo"><div className="tt">Est-ce un pilote ?</div><div className="td">Statut transitoire avec droits différents (ex. accès à la bêta). Un pilote se <b>transforme</b> ensuite en standard / retailer / groupe — on ne le recrée pas.</div></div>
          <button className={"sw" + (biz.isPilot ? " on" : "")} onClick={() => set({ isPilot: !biz.isPilot })} aria-label="Statut pilote" />
        </div>
        {biz.isPilot &&
          <div style={{ marginTop: 14 }}>
            <div className="brand-row">
              <div className="field" style={{ flex: 1 }}><span className="lab">Date de fin de pilote (indicative)</span><input className="inp" type="date" value={biz.pilotEnd} onChange={(e) => set({ pilotEnd: e.target.value })} /></div>
              <div className="field" style={{ flex: 1 }}><span className="lab">Mise en production estimée</span><input className="inp" type="date" value={biz.prodStart} onChange={(e) => set({ prodStart: e.target.value })} /></div>
            </div>
            <div className="note" style={{ marginTop: 12 }}><span className="ico"><Ico name="info" size={15} sw={1.9} /></span><div>Dates <b>purement indicatives</b> : aucune bascule automatique. La transformation en business définitif se fait à la main, sans perte de configuration.</div></div>
          </div>}
      </section>
    </div>);
}

/* ----------------------------- Step 2 — Identité ----------------------------- */
function ColorPicker({ value, onPick }) {
  const COLORS = ["#3253D1", "#1F6F5B", "#7A3DBE", "#C0392B", "#0E1116", "#D98324"];
  return (
    <div className="swatches">
      {COLORS.map((c) =>
        <button key={c} className={"swatch" + (value === c ? " on" : "")} style={{ background: c }} onClick={() => onPick(c)} aria-label={c}>
          {value === c && <Ico name="check" size={12} sw={3} />}
        </button>)}
    </div>);
}
export function BizIdentity({ biz, set, n, total }) {
  return (
    <div className="body-inner wide step-anim">
      <BizHead n={n} total={total} title="Identité" sub="Le nom et le branding du business. Le nom et les couleurs sont obligatoires ; le logo et les textes pourront être complétés plus tard par l'owner." />
      <div className="biz-split">
        <div className="biz-form">
          <section className="cfg-sec">
            <div className="cfg-sec-h"><span className="cfg-sec-t">Nom du business</span><span className="chip brand sm">obligatoire</span></div>
            <input className="inp" value={biz.name} placeholder="ex. Néobanque Atlas" onChange={(e) => set({ name: e.target.value })} />
            <span className="hint" style={{ marginTop: 6 }}>Unique sur la plateforme ShareID.</span>
          </section>
          <div className="step-sep" style={{ margin: "22px 0" }} />
          <section className="cfg-sec">
            <div className="cfg-sec-h"><span className="cfg-sec-t">Couleurs de marque</span><span className="chip brand sm">obligatoire</span></div>
            <div className="brand-row">
              <div className="field" style={{ flex: 1 }}><span className="lab">Couleur primaire</span><ColorPicker value={biz.color} onPick={(c) => set({ color: c })} /></div>
              <div className="field" style={{ flex: 1 }}><span className="lab">Couleur secondaire</span><ColorPicker value={biz.colorSecondary} onPick={(c) => set({ colorSecondary: c })} /></div>
            </div>
          </section>
          <div className="step-sep" style={{ margin: "22px 0" }} />
          <section className="cfg-sec">
            <div className="cfg-sec-h"><span className="cfg-sec-t">Logo</span><span className="chip sm">optionnel</span></div>
            <button className="logo-drop" onClick={() => set({ logo: biz.logo ? null : "ds/logo-shareid.svg" })}>
              {biz.logo ? <img src={biz.logo} alt="" /> : <><Ico name="plus" size={16} sw={2} /><span>Importer un logo</span></>}
            </button>
            <span className="hint" style={{ marginTop: 8, display: "block" }}>PNG ou SVG · fond transparent · 256 px min. · 1 Mo max. Ces contraintes garantissent un rendu net partout (dashboard, SDK, e-mails).</span>
          </section>
          <div className="step-sep" style={{ margin: "22px 0" }} />
          <section className="cfg-sec">
            {/* §2 — co-branding : le logo/marque doit pouvoir s'afficher dans le SDK à la place de « ShareID ». */}
            <div className="tgl-row">
              <div className="tinfo"><div className="tt">Co-branding dans le SDK</div><div className="td">Afficher votre marque dans le parcours SDK à la place de « ShareID » (ex. un utilisateur Société Générale voit SG, pas ShareID).</div></div>
              <button className={"sw" + (biz.coBrandSdk ? " on" : "")} onClick={() => set({ coBrandSdk: !biz.coBrandSdk })} aria-label="Co-branding SDK" />
            </div>
          </section>
          <div className="step-sep" style={{ margin: "22px 0" }} />
          <section className="cfg-sec">
            <div className="cfg-sec-h"><span className="cfg-sec-t">Écran end-user</span><span className="chip sm">optionnel</span></div>
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

/* ----------------------------- Step 3 — Risque & opérateur ----------------------------- */
export function BizObjective({ biz, set, n, total }) {
  function toggle(id) {
    const has = biz.drivers.includes(id);
    if (has) set({ drivers: biz.drivers.filter((d) => d !== id) });
    else if (biz.drivers.length < 3) set({ drivers: [...biz.drivers, id] });
  }
  const fric = { none: "l1", low: "l1", subst: "l2", high: "l3" };
  return (
    <div className="body-inner step-anim">
      <BizHead n={n} total={total} title="Risque & opérateur" sub="Pourquoi ce client vérifie ses utilisateurs — pour vous recommander le bon parcours — et jusqu'où il peut aller en niveau de risque." />
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
        <span className="hint" style={{ marginTop: 10, display: "block" }}>Sert à recommander un parcours adapté lors de la création d'un workflow. Jamais bloquant.</span>
      </section>
      <div className="step-sep" />
      <section className="cfg-sec">
        <div className="cfg-sec-h"><span className="cfg-sec-t">Niveau de risque maximum</span></div>
        <div className="opts g2-doc" style={{ maxWidth: 680 }}>
          {RISK_KEYS.map((k) => {
            const sel = biz.riskMax === k;
            const desc = { none: "Extraction de données seule, sans vérification d'identité.", low: "Assurance légère, friction minimale.", subst: "Équilibre assurance / expérience.", high: "Assurance maximale — NFC + liveness." }[k];
            return (
              <button key={k} className={"opt col" + (sel ? " sel" : "")} onClick={() => set({ riskMax: k })} style={{ paddingTop: 16 }}>
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
          <div>C'est le <b>plafond</b> de consommation du business (logique de coût en jetons). Chaque workflow choisit librement son niveau dans cette limite — il n'y a pas de minimum imposé ici.</div>
        </div>
      </section>
      <div className="step-sep" />
      <section className="cfg-sec" style={{ maxWidth: 680 }}>
        {/* §1 — l'opérateur est un réglage business/global : un même compte opérateur peut consommer plusieurs clients. */}
        <div className="cfg-sec-h"><span className="cfg-sec-t">Vérification par opérateur</span></div>
        <div className="tgl-row">
          <div className="tinfo"><div className="tt">Revue humaine activée</div><div className="td">Autorise une revue par un opérateur humain. Réglé au niveau du business car un même compte opérateur peut traiter les requêtes de plusieurs clients. Le détail (systématique / sur seuil) se règle par workflow.</div></div>
          <button className={"sw" + (biz.operatorEnabled ? " on" : "")} onClick={() => set({ operatorEnabled: !biz.operatorEnabled })} aria-label="Opérateur" />
        </div>
      </section>
    </div>);
}

/* ----------------------------- Step 4 — Scope ----------------------------- */
export function BizScope({ biz, set, n, total }) {
  const [q, setQ] = React.useState("");
  // §4 — mode d'affectation des documents : uniforme (mêmes docs partout) ou affiné par pays.
  const perCountry = Object.keys(biz.docOverrides || {}).length > 0;
  const matches = q ? BIZ_COUNTRIES.filter((c) => c.toLowerCase().includes(q.toLowerCase()) && !biz.countries.includes(c)).slice(0, 6) : [];
  function add(c) { set({ countries: [...biz.countries, c] }); setQ(""); }
  function remove(c) {
    const ov = { ...biz.docOverrides }; delete ov[c];
    set({ countries: biz.countries.filter((x) => x !== c), docOverrides: ov });
  }
  function toggleDoc(id) {
    const has = biz.docTypes.includes(id);
    if (has && biz.docTypes.length > 1) set({ docTypes: biz.docTypes.filter((d) => d !== id) });
    else if (!has) set({ docTypes: [...biz.docTypes, id] });
  }
  function setMode(per) {
    if (per) set({ docOverrides: Object.fromEntries(biz.countries.map((c) => [c, biz.docOverrides[c] || biz.docTypes])) });
    else set({ docOverrides: {} });
  }
  function docsFor(c) { return biz.docOverrides[c] || biz.docTypes; }
  function toggleCountryDoc(c, id) {
    const cur = docsFor(c); const has = cur.includes(id);
    const next = has ? cur.filter((x) => x !== id) : [...cur, id];
    if (next.length === 0) return; // toujours au moins un document
    set({ docOverrides: { ...biz.docOverrides, [c]: next } });
  }
  return (
    <div className="body-inner step-anim">
      <BizHead n={n} total={total} title="Périmètre : pays & documents" sub="Les pays couverts et les documents acceptés — par pays si besoin. C'est le scope maximum du business ; ses workflows pourront le restreindre." />
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          <span className="cfg-sec-t">Documents acceptés</span>
          <div className="seg">
            <button className={!perCountry ? "on" : ""} onClick={() => setMode(false)}>Mêmes partout</button>
            <button className={perCountry ? "on" : ""} onClick={() => setMode(true)}>Affiner par pays</button>
          </div>
        </div>
        {!perCountry ? (
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
        ) : (
          <div className="doc-by-country">
            {biz.countries.map((c) => (
              <div className="dbc-row" key={c}>
                <span className="dbc-country"><span className="br-flag">{flagOf(c)}</span>{c}</span>
                <div className="dbc-docs">
                  {DOC_TYPES.map((d) => {
                    const on = docsFor(c).includes(d.id);
                    return <button key={d.id} className={"dbc-chip" + (on ? " on" : "")} onClick={() => toggleCountryDoc(c, d.id)}>{on && <Ico name="check" size={11} sw={3} />}{d.short}</button>;
                  })}
                </div>
              </div>))}
            <div className="note" style={{ marginTop: 14 }}><span className="ico"><Ico name="info" size={15} sw={1.9} /></span><div>Exemple : tous les documents en France, passeport seul pour le reste du monde. Chaque pays garde au moins un document.</div></div>
          </div>
        )}
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
          <div>Au-delà de cette durée, les requêtes sont <b>anonymisées</b> (RGPD) : assets et données personnelles purgés, seules les métadonnées de comptage sont conservées. Bornes : minimum 12 heures, maximum 60 jours.</div>
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
  function setContact(p) { set({ contacts: { ...biz.contacts, ...p } }); }
  const CONTACTS = [
    { k: "security", lab: "Cybersécurité", icon: "shieldAlert" },
    { k: "dpo", lab: "DPO / données personnelles", icon: "lock" },
    { k: "contract", lab: "Contrat / facturation", icon: "fileCheck" },
  ];
  return (
    <div className="body-inner step-anim">
      <BizHead n={n} total={total} title="Rôles & contacts" sub="L'owner (première personne inscrite) reçoit le magic-link et pourra ajouter d'autres agents ensuite. Renseignez aussi les contacts à joindre selon le sujet." />
      <section className="cfg-sec" style={{ maxWidth: 620 }}>
        <div className="cfg-sec-h"><span className="cfg-sec-t">Owner du business</span><span className="chip brand sm">obligatoire</span></div>
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
      <div className="step-sep" />
      {/* §6 — contacts & escalade : qui joindre selon le sujet + mails automatiques. */}
      <section className="cfg-sec" style={{ maxWidth: 620 }}>
        <div className="cfg-sec-h"><span className="cfg-sec-t">Contacts & escalade</span><span className="chip sm">optionnel</span></div>
        {CONTACTS.map((c) =>
          <div className="contact-row" key={c.k}>
            <span className="contact-ico"><Ico name={c.icon} size={15} /></span>
            <span className="contact-lab">{c.lab}</span>
            <input className="inp sm" value={biz.contacts[c.k]} placeholder="email@entreprise.com" onChange={(e) => setContact({ [c.k]: e.target.value })} />
          </div>)}
        <div className="contact-row">
          <span className="contact-ico"><Ico name="arrow" size={15} /></span>
          <span className="contact-lab">Contact d'escalade<span className="hint" style={{ display: "block", fontWeight: 400 }}>si pas de réponse</span></span>
          <input className="inp sm" value={biz.contacts.escalation} placeholder="email@entreprise.com" onChange={(e) => setContact({ escalation: e.target.value })} />
        </div>
        <div className="tgl-row" style={{ marginTop: 14 }}>
          <div className="tinfo"><div className="tt">Mails automatiques</div><div className="td">Notifications de mise à jour de la politique de confidentialité, PRA/BCP et autres communications réglementaires.</div></div>
          <button className={"sw" + (biz.autoMails ? " on" : "")} onClick={() => set({ autoMails: !biz.autoMails })} aria-label="Mails automatiques" />
        </div>
      </section>
    </div>);
}

/* ----------------------------- Conditional step (stub) ----------------------------- */
export function BizCond({ biz, set, n, total }) {
  const map = {
    retailer: { title: "Hiérarchie retailer", sub: "Configuration du retailer et des entités qu'il revend.", icon: "layers" },
    group: { title: "Groupe", sub: "Configuration du groupe, de ses entités et de la vue consolidée.", icon: "globe" },
  }[biz.type] || { title: "Spécifique", sub: "", icon: "info" };
  return (
    <div className="body-inner step-anim">
      <BizHead n={n} total={total} title={map.title} sub={map.sub} />
      <section className="cfg-sec" style={{ maxWidth: 560 }}>
        <div className="stub-card">
          <span className="ico-tile" style={{ width: 44, height: 44 }}><Ico name={map.icon} size={22} /></span>
          <div><div className="ot" style={{ fontSize: 15 }}>Étape à itérer</div><div className="od" style={{ marginTop: 4 }}>Le tooling complet {map.title} (entités, hiérarchie, {biz.type === "group" ? "vue consolidée" : "refacturation"}) sera spécifié dans une itération dédiée. En V1 ces business sont configurés par un Admin ShareID.</div></div>
        </div>
      </section>
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
  const { role } = useSession();
  const canSetTokenCost = can(role, "configureTokenCost"); // ShareID Admin only
  const pkg = pkgOf(biz.pkg);
  const annual = biz.billingMode !== "payg";
  return (
    <div className="body-inner wide step-anim">
      <BizHead n={n} total={total} title="Facturation" sub="Un jeton = une vérification, identique pour tous. Choisissez le mode de facturation ; le coût du jeton est paramétrable selon le setup." />
      {/* Le COÛT du jeton (tarif par setup) n'est modifiable que par un ShareID Admin. */}
      <div className={"note" + (canSetTokenCost ? "" : " warn")} style={{ maxWidth: 760, marginBottom: 4 }}>
        <span className="ico"><Ico name={canSetTokenCost ? "key" : "lock"} size={15} sw={1.9} /></span>
        <div>{canSetTokenCost
          ? "En tant que ShareID Admin, vous pouvez ajuster le coût unitaire du jeton pour ce setup. Les autres rôles le voient en lecture seule."
          : "Le coût unitaire du jeton est défini par ShareID et affiché en lecture seule. Seul un ShareID Admin peut le modifier."}</div>
      </div>
      {/* §7 — deux modes réels : package annuel ou pay-as-you-go. Plus d'offre mensuelle. */}
      <div className="bill-modes">
        <button className={"bill-mode" + (annual ? " sel" : "")} onClick={() => set({ billingMode: "annual" })}>
          <div className="bm-h"><span className="ot">Package de jetons annuel</span><span className={"mark sq" + (annual ? "" : "")} style={annual ? { borderColor: "var(--color-main)", background: "var(--color-main)" } : null}><Ico name="check" size={12} sw={3} style={{ opacity: annual ? 1 : 0 }} /></span></div>
          <div className="od">Licence + enveloppe annuelle de jetons à tarif dégressif. Report en année 1, upgrade fluide avec avoir.</div>
        </button>
        <button className={"bill-mode" + (!annual ? " sel" : "")} onClick={() => set({ billingMode: "payg" })}>
          <div className="bm-h"><span className="ot">Pay-as-you-go</span><span className="mark sq" style={!annual ? { borderColor: "var(--color-main)", background: "var(--color-main)" } : null}><Ico name="check" size={12} sw={3} style={{ opacity: !annual ? 1 : 0 }} /></span></div>
          <div className="od">Petit droit d'entrée + accès dashboard réduit + 0 jeton inclus. Paiement à l'usage, par requête. Idéal petites structures.</div>
        </button>
      </div>

      {annual ? (
        <React.Fragment>
          <section className="cfg-sec" style={{ marginTop: 22 }}>
            <div className="cfg-sec-h"><span className="cfg-sec-t">Enveloppe annuelle</span></div>
            <div className="pkg-grid">
              {TOKEN_PKGS.map((p) => {
                const sel = biz.pkg === p.id;
                return (
                  <button key={p.id} className={"pkg-card" + (sel ? " sel" : "")} onClick={() => set({ pkg: p.id })}>
                    <span className="pkg-t">{p.t}</span>
                    <span className="pkg-tok">{fmt(p.tokens)}<small> jetons/an</small></span>
                    <span className="pkg-price">{p.price.toFixed(2).replace(".", ",")} € <small>/ jeton</small></span>
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
            <div className="tinfo"><div className="tt">Alerte à 80 %</div><div className="td">Email à l'owner + Sales à 80 % de l'enveloppe. L'alerte 100 % est systématique. Jamais bloquant en live.</div></div>
            <button className={"sw" + (biz.alert80 ? " on" : "")} onClick={() => set({ alert80: !biz.alert80 })} aria-label="Alerte 80%" />
          </div>
        </React.Fragment>
      ) : (
        <section className="cfg-sec" style={{ marginTop: 22, maxWidth: 680 }}>
          <div className="payg-card">
            <div className="payg-line"><span>Droit d'entrée</span><b>petit forfait fixe</b></div>
            <div className="payg-line"><span>Accès dashboard</span><b>réduit</b></div>
            <div className="payg-line"><span>Jetons inclus</span><b>0</b></div>
            <div className="payg-line"><span>Facturation</span><b>à l'usage, par requête</b></div>
          </div>
          <div className="note" style={{ marginTop: 14 }}><span className="ico"><Ico name="info" size={15} sw={1.9} /></span><div>Même jeton que le package annuel — seul le <b>coût unitaire</b> change.</div></div>
          {/* §19 — self-onboarding : déclenché par défaut quand le paiement n'est pas en tokens. */}
          <div className="tgl-row" style={{ marginTop: 14 }}>
            <div className="tinfo"><div className="tt">Self-onboarding</div><div className="td">Le client final porte lui-même son parcours (phone onboarding) — pas d'enregistrement par un agent. Activé par défaut pour les petites structures en pay-as-you-go.</div></div>
            <button className={"sw" + ((biz.selfOnboarding || biz.billingMode === "payg") ? " on" : "")} onClick={() => set({ selfOnboarding: !biz.selfOnboarding })} aria-label="Self-onboarding" />
          </div>
        </section>
      )}
    </div>);
}

/* ----------------------------- Step 8 — Récapitulatif ----------------------------- */
export function BizReview({ biz, n, total }) {
  const bt = BIZ_TYPES.find((t) => t.id === biz.type);
  const perCountry = Object.keys(biz.docOverrides || {}).length > 0;
  const docSummary = perCountry
    ? "Par pays · " + biz.countries.length + " règle" + (biz.countries.length > 1 ? "s" : "")
    : biz.docTypes.map((d) => DOC_TYPES.find((x) => x.id === d).short).join(", ");
  const billing = biz.billingMode === "payg"
    ? "Pay-as-you-go · à l'usage"
    : "Package " + pkgOf(biz.pkg).t + " · " + fmt(pkgOf(biz.pkg).tokens) + " jetons/an · " + eur(pkgOf(biz.pkg).envelope);
  const colorSwatch = (c) => <span style={{ width: 13, height: 13, borderRadius: 4, background: c, display: "inline-block" }} />;
  const rows = [
    ["Type", <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>{bt.t}{biz.isPilot && <span className="chip brand sm">Pilote</span>}</span>],
    ["Nom", biz.name || "—"],
    ["Couleurs", <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>{colorSwatch(biz.color)}{colorSwatch(biz.colorSecondary)}<span className="hint" style={{ fontWeight: 400 }}>primaire · secondaire</span></span>],
    ["Co-branding SDK", biz.coBrandSdk ? "Activé" : "Désactivé"],
    ["Objectifs", biz.drivers.length ? biz.drivers.map((d) => BIZ_DRIVERS.find((x) => x.id === d).t).join(", ") : "—"],
    ["Niveau de risque max.", LEVELS[biz.riskMax].name],
    ["Opérateur", biz.operatorEnabled ? "Activé" : "Désactivé"],
    ["Pays", biz.countries.length + " (" + biz.countries.slice(0, 3).join(", ") + (biz.countries.length > 3 ? "…" : "") + ")"],
    ["Documents", docSummary],
    ["Rétention", retLabel(biz.retentionH)],
    ["Owner", biz.owner.name ? biz.owner.name + " · " + biz.owner.email : "—"],
    ["Agents", biz.agents.length],
    ["Facturation", billing],
  ];
  return (
    <div className="body-inner step-anim">
      <BizHead n={n} total={total} title="Récapitulatif & création" sub="Vérifiez la configuration. À la création, l'owner reçoit un e-mail, s'inscrit, arrive sur son dashboard et est invité à lancer son premier workflow." />
      <div className="biz-review-split">
        <div className="recap" style={{ flex: 1, marginTop: 0 }}>
          <div className="recap-h">Configuration du business</div>
          {rows.map((r, i) => <div className="recap-row" key={i}><span className="rk">{r[0]}</span><span className="rv">{r[1]}</span></div>)}
        </div>
        <div className="biz-preview-col"><div className="biz-preview-label">Aperçu end-user</div><EndUserPreview biz={biz} scale={0.9} /></div>
      </div>
    </div>);
}
