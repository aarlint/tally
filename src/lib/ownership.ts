const STORAGE_KEY = 'tally_ownership'

type OwnershipMap = Record<number, string>

function getMap(): OwnershipMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveMap(map: OwnershipMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export function getOwnerToken(gameId: number): string | null {
  return getMap()[gameId] || null
}

export function setOwnerToken(gameId: number, token: string) {
  const map = getMap()
  map[gameId] = token
  saveMap(map)
}

export function isGameOwner(gameId: number): boolean {
  return !!getMap()[gameId]
}
