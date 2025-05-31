export type GameInviteStatus = 'pending' | 'accepted' | 'declined'

export type User = {
  id: string
  name: string
  isAdmin: boolean
  roundScore: Record<Round['id'], number>
}

export type UnconfirmedUser = Pick<User, 'id' | 'name'> & { status: GameInviteStatus }

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

type AnsweredBy = {
  isCorrect: boolean
  timeAnswered?: number
}

export type Question = {
  id: string
  text: string
  answer: string
  points: RoundRank['id']
  answeredBy: Record<User['id'], AnsweredBy>
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
  unconfirmedUsers?: UnconfirmedUser[]
  rounds: Round[]
  currentRound?: Round['id']
  currentQuestion?: Question['id']
  currentUser?: User['id']
  isFinished?: boolean
  winner?: User['id']
  finishDate?: number
  isPublic?: boolean
  creatorId: User['id']
  templateId?: GameTemplate['id']
}

export type GameTemplate = Omit<
  Game,
  'users' | 'currentRound' | 'currentQuestion' | 'currentUser' | 'isFinished' | 'winner'
>

export type GameListItem = Pick<Game, 'id' | 'name' | 'description' | 'creatorId' | 'isPublic'>

export type GameInvite = {
  id: string
  gameId: string
  gameName: string
  userId: string
  status: string
  createdAt: string
  updatedAt: string
  gameCreatorName: string
}
