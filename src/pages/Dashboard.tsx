// src/GameDashboard.tsx
import { For } from 'solid-js'
import { Game, Round, User } from '../types'
import { TbConfetti } from 'solid-icons/tb'
import { useNavigate } from '@solidjs/router'

interface GameDashboardProps {
  game: Game
  onUpdateGame: (game: Game) => void
}

export default function GameDashboard(props: GameDashboardProps) {
  const navigate = useNavigate()

  const scores = props.game.users.reduce(
    (acc, curr) => {
      const totalScore = curr.roundScore.reduce((acc, score) => acc + score.score, 0)
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
    props.onUpdateGame({ ...props.game, currentRound: round.id })
    navigate(`/game/${props.game.id}/round/${round.id}`)
  }

  return (
    <div class="flex flex-col justify-between h-[70%]">
      <div class="mx-auto flex gap-12">
        <For each={props.game.rounds}>
          {(round, i) => {
            return (
              <div
                class="min-w-[300px] h-fit bg-void text-primary rounded-md p-2 drop-shadow-lg hover:shadow-[0_0px_70px_rgba(255,255,255,0.3)] hover:-translate-y-2  hover:cursor-pointer transition-all duration-300"
                onclick={() => onRoundClick(round)}
              >
                <h1 class="font-semibold text-3xl mb-6">
                  Round {i() + 1}: {round.name}
                </h1>
                <div class="flex items-center justify-between">
                  <div class="flex flex-col">
                    <For each={round.themes}>
                      {(theme) => {
                        return <div class="font-medium text-2xl">{theme.name}</div>
                      }}
                    </For>
                  </div>
                  <div class="w-[1px] bg-primary h-20 mx-14" />
                  <div class="flex flex-col justify-start w-[230px]">
                    <For each={props.game.users}>
                      {(user) => {
                        return (
                          <div class="flex items-end justify-between">
                            <span class="text-2xl font-bold">{user.name}</span>
                            <span class="text-sm text-gray-500 ml-2 mb-0.5">
                              {user.roundScore
                                .filter((score) => score.roundId === round.id)
                                .reduce((acc, score) => acc + score.score, 0)}
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
      <div class="flex justify-between p-2 gap-12">
        <For each={props.game.users}>
          {(user) => {
            return (
              <div class="flex flex-col items-center justify-between gap-4">
                <div class="text-3xl font-bold text-primary flex items-center gap-2">
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
  )
}
