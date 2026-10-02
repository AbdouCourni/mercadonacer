import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import TermsContent from './terms-content'

export const metadata = {
  title: 'Conditions d\'utilisation',
  description: 'Découvrez nos conditions d\'utilisation, votre supermarché en ligne à Nador.',
}

export default function TermsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-custom py-20 flex justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      }
    >
      <TermsContent/>
    </Suspense>
  )
}