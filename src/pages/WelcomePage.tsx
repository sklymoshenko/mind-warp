// src/components/Welcome.tsx
import { useNavigate } from '@solidjs/router'
import { createSignal, onMount, Show } from 'solid-js'
import { Game } from '../types'

type Props = {}

const Welcome = () => {
  const [isLoaded, setIsLoaded] = createSignal(false)
  const navigate = useNavigate()

  const showHistory = () => {
    const history = localStorage.getItem('gamesHistory') || '[]'
    const parsed = JSON.parse(history)
    return parsed.length !== 0
  }

  onMount(() => {
    const gameStr = localStorage.getItem('currentGame')
    const game: Game | null = gameStr ? JSON.parse(gameStr) : null

    if (game) {
      navigate(`/game/${game!.id}`)
    }
  })

  onMount(() => {
    setTimeout(() => setIsLoaded(true), 100)
  })

  return (
    <>
      <Show when={showHistory()}>
        <div class="absolute top-4 left-4 md:top-8 md:left-8 z-20">
          <button
            class="text-primary text-sm md:text-lg font-bold uppercase tracking-wider hover:text-white transition-all duration-300 hover:cursor-pointer"
            onClick={() => navigate('/games-history')}
          >
            Games History
          </button>
        </div>
      </Show>
      <div class="relative z-10 text-center">
        <h1
          class="text-5xl md:text-7xl font-extrabold text-primary uppercase tracking-tight transition-all duration-1000"
          classList={{
            'opacity-100 translate-y-0': isLoaded(),
            'opacity-0 translate-y-4': !isLoaded(),
          }}
        >
          Mind Warp
        </h1>

        <button
          class="mt-8 bg-primary text-void text-xl md:text-2xl font-bold uppercase py-3 px-6 rounded-lg hover:bg-white hover:text-void transition-all duration-300 animate-[pulse_2s_infinite] hover:cursor-pointer"
          onClick={() => navigate('/create-game')}
        >
          Create New Game
        </button>
      </div>
    </>
  )
}

export default Welcome
