'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import type { Recipe } from '@/lib/queries'
import { RecipeCard } from '@/components/recipe-card'

export function RecipeBrowse({ recipes }: { recipes: Recipe[] }) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = query
    ? recipes.filter((r) =>
        r.name.toLowerCase().includes(query.toLowerCase())
      )
    : recipes

  function openSearch() {
    setSearching(true)
  }

  function closeSearch() {
    setSearching(false)
    setQuery('')
  }

  useEffect(() => {
    if (searching) inputRef.current?.focus()
  }, [searching])

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

        {searching ? (
          <button
            onClick={closeSearch}
            className="absolute left-0 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            aria-label="Close search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
        ) : (
          <button
            onClick={openSearch}
            className="absolute left-0 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            aria-label="Search recipes"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        )}

        {searching ? (
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full text-center type-display bg-transparent focus:outline-none placeholder:text-[var(--border)]"
          />
        ) : (
          <h1 className="type-display">Recipes</h1>
        )}

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
        <p className="text-center text-[var(--muted)] text-[14px] mt-20">No recipes found</p>
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
