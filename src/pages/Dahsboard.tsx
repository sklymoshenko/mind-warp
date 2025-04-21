import { createResource } from 'solid-js'
import { useApi } from '../hooks/useApi'

type DashboardProps = {}

const Dashboard = (props: DashboardProps) => {
  const { get } = useApi('users')
  const [users, { refetch }] = createResource(async () => {
    const response = await get()
    return response.data
  })
  return <div>Dashboard</div>
}

export default Dashboard
