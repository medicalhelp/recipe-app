'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { RecipeWithComponents } from '@/lib/queries'
import { parseAmount, formatAmount, formatPortionMultiplier } from '@/lib/utils'

function scaleAmount(amount: string | null, scale: number): string | null {
  if (scale === 1 || !amount) return amount
  const n = parseAmount(amount)
  return n !== null ? formatAmount(n * scale) : amount
}

type Component = RecipeWithComponents['components'][number]

function ScaledIngredient({
  amount, unit, name, scale,
}: {
  amount: string | null; unit: string | null; name: string; scale: number
}) {
  const displayAmount = scaleAmount(amount, scale)
  const parts = [displayAmount, unit, name].filter(Boolean).join(' ')
  return <li className="type-body">{parts}</li>
}

function ComponentSection({ component, scale }: { component: Component; scale: number }) {
  const recipe = component.childRecipe
  const displayName = component.displayName ?? recipe.name
  const portionLabel = formatPortionMultiplier(component.portionMultiplier)
  const isLinked = recipe.isStandalone

  return (
    <div className="py-8 border-t border-[var(--border)] first:border-t-0">
      {portionLabel && (
        <p className="type-label text-[var(--muted)] mb-1">{portionLabel}</p>
      )}
      <div className="flex items-center gap-2 mb-6">
        <h2 className="type-title">{displayName}</h2>
        {isLinked && (
          <Link
            href={`/recipes/${recipe.slug}`}
            className="text-[var(--muted)] transition-colors"
            title={`Go to ${recipe.name}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ul className="space-y-1">
          {recipe.ingredients.map((ing) => (
            <ScaledIngredient key={ing.id} amount={ing.amount} unit={ing.unit} name={ing.name} scale={scale} />
          ))}
        </ul>
        <ol className="space-y-3">
          {recipe.steps.map((step, i) => (
            <li key={step.id} className="type-body flex gap-3">
              <span className="text-[var(--muted)] shrink-0 tabular-nums">{i + 1}.</span>
              <span>{step.text}</span>
            </li>
          ))}
        </ol>
      </div>
      {recipe.components.length > 0 && (
        <div className="mt-8 pl-4 border-l-2 border-[var(--border)]">
          {recipe.components.map((sub) => (
            <ComponentSection key={sub.id} component={sub} scale={scale} />
          ))}
        </div>
      )}
    </div>
  )
}

export function ServingsScaler({ recipe }: { recipe: RecipeWithComponents }) {
  const [servings, setServings] = useState(recipe.servings)
  const scale = servings / recipe.servings

  return (
    <>
      <div className="flex items-center gap-3 mb-8">
        <span className="type-label text-[var(--muted)]">Serves</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setServings((s) => Math.max(1, s - 1))}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-colors text-[16px]"
            aria-label="Fewer servings"
          >
            −
          </button>
          <span className="type-ui font-medium w-6 text-center tabular-nums">{servings}</span>
          <button
            onClick={() => setServings((s) => s + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-colors text-[16px]"
            aria-label="More servings"
          >
            +
          </button>
        </div>
      </div>

      {recipe.components.length > 0 ? (
        <div>
          {recipe.components.map((comp) => (
            <ComponentSection key={comp.id} component={comp} scale={scale} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ul className="space-y-1">
            {recipe.ingredients.map((ing) => (
              <ScaledIngredient key={ing.id} amount={ing.amount} unit={ing.unit} name={ing.name} scale={scale} />
            ))}
          </ul>
          <ol className="space-y-3">
            {recipe.steps.map((step, i) => (
              <li key={step.id} className="type-body flex gap-3">
                <span className="text-[var(--muted)] shrink-0 tabular-nums">{i + 1}.</span>
                <span>{step.text}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  )
}
