import { createResource, For, Show, createSignal } from 'solid-js'
import mockGame from '../data/mockGame'
import { Game, GameListItem } from '../types'
import { DateTime } from 'luxon'
import { A } from '@solidjs/router'
import { widgetStyles } from '../utils'
import CreateGame from './CreateGame'
import { useApi } from '../hooks/useApi'
import { RiDevelopmentGitRepositoryPrivateFill } from 'solid-icons/ri'
import { useAuth } from '../context/AuthContext'
import OverlayComponent from '../components/OverlayComponent'
import { IoDice, IoGameControllerOutline, IoTrashOutline } from 'solid-icons/io'
import GameTemplateInfo from '../components/GameTemplateInfo'

const isFullGame = (item: Game | GameListItem): item is Game => {
  return 'users' in item && 'rounds' in item
}

const GameCard = (props: Game | GameListItem) => {
  return (
    <div class="flex bg-primary/15 rounded-lg shadow-md p-2 gap-4 items-start">
      <IoGameControllerOutline class="text-primary w-20 h-20" />
      <div class="flex flex-col gap-2 ">
        <div class="flex gap-2 items-center justify-between">
          <span class="text-4xl font-bold">{props.name}</span>
          <Show when={props.isPublic === false}>
            <RiDevelopmentGitRepositoryPrivateFill class="text-primary w-6 h-6" title="Private Game" />
          </Show>
        </div>
        <span class="text-xl text-gray-400">{props.description}</span>

        <Show when={isFullGame(props)}>
          <>
            <div class="flex flex-row gap-2 text-sm">
              <span class="text-gray-400">{(props as Game).users.length} players</span>
              <span class="text-gray-400">{(props as Game).rounds.length} rounds</span>
            </div>
            <Show when={(props as Game).finishDate}>
              <div class="flex flex-row gap-2 text-sm">
                {DateTime.fromMillis((props as Game).finishDate!).toLocaleString()}
              </div>
            </Show>
          </>
        </Show>
      </div>
    </div>
  )
}

type GameTemplateCardProps = {
  game: GameListItem
  onDelete?: () => void
  onClick?: () => void
}

const GameTemplateCard = (props: GameTemplateCardProps) => {
  const { del: deleteGameTemplate } = useApi(`game_templates/${props.game.id}`)

  const onDeleteGameTemplate = async () => {
    const response = await deleteGameTemplate()

    if (!response.error) {
      props.onDelete?.()
    }
  }

  return (
    <div
      class="relative flex items-center group gap-2 hover:bg-primary/10 transition-all duration-300 rounded-md p-2 hover:cursor-pointer group min-w-[150px] min-h-20 hover:min-[200px]"
      onClick={props.onClick}
    >
      <IoDice class="w-15 h-15 text-primary/50 group-hover:animate-spin" />
      <div class="flex flex-col gap-1">
        <span class="text-2xl font-bold">{props.game.name}</span>
        <span class="text-xl text-primary/50">{props.game.description}</span>
      </div>
      <button
        class="text-red-500 hover:text-red-500/50 transition-all duration-300 group-hover:animate-slide-in p-3 z-0 opacity-0 group-hover:opacity-100 hover:cursor-pointer"
        onclick={onDeleteGameTemplate}
      >
        <IoTrashOutline class="min-w-0 min-h-0 group-hover:min-w-10 group-hover:min-h-10 transition-all duration-300" />
      </button>
    </div>
  )
}

