// File: app/(shop)/terms/page.tsx
// Path: /app/(shop)/terms/page.tsx

'use client'

import { FileText } from 'lucide-react'
import { LegalPageLayout } from '@/components/LegalPageLayout'
import { useLegalLanguage } from '@/lib/legal-language'

export default function TermsContent() {
  const { language } = useLegalLanguage()
  const ar = language === 'ar'

  return (
    <LegalPageLayout
      titleFr="Conditions d'utilisation"
      titleAr="شروط الاستخدام"
      icon={<FileText className="text-primary" size={28} />}
    >
      <div className="space-y-6 text-text-secondary leading-relaxed">
        <p className="text-text-primary font-medium">
          {ar ? 'آخر تحديث: 1 أكتوبر 2026' : 'Dernière mise à jour : 1er octobre 2026'}
        </p>

        <p>
          {ar
            ? 'مرحباً بكم في ميركادو ناصر. باستخدامك لموقعنا وخدماتنا، فإنك توافق على شروط الاستخدام أدناه.'
            : 'Bienvenue chez Mercado Nacer. En utilisant notre site et nos services, vous acceptez les conditions générales ci-dessous.'}
        </p>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          1. {ar ? 'قبول الشروط' : 'Acceptation des conditions'}
        </h2>
        <p>
          {ar
            ? 'يجب أن يكون عمرك 18 عاماً على الأقل أو الحصول على إذن من أحد الوالدين/الوصي لإجراء عملية شراء.'
            : 'Vous devez avoir au moins 18 ans ou l\'autorisation d\'un parent/tuteur pour effectuer un achat.'}
        </p>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          2. {ar ? 'المنتجات والأسعار' : 'Produits et prix'}
        </h2>
        <ul className="list-disc list-inside space-y-1 ml-4">
          {ar ? (
            <>
              <li>صور المنتجات إرشادية وقد تختلف قليلاً عن المنتج الفعلي</li>
              <li>الأسعار بالدرهم المغربي شاملة الضرائب</li>
              <li>نحتفظ بالحق في تعديل الأسعار في أي وقت</li>
              <li>المنتجات خاضعة للتوفر</li>
            </>
          ) : (
            <>
              <li>Les photos sont indicatives et peuvent différer légèrement</li>
              <li>Les prix sont en DH, toutes taxes comprises</li>
              <li>Nous nous réservons le droit de modifier les prix</li>
              <li>Les produits sont soumis à disponibilité</li>
            </>
          )}
        </ul>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          3. {ar ? 'الطلبات' : 'Commandes'}
        </h2>
        <p>
          {ar
            ? 'نحتفظ بالحق في إلغاء أي طلب في حالة:'
            : 'Nous nous réservons le droit d\'annuler toute commande en cas de :'}
        </p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          {ar ? (
            <>
              <li>معلومات العميل غير صحيحة</li>
              <li>عنوان التوصيل خارج منطقتنا</li>
              <li>الاشتباه في الاحتيال</li>
              <li>نفاذ المخزون</li>
            </>
          ) : (
            <>
              <li>Informations client incorrectes</li>
              <li>Adresse hors de notre zone</li>
              <li>Soupçon de fraude</li>
              <li>Rupture de stock</li>
            </>
          )}
        </ul>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          4. {ar ? 'الدفع' : 'Paiement'}
        </h2>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="font-medium text-yellow-800 mb-2">
            ⚠️ {ar ? 'الموقع قيد الإنشاء' : 'Site en cours de préparation'}
          </p>
          <p className="text-sm text-yellow-700">
            {ar
              ? 'في الوقت الحالي، يتم استقبال الطلبات عبر واتساب فقط. الدفع يتم عند التسليم.'
              : 'Actuellement, les commandes sont reçues via WhatsApp uniquement. Paiement à la livraison.'}
          </p>
        </div>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          5. {ar ? 'التوصيل' : 'Livraison'}
        </h2>
        <ul className="list-disc list-inside space-y-1 ml-4">
          {ar ? (
            <>
              <li><strong>مدة التوصيل:</strong> 24 إلى 48 ساعة</li>
              <li><strong>مناطق التوصيل:</strong> الناظور والمناطق المجاورة</li>
              <li>يجب أن يكون العميل متاحاً على الهاتف عند التوصيل</li>
            </>
          ) : (
            <>
              <li><strong>Délai :</strong> 24 à 48 heures</li>
              <li><strong>Zones :</strong> Nador et environs</li>
              <li>Le client doit être joignable lors de la livraison</li>
            </>
          )}
        </ul>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          6. {ar ? 'الإرجاع' : 'Retours'}
        </h2>
        <p>
          {ar
            ? 'لديك 48 ساعة بعد التوصيل للإبلاغ عن أي مشكلة (منتج معيب، خطأ في الطلب).'
            : 'Vous disposez de 48 heures après la livraison pour signaler tout problème.'}
        </p>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          7. {ar ? 'المسؤولية' : 'Responsabilité'}
        </h2>
        <p>
          {ar
            ? 'لا يمكن تحميل ميركادو ناصر المسؤولية في حالة التأخير الناتج عن ظروف استثنائية أو معلومات عميل غير صحيحة.'
            : 'Mercado Nacer ne peut être tenu responsable en cas de retard dû à des circonstances exceptionnelles ou informations incorrectes.'}
        </p>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          8. {ar ? 'القانون المعمول به' : 'Droit applicable'}
        </h2>
        <p>
          {ar
            ? 'تخضع هذه الشروط للقانون المغربي. تُعرض أي نزاعات على المحاكم المختصة في الناظور.'
            : 'Ces conditions sont régies par le droit marocain. Tout litige sera soumis aux tribunaux de Nador.'}
        </p>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          9. {ar ? 'الاتصال' : 'Contact'}
        </h2>
        <ul className="space-y-1">
          <li>📧 <a href="mailto:contact@mercadonacer.com" className="text-primary hover:underline">contact@mercadonacer.com</a></li>
          <li>📱 <a href="https://wa.me/212615797765" className="text-primary hover:underline">+212 664 063 922</a></li>
        </ul>
      </div>
    </LegalPageLayout>
  )
}