export type User = {
  id: string
  name: string
  isAdmin: boolean
  roundScore: Record<Round['id'], number>
}

export type Theme = {
  id: string
  name: string
  questions: Question[]
}

export type Round = {
  id: string
  name: string
  ranks: RoundRank[]
  themes: Theme[]
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
  currentRound: Round['id']
  currentQuestion: Question['id']
  currentUser: User['id']
}
