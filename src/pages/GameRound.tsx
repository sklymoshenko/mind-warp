import { createEffect, createMemo, For } from 'solid-js'
import { Game, Round, User } from '../types'
import { TbConfetti } from 'solid-icons/tb'

type Props = {
  round: Round
  users: Game['users']
}

const GameRound = (props: Props) => {
  const scores = () => {
    return props.users.reduce(
      (acc, curr) => {
        acc[curr.id] = curr.roundScore.find((score) => score.roundId === props.round.id)?.score || 0
        return acc
      },
      {} as Record<User['id'], number>
    )
  }
  const winningUser = createMemo(() => {
    return Object.entries(scores()).reduce(
      (acc, curr) => {
        if (curr[1] > scores()[acc]) {
          return curr[0] as User['id']
        }
        return acc
      },
      Object.keys(scores())[0] as User['id']
    )
  })

  return (
    <div class="flex flex-col justify-between h-[70%]">
      <div class="flex flex-col items-center text-primary mx-auto">
        <h1 class="text-3xl font-bold mb-20">{props.round.name} </h1>
        <div class="flex justify-center gap-4">
          <For each={props.round.themes}>
            {(theme) => {
              return (
                <div class="flex flex-col items-center font-semibold min-w-[200px]">
                  <span class="text-2xl mb-2">{theme.name}</span>
                  <div class="flex flex-col text-3xl gap-2">
                    <For each={props.round.ranks}>
                      {(rank) => {
                        return <span>{rank.label}</span>
                      }}
                    </For>
                  </div>
                </div>
              )
            }}
          </For>
        </div>
      </div>
      <div class="flex justify-between p-2 gap-12">
        <For each={props.users}>
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
                  {scores()[user.id]}
                </span>
              </div>
            )
          }}
        </For>
      </div>
    </div>
  )
}

export default GameRound
