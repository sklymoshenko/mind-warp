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
  time: RoundTime
}

export type Question = {
  id: string
  text: string
  answer: string
  isCorrect: boolean | null
  points: RoundRank['id']
  timeAnswered?: number
}

export type RoundRank = {
  id: number
  label: string
  isSelected: boolean
}

export type RoundTime = {
  id: number
  label: string
  isSelected: boolean
}

export type Game = {
  id: string
  name: string
  description: string
  users: User[]
  rounds: Round[]
  currentRound: Round['id']
  currentQuestion: Question['id']
  currentUser: User['id']
  isFinished: boolean
  winner?: User['id']
  finishDate?: number
  isPublic?: boolean
}
