// File: app/(shop)/privacy/page.tsx
// Path: /app/(shop)/privacy/page.tsx

'use client'

import { Shield } from 'lucide-react'
import { LegalPageLayout } from '@/components/LegalPageLayout'
import { useLegalLanguage } from '@/lib/legal-language'

export default function PrivacyContent() {
  const { language } = useLegalLanguage()
  const ar = language === 'ar'

  return (
    <LegalPageLayout
      titleFr="Politique de confidentialité"
      titleAr="سياسة الخصوصية"
      icon={<Shield className="text-primary" size={28} />}
    >
      <div className="space-y-6 text-text-secondary leading-relaxed">
        <p className="text-text-primary font-medium">
          {ar ? 'آخر تحديث: 1 أكتوبر 2026' : 'Dernière mise à jour : 1er octobre 2026'}
        </p>

        <p>
          {ar
            ? 'في ميركادو ناصر، نولي أهمية كبيرة لحماية خصوصيتك وبياناتك الشخصية. توضح سياسة الخصوصية هذه البيانات التي نجمعها وكيفية استخدامها وحقوقك.'
            : 'Chez Mercado Nacer, nous accordons une grande importance à la protection de votre vie privée et de vos données personnelles. Cette politique vous explique quelles données nous collectons, comment nous les utilisons et quels sont vos droits.'}
        </p>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          1. {ar ? 'البيانات التي نجمعها' : 'Données que nous collectons'}
        </h2>
        <ul className="list-disc list-inside space-y-1 ml-4">
          {ar ? (
            <>
              <li><strong>الهوية:</strong> الاسم الكامل</li>
              <li><strong>بيانات الاتصال:</strong> البريد الإلكتروني، رقم الهاتف</li>
              <li><strong>عنوان التوصيل:</strong> الشارع، المدينة، الرمز البريدي</li>
              <li><strong>بيانات الطلب:</strong> المنتجات المطلوبة، المبلغ، التاريخ</li>
              <li><strong>البيانات التقنية:</strong> عنوان IP، المتصفح، الجهاز</li>
            </>
          ) : (
            <>
              <li><strong>Identité :</strong> nom complet</li>
              <li><strong>Contact :</strong> adresse email, numéro de téléphone</li>
              <li><strong>Adresse de livraison :</strong> rue, ville, code postal</li>
              <li><strong>Données de commande :</strong> produits, montant, date</li>
              <li><strong>Données techniques :</strong> IP, navigateur, appareil</li>
            </>
          )}
        </ul>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          2. {ar ? 'استخدام البيانات' : 'Utilisation de vos données'}
        </h2>
        <ul className="list-disc list-inside space-y-1 ml-4">
          {ar ? (
            <>
              <li>معالجة وتوصيل طلباتك</li>
              <li>التواصل معك بخصوص طلبك عبر الهاتف أو واتساب</li>
              <li>تحسين خدماتنا وتجربتك</li>
              <li>احترام التزاماتنا القانونية</li>
            </>
          ) : (
            <>
              <li>Traiter et livrer vos commandes</li>
              <li>Vous contacter au sujet de votre commande (téléphone, WhatsApp)</li>
              <li>Améliorer nos services</li>
              <li>Respecter nos obligations légales</li>
            </>
          )}
        </ul>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          3. {ar ? 'مشاركة البيانات' : 'Partage de vos données'}
        </h2>
        <p>
          {ar
            ? 'لا نبيع بياناتك أبداً. يمكن مشاركتها فقط مع:'
            : 'Vos données ne sont jamais vendues. Elles peuvent être partagées avec :'}
        </p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          {ar ? (
            <>
              <li>موظفينا ولدينا للتوصيل (الاسم، العنوان، الهاتف فقط)</li>
              <li>مزودي الخدمات التقنية (الاستضافة، الدفع)</li>
              <li>السلطات القانونية عند الطلب</li>
            </>
          ) : (
            <>
              <li>Nos employés et livreurs (nom, adresse, téléphone uniquement)</li>
              <li>Nos prestataires techniques (hébergement, paiement)</li>
              <li>Les autorités légales si requis</li>
            </>
          )}
        </ul>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          4. {ar ? 'أمن البيانات' : 'Sécurité de vos données'}
        </h2>
        <p>
          {ar
            ? 'نطبق تدابير أمنية تقنية وتنظيمية لحماية بياناتك من أي وصول غير مصرح به أو تعديل أو إفشاء أو إتلاف.'
            : 'Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction.'}
        </p>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          5. {ar ? 'مدة الاحتفاظ' : 'Conservation des données'}
        </h2>
        <ul className="list-disc list-inside space-y-1 ml-4">
          {ar ? (
            <>
              <li>بيانات الطلب: 5 سنوات (التزام محاسبي)</li>
              <li>بيانات الحساب: حتى حذف الحساب</li>
              <li>ملفات تعريف الارتباط: 13 شهراً كحد أقصى</li>
            </>
          ) : (
            <>
              <li>Données de commande : 5 ans (obligation comptable)</li>
              <li>Données de compte : jusqu\'à suppression</li>
              <li>Cookies : 13 mois maximum</li>
            </>
          )}
        </ul>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          6. {ar ? 'حقوقك' : 'Vos droits'}
        </h2>
        <p>
          {ar
            ? 'وفقاً للقانون 09-08 المتعلق بحماية البيانات الشخصية، لديك الحق في:'
            : 'Conformément à la loi 09-08 relative à la protection des données personnelles, vous avez le droit de :'}
        </p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          {ar ? (
            <>
              <li>الوصول إلى بياناتك الشخصية</li>
              <li>تصحيح بياناتك غير الدقيقة</li>
              <li>حذف بياناتك (حق النسيان)</li>
              <li>الاعتراض على معالجة بياناتك</li>
            </>
          ) : (
            <>
              <li>Accéder à vos données personnelles</li>
              <li>Rectifier vos données inexactes</li>
              <li>Supprimer vos données (droit à l\'oubli)</li>
              <li>Vous opposer au traitement</li>
            </>
          )}
        </ul>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          7. {ar ? 'ملفات تعريف الارتباط' : 'Cookies'}
        </h2>
        <p>
          {ar
            ? 'نستخدم ملفات تعريف الارتباط لحفظ سلة التسوق والحفاظ على جلستك وتحليل حركة المرور. يمكنك تعطيلها في إعدادات متصفحك.'
            : 'Nous utilisons des cookies pour mémoriser votre panier, garder votre session active et analyser le trafic. Vous pouvez les désactiver dans les paramètres de votre navigateur.'}
        </p>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          8. {ar ? 'الاتصال بنا' : 'Contact'}
        </h2>
        <ul className="space-y-1">
          <li>📧 Email: <a href="mailto:contact@mercadonacer.com" className="text-primary hover:underline">contact@mercadonacer.com</a></li>
          <li>📱 WhatsApp: <a href="https://wa.me/212654063922" className="text-primary hover:underline">+212 6XX XXX XXX</a></li>
          <li>📍 {ar ? 'الناظور، المغرب' : 'Nador, Maroc'}</li>
        </ul>
      </div>
    </LegalPageLayout>
  )
}