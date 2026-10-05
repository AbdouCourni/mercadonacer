// File: app/(shop)/legal/page.tsx
// Path: /app/(shop)/legal/page.tsx

'use client'

import { Building2 } from 'lucide-react'
import { LegalPageLayout } from '@/components/LegalPageLayout'
import { useLegalLanguage } from '@/lib/legal-language'

export default function LegalContent() {
  const { language } = useLegalLanguage()
  const ar = language === 'ar'

  return (
    <LegalPageLayout
      titleFr="Mentions légales"
      titleAr="المعلومات القانونية"
      icon={<Building2 className="text-primary" size={28} />}
    >
      <div className="space-y-6 text-text-secondary leading-relaxed">
        <h2 className="text-xl font-bold text-text-primary">
          {ar ? 'ناشر الموقع' : 'Éditeur du site'}
        </h2>

        <ul className="space-y-2">
          <li><strong>{ar ? 'الاسم التجاري:' : 'Raison sociale :'}</strong> Mercado Nacer</li>
          <li><strong>{ar ? 'الشكل القانوني:' : 'Forme juridique :'}</strong> {ar ? 'قيد التسجيل' : 'En cours d\'immatriculation'}</li>
          <li><strong>{ar ? 'السجل التجاري:' : 'RC :'}</strong> <span className="text-text-secondary italic">{ar ? 'قيد التسجيل' : 'En cours'}</span></li>
          <li><strong>{ar ? 'المعرف الجبائي:' : 'ICE :'}</strong> <span className="text-text-secondary italic">{ar ? 'قيد التسجيل' : 'En cours'}</span></li>
          <li><strong>{ar ? 'الرقم الجبائي:' : 'IF :'}</strong> <span className="text-text-secondary italic">{ar ? 'قيد التسجيل' : 'En cours'}</span></li>
          <li><strong>{ar ? 'العنوان:' : 'Adresse :'}</strong> {ar ? 'الناظور، المغرب' : 'Nador, Maroc'}</li>
          <li><strong>{ar ? 'الهاتف:' : 'Téléphone :'}</strong> <a href="tel:+212615797765" className="text-primary hover:underline">+212 6XX XXX XXX</a></li>
          <li><strong>{ar ? 'البريد الإلكتروني:' : 'Email :'}</strong> <a href="mailto:contact@mercadonacer.com" className="text-primary hover:underline">contact@mercadonacer.com</a></li>
        </ul>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            {ar
              ? 'ملاحظة: معلومات التسجيل القانوني (السجل التجاري، ICE، IF) سيتم تحديثها بمجرد استكمال الإجراءات الإدارية.'
              : 'Note : Les informations d\'immatriculation (RC, ICE, IF) seront mises à jour dès que les démarches administratives seront complétées.'}
          </p>
        </div>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          {ar ? 'مدير النشر' : 'Directeur de publication'}
        </h2>
        <ul className="space-y-2">
          <li><strong>{ar ? 'الاسم:' : 'Nom :'}</strong> [Nom du responsable]</li>
          <li><strong>{ar ? 'الاتصال:' : 'Contact :'}</strong> <a href="mailto:contact@mercadonacer.com" className="text-primary hover:underline">contact@mercadonacer.com</a></li>
        </ul>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          {ar ? 'الاستضافة' : 'Hébergement'}
        </h2>
        <ul className="space-y-2">
          <li><strong>{ar ? 'المستضيف:' : 'Hébergeur :'}</strong> Vercel Inc.</li>
          <li><strong>{ar ? 'العنوان:' : 'Adresse :'}</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</li>
          <li><strong>{ar ? 'الموقع:' : 'Site :'}</strong> <a href="https://vercel.com" target="_blank" className="text-primary hover:underline">vercel.com</a></li>
        </ul>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          {ar ? 'قاعدة البيانات' : 'Base de données'}
        </h2>
        <ul className="space-y-2">
          <li><strong>Supabase Inc.</strong></li>
          <li><a href="https://supabase.com" target="_blank" className="text-primary hover:underline">supabase.com</a></li>
        </ul>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          {ar ? 'الملكية الفكرية' : 'Propriété intellectuelle'}
        </h2>
        <p>
          {ar
            ? 'جميع محتويات الموقع (النصوص، الصور، الشعارات) هي ملكية حصرية لميركادو ناصر. أي إعادة إنتاج دون إذن كتابي مسبق محظورة.'
            : 'L\'ensemble du site (textes, images, logos) est la propriété exclusive de Mercado Nacer. Toute reproduction sans autorisation écrite est interdite.'}
        </p>

        <h2 className="text-xl font-bold text-text-primary pt-4">
          {ar ? 'حماية البيانات' : 'Protection des données'}
        </h2>
        <p>
          {ar
            ? 'وفقاً للقانون رقم 09-08، لديك حقوق الوصول والتصحيح والحذف لبياناتك. للاتصال بنا: contact@mercadonacer.com'
            : 'Conformément à la loi n° 09-08, vous disposez de droits d\'accès, de rectification et de suppression. Contact : contact@mercadonacer.com'}
        </p>
      </div>
    </LegalPageLayout>
  )
}