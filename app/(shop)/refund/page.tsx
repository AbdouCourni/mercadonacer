import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import RefundContent from './refund-content'

export const metadata = {
  title: 'Politique de retour',
  description: 'Découvrez notre politique de retour, votre supermarché en ligne à Nador.',
}

export default function RefundPage() {
  return (
    <Suspense
      fallback={
        <div className="container-custom py-20 flex justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      }
    >
      <RefundContent/>
    </Suspense>
  )
}