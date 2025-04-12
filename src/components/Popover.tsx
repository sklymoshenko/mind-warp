import { createEffect, createSignal, JSX } from 'solid-js'

type PopoverProps = {
  children: JSX.Element
  content: JSX.Element
  placement: 'top' | 'bottom' | 'left' | 'right'
  offset?: number
  isVisible: boolean
}
const Popover = (props: PopoverProps) => {
  let triggerRef: HTMLElement | undefined
  let contentRef: HTMLElement | undefined
  const [position, setPosition] = createSignal({
    top: '0px',
    left: '0px',
  })

  createEffect(() => {
    if (triggerRef) {
      const rect = triggerRef.getBoundingClientRect()
      const contentRect = contentRef?.getBoundingClientRect()

      let posX = rect.width / 2 - (contentRect?.width || 0) / 2
      let posY = rect.height / 2 - (contentRect?.height || 0) / 2

      switch (props.placement) {
        case 'top':
          posY = -((contentRect?.height || 0) + (props.offset || 0))
          break
        case 'bottom':
          posY = rect.height + (props.offset || 0)
          break
        case 'left':
          posX = -((contentRect?.width || 0) + (props.offset || 0))
          posY = rect.height / 2 - (contentRect?.height || 0) / 2
          break
        case 'right':
          posX = rect.width + (props.offset || 0)
          posY = rect.height / 2 - (contentRect?.height || 0) / 2
          break
      }

      setPosition({
        top: `${posY}px`,
        left: `${posX}px`,
      })
    }
  })

  return (
    <div class="relative">
      <div
        ref={(el) => {
          if (el) {
            triggerRef = el
          }
        }}
      >
        {props.children}
      </div>
      <div
        ref={(el) => {
          if (el) {
            contentRef = el
          }
        }}
        class="inline-block max-w-max absolute z-[1000] bg-void/80 backdrop-blur-sm border border-primary/50 shadow-[0_0_25px_rgba(226,254,116,0.2)] transition-all duration-300 ease-out rounded shadow-md p-4 text-sm"
        classList={{
          'opacity-0 scale-95 pointer-events-none invisible': !props.isVisible,
          'opacity-100 scale-100 pointer-events-auto visible': props.isVisible,
        }}
        style={{ top: position().top, left: position().left }}
      >
        <div class="w-full whitespace-nowrap">{props.content}</div>
      </div>
    </div>
  )
}

export default Popover
