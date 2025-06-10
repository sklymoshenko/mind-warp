import { createResource, createSignal } from 'solid-js'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { TbSettings, TbDeviceGamepad2 } from 'solid-icons/tb'
import { RiDocumentFileList3Fill, RiUserFacesSpyLine } from 'solid-icons/ri'
import { Game, GameTemplate, GameTemplateListItem } from '../types'
import { useNavigate } from '@solidjs/router'
import OverlayComponent from '../components/OverlayComponent'
import CreateGame from './CreateGame'
import GameInfo from '../components/GameInfo'
import Table from '../components/Table'
import { TableColumn } from '../components/Table'
import { FiLogOut } from 'solid-icons/fi'
import { DateTime } from 'luxon'

// const leaderboardColumns: TableColumn<User>[] = [
//   {
//     label: 'Name',
//     key: 'name',
//     render: (user) => (
//       <div class="flex items-center gap-2">
//         <RiUserFacesSpyLine class="w-6 h-6 text-primary" /> <span>{user?.name}</span>
//       </div>
//     ),
//   },
//   { label: 'Score', key: 'score', render: (user) => <span>{user?.score || 0}</span> },
// ]

const columns: TableColumn<GameTemplateListItem>[] = [
  { label: 'Name', key: 'name' },
  { label: 'Description', key: 'description' },
  {
    label: 'Created at',
    key: 'createdAt',
    render: (template) => DateTime.fromMillis(template!.createdAt).toFormat('MMM d, yyyy h:mm a'),
  },
]

const Overview = () => {
  const { user, logout } = useAuth()
  // const { get } = useApi('users')
  const navigate = useNavigate()
  const { get: getGameTemplatesList } = useApi('game_templates/public')
  const { get: getGameTemplate } = useApi('game_templates/info')
  const { get: getPublicTemplatesCount } = useApi('public-templates/count')

  const [gameTemplateId, setGameTemplateId] = createSignal<GameTemplate['id'] | undefined>(undefined)
  const [isEditing, setIsEditing] = createSignal(false)
  const [templatesPagination, setTemplatesPagination] = createSignal({ limit: 25, offset: 0 })

  const [publicTemplatesCount, { mutate: setPublicTemplatesCount, refetch: refetchPublicTemplatesCount }] =
    createResource(async () => {
      const response = await getPublicTemplatesCount<{ count: number }>()

      if (response.data) {
        return response.data.count
      }
      return 0
    })

  const [gameTemplate, { mutate: setGameTemplate }] = createResource(gameTemplateId, async () => {
    if (!gameTemplateId()) return undefined

    const response = await getGameTemplate<GameTemplate>(`/${gameTemplateId()}`)
    return response.data
  })

  // const [users] = createResource(async () => {
  //   const response = await get<User[]>()
  //   return (
  //     (response.data?.map((user) => ({
  //       ...user,
  //       score: 500,
  //     })) as User[]) || []
  //   )
  // })

  const [gameTemplates, { refetch: refetchGameTemplates, mutate: mutateGameTemplates }] = createResource(async () => {
    const response = await getGameTemplatesList<GameTemplateListItem[]>(
      `?limit=${templatesPagination().limit}&offset=${templatesPagination().offset}`
    )

    if (response.data) {
      return response.data
    }

    return []
  })

  const handleLogout = async () => {
    const error = await logout()
    if (error) {
      console.error(error)
    }

    navigate('/')
  }

  const getGameInfo = async (id: string) => {
    setGameTemplateId(id)
  }

  const searchTemplates = async (term: string): Promise<GameTemplateListItem[]> => {
    if (!term) {
      refetchPublicTemplatesCount()
      refetchGameTemplates()
      return []
    }

    const response = await getGameTemplatesList<GameTemplateListItem[]>(`?query=${term}`)
    if (response.data) {
      setPublicTemplatesCount(response.data.length)
      mutateGameTemplates(response.data)
      return response.data
    }

    return []
  }

  const handleTemplatesPagination = async (offset: number, limit: number) => {
    setTemplatesPagination({ offset, limit })
    await refetchGameTemplates()
  }

  return (
    <>
      <div class="text-primary h-full flex flex-col items-center justify-start gap-4 w-full px-4 z-50">
        <div class="relative w-full mb-10 flex items-center justify-between">
          <button
            class="flex items-center gap-2 hover:cursor-pointer transition-colors duration-300 group"
            onclick={() => {
              navigate('/games/me')
            }}
          >
            <span class="text-2xl group-hover:text-white transition-colors duration-300">My Games</span>
          </button>
          <button
            class="flex items-center gap-2 hover:cursor-pointer transition-colors duration-300 group"
            onclick={handleLogout}
            title="Logout"
          >
            <div class="text-lg text-gray-400 group-hover:text-white transition-colors duration-300">
              {user()?.name || 'Nameless'}
            </div>
            <FiLogOut class="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
          </button>
        </div>
        <div class="flex gap-4 items-start w-full h-full">
          <div class="min-w-full md:min-w-[50%] mx-auto md:min-h-[80%] md:max-h-[80%] 2xl:max-h-full 2xl:min-h-[30rem]">
            <Table
              columns={columns}
              loading={gameTemplates.loading}
              data={gameTemplates() || []}
              name="Game Templates"
              onRowClick={(template) => getGameInfo(template.id)}
              pageSize={templatesPagination().limit}
              onPageChange={handleTemplatesPagination}
              totalItems={publicTemplatesCount() || 0}
              onSearch={searchTemplates}
              searchPlaceholder="Search for game templates"
              fallbackTitle="No game templates found"
              fallbackDetail="Create a game template to get started"
            />
          </div>
          {/* <div class="w-fit">
            <Table columns={leaderboardColumns} data={users() || []} name="Leaderboard" />
          </div> */}
        </div>
        <OverlayComponent isOpen={!!gameTemplateId() && !!gameTemplate()} onClose={() => setGameTemplateId(undefined)}>
          <GameInfo
            entity={gameTemplate()}
            type="template"
            user={user()!}
            onEdit={(template) => {
              setGameTemplate(template)
              setIsEditing(true)
            }}
          />
        </OverlayComponent>
        <OverlayComponent isOpen={isEditing()} onClose={() => setIsEditing(false)}>
          <CreateGame game={gameTemplate() as Game} onGameUpdate={setGameTemplate} isTemplate={true} />
        </OverlayComponent>
      </div>
    </>
  )
}

export default Overview
