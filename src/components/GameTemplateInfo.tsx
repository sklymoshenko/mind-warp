import { createResource, createSignal, For } from 'solid-js'
import { useApi } from '../hooks/useApi'
import { GameTemplate, Round, User } from '../types'
import Accordion from './Accordion'

import { TbZoomQuestion } from 'solid-icons/tb'
import { BiRegularShowAlt } from 'solid-icons/bi'
import SearchComponent from './Search'

type GameTemplateInfoProps = {
  id?: GameTemplate['id']
}

type AccordionTitleProps = {
  round: Round
  onShowQuestions: (isShown: boolean) => void
  onShowAnswers: (isShown: boolean) => void
  showQuestions: boolean
  showAnswers: boolean
}

const AccordionTitle = (props: AccordionTitleProps) => {
  return (
    <div class="w-full flex items-center gap-4">
      <p class="text-xl font-bold">{props.round.name}</p>
      <div class="flex items-center gap-2">
        <button
          title={props.showQuestions ? 'Hide Questions' : 'Show Questions'}
          class="hover:cursor-pointer transition-all duration-300"
          classList={{ 'text-accent animate-pulse': props.showQuestions }}
          onClick={(e) => {
            e.stopPropagation()
            props.onShowQuestions(!props.showQuestions)
          }}
        >
          <TbZoomQuestion class="w-6 h-6" />
        </button>
        <button
          title={props.showAnswers ? 'Hide Answers' : 'Show Answers'}
          class="hover:cursor-pointer transition-all duration-300"
          classList={{ 'text-accent animate-pulse': props.showAnswers }}
          onClick={(e) => {
            e.stopPropagation()
            props.onShowAnswers(!props.showAnswers)
          }}
        >
          <BiRegularShowAlt class="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

const GameTemplateInfo = (props: GameTemplateInfoProps) => {
  const { get: getGameTemplateInfo } = useApi('game_templates/info')
  const [showAnswers, setShowAnswers] = createSignal<Record<Round['id'], boolean>>({})
  const [showQuestions, setShowQuestions] = createSignal<Record<Round['id'], boolean>>({})
  const { get: getUsersSearch } = useApi('users?search=')

  const [template, {}] = createResource(
    () => props.id,
    async (id) => {
      if (!id) {
        return undefined
      }

      const response = await getGameTemplateInfo<GameTemplate>(`/${id}`)

      if (!response.data) {
        return undefined
      }

      return response.data
    }
  )

  const themesCount = () => {
    return template()?.rounds.reduce((acc, round) => acc + round.themes.length, 0) ?? 0
  }

  const questionsCount = () => {
    return (
      template()?.rounds.reduce(
        (acc, round) => acc + round.themes.reduce((acc, theme) => acc + theme.questions.length, 0),
        0
      ) ?? 0
    )
  }

  const searchUsers = async (term: string) => {
    const response = await getUsersSearch<User[]>(`${term}`)
    return response.data ?? []
  }

  return (
    <div class="flex flex-col w-full">
      <div class="flex flex-col gap-4">
        <span class="text-bold text-5xl">{template()?.name}</span>
        <span class="text-2xl text-gray-500">{template()?.description}</span>
      </div>
      <div class="flex items-center justify-between w-full my-4">
        <span class="text-white text-xl">Rounds: {template()?.rounds.length}</span>
        <span class="text-white text-xl">Themes: {themesCount()}</span>
        <span class="text-white text-xl">Questions: {questionsCount()}</span>
      </div>
      <div class="w-full">
        <SearchComponent searchFunction={searchUsers} placeholder="Add Users" multiselect={true} />
      </div>
      <button
        class="p-2 w-full bg-primary text-void rounded-md text-xl font-bold hover:cursor-pointer hover:bg-primary/70 transition-bg duration-300"
        onclick={() => {
          console.log('Use Template')
        }}
      >
        Use Template
      </button>
      <p class="text-2xl font-bold my-4">Overview</p>
      <div class="flex flex-col gap-4">
        <For each={template()?.rounds}>
          {(round) => (
            <Accordion
              title={
                <AccordionTitle
                  round={round}
                  showQuestions={showQuestions()[round.id] ?? false}
                  showAnswers={showAnswers()[round.id] ?? false}
                  onShowQuestions={(isShown) => setShowQuestions({ ...showQuestions(), [round.id]: isShown })}
                  onShowAnswers={(isShown) => setShowAnswers({ ...showAnswers(), [round.id]: isShown })}
                />
              }
            >
              <div class="flex flex-col gap-4">
                <For each={round.themes}>
                  {(theme) => (
                    <div class="flex flex-col gap-2">
                      <p class="text-xl font-bold">{theme.name}</p>
                      <For each={theme.questions}>
                        {(question) => (
                          <div class="flex flex-col gap-2">
                            <p
                              class="text-lg text-gray-500 transition-all duration-300"
                              classList={{ 'blur-[4px]': !showQuestions()[round.id] }}
                            >
                              {question.text || 'No question text'}
                            </p>
                            <p
                              class="text-base text-gray-500 transition-all duration-300"
                              classList={{ 'blur-[4px]': !showAnswers()[round.id] }}
                            >
                              {question.answer || 'No answer'}
                            </p>
                          </div>
                        )}
                      </For>
                    </div>
                  )}
                </For>
              </div>
            </Accordion>
          )}
        </For>
      </div>
    </div>
  )
}

export default GameTemplateInfo
