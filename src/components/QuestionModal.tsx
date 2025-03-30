import { createSignal, Show } from 'solid-js'

type Props = {
  question: string
  onClose: () => void
}

export default function QuestionModal(props: Props) {
  const [answered, setAnswered] = createSignal(false)
  const [isCorrect, setIsCorrect] = createSignal(false)

  const handleAnswer = (correct: boolean) => {
    setIsCorrect(correct)
    setAnswered(true)

    setTimeout(() => {
      setAnswered(false)
      props.onClose()
    }, 10000) // Auto-close after 2s
  }

  return (
    <div class="fixed inset-0 bg-black backdrop-blur-sm flex items-center justify-center z-[100]">
      <div class="bg-white dark:bg-neutral-900 text-center px-10 py-8 rounded-2xl shadow-2xl w-[90%] max-w-xl relative">
        <h2 class="text-3xl font-bold mb-4 text-gray-800 dark:text-white">{props.question}</h2>

        <div class="mt-6 flex justify-center gap-6">
          <button
            onClick={() => handleAnswer(true)}
            class="bg-green-500 text-white px-6 py-2 rounded-xl text-lg hover:bg-green-600 transition"
          >
            Correct
          </button>
          <button
            onClick={() => handleAnswer(false)}
            class="bg-red-500 text-white px-6 py-2 rounded-xl text-lg hover:bg-red-600 transition"
          >
            Incorrect
          </button>
        </div>

        <Show when={answered()}>
          <div
            class={`absolute inset-0 flex items-center justify-center text-6xl font-black uppercase tracking-widest pointer-events-none 
              ${isCorrect() ? 'text-green-400 animate-pulse' : 'text-red-500 animate-bounce'}`}
          >
            {isCorrect() ? 'Correct!' : 'Wrong!'}
          </div>
        </Show>
      </div>
    </div>
  )
}
