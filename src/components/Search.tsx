import { IoCloseSharp } from 'solid-icons/io'
import { createSignal, createEffect, For, Show, onCleanup } from 'solid-js'
import { AiOutlineLoading } from 'solid-icons/ai'
export type SearchItem = {
  id: string | number
  label?: string
  name?: string
  text?: string
  class?: string
  isRemovable?: boolean
}

type SearchProps<T extends SearchItem> = {
  searchFunction: (term: string) => Promise<T[]>
  placeholder?: string
  multiselect?: boolean
  onSelect?: (items: T[]) => void
  defaultSelected?: T[]
  selectedItems?: T[]
  disabled?: boolean
  hideSearch?: boolean
}

function SearchComponent<T extends SearchItem>(props: SearchProps<T>) {
  const [searchTerm, setSearchTerm] = createSignal('')
  const [searchResults, setSearchResults] = createSignal<T[]>([])
  const [isLoading, setIsLoading] = createSignal(false)
  const [isResultsOpen, setIsResultsOpen] = createSignal(false)

  createEffect(() => {
    const term = searchTerm()
    if (!term) {
      setSearchResults([])
      setIsResultsOpen(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setIsResultsOpen(true)

    const debounceTimer = setTimeout(async () => {
      try {
        const results = await props.searchFunction(term)
        setSearchResults(results)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }, 200)

    onCleanup(() => clearTimeout(debounceTimer))
  })

  const handleItemClick = (item: T) => {
    if (props.multiselect) {
      let newSelectedItems = [...(props.selectedItems || [])]
      const alreadySelected = !!newSelectedItems.find((selected) => selected.id === item.id)

      if (alreadySelected) {
        newSelectedItems = newSelectedItems.filter((selected) => selected.id !== item.id)
      } else {
        newSelectedItems.push(item)
      }
      props.onSelect?.(newSelectedItems)
    } else {
      setIsResultsOpen(false)
      setSearchResults([])
      props.onSelect?.([item])
    }

    setSearchTerm('')
  }

  const isSelected = (item: T) => {
    return props.selectedItems?.some((selected) => selected.id === item.id) || false
  }

  return (
    <div class="text-white bg-void relative my-2">
      <Show when={!props.hideSearch}>
        <input
          type="text"
          disabled={props.disabled}
          placeholder={props.placeholder || 'Search...'}
          value={searchTerm()}
          onInput={(e) => setSearchTerm(e.target.value)}
          class="input-colors w-full outline-1 outline-primary mb-2 text-white!"
          onFocus={() => searchTerm() && setIsResultsOpen(true)}
          onBlur={() => setTimeout(() => setIsResultsOpen(false), 100)}
        />
      </Show>

      <Show when={isLoading()}>
        <div class="absolute top-2 right-0 mt-2 mr-2 text-primary">
          <AiOutlineLoading class="w-5 h-5 animate-spin" title="Loading..." />
        </div>
      </Show>

      <div
        class="max-h-0 overflow-y-auto transition-max-height duration-300 ease-in-out my-2"
        classList={{
          'max-h-10': (props.selectedItems?.length || 0) > 0,
        }}
      >
        <div class="flex flex-wrap gap-2">
          <For each={props.selectedItems}>
            {(item) => (
              <span
                class={`bg-primary text-void px-2 py-1 rounded text-base flex items-center gap-2 font-medium ${item.class}`}
              >
                {item.name || item.text || item.label}
                <Show when={!props.disabled && item.isRemovable}>
                  <button
                    class="ml-1 font-bold hover:cursor-pointer hover:bg-accent hover:text-white transition-all duration-200"
                    onClick={() => handleItemClick(item)}
                  >
                    <IoCloseSharp class="w-4 h-4" />
                  </button>
                </Show>
              </span>
            )}
          </For>
        </div>
      </div>

      <div
        class={`
          absolute
          w-full
          left-0
          max-h-0
          bg-black
          transition-all
          duration-300
          ease-in-out
          z-[53]
          overflow-y-auto
          rounded-md
          rounded-t-none
        `}
        classList={{
          'max-h-[500px] border-b border-primary border-l border-r': isResultsOpen() && searchResults().length > 0,
        }}
      >
        <div>
          <For each={searchResults()}>
            {(result) => (
              <div
                class={`
                    p-2
                    cursor-pointer
                    bg-void
                    hover:cursor-pointer
                    hover:bg-primary/10
                  `}
                classList={{
                  'bg-accent text-primary': isSelected(result),
                }}
                onClick={() => handleItemClick(result)}
              >
                {result.name || result.text}
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  )
}

export default SearchComponent
