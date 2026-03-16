import { Hono } from 'hono'
import { db } from './db'
import { games, players, rounds, scores } from './schema'
import { eq, desc, asc, sql } from 'drizzle-orm'
import { nanoid, customAlphabet } from 'nanoid'

const generateShareCode = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 6)

const api = new Hono()

// Helper: check ownership for mutation endpoints
function checkOwnership(game: { access_mode: string; owner_token: string }, headerToken: string | undefined): boolean {
  if (game.access_mode === 'collaborative') return true
  return !!headerToken && headerToken === game.owner_token
}

// Helper: strip owner_token from game response
function sanitizeGame<T extends { owner_token?: string }>(game: T): Omit<T, 'owner_token'> {
  const { owner_token, ...rest } = game
  return rest
}

// Helper: build game detail response (shared between /games/:id and /join/:code)
function buildGameDetail(game: typeof games.$inferSelect) {
  const gamePlayers = db
    .select()
    .from(players)
    .where(eq(players.game_id, game.id))
    .orderBy(asc(players.display_order))
    .all()

  const gameRounds = db
    .select()
    .from(rounds)
    .where(eq(rounds.game_id, game.id))
    .orderBy(asc(rounds.round_number))
    .all()

  const roundIds = gameRounds.map((r) => r.id)
  let gameScores: typeof scores.$inferSelect[] = []
  if (roundIds.length > 0) {
    gameScores = db
      .select()
      .from(scores)
      .where(sql`${scores.round_id} IN (${sql.join(roundIds.map(id => sql`${id}`), sql`, `)})`)
      .all()
  }

  const roundsWithScores = gameRounds.map((round) => ({
    ...round,
    scores: gamePlayers.map((player) => {
      const score = gameScores.find((s) => s.round_id === round.id && s.player_id === player.id)
      return { player_id: player.id, points: score?.points ?? 0 }
    }),
  }))

  const totals = gamePlayers.map((player) => ({
    player_id: player.id,
    total: gameScores
      .filter((s) => s.player_id === player.id)
      .reduce((sum, s) => sum + s.points, 0),
  }))

  return {
    ...sanitizeGame(game),
    players: gamePlayers,
    rounds: roundsWithScores,
    totals,
  }
}

// Health check
api.get('/health', (c) => c.json({ status: 'ok' }))

// List games (active first, then by created_at desc)
api.get('/games', async (c) => {
  const allGames = db
    .select({
      id: games.id,
      name: games.name,
      mode: games.mode,
      status: games.status,
      share_code: games.share_code,
      access_mode: games.access_mode,
      created_at: games.created_at,
      finished_at: games.finished_at,
    })
    .from(games)
    .orderBy(desc(sql`CASE WHEN ${games.status} = 'active' THEN 0 ELSE 1 END`), desc(games.created_at))
    .all()

  const result = allGames.map((game) => {
    const gamePlayers = db
      .select({ id: players.id, name: players.name })
      .from(players)
      .where(eq(players.game_id, game.id))
      .orderBy(asc(players.display_order))
      .all()
    return { ...game, players: gamePlayers }
  })

  return c.json(result)
})

// Create game with players
api.post('/games', async (c) => {
  const body = await c.req.json<{ name: string; mode: string; players: string[]; access_mode?: string }>()

  if (!body.name?.trim()) return c.json({ error: 'Game name required' }, 400)

  const accessMode = body.access_mode || 'solo'
  if (!['solo', 'collaborative', 'spectator'].includes(accessMode)) {
    return c.json({ error: 'Invalid access mode' }, 400)
  }

  // Collaborative allows 0 initial players; solo/spectator require 2+
  const trimmedPlayers = (body.players || []).map(p => p.trim()).filter(Boolean)
  if (accessMode !== 'collaborative' && trimmedPlayers.length < 2) {
    return c.json({ error: 'At least 2 players required' }, 400)
  }

  const shareCode = generateShareCode()
  const ownerToken = nanoid(32)

  const game = db.insert(games).values({
    name: body.name.trim(),
    mode: body.mode || 'generic',
    share_code: shareCode,
    access_mode: accessMode,
    owner_token: ownerToken,
  }).returning().get()

  if (trimmedPlayers.length > 0) {
    const playerRows = trimmedPlayers.map((name, i) => ({
      game_id: game.id,
      name,
      display_order: i,
    }))
    db.insert(players).values(playerRows).run()
  }

  // Return owner_token only on create so the client can store it
  return c.json({
    ...sanitizeGame(game),
    owner_token: ownerToken,
  }, 201)
})

// Get game detail by ID
api.get('/games/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const game = db.select().from(games).where(eq(games.id, id)).get()
  if (!game) return c.json({ error: 'Game not found' }, 404)

  return c.json(buildGameDetail(game))
})

// Join game by share code
api.get('/games/join/:code', async (c) => {
  const code = c.req.param('code')
  const game = db.select().from(games).where(eq(games.share_code, code)).get()
  if (!game) return c.json({ error: 'Game not found' }, 404)

  return c.json(buildGameDetail(game))
})

// Update game (finish/reactivate)
api.patch('/games/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const game = db.select().from(games).where(eq(games.id, id)).get()
  if (!game) return c.json({ error: 'Game not found' }, 404)

  const token = c.req.header('X-Owner-Token')
  if (!checkOwnership(game, token)) return c.json({ error: 'Not authorized' }, 403)

  const body = await c.req.json<{ status?: string; name?: string }>()

  const updates: Record<string, any> = {}
  if (body.status) {
    updates.status = body.status
    if (body.status === 'finished') {
      updates.finished_at = new Date().toISOString()
    } else {
      updates.finished_at = null
    }
  }
  if (body.name) updates.name = body.name.trim()

  const updated = db.update(games).set(updates).where(eq(games.id, id)).returning().get()
  return c.json(sanitizeGame(updated!))
})

