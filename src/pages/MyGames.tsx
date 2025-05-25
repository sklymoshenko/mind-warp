import { createResource, For, Show, createSignal } from 'solid-js'
import mockGame from '../data/mockGame'
import { Game, GameInvite, GameListItem } from '../types'
import { DateTime } from 'luxon'
import { A } from '@solidjs/router'
import { widgetStyles } from '../utils'
import CreateGame from './CreateGame'
import { useApi } from '../hooks/useApi'
import { RiDevelopmentGitRepositoryPrivateFill } from 'solid-icons/ri'
import { useAuth } from '../context/AuthContext'
import OverlayComponent from '../components/OverlayComponent'
import { IoDice, IoGameControllerOutline, IoTrashOutline } from 'solid-icons/io'
import Carousel from '../components/Carousel'
import GameInfo from '../components/GameInfo'
import { BsEnvelopePaperHeart } from 'solid-icons/bs'
import { FaSolidThumbsDown, FaSolidThumbsUp } from 'solid-icons/fa'
import { Confirm } from '../components/Confirm'

const isFullGame = (item: Game | GameListItem): item is Game => {
  return 'users' in item && 'rounds' in item
}

const GameCard = (props: Game | GameListItem) => {
  return (
    <div class="flex bg-primary/15 rounded-md p-4 shadow-md gap-4 items-start hover:cursor-pointer hover:bg-primary/20 transition-all duration-300">
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
      <Show when={props.onDelete}>
        <Confirm
          title="Delete Game Template"
          message="Are you sure you want to delete this game template?"
          onConfirm={onDeleteGameTemplate}
        >
          <button class="text-red-500 hover:text-red-500/50 transition-all duration-300 group-hover:animate-slide-in p-3 z-0 opacity-0 group-hover:opacity-100 hover:cursor-pointer">
            <IoTrashOutline class="min-w-0 min-h-0 group-hover:min-w-10 group-hover:min-h-10 transition-all duration-300" />
          </button>
        </Confirm>
      </Show>
    </div>
  )
}

type GameInviteCardProps = {
  gameInvite: GameInvite
  onInviteAccept: (gameInvite: GameInvite) => void
  onInviteDecline: (gameInviteId: string) => void
  onInviteClick?: (gameInvite: GameInvite) => void
}

const GameInviteCard = (props: GameInviteCardProps) => {
  return (
    <div
      class="w-[80%] mx-auto relative group flex justify-between items-center bg-primary/10 hover:cursor-pointer hover:bg-primary/20 transition-all duration-300"
      onClick={() => props.onInviteClick?.(props.gameInvite)}
    >
      <div class="flex flex-row gap-4 items-center  rounded-md p-4">
        <BsEnvelopePaperHeart class="text-primary w-10 h-10" />
        <div class="flex flex-col gap-2">
          <span class="text-2xl font-bold">Game: {props.gameInvite.gameName}</span>
          <span class="text-gray-400 text-sm">
            Sent at {DateTime.fromISO(props.gameInvite.createdAt).toLocaleString()} by{' '}
            {props.gameInvite.gameCreatorName}
          </span>
        </div>
      </div>
      <div>
        <button
          class="text-green-500 hover:text-green-500/50 transition-all duration-300 group-hover:animate-slide-in p-3 z-0 opacity-0 group-hover:opacity-100 hover:cursor-pointer"
          onclick={(e) => {
            e.stopPropagation()
            props.onInviteAccept(props.gameInvite)
          }}
          title="Accept Invite"
        >
          <FaSolidThumbsUp class="min-w-0 min-h-0 group-hover:min-w-9 group-hover:min-h-9 transition-all duration-300" />
        </button>
        <button
          class="text-red-500 hover:text-red-500/50 transition-all duration-300 group-hover:animate-slide-in p-3 z-0 opacity-0 group-hover:opacity-100 hover:cursor-pointer"
          onclick={(e) => {
            e.stopPropagation()
            props.onInviteDecline(props.gameInvite.id)
          }}
          title="Decline Invite"
        >
          <FaSolidThumbsDown class="min-w-0 min-h-0 group-hover:min-w-9 group-hover:min-h-9 transition-all duration-300" />
        </button>
      </div>
    </div>
  )
}

