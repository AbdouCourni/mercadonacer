import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import DeliveryContent from './delivery-content'

export const metadata = {
  title: 'Livraison',
  description: 'Découvrez notre politique de livraison, votre supermarché en ligne à Nador.',
}

export default function DeliveryPage() {
  return (
    <Suspense
      fallback={
        <div className="container-custom py-20 flex justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      }
    >
      <DeliveryContent/>
    </Suspense>
  )
}