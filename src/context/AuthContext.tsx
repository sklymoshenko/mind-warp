// AuthContext.tsx
import { createContext, useContext, ParentComponent, createSignal, createResource, Accessor } from 'solid-js'
import { User } from '../types'
import { useApi } from '../hooks/useApi'

type AuthState = {
  user: Accessor<User | null>
  initialized: Accessor<boolean>
  refetch: () => void
  logout: () => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthState>()

export const AuthProvider: ParentComponent = (props) => {
  const [user, setUser] = createSignal<User | null>(null)
  const [initialized, setInitialized] = createSignal(false)
  const { post } = useApi('api/logout')

  const [_, { refetch }] = createResource(async () => {
    const res = await fetch('/api/me', { credentials: 'include' })
    if (res.status === 401) {
      setUser(null)
      setInitialized(true)
      return
    }

    const data = await res.json()
    if (data) {
      setUser(data)
    }

    setInitialized(true)
  })

  const logout = () => {
    setUser(null)
    post({})
  }

  // on mount
  refetch()

  return (
    <AuthContext.Provider value={{ user, setUser, initialized, refetch, logout }}>
      {props.children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)!
}
