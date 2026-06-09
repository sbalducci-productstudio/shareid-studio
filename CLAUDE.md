# CLAUDE.md — ShareID Studio

> Source de vérité du **statut projet** (cf. règle MEMORY.md de Simon). Tenir la section
> **Status** à jour à chaque progrès. Ce fichier complète le CLAUDE.md global de Simon —
> il ne le répète pas.

## Contexte métier

**ShareID** est une société de vérification d'identité (IDV / KYC) : onboarding, authentification,
extraction de données, lecture **NFC** de documents, **face matching**, **signature électronique**
(AES / QES), conformité **eIDAS**. Simon travaille chez ShareID en tant que PM.

**ShareID Studio** est le **dashboard self-service** que ce repo implémente : un client React qui
permet aux clients de ShareID (banques, retailers, groupes) de configurer et piloter leurs
vérifications d'identité sans passer par l'équipe ShareID.

C'est un **prototype front-only** — vitrine produit haute-fidélité, pas de backend. Toute la
donnée est mockée / en `localStorage`. Voir la **frontière d'enforcement** plus bas : les règles
d'accès sont appliquées côté UI uniquement et **devront être doublées côté backend** pour être une
vraie barrière de sécurité.

⚠️ **Vocabulaire — règle stricte** : l'UI dit toujours « **niveau de risque** » (Faible / Moyen /
Élevé), **jamais « eIDAS »** côté utilisateur. Le mapping eIDAS (low / substantial / high) reste
**interne** (`core.jsx`, `EidasTag`). Ne jamais exposer « eIDAS » dans une chaîne visible.

## Périmètre fonctionnel (4 grands blocs)

| Bloc | Quoi | Fichiers |
|------|------|----------|
| **Workflow Builder** | Wizard 11 étapes : config → type → document → face → reauth → signature → scope → advanced → result → preview → integration. Génère un workflow + QR de test, bascule Test↔Live. | `App.jsx`, `steps1.jsx`, `steps2.jsx`, `core.jsx` |
| **Business Setup** | Création (wizard) & édition (one-pager) d'un Business : scope, branding, cible de risque. Normalise les business legacy. | `biz.jsx`, `biz-steps.jsx` |
| **Console / Données / Requêtes** | Dashboard & stats, historique des requêtes, file de l'opérateur (revue humaine), démos produit. | `console.jsx`, `requests.jsx`, `charts.jsx`, `admin.jsx` |
| **Rôles & permissions** | Couche d'accès complète : 4 entités, 8 rôles, matrice d'actions, visibilité données/PII, multi-org, ownership. Outil QA « View As ». | `access.js`, `session.jsx`, `selectors.js`, `qa.jsx` |

## Modèle d'accès (le cœur du projet)

**Source de vérité canonique = le Google Sheet rôles & permissions :**
https://docs.google.com/spreadsheets/d/17F3KrokJt8qkK_RdnhcoXkvS-9czI-vMJuOyQsfQT7g/edit

`src/access.js` est l'**encodage fidèle** de ce Sheet (entités, rôles, matrice d'actions, matrice de
visibilité, règles, multi-org). **Toute décision de gating / redaction dans l'UI dérive d'`access.js`** —
jamais de check ad-hoc. Si le Sheet change, mettre `access.js` à jour **et** ses tests (`access.test.js`).

- **4 entités** : ShareID · Business (variantes standard / operator-only) · Groupe · Retailer
- **8 rôles** : ShareID Admin · ShareID Sales · Retailer Admin · Group Admin · Business Admin · Agent · Operator · Expert
- **Notation matrice** : `✔` autorisé · `—` non · `◐` conditionnel (`"cond"` — scope résolu par le contexte / le sélecteur)
- **Multi-org** : un user = un email unique, plusieurs organisations, **un seul rôle par organisation** ; un sélecteur bascule l'org active et l'UI + les droits suivent.
- **Ownership** : chaque org a un owner unique (admin propriétaire) ; transfert, jamais recréation.
- **Data wall Retailer** : agrégé + facturation uniquement, **jamais la PII** (règle absolue, doublée en dur dans `piiAccess`).

### Frontière d'enforcement — IMPORTANT
`access.js` + `selectors.js` pilotent le **gating UI** et la **redaction PII côté client**. Ce **n'est pas**
une barrière de sécurité : ce que le navigateur reçoit, un user déterminé peut le lire. Les règles
marquées `SERVER-SIDE REQUIRED` dans `access.js` (data wall Retailer, scoping Operator/Expert, tout
le filtrage PII) **doivent** être ré-appliquées dans le vrai backend ShareID. On les encode ici une
fois pour que les deux couches partagent la même matrice.

## Architecture technique

