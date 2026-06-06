/* ShareID Studio — Home + Steps 1–4 */
import React from "react";
import {
  Ico, DRIVERS, DOC_METHODS, FACE_PRESETS, LEVELS, LEVEL_KEYS,
  achievedLevel, coherence, effTarget, EidasTag,
} from "./core.jsx";

export function DashRail({ active = "wf_builder", count = 0, onNav }) {
  const groups = [
    {
      label: "Console",
      items: [
        { id: "home", nm: "Accueil", icon: "home" },
        { id: "stats", nm: "Statistiques", icon: "activity" },
        { id: "requests", nm: "Requêtes", icon: "search" },
        { id: "operator", nm: "File anti-fraude", icon: "shieldAlert" },
        { id: "demo", nm: "Démo produit", icon: "play" },
      ],
    },
    {
      label: "Build",
      items: [
        { id: "wf_builder", nm: "Workflow builder", icon: "layers", badge: count || null },
        { id: "biz_setup", nm: "Business setup", icon: "globe" },
      ],
    },
    {
      label: "Admin",
      items: [
        { id: "users", nm: "Utilisateurs", icon: "users" },
        { id: "business", nm: "Entreprise", icon: "building" },
        { id: "settings", nm: "Paramètres", icon: "settings" },
      ],
    },
  ];
  return (
    <aside className="dash-rail">
      <div className="rail-brand"><img src={import.meta.env.BASE_URL + "ds/logo-shareid.svg"} alt="ShareID" /><span className="crumb">Studio</span></div>
      <nav className="dash-nav">
        {groups.map((g) => (
          <div className="nav-group" key={g.label}>
            <div className="nav-group-l">{g.label}</div>
            {g.items.map((n) => (
              <button key={n.id} className={"dash-nav-item" + (n.id === active ? " active" : "")} onClick={() => onNav && onNav(n.id)}>
                <Ico name={n.icon} size={17} sw={1.7} />
                <span className="nm">{n.nm}</span>
                {n.badge ? <span className="navb">{n.badge}</span> : null}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="dash-account">
        <button className="dash-biz">
          <span className="biz-mk">VE</span>
          <span className="biz-info"><span className="biz-nm">Votre entreprise</span><span className="biz-env">Espace business</span></span>
          <Ico name="chevDown" size={15} sw={1.8} />
        </button>
        <div className="dash-user">
          <span className="ava">MB</span>
          <span className="u-info"><span className="u-nm">Marie Bernard</span><span className="u-role">Admin</span></span>
        </div>
      </div>
    </aside>
  );
}

export function Home({ workflows, onStart, onOpen, onQr, onNav }) {
  const empty = workflows.length === 0;
  // Vue choisie (cartes / tableau), mémorisée entre les sessions.
  const [view, setView] = React.useState(() => localStorage.getItem("wf_view") || "cards");
  function pickView(v) { setView(v); try { localStorage.setItem("wf_view", v); } catch (e) {} }
  return (
    <div className="app">
      <div className="dash">
        <DashRail active="wf_builder" count={workflows.length} onNav={onNav} />
        <div className="dash-main">
          <div className="dash-topbar">
            <div className="dt-head">
              <h1>Workflows</h1>
            </div>
            {!empty && (
              <button className="sid-btn primary" onClick={onStart}><Ico name="plus" size={16} sw={2.2} />Créer un workflow</button>
            )}
          </div>

          <div className="dash-body">
            {empty ? (
              <div className="dash-empty">
                <h2>Créez votre premier workflow de vérification</h2>
                <div className="de-cta">
                  <button className="sid-btn primary" onClick={onStart}><Ico name="plus" size={16} sw={2.2} />Créer un workflow</button>
                </div>
              </div>
            ) : (
              <div className="wf-list">
                <div className="wf-list-h">
                  <span>{workflows.length} workflow{workflows.length > 1 ? "s" : ""}</span>
                  <div className="view-seg" role="tablist" aria-label="Affichage">
                    <button className={"view-seg-b" + (view === "cards" ? " on" : "")} onClick={() => pickView("cards")} title="Vue cartes"><Ico name="grid" size={14} sw={1.9} />Cartes</button>
                    <button className={"view-seg-b" + (view === "table" ? " on" : "")} onClick={() => pickView("table")} title="Vue tableau"><Ico name="rows" size={14} sw={1.9} />Tableau</button>
                  </div>
                </div>
                {view === "cards" ? (
                  <div className="wf-grid">
                    {workflows.map((w, i) => {
                      const lvl = achievedLevel(w) || effTarget(w);
                      return (
                        <button className="wf-card" key={i} onClick={() => onOpen(i)}>
                          <div className="wf-card-top">
                            <span className="ico-tile" style={{ width: 36, height: 36, borderRadius: 11 }}><Ico name="fileCheck" size={18} /></span>
                            <span className={"mode-pill " + w.mode} style={{ margin: 0, fontSize: 10.5 }}><span className="d" />{w.mode === "live" ? "Live" : "Test"}</span>
                          </div>
                          <div className="wf-card-nm">{w.name || "Workflow sans titre"}</div>
                          <div className="wf-card-meta">
                            <EidasTag levelKey={lvl} prefix="" />
                            <span className="wf-card-sub">{w.authentication ? "Onboarding + Authentification" : "Onboarding"}</span>
                          </div>
                          <div className="wf-card-foot">
                            <span className="wf-open">Ouvrir<Ico name="chevR" size={14} sw={2} /></span>
                            <span className="row-qr" onClick={(e) => { e.stopPropagation(); onQr(w); }} title="Afficher le QR de test"><Ico name="smartphone" size={13} sw={1.7} />QR</span>
                          </div>
                        </button>
                      );
                    })}
                    <button className="wf-card wf-card-new" onClick={onStart}>
                      <div className="wf-new-ico"><Ico name="plus" size={20} sw={2} /></div>
                      <span className="wf-new-t">Nouveau workflow</span>
                      <span className="wf-new-s">Partez d'une configuration vierge</span>
                    </button>
                  </div>
                ) : (
                  <div className="wf-table-wrap">
                    <div className="wf-table-scroll">
                      <table className="wf-table">
                        <thead>
                          <tr>
                            <th>Nom</th>
                            <th>Mode</th>
                            <th>Niveau eIDAS</th>
                            <th>Type</th>
                            <th className="ta-r">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {workflows.map((w, i) => {
                            const lvl = achievedLevel(w) || effTarget(w);
                            return (
                              <tr key={i} className="wf-row" onClick={() => onOpen(i)}>
                                <td>
                                  <div className="wf-row-nm">
                                    <span className="ico-tile sm"><Ico name="fileCheck" size={16} /></span>
                                    <span className="wf-row-t">{w.name || "Workflow sans titre"}</span>
                                  </div>
                                </td>
                                <td><span className={"mode-pill " + w.mode} style={{ margin: 0, fontSize: 10.5 }}><span className="d" />{w.mode === "live" ? "Live" : "Test"}</span></td>
                                <td><EidasTag levelKey={lvl} prefix="" /></td>
                                <td><span className="wf-row-sub">{w.authentication ? "Onboarding + Authentification" : "Onboarding"}</span></td>
                                <td className="ta-r">
                                  <div className="wf-row-act">
                                    <span className="row-qr" onClick={(e) => { e.stopPropagation(); onQr(w); }} title="Afficher le QR de test"><Ico name="smartphone" size={13} sw={1.7} />QR</span>
                                    <span className="wf-row-open"><Ico name="chevR" size={16} sw={2} /></span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <button className="wf-row-new" onClick={onStart}><Ico name="plus" size={15} sw={2.1} />Nouveau workflow</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Step 1 — Configuration ---------------- */
export function StepConfig({ cfg, set, stepNum, stepTotal }) {
  function toggleDriver(id) {
    const has = cfg.drivers.includes(id);
    if (has) { set({ drivers: cfg.drivers.filter((d) => d !== id) }); }
    else { if (cfg.drivers.length >= 3) return; set({ drivers: [...cfg.drivers, id] }); }
  }
  const fric = { low: "l1", subst: "l2", high: "l3" };
  const fricLbl = { low: "friction basse", subst: "friction moyenne", high: "friction élevée" };
  return (
    <div className="body-inner step-anim">
      <div className="wzh"><div className="se">Étape {stepNum} / {stepTotal}</div><h2>Configuration</h2><p className="sub">Nommez votre workflow et indiquez pourquoi vous vérifiez vos utilisateurs.</p></div>

      <section className="cfg-sec">
        <div className="cfg-sec-h"><span className="cfg-sec-t">Nom du workflow</span></div>
        <div className="field" style={{ maxWidth: 520 }}>
          <input className="inp" value={cfg.name} placeholder="ex. Onboarding KYC particuliers" onChange={(e) => set({ name: e.target.value })} />
        </div>
      </section>

      <div className="step-sep" />

      <section className="cfg-sec">
        <div className="cfg-sec-h" style={{ maxWidth: 660 }}>
          <span className="cfg-sec-t">Pourquoi vérifiez-vous ?</span><span className="counter">{cfg.drivers.length} / 3</span>
        </div>
        <div className="opts g3" style={{ maxWidth: 660 }}>
          {DRIVERS.map((d) => {
            const sel = cfg.drivers.includes(d.id);
            return (
              <button key={d.id} className={"opt col" + (sel ? " sel" : "")} onClick={() => toggleDriver(d.id)}>
                <div className="otop" style={{ width: "100%" }}>
                  <span className={"ico-tile" + (sel ? "" : " dim")}><Ico name={d.icon} size={19} /></span>
                  <span className={"mark sq"} style={{ marginLeft: "auto" }}><Ico name="check" size={12} sw={3} /></span>
                </div>
                <div className="obody"><div className="ot">{d.t}</div><div className="od">{d.d}</div></div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="step-sep" />

      <section className="cfg-sec">
        <div className="cfg-sec-h"><span className="cfg-sec-t">Quel est votre niveau de risque ?</span></div>
        <div className="opts g3" style={{ maxWidth: 660 }}>
          {LEVEL_KEYS.map((k) => {
            const sel = cfg.eidasTarget === k;
            const desc = { low: "Assurance légère, friction minimale.", subst: "Recommandé pour le KYC régulé. Équilibre assurance / expérience.", high: "Assurance maximale — NFC + liveness." }[k];
            return (
              <button key={k} className={"opt col" + (sel ? " sel" : "")} onClick={() => set({ eidasTarget: sel ? null : k })} style={{ paddingTop: 16 }}>
                {sel && <span className="mark" style={{ position: "absolute", top: 14, right: 14 }}><Ico name="check" size={12} sw={3} /><span className="dot" /></span>}
                <div className="obody" style={{ width: "100%" }}>
                  <div className="otop"><span className="ot">{LEVELS[k].name}</span></div>
                  <div className="od">{desc}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 10 }}><span className={"fric-meter " + fric[k]}><i /><i /><i /></span><span className="fric-lbl">{fricLbl[k]}</span></div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ---------------- Step 2 — Type de vérification ---------------- */
export function StepType({ cfg, set, stepNum, stepTotal }) {
  function toggleAuth() {
    if (cfg.authentication) set({ authentication: false });
    else set({ authentication: true, onboarding: true });
  }
  return (
    <div className="body-inner step-anim">
      <div className="wzh"><div className="se">Étape {stepNum} / {stepTotal}</div><h2>Type de vérification</h2><p className="sub">Choisissez ce que ce workflow doit accomplir.</p></div>
      <div className="opts" style={{ maxWidth: 600, marginBottom: 18 }}>
        <div className="opt sel" style={{ cursor: cfg.authentication ? "not-allowed" : "default" }}>
          <span className="ico-tile"><Ico name="userCheck" size={19} /></span>
          <div className="obody">
            <div className="otop"><span className="ot">Onboarding (IDV)</span>{cfg.authentication
              ? <span className="chip sm" style={{ gap: 4 }}><Ico name="lock" size={10} sw={2.2} />requis</span>
              : <span className="chip brand sm">base</span>}</div>
            <div className="od">Vérification d'identité d'un nouvel utilisateur : capture et contrôle du document et du visage.</div>
          </div>
          <span className="mark sq" style={{ borderColor: "var(--color-main)", background: "var(--color-main)" }}><Ico name="check" size={12} sw={3} style={{ opacity: 1 }} /></span>
        </div>
        <button className={"opt" + (cfg.authentication ? " sel" : "")} onClick={toggleAuth}>
          <span className={"ico-tile" + (cfg.authentication ? "" : " dim")}><Ico name="refresh" size={19} /></span>
          <div className="obody"><div className="otop"><span className="ot">Authentification</span></div><div className="od">Ré-identifier un utilisateur déjà onboardé.</div></div>
          <span className="mark sq"><Ico name="check" size={12} sw={3} /></span>
        </button>
      </div>
      <div className="note" style={{ maxWidth: 600 }}>
        <span className="ico"><Ico name="info" size={15} sw={1.9} /></span>
        <div>L'authentification s'appuie sur un onboarding : la sélectionner active l'onboarding et débloque l'étape <b>Réauthentification</b>. Le niveau d'authentification suit celui de l'onboarding.</div>
      </div>
    </div>
  );
}

/* ---------------- Step 3 — Document ---------------- */
export function StepDocument({ cfg, set, stepNum, stepTotal }) {
  function pick(m) {
    set({ docMethod: m.id, pad: m.pad === "req", iad: false });
  }
  const method = DOC_METHODS.find((m) => m.id === cfg.docMethod);
  // L'IAD (anti-deepfake) ne s'applique pas aux méthodes NFC : on masque la ligne.
  const isNfc = method && (method.id === "nfc" || method.id === "nfc_fallback");
  const ach = achievedLevel(cfg);
  const coh = coherence(ach, effTarget(cfg));
  return (
    <div className="body-inner step-anim">
      <div className="wzh"><div className="se">Étape {stepNum} / {stepTotal}</div><h2>Document</h2><p className="sub">Choisissez comment le document est capturé et les protections anti-fraude.</p></div>
      <span className="lab" style={{ display: "block", marginBottom: 11 }}>Méthode de capture du document</span>
      <div className="opts" style={{ maxWidth: 680 }}>
        {DOC_METHODS.map((m) => {
          const sel = cfg.docMethod === m.id;
          return (
            <button key={m.id} className={"opt" + (sel ? " sel" : "")} onClick={() => pick(m)}>
              <span className="mark"><Ico name="check" size={12} sw={3} /><span className="dot" /></span>
              <div className="obody">
                <div className="otop"><span className="ot">{m.t}</span><EidasTag levelKey={m.level} /></div>
                <div className="od">{m.d}</div>
              </div>
            </button>
          );
        })}
      </div>

      {(method && method.pad !== "na") || (method && method.iad !== "na") ? (
        <div style={{ maxWidth: 680, marginTop: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}><span className="lab">Protections anti-fraude</span><span className="hint" style={{ color: "var(--muted-soft)" }}>dérivées de la méthode choisie</span></div>
          <PadIadRow id="pad" label="PAD — anti-spoofing" desc="Détection d'attaque par présentation sur le document." state={method.pad} on={cfg.pad} set={(v) => set({ pad: v })} />
          {!isNfc && <PadIadRow id="iad" label="IAD — anti-deepfake" desc="Détection d'attaque par injection sur le flux document." state={method.iad} on={cfg.iad} set={(v) => set({ iad: v })} />}
        </div>
      ) : null}

      {coh && coh.cls === "down" && (
        <div className="note warn" style={{ maxWidth: 680, marginTop: 18 }}>
          <span className="ico"><Ico name="info" size={15} sw={1.9} /></span>
          <div>Ce choix place votre workflow <b>sous votre cible eIDAS</b> ({LEVELS[effTarget(cfg)].name}). Vous pouvez continuer.</div>
        </div>
      )}
    </div>
  );
}
function PadIadRow({ label, desc, state, on, set }) {
  const badge = state === "req" ? <span className="statebadge req">obligatoire</span> : state === "opt" ? <span className="statebadge optn">option</span> : <span className="statebadge na">indisponible</span>;
  const locked = state === "req", disabled = state === "na";
  const active = disabled ? false : locked ? true : on;
  return (
    <div className={"tgl-row" + (disabled ? " dim" : "")}>
      <div className="tinfo"><div className="tt">{label} {badge}</div><div className="td">{desc}{locked ? " Verrouillé pour cette méthode." : ""}</div></div>
      <button className={"sw" + (active ? " on" : "") + (locked ? " locked" : "") + (disabled ? " disabled" : "")} disabled={locked || disabled} onClick={() => set(!on)} aria-label={label} />
    </div>
  );
}

/* ---------------- Step 4 — Visage ---------------- */
export function StepFace({ cfg, set, stepNum, stepTotal }) {
  const docLevel = (DOC_METHODS.find((m) => m.id === cfg.docMethod) || {}).level;
  const recoLevel = docLevel || effTarget(cfg);
  const recoId = (FACE_PRESETS.find((f) => f.level === recoLevel) || {}).id;
  const recoName = (FACE_PRESETS.find((f) => f.id === recoId) || {}).t;
  return (
    <div className="body-inner step-anim">
      <div className="wzh"><div className="se">Étape {stepNum} / {stepTotal}</div><h2>Visage</h2><p className="sub">Choisissez le niveau de capture et de contrôle du visage.</p></div>
      <div className="opts" style={{ maxWidth: 620 }}>
        {FACE_PRESETS.map((f) => {
          const sel = cfg.faceLevel === f.id;
          return (
            <button key={f.id} className={"opt" + (sel ? " sel" : "") + (f.id === recoId ? " reco-card" : "")} onClick={() => set({ faceLevel: f.id })}>
              <span className={"ico-tile" + (f.dim && !sel ? " dim" : "")}><Ico name={f.icon} size={19} /></span>
              <div className="obody"><div className="otop"><span className="ot">{f.t}</span>{f.id === recoId && <span className="reco-star" title="Recommandé pour votre configuration"><Ico name="sparkle" size={13} sw={2} /></span>}<EidasTag levelKey={f.level} /></div><div className="od">{f.d}</div></div>
              <span className="mark" style={{ marginTop: 2 }}><Ico name="check" size={12} sw={3} /><span className="dot" /></span>
            </button>
          );
        })}
      </div>
      <div className="note" style={{ maxWidth: 620, marginTop: 18 }}>
        <span className="ico"><Ico name="info" size={15} sw={1.9} /></span>
        <div>Le visage et le document fixent ensemble votre niveau eIDAS — le niveau atteint est le <b>minimum des deux</b>. Recommandé pour votre configuration : <b>{recoName}</b>, aligné sur votre méthode document{cfg.docMethod ? "" : " et votre cible eIDAS"}.</div>
      </div>
    </div>
  );
}
