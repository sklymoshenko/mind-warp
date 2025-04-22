import { createResource } from 'solid-js'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { TbSettings, TbDeviceGamepad2 } from 'solid-icons/tb'
import { RiDocumentFileList3Fill, RiUserFacesSpyLine } from 'solid-icons/ri'

type DashboardProps = {}

const settingItemStyles = {
  base: 'group flex items-center text-primary gap-2 cursor-pointer p-2 rounded-md hover:bg-primary/10 transition-colors duration-300',
  title:
    'text-bold text-2xl opacity-0 group-hover:opacity-100 transition-all duration-400 whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-xs',
  icon: 'w-7 h-7 flex-shrink-0',
}

const Dashboard = (props: DashboardProps) => {
  const { user } = useAuth()
  const { get } = useApi('users')

  const [users, { refetch }] = createResource(async () => {
    const response = await get()
    return response.data
  })

  return (
    <div class="text-primary h-full flex flex-col items-center justify-start">
      <div class={settingItemStyles.base}>
        <RiUserFacesSpyLine class={settingItemStyles.icon + ' w-10 h-10'} />
        <span class={settingItemStyles.title}>{user()?.name || 'Nameless'}</span>
      </div>
      <div class="flex justify-center items-center gap-4">
        <div class={settingItemStyles.base}>
          <TbSettings class={settingItemStyles.icon} />
          <span class={settingItemStyles.title}>Settings</span>
        </div>
        <div class={settingItemStyles.base}>
          <RiDocumentFileList3Fill class={settingItemStyles.icon} />
          <span class={settingItemStyles.title}>Rules</span>
        </div>
        <div class={settingItemStyles.base}>
          <TbDeviceGamepad2 class={settingItemStyles.icon} />
          <span class={settingItemStyles.title}>Games</span>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
