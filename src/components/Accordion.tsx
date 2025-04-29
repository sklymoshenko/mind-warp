import { JSX, createSignal } from 'solid-js'
import { BiRegularDownArrowAlt } from 'solid-icons/bi'

type AccordionProps = {
  children: JSX.Element
  title: JSX.Element
  defaultOpen?: boolean
}

const Accordion = (props: AccordionProps) => {
  const [isOpen, setIsOpen] = createSignal(props.defaultOpen ?? false)

  const toggleAccordion = () => {
    setIsOpen(!isOpen())
  }

  return (
    <div class="mb-4 rounded-lg overflow-hidden border border-primary">
      {/* Accordion Header (Title and Clickable Area) */}
      <div class="flex justify-between items-center bg-primary text-void p-2 cursor-pointer" onClick={toggleAccordion}>
        <h3 class="text-xl font-bold flex-1">{props.title}</h3>
        {/* Optional: Add an indicator for open/closed state */}
        <BiRegularDownArrowAlt
          class="w-6 h-6 transition-transform duration-300 ml-4"
          classList={{ 'rotate-180': isOpen() }}
        />
      </div>

      <div
        class="max-h-0 transition-max-height duration-300 ease-in-out overflow-y-auto"
        classList={{ 'max-h-[500px]': isOpen() }}
      >
        <div class="p-4">{props.children}</div>
      </div>
    </div>
  )
}

export default Accordion
