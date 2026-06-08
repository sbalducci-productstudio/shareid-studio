/* ShareID Studio — app shell : état, navigation multi-sections, rail+meter, modales, persistance.
   Note : le « Tweaks panel » du prototype était un outil du canvas Claude Design — retiré ici,
   on applique simplement le thème par défaut (voir THEME). */
import React from "react";
import {
  Ico, STEPS, DEFAULT_CFG, LEVELS, LEVEL_KEYS, ZONES, BUSINESS_MAX_COUNTRIES,
  CAPTURE_METHODS, captureLabel, achievedLevel, coherence, effTarget, EidasTag,
} from "./core.jsx";
import { DashRail, Home, StepConfig, StepType, StepDocument, StepFace } from "./steps1.jsx";
import {
  StepReauth, StepSignature, StepScope, StepAdvanced, StepResult, StepPreview, StepIntegration, newSession,
} from "./steps2.jsx";
import { ConsoleHome, ConsoleStats } from "./console.jsx";
import { RequestsHistory, OperatorQueue } from "./requests.jsx";
import { ManageUsers, ProductDemo } from "./admin.jsx";
import { BizList, BizWizard, BizEdit } from "./biz.jsx";
import { DEFAULT_BIZ } from "./biz-steps.jsx";
import { canAccessSection, can } from "./access.js";
import { useSession } from "./session.jsx";

const LS_KEY = "shareid_studio_v1";

/* Thème par défaut (anciennement piloté par le Tweaks panel du canvas Claude Design). */
const THEME = { accent: "#3253D1", density: "confort", cards: "epure" };
function Meter({ cfg }) {
  const target = effTarget(cfg);
  const inherited = !cfg.eidasTarget;
  return (
    <div className="meter">
      <div className="meter-h">
        <div className="meter-title">
          <span className="t">Niveau de risque visé</span>
          <span className="meter-src">{inherited ? "Cible héritée · config business" : "Cible définie · ce workflow"}</span>
        </div>
      </div>
      <div className="bands">
        {LEVEL_KEYS.map((k) =>
        <div key={k} className={"band" + (k === target ? " target filled" : "")}>
            <span className="lv">{LEVELS[k].name}</span>{k === target && <span className="flag">{inherited ? "hérité" : "cible"}</span>}
          </div>
        )}
      </div>
    </div>);

}

function Rail({ cfg, currentKey, visibleKeys, onJump, onExit }) {
  const curIdx = visibleKeys.indexOf(currentKey);
  const visSteps = STEPS.filter((s) => !s.cond || s.cond(cfg));
  return (
    <aside className="rail">
      <div className="rail-brand">
        <img src={import.meta.env.BASE_URL + "ds/logo-shareid.svg"} alt="ShareID" /><span className="crumb">Studio</span>
        <button className="rail-back" onClick={onExit} title="Quitter"><Ico name="back" size={16} /></button>
      </div>
      <div className="steplist">
        {visSteps.map((s, i) => {
          const done = i < curIdx,active = i === curIdx;
          const cls = "step" + (done ? " done clickable" : "") + (active ? " active" : "");
          return (
            <button key={s.key} className={cls} disabled={!done} onClick={() => done && onJump(s.key)}>
              <span className="idx">{done ? <Ico name="check" size={12} sw={3} /> : i + 1}</span>
              <span className="nm">{s.nm}</span>
            </button>);

        })}
      </div>
      <Meter cfg={cfg} />
    </aside>);

}

function Shell({ section, count, onNav, children }) {
  return (
    <div className="app">
      <div className="dash">
        <DashRail active={section} count={count} onNav={onNav} />
        <div className="dash-main">{children}</div>
      </div>
    </div>);
}

