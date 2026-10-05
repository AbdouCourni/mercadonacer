// File: app/(shop)/delivery/page.tsx
// Path: /app/(shop)/delivery/page.tsx

'use client'

import { Truck, Clock, MapPin, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react'
import { LegalPageLayout } from '@/components/LegalPageLayout'
import { useLegalLanguage } from '@/lib/legal-language'

export default function DeliveryContent() {
  const { language } = useLegalLanguage()
  const ar = language === 'ar'

  return (
    <LegalPageLayout
      titleFr="Politique de livraison"
      titleAr="سياسة التوصيل"
      icon={<Truck className="text-primary" size={28} />}
    >
      <div className="space-y-6 text-text-secondary leading-relaxed">
        <p>
          {ar
            ? 'نوصل في جميع أنحاء منطقة الناظور والمناطق المجاورة. اكتشف أدناه جميع المعلومات حول أوقات التوصيل والمناطق والرسوم.'
            : 'Nous livrons dans toute la région de Nador et ses environs. Découvrez ci-dessous les informations sur nos délais, zones et frais.'}
        </p>

        <h2 className="text-xl font-bold text-text-primary pt-4 flex items-center gap-2">
          <Clock size={20} className="text-primary" />
          {ar ? 'مدة التوصيل' : 'Délai de livraison'}
        </h2>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-2xl font-bold text-blue-700 mb-1">⏱️ 24 - 48 {ar ? 'ساعة' : 'heures'}</p>
          <p className="text-sm text-blue-600">
            {ar
              ? 'سيتم توصيل طلبك في غضون 24 إلى 48 ساعة بعد تأكيد الطلب.'
              : 'Votre commande sera livrée dans un délai de 24 à 48 heures après confirmation.'}
          </p>
        </div>
        <ul className="list-disc list-inside space-y-1 ml-4">
          {ar ? (
            <>
              <li>الطلبات قبل الساعة 15:00 → التوصيل في اليوم التالي</li>
              <li>الطلبات بعد الساعة 15:00 → التوصيل خلال 48 ساعة</li>
              <li>لا يوجد توصيل أيام الأحد والعطل الرسمية</li>
            </>
          ) : (
            <>
              <li>Commandes avant 15h → livraison le lendemain</li>
              <li>Commandes après 15h → livraison dans les 48h</li>
              <li>Pas de livraison dimanche et jours fériés</li>
            </>
          )}
        </ul>

        <h2 className="text-xl font-bold text-text-primary pt-4 flex items-center gap-2">
          <MapPin size={20} className="text-primary" />
          {ar ? 'مناطق التوصيل' : 'Zones de livraison'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { fr: 'Nador Centre', ar: 'الناظور المركز' },
            { fr: 'Al Aroui', ar: 'العروي' },
            { fr: 'Beni Ensar', ar: 'بني أنصار' },
            { fr: 'Zeghanghane', ar: 'أزغنغان' },
          ].map((z) => (
            <div key={z.fr} className="p-3 bg-muted rounded-lg">
              <p className="font-medium text-text-primary">{ar ? z.ar : z.fr}</p>
              <p className="text-sm">{ar ? 'منطقة مغطاة' : 'Zone couverte'}</p>
            </div>
          ))}
        </div>
        <p className="text-sm mt-3 italic">
          💡 {ar
            ? 'لم تجد منطقتك؟ اتصل بنا للتحقق.'
            : 'Vous ne trouvez pas votre zone ? Contactez-nous.'}
        </p>

        <h2 className="text-xl font-bold text-text-primary pt-4 flex items-center gap-2">
          <CreditCard size={20} className="text-primary" />
          {ar ? 'رسوم التوصيل' : 'Frais de livraison'}
        </h2>
        <p>
          {ar
            ? 'تختلف رسوم التوصيل حسب منطقتك. يتم حساب الرسوم الدقيقة تلقائياً عند الطلب.'
            : 'Les frais varient selon votre zone. Les frais exacts sont calculés lors de la commande.'}
        </p>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          {ar ? 'الدفع عند التسليم' : 'Paiement à la livraison'}
        </h2>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="font-medium text-green-800 mb-1">
            💰 {ar ? 'الدفع نقداً فقط' : 'Paiement en espèces uniquement'}
          </p>
          <p className="text-sm text-green-700">
            {ar
              ? 'جهّز المبلغ الدقيق لتسهيل المعاملة مع موصلنا.'
              : 'Préparez le montant exact pour faciliter la transaction.'}
          </p>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
            <AlertTriangle size={18} />
            {ar ? 'الطلبات ذات القيمة العالية' : 'Commandes de valeur élevée'}
          </p>
          <ul className="space-y-1 text-sm text-yellow-700">
            {ar ? (
              <>
                <li>• الطلبات &gt; 1000 درهم: تحويل بنكي أو دفع شخصي</li>
                <li>• الطلبات &gt; 3000 درهم: دفع شخصي فقط</li>
              </>
            ) : (
              <>
                <li>• Commandes &gt; 1000 DH : virement ou paiement en personne</li>
                <li>• Commandes &gt; 3000 DH : paiement en personne uniquement</li>
              </>
            )}
          </ul>
        </div>

        <h2 className="text-xl font-bold text-text-primary pt-4 flex items-center gap-2">
          <CheckCircle size={20} className="text-primary" />
          {ar ? 'كيف يعمل التوصيل؟' : 'Comment ça marche ?'}
        </h2>
        <div className="space-y-4">
          {(ar
            ? [
                'تقوم بطلب المنتجات',
                'نتصل بك عبر واتساب للتأكيد',
                'نجهز طلبك بعناية',
                'موصلنا يتصل بك قبل الوصول',
                'تدفع نقداً وتستلم طلبك',
              ]
            : [
                'Vous commandez les produits',
                'Nous vous contactons par WhatsApp',
                'Nous préparons votre commande',
                'Le livreur vous appelle avant d\'arriver',
                'Vous payez et recevez votre commande',
              ]
          ).map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                {i + 1}
              </div>
              <p className="pt-1">{step}</p>
            </div>
          ))}
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="font-medium text-blue-800 mb-2">
            🔑 {ar ? 'كود التسليم' : 'Code de livraison'}
          </p>
          <p className="text-sm text-blue-700">
            {ar
              ? 'لأمانك، سيتم إرسال كود تسليم مكون من 6 أرقام إليك عبر واتساب عند تجهيز طلبك. قدم هذا الكود للموصل عند التسليم.'
              : 'Pour votre sécurité, un code à 6 chiffres vous sera envoyé par WhatsApp quand votre commande sera prête. Présentez ce code au livreur.'}
          </p>
        </div>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          {ar ? 'في حالة الغياب' : 'En cas d\'absence'}
        </h2>
        <ul className="list-disc list-inside space-y-1 ml-4">
          {ar ? (
            <>
              <li>سيتصل بك الموصل قبل الوصول</li>
              <li>في حالة الغياب، سيتم برمجة محاولة جديدة</li>
              <li>بعد محاولتين فاشلتين، سيتم إلغاء الطلب</li>
            </>
          ) : (
            <>
              <li>Le livreur vous appellera avant d\'arriver</li>
              <li>Si absent, une nouvelle tentative sera programmée</li>
              <li>Après 2 échecs, la commande sera annulée</li>
            </>
          )}
        </ul>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          {ar ? 'الاتصال' : 'Contact'}
        </h2>
        <ul className="space-y-1">
          <li>📱 <a href="https://wa.me/212615797765" className="text-primary hover:underline">+212 6XX XXX XXX</a></li>
          <li>📧 <a href="mailto:contact@mercadonacer.com" className="text-primary hover:underline">contact@mercadonacer.com</a></li>
        </ul>
      </div>
    </LegalPageLayout>
  )
}