// src/GameDashboard.tsx
import { createSignal, For, Show } from 'solid-js'
import { IoDice, IoStar } from 'solid-icons/io'
import { Game, Question, User } from '../types'

interface GameDashboardProps {
  game: Game
  onUpdateGame: (game: Game) => void
}

export default function GameDashboard(props: GameDashboardProps) {
  const [selectedRoundIndex, setSelectedRoundIndex] = createSignal(props.game.currentRound)
  const [selectedQuestion, setSelectedQuestion] = createSignal<Question | null>(null)
  const [selectedUser, setSelectedUser] = createSignal<User | null>(null)

  const pointValues = [100, 200, 300, 400, 500]

  const selectQuestion = (user: User, points: number) => {
    const round = props.game.rounds[selectedRoundIndex()]
    const question = round.questions.find(
      (q, idx) => pointValues[idx % pointValues.length] === points && q.isCorrect === null
    )
    if (question) {
      setSelectedQuestion(question)
      setSelectedUser(user)
    }
  }

  const markQuestionAnswered = (isCorrect: boolean) => {
    if (!selectedQuestion() || !selectedUser()) return

    const updatedGame = { ...props.game }
    const round = updatedGame.rounds[selectedRoundIndex()]
    const questionIndex = round.questions.findIndex((q) => q.id === selectedQuestion()!.id)

    round.questions[questionIndex].isCorrect = isCorrect

    props.onUpdateGame(updatedGame)
    setSelectedQuestion(null)
    setSelectedUser(null)
  }

  return (
    <div class="p-10 bg-gradient-to-br from-primary/20 to-orange-light/20 rounded-2xl shadow-2xl border border-accent/30 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div class="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent opacity-50 pointer-events-none" />

      {/* Round Selection */}
      <div class="mb-12">
        <h2 class="text-4xl font-extrabold text-void uppercase tracking-widest mb-8 text-center bg-gradient-to-r from-accent to-orange bg-clip-text text-transparent">
          Choose Your Arena
        </h2>
        <div class="flex flex-wrap justify-center gap-6">
          <For each={props.game.rounds}>
            {(round, index) => (
              <button
                onClick={() => setSelectedRoundIndex(index())}
                class={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-accent/50 ${
                  selectedRoundIndex() === index()
                    ? 'bg-gradient-to-r from-accent to-orange text-white shadow-[0_0_15px] shadow-accent/70'
                    : 'bg-orange-light/50 text-void hover:bg-orange-light'
                } animate-fade-in`}
              >
                <IoDice class="w-6 h-6" />
                <span class="font-bold uppercase tracking-wide">{round.name}</span>
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Game Grid */}
      <Show when={props.game.rounds[selectedRoundIndex()]}>
        {(round) => (
          <div>
            {/* Flex Container for the "Grid" */}
            <div class="flex flex-col gap-6">
              {/* Header Row (Point Values) */}
              <div class="flex">
                <div class="w-56 p-4"></div> {/* Empty space for user column */}
                <For each={pointValues}>
                  {(points) => (
                    <div class="flex-1 p-4 mx-2 text-center font-extrabold text-2xl text-void uppercase bg-gradient-to-b from-orange-light/50 to-orange-light/30 rounded-xl shadow-inner">
                      {points}
                    </div>
                  )}
                </For>
              </div>

              {/* User Rows */}
              <For each={props.game.users}>
                {(user) => (
                  <div class="flex items-center">
                    {/* User Name */}
                    <div class="w-56 flex items-center gap-3 p-4 mx-2 bg-gradient-to-r from-white/10 to-white/5 rounded-xl shadow-md">
                      <IoDice class="w-6 h-6 text-accent" />
                      <span class="text-void font-bold uppercase tracking-wide">{user.name}</span>
                      {user.isAdmin && <IoStar class="w-5 h-5 text-orange" />}
                    </div>

                    {/* Point Value Cells */}
                    <For each={pointValues}>
                      {(points) => {
                        const question = round().questions.find(
                          (q, idx) => pointValues[idx % pointValues.length] === points && q.isCorrect === null
                        )
                        return (
                          <button
                            onClick={() => selectQuestion(user, points)}
                            disabled={!question}
                            class={`flex-1 p-4 mx-2 text-center rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                              question
                                ? 'bg-gradient-to-br from-accent/40 to-orange/40 text-white hover:from-accent/60 hover:to-orange/60'
                                : 'bg-void/10 text-void/30 cursor-not-allowed'
                            }`}
                          >
                            {question ? 'Pick' : 'Done'}
                          </button>
                        )
                      }}
                    </For>
                  </div>
                )}
              </For>
            </div>

            {/* Selected Question */}
            <Show when={selectedQuestion()}>
              {(question) => (
                <div class="mt-12 p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl shadow-xl border-l-4 border-accent animate-fade-in">
                  <div class="flex items-center justify-between">
                    <h3 class="text-2xl font-bold text-void">
                      Challenge for {selectedUser()?.name} ({question().points} Points)
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedQuestion(null)
                        setSelectedUser(null)
                      }}
                      class="w-8 h-8 flex items-center justify-center text-void/60 rounded-full hover:bg-accent hover:text-white transition-all duration-200"
                    >
                      <IoDice class="w-6 h-6" />
                    </button>
                  </div>
                  <p class="text-void mt-4 text-xl font-medium">{question().text}</p>
                  <p class="text-void/80 mt-2 text-lg pl-4">Answer: {question().answer}</p>
                  <div class="mt-6 flex gap-4">
                    <button
                      onClick={() => markQuestionAnswered(true)}
                      class="px-6 py-2 bg-gradient-to-r from-accent to-orange text-white rounded-xl shadow-md hover:from-accent/80 hover:to-orange/80 transition-all duration-200 transform hover:scale-105"
                    >
                      Correct
                    </button>
                    <button
                      onClick={() => markQuestionAnswered(false)}
                      class="px-6 py-2 bg-gradient-to-r from-void/50 to-void/30 text-void rounded-xl shadow-md hover:from-void/60 hover:to-void/40 transition-all duration-200 transform hover:scale-105"
                    >
                      Incorrect
                    </button>
                  </div>
                </div>
              )}
            </Show>
          </div>
        )}
      </Show>
    </div>
  )
}
