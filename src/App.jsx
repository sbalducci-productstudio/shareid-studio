/* ShareID Studio — app shell: state, nav, rail+meter, footer, modal, persistence.
   Note : le « Tweaks panel » du prototype était un outil du canvas Claude Design
   (protocole postMessage vers l'hôte) — il n'a pas de rôle dans l'app réelle.
   On applique simplement le thème par défaut (accent / densité / style de cartes). */
import React from "react";
import {
  Ico, STEPS, DEFAULT_CFG, LEVELS, LEVEL_KEYS, ZONES, BUSINESS_MAX_COUNTRIES,
  DOC_METHODS, achievedLevel, coherence, effTarget, EidasTag,
} from "./core.jsx";
import { Home, StepConfig, StepType, StepDocument, StepFace } from "./steps1.jsx";
import {
  StepReauth, StepScope, StepAdvanced, StepPreview, StepIntegration, newSession,
} from "./steps2.jsx";

const LS_KEY = "shareid_studio_v1";

/* Thème par défaut (anciennement piloté par le Tweaks panel du canvas) */
const THEME = { accent: "#3253D1", density: "confort", cards: "epure" };

function Meter({ cfg }) {
  const target = effTarget(cfg);
  const inherited = !cfg.eidasTarget;
  return (
    <div className="meter">
      <div className="meter-h">
        <div className="meter-title">
          <span className="t">Niveau eIDAS visé</span>
          <span className="meter-src">{inherited ? "Cible héritée · config business" : "Cible définie · ce workflow"}</span>
        </div>
      </div>
      <div className="bands">
        {LEVEL_KEYS.map((k) => (
          <div key={k} className={"band" + (k === target ? " target filled" : "")}>
            <span className="lv">{LEVELS[k].name}</span>{k === target && <span className="flag">{inherited ? "hérité" : "cible"}</span>}
          </div>
        ))}
      </div>
    </div>
  );
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
          const done = i < curIdx, active = i === curIdx;
          const cls = "step" + (done ? " done clickable" : "") + (active ? " active" : "");
          return (
            <button key={s.key} className={cls} disabled={!done} onClick={() => done && onJump(s.key)}>
              <span className="idx">{done ? <Ico name="check" size={12} sw={3} /> : i + 1}</span>
              <span className="nm">{s.nm}</span>
            </button>
          );
        })}
      </div>
      <Meter cfg={cfg} />
    </aside>
  );
}

