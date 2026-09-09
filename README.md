# DieEstimator

Outil de chiffrage de surface silicium pour SoC : bibliothèque d'IP (Digital GO1/GO2, Mémoire, NVM, Analogique), paramétrage technologique, scénarios de BOM, matrice multi-scénarios, vue de floorplan, comparaison de scénarios. Interface bilingue français / anglais.

## Démarrage local

Prérequis : [Node.js](https://nodejs.org/) 18 ou plus récent.

```bash
npm install
npm run dev
```

Ouvre ensuite l'URL affichée (généralement `http://localhost:5173`).

## Build de production

```bash
npm run build
```

Le résultat est généré dans `dist/`. Pour le prévisualiser localement :

```bash
npm run preview
```

## Déploiement sur GitHub Pages

Ce projet inclut un workflow GitHub Actions (`.github/workflows/deploy.yml`) qui build et publie automatiquement le contenu de `dist/` à chaque `push` sur la branche `main`.

Pour l'activer :

1. Pousse ce projet sur un dépôt GitHub.
2. Dans le dépôt : **Settings → Pages → Source**, sélectionne **GitHub Actions**.
3. Pousse un commit sur `main` (ou lance le workflow manuellement depuis l'onglet **Actions**).
4. L'app sera disponible à `https://<ton-utilisateur>.github.io/<nom-du-repo>/`.

Le fichier `vite.config.js` utilise `base: "./"` (chemins relatifs), donc aucune configuration supplémentaire n'est nécessaire pour un dépôt de projet (`user.github.io/repo/`) ou un site racine (`user.github.io/`).

## Stockage des données

L'application utilise `window.storage` (API disponible dans les artifacts Claude.ai). Hors de cet environnement, `src/storage-shim.js` fournit une implémentation compatible basée sur `localStorage` du navigateur : les données (bibliothèque IP, technologie, scénarios) sont donc sauvegardées localement, par navigateur/appareil, et ne sont pas synchronisées entre appareils ni partagées.

## Structure du projet

```
index.html            Point d'entrée HTML (Vite)
src/main.jsx           Montage React + import du shim de stockage
src/storage-shim.js     Implémentation localStorage de window.storage
src/App.jsx             Application complète (tous les onglets et composants)
.github/workflows/      Workflow de déploiement GitHub Pages
```

## Stack technique

- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- [recharts](https://recharts.org/) pour les graphiques
- [lucide-react](https://lucide.dev/) pour les icônes
