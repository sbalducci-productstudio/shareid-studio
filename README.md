# ShareID Studio — Workflow Builder

Implémentation **réelle** (React + Vite) du prototype conçu dans Claude Design.
C'est l'assistant pas-à-pas qui permet à un client ShareID de configurer un
workflow de vérification d'identité (eIDAS 2.0), de le tester, puis de l'intégrer.

## Lancer en local

```bash
npm install
npm run dev      # ouvre http://localhost:5173
```

Autres commandes :

```bash
npm run build    # build de production dans dist/
npm run preview  # sert le build de production en local
```

## Ce que fait l'app

- **Dashboard** (accueil) avec sidebar Console / Admin et liste des workflows.
- **Assistant 9 étapes** : Configuration → Type de vérification → *(Réauthentification, conditionnelle)* → Document → Visage → Périmètre → Options avancées → Aperçu → Intégration.
- **Compteur eIDAS vivant** dans le rail : la cible est héritée de la config business, le niveau atteint se calcule en direct (minimum entre document et visage) avec badge de cohérence (`= / ↓ / ↑`).
- **Logique métier** : l'authentification verrouille l'onboarding et débloque l'étape Réauthentification ; PAD/IAD sont dérivés de la méthode document ; le passage en **Live** demande une confirmation (facturation).
- **Aperçu** : filmstrip rejouable du parcours utilisateur + récapitulatif complet.
- **Intégration** : Environment Pack (clés copiables), QR de session, options Fetch/Callback, snippets SDK (iOS / Android / Web / Flutter).
- **Persistance** : l'état est sauvegardé dans `localStorage` (clé `shareid_studio_v1`).

## Structure

```
public/
  ds/                  # Design System ShareID (CSS, fonts, logo) — repris tel quel
    colors_and_type.css
    fonts/
    logo-shareid.svg
  studio.css           # styles de l'app (identiques au prototype)
src/
  core.jsx             # constantes, logique eIDAS, icônes, atomes partagés
  steps1.jsx           # Dashboard + étapes 1 à 4
  steps2.jsx           # étapes 5 à 9
  App.jsx              # shell : état, navigation, rail + meter, modales, persistance
  main.jsx             # point d'entrée React
index.html
```

## Notes d'implémentation

- Le prototype d'origine utilisait React via Babel dans le navigateur et des
  globals `window`. Ici, tout est en **modules ES** propres avec imports/exports.
- Le **CSS est identique** au prototype (rendu pixel-perfect) ; seules les
  références d'assets passent en chemins absolus (`/ds/...`).
- Le **Tweaks panel** du prototype était un outil du canvas Claude Design
  (protocole `postMessage` vers l'hôte) — il n'a pas de rôle dans l'app réelle et
  a été retiré. Le thème par défaut (accent / densité / style de cartes) reste
  appliqué. Il peut être reconverti en vrai panneau de réglages si besoin.
- Les données (clés API, QR, sessions, statistiques) sont **simulées** — c'est un
  front. Le branchement à l'API ShareID est l'étape suivante.
