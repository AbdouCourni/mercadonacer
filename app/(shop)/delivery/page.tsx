// File: app/(shop)/delivery/page.tsx
// Path: /app/(shop)/delivery/page.tsx
// Description: Delivery Policy page

import Link from 'next/link'
import { ArrowLeft, Truck, Clock, MapPin, CreditCard, AlertTriangle, CheckCircle, Mail } from 'lucide-react'

export const metadata = {
  title: 'Politique de livraison | Mercado Nacer',
  description: 'Découvrez nos zones de livraison, délais et tarifs',
}

export default function DeliveryPage() {
  return (
    <div className="container-custom py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2">
          <Truck className="text-primary" size={28} />
          Politique de livraison
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-border p-8 space-y-8">
        {/* Intro */}
        <section>
          <p className="text-text-secondary leading-relaxed">
            Nous livrons dans toute la région de Nador et ses environs. 
            Découvrez ci-dessous toutes les informations sur nos délais, 
            zones et frais de livraison.
          </p>
        </section>

        {/* Delivery time */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
            <Clock size={20} className="text-primary" />
            Délai de livraison
          </h2>
          <div className="space-y-3 text-text-secondary">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-2xl font-bold text-blue-700 mb-1">⏱️ 24 - 48 heures</p>
              <p className="text-sm text-blue-600">
                Votre commande sera livrée dans un délai de 24 à 48 heures ouvrables 
                après confirmation de la commande.
              </p>
            </div>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
              <li>Commandes passées avant <strong>15h</strong> → livraison possible le lendemain</li>
              <li>Commandes passées après <strong>15h</strong> → livraison dans les 48h</li>
              <li>Dimanches et jours fériés: pas de livraison</li>
            </ul>
          </div>
        </section>

        {/* Delivery zones */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
            <MapPin size={20} className="text-primary" />
            Zones de livraison
          </h2>
          <div className="space-y-3 text-text-secondary">
            <p>Nous livrons actuellement dans les zones suivantes:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium text-text-primary">Nador Centre</p>
                <p className="text-sm">Toute la ville de Nador</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium text-text-primary">Al Aroui</p>
                <p className="text-sm">Ville et environs</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium text-text-primary">Beni Ensar</p>
                <p className="text-sm">Zone urbaine</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium text-text-primary">Zghanghan</p>
                <p className="text-sm">Zone urbaine</p>
              </div>
            </div>
            <p className="text-sm mt-3">
              💡 <em>Vous ne trouvez pas votre zone? Contactez-nous pour vérifier si nous pouvons vous livrer.</em>
            </p>
          </div>
        </section>

        {/* Delivery fees */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
            <CreditCard size={20} className="text-primary" />
            Frais de livraison
          </h2>
          <div className="space-y-3 text-text-secondary">
            <p>Les frais de livraison varient selon votre zone:</p>
            <div className="overflow-x-auto mt-3">
              <table className="w-full border-collapse border border-border rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-text-primary border-b border-border">Zone</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-text-primary border-b border-border">Frais</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2 text-sm">Nador Centre</td>
                    <td className="px-4 py-2 text-sm text-right font-medium">20 - 30 DH</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2 text-sm">Al Aroui</td>
                    <td className="px-4 py-2 text-sm text-right font-medium">30 - 40 DH</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2 text-sm">Beni Ensar</td>
                    <td className="px-4 py-2 text-sm text-right font-medium">25 - 35 DH</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm">Zghanghan</td>
                    <td className="px-4 py-2 text-sm text-right font-medium">25 - 35 DH</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm mt-3">
              Les frais exacts sont calculés automatiquement lors du checkout selon votre adresse.
            </p>
          </div>
        </section>

        {/* Payment */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">Paiement à la livraison</h2>
          <div className="space-y-3 text-text-secondary">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-medium text-green-800 mb-1">💰 Paiement en espèces uniquement</p>
              <p className="text-sm text-green-700">
                Préparez le montant exact pour faciliter la transaction avec notre livreur.
              </p>
            </div>
            
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                <AlertTriangle size={18} />
                Commandes de valeur élevée
              </p>
              <ul className="space-y-1 text-sm text-yellow-700">
                <li>• Commandes &gt; <strong>1000 DH</strong>: virement bancaire ou paiement en personne</li>
                <li>• Commandes &gt; <strong>3000 DH</strong>: paiement en personne uniquement</li>
              </ul>
              <p className="text-xs text-yellow-600 mt-2">
                <Link href="/terms" className="text-primary hover:underline">
                  Voir les conditions complètes →
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* Delivery process */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
            <CheckCircle size={20} className="text-primary" />
            Comment ça marche ?
          </h2>
          <div className="space-y-4 text-text-secondary">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-text-primary">Vous passez commande</p>
                <p className="text-sm">Choisissez vos produits et validez votre panier</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-text-primary">Nous vous contactons</p>
                <p className="text-sm">Notre équipe vous appelle sur WhatsApp pour confirmer</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-text-primary">Préparation de la commande</p>
                <p className="text-sm">Nous préparons votre colis avec soin</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                4
              </div>
              <div>
                <p className="font-medium text-text-primary">Livraison</p>
                <p className="text-sm">
                  Un livreur vous contacte avant d'arriver. Vous recevrez également 
                  un <strong>code de livraison</strong> pour confirmer la réception.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                5
              </div>
              <div>
                <p className="font-medium text-text-primary">Paiement et remise</p>
                <p className="text-sm">
                  Donnez le code au livreur et payez en espèces
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Code de livraison */}
        <section className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-bold text-blue-800 mb-2 flex items-center gap-2">
            🔑 Code de livraison
          </h2>
          <div className="space-y-2 text-sm text-blue-700">
            <p>
              Pour votre sécurité, un <strong>code de livraison à 6 chiffres</strong> vous 
              sera envoyé par WhatsApp lorsque votre commande sera prête.
            </p>
            <p>
              <strong>Présentez ce code au livreur</strong> lors de la livraison pour 
              confirmer la réception de votre commande.
            </p>
            <p className="text-xs text-blue-600">
              Ne partagez ce code qu'avec le livreur au moment de la remise.
            </p>
          </div>
        </section>

        {/* Failed delivery */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">En cas d'absence</h2>
          <div className="space-y-3 text-text-secondary">
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Le livreur vous appellera avant d'arriver</li>
              <li>Si vous n'êtes pas disponible, une nouvelle tentative sera programmée</li>
              <li>Après 2 tentatives échouées, la commande sera annulée</li>
              <li>Des frais de livraison peuvent être facturés pour les tentatives répétées</li>
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section className="pt-6 border-t border-border">
          <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
            <Mail size={20} className="text-primary" />
            Une question ?
          </h2>
          <div className="space-y-2 text-text-secondary">
            <ul className="space-y-1">
              <li>📱 WhatsApp: <a href="https://wa.me/212XXXXXXXXX" className="text-primary hover:underline">+212 6XX XXX XXX</a></li>
              <li>📧 Email: <a href="mailto:contact@mercadonacer.com" className="text-primary hover:underline">contact@mercadonacer.com</a></li>
              <li>🕒 Horaires: Lundi - Samedi, 9h - 18h</li>
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
      </div>
    </div>
  )
}