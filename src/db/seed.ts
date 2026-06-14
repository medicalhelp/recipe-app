import { db } from './index'
import { recipes, recipeComponents, ingredients, steps } from './schema'

async function seed() {
  console.log('Seeding...')

  await db.delete(steps)
  await db.delete(ingredients)
  await db.delete(recipeComponents)
  await db.delete(recipes)

  // ── Standalone component recipes ──────────────────────────────────────────

  const [guacamole] = await db.insert(recipes).values({
    slug: 'guacamole',
    name: 'Guacamole',
    timeMinutes: 10,
    calories: 180,
    proteinGrams: 2,
    servings: 2,
    isStandalone: true,
  }).returning()

  await db.insert(ingredients).values([
    { recipeId: guacamole.id, name: 'ripe avocados', amount: '2', sortOrder: 0 },
    { recipeId: guacamole.id, name: 'small tomato, finely diced', amount: '½', sortOrder: 1 },
    { recipeId: guacamole.id, name: 'red onion, finely diced', amount: '1', sortOrder: 2 },
    { recipeId: guacamole.id, name: 'lime, juiced', amount: '1', sortOrder: 3 },
    { recipeId: guacamole.id, name: 'Salt', sortOrder: 4 },
  ])
  await db.insert(steps).values([
    { recipeId: guacamole.id, text: 'Mash the avocados with a fork — keep it slightly chunky.', sortOrder: 0 },
    { recipeId: guacamole.id, text: 'Mix in tomato, red onion, lime juice, and salt.', sortOrder: 1 },
    { recipeId: guacamole.id, text: 'Taste and adjust salt or lime.', sortOrder: 2 },
    { recipeId: guacamole.id, text: 'Cover with plastic wrap directly on the surface to prevent browning.', sortOrder: 3 },
  ])

  const [groundBeef] = await db.insert(recipes).values({
    slug: 'ground-beef-with-vegetables',
    name: 'Ground Beef with Vegetables',
    timeMinutes: 20,
    calories: 420,
    proteinGrams: 35,
    servings: 2,
    isStandalone: true,
  }).returning()

  await db.insert(ingredients).values([
    { recipeId: groundBeef.id, name: 'ground beef', amount: '400', unit: 'g', sortOrder: 0 },
    { recipeId: groundBeef.id, name: 'small red onion, diced', amount: '1', sortOrder: 1 },
    { recipeId: groundBeef.id, name: 'small zucchini, finely diced', amount: '1', sortOrder: 2 },
    { recipeId: groundBeef.id, name: 'garlic clove, minced', amount: '1', sortOrder: 3 },
    { recipeId: groundBeef.id, name: 'cumin', amount: '1', unit: 'tsp', sortOrder: 4 },
    { recipeId: groundBeef.id, name: 'paprika', amount: '1', unit: 'tsp', sortOrder: 5 },
    { recipeId: groundBeef.id, name: 'chili powder', amount: '½', unit: 'tsp', sortOrder: 6 },
    { recipeId: groundBeef.id, name: 'Salt & pepper', sortOrder: 7 },
    { recipeId: groundBeef.id, name: 'Olive oil', sortOrder: 8 },
  ])
  await db.insert(steps).values([
    { recipeId: groundBeef.id, text: 'Heat a pan over medium-high heat with a bit of olive oil.', sortOrder: 0 },
    { recipeId: groundBeef.id, text: 'Add onion and cook 2–3 minutes until soft.', sortOrder: 1 },
    { recipeId: groundBeef.id, text: 'Add garlic and zucchini, cook another 2 minutes.', sortOrder: 2 },
    { recipeId: groundBeef.id, text: 'Add ground beef. Break it up and cook until browned.', sortOrder: 3 },
    { recipeId: groundBeef.id, text: 'Add cumin, paprika, chili powder, salt, and pepper.', sortOrder: 4 },
    { recipeId: groundBeef.id, text: 'Cook until slightly caramelized and most moisture is gone.', sortOrder: 5 },
    { recipeId: groundBeef.id, text: 'Taste and adjust seasoning.', sortOrder: 6 },
  ])

  const [ragu] = await db.insert(recipes).values({
    slug: 'ragu-bolognese',
    name: 'Ragù Bolognese',
    timeMinutes: 150,
    calories: 520,
    proteinGrams: 42,
    servings: 4,
    isStandalone: true,
  }).returning()

  await db.insert(ingredients).values([
    { recipeId: ragu.id, name: 'ground beef', amount: '300', unit: 'g', sortOrder: 0 },
    { recipeId: ragu.id, name: 'ground pork', amount: '200', unit: 'g', sortOrder: 1 },
    { recipeId: ragu.id, name: 'pancetta, finely diced', amount: '100', unit: 'g', sortOrder: 2 },
    { recipeId: ragu.id, name: 'onion, finely diced', amount: '1', sortOrder: 3 },
    { recipeId: ragu.id, name: 'celery stalks, finely diced', amount: '2', sortOrder: 4 },
    { recipeId: ragu.id, name: 'carrot, finely diced', amount: '1', sortOrder: 5 },
    { recipeId: ragu.id, name: 'garlic cloves, minced', amount: '2', sortOrder: 6 },
    { recipeId: ragu.id, name: 'tomato paste', amount: '2', unit: 'tbsp', sortOrder: 7 },
    { recipeId: ragu.id, name: 'crushed tomatoes', amount: '400', unit: 'g', sortOrder: 8 },
    { recipeId: ragu.id, name: 'red wine', amount: '200', unit: 'ml', sortOrder: 9 },
    { recipeId: ragu.id, name: 'whole milk', amount: '100', unit: 'ml', sortOrder: 10 },
    { recipeId: ragu.id, name: 'Olive oil', sortOrder: 11 },
    { recipeId: ragu.id, name: 'Salt & pepper', sortOrder: 12 },
  ])
  await db.insert(steps).values([
    { recipeId: ragu.id, text: 'Heat olive oil in a large heavy pan over medium heat.', sortOrder: 0 },
    { recipeId: ragu.id, text: 'Add pancetta and cook until lightly crispy.', sortOrder: 1 },
    { recipeId: ragu.id, text: 'Add onion, celery, and carrot. Cook 8–10 minutes until soft and sweet.', sortOrder: 2 },
    { recipeId: ragu.id, text: 'Add garlic and cook 1 more minute.', sortOrder: 3 },
    { recipeId: ragu.id, text: 'Add ground beef and pork. Break up well and cook until all liquid evaporates.', sortOrder: 4 },
    { recipeId: ragu.id, text: 'Pour in red wine and cook until fully evaporated.', sortOrder: 5 },
    { recipeId: ragu.id, text: 'Stir in tomato paste and cook 2 minutes.', sortOrder: 6 },
    { recipeId: ragu.id, text: 'Add crushed tomatoes and milk. Stir well.', sortOrder: 7 },
    { recipeId: ragu.id, text: 'Reduce heat to low and simmer uncovered for at least 2 hours, stirring occasionally.', sortOrder: 8 },
    { recipeId: ragu.id, text: 'Season generously with salt and pepper.', sortOrder: 9 },
  ])

  const [spaghetti] = await db.insert(recipes).values({
    slug: 'spaghetti',
    name: 'Spaghetti',
    timeMinutes: 12,
    calories: 350,
    proteinGrams: 12,
    servings: 2,
    isStandalone: true,
  }).returning()

  await db.insert(ingredients).values([
    { recipeId: spaghetti.id, name: 'spaghetti', amount: '200', unit: 'g', sortOrder: 0 },
    { recipeId: spaghetti.id, name: 'Water', sortOrder: 1 },
    { recipeId: spaghetti.id, name: 'Salt', sortOrder: 2 },
  ])
  await db.insert(steps).values([
    { recipeId: spaghetti.id, text: 'Bring a large pot of water to a boil.', sortOrder: 0 },
    { recipeId: spaghetti.id, text: 'Salt generously — the water should taste like the sea.', sortOrder: 1 },
    { recipeId: spaghetti.id, text: 'Cook spaghetti according to package instructions until al dente.', sortOrder: 2 },
    { recipeId: spaghetti.id, text: 'Reserve a cup of pasta water before draining.', sortOrder: 3 },
    { recipeId: spaghetti.id, text: 'Drain and use immediately.', sortOrder: 4 },
  ])

  const [brusselsSprouts] = await db.insert(recipes).values({
    slug: 'roasted-brussels-sprouts',
    name: 'Roasted Brussels Sprouts',
    timeMinutes: 25,
    calories: 180,
    proteinGrams: 6,
    servings: 2,
    isStandalone: true,
  }).returning()

  await db.insert(ingredients).values([
    { recipeId: brusselsSprouts.id, name: 'Brussels sprouts, halved', amount: '400', unit: 'g', sortOrder: 0 },
    { recipeId: brusselsSprouts.id, name: 'olive oil', amount: '2', unit: 'tbsp', sortOrder: 1 },
    { recipeId: brusselsSprouts.id, name: 'Salt & pepper', sortOrder: 2 },
    { recipeId: brusselsSprouts.id, name: 'Lemon, for serving', amount: '½', sortOrder: 3 },
  ])
  await db.insert(steps).values([
    { recipeId: brusselsSprouts.id, text: 'Preheat oven to 220°C / 425°F.', sortOrder: 0 },
    { recipeId: brusselsSprouts.id, text: 'Toss Brussels sprouts with olive oil, salt, and pepper.', sortOrder: 1 },
    { recipeId: brusselsSprouts.id, text: 'Spread in a single layer on a baking sheet, cut side down.', sortOrder: 2 },
    { recipeId: brusselsSprouts.id, text: 'Roast 20–25 minutes until golden and crispy.', sortOrder: 3 },
    { recipeId: brusselsSprouts.id, text: 'Finish with a squeeze of lemon.', sortOrder: 4 },
  ])

  const [friedRice] = await db.insert(recipes).values({
    slug: 'vegetable-fried-rice',
    name: 'Vegetable Fried Rice',
    timeMinutes: 25,
    calories: 480,
    proteinGrams: 10,
    servings: 2,
    isStandalone: true,
  }).returning()

  await db.insert(ingredients).values([
    { recipeId: friedRice.id, name: 'cooked rice, day-old', amount: '300', unit: 'g', sortOrder: 0 },
    { recipeId: friedRice.id, name: 'eggs', amount: '2', sortOrder: 1 },
    { recipeId: friedRice.id, name: 'carrot, finely diced', amount: '1', sortOrder: 2 },
    { recipeId: friedRice.id, name: 'frozen peas', amount: '1', unit: 'cup', sortOrder: 3 },
    { recipeId: friedRice.id, name: 'spring onions, sliced', amount: '2', sortOrder: 4 },
    { recipeId: friedRice.id, name: 'soy sauce', amount: '2', unit: 'tbsp', sortOrder: 5 },
    { recipeId: friedRice.id, name: 'sesame oil', amount: '1', unit: 'tsp', sortOrder: 6 },
    { recipeId: friedRice.id, name: 'Vegetable oil', sortOrder: 7 },
    { recipeId: friedRice.id, name: 'Salt & pepper', sortOrder: 8 },
  ])
  await db.insert(steps).values([
    { recipeId: friedRice.id, text: 'Heat oil in a wok or large pan over high heat.', sortOrder: 0 },
    { recipeId: friedRice.id, text: 'Scramble the eggs briefly, then push to the side.', sortOrder: 1 },
    { recipeId: friedRice.id, text: 'Add carrot and peas, stir-fry 2–3 minutes.', sortOrder: 2 },
    { recipeId: friedRice.id, text: 'Add cold rice and break up any clumps.', sortOrder: 3 },
    { recipeId: friedRice.id, text: 'Stir in soy sauce and sesame oil.', sortOrder: 4 },
    { recipeId: friedRice.id, text: 'Toss everything over high heat for 2–3 minutes.', sortOrder: 5 },
    { recipeId: friedRice.id, text: 'Finish with spring onions and season to taste.', sortOrder: 6 },
  ])

  // ── Inline-only component recipes ────────────────────────────────────────

  const [tacoServing] = await db.insert(recipes).values({
    slug: 'beef-taco-serving',
    name: 'For serving',
    servings: 2,
    isStandalone: false,
  }).returning()

  await db.insert(ingredients).values([
    { recipeId: tacoServing.id, name: 'soft flour tortillas', amount: '4', sortOrder: 0 },
    { recipeId: tacoServing.id, name: 'fresh parsley, finely chopped', sortOrder: 1 },
    { recipeId: tacoServing.id, name: 'Lime wedges', sortOrder: 2 },
  ])
  await db.insert(steps).values([
    { recipeId: tacoServing.id, text: 'Heat tortillas in a dry pan for 20–30 seconds per side or warm in the oven wrapped in foil.', sortOrder: 0 },
    { recipeId: tacoServing.id, text: 'Spread a generous layer of guacamole on each tortilla.', sortOrder: 1 },
    { recipeId: tacoServing.id, text: 'Add the seasoned beef mixture.', sortOrder: 2 },
    { recipeId: tacoServing.id, text: 'Top with fresh tomato and chopped cilantro.', sortOrder: 3 },
    { recipeId: tacoServing.id, text: 'Finish with a squeeze of lime.', sortOrder: 4 },
  ])

  const [boloServing] = await db.insert(recipes).values({
    slug: 'bolognese-serving',
    name: 'For serving',
    servings: 2,
    isStandalone: false,
  }).returning()

  await db.insert(ingredients).values([
    { recipeId: boloServing.id, name: 'Parmigiano Reggiano, freshly grated', sortOrder: 0 },
    { recipeId: boloServing.id, name: 'Fresh basil leaves', sortOrder: 1 },
    { recipeId: boloServing.id, name: 'Extra virgin olive oil', sortOrder: 2 },
  ])
  await db.insert(steps).values([
    { recipeId: boloServing.id, text: 'Plate the spaghetti in a shallow bowl.', sortOrder: 0 },
    { recipeId: boloServing.id, text: 'Spoon the ragù generously over the pasta. Add a splash of pasta water if needed to loosen.', sortOrder: 1 },
    { recipeId: boloServing.id, text: 'Finish with freshly grated Parmigiano Reggiano, a few basil leaves, and a drizzle of extra virgin olive oil.', sortOrder: 2 },
  ])

  // ── Parent recipes ────────────────────────────────────────────────────────

  const [beefTaco] = await db.insert(recipes).values({
    slug: 'beef-taco',
    name: 'Beef Taco',
    timeMinutes: 30,
    calories: 1230,
    proteinGrams: 23,
    servings: 2,
    isStandalone: true,
  }).returning()

  await db.insert(recipeComponents).values([
    { parentRecipeId: beefTaco.id, childRecipeId: guacamole.id, portionMultiplier: '0.5', sortOrder: 0 },
    { parentRecipeId: beefTaco.id, childRecipeId: groundBeef.id, portionMultiplier: '1', sortOrder: 1 },
    { parentRecipeId: beefTaco.id, childRecipeId: tacoServing.id, portionMultiplier: '1', sortOrder: 2 },
  ])

  const [bolognese] = await db.insert(recipes).values({
    slug: 'spaghetti-bolognese',
    name: 'Spaghetti Bolognese',
    timeMinutes: 165,
    calories: 870,
    proteinGrams: 54,
    servings: 2,
    isStandalone: true,
  }).returning()

  await db.insert(recipeComponents).values([
    { parentRecipeId: bolognese.id, childRecipeId: ragu.id, portionMultiplier: '0.5', sortOrder: 0 },
    { parentRecipeId: bolognese.id, childRecipeId: spaghetti.id, portionMultiplier: '1', sortOrder: 1 },
    { parentRecipeId: bolognese.id, childRecipeId: boloServing.id, portionMultiplier: '1', sortOrder: 2 },
  ])

  console.log('Done.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
