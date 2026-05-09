import * as SQLite from 'expo-sqlite';

/**
 * SPITI SHIELD PERSISTENCE ENGINE
 * Uses SQLite for permanent offline storage of chat history and critical logs.
 */

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<void> | null = null;

export async function initDatabase() {
  if (db) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      db = await SQLite.openDatabaseAsync('spitishield'); // Simplified name
      
      // Initialize tables sequentially to avoid native race conditions
      await db.execAsync('PRAGMA journal_mode = WAL;');
      
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          timestamp INTEGER NOT NULL
        );
      `);

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY NOT NULL,
          author TEXT NOT NULL,
          content TEXT NOT NULL,
          type TEXT NOT NULL,
          timestamp INTEGER NOT NULL
        );
      `);

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS nodes (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          status TEXT NOT NULL,
          distance TEXT NOT NULL,
          role TEXT NOT NULL,
          last_seen INTEGER NOT NULL
        );
      `);
      
      console.log("[DB] SQLite Initialized Successfully");
    } catch (error) {
      console.error("[DB] Initialization Failed:", error);
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

async function getDb() {
  if (!db) await initDatabase();
  return db!;
}

export async function saveMessage(id: string, role: string, content: string) {
  const _db = await getDb();
  const timestamp = Date.now();
  await _db.runAsync(
    'INSERT OR REPLACE INTO messages (id, role, content, timestamp) VALUES (?, ?, ?, ?);',
    [id, role, content, timestamp]
  );
}

export async function savePost(id: string, author: string, content: string, type: string) {
  const _db = await getDb();
  const timestamp = Date.now();
  await _db.runAsync(
    'INSERT OR REPLACE INTO posts (id, author, content, type, timestamp) VALUES (?, ?, ?, ?, ?);',
    [id, author, content, type, timestamp]
  );
}

export async function getPosts() {
  const _db = await getDb();
  return await _db.getAllAsync('SELECT * FROM posts ORDER BY timestamp DESC;') as any[];
}

export async function saveNode(id: string, name: string, status: string, distance: string, role: string) {
  const _db = await getDb();
  const last_seen = Date.now();
  await _db.runAsync(
    'INSERT OR REPLACE INTO nodes (id, name, status, distance, role, last_seen) VALUES (?, ?, ?, ?, ?, ?);',
    [id, name, status, distance, role, last_seen]
  );
}

export async function getNodes() {
  const _db = await getDb();
  return await _db.getAllAsync('SELECT * FROM nodes ORDER BY last_seen DESC;') as any[];
}

export async function getMessages() {
  const _db = await getDb();
  const allRows = await _db.getAllAsync('SELECT * FROM messages ORDER BY timestamp ASC;');
  return allRows as { id: string, role: string, content: string, timestamp: number }[];
}

export async function clearMessages() {
  const _db = await getDb();
  await _db.runAsync('DELETE FROM messages;');
}
