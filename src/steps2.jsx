/* ShareID Studio — Steps 5–9 */
import React from "react";
import {
  Ico, REAUTH, DOC_TYPES, ZONES, COUNTRY_SUGGEST, BUSINESS_MAX_COUNTRIES,
  CAPTURE_METHODS, captureLabel, SIGNATURE_LEVELS, FACE_PRESETS, LEVELS, LEVEL_KEYS,
  BUSINESS_EIDAS, BUSINESS_RISK_MAX, exceedsBusinessMax, achievedLevel, coherence, effTarget,
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

/* ---------------- Step (cond) — Signature : capture email / téléphone (§15) ---------------- */
export function StepSignature({ cfg, set, stepNum, stepTotal }) {
  const sig = SIGNATURE_LEVELS.find((s) => s.id === cfg.signature) || {};
  return (
    <div className="body-inner step-anim">
      <div className="wzh"><div className="se">Étape {stepNum} / {stepTotal} · conditionnelle</div><h2>Signature</h2><p className="sub">La signature {sig.t && sig.t.toLowerCase()} nécessite un point de contact pour communiquer avec le prestataire de certificat.</p></div>
      <section className="cfg-sec" style={{ maxWidth: 560 }}>
        <div className="cfg-sec-h"><span className="cfg-sec-t">Point de contact</span></div>
        <div className="seg" style={{ marginBottom: 16 }}>
          <button className={cfg.sigContact === "email" ? "on" : ""} onClick={() => set({ sigContact: "email" })}>Email</button>
          <button className={cfg.sigContact === "phone" ? "on" : ""} onClick={() => set({ sigContact: "phone" })}>Téléphone</button>
        </div>
        <div className="field">
          <span className="lab">{cfg.sigContact === "email" ? "Email demandé à l'utilisateur" : "Numéro de téléphone demandé à l'utilisateur"}</span>
          <input className="inp" disabled placeholder={cfg.sigContact === "email" ? "saisi par l'utilisateur dans le SDK" : "saisi par l'utilisateur dans le SDK"} />
        </div>
        <div className="note" style={{ marginTop: 16 }}><span className="ico"><Ico name="info" size={15} sw={1.9} /></span><div>On capture <b>email OU téléphone</b>, jamais les deux. Requis pour la signature {cfg.signature === "qes" ? "qualifiée (QES)" : "avancée (AES)"}. Optionnel par défaut — activable sans casser le reste du parcours.</div></div>
      </section>
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
function AdvToggle({ tt, td, on, set }) {
  return (
    <div className="tgl-row">
      <div className="tinfo"><div className="tt">{tt}</div><div className="td">{td}</div></div>
      <button className={"sw" + (on ? " on" : "")} onClick={() => set(!on)} aria-label={tt} />
    </div>);
}
export function StepAdvanced({ cfg, set, stepNum, stepTotal }) {
  const [openMatch, setOpenMatch] = React.useState(false);
  const ach = achievedLevel(cfg);
  const coh = coherence(ach, effTarget(cfg));
  const heavyUx = cfg.operatorReview && (cfg.operatorMode || "always") === "always" && (cfg.faceLevel === "video_pad_iad" || cfg.docPrimary === "video");
  const isPhoto = cfg.docPrimary === "photo";
  return (
    <div className="body-inner step-anim">
      <div className="wzh"><div className="se">Étape {stepNum} / {stepTotal}</div><h2>Options avancées</h2><p className="sub">Réglages fins. Tout est optionnel et replié par défaut — n'ouvrez que ce dont vous avez besoin.</p></div>

      {/* §13 — alertes de risque / UX, non bloquantes */}
      {coh && coh.cls === "down" && (
        <div className="note warn" style={{ maxWidth: 640, marginBottom: 12 }}><span className="ico"><Ico name="info" size={15} sw={1.9} /></span><div>Attention : votre configuration <b>baisse votre niveau de risque</b> sous la cible ({LEVELS[effTarget(cfg)].name}). Non bloquant.</div></div>
      )}
      {heavyUx && (
        <div className="note warn" style={{ maxWidth: 640, marginBottom: 12 }}><span className="ico"><Ico name="info" size={15} sw={1.9} /></span><div>Attention : revue opérateur systématique + capture vidéo → <b>UX plus lourde</b> et délai accru. Non bloquant.</div></div>
      )}

      {/* §13 — revue opérateur : on/off réglé au business, ici on affine le niveau */}
      <section className="adv-section" style={{ maxWidth: 640 }}>
        <div className="adv-head"><span className="adv-n">1</span><div className="adv-info"><div className="adv-t">Niveau de revue opérateur</div><div className="adv-d">L'activation avec / sans opérateur est réglée au niveau du business. Ici, vous affinez quand il intervient.</div></div></div>
        {cfg.operatorReview ? (
          <React.Fragment>
            <div className="opts g3" style={{ marginBottom: 12 }}>
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
                  </button>);
              })}
            </div>
          </React.Fragment>
        ) : (
          <div className="note"><span className="ico"><Ico name="userCheck" size={15} sw={1.9} /></span><div>Opérateur <b>désactivé</b> au niveau du business : décision 100&nbsp;% automatique.</div></div>
        )}
      </section>

      {/* §13bis — matching & capture d'infos, repliés par défaut */}
      <section className="adv-section" style={{ maxWidth: 640 }}>
        <button className="adv-collapse" onClick={() => setOpenMatch((v) => !v)}>
          <span className="adv-n">2</span>
          <div className="adv-info"><div className="adv-t">Matching & capture d'infos</div><div className="adv-d">Comparaisons et vérifications optionnelles fournies par le client.</div></div>
          <Ico name={openMatch ? "chevUp" : "chevDown"} size={16} sw={2} />
        </button>
        {openMatch && (
          <div style={{ marginTop: 12 }}>
            <AdvToggle tt="Matching identité" td="Le client fournit nom + prénom + date de naissance → ShareID indique si ça correspond au document. Optionnel." on={cfg.matchIdentity} set={(v) => set({ matchIdentity: v })} />
            <AdvToggle tt="Face match (photo fournie)" td="Comparer une photo fournie par le client avec celle du document ou de l'onboarding." on={cfg.matchPhoto} set={(v) => set({ matchPhoto: v })} />
            {isPhoto ? (
              <React.Fragment>
                <AdvToggle tt="Document scope check" td="Vérifie le pays + le type de document (CNI / permis / passeport) avant de lancer un run complet — évite de payer un run sur un non-document. Méthode photo uniquement." on={cfg.scopeCheck} set={(v) => set({ scopeCheck: v })} />
                {cfg.scopeCheck && <AdvToggle tt="Sauter l'étape scope" td="Pour un client qui accepte tous les types de documents." on={cfg.scopeCheckSkip} set={(v) => set({ scopeCheckSkip: v })} />}
              </React.Fragment>
            ) : (
              <div className="note" style={{ marginTop: 10 }}><span className="ico"><Ico name="info" size={15} sw={1.9} /></span><div>Le <b>document scope check</b> n'est disponible qu'avec la méthode <b>photo</b>.</div></div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

/* ---------------- Step — Résultat (§14) ---------------- */
export function StepResult({ cfg, set, stepNum, stepTotal }) {
  const heavy = cfg.resultMode === "heavy";
  const usesNfc = cfg.docPrimary === "nfc" || cfg.docSecondary === "nfc";
  // Rétention par cas d'usage : hérite du business (30 j), augmentable uniquement.
  const RET_OPTS = [{ d: 0, l: "Hérité du business · 30 j" }, { d: 60, l: "60 jours" }, { d: 90, l: "90 jours" }, { d: 180, l: "180 jours" }];
  return (
    <div className="body-inner step-anim" style={{ maxWidth: 680 }}>
      <div className="wzh"><div className="se">Étape {stepNum} / {stepTotal}</div><h2>Résultat</h2><p className="sub">Ce que vous récupérez à chaque requête, et ce que vous archivez.</p></div>

      <div className="opts" style={{ marginBottom: 18 }}>
        <button className={"opt" + (!heavy ? " sel" : "")} onClick={() => set({ resultMode: "light" })}>
          <span className="mark"><Ico name="check" size={12} sw={3} /><span className="dot" /></span>
          <div className="obody"><div className="otop"><span className="ot">Light fetch</span><span className="chip brand sm">défaut</span></div><div className="od">Le JSON normal : verdict et données extraites. Léger, récupéré par défaut.</div></div>
        </button>
        <button className={"opt" + (heavy ? " sel" : "")} onClick={() => set({ resultMode: "heavy" })}>
          <span className="mark"><Ico name="check" size={12} sw={3} /><span className="dot" /></span>
          <div className="obody"><div className="otop"><span className="ot">Heavy fetch</span><span className="chip sm">dossier de preuve</span></div><div className="od">Dossier de preuve légal conforme PVID 1.0 : timeline complète et exportable (init SDK horodaté, acquisition, photos, réponses IA par élément de sécurité, intervention opérateur + changement de verdict, renvoi). À archiver (banques : 5 à 7 ans).</div></div>
        </button>
      </div>

      <section className="cfg-sec">
        <div className="cfg-sec-h"><span className="cfg-sec-t">Assets inclus</span></div>
        <AdvToggle tt="Crops du document (recto / verso)" td="Images recadrées du document." on={cfg.includeCrops} set={(v) => set({ includeCrops: v })} />
        <AdvToggle tt="Crop du visage" td="Photo du visage issue du document ou de la capture." on={cfg.includeFaceCrop} set={(v) => set({ includeFaceCrop: v })} />
        <AdvToggle tt="Recevoir les assets à chaque requête" td="Photos et vidéos sont lourdes. Désactivez pour alléger l'API — tout reste consultable dans l'historique du dashboard." on={cfg.sendAssets} set={(v) => set({ sendAssets: v })} />
      </section>

      {usesNfc && (cfg.includeCrops || cfg.includeFaceCrop) && (
        <div className="note" style={{ marginTop: 4 }}><span className="ico"><Ico name="info" size={15} sw={1.9} /></span><div>Une photo issue du <b>NFC</b> (puce) et une photo issue de l'<b>OCR</b> du document n'ont pas la même légitimité légale. ShareID indique l'origine de chaque photo dans le résultat.</div></div>
      )}

      <section className="cfg-sec" style={{ marginTop: 18 }}>
        <div className="cfg-sec-h"><span className="cfg-sec-t">Rétention de ce workflow</span></div>
        <div className="seg" style={{ flexWrap: "wrap" }}>
          {RET_OPTS.map((o) => <button key={o.d} className={(cfg.wfRetentionDays || 0) === o.d ? "on" : ""} onClick={() => set({ wfRetentionDays: o.d })}>{o.l}</button>)}
        </div>
        <span className="hint" style={{ marginTop: 8, display: "block" }}>Hérite du business par défaut. Augmentable uniquement — jamais en dessous de la rétention business.</span>
      </section>

      <section className="cfg-sec" style={{ marginTop: 18 }}>
        <AdvToggle tt="OCR temporel" td="Suivi temporel des champs OCR (configurable)." on={cfg.ocrTemporal} set={(v) => set({ ocrTemporal: v })} />
      </section>
    </div>
  );
}

/* ---------------- Step 8 — Aperçu ---------------- */
function RecapRow({ ic, l, children }) {
  return <div className="recap-row"><span className="recap-ic"><Ico name={ic} size={15} sw={1.8} /></span><span className="recap-l">{l}</span><span className="recap-v">{children}</span></div>;
}
export function StepPreview({ cfg, stepNum, stepTotal }) {
  const isExtraction = cfg.verifType === "extraction";
  const ach = achievedLevel(cfg);
  const dm = CAPTURE_METHODS.find((m) => m.id === cfg.docPrimary) || {};
  const dm2 = CAPTURE_METHODS.find((m) => m.id === cfg.docSecondary);
  const fp = FACE_PRESETS.find((f) => f.id === cfg.faceLevel) || {};
  const coh = coherence(ach, effTarget(cfg));
  const hasSig = cfg.signature && cfg.signature !== "none";
  const reauthNames = cfg.reauthOrder.filter((id) => cfg.reauthOn[id]).map((id) => REAUTH.find((r) => r.id === id).t);
  // §24 — chaque frame reflète réellement la config : pas de visage en extraction, etc.
  const frames = [
    { t: "Ouverture", icon: "smartphone", cap: "SDK ShareID" },
    { t: "Document", icon: dm.icon || "doc", cap: dm.t || "Document" },
    ...(!isExtraction ? [{ t: "Visage", icon: "smile", cap: fp.t || "Visage" }] : []),
    ...(cfg.verifType === "authentication" ? [{ t: "Réauth", icon: "refresh", cap: reauthNames[0] || "Réauth" }] : []),
    ...(hasSig ? [{ t: "Signature", icon: "key", cap: cfg.sigContact === "email" ? "Email" : "Téléphone" }] : []),
    { t: "Résultat", icon: "check", cap: isExtraction ? "Données extraites" : "Risque " + (ach ? LEVELS[ach].name : "—"), payoff: true },
  ];
  const { useState, useEffect, useRef } = React;
  const [lit, setLit] = useState(-1);
  const timer = useRef(null);
  function play() {
    clearInterval(timer.current); let i = 0; setLit(0);
    timer.current = setInterval(() => { i++; if (i >= frames.length) { clearInterval(timer.current); setTimeout(() => setLit(-1), 500); } else setLit(i); }, 520);
  }
  useEffect(() => () => clearInterval(timer.current), []);
  // §22 — effet « waouh » : on joue le parcours automatiquement à l'arrivée sur l'aperçu.
  useEffect(() => { const t = setTimeout(play, 350); return () => clearTimeout(t); }, []); // eslint-disable-line
  // §24 — verbe de capture aligné sur la méthode réellement choisie (pas de « vidéo » si c'est photo+NFC).
  const docPhrase = { nfc: "scannent leur pièce en NFC", video: "filment leur pièce", photo: "photographient leur pièce", wallet: "présentent leur wallet" }[cfg.docPrimary] || "présentent leur pièce";
  const scopeVal = cfg.scopeSource === "inherited"
    ? "Hérité du business · UE + Royaume-Uni · 4 documents"
    : (Math.min(BUSINESS_MAX_COUNTRIES, cfg.zones.reduce((s, z) => s + (ZONES.find((Z) => Z.id === z)?.n || 0), 0) + cfg.countries.length)) + " pays · " + cfg.docTypes.length + " documents";
  const verifName = { onboarding: "Onboarding (IDV)", authentication: "Authentification", extraction: "Extraction de données" }[cfg.verifType];
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
        <RecapRow ic="userCheck" l="Vérification">{verifName}</RecapRow>
        {!isExtraction && <RecapRow ic="shieldFace" l="Niveau de risque"><EidasTag levelKey={effTarget(cfg)} prefix={cfg.eidasTarget ? "Cible" : "Cible héritée"} /><Ico name="arrow" size={13} sw={2} style={{ margin: "0 2px", color: "var(--muted-soft)" }} /><EidasTag levelKey={ach} prefix="Atteint" />{coh && <span className={"coh " + coh.cls}>{coh.label}</span>}</RecapRow>}
        <RecapRow ic="doc" l="Document">{captureLabel(cfg.docPrimary)}<EidasTag levelKey={dm.level} prefix="" />{cfg.pad && <span className="chip sm">PAD</span>}{cfg.iad && <span className="chip sm">IAD</span>}{dm2 && <span className="chip sm">repli : {dm2.t}</span>}</RecapRow>
        {!isExtraction && <RecapRow ic="faceScan" l="Visage">{fp.t}<EidasTag levelKey={fp.level} prefix="" /></RecapRow>}
        {cfg.verifType === "authentication" && <RecapRow ic="refresh" l="Réauthentification">{reauthNames.map((n, i) => <span key={n} className="chip sm">{i + 1}. {n}</span>)}</RecapRow>}
        {hasSig && <RecapRow ic="key" l="Signature">{cfg.signature === "qes" ? "QES" : "AES"} · {cfg.sigContact === "email" ? "email" : "téléphone"}</RecapRow>}
        <RecapRow ic="globe" l="Périmètre">{scopeVal}</RecapRow>
        <RecapRow ic="fileCheck" l="Résultat">{cfg.resultMode === "heavy" ? "Heavy fetch · dossier de preuve" : "Light fetch"}</RecapRow>
        <RecapRow ic="userCheck" l="Revue opérateur">{cfg.operatorReview ? "Avec opérateur · " + ({ always: "systématiquement", success: "en cas de succès", reject: "en cas de rejet" }[cfg.operatorMode || "always"]) : "Sans opérateur (100 % auto)"}</RecapRow>
      </div>

      <div className="note" style={{ marginTop: 16 }}>
        <span className="ico"><Ico name="eye" size={15} sw={1.9} /></span>
        {isExtraction
          ? <div><b>En clair :</b> vos utilisateurs ouvrent le SDK et {docPhrase} ; ShareID en extrait les données par OCR. Pas de vérification d'identité ni de niveau de risque.</div>
          : <div><b>En clair :</b> vos utilisateurs ouvrent le SDK, {docPhrase}, passent un contrôle {cfg.faceLevel === "photo" ? "photo" : "vidéo"} du visage{cfg.verifType === "authentication" ? ", puis se réauthentifient via " + (reauthNames[0] || "réauth") : ""}{hasSig ? ", et signent (" + (cfg.sigContact === "email" ? "email" : "téléphone") + ")" : ""}. Niveau atteint : <b>{ach ? LEVELS[ach].name : "—"}</b>{ach === effTarget(cfg) ? " — conforme à votre cible." : "."}</div>}
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
    ios: `import ShareID\n\nShareID.start(\n  workflow: "wf_1234",\n  apiKey: "${cfg.mode === "live" ? "sk_live_…" : "sk_test_…"}"\n) { result in\n  // result.riskLevel\n}`,
    android: `ShareID.start(\n  workflowId = "wf_1234",\n  apiKey = "${cfg.mode === "live" ? "sk_live_…" : "sk_test_…"}"\n) { result ->\n  // result.riskLevel\n}`,
    web: `import { ShareID } from "@shareid/web";\n\nShareID.start({\n  workflow: "wf_1234",\n  apiKey: "${cfg.mode === "live" ? "sk_live_…" : "sk_test_…"}"\n});`,
    flutter: `await ShareID.start(\n  workflow: 'wf_1234',\n  apiKey: '${cfg.mode === "live" ? "sk_live_…" : "sk_test_…"}',\n);`,
  };
  return (
    <div className="body-inner step-anim" style={{ maxWidth: 720 }}>
      <div className="wzh"><div className="se">Étape {stepNum} / {stepTotal}</div><h2>Intégration</h2><p className="sub">Récupérez votre configuration, testez, et intégrez ShareID.</p></div>

      {/* §16 — état d'erreur si le paramétrage dépasse le plafond de risque du contrat business. */}
      {exceedsBusinessMax(cfg) && (
        <div className="note warn" style={{ maxWidth: 660, marginBottom: 18 }}>
          <span className="ico"><Ico name="shieldAlert" size={15} sw={1.9} /></span>
          <div><b>Votre contrat ne permet pas ce paramétrage.</b> Le niveau de risque atteint dépasse le plafond autorisé pour ce business ({LEVELS[BUSINESS_RISK_MAX].name}). Réduisez le niveau du workflow ou faites évoluer le contrat.</div>
        </div>
      )}

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
        <span className="lab" style={{ display: "block", marginBottom: 10 }}>Intégrer en 4 étapes <span className="hint" style={{ fontWeight: 400 }}>· l'essentiel, pas la doc complète</span></span>
        <div className="int-steps">
          {[
            { t: "Installez le SDK", d: "Ajoutez le package ShareID à votre app (iOS, Android, Web ou Flutter)." },
            { t: "Initialisez", d: "Passez votre clé SDK et l'ID du workflow." },
            { t: "Lancez le parcours", d: "Le SDK ouvre le parcours configuré ci-dessus." },
            { t: "Récupérez le résultat", d: "Fetch à la demande ou callback webhook signé HMAC." },
          ].map((s, i) => (
            <div className="int-step" key={i}><span className="int-step-n">{i + 1}</span><div><div className="int-step-t">{s.t}</div><div className="int-step-d">{s.d}</div></div></div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 660, marginTop: 24 }}>
        <span className="lab" style={{ display: "block", marginBottom: 10 }}>Snippet SDK</span>
        <div className="sdk-tabs">
          {["ios", "android", "web", "flutter"].map((t) => <button key={t} className={"sdk-tab" + (tab === t ? " on" : "")} onClick={() => setTab(t)}>{t === "ios" ? "iOS" : t[0].toUpperCase() + t.slice(1)}</button>)}
          <span className="sdk-tab" style={{ borderStyle: "dashed", color: "var(--muted)" }}>workflow_config.json</span>
        </div>
        <pre className="sdk-panel">{snippets[tab]}</pre>
      </div>
    </div>
  );
}
