import { createEffect, createMemo, createSignal, For } from 'solid-js'
import { Game, Question, Round, Theme, User } from '../types'
import { TbConfetti } from 'solid-icons/tb'
import { A } from '@solidjs/router'
import QuestionModal, { ExtraAnswerers } from '../components/QuestionModal'
import Popover from '../components/Popover'
import AnsweredPopover, { QuestionPopover } from '../components/AnsweredPopover'

type Props = {
  round: Round
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
    const allQuestions = props.round.themes.flatMap((theme) => theme.questions)
    return allQuestions.find((question) => question.id === props.currentQuestion)!
  }

  const scores = () => {
    return props.users.reduce(
      (acc, curr) => {
        acc[curr.id] = curr.roundScore[props.round.id] || 0
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

      props.updateForExtraAnswerer(activeQuestion(), isCorrect, userId)
    }
  }

  const handleAnswerSubmit = (timeAnswered: number, isCorrect: boolean | null) => {
    if (isCorrect === null) {
      setIsModalOpen(false)
      return
    }

    const question = activeQuestion()
    question.timeAnswered = timeAnswered

    props.onQuestionAnswered(activeQuestion(), isCorrect, props.currentUser)
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
    if (q.timeAnswered) {
      if (questionPopover()?.id !== q.id) {
        setQuestionPopover(undefined)
      }

      if (questionPopover()?.id === q.id) {
        setQuestionPopover(undefined)
        return
      }

      if (answeredQuestionsMap()[q.id]) {
        setQuestionPopover(answeredQuestionsMap()[q.id])
        return
      }

      const answeredByUser = answeredBy()
      const qPopover: QuestionPopover = {
        id: q.id,
        time: q.timeAnswered,
        isCorrect: q.isCorrect,
        user: answeredByUser.name,
      }

      if (answeredByUser) {
        setAnsweredQuestionsMap((prev) => ({
          ...prev,
          [q.id]: qPopover,
        }))

        setQuestionPopover(qPopover)
      }

      return
    }

    props.onQuestionSelect(q.id)
    setActiveTheme(t)

    setIsModalOpen(true)
  }

  createEffect(() => {
    console.log(props.round)
  })

  return (
    <>
      <QuestionModal
        isOpen={isModalOpen()}
        updateExtraAnswerers={updateExtraAnswerers}
        themeTitle={activeTheme()?.name || 'Theme'}
        points={activeQuestion()?.points || 0}
        questionTime={props.round.time.id}
        questionText={activeQuestion()?.text || ''}
        onAnswerSubmit={handleAnswerSubmit}
        users={props.users}
        currentUser={props.currentUser}
      />
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
      <div class="flex flex-col justify-between lg:h-[60%] xl:h-[90%] 2xl:h-[70%] z-50">
        <div class="flex flex-col items-center text-primary mx-auto">
          <h1 class="text-5xl font-bold mb-20">{props.round.name} </h1>
          <div class="flex justify-center gap-4">
            <For each={props.round.themes}>
              {(theme) => {
                return (
                  <div class="flex flex-col items-center font-semibold min-w-[200px] group">
                    <span class="lg:text-3xl xl:text-4xl mb-2 group-hover:text-green-600 group-hover:scale-120 transition-all duration-300">
                      {theme.name}
                    </span>
                    <div class="flex flex-col lg:text-5xl xl:text-7xl gap-2">
                      <For each={theme.questions}>
                        {(question) => {
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
                                  'click-green': question.isCorrect === true,
                                  'click-red': question.isCorrect === false,
                                  'hover-rank': question.isCorrect === null,
                                }}
                              >
                                <span
                                  classList={{
                                    'line-cross bg-red-600': question.isCorrect === false,
                                    'line-cross bg-green-600': question.isCorrect === true,
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
        <div class="flex justify-between p-2 gap-12 lg:mt-10 xl:mt-0">
          <For each={props.users}>
            {(user) => {
              return (
                <div class="flex flex-col items-center justify-between gap-4">
                  <div class="text-3xl font-bold text-primary flex items-center gap-2">
                    <span classList={{ 'turn-indicator animate-pulse': user.id === props.currentUser }}>
                      {user.name}
                    </span>{' '}
                    {winningUser() === user.id && <TbConfetti class="text-orange-300" />}
                  </div>
                  <span
                    class="text-2xl text-gray-500 ml-2 mb-0.5"
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
