import { JSX, Show } from 'solid-js'

type OverlayComponentProps = {
  isOpen: boolean
  onClose: () => void
  children: JSX.Element
}

const OverlayComponent = (props: OverlayComponentProps) => {
  const handleOverlayClick = (e: MouseEvent) => {
    e.stopPropagation()
    props.onClose()
  }

  const stopPropagation = (e: MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      class="fixed inset-0 flex items-center justify-center backdrop-blur-sm transition-all duration-300 ease-out"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      classList={{
        'opacity-0 pointer-events-none': !props.isOpen,
        'animate-slide-down pointer-events-auto z-[51]': props.isOpen,
      }}
    >
      <div class="flex flex-col min-w-[90%] sm:min-w-[500px] items-center z-[52]">
        <div class="flex flex-col items-center justify-center w-full" onClick={stopPropagation}>
          <Show when={props.isOpen}>{props.children}</Show>
        </div>
      </div>
    </div>
  )
}

export default OverlayComponent
