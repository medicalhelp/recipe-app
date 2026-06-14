'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { saveRecipe, uploadRecipeImage } from '@/lib/actions'
import type { SaveRecipeInput } from '@/lib/actions'
import type { Recipe } from '@/lib/queries'
import { ImageUploadZone } from '@/components/image-upload'

// ── Draft types ───────────────────────────────────────────────────────────────

type CompDraft = {
  _key: string
  id?: string
  childRecipeId?: string
  inlineRecipeId?: string
  name: string
  isExisting: boolean
  portionMultiplier: string
  notes: string
  ingredientsText: string
  stepsText: string
}

type Draft = {
  name: string
  description: string
  timeMinutes: string
  calories: string
  proteinGrams: string
  fatGrams: string
  servings: string
  isStandalone: boolean
  ingredientsText: string
  stepsText: string
  components: CompDraft[]
}

export type InitialRecipeData = {
  id?: string
  slug?: string
  imageUrl?: string | null
  name: string
  description: string
  timeMinutes: string
  calories: string
  proteinGrams: string
  fatGrams: string
  servings: string
  isStandalone: boolean
  ingredientsText: string
  stepsText: string
  components: Omit<CompDraft, '_key'>[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const k = () => Math.random().toString(36).slice(2)

function withKeys(data: InitialRecipeData): Draft {
  return {
    ...data,
    components: data.components.map(c => ({ ...c, _key: k() })),
  }
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function emptyComp(): CompDraft {
  return { _key: k(), name: '', isExisting: false, portionMultiplier: '1', notes: '', ingredientsText: '', stepsText: '' }
}

function fmtMultiplier(v: string) {
  const n = parseFloat(v) || 1
  return Number.isInteger(n) ? n.toString() : n.toString()
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SubSection({
  label, value, onChange, readOnly, placeholder,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  readOnly?: boolean
  placeholder?: string
}) {
  return (
    <div className="rounded-xl bg-[var(--background)] p-3.5">
      <p className="type-label font-semibold mb-2">{label}</p>
      <textarea
        value={value}
        onChange={readOnly ? undefined : e => onChange?.(e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        rows={4}
        className={`w-full bg-transparent type-ui leading-relaxed resize-none focus:outline-none placeholder:text-[var(--muted)] ${readOnly ? 'opacity-50 cursor-default' : ''}`}
      />
    </div>
  )
}

function MetaField({
  icon, label, unit, value, onChange,
}: {
  icon: React.ReactNode
  label: string
  unit: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="bg-[var(--background)] rounded-xl px-4 py-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 type-ui">
        <span className="text-[var(--muted)]">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-1 type-ui text-[var(--muted)]">
        {!value && <span>Add</span>}
        <input
          type="number"
          min="0"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-14 text-right bg-transparent focus:outline-none text-[var(--foreground)]"
        />
        <span>{unit}</span>
      </div>
    </div>
  )
}

function CompNameInput({
  comp, allRecipes, onChange,
}: {
  comp: CompDraft
  allRecipes: Recipe[]
  onChange: (c: CompDraft) => void
}) {
  const [open, setOpen] = useState(false)
  const filtered = allRecipes.filter(
    r => comp.name.length > 0 && r.name.toLowerCase().includes(comp.name.toLowerCase())
  )

  if (comp.isExisting) {
    return (
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="type-heading font-bold truncate">{comp.name}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--muted)] shrink-0">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </div>
    )
  }

  return (
    <div className="relative flex-1 min-w-0">
      <input
        value={comp.name}
        onChange={e => onChange({ ...comp, name: e.target.value, isExisting: false, childRecipeId: undefined })}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Give me a name"
        className="w-full type-heading bg-transparent focus:outline-none placeholder:text-[var(--muted)]"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 top-full left-0 right-0 mt-1 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm max-h-48 overflow-y-auto">
          {filtered.map(r => (
            <li
              key={r.id}
              onMouseDown={() => onChange({
                ...comp,
                name: r.name,
                isExisting: true,
                childRecipeId: r.id,
                inlineRecipeId: undefined,
                ingredientsText: comp.ingredientsText,
                stepsText: comp.stepsText,
              })}
              className="px-4 py-2.5 type-ui cursor-pointer hover:bg-[var(--background)] transition-colors"
            >
              {r.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ComponentCard({
  comp, index, total, allRecipes, onChange, onRemove, onMove,
}: {
  comp: CompDraft
  index: number
  total: number
  allRecipes: Recipe[]
  onChange: (c: CompDraft) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
}) {
  function adjustMultiplier(delta: number) {
    const curr = parseFloat(comp.portionMultiplier) || 1
    const next = Math.max(0.25, Math.round((curr + delta) * 100) / 100)
    onChange({ ...comp, portionMultiplier: next.toString() })
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col shrink-0">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="text-[var(--muted)] text-[13px] leading-tight disabled:opacity-25 hover:text-[var(--foreground)] transition-colors">↑</button>
          <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} className="text-[var(--muted)] text-[13px] leading-tight disabled:opacity-25 hover:text-[var(--foreground)] transition-colors">↓</button>
        </div>
        <CompNameInput comp={comp} allRecipes={allRecipes} onChange={onChange} />
        <button type="button" onClick={onRemove} className="shrink-0 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors ml-1">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>

      {/* Servings/multiplier */}
      <div className="flex items-center gap-2 type-ui">
        <span className="text-[var(--muted)]">Servings:</span>
        <button type="button" onClick={() => adjustMultiplier(-0.25)} className="w-5 h-5 flex items-center justify-center hover:text-[var(--accent)] transition-colors font-light text-base">−</button>
        <span className="min-w-[2ch] text-center tabular-nums">{fmtMultiplier(comp.portionMultiplier)}</span>
        <button type="button" onClick={() => adjustMultiplier(0.25)} className="w-5 h-5 flex items-center justify-center hover:text-[var(--accent)] transition-colors font-light text-base">+</button>
      </div>

      {/* Ingredients */}
      <SubSection
        label="Ingredients"
        value={comp.ingredientsText}
        onChange={comp.isExisting ? undefined : t => onChange({ ...comp, ingredientsText: t })}
        readOnly={comp.isExisting}
        placeholder={"e.g. 1 cup flour\ne.g. 2 eggs"}
      />

      {/* Instructions */}
      <SubSection
        label="Instructions"
        value={comp.stepsText}
        onChange={comp.isExisting ? undefined : t => onChange({ ...comp, stepsText: t })}
        readOnly={comp.isExisting}
        placeholder={"e.g. Combine dry ingredients\ne.g. Add wet ingredients and mix"}
      />

      {/* Notes */}
      <SubSection
        label="Notes"
        value={comp.notes}
        onChange={t => onChange({ ...comp, notes: t })}
        placeholder="e.g. Leave out thyme — too overpowering here"
      />
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────

export function RecipeForm({ initialData, allRecipes }: { initialData: InitialRecipeData; allRecipes: Recipe[] }) {
  const [draft, setDraft] = useState<Draft>(() => withKeys(initialData))
  const [isPending, startTransition] = useTransition()
  const [pendingImage, setPendingImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const standaloneRecipes = allRecipes.filter(r => r.isStandalone && r.id !== initialData.id)

  function updateComp(i: number, comp: CompDraft) {
    setDraft(d => ({ ...d, components: d.components.map((c, j) => j === i ? comp : c) }))
  }

  function moveComp(i: number, dir: -1 | 1) {
    setDraft(d => {
      const comps = [...d.components]
      const t = i + dir
      if (t < 0 || t >= comps.length) return d
      ;[comps[i], comps[t]] = [comps[t], comps[i]]
      return { ...d, components: comps }
    })
  }

  function handleSubmit() {
    const input: SaveRecipeInput = {
      id: initialData.id,
      slug: initialData.slug ?? slugify(draft.name),
      name: draft.name,
      description: draft.description,
      timeMinutes: draft.timeMinutes ? parseInt(draft.timeMinutes) : null,
      calories: draft.calories ? parseInt(draft.calories) : null,
      proteinGrams: draft.proteinGrams ? parseInt(draft.proteinGrams) : null,
      fatGrams: draft.fatGrams ? parseInt(draft.fatGrams) : null,
      servings: parseInt(draft.servings) || 2,
      isStandalone: draft.isStandalone,
      ingredientsText: draft.ingredientsText,
      stepsText: draft.stepsText,
      components: draft.components
        .filter(c => c.name.trim() || c.childRecipeId)
        .map((c, i) => ({
          id: c.id,
          childRecipeId: c.childRecipeId,
          inlineRecipeId: c.inlineRecipeId,
          name: c.name,
          portionMultiplier: c.portionMultiplier,
          notes: c.notes,
          sortOrder: i,
          ingredientsText: c.ingredientsText,
          stepsText: c.stepsText,
        })),
    }
    startTransition(async () => {
      const { slug, id } = await saveRecipe(input)
      if (pendingImage) {
        const fd = new FormData()
        fd.append('image', pendingImage)
        await uploadRecipeImage(id, fd)
      }
      router.push(initialData.id ? `/recipes/${slug}` : `/recipes/${slug}/edit`)
    })
  }

  const hasComponents = draft.components.length > 0

  return (
    <div className="min-h-screen pb-32" style={{ background: 'var(--background)' }}>
      {/* Minimal top bar */}
      <div className="sticky top-0 z-10 px-5 py-3 flex items-center justify-between bg-[var(--background)]/90 backdrop-blur-sm border-b border-[var(--border)]">
        <button type="button" onClick={() => router.back()} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !draft.name.trim()}
          className="type-ui font-medium text-[var(--accent)] hover:opacity-70 disabled:opacity-30 transition-opacity"
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-5">

        {/* Image */}
        <div className="rounded-[20px] border border-[var(--border)] overflow-hidden">
          {initialData.id ? (
            <ImageUploadZone recipeId={initialData.id} imageFilename={initialData.imageUrl ?? null} />
          ) : (
            <>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
              <div
                className="relative w-full aspect-[4/3] cursor-pointer group overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[var(--muted)] bg-[var(--border)]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="type-ui">Add image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            </>
          )}
        </div>

        {/* Name + Description */}
        <div className="text-center space-y-1 px-2 py-2">
          <input
            value={draft.name}
            onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
            placeholder="Give me a name"
            className="w-full text-center type-display bg-transparent focus:outline-none placeholder:text-[var(--muted)]"
          />
          <input
            value={draft.description}
            onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
            placeholder="Add a description"
            className="w-full text-center type-body text-[var(--muted)] bg-transparent focus:outline-none placeholder:text-[var(--border)]"
          />
        </div>

        {/* Meta 2×2 */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 grid grid-cols-2 gap-2">
          <MetaField
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
            label="Time" unit="min" value={draft.timeMinutes} onChange={v => setDraft(d => ({ ...d, timeMinutes: v }))}
          />
          <MetaField
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c0 6-7 9-7 13a7 7 0 0 0 14 0c0-4-7-7-7-13z"/></svg>}
            label="Calories" unit="kcal" value={draft.calories} onChange={v => setDraft(d => ({ ...d, calories: v }))}
          />
          <MetaField
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12M6 20h12M6 4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2M6 20a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2"/></svg>}
            label="Protein" unit="g" value={draft.proteinGrams} onChange={v => setDraft(d => ({ ...d, proteinGrams: v }))}
          />
          <MetaField
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>}
            label="Fat" unit="g" value={draft.fatGrams} onChange={v => setDraft(d => ({ ...d, fatGrams: v }))}
          />
        </div>

        {/* Standalone toggle */}
        <label className="flex items-center gap-2 cursor-pointer w-fit px-1">
          <input type="checkbox" checked={draft.isStandalone} onChange={e => setDraft(d => ({ ...d, isStandalone: e.target.checked }))} className="accent-[var(--accent)]" />
          <span className="type-ui text-[var(--muted)]">Show in recipe list</span>
        </label>

        {/* Parent ingredients/steps — only when no components */}
        {!hasComponents && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3">
            <SubSection
              label="Ingredients"
              value={draft.ingredientsText}
              onChange={t => setDraft(d => ({ ...d, ingredientsText: t }))}
              placeholder={"e.g. 1 cup flour\ne.g. 2 eggs"}
            />
            <SubSection
              label="Instructions"
              value={draft.stepsText}
              onChange={t => setDraft(d => ({ ...d, stepsText: t }))}
              placeholder={"e.g. Combine dry ingredients\ne.g. Add wet ingredients and mix"}
            />
          </div>
        )}

        {/* Component cards */}
        {draft.components.map((comp, i) => (
          <ComponentCard
            key={comp._key}
            comp={comp}
            index={i}
            total={draft.components.length}
            allRecipes={standaloneRecipes}
            onChange={c => updateComp(i, c)}
            onRemove={() => setDraft(d => ({ ...d, components: d.components.filter((_, j) => j !== i) }))}
            onMove={dir => moveComp(i, dir)}
          />
        ))}

        {/* + Add pill */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setDraft(d => ({ ...d, components: [...d.components, emptyComp()] }))}
            className="rounded-full bg-[var(--foreground)] text-[var(--background)] px-7 py-3 type-ui font-medium flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-[18px] leading-none">+</span> Add
          </button>
        </div>

      </div>
    </div>
  )
}
