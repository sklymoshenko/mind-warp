// AuthContext.tsx
import { createContext, useContext, ParentComponent, createSignal, createResource, Accessor } from 'solid-js'
import { User } from '../types'
import { useApi } from '../hooks/useApi'

type AuthState = {
  user: Accessor<User | null>
  initialized: Accessor<boolean>
  refetch: () => void
  logout: () => Promise<string | undefined>
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<string | undefined>
}

const AuthContext = createContext<AuthState>()

export const AuthProvider: ParentComponent = (props) => {
  const [user, setUser] = createSignal<User | null>(null)
  const [initialized, setInitialized] = createSignal(false)
  const { get: apiLogout } = useApi('auth/logout')
  const { post: apiLogin } = useApi('auth/login')

  const [_, { refetch }] = createResource(async () => {
    const res = await fetch('/api/me', { credentials: 'include' })
    if (res.status === 401 || !res.ok) {
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

  const login = async (email: string, password: string) => {
    const { error } = await apiLogin<User>({ email, password })
    if (error) {
      return error
    }

    await refetch()
  }

  const logout = async () => {
    setUser(null)
    const { error } = await apiLogout()
    if (error) {
      return error
    }
  }

  // on mount
  refetch()

  return (
    <AuthContext.Provider value={{ user, setUser, initialized, refetch, logout, login }}>
      {props.children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)!
}
