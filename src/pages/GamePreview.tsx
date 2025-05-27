// src/GamePreview.tsx
import { createSignal, For, Show } from 'solid-js'
import { Game, Round, User } from '../types'
import { TbConfetti } from 'solid-icons/tb'
import GameFinished from '../components/GameFinish'
import { Confirm } from '../components/Confirm'

interface GamePreviewProps {
  game: Game
  onUpdateGame: (game: Game) => void
  onRoundClick: (round: Round) => void
  onGameFinish: (game: Game) => void
  onGameFinishClose: () => void
}

export default function GamePreview(props: GamePreviewProps) {
  const [isGameFinished, setIsGameFinished] = createSignal(false)

  const scores = props.game.users.reduce(
    (acc, curr) => {
      const totalScore = Object.values(curr.roundScore ?? {}).reduce((acc, score) => acc + score, 0)
      acc[curr.id] = totalScore
      return acc
    },
    {} as Record<User['id'], number>
  )

  const winningUser = () => {
    return Object.entries(scores).reduce(
      (acc, curr) => {
        if (curr[1] > scores[acc]) {
          return curr[0] as User['id']
        }
        return acc
      },
      Object.keys(scores)[0] as User['id']
    )
  }

  const onRoundClick = (round: Round) => {
    props.onUpdateGame({
      ...props.game,
      currentRound: round.id,
      currentUser: props.game.currentUser || props.game.users[0].id,
    })
    props.onRoundClick(round)
  }

  const handleFinish = () => {
    setIsGameFinished(true)
    const updatedGame: Game = {
      ...props.game,
      isFinished: true,
      currentRound: '',
      currentQuestion: '',
      currentUser: '',
      winner: winningUser(),
      finishDate: Date.now(),
    }
    props.onGameFinish(updatedGame)
  }

  const onFinishClose = () => {
    setIsGameFinished(false)
    props.onGameFinishClose()
  }

  return (
    <>
      <div class="absolute top-4 left-4 md:top-8 md:left-8 z-20">
        <button
          onClick={() => window.history.back()}
          class="text-primary text-sm md:text-lg font-bold uppercase tracking-wider hover:text-white transition-all duration-300 hover:cursor-pointer"
        >
          Back
        </button>
      </div>
      <Show when={isGameFinished()}>
        <GameFinished
          onClose={onFinishClose}
          isOpen={isGameFinished()}
          users={props.game.users}
          winner={winningUser()}
          scores={scores}
        />
      </Show>
      <div class="flex flex-col justify-between h-[90%] sm:h-[60%] xl:h-[70%] max-w-full sm:max-w-none">
        <div class="mx-auto flex gap-12 sm:flex-nowrap flex-wrap max-w-full sm:max-w-none">
          <For each={props.game.rounds}>
            {(round, i) => {
              return (
                <div
                  class="min-w-[100px] sm:min-w-[300px] h-fit bg-void text-primary rounded-md p-2 drop-shadow-lg hover:shadow-[0_0px_70px_rgba(255,255,255,0.3)] hover:-translate-y-2  hover:cursor-pointer transition-all duration-300"
                  onclick={() => onRoundClick(round)}
                >
                  <h1 class="font-semibold text-xl mb-4 sm:text-3xl sm:mb-6">
                    Round {i() + 1}: {round.name}
                  </h1>
                  <div class="flex items-center justify-between">
                    <div class="flex flex-col">
                      <For each={round.themes}>
                        {(theme) => {
                          return <div class="font-medium text-lg sm:text-2xl">{theme.name}</div>
                        }}
                      </For>
                    </div>
                    <div class="w-[1px] bg-primary h-20 mx-4 sm:mx-14" />
                    <div class="flex flex-col justify-start w-[230px]">
                      <For each={props.game.users}>
                        {(user) => {
                          return (
                            <div class="flex items-end justify-between">
                              <span class="text-lg sm:text-2xl font-bold">{user.name}</span>
                              <span class="text-xs sm:text-sm text-gray-500 ml-2 mb-0.5">
                                {user.roundScore?.[round.id] ?? 0}
                              </span>
                            </div>
                          )
                        }}
                      </For>
                    </div>
                  </div>
                </div>
              )
            }}
          </For>
        </div>
        <Confirm
          onConfirm={handleFinish}
          onCancel={() => setIsGameFinished(false)}
          title="Finish Game"
          message="Are you sure you want to finish the game?"
        >
          <button class="my-4 sm:my-0 mx-auto w-full sm:w-[300px] p-1 sm:p-4 bg-primary text-void font-bold text-2xl rounded-md drop-shadow-lg hover:shadow-[0_0px_70px_rgba(255,255,255,0.3)] hover:-translate-y-2  hover:cursor-pointer transition-all duration-300">
            Finish
          </button>
        </Confirm>
        <div class="flex flex-col sm:flex-row justify-between p-2 gap-12 flex-wrap sm:flex-nowrap mt-4 sm:mt-0">
          <For each={props.game.users}>
            {(user) => {
              return (
                <div class="flex flex-col items-center justify-between gap-2 sm:gap-4">
                  <div class="text-lg sm:text-3xl font-bold text-primary flex items-center gap-4 sm:gap-2">
                    <span>{user.name}</span> {winningUser() === user.id && <TbConfetti class="text-orange-300" />}
                  </div>
                  <span
                    class="text-2xl text-gray-500 ml-2 mb-0.5"
                    classList={{ 'text-green-600': winningUser() === user.id }}
                  >
                    {scores[user.id]}
                  </span>
                </div>
              )
            }}
          </For>
        </div>
      </div>
    </>
  )
}