- **Stack** : React 18 + Vite 6, JSX vanilla (pas de TS, pas de router — navigation par état dans `App.jsx`).
- **Pas de lib UI** : CSS maison servi depuis `public/ds/` (design system) + `studio.css` / `studio-views.css`.
- **Persistance** : `localStorage` (`shareid_studio_v1`). Jamais en mode **View As** (lecture seule).
- **Modules purs testés** : `access.js` (autorisations) et `selectors.js` (redaction PII) sont sans React/DOM → testables en isolation. C'est là que vit la logique critique.
- **Déploiement** : GitHub Pages automatique (GitHub Actions, voir `.github/`) au push sur `main`.

### Carte des fichiers `src/`
| Fichier | Rôle |
|---------|------|
| `App.jsx` | Shell : état, navigation multi-sections, rail, modales, guards, persistance |
| `core.jsx` | Constantes domaine (niveaux de risque, types, méthodes capture, étapes), helpers eIDAS, icônes |
| `steps1.jsx` / `steps2.jsx` | Les 11 étapes du Workflow Builder |
| `biz.jsx` / `biz-steps.jsx` | Business Setup (liste, wizard, édition) |
| `console.jsx` / `charts.jsx` | Dashboard & stats |
| `requests.jsx` | Historique requêtes + file opérateur |
| `admin.jsx` | Gestion users + démos produit |
| `access.js` ⭐ | **SSoT** du modèle d'accès (entités, rôles, matrices, helpers) |
| `selectors.js` | Sélecteur de redaction PII (dérive d'`access.js`) |
| `session.jsx` | Contexte session : rôle/org actifs, View As, lecture seule |
| `qa.jsx` | Outil QA rôles & permissions (matrices + View As) |

## Commandes

```bash
npm run dev      # serveur de dev Vite
npm run build    # build prod (sort dans dist/)
npm run preview  # prévisualise le build
npm test         # vitest run (suite complète)
npm run test:watch
```

## Conventions

- **UI 100 % en français** (c'est un produit FR). Code, noms de variables et commentaires structurels en anglais ; commentaires explicatifs peuvent être en français.
- **Jamais « eIDAS » dans l'UI** → « niveau de risque » (voir règle plus haut).
- **Toute logique d'accès dérive d'`access.js`** — ne pas dupliquer la matrice, ne pas faire de check de rôle en dur dans un composant.
- **Toute couleur dérive du DS** (`public/ds/colors_and_type.css`, source unique) — jamais de hex en dur dans `studio.css` / `studio-views.css` (sauf `#fff`/`#000` et ombres `rgba`). Nouvelle teinte = nouveau token documenté ; nuance = `color-mix` d'une primitive marque, pas une valeur inventée.
- **Tester la logique critique** : tout changement à `access.js` ou `selectors.js` → mettre à jour / étendre les tests. Ne pas merger avec une suite rouge.
- Petites itérations, build vert avant push.

## Comment vérifier que tout marche

1. `npm test` → la suite (logique d'accès + PII) doit être verte.
2. `npm run build` → doit compiler sans erreur.
3. `npm run dev` puis tester un parcours : créer un workflow, créer/éditer un business, basculer de rôle via **View As** dans l'outil QA et vérifier que sections + données se gating correctement.

---

## Status — au 2026-06-09

**État : sain et stable.** Repo clean, tout pushé sur `main`, déployé.

- ✅ **112 tests** passent (vitest) — 103 sur `access.js`, 9 sur `selectors.js`.
- ✅ Build prod OK (~98 kB gzip).
- ✅ Couche d'accès complète et fidèle au Sheet (entités, 8 rôles, actions, visibilité, multi-org, ownership).
- ✅ Workflow Builder, Business Setup (création + édition + normalisation legacy), Console, Requêtes, outil QA View As : tous opérationnels.
- ✅ **Design system unifié** : un seul fichier de tokens (`public/ds/colors_and_type.css`) est la source unique. `studio.css` / `studio-views.css` ne contiennent plus de `:root` parallèle ni de hex en dur (hors `#fff`/`#000` = blanc/noir marque, et ombres `rgba`). Palette étendue documentée (neutres, ambre, accents rôles) ; ramps de statut **dérivés des primitives marque** par `color-mix` (rien d'inventé). Contraste texte vérifié ≥ 4.5:1 (WCAG AA).

**Dernier travail (9 juin)** : réconciliation du design system en source unique, alignée marque
(succès `#2EC834` / erreur `#DD6342` / noir `#000000`) — base vive sur les remplissages, nuance
dérivée foncée sur les textes pour la lisibilité.

**Avant (8 juin)** : outil QA rôles & permissions (View As, multi-org, cas conditionnels ◐) ;
fix édition d'un business existant ; ajout de la couche d'accès.

**Pistes / à venir** :
- Placeholders « À venir » sur les sections Admin : *Utilisateurs* (invitations, magic-links, logs), *Entreprise*, *Paramètres* (clés API, intégrations).
- Enforcement backend des règles `SERVER-SIDE REQUIRED` (hors périmètre prototype, mais à garder en tête pour le vrai produit).
