// src/components/CreateGame.tsx
import { createMemo, createSignal, For, Show } from 'solid-js'
import { A } from '@solidjs/router'
import { IoCloseSharp } from 'solid-icons/io'

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

  const emptyCreatorName = createMemo(() => creatorName().trim() === '')

  const emptyRoundName = createMemo(() => currentRoundName().trim() === '')
  const emptyCurrentUserName = createMemo(() => currentUserName().trim() === '')
  const notEnoughUsers = createMemo(() => currentRoundUsers().length < 4)
  const sameUser = createMemo(() =>
    currentRoundUsers().some((user) => user.toLowerCase() === currentUserName().toLowerCase())
  )
  const userAsCreator = createMemo(() => creatorName().toLowerCase() === currentUserName().toLowerCase())

  const nextStep = () => {
    if (step() === 1 && emptyCreatorName()) return
    if (step() === 2 && rounds().length === 0) return
    setStep(step() + 1)
  }

  const prevStep = () => {
    setStep(step() - 1)
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
          class="text-primary text-sm md:text-lg font-bold uppercase tracking-wider hover:text-white transition-all duration-300"
        >
          Back to Home
        </A>
      </div>

      {/* Flipping Card for Form Steps */}
      <div class="relative w-full max-w-md perspective-1000">
        <div class="relative w-full">
          {/* Step 1: Enter Your Name */}
          <Show when={step() === 1}>
            <div class="w-full bg-primary rounded-lg p-6">
              <div class="flex justify-between mb-4">
                <p class="text-void text-sm uppercase font-bold">Step 1</p>
                <p class="text-void text-sm uppercase font-bold">Admin Name</p>
              </div>
              <h2 class="text-2xl md:text-3xl font-bold text-void uppercase tracking-tight text-center mb-6">
                Enter Game Admin Name
              </h2>
              <input
                type="text"
                value={creatorName()}
                onInput={(e) => setCreatorName(e.currentTarget.value)}
                placeholder="The Trivia Master"
                class="w-full bg-white text-void placeholder-void/50 border-2 border-void rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                disabled={emptyCreatorName()}
                onClick={nextStep}
                class="mt-6 w-full bg-void text-primary font-bold uppercase py-2 px-4 rounded-lg hover:bg-accent hover:text-white hover:cursor-pointer transition-all duration-300"
                classList={{ 'opacity-50 hover:cursor-not-allowed!': emptyCreatorName() }}
              >
                {emptyCreatorName() ? 'We need to know name of Creator' : 'Next'}
              </button>
              <p class="text-void text-xs uppercase text-center mt-4">Let’s get started!</p>
            </div>
          </Show>

          {/* Step 2: Add Rounds */}
          <Show when={step() === 2}>
            <div class="w-full bg-primary rounded-lg p-6">
              <div class="flex justify-between mb-4">
                <p class="text-void text-sm uppercase font-bold">Step 2</p>
                <p class="text-void text-sm uppercase font-bold">Add Players</p>
              </div>
              <h2 class="text-2xl md:text-3xl font-bold text-void uppercase tracking-tight text-center mb-6">
                Game Members
              </h2>
              <div class="mb-4">
                {/* <input
                  type="text"
                  value={currentRoundName()}
                  onInput={(e) => setCurrentRoundName(e.currentTarget.value)}
                  placeholder="Round Name (e.g., Pop Culture)"
                  class="w-full bg-white text-void placeholder-void/50 border-2 border-void rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
                /> */}
                <div class="mt-4 flex flex-col justify-between">
                  <input
                    type="text"
                    value={currentUserName()}
                    onInput={(e) => setCurrentUserName(e.currentTarget.value)} // Fixed typo
                    placeholder="Add Player"
                    class="w-full bg-white text-void placeholder-void/50 border-2 border-void rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button
                    onClick={addUserToRound}
                    class="mt-2 w-full bg-void text-primary font-bold uppercase py-1 px-3 rounded-lg hover:bg-accent hover:text-white hover:cursor-pointer transition-all duration-300"
                    classList={{
                      ' opacity-50 hover:cursor-not-allowed!': emptyCurrentUserName() || sameUser() || userAsCreator(),
                    }}
                    disabled={emptyCurrentUserName() || sameUser() || userAsCreator()}
                  >
                    {sameUser() && 'Funny but we cant use same names'}
                    {userAsCreator() && 'Creator is already a user you dummy'}
                    {!sameUser() && !userAsCreator() && 'Add Player'}
                  </button>
                </div>
                <div class="mt-4 max-h-32 overflow-y-auto flex flex-wrap gap-2">
                  <canvas id="confetti-canvas" class="absolute inset-0 pointer-events-none" />
                  <For each={currentRoundUsers()}>
                    {(user) => (
                      <div class="relative bg-orange-light rounded-md px-2 py-1 mb-1 flex items-center gap-2 shadow-xs hover:shadow-sm transition-all duration-300 animate-slide-in w-fit">
                        <p class="text-void text-sm font-medium uppercase tracking-wide flex-1">{user}</p>
                        <button
                          onClick={() => setCurrentRoundUsers(currentRoundUsers().filter((u) => u !== user))}
                          class="w-5 h-5 flex items-center justify-center text-void/60 hover:bg-accent hover:text-white transition-all duration-200 hover:cursor-pointer"
                          aria-label={`Remove player ${user}`}
                        >
                          <IoCloseSharp class="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </For>
                </div>
                {/* <button
                  onClick={addRound}
                  class="mt-4 w-full bg-accent text-white font-bold uppercase py-1 px-3 rounded-lg hover:bg-void hover:text-primary hover:cursor-pointer transition-all duration-300"
                  classList={{ ' opacity-50 hover:cursor-not-allowed!': emptyRoundName() || notEnoughUsers() }}
                >
                  Add Round
                </button> */}
              </div>
              <div class="max-h-40 overflow-y-auto">
                <For each={rounds()}>
                  {(round) => (
                    <div class="mb-2">
                      <p class="text-void font-semibold uppercase">{round.name}</p>
                      <For each={round.users}>{(user) => <p class="text-void text-sm uppercase pl-4">{user}</p>}</For>
                    </div>
                  )}
                </For>
              </div>
              <div class="flex justify-between mt-6">
                <button
                  onClick={prevStep}
                  class="bg-void text-primary font-bold uppercase py-2 px-4 rounded-lg hover:bg-accent hover:text-white hover:cursor-pointer transition-all duration-300"
                >
                  Back
                </button>
                <button
                  onClick={nextStep}
                  class="bg-void text-primary font-bold uppercase py-2 px-4 rounded-lg hover:bg-accent hover:text-white hover:cursor-pointer transition-all duration-300"
                  classList={{ 'opacity-50 cursor-not-allowed': rounds().length === 0 }}
                  disabled={rounds().length === 0}
                >
                  Next
                </button>
              </div>
              <p class="text-void text-xs uppercase text-center mt-4">Game should have at least 2 players.</p>
            </div>
          </Show>

          {/* Step 3: Review and Create */}
          <Show when={step() === 3}>
            <div class="w-full bg-primary rounded-lg p-6">
              <div class="flex justify-between mb-4">
                <p class="text-void text-sm uppercase font-bold">Step 3</p>
                <p class="text-void text-sm uppercase font-bold">Review</p>
              </div>
              <h2 class="text-2xl md:text-3xl font-bold text-void uppercase tracking-tight text-center mb-6">
                Review Your Game
              </h2>
              <p class="text-void uppercase mb-2">Creator: {creatorName()}</p>
              <div class="max-h-60 overflow-y-auto">
                <For each={rounds()}>
                  {(round) => (
                    <div class="mb-2">
                      <p class="text-void font-semibold uppercase">{round.name}</p>
                      <For each={round.users}>{(user) => <p class="text-void text-sm uppercase pl-4">{user}</p>}</For>
                    </div>
                  )}
                </For>
              </div>
              <div class="flex justify-between mt-6">
                <button
                  onClick={prevStep}
                  class="bg-void text-primary font-bold uppercase py-2 px-4 rounded-lg hover:bg-accent hover:text-white hover:cursor-pointer transition-all duration-300"
                >
                  Back
                </button>
                <button
                  onClick={createGame}
                  class="bg-void text-primary font-bold uppercase py-2 px-4 rounded-lg hover:bg-accent hover:text-white hover:cursor-pointer transition-all duration-300"
                >
                  Create Game
                </button>
              </div>
              <p class="text-void text-xs uppercase text-center mt-4">Ready to play!</p>
            </div>
          </Show>
        </div>
      </div>
    </>
  )
}

export default CreateGame