function Placeholder({ section }) {
  const meta = {
    users: { icon: "users", t: "Utilisateurs", d: "Gestion des utilisateurs du business : rôles, invitations, magic-links et logs de connexion." },
    business: { icon: "building", t: "Entreprise", d: "Paramètres de l'organisation et de la hiérarchie business." },
    settings: { icon: "settings", t: "Paramètres", d: "Préférences du Studio, clés API et intégrations." },
  }[section] || { icon: "info", t: "Bientôt", d: "" };
  return (
    <React.Fragment>
      <div className="dash-topbar"><div className="dt-head"><div className="eyebrow">Admin</div><h1>{meta.t}</h1></div></div>
      <div className="dash-body">
        <div className="dash-empty">
          <div className="biz-empty-ico"><Ico name={meta.icon} size={26} /></div>
          <h2>{meta.t}</h2>
          <p className="biz-empty-sub">{meta.d}</p>
          <span className="chip" style={{ marginTop: 18 }}>À venir dans une prochaine itération</span>
        </div>
      </div>
    </React.Fragment>);
}

/* Section access order — used to pick a safe landing section for the active
   role (e.g. after switching org). Mirrors the rail order. */
const SECTION_ORDER = ["home", "stats", "requests", "operator", "demo", "wf_builder", "biz_setup", "users", "business", "settings"];
function firstAllowedSection(role) {
  return SECTION_ORDER.find((s) => canAccessSection(role, s)) || "settings";
}

/* Route-guard equivalent: shown when the active role may not reach a section.
   The rail already hides it; this is the second layer so a stale section id or
   a direct state cannot leak a forbidden view. */
function Denied({ role }) {
  return (
    <React.Fragment>
      <div className="dash-topbar"><div className="dt-head"><div className="eyebrow">Accès</div><h1>Accès refusé</h1></div></div>
      <div className="dash-body">
        <div className="dash-empty">
          <div className="biz-empty-ico"><Ico name="lock" size={26} /></div>
          <h2>Cette section n'est pas accessible</h2>
          <p className="biz-empty-sub">Votre rôle actuel ne dispose pas des droits requis pour cette section. Changez d'organisation depuis le menu du compte si vous y avez accès sous un autre rôle.</p>
        </div>
      </div>
    </React.Fragment>);
}