const MyGames = () => {
  const { user } = useAuth()
  const { post: createTemplate } = useApi('game_templates/create_template')
  const { post: updateTemplate } = useApi('game_templates/update')
  const { get } = useApi(`game_templates/user/${user()?.id}`)
  const { get: getGameTemplateInfo } = useApi('game_templates/info')
  const { get: getActiveGames } = useApi(`games/active/user/${user()?.id}`)
  const { get: getGamesHistory } = useApi(`games/finished/user/${user()?.id}`)

  const [isCreatingNewGameTemplate, setIsCreatingNewGameTemplate] = createSignal(false)
  const [newGameTemplate, setNewGameTemplate] = createSignal<Game>()
  const [editingGameTemplateId, setEditingGameTemplateId] = createSignal<string>()

  const [games] = createResource(async () => {
    const response = await getActiveGames<Game[]>()

    if (response.data) {
      return response.data
    }

    return []
  })

  const [gamesHistory] = createResource(async () => {
    const response = await getGamesHistory<Game[]>()

    if (response.data) {
      return response.data
    }

    return []
  })

  const [gameTemplates, { mutate: setGameTemplates }] = createResource(async () => {
    const response = await get<GameListItem[]>()
    if (response.data) {
      return response.data
    }

    return [mockGame]
  })

  const createGameTemplate = async () => {
    if (!newGameTemplate()) return

    const template = { ...newGameTemplate()!, creatorId: user()?.id! }

    const response = await createTemplate<Game>(template)

    if (!response.error) {
      setGameTemplates([...gameTemplates()!, template])
    }
  }

  const onFinishCreateGameTemplate = async () => {
    setIsCreatingNewGameTemplate(false)
    await createGameTemplate()
  }

  const onToggleCreateNewGameTemplate = async () => {
    setIsCreatingNewGameTemplate(!isCreatingNewGameTemplate())
  }

  const onTemplateDelete = async (gameId: string) => {
    setGameTemplates(gameTemplates()!.filter((game) => game.id !== gameId))
  }

  const onTemplateClick = async (gameId: string) => {
    const response = await getGameTemplateInfo<Game>(`/${gameId}`)

    if (response.data) {
      setNewGameTemplate(response.data)
      setEditingGameTemplateId(gameId)
    }
  }

  const saveNewGameTemplate = async () => {
    if (!newGameTemplate()) return

    const response = await updateTemplate<Game>(newGameTemplate()!)

    if (!response.error) {
      const updatedIndex = gameTemplates()!.findIndex((game) => game.id === newGameTemplate()!.id)
      setGameTemplates((prev) => {
        if (updatedIndex === -1) return prev
        const newGameTemplates = [...prev!]
        newGameTemplates[updatedIndex] = newGameTemplate()!
        return newGameTemplates
      })
    }

    setEditingGameTemplateId(undefined)
  }

  return (
    <>
      <div class="absolute top-4 left-4 md:top-8 md:left-8 z-[52]">
        <A
          href="/dashboard"
          class="text-primary text-sm md:text-lg font-bold uppercase tracking-wider hover:text-white transition-all duration-300 "
        >
          Back
        </A>
      </div>
      <div class="text-primary h-full flex flex-col items-start justify-start gap-4 w-full px-4 z-51 overflow-y-auto">
        <h1 class="text-4xl font-bold mx-auto">My Games</h1>
        <div class="flex flex-row gap-6 w-full">
          <div class={`${widgetStyles.base} mt-12 md:w-[20%] p-4`}>
            <span class="text-3xl font-bold text-center mb-4">Current Game</span>
            <div class="w-full flex justify-center items-center [&>*:first-child]:p-4">
              <For each={games()}>{(game) => <GameCard {...game} />}</For>
            </div>
          </div>
          <div class={`${widgetStyles.base} mt-12 w-full`}>
            <div class="flex justify-between items-center mb-4">
              <span class="text-2xl font-bold ">Created Templates</span>
              <button
                class="bg-accent text-white hover:bg-accent/80 transition-all duration-300 hover:cursor-pointer px-2 py-1 rounded-md"
                onClick={onToggleCreateNewGameTemplate}
                classList={{ 'bg-red-600/70 hover:bg-red-600/50': isCreatingNewGameTemplate() }}
              >
                {isCreatingNewGameTemplate() ? 'Cancel Creating' : 'Create New Template'}
              </button>
            </div>
            <Show
              when={gameTemplates() && gameTemplates()!.length > 0}
              fallback={<span class="text-gray-400 text-2xl text-center p-4">No Templates Created</span>}
            >
              <div class="flex flex-wrap gap-6 items-center overflow-y-auto">
                <For each={gameTemplates()}>
                  {(game) => (
                    <GameTemplateCard
                      game={game}
                      onDelete={() => onTemplateDelete(game.id)}
                      onClick={() => onTemplateClick(game.id)}
                    />
                  )}
                </For>
              </div>
            </Show>
          </div>
        </div>
        <div class={`${widgetStyles.base} mt-12 w-full`}>
          <span class="text-2xl font-bold mb-4">History</span>
          <Show
            when={gamesHistory() && gamesHistory()!.length > 0}
            fallback={<span class="text-gray-400 text-2xl text-center p-4">No Games History</span>}
          >
            <div class="flex flex-wrap gap-6 items-center overflow-y-auto">
              <For each={gamesHistory()}>{(game) => <GameTemplateCard game={game} />}</For>
            </div>
          </Show>
        </div>
        <OverlayComponent
          isOpen={isCreatingNewGameTemplate()}
          onClose={() => {
            setIsCreatingNewGameTemplate(false)
          }}
        >
          <div class="w-full">
            <CreateGame
              game={newGameTemplate()}
              onGameUpdate={setNewGameTemplate}
              isTemplate={true}
              onFinish={onFinishCreateGameTemplate}
            />
          </div>
        </OverlayComponent>
        <OverlayComponent isOpen={!!editingGameTemplateId()} onClose={() => setEditingGameTemplateId(undefined)}>
          <CreateGame
            game={newGameTemplate()}
            onGameUpdate={setNewGameTemplate}
            isTemplate={true}
            onFinish={saveNewGameTemplate}
          />
        </OverlayComponent>
      </div>
    </>
  )
}

export default MyGames
