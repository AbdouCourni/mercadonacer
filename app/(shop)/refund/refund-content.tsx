// File: app/(shop)/refund/page.tsx
// Path: /app/(shop)/refund/page.tsx

'use client'

import { RotateCcw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { LegalPageLayout } from '@/components/LegalPageLayout'
import { useLegalLanguage } from '@/lib/legal-language'

export default function RefundContent() {
  const { language } = useLegalLanguage()
  const ar = language === 'ar'

  return (
    <LegalPageLayout
      titleFr="Politique de retour"
      titleAr="سياسة الإرجاع"
      icon={<RotateCcw className="text-primary" size={28} />}
    >
      <div className="space-y-6 text-text-secondary leading-relaxed">
        <p>
          {ar
            ? 'في ميركادو ناصر، رضاك هو أولويتنا. إذا لم تكن راضياً عن طلبك، يمكنك إرجاع المنتجات وفقاً للشروط أدناه.'
            : 'Chez Mercado Nacer, votre satisfaction est notre priorité. Si vous n\'êtes pas satisfait, vous pouvez retourner les produits selon les conditions ci-dessous.'}
        </p>

        <h2 className="text-xl font-bold text-text-primary pt-4 flex items-center gap-2">
          <Clock size={20} className="text-primary" />
          {ar ? 'مدة الإرجاع' : 'Délai de retour'}
        </h2>
        <p>
          {ar
            ? 'لديك 48 ساعة بعد استلام طلبك للإبلاغ عن أي مشكلة. بعد هذه المدة، لن يتم قبول أي شكوى.'
            : 'Vous disposez de 48 heures après réception pour signaler tout problème. Passé ce délai, aucune réclamation ne sera acceptée.'}
        </p>

        <h2 className="text-xl font-bold text-green-700 pt-4 flex items-center gap-2">
          <CheckCircle size={20} className="text-green-600" />
          {ar ? 'حالات الإرجاع المقبولة' : 'Retours acceptés'}
        </h2>
        <ul className="list-disc list-inside space-y-1 ml-4">
          {ar ? (
            <>
              <li>منتج معيب أو تالف</li>
              <li>منتج لا يطابق الوصف</li>
              <li>خطأ في الطلب من جانبنا</li>
              <li>منتج مفقود في الطلب</li>
              <li>منتج منتهي الصلاحية</li>
            </>
          ) : (
            <>
              <li>Produit défectueux ou endommagé</li>
              <li>Produit ne correspondant pas à la description</li>
              <li>Erreur de notre part</li>
              <li>Produit manquant</li>
              <li>Produit expiré</li>
            </>
          )}
        </ul>

        <h2 className="text-xl font-bold text-red-700 pt-4 flex items-center gap-2">
          <XCircle size={20} className="text-red-600" />
          {ar ? 'حالات الإرجاع غير المقبولة' : 'Retours non acceptés'}
        </h2>
        <ul className="list-disc list-inside space-y-1 ml-4">
          {ar ? (
            <>
              <li>منتج استُخدم أو أتلفه العميل</li>
              <li>منتج بدون تغليف أصلي</li>
              <li>منتجات قابلة للتلف مفتوحة</li>
              <li>منتجات مخصصة أو مصنوعة حسب الطلب</li>
              <li>تغيير الرأي</li>
            </>
          ) : (
            <>
              <li>Produit utilisé ou endommagé</li>
              <li>Produit sans emballage d\'origine</li>
              <li>Produits périssables ouverts</li>
              <li>Produits personnalisés</li>
              <li>Changement d\'avis</li>
            </>
          )}
        </ul>

        <h2 className="text-xl font-bold text-text-primary pt-4 flex items-center gap-2">
          <AlertCircle size={20} className="text-primary" />
          {ar ? 'إجراءات الإرجاع' : 'Procédure de retour'}
        </h2>
        <div className="space-y-4">
          {(ar
            ? [
                'اتصل بنا عبر واتساب خلال 48 ساعة من الاستلام',
                'أرسل صوراً للمنتج المعيب',
                'سندرس طلبك ونرد خلال 24-48 ساعة',
                'إذا تمت الموافقة، سننظم استرجاع المنتج',
                'استرداد أو استبدال حسب اختيارك',
              ]
            : [
                'Contactez-nous par WhatsApp dans les 48h',
                'Envoyez des photos du produit défectueux',
                'Nous examinerons sous 24-48h',
                'Si accepté, nous organisons la récupération',
                'Remboursement ou échange selon votre choix',
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

        <h2 className="text-xl font-bold text-text-primary pt-4">
          {ar ? 'طرق الاسترداد' : 'Modes de remboursement'}
        </h2>
        <ul className="list-disc list-inside space-y-1 ml-4">
          {ar ? (
            <>
              <li><strong>نقداً:</strong> استرداد مباشر</li>
              <li><strong>تحويل بنكي:</strong> خلال 3-5 أيام عمل</li>
              <li><strong>قسيمة شراء:</strong> صالحة 6 أشهر</li>
              <li><strong>استبدال:</strong> بمنتج آخر</li>
            </>
          ) : (
            <>
              <li><strong>Espèces :</strong> remboursement direct</li>
              <li><strong>Virement :</strong> 3-5 jours ouvrables</li>
              <li><strong>Bon d\'achat :</strong> valable 6 mois</li>
              <li><strong>Échange :</strong> contre un autre produit</li>
            </>
          )}
        </ul>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mt-4">
          <p className="font-medium text-yellow-800 mb-2">
            ⚠️ {ar ? 'منتج تالف عند الاستلام' : 'Produit endommagé à la réception'}
          </p>
          <p className="text-sm text-yellow-700">
            {ar
              ? 'افحص طلبك عند التسليم! إذا كان المنتج تالفاً، ارفض التوصيل واتصل بنا فوراً.'
              : 'Vérifiez votre colis à la livraison ! Si le produit est endommagé, refusez et contactez-nous immédiatement.'}
          </p>
        </div>

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