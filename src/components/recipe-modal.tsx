'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const ModalContext = createContext<{ close: () => void } | null>(null)

export function RecipeModal({
  header,
  children,
}: {
  header: React.ReactNode
  children: React.ReactNode
}) {
  const router = useRouter()
  const [visible, setVisible] = useState(true)

  function close() {
    setVisible(false)
  }

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setVisible(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <ModalContext.Provider value={{ close }}>
      <AnimatePresence onExitComplete={() => router.back()}>
        {visible && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 flex justify-center items-start pt-8 px-4 backdrop-blur-xl bg-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
          >
            <motion.div
              className="w-full max-w-3xl rounded-2xl shadow-2xl bg-[var(--background)] flex flex-col mb-8"
              style={{ maxHeight: 'calc(100vh - 5rem)', transformOrigin: '50% 0%' }}
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { type: 'spring', damping: 30, stiffness: 350, mass: 0.85 },
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: -10,
                transition: { duration: 0.16, ease: 'easeIn' },
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0 px-6 pt-5 pb-4 rounded-t-2xl">
                {header}
              </div>
              <div className="overflow-y-auto">
                {children}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  )
}

export function ModalCloseButton() {
  const ctx = useContext(ModalContext)
  return (
    <button
      onClick={() => ctx?.close()}
      aria-label="Close"
      className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    </button>
  )
}
