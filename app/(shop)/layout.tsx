// File: app/(shop)/layout.tsx
// Path: /app/(shop)/layout.tsx
// Description: Shop layout with header and footer

import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-[72px] md:pt-[88px] lg:pt-[130px]">
        {children}
      </main>
      <Footer />
    </div>
  )
}