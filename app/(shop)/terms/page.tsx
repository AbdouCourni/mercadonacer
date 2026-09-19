// File: app/(shop)/terms/page.tsx
// Path: /app/(shop)/terms/page.tsx
// Description: Terms of Service page

import Link from 'next/link'
import { ArrowLeft, FileText, ShoppingBag, CreditCard, Truck, AlertTriangle, Scale, Mail } from 'lucide-react'

export const metadata = {
  title: 'Conditions d\'utilisation | Mercado Nacer',
  description: 'Conditions générales d\'utilisation de notre site',
}

export default function TermsPage() {
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
            <FileText className="text-primary" size={28} />
            Conditions d'utilisation
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
            Bienvenue sur <strong className="text-text-primary">Mercado Nacer</strong>. 
            En utilisant notre site et nos services, vous acceptez les conditions 
            générales d'utilisation décrites ci-dessous. Veuillez les lire attentivement.
          </p>
        </section>

        {/* 1. Acceptance */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">1. Acceptation des conditions</h2>
          <div className="space-y-3 text-text-secondary">
            <p>
              En passant une commande sur notre site, vous déclarez avoir lu, compris 
              et accepté l'intégralité de ces conditions générales d'utilisation.
            </p>
            <p>
              Vous devez avoir au moins 18 ans ou l'autorisation d'un parent/tuteur 
              pour effectuer un achat.
            </p>
          </div>
        </section>

        {/* 2. Products */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" />
            2. Produits et prix
          </h2>
          <div className="space-y-3 text-text-secondary">
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Les photos des produits sont fournies à titre indicatif et peuvent légèrement différer du produit réel</li>
              <li>Les prix sont affichés en Dirhams marocains (DH), toutes taxes comprises</li>
              <li>Nous nous réservons le droit de modifier les prix à tout moment</li>
              <li>Les produits sont soumis à disponibilité</li>
              <li>En cas d'indisponibilité, nous vous contacterons pour vous proposer une alternative ou annuler la commande</li>
            </ul>
          </div>
        </section>

        {/* 3. Orders */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">3. Commandes</h2>
          <div className="space-y-3 text-text-secondary">
            <p>Une commande est considérée comme confirmée:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Après validation de votre panier</li>
              <li>Après réception de vos informations de livraison</li>
              <li>Après confirmation par notre équipe (téléphone/WhatsApp)</li>
            </ul>
            <p className="mt-3">
              Nous nous réservons le droit d'annuler toute commande en cas de:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Informations client incorrectes ou incomplètes</li>
              <li>Adresse de livraison hors de notre zone de livraison</li>
              <li>Soupçon de fraude</li>
              <li>Rupture de stock</li>
            </ul>
          </div>
        </section>

        {/* 4. Payment */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
            <CreditCard size={20} className="text-primary" />
            4. Paiement
          </h2>
          <div className="space-y-3 text-text-secondary">
            <p><strong>Mode de paiement actuel:</strong> Paiement à la livraison (COD)</p>
            <p>Le paiement s'effectue en espèces au moment de la livraison.</p>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mt-3">
              <p className="font-medium text-yellow-800 mb-2">⚠️ Commandes de valeur élevée</p>
              <ul className="space-y-1 text-sm text-yellow-700">
                <li>• Commandes &gt; 1000 DH: Virement bancaire ou paiement en personne requis</li>
                <li>• Commandes &gt; 3000 DH: Paiement en personne uniquement</li>
                <li>• Nouveaux clients: paiement anticipé peut être demandé</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. Delivery */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
            <Truck size={20} className="text-primary" />
            5. Livraison
          </h2>
          <div className="space-y-3 text-text-secondary">
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Délai de livraison:</strong> 24 à 48 heures ouvrables</li>
              <li><strong>Zones de livraison:</strong> voir notre politique de livraison</li>
              <li><strong>Frais de livraison:</strong> variables selon la zone</li>
              <li>Le client doit être joignable par téléphone lors de la livraison</li>
              <li>En cas d'absence, le livreur vous contactera pour reprogrammer</li>
            </ul>
            <p className="mt-3">
              <Link href="/delivery" className="text-primary hover:underline">
                Voir notre politique de livraison complète →
              </Link>
            </p>
          </div>
        </section>

        {/* 6. Returns */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">6. Retours et remboursements</h2>
          <div className="space-y-3 text-text-secondary">
            <p>
              Vous disposez de <strong>48 heures</strong> après la livraison pour signaler 
              tout problème (produit défectueux, erreur de commande).
            </p>
            <p>
              <Link href="/refund" className="text-primary hover:underline">
                Voir notre politique de retour complète →
              </Link>
            </p>
          </div>
        </section>

        {/* 7. Responsibility */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
            <AlertTriangle size={20} className="text-primary" />
            7. Responsabilité
          </h2>
          <div className="space-y-3 text-text-secondary">
            <p>
              Mercado Nacer ne peut être tenu responsable en cas de:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Retard de livraison dû à des circonstances exceptionnelles (intempéries, grèves, etc.)</li>
              <li>Informations client incorrectes</li>
              <li>Utilisation frauduleuse de votre compte</li>
              <li>Indisponibilité temporaire du site</li>
            </ul>
          </div>
        </section>

        {/* 8. Intellectual Property */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
            <Scale size={20} className="text-primary" />
            8. Propriété intellectuelle
          </h2>
          <div className="space-y-3 text-text-secondary">
            <p>
              Tout le contenu du site (textes, images, logos, vidéos) est la propriété 
              exclusive de Mercado Nacer. Toute reproduction sans autorisation est interdite.
            </p>
          </div>
        </section>

        {/* 9. Modifications */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">9. Modifications</h2>
          <div className="space-y-3 text-text-secondary">
            <p>
              Nous nous réservons le droit de modifier ces conditions à tout moment. 
              Les modifications prennent effet dès leur publication sur le site.
            </p>
          </div>
        </section>

        {/* 10. Law */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">10. Droit applicable</h2>
          <div className="space-y-3 text-text-secondary">
            <p>
              Ces conditions sont régies par le droit marocain. Tout litige sera soumis 
              aux tribunaux compétents de Nador, Maroc.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="pt-6 border-t border-border">
          <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
            <Mail size={20} className="text-primary" />
            Contact
          </h2>
          <div className="space-y-2 text-text-secondary">
            <ul className="space-y-1">
              <li>📧 Email: <a href="mailto:contact@mercadonacer.com" className="text-primary hover:underline">contact@mercadonacer.com</a></li>
              <li>📱 WhatsApp: <a href="https://wa.me/212XXXXXXXXX" className="text-primary hover:underline">+212 6XX XXX XXX</a></li>
              <li>📍 Adresse: [Votre adresse], Nador, Maroc</li>
            </ul>
          </div>
        </section>
      </div>

      {/* Links */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Link href="/privacy" className="text-sm text-primary hover:underline">
          Politique de confidentialité
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