import { Route, useNavigate, useParams } from '@solidjs/router'
import GamePreview from './GamePreview'
import { createEffect, createMemo, createResource, createSignal, Show } from 'solid-js'
import { Game, Question, Round, User } from '../types'
import GameRound from './GameRound'
import { useApi } from '../hooks/useApi'

type RemoteGameProps = {
  game?: Game
}

const RemoteGameRoutes = (props: RemoteGameProps) => {
  const { post: finishGame } = useApi(`games/finish`)
  const [game, setGame] = createSignal<Game>()

  const currentRound = createMemo(() => {
    return game()?.rounds.find((r) => r.id === game()?.currentRound)
  })

  const onQuestionSelect = (question: Game['currentQuestion']) => {
    setGame((prev) => ({
      ...prev!,
      currentQuestion: question,
    }))
  }

  const newUserTurn = () => {
    const userIndex = game()?.users.findIndex((u) => u.id === game()?.currentUser) || -1

    if (userIndex === -1 || !game()) return

    const nextUserIndex = userIndex + 1 > game()!.users.length - 1 ? 0 : userIndex + 1

    setGame((prev) => ({
      ...prev!,
      currentUser: prev!.users[nextUserIndex].id,
    }))
  }

  const updateRoundQuestion = (question: Question, isCorrect: boolean, currentRoundIndex: number) => {
    const newRound = { ...game()!.rounds[currentRoundIndex] }

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
    const newUser = { ...game()!.users[userIndex] }
    const score = newUser.roundScore[game()!.currentRound!] || 0
    newUser.roundScore[game()!.currentRound!] = isCorrect ? score + question.points : score - question.points

    return newUser
  }

  const onQuestionAnswered = (question: Question, isCorrect: boolean, userId: User['id']) => {
    const currentRoundIndex = game()?.rounds.findIndex((r) => r.id === game()?.currentRound) || -1
    if (currentRoundIndex === -1) return

    game()!.rounds[currentRoundIndex] = updateRoundQuestion(question, isCorrect, currentRoundIndex)

    const userIndex = game()?.users.findIndex((u) => u.id === userId) || -1
    if (userIndex === -1 || !game()) return
    game()!.users[userIndex] = updateUser(question, isCorrect, userIndex)

    const newGame = { ...game()! }
    setGame(newGame)

    if (userId === game()!.currentUser) {
      newUserTurn()
    }
  }

  const onUpdateForExtraAnswerer = (question: Question, isCorrect: boolean, userId: User['id']) => {
    const userIndex = game()?.users.findIndex((u) => u.id === userId) || -1
    if (userIndex === -1 || !game()) return
    game()!.users[userIndex] = updateUser(question, isCorrect, userIndex)

    const newGame = { ...game()! }
    setGame(newGame)
  }

  const onRoundClick = (round: Round, navigate?: (path: string) => void) => {
    navigate?.(`/game/${game()!.id}/round/${round.id}`)
  }

  const onGameFinish = async (finishedGame: Game, navigate?: (path: string) => void) => {
    const response = await finishGame<Game>({}, `/${finishedGame.id}`)
    if (!response.error) {
      navigate?.('/dashboard')
    }
  }

  const onGameFinishClose = (navigate?: (path: string) => void) => {
    navigate?.('/dashboard')
  }

  return (
    <>
      <Route
        path="/game/:gameId"
        component={() => {
          const navigate = useNavigate()
          const { get: getGame } = useApi('/games')
          const params = useParams()

          const [gameResource] = createResource(
            () => params.gameId,
            async (gameId) => {
              debugger
              if (!gameId) return undefined
              const response = await getGame<Game[]>(`/${gameId}`)
              if (response.data) {
                setGame(response.data[0])
                return response.data[0]
              }
              return undefined
            }
          )

          createEffect(() => {
            console.log(gameResource())
          })

          return (
            <Show when={game()}>
              <GamePreview
                onUpdateGame={setGame}
                game={game()!}
                onRoundClick={(round) => onRoundClick(round, navigate)}
                onGameFinish={(finishedGame) => onGameFinish(finishedGame, navigate)}
                onGameFinishClose={() => onGameFinishClose(navigate)}
              />
            </Show>
          )
        }}
      />
      {currentRound() && (
        <Route
          path="/game/:gameid/round/:roundId"
          component={() => (
            <GameRound
              round={currentRound()!}
              users={game()?.users || []}
              currentQuestion={game()?.currentQuestion || ''}
              onQuestionSelect={onQuestionSelect}
              onQuestionAnswered={onQuestionAnswered}
              updateForExtraAnswerer={onUpdateForExtraAnswerer}
              currentUser={game()?.currentUser || ''}
            />
          )}
        />
      )}
    </>
  )
}

export default RemoteGameRoutes
