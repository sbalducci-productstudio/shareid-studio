/* ShareID Studio — Steps 5–9 */
import React from "react";
import {
  Ico, REAUTH, DOC_TYPES, ZONES, COUNTRY_SUGGEST, BUSINESS_MAX_COUNTRIES,
  DOC_METHODS, FACE_PRESETS, LEVELS, achievedLevel, coherence, effTarget,
  EidasTag, DocArt,
} from "./core.jsx";

/* ---------------- Step 5 — Réauthentification ---------------- */
export function StepReauth({ cfg, set, stepNum, stepTotal }) {
  const meta = Object.fromEntries(REAUTH.map((r) => [r.id, r]));
  function move(id, dir) {
    const order = [...cfg.reauthOrder];
    const i = order.indexOf(id);
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    set({ reauthOrder: order });
  }
  function toggle(id) { set({ reauthOn: { ...cfg.reauthOn, [id]: !cfg.reauthOn[id] } }); }
  const activeIdx = cfg.reauthOrder.filter((id) => cfg.reauthOn[id]);
  return (
    <div className="body-inner step-anim">
      <div className="wzh"><div className="se">Étape {stepNum} / {stepTotal} · conditionnelle</div><h2>Réauthentification</h2><p className="sub">Comment réauthentifier un utilisateur déjà onboardé. Réordonnez pour définir l'ordre de bascule.</p></div>
      <div className="rank" style={{ maxWidth: 620 }}>
        {cfg.reauthOrder.map((id, idx) => {
          const r = meta[id]; const on = cfg.reauthOn[id];
          const rank = activeIdx.indexOf(id);
          const primary = on && rank === 0;
          return (
            <div key={id} className={"rank-row" + (primary ? " primary" : "") + (on ? "" : " off")}>
              <div className="reorder">
                <button onClick={() => move(id, -1)} disabled={idx === 0} aria-label="Monter"><Ico name="chevUp" size={13} sw={2.2} /></button>
                <button onClick={() => move(id, 1)} disabled={idx === cfg.reauthOrder.length - 1} aria-label="Descendre"><Ico name="chevDown" size={13} sw={2.2} /></button>
              </div>
              <span className="num">{on ? rank + 1 : "—"}</span>
              <div className="rinfo"><div className="rt">{r.t}{primary && <span className="chip brand sm">primaire</span>}</div><div className="rd">{r.d}</div></div>
              <button className={"sw" + (on ? " on" : "")} onClick={() => toggle(id)} aria-label={r.t} />
            </div>
          );
        })}
        <div className="rank-row off">
          <div className="reorder"><button disabled><Ico name="chevUp" size={13} sw={2.2} /></button><button disabled><Ico name="chevDown" size={13} sw={2.2} /></button></div>
          <span className="num">—</span>
          <div className="rinfo"><div className="rt">{REAUTH.find((r) => r.id === "wallet").t}<span className="statebadge na">bientôt</span></div><div className="rd">Réauthentification via un wallet d'identité EUDI. Disponible à l'ouverture de l'EUDI Wallet.</div></div>
          <button className="sw disabled" disabled aria-label="Wallet EUDI" />
        </div>
      </div>
      <div className="note" style={{ maxWidth: 620, marginTop: 16 }}>
        <span className="ico"><Ico name="clock" size={15} sw={1.9} /></span>
        <div>L'ordre définit la bascule : si la méthode 1 échoue, le parcours tente la méthode 2. L'utilisateur final ne choisit pas.</div>
      </div>
    </div>
  );
}

/* ---------------- Step 6 — Périmètre ---------------- */
export function DocTypeCard({ d, sel, onClick, readonly }) {
  return (
    <button className={"doc-card" + (sel ? " sel" : "") + (readonly ? " ro" : "")} onClick={onClick} disabled={readonly}>
      <div className="doc-art"><DocArt art={d.art} /></div>
      <div className="doc-name">{d.t}</div>
      {!readonly && <span className="doc-check">{sel && <Ico name="check" size={12} sw={3} />}</span>}
    </button>
  );
}
const COVERAGE_DOC = "https://doc.shareid.ai";

