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

const isFullGame = (item: Game | GameListItem): item is Game => {
  return 'users' in item && 'rounds' in item
}

const GameCard = (props: Game | GameListItem) => {
  return (
    <div class="flex flex-col gap-2 bg-gray-600/90 rounded-lg shadow-md p-2">
      <div class="flex gap-2 items-center justify-between">
        <span class="text-xl font-bold">{props.name}</span>
        <Show when={props.isPublic === false}>
          <RiDevelopmentGitRepositoryPrivateFill class="text-primary w-6 h-6" title="Private Game" />
        </Show>
      </div>
      <span class="text-sm text-gray-400">{props.description}</span>

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
  )
}

const MyGames = () => {
  const { user } = useAuth()
  const { post } = useApi('game_templates/create_template')
  const { get } = useApi(`game_templates/user/${user()?.id}`)

  const [isCreatingNewGameTemplate, setIsCreatingNewGameTemplate] = createSignal(false)
  const [newGameTemplate, setNewGameTemplate] = createSignal<Game>()

  const [games, { mutate: setGames }] = createResource(async () => {
    return [mockGame, mockGame]
  })

  const [gameTemplates] = createResource(async () => {
    const response = await get<GameListItem[]>()
    if (response.data) {
      return response.data
    }

    return [mockGame]
  })

  const createGameTemplate = async () => {
    if (!newGameTemplate()) return

    const template = { ...newGameTemplate()!, creatorId: user()?.id! }

    const response = await post<Game>(template)

    if (response.data) {
      setGames((prev) => (prev ? [template, ...prev] : [template]))
    }
  }

  const onFinishCreateGameTemplate = async () => {
    setIsCreatingNewGameTemplate(false)
    await createGameTemplate()
  }

  const onToggleCreateNewGameTemplate = async () => {
    setIsCreatingNewGameTemplate(!isCreatingNewGameTemplate())
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
        <div class={`${widgetStyles.base} mt-12 md:w-[30%] mx-auto p-4`}>
          <span class="text-3xl font-bold text-center mb-4">Current Game</span>
          <div class="w-full flex justify-center items-center [&>*:first-child]:p-4">
            <GameCard {...mockGame} />
          </div>
        </div>
        <div class={`${widgetStyles.base} mt-12 w-full`}>
          <div class="flex justify-between items-center mb-4">
            <span class="text-2xl font-bold ">Created</span>
            <button
              class="bg-accent text-white hover:bg-accent/80 transition-all duration-300 hover:cursor-pointer px-2 py-1 rounded-md"
              onClick={onToggleCreateNewGameTemplate}
              classList={{ 'bg-red-600/70 hover:bg-red-600/50': isCreatingNewGameTemplate() }}
            >
              {isCreatingNewGameTemplate() ? 'Cancel Creating' : 'Create New Template'}
            </button>
          </div>
          <div class="flex flex-wrap gap-6 items-center overflow-y-auto">
            <For each={gameTemplates()}>{(game) => <GameCard {...game} />}</For>
          </div>
        </div>
        <div class={`${widgetStyles.base} mt-12 w-full`}>
          <span class="text-2xl font-bold mb-4">History</span>
          <div class="flex flex-wrap gap-6 items-center overflow-y-auto">
            <For each={games()}>{(game) => <GameCard {...game} />}</For>
          </div>
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
      </div>
    </>
  )
}

export default MyGames
