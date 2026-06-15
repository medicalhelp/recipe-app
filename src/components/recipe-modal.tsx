'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export const ModalContext = createContext<{ close: () => void; onImageSettled: () => void } | null>(null)

export function RecipeModal({
  image,
  actions,
  children,
}: {
  image?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  const router = useRouter()
  const [visible, setVisible] = useState(true)
  const [imageSettled, setImageSettled] = useState(!image)

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
    <ModalContext.Provider value={{ close, onImageSettled: () => setImageSettled(true) }}>
      <AnimatePresence onExitComplete={() => router.back()}>
        {visible && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-xl bg-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
          >
            <div className="min-h-full flex justify-center items-start pt-[12vh] pb-8 px-4">
              <div
                className="relative w-full max-w-3xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal card: shadow + bg + content — invisible until image settles */}
                <motion.div
                  className={`w-full rounded-2xl shadow-2xl bg-[var(--background)]${image ? ' pt-[75%]' : ''}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: imageSettled ? 1 : 0, transition: { duration: 0.3 } }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                >
                  {children}
                </motion.div>

                {/* Image: absolutely positioned on top, outside the modal card's opacity */}
                {image && (
                  <div className="absolute inset-x-0 top-0 pointer-events-none">
                    {image}
                  </div>
                )}

                {/* Actions: over the image */}
                {actions && (
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-xl px-2.5 py-2 text-white">
                    {actions}
                  </div>
                )}
              </div>
            </div>
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
      className="opacity-75 hover:opacity-100 transition-opacity"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    </button>
  )
}
