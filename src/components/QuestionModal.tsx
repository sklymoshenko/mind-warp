// src/components/QuestionModal.tsx
import { Component, Show, createSignal, createEffect, createMemo, For, on } from 'solid-js'
// Import desired icons from solid-icons (using Tabler Icons set 'tb' as an example)
import { TbTag, TbAward, TbCheck, TbX } from 'solid-icons/tb'
import { getQuizResponse } from '../data/utils'
import { Duration } from 'luxon'
import { Interval, User } from '../types'

type QuestionModalProps = {
  isOpen: boolean
  updateExtraAnswerers: (extraAnswerers: ExtraAnswerers) => void
  themeTitle: string
  points: number
  questionText: string
  questionTime?: number
  answerText?: string
  onAnswerSubmit: (timeAnswered: number, isCorrect: boolean | null) => void
  users: User[]
  currentUser: User['id']
}

export type ExtraAnswerers = Record<User['id'], [number, boolean | null]>

const QuestionModal: Component<QuestionModalProps> = (props) => {
  let countdown: Interval | undefined = undefined
  const [isCorrect, setIsCorrect] = createSignal<boolean | null>(null)
  const stopPropagation = (e: MouseEvent) => {
    e.stopPropagation()
  }

  const [overlayText, setOverlayText] = createSignal('')
  const [questionTime, setQuestionTime] = createSignal(props.questionTime || 180)
  const [extraAnswerers, setExtraAnswerers] = createSignal<ExtraAnswerers>({})
  const [isAnswerRevealed, setIsAnswerRevealed] = createSignal(false)

  const answerQueue = () => {
    return props.users.filter((user) => user.id !== props.currentUser)
  }

  const cleanup = () => {
    setOverlayText('')
    setQuestionTime(props.questionTime || 180)
    setExtraAnswerers({})
    setIsCorrect(null)
    clearCountdown()
  }

  const clearCountdown = () => {
    clearInterval(countdown)
    countdown = undefined
  }

  const startCountdown = () => {
    countdown = setInterval(() => {
      setQuestionTime((prev) => {
        if (prev - 1 <= 0) {
          clearCountdown()
          return 0
        }

        return prev - 1
      })
    }, 1000)
  }

  createEffect(
    // this make sure it only runs when props.isOpen changes
    // Not any other dependency
    // Plain createEffect in this case will rerun on `answerQueue()` change
    on(
      () => props.isOpen,
      (isOpen) => {
        if (!isOpen) {
          cleanup()
        } else {
          startCountdown()
          const extraAnswerers = answerQueue().reduce((acc, user) => {
            acc[user.id] = [1, null]
            return acc
          }, {} as ExtraAnswerers)

          setExtraAnswerers(extraAnswerers)
        }
      }
    )
  )

  const formatTime = (seconds: number) => {
    const duration = Duration.fromObject({ seconds })
    return duration.toFormat('m:ss')
  }

  const handleExtraAnswer = (user: User, isCorrect: boolean) => {
    setExtraAnswerers((prev) => {
      const newExtraAnswerers = { ...prev }
      newExtraAnswerers[user.id] = [newExtraAnswerers[user.id]?.[0], isCorrect]
      return newExtraAnswerers
    })
  }

  const handleAnswerSubmit = (isCorrect: boolean) => {
    setIsCorrect(isCorrect)
    setOverlayText(getQuizResponse(isCorrect))
    clearCountdown()
  }

  const handleOverlayClick = () => {
    const extraAnswerersValues = Object.values(extraAnswerers())

    const mainUserAnswered = isCorrect() !== null
    const extraAnswerersExists = extraAnswerersValues.length > 0
    const extraAnswering = extraAnswerersExists && !!extraAnswerersValues.some(([_, isCorrect]) => isCorrect === null)
    const extraAnswered = extraAnswerersExists && !!extraAnswerersValues.every(([_, isCorrect]) => isCorrect !== null)
    // No1 has answered yet just close the modal
    if (!mainUserAnswered && !extraAnswering && !extraAnswered) {
      props.onAnswerSubmit(0, null)
      cleanup()
      return
    }

    // User already answered and waiting for extra answerers -> clicking on overlay with text
    if (mainUserAnswered && extraAnswering) {
      setOverlayText('')
      return
    }

    // Everyone answered
    // Fallback to 1 bc could be some quick clicking
    const timeAnswered = (props.questionTime || 180) - questionTime() || 1
    if (mainUserAnswered && extraAnswered) {
      props.updateExtraAnswerers(extraAnswerers())
      props.onAnswerSubmit(timeAnswered, !!isCorrect())
      return
    }

    // User answered and no1 wants to answer anymore
    if (mainUserAnswered && !extraAnswerersExists) {
      props.onAnswerSubmit(timeAnswered, !!isCorrect())
      return
    }

    // Extra answerers answered but main user hasnt yet
    return
  }

  const isTimeOver = createMemo(() => {
    return questionTime() === 0 && isCorrect() === null
  })

  const onExtraSelect = (user: User) => {
    setExtraAnswerers((prev) => {
      const newExtraAnswerers = { ...prev }
      if (newExtraAnswerers[user.id]) {
        delete newExtraAnswerers[user.id]

        for (const id in newExtraAnswerers) {
          const userIndex = newExtraAnswerers[id][0]
          newExtraAnswerers[id] = userIndex - 1 == 0 ? [1, null] : [userIndex - 1, null]
        }

        return newExtraAnswerers
      }

      newExtraAnswerers[user.id] = [Object.keys(prev).length + 1, null]
      return newExtraAnswerers
    })
  }

  const onAnswerReveal = () => {
    setIsAnswerRevealed((prev) => !prev)
  }

  return (
    <Show when={props.isOpen}>
      <div
        class="fixed inset-0 z-[51] flex items-center justify-center backdrop-blur-sm transition-all duration-300 max-w-[90%] mx-auto lg:max-w-none lg:mx-0"
        onClick={handleOverlayClick}
        aria-modal="true"
        role="dialog"
        classList={{
          'bg-void/80!': (isCorrect() === null || overlayText() !== '') && !isTimeOver(),
          'bg-red-600/10!': isTimeOver() || (isCorrect() === false && overlayText() === ''),
          'bg-green-600/10!': isCorrect() === true && overlayText() === '' && !isTimeOver(),
        }}
      >
        <Show when={!overlayText()}>
          <div class="flex flex-col min-w-[90%] sm:min-w-[500px] items-center">
            <div
              data-open={props.isOpen ? '' : null}
              class="relative z-50 m-4 flex w-full max-w-lg scale-95 flex-col overflow-hidden rounded-md border border-primary/50 bg-void p-6 shadow-[0_0_25px_rgba(226,254,116,0.2)] transition-all duration-300 ease-out opacity-0 data-[open]:scale-100 data-[open]:opacity-100"
              classList={{
                'border-red-600/50': isTimeOver() || isCorrect() === false,
                'border-green-600/50': isCorrect() === true,
              }}
              onClick={stopPropagation}
            >
              <div class="mb-5 flex items-center sm:items-start justify-between gap-4">
                {' '}
                <h2 class="flex items-center text-sm sm:text-xl font-bold text-primary">
                  <TbTag class="mr-2 h-5 w-5 flex-shrink-0" />
                  <span>{props.themeTitle}</span>
                </h2>
                <div class="flex gap-4 items-center">
                  <span
                    class="text-white/50 text-sm sm:text-normal"
                    classList={{
                      'text-green-600/50!': questionTime() >= 100,
                      'text-yellow-600/50!': questionTime() < 100 && questionTime() >= 40,
                      'text-red-600/50!': questionTime() < 40,
                      'animate-pulse': questionTime() <= 10,
                    }}
                  >
                    {formatTime(questionTime())}
                  </span>

                  <span
                    class="mt-1 inline-flex flex-shrink-0 items-center rounded-full bg-[var(--color-primary)] px-2 py-0.5 sm:px-3 sm:py-0.5 text-xs sm:text-sm font-semibold text-[var(--text-on-primary)] transition-colors duration-200"
                    classList={{ 'bg-red-600/50 text-white': isTimeOver() || isCorrect() === false }}
                  >
                    <TbAward class="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    {isTimeOver() || isCorrect() === false ? `- ${props.points}` : props.points}pts
                  </span>
                </div>
              </div>

              <div class="mb-6">
                <p class="text-lg leading-relaxed text-white text-center transition-all duration-300 ease-in-out ">
                  {props.questionText || 'Read the question'}
                </p>
                <p
                  class="text-base text-gray-500 leading-relaxed text-center opacity-0 transition-all duration-300 ease-in-out"
                  classList={{ 'opacity-100 animate-slide-down': isAnswerRevealed() }}
                >
                  {props.answerText || 'Read the answer'}
                </p>
              </div>
              <div class="flex justify-between">
                <button
                  class="text-base cursor-pointer text-gray-500 hover:text-gray-500/70 transition-all duration-300 ease-in-out"
                  onclick={onAnswerReveal}
                >
                  {isAnswerRevealed() ? 'Hide Answer' : 'Reveal Answer'}
                </button>
                <div class="flex justify-end gap-4">
                  <button
                    onClick={() => handleAnswerSubmit(false)}
                    class="hover:cursor-pointer inline-flex items-center justify-center rounded-md bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-[var(--text-on-accent)] transition-colors duration-200 ease-in-out hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-void)]"
                  >
                    <TbX class="mr-1.5 h-5 w-5" />
                    <span>Wrong</span>
                  </button>
                  <button
                    onClick={() => handleAnswerSubmit(true)}
                    class="hover:cursor-pointer inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-[var(--text-on-primary)] transition-colors duration-200 ease-in-out hover:bg-lime-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-void)]"
                  >
                    <TbCheck class="mr-1.5 h-5 w-5" />
                    <span>Correct</span>
                  </button>
                </div>
              </div>
            </div>
            <p class="text-lg font-bold text-primary">Answer Queue</p>
            <div class="flex gap-6 w-full flex-wrap p-4 bg-void/50 backdrop-blur-sm mt-2 min-w-[90%] sm:min-w-[500px] rounded-md border border-primary/50 ">
              <For each={answerQueue()}>
                {(user) => {
                  const data = createMemo(() => extraAnswerers()?.[user.id])
                  return (
                    <div class="flex flex-col items-center gap-2 flex-wrap hover:cursor-pointer transition-all duration-300 ease-in-out">
                      <div
                        class="text-sm sm:text-xl font-bold text-primary flex items-center justify-around gap-2 hover:text-primary/50 transition-all duration-300 ease-in-out"
                        onclick={(e) => {
                          e.stopPropagation()
                          onExtraSelect(user)
                        }}
                      >
                        <span
                          class="opacity-0"
                          classList={{
                            'opacity-0': !data,
                            'animate-slide-down': !!data,
                          }}
                        >
                          {data()?.[0]}
                        </span>
                        <span
                          classList={{
                            'text-green-600/50': data()?.[1] == true,
                            'text-red-600/50': data()?.[1] == false,
                          }}
                        >
                          {user.name}
                        </span>
                      </div>
                      <div
                        class="items-center gap-2 opacity-0 mr-2"
                        classList={{
                          hidden: !data(),
                          'animate-slide-down flex visible!': !!data(),
                        }}
                      >
                        <TbX
                          class="h-5 w-5 text-accent hover:text-accent/50 transition-all duration-300 ease-in-out hover:cursor-pointer"
                          onclick={(e) => {
                            e.stopPropagation()
                            handleExtraAnswer(user, false)
                          }}
                        />
                        <TbCheck
                          class="h-5 w-5 text-primary hover:text-primary/50 transition-all duration-300 ease-in-out hover:cursor-pointer"
                          onclick={(e) => {
                            e.stopPropagation()
                            handleExtraAnswer(user, true)
                          }}
                        />
                      </div>
                    </div>
                  )
                }}
              </For>
            </div>
            <div class="flex flex-col justify-center items-center gap-1 mt-2">
              <span class="text-sm font-bold text-white/50">Tip:</span>
              <p class="text-sm font-bold text-white/50">
                If only current user wants to answer the question, please deselect users from the queue by clicking on
                them.
              </p>
              <p class="text-sm font-bold text-white/50">
                When other users want to answer, select them in order and then choose if they answered correctly.{' '}
              </p>
              <p class="text-sm font-bold text-white/50">
                When everyone has answered click outiside of a window to submit your answer.
              </p>
            </div>
          </div>
        </Show>
        <Show when={overlayText()}>
          <div class="absolute inset-0 flex items-center justify-center z-50">
            <div
              class="bg-gradient-to-br from-blue-600 to-cyan-400 bg-clip-text text-transparent text-4xl font-bold p-2 text-center"
              classList={{
                'bg-gradient-to-br from-green-800 to-green-200': !!isCorrect(),
                'bg-gradient-to-br from-red-800 to-red-200': !isCorrect(),
              }}
            >
              {overlayText()}
            </div>
          </div>
        </Show>
      </div>
    </Show>
  )
}

export default QuestionModal
