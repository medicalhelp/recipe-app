import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getRecipeBySlug } from '@/lib/queries'
import { formatMeta } from '@/lib/utils'
import { RecipeModal, ModalCloseButton } from '@/components/recipe-modal'
import { ServingsScaler } from '@/components/servings-scaler'

export default async function RecipeModalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const recipe = await getRecipeBySlug(slug)
  if (!recipe) notFound()

  const header = (
    <div className="flex items-center gap-4">
      <div className="w-5 shrink-0" />
      <div className="flex-1 text-center">
        <h1 className="type-title">
          {recipe.name}
        </h1>
        <p className="type-ui text-[var(--muted)] mt-0.5">{formatMeta(recipe)}</p>
      </div>
      <div className="w-5 shrink-0 flex justify-end gap-3">
        <a href={`/recipes/${recipe.slug}/edit`} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors" title="Edit recipe">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </a>
        <ModalCloseButton />
      </div>
    </div>
  )

  return (
    <RecipeModal header={header}>
      {recipe.imageUrl && (
        <div className="w-full aspect-[4/3] overflow-hidden bg-[var(--border)]">
          <Image
            src={`/api/images/${recipe.imageUrl}`}
            alt={recipe.name}
            width={800}
            height={600}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      )}
      <div className="px-8 py-10">
        <ServingsScaler recipe={recipe} />
      </div>
    </RecipeModal>
  )
}
