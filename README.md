# Recipe App

A personal recipe manager built around a compositional model: recipes are assembled from sub-recipes called *components*, each with their own ingredients, steps, and notes. A component can be a reusable standalone recipe (e.g. a sauce used in multiple dishes) or an inline component created only for a single parent recipe (e.g. a marinade specific to one dish).

## Tech stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| ORM | Drizzle ORM |
| Database | Supabase (PostgreSQL) |
| File storage | Supabase Storage |
| Runtime | React 19 |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create `.env.local` at the project root:

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- `DATABASE_URL` — Postgres connection string from Supabase (Settings → Database → Connection string, use the **Transaction** pooler URL with `?pgbouncer=true` for production, or the direct URL for local dev).
- `NEXT_PUBLIC_SUPABASE_URL` — found in Supabase Settings → API.
- `SUPABASE_SERVICE_ROLE_KEY` — the secret service role key, also in Settings → API. Used server-side only to upload/download images without RLS restrictions.

### 3. Push the schema

```bash
npm run db:push
```

This syncs `src/db/schema.ts` to your Supabase database. If you hit Supabase CHECK constraint errors with `db:push`, apply changes via raw SQL in the Supabase SQL editor instead.

### 4. Create the storage bucket

In Supabase → Storage, create a bucket named **`recipe-images`**. The bucket can be private; images are served through the app's own API route which uses the service role key.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

```bash
npm run dev          # Start development server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint

npm run db:push      # Push schema changes to Supabase
npm run db:generate  # Generate Drizzle migration files
npm run db:migrate   # Run generated migrations
npm run db:studio    # Open Drizzle Studio (visual DB browser)
npm run db:seed      # Seed the database (src/db/seed.ts)
```

---

## Data model

```
recipes
  id            uuid PK
  slug          text UNIQUE          — URL-safe name, e.g. "beef-tacos"
  name          text
  description   text?
  imageUrl      text?                — filename in Supabase Storage
  timeMinutes   int?
  calories      int?
  proteinGrams  int?
  fatGrams      int?
  servings      int (default 2)
  isStandalone  bool (default true)  — false = inline component only
  createdAt     timestamp

recipe_components                   — junction: parent has many child recipes
  id                uuid PK
  parentRecipeId    uuid → recipes
  childRecipeId     uuid → recipes
  displayName       text?            — overrides the child recipe's name in this context
  portionMultiplier text (default 1) — e.g. "0.5" = half a portion
  notes             text?            — prep notes specific to this usage
  sortOrder         int

ingredients
  id          uuid PK
  recipeId    uuid → recipes
  name        text
  amount      text?                  — stored as-is, e.g. "1½", "200"
  unit        text?                  — e.g. "g", "tbsp"
  sortOrder   int

steps
  id          uuid PK
  recipeId    uuid → recipes
  text        text
  sortOrder   int
```

A recipe with `isStandalone = false` is an inline component — it exists only as a child of one parent and is deleted when its parent component entry is removed. A recipe with `isStandalone = true` is a proper recipe that appears in the browse view and can be reused across multiple parents.

---

## File structure

```
src/
├── app/
│   ├── layout.tsx                     Root layout; mounts {children} and {modal} slots
│   ├── page.tsx                       Browse page — grid of all standalone recipes
│   ├── globals.css                    Design tokens, Tailwind theme, utility classes
│   │
│   ├── recipes/
│   │   ├── new/page.tsx               Create recipe form
│   │   └── [slug]/
│   │       ├── page.tsx               Full-page recipe detail view
│   │       └── edit/page.tsx          Edit recipe form
│   │
│   ├── @modal/                        Parallel route — renders on top of any page
│   │   ├── default.tsx                Empty fallback when no modal is active
│   │   └── (.)recipes/
│   │       ├── new/page.tsx           Null — prevents [slug] interceptor matching "new"
│   │       └── [slug]/
│   │           ├── page.tsx           Modal recipe detail view (intercepts /recipes/[slug])
│   │           └── edit/page.tsx      Null — prevents [slug] interceptor matching edit
│   │
│   └── api/
│       └── images/[...path]/route.ts  Proxies Supabase Storage downloads
│
├── components/
│   ├── recipe-form.tsx                Add/edit form (client component)
│   ├── servings-scaler.tsx            Interactive servings control + scaled ingredient display
│   ├── recipe-card.tsx                Card shown in the browse grid
│   ├── recipe-component-section.tsx   Read-only component section (used outside scaler)
│   ├── recipe-modal.tsx               Modal shell + close button
│   └── image-upload.tsx               Click-to-upload image zone
│
├── db/
│   ├── index.ts                       Drizzle client (singleton, cached in dev)
│   ├── schema.ts                      Table definitions and relations
│   └── seed.ts                        Optional seed data
│
└── lib/
    ├── actions.ts                     Server actions: saveRecipe, uploadRecipeImage
    ├── queries.ts                     DB read functions: getRecipeBySlug, getAllStandaloneRecipes
    ├── supabase.ts                    Supabase storage client factory
    └── utils.ts                       Pure utilities: ingredient parsing, amount scaling, formatters
```

---

## Key features

### Compositional recipes

When editing a recipe you can add *components* — named sections with their own ingredients, steps, and notes. Each component can be:

- **Inline** — created on the spot (e.g. "Marinade"). Typing a new name creates it. These are deleted automatically if the component is removed.
- **Linked** — selected from existing standalone recipes via autocomplete. Their content is shown read-only; edits must be made on the original recipe page.

Components can themselves have nested components (up to 5 levels deep, enforced in `getRecipeBySlug`).

### Plain-text ingredient and step entry

Ingredients and steps are entered as plain text in the editor — one item per line. On save, the app parses each line:

**Ingredients** (`parseIngredients` in `utils.ts`):  
Each line is parsed into `{ amount, unit, name }`. The parser recognises concatenated amounts like `200g`, numeric fractions like `1/2`, and Unicode vulgar fractions like `½`. Unknown units are left in the name.

**Steps** (`parseSteps` in `utils.ts`):  
Each non-empty line becomes one step.

Stored records are reconstructed back to plain text when loading the edit form (`ingredientsToText`, `stepsToText`).

### Servings scaler

The detail view (both modal and full-page) shows a **Serves − N +** control. Adjusting it scales every ingredient amount in the recipe and all its components by `currentServings / recipe.servings`.

Amount parsing understands: plain numbers, decimal numbers, slash fractions (`1/2`), mixed slash fractions (`1 1/2`), Unicode vulgar fractions (`½ ¼ ¾ ⅓ ⅔`), and mixed Unicode (`1½`). Amounts that don't match any of these patterns are displayed unchanged. Formatted output uses Unicode fractions where possible.

### Image handling

Images are stored in Supabase Storage under the bucket `recipe-images` with the filename `{recipeId}.{ext}`. The `imageUrl` column stores only the filename. All image reads go through `/api/images/[filename]`, which proxies the download from Supabase using the service role key and sets a one-year immutable cache header.

On the **create** flow, a file can be selected before saving. The form holds it in memory and uploads it immediately after the recipe row is created (so the ID is available for the filename). On the **edit** form, `ImageUploadZone` handles uploads directly since the ID already exists.

### Modal navigation

Clicking a recipe card on the browse page triggers a soft (client-side) navigation to `/recipes/[slug]`. The `@modal` parallel route intercepts this and renders the recipe in a modal sheet over the browse page, preserving browse scroll position.

Navigating to `/recipes/new` or `/recipes/[slug]/edit` must bypass this interceptor. Two null-returning pages (`@modal/(.)recipes/new` and `@modal/(.)recipes/[slug]/edit`) claim those routes so the `[slug]` interceptor never matches them. Edit links use `<a href>` instead of `<Link>` to force a full page load, avoiding a known Next.js issue where the children slot doesn't update when navigating away from an intercepted-route state.

---

## Design tokens

Defined in `globals.css` and mapped into the Tailwind theme:

| Token | Value | Usage |
|---|---|---|
| `--background` | `#F7F6F3` | Page and component backgrounds |
| `--foreground` | `#1C1C1A` | Primary text |
| `--muted` | `#9B9B9B` | Secondary text, placeholders, icons |
| `--accent` | `#8B7355` | Headings, active states |
| `--border` | `#E8E6E3` | Dividers, input borders, image placeholders |
| `--card` | `#FFFFFF` | Dropdown surfaces |

Typography: **Geist Sans** for body text, **Playfair Display** (italic) for recipe names and component headings.

---

## Important notes

- `src/lib/utils.ts` must remain free of DB or Node.js imports — it is imported by client components (`servings-scaler.tsx`).
- `src/lib/actions.ts` uses `'use server'`; all exports must be `async` functions. Plain utilities cannot live here.
- The Drizzle client in `src/db/index.ts` is cached on `globalThis` in development to survive Next.js hot reloads without exhausting connection pools.
- `drizzle-kit push` has a known issue with Supabase's auto-generated CHECK constraints. If it fails, apply the raw `ALTER TABLE` SQL directly in the Supabase SQL editor.
