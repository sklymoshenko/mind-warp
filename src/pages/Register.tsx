import { createSignal } from 'solid-js'
import { useApi } from '../hooks/useApi'
import { IoDiceSharp } from 'solid-icons/io'
import { toast } from 'solid-toast'
import ErrorToast from '../components/ErrorToast'

const Register = () => {
  const [username, setUsername] = createSignal('')
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [error, setError] = createSignal('asd')
  const { post, isLoading } = useApi('auth/register')

  const emptyFields = () => username() === '' || email() === '' || password() === ''

  const handleRegister = async () => {
    const { data, error } = await post({ username: username(), email: email(), password: password() })
    if (error) {
      setError(error)
      toast.custom((t) => <ErrorToast toast={t} error={error} title="Registration failed" />, {
        duration: 105000,
      })
    }

    if (data) {
      setError('')
      setUsername('')
      setEmail('')
      setPassword('')
      console.log(data)
    }
  }

  return (
    <div class="flex flex-col items-center justify-center h-screen">
      <h1 class="text-4xl font-bold text-primary mb-8">Register</h1>
      <div class="flex flex-col items-center justify-center gap-4 w-full sm:w-[300px]">
        <input
          class="input-colors w-full"
          classList={{
            'input-error-colors': !!error(),
          }}
          type="text"
          required
          placeholder="Username *"
          onInput={(e) => setUsername(e.currentTarget.value)}
        />
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
          onClick={handleRegister}
        >
          {isLoading() ? <IoDiceSharp class="animate-spin h-7 w-7 mx-auto" /> : 'Complete Registration'}
        </button>
      </div>
    </div>
  )
}

export default Register
