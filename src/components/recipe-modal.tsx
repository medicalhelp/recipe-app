'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function RecipeModal({
  header,
  children,
}: {
  header: React.ReactNode
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') router.back() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [router])

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-start pt-8 px-4 backdrop-blur-xl bg-white/20"
      onClick={() => router.back()}
    >
      <div
        className="w-full max-w-3xl rounded-2xl shadow-2xl bg-[var(--background)] flex flex-col mb-8"
        style={{ maxHeight: 'calc(100vh - 5rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 px-6 pt-5 pb-4 rounded-t-2xl">
          {header}
        </div>
        <div className="overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

export function ModalCloseButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      aria-label="Close"
      className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    </button>
  )
}
