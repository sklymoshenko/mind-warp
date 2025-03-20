// src/components/CreateGame.tsx
import { createSignal, For, Show } from 'solid-js'
import { A } from '@solidjs/router'

interface Round {
  name: string
  users: string[]
}

const CreateGame = () => {
  const [step, setStep] = createSignal(1)
  const [creatorName, setCreatorName] = createSignal('')
  const [rounds, setRounds] = createSignal<Round[]>([])
  const [currentRoundName, setCurrentRoundName] = createSignal('')
  const [currentUserName, setCurrentUserName] = createSignal('')
  const [currentRoundUsers, setCurrentRoundUsers] = createSignal<string[]>([])
  const [isFlipping, setIsFlipping] = createSignal(false)
  const [isTransitioning, setIsTransitioning] = createSignal(false)

  // Utility function to create a delay with a Promise
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const nextStep = async () => {
    if (isTransitioning()) return // Prevent new transition if one is in progress
    if (step() === 1 && creatorName().trim() === '') return

    setIsTransitioning(true)
    setIsFlipping(true)

    // Wait for the flip-out animation to complete (600ms)
    await delay(600)

    // Change the step after the animation
    setStep(step() + 1)
    setIsFlipping(false)

    // Wait for the flip-in animation to complete (600ms) plus a small buffer (100ms)
    await delay(700)

    setIsTransitioning(false)
  }

  const prevStep = async () => {
    if (isTransitioning()) return // Prevent new transition if one is in progress

    setIsTransitioning(true)
    setIsFlipping(true)

    // Wait for the flip-out animation to complete (600ms)
    await delay(600)

    // Change the step after the animation
    setStep(step() - 1)
    setIsFlipping(false)

    // Wait for the flip-in animation to complete (600ms) plus a small buffer (100ms)
    await delay(700)

    setIsTransitioning(false)
  }

  const addUserToRound = () => {
    if (currentUserName().trim() === '') return
    setCurrentRoundUsers([...currentRoundUsers(), currentUserName()])
    setCurrentUserName('')
  }

  const addRound = () => {
    if (currentRoundName().trim() === '' || currentRoundUsers().length === 0) return
    setRounds([...rounds(), { name: currentRoundName(), users: currentRoundUsers() }])
    setCurrentRoundName('')
    setCurrentRoundUsers([])
  }

  const createGame = () => {
    console.log('Game Created:', { creator: creatorName(), rounds: rounds() })
    alert('Game created successfully!')
    window.location.href = '/'
  }

  return (
    <>
      {/* Back to Home Link */}
      <div class="absolute top-4 left-4 md:top-8 md:left-8 z-20">
        <A
          href="/"
          class="text-[hsl(var(--trivia-lime))] text-sm md:text-lg font-bold uppercase tracking-wider hover:text-[hsl(var(--trivia-void))] transition-all duration-300"
        >
          Back to Home
        </A>
      </div>

      {/* Flipping Card for Form Steps */}
      <div class="relative w-full max-w-md perspective-1000">
        <div
          class="relative w-full transition-all duration-600 transform-style-3d"
          classList={{
            'opacity-0 rotate-y-90': isFlipping(),
            'opacity-100 rotate-y-0': !isFlipping(),
          }}
        >
          {/* Step 1: Enter Your Name */}
          <Show when={step() === 1}>
            <div class="w-full bg-[hsl(var(--trivia-lime))] rounded-lg p-6">
              <div class="flex justify-between mb-4">
                <p class="text-[hsl(var(--trivia-void))] text-sm uppercase font-bold">Step 1</p>
                <p class="text-[hsl(var(--trivia-void))] text-sm uppercase font-bold">Your Name</p>
              </div>
              <h2 class="text-2xl md:text-3xl font-bold text-[hsl(var(--trivia-void))] uppercase tracking-tight text-center mb-6">
                Enter Your Name
              </h2>
              <input
                type="text"
                value={creatorName()}
                onInput={(e) => setCreatorName(e.currentTarget.value)}
                placeholder="Your Name"
                class="w-full bg-[hsl(var(--trivia-white))] text-[hsl(var(--trivia-void))] placeholder-[hsl(var(--trivia-void)/0.5)] border-2 border-[hsl(var(--trivia-void))] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--trivia-accent))]"
              />
              <button
                onClick={nextStep}
                class="mt-6 w-full bg-[hsl(var(--trivia-void))] text-[hsl(var(--trivia-lime))] font-bold uppercase py-2 px-4 rounded-lg hover:bg-[hsl(var(--trivia-accent))] hover:text-[hsl(var(--trivia-white))] transition-all duration-300"
                disabled={isTransitioning()}
              >
                Next
              </button>
              <p class="text-[hsl(var(--trivia-void))] text-xs uppercase text-center mt-4">Let’s get started!</p>
            </div>
          </Show>

          {/* Step 2: Add Rounds */}
          <Show when={step() === 2}>
            <div class="w-full bg-[hsl(var(--trivia-lime))] rounded-lg p-6">
              <div class="flex justify-between mb-4">
                <p class="text-[hsl(var(--trivia-void))] text-sm uppercase font-bold">Step 2</p>
                <p class="text-[hsl(var(--trivia-void))] text-sm uppercase font-bold">Add Rounds</p>
              </div>
              <h2 class="text-2xl md:text-3xl font-bold text-[hsl(var(--trivia-void))] uppercase tracking-tight text-center mb-6">
                Add Rounds
              </h2>
              <div class="mb-4">
                <input
                  type="text"
                  value={currentRoundName()}
                  onInput={(e) => setCurrentRoundName(e.currentTarget.value)}
                  placeholder="Round Name (e.g., Pop Culture)"
                  class="w-full bg-[hsl(var(--trivia-white))] text-[hsl(var(--trivia-void))] placeholder-[hsl(var(--trivia-void)/0.5)] border-2 border-[hsl(var(--trivia-void))] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--trivia-accent))]"
                />
                <div class="mt-4">
                  <input
                    type="text"
                    value={currentUserName()}
                    onInput={(e) => setCurrentUserName(e.currentTarget.value)}
                    placeholder="Add Player"
                    class="w-full bg-[hsl(var(--trivia-white))] text-[hsl(var(--trivia-void))] placeholder-[hsl(var(--trivia-void)/0.5)] border-2 border-[hsl(var(--trivia-void))] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--trivia-accent))]"
                  />
                  <button
                    onClick={addUserToRound}
                    class="mt-2 w-full bg-[hsl(var(--trivia-void))] text-[hsl(var(--trivia-lime))] font-bold uppercase py-1 px-3 rounded-lg hover:bg-[hsl(var(--trivia-accent))] hover:text-[hsl(var(--trivia-white))] transition-all duration-300"
                  >
                    Add Player
                  </button>
                </div>
                <div class="mt-4 max-h-32 overflow-y-auto">
                  <For each={currentRoundUsers()}>
                    {(user) => <p class="text-[hsl(var(--trivia-void))] text-sm uppercase">{user}</p>}
                  </For>
                </div>
                <button
                  onClick={addRound}
                  class="mt-4 w-full bg-[hsl(var(--trivia-accent))] text-[hsl(var(--trivia-white))] font-bold uppercase py-1 px-3 rounded-lg hover:bg-[hsl(var(--trivia-void))] hover:text-[hsl(var(--trivia-lime))] transition-all duration-300"
                >
                  Add Round
                </button>
              </div>
              <div class="max-h-40 overflow-y-auto">
                <For each={rounds()}>
                  {(round) => (
                    <div class="mb-2">
                      <p class="text-[hsl(var(--trivia-void))] font-semibold uppercase">{round.name}</p>
                      <For each={round.users}>
                        {(user) => <p class="text-[hsl(var(--trivia-void))] text-sm uppercase pl-4">{user}</p>}
                      </For>
                    </div>
                  )}
                </For>
              </div>
              <div class="flex justify-between mt-6">
                <button
                  onClick={prevStep}
                  class="bg-[hsl(var(--trivia-void))] text-[hsl(var(--trivia-lime))] font-bold uppercase py-2 px-4 rounded-lg hover:bg-[hsl(var(--trivia-accent))] hover:text-[hsl(var(--trivia-white))] transition-all duration-300"
                  disabled={isTransitioning()}
                >
                  Back
                </button>
                <button
                  onClick={nextStep}
                  class="bg-[hsl(var(--trivia-void))] text-[hsl(var(--trivia-lime))] font-bold uppercase py-2 px-4 rounded-lg hover:bg-[hsl(var(--trivia-accent))] hover:text-[hsl(var(--trivia-white))] transition-all duration-300"
                  classList={{ 'opacity-50 cursor-not-allowed': rounds().length === 0 || isTransitioning() }}
                  disabled={rounds().length === 0 || isTransitioning()}
                >
                  Next
                </button>
              </div>
              <p class="text-[hsl(var(--trivia-void))] text-xs uppercase text-center mt-4">
                Teams should have at least 4 players.
              </p>
            </div>
          </Show>

          {/* Step 3: Review and Create */}
          <Show when={step() === 3}>
            <div class="w-full bg-[hsl(var(--trivia-lime))] rounded-lg p-6">
              <div class="flex justify-between mb-4">
                <p class="text-[hsl(var(--trivia-void))] text-sm uppercase font-bold">Step 3</p>
                <p class="text-[hsl(var(--trivia-void))] text-sm uppercase font-bold">Review</p>
              </div>
              <h2 class="text-2xl md:text-3xl font-bold text-[hsl(var(--trivia-void))] uppercase tracking-tight text-center mb-6">
                Review Your Game
              </h2>
              <p class="text-[hsl(var(--trivia-void))] uppercase mb-2">Creator: {creatorName()}</p>
              <div class="max-h-60 overflow-y-auto">
                <For each={rounds()}>
                  {(round) => (
                    <div class="mb-2">
                      <p class="text-[hsl(var(--trivia-void))] font-semibold uppercase">{round.name}</p>
                      <For each={round.users}>
                        {(user) => <p class="text-[hsl(var(--trivia-void))] text-sm uppercase pl-4">{user}</p>}
                      </For>
                    </div>
                  )}
                </For>
              </div>
              <div class="flex justify-between mt-6">
                <button
                  onClick={prevStep}
                  class="bg-[hsl(var(--trivia-void))] text-[hsl(var(--trivia-lime))] font-bold uppercase py-2 px-4 rounded-lg hover:bg-[hsl(var(--trivia-accent))] hover:text-[hsl(var(--trivia-white))] transition-all duration-300"
                  disabled={isTransitioning()}
                >
                  Back
                </button>
                <button
                  onClick={createGame}
                  class="bg-[hsl(var(--trivia-void))] text-[hsl(var(--trivia-lime))] font-bold uppercase py-2 px-4 rounded-lg hover:bg-[hsl(var(--trivia-accent))] hover:text-[hsl(var(--trivia-white))] transition-all duration-300"
                  disabled={isTransitioning()}
                >
                  Create Game
                </button>
              </div>
              <p class="text-[hsl(var(--trivia-void))] text-xs uppercase text-center mt-4">Ready to play!</p>
            </div>
          </Show>
        </div>
      </div>

      {/* Custom Animations */}
      <style>
        {`
          .perspective-1000 { perspective: 1000px; }
          .transform-style-3d { transform-style: preserve-3d; }
          .rotate-y-0 { transform: rotateY(0deg); }
          .rotate-y-90 { transform: rotateY(90deg); }
        `}
      </style>
    </>
  )
}

export default CreateGame
