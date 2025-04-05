import { createSignal, createEffect, onCleanup, Component, JSX } from 'solid-js'

interface PopoverProps {
  children: JSX.Element // The element that triggers the popover
  content: JSX.Element | string // The content to display in the popover
  placement?: 'top' | 'bottom' | 'left' | 'right' // Where the popover should appear
  offset?: number // Optional offset in pixels
}

const Popover: Component<PopoverProps> = (props) => {
  const [isVisible, setIsVisible] = createSignal(false)
  const [position, setPosition] = createSignal({ top: 0, left: 0 })
  let triggerElement: HTMLElement | null = null
  let popoverElement: HTMLElement | null = null

  const placement = props.placement || 'bottom' // Default to bottom
  const offset = props.offset || 8 // Default offset

  const updatePosition = () => {
    if (!triggerElement || !popoverElement) return

    const triggerRect = triggerElement.getBoundingClientRect()
    const popoverRect = popoverElement.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let top: number = 0
    let left: number = 0

    switch (placement) {
      case 'top':
        top = triggerRect.top - popoverRect.height - offset
        left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2
        break
      case 'bottom':
        top = triggerRect.bottom + offset
        left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2
        break
      case 'left':
        top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2
        left = triggerRect.left - popoverRect.width - offset
        break
      case 'right':
        top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2
        left = triggerRect.right + offset
        break
    }

    // Basic boundary checks (you might want more sophisticated logic)
    if (left < 0) left = offset
    if (top < 0) top = offset
    if (left + popoverRect.width > viewportWidth) left = viewportWidth - popoverRect.width - offset
    if (top + popoverRect.height > viewportHeight) top = viewportHeight - popoverRect.height - offset

    setPosition({ top, left })
  }

  const togglePopover = () => {
    setIsVisible(!isVisible())
    // Update position immediately when showing
    if (!isVisible()) {
      setTimeout(updatePosition, 0) // Use setTimeout to ensure elements are rendered
    }
  }

  // Update position on window resize
  createEffect(() => {
    if (isVisible()) {
      const handleResize = () => updatePosition()
      window.addEventListener('resize', handleResize)
      onCleanup(() => window.removeEventListener('resize', handleResize))
    }
  })

  return (
    <div class="relative">
      <div ref={(el) => (triggerElement = el as HTMLElement)} onClick={togglePopover}>
        {props.children}
      </div>
      {isVisible() && (
        <div
          ref={(el) => (popoverElement = el as HTMLElement)}
          class="absolute z-50 bg-gray-100 text-gray-800 border border-gray-300 rounded shadow-md p-4 text-sm"
          style={{
            top: `${position().top}px`,
            left: `${position().left}px`,
          }}
        >
          {props.content}
        </div>
      )}
    </div>
  )
}

export default Popover
