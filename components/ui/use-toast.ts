"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useContext, createContext } from "react"

type Toast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
  duration?: number
  onOpenChange?: (open: boolean) => void
}

type ToasterContextValue = {
  toasts: Toast[]
  toast: (toast: Omit<Toast, "id">) => void
  dismiss: (toastId?: string) => void
  removeToast: (toastId: string) => void
}

const ToasterContext = createContext<ToasterContextValue>({
  toasts: [],
  toast: () => { },
  dismiss: () => { },
  removeToast: () => { },
})

type ToastProviderProps = {
  children: React.ReactNode
}

function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timeouts = useRef<Record<string, NodeJS.Timeout>>({})

  useEffect(() => {
    return () => {
      Object.values(timeouts.current).forEach(clearTimeout)
    }
  }, [])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = String(Math.random())
    setToasts((prev) => [...prev, { id, ...toast }])

    if (toast.duration !== 0) {
      timeouts.current[id] = setTimeout(() => {
        dismissToast(id)
      }, toast.duration || 3000)
    }
  }, [])

  const dismissToast = useCallback((toastId?: string) => {
    setToasts((prev) =>
      prev.map((toast) => (toast.id === toastId || toastId === undefined ? { ...toast, open: false } : toast)),
    )
  }, [])

  const removeToast = useCallback((toastId: string) => {
    clearTimeout(timeouts.current[toastId])
    delete timeouts.current[toastId]
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId))
  }, [])

  const value = {
    toasts,
    toast: addToast,
    dismiss: dismissToast,
    removeToast: removeToast,
  }
  console.log("ToasterContext:", ToasterContext.Provider)
  return  { children }

}

function useToast() {
  return useContext(ToasterContext)
}

export { ToastProvider, useToast }

export function toast(options: Omit<Toast, "id">) {
  // 
}
