// File: app/(shop)/privacy/page.tsx
// Path: /app/(shop)/privacy/page.tsx
// Description: Privacy Policy page

import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Mail } from 'lucide-react'

export const metadata = {
  title: 'Politique de confidentialité | Mercado Nacer',
  description: 'Découvrez comment nous protégeons vos données personnelles',
}

export default function PrivacyPage() {
  const lastUpdated = '15 Septembre 2026'
  
  return (
    <div className="container-custom py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2">
            <Shield className="text-primary" size={28} />
            Politique de confidentialité
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Dernière mise à jour: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-border p-8 space-y-8">
        {/* Intro */}
        <section>
          <p className="text-text-secondary leading-relaxed">
            Chez <strong className="text-text-primary">Mercado Nacer</strong>, nous accordons une grande importance 
            à la protection de votre vie privée et de vos données personnelles. Cette politique de confidentialité 
            vous explique quelles données nous collectons, comment nous les utilisons et quels sont vos droits.
          </p>
        </section>

        {/* 1. Data we collect */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
            <Database size={20} className="text-primary" />
            1. Données que nous collectons
          </h2>
          <div className="space-y-3 text-text-secondary">
            <p>Lorsque vous utilisez notre site, nous pouvons collecter les données suivantes:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Identité:</strong> nom, prénom</li>
              <li><strong>Contact:</strong> adresse email, numéro de téléphone</li>
              <li><strong>Adresse de livraison:</strong> rue, ville, code postal</li>
              <li><strong>Données de commande:</strong> produits achetés, montant, date</li>
              <li><strong>Données techniques:</strong> adresse IP, navigateur, appareil</li>
              <li><strong>Cookies:</strong> pour améliorer votre expérience</li>
            </ul>
          </div>
        </section>

        {/* 2. How we use data */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
            <UserCheck size={20} className="text-primary" />
            2. Utilisation de vos données
          </h2>
          <div className="space-y-3 text-text-secondary">
            <p>Vos données sont utilisées pour:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Traiter et livrer vos commandes</li>
              <li>Vous contacter concernant votre commande (téléphone, WhatsApp, email)</li>
              <li>Améliorer nos services et votre expérience</li>
              <li>Vous envoyer des offres promotionnelles (avec votre accord)</li>
              <li>Respecter nos obligations légales</li>
            </ul>
          </div>
        </section>

        {/* 3. Data sharing */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
            <Eye size={20} className="text-primary" />
            3. Partage de vos données
          </h2>
          <div className="space-y-3 text-text-secondary">
            <p>Vos données ne sont <strong>jamais vendues</strong>. Elles peuvent être partagées uniquement avec:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Nos livreurs:</strong> nom, adresse, téléphone (pour la livraison uniquement)</li>
              <li><strong>Nos employés:</strong> pour préparer votre commande</li>
              <li><strong>Prestataires techniques:</strong> hébergement, paiement</li>
              <li><strong>Autorités légales:</strong> si requis par la loi</li>
            </ul>
          </div>
        </section>

        {/* 4. Data security */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
            <Lock size={20} className="text-primary" />
            4. Sécurité de vos données
          </h2>
          <div className="space-y-3 text-text-secondary">
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles 
              pour protéger vos données contre tout accès non autorisé, modification, 
              divulgation ou destruction.
            </p>
            <p>
              Vos données sont stockées sur des serveurs sécurisés et sont chiffrées lors du transfert.
            </p>
          </div>
        </section>

        {/* 5. Retention */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">5. Conservation des données</h2>
          <div className="space-y-3 text-text-secondary">
            <p>Nous conservons vos données:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Données de commande:</strong> 5 ans (obligation comptable)</li>
              <li><strong>Données de compte:</strong> jusqu'à suppression de votre compte</li>
              <li><strong>Cookies:</strong> maximum 13 mois</li>
            </ul>
          </div>
        </section>

        {/* 6. Your rights */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">6. Vos droits</h2>
          <div className="space-y-3 text-text-secondary">
            <p>Conformément à la loi 09-08 relative à la protection des données personnelles au Maroc, vous avez le droit de:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Accéder</strong> à vos données personnelles</li>
              <li><strong>Rectifier</strong> vos données inexactes</li>
              <li><strong>Supprimer</strong> vos données (droit à l'oubli)</li>
              <li><strong>Vous opposer</strong> au traitement de vos données</li>
              <li><strong>Retirer votre consentement</strong> à tout moment</li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, contactez-nous à:{' '}
              <a href="mailto:contact@mercadonacer.com" className="text-primary hover:underline">
                contact@mercadonacer.com
              </a>
            </p>
          </div>
        </section>

        {/* 7. Cookies */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">7. Cookies</h2>
          <div className="space-y-3 text-text-secondary">
            <p>Nous utilisons des cookies pour:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Mémoriser votre panier</li>
              <li>Garder votre session active</li>
              <li>Analyser le trafic (Google Analytics)</li>
            </ul>
            <p>Vous pouvez désactiver les cookies dans les paramètres de votre navigateur.</p>
          </div>
        </section>

        {/* 8. Contact */}
        <section className="pt-6 border-t border-border">
          <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
            <Mail size={20} className="text-primary" />
            8. Contact
          </h2>
          <div className="space-y-2 text-text-secondary">
            <p>Pour toute question concernant cette politique:</p>
            <ul className="space-y-1">
              <li>📧 Email: <a href="mailto:contact@mercadonacer.com" className="text-primary hover:underline">contact@mercadonacer.com</a></li>
              <li>📱 Téléphone: <a href="tel:+212XXXXXXXXX" className="text-primary hover:underline">+212 6XX XXX XXX</a></li>
              <li>📍 Adresse: [Votre adresse], Nador, Maroc</li>
            </ul>
          </div>
        </section>
      </div>

      {/* Links to other pages */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
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