import { Toast, toast } from 'solid-toast'
import { IoAlertCircleOutline } from 'solid-icons/io'
type ToastProps = {
  toast: Toast
  error: string
  title: string
}

const ErrorToast = (props: ToastProps) => {
  return (
    <div
      class={`text-primary relative max-w-sm w-[290px] bg-void/80 backdrop-blur-sm outline-1 outline-primary/50 rounded-lg overflow-hidden`}
      classList={{
        'animate-enter': props.toast.visible,
        'animate-leave': !props.toast.visible,
      }}
    >
      <div class="p-2">
        <div class="flex items-start">
          <IoAlertCircleOutline class="h-7 w-7 text-red-600" />
          <div class="ml-3 w-0 flex-1">
            <p class="text-lg font-medium">{props.title}</p>
            <p class="mt-1 text-sm text-gray-500">{props.error}</p>
            <div class="flex justify-end mt-4">
              <button
                type="button"
                class="text-sm text-accent font-medium hover:cursor-pointer"
                onClick={() => toast.dismiss(props.toast.id)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorToast
