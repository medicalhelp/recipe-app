'use client'

import { useContext } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ModalContext } from '@/components/recipe-modal'

export function ModalHeroImage({ src, alt, slug }: { src: string; alt: string; slug: string }) {
  const ctx = useContext(ModalContext)

  return (
    <motion.div
      layoutId={`recipe-image-${slug}`}
      className="w-full aspect-[4/3] overflow-hidden rounded-t-2xl"
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      onLayoutAnimationComplete={() => ctx?.onImageSettled()}
    >
      <Image
        src={src}
        alt={alt}
        width={800}
        height={600}
        className="w-full h-full object-cover"
        priority
      />
    </motion.div>
  )
}
