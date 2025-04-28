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

// Type guard to check if the props object is a full Game object
const isFullGame = (item: Game | GameListItem): item is Game => {
  // Check for properties that exist on Game but not on GameListItem
  return 'users' in item && 'rounds' in item
}

const GameCard = (props: Game | GameListItem) => {
  return (
    <div class="flex flex-col gap-2 bg-void/70 rounded-lg shadow-md">
      {/* Common properties */}
      <div class="flex gap-2 items-center justify-between">
        <span class="text-xl font-bold">{props.name}</span>
        {/* isPublic exists on both types (optional on Game, required on GameListItem) */}
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
          {/* finishDate is optional on Game */}
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
        <div class="flex gap-4 justify-between w-full max-h-[50%]">
          <div class={widgetStyles.base + ' mt-12  md:w-[45%]! '}>
            <span class="text-2xl font-bold mb-4">History</span>
            <div class="flex flex-wrap gap-6 items-center overflow-y-auto">
              <For each={games()}>{(game) => <GameCard {...game} />}</For>
            </div>
          </div>
          <div class={widgetStyles.base + ' mt-12  md:w-[45%]!'}>
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
        </div>
        <OverlayComponent isOpen={isCreatingNewGameTemplate()} onClose={() => setIsCreatingNewGameTemplate(false)}>
          <div class="w-full">
            <CreateGame
              game={newGameTemplate()}
              onGameUpdate={setNewGameTemplate}
              isTemplate={true}
              onFinish={onFinishCreateGameTemplate}
            />
          </div>
        </OverlayComponent>
        {/* <div
          class="w-full opacity-0 transition-all duration-300 flex items-center justify-center mt-12 mb-12"
          classList={{ 'animate-slide-down': isCreatingNewGameTemplate() }}
        >
          <CreateGame
            game={newGameTemplate()}
            onGameUpdate={setNewGameTemplate}
            isTemplate={true}
            onFinish={onFinishCreateGameTemplate}
          />
        </div> */}
      </div>
    </>
  )
}

export default MyGames
