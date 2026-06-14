import { notFound } from 'next/navigation'
import { getRecipeBySlug, getAllStandaloneRecipes } from '@/lib/queries'
import { RecipeForm } from '@/components/recipe-form'
import type { RecipeWithComponents } from '@/lib/queries'
import type { InitialRecipeData } from '@/components/recipe-form'

function ingToText(ings: { amount: string | null; unit: string | null; name: string }[]): string {
  return ings.map(i => [i.amount, i.unit, i.name].filter(Boolean).join(' ')).join('\n')
}

function stepsToText(ss: { text: string }[]): string {
  return ss.map(s => s.text).join('\n')
}

function toInitialData(recipe: RecipeWithComponents): InitialRecipeData {
  return {
    id: recipe.id,
    slug: recipe.slug,
    imageUrl: recipe.imageUrl,
    name: recipe.name,
    description: recipe.description ?? '',
    timeMinutes: recipe.timeMinutes?.toString() ?? '',
    calories: recipe.calories?.toString() ?? '',
    proteinGrams: recipe.proteinGrams?.toString() ?? '',
    fatGrams: recipe.fatGrams?.toString() ?? '',
    servings: recipe.servings.toString(),
    isStandalone: recipe.isStandalone,
    ingredientsText: ingToText(recipe.ingredients),
    stepsText: stepsToText(recipe.steps),
    components: recipe.components.map(comp => ({
      id: comp.id,
      childRecipeId: comp.childRecipe.isStandalone ? comp.childRecipeId : undefined,
      inlineRecipeId: comp.childRecipe.isStandalone ? undefined : comp.childRecipeId,
      name: comp.childRecipe.name,
      isExisting: comp.childRecipe.isStandalone,
      portionMultiplier: comp.portionMultiplier,
      notes: comp.notes ?? '',
      ingredientsText: ingToText(comp.childRecipe.ingredients),
      stepsText: stepsToText(comp.childRecipe.steps),
    })),
  }
}

export default async function EditRecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [recipe, allRecipes] = await Promise.all([getRecipeBySlug(slug), getAllStandaloneRecipes()])
  if (!recipe) notFound()
  return <RecipeForm initialData={toInitialData(recipe)} allRecipes={allRecipes} />
}
