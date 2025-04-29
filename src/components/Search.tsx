import { IoCloseSharp } from 'solid-icons/io'
import { createSignal, createEffect, For, Show, onCleanup } from 'solid-js'
type WithIdAndLabel = { id: string | number; label?: string; name?: string; text?: string }

type SearchProps<T extends WithIdAndLabel> = {
  searchFunction: (term: string) => Promise<T[]>
  placeholder?: string
  multiselect?: boolean
}

function SearchComponent<T extends WithIdAndLabel>(props: SearchProps<T>) {
  const [searchTerm, setSearchTerm] = createSignal('')
  const [searchResults, setSearchResults] = createSignal<T[]>([])
  const [isLoading, setIsLoading] = createSignal(false)
  const [isResultsOpen, setIsResultsOpen] = createSignal(false)
  const [selectedItems, setSelectedItems] = createSignal<T[]>([])

  // Effect to perform search when searchTerm changes (with a debounce)
  createEffect(() => {
    const term = searchTerm()
    if (!term) {
      setSearchResults([])
      setIsResultsOpen(false) // Close results when search term is empty
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setIsResultsOpen(true) // Open results when searching

    // Simple debounce (you might want a more robust debounce utility)
    const debounceTimer = setTimeout(async () => {
      try {
        // Call the provided search function
        console.time('search')
        const results = await props.searchFunction(term)
        setSearchResults(results)
        console.timeEnd('search')
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([]) // Clear results on error
      } finally {
        setIsLoading(false)
      }
    }, 300) // Debounce time

    // Cleanup the timer on effect re-run or component disposal
    onCleanup(() => clearTimeout(debounceTimer))
  })

  const handleItemClick = (item: T) => {
    if (props.multiselect) {
      setSelectedItems((prevSelected) => {
        if (prevSelected.find((selected) => selected.id === item.id)) {
          // Deselect if already selected (assuming items have a unique id)
          return prevSelected.filter((selected) => selected.id !== item.id)
        } else {
          // Select if not selected
          return [...prevSelected, item]
        }
      })
    } else {
      // Single select: set the item, close results, and potentially update search term
      setSelectedItems([item])
      setIsResultsOpen(false)
      setSearchResults([]) // Clear results after single selection
    }
  }

  // Helper to check if an item is selected
  const isSelected = (item: T) => {
    return selectedItems().some((selected) => selected.id === item.id)
  }

  return (
    <div class="text-primary bg-void relative my-2">
      {/* Search Input */}
      <input
        type="text"
        placeholder={props.placeholder || 'Search...'}
        value={searchTerm()}
        onInput={(e) => setSearchTerm(e.target.value)}
        class="input-colors w-full outline-1 outline-primary mb-2"
        onFocus={() => searchTerm() && setIsResultsOpen(true)} // Open results on focus if there's a term
        onBlur={() => setTimeout(() => setIsResultsOpen(false), 100)} // Close results on blur with a slight delay
      />

      {/* Loading Indicator */}
      <Show when={isLoading()}>
        <div class="absolute top-0 right-0 mt-2 mr-2 text-primary">Loading...</div>
      </Show>

      {/* Selected Items (for multiselect) */}
      <div
        class="max-h-0 overflow-y-auto transition-max-height duration-300 ease-in-out"
        classList={{
          'max-h-10': selectedItems().length > 0,
        }}
      >
        <div class="mt-2 flex flex-wrap gap-2">
          <For each={selectedItems()}>
            {(item) => (
              <span class="bg-primary text-void px-2 py-1 rounded text-base flex items-center gap-2 font-medium">
                {item.name || item.text || item.label}
                <button
                  class="ml-1 font-bold hover:cursor-pointer hover:bg-accent hover:text-white transition-all duration-200"
                  onClick={() => handleItemClick(item)} // Click again to deselect
                >
                  <IoCloseSharp class="w-4 h-4" />
                </button>
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
          transition-max-height
          duration-300
          ease-in-out
          z-[53]
          overflow-y-auto
          rounded-lg
        `}
        classList={{
          'max-h-[500px] border border-primary': isResultsOpen() && searchResults().length > 0,
        }}
      >
        <div class="p-2">
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

        <Show when={!isLoading() && searchResults().length === 0 && searchTerm().length > 0}>
          <div class="p-2 text-gray-500">No results found.</div>
        </Show>
      </div>
    </div>
  )
}

export default SearchComponent