// Delete game
api.delete('/games/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const game = db.select().from(games).where(eq(games.id, id)).get()
  if (!game) return c.json({ error: 'Game not found' }, 404)

  const token = c.req.header('X-Owner-Token')
  if (!checkOwnership(game, token)) return c.json({ error: 'Not authorized' }, 403)

  db.delete(games).where(eq(games.id, id)).run()
  return c.json({ ok: true })
})

// Add round with scores
api.post('/games/:id/rounds', async (c) => {
  const gameId = parseInt(c.req.param('id'))
  const game = db.select().from(games).where(eq(games.id, gameId)).get()
  if (!game) return c.json({ error: 'Game not found' }, 404)

  const token = c.req.header('X-Owner-Token')
  if (!checkOwnership(game, token)) return c.json({ error: 'Not authorized' }, 403)

  const body = await c.req.json<{ scores: { player_id: number; points: number }[] }>()

  const lastRound = db
    .select({ round_number: rounds.round_number })
    .from(rounds)
    .where(eq(rounds.game_id, gameId))
    .orderBy(desc(rounds.round_number))
    .limit(1)
    .get()

  const roundNumber = (lastRound?.round_number ?? 0) + 1

  const round = db.insert(rounds).values({
    game_id: gameId,
    round_number: roundNumber,
  }).returning().get()

  if (body.scores?.length) {
    const scoreRows = body.scores.map((s) => ({
      round_id: round.id,
      player_id: s.player_id,
      points: s.points,
    }))
    db.insert(scores).values(scoreRows).run()
  }

  return c.json(round, 201)
})

// Update round scores
api.patch('/games/:id/rounds/:roundId', async (c) => {
  const gameId = parseInt(c.req.param('id'))
  const roundId = parseInt(c.req.param('roundId'))

  const game = db.select().from(games).where(eq(games.id, gameId)).get()
  if (!game) return c.json({ error: 'Game not found' }, 404)

  const token = c.req.header('X-Owner-Token')
  if (!checkOwnership(game, token)) return c.json({ error: 'Not authorized' }, 403)

  const body = await c.req.json<{ scores: { player_id: number; points: number }[] }>()

  const round = db.select().from(rounds).where(eq(rounds.id, roundId)).get()
  if (!round || round.game_id !== gameId) {
    return c.json({ error: 'Round not found' }, 404)
  }

  if (!body.scores?.length) return c.json({ error: 'Scores required' }, 400)

  for (const s of body.scores) {
    db.update(scores)
      .set({ points: s.points })
      .where(sql`${scores.round_id} = ${roundId} AND ${scores.player_id} = ${s.player_id}`)
      .run()
  }

  return c.json({ ok: true })
})

// Add player to existing game
api.post('/games/:id/players', async (c) => {
  const gameId = parseInt(c.req.param('id'))
  const game = db.select().from(games).where(eq(games.id, gameId)).get()
  if (!game) return c.json({ error: 'Game not found' }, 404)

  const token = c.req.header('X-Owner-Token')
  if (!checkOwnership(game, token)) return c.json({ error: 'Not authorized' }, 403)

  const body = await c.req.json<{ name: string; backfill: 'average' | 'zero' }>()
  if (!body.name?.trim()) return c.json({ error: 'Player name required' }, 400)

  const maxOrder = db
    .select({ max: sql<number>`MAX(${players.display_order})` })
    .from(players)
    .where(eq(players.game_id, gameId))
    .get()

  const player = db.insert(players).values({
    game_id: gameId,
    name: body.name.trim(),
    display_order: (maxOrder?.max ?? -1) + 1,
  }).returning().get()

  const gameRounds = db.select().from(rounds).where(eq(rounds.game_id, gameId)).all()

  if (gameRounds.length > 0) {
    const gamePlayers = db
      .select({ id: players.id })
      .from(players)
      .where(eq(players.game_id, gameId))
      .all()
    const otherPlayerIds = gamePlayers.filter(p => p.id !== player.id).map(p => p.id)

    for (const round of gameRounds) {
      let points = 0
      if (body.backfill === 'average' && otherPlayerIds.length > 0) {
        const roundScores = db
          .select({ points: scores.points })
          .from(scores)
          .where(sql`${scores.round_id} = ${round.id} AND ${scores.player_id} IN (${sql.join(otherPlayerIds.map(id => sql`${id}`), sql`, `)})`)
          .all()
        const sum = roundScores.reduce((acc, s) => acc + s.points, 0)
        points = Math.round(sum / roundScores.length)
      }
      db.insert(scores).values({ round_id: round.id, player_id: player.id, points }).run()
    }
  }

  return c.json(player, 201)
})

// Delete round (undo)
api.delete('/games/:id/rounds/:roundId', async (c) => {
  const gameId = parseInt(c.req.param('id'))
  const roundId = parseInt(c.req.param('roundId'))

  const game = db.select().from(games).where(eq(games.id, gameId)).get()
  if (!game) return c.json({ error: 'Game not found' }, 404)

  const token = c.req.header('X-Owner-Token')
  if (!checkOwnership(game, token)) return c.json({ error: 'Not authorized' }, 403)

  const round = db.select().from(rounds)
    .where(eq(rounds.id, roundId))
    .get()

  if (!round || round.game_id !== gameId) {
    return c.json({ error: 'Round not found' }, 404)
  }

  db.delete(rounds).where(eq(rounds.id, roundId)).run()
  return c.json({ ok: true })
})

export { api }
