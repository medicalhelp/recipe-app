'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { BrowseRecipe } from '@/lib/queries'
import { RecipeCard } from '@/components/recipe-card'

const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
const fadeTransition = { duration: 0.12 }

export function RecipeBrowse({ recipes }: { recipes: BrowseRecipe[] }) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const filtered = query
    ? recipes.filter((r) => {
        const q = query.toLowerCase()
        return (
          r.name.toLowerCase().includes(q) ||
          r.ingredients.some((ing) => ing.name.toLowerCase().includes(q)) ||
          r.asParent.some(
            (comp) =>
              comp.childRecipe.name.toLowerCase().includes(q) ||
              comp.childRecipe.ingredients.some((ing) => ing.name.toLowerCase().includes(q))
          )
        )
      })
    : recipes

  function openSearch() {
    setSearching(true)
  }

  function closeSearch() {
    setSearching(false)
    setQuery('')
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searching) closeSearch()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searching])

  return (
    <main className="min-h-screen px-6 py-12 max-w-5xl mx-auto">
      <div className="flex items-center justify-center mb-10 relative">

        {/* Left icon — search ↔ back */}
        <div className="absolute left-0">
          <AnimatePresence mode="wait" initial={false}>
            {searching ? (
              <motion.button
                key="back"
                {...fade}
                transition={fadeTransition}
                onClick={closeSearch}
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                aria-label="Close search"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </motion.button>
            ) : (
              <motion.button
                key="search-icon"
                {...fade}
                transition={fadeTransition}
                onClick={openSearch}
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                aria-label="Search recipes"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Center — heading ↔ input */}
        <AnimatePresence mode="wait" initial={false}>
          {searching ? (
            <motion.div
              key="search-input"
              {...fade}
              transition={fadeTransition}
              className="w-full px-10"
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                autoFocus
                className="w-full text-center type-display bg-transparent focus:outline-none placeholder:text-[var(--border)]"
              />
            </motion.div>
          ) : (
            <motion.h1
              key="heading"
              {...fade}
              transition={fadeTransition}
              className="type-display"
            >
              Recipes
            </motion.h1>
          )}
        </AnimatePresence>

        <Link
          href="/recipes/new"
          className="absolute right-0 text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
          title="New recipe"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </Link>
      </div>

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
