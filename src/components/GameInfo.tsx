import { createResource, createSignal, For, Show } from 'solid-js'
import { useApi } from '../hooks/useApi'
import { Game, GameTemplate, Round, User } from '../types'
import Accordion from './Accordion'

import { TbZoomQuestion } from 'solid-icons/tb'
import { BiRegularShowAlt } from 'solid-icons/bi'
import SearchComponent from './Search'
import { useNavigate } from '@solidjs/router'
import { FiEdit } from 'solid-icons/fi'
import { createUUID } from '../pages/CreateGame'

type GameInfoProps<T extends GameTemplate | Game> = {
  id?: T['id']
  entity?: T
  user: User
  onEdit: (item: T) => void
  type: 'template' | 'game'
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

const GameInfo = <T extends GameTemplate | Game>(props: GameInfoProps<T>) => {
  const navigate = useNavigate()
  const { get: getGameTemplateInfo } = useApi('game_templates/info')
  const { get: getGameInfo } = useApi('games')
  const [showAnswers, setShowAnswers] = createSignal<Record<Round['id'], boolean>>({})
  const [showQuestions, setShowQuestions] = createSignal<Record<Round['id'], boolean>>({})
  const { get: getUsersSearch } = useApi('users?search=')
  const { post: createGame } = useApi('games/create')
  const [users, setUsers] = createSignal<User[]>(
    props.entity && 'users' in props.entity ? props.entity.users : [props.user]
  )

  const [entity] = createResource(
    () => ({ id: props.id, item: props.entity }),
    async ({ id, item }) => {
      if (item) {
        return item
      }

      if (!id) {
        return undefined
      }

      const response = await (props.type === 'template' ? getGameTemplateInfo<T>(`/${id}`) : getGameInfo<T>(`/${id}`))

      if (!response.data) {
        return undefined
      }

      return response.data
    }
  )

  const themesCount = () => {
    return entity()?.rounds.reduce((acc, round) => acc + round.themes.length, 0) ?? 0
  }

  const questionsCount = () => {
    return (
      entity()?.rounds.reduce(
        (acc, round) => acc + round.themes.reduce((acc, theme) => acc + theme.questions.length, 0),
        0
      ) ?? 0
    )
  }

  const onUserSelect = (newUsers: User[]) => {
    if (users().length > newUsers.length) {
      const isRemovedCreator = newUsers.length === 0 || newUsers.some((user) => user.id !== props.user.id)
      if (isRemovedCreator) {
        return
      }
    }

    setUsers(newUsers)
  }

  const searchUsers = async (term: string) => {
    const response = await getUsersSearch<User[]>(`${term}`)
    return response.data ?? []
  }

  const onGameCreate = async (fullEntity: T) => {
    const response = await createGame<T>(fullEntity)
    if (response.data) {
      navigate(`/games/me`)
    }
  }

  const onGameStart = async () => {
    navigate(`/games/me`)
  }

  const updateEntityId = (entity: T) => {
    const fullEntity = {
      ...entity!,
      creatorId: props.user.id,
      users: users(),
      templateId: entity.id,
    }

    const updatedEntity = {
      ...fullEntity,
      id: createUUID(),
      rounds: entity.rounds.map((round) => ({
        ...round,
        id: createUUID(),
        themes: round.themes.map((theme) => ({
          ...theme,
          id: createUUID(),
          questions: theme.questions.map((question) => ({
            ...question,
            id: createUUID(),
          })),
        })),
      })),
    }
    return updatedEntity
  }

  const onMainButtonClick = async () => {
    if (!entity()) {
      return
    }

    const updatedEntity = updateEntityId(entity()!)

    if (props.type === 'template') {
      onGameCreate(updatedEntity)
    } else {
      onGameStart()
    }
  }

  const handleEdit = () => {
    if (!entity()) {
      return
    }

    const fullEntity: T = {
      ...entity()!,
      creatorId: props.user.id,
      users: users(),
      templateId: entity()!.id,
    }

    props.onEdit(fullEntity)
  }

  const mainButtonText = () => {
    if (users().length <= 1) {
      return 'First add some company'
    }

    if (props.type === 'template') {
      return 'Send Invites and Create Game'
    }

    return 'Start Game'
  }

  return (
    <div class="flex flex-col w-full">
      <div class="flex flex-col gap-4">
        <div class="flex items-center w-full justify-between">
          <span class="text-bold text-5xl">{entity()?.name}</span>
          <Show when={props.type === 'template'}>
            <button
              class="text-primary text-xl font-bold hover:cursor-pointer hover:text-accent transition-all duration-300"
              onClick={handleEdit}
            >
              <FiEdit class="w-7 h-7" />
            </button>
          </Show>
        </div>
        <span class="text-2xl text-gray-500">{entity()?.description}</span>
      </div>
      <div class="flex items-center justify-between w-full my-4">
        <span class="text-white text-xl">Rounds: {entity()?.rounds.length}</span>
        <span class="text-white text-xl">Themes: {themesCount()}</span>
        <span class="text-white text-xl">Questions: {questionsCount()}</span>
        <span class="text-white text-xl">Participants: {users().length}</span>
      </div>
      <div class="w-full">
        <SearchComponent
          searchFunction={searchUsers}
          placeholder="Add Users"
          multiselect={true}
          selectedItems={users()}
          onSelect={onUserSelect}
          defaultSelected={users()}
        />
      </div>
      <button
        class="p-2 w-full bg-primary text-void rounded-md text-xl font-bold hover:cursor-pointer hover:bg-primary/70 transition-bg duration-300"
        disabled={!entity() || users().length < 2}
        classList={{ 'opacity-50 hover:cursor-not-allowed!': !entity() || users().length < 2 }}
        onclick={onMainButtonClick}
      >
        {mainButtonText()}
      </button>
      <p class="text-2xl font-bold my-4">Overview</p>
      <div class="flex flex-col gap-4">
        <For each={entity()?.rounds}>
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

export default GameInfo
