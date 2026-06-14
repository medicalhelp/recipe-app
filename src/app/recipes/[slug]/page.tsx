import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getRecipeBySlug } from '@/lib/queries'
import { formatMeta } from '@/lib/utils'
import { ServingsScaler } from '@/components/servings-scaler'

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const recipe = await getRecipeBySlug(slug)
  if (!recipe) notFound()

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-start justify-between gap-4">
          <Link href="/" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mt-1 shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <div className="text-center">
            <h1 className="type-title">{recipe.name}</h1>
            <p className="type-ui text-[var(--muted)] mt-0.5">{formatMeta(recipe)}</p>
          </div>
          <a href={`/recipes/${recipe.slug}/edit`} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mt-1 shrink-0" title="Edit recipe">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </a>
        </div>
      </header>

      {recipe.imageUrl && (
        <div className="w-full aspect-[16/9] overflow-hidden bg-[var(--border)]">
          <Image
            src={`/api/images/${recipe.imageUrl}`}
            alt={recipe.name}
            width={1200}
            height={675}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 py-10">
        <ServingsScaler recipe={recipe} />
      </div>
    </div>
  )
}
