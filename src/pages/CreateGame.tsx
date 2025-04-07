import { createMemo, createSignal, For, Show } from 'solid-js'
import { A, useNavigate } from '@solidjs/router'
import { IoCloseSharp } from 'solid-icons/io'
import { BsController, BsStars } from 'solid-icons/bs'
import { FaSolidUserAstronaut } from 'solid-icons/fa'
import { RoundRank, Round, User, Game, RoundTime } from '../types'

const defaultRanks: RoundRank[] = [
  { id: 100, label: '100', isSelected: true },
  { id: 200, label: '200', isSelected: true },
  { id: 300, label: '300', isSelected: true },
  { id: 400, label: '400', isSelected: true },
  { id: 500, label: '500', isSelected: true },
  { id: 700, label: '700', isSelected: false },
  { id: 900, label: '900', isSelected: false },
  { id: 1000, label: '1000', isSelected: false },
]

const defaultTimes: RoundTime[] = [
  { id: 30, label: '30s', isSelected: false },
  { id: 60, label: '60s', isSelected: false },
  { id: 90, label: '1m 30s', isSelected: false },
  { id: 120, label: '2m', isSelected: false },
  { id: 150, label: '2m 30s', isSelected: false },
  { id: 180, label: '3m', isSelected: true },
  { id: 210, label: '3m 30s', isSelected: false },
  { id: 240, label: '4m', isSelected: false },
]

type Props = {
  onGameUpdate: (game: Game) => void
}

