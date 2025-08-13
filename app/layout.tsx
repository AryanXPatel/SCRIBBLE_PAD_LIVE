import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Scribble Pad',
  description: 'Scribble Pad - A distraction-free writing experience',
  generator: 'Scribble Pad 2.1',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
