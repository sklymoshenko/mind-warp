export type User = {
  id: string
  name: string
  isAdmin: boolean
  roundScore: {
    roundId: string
    score: number
  }[]
}

export type Round = {
  id: string
  name: string
  ranks: RoundRank[]
  questions: Question[]
}

export type Question = {
  id: string
  text: string
  answer: string
  isCorrect: boolean | null
  points: RoundRank['id']
}

export type RoundRank = {
  id: number
  label: string
  isSelected: boolean
}

export type Game = {
  id: string
  users: User[]
  rounds: Round[]
  currentRound: number
  currentQuestion: number
}
