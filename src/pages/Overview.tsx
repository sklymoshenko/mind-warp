import { createResource, createSignal, Component } from 'solid-js'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { TbSettings, TbDeviceGamepad2 } from 'solid-icons/tb'
import { RiDocumentFileList3Fill, RiUserFacesSpyLine } from 'solid-icons/ri'
import { Game, GameTemplate, User } from '../types'
import { useNavigate } from '@solidjs/router'
import OverlayComponent from '../components/OverlayComponent'
import CreateGame from './CreateGame'
import GameInfo from '../components/GameInfo'
import { SearchItem } from '../components/Search'
import SearchComponent from '../components/Search'
import Table from '../components/Table'
import { TableColumn } from '../components/Table'
import { template } from 'solid-js/web'

type OverviewProps = {}

const settingItemStyles = {
  base: 'group flex items-center text-primary gap-2 cursor-pointer p-2 rounded-md hover:bg-primary/10 transition-colors duration-300',
  title:
    'text-bold text-2xl opacity-0 group-hover:opacity-100 transition-all duration-400 whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-xs',
  icon: 'w-7 h-7 flex-shrink-0',
}

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

const columns: TableColumn<GameTemplate>[] = [
  { label: 'Name', key: 'name' },
  { label: 'Description', key: 'description' },
]

const Overview = (props: OverviewProps) => {
  const { user, logout } = useAuth()
  // const { get } = useApi('users')
  const navigate = useNavigate()
  const { get: getGameTemplatesSearch } = useApi('game_templates/search')
  const { get: getGameTemplatesList } = useApi('game_templates/public')
  const { get: getGameTemplate } = useApi('game_templates/info')
  const [gameTemplateId, setGameTemplateId] = createSignal<GameTemplate['id'] | undefined>(undefined)
  const [isEditing, setIsEditing] = createSignal(false)
  const [templatesPagination, setTemplatesPagination] = createSignal({ limit: 25, offset: 0 })

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

  const [gameTemplates, { refetch: refetchGameTemplates }] = createResource(async () => {
    const response = await getGameTemplatesList<GameTemplate[]>(
      `?limit=${templatesPagination().limit}&offset=${templatesPagination().offset}`
    )
    return response.data
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

  const searchTemplates = async (term: string): Promise<SearchItem[]> => {
    const response = await getGameTemplatesSearch<GameTemplate[]>(`?query=${term}`)
    return (
      response.data?.map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
      })) || []
    )
  }

  const onTemplateSelect = (templates: SearchItem[]) => {
    getGameInfo(templates[0].id as string)
  }

  const handleTemplatesPagination = async (offset: number, limit: number) => {
    setTemplatesPagination({ offset, limit })
    await refetchGameTemplates()
  }

  return (
    <>
      <div class="absolute top-4 left-4 md:top-8 md:left-8 z-[52]">
        <button
          class="text-primary text-sm md:text-lg font-bold uppercase tracking-wider hover:text-white hover:cursor-pointer transition-all duration-300 "
          onclick={handleLogout}
        >
          Logout
        </button>
      </div>
      <div class="text-primary h-full flex flex-col items-center justify-start gap-4 w-full px-4 z-51">
        <div class={settingItemStyles.base}>
          <RiUserFacesSpyLine class={settingItemStyles.icon + ' w-10 h-10'} />
          <span class={settingItemStyles.title}>{user()?.name || 'Nameless'}</span>
        </div>
        <div class="flex justify-center items-center gap-4">
          <button class={settingItemStyles.base}>
            <TbSettings class={settingItemStyles.icon} />
            <span class={settingItemStyles.title}>Settings</span>
          </button>
          <button class={settingItemStyles.base}>
            <RiDocumentFileList3Fill class={settingItemStyles.icon} />
            <span class={settingItemStyles.title}>Rules</span>
          </button>
          <button
            class={settingItemStyles.base}
            onclick={() => {
              navigate('/games/me')
            }}
          >
            <TbDeviceGamepad2 class={settingItemStyles.icon} />
            <span class={settingItemStyles.title}>My Games</span>
          </button>
        </div>
        <div class="w-full">
          <div class="w-full">
            <SearchComponent<SearchItem>
              searchFunction={searchTemplates}
              placeholder="Search for game templates"
              onSelect={onTemplateSelect}
            />
          </div>
        </div>
        <div class="flex gap-4 items-start w-full">
          <div class="w-[50%] mx-auto h-[45rem] min-h-[25rem]">
            <Table
              columns={columns}
              loading={gameTemplates.loading}
              data={gameTemplates() || []}
              name="Game Templates"
              onRowClick={(template) => getGameInfo(template.id)}
              pageSize={templatesPagination().limit}
              onPageChange={handleTemplatesPagination}
              totalItems={30}
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
