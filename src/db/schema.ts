import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const recipes = pgTable('recipes', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  timeMinutes: integer('time_minutes'),
  calories: integer('calories'),
  proteinGrams: integer('protein_grams'),
  fatGrams: integer('fat_grams'),
  servings: integer('servings').notNull().default(2),
  isStandalone: boolean('is_standalone').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const recipeComponents = pgTable('recipe_components', {
  id: uuid('id').primaryKey().defaultRandom(),
  parentRecipeId: uuid('parent_recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  childRecipeId: uuid('child_recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'restrict' }),
  displayName: text('display_name'),
  portionMultiplier: text('portion_multiplier').notNull().default('1'),
  notes: text('notes'),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const componentAlternatives = pgTable('component_alternatives', {
  id: uuid('id').primaryKey().defaultRandom(),
  componentId: uuid('component_id')
    .notNull()
    .references(() => recipeComponents.id, { onDelete: 'cascade' }),
  recipeId: uuid('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'restrict' }),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const ingredients = pgTable('ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipeId: uuid('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  amount: text('amount'),
  unit: text('unit'),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const steps = pgTable('steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipeId: uuid('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const recipesRelations = relations(recipes, ({ many }) => ({
  asParent: many(recipeComponents, { relationName: 'parent' }),
  asChild: many(recipeComponents, { relationName: 'child' }),
  ingredients: many(ingredients),
  steps: many(steps),
}))

export const recipeComponentsRelations = relations(recipeComponents, ({ one, many }) => ({
  parentRecipe: one(recipes, {
    fields: [recipeComponents.parentRecipeId],
    references: [recipes.id],
    relationName: 'parent',
  }),
  childRecipe: one(recipes, {
    fields: [recipeComponents.childRecipeId],
    references: [recipes.id],
    relationName: 'child',
  }),
  alternatives: many(componentAlternatives),
}))

export const componentAlternativesRelations = relations(componentAlternatives, ({ one }) => ({
  component: one(recipeComponents, {
    fields: [componentAlternatives.componentId],
    references: [recipeComponents.id],
  }),
  recipe: one(recipes, {
    fields: [componentAlternatives.recipeId],
    references: [recipes.id],
  }),
}))

export const ingredientsRelations = relations(ingredients, ({ one }) => ({
  recipe: one(recipes, { fields: [ingredients.recipeId], references: [recipes.id] }),
}))

export const stepsRelations = relations(steps, ({ one }) => ({
  recipe: one(recipes, { fields: [steps.recipeId], references: [recipes.id] }),
}))
