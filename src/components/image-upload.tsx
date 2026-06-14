'use client'

import { useRef, useTransition } from 'react'
import Image from 'next/image'
import { uploadRecipeImage } from '@/lib/actions'

export function ImageUploadZone({
  recipeId,
  imageFilename,
}: {
  recipeId: string
  imageFilename: string | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('image', file)
    startTransition(() => uploadRecipeImage(recipeId, fd))
  }

  const src = imageFilename ? `/api/images/${imageFilename}` : null

  return (
    <div
      className="relative w-full aspect-[4/3] bg-[var(--border)] overflow-hidden cursor-pointer group"
      onClick={() => inputRef.current?.click()}
    >
      {src && (
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
          priority
        />
      )}

      <div
        className={[
          'absolute inset-0 flex items-center justify-center transition-all duration-200',
          src
            ? 'bg-black/0 group-hover:bg-black/25 opacity-0 group-hover:opacity-100'
            : 'bg-transparent opacity-100',
        ].join(' ')}
      >
        <span className={`type-ui ${src ? 'text-white' : 'text-[var(--muted)]'}`}>
          {isPending ? 'Uploading…' : src ? 'Change photo' : 'Add photo'}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
