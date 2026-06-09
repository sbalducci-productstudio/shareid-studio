/* ShareID Studio — Home + Steps 1–4 */
import React from "react";
import {
  Ico, DRIVERS, VERIF_TYPES, AUTH_SOURCES, SIGNATURE_LEVELS, CAPTURE_METHODS, captureLabel,
  FACE_PRESETS, LEVELS, LEVEL_KEYS, achievedLevel, coherence, effTarget, EidasTag,
} from "./core.jsx";
import { canAccessSection, can, ROLES, ROLE_KEYS } from "./access.js";
import { useSession } from "./session.jsx";

/* Libellé court du type de vérification d'un workflow (cartes / tableau). */
function verifLabel(w) { return { onboarding: "Onboarding (IDV)", authentication: "Authentification", extraction: "Extraction de données" }[w.verifType] || "Onboarding (IDV)"; }
function wfLevel(w) { return w.verifType === "extraction" ? "none" : (achievedLevel(w) || effTarget(w)); }

export function DashRail({ active = "wf_builder", count = 0, onNav }) {
  const { role } = useSession();
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
        { id: "access", nm: "Contrôle des accès", icon: "shieldAlert" },
        { id: "settings", nm: "Paramètres", icon: "settings" },
      ],
    },
  ]
    // Gate the rail by the active role — only show sections this role can reach.
    .map((g) => ({ ...g, items: g.items.filter((n) => canAccessSection(role, n.id)) }))
    .filter((g) => g.items.length > 0);
  return (
    <aside className="dash-rail">
      <div className="rail-brand"><img src={import.meta.env.BASE_URL + "ds/logo-shareid.svg"} alt="ShareID" /><span className="crumb">Studio</span></div>
      {/* Multi-org : sélecteur d'org de l'utilisateur connecté, en haut sous le logo. */}
      <AccountSwitcher onNav={onNav} />
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
      {/* View As : outil d'observation réservé au ShareID Admin, en bas, à part. */}
      <ViewAsSwitcher />
    </aside>
  );
}

/* Account block = org switcher + role impersonator. In production the active
   (org, role) comes from the authenticated session; here it's a demo control so
   every gating + PII rule can be exercised live. One role per org (access model). */
const orgMark = (nm) => (nm || "?").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
function AccountSwitcher({ onNav }) {
  const { user, orgs, org, role, roleMeta, entity, switchOrg } = useSession();
  const [open, setOpen] = React.useState(false);
  const initials = user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  // Qui peut créer une organisation (cf. modèle d'accès) — sinon on cache l'action.
  const canCreate = can(role, "createBizGroup") || can(role, "configureBusiness");
  return (
    <div className="dash-account top" style={{ position: "relative" }}>
      {open && (
        <div className="combo-pop org-pop" style={{ top: "calc(100% + 6px)", left: 0, right: 0, maxHeight: 420, overflowY: "auto" }}>
          {/* Qui je suis */}
          <div className="org-pop-head">
            <span className="req-ava">{initials}</span>
            <div className="op-id"><span className="op-nm">{user.name}</span><span className="op-mail mono">{user.email}</span></div>
          </div>
          {/* Quel rôle j'ai (sur l'org active) */}
          <div className="op-role"><span className="op-role-k">Rôle actuel</span><span className={"role-tag " + roleMeta.cls}>{roleMeta.nm}</span></div>
          <div className="combo-div" />
          {/* Les organisations auxquelles je peux prétendre */}
          <div className="nav-group-l" style={{ padding: "2px 10px 6px" }}>Mes organisations</div>
          {orgs.map((o) => (
            <button key={o.id} className={"org-opt" + (o.id === org.id ? " on" : "")} onClick={() => { switchOrg(o.id); setOpen(false); }}>
              <span className="org-opt-mk">{orgMark(o.nm)}</span>
              <span className="org-opt-id">
                <span className="org-opt-nm">{o.nm}</span>
                <span className="org-opt-sub">{ENTITY_LABEL[o.entity]} · {ROLE_LABEL[o.role]}</span>
              </span>
              {o.id === org.id && <Ico name="check" size={15} sw={2.4} />}
            </button>
          ))}
          {/* Créer une organisation */}
          {canCreate && (
            <React.Fragment>
              <div className="combo-div" />
              <button className="org-create" onClick={() => { setOpen(false); onNav && onNav("biz_setup"); }}>
                <span className="org-create-ic"><Ico name="plus" size={15} sw={2.2} /></span>
                <span>Créer une organisation</span>
              </button>
            </React.Fragment>
          )}
        </div>
      )}
      <button className="dash-biz" onClick={() => setOpen((v) => !v)}>
        <span className="biz-mk">{orgMark(org.nm)}</span>
        <span className="biz-info"><span className="biz-nm">{org.nm}</span><span className="biz-env">{entity.nm} · {roleMeta.nm}</span></span>
        <Ico name="chevDown" size={15} sw={1.8} />
      </button>
    </div>
  );
}
/* View As — sélecteur d'observation réservé au ShareID Admin (en bas du rail).
   Feature distincte du multi-org : ici on ne change pas d'org, on REND le Studio
   comme un autre rôle le verrait (lecture seule). Le rôle réel reste ShareID
   Admin ; quitter l'observation revient à la vue admin. La redirection vers une
   section accessible est gérée par l'effet de garde dans App.jsx. */
function ViewAsSwitcher() {
  const { realRole, role, isViewAs, viewAsRole, setViewAs } = useSession();
  const [open, setOpen] = React.useState(false);
  if (realRole !== "sid_admin") return null; // outil admin uniquement
  return (
    <div className="dash-viewas" style={{ position: "relative" }}>
      {open && (
        <div className="combo-pop" style={{ top: "auto", bottom: "calc(100% + 6px)", left: 0, right: 0, maxHeight: 300, overflowY: "auto" }}>
          <div className="nav-group-l" style={{ padding: "4px 10px" }}>Observer en tant que…</div>
          {isViewAs && (
            <button className="combo-opt" style={{ gap: 8 }} onClick={() => { setViewAs(null); setOpen(false); }}>
              <span className="mark sq"><Ico name="x" size={10} sw={3} /></span>
              <span style={{ fontSize: 12.5 }}>Quitter l'observation</span>
            </button>
          )}
          {ROLE_KEYS.map((r) => (
            <button key={r} className="combo-opt" style={{ gap: 8 }} onClick={() => { setViewAs(r); setOpen(false); }}>
              <span className={"mark sq"} style={viewAsRole === r ? { borderColor: "var(--color-main)", background: "var(--color-main)" } : null}>
                <Ico name="check" size={11} sw={3} style={{ opacity: viewAsRole === r ? 1 : 0 }} />
              </span>
              <span style={{ fontSize: 12.5 }}>{ROLES[r].nm}</span>
            </button>
          ))}
        </div>
      )}
      <button className={"dash-viewas-btn" + (isViewAs ? " on" : "")} onClick={() => setOpen((v) => !v)}>
        <Ico name="eye" size={15} sw={1.8} />
        <span className="va-info"><span className="va-lab">View As</span><span className="va-sub">{isViewAs ? ROLES[role].nm : "Observer un rôle"}</span></span>
        <Ico name="chevUp" size={14} sw={1.8} />
      </button>
    </div>
  );
}
const ENTITY_LABEL = { shareid: "ShareID", business: "Business", group: "Groupe", retailer: "Retailer" };
const ROLE_LABEL = {
  sid_admin: "ShareID Admin", sid_sales: "ShareID Sales", retailer_admin: "Retailer Admin",
  group_admin: "Group Admin", biz_admin: "Business Admin", agent: "Agent", operator: "Operator", expert: "Expert",
};

