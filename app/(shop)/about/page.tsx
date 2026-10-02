import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import AboutContent from './about-content'

export const metadata = {
  title: 'À propos',
  description: 'Découvrez Mercado Nacer, votre supermarché en ligne à Nador.',
}

export default function AboutPage() {
  return (
    <Suspense
      fallback={
        <div className="container-custom py-20 flex justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      }
    >
      <AboutContent />
    </Suspense>
  )
}