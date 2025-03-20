// src/components/Welcome.tsx
import { createSignal, onMount } from 'solid-js'

const Welcome = () => {
  const [isLoaded, setIsLoaded] = createSignal(false)

  onMount(() => {
    setTimeout(() => setIsLoaded(true), 100)
  })

  return (
    <div class="relative w-screen h-screen bg-[hsl(var(--trivia-void))] flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Creative Background with SVG Elements */}
      <div class="absolute inset-0 opacity-30">
        {/* Subtle Pattern Background */}
        <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="hsl(var(--trivia-white)/0.1)" stroke-width="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Scattered Game Items */}
        {/* Dice */}
        <svg
          class="absolute top-5 left-5 w-16 h-16 md:w-24 md:h-24 animate-[float_4s_ease-in-out_infinite]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="10"
            y="10"
            width="40"
            height="40"
            fill="none"
            stroke="hsl(var(--trivia-white))"
            stroke-width="2"
            rx="5"
          />
          <circle cx="25" cy="25" r="3" fill="hsl(var(--trivia-white))" />
          <circle cx="35" cy="35" r="3" fill="hsl(var(--trivia-white))" />
        </svg>
        <svg
          class="absolute bottom-5 right-5 w-16 h-16 md:w-24 md:h-24 animate-[float_4s_ease-in-out_infinite]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="10"
            y="10"
            width="40"
            height="40"
            fill="none"
            stroke="hsl(var(--trivia-white))"
            stroke-width="2"
            rx="5"
          />
          <circle cx="25" cy="25" r="3" fill="hsl(var(--trivia-white))" />
          <circle cx="35" cy="35" r="3" fill="hsl(var(--trivia-white))" />
        </svg>

        {/* Playing Cards */}
        <svg
          class="absolute bottom-10 right-10 w-20 h-28 md:w-28 md:h-36 animate-[float_3s_ease-in-out_infinite] animation-delay-200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="10"
            y="10"
            width="50"
            height="70"
            fill="hsl(var(--trivia-white)/0.8)"
            stroke="hsl(var(--trivia-white))"
            stroke-width="2"
            rx="5"
          />
          <rect
            x="20"
            y="20"
            width="50"
            height="70"
            fill="none"
            stroke="hsl(var(--trivia-white))"
            stroke-width="2"
            rx="5"
            transform="rotate(10 45 55)"
          />
        </svg>
        <svg
          class="absolute top-10 left-10 w-20 h-28 md:w-28 md:h-36 animate-[float_3s_ease-in-out_infinite] animation-delay-200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="10"
            y="10"
            width="50"
            height="70"
            fill="hsl(var(--trivia-white)/0.8)"
            stroke="hsl(var(--trivia-white))"
            stroke-width="2"
            rx="5"
          />
          <rect
            x="20"
            y="20"
            width="50"
            height="70"
            fill="none"
            stroke="hsl(var(--trivia-white))"
            stroke-width="2"
            rx="5"
            transform="rotate(10 45 55)"
          />
        </svg>

        {/* Trivia Board Piece */}
        <svg
          class="absolute top-1/4 right-1/4 w-12 h-12 md:w-16 md:h-16 animate-[spin_8s_linear_infinite]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50%" cy="50%" r="20" fill="none" stroke="hsl(var(--trivia-white))" stroke-width="3" />
          <path d="M 30 10 L 30 50" stroke="hsl(var(--trivia-white))" stroke-width="2" />
        </svg>
        <svg
          class="absolute bottom-1/4 left-1/4 w-12 h-12 md:w-16 md:h-16 animate-[spin_8s_linear_infinite]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50%" cy="50%" r="20" fill="none" stroke="hsl(var(--trivia-white))" stroke-width="3" />
          <path d="M 30 10 L 30 50" stroke="hsl(var(--trivia-white))" stroke-width="2" />
        </svg>

        {/* Timer */}
        <svg
          class="absolute top-1/3 left-3/4 w-14 h-14 md:w-20 md:h-20 animate-[float_5s_ease-in-out_infinite] animation-delay-300"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50%" cy="50%" r="30" fill="none" stroke="hsl(var(--trivia-white))" stroke-width="3" />
          <path d="M 35 20 L 35 35 L 50 35" stroke="hsl(var(--trivia-white))" stroke-width="2" />
        </svg>
        <svg
          class="absolute bottom-1/3 right-3/4 w-14 h-14 md:w-20 md:h-20 animate-[float_5s_ease-in-out_infinite] animation-delay-300"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50%" cy="50%" r="30" fill="none" stroke="hsl(var(--trivia-white))" stroke-width="3" />
          <path d="M 35 20 L 35 35 L 50 35" stroke="hsl(var(--trivia-white))" stroke-width="2" />
        </svg>

        {/* Drink Glass */}
        <svg
          class="absolute bottom-1/4 left-1/3 w-12 h-16 md:w-16 md:h-20 animate-[float_4s_ease-in-out_infinite] animation-delay-400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M 20 10 H 40 L 35 60 H 25 Z" fill="none" stroke="hsl(var(--trivia-white))" stroke-width="2" />
          <path d="M 25 40 H 35" stroke="hsl(var(--trivia-white))" stroke-width="2" />
        </svg>
        <svg
          class="absolute top-1/4 right-1/3 w-12 h-16 md:w-16 md:h-20 animate-[float_4s_ease-in-out_infinite] animation-delay-400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M 20 10 H 40 L 35 60 H 25 Z" fill="none" stroke="hsl(var(--trivia-white))" stroke-width="2" />
          <path d="M 25 40 H 35" stroke="hsl(var(--trivia-white))" stroke-width="2" />
        </svg>

        {/* Pencil */}
        <svg
          class="absolute top-3/4 right-1/4 w-20 h-10 md:w-28 md:h-14 animate-[float_3s_ease-in-out_infinite] animation-delay-500"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="10"
            y="20"
            width="60"
            height="10"
            fill="hsl(var(--trivia-white)/0.8)"
            stroke="hsl(var(--trivia-white))"
            stroke-width="2"
            rx="3"
          />
          <polygon points="70,15 80,25 70,35" fill="hsl(var(--trivia-white))" />
        </svg>
        <svg
          class="absolute bottom-3/4 left-1/4 w-20 h-10 md:w-28 md:h-14 animate-[float_3s_ease-in-out_infinite] animation-delay-500"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="10"
            y="20"
            width="60"
            height="10"
            fill="hsl(var(--trivia-white)/0.8)"
            stroke="hsl(var(--trivia-white))"
            stroke-width="2"
            rx="3"
          />
          <polygon points="70,15 80,25 70,35" fill="hsl(var(--trivia-white))" />
        </svg>

        {/* Question Mark */}
        <svg
          class="absolute bottom-1/3 left-1/2 w-10 h-14 md:w-14 md:h-18 animate-[float_6s_ease-in-out_infinite] animation-delay-600"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 30 20 Q 30 10 40 10 Q 50 10 50 20 Q 50 30 40 30 L 40 40"
            fill="none"
            stroke="hsl(var(--trivia-white))"
            stroke-width="3"
          />
          <circle cx="40" cy="50" r="3" fill="hsl(var(--trivia-white))" />
        </svg>
        <svg
          class="absolute top-1/3 right-1/2 w-10 h-14 md:w-14 md:h-18 animate-[float_6s_ease-in-out_infinite] animation-delay-600"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 30 20 Q 30 10 40 10 Q 50 10 50 20 Q 50 30 40 30 L 40 40"
            fill="none"
            stroke="hsl(var(--trivia-white))"
            stroke-width="3"
          />
          <circle cx="40" cy="50" r="3" fill="hsl(var(--trivia-white))" />
        </svg>
      </div>

      <div class="relative z-10 text-center">
        <h1
          class="text-5xl md:text-7xl font-extrabold text-[hsl(var(--trivia-lime))] uppercase tracking-tight transition-all duration-1000"
          classList={{
            'opacity-100 translate-y-0': isLoaded(),
            'opacity-0 translate-y-4': !isLoaded(),
          }}
        >
          Mind Warp
        </h1>

        <button
          class="mt-8 bg-[hsl(var(--trivia-lime))] text-[hsl(var(--trivia-void))] text-xl md:text-2xl font-bold uppercase py-3 px-6 rounded-lg shadow-[0_0_10px_hsl(var(--trivia-lime)/0.5)] hover:bg-[hsl(var(--trivia-white))] hover:text-[hsl(var(--trivia-void))] hover:shadow-[0_0_15px_hsl(var(--trivia-lime))] transition-all duration-300 animate-[pulse_2s_infinite] hover:cursor-pointer"
          onClick={() => alert('Join the trivia fun!')}
        >
          Join Now
        </button>
      </div>
    </div>
  )
}

export default Welcome
