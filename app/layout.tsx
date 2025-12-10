import type { Metadata } from 'next'
import { Sora, Syne } from 'next/font/google'
import './globals.css'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['300', '400', '500', '600', '700'],
})

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Make Your Avatar | Z-Image AI',
  description: 'Train your personal AI model and create stunning avatars with Z-Image',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${sora.variable} ${syne.variable}`}>
      <body className="min-h-screen overflow-x-hidden font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
