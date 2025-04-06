import { A, useNavigate } from '@solidjs/router'
import { createSignal, For, onMount } from 'solid-js'
import { DateTime } from 'luxon'
import { Game } from '../types'
import { OcDiffremoved2 } from 'solid-icons/oc'
const GameHistory = () => {
  const navigate = useNavigate()
  const [gamesHistory, setGameHistory] = createSignal<Game[]>(JSON.parse(localStorage.getItem('gamesHistory') || '[]'))

  onMount(() => {
    if (gamesHistory().length === 0) {
      navigate('/')
    }
  })

  const handleHistoryRemove = () => {
    localStorage.removeItem('gamesHistory')
    navigate('/')
  }

  const handleGameHistoryRemove = (game: Game) => {
    const updatedHistory = gamesHistory().filter((g) => g.id !== game.id)
    localStorage.setItem('gamesHistory', JSON.stringify(updatedHistory))
    setGameHistory(updatedHistory)

    if (updatedHistory.length === 0) {
      navigate('/')
    }
  }

  return (
    <>
      <div class="absolute top-4 left-4 md:top-8 md:left-8 z-20">
        <A
          href="/"
          class="text-primary text-sm md:text-lg font-bold uppercase tracking-wider hover:text-white transition-all duration-300 hover:cursor-pointer"
        >
          Back
        </A>
      </div>
      <div class="absolute top-4 right-4 md:top-8 md:right-8 z-20">
        <button
          class="bg-clip-text text-transparent bg-gradient-to-br from-red-800 to-red-200 text-sm md:text-lg font-bold uppercase tracking-wider hover:text-white transition-all duration-300 hover:cursor-pointer"
          onclick={handleHistoryRemove}
        >
          Remove history
        </button>
      </div>
      <h1 class="text-5xl md:text-7xl font-extrabold text-primary uppercase tracking-tight text-center mb-8">
        Games History
      </h1>
      <div class="flex flex-col justify-between lg:h-[60%] xl:h-[70%] lg:w-[60%]">
        <div class="flex flex-col gap-12">
          <For each={gamesHistory()}>
            {(game) => {
              const gameWinner = game.users.find((u) => u.id === game.winner!)
              const winnerScore = Object.values(gameWinner!.roundScore).reduce((a, b) => a + b, 0)
              return (
                <div class="flex justify-between items-center bg-void text-primary">
                  <div class="p-4 bg-void text-primary  flex gap-4 items-end">
                    <span class="text-4xl">{DateTime.fromMillis(game.finishDate!).toLocaleString()}</span>
                    <div class="flex gap-4">
                      <span class="text-3xl ">
                        Winner:{' '}
                        <span class="bg-gradient-to-tr from-cyan-600 to-orange bg-clip-text text-transparent">
                          {gameWinner?.name}
                        </span>
                      </span>
                      <span class="text-3xl">
                        Score:{' '}
                        <span class="bg-gradient-to-br from-blue-600 to-cyan-400 bg-clip-text text-transparent">
                          {winnerScore}
                        </span>
                      </span>
                    </div>
                  </div>
                  <button
                    class="hover:cursor-pointer"
                    title="Remove game history"
                    onclick={() => handleGameHistoryRemove(game)}
                  >
                    <OcDiffremoved2 class=" text-3xl text-red-500  hover:text-red-700 transition-all duration-300 hover:-translate-y-1.5" />
                  </button>
                </div>
              )
            }}
          </For>
        </div>
      </div>
    </>
  )
}

export default GameHistory
