import { eq, asc } from 'drizzle-orm'
import { db } from '@/db'
import { recipes, recipeComponents, ingredients, steps } from '@/db/schema'
import type { InferSelectModel } from 'drizzle-orm'

export type Recipe = InferSelectModel<typeof recipes>
export type Ingredient = InferSelectModel<typeof ingredients>
export type Step = InferSelectModel<typeof steps>
export type RecipeComponent = InferSelectModel<typeof recipeComponents>

export type RecipeWithComponents = Recipe & {
  ingredients: Ingredient[]
  steps: Step[]
  components: Array<RecipeComponent & { childRecipe: RecipeWithComponents }>
}

const MAX_DEPTH = 5

export async function getAllStandaloneRecipes(): Promise<Recipe[]> {
  return db.query.recipes.findMany({
    where: eq(recipes.isStandalone, true),
    orderBy: [asc(recipes.name)],
  })
}

export async function getRecipeBySlug(
  slug: string,
  depth = 0
): Promise<RecipeWithComponents | null> {
  const recipe = await db.query.recipes.findFirst({
    where: eq(recipes.slug, slug),
    with: {
      ingredients: { orderBy: [asc(ingredients.sortOrder)] },
      steps: { orderBy: [asc(steps.sortOrder)] },
    },
  })

  if (!recipe) return null
  if (depth >= MAX_DEPTH) return { ...recipe, components: [] }

  const componentRows = await db.query.recipeComponents.findMany({
    where: eq(recipeComponents.parentRecipeId, recipe.id),
    orderBy: [asc(recipeComponents.sortOrder)],
    with: { childRecipe: true },
  })

  const components = await Promise.all(
    componentRows.map(async (comp) => {
      const child = await getRecipeBySlug(comp.childRecipe.slug, depth + 1)
      return { ...comp, childRecipe: child! }
    })
  )

  return { ...recipe, components }
}

