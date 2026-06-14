import Link from 'next/link'
import type { RecipeWithComponents } from '@/lib/queries'
import { formatPortionMultiplier } from '@/lib/utils'

type Component = RecipeWithComponents['components'][number]

function IngredientLine({ amount, unit, name }: { amount: string | null; unit: string | null; name: string }) {
  const parts = [amount, unit, name].filter(Boolean).join(' ')
  return <li className="type-body">{parts}</li>
}

function RecipeComponentSection({ component }: { component: Component }) {
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
            className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
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
            <IngredientLine key={ing.id} amount={ing.amount} unit={ing.unit} name={ing.name} />
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
            <RecipeComponentSection key={sub.id} component={sub} />
          ))}
        </div>
      )}
    </div>
  )
}

export function RecipeComponentList({ components }: { components: RecipeWithComponents['components'] }) {
  return (
    <div>
      {components.map((comp) => (
        <RecipeComponentSection key={comp.id} component={comp} />
      ))}
    </div>
  )
}
