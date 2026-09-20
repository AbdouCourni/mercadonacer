// app/(shop)/checkout/success/page.tsx
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import CartList from './cart-list'

export default function CheckoutSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            }
        >
            <CartList/>
        </Suspense>
    )
}