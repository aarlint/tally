import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import { getOwnerToken, setOwnerToken } from '../lib/ownership'

async function fetchJson<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
    ...opts,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

function ownerHeaders(gameId: number): Record<string, string> {
  const token = getOwnerToken(gameId)
  return token ? { 'X-Owner-Token': token } : {}
}

export interface GameSummary {
  id: number
  name: string
  mode: string
  status: string
  share_code: string
  access_mode: string
  created_at: string
  finished_at: string | null
  players: { id: number; name: string }[]
}

export interface GameDetail {
  id: number
  name: string
  mode: string
  status: string
  share_code: string
  access_mode: string
  created_at: string
  finished_at: string | null
  players: { id: number; name: string; display_order: number }[]
  rounds: {
    id: number
    round_number: number
    created_at: string
    scores: { player_id: number; points: number }[]
  }[]
  totals: { player_id: number; total: number }[]
}

export function useGames() {
  return useQuery<GameSummary[]>({
    queryKey: ['games'],
    queryFn: () => fetchJson('/api/games'),
  })
}

export function useGame(id: Ref<number>, opts?: { refetchInterval?: number }) {
  return useQuery<GameDetail>({
    queryKey: ['game', id],
    queryFn: () => fetchJson(`/api/games/${id.value}`),
    enabled: () => id.value > 0,
    refetchInterval: opts?.refetchInterval,
  })
}

export function useGameByCode(code: Ref<string>, opts?: { refetchInterval?: number }) {
  return useQuery<GameDetail>({
    queryKey: ['game-code', code],
    queryFn: () => fetchJson(`/api/games/join/${code.value}`),
    enabled: () => !!code.value,
    refetchInterval: opts?.refetchInterval,
  })
}

export function useCreateGame() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; mode: string; players: string[]; access_mode?: string }) =>
      fetchJson<GameDetail & { owner_token: string }>('/api/games', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (data) => {
      // Store owner token for this game
      setOwnerToken(data.id, data.owner_token)
      qc.invalidateQueries({ queryKey: ['games'] })
    },
  })
}

export function useUpdateGame() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; status?: string; name?: string }) =>
      fetchJson(`/api/games/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json', ...ownerHeaders(id) },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['games'] })
      qc.invalidateQueries({ queryKey: ['game'] })
      qc.invalidateQueries({ queryKey: ['game-code'] })
    },
  })
}

export function useDeleteGame() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      fetchJson(`/api/games/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...ownerHeaders(id) },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['games'] }),
  })
}

export function useAddRound() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ gameId, scores }: { gameId: number; scores: { player_id: number; points: number }[] }) =>
      fetchJson(`/api/games/${gameId}/rounds`, {
        method: 'POST',
        body: JSON.stringify({ scores }),
        headers: { 'Content-Type': 'application/json', ...ownerHeaders(gameId) },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['game'] })
      qc.invalidateQueries({ queryKey: ['game-code'] })
    },
  })
}

export function useDeleteRound() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ gameId, roundId }: { gameId: number; roundId: number }) =>
      fetchJson(`/api/games/${gameId}/rounds/${roundId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...ownerHeaders(gameId) },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['game'] })
      qc.invalidateQueries({ queryKey: ['game-code'] })
    },
  })
}

export function useUpdateRound() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ gameId, roundId, scores }: { gameId: number; roundId: number; scores: { player_id: number; points: number }[] }) =>
      fetchJson(`/api/games/${gameId}/rounds/${roundId}`, {
        method: 'PATCH',
        body: JSON.stringify({ scores }),
        headers: { 'Content-Type': 'application/json', ...ownerHeaders(gameId) },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['game'] })
      qc.invalidateQueries({ queryKey: ['game-code'] })
    },
  })
}

export function useAddPlayer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ gameId, name, backfill }: { gameId: number; name: string; backfill: 'average' | 'zero' }) =>
      fetchJson(`/api/games/${gameId}/players`, {
        method: 'POST',
        body: JSON.stringify({ name, backfill }),
        headers: { 'Content-Type': 'application/json', ...ownerHeaders(gameId) },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['game'] })
      qc.invalidateQueries({ queryKey: ['game-code'] })
    },
  })
}
