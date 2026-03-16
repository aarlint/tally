export interface GameMode {
  key: string
  label: string
  icon: string
  scoreLabel: string
  sortDirection: 'high' | 'low'
  description: string
}

export const gameModes: GameMode[] = [
  {
    key: 'generic',
    label: 'Generic (High)',
    icon: 'arrow-up-circle',
    scoreLabel: 'Points',
    sortDirection: 'high',
    description: 'General-purpose score tracker. Highest score wins.',
  },
  {
    key: 'generic-low',
    label: 'Generic (Low)',
    icon: 'arrow-down-circle',
    scoreLabel: 'Points',
    sortDirection: 'low',
    description: 'General-purpose score tracker. Lowest score wins.',
  },
  {
    key: 'rummy',
    label: 'Rummy',
    icon: 'layers',
    scoreLabel: 'Points',
    sortDirection: 'low',
    description: 'Classic card game. Lowest score wins. Points from cards left in hand.',
  },
  {
    key: 'spades',
    label: 'Spades',
    icon: 'spade',
    scoreLabel: 'Points',
    sortDirection: 'high',
    description: 'Trick-taking card game. Highest score wins. Bid and take tricks.',
  },
  {
    key: 'hearts',
    label: 'Hearts',
    icon: 'heart',
    scoreLabel: 'Points',
    sortDirection: 'low',
    description: 'Trick-avoidance card game. Lowest score wins. Avoid hearts and queen of spades.',
  },
  {
    key: 'cribbage',
    label: 'Cribbage',
    icon: 'gauge',
    scoreLabel: 'Pegs',
    sortDirection: 'high',
    description: 'Classic pegging game. First to 121 pegs wins.',
  },
  {
    key: 'euchre',
    label: 'Euchre',
    icon: 'crown',
    scoreLabel: 'Points',
    sortDirection: 'high',
    description: 'Trick-taking game. First to 10 points wins.',
  },
  {
    key: 'pinochle',
    label: 'Pinochle',
    icon: 'club',
    scoreLabel: 'Points',
    sortDirection: 'high',
    description: 'Trick-taking and melding game. Highest score wins.',
  },
  {
    key: 'phase10',
    label: 'Phase 10',
    icon: 'list-ordered',
    scoreLabel: 'Points',
    sortDirection: 'low',
    description: 'Rummy-type game. Lowest score wins. Complete all 10 phases.',
  },
  {
    key: 'uno',
    label: 'UNO',
    icon: 'square-stack',
    scoreLabel: 'Points',
    sortDirection: 'low',
    description: 'Card shedding game. Lowest score wins. First to empty hand scores round.',
  },
  {
    key: 'scrabble',
    label: 'Scrabble',
    icon: 'a-large-small',
    scoreLabel: 'Points',
    sortDirection: 'high',
    description: 'Word game. Highest score wins. Place tiles to form words.',
  },
  {
    key: 'yahtzee',
    label: 'Yahtzee',
    icon: 'dice-5',
    scoreLabel: 'Points',
    sortDirection: 'high',
    description: 'Dice game. Highest score wins. Roll combinations for points.',
  },
  {
    key: 'poker',
    label: 'Poker',
    icon: 'circle-dollar-sign',
    scoreLabel: 'Chips',
    sortDirection: 'high',
    description: 'Card game. Most chips wins. Bet and bluff your way to victory.',
  },
]

export const modeMap = Object.fromEntries(gameModes.map((m) => [m.key, m]))

export function getMode(key: string): GameMode {
  return modeMap[key] || gameModes[0]
}
