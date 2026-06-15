'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import type { Recipe } from '@/lib/queries'
import { formatMeta } from '@/lib/utils'

const MotionLink = motion.create(Link)

const cardVariants = {
  rest:  { y: 0 },
  hover: { y: -4, transition: { type: 'spring', stiffness: 420, damping: 28 } },
}

const imageVariants = {
  rest:  { scale: 1 },
  hover: { scale: 1.05, transition: { type: 'spring', stiffness: 360, damping: 28 } },
}

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <MotionLink
      href={`/recipes/${recipe.slug}`}
      className="block"
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={cardVariants}
    >
      <motion.div
        layoutId={`recipe-image-${recipe.slug}`}
        className="aspect-square overflow-hidden bg-[var(--border)] mb-3"
        transition={{ type: 'spring', damping: 32, stiffness: 320, mass: 0.9 }}
      >
        {recipe.imageUrl ? (
          <motion.div className="w-full h-full" variants={imageVariants}>
            <Image
              src={`/api/images/${recipe.imageUrl}`}
              alt={recipe.name}
              width={600}
              height={600}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ) : (
          <div className="w-full h-full bg-[var(--border)]" />
        )}
      </motion.div>
      <p className="type-heading mb-1">{recipe.name}</p>
      <p className="type-ui text-[var(--muted)]">{formatMeta(recipe)}</p>
    </MotionLink>
  )
}
