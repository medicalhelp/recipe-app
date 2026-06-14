'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { recipes, ingredients, steps, recipeComponents } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createStorageClient } from './supabase'
import { parseIngredients, parseSteps } from './utils'

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type ComponentInput = {
  id?: string
  childRecipeId?: string
  inlineRecipeId?: string
  name: string
  portionMultiplier: string
  notes: string
  sortOrder: number
  ingredientsText: string
  stepsText: string
}

export type SaveRecipeInput = {
  id?: string
  name: string
  slug: string
  description: string
  timeMinutes: number | null
  calories: number | null
  proteinGrams: number | null
  fatGrams: number | null
  servings: number
  isStandalone: boolean
  ingredientsText: string
  stepsText: string
  components: ComponentInput[]
}

// ── Actions ───────────────────────────────────────────────────────────────────

export async function saveRecipe(input: SaveRecipeInput): Promise<{ slug: string; id: string }> {
  let recipeId: string

  const recipeFields = {
    name: input.name,
    description: input.description || null,
    timeMinutes: input.timeMinutes,
    calories: input.calories,
    proteinGrams: input.proteinGrams,
    fatGrams: input.fatGrams,
    servings: input.servings,
    isStandalone: input.isStandalone,
  }

  if (input.id) {
    await db.update(recipes).set(recipeFields).where(eq(recipes.id, input.id))
    recipeId = input.id
  } else {
    const [r] = await db.insert(recipes).values({ ...recipeFields, slug: input.slug }).returning()
    recipeId = r.id
  }

  // Replace parent ingredients/steps
  const parsedIngredients = parseIngredients(input.ingredientsText)
  const parsedSteps = parseSteps(input.stepsText)

  await db.delete(ingredients).where(eq(ingredients.recipeId, recipeId))
  await db.delete(steps).where(eq(steps.recipeId, recipeId))

  if (parsedIngredients.length > 0) {
    await db.insert(ingredients).values(
      parsedIngredients.map((ing, i) => ({
        recipeId, name: ing.name, amount: ing.amount || null, unit: ing.unit || null, sortOrder: i,
      }))
    )
  }
  if (parsedSteps.length > 0) {
    await db.insert(steps).values(
      parsedSteps.map((s, i) => ({ recipeId, text: s.text, sortOrder: i }))
    )
  }

  // Diff and update components
  const existingComps = await db.query.recipeComponents.findMany({
    where: eq(recipeComponents.parentRecipeId, recipeId),
    with: { childRecipe: true },
  })

  const keptIds = new Set(input.components.map(c => c.id).filter(Boolean))
  for (const existing of existingComps) {
    if (!keptIds.has(existing.id)) {
      await db.delete(recipeComponents).where(eq(recipeComponents.id, existing.id))
      if (!existing.childRecipe.isStandalone) {
        await db.delete(recipes).where(eq(recipes.id, existing.childRecipeId))
      }
    }
  }

  for (const comp of input.components) {
    let childRecipeId = comp.childRecipeId

    if (!childRecipeId) {
      const compIngredients = parseIngredients(comp.ingredientsText)
      const compSteps = parseSteps(comp.stepsText)

      if (comp.inlineRecipeId) {
        await db.update(recipes).set({ name: comp.name }).where(eq(recipes.id, comp.inlineRecipeId))
        childRecipeId = comp.inlineRecipeId
      } else {
        const slug = slugify(comp.name) + '-' + Math.random().toString(36).slice(2, 8)
        const [r] = await db.insert(recipes).values({ name: comp.name, slug, isStandalone: false, servings: 2 }).returning()
        childRecipeId = r.id
      }

      await db.delete(ingredients).where(eq(ingredients.recipeId, childRecipeId))
      await db.delete(steps).where(eq(steps.recipeId, childRecipeId))
      if (compIngredients.length > 0) {
        await db.insert(ingredients).values(
          compIngredients.map((ing, i) => ({
            recipeId: childRecipeId!, name: ing.name, amount: ing.amount || null, unit: ing.unit || null, sortOrder: i,
          }))
        )
      }
      if (compSteps.length > 0) {
        await db.insert(steps).values(
          compSteps.map((s, i) => ({ recipeId: childRecipeId!, text: s.text, sortOrder: i }))
        )
      }
    }

    const compRow = {
      portionMultiplier: comp.portionMultiplier,
      notes: comp.notes || null,
      sortOrder: comp.sortOrder,
    }
    if (comp.id) {
      await db.update(recipeComponents).set({ ...compRow, childRecipeId }).where(eq(recipeComponents.id, comp.id))
    } else {
      await db.insert(recipeComponents).values({ parentRecipeId: recipeId, childRecipeId: childRecipeId!, ...compRow })
    }
  }

  revalidatePath('/', 'layout')
  return { slug: input.slug, id: recipeId }
}

export async function uploadRecipeImage(recipeId: string, formData: FormData) {
  const file = formData.get('image') as File
  if (!file || file.size === 0) throw new Error('No file provided')

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const filename = `${recipeId}.${ext}`

  const supabase = createStorageClient()
  const { error } = await supabase.storage
    .from('recipe-images')
    .upload(filename, await file.arrayBuffer(), { contentType: file.type, upsert: true })

  if (error) throw error

  await db.update(recipes).set({ imageUrl: filename }).where(eq(recipes.id, recipeId))
  revalidatePath('/', 'layout')
}
