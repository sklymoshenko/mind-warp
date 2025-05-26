import { createResource, createSignal, For, Show } from 'solid-js'
import { useApi } from '../hooks/useApi'
import { Game, GameTemplate, UnconfirmedUser, Round, User } from '../types'
import Accordion from './Accordion'

import { TbZoomQuestion } from 'solid-icons/tb'
import { BiRegularShowAlt } from 'solid-icons/bi'
import SearchComponent, { SearchItem } from './Search'
import { useNavigate } from '@solidjs/router'
import { FiEdit } from 'solid-icons/fi'
import { createUUID } from '../pages/CreateGame'
import { Confirm } from './Confirm'

type GameInfoProps<T extends GameTemplate | Game> = {
  id?: T['id']
  entity?: T
  user: User
  nonEditable?: boolean
  onEdit?: (item: T) => void
  type: 'template' | 'game'
  onFinish?: (entity: T) => void
  onRemove?: (entity: T) => void
  disableSearch?: boolean
  onStart?: (entity: T) => void
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
  const [unconfirmedUsers] = createSignal<UnconfirmedUser[]>(
    props.entity && 'unconfirmedUsers' in props.entity ? (props.entity.unconfirmedUsers ?? []) : []
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

  const invitesCount = () => {
    return unconfirmedUsers().reduce(
      (acc, user) => {
        if (user.status === 'pending') {
          acc.pending++
        } else if (user.status === 'declined') {
          acc.declined++
        }

        return acc
      },
      { pending: 0, declined: 0 }
    )
  }

  const onUserSelect = (newUsers: SearchItem[]) => {
    if (users().length > newUsers.length) {
      const isRemovedCreator = newUsers.length === 0 || newUsers.some((user) => user.id !== props.user.id)
      if (isRemovedCreator) {
        return
      }
    }

    setUsers(
      newUsers.map((user) => ({
        id: user.id as string,
        name: user.name as string,
        isAdmin: false,
        roundScore: {} as User['roundScore'],
      }))
    )
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
    props.onStart?.(entity()!)
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

    props.onEdit?.(fullEntity)
  }

  const mainButtonText = () => {
    if (props.type === 'template') {
      return 'Send Invites and Create Game'
    }

    if (invitesCount().pending > 0 && props.type === 'game') {
      return 'Waiting for Invites'
    }

    return 'Start Game'
  }

  const onGameFinish = () => {
    props.onFinish?.(entity()!)
  }

  const onGameRemove = () => {
    props.onRemove?.(entity()!)
  }

  const userSelectedItems = (): SearchItem[] => {
    let items = users().map((user) => ({
      id: user.id,
      name: user.name,
      isRemovable: props.user.id !== user.id,
    }))

    items.push(
      ...unconfirmedUsers().map((user) => ({
        id: user.id,
        name: user.name,
        class: user.status === 'pending' ? 'bg-accent/50! text-primary!' : 'bg-red-500/50! text-red-500!',
        isRemovable: true,
      }))
    )

    return items
  }

  return (
    <div class="flex flex-col w-full">
      <div class="flex flex-col gap-4">
        <div class="flex items-center w-full justify-between">
          <span class="text-bold text-5xl">{entity()?.name}</span>
          <Show when={props.type === 'template' && !props.nonEditable}>
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
      <div class="flex items-center gap-6 w-full my-4">
        <span class="text-white text-xl">Rounds: {entity()?.rounds.length}</span>
        <span class="text-white text-xl">Themes: {themesCount()}</span>
        <span class="text-white text-xl">Questions: {questionsCount()}</span>
        <span class="text-white text-xl">Participants: {users().length}</span>
      </div>
      <Show when={props.type === 'game' && unconfirmedUsers().length > 0}>
        <div class="flex items-center w-full my-4 gap-4">
          <span class="text-white text-xl">Pending Invites: {invitesCount().pending}</span>
          <span class="text-white text-xl">Declined: {invitesCount().declined}</span>
        </div>
      </Show>
      <div class="w-full">
        <SearchComponent<SearchItem>
          searchFunction={searchUsers}
          placeholder="Add Users"
          multiselect={true}
          selectedItems={userSelectedItems()}
          onSelect={onUserSelect}
          defaultSelected={userSelectedItems()}
          disabled={props.nonEditable || props.disableSearch}
        />
      </div>
      <Show when={!props.nonEditable}>
        <button
          class="p-2 w-full bg-primary text-void rounded-md text-xl font-bold hover:cursor-pointer hover:bg-primary/70 transition-bg duration-300"
          disabled={!entity() || users().length < 2 || invitesCount().pending > 0}
          classList={{
            'opacity-50 hover:cursor-not-allowed!': !entity() || users().length < 2 || invitesCount().pending > 0,
          }}
          onclick={onMainButtonClick}
        >
          {mainButtonText()}
        </button>
      </Show>
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
        <Show when={props.type === 'game'}>
          <div class="flex gap-2">
            <Show when={!props.nonEditable}>
              <Confirm
                title="Finish Game"
                message="Are you sure you want to finish this game?"
                onConfirm={() => onGameFinish()}
              >
                <button class="p-2 w-full text-primary rounded-md text-xl font-bold hover:cursor-pointer hover:text-primary/70 hover:bg-primary/10 transition-colors duration-300">
                  Finish Game
                </button>
              </Confirm>
              <Confirm
                title="Remove Game"
                message="Are you sure you want to remove this game?"
                onConfirm={() => onGameRemove()}
              >
                <button class="p-2 w-full text-red-500 rounded-md text-xl font-bold hover:cursor-pointer hover:text-red-500/70 hover:bg-red-500/10 transition-colors duration-300">
                  Remove Game
                </button>
              </Confirm>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  )
}

export default GameInfo
