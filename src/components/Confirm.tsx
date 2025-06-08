import { FiX } from 'solid-icons/fi'
import { createSignal, JSX, Show, onCleanup, onMount } from 'solid-js'
import { Portal } from 'solid-js/web'

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
  const [arrowDirection, setArrowDirection] = createSignal<'top' | 'bottom'>('bottom')
  let dialogRef: HTMLDivElement | undefined
  let triggerRef: HTMLDivElement | undefined

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

  const calculatePosition = () => {
    if (dialogRef && triggerRef) {
      const dialogRect = dialogRef.getBoundingClientRect()
      const triggerRect = triggerRef.getBoundingClientRect()

      // Default: position above, centered horizontally
      let left = triggerRect.left + triggerRect.width / 2 - dialogRect.width / 2
      let top = triggerRect.top - dialogRect.height - 12 // 12px gap above

      // If not enough space above, show below
      if (top < 0) {
        top = triggerRect.bottom + 12
        setArrowDirection('top')
      } else {
        setArrowDirection('bottom')
      }

      // Clamp left to viewport
      if (left < 8) left = 8
      if (left + dialogRect.width > window.innerWidth - 8) {
        left = window.innerWidth - dialogRect.width - 8
      }

      dialogRef.style.left = `${left}px`
      dialogRef.style.top = `${top}px`
    }
  }

  return (
    <div class="relative w-full flex items-center">
      {/* Trigger */}
      <div
        class="flex"
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setOpen(true)
          calculatePosition()
        }}
      >
        {props.children}
      </div>
      {/* Dialog */}
      <Show when={open()}>
        <Portal>
          <div
            ref={dialogRef}
            class="absolute z-[9999] mb-3 bg-void shadow-lg rounded-lg p-4 min-w-[300px] max-w-[90vw] transition-all duration-200 border border-primary/10"
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
            {/* Arrow */}
            <Show when={arrowDirection() === 'bottom'}>
              <div class="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-void rotate-45 border border-primary/10 border-t-0 border-l-0" />
            </Show>
            <Show when={arrowDirection() === 'top'}>
              <div class="absolute left-1/2 -translate-x-1/2 -top-2 w-4 h-4 bg-void rotate-45 border border-primary/10 border-b-0 border-r-0" />
            </Show>
            <h3 class="text-lg font-bold text-primary">{props.title}</h3>
            <p class="mt-2 text-gray-500">{props.message}</p>
            <div class="mt-4 flex gap-2 justify-end">
              <button
                class="px-4 py-2 rounded text-primary hover:bg-primary/10 transition-colors duration-200 hover:cursor-pointer"
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
        </Portal>
      </Show>
    </div>
  )
}
