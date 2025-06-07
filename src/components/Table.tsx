import { For, Show } from 'solid-js'
import { TiCancel } from 'solid-icons/ti'

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
}

const TableSkeleton = (props: { columns: TableColumn<any>[] }) => {
  return (
    <For each={Array(5)}>
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

const Table = <T,>(props: TableProps<T>) => {
  return (
    <div class="flex flex-col gap-4 w-full">
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
              <Show when={!props.loading} fallback={<TableSkeleton columns={props.columns} />}>
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
    </div>
  )
}

export default Table
