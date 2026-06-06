/* ShareID Studio — lightweight charts (hand-built SVG/CSS) + seeded console data.
   No chart library — everything matches the DS tokens. Exposed on window. */


import React from "react";

/* ----------------------------- helpers ----------------------------- */
export function fmt(n) {
  if (n == null) return "—";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1).replace(".", ",") + " M";
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(n % 1e3 === 0 ? 0 : 1).replace(".", ",") + " k";
  return String(n).replace(".", ",");
}
export function fmtFull(n) { return n == null ? "—" : n.toLocaleString("fr-FR"); }
export function pct(n, d = 0) { return (n).toFixed(d).replace(".", ",") + " %"; }

/* ----------------------------- StatCard ----------------------------- */
export function Trend({ delta, invert = false }) {
  if (delta == null) return null;
  const up = delta >= 0;
  const good = invert ? !up : up;
  return (
    <span className={"trend " + (good ? "good" : "bad")}>
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {up ? <path d="M2 8.5 6 4l4 4.5" /> : <path d="M2 3.5 6 8l4-4.5" />}
      </svg>
      {Math.abs(delta).toFixed(1).replace(".", ",")} %
    </span>);
}

export function StatCard({ label, value, unit, delta, invert, spark, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-top"><span className="stat-label">{label}</span></div>
      <div className="stat-value">{value}{unit && <span className="stat-unit">{unit}</span>}</div>
      <div className="stat-foot">
        <Trend delta={delta} invert={invert} />
        {sub && <span className="stat-sub">{sub}</span>}
      </div>
      {spark && <div className="stat-spark"><Sparkline data={spark} /></div>}
    </div>);
}

/* ----------------------------- Sparkline ----------------------------- */
export function Sparkline({ data, w = 120, h = 30, color }) {
  const max = Math.max(...data), min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => [i / (data.length - 1) * w, h - 3 - (v - min) / rng * (h - 6)]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = d + ` L${w} ${h} L0 ${h} Z`;
  const c = color || "var(--color-main)";
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="spark">
      <path d={area} fill={c} opacity="0.08" />
      <path d={d} fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>);
}

/* ----------------------------- Funnel ----------------------------- */
export function Funnel({ stages }) {
  const top = stages[0].v;
  return (
    <div className="funnel">
      {stages.map((s, i) => {
        const w = Math.max(8, s.v / top * 100);
        const conv = i > 0 ? s.v / stages[i - 1].v * 100 : 100;
        return (
          <div className="fn-row" key={s.k}>
            <div className="fn-head">
              <span className="fn-name">{s.k}</span>
              <span className="fn-vals"><b>{fmtFull(s.v)}</b>{i > 0 && <span className="fn-conv">{pct(conv, 1)}</span>}</span>
            </div>
            <div className="fn-track">
              <div className={"fn-bar " + (s.tone || "")} style={{ width: w + "%" }} />
            </div>
          </div>);
      })}
    </div>);
}

/* ----------------------------- Donut ----------------------------- */
export function Donut({ data, size = 140, thickness = 18, center }) {
  const total = data.reduce((s, d) => s + d.v, 0);
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  let off = 0;
  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {data.map((d, i) => {
            const frac = d.v / total;
            const dash = frac * circ;
            const seg = (
              <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={d.color} strokeWidth={thickness}
                strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-off}
                strokeLinecap="butt" />);
            off += dash;
            return seg;
          })}
        </g>
        {center && <text x="50%" y="48%" textAnchor="middle" className="donut-c1">{center.v}</text>}
        {center && <text x="50%" y="62%" textAnchor="middle" className="donut-c2">{center.l}</text>}
      </svg>
      <div className="donut-legend">
        {data.map((d, i) =>
          <div className="dl-row" key={i}>
            <span className="dl-dot" style={{ background: d.color }} />
            <span className="dl-name">{d.k}</span>
            <span className="dl-val">{pct(d.v / total * 100, 0)}{d.sub && <span className="dl-sub"> · {d.sub}</span>}</span>
          </div>)}
      </div>
    </div>);
}

/* ----------------------------- LineChart ----------------------------- */
export function LineChart({ data, h = 150, peak = true, color, labelEvery = 1 }) {
  const w = 640;
  const pad = { l: 4, r: 4, t: 12, b: 22 };
  const vals = data.map((d) => d.v);
  const max = Math.max(...vals) * 1.12, min = 0;
  const rng = max - min || 1;
  const ix = (i) => pad.l + i / (data.length - 1) * (w - pad.l - pad.r);
  const iy = (v) => pad.t + (1 - (v - min) / rng) * (h - pad.t - pad.b);
  const line = data.map((d, i) => (i ? "L" : "M") + ix(i).toFixed(1) + " " + iy(d.v).toFixed(1)).join(" ");
  const area = line + ` L${ix(data.length - 1)} ${h - pad.b} L${ix(0)} ${h - pad.b} Z`;
  const c = color || "var(--color-main)";
  const peakIdx = peak ? vals.indexOf(Math.max(...vals)) : -1;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="linechart">
      {[0.25, 0.5, 0.75].map((g, i) =>
        <line key={i} x1={pad.l} x2={w - pad.r} y1={pad.t + g * (h - pad.t - pad.b)} y2={pad.t + g * (h - pad.t - pad.b)} className="lc-grid" />)}
      <path d={area} fill={c} opacity="0.07" />
      <path d={line} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {peakIdx >= 0 &&
        <g>
          <line x1={ix(peakIdx)} x2={ix(peakIdx)} y1={iy(vals[peakIdx])} y2={h - pad.b} className="lc-peakline" />
          <circle cx={ix(peakIdx)} cy={iy(vals[peakIdx])} r="4" fill="#fff" stroke={c} strokeWidth="2" />
        </g>}
      {data.map((d, i) => i % labelEvery === 0 &&
        <text key={i} x={ix(i)} y={h - 6} textAnchor="middle" className="lc-xlab">{d.k}</text>)}
    </svg>);
}

/* ----------------------------- BarRows (top 5) ----------------------------- */
export function BarRows({ data, accent }) {
  const max = Math.max(...data.map((d) => d.v));
  return (
    <div className="barrows">
      {data.map((d, i) =>
        <div className="br-row" key={i}>
          <span className="br-name">{d.flag && <span className="br-flag">{d.flag}</span>}{d.k}</span>
          <div className="br-track"><div className="br-bar" style={{ width: d.v / max * 100 + "%", background: accent || "var(--color-main)" }} /></div>
          <span className="br-val">{d.pct != null ? pct(d.pct, 0) : fmtFull(d.v)}</span>
        </div>)}
    </div>);
}

/* ----------------------------- Gauge (consumption vs quota) ----------------------------- */
export function Gauge({ used, total, projection }) {
  const frac = Math.min(1, used / total);
  const projFrac = projection ? Math.min(1, projection / total) : null;
  const size = 200, sw = 16, r = (size - sw) / 2, cx = size / 2, cy = size / 2;
  const startA = Math.PI * 0.75, endA = Math.PI * 2.25;
  const span = endA - startA;
  function pt(a) { return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
  function arc(a0, a1) {
    const [x0, y0] = pt(a0), [x1, y1] = pt(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  const tone = frac >= 1 ? "var(--color-error)" : frac >= 0.8 ? "#C9851F" : "var(--color-main)";
  return (
    <div className="gauge">
      <svg width={size} height={size * 0.78} viewBox={`0 0 ${size} ${size * 0.86}`}>
        <path d={arc(startA, endA)} fill="none" stroke="var(--line)" strokeWidth={sw} strokeLinecap="round" />
        {projFrac &&
          <path d={arc(startA, startA + span * projFrac)} fill="none" stroke={tone} strokeWidth={sw} strokeLinecap="round" opacity="0.22" />}
        <path d={arc(startA, startA + span * frac)} fill="none" stroke={tone} strokeWidth={sw} strokeLinecap="round" />
        <text x="50%" y="52%" textAnchor="middle" className="gauge-v">{pct(frac * 100, 0)}</text>
        <text x="50%" y="66%" textAnchor="middle" className="gauge-l">de l'enveloppe</text>
      </svg>
      <div className="gauge-meta">
        <div><b>{fmt(used)}</b><span>consommés</span></div>
        <div className="sep" />
        <div><b>{fmt(total)}</b><span>contractés</span></div>
        {projection != null && <><div className="sep" /><div><b>{fmt(projection)}</b><span>projection fin de mois</span></div></>}
      </div>
    </div>);
}

/* ----------------------------- seeded console data ----------------------------- */
export const CONSOLE_DATA = {
  kpis: [
    { id: "vol", label: "Vérifications soumises", value: "48 920", delta: 7.4, spark: [32, 35, 33, 38, 41, 39, 44, 46, 45, 49], sub: "30 derniers jours" },
    { id: "compl", label: "Taux de complétion", value: "82,3", unit: " %", delta: 2.1, sub: "soumises ÷ démarrées" },
    { id: "pass", label: "Taux d'acceptation", value: "91,6", unit: " %", delta: -0.8, invert: false, sub: "miroir rejet 8,4 %" },
    { id: "time", label: "Temps de traitement", value: "34", unit: " s", delta: -5.2, invert: true, sub: "médiane IA" },
  ],
  funnel: [
    { k: "Démarrées", v: 59440 },
    { k: "Soumises", v: 48920 },
    { k: "Décision IA", v: 48920 },
    { k: "Acceptées", v: 44810, tone: "good" },
    { k: "Revue humaine", v: 2180, tone: "warn" },
    { k: "Rejetées", v: 1930, tone: "bad" },
  ],
  mix: [
    { k: "NFC", v: 21400, color: "var(--color-main)", sub: "pass 96 %" },
    { k: "Photo", v: 18960, color: "#7E97E8", sub: "pass 88 %" },
    { k: "Vidéo", v: 8560, color: "#C2D0F4", sub: "pass 91 %" },
  ],
  countries: [
    { k: "France", flag: "🇫🇷", v: 28140, pct: 57 },
    { k: "Belgique", flag: "🇧🇪", v: 7340, pct: 15 },
    { k: "Espagne", flag: "🇪🇸", v: 4900, pct: 10 },
    { k: "Italie", flag: "🇮🇹", v: 4410, pct: 9 },
    { k: "Allemagne", flag: "🇩🇪", v: 2940, pct: 6 },
  ],
  docs: [
    { k: "Carte d'identité", v: 26900, pct: 55 },
    { k: "Passeport", v: 12230, pct: 25 },
    { k: "Titre de séjour", v: 5870, pct: 12 },
    { k: "Permis de conduire", v: 3920, pct: 8 },
  ],
  platforms: [
    { k: "iOS", v: 22500, pct: 46 },
    { k: "Android", v: 17600, pct: 36 },
    { k: "Web", v: 8820, pct: 18 },
  ],
  consumption: [
    { k: "S1", v: 9800 }, { k: "S5", v: 11200 }, { k: "S9", v: 10400 }, { k: "S13", v: 13800 },
    { k: "S17", v: 12600 }, { k: "S21", v: 15200 }, { k: "S25", v: 14100 }, { k: "S29", v: 18900 },
    { k: "S33", v: 16400 }, { k: "S37", v: 17800 }, { k: "S41", v: 16900 }, { k: "S45", v: 19400 },
  ],
  quota: { used: 7340000, total: 10000000, projection: 8950000 },
  alerts: [
    { tone: "warn", t: "Quota à 80 %", d: "L'enveloppe annuelle de tokens atteint 73 % avec une projection à 89 % en fin de mois. Owner BA + Sales notifiés.", icon: "wallet" },
    { tone: "bad", t: "Pic d'échecs NFC", d: "Le taux d'échec NFC sur iOS a augmenté de 11 pts vs la baseline 7 jours (workflow « Onboarding KYC particuliers »).", icon: "shieldAlert" },
    { tone: "good", t: "Complétion en hausse", d: "Le taux de complétion progresse de +2,1 pts sur 7 jours après la simplification de l'étape document.", icon: "activity" },
  ],
};

/* requests history — seeded */
export const REQUESTS = [
  { id: "rq_8F2A", name: "Camille Laurent", dob: "1991-04-12", doc: "Carte d'identité", country: "France", flag: "🇫🇷", date: "2026-06-05 14:22", method: "NFC", level: "high", status: "ok", verdict: "Accepté", score: 98, business: "Néobanque Atlas", workflow: "Onboarding KYC particuliers", mode: "live" },
  { id: "rq_7C19", name: "Thomas Mercier", dob: "1985-11-30", doc: "Passeport", country: "Belgique", flag: "🇧🇪", date: "2026-06-05 13:58", method: "Photo", level: "low", status: "retry", verdict: "Reprise", score: 61, business: "Néobanque Atlas", workflow: "Onboarding KYC particuliers", mode: "live" },
  { id: "rq_6B04", name: "Sofia Marchetti", dob: "1996-02-08", doc: "Carte d'identité", country: "Italie", flag: "🇮🇹", date: "2026-06-05 13:41", method: "Vidéo", level: "subst", status: "review", verdict: "En revue", score: 73, business: "Assurance Prévia", workflow: "Réauthentification wallet", mode: "live" },
  { id: "rq_5A88", name: "Lucas Fernández", dob: "1989-07-19", doc: "Titre de séjour", country: "Espagne", flag: "🇪🇸", date: "2026-06-05 12:15", method: "NFC", level: "high", status: "ok", verdict: "Accepté", score: 95, business: "Néobanque Atlas", workflow: "Onboarding KYC particuliers", mode: "live" },
  { id: "rq_4F30", name: "Emma Schneider", dob: "1993-09-25", doc: "Carte d'identité", country: "Allemagne", flag: "🇩🇪", date: "2026-06-05 11:47", method: "Photo", level: "low", status: "fail", verdict: "Rejeté", score: 22, business: "Marketplace Volt", workflow: "Vérification vendeur", mode: "test" },
  { id: "rq_3E72", name: "Noah Dubois", dob: "1998-01-03", doc: "Passeport", country: "France", flag: "🇫🇷", date: "2026-06-05 10:33", method: "NFC", level: "high", status: "ok", verdict: "Accepté", score: 99, business: "Néobanque Atlas", workflow: "Onboarding KYC particuliers", mode: "live" },
  { id: "rq_2D55", name: "Inès Moreau", dob: "1990-12-14", doc: "Carte d'identité", country: "France", flag: "🇫🇷", date: "2026-06-05 09:50", method: "Vidéo", level: "subst", status: "review", verdict: "En revue", score: 68, business: "Assurance Prévia", workflow: "Onboarding sinistres", mode: "live" },
  { id: "rq_1C18", name: "Hugo Petit", dob: "1987-06-22", doc: "Permis de conduire", country: "France", flag: "🇫🇷", date: "2026-06-04 18:12", method: "Photo", level: "low", status: "ok", verdict: "Accepté", score: 84, business: "Marketplace Volt", workflow: "Vérification vendeur", mode: "live" },
];

/* operator queue — seeded */
export const OPERATOR_QUEUE = [
  { id: "rq_6B04", name: "Sofia Marchetti", workflow: "Réauthentification wallet", reason: "uncertainty", reasonLabel: "Incertitude IA", date: "il y a 6 min", country: "Italie", flag: "🇮🇹", sla: "ok", slaLabel: "32 min restantes", method: "Vidéo", level: "subst", scorePad: 71, scoreIad: 80, scoreAuth: 73 },
  { id: "rq_2D55", name: "Inès Moreau", workflow: "Onboarding sinistres", reason: "uncertainty", reasonLabel: "Incertitude IA", date: "il y a 18 min", country: "France", flag: "🇫🇷", sla: "warn", slaLabel: "9 min restantes", method: "Vidéo", level: "subst", scorePad: 64, scoreIad: 77, scoreAuth: 68 },
  { id: "rq_9A11", name: "Karim Haddad", workflow: "Onboarding KYC particuliers", reason: "rejected", reasonLabel: "Rejet à valider", date: "il y a 24 min", country: "France", flag: "🇫🇷", sla: "warn", slaLabel: "4 min restantes", method: "Photo", level: "low", scorePad: 41, scoreIad: 55, scoreAuth: 38 },
  { id: "rq_8B02", name: "Léa Rousseau", workflow: "Onboarding KYC particuliers", reason: "accepted", reasonLabel: "Contrôle aléatoire", date: "il y a 41 min", country: "France", flag: "🇫🇷", sla: "ok", slaLabel: "1 h 12 restantes", method: "NFC", level: "high", scorePad: 88, scoreIad: 92, scoreAuth: 90 },
  { id: "rq_7C90", name: "Marco Bianchi", workflow: "Réauthentification wallet", reason: "rejected", reasonLabel: "Rejet à valider", date: "il y a 53 min", country: "Italie", flag: "🇮🇹", sla: "risk", slaLabel: "SLA dépassé", method: "Vidéo", level: "subst", scorePad: 52, scoreIad: 61, scoreAuth: 49 },
];

export const OPERATOR_STATS = { handled: 37, avgTime: "2 min 40", aiAgree: 91 };
