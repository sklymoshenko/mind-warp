import { createResource, For, Show, createSignal } from 'solid-js'
import mockGame from '../data/mockGame'
import { Game } from '../types'
import { DateTime } from 'luxon'
import { A } from '@solidjs/router'
import { widgetStyles } from '../utils'
import CreateGame from './CreateGame'
import { useApi } from '../hooks/useApi'
import { RiDevelopmentGitRepositoryPrivateFill } from 'solid-icons/ri'
import { useAuth } from '../context/AuthContext'

const GameCard = (props: Game) => {
  return (
    <div class="flex flex-col gap-2 bg-void/70 rounded-lg shadow-md">
      <div class="flex gap-2 items-center justify-between">
        <span class="text-xl font-bold">{props.name}</span>
        <Show when={props.isPublic === false}>
          <RiDevelopmentGitRepositoryPrivateFill class="text-primary w-6 h-6" title="Private Game" />
        </Show>
      </div>
      <span class="text-sm text-gray-400">{props.description}</span>
      <div class="flex flex-row gap-2 text-sm">
        <span class="text-gray-400">{props.users.length} players</span>
        <span class="text-gray-400">{props.rounds.length} rounds</span>
      </div>
      <Show when={props.finishDate}>
        <div class="flex flex-row gap-2 text-sm">{DateTime.fromMillis(props.finishDate!).toLocaleString()}</div>
      </Show>
    </div>
  )
}

const MyGames = () => {
  const { user } = useAuth()
  const { post } = useApi('games/create_template')
  const [isCreatingNewGameTemplate, setIsCreatingNewGameTemplate] = createSignal(false)
  const [newGameTemplate, setNewGameTemplate] = createSignal<Game>(
    localStorage.getItem('newGameTemplate') ? JSON.parse(localStorage.getItem('newGameTemplate')!) : undefined
  )

  const [games, { mutate: setGames }] = createResource(async () => {
    return [mockGame, mockGame, mockGame, mockGame, mockGame, mockGame, mockGame, mockGame, mockGame, mockGame]
  })

  const createGameTemplate = async () => {
    if (!newGameTemplate()) return
    const template = { ...newGameTemplate()!, creatorId: user()?.id }
    debugger
    const response = await post<Game>(template)
    console.log(response)
    debugger
    if (response.data) {
      setGames((prev) => (prev ? [response.data!, ...prev] : [response.data!]))
    }
  }

  const onFinishCreateGameTemplate = async () => {
    // setIsCreatingNewGameTemplate(false)
    await createGameTemplate()
    localStorage.setItem('newGameTemplate', JSON.stringify(newGameTemplate()))
  }

  const onToggleCreateNewGameTemplate = async () => {
    // setIsCreatingNewGameTemplate(!isCreatingNewGameTemplate())

    await createGameTemplate()
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
              <For each={games()}>{(game) => <GameCard {...game} />}</For>
            </div>
          </div>
        </div>
        <div
          class="w-full opacity-0 transition-all duration-300 flex items-center justify-center mt-12 mb-12"
          classList={{ 'animate-slide-down': isCreatingNewGameTemplate() }}
        >
          <CreateGame
            game={newGameTemplate()}
            onGameUpdate={setNewGameTemplate}
            isTemplate={true}
            onFinish={onFinishCreateGameTemplate}
          />
        </div>
      </div>
    </>
  )
}

export default MyGames
