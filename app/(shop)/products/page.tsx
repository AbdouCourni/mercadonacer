// app/(shop)/checkout/success/page.tsx
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import ProductsContent from './productscontent'

export default function CheckoutPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            }
        >
            <ProductsContent/>
        </Suspense>
    )
}