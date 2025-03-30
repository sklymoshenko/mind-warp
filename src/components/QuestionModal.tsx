// src/components/QuestionModal.tsx
import { Component, Show, JSX, createSignal, on, onCleanup } from 'solid-js'
// Import desired icons from solid-icons (using Tabler Icons set 'tb' as an example)
import { TbTag, TbAward, TbCheck, TbX } from 'solid-icons/tb'
import { getQuizResponse } from '../data/utils'

interface QuestionModalProps {
  isOpen: boolean
  onClose: () => void
  themeTitle: string
  points: number
  questionText: string
  onCorrect: () => void
  onWrong: () => void
}

const QuestionModal: Component<QuestionModalProps> = (props) => {
  const [isCorrect, setIsCorrect] = createSignal<boolean | null>(null)
  const stopPropagation = (e: MouseEvent) => {
    e.stopPropagation()
  }

  const [timeOut, setTimeOut] = createSignal<number>()
  const [overlayText, setOverlayText] = createSignal('')

  onCleanup(() => {
    if (timeOut()) {
      clearTimeout(timeOut())
    }
    setOverlayText('')
  })

  const handleAnswerSubmit = (isCorrect: boolean) => {
    setIsCorrect(isCorrect)
    setOverlayText(getQuizResponse(isCorrect))

    const timeoutId = setTimeout(() => {
      setOverlayText('')
      isCorrect ? props.onCorrect() : props.onWrong()
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

    isCorrect() ? props.onCorrect() : props.onWrong()
    setOverlayText('')
  }

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
            onClick={stopPropagation}
          >
            <div class="mb-5 flex items-start justify-between gap-4">
              {' '}
              <h2 class="flex items-center text-xl font-bold text-[var(--color-primary)]">
                <TbTag class="mr-2 h-5 w-5 flex-shrink-0" />
                <span>{props.themeTitle}</span>
              </h2>
              <span class="mt-1 inline-flex flex-shrink-0 items-center rounded-full bg-[var(--color-primary)] px-3 py-0.5 text-sm font-semibold text-[var(--text-on-primary)]">
                <TbAward class="mr-1 h-4 w-4" />
                {props.points} pts
              </span>
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
