import { Game, User, Round, Question, RoundRank } from '../types'

// Mock users
const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Trivia Master',
    isAdmin: true,
    roundScore: [
      { roundId: 'round-1', score: 1200 },
      { roundId: 'round-2', score: 800 },
    ],
  },
  {
    id: 'user-2',
    name: 'Quiz Champion',
    isAdmin: false,
    roundScore: [
      { roundId: 'round-1', score: 900 },
      { roundId: 'round-2', score: 1000 },
    ],
  },
  {
    id: 'user-3',
    name: 'Knowledge Seeker',
    isAdmin: false,
    roundScore: [
      { roundId: 'round-1', score: 700 },
      { roundId: 'round-2', score: 900 },
    ],
  },
]

// Round ranks
const popCultureRanks: RoundRank[] = [
  { id: 100, label: '100', isSelected: true },
  { id: 200, label: '200', isSelected: true },
  { id: 300, label: '300', isSelected: true },
  { id: 400, label: '400', isSelected: true },
  { id: 500, label: '500', isSelected: true },
]

const scienceRanks: RoundRank[] = [
  { id: 100, label: '100', isSelected: true },
  { id: 200, label: '200', isSelected: true },
  { id: 300, label: '300', isSelected: true },
  { id: 400, label: '400', isSelected: true },
  { id: 500, label: '500', isSelected: true },
  { id: 700, label: '700', isSelected: true },
]

// Questions for rounds
const popCultureQuestions: Question[] = [
  {
    id: 'q-pop-1',
    text: 'Which actor played Iron Man in the Marvel Cinematic Universe?',
    answer: 'Robert Downey Jr.',
    isCorrect: null,
    points: 100,
  },
  {
    id: 'q-pop-2',
    text: 'Which TV series features a high school chemistry teacher who turns to manufacturing methamphetamine?',
    answer: 'Breaking Bad',
    isCorrect: null,
    points: 200,
  },
  {
    id: 'q-pop-3',
    text: 'Which band released the album "Abbey Road"?',
    answer: 'The Beatles',
    isCorrect: null,
    points: 300,
  },
  {
    id: 'q-pop-4',
    text: 'What is the name of the fictional city where Batman operates?',
    answer: 'Gotham City',
    isCorrect: null,
    points: 400,
  },
  {
    id: 'q-pop-5',
    text: 'Who directed the film "Pulp Fiction"?',
    answer: 'Quentin Tarantino',
    isCorrect: null,
    points: 500,
  },
]

const scienceQuestions: Question[] = [
  {
    id: 'q-sci-1',
    text: 'What is the chemical symbol for gold?',
    answer: 'Au',
    isCorrect: null,
    points: 100,
  },
  {
    id: 'q-sci-2',
    text: 'What planet is known as the Red Planet?',
    answer: 'Mars',
    isCorrect: null,
    points: 200,
  },
  {
    id: 'q-sci-3',
    text: 'What is the largest organ in the human body?',
    answer: 'Skin',
    isCorrect: null,
    points: 300,
  },
  {
    id: 'q-sci-4',
    text: "What is the most abundant gas in Earth's atmosphere?",
    answer: 'Nitrogen',
    isCorrect: null,
    points: 400,
  },
  {
    id: 'q-sci-5',
    text: 'What is the hardest natural substance on Earth?',
    answer: 'Diamond',
    isCorrect: null,
    points: 500,
  },
  {
    id: 'q-sci-6',
    text: 'What is the name of the process by which plants make food?',
    answer: 'Photosynthesis',
    isCorrect: null,
    points: 700,
  },
]

// Rounds
const mockRounds: Round[] = [
  {
    id: 'round-1',
    name: 'Pop Culture',
    ranks: popCultureRanks,
    questions: popCultureQuestions,
  },
  {
    id: 'round-2',
    name: 'Science & Nature',
    ranks: scienceRanks,
    questions: scienceQuestions,
  },
]

// Complete mock game
export const mockGame: Game = {
  id: 'game-123456',
  users: mockUsers,
  rounds: mockRounds,
  currentRound: 1,
  currentQuestion: 0,
}

export default mockGame
