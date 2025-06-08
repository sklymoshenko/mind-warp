import { User } from './types'

export const widgetStyles = {
  base: 'flex flex-col gap-2 border-2 border-primary/50 rounded-md p-4 bg-void/70',
}

export const isEmptyObject = (obj?: Record<string, any>) => {
  if (!obj) return true

  return Object.keys(obj).length === 0
}

export const calculateUserGameScore = (users: User[]) => {
  return users.reduce(
    (acc, curr) => {
      const totalScore = Object.values(curr.roundScore ?? {}).reduce((acc, score) => acc + score, 0)
      acc[curr.id] = totalScore
      return acc
    },
    {} as Record<User['id'], number>
  )
}

export const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
