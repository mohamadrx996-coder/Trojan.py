import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TRJ Bot - أدوات ديسكورد متقدمة',
  description: 'نسخ سيرفرات، نيوكر، ماكرو وأدوات ديسكورد احترافية',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
