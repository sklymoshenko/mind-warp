// src/GamePreview.tsx
import { createMemo, createSignal, For, Show } from 'solid-js'
import { Game, Round, User } from '../types'
import { TbConfetti } from 'solid-icons/tb'
import GameFinished from '../components/GameFinish'
import { Confirm } from '../components/Confirm'
import { calculateUserGameScore } from '../utils'
import { useNavigate } from '@solidjs/router'

interface GamePreviewProps {
  game: Game
  onUpdateGame: (game: Game) => void
  onRoundClick: (round: Round) => void
  onGameFinish: (game: Game) => void
  onGameFinishClose: () => void
}

export default function GamePreview(props: GamePreviewProps) {
  const [isGameFinished, setIsGameFinished] = createSignal(false)
  const [finishTimeout, setFinishTimeout] = createSignal<NodeJS.Timeout>()
  const navigate = useNavigate()

  // Create a memo to determine if it's a local game based on the URL
  const isLocalGame = createMemo(() => {
    const currentUrl = window.location.pathname
    return currentUrl.includes('/local/')
  })

  const scores = createMemo(() => calculateUserGameScore(props.game.users))

  const winningUser = () => {
    const winningUserId = Object.entries(scores).reduce(
      (acc, curr) => {
        if (curr[1] > scores()[acc]) {
          return curr[0] as User['id']
        }
        return acc
      },
      Object.keys(scores)[0] as User['id']
    )

    return props.game.users.find((user) => user.id === winningUserId)
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

    const timeout = setTimeout(() => {
      props.onGameFinish(updatedGame)
    }, 20000)
    setFinishTimeout(timeout)
  }

  const onFinishClose = () => {
    setIsGameFinished(false)
    const updatedGame: Game = {
      ...props.game,
      isFinished: true,
      currentRound: '',
      currentQuestion: '',
      currentUser: '',
      winner: winningUser(),
      finishDate: Date.now(),
    }
    clearTimeout(finishTimeout())
    props.onGameFinish(updatedGame)
  }

  return (
    <>
      <div class="absolute top-4 left-4 md:top-8 md:left-8 z-20">
        <button
          onClick={() => (isLocalGame() ? navigate('/') : window.history.back())}
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
          winningUser={winningUser()}
          scores={scores()}
        />
      </Show>
      <div class="flex flex-col justify-between h-full max-w-full sm:max-w-none overflow-y-auto max-h-[90dvh] md:max-h-[90%] lg:max-h-[90%]">
        <div class="mx-auto flex gap-12 lg:flex-nowrap flex-wrap max-w-full sm:max-w-none mb-10">
          <For each={props.game.rounds}>
            {(round) => {
              return (
                <div class="flex flex-col gap-4 w-[90%] mx-auto lg:w-auto lg:mx-0 lg:h-full">
                  <h1 class="text-primary font-semibold text-xl sm:text-2xl">{round.name}</h1>
                  <div
                    class="flex justify-between min-w-[250px] w-full h-fit border border-primary/20 p-4 text-white rounded-md hover:-translate-y-1  hover:cursor-pointer transition-all duration-300 lg:flex-grow"
                    onclick={() => onRoundClick(round)}
                  >
                    <div class="flex flex-col lg:w-[45%]">
                      <h3 class="text-primary font-semibold">Themes:</h3>
                      <ul class="flex flex-col">
                        <For each={round.themes}>
                          {(theme) => {
                            return <li class="text-white ml-2">- {theme.name}</li>
                          }}
                        </For>
                      </ul>
                    </div>
                    <div class="flex flex-col w-[45%]">
                      <h3 class="text-primary font-semibold">Players:</h3>
                      <ul class="flex flex-col">
                        <For each={props.game.users}>
                          {(user) => {
                            return (
                              <li class="text-white ml-2 flex justify-between items-end">
                                <span>{user.name}</span>
                                <span
                                  class="text-sm mb-0.5"
                                  classList={{
                                    'text-green-500': (user.roundScore?.[round.id] ?? 0) > 0,
                                    'text-red-500': (user.roundScore?.[round.id] ?? 0) < 0,
                                  }}
                                >
                                  {user.roundScore?.[round.id] ?? 0}
                                </span>
                              </li>
                            )
                          }}
                        </For>
                      </ul>
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
          <button class=" mx-auto w-[90%] sm:w-[300px] p-1 sm:p-4 bg-primary text-void font-bold text-2xl rounded-md drop-shadow-lg hover:shadow-[0_0px_70px_rgba(255,255,255,0.3)] hover:-translate-y-2  hover:cursor-pointer transition-all duration-300">
            Finish
          </button>
        </Confirm>
        <div class="w-[90%] mx-auto flex flex-row justify-between p-2 gap-12 flex-wrap sm:flex-nowrap mt-4 sm:mt-0">
          <For each={props.game.users}>
            {(user) => {
              return (
                <div class="flex flex-col items-center justify-between gap-2 sm:gap-4">
                  <div class="text-lg sm:text-3xl font-bold text-primary flex items-center gap-4 sm:gap-2">
                    <span>{user.name}</span> {winningUser()?.id === user.id && <TbConfetti class="text-orange-300" />}
                  </div>
                  <span
                    class="text-2xl text-gray-500 ml-2 mb-0.5"
                    classList={{ 'text-green-600': winningUser()?.id === user.id }}
                  >
                    {scores()[user.id]}
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
