import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import LegalContent from './legal-content'

export const metadata = {
  title: 'Mentions légales',
  description: 'Découvrez nos mentions légales, votre supermarché en ligne à Nador.',
}

export default function LegalPage() {
  return (
    <Suspense
      fallback={
        <div className="container-custom py-20 flex justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      }
    >
      <LegalContent/>
    </Suspense>
  )
}