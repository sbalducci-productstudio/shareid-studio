/* ShareID Studio — core: constants, eIDAS logic, icons, shared atoms.
   Converti des globals `window` du prototype vers des exports ES modules. */
import React from "react";

/* ----------------------------- icons ----------------------------- */
export const ICONS = {
  check: <path d="M20 6 9 17l-5-5" />,
  shieldAlert: <g><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4M12 16h.01" /></g>,
  fileCheck: <g><path d="M14 2v6h6" /><path d="M4 22V4a2 2 0 0 1 2-2h8l6 6v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" /><path d="m9 15 2 2 4-4" /></g>,
  zap: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />,
  userCheck: <g><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="m17 11 2 2 4-4" /></g>,
  refresh: <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />,
  lock: <g><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></g>,
  info: <g><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></g>,
  clock: <g><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></g>,
  doc: <g><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></g>,
  faceScan: <g><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="12" cy="10" r="3" /><path d="M6.5 19a6 6 0 0 1 11 0" /></g>,
  video: <g><path d="M15 8h4l-2 4 2 4h-4M3 5h12v14H3z" /><circle cx="9" cy="11" r="2.5" /></g>,
  shieldFace: <g><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></g>,
  smile: <g><circle cx="12" cy="12" r="9" /><path d="M9 10h.01M15 10h.01M9 15a4 4 0 0 0 6 0" /></g>,
  wallet: <g><path d="M3 7a2 2 0 0 1 2-2h12v4M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2Z" /><path d="M17 13h.01" /></g>,
  link: <g><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></g>,
  globe: <g><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></g>,
  search: <g><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></g>,
  grid: <g><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 17.5h7M17.5 14v7" /></g>,
  rows: <g><rect x="3" y="4.5" width="18" height="6" rx="1.5" /><rect x="3" y="13.5" width="18" height="6" rx="1.5" /></g>,
  phone: <g><rect x="5" y="2" width="14" height="20" rx="3" /><path d="M11 18h2" /></g>,
  copy: <g><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></g>,
  play: <path d="M8 5v14l11-7z" />,
  chevL: <path d="m15 18-6-6 6-6" />,
  chevUp: <path d="m6 15 6-6 6 6" />,
  chevDown: <path d="m6 9 6 6 6-6" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  back: <path d="M19 12H5M11 18l-6-6 6-6" />,
  eye: <g><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></g>,
  share: <g><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5" /></g>,
  sparkle: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />,
  smartphone: <g><rect x="5" y="2" width="14" height="20" rx="3" /><path d="M11 18h2" /></g>,
  plus: <path d="M12 5v14M5 12h14" />,
  key: <g><circle cx="7.5" cy="15.5" r="4.5" /><path d="m10.5 12.5 8-8M15 4.5 18.5 8M14 9l2 2" /></g>,
  book: <g><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></g>,
  settings: <g><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></g>,
  chevR: <path d="m9 18 6-6-6-6" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  home: <g><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h14V9.5" /><path d="M9.5 20v-6h5v6" /></g>,
  activity: <path d="M3 12h4l3 8 4-16 3 8h4" />,
  layers: <g><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></g>,
  users: <g><path d="M16 19a4 4 0 0 0-8 0" /><circle cx="12" cy="8" r="3.2" /><path d="M22 18a3.2 3.2 0 0 0-4-3.1M2 18a3.2 3.2 0 0 1 4-3.1" /><circle cx="18.5" cy="9" r="2.2" /><circle cx="5.5" cy="9" r="2.2" /></g>,
  building: <g><rect x="4" y="3" width="11" height="18" rx="1.5" /><path d="M15 8h4a1.5 1.5 0 0 1 1.5 1.5V21" /><path d="M8 7h3M8 11h3M8 15h3M18 12h.01M18 16h.01" /></g>,
};

export function Ico({ name, size = 18, sw = 1.75, fill = false, style }) {
  const p = ICONS[name] || null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"}
      stroke={fill ? "none" : "currentColor"} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {p}
    </svg>
  );
}

/* ----------------------------- domain ----------------------------- */
export const LEVELS = { low: { rank: 1, name: "Faible" }, subst: { rank: 2, name: "Substantiel" }, high: { rank: 3, name: "Élevé" } };
export const LEVEL_KEYS = ["low", "subst", "high"];

export const DRIVERS = [
  { id: "fraud", icon: "shieldAlert", t: "Lutte contre la fraude", d: "Détecter et bloquer les usurpations d'identité." },
  { id: "compliance", icon: "fileCheck", t: "Conformité réglementaire", d: "eIDAS, Code monétaire et financier, autres obligations." },
  { id: "experience", icon: "zap", t: "Amélioration de l'expérience", d: "Fluidifier le parcours et réduire les frictions." },
];

export const DOC_METHODS = [
  { id: "nfc", t: "NFC", level: "high", d: "Lecture de la puce. Nécessite un document et un téléphone compatibles NFC.", pad: "na", iad: "na" },
  { id: "nfc_fallback", t: "NFC avec fallback vidéo", level: "subst", d: "Tente le NFC, bascule en capture vidéo en cas d'échec.", pad: "req", iad: "opt" },
  { id: "video", t: "Vidéo", level: "subst", d: "Capture vidéo du document.", pad: "req", iad: "opt" },
  { id: "photo", t: "Photo", level: "low", d: "Capture photo unique.", pad: "opt", iad: "na" },
];

export const FACE_PRESETS = [
  { id: "photo", icon: "faceScan", dim: true, level: "low", t: "Photo simple", d: "Selfie unique." },
  { id: "video_pad", icon: "video", level: "subst", t: "Vidéo + PAD", d: "Capture vidéo avec anti-spoofing (liveness)." },
  { id: "video_pad_iad", icon: "shieldFace", reco: true, level: "high", t: "Vidéo + PAD + IAD", d: "Vidéo avec anti-spoofing et anti-deepfake." },
];

export const REAUTH = [
  { id: "mfa_smile", icon: "smile", t: "MFA Smile", d: "Le sourire de réauthentification. Rapide, sans nouvelle capture de document." },
  { id: "wallet_binding", icon: "link", t: "Wallet binding", d: "Liaison à un wallet pour sécuriser les réauthentifications ultérieures." },
  { id: "wallet", icon: "wallet", t: "Wallet (EUDI)", d: "Réauthentification via un wallet d'identité EUDI.", soon: true },
];

export const DOC_TYPES = [
  { id: "id_card", t: "Carte nationale d'identité", short: "CNI", art: "card" },
  { id: "passport", t: "Passeport", short: "Passeport", art: "passport" },
  { id: "driving_licence", t: "Permis de conduire", short: "Permis", art: "licence" },
  { id: "residence_permit", t: "Titre de séjour", short: "Titre de séjour", art: "residence" },
];

export const ZONES = [
  { id: "eu", t: "Union européenne", n: 27 },
  { id: "europe", t: "Europe", n: 44 },
  { id: "world", t: "Monde entier", n: 156 },
];
export const COUNTRY_SUGGEST = ["France", "Belgique", "Italie", "Espagne", "Allemagne", "Portugal", "Pays-Bas", "Maroc", "Royaume-Uni", "Suisse", "Luxembourg", "Irlande"];
export const BUSINESS_MAX_COUNTRIES = 156;

/* eIDAS achieved level = minimum of the document method and the face control. */
export function achievedLevel(cfg) {
  if (!cfg.docMethod) return null;
  const dm = DOC_METHODS.find((x) => x.id === cfg.docMethod);
  if (!dm) return null;
  const fp = FACE_PRESETS.find((x) => x.id === cfg.faceLevel);
  const docRank = LEVELS[dm.level].rank;
  const faceRank = fp ? LEVELS[fp.level].rank : docRank;
  const rank = Math.min(docRank, faceRank);
  return LEVEL_KEYS.find((k) => LEVELS[k].rank === rank) || dm.level;
}
export function coherence(achievedKey, targetKey) {
  if (!achievedKey || !targetKey) return null;
  const a = LEVELS[achievedKey].rank, t = LEVELS[targetKey].rank;
  if (a === t) return { cls: "eq", label: "= cible", long: "Au niveau cible" };
  if (a < t) return { cls: "down", label: "↓ sous la cible", long: "Sous la cible" };
  return { cls: "up", label: "↑ au-delà", long: "Au-delà de la cible" };
}
export function eidasTagCls(key) { return key === "high" ? "high" : key === "subst" ? "subst" : "low"; }

/* eIDAS target is inherited from the business config; the workflow may override it. */
export const BUSINESS_EIDAS = "subst";
export function effTarget(cfg) { return cfg.eidasTarget || BUSINESS_EIDAS; }

/* Wizard steps. cond steps drop out when their predicate is false. */
export const STEPS = [
  { n: 1, key: "config", nm: "Configuration" },
  { n: 2, key: "type", nm: "Type de vérification" },
  { n: 3, key: "reauth", nm: "Réauthentification", cond: (c) => c.authentication },
  { n: 4, key: "document", nm: "Document" },
  { n: 5, key: "face", nm: "Visage" },
  { n: 6, key: "scope", nm: "Périmètre" },
  { n: 7, key: "advanced", nm: "Options avancées" },
  { n: 8, key: "preview", nm: "Aperçu" },
  { n: 9, key: "integration", nm: "Intégration" },
];

export const DEFAULT_CFG = {
  name: "",
  drivers: [],
  eidasTarget: null,
  onboarding: true,
  authentication: false,
  docMethod: null,
  pad: true,
  iad: false,
  faceLevel: "video_pad_iad",
  reauthOrder: ["mfa_smile", "wallet_binding"],
  reauthOn: { mfa_smile: true, wallet_binding: true, wallet: false },
  scopeSource: "inherited",
  zones: ["eu"],
  countries: [],
  docTypes: ["id_card", "passport"],
  operatorReview: true,
  operatorMode: "always",
  nfcRetry: 3,
  fetchResult: true,
  callback: true,
  mode: "test",
};

/* small shared atoms */
export function EidasTag({ levelKey, prefix = "eIDAS" }) {
  if (!levelKey) return null;
  return <span className={"eidas-tag " + eidasTagCls(levelKey)}>{prefix ? prefix + " · " : ""}{LEVELS[levelKey].name}</span>;
}
export function Coh({ levelKey, target }) {
  const c = coherence(levelKey, target);
  if (!c) return null;
  return <span className={"coh " + c.cls}>{c.label}</span>;
}
export function Mark({ sel, square }) {
  return <span className={"mark" + (square ? " sq" : "")}><Ico name="check" size={12} sw={3} />{!square && <span className="dot" />}</span>;
}

/* Small monoline illustrations of each accepted document type. */
export function DocArt({ art, w = 78 }) {
  const c = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" };
  const portrait = <g><rect x="9" y="14" width="17" height="22" rx="2.5" /><circle cx="17.5" cy="22" r="3.4" /><path d="M12 32a5.5 5.5 0 0 1 11 0" /></g>;
  const lines = <g><path d="M33 16h30" /><path d="M33 23h30" /><path d="M33 30h20" /></g>;
  const inner = {
    card: <g>{portrait}{lines}</g>,
    passport: <g><rect x="16" y="4" width="46" height="40" rx="3" /><circle cx="39" cy="17" r="7" /><path d="M39 10v14M32 17h14" /><path d="M28 32h22M28 38h16" /></g>,
    licence: <g>{portrait}<path d="M33 16h30" /><path d="M33 23h21" /><circle cx="57" cy="31" r="6" /><circle cx="57" cy="31" r="1.4" /><path d="M57 25v3M57 34v3M51 31h3M60 31h3" /></g>,
    residence: <g>{portrait}<path d="M33 30h26" /><g transform="translate(46 18)"><circle cx="0" cy="-7" r="1" /><circle cx="6" cy="-5" r="1" /><circle cx="9" cy="0" r="1" /><circle cx="6" cy="5" r="1" /><circle cx="0" cy="7" r="1" /><circle cx="-6" cy="5" r="1" /><circle cx="-9" cy="0" r="1" /><circle cx="-6" cy="-5" r="1" /></g></g>,
  }[art];
  return (
    <svg width={w} viewBox="0 0 72 48" {...c}>
      <rect x="2" y="2" width="68" height="44" rx="5" />
      {inner}
    </svg>
  );
}
