import { Route, Router } from '@solidjs/router'
import GameDashboard from './Dashboard'
import CreateGame from './CreateGame'
import { createSignal, createMemo } from 'solid-js'
import mockGame from '../data/mockGame'
import { Game, Question, User } from '../types'
import GameHistory from './GameHistory'
import GameRound from './GameRound'

const LocalGame = () => {
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
    const score = newUser.roundScore[game().currentRound!] || 0
    newUser.roundScore[game().currentRound!] = isCorrect ? score + question.points : score - question.points

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
    <>
      <Route
        path="/local/create-game"
        component={(props) => <CreateGame onGameUpdate={handleGameUpdate} {...props} />}
      />
      {game() && (
        <Route
          path="/local/game/:gameId"
          component={(props) => <GameDashboard onUpdateGame={setGame} game={game()!} {...props} />}
        />
      )}
      {currentRound() && (
        <Route
          path="/local/game/:gameid/round/:roundId"
          component={(props) => (
            <GameRound
              round={currentRound()!}
              users={game().users}
              currentQuestion={game().currentQuestion!}
              onQuestionSelect={onQuestionSelect}
              onQuestionAnswered={onQuestionAnswered}
              updateForExtraAnswerer={onUpdateForExtraAnswerer}
              currentUser={game().currentUser!}
              {...props}
            />
          )}
        />
      )}
      <Route path={'local/games-history'} component={GameHistory} />
    </>
  )
}

export default LocalGame
