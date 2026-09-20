// app/(shop)/checkout/success/page.tsx
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import CheckoutContent from './checkoutcontent'

export default function CheckoutPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            }
        >
            <CheckoutContent />
        </Suspense>
    )
}