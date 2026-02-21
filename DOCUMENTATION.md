# 📘 Documentation Complète - CollabEdit

Bienvenue dans la documentation de **CollabEdit** ! Ce projet est une simulation d'un éditeur de texte collaboratif (type Google Docs) réalisé avec React.

Cette documentation est conçue pour t'expliquer **pas à pas** comment le projet fonctionne, même si tu débutes.

---

## 🌍 Vue d'ensemble

L'application simule 3 autres utilisateurs connectés en même temps que toi sur un document.

- **Tu peux écrire** : Le texte s'ajoute et tout le monde "voit" tes modifs.
- **Les autres écrivent** : Tu vois leurs curseurs bouger et le texte apparaître.
- **Le réseau est capricieux** : Parfois ça lag (latence), parfois ça coupe (déconnexion), pour imiter la vraie vie.

---

## 🏗️ Architecture du Projet

Le projet est rangé logiquement dans le dossier `src/` (source). Voici ce que fait chaque dossier :

### 1. `components/` (Les briques de Lego)

C'est ici que se trouve tout ce qui s'affiche à l'écran. L'interface est découpée en 5 zones :

- **`Header/`** : La barre du haut. Elle contient le titre du document, le statut de connexion (le petit point vert/jaune/rouge) et les boutons Annuler/Rétablir.
- **`Sidebar/`** : La colonne de gauche. Elle affiche la liste des utilisateurs (Toi + Alice, Bob, Charlie).
- **`Editor/`** : La zone centrale où on écrit. C'est le cœur de l'appli.
- **`RightPanel/`** : La colonne de droite. Elle contient l'historique des actions (Logs) et le Chat.
- **`Footer/`** : La barre du bas. C'est une console technique qui affiche des stats (latence, mémoire, etc.).

### 2. `stores/` (Le cerveau de l'appli)

On utilise **Zustand** pour gérer la "mémoire" de l'application. Imagine que ce sont des bases de données temporaires dans le navigateur.

- **`useDocumentStore.ts`** : Stocke le texte du document et l'historique (pour faire Ctrl+Z).
- **`useUsersStore.ts`** : Stocke la liste des utilisateurs, leurs positions de curseur et leurs statuts (en ligne, écrit...).
- **`useNetworkStore.ts`** : Stocke l'état du réseau simulé (latence en ms, connecté ou non).
- **`useChatStore.ts`** : Stocke les messages du chat et les logs d'activité.

### 3. `simulation/` (Le marionnettiste)

C'est la partie "magique" qui fait vivre l'application sans vrai serveur.

- **`SimulationEngine.ts`** : C'est le chef d'orchestre. Il lance des boucles (intervalles) pour :
  - Faire écrire Alice, Bob et Charlie aléatoirement.
  - Envoyer des messages dans le chat.
  - Créer des micro-coupures réseau.
- **`NetworkSimulator.ts`** : Ajoute artificiellement du délai (latence) à chaque action pour faire "vrai".

---

## 🚀 Comment ça marche ? (Le flux de données)

### Exemple : Quand tu tapes une lettre

1. **L'événement** : Tu appuies sur une touche dans `Editor.tsx`.
2. **L'action** : Le composant appelle `setContent` dans le `useDocumentStore`.
3. **Le store** : Met à jour le texte et l'historique.
4. **La réaction** : React détecte le changement et ré-affiche le texte instantanément.
5. **La simulation** : En parallèle, le `SimulationEngine` voit que tu as écrit et envoie un log "Vous avez modifié le document".

### Exemple : Quand Alice écrit

1. **Le moteur** : `SimulationEngine` décide qu'Alice va écrire une phrase.
2. **Le réseau** : Il demande au `NetworkSimulator` d'envoyer l'action. Le simulateur attend 500ms (latence).
3. **L'application** : Une fois le délai passé, le store `useDocumentStore` est mis à jour avec le texte d'Alice.
4. **L'interface** : Tu vois le texte d'Alice apparaître et son curseur bouger.

---

## 🛠️ Technologies Utilisées

- **React** : La librairie pour créer les composants (les vues).
- **TypeScript** : Du JavaScript "sécurisé". Il nous oblige à définir le format des données (un User a forcément un nom et un id). Ça évite pleins de bugs !
- **Vite** : L'outil qui lance le serveur de développement. C'est super rapide.
- **Tailwind CSS** : Pour le style. Au lieu d'écrire du CSS dans un fichier à part, on met des classes directement sur les éléments (ex: `text-red-500` pour du texte rouge).
- **Lucide React** : Pour les jolies icônes.

---

## 🔍 Les Points Clés du Code à Regarder

Si tu veux explorer le code, commence par ces fichiers :

1.  **`src/App.tsx`** : Le point d'entrée. Tu verras comment les 5 zones sont assemblées.
2.  **`src/stores/useDocumentStore.ts`** : Regarde comment on gère le texte et le `undo/redo`.
3.  **`src/simulation/SimulationEngine.ts`** : C'est là que toute la fausse vie est générée. C'est amusant à lire !

---

## ❓ FAQ Débutant

**Pourquoi il n'y a pas de backend (serveur) ?**
C'est un test frontend. On veut voir comment tu gères l'interface et les données côté navigateur. La partie `simulation/` remplace le serveur.

**C'est quoi ces fichiers `.tsx` ?**
C'est du TypeScript + JSX (React). C'est comme du HTML mélangé avec du JavaScript.

**Comment je change la vitesse de la simulation ?**
Va dans `src/simulation/SimulationEngine.ts` et change les valeurs dans `setInterval` (les chiffres en millisecondes).

---
