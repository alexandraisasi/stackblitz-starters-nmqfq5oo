import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nery Cell',
  description: 'Sistema de gestión para Nery Cell',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}