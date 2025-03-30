import { Game, User, Round, Question, RoundRank } from '../types'

// Mock users
const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Trivia Master',
    isAdmin: true,
    roundScore: {
      'round-1': 1200,
      'round-2': 800,
    },
  },
  {
    id: 'user-2',
    name: 'Quiz Champion',
    isAdmin: false,
    roundScore: {
      'round-1': 900,
      'round-2': 1000,
    },
  },
  {
    id: 'user-3',
    name: 'Knowledge Seeker',
    isAdmin: false,
    roundScore: {
      'round-1': 700,
      'round-2': 900,
    },
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

// Questions for different themes - ensuring each theme has a question for each rank
const marvelQuestions: Question[] = [
  {
    id: 'q-marvel-1',
    text: 'Which actor played Iron Man in the Marvel Cinematic Universe?',
    answer: 'Robert Downey Jr.',
    isCorrect: null,
    points: 100,
  },
  {
    id: 'q-marvel-2',
    text: 'Who is the villain in the first Avengers movie?',
    answer: 'Loki',
    isCorrect: null,
    points: 200,
  },
  {
    id: 'q-marvel-3',
    text: "What is the name of Thor's hammer?",
    answer: 'Mjolnir',
    isCorrect: null,
    points: 300,
  },
  {
    id: 'q-marvel-4',
    text: 'In which fictional country is Wakanda located?',
    answer: 'Africa',
    isCorrect: null,
    points: 400,
  },
  {
    id: 'q-marvel-5',
    text: 'Who was the first Avenger in the MCU timeline?',
    answer: 'Captain America',
    isCorrect: null,
    points: 500,
  },
]

const tvSeriesQuestions: Question[] = [
  {
    id: 'q-tv-1',
    text: "In Friends, what is Joey's catchphrase?",
    answer: "How you doin'?",
    isCorrect: null,
    points: 100,
  },
  {
    id: 'q-tv-2',
    text: 'Which TV series features a high school chemistry teacher who turns to manufacturing methamphetamine?',
    answer: 'Breaking Bad',
    isCorrect: null,
    points: 200,
  },
  {
    id: 'q-tv-3',
    text: 'What is the name of the continent where Game of Thrones takes place?',
    answer: 'Westeros',
    isCorrect: null,
    points: 300,
  },
  {
    id: 'q-tv-4',
    text: 'In "The Office", what company does Michael Scott work for?',
    answer: 'Dunder Mifflin',
    isCorrect: null,
    points: 400,
  },
  {
    id: 'q-tv-5',
    text: 'Which TV show features dragons, white walkers, and the Iron Throne?',
    answer: 'Game of Thrones',
    isCorrect: null,
    points: 500,
  },
]

const musicQuestions: Question[] = [
  {
    id: 'q-music-1',
    text: 'Who was the lead singer of Queen?',
    answer: 'Freddie Mercury',
    isCorrect: null,
    points: 100,
  },
  {
    id: 'q-music-2',
    text: 'What instrument does Paul McCartney primarily play?',
    answer: 'Bass guitar',
    isCorrect: null,
    points: 200,
  },
  {
    id: 'q-music-3',
    text: 'Which band released the album "Abbey Road"?',
    answer: 'The Beatles',
    isCorrect: null,
    points: 300,
  },
  {
    id: 'q-music-4',
    text: 'Who is known as the "King of Pop"?',
    answer: 'Michael Jackson',
    isCorrect: null,
    points: 400,
  },
  {
    id: 'q-music-5',
    text: 'Which famous music festival took place in 1969 featuring Jimi Hendrix?',
    answer: 'Woodstock',
    isCorrect: null,
    points: 500,
  },
]

const chemistryQuestions: Question[] = [
  {
    id: 'q-chem-1',
    text: 'What is the chemical symbol for gold?',
    answer: 'Au',
    isCorrect: null,
    points: 100,
  },
  {
    id: 'q-chem-2',
    text: 'What is the most reactive group in the periodic table?',
    answer: 'Alkali metals',
    isCorrect: null,
    points: 200,
  },
  {
    id: 'q-chem-3',
    text: 'What is the pH of pure water?',
    answer: '7',
    isCorrect: null,
    points: 300,
  },
  {
    id: 'q-chem-4',
    text: "What is the most abundant gas in Earth's atmosphere?",
    answer: 'Nitrogen',
    isCorrect: null,
    points: 400,
  },
  {
    id: 'q-chem-5',
    text: 'What element has the chemical symbol Hg?',
    answer: 'Mercury',
    isCorrect: null,
    points: 500,
  },
  {
    id: 'q-chem-6',
    text: 'What is the process of splitting an atom called?',
    answer: 'Nuclear fission',
    isCorrect: null,
    points: 700,
  },
]

const astronomyQuestions: Question[] = [
  {
    id: 'q-astro-1',
    text: 'What is the closest star to Earth?',
    answer: 'The Sun',
    isCorrect: null,
    points: 100,
  },
  {
    id: 'q-astro-2',
    text: 'What planet is known as the Red Planet?',
    answer: 'Mars',
    isCorrect: null,
    points: 200,
  },
  {
    id: 'q-astro-3',
    text: 'What is a light-year?',
    answer: 'The distance light travels in one year',
    isCorrect: null,
    points: 300,
  },
  {
    id: 'q-astro-4',
    text: 'Which planet has the Great Red Spot?',
    answer: 'Jupiter',
    isCorrect: null,
    points: 400,
  },
  {
    id: 'q-astro-5',
    text: 'What is the name of the galaxy that contains our Solar System?',
    answer: 'Milky Way',
    isCorrect: null,
    points: 500,
  },
  {
    id: 'q-astro-6',
    text: 'What is the largest moon of Saturn?',
    answer: 'Titan',
    isCorrect: null,
    points: 700,
  },
]

const biologyQuestions: Question[] = [
  {
    id: 'q-bio-1',
    text: 'What is the powerhouse of the cell?',
    answer: 'Mitochondria',
    isCorrect: null,
    points: 100,
  },
  {
    id: 'q-bio-2',
    text: 'What is the basic unit of life?',
    answer: 'Cell',
    isCorrect: null,
    points: 200,
  },
  {
    id: 'q-bio-3',
    text: 'What is the largest organ in the human body?',
    answer: 'Skin',
    isCorrect: null,
    points: 300,
  },
  {
    id: 'q-bio-4',
    text: 'What are the building blocks of proteins?',
    answer: 'Amino acids',
    isCorrect: null,
    points: 400,
  },
  {
    id: 'q-bio-5',
    text: 'What part of the human body contains the most bones?',
    answer: 'Hands and feet',
    isCorrect: null,
    points: 500,
  },
  {
    id: 'q-bio-6',
    text: 'What is the name of the process by which plants make food?',
    answer: 'Photosynthesis',
    isCorrect: null,
    points: 700,
  },
]

// Themes
const popCultureThemes = [
  {
    id: 'theme-marvel',
    name: 'Marvel Universe',
    questions: marvelQuestions,
  },
  {
    id: 'theme-tv',
    name: 'TV Series',
    questions: tvSeriesQuestions,
  },
  {
    id: 'theme-music',
    name: 'Music',
    questions: musicQuestions,
  },
]

const scienceThemes = [
  {
    id: 'theme-chemistry',
    name: 'Chemistry',
    questions: chemistryQuestions,
  },
  {
    id: 'theme-astronomy',
    name: 'Astronomy',
    questions: astronomyQuestions,
  },
  {
    id: 'theme-biology',
    name: 'Biology',
    questions: biologyQuestions,
  },
]

// Rounds
const mockRounds: Round[] = [
  {
    id: 'round-1',
    name: 'Pop Culture',
    ranks: popCultureRanks,
    themes: popCultureThemes,
  },
  {
    id: 'round-2',
    name: 'Science & Nature',
    ranks: scienceRanks,
    themes: scienceThemes,
  },
]

// Complete mock game
export const mockGame: Game = {
  id: 'game-123456',
  users: mockUsers,
  rounds: mockRounds,
  currentRound: 'round-1',
  currentQuestion: '',
  currentUser: 'user-1',
}

export default mockGame
