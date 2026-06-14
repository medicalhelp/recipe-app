import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Crimson_Pro } from 'next/font/google'
import './globals.css'

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

const crimsonPro = Crimson_Pro({
  variable: '--font-crimson-pro',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '700'],
})

export const metadata: Metadata = {
  title: 'Recipes',
  description: 'A recipe app built from composable recipe components',
}

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geist.variable} ${crimsonPro.variable} h-full`}>
      <body className="min-h-full">
        {children}
        {modal}
      </body>
    </html>
  )
}
