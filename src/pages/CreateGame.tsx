import { createEffect, createMemo, createSignal, For, Show } from 'solid-js'
import { A, useNavigate } from '@solidjs/router'
import { IoCloseSharp, IoEyeSharp } from 'solid-icons/io'
import { BsController } from 'solid-icons/bs'
import { FaSolidUserAstronaut } from 'solid-icons/fa'
import { RoundRank, Round, User, Game, RoundTime, Question, Theme } from '../types'
import { BiSolidHide } from 'solid-icons/bi'
import { FiEdit } from 'solid-icons/fi'
import { v4 as uuidv4 } from 'uuid'

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
  game?: Game
  onGameUpdate: (game: Game) => void
  isTemplate?: boolean
  onFinish?: () => void
}

export const createUUID = () => {
  return uuidv4()
}

const cardClasses = 'w-full bg-primary rounded-lg p-2 md:p-6'
const buttonClasses = 'text-sm sm:text-lg'

const CreateGame = (props: Props) => {
  const navigate = useNavigate()
  const [gameId, setGameId] = createSignal<Game['id']>('')
  const [step, setStep] = createSignal(1)
  const [gameName, setGameName] = createSignal(props.game?.name || '')
  const [gameDescription, setGameDescription] = createSignal(props.game?.description || '')
  const [rounds, setRounds] = createSignal<Round[]>(props.game?.rounds || [])
  const [currentRoundName, setCurrentRoundName] = createSignal('')
  const [currentUserName, setCurrentUserName] = createSignal('')
  const [gameUsers, setGameUsers] = createSignal<User[]>(props.game?.users || [])
  const [roundRanks, setRoundRanks] = createSignal<RoundRank[]>(defaultRanks)
  const [roundTimes, setRoundTimes] = createSignal<RoundTime[]>(defaultTimes)
  const [themes, setThemes] = createSignal<string[]>([])
  const [questions, setQuestions] = createSignal<Record<Theme['id'], Question[]>>({})
  const [hiddenThemes, setHiddenThemes] = createSignal<Record<string, boolean>>({})
  const [isPublic, setIsPublic] = createSignal(props.game?.isPublic || false)
  const [themeCount, setThemeCount] = createSignal<number>(5)
  const [editingRoundId, setEditingRoundId] = createSignal<string>('')
  const emptyGameName = createMemo(() => gameName().trim() === '')

  const emptyRoundName = createMemo(() => currentRoundName().trim() === '')
  const emptyCurrentUserName = createMemo(() => currentUserName().trim() === '')
  const emptyThemes = createMemo(
    () => themes().length === 0 || themes().some((theme) => theme.trim() === '') || themes().length < themeCount()
  )

  const emptyRanks = createMemo(() => roundRanks().filter((r) => r.isSelected).length === 0)
  const emptyTime = createMemo(() => roundTimes().filter((t) => t.isSelected).length === 0)

  const notEnoughUsers = createMemo(() => !props.isTemplate && gameUsers().length < 2)
  const sameUser = createMemo(() =>
    gameUsers().some((user) => user.name.toLowerCase() === currentUserName().toLowerCase())
  )

  createEffect(() => {
    if (props.isTemplate) {
      for (const round of props.game?.rounds || []) {
        setQuestions(
          round.themes.reduce(
            (acc, theme) => {
              acc[theme.id] = theme.questions
              return acc
            },
            {} as Record<string, Question[]>
          )
        )
      }
    }
  })

  const nextStep = () => {
    if (step() === 1 && emptyGameName()) return
    if (step() === 2 && gameUsers().length < 2) return
    if (step() === 3 && rounds().length === 0) return
    setStep(step() + 1)
    scrollToTop()
  }

  const onFirstStepFinish = () => {
    if (props.isTemplate) {
      setStep(3)
      scrollToTop()
      return
    }
    nextStep()
    setGameName(gameName())
  }

  const onSecondStepFinish = () => {
    nextStep()
  }

  const prevStep = () => {
    setStep(step() - 1)
    scrollToTop()
  }

  const addUser = () => {
    if (currentUserName().trim() === '') return
    setGameUsers([...gameUsers(), { id: createUUID(), name: currentUserName(), isAdmin: false, roundScore: {} }])
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
    const ranks = roundRanks().filter((r) => r.isSelected)

    const roundThemes: Theme[] = themes().map((theme) => ({
      id: createUUID(),
      name: theme,
      questions: ranks.map((r) => ({
        id: createUUID(),
        text: '',
        answer: '',
        points: r.id,
        answeredBy: {},
        timeAnswered: null,
      })),
    }))

    const newRound: Round = {
      name: currentRoundName(),
      id: createUUID(),
      ranks: ranks,
      themes: roundThemes,
      time: roundTimes().find((t) => t.isSelected)!,
    }

    setRounds((prev) => {
      const newRounds = [...prev]
      newRounds.push(newRound)
      return newRounds
    })

    setCurrentRoundName('')
    setThemes([])
  }

  const onFinish = () => {
    if (rounds().length === 0) return

    setStep(0)
    const game: Game = {
      id: props.game?.id || createUUID(),
      users: gameUsers() || [],
      rounds: rounds(),
      name: gameName(),
      description: gameDescription() ?? 'Pretty cool game: ' + gameName(),
      currentRound: '',
      currentQuestion: '',
      currentUser: gameUsers()[0]?.id || '',
      isFinished: false,
      isPublic: isPublic(),
      creatorId: props.game?.creatorId || gameUsers()[0]?.id || '',
      createdAt: Date.now(),
    }

    if (!props.isTemplate) {
      setGameId(game.id)
    }

    props.onGameUpdate(game)
    props.onFinish?.()
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onHideTheme = (themeId: string) => {
    setHiddenThemes((prev) => ({ ...prev, [themeId]: !prev[themeId] }))
  }

  const onQuestionsComplete = () => {
    const newRounds = rounds().map((round) => {
      const themes = round.themes.map((theme) => ({
        ...theme,
        questions: theme.questions.map((q, i) => ({
          ...q,
          text: questions()[theme.id]?.[i]?.text || '',
          answer: questions()[theme.id]?.[i]?.answer || '',
        })),
      }))

      return { ...round, themes }
    })

    setRounds(newRounds)
    prevStep()
  }

  const onEditRound = (round: Round) => {
    setCurrentRoundName(round.name)
    setThemes(round.themes.map((theme) => theme.name))
    setRoundRanks(round.ranks)
    setRoundTimes(roundTimes().map((t) => ({ ...t, isSelected: t.id === round.time.id })))
    setQuestions(
      round.themes.reduce(
        (acc, theme) => {
          acc[theme.id] = theme.questions
          return acc
        },
        {} as Record<string, Question[]>
      )
    )

    setEditingRoundId(round.id)
    setThemeCount(round.themes.length)
    scrollToTop()
  }

  const cancelRoundEdit = () => {
    setEditingRoundId('')
    setCurrentRoundName('')
    setThemes([])
    setRoundRanks(defaultRanks)
    setRoundTimes(defaultTimes)
    setThemeCount(5)
  }

  const onRoundEditSave = () => {
    if (emptyRoundName() || emptyThemes() || emptyRanks() || emptyTime()) return
    const editingRoundIndex = rounds().findIndex((r) => r.id === editingRoundId())

    if (editingRoundIndex === -1) return

    const ranks = roundRanks().filter((r) => r.isSelected)
    const time = roundTimes().find((t) => t.isSelected)!
    const updatedRound = { ...rounds()[editingRoundIndex] }

    updatedRound.ranks = ranks
    updatedRound.name = currentRoundName()
    updatedRound.time = time

    updatedRound.themes = updatedRound.themes.map((theme, i) => ({
      ...theme,
      name: themes()[i] || theme.name,
      questions: questions()[theme.id] || theme.questions,
    }))

    if (updatedRound.themes.length < themes().length) {
      updatedRound.themes = themes().map((theme, i) => {
        const roundTheme = updatedRound.themes[i]

        if (roundTheme) {
          return roundTheme
        }

        return {
          id: createUUID(),
          name: theme,
          questions: ranks.map((r) => ({
            id: createUUID(),
            text: '',
            answer: '',
            points: r.id,
            answeredBy: {},
            timeAnswered: null,
          })),
        }
      })
    }

    setRounds((prev) => {
      const newRounds = [...prev]
      newRounds[editingRoundIndex] = updatedRound
      return newRounds
    })

    cancelRoundEdit()
  }

  const onUserRemove = (user: User) => {
    if (props.game?.creatorId === user.id) {
      return
    }

    setGameUsers(gameUsers().filter((u) => u.id !== user.id))
  }

  return (
    <>
      <Show when={!props.isTemplate}>
        <div class="absolute top-4 left-4 md:top-8 md:left-8 z-20">
          <A
            href="/"
            class="text-primary text-sm md:text-lg font-bold uppercase tracking-wider hover:text-white transition-all duration-300"
          >
            Back
          </A>
        </div>
      </Show>

      <Show when={gameId()}>
        <div class="relative z-10 text-center">
          <h1 class="text-2xl sm:text-5xl md:text-7xl font-extrabold text-primary uppercase tracking-tight transition-all duration-1000 w-1/2 mx-auto">
            <span class="bg-gradient-to-r from-accent to-pink-500 bg-clip-text text-transparent">Oh</span>, Let’s Launch
            This Trivia Soirée—Because Clearly, You’re All&nbsp;
            <span class="bg-gradient-to-br from-blue-600 to-cyan-400 bg-clip-text text-transparent">Geniuses</span>
            &nbsp; Waiting to Be &nbsp;
            <span class="bg-gradient-to-tr from-cyan-600 to-orange bg-clip-text text-transparent">Humbled!</span>
          </h1>
          <button
            class="mt-8 bg-primary text-void text-xl md:text-2xl font-bold uppercase py-3 px-6 rounded-lg hover:bg-white hover:text-void transition-all duration-300 animate-[pulse_2s_infinite] hover:cursor-pointer"
            onClick={() => navigate('/local/game/' + gameId())}
          >
            Lets Go
          </button>
        </div>
      </Show>

      {/* Flipping Card for Form Steps */}
      <div class="relative w-full max-w-sm sm:max-w-md mt-12 sm:m-0">
        <div class="relative w-full overflow-y-auto max-h-[90vh]">
          {/* Step 1: Enter Your Name */}
          <Show when={step() === 1}>
            <div class={cardClasses}>
              <div class="flex justify-end mb-2 sm:mb-4">
                <p class="text-void text-sm uppercase font-bold">Game Name</p>
              </div>
              <h2 class="text-2xl md:text-3xl font-bold text-void uppercase tracking-tight text-center mb-6">
                Enter Game Name
              </h2>
              <input
                type="text"
                value={gameName()}
                onInput={(e) => setGameName(e.currentTarget.value)}
                placeholder="The Trivia Master"
                class="w-full input-colors"
              />
              <textarea
                value={gameDescription()}
                onInput={(e) => setGameDescription(e.currentTarget.value)}
                placeholder="Optional: Describe the glorious battle of wits to come..."
                class="w-full input-colors mt-4"
              />
              <Show when={props.isTemplate}>
                <div class="flex items-center mt-4 gap-2">
                  <input
                    type="checkbox"
                    id="is-public-checkbox" // Added id for label association
                    class="w-5 h-5 rounded bg-void text-primary accent-primary focus:ring-primary focus:ring-2 cursor-pointer"
                    checked={isPublic()}
                    onChange={() => setIsPublic(!isPublic())}
                  />
                  <label for="is-public-checkbox" class="text-void text-lg cursor-pointer select-none">
                    Make this game template public?
                  </label>
                </div>
              </Show>
              <button
                disabled={emptyGameName()}
                onClick={onFirstStepFinish}
                class={`${buttonClasses} mt-6 w-full bg-void text-primary font-bold uppercase py-2 px-4 rounded-lg hover:bg-accent hover:text-white hover:cursor-pointer transition-all duration-300`}
                classList={{ 'opacity-50 hover:cursor-not-allowed!': emptyGameName() }}
              >
                {emptyGameName() ? 'We need to know name of Game' : 'Next'}
              </button>
              <p class="text-void text-xs uppercase text-center mt-4">Let’s get started!</p>
            </div>
          </Show>

          {/* Step 2: Add users */}
          <Show when={step() === 2}>
            <div class={cardClasses}>
              <div class="flex justify-end mb-4">
                <p class="text-void text-sm uppercase font-bold">Add Players</p>
              </div>
              <h2 class="text-2xl md:text-3xl font-bold text-void uppercase tracking-tight text-center mb-6">
                Game Members
              </h2>
              <div class="mb-2 sm:mb-4">
                <div class="mt-4 flex flex-col justify-between">
                  <input
                    type="text"
                    value={currentUserName()}
                    onInput={(e) => setCurrentUserName(e.currentTarget.value)}
                    placeholder="Add Player"
                    class="w-full input-colors"
                  />
                  <button
                    onClick={addUser}
                    class="mt-2 w-full bg-void text-primary font-bold uppercase py-1 px-3 rounded-lg hover:bg-accent hover:text-white hover:cursor-pointer transition-all duration-300"
                    classList={{
                      ' opacity-50 hover:cursor-not-allowed!': emptyCurrentUserName() || sameUser(),
                    }}
                    disabled={emptyCurrentUserName() || sameUser()}
                  >
                    {sameUser() && 'Funny, but we cant use same names'}
                    {!sameUser() && 'Add Player'}
                  </button>
                </div>
                <div class="mt-4 max-h-32 overflow-y-auto flex flex-wrap gap-2">
                  <For each={gameUsers()}>
                    {(user) => (
                      <div class="relative bg-void rounded-md px-2 py-1 mb-1 flex items-center gap-2 shadow-xs hover:shadow-sm transition-all duration-300 animate-slide-in w-fit">
                        <p class="text-primary text-sm font-medium uppercase tracking-wide flex-1">{user.name}</p>
                        <button
                          onClick={() => onUserRemove(user)}
                          class="w-5 h-5 flex items-center justify-center text-void/60 hover:bg-accent hover:text-white transition-all duration-200 hover:cursor-pointer"
                          aria-label={`Remove player ${user}`}
                        >
                          <IoCloseSharp class="w-4 h-4 text-primary" />
                        </button>
                      </div>
                    )}
                  </For>
                </div>
              </div>
              <div class="flex justify-between mt-2 sm:mt-6">
                <button
                  onClick={() => {
                    prevStep()
                  }}
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
            <div class={cardClasses + 'overflow-auto'}>
              <div class="flex justify-end mb-4">
                <p class="text-void text-sm uppercase font-bold">Add Rounds</p>
              </div>
              <h2 class="text-2xl md:text-3xl font-bold text-void uppercase tracking-tight text-center mb-6">
                Round Name
              </h2>
              <div>
                <input
                  type="text"
                  value={currentRoundName()}
                  onInput={(e) => setCurrentRoundName(e.currentTarget.value)}
                  placeholder="Round Name (e.g., Pop Culture)"
                  class="w-full input-colors"
                />
                <div class="flex items-center gap-2 mt-2">
                  <p class="text-void text-sm uppercase font-bold">Theme Count</p>
                  <input
                    type="number"
                    value={themeCount()}
                    onInput={(e) => {
                      if (Number(e.currentTarget.value) < 20 && Number(e.currentTarget.value) > 1) {
                        setThemeCount(Number(e.currentTarget.value))
                      }
                    }}
                    onblur={(e) => {
                      if (themeCount() > 20 || Number(e.currentTarget.value) > 20) {
                        setThemeCount(20)
                      }
                      if (themeCount() < 1 || Number(e.currentTarget.value) < 1) {
                        setThemeCount(1)
                      }
                    }}
                    class="input-colors p-2! max-w-fit! h-8! "
                    min={2}
                    max={20}
                  />
                </div>
                <p class="text-void text-sm uppercase font-bold mt-2">Round points</p>
                <div class="flex gap-2 flex-wrap sm:flex-nowrap">
                  <For each={roundRanks()}>
                    {(rank) => (
                      <div
                        class="text-sm sm:text-lg flex items-center mt-1 p-1 bg-void text-primary rounded-md hover:bg-accent transition-all duration-300 cursor-pointer font-bold"
                        classList={{ 'bg-accent! text-primary': rank.isSelected }}
                        title={rank.isSelected ? 'Remove Rank' : 'Add Rank'}
                        onClick={() => onRankToggle(rank)}
                      >
                        {rank.label}
                      </div>
                    )}
                  </For>
                </div>
                <p class="text-void text-sm uppercase font-bold mt-2">Question Time Limit</p>
                <div class="flex gap-2 flex-wrap sm:flex-nowrap">
                  <For each={roundTimes()}>
                    {(time) => (
                      <div
                        class="text-sm sm:text-lg  flex items-center mt-1 py-1 px-2 sm:p-1 bg-void text-primary rounded-md hover:bg-accent transition-all duration-300 cursor-pointer font-bold"
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
                  <For each={Array.from({ length: themeCount() })}>
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
                          class="w-full input-colors animate-slide-in"
                        />
                      )
                    }}
                  </For>
                </div>
                <Show
                  when={!editingRoundId()}
                  fallback={
                    <div class="flex justify-between">
                      <button
                        onClick={onRoundEditSave}
                        class="my-4 md:w-[45%] bg-accent text-white font-bold uppercase py-1 px-3 rounded-lg hover:bg-void hover:text-primary hover:cursor-pointer transition-all duration-300"
                        classList={{
                          'opacity-50 hover:cursor-not-allowed!':
                            emptyRoundName() || notEnoughUsers() || emptyThemes() || emptyRanks(),
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelRoundEdit}
                        class="my-4  md:w-[45%] bg-red-500 text-white font-bold uppercase py-1 px-3 rounded-lg hover:bg-void hover:text-primary hover:cursor-pointer transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  }
                >
                  <button
                    onClick={addRound}
                    class="my-4 w-full bg-accent text-white font-bold uppercase py-1 px-3 rounded-lg hover:bg-void hover:text-primary hover:cursor-pointer transition-all duration-300"
                    classList={{
                      'opacity-50 hover:cursor-not-allowed!':
                        emptyRoundName() || notEnoughUsers() || emptyThemes() || emptyRanks(),
                    }}
                  >
                    Add Round
                  </button>
                </Show>
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
                        <div class="flex items-center gap-2">
                          <button
                            onClick={() => onEditRound(round)}
                            class="w-5 h-5 flex items-center justify-center text-accent hover:bg-primary transition-all duration-200 hover:cursor-pointer"
                            aria-label={`Edit ${round.name} round`}
                            title="Edit Round"
                          >
                            <FiEdit class="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRounds(rounds().filter((u) => u.id !== round.id))}
                            class="w-5 h-5 flex items-center justify-center text-red-500 hover:bg-primary hover:text-red-500/50 transition-all duration-200 hover:cursor-pointer"
                            aria-label={`Remove ${round.name} round`}
                            title="Remove Round"
                          >
                            <IoCloseSharp class="w-4 h-4" />
                          </button>
                        </div>
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
                              <FaSolidUserAstronaut class="w-4 h-4 text-accent" />
                              <p class="text-void text-sm uppercase mt-0.5">{user.name}</p>
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
                  onClick={() => {
                    if (props.isTemplate) {
                      setStep(1)
                      scrollToTop()
                      return
                    }
                    prevStep()
                  }}
                  class="text-sm sm:text-lg bg-void text-primary font-bold uppercase py-2 px-3 sm:py-2 sm:px-4 rounded-lg hover:bg-accent hover:text-white hover:cursor-pointer transition-all duration-300"
                >
                  Back
                </button>
                <button
                  onClick={nextStep}
                  class="text-sm sm:text-lg bg-accent text-primary font-bold uppercase py-2 px-3 sm:py-2 sm:px-4 rounded-lg hover:bg-accent/50 hover:text-white hover:cursor-pointer transition-all duration-300"
                  classList={{
                    'opacity-50 cursor-not-allowed!': rounds().length === 0 || !!editingRoundId(),
                  }}
                  disabled={rounds().length === 0 || !!editingRoundId()}
                >
                  Fill Questions
                </button>
                <button
                  onClick={onFinish}
                  class="text-sm sm:text-lg bg-void text-primary font-bold uppercase py-2 px-3 sm:py-2 sm:px-4 rounded-lg hover:bg-accent hover:text-white hover:cursor-pointer transition-all duration-300"
                  classList={{ 'opacity-50 cursor-not-allowed!': rounds().length === 0 }}
                  disabled={rounds().length === 0}
                >
                  Finish
                </button>
              </div>
              <p class="text-void text-xs uppercase text-center mt-4">Rounds should be fun!</p>
            </div>
          </Show>
          <Show when={step() === 4}>
            <div class={cardClasses}>
              <div class="flex justify-between mb-4">
                <p class="text-void text-sm uppercase font-bold">Step 4</p>
                <p class="text-void text-sm uppercase font-bold">Add Questions</p>
              </div>
              <h2 class="text-2xl md:text-3xl font-bold text-void uppercase tracking-tight text-center mb-6">
                Questions
              </h2>

              <div class="space-y-8">
                <For each={rounds()}>
                  {(round) => (
                    <div>
                      <h3 class="text-xl font-bold text-void mb-4">Round: {round.name}</h3>

                      <For each={round.themes}>
                        {(theme) => (
                          <div class="mb-6">
                            <div class="flex w-full justify-between items-center">
                              <h4 class="text-lg font-semibold text-void mb-3">Theme: {theme.name}</h4>
                              <button
                                class="text-void hover:cursor-pointer hover:text-void/50 hover:scale-110 transition-all duration-300"
                                onclick={() => onHideTheme(theme.id)}
                              >
                                {hiddenThemes()[theme.id] ? (
                                  <IoEyeSharp class="w-6 h-6" />
                                ) : (
                                  <BiSolidHide class="w-6 h-6" />
                                )}
                              </button>
                            </div>

                            <div class="space-y-4">
                              <For each={round.ranks}>
                                {(rank, j) => (
                                  <div class="flex flex-col items-start gap-4 border-b-2 border-void pb-4">
                                    <textarea
                                      value={questions()[theme.id]?.[j()]?.text || ''}
                                      onInput={(e) => {
                                        setQuestions((prev) => {
                                          if (!prev[theme.id]) {
                                            prev[theme.id] = []
                                          }

                                          prev[theme.id][j()] = {
                                            ...prev[theme.id][j()],
                                            points: rank.id,
                                            text: e.currentTarget.value,
                                          }
                                          return prev
                                        })
                                      }}
                                      placeholder={`${theme.name}: ${rank.label} points`}
                                      class="w-full input-colors"
                                      classList={{
                                        'opacity-20 blur-[4px] pointer-events-none': hiddenThemes()[theme.id],
                                      }}
                                    />
                                    <input
                                      type="text"
                                      value={questions()[theme.id]?.[j()]?.answer || ''}
                                      onInput={(e) => {
                                        setQuestions((prev) => {
                                          prev[theme.id][j()] = {
                                            ...prev[theme.id][j()],
                                            answer: e.currentTarget.value,
                                          }
                                          return prev
                                        })
                                      }}
                                      placeholder={`Answer`}
                                      class="w-full input-colors"
                                      classList={{
                                        'opacity-20 blur-[4px] pointer-events-none': hiddenThemes()[theme.id],
                                      }}
                                    />
                                  </div>
                                )}
                              </For>
                            </div>
                          </div>
                        )}
                      </For>
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
                  onClick={onQuestionsComplete}
                  class="bg-void text-primary font-bold uppercase py-2 px-4 rounded-lg hover:bg-accent hover:text-white hover:cursor-pointer transition-all duration-300"
                >
                  Complete
                </button>
              </div>
              <p class="text-void text-xs uppercase text-center mt-4">Fill in all questions to continue!</p>
            </div>
          </Show>
        </div>
      </div>
    </>
  )
}

export default CreateGame
