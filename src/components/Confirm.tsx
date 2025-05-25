import { FiX } from 'solid-icons/fi'
import { createSignal, JSX, Show, onCleanup, onMount } from 'solid-js'

type ConfirmProps = {
  children: JSX.Element
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
}

export const Confirm = (props: ConfirmProps) => {
  const [open, setOpen] = createSignal(false)
  let dialogRef: HTMLDivElement | undefined

  const handleConfirm = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    props.onConfirm()
    setOpen(false)
  }

  const handleCancel = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    props.onCancel?.()
    setOpen(false)
  }

  // Close on outside click
  onMount(() => {
    const handleClick = (e: MouseEvent) => {
      if (open() && dialogRef && !dialogRef.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    onCleanup(() => document.removeEventListener('mousedown', handleClick))
  })

  return (
    <div class="relative inline-block w-full z-[9999]">
      {/* Trigger */}
      <span
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setOpen(true)
        }}
      >
        {props.children}
      </span>
      {/* Dialog */}
      <Show when={open()}>
        <div
          ref={dialogRef}
          class="absolute left-1/2 bottom-full mb-3 z-50 bg-void shadow-lg rounded-lg p-4 min-w-[300px] max-w-[90vw] transition-all duration-200 border border-primary/10"
          style={{ transform: 'translateX(-50%)' }}
        >
          {/* Close Icon */}
          <button
            class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl hover:cursor-pointer transition-colors duration-200 rounded-full p-1"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              setOpen(false)
            }}
            tabIndex={0}
          >
            <FiX class="w-5 h-5" />
          </button>
          {/* Arrow (at bottom) */}
          <div class="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-void rotate-45 border border-primary/10 border-t-0 border-l-0" />
          <h3 class="text-lg font-bold">{props.title}</h3>
          <p class="mt-2">{props.message}</p>
          <div class="mt-4 flex gap-2 justify-end">
            <button
              class="px-4 py-2 rounded hover:bg-primary/10 transition-colors duration-200 hover:cursor-pointer"
              onClick={handleCancel}
            >
              {props.cancelText || 'Cancel'}
            </button>
            <button
              class="px-4 py-2 bg-blue-500 text-white hover:bg-blue-500/80 transition-colors duration-200 rounded hover:cursor-pointer"
              onClick={handleConfirm}
            >
              {props.confirmText || 'Confirm'}
            </button>
          </div>
        </div>
      </Show>
    </div>
  )
}
