import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import PrivacyContent from './privacy-Content'

export const metadata = {
  title: 'Politique de confidentialité',
  description: 'Découvrez notre politique de confidentialité, votre supermarché en ligne à Nador.',
}

export default function PrivacyPage() {
  return (
    <Suspense
      fallback={
        <div className="container-custom py-20 flex justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      }
    >
      <PrivacyContent/>
    </Suspense>
  )
}