import { createSignal } from 'solid-js'
import { errorMessages } from './errors'

export const useApi = (url: string) => {
  const [isLoading, setIsLoading] = createSignal(false)

  const createBaseUrl = () => {
    return `/api/${url}`
  }

  const handleError = async (response: Response) => {
    setIsLoading(false)
    const error = await response.json()

    if (error.code) {
      return {
        error: errorMessages[error.code as keyof typeof errorMessages],
      }
    }

    return {
      error: `Failed to get data [${response.status}:${response.statusText}]:${error.message ? error.message : error.error}`,
    }
  }

  const handleResponse = async <T>(response: Response): Promise<{ data?: T; error?: string }> => {
    if (!response.ok) {
      return handleError(response)
    }

    const data = (await response.json()) as T
    return { data }
  }

  const get = async <T>(url: string = ''): Promise<{ data?: T; error?: string }> => {
    try {
      setIsLoading(true)
      const response = await fetch(createBaseUrl() + url, { credentials: 'include' })
      return handleResponse<T>(response)
    } catch (error) {
      return { error: `Unexpected error while GET: ${error}` }
    } finally {
      setIsLoading(false)
    }
  }

  const post = async <T>(body: Record<string, unknown>, url: string = ''): Promise<{ data?: T; error?: string }> => {
    try {
      setIsLoading(true)
      const response = await fetch(createBaseUrl() + url, {
        method: 'POST',
        body: JSON.stringify(body),
        credentials: 'include',
      })

      return handleResponse<T>(response)
    } catch (error) {
      return { error: `Unexpected error while POST: ${error}` }
    } finally {
      setIsLoading(false)
    }
  }

  const del = async <T>(url: string = ''): Promise<{ data?: T; error?: string }> => {
    try {
      setIsLoading(true)
      const response = await fetch(createBaseUrl() + url, {
        method: 'DELETE',
        credentials: 'include',
      })

      return handleResponse<T>(response)
    } catch (error) {
      return { error: `Unexpected error while DELETE: ${error}` }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    get,
    post,
    del,
  }
}
