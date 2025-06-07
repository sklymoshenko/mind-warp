import { createMemo, createSignal, For, Show } from 'solid-js'
import { TiCancel } from 'solid-icons/ti'
import { FaSolidArrowLeftLong, FaSolidArrowRightLong } from 'solid-icons/fa'

export interface TableColumn<T> {
  label: string
  key: keyof T
  width?: string
  maxWidth?: string
  render?: (row?: T) => any
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  name?: string
  loading?: boolean
  renderButton?: () => any
  onRowClick?: (row: T) => void
  emptyFallback?: () => any
  fallbackTitle?: string
  fallbackDetail?: string
  minWidth?: string
  disableOverflow?: boolean
  // Pagination props
  pageSize?: number
  currentPage?: number
  onPageChange?: (offset: number, limit: number, page: number) => void
  totalItems?: number
}

const TableSkeleton = (props: { columns: TableColumn<any>[]; rows: number }) => {
  return (
    <For each={Array(props.rows)}>
      {() => (
        <tr class="animate-pulse">
          <For each={props.columns}>
            {(column) => (
              <td class="px-6 py-4">
                <div class="h-6 bg-primary/10 rounded-md" />
              </td>
            )}
          </For>
        </tr>
      )}
    </For>
  )
}

const DefaultEmptyState = (props: { columns: TableColumn<any>[]; title?: string; detail?: string }) => {
  return (
    <tr>
      <td colspan={props.columns.length} class="h-full">
        <div class="flex flex-col items-center justify-center h-full text-gray-400">
          <TiCancel class="w-20 h-20 mb-2" />
          <p class="text-lg font-medium">{props.title || 'No data available'}</p>
          <p class="text-sm">{props.detail || 'The table is currently empty.'}</p>
        </div>
      </td>
    </tr>
  )
}

const Pagination = (props: {
  currentPage: number
  totalPages: number
  onPageChange: (offset: number, limit: number, page: number) => void
  pageSize: number
}) => {
  const [offset, setOffset] = createSignal(props.currentPage * props.pageSize)
  const [limit, setLimit] = createSignal(props.pageSize)

  const handlePageChange = (offset: number, limit: number, page: number) => {
    if (offset < 0) {
      offset = 0
    }

    const maxOffset = (props.totalPages - 1) * props.pageSize
    if (offset > maxOffset) {
      offset = maxOffset
    }

    setOffset(offset)
    setLimit(limit)
    props.onPageChange(offset, limit, page)
  }

  return (
    <div class="flex items-center justify-end px-1 py-2 bg-void/70 border border-primary/20 rounded-lg">
      <div class="flex items-center gap-2">
        <Show when={props.currentPage > 1}>
          <button
            class="px-3 py-1 rounded-md text-sm font-medium text-white/90 hover:bg-primary/10 cursor-pointer"
            onClick={() => handlePageChange(offset() - limit(), limit(), props.currentPage - 1)}
          >
            <FaSolidArrowLeftLong class="w-3 h-3" />
          </button>
        </Show>
        <span class="text-sm text-white/70" classList={{ 'mr-2': props.currentPage === props.totalPages }}>
          Page <span class="font-bold">{props.currentPage}</span> of <span class="font-bold">{props.totalPages}</span>
        </span>
        <Show when={props.currentPage < props.totalPages}>
          <button
            class="px-3 py-1 rounded-md text-sm font-medium text-white/90 hover:bg-primary/10 cursor-pointer"
            onClick={() => handlePageChange(offset() + limit(), limit(), props.currentPage + 1)}
          >
            <FaSolidArrowRightLong class="w-3 h-3" />
          </button>
        </Show>
      </div>
    </div>
  )
}

const Table = <T,>(props: TableProps<T>) => {
  const pageSize = props.pageSize || 10
  const [currentPage, setCurrentPage] = createSignal(props.currentPage || 1)
  const totalPages = createMemo(() => Math.ceil((props.totalItems || props.data.length) / pageSize))

  const handlePageChange = (offset: number, limit: number, page: number) => {
    setCurrentPage(page)
    props.onPageChange?.(offset, limit, page)
  }

  return (
    <div class="flex flex-col gap-4 w-full h-full">
      <div class="flex items-center justify-between">
        <Show when={props.name}>
          <h2 class="text-lg font-bold text-primary uppercase tracking-wider">{props.name}</h2>
        </Show>
        <Show when={props.renderButton}>{props.renderButton!()}</Show>
      </div>
      <div
        class="w-full h-full max-h-[70vh] rounded-lg border border-primary/20 shadow-[0_0_25px_rgba(226,254,116,0.1)]"
        classList={{ 'overflow-auto': !props.disableOverflow }}
      >
        <div class="relative isolate">
          <table class={`w-full ${props.minWidth || 'min-w-fit'}`}>
            <thead>
              <tr class="border-b-2 border-primary/30">
                <For each={props.columns}>
                  {(column) => (
                    <th
                      scope="col"
                      class="sticky top-0 px-6 py-4 text-left text-sm font-bold text-primary uppercase tracking-wider bg-void/95 backdrop-blur-sm z-10"
                      style={{
                        width: column.width,
                        'max-width': column.maxWidth,
                      }}
                    >
                      {column.label}
                    </th>
                  )}
                </For>
              </tr>
            </thead>
            <tbody class="bg-void/70 divide-y divide-primary/10">
              <Show when={!props.loading} fallback={<TableSkeleton columns={props.columns} rows={pageSize || 5} />}>
                <Show
                  when={props.data.length > 0 && !props.loading}
                  fallback={
                    props.emptyFallback ? (
                      props.emptyFallback()
                    ) : (
                      <DefaultEmptyState
                        columns={props.columns}
                        title={props.fallbackTitle}
                        detail={props.fallbackDetail}
                      />
                    )
                  }
                >
                  <For each={props.data}>
                    {(row) => (
                      <tr
                        class="hover:bg-primary/5 transition-colors duration-200 cursor-pointer"
                        onClick={() => props.onRowClick?.(row)}
                      >
                        <For each={props.columns}>
                          {(column) => (
                            <td class="px-6 py-4 text-base text-white/90" style={{ 'max-width': column.maxWidth }}>
                              <div class="truncate">{column.render ? column.render(row) : row[column.key]}</div>
                            </td>
                          )}
                        </For>
                      </tr>
                    )}
                  </For>
                </Show>
              </Show>
            </tbody>
          </table>
        </div>
      </div>
      <Show when={pageSize > 0 && totalPages() > 1}>
        <Pagination
          currentPage={currentPage()}
          totalPages={totalPages()}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      </Show>
    </div>
  )
}

export default Table
