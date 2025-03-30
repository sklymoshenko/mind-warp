import './App.css'
import BackgroundWrapper from './components/BackgroundWrapper'
import CreateGame from './pages/CreateGame'
import WelcomePage from './pages/WelcomePage'
import { Router, Route } from '@solidjs/router'
import { Game } from './types'
import { createMemo, createSignal } from 'solid-js'
import GameDashboard from './pages/Dashboard'
import mockGame from './data/mockGame'
import GameRound from './pages/GameRound'

export default () => {
  const [game, setGame] = createSignal<Game>(mockGame)
  const currentRound = createMemo(() => {
    return game().rounds.find((r) => r.id === game().currentRound)
  })

  const onQuestionSelect = (question: Game['currentQuestion']) => {
    setGame((prev) => ({
      ...prev,
      currentQuestion: question,
    }))
  }

  const onQuestionAnswered = (question: Game['currentQuestion'], isCorrect: boolean) => {
    const newRoundIndex = game().rounds.findIndex((r) => r.id === game().currentRound)

    if (newRoundIndex === -1) return
    const newRound = { ...game().rounds[newRoundIndex] }

    const newThemes = newRound.themes.map((theme) => {
      const newQuestions = theme.questions.map((q) => {
        if (q.id === question) {
          return { ...q, isCorrect }
        }
        return q
      })
      return { ...theme, questions: newQuestions }
    })

    const updatedRound = { ...newRound, themes: newThemes }
    game().rounds[newRoundIndex] = updatedRound

    const newGame = { ...game() }
    setGame(newGame)
  }

  return (
    <BackgroundWrapper>
      <Router>
        <Route path="/" component={WelcomePage} />
        <Route path="/create-game" component={(props) => <CreateGame onGameCreated={setGame} {...props} />} />
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
                {...props}
              />
            )}
          />
        )}
      </Router>
    </BackgroundWrapper>
  )
}
