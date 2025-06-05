import { createEffect, createMemo, createSignal, For, Show } from 'solid-js'
import { Game, Question, Round, Theme, User } from '../types'
import { TbConfetti } from 'solid-icons/tb'
import { A } from '@solidjs/router'
import QuestionModal, { ExtraAnswerers } from '../components/QuestionModal'
import Popover from '../components/Popover'
import AnsweredPopover, { QuestionPopover } from '../components/AnsweredPopover'

type Props = {
  round?: Round
  users: Game['users']
  currentQuestion: Question['id']
  currentUser: User['id']
  onQuestionSelect: (question: Question['id']) => void
  onQuestionAnswered: (question: Question, isCorrect: boolean, userId: User['id']) => void
  updateForExtraAnswerer: (question: Question, isCorrect: boolean, userId: User['id']) => void
}

const GameRound = (props: Props) => {
  const [isModalOpen, setIsModalOpen] = createSignal(false)
  const [activeTheme, setActiveTheme] = createSignal<Theme>()
  const [questionPopover, setQuestionPopover] = createSignal<QuestionPopover>()
  const [answeredQuestionsMap, setAnsweredQuestionsMap] = createSignal<Record<Question['id'], QuestionPopover>>({})

  const activeQuestion = () => {
    const allQuestions = props.round?.themes.flatMap((theme) => theme.questions) || []
    return allQuestions.find((question) => question.id === props.currentQuestion)!
  }

  const scores = () => {
    return props.users.reduce(
      (acc, curr) => {
        acc[curr.id] = curr.roundScore?.[props.round?.id || ''] || 0
        return acc
      },
      {} as Record<User['id'], number>
    )
  }
  const winningUser = createMemo(() => {
    return Object.entries(scores()).reduce(
      (acc, curr) => {
        if (curr[1] > scores()[acc]) {
          return curr[0] as User['id']
        }
        return acc
      },
      Object.keys(scores())[0] as User['id']
    )
  })

  const updateExtraAnswerers = (extraAnswerers: ExtraAnswerers) => {
    for (const [userId, [, isCorrect]] of Object.entries(extraAnswerers)) {
      if (isCorrect === null) {
        continue
      }

      const question = activeQuestion()
      question.answeredBy = {
        ...question.answeredBy,
        [userId]: {
          isCorrect,
        },
      }

      props.updateForExtraAnswerer(question, isCorrect, userId)
    }
  }

  const handleAnswerSubmit = (timeAnswered: number, isCorrect: boolean | null) => {
    if (isCorrect === null) {
      setIsModalOpen(false)
      return
    }

    const question = activeQuestion()
    question.answeredBy = {
      ...question.answeredBy,
      [props.currentUser]: {
        isCorrect,
        timeAnswered,
      },
    }

    props.onQuestionAnswered(question, isCorrect, props.currentUser)
    setIsModalOpen(false)
  }

  const answeredBy = () => {
    const userIndex = props.users.findIndex((user) => user.id === props.currentUser)
    let index = userIndex - 1

    if (index < 0) {
      index = props.users.length - 1
    }

    return props.users[index]
  }

  const handleQuestionSelect = (q: Question, t: Theme) => {
    // TODO: Add popover for answered questions
    // if (q.timeAnswered) {
    //   if (questionPopover()?.id !== q.id) {
    //     setQuestionPopover(undefined)
    //   }

    //   if (questionPopover()?.id === q.id) {
    //     setQuestionPopover(undefined)
    //     return
    //   }

    //   if (answeredQuestionsMap()[q.id]) {
    //     setQuestionPopover(answeredQuestionsMap()[q.id])
    //     return
    //   }

    //   const answeredByUser = answeredBy()
    //   const qPopover: QuestionPopover = {
    //     id: q.id,
    //     time: q.timeAnswered,
    //     isCorrect: q.isCorrect,
    //     user: answeredByUser.name,
    //   }

    //   if (answeredByUser) {
    //     setAnsweredQuestionsMap((prev) => ({
    //       ...prev,
    //       [q.id]: qPopover,
    //     }))

    //     setQuestionPopover(qPopover)
    //   }

    //   return
    // }

    props.onQuestionSelect(q.id)
    setActiveTheme(t)

    setIsModalOpen(true)
  }

  return (
    <>
      <Show when={props.round}>
        <QuestionModal
          isOpen={isModalOpen()}
          updateExtraAnswerers={updateExtraAnswerers}
          themeTitle={activeTheme()?.name || 'Theme'}
          points={activeQuestion()?.points || 0}
          questionTime={props.round!.time.id}
          questionText={activeQuestion()?.text || ''}
          onAnswerSubmit={handleAnswerSubmit}
          users={props.users}
          currentUser={props.currentUser}
        />
      </Show>
      {/*Back Link */}
      <div class="absolute top-4 left-4 md:top-8 md:left-8 z-20">
        <A
          href="#"
          onClick={() => window.history.back()}
          class="text-primary text-sm md:text-lg font-bold uppercase tracking-wider hover:text-white transition-all duration-300"
        >
          Back
        </A>
      </div>
      <div class="flex flex-col justify-between h-full mt-10 sm:mt-0 sm:h-[60%] xl:h-[90%] 2xl:h-[70%] z-50 overflow-y-auto overflow-x-hidden">
        <div class="flex flex-col items-center text-primary mx-auto">
          <h1 class="text-3xl sm:text-5xl font-bold mb-20">{props.round?.name} </h1>
          <div class="flex justify-center gap-4 sm:flex-nowrap flex-wrap max-w-[99%] sm:max-w-none">
            <For each={props.round?.themes}>
              {(theme) => {
                return (
                  <div class="flex flex-col items-center font-semibold min-w-[45%] sm:min-w-[200px] group">
                    <span class="text-2xl sm:text-3xl xl:text-4xl mb-2 group-hover:text-green-600 group-hover:scale-120 transition-all duration-300">
                      {theme.name}
                    </span>
                    <div class="flex flex-col text-3xl sm:text-5xl xl:text-7xl gap-2">
                      <For each={theme.questions}>
                        {(question) => {
                          const isCorrect = () => {
                            // Basically we need to filter out extra answereres as they dont have timeAnswered
                            const mainAnswer = Object.values(question.answeredBy).find((answer) => answer.timeAnswered)
                            return mainAnswer?.isCorrect
                          }

                          return (
                            <Popover
                              content={<AnsweredPopover question={questionPopover()} />}
                              placement="top"
                              offset={8}
                              isVisible={questionPopover()?.id === question.id}
                            >
                              <span
                                onClick={() => handleQuestionSelect(question, theme)}
                                class="child relative hover:cursor-pointer"
                                classList={{
                                  'click-green': isCorrect() === true,
                                  'click-red': isCorrect() === false,
                                  'hover-rank': isCorrect() === null,
                                }}
                              >
                                <span
                                  classList={{
                                    'line-cross bg-red-600': isCorrect() === false,
                                    'line-cross bg-green-600': isCorrect() === true,
                                  }}
                                />
                                {question.points}
                              </span>
                            </Popover>
                          )
                        }}
                      </For>
                    </div>
                  </div>
                )
              }}
            </For>
          </div>
        </div>
        <div class="flex flex-wrap justify-center p-2 gap-12 mt-6 sm:mt-10 xl:mt-0">
          <For each={props.users}>
            {(user) => {
              return (
                <div class="flex flex-col items-center justify-between gap-2 sm:gap-4">
                  <div class="text-sm sm:text-3xl font-bold text-primary flex items-center gap-2 text-center">
                    <span classList={{ 'turn-indicator animate-pulse': user.id === props.currentUser }}>
                      {user.name}
                    </span>{' '}
                    {winningUser() === user.id && <TbConfetti class="text-orange-300" />}
                  </div>
                  <span
                    class="text-xl sm:text-2xl text-gray-500 ml-2 mb-0.5"
                    classList={{ 'text-green-600': winningUser() === user.id }}
                  >
                    {scores()[user.id]}
                  </span>
                </div>
              )
            }}
          </For>
        </div>
      </div>
    </>
  )
}

export default GameRound