export function StepScope({ cfg, set, stepNum, stepTotal }) {
  const { useState } = React;
  const [q, setQ] = useState("");
  const zoneCount = cfg.zones.reduce((s, z) => s + (ZONES.find((Z) => Z.id === z)?.n || 0), 0);
  const total = Math.min(BUSINESS_MAX_COUNTRIES, zoneCount + cfg.countries.length);
  function addZone(z) { if (!cfg.zones.includes(z)) set({ zones: [...cfg.zones, z] }); }
  function rmZone(z) { set({ zones: cfg.zones.filter((x) => x !== z) }); }
  function addCountry(c) { if (!cfg.countries.includes(c)) set({ countries: [...cfg.countries, c] }); setQ(""); }
  function rmCountry(c) { set({ countries: cfg.countries.filter((x) => x !== c) }); }
  function toggleDoc(id) {
    const has = cfg.docTypes.includes(id);
    if (has) { if (cfg.docTypes.length === 1) return; set({ docTypes: cfg.docTypes.filter((d) => d !== id) }); }
    else set({ docTypes: [...cfg.docTypes, id] });
  }
  const matches = COUNTRY_SUGGEST.filter((c) => q && c.toLowerCase().includes(q.toLowerCase()) && !cfg.countries.includes(c)).slice(0, 4);
  const coverageLink = <a className="ext-link" href={COVERAGE_DOC} target="_blank" rel="noopener">Voir les pays couverts par zone <Ico name="arrow" size={12} sw={2} /></a>;
  const inherited = cfg.scopeSource === "inherited";
  return (
    <div className="body-inner step-anim">
      <div className="wzh"><div className="se">Étape {stepNum} / {stepTotal}</div><h2>Périmètre</h2><p className="sub">Par défaut, ce workflow hérite du périmètre business. Vous pouvez aussi définir un périmètre plus restreint, propre à ce workflow.</p></div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
        <div className="seg">
          <button className={inherited ? "on" : ""} onClick={() => set({ scopeSource: "inherited" })}>Hériter du business</button>
          <button className={!inherited ? "on" : ""} onClick={() => set({ scopeSource: "workflow" })}>Spécifique à ce workflow</button>
        </div>
        <span className="hint">Le périmètre reste inclus dans celui du business.</span>
      </div>

      {inherited ? (
        <React.Fragment>
          <div className="inherit-banner" style={{ maxWidth: 660 }}>
            <span className="ico"><Ico name="lock" size={15} sw={1.9} /></span>
            <div><b>Hérité de la configuration business.</b> Ce périmètre s'applique à tous les workflows et se modifie dans les paramètres business — ici, en lecture seule. Passez en « spécifique à ce workflow » pour le restreindre.</div>
          </div>
          <div className="inherit-panel" style={{ maxWidth: 660 }}>
            <div className="scope-block">
              <div className="scope-block-h"><span className="ico"><Ico name="globe" size={15} sw={1.9} /></span><span className="lab">Pays acceptés</span><span className="inherit-tag">Hérité</span></div>
              <div className="chip-field" style={{ border: 0, padding: 0 }}>
                <span className="chip zone-chip"><Ico name="globe" size={12} sw={1.9} />Union européenne · 27</span>
                <span className="chip">Royaume-Uni</span>
                <span className="counter" style={{ alignSelf: "center" }}>28 pays</span>
              </div>
            </div>
            <div className="scope-block" style={{ marginBottom: 0 }}>
              <div className="scope-block-h"><span className="ico"><Ico name="fileCheck" size={15} sw={1.9} /></span><span className="lab">Types de documents</span><span className="inherit-tag">Hérité</span></div>
              <div className="doc-grid">
                {DOC_TYPES.map((d) => <DocTypeCard key={d.id} d={d} sel readonly />)}
              </div>
            </div>
          </div>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div className="scope-block" style={{ maxWidth: 660 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}><span className="lab">Pays acceptés</span><span className="counter">{total} / {BUSINESS_MAX_COUNTRIES}</span></div>
            <div className="input-wrap" style={{ marginBottom: 10, position: "relative" }}>
              <span className="ico"><Ico name="search" size={15} sw={1.9} /></span>
              <input className="inp with-icon" placeholder="Rechercher un pays, ou ajouter une zone ci-dessous" value={q} onChange={(e) => setQ(e.target.value)} />
              {matches.length > 0 && (
                <div className="sug-pop">
                  {matches.map((c) => <div key={c} onClick={() => addCountry(c)} onMouseDown={(e) => e.preventDefault()} className="sug">{c}</div>)}
                </div>
              )}
            </div>
            <div className="chip-field">
              {cfg.zones.map((z) => { const Z = ZONES.find((x) => x.id === z); return <span key={z} className="chip zone-chip"><Ico name="globe" size={12} sw={1.9} />{Z.t} · {Z.n}<span className="x" onClick={() => rmZone(z)}>×</span></span>; })}
              {cfg.countries.map((c) => <span key={c} className="chip">{c}<span className="x" onClick={() => rmCountry(c)}>×</span></span>)}
              {ZONES.filter((z) => !cfg.zones.includes(z.id)).map((z) => <span key={z.id} className="chip" style={{ borderStyle: "dashed", color: "var(--muted)", cursor: "pointer" }} onClick={() => addZone(z.id)}>+ {z.t}</span>)}
            </div>
            <div style={{ marginTop: 13 }}><div className="scope-bar"><span className="used" style={{ width: Math.min(100, (total / BUSINESS_MAX_COUNTRIES) * 100) + "%" }} /></div></div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, gap: 12, flexWrap: "wrap" }}>
              <span className="hint">{total} pays sur {BUSINESS_MAX_COUNTRIES} autorisés par le business.</span>
              {coverageLink}
            </div>
          </div>
          <div style={{ maxWidth: 660 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 11 }}><span className="lab">Types de documents acceptés</span><span className="counter">{cfg.docTypes.length} / 4</span></div>
            <div className="doc-grid">
              {DOC_TYPES.map((d) => <DocTypeCard key={d.id} d={d} sel={cfg.docTypes.includes(d.id)} onClick={() => toggleDoc(d.id)} />)}
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

/* ---------------- Step 7 — Options avancées ---------------- */
export function StepAdvanced({ cfg, set, stepNum, stepTotal }) {
  const showRetry = cfg.docMethod === "nfc_fallback";
  return (
    <div className="body-inner step-anim">
      <div className="wzh"><div className="se">Étape {stepNum} / {stepTotal}</div><h2>Options avancées</h2><p className="sub">Deux réglages indépendants : le contrôle humain et le comportement de capture.</p></div>

      <section className="adv-section" style={{ maxWidth: 640 }}>
        <div className="adv-head"><span className="adv-n">1</span><div className="adv-info"><div className="adv-t">Revue opérateur</div><div className="adv-d">Qui valide la décision finale.</div></div></div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <div className="seg"><button className={cfg.operatorReview ? "on" : ""} onClick={() => set({ operatorReview: true })}>Avec opérateur</button><button className={!cfg.operatorReview ? "on" : ""} onClick={() => set({ operatorReview: false })}>Sans opérateur</button></div>
        </div>
        {cfg.operatorReview ? (
          <React.Fragment>
            <div style={{ marginBottom: 12 }}>
              <span className="lab" style={{ display: "block", marginBottom: 9 }}>Quand l'opérateur intervient</span>
              <div className="opts g3">
                {[
                  { id: "always", t: "Systématiquement", d: "Chaque dossier passe en revue humaine." },
                  { id: "success", t: "En cas de succès", d: "Revue quand l'IA accepte le dossier." },
                  { id: "reject", t: "En cas de rejet", d: "Revue quand l'IA rejette le dossier." },
                ].map((o) => {
                  const sel = (cfg.operatorMode || "always") === o.id;
                  return (
                    <button key={o.id} className={"opt col" + (sel ? " sel" : "")} onClick={() => set({ operatorMode: o.id })} style={{ paddingTop: 16, paddingRight: 36 }}>
                      {sel && <span className="mark" style={{ position: "absolute", top: 14, right: 14 }}><Ico name="check" size={12} sw={3} /><span className="dot" /></span>}
                      <div className="obody" style={{ width: "100%" }}><div className="otop"><span className="ot">{o.t}</span></div><div className="od">{o.d}</div></div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="note"><span className="ico"><Ico name="userCheck" size={15} sw={1.9} /></span><div><b>Avec opérateur</b> : un humain vérifie le verdict de l'IA {(cfg.operatorMode || "always") === "always" ? "sur chaque dossier" : (cfg.operatorMode === "success" ? "lorsque l'IA accepte" : "lorsque l'IA rejette")} avant la décision finale. Ajoute de la confiance et un léger délai.</div></div>
          </React.Fragment>
        ) : (
          <div className="note"><span className="ico"><Ico name="userCheck" size={15} sw={1.9} /></span><div><b>Sans opérateur</b> : la décision est 100&nbsp;% automatique et instantanée.</div></div>
        )}
      </section>

      <section className="adv-section" style={{ maxWidth: 640 }}>
        <div className="adv-head"><span className="adv-n">2</span><div className="adv-info"><div className="adv-t">Tentatives NFC avant bascule vidéo</div><div className="adv-d">Combien d'essais NFC avant de passer en capture vidéo.</div></div>{!showRetry && <span className="statebadge na" style={{ alignSelf: "center" }}>NFC fallback requis</span>}</div>
        {showRetry ? (
          <div>
            <p className="hint" style={{ marginBottom: 16 }}>Au-delà de ce nombre d'échecs NFC, le parcours bascule automatiquement en capture vidéo.</p>
            <div className="slider" style={{ maxWidth: 360 }}>
              <input type="range" min="2" max="5" step="1" value={cfg.nfcRetry} onChange={(e) => set({ nfcRetry: +e.target.value })} className="range-native" style={{ background: `linear-gradient(to right, var(--color-main) ${((cfg.nfcRetry - 2) / 3) * 100}%, var(--line) ${((cfg.nfcRetry - 2) / 3) * 100}%)` }} />
              <div className="ticks">{[2, 3, 4, 5].map((n) => <button key={n} className={cfg.nfcRetry === n ? "cur" : ""} onClick={() => set({ nfcRetry: n })}>{n}</button>)}</div>
            </div>
            <p className="hint" style={{ marginTop: 14 }}>{cfg.nfcRetry} échec{cfg.nfcRetry > 1 ? "s" : ""} NFC, puis bascule vidéo.</p>
          </div>
        ) : (
          <div className="note"><span className="ico"><Ico name="info" size={15} sw={1.9} /></span><div>Ce réglage n'apparaît que pour la méthode « NFC avec fallback vidéo » (étape Document).</div></div>
        )}
      </section>
    </div>
  );
}

/* ---------------- Step 8 — Aperçu ---------------- */
function RecapRow({ ic, l, children }) {
  return <div className="recap-row"><span className="recap-ic"><Ico name={ic} size={15} sw={1.8} /></span><span className="recap-l">{l}</span><span className="recap-v">{children}</span></div>;
}
export function StepPreview({ cfg, stepNum, stepTotal }) {
  const ach = achievedLevel(cfg);
  const dm = DOC_METHODS.find((m) => m.id === cfg.docMethod) || {};
  const fp = FACE_PRESETS.find((f) => f.id === cfg.faceLevel) || {};
  const coh = coherence(ach, effTarget(cfg));
  const reauthNames = cfg.reauthOrder.filter((id) => cfg.reauthOn[id]).map((id) => REAUTH.find((r) => r.id === id).t);
  const frames = [
    { t: "Ouverture", icon: "smartphone", cap: "SDK ShareID" },
    { t: "Document", icon: "doc", cap: dm.t || "Document" },
    { t: "Visage", icon: "smile", cap: fp.t || "Visage" },
    ...(cfg.authentication ? [{ t: "Réauth", icon: "smile", cap: reauthNames[0] || "Réauth" }] : []),
    { t: "Résultat", icon: "check", cap: "eIDAS " + (ach ? LEVELS[ach].name : "—"), payoff: true },
  ];
  const { useState, useEffect, useRef } = React;
  const [lit, setLit] = useState(-1);
  const timer = useRef(null);
  function play() {
    clearInterval(timer.current); let i = 0; setLit(0);
    timer.current = setInterval(() => { i++; if (i >= frames.length) { clearInterval(timer.current); setTimeout(() => setLit(-1), 500); } else setLit(i); }, 520);
  }
  useEffect(() => () => clearInterval(timer.current), []);
  const docPhrase = { nfc: "scannent leur pièce en NFC", nfc_fallback: "scannent leur pièce en NFC (vidéo si échec)", video: "filment leur pièce", photo: "photographient leur pièce" }[cfg.docMethod] || "présentent leur pièce";
  const scopeVal = cfg.scopeSource === "inherited"
    ? "Hérité du business · UE + Royaume-Uni · 4 documents"
    : (Math.min(BUSINESS_MAX_COUNTRIES, cfg.zones.reduce((s, z) => s + (ZONES.find((Z) => Z.id === z)?.n || 0), 0) + cfg.countries.length)) + " pays · " + cfg.docTypes.length + " documents";
  return (
    <div className="body-inner step-anim" style={{ maxWidth: 780 }}>
      <div className="wzh" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
        <div><div className="se">Étape {stepNum} / {stepTotal}</div><h2>Votre workflow</h2><p className="sub">Le récap complet de votre configuration et le parcours que vivra votre utilisateur final.</p></div>
        <button className="sid-btn inverse" onClick={play}><Ico name="play" size={12} fill />Rejouer</button>
      </div>

      <div className="film">
        {frames.map((f, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div className="film-arrow">→</div>}
            <div className={"frame" + (f.payoff ? " payoff" : "") + (lit === i ? " lit" : "")}>
              <div className="fh"><span className="ftitle">{f.t}</span><span className="fn">{String(i + 1).padStart(2, "0")}</span></div>
              <div className="phone"><Ico name={f.icon} size={22} sw={f.payoff ? 2 : 1.7} /><span className="cap" style={f.payoff ? { color: "var(--color-main)", fontWeight: 600 } : null}>{f.cap}</span></div>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="recap">
        <div className="recap-h">Récapitulatif</div>
        <RecapRow ic="userCheck" l="Vérification">{cfg.authentication ? "Onboarding + Authentification" : "Onboarding (IDV)"}</RecapRow>
        <RecapRow ic="shieldFace" l="Niveau eIDAS"><EidasTag levelKey={effTarget(cfg)} prefix={cfg.eidasTarget ? "Cible" : "Cible héritée"} /><Ico name="arrow" size={13} sw={2} style={{ margin: "0 2px", color: "var(--muted-soft)" }} /><EidasTag levelKey={ach} prefix="Atteint" />{coh && <span className={"coh " + coh.cls}>{coh.label}</span>}</RecapRow>
        <RecapRow ic="doc" l="Document">{dm.t}<EidasTag levelKey={dm.level} prefix="" />{cfg.pad && <span className="chip sm">PAD</span>}{cfg.iad && <span className="chip sm">IAD</span>}</RecapRow>
        <RecapRow ic="faceScan" l="Visage">{fp.t}<EidasTag levelKey={fp.level} prefix="" /></RecapRow>
        {cfg.authentication && <RecapRow ic="refresh" l="Réauthentification">{reauthNames.map((n, i) => <span key={n} className="chip sm">{i + 1}. {n}</span>)}</RecapRow>}
        <RecapRow ic="globe" l="Périmètre">{scopeVal}</RecapRow>
        <RecapRow ic="userCheck" l="Revue opérateur">{cfg.operatorReview ? "Avec opérateur · " + ({ always: "systématiquement", success: "en cas de succès", reject: "en cas de rejet" }[cfg.operatorMode || "always"]) : "Sans opérateur (100 % auto)"}</RecapRow>
      </div>

      <div className="note" style={{ marginTop: 16 }}>
        <span className="ico"><Ico name="eye" size={15} sw={1.9} /></span>
        <div><b>En clair :</b> vos utilisateurs ouvrent le SDK, {docPhrase}, passent un contrôle {cfg.faceLevel === "photo" ? "photo" : "vidéo"} du visage{cfg.authentication ? ", puis se réauthentifient via " + (reauthNames[0] || "réauth") : ""}. Niveau atteint : <b>{ach ? LEVELS[ach].name : "—"}</b>{ach === effTarget(cfg) ? " — conforme à votre cible." : "."}</div>
      </div>
      <div style={{ marginTop: 16 }}><button className="sid-btn outline"><Ico name="share" size={14} />Partager l'aperçu</button></div>
    </div>
  );
}

/* ---------------- Step 9 — Intégration ---------------- */
export function newSession() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }
export function StepIntegration({ cfg, set, requestLive, stepNum, stepTotal }) {
  const { useState } = React;
  const [tab, setTab] = useState("ios");
  const [copied, setCopied] = useState(null);
  const [session, setSession] = useState(newSession);
  function copy(k, v) { try { navigator.clipboard.writeText(v); } catch (e) {} setCopied(k); setTimeout(() => setCopied(null), 1200); }
  const keys = [
    { k: "Clé API (" + cfg.mode + ")", v: cfg.mode === "live" ? "sk_live_9a3f…c20d" : "sk_test_3f9a…b21c" },
    { k: "Clé SDK", v: "pk_sdk_8c10…e7f2" },
    { k: "Webhook · HMAC", v: "whsec_a44…·secret" },
  ];
  const snippets = {
    ios: `import ShareID\n\nShareID.start(\n  workflow: "wf_1234",\n  apiKey: "${cfg.mode === "live" ? "sk_live_…" : "sk_test_…"}"\n) { result in\n  // result.eidasLevel\n}`,
    android: `ShareID.start(\n  workflowId = "wf_1234",\n  apiKey = "${cfg.mode === "live" ? "sk_live_…" : "sk_test_…"}"\n) { result ->\n  // result.eidasLevel\n}`,
    web: `import { ShareID } from "@shareid/web";\n\nShareID.start({\n  workflow: "wf_1234",\n  apiKey: "${cfg.mode === "live" ? "sk_live_…" : "sk_test_…"}"\n});`,
    flutter: `await ShareID.start(\n  workflow: 'wf_1234',\n  apiKey: '${cfg.mode === "live" ? "sk_live_…" : "sk_test_…"}',\n);`,
  };
  return (
    <div className="body-inner step-anim" style={{ maxWidth: 720 }}>
      <div className="wzh"><div className="se">Étape {stepNum} / {stepTotal}</div><h2>Intégration</h2><p className="sub">Récupérez votre configuration, testez, et intégrez ShareID.</p></div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 11, maxWidth: 660 }}>
          <span className="lab">Mode de ce workflow</span>
          <div className="seg"><button className={cfg.mode === "test" ? "on" : ""} onClick={() => set({ mode: "test" })}>Test</button><button className={cfg.mode === "live" ? "on" : ""} onClick={() => cfg.mode === "live" ? null : requestLive()}>Live</button></div>
        </div>
        <div className={"note" + (cfg.mode === "live" ? " warn" : "")} style={{ maxWidth: 660 }}>
          <span className="ico"><Ico name="info" size={15} sw={1.9} /></span>
          <div><b>Test</b> : intégrez et testez sans facturation, toutes méthodes accessibles. <b>Live</b> : production facturable — passe le business en live au premier workflow live.</div>
        </div>
      </div>

      <div className="int-grid" style={{ maxWidth: 660 }}>
        <div>
          <span className="lab" style={{ display: "block", marginBottom: 10 }}>Environment Pack <span className="hint" style={{ fontWeight: 400 }}>· clés de {cfg.mode}</span></span>
          {keys.map((row) => (
            <div className="keyrow" key={row.k}><span className="kk">{row.k}</span><span className="kv">{row.v}</span><button className={"copy" + (copied === row.k ? " ok" : "")} onClick={() => copy(row.k, row.v)}><Ico name={copied === row.k ? "check" : "copy"} size={14} sw={1.8} /></button></div>
          ))}
        </div>
        <div className="qr-block">
          <div className="qr" />
          <div className="qr-meta">Session {session}<br />valable pour un onboarding</div>
          <button className="qr-refresh" onClick={() => setSession(newSession())}><Ico name="refresh" size={12} sw={2} />Rafraîchir le QR</button>
        </div>
      </div>

      <div style={{ maxWidth: 660, marginTop: 24 }}>
        <span className="lab" style={{ display: "block", marginBottom: 10 }}>Récupération du résultat</span>
        <div className="tgl-row">
          <div className="tinfo"><div className="tt">Fetch <span className="statebadge optn">à la demande</span></div><div className="td">Interrogez l'API pour récupérer le verdict quand vous le souhaitez.</div></div>
          <button className={"sw" + (cfg.fetchResult ? " on" : "")} onClick={() => set({ fetchResult: !cfg.fetchResult })} aria-label="Fetch" />
        </div>
        <div className="tgl-row">
          <div className="tinfo"><div className="tt">Callback <span className="statebadge optn">webhook</span></div><div className="td">ShareID pousse le résultat sur votre endpoint, signé HMAC.</div></div>
          <button className={"sw" + (cfg.callback ? " on" : "")} onClick={() => set({ callback: !cfg.callback })} aria-label="Callback" />
        </div>
      </div>

      <div style={{ maxWidth: 660, marginTop: 24 }}>
        <span className="lab" style={{ display: "block", marginBottom: 10 }}>Intégrez le SDK</span>
        <div className="sdk-tabs">
          {["ios", "android", "web", "flutter"].map((t) => <button key={t} className={"sdk-tab" + (tab === t ? " on" : "")} onClick={() => setTab(t)}>{t === "ios" ? "iOS" : t[0].toUpperCase() + t.slice(1)}</button>)}
          <span className="sdk-tab" style={{ borderStyle: "dashed", color: "var(--muted)" }}>workflow_config.json</span>
        </div>
        <pre className="sdk-panel">{snippets[tab]}</pre>
      </div>
    </div>
  );
}
