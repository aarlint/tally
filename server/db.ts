import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { mkdirSync } from 'node:fs'
import * as schema from './schema'

const DB_PATH = process.env.DB_PATH || './data/tally.db'
mkdirSync('./data', { recursive: true })

const sqlite = new Database(DB_PATH)
sqlite.exec('PRAGMA journal_mode = WAL')
sqlite.exec('PRAGMA foreign_keys = ON')

// Auto-create tables on startup
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'generic',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    finished_at TEXT
  );
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS idx_players_game ON players(game_id);
  CREATE INDEX IF NOT EXISTS idx_rounds_game ON rounds(game_id);
  CREATE INDEX IF NOT EXISTS idx_scores_round ON scores(round_id);
  CREATE INDEX IF NOT EXISTS idx_scores_player ON scores(player_id);
`)

export const db = drizzle(sqlite, { schema })
export { sqlite }
