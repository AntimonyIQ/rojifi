"use client"

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => {
        const variant = props.variant || "default"

        let Icon = null
        if (variant === "success") Icon = CheckCircle
        if (variant === "destructive") Icon = AlertCircle
        if (variant === "info") Icon = Info
        if (variant === "warning") Icon = AlertTriangle

        return (
          <Toast key={id} {...props}>
            <div className="flex gap-3">
              {Icon && <Icon className="h-5 w-5" />}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
