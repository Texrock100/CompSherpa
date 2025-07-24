import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../Lib/auth'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CompSherpa - Your AI Salary Negotiation Coach',
  description: 'Get personalized salary insights and negotiation strategies for Nurse Practitioners and healthcare professionals.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'CompSherpa - Your AI Salary Negotiation Coach',
    description: 'Get personalized salary insights and negotiation strategies for Nurse Practitioners and healthcare professionals.',
    type: 'website',
    images: [
      {
        url: '/logo.svg',
        width: 120,
        height: 120,
        alt: 'CompSherpa Logo - Yak mascot for salary negotiation'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CompSherpa - Your AI Salary Negotiation Coach',
    description: 'Get personalized salary insights and negotiation strategies for Nurse Practitioners and healthcare professionals.',
    images: ['/logo.svg']
  }
}

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/icon.svg" type="image/svg+xml" />
          <link rel="alternate icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/icon.svg" />
        </head>
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </AuthProvider>
  )
}