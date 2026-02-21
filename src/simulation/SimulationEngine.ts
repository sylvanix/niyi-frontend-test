/**
 * SimulationEngine - Orchestre les utilisateurs simulés et le réseau
 * 
 * Ce moteur :
 * 1. Fait "taper" les utilisateurs simulés à intervalles aléatoires
 * 2. Applique une latence réseau à chaque opération
 * 3. Simule des messages de chat automatiques
 * 4. Génère des logs d'activité
 */

import { NetworkSimulator } from './NetworkSimulator';
import { useDocumentStore } from '../stores/useDocumentStore';
import { useUsersStore } from '../stores/useUsersStore';
import { useNetworkStore } from '../stores/useNetworkStore';
import { useChatStore } from '../stores/useChatStore';

// Texte que les utilisateurs simulés vont taper
const TYPING_SNIPPETS = [
  '\n// TODO: Ajouter la validation des entrées',
  '\nconst result = await fetchData();',
  '\n// Correction du bug #42',
  '\nif (isValid) { process(); }',
  '\n// Optimisation de la boucle principale',
  '\nreturn data.filter(Boolean);',
  '\nconsole.log("Debug:", state);',
  '\n// Refactoring en cours...',
  '\nconst config = loadConfig();',
  '\ntry { await save(); } catch(e) {}',
  '\n// Note: revoir la logique ici',
  '\nexport default handler;',
];

const CHAT_MESSAGES = [
  "J'ai corrigé le bug sur la ligne 15",
  "Quelqu'un peut review mon code ?",
  "La latence est un peu élevée aujourd'hui",
  "J'ai ajouté un commentaire TODO",
  "Est-ce qu'on merge ce soir ?",
  "Le refactoring avance bien 👍",
  "Attention au conflit sur le fichier config",
  "J'ai testé, ça marche !",
  "On a un problème de performance ici",
  "Je push mes changements maintenant",
  "Super travail d'équipe aujourd'hui !",
  "N'oubliez pas de commiter vos changements",
];

let simulationInterval: ReturnType<typeof setInterval> | null = null;
let chatInterval: ReturnType<typeof setInterval> | null = null;
let statusInterval: ReturnType<typeof setInterval> | null = null;
let networkUpdateInterval: ReturnType<typeof setInterval> | null = null;
let isRunning = false;

const networkSimulator = new NetworkSimulator(
  (latency) => useNetworkStore.getState().setLatency(latency),
  (lost) => useNetworkStore.getState().incrementPackets(lost)
);

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getSimulatedUserIds(): string[] {
  return ['user-alice', 'user-bob', 'user-charlie'];
}

async function simulateUserEdit() {
  const userIds = getSimulatedUserIds();
  const userId = getRandomItem(userIds);
  const users = useUsersStore.getState().users;
  const user = users.find((u) => u.id === userId);
  if (!user) return;

  // Set user as typing
  useUsersStore.getState().setUserStatus(userId, 'typing');

  const snippet = getRandomItem(TYPING_SNIPPETS);
  const doc = useDocumentStore.getState().document;
  
  // Pick a random insertion position (at a line boundary)
  const lines = doc.content.split('\n');
  const targetLine = Math.floor(Math.random() * lines.length);
  let position = 0;
  for (let i = 0; i < targetLine; i++) {
    position += lines[i].length + 1;
  }

  // Update cursor position
  useUsersStore.getState().updateCursorPosition(userId, targetLine + 1, 0);

  // Simulate network latency for this operation
  const result = await networkSimulator.send({ position, snippet });

  if (result.success) {
    // Apply the edit
    useDocumentStore.getState().insertAt(position, snippet, `op-${generateId()}`);
    useUsersStore.getState().incrementOperations(userId);

    // Update network status
    const netStore = useNetworkStore.getState();
    if (netStore.status !== 'connected') {
      netStore.setStatus('syncing');
      setTimeout(() => {
        useNetworkStore.getState().setStatus('connected');
        useNetworkStore.getState().setSyncMode('real-time');
      }, 500);
    }

    // Add activity log
    useChatStore.getState().addLog({
      id: generateId(),
      userId,
      userName: user.name,
      userColor: user.color,
      action: 'insert',
      detail: `A inséré "${snippet.trim().substring(0, 30)}..." à la ligne ${targetLine + 1}`,
      timestamp: Date.now(),
    });

    // Update the cursor to the end of inserted text
    const newLines = (doc.content.slice(0, position) + snippet).split('\n');
    useUsersStore.getState().updateCursorPosition(
      userId,
      newLines.length,
      newLines[newLines.length - 1].length
    );
  } else {
    // Packet lost — log error
    useChatStore.getState().addLog({
      id: generateId(),
      userId,
      userName: user.name,
      userColor: user.color,
      action: 'error',
      detail: `Perte de paquet — opération retentée ${result.retries} fois`,
      timestamp: Date.now(),
    });

    useNetworkStore.getState().setStatus('syncing');
    setTimeout(() => {
      useNetworkStore.getState().setStatus('connected');
    }, 2000);
  }

  // Reset user status after a delay
  setTimeout(() => {
    useUsersStore.getState().setUserStatus(userId, 'active');
  }, 1000 + Math.random() * 2000);
}