function App() {
  const { useState, useEffect } = React;
  const saved = (() => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) { return {}; } })();
  const [view, setView] = useState(saved.view || "home");        // home | wizard | done
  const [cfg, setCfg] = useState(saved.cfg || { ...DEFAULT_CFG });
  const [currentKey, setCurrentKey] = useState(saved.currentKey || "config");
  const [workflows, setWorkflows] = useState(saved.workflows || []);
  const [liveModal, setLiveModal] = useState(false);
  const [qrWf, setQrWf] = useState(null);   // workflow object shown in QR modal
  const [qrSession, setQrSession] = useState("");
  function openQr(w) { setQrSession(newSession()); setQrWf(w); }

  // Applique le thème par défaut une fois au montage.
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--color-main", THEME.accent);
    r.setAttribute("data-density", THEME.density);
    r.setAttribute("data-cards", THEME.cards);
  }, []);

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ view, cfg, currentKey, workflows })); } catch (e) {}
  }, [view, cfg, currentKey, workflows]);

  const set = (patch) => setCfg((c) => ({ ...c, ...patch }));
  const visibleKeys = STEPS.filter((s) => !s.cond || s.cond(cfg)).map((s) => s.key);
  const curIdx = visibleKeys.indexOf(currentKey);

  function startNew() { setCfg({ ...DEFAULT_CFG }); setCurrentKey("config"); setView("wizard"); }
  function exitToHome() { setView("home"); }
  function openWorkflow(i) { const w = workflows[i]; if (!w) return; setCfg({ ...DEFAULT_CFG, ...w }); setCurrentKey("integration"); setView("wizard"); }

  /* per-step validity + footer */
  const total = (() => { const z = cfg.zones.reduce((s, zz) => s + (ZONES.find((Z) => Z.id === zz)?.n || 0), 0); return Math.min(BUSINESS_MAX_COUNTRIES, z + cfg.countries.length); })();
  const canNext = {
    config: cfg.name.trim().length > 0 && cfg.drivers.length >= 1,
    type: true, document: !!cfg.docMethod, face: !!cfg.faceLevel, reauth: true,
    scope: cfg.scopeSource === "inherited" || total > 0, advanced: true, preview: true, integration: true,
  }[currentKey];

  const ctaLabel = { advanced: "Aperçu", preview: "Continuer vers l'intégration", integration: "Valider & générer le pack" }[currentKey] || "Continuer";

  function goNext() {
    if (currentKey === "integration") { finalize(); return; }
    const next = visibleKeys[curIdx + 1];
    if (next) setCurrentKey(next);
  }
  function goBack() {
    if (curIdx <= 0) { exitToHome(); return; }
    setCurrentKey(visibleKeys[curIdx - 1]);
  }
  function finalize() {
    setWorkflows((w) => [...w, { ...cfg, name: cfg.name || "Workflow sans titre" }]);
    setView("done");
  }
  function requestLive() { setLiveModal(true); }
  function confirmLive() { set({ mode: "live" }); setLiveModal(false); }

  const ach = achievedLevel(cfg);
  const cohObj = coherence(ach, effTarget(cfg));
  const sNum = curIdx + 1, sTot = visibleKeys.length;

  /* footer summary per step */
  function footerSummary() {
    switch (currentKey) {
      case "config": return <span className="eidas-tag subst">{cfg.eidasTarget ? "Cible · " : "Cible héritée · "}{LEVELS[effTarget(cfg)].name}</span>;
      case "type": return cfg.authentication ? <span className="chip brand sm" style={{ fontSize: 11 }}>+ Réauthentification débloquée</span> : <span className="hint">Onboarding seul</span>;
      case "document": case "face": case "preview":
        return ach ? <React.Fragment><EidasTag levelKey={ach} prefix="Atteint" />{cohObj && <span className={"coh " + cohObj.cls}>{cohObj.label}</span>}</React.Fragment> : <span className="hint">Choisissez une méthode</span>;
      case "reauth": { const n = cfg.reauthOrder.filter((id) => cfg.reauthOn[id]).length; return <span className="chip brand sm" style={{ fontSize: 11 }}>{n + " méthode" + (n > 1 ? "s" : "") + " active" + (n > 1 ? "s" : "")}</span>; }
      case "scope": return <span className="chip sm" style={{ fontSize: 11 }}>{cfg.scopeSource === "inherited" ? "Hérité du business" : total + " pays · " + cfg.docTypes.length + " documents"}</span>;
      case "advanced": return <span className="chip sm" style={{ fontSize: 11 }}>{cfg.operatorReview ? "Avec opérateur" : "Sans opérateur"}{cfg.docMethod === "nfc_fallback" ? " · " + cfg.nfcRetry + " essais NFC" : ""}</span>;
      case "integration": return <span className={"mode-pill " + cfg.mode} style={{ fontSize: 11, margin: 0 }}><span className="d" />{cfg.mode === "live" ? "Live · facturé" : "Test · non facturé"}</span>;
      default: return null;
    }
  }

  function renderStep() {
    const p = { cfg, set, stepNum: sNum, stepTotal: sTot };
    switch (currentKey) {
      case "config": return <StepConfig {...p} />;
      case "type": return <StepType {...p} />;
      case "document": return <StepDocument {...p} />;
      case "face": return <StepFace {...p} />;
      case "reauth": return <StepReauth {...p} />;
      case "scope": return <StepScope {...p} />;
      case "advanced": return <StepAdvanced {...p} />;
      case "preview": return <StepPreview {...p} />;
      case "integration": return <StepIntegration {...p} requestLive={requestLive} />;
      default: return null;
    }
  }

  const qrModal = qrWf && (
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
          <button className="sid-btn primary" onClick={() => { const idx = workflows.indexOf(qrWf); setQrWf(null); if (idx >= 0) openWorkflow(idx); }}>Ouvrir l'intégration</button>
        </div>
      </div>
    </div>
  );

  if (view === "home") return <React.Fragment><Home workflows={workflows} onStart={startNew} onOpen={openWorkflow} onQr={openQr} />{qrModal}</React.Fragment>;

  if (view === "done") {
    return (
      <div className="done-screen">
        <div className="done-ico"><Ico name="check" size={30} sw={2.4} /></div>
        <h2>Workflow {cfg.mode === "live" ? "activé en live" : "prêt à tester"}</h2>
        <p>{cfg.name || "Votre workflow"} est configuré. {cfg.mode === "live" ? "La facturation a démarré pour ce business." : "Scannez le QR avec l'app ShareID pour lancer un onboarding réel."}</p>
        <div className="done-qr"><div className="qr" /><div className="hint" style={{ maxWidth: 210, textAlign: "left" }}><b style={{ color: "var(--ink)" }}>QR de test prêt</b><br />Scannez avec l'app ShareID — valable pour un onboarding. Régénérable depuis l'intégration.</div></div>
        <div className="summary-card">
          <div className="sr"><span className="sk">Type</span><span className="sv">{cfg.authentication ? "Onboarding + Authentification" : "Onboarding"}</span></div>
          <div className="sr"><span className="sk">Document</span><span className="sv">{(DOC_METHODS.find((m) => m.id === cfg.docMethod) || {}).t || "—"}</span></div>
          <div className="sr"><span className="sk">Niveau eIDAS atteint</span><span className="sv">{ach ? LEVELS[ach].name : "—"}{cohObj && cohObj.cls === "eq" ? " · cible" : ""}</span></div>
          <div className="sr"><span className="sk">Mode</span><span className="sv">{cfg.mode === "live" ? "Live" : "Test"}</span></div>
        </div>
        <div className="done-actions">
          <button className="sid-btn outline" onClick={() => { setCurrentKey("integration"); setView("wizard"); }}>Revoir l'intégration</button>
          <button className="sid-btn primary" onClick={exitToHome}>Retour au studio</button>
        </div>
      </div>
    );
  }

  /* wizard */
  return (
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

      {liveModal && (
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
      )}
    </div>
  );
}

export default App;
