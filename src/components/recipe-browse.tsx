'use client'

import { useState, useEffect, useRef } from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import type { BrowseRecipe } from '@/lib/queries'
import { RecipeCard } from '@/components/recipe-card'

function matchesRecipe(r: BrowseRecipe, term: string): boolean {
  const q = term.toLowerCase()
  return (
    r.name.toLowerCase().includes(q) ||
    r.ingredients.some((ing) => ing.name.toLowerCase().includes(q)) ||
    r.asParent.some(
      (comp) =>
        comp.childRecipe.name.toLowerCase().includes(q) ||
        comp.childRecipe.ingredients.some((ing) => ing.name.toLowerCase().includes(q))
    )
  )
}

export function RecipeBrowse({ recipes }: { recipes: BrowseRecipe[] }) {
  const [chips, setChips] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [mode, setMode] = useState<'and' | 'or'>('and')
  const inputRef = useRef<HTMLInputElement>(null)

  const activeTerms = inputValue.trim() ? [...chips, inputValue.trim()] : chips

  const filtered =
    activeTerms.length === 0
      ? recipes
      : recipes.filter((r) =>
          mode === 'and'
            ? activeTerms.every((t) => matchesRecipe(r, t))
            : activeTerms.some((t) => matchesRecipe(r, t))
        )

  function confirmChip() {
    const trimmed = inputValue.trim()
    if (!trimmed || chips.includes(trimmed)) {
      setInputValue('')
      return
    }
    setChips((prev) => [...prev, trimmed])
    setInputValue('')
  }

  function removeChip(index: number) {
    setChips((prev) => prev.filter((_, i) => i !== index))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      confirmChip()
    } else if (e.key === 'Backspace' && inputValue === '' && chips.length > 0) {
      removeChip(chips.length - 1)
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setChips([])
        setInputValue('')
        setMode('and')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <main className="min-h-screen px-6 py-12 max-w-5xl mx-auto">
      <div className="flex items-center justify-center mb-4 relative">
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={chips.length === 0 ? 'Search…' : 'Add…'}
          className="w-full text-center type-display bg-transparent focus:outline-none placeholder:text-[var(--border)] px-10"
        />

        <a
          href="/recipes/new"
          className="absolute right-0 text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
          title="New recipe"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </a>
      </div>

      <AnimatePresence initial={false}>
        {chips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto', transition: { type: 'spring', stiffness: 500, damping: 40 } }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.15 } }}
            className="overflow-hidden mb-6"
          >
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3">
              <AnimatePresence initial={false}>
                {chips.map((chip, i) => (
                  <motion.span
                    key={chip}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 500, damping: 40 } }}
                    exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.1 } }}
                    className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full bg-[var(--border)] type-ui shrink-0"
                  >
                    {chip}
                    <button
                      onClick={() => removeChip(i)}
                      className="flex items-center justify-center w-3.5 h-3.5 rounded-full text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                      aria-label={`Remove ${chip}`}
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>

              {chips.length >= 2 && (
                <button
                  onClick={() => setMode((m) => m === 'and' ? 'or' : 'and')}
                  className="type-label px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors shrink-0"
                >
                  {mode.toUpperCase()}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6" />

      {filtered.length === 0 ? (
        <p className="text-center text-[var(--muted)] type-ui mt-20">No recipes found</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </main>
  )
}
