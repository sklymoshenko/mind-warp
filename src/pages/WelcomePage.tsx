// src/components/Welcome.tsx
import { useNavigate } from '@solidjs/router'
import { createSignal, onMount } from 'solid-js'

const Welcome = () => {
  const [isLoaded, setIsLoaded] = createSignal(false)
  const navigate = useNavigate()

  onMount(() => {
    setTimeout(() => setIsLoaded(true), 100)
  })

  return (
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
        class="mt-8 bg-primary text-viod text-xl md:text-2xl font-bold uppercase py-3 px-6 rounded-lg hover:bg-white hover:text-void transition-all duration-300 animate-[pulse_2s_infinite] hover:cursor-pointer"
        onClick={() => navigate('/create-game')}
      >
        Create New Game
      </button>
    </div>
  )
}

export default Welcome