const CreateGame = (props: Props) => {
  const navigate = useNavigate()
  const [gameId, setGameId] = createSignal<Game['id']>('')
  const [step, setStep] = createSignal(1)
  const [creatorName, setCreatorName] = createSignal('')
  const [rounds, setRounds] = createSignal<Round[]>([])
  const [currentRoundName, setCurrentRoundName] = createSignal('')
  const [currentUserName, setCurrentUserName] = createSignal('')
  const [gameUsers, setGameUsers] = createSignal<User[]>([])
  const [roundRanks, setRoundRanks] = createSignal<RoundRank[]>(defaultRanks)
  const [roundTimes, setRoundTimes] = createSignal<RoundTime[]>(defaultTimes)
  const [themes, setThemes] = createSignal<string[]>([])

  const emptyCreatorName = createMemo(() => creatorName().trim() === '')

  const emptyRoundName = createMemo(() => currentRoundName().trim() === '')
  const emptyCurrentUserName = createMemo(() => currentUserName().trim() === '')
  const emptyThemes = createMemo(() => themes().filter(Boolean).length != themes().length)
  const emptyRanks = createMemo(() => roundRanks().filter((r) => r.isSelected).length === 0)
  const emptyTime = createMemo(() => roundTimes().filter((t) => t.isSelected).length === 0)
  const notEnoughUsers = createMemo(() => gameUsers().length < 2)
  const sameUser = createMemo(() =>
    gameUsers().some((user) => user.name.toLowerCase() === currentUserName().toLowerCase())
  )
  const userAsCreator = createMemo(() => creatorName().toLowerCase() === currentUserName().toLowerCase())

  const nextStep = () => {
    if (step() === 1 && emptyCreatorName()) return
    if (step() === 2 && gameUsers().length < 2) return
    if (step() === 3 && rounds().length === 0) return
    setStep(step() + 1)
  }

  const onFirstStepFinish = () => {
    nextStep()
    setGameUsers([{ name: creatorName(), id: crypto.randomUUID(), isAdmin: true, roundScore: {} }])
  }

  const onSecondStepFinish = () => {
    nextStep()
  }

  const prevStep = () => {
    setStep(step() - 1)
  }

  const addUser = () => {
    if (currentUserName().trim() === '') return
    setGameUsers([...gameUsers(), { id: crypto.randomUUID(), name: currentUserName(), isAdmin: false, roundScore: {} }])
    setCurrentUserName('')
  }

  const onRankToggle = (rank: RoundRank) => {
    const updatedRanks = roundRanks().map((r) => {
      if (r.id === rank.id) {
        return { ...r, isSelected: !r.isSelected }
      }

      return r
    })

    setRoundRanks(updatedRanks)
  }

  const addRound = () => {
    if (emptyRoundName() || emptyThemes() || emptyRanks() || emptyTime()) return

    const roundThemes = themes().map((theme) => ({
      id: crypto.randomUUID(),
      name: theme,
      questions: [],
    }))

    setRounds([
      ...rounds(),
      {
        name: currentRoundName(),
        id: crypto.randomUUID(),
        ranks: roundRanks().filter((r) => r.isSelected),
        themes: roundThemes,
        time: roundTimes().find((t) => t.isSelected)!,
      },
    ])
    setCurrentRoundName('')
    setThemes([])
  }

  const onFinish = () => {
    if (rounds().length === 0) return
    setStep(0)
    const game: Game = {
      id: crypto.randomUUID(),
      users: gameUsers(),
      rounds: rounds(),
      currentRound: '',
      currentQuestion: '',
      currentUser: gameUsers()[0].id,
      isFinished: false,
    }

    setGameId(game.id)
    props.onGameUpdate(game)
  }

  return (
    <>
      <div class="absolute top-4 left-4 md:top-8 md:left-8 z-20">
        <A
          href="/"
          class="text-primary text-sm md:text-lg font-bold uppercase tracking-wider hover:text-white transition-all duration-300"
        >
          Back
        </A>
      </div>

      <Show when={gameId()}>
        <div class="relative z-10 text-center">
          <h1 class="text-5xl md:text-7xl font-extrabold text-primary uppercase tracking-tight transition-all duration-1000 w-1/2 mx-auto">
            <span class="bg-gradient-to-r from-accent to-pink-500 bg-clip-text text-transparent">Oh</span>, Let’s Launch
            This Trivia Soirée—Because Clearly, You’re All&nbsp;
            <span class="bg-gradient-to-br from-blue-600 to-cyan-400 bg-clip-text text-transparent">Geniuses</span>
            &nbsp; Waiting to Be &nbsp;
            <span class="bg-gradient-to-tr from-cyan-600 to-orange bg-clip-text text-transparent">Humbled!</span>
          </h1>
          <button
            class="mt-8 bg-primary text-void text-xl md:text-2xl font-bold uppercase py-3 px-6 rounded-lg hover:bg-white hover:text-void transition-all duration-300 animate-[pulse_2s_infinite] hover:cursor-pointer"
            onClick={() => navigate('/game/' + gameId())}
          >
            Lets Go
          </button>
        </div>
      </Show>

      {/* Flipping Card for Form Steps */}
      <div class="relative w-full max-w-md">
        <div class="relative w-full overflow-y-auto max-h-[9a0vh]">
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
                class="w-full input-colors border-2 border-void rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent "
              />
              <button
                disabled={emptyCreatorName()}
                onClick={onFirstStepFinish}
                class="mt-6 w-full bg-void text-primary font-bold uppercase py-2 px-4 rounded-lg hover:bg-accent hover:text-white hover:cursor-pointer transition-all duration-300"
                classList={{ 'opacity-50 hover:cursor-not-allowed!': emptyCreatorName() }}
              >
                {emptyCreatorName() ? 'We need to know name of Creator' : 'Next'}
              </button>
              <p class="text-void text-xs uppercase text-center mt-4">Let’s get started!</p>
            </div>
          </Show>

          {/* Step 2: Add users */}
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
                <div class="mt-4 flex flex-col justify-between">
                  <input
                    type="text"
                    value={currentUserName()}
                    onInput={(e) => setCurrentUserName(e.currentTarget.value)} // Fixed typo
                    placeholder="Add Player"
                    class="w-full input-colors border-2 border-void rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button
                    onClick={addUser}
                    class="mt-2 w-full bg-void text-primary font-bold uppercase py-1 px-3 rounded-lg hover:bg-accent hover:text-white hover:cursor-pointer transition-all duration-300"
                    classList={{
                      ' opacity-50 hover:cursor-not-allowed!': emptyCurrentUserName() || sameUser() || userAsCreator(),
                    }}
                    disabled={emptyCurrentUserName() || sameUser() || userAsCreator()}
                  >
                    {sameUser() && 'Funny but we cant use same names'}
                    {!sameUser() && userAsCreator() && 'Creator is already a user you dummy'}
                    {!sameUser() && !userAsCreator() && 'Add Player'}
                  </button>
                </div>
                <div class="mt-4 max-h-32 overflow-y-auto flex flex-wrap gap-2">
                  <For each={gameUsers()}>
                    {(user) => (
                      <div class="relative bg-void rounded-md px-2 py-1 mb-1 flex items-center gap-2 shadow-xs hover:shadow-sm transition-all duration-300 animate-slide-in w-fit">
                        <p class="text-primary text-sm font-medium uppercase tracking-wide flex-1">{user.name}</p>
                        {!user.isAdmin ? (
                          <button
                            onClick={() => setGameUsers(gameUsers().filter((u) => u.id !== user.id))}
                            class="w-5 h-5 flex items-center justify-center text-void/60 hover:bg-accent hover:text-white transition-all duration-200 hover:cursor-pointer"
                            aria-label={`Remove player ${user}`}
                          >
                            <IoCloseSharp class="w-4 h-4 text-primary" />
                          </button>
                        ) : (
                          <BsStars class="w-4 h-4 text-yellow-600" title="Admin" />
                        )}
                      </div>
                    )}
                  </For>
                </div>
              </div>
              <div class="flex justify-between mt-6">
                <button
                  onClick={prevStep}
                  class="bg-void text-primary font-bold uppercase py-2 px-4 rounded-lg hover:bg-accent hover:text-white hover:cursor-pointer transition-all duration-300"
                >
                  Back
                </button>
                <button
                  onClick={onSecondStepFinish}
                  class="bg-void text-primary font-bold uppercase py-2 px-4 rounded-lg hover:bg-accent hover:text-white hover:cursor-pointer transition-all duration-300"
                  classList={{ 'opacity-50 cursor-not-allowed': gameUsers().length < 2 }}
                  disabled={gameUsers().length < 2}
                >
                  Next
                </button>
              </div>
              <p class="text-void text-xs uppercase text-center mt-4">Game should have at least 2 players.</p>
            </div>
          </Show>
          <Show when={step() === 3}>
            <div class="w-full bg-primary rounded-lg p-6">
              <div class="flex justify-between mb-4">
                <p class="text-void text-sm uppercase font-bold">Step 3</p>
                <p class="text-void text-sm uppercase font-bold">Add Rounds</p>
              </div>
              <h2 class="text-2xl md:text-3xl font-bold text-void uppercase tracking-tight text-center mb-6">
                Round Name
              </h2>
              <div class="mb-4">
                <input
                  type="text"
                  value={currentRoundName()}
                  onInput={(e) => setCurrentRoundName(e.currentTarget.value)}
                  placeholder="Round Name (e.g., Pop Culture)"
                  class="w-full input-colors border-2 border-void rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <div class="mt-4 flex gap-2">
                  <For each={roundRanks()}>
                    {(rank) => (
                      <div
                        class="flex items-center mt-1 p-1 bg-void text-primary rounded-md hover:bg-accent transition-all duration-300 cursor-pointer font-bold"
                        classList={{ 'bg-accent! text-primary': rank.isSelected }}
                        title={rank.isSelected ? 'Remove Rank' : 'Add Rank'}
                        onClick={() => onRankToggle(rank)}
                      >
                        {rank.label}
                      </div>
                    )}
                  </For>
                </div>
                <div class="mt-4 flex gap-2">
                  <For each={roundTimes()}>
                    {(time) => (
                      <div
                        class="flex items-center mt-1 p-1 bg-void text-primary rounded-md hover:bg-accent transition-all duration-300 cursor-pointer font-bold"
                        classList={{ 'bg-accent! text-primary': time.isSelected }}
                        title={time.isSelected ? 'Choose Time' : 'Remove Time'}
                        onClick={() => setRoundTimes(roundTimes().map((t) => ({ ...t, isSelected: t.id === time.id })))}
                      >
                        {time.label}
                      </div>
                    )}
                  </For>
                </div>
                <div class="mt-4 flex flex-col gap-2 ">
                  <For each={roundRanks().filter((r) => r.isSelected)}>
                    {(_, i) => {
                      return (
                        <input
                          placeholder={`Theme ${i() + 1}:`}
                          type="text"
                          value={themes()[i()] || ''}
                          onInput={(e) =>
                            setThemes((prev) => {
                              prev[i()] = e.currentTarget.value
                              return [...prev]
                            })
                          }
                          class="w-full input-colors border-2 border-void rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300 animate-slide-in"
                        />
                      )
                    }}
                  </For>
                </div>
                <button
                  onClick={addRound}
                  class="mt-4 w-full bg-accent text-white font-bold uppercase py-1 px-3 rounded-lg hover:bg-void hover:text-primary hover:cursor-pointer transition-all duration-300"
                  classList={{
                    'opacity-50 hover:cursor-not-allowed!':
                      emptyRoundName() || notEnoughUsers() || emptyThemes() || emptyRanks(),
                  }}
                >
                  Add Round
                </button>
              </div>
              <div class="max-h-80 overflow-y-auto">
                <For each={rounds()}>
                  {(round) => (
                    <div class="mb-2 bg-void rounded-md p-2 shadow-xs transition-all duration-300 animate-slide-in">
                      <div class="flex items-start gap-2 justify-between text-primary">
                        <div class="flex flex-col">
                          <div class="flex items-center gap-2">
                            <BsController class="w-5 h-5 text-accent" />
                            <p class="text-primary font-semibold uppercase mt-0.5 text-sm truncate overflow-hidden whitespace-nowrap">
                              {round.name}
                            </p>
                            <span class="text-primary/50 mt-0.5 text-sm truncate overflow-hidden whitespace-nowrap">
                              {round.time.label}
                            </span>
                          </div>
                          <div class="flex flex-wrap mr-4 gap-2 text-xs my-2">
                            <For each={round.ranks}>
                              {(rank) => <p class="flex items-center rounded-md">{rank.label} </p>}
                            </For>
                          </div>
                        </div>
                        <button
                          onClick={() => setRounds(rounds().filter((u) => u.id !== round.id))}
                          class="w-5 h-5 flex items-center justify-center text-accent hover:bg-primary transition-all duration-200 hover:cursor-pointer"
                          aria-label={`Remove ${round.name} round`}
                          title="Remove Round"
                        >
                          <IoCloseSharp class="w-4 h-4" />
                        </button>
                      </div>
                      <div class="flex flex-wrap gap-2">
                        <For each={round.themes}>
                          {(theme) => <p class="text-center text-primary font-bold rounded-md p-1">{theme.name}</p>}
                        </For>
                      </div>
                      <div class="flex flex-wrap gap-2">
                        <For each={gameUsers()}>
                          {(user) => (
                            <div class="flex items-center gap-2 mt-1 p-1 bg-primary rounded-sm">
                              <p class="text-void text-sm uppercase mt-0.5">{user.name}</p>
                              {user.isAdmin ? (
                                <BsStars class="w-4 h-4 text-yellow-600" />
                              ) : (
                                <FaSolidUserAstronaut class="w-4 h-4 text-accent" />
                              )}
                            </div>
                          )}
                        </For>
                      </div>
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
                  onClick={onFinish}
                  class="bg-void text-primary font-bold uppercase py-2 px-4 rounded-lg hover:bg-accent hover:text-white hover:cursor-pointer transition-all duration-300"
                  classList={{ 'opacity-50 cursor-not-allowed': rounds().length === 0 }}
                  disabled={rounds().length === 0}
                >
                  Finish
                </button>
              </div>
              <p class="text-void text-xs uppercase text-center mt-4">Rounds should be fun!</p>
            </div>
          </Show>
        </div>
      </div>
    </>
  )
}

export default CreateGame
