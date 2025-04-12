import './App.css'
import BackgroundWrapper from './components/BackgroundWrapper'
import CreateGame from './pages/CreateGame'
import WelcomePage from './pages/WelcomePage'
import { Router, Route } from '@solidjs/router'
import { Game, Question, User } from './types'
import { createMemo, createSignal } from 'solid-js'
import GameDashboard from './pages/Dashboard'
import mockGame from './data/mockGame'
import GameRound from './pages/GameRound'
import GameHistory from './pages/GameHistory'

const Main = () => {
  const storageGame = localStorage.getItem('currentGame')
  const [game, setGame] = createSignal<Game>(storageGame ? JSON.parse(storageGame) : mockGame)

  const currentRound = createMemo(() => {
    return game()?.rounds.find((r) => r.id === game().currentRound)
  })

  const onQuestionSelect = (question: Game['currentQuestion']) => {
    setGame((prev) => ({
      ...prev,
      currentQuestion: question,
    }))
  }

  const newUserTurn = () => {
    const userIndex = game().users.findIndex((u) => u.id === game().currentUser)

    if (userIndex === -1) return

    const nextUserIndex = userIndex + 1 > game().users.length - 1 ? 0 : userIndex + 1

    setGame((prev) => ({
      ...prev,
      currentUser: prev.users[nextUserIndex].id,
    }))
  }

  const updateRoundQuestion = (question: Question, isCorrect: boolean, currentRoundIndex: number) => {
    const newRound = { ...game().rounds[currentRoundIndex] }

    const newThemes = newRound.themes.map((theme) => {
      const newQuestions = theme.questions.map((q) => {
        if (q.id === question.id) {
          return { ...q, isCorrect }
        }
        return q
      })
      return { ...theme, questions: newQuestions }
    })

    return { ...newRound, themes: newThemes }
  }

  const updateUser = (question: Question, isCorrect: boolean, userIndex: number): User => {
    const newUser = { ...game().users[userIndex] }
    newUser.roundScore[game().currentRound] = isCorrect
      ? newUser.roundScore[game().currentRound] + question.points
      : newUser.roundScore[game().currentRound] - question.points

    return newUser
  }

  const onQuestionAnswered = (question: Question, isCorrect: boolean, userId: User['id']) => {
    const currentRoundIndex = game().rounds.findIndex((r) => r.id === game().currentRound)
    if (currentRoundIndex === -1) return

    game().rounds[currentRoundIndex] = updateRoundQuestion(question, isCorrect, currentRoundIndex)

    const userIndex = game().users.findIndex((u) => u.id === userId)
    if (userIndex === -1) return
    game().users[userIndex] = updateUser(question, isCorrect, userIndex)

    const newGame = { ...game() }
    setGame(newGame)

    if (userId === game().currentUser) {
      newUserTurn()
    }
  }

  const onUpdateForExtraAnswerer = (question: Question, isCorrect: boolean, userId: User['id']) => {
    const userIndex = game().users.findIndex((u) => u.id === userId)
    if (userIndex === -1) return
    game().users[userIndex] = updateUser(question, isCorrect, userIndex)

    const newGame = { ...game() }
    setGame(newGame)
  }

  const handleGameUpdate = (updatedGame: Game) => {
    setGame(updatedGame)
    localStorage.setItem('currentGame', JSON.stringify(updatedGame))
  }

  return (
    <BackgroundWrapper>
      <Router>
        <Route path="/" component={WelcomePage} />
        <Route path="/create-game" component={(props) => <CreateGame onGameUpdate={handleGameUpdate} {...props} />} />
        {game() && (
          <Route
            path="/game/:gameId"
            component={(props) => <GameDashboard onUpdateGame={setGame} game={game()!} {...props} />}
          />
        )}
        {currentRound() && (
          <Route
            path="/game/:gameid/round/:roundId"
            component={(props) => (
              <GameRound
                round={currentRound()!}
                users={game().users}
                currentQuestion={game().currentQuestion}
                onQuestionSelect={onQuestionSelect}
                onQuestionAnswered={onQuestionAnswered}
                updateForExtraAnswerer={onUpdateForExtraAnswerer}
                currentUser={game().currentUser}
                {...props}
              />
            )}
          />
        )}
        <Route path={'games-history'} component={GameHistory} />
      </Router>
    </BackgroundWrapper>
  )
}

export default Main
