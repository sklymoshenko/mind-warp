// src/components/Welcome.tsx
import { useNavigate } from '@solidjs/router'
import { createSignal, onMount, Show } from 'solid-js'
import { Game } from '../types'

const Welcome = () => {
  const [isLoaded, setIsLoaded] = createSignal(false)
  const [gameInProgress, setGameInProgress] = createSignal<Game | null>(null)
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
      setGameInProgress(game)
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
            onClick={() => navigate('/local/games-history')}
          >
            Games History
          </button>
        </div>
      </Show>
      <div class="relative z-10 text-center ">
        <h1
          class="text-5xl md:text-7xl font-extrabold text-primary uppercase tracking-tight transition-all duration-1000"
          classList={{
            'opacity-100 translate-y-0': isLoaded(),
            'opacity-0 translate-y-4': !isLoaded(),
          }}
        >
          Mind Warp
        </h1>
        <div class="flex gap-4" classList={{ 'flex-col': gameInProgress() === null }}>
          <button
            class="mt-8 bg-primary text-void text-xl md:text-2xl font-bold uppercase py-3 px-6 rounded-lg hover:bg-primary/80 hover:text-void transition-all duration-300 hover:cursor-pointer"
            classList={{
              'animate-[pulse_2s_infinite]': gameInProgress() === null,
            }}
            onClick={() => navigate('/local/create-game')}
          >
            Create New Game
          </button>
          <Show when={gameInProgress() !== null}>
            <button
              class="mt-8 bg-accent text-white text-xl md:text-2xl font-bold uppercase py-3 px-6 rounded-lg hover:bg-accent/80 transition-all duration-300 animate-[pulse_2s_infinite] hover:cursor-pointer"
              onClick={() => navigate(`/local/game/${gameInProgress()!.id}`)}
            >
              Continue Game
            </button>
          </Show>
        </div>
        <div class="flex flex-col gap-4 sm:mt-32">
          <button
            class="text-primary text-lg sm:text-xl font-bold uppercase hover:text-primary/50 transition-all duration-300 hover:cursor-pointer"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button
            class="text-accent text-lg sm:text-xl font-bold uppercase hover:text-accent/50 transition-all duration-300 hover:cursor-pointer"
            onClick={() => navigate('/register')}
          >
            Register
          </button>
        </div>
      </div>
    </>
  )
}

export default Welcome
