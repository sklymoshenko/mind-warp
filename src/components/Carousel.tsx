import { createSignal, For, JSX } from 'solid-js'
import { FaSolidCaretLeft, FaSolidCaretRight } from 'solid-icons/fa'

type CarouselProps = {
  items: JSX.Element[]
}

const Carousel = (props: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = createSignal(0)

  return (
    <div class="relative w-full flex items-center justify-center">
      <button
        class="absolute left-0 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-colors hover:cursor-pointer z-10 opacity-0"
        classList={{ 'opacity-100 animate-slide-down': currentIndex() !== 0 }}
        onClick={() => setCurrentIndex((prev) => prev - 1)}
        disabled={currentIndex() === 0}
      >
        <FaSolidCaretLeft class="h-8 w-8" />
      </button>

      <div class="w-full overflow-hidden">
        <div
          class="flex transition-transform duration-500 ease-in-out gap-8 w-full"
          style={{ transform: `translateX(calc(-${currentIndex() * 100}% - ${currentIndex() * 2}rem))` }}
        >
          <For each={props.items}>{(item) => <div class="w-full flex-shrink-0">{item}</div>}</For>
        </div>
      </div>

      <button
        class="absolute right-0 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-colors hover:cursor-pointer z-10 opacity-0"
        classList={{
          'opacity-100 animate-slide-down': currentIndex() !== props.items.length - 1 && props.items.length > 1,
        }}
        onClick={() => setCurrentIndex((prev) => prev + 1)}
        disabled={currentIndex() === props.items.length - 1}
      >
        <FaSolidCaretRight class="h-8 w-8" />
      </button>
    </div>
  )
}

export default Carousel
