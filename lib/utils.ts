import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 添加滚动辅助函数
export function scrollToElement(elementId: string, offset = 0) {
  const element = document.getElementById(elementId)
  if (element) {
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    })
  }
}

// 添加重定向辅助函数
export function redirectWithTimeout(url: string, timeout = 0) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      window.location.href = url
      resolve()
    }, timeout)
  })
}

// 添加表单验证辅助函数
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validatePhone(phone: string): boolean {
  // 中国大陆手机号验证
  const re = /^1[3-9]\d{9}$/
  return re.test(phone)
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// 添加设备检测辅助函数
export function isMobile(): boolean {
  if (typeof window === "undefined") return false
  return window.innerWidth <= 768
}

// 添加本地存储辅助函数
export function saveToLocalStorage(key: string, value: any): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error("Error getting from localStorage:", error)
    return defaultValue
  }
}