const MyGames = () => {
  const { user } = useAuth()
  const { post: createTemplate } = useApi('game_templates/create_template')
  const { post: updateTemplate } = useApi('game_templates/update')
  const { post: acceptInvite } = useApi('games/invites/accept')
  const { post: declineInvite } = useApi('games/invites/decline')

  const { get } = useApi(`game_templates/user/${user()?.id}`)
  const { get: getGameTemplateInfo } = useApi('game_templates/info')

  const { get: getActiveGames } = useApi(`games/active/user/${user()?.id}`)
  const { get: getGamesHistory } = useApi(`games/finished/user/${user()?.id}`)
  const { get: getGameInvites } = useApi(`games/invites/user/${user()?.id}`)
  const { get: getGame } = useApi('games')

  const { del: deleteGame } = useApi(`games/delete`)
  const { post: finishGame } = useApi(`games/finish`)

  const [isCreatingNewGameTemplate, setIsCreatingNewGameTemplate] = createSignal(false)
  const [newGameTemplate, setNewGameTemplate] = createSignal<Game>()
  const [editingGameTemplateId, setEditingGameTemplateId] = createSignal<string>()
  const [editingGame, setEditingGame] = createSignal<Game>()
  const [historyGame, setHistoryGame] = createSignal<Game>()
  const [gameInvite, setGameInvite] = createSignal<GameInvite>()

  const [inviteGameInfo] = createResource(gameInvite, async (invite) => {
    if (!invite) return
    const response = await getGame<Game[]>(`/${invite.gameId}`)
    if (response.data) {
      return response.data[0]!
    }
  })

  const [gameInvites, { mutate: setGameInvites }] = createResource(async () => {
    const response = await getGameInvites<GameInvite[]>()
    if (response.data) {
      return response.data
    }
    return []
  })

  const [games, { refetch: refetchActiveGames, mutate: setActiveGames }] = createResource(async () => {
    const response = await getActiveGames<Game[]>()

    if (response.data) {
      return response.data
    }

    return []
  })

  const [gamesHistory, { mutate: setGamesHistory }] = createResource(async () => {
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

  const onInviteAccept = async (invite: GameInvite) => {
    const response = await acceptInvite<GameInvite>({
      inviteId: invite.id,
      gameId: invite.gameId,
      userId: invite.userId,
    })

    if (!response.error) {
      setGameInvites((prev) => prev?.filter((inv) => inv.id !== invite.id))
      await refetchActiveGames()
    }
  }

  const onInviteDecline = async (inviteId: string) => {
    const response = await declineInvite<GameInvite>({ inviteId })

    if (!response.error) {
      setGameInvites((prev) => prev?.filter((invite) => invite.id !== inviteId))
    }
  }

  const onGameRemove = async (game: Game) => {
    const response = await deleteGame<Game>(`/${game.id}`)

    if (!response.error) {
      setEditingGame(undefined)
      setActiveGames((prev) => prev?.filter((g) => g.id !== game.id))
    }
  }

  const onGameFinish = async (game: Game) => {
    const response = await finishGame<Game>({}, `/${game.id}`)

    if (!response.error) {
      setEditingGame(undefined)
      setGamesHistory((prev) => [...prev!, game])
    }
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
          <div class={`${widgetStyles.base} mt-12 md:min-w-[25%] p-4`}>
            <span class="text-3xl font-bold text-center">
              Active Games {games() && games()!.length > 0 ? `(${games()!.length})` : ''}
            </span>
            <div class="flex justify-center items-center">
              <Show
                when={games() && games()!.length > 0}
                fallback={<span class="text-gray-400 text-2xl text-center p-4">No Games</span>}
              >
                <Carousel
                  items={
                    games()?.map((game) => (
                      <div class="w-[80%] mx-auto" onClick={() => setEditingGame(game)}>
                        {<GameCard {...game} />}
                      </div>
                    )) ?? []
                  }
                />
              </Show>
            </div>
          </div>
          <div class={`${widgetStyles.base} mt-12 md:min-w-[25%] p-4`}>
            <span class="text-3xl font-bold text-center">
              Game Invites {gameInvites() && gameInvites()!.length > 0 ? `(${gameInvites()!.length})` : ''}
            </span>
            <div class="flex justify-center items-center [&>*:first-child]:p-4">
              <Show
                when={gameInvites() && gameInvites()!.length > 0}
                fallback={<span class="text-gray-400 text-2xl text-center p-4">No Invites</span>}
              >
                <Carousel
                  items={
                    gameInvites()?.map((gameInvite) => (
                      <GameInviteCard
                        gameInvite={gameInvite}
                        onInviteAccept={onInviteAccept}
                        onInviteDecline={onInviteDecline}
                        onInviteClick={setGameInvite}
                      />
                    )) ?? []
                  }
                />
              </Show>
            </div>
          </div>
          <div class={`${widgetStyles.base} mt-12 w-full`}>
            <div class="flex justify-between items-center">
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
              <div class="flex flex-wrap gap-6 items-center flex-1">
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
          <span class="text-2xl font-bold">History</span>
          <Show
            when={gamesHistory() && gamesHistory()!.length > 0}
            fallback={<span class="text-gray-400 text-2xl text-center p-4">No Games History</span>}
          >
            <div class="flex flex-wrap gap-6 items-center overflow-y-auto">
              <For each={gamesHistory()}>
                {(game) => <GameTemplateCard game={game} onClick={() => setHistoryGame(game)} />}
              </For>
            </div>
          </Show>
        </div>
        <OverlayComponent
          isOpen={isCreatingNewGameTemplate()}
          onClose={() => {
            setIsCreatingNewGameTemplate(false)
            setNewGameTemplate(undefined)
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
        <OverlayComponent
          isOpen={!!editingGameTemplateId()}
          onClose={() => {
            setEditingGameTemplateId(undefined)
            setNewGameTemplate(undefined)
          }}
        >
          <CreateGame
            game={newGameTemplate()}
            onGameUpdate={setNewGameTemplate}
            isTemplate={true}
            onFinish={saveNewGameTemplate}
          />
        </OverlayComponent>
        <OverlayComponent isOpen={!!editingGame()} onClose={() => setEditingGame(undefined)}>
          <GameInfo
            entity={editingGame()}
            type="game"
            user={user()!}
            onEdit={(game) => {
              setEditingGame(game)
            }}
            onRemove={onGameRemove}
            onFinish={onGameFinish}
            disableSearch={true}
          />
        </OverlayComponent>
        <OverlayComponent isOpen={!!historyGame()} onClose={() => setHistoryGame(undefined)}>
          <GameInfo entity={historyGame()} user={user()!} type="game" nonEditable={true} />
        </OverlayComponent>
        <OverlayComponent isOpen={!!gameInvite() && !!inviteGameInfo()} onClose={() => setGameInvite(undefined)}>
          <GameInfo entity={inviteGameInfo()} user={user()!} type="game" nonEditable={true} />
        </OverlayComponent>
      </div>
    </>
  )
}

export default MyGames
