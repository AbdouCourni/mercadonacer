// File: app/(shop)/about/page.tsx
// Path: /app/(shop)/about/page.tsx
// Description: About Us page

import Link from 'next/link'
import { ArrowLeft, Store, Target, Heart, Users, MapPin, Mail, Phone } from 'lucide-react'

export const metadata = {
  title: 'À propos | Mercado Nacer',
  description: 'Découvrez notre histoire et notre mission',
}

export default function AboutPage() {
  return (
    <div className="container-custom py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2">
          <Store className="text-primary" size={28} />
          À propos de nous
        </h1>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 mb-8 border border-primary/20">
        <h2 className="text-2xl font-bold text-text-primary mb-3">
          Bienvenue chez Mercado Nacer 🛍️
        </h2>
        <p className="text-text-secondary leading-relaxed">
          Votre boutique en ligne de confiance à Nador et dans toute la région. 
          Nous vous proposons une large gamme de produits de qualité, livrés rapidement 
          à votre porte.
        </p>
      </div>

      <div className="space-y-8">
        {/* Our Story */}
        <section className="bg-white rounded-xl border border-border p-8">
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <Heart size={20} className="text-primary" />
            Notre histoire
          </h2>
          <div className="space-y-3 text-text-secondary leading-relaxed">
            <p>
              Mercado Nacer est né d'une idée simple: rendre le shopping en ligne 
              accessible à tous, avec un service de qualité et une livraison rapide.
            </p>
            <p>
              Basés à Nador, nous connaissons les besoins de notre communauté et 
              nous nous engageons à vous offrir les meilleurs produits aux meilleurs prix.
            </p>
            <p>
              Chaque commande est préparée avec soin par notre équipe et livrée 
              dans un délai de 24 à 48 heures.
            </p>
          </div>
        </section>

        {/* Our Mission */}
        <section className="bg-white rounded-xl border border-border p-8">
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <Target size={20} className="text-primary" />
            Notre mission
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold text-blue-800 mb-1">Rapidité</h3>
              <p className="text-sm text-blue-700">
                Livraison en 24-48h dans toute la région
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl mb-2">✨</div>
              <h3 className="font-semibold text-green-800 mb-1">Qualité</h3>
              <p className="text-sm text-green-700">
                Produits sélectionnés avec soin
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl mb-2">🤝</div>
              <h3 className="font-semibold text-purple-800 mb-1">Confiance</h3>
              <p className="text-sm text-purple-700">
                Paiement à la livraison disponible
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-white rounded-xl border border-border p-8">
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <Users size={20} className="text-primary" />
            Pourquoi nous choisir ?
          </h2>
          <div className="space-y-3 text-text-secondary">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>Paiement à la livraison</strong> - Payez quand vous recevez votre commande</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>Livraison rapide</strong> - 24 à 48 heures ouvrables</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>Service client réactif</strong> - Nous sommes joignables par WhatsApp</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>Produits de qualité</strong> - Sélectionnés avec soin</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>Prix compétitifs</strong> - Les meilleurs prix du marché</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white rounded-xl border border-border p-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">Contactez-nous</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium text-text-primary">Adresse</p>
                <p className="text-sm text-text-secondary">
                  [Votre adresse]<br />
                  Nador, Maroc
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={20} className="text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium text-text-primary">Téléphone</p>
                <a href="tel:+212XXXXXXXXX" className="text-sm text-primary hover:underline">
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
        </section>
      </div>

      {/* Links */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Link href="/privacy" className="text-sm text-primary hover:underline">
          Politique de confidentialité
        </Link>
        <span className="text-text-secondary">•</span>
        <Link href="/terms" className="text-sm text-primary hover:underline">
          Conditions d'utilisation
        </Link>
        <span className="text-text-secondary">•</span>
        <Link href="/legal" className="text-sm text-primary hover:underline">
          Mentions légales
        </Link>
        <span className="text-text-secondary">•</span>
        <Link href="/refund" className="text-sm text-primary hover:underline">
          Politique de retour
        </Link>
        <span className="text-text-secondary">•</span>
        <Link href="/delivery" className="text-sm text-primary hover:underline">
          Politique de livraison
        </Link>
      </div>
    </div>
  )
}