import { Toast, toast } from 'solid-toast'
import { IoAlertCircleOutline } from 'solid-icons/io'
import { FiX } from 'solid-icons/fi'
type ToastProps = {
  toast: Toast
  error: string
  title: string
}

const ErrorToast = (props: ToastProps) => {
  return (
    <div
      class={`text-primary relative max-w-sm w-[290px] bg-void/80 backdrop-blur-sm outline-1 outline-red-600/50 rounded-lg overflow-hidden`}
      classList={{
        'animate-enter': props.toast.visible,
        'animate-leave': !props.toast.visible,
      }}
    >
      <div class="p-2">
        <div class="flex items-start">
          <IoAlertCircleOutline class="h-7 w-7 text-red-600" />
          <div class="ml-3 w-0 flex-1">
            <div class="flex items-center justify-between">
              <p class="text-xl font-medium">{props.title}</p>
              <button
                class="text-gray-400 hover:text-gray-700 text-xl hover:cursor-pointer transition-colors duration-200 rounded-full"
                aria-label="Close"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  toast.dismiss(props.toast.id)
                }}
                tabIndex={0}
              >
                <FiX class="w-4 h-4" />
              </button>
            </div>
            <p class="mt-1 text-sm text-gray-400">{props.error}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorToast
