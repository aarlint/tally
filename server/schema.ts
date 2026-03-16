import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const games = sqliteTable('games', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  mode: text('mode').notNull().default('generic'),
  status: text('status').notNull().default('active'),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
  finished_at: text('finished_at'),
})

export const players = sqliteTable('players', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  game_id: integer('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  display_order: integer('display_order').notNull().default(0),
}, (t) => [
  index('idx_players_game').on(t.game_id),
])

export const rounds = sqliteTable('rounds', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  game_id: integer('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  round_number: integer('round_number').notNull(),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
}, (t) => [
  index('idx_rounds_game').on(t.game_id),
])

export const scores = sqliteTable('scores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  round_id: integer('round_id').notNull().references(() => rounds.id, { onDelete: 'cascade' }),
  player_id: integer('player_id').notNull().references(() => players.id, { onDelete: 'cascade' }),
  points: integer('points').notNull().default(0),
}, (t) => [
  index('idx_scores_round').on(t.round_id),
  index('idx_scores_player').on(t.player_id),
])

export type Game = typeof games.$inferSelect
export type Player = typeof players.$inferSelect
export type Round = typeof rounds.$inferSelect
export type Score = typeof scores.$inferSelect
