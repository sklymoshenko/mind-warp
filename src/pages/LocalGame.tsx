import { Route, useNavigate } from '@solidjs/router'
import GamePreview from './GamePreview'
import CreateGame from './CreateGame'
import { createSignal, createMemo } from 'solid-js'
import mockGame from '../data/mockGame'
import { Game, Question, Round, User } from '../types'

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

  const onRoundClick = (round: Round, navigate?: (path: string) => void) => {
    navigate?.(`/local/game/${game().id}/round/${round.id}`)
  }

  const onGameFinish = (updatedGame: Game) => {
    const gamesHistory: Game[] = JSON.parse(localStorage.getItem('gamesHistory') || '[]')
    gamesHistory.push(updatedGame)
    localStorage.setItem('gamesHistory', JSON.stringify(gamesHistory))
    localStorage.removeItem('currentGame')
  }

  const onGameFinishClose = (navigate?: (path: string) => void) => {
    navigate?.('/')
  }

  return (
    <>
      <Route path="/local/create-game" component={() => <CreateGame onGameUpdate={handleGameUpdate} />} />
      {game() && (
        <Route
          path="/local/game/:gameId"
          component={() => {
            const navigate = useNavigate()
            return (
              <GamePreview
                onUpdateGame={setGame}
                game={game()!}
                onRoundClick={(round) => onRoundClick(round, navigate)}
                onGameFinish={onGameFinish}
                onGameFinishClose={() => onGameFinishClose(navigate)}
              />
            )
          }}
        />
      )}
      {currentRound() && (
        <Route
          path="/local/game/:gameid/round/:roundId"
          component={() => (
            <GameRound
              round={currentRound()!}
              users={game().users}
              currentQuestion={game().currentQuestion!}
              onQuestionSelect={onQuestionSelect}
              onQuestionAnswered={onQuestionAnswered}
              updateForExtraAnswerer={onUpdateForExtraAnswerer}
              currentUser={game().currentUser!}
            />
          )}
        />
      )}
    </>
  )
}

export default LocalGame
