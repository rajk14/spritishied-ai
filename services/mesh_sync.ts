import { savePost, saveNode, getPosts, getNodes } from './db';
import { addEvent } from './events';

/**
 * DISASTER MESH SIMULATION ENGINE
 * Simulates a low-bandwidth, high-entropy mesh network.
 * Features: Node Health, Packet Hops, and Information Degradation.
 */

interface MeshNode {
  id: string;
  name: string;
  status: string;
  distance: string;
  role: string;
  battery: number;
  signal: number;
  hops: number;
}

const INITIAL_NODES: MeshNode[] = [
  { id: 'node-1', name: 'Dr. Sonam', status: 'Medical Responder', distance: '400m', role: 'Medic', battery: 92, signal: -64, hops: 1 },
  { id: 'node-2', name: 'Police HQ Kaza', status: 'Station Active', distance: '1.2km', role: 'HQ', battery: 100, signal: -78, hops: 2 },
  { id: 'node-3', name: 'Amit Kumar', status: 'Traveling to Losar', distance: '3.4km', role: 'User', battery: 45, signal: -92, hops: 4 },
];

const INITIAL_POSTS = [
  { id: 'post-1', author: 'Dr. Sonam', content: 'Oxygen concentrators available at Kaza Hospital. 4 units ready.', type: 'alert', hops: 1 },
  { id: 'post-2', author: 'Kaza HQ', content: 'Landslide warning near Malling Nallah. Road status: Yellow.', type: 'warning', hops: 2 },
];

/**
 * Simulates "Information Entropy" - text degrades as it passes through more hops
 * or if the signal is poor.
 */
function applyEntropy(content: string, hops: number): string {
  if (hops <= 1) return content;
  
  const glitchRate = Math.min(0.4, (hops - 1) * 0.1);
  return content.split('').map(char => {
    if (char === ' ' || Math.random() > glitchRate) return char;
    const glitches = ['*', '#', '_', '?', '!', '…'];
    return glitches[Math.floor(Math.random() * glitches.length)];
  }).join('');
}

export async function runMeshSync() {
  console.log("[MESH] Executing Tactical Handshake...");
  
  // Seed/Update Nodes
  const currentNodes = await getNodes();
  if (currentNodes.length === 0) {
    for (const n of INITIAL_NODES) {
      await saveNode(n.id, n.name, `${n.status} | BAT: ${n.battery}%`, n.distance, n.role);
    }
  }

  // SIMULATION: Signal Fluctuations & Peer Discovery
  const chance = Math.random();
  if (chance > 0.8) {
    // New Peer discovered via BLE
    const newId = `node-${Date.now()}`;
    const hops = Math.floor(Math.random() * 5) + 1;
    await saveNode(newId, 'SURVIVOR-X', 'Relay Active', `${hops * 400}m`, 'User');
    addEvent('mesh', `New Peer Discovered: SS-RELAY-${newId.slice(-4)} (${hops} Hops)`);
  } else if (chance < 0.2) {
    // Node dropped off (Battery/Distance)
    addEvent('sys', 'Peer Lost: Connection timed out due to terrain interference.');
  }

  // SIMULATION: Post Sync with Entropy
  const currentPosts = await getPosts();
  if (currentPosts.length < 5) {
    addEvent('mesh', 'Ingesting high-priority mesh packets...');
    for (const p of INITIAL_POSTS) {
      const glitchedContent = applyEntropy(p.content, p.hops);
      await savePost(p.id, p.author, glitchedContent, p.type);
    }
  }

  return { 
    status: 'success', 
    meshHealth: Math.floor(Math.random() * 30) + 70, // 70-100%
    latency: Math.floor(Math.random() * 200) + 50 
  };
}

export async function broadcastPost(content: string, type: string = 'info') {
  const id = `local-${Date.now()}`;
  // Local posts always have 0 hops and 100% clarity
  await savePost(id, 'LOCAL-01 (You)', content, type);
  addEvent('mesh', 'Packet broadcast to nearby mesh relays.');
  return id;
}
