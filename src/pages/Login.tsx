import { createSignal } from 'solid-js'
import { IoDiceSharp } from 'solid-icons/io'
import { toast } from 'solid-toast'
import ErrorToast from '../components/ErrorToast'
import { useLocation, useNavigate } from '@solidjs/router'
import { useAuth } from '../context/AuthContext'
const Login = () => {
  const [email, setEmail] = createSignal('admin@example.com')
  const [password, setPassword] = createSignal('adminpassword')
  const [error, setError] = createSignal('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const emptyFields = () => email() === '' || password() === ''
  const [isLoading, setIsLoading] = createSignal(false)

  const loc = useLocation()
  const params = new URLSearchParams(loc.search)
  const next = params.get('next') || '/dashboard'

  const handleLogin = async () => {
    setIsLoading(true)
    const error = await login(email(), password())
    if (error) {
      setError(error)
      toast.custom((t) => <ErrorToast toast={t} error={error} title="Login failed" />, {
        duration: 5000,
      })
      setIsLoading(false)
      return
    }

    setError('')
    setEmail('')
    setPassword('')
    setIsLoading(false)
    navigate(next, { replace: true })
  }

  return (
    <div class="flex flex-col items-center justify-center h-screen">
      <h1 class="text-4xl font-bold text-primary mb-8">Login</h1>
      <div class="flex flex-col items-center justify-center gap-4 w-full sm:w-[300px]">
        <input
          class="input-colors w-full"
          classList={{
            'input-error-colors': !!error(),
          }}
          type="email"
          required
          placeholder="Email *"
          onInput={(e) => setEmail(e.currentTarget.value)}
        />
        <input
          class="input-colors w-full"
          classList={{
            'input-error-colors': !!error(),
          }}
          type="password"
          required
          placeholder="Password *"
          onInput={(e) => setPassword(e.currentTarget.value)}
        />
        <button
          class="mt-2 bg-primary text-void font-bold uppercase py-2 px-4 rounded-lg w-full hover:bg-primary/50 hover:cursor-pointer transition-all duration-300"
          type="submit"
          disabled={emptyFields() || isLoading()}
          classList={{
            'opacity-50 hover:cursor-not-allowed!': emptyFields(),
            'hover:cursor-wait!': isLoading(),
          }}
          onClick={handleLogin}
        >
          {isLoading() ? <IoDiceSharp class="animate-spin h-7 w-7 mx-auto" /> : 'Complete Login'}
        </button>
      </div>
    </div>
  )
}

export default Login
