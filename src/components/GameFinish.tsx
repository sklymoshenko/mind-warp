// GameFinish.tsx
import { onMount, onCleanup, For } from 'solid-js'
import confetti from 'canvas-confetti'
import { User } from '../types'
import { sarcasticCongrats } from '../data/utils'

type Props = {
  isOpen: boolean
  onClose: () => void
  winner: User['id']
  users: User[]
  scores: Record<User['id'], number>
}

const GameFinish = (props: Props) => {
  const winningUser = (): User => props.users.find((user) => user.id === props.winner) || ({ name: 'Player' } as User)
  const sortedUsers = () => {
    return props.users.sort((a, b) => props.scores[b.id] - props.scores[a.id])
  }

  let canvasRef: HTMLCanvasElement | undefined

  const getRandomCongrats = (name: string) => {
    const randomIndex: number = Math.floor(Math.random() * sarcasticCongrats.length)
    const message: string = sarcasticCongrats[randomIndex]
    const parts: string[] = message.split('{name}')
    return (
      <>
        {parts[0]}
        <span class="bg-gradient-to-r from-accent to-pink-500 bg-clip-text text-transparent">{name}</span>
        {parts[1]}
      </>
    )
  }

  // Confetti animation configuration
  const launchConfetti = (): void => {
    console.log('launching fireworks')
    const duration: number = 5 * 1000
    const animationEnd: number = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 }

    const randomInRange = (min: number, max: number): number => Math.random() * (max - min) + min

    const interval: number = setInterval(() => {
      const timeLeft: number = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount: number = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)
  }

  // Fireworks effect
  const launchFireworks = (): void => {
    console.log('launching fireworks')
    confetti({
      particleCount: 100,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#bb0000', '#ffffff'],
      zIndex: 1000,
    })
    confetti({
      particleCount: 100,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#00bb00', '#ffff00'],
      zIndex: 1000,
    })
  }

  onMount(() => {
    if (canvasRef) {
      canvasRef.width = window.innerWidth
      canvasRef.height = window.innerHeight
    }
  })

  onCleanup(() => {
    confetti.reset()
  })

  launchConfetti()
  launchFireworks()

  return (
    <div
      class={`fixed inset-0 z-50 transition-all duration-500 ease-in-out `}
      classList={{ 'opacity-100 pointer-events-auto': props.isOpen, 'opacity-0 pointer-events-none': !props.isOpen }}
    >
      {/* Background overlay */}
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={props.onClose}></div>

      {/* Content container */}
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/3 min-w-[400px] transform transition-all duration-300 h-fit">
        <h1 class="bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary/50 text-5xl min-h-[300px] text-center">
          {getRandomCongrats(winningUser().name)}
        </h1>

        <div class="flex flex-col justify-between p-2 gap-12">
          <For each={sortedUsers()}>
            {(user, i) => {
              return (
                <div
                  class="flex flex-col items-start justify-between gap-4 transition-all duration-200 animate-slide-in"
                  style={{ 'transition-delay': `${i() * 1}s` }}
                >
                  <div
                    class="text-2xl font-bold text-primary flex items-center gap-2"
                    classList={{ 'text-5xl': props.winner === user.id }}
                  >
                    <span>{user.name}</span>
                  </div>
                  <span
                    class="text-2xl text-gray-500 ml-2 mb-0.5"
                    classList={{ 'text-green-600': props.winner === user.id }}
                  >
                    {props.scores[user.id]}
                  </span>
                </div>
              )
            }}
          </For>
        </div>
      </div>

      {/* Canvas for confetti */}
      <canvas ref={canvasRef} class="absolute inset-0 pointer-events-none" />
    </div>
  )
}

export default GameFinish
