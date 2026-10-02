// File: app/(shop)/about/page.tsx
// Path: /app/(shop)/about/page.tsx

'use client'

import { Store, Target, Heart, Users, MapPin, Mail, Phone, MessageCircle } from 'lucide-react'
import { LegalPageLayout } from '@/components/LegalPageLayout'
import { useLegalLanguage } from '@/lib/legal-language'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  const { language } = useLegalLanguage()
  const ar = language === 'ar'

  return (
    <LegalPageLayout
      titleFr="À propos de nous"
      titleAr="من نحن"
      icon={<Store className="text-primary" size={28} />}
    >
      <div className="space-y-6 text-text-secondary leading-relaxed">
        {/* Hero */}
        <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/5 rounded-xl border border-primary/20">
          <h2 className="text-xl font-bold text-text-primary mb-2">
            {ar ? 'مرحباً بكم في ميركادو ناصر 🛍️' : 'Bienvenue chez Mercado Nacer 🛍️'}
          </h2>
          <p>
            {ar
              ? 'متجرك الإلكتروني الموثوق في الناظور والمنطقة. نقدم لك مجموعة واسعة من المنتجات عالية الجودة، يتم توصيلها بسرعة إلى باب منزلك.'
              : 'Votre boutique en ligne de confiance à Nador et dans la région. Nous vous proposons une large gamme de produits de qualité, livrés rapidement à votre porte.'}
          </p>
        </div>

        {/* Story */}
        <h2 className="text-xl font-bold text-text-primary pt-4 flex items-center gap-2">
          <Heart size={20} className="text-primary" />
          {ar ? 'قصتنا' : 'Notre histoire'}
        </h2>
        <p>
          {ar
            ? 'وُلد ميركادو ناصر من فكرة بسيطة: جعل التسوق عبر الإنترنت متاحاً للجميع، مع خدمة عالية الجودة وتوصيل سريع.'
            : 'Mercado Nacer est né d\'une idée simple : rendre le shopping en ligne accessible à tous, avec un service de qualité et une livraison rapide.'}
        </p>
        <p>
          {ar
            ? 'مقرنا في الناظور، ونعرف احتياجات مجتمعنا ونلتزم بتقديم أفضل المنتجات بأفضل الأسعار.'
            : 'Basés à Nador, nous connaissons les besoins de notre communauté et nous nous engageons à offrir les meilleurs produits aux meilleurs prix.'}
        </p>

        {/* Mission */}
        <h2 className="text-xl font-bold text-text-primary pt-4 flex items-center gap-2">
          <Target size={20} className="text-primary" />
          {ar ? 'مهمتنا' : 'Notre mission'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-blue-800 mb-1">{ar ? 'السرعة' : 'Rapidité'}</h3>
            <p className="text-sm text-blue-700">
              {ar ? 'توصيل في 24-48 ساعة' : 'Livraison en 24-48h'}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl mb-2">✨</div>
            <h3 className="font-semibold text-green-800 mb-1">{ar ? 'الجودة' : 'Qualité'}</h3>
            <p className="text-sm text-green-700">
              {ar ? 'منتجات مختارة بعناية' : 'Produits sélectionnés'}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl mb-2">🤝</div>
            <h3 className="font-semibold text-purple-800 mb-1">{ar ? 'الثقة' : 'Confiance'}</h3>
            <p className="text-sm text-purple-700">
              {ar ? 'الدفع عند التسليم' : 'Paiement à la livraison'}
            </p>
          </div>
        </div>

        {/* Why us */}
        <h2 className="text-xl font-bold text-text-primary pt-4 flex items-center gap-2">
          <Users size={20} className="text-primary" />
          {ar ? 'لماذا تختارنا؟' : 'Pourquoi nous choisir ?'}
        </h2>
        <ul className="space-y-2">
          {(ar
            ? [
                'الدفع عند التسليم — ادفع عند استلام طلبك',
                'توصيل سريع — 24 إلى 48 ساعة',
                'خدمة عملاء سريعة — متاحون عبر واتساب',
                'منتجات عالية الجودة — مختارة بعناية',
                'أسعار تنافسية — أفضل الأسعار في السوق',
              ]
            : [
                'Paiement à la livraison — payez en recevant votre commande',
                'Livraison rapide — 24 à 48 heures',
                'Service client réactif — joignable par WhatsApp',
                'Produits de qualité — sélectionnés avec soin',
                'Prix compétitifs — les meilleurs du marché',
              ]
          ).map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* Contact CTA */}
        <h2 className="text-xl font-bold text-text-primary pt-4">
          {ar ? 'اتصل بنا' : 'Contactez-nous'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <MapPin size={20} className="text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium text-text-primary">{ar ? 'العنوان' : 'Adresse'}</p>
              <p className="text-sm">{ar ? 'الناظور، المغرب' : 'Nador, Maroc'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone size={20} className="text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium text-text-primary">{ar ? 'الهاتف' : 'Téléphone'}</p>
              <a href="tel:+212654063922" className="text-sm text-primary hover:underline">
                +212 6XX XXX XXX
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail size={20} className="text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium text-text-primary">Email</p>
              <a href="mailto:contact@mercadonacer.com" className="text-sm text-primary hover:underline">
                contact@mercadonacer.com
              </a>
            </div>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl text-center">
          <h3 className="text-lg font-bold text-green-800 mb-2">
            {ar ? 'اطلب الآن عبر واتساب' : 'Commandez maintenant via WhatsApp'}
          </h3>
          <p className="text-sm text-green-700 mb-4">
            {ar
              ? 'بوتيكنا الإلكتروني قيد الإنشاء. اتصل بنا مباشرة لطلبك.'
              : 'Notre boutique en ligne est en préparation. Contactez-nous directement.'}
          </p>
          <a
            href={`https://wa.me/212654063922`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <MessageCircle size={18} className="mr-2" />
              {ar ? 'اطلب عبر واتساب' : 'Commander via WhatsApp'}
            </Button>
          </a>
        </div>
      </div>
    </LegalPageLayout>
  )
}