import { getAllStandaloneRecipes } from '@/lib/queries'
import { RecipeBrowse } from '@/components/recipe-browse'

export default async function BrowsePage() {
  const recipes = await getAllStandaloneRecipes()
  return <RecipeBrowse recipes={recipes} />
}
