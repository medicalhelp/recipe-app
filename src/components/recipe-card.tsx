import Link from 'next/link'
import Image from 'next/image'
import type { Recipe } from '@/lib/queries'
import { formatMeta } from '@/lib/utils'

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link href={`/recipes/${recipe.slug}`} className="group block">
      <div className="aspect-square overflow-hidden bg-[var(--border)] mb-3">
        {recipe.imageUrl ? (
          <Image
            src={`/api/images/${recipe.imageUrl}`}
            alt={recipe.name}
            width={600}
            height={600}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full bg-[var(--border)]" />
        )}
      </div>
      <p className="type-heading mb-1">{recipe.name}</p>
      <p className="type-ui text-[var(--muted)]">{formatMeta(recipe)}</p>
    </Link>
  )
}
