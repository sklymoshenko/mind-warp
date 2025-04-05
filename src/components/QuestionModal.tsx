// src/components/QuestionModal.tsx
import { Component, Show, createSignal, onCleanup, createEffect, createMemo } from 'solid-js'
// Import desired icons from solid-icons (using Tabler Icons set 'tb' as an example)
import { TbTag, TbAward, TbCheck, TbX } from 'solid-icons/tb'
import { getQuizResponse } from '../data/utils'
import { Duration } from 'luxon'
interface QuestionModalProps {
  isOpen: boolean
  onClose: () => void
  themeTitle: string
  points: number
  questionText: string
  questionTime?: number
  onCorrect: (timeAnswered: number) => void
  onWrong: (timeAnswered: number) => void
}

const QuestionModal: Component<QuestionModalProps> = (props) => {
  const [isCorrect, setIsCorrect] = createSignal<boolean | null>(null)
  const stopPropagation = (e: MouseEvent) => {
    e.stopPropagation()
  }

  const [timeOut, setTimeOut] = createSignal<number>()
  const [timer, setTimer] = createSignal<number>()
  const [overlayText, setOverlayText] = createSignal('')
  const [questionTime, setQuestionTime] = createSignal(props.questionTime || 180)

  const cleanup = () => {
    if (timeOut()) {
      clearTimeout(timeOut())
    }
    setOverlayText('')
    clearInterval(timer())
    setTimer(undefined)
    setQuestionTime(props.questionTime || 180)
  }
  onCleanup(() => {
    cleanup()
  })

  createEffect(() => {
    if (!props.isOpen) {
      cleanup()
    } else {
      startTimer()
    }
  }, [props.isOpen])

  const startTimer = () => {
    const timer = setInterval(() => {
      setQuestionTime((prev) => {
        if (prev <= 0) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    setTimer(timer)
  }

  createEffect(() => {
    console.log(questionTime())
  })

  const formatTime = (seconds: number) => {
    const duration = Duration.fromObject({ seconds })
    return duration.toFormat('m:ss')
  }

  const handleAnswerSubmit = (isCorrect: boolean) => {
    setIsCorrect(isCorrect)
    setOverlayText(getQuizResponse(isCorrect))

    const timeoutId = setTimeout(() => {
      setOverlayText('')
      const timeAnswered = (props.questionTime || 180) - questionTime()
      isCorrect ? props.onCorrect(timeAnswered) : props.onWrong(timeAnswered)
    }, 5000)

    setTimeOut(timeoutId)
  }

  const handleOverlayClick = () => {
    if (!overlayText()) {
      props.onClose()
      return
    }

    if (timeOut()) {
      clearTimeout(timeOut())
    }

    const timeAnswered = (props.questionTime || 180) - questionTime()
    isCorrect() ? props.onCorrect(timeAnswered) : props.onWrong(timeAnswered)
    setOverlayText('')
  }

  const isTimeOver = createMemo(() => {
    return questionTime() === 0
  })

  return (
    <Show when={props.isOpen}>
      <div
        class="fixed inset-0 z-[51] flex items-center justify-center bg-[var(--color-void)]/80 backdrop-blur-sm transition-opacity duration-300 ease-out slide-in"
        onClick={handleOverlayClick}
        aria-modal="true"
        role="dialog"
      >
        <Show when={!overlayText()}>
          <div
            data-open={props.isOpen ? '' : null}
            // Combined styles for the container, added padding `p-6`
            class="relative z-50 m-4 flex w-full max-w-lg scale-95 flex-col overflow-hidden rounded-md border border-[var(--color-primary)]/50 bg-[var(--color-void)] p-6 shadow-[0_0_25px_rgba(226,254,116,0.2)] transition-all duration-300 ease-out opacity-0 data-[open]:scale-100 data-[open]:opacity-100"
            classList={{ 'border-red-600/50': isTimeOver() }}
            onClick={stopPropagation}
          >
            <div class="mb-5 flex items-start justify-between gap-4">
              {' '}
              <h2 class="flex items-center text-xl font-bold text-[var(--color-primary)]">
                <TbTag class="mr-2 h-5 w-5 flex-shrink-0" />
                <span>{props.themeTitle}</span>
              </h2>
              <div class="flex gap-4 items-center">
                <span
                  class="text-white/50"
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
                  class="mt-1 inline-flex flex-shrink-0 items-center rounded-full bg-[var(--color-primary)] px-3 py-0.5 text-sm font-semibold text-[var(--text-on-primary)] transition-colors duration-200"
                  classList={{ 'bg-red-600/50 text-white': isTimeOver() }}
                >
                  <TbAward class="mr-1 h-4 w-4" />
                  {isTimeOver() ? `- ${props.points}` : props.points}pts
                </span>
              </div>
            </div>

            <div class="mb-6">
              {' '}
              <p class="text-lg leading-relaxed text-[var(--color-white)]">{props.questionText}</p>
            </div>

            <div class="flex justify-end gap-4">
              {' '}
              <button
                onClick={() => handleAnswerSubmit(false)}
                class="inline-flex items-center justify-center rounded-md bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-[var(--text-on-accent)] transition-colors duration-200 ease-in-out hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-void)]"
              >
                <TbX class="mr-1.5 h-5 w-5" />
                <span>Wrong</span>
              </button>
              <button
                onClick={() => handleAnswerSubmit(true)}
                class="inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-[var(--text-on-primary)] transition-colors duration-200 ease-in-out hover:bg-lime-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-void)]"
              >
                <TbCheck class="mr-1.5 h-5 w-5" />
                <span>Correct</span>
              </button>
            </div>
          </div>
        </Show>
        <Show when={overlayText()}>
          <div class="absolute inset-0 flex items-center justify-center z-50">
            <div
              class="bg-gradient-to-br from-blue-600 to-cyan-400 bg-clip-text text-transparent text-4xl font-bold p-2"
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
