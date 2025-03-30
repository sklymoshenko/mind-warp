import { createMemo, createSignal, For } from 'solid-js'
import { Game, Round, User } from '../types'
import { TbConfetti } from 'solid-icons/tb'
import { A } from '@solidjs/router'
import QuestionModal from '../components/QuestionModal'

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

  const [isActive, setIsActive] = createSignal<string | null>(null)

  const currentQuestion = createMemo(() => {
    const [themeId, rankId] = isActive()?.split(' ') || []
    const theme = props.round.themes.find((theme) => theme.id === themeId)
    const rank = props.round.ranks.find((rank) => rank.id === Number(rankId))
    return theme?.questions.find((question) => question.points === rank?.id)
  })

  return (
    <>
      <QuestionModal question={currentQuestion()?.text || ''} onClose={() => console.log('close')} />
      {/* Back to Home Link */}
      <div class="absolute top-4 left-4 md:top-8 md:left-8 z-20">
        <A
          href="/"
          class="text-primary text-sm md:text-lg font-bold uppercase tracking-wider hover:text-white transition-all duration-300"
        >
          Back to Home
        </A>
      </div>
      <div class="flex flex-col justify-between h-[70%] z-50">
        <div class="flex flex-col items-center text-primary mx-auto">
          <h1 class="text-5xl font-bold mb-20">{props.round.name} </h1>
          <div class="flex justify-center gap-4">
            <For each={props.round.themes}>
              {(theme) => {
                return (
                  <div class="flex flex-col items-center font-semibold min-w-[200px] group">
                    <span class="text-4xl mb-2 group-hover:text-green-600 group-hover:scale-120 transition-all duration-300">
                      {theme.name}
                    </span>
                    <div class="flex flex-col text-7xl gap-2">
                      <For each={props.round.ranks}>
                        {(rank) => {
                          return (
                            <span
                              onClick={() => setIsActive(theme.id + ' ' + rank.id)}
                              class="child relative hover:cursor-pointer"
                              classList={{
                                'click-red': isActive() === theme.id + ' ' + rank.id,
                                'hover-rank': isActive() !== theme.id + ' ' + rank.id,
                              }}
                            >
                              <span classList={{ 'line-cross bg-red-600': isActive() === theme.id + ' ' + rank.id }} />
                              {rank.label}
                            </span>
                          )
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
    </>
  )
}

export default GameRound
