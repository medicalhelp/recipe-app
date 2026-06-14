import { getAllStandaloneRecipes } from '@/lib/queries'
import { RecipeForm } from '@/components/recipe-form'

export default async function NewRecipePage() {
  const allRecipes = await getAllStandaloneRecipes()
  return (
    <RecipeForm
      initialData={{
        name: '',
        description: '',
        timeMinutes: '',
        calories: '',
        proteinGrams: '',
        fatGrams: '',
        servings: '2',
        isStandalone: true,
        ingredientsText: '',
        stepsText: '',
        components: [],
      }}
      allRecipes={allRecipes}
    />
  )
}
