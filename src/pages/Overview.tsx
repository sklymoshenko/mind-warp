import { createResource, For } from 'solid-js'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { TbSettings, TbDeviceGamepad2 } from 'solid-icons/tb'
import { RiDocumentFileList3Fill, RiUserFacesSpyLine } from 'solid-icons/ri'
import { Game, User } from '../types'
import mockGame from '../data/mockGame'
import { BiRegularTrophy } from 'solid-icons/bi'
import { RiUserFacesOpenArmLine } from 'solid-icons/ri'
import { IoDice } from 'solid-icons/io'
import { useNavigate } from '@solidjs/router'
import { widgetStyles } from '../utils'
type OverviewProps = {}

const settingItemStyles = {
  base: 'group flex items-center text-primary gap-2 cursor-pointer p-2 rounded-md hover:bg-primary/10 transition-colors duration-300',
  title:
    'text-bold text-2xl opacity-0 group-hover:opacity-100 transition-all duration-400 whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-xs',
  icon: 'w-7 h-7 flex-shrink-0',
}

const Overview = (props: OverviewProps) => {
  const { user } = useAuth()
  const { get } = useApi('users')
  const navigate = useNavigate()
  const { get: getGameTemplates } = useApi('game-templates')

  const [users, { refetch }] = createResource(async () => {
    const response = await get<User[]>()
    return response.data
  })

  const [gameTemplates, { refetch: refetchGameTemplates }] = createResource(async () => {
    // const response = await getGameTemplates<Game[]>()
    // return response.data

    return [mockGame, mockGame, mockGame, mockGame, mockGame, mockGame, mockGame, mockGame, mockGame, mockGame]
  })

  return (
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
        <input type="search" placeholder="Search for games" class="input-colors w-full outline-1 outline-primary" />
      </div>
      <div class="flex gap-4 items-start w-full">
        <div class={widgetStyles.base + ' w-1/2 px-4! pb-4!'}>
          <h1 class="text-2xl font-bold">Popular</h1>
          <div class="flex flex-wrap justify-start items-start gap-4 ">
            <For each={gameTemplates()}>
              {(gameTemplate) => {
                return (
                  <div class="flex items-center gap-2 hover:bg-primary/10 transition-all duration-300 rounded-md p-2 hover:cursor-pointer group">
                    <IoDice class="w-10 h-10 text-primary/50 group-hover:animate-spin" />
                    <div class="flex flex-col gap-1">
                      <span>{gameTemplate.name}</span>
                      <span class="text-sm text-primary/50">{gameTemplate.description}</span>
                    </div>
                  </div>
                )
              }}
            </For>
          </div>
        </div>
        <div class={widgetStyles.base + ' w-1/3'}>
          <h1 class="text-2xl font-bold">Overview</h1>
          <div class="flex flex-col gap-2 items-center">
            <div class="flex items-center gap-2">
              <BiRegularTrophy class="w-10 h-10 text-primary/50" />
              <span class="text-3xl">Games Played</span>
            </div>
            <span class="text-4xl font-bold">42</span>
          </div>
        </div>
        <div class={widgetStyles.base + ' w-1/3'}>
          <h1 class="text-2xl font-bold">Leaderboard</h1>
          <div class="flex flex-wrap gap-4 items-center">
            <For each={users()}>
              {(user, i) => {
                return (
                  <div class="flex items-center gap-2">
                    <RiUserFacesOpenArmLine
                      class="w-10 h-10"
                      classList={{ 'text-primary': i() === 0, 'text-primary/30': i() !== 0 }}
                    />
                    <div class="flex flex-col gap-1">
                      <span class="text-2xl">{user.name}</span>
                      <span class="text-sm text-primary/50">{500}</span>
                    </div>
                  </div>
                )
              }}
            </For>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Overview