function App() {
  const { useState, useEffect } = React;
  const { role } = useSession();
  const saved = (() => {try {return JSON.parse(localStorage.getItem(LS_KEY)) || {};} catch (e) {return {};}})();
  const [section, setSection] = useState(saved.section || "wf_builder"); // nav id
  const [view, setView] = useState(saved.view || "home"); // wf_builder: home | wizard | done
  const [cfg, setCfg] = useState(saved.cfg || { ...DEFAULT_CFG });
  const [currentKey, setCurrentKey] = useState(saved.currentKey || "config");
  const [workflows, setWorkflows] = useState(saved.workflows || []);
  const [businesses, setBusinesses] = useState(saved.businesses || []);
  const [bizView, setBizView] = useState("list"); // list | wizard | edit
  const [bizDraft, setBizDraft] = useState(() => ({ ...DEFAULT_BIZ }));
  const [bizEditIdx, setBizEditIdx] = useState(-1);
  const [liveModal, setLiveModal] = useState(false);
  const [qrWf, setQrWf] = useState(null); // workflow object shown in QR modal
  const [qrSession, setQrSession] = useState("");
  function openQr(w) {setQrSession(newSession());setQrWf(w);}
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--color-main", THEME.accent);
    r.setAttribute("data-density", THEME.density);
    r.setAttribute("data-cards", THEME.cards);
  }, []);

  useEffect(() => {
    try {localStorage.setItem(LS_KEY, JSON.stringify({ section, view, cfg, currentKey, workflows, businesses }));} catch (e) {}
  }, [section, view, cfg, currentKey, workflows, businesses]);

  /* When the active role changes (org switch) and the current section is no
     longer permitted, land on the first section this role can access. */
  useEffect(() => {
    if (!canAccessSection(role, section)) setSection(firstAllowedSection(role));
  }, [role, section]);

  function navTo(id) {
    setSection(id);
    if (id === "biz_setup") setBizView("list");
    if (id === "wf_builder") setView("home");
  }

  /* business setup handlers */
  function bizStartNew() { setBizDraft({ ...DEFAULT_BIZ }); setBizView("wizard"); }
  function bizOpen(i) { setBizEditIdx(i); setBizView("edit"); }
  function bizFinish() {
    setBusinesses((b) => [...b, { ...bizDraft, name: bizDraft.name || "Business sans nom", conso: 0, modified: "à l'instant" }]);
    setBizView("list");
  }
  function bizSave(updated) {
    setBusinesses((b) => b.map((x, i) => i === bizEditIdx ? { ...updated, modified: "à l'instant" } : x));
    setBizView("list");
  }

  const set = (patch) => setCfg((c) => ({ ...c, ...patch }));
  const visibleKeys = STEPS.filter((s) => !s.cond || s.cond(cfg)).map((s) => s.key);
  const curIdx = visibleKeys.indexOf(currentKey);

  function startNew() {setCfg({ ...DEFAULT_CFG });setCurrentKey("config");setView("wizard");}
  function exitToHome() {setView("home");}
  /* §21 — l'édition repart de l'Aperçu (recap propre) plutôt que de la checklist d'intégration. */
  function openWorkflow(i) {const w = workflows[i];if (!w) return;setCfg({ ...DEFAULT_CFG, ...w });setCurrentKey("preview");setView("wizard");}

  /* per-step validity + footer */
  const total = (() => {const z = cfg.zones.reduce((s, zz) => s + (ZONES.find((Z) => Z.id === zz)?.n || 0), 0);return Math.min(BUSINESS_MAX_COUNTRIES, z + cfg.countries.length);})();
  const canNext = {
    config: cfg.name.trim().length > 0 && cfg.drivers.length >= 1,
    type: cfg.verifType !== "authentication" || !!cfg.authSource,
    document: !!cfg.docPrimary, face: !!cfg.faceLevel, reauth: true, signature: true,
    scope: cfg.scopeSource === "inherited" || total > 0, advanced: true, result: true, preview: true, integration: true
  }[currentKey];

  const ctaLabel = { result: "Aperçu", preview: "Continuer vers l'intégration", integration: "Valider & générer le pack" }[currentKey] || "Continuer";

  function goNext() {
    if (currentKey === "integration") {finalize();return;}
    const next = visibleKeys[curIdx + 1];
    if (next) setCurrentKey(next);
  }
  function goBack() {
    if (curIdx <= 0) {exitToHome();return;}
    setCurrentKey(visibleKeys[curIdx - 1]);
  }
  function finalize() {
    setWorkflows((w) => [...w, { ...cfg, name: cfg.name || "Workflow sans titre" }]);
    setView("done");
  }
  /* Toggle Test↔Live is gated to roles that may do it (access model). */
  function requestLive() {if (can(role, "toggleLive")) setLiveModal(true);}
  function confirmLive() {set({ mode: "live" });setLiveModal(false);}

  const ach = achievedLevel(cfg);
  const cohObj = coherence(ach, effTarget(cfg));
  const sNum = curIdx + 1,sTot = visibleKeys.length;

  /* footer summary per step */
  const usesNfc = cfg.docPrimary === "nfc" || cfg.docSecondary === "nfc";
  function footerSummary() {
    switch (currentKey) {
      case "config":return <EidasTag levelKey={effTarget(cfg)} prefix={cfg.eidasTarget ? "Cible" : "Cible héritée"} />;
      case "type":{const m = { onboarding: "Onboarding", authentication: "Authentification", extraction: "Extraction de données" }[cfg.verifType];return <span className="chip brand sm" style={{ fontSize: 11 }}>{m}</span>;}
      case "document":case "face":case "result":case "preview":
        return cfg.verifType === "extraction" ? <span className="chip sm" style={{ fontSize: 11 }}>Extraction · sans niveau de risque</span> :
          ach ? <React.Fragment><EidasTag levelKey={ach} prefix="Atteint" />{cohObj && <span className={"coh " + cohObj.cls}>{cohObj.label}</span>}</React.Fragment> : <span className="hint">Choisissez une méthode</span>;
      case "reauth":{const n = cfg.reauthOrder.filter((id) => cfg.reauthOn[id]).length;return <span className="chip brand sm" style={{ fontSize: 11 }}>{n + " méthode" + (n > 1 ? "s" : "") + " active" + (n > 1 ? "s" : "")}</span>;}
      case "signature":return <span className="chip sm" style={{ fontSize: 11 }}>{cfg.signature === "qes" ? "QES · " : "AES · "}{cfg.sigContact === "email" ? "email" : "téléphone"}</span>;
      case "scope":return <span className="chip sm" style={{ fontSize: 11 }}>{cfg.scopeSource === "inherited" ? "Hérité du business" : total + " pays · " + cfg.docTypes.length + " documents"}</span>;
      case "advanced":return <span className="chip sm" style={{ fontSize: 11 }}>{cfg.operatorReview ? "Avec opérateur" : "Sans opérateur"}{usesNfc ? " · " + cfg.nfcRetry + " essais NFC" : ""}</span>;
      case "integration":return <span className={"mode-pill " + cfg.mode} style={{ fontSize: 11, margin: 0 }}><span className="d" />{cfg.mode === "live" ? "Live · facturé" : "Test · non facturé"}</span>;
      default:return null;
    }
  }

  function renderStep() {
    const p = { cfg, set, stepNum: sNum, stepTotal: sTot };
    switch (currentKey) {
      case "config":return <StepConfig {...p} />;
      case "type":return <StepType {...p} />;
      case "document":return <StepDocument {...p} />;
      case "face":return <StepFace {...p} />;
      case "reauth":return <StepReauth {...p} />;
      case "signature":return <StepSignature {...p} />;
      case "scope":return <StepScope {...p} />;
      case "advanced":return <StepAdvanced {...p} />;
      case "result":return <StepResult {...p} />;
      case "preview":return <StepPreview {...p} />;
      case "integration":return <StepIntegration {...p} requestLive={requestLive} />;
      default:return null;
    }
  }

  const qrModal = qrWf &&
  <div className="scrim" onClick={() => setQrWf(null)}>
      <div className="modal qr-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={() => setQrWf(null)} aria-label="Fermer"><Ico name="x" size={16} sw={2.2} /></button>
        <div className="qr-modal-head">
          <span className={"mode-pill " + (qrWf.mode || "test")} style={{ margin: 0, fontSize: 11 }}><span className="d" />{qrWf.mode === "live" ? "Live" : "Test"}</span>
          <h3>{qrWf.name || "Workflow"}</h3>
          <p>Scannez avec l'app ShareID pour lancer un onboarding réel sur votre téléphone.</p>
        </div>
        <div className="qr-modal-code"><div className="qr" style={{ width: 180, height: 180 }} /></div>
        <div className="qr-modal-meta">Session <b>{qrSession}</b> · valable pour un onboarding</div>
        <div className="qr-modal-actions">
          <button className="sid-btn ghost" onClick={() => setQrSession(newSession())}><Ico name="refresh" size={14} sw={2} />Rafraîchir</button>
          <button className="sid-btn primary" onClick={() => {const idx = workflows.indexOf(qrWf);setQrWf(null);if (idx >= 0) openWorkflow(idx);}}>Ouvrir l'intégration</button>
        </div>
      </div>
    </div>;


  /* Hard guard: if the active role cannot reach this section, render the denied
     state (the redirect effect will move to a safe section on the next tick). */
  if (!canAccessSection(role, section)) {
    return <Shell section={section} count={workflows.length} onNav={navTo}><Denied role={role} /></Shell>;
  }

  if (section === "wf_builder" && view === "home") return <React.Fragment><Home workflows={workflows} onStart={startNew} onOpen={openWorkflow} onQr={openQr} onNav={navTo} />{qrModal}</React.Fragment>;

  /* business setup section */
  if (section === "biz_setup") {
    if (bizView === "wizard") return <React.Fragment><BizWizard draft={bizDraft} setDraft={setBizDraft} onFinish={bizFinish} onExit={() => setBizView("list")} /></React.Fragment>;
    return <React.Fragment><Shell section={section} count={workflows.length} onNav={navTo}>
      {bizView === "edit" && businesses[bizEditIdx] ?
        <BizEdit biz={businesses[bizEditIdx]} onSave={bizSave} onBack={() => setBizView("list")} /> :
        <BizList businesses={businesses} onCreate={bizStartNew} onOpen={bizOpen} />}
    </Shell></React.Fragment>;
  }

  /* console + admin sections (rendered inside the shell) */
  if (section !== "wf_builder") {
    const Console = { home: ConsoleHome, stats: ConsoleStats, requests: RequestsHistory, operator: OperatorQueue, demo: ProductDemo, users: ManageUsers }[section];
    return <React.Fragment><Shell section={section} count={workflows.length} onNav={navTo}>
      {Console ? <Console onNav={navTo} /> : <Placeholder section={section} />}
    </Shell></React.Fragment>;
  }

  if (view === "done") {
    return (
      <React.Fragment>
      <div className="done-screen">
        <div className="done-ico"><Ico name="check" size={30} sw={2.4} /></div>
        <h2>Workflow {cfg.mode === "live" ? "activé en live" : "prêt à tester"}</h2>
        <p>{cfg.name || "Votre workflow"} est configuré. {cfg.mode === "live" ? "La facturation a démarré pour ce business." : "Scannez le QR avec l'app ShareID pour lancer un onboarding réel."}</p>
        <div className="done-qr"><div className="qr" /><div className="hint" style={{ maxWidth: 210, textAlign: "left" }}><b style={{ color: "var(--ink)" }}>QR de test prêt</b><br />Scannez avec l'app ShareID — valable pour un onboarding. Régénérable depuis l'intégration.</div></div>
        <div className="summary-card">
          <div className="sr"><span className="sk">Type</span><span className="sv">{{ onboarding: "Onboarding (IDV)", authentication: "Authentification", extraction: "Extraction de données" }[cfg.verifType]}</span></div>
          <div className="sr"><span className="sk">Document</span><span className="sv">{captureLabel(cfg.docPrimary)}</span></div>
          <div className="sr"><span className="sk">Niveau de risque atteint</span><span className="sv">{cfg.verifType === "extraction" ? "—" : (ach ? LEVELS[ach].name : "—")}{cohObj && cohObj.cls === "eq" ? " · cible" : ""}</span></div>
          <div className="sr"><span className="sk">Mode</span><span className="sv">{cfg.mode === "live" ? "Live" : "Test"}</span></div>
        </div>
        <div className="done-actions">
          <button className="sid-btn outline" onClick={() => {setCurrentKey("integration");setView("wizard");}}>Revoir l'intégration</button>
          <button className="sid-btn primary" onClick={exitToHome}>Retour au studio</button>
        </div>
      </div>
      
      </React.Fragment>);

  }

  /* wizard */
  return (
    <React.Fragment>
    <div className="app">
      <div className="wiz">
        <Rail cfg={cfg} currentKey={currentKey} visibleKeys={visibleKeys} onJump={setCurrentKey} onExit={exitToHome} />
        <div className="main">
          <div className="topbar">
            <span className="wf"><span className="muted">{cfg.name ? "Workflow · " : "Nouveau workflow · "}</span>{cfg.name || "sans titre"}</span>
            <span className={"mode-pill " + cfg.mode}><span className="d" />{cfg.mode === "live" ? "Live" : "Test"}</span>
          </div>
          <div className="body">{renderStep()}</div>
          <div className="footer">
            <button className="sid-btn ghost" onClick={goBack}><Ico name="chevL" size={15} sw={2} />{curIdx <= 0 ? "Quitter" : "Retour"}</button>
            <div className="spacer" />
            <div className="summ">{footerSummary()}</div>
            <button className="sid-btn primary" disabled={!canNext} onClick={goNext}>{ctaLabel}{currentKey !== "integration" && <Ico name="arrow" size={15} sw={2} />}</button>
          </div>
        </div>
      </div>

      {liveModal &&
        <div className="scrim" onClick={() => setLiveModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="mi live"><Ico name="zap" size={22} fill /></div>
            <h3>Passer ce workflow en Live ?</h3>
            <p>La facturation démarre pour ce business et le mode live est activé. Vos requêtes de test restent séparées.</p>
            <div className="mlist">
              <div><Ico name="check" size={15} sw={2.2} />La facturation démarre pour votre entreprise</div>
              <div><Ico name="check" size={15} sw={2.2} />Le business passe en live (premier workflow live)</div>
              <div><Ico name="check" size={15} sw={2.2} />Les requêtes de test restent isolées</div>
            </div>
            <div className="mactions">
              <button className="sid-btn ghost" onClick={() => setLiveModal(false)}>Annuler</button>
              <button className="sid-btn primary" onClick={confirmLive}>Activer le live</button>
            </div>
          </div>
        </div>
        }
    </div>
    
    </React.Fragment>);

}

export default App;
