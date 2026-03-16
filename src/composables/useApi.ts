import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'

async function fetchJson<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export interface GameSummary {
  id: number
  name: string
  mode: string
  status: string
  created_at: string
  finished_at: string | null
  players: { id: number; name: string }[]
}

export interface GameDetail {
  id: number
  name: string
  mode: string
  status: string
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

export function useGame(id: Ref<number>) {
  return useQuery<GameDetail>({
    queryKey: ['game', id],
    queryFn: () => fetchJson(`/api/games/${id.value}`),
    enabled: () => id.value > 0,
  })
}

export function useCreateGame() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; mode: string; players: string[] }) =>
      fetchJson<{ id: number }>('/api/games', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['games'] }),
  })
}

export function useUpdateGame() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; status?: string; name?: string }) =>
      fetchJson(`/api/games/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['games'] })
      qc.invalidateQueries({ queryKey: ['game'] })
    },
  })
}

export function useDeleteGame() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => fetchJson(`/api/games/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['games'] }),
  })
}

export function useAddRound() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ gameId, scores }: { gameId: number; scores: { player_id: number; points: number }[] }) =>
      fetchJson(`/api/games/${gameId}/rounds`, { method: 'POST', body: JSON.stringify({ scores }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['game'] }),
  })
}

export function useDeleteRound() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ gameId, roundId }: { gameId: number; roundId: number }) =>
      fetchJson(`/api/games/${gameId}/rounds/${roundId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['game'] }),
  })
}

export function useUpdateRound() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ gameId, roundId, scores }: { gameId: number; roundId: number; scores: { player_id: number; points: number }[] }) =>
      fetchJson(`/api/games/${gameId}/rounds/${roundId}`, { method: 'PATCH', body: JSON.stringify({ scores }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['game'] }),
  })
}

export function useAddPlayer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ gameId, name, backfill }: { gameId: number; name: string; backfill: 'average' | 'zero' }) =>
      fetchJson(`/api/games/${gameId}/players`, { method: 'POST', body: JSON.stringify({ name, backfill }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['game'] }),
  })
}