export function Home({ workflows, onStart, onOpen, onQr, onNav }) {
  const empty = workflows.length === 0;
  // Vue choisie (cartes / tableau), mémorisée entre les sessions.
  const [view, setView] = React.useState(() => localStorage.getItem("wf_view") || "cards");
  // §23 — accompagnement léger et contextuel à la première connexion (jamais un tour « étape 1/2/3 »).
  const [hint, setHint] = React.useState(() => localStorage.getItem("wf_hint_dismissed") !== "1");
  function dismissHint() { setHint(false); try { localStorage.setItem("wf_hint_dismissed", "1"); } catch (e) {} }
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
                {hint &&
                  <div className="firstrun-hint">
                    <button className="firstrun-x" onClick={dismissHint} aria-label="Masquer"><Ico name="x" size={13} sw={2.2} /></button>
                    <span className="firstrun-spark"><Ico name="sparkle" size={15} sw={2} /></span>
                    <div className="firstrun-txt">
                      <b>Bien démarrer</b> — votre workflow hérite de la config business. Vous pouvez d'abord <button className="link-inline" onClick={() => onNav && onNav("biz_setup")}>compléter le business setup</button> (logo, contacts…), puis lancer ce premier workflow. Tout reste modifiable plus tard.
                    </div>
                  </div>}
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
                      const lvl = wfLevel(w);
                      return (
                        <button className="wf-card" key={i} onClick={() => onOpen(i)}>
                          <div className="wf-card-top">
                            <span className="ico-tile" style={{ width: 36, height: 36, borderRadius: 11 }}><Ico name="fileCheck" size={18} /></span>
                            <span className={"mode-pill " + w.mode} style={{ margin: 0, fontSize: 10.5 }}><span className="d" />{w.mode === "live" ? "Live" : "Test"}</span>
                          </div>
                          <div className="wf-card-nm">{w.name || "Workflow sans titre"}</div>
                          <div className="wf-card-meta">
                            <EidasTag levelKey={lvl} prefix="" />
                            <span className="wf-card-sub">{verifLabel(w)}</span>
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
                            <th>Niveau de risque</th>
                            <th>Type</th>
                            <th className="ta-r">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {workflows.map((w, i) => {
                            const lvl = wfLevel(w);
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
                                <td><span className="wf-row-sub">{verifLabel(w)}</span></td>
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
  // §10 — un seul type à la fois ; le choix change réellement les étapes en aval.
  function pick(id) {
    const patch = { verifType: id };
    if (id !== "authentication") patch.authSource = "onboarding_wf";
    if (id === "extraction") patch.signature = "none"; // pas de signature ni de visage en extraction
    set(patch);
  }
  const isExtraction = cfg.verifType === "extraction";
  return (
    <div className="body-inner step-anim">
      <div className="wzh"><div className="se">Étape {stepNum} / {stepTotal}</div><h2>Type de vérification</h2><p className="sub">Un workflow = un use case. Le type choisi adapte réellement les étapes suivantes.</p></div>
      <div className="opts" style={{ maxWidth: 620, marginBottom: 18 }}>
        {VERIF_TYPES.map((t) => {
          const sel = cfg.verifType === t.id;
          return (
            <button key={t.id} className={"opt" + (sel ? " sel" : "")} onClick={() => pick(t.id)}>
              <span className={"ico-tile" + (sel ? "" : " dim")}><Ico name={t.icon} size={19} /></span>
              <div className="obody"><div className="otop"><span className="ot">{t.t}</span></div><div className="od">{t.d}</div></div>
              <span className={"mark sq"} style={sel ? { borderColor: "var(--color-main)", background: "var(--color-main)" } : null}><Ico name="check" size={12} sw={3} style={sel ? { opacity: 1 } : null} /></span>
            </button>);
        })}
      </div>

      {cfg.verifType === "authentication" && (
        <section className="cfg-sec" style={{ maxWidth: 620 }}>
          <div className="cfg-sec-h"><span className="cfg-sec-t">Source d'identité</span></div>
          <div className="opts g2-doc">
            {AUTH_SOURCES.map((s) => {
              const sel = cfg.authSource === s.id;
              return (
                <button key={s.id} className={"opt col" + (sel ? " sel" : "")} onClick={() => set({ authSource: s.id })} style={{ paddingTop: 16 }}>
                  {sel && <span className="mark" style={{ position: "absolute", top: 14, right: 14 }}><Ico name="check" size={12} sw={3} /><span className="dot" /></span>}
                  <div className="obody" style={{ width: "100%" }}><div className="ot">{s.t}</div><div className="od">{s.d}</div></div>
                </button>);
            })}
          </div>
          {cfg.authSource === "onboarding_wf" && (
            <div className="note warn" style={{ marginTop: 14 }}><span className="ico"><Ico name="info" size={15} sw={1.9} /></span><div>Cette authentification s'appuie sur un <b>workflow d'onboarding</b>. Si vous n'en avez aucun d'actif, créez-le d'abord — sinon il n'y aura aucune source à réauthentifier.</div></div>
          )}
        </section>
      )}

      {!isExtraction && (
        <section className="cfg-sec" style={{ maxWidth: 620, marginTop: 18 }}>
          <div className="cfg-sec-h"><span className="cfg-sec-t">Signature électronique</span><span className="chip sm">optionnel</span></div>
          <div className="opts g3">
            {SIGNATURE_LEVELS.map((s) => {
              const sel = cfg.signature === s.id;
              return (
                <button key={s.id} className={"opt col" + (sel ? " sel" : "")} onClick={() => set({ signature: s.id })} style={{ paddingTop: 16 }}>
                  {sel && <span className="mark" style={{ position: "absolute", top: 14, right: 14 }}><Ico name="check" size={12} sw={3} /><span className="dot" /></span>}
                  <div className="obody" style={{ width: "100%" }}><div className="ot">{s.t}</div><div className="od">{s.d}</div></div>
                </button>);
            })}
          </div>
          {cfg.signature !== "none" && <span className="hint" style={{ marginTop: 10, display: "block" }}>AES et QES débloquent l'étape <b>Signature</b> (capture email ou téléphone).</span>}
        </section>
      )}

      {isExtraction && (
        <div className="note" style={{ maxWidth: 620 }}><span className="ico"><Ico name="info" size={15} sw={1.9} /></span><div>Parcours <b>non-IDV</b> : OCR seul. Les étapes Visage et Signature sont automatiquement retirées, et le résultat ne porte pas de niveau de risque.</div></div>
      )}
    </div>
  );
}

/* ---------------- Step 3 — Document ---------------- */
function MethodCard({ m, sel, disabledReason, onClick }) {
  return (
    <button className={"opt" + (sel ? " sel" : "")} onClick={onClick}>
      <span className="mark"><Ico name="check" size={12} sw={3} /><span className="dot" /></span>
      <span className={"ico-tile" + (sel ? "" : " dim")}><Ico name={m.icon} size={18} /></span>
      <div className="obody">
        <div className="otop"><span className="ot">{captureLabel(m.id)}</span><EidasTag levelKey={m.level} />{m.soon && <span className="statebadge na">En cours de développement</span>}</div>
        <div className="od">{m.d}{disabledReason ? " " + disabledReason : ""}</div>
      </div>
    </button>);
}
export function StepDocument({ cfg, set, stepNum, stepTotal }) {
  // §11 — une méthode PRINCIPALE + une méthode SECONDAIRE (fallback), chacune « Document via … ».
  function pickPrimary(m) {
    set({ docPrimary: m.id, pad: m.pad === "req", iad: false, docSecondary: cfg.docSecondary === m.id ? null : cfg.docSecondary });
  }
  function pickSecondary(m) {
    if (m.id === cfg.docPrimary) return;
    set({ docSecondary: cfg.docSecondary === m.id ? null : m.id });
  }
  const primary = CAPTURE_METHODS.find((m) => m.id === cfg.docPrimary);
  const isNfcPrimary = primary && primary.id === "nfc";
  const usesNfc = cfg.docPrimary === "nfc" || cfg.docSecondary === "nfc";
  const ach = achievedLevel(cfg);
  const coh = coherence(ach, effTarget(cfg));
  return (
    <div className="body-inner step-anim">
      <div className="wzh"><div className="se">Étape {stepNum} / {stepTotal}</div><h2>Document</h2><p className="sub">Comment le document du citoyen est collecté : une méthode principale, et une méthode secondaire en repli si la première échoue.</p></div>

      <span className="lab" style={{ display: "block", marginBottom: 11 }}>Méthode principale</span>
      <div className="opts" style={{ maxWidth: 680 }}>
        {CAPTURE_METHODS.map((m) => <MethodCard key={m.id} m={m} sel={cfg.docPrimary === m.id} onClick={() => pickPrimary(m)} />)}
      </div>
      {/* §11 — wallet en priorité : bouton de repli « je n'ai pas de wallet » → NFC. */}
      {cfg.docPrimary === "wallet" && (
        <button className="sid-btn ghost" style={{ marginTop: 12 }} onClick={() => pickPrimary(CAPTURE_METHODS.find((m) => m.id === "nfc"))}><Ico name="smartphone" size={14} sw={1.9} />Je n'ai pas de wallet → basculer en NFC</button>
      )}

      {primary && (
        <React.Fragment>
          <span className="lab" style={{ display: "block", margin: "22px 0 11px" }}>Méthode secondaire <span className="hint" style={{ fontWeight: 400 }}>· repli, optionnelle</span></span>
          <div className="opts" style={{ maxWidth: 680 }}>
            {CAPTURE_METHODS.filter((m) => m.id !== cfg.docPrimary).map((m) => <MethodCard key={m.id} m={m} sel={cfg.docSecondary === m.id} onClick={() => pickSecondary(m)} />)}
          </div>
        </React.Fragment>
      )}

      {primary && (primary.pad !== "na" || primary.iad !== "na") && (
        <div style={{ maxWidth: 680, marginTop: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}><span className="lab">Protections anti-fraude</span><span className="hint" style={{ color: "var(--muted-soft)" }}>méthode principale</span></div>
          {primary.pad !== "na" && <PadIadRow id="pad" label="PAD — anti-spoofing" desc="Détection d'attaque par présentation sur le document." state={primary.pad} on={cfg.pad} set={(v) => set({ pad: v })} />}
          {primary.iad !== "na" && <PadIadRow id="iad" label="IAD — anti-deepfake" desc="Détection d'attaque par injection sur le flux document." state={primary.iad} on={cfg.iad} set={(v) => set({ iad: v })} />}
        </div>
      )}
      {isNfcPrimary && <div className="note" style={{ maxWidth: 680, marginTop: 12 }}><span className="ico"><Ico name="info" size={15} sw={1.9} /></span><div>NFC : protections anti-fraude <b>incluses par défaut</b> pour les documents compatibles. Aucune option PAD/IAD à régler.</div></div>}

      {/* §11 — le délai / nombre de tentatives ne se pose QUE pour le NFC. */}
      {usesNfc && (
        <div style={{ maxWidth: 680, marginTop: 22 }}>
          <span className="lab" style={{ display: "block", marginBottom: 9 }}>Tentatives NFC avant repli</span>
          <p className="hint" style={{ marginBottom: 14 }}>Au-delà de ce nombre d'échecs NFC, le parcours bascule sur la méthode secondaire{cfg.docSecondary ? " (" + captureLabel(cfg.docSecondary).replace("Document via ", "") + ")" : ""}.</p>
          <div className="slider" style={{ maxWidth: 360 }}>
            <input type="range" min="2" max="5" step="1" value={cfg.nfcRetry} onChange={(e) => set({ nfcRetry: +e.target.value })} className="range-native" style={{ background: `linear-gradient(to right, var(--color-main) ${((cfg.nfcRetry - 2) / 3) * 100}%, var(--line) ${((cfg.nfcRetry - 2) / 3) * 100}%)` }} />
            <div className="ticks">{[2, 3, 4, 5].map((n) => <button key={n} className={cfg.nfcRetry === n ? "cur" : ""} onClick={() => set({ nfcRetry: n })}>{n}</button>)}</div>
          </div>
        </div>
      )}

      {coh && coh.cls === "down" && (
        <div className="note warn" style={{ maxWidth: 680, marginTop: 18 }}>
          <span className="ico"><Ico name="info" size={15} sw={1.9} /></span>
          <div>Ce choix place votre workflow <b>sous votre cible de risque</b> ({LEVELS[effTarget(cfg)].name}). Vous pouvez continuer.</div>
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
  const docLevel = (CAPTURE_METHODS.find((m) => m.id === cfg.docPrimary) || {}).level;
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
        <div>Le visage et le document fixent ensemble votre niveau de risque — le niveau atteint est le <b>minimum des deux</b>. Suggéré pour votre configuration : <b>{recoName}</b>, aligné sur votre méthode document{cfg.docPrimary ? "" : " et votre cible de risque"}. Vous restez libre de choisir un autre niveau.</div>
      </div>
    </div>
  );
}
