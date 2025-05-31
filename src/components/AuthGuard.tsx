import { createEffect, JSX, Show } from 'solid-js'

import { Navigate, useLocation } from '@solidjs/router'
import { useAuth } from '../context/AuthContext'

const AuthGuard = (props: { children: JSX.Element }) => {
  const { user, initialized, refetch } = useAuth()
  const loc = useLocation()

  createEffect(() => {
    const currentPath = loc.pathname
    refetch()
  })

  return (
    <Show when={initialized()} fallback={<div>Loading…</div>}>
      <Show when={!!user()} fallback={<Navigate href={`/login?next=${loc.pathname}`} />}>
        {props.children}
      </Show>
    </Show>
  )
}

export default AuthGuard
