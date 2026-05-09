import { savePost, saveNode, getPosts, getNodes } from './db';
import { addEvent } from './events';

/**
 * MESH SYNC MIDDLEWARE
 * Simulates a background process that syncs local SQLite data 
 * with nearby nodes on the Spiti Mesh.
 */

const INITIAL_NODES = [
  { id: 'node-1', name: 'Dr. Sonam', status: 'Medical Responder', distance: '400m', role: 'Medic' },
  { id: 'node-2', name: 'Police HQ Kaza', status: 'Station Active', distance: '1.2km', role: 'HQ' },
  { id: 'node-3', name: 'Amit Kumar', status: 'Traveling to Losar', distance: '3.4km', role: 'User' },
];

const INITIAL_POSTS = [
  { id: 'post-1', author: 'Dr. Sonam', content: 'Oxygen concentrators available at Kaza Hospital. 4 units ready.', type: 'alert' },
  { id: 'post-2', author: 'Kaza HQ', content: 'Landslide warning near Malling Nallah. Road status: Yellow.', type: 'warning' },
];

export async function runMeshSync() {
  console.log("[MESH SYNC] Handshake with nearby nodes...");
  
  // Seed database if empty
  const currentNodes = await getNodes();
  if (currentNodes.length === 0) {
    for (const n of INITIAL_NODES) {
      await saveNode(n.id, n.name, n.status, n.distance, n.role);
    }
  }

  // SIMULATION: Every time sync runs, there's a 30% chance to find a "New Discovery"
  if (Math.random() > 0.7) {
    const newId = `node-${Date.now()}`;
    await saveNode(newId, 'Guest-Discovery', 'Passing Node', '800m', 'User');
    addEvent('mesh', 'New Peer Discovered: SS-GUEST (800m)');
    console.log("[MESH SYNC] New Peer Discovered via BLE!");
  }

  const currentPosts = await getPosts();
  if (currentPosts.length === 0) {
    addEvent('sys', 'Syncing Survival Bulletins from Mesh...');
    for (const p of INITIAL_POSTS) {
      await savePost(p.id, p.author, p.content, p.type);
    }
  }

  return { status: 'success', syncedNodes: currentNodes.length, syncedPosts: currentPosts.length };
}

export async function broadcastPost(content: string, type: string = 'info') {
  const id = `local-${Date.now()}`;
  await savePost(id, 'Me (Mesh-ID: 882)', content, type);
  // In a real app, this is where we would push to the physical mesh hardware
  return id;
}