function simulateChatMessage() {
  const userIds = getSimulatedUserIds();
  const userId = getRandomItem(userIds);
  const users = useUsersStore.getState().users;
  const user = users.find((u) => u.id === userId);
  if (!user) return;

  const message = getRandomItem(CHAT_MESSAGES);

  useChatStore.getState().addMessage({
    id: generateId(),
    userId,
    userName: user.name,
    userColor: user.color,
    content: message,
    timestamp: Date.now(),
  });
}

function updateUserStatuses() {
  const userIds = getSimulatedUserIds();
  userIds.forEach((userId) => {
    const user = useUsersStore.getState().users.find((u) => u.id === userId);
    if (!user) return;

    // Randomly toggle idle/active status
    if (user.status !== 'typing') {
      const rand = Math.random();
      if (rand < 0.1) {
        useUsersStore.getState().setUserStatus(userId, 'idle');
      } else if (rand < 0.3 && user.status === 'idle') {
        useUsersStore.getState().setUserStatus(userId, 'active');
      }
    }
  });
}

function updateNetworkSimulation() {
  // Periodically simulate network fluctuations
  const rand = Math.random();
  const netStore = useNetworkStore.getState();

  if (rand < 0.02 && netStore.status === 'connected') {
    // Rare disconnect event
    netStore.simulateDisconnect();
    useChatStore.getState().addLog({
      id: generateId(),
      userId: 'system',
      userName: 'Système',
      userColor: '#ef4444',
      action: 'disconnect',
      detail: 'Connexion perdue — tentative de reconnexion...',
      timestamp: Date.now(),
    });

    // Auto-reconnect after 3-5 seconds
    setTimeout(() => {
      useNetworkStore.getState().simulateReconnect();
      useChatStore.getState().addLog({
        id: generateId(),
        userId: 'system',
        userName: 'Système',
        userColor: '#22c55e',
        action: 'reconnect',
        detail: 'Reconnexion réussie — synchronisation en cours...',
        timestamp: Date.now(),
      });

      setTimeout(() => {
        useNetworkStore.getState().setStatus('connected');
        useNetworkStore.getState().setSyncMode('real-time');
      }, 2000);
    }, 3000 + Math.random() * 2000);
  }

  // Update latency indicator periodically
  if (netStore.status === 'connected') {
    const baseLatency = 100 + Math.random() * 400;
    netStore.setLatency(Math.floor(baseLatency));
  }
}

export function startSimulation() {
  if (isRunning) return;
  isRunning = true;

  // Initial log
  useChatStore.getState().addLog({
    id: generateId(),
    userId: 'system',
    userName: 'Système',
    userColor: '#3b82f6',
    action: 'start',
    detail: 'Simulation démarrée — 3 utilisateurs connectés',
    timestamp: Date.now(),
  });

  // Simulate user edits every 3-8 seconds
  simulationInterval = setInterval(() => {
    if (useNetworkStore.getState().status !== 'disconnected') {
      simulateUserEdit();
    }
  }, 3000 + Math.random() * 5000);

  // Simulate chat messages every 8-15 seconds  
  chatInterval = setInterval(() => {
    simulateChatMessage();
  }, 8000 + Math.random() * 7000);

  // Update user statuses every 5 seconds
  statusInterval = setInterval(() => {
    updateUserStatuses();
  }, 5000);

  // Update network simulation every 3 seconds
  networkUpdateInterval = setInterval(() => {
    updateNetworkSimulation();
  }, 3000);

  // Initial chat message
  setTimeout(() => {
    simulateChatMessage();
  }, 2000);
}

export function stopSimulation() {
  isRunning = false;
  if (simulationInterval) clearInterval(simulationInterval);
  if (chatInterval) clearInterval(chatInterval);
  if (statusInterval) clearInterval(statusInterval);
  if (networkUpdateInterval) clearInterval(networkUpdateInterval);
  simulationInterval = null;
  chatInterval = null;
  statusInterval = null;
  networkUpdateInterval = null;
}

export function isSimulationRunning(): boolean {
  return isRunning;
}
