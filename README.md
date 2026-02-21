# 📝 CollabEdit — Test Technique Frontend

![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Vite](https://img.shields.io/badge/Vite-6-purple) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-cyan) ![Zustand](https://img.shields.io/badge/State-Zustand-orange)

Une simulation d'éditeur de texte collaboratif temps réel.

## 🚀 Démarrage Rapide

### Prérequis

- Node.js (v18+)
- npm

### Installation

```bash
# Installer les dépendances
npm install
```

### Lancer le projet

```bash
# Démarrer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`.

## 📚 Documentation

Une documentation complète expliquant l'architecture et le fonctionnement du projet est disponible dans le fichier [DOCUMENTATION.md](./DOCUMENTATION.md).

## ✨ Fonctionnalités

- **Édition collaborative simulée** : 3 utilisateurs virtuels (Alice, Bob, Charlie) modifient le document en temps réel.
- **Réseau imparfait** : Simulation de latence (100-1500ms) et de perte de paquets (1%).
- **Interface riche** :
  - Mode sombre / clair
  - Curseurs distants colorés
  - Chat intégré
  - Logs d'activité
  - Console de débogage système
- **Performance** : Architecture optimisée (Zustand + React.memo) pour éviter les re-renders inutiles.

## 🏗️ Architecture Technique

- **State Management** : Zustand (stores isolés)
- **Styling** : Tailwind CSS v4
- **Icônes** : Lucide React
- **Simulation** : Moteur maison (`src/simulation/`) pour orchestrer les bots et le réseau.

---

_Réalisé pour le test technique NiyiExpertise._
