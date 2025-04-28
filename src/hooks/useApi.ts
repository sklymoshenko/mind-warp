import { createSignal } from 'solid-js'

type FieldError = {
  field: string
  tag: string
  param?: string
}

export const useApi = (url: string) => {
  const [isLoading, setIsLoading] = createSignal(false)

  const createBaseUrl = () => {
    return `http://localhost:5173/api/${url}`
  }

  const handleError = async (response: Response) => {
    setIsLoading(false)
    const error = await response.json()

    if ('validationErrors' in error) {
      return {
        error: error.validationErrors
          .map((e: FieldError) => `Field: ${e.field}, reason: ${e.tag}, param: ${e.param}`)
          .join(', '),
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

  const post = async <T>(body: Record<string, unknown>): Promise<{ data?: T; error?: string }> => {
    try {
      setIsLoading(true)
      const response = await fetch(createBaseUrl(), {
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

  return {
    isLoading,
    get,
    post,
  }
}
