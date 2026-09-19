// File: app/(shop)/refund/page.tsx
// Path: /app/(shop)/refund/page.tsx
// Description: Refund Policy page

import Link from 'next/link'
import { ArrowLeft, RotateCcw, AlertCircle, CheckCircle, XCircle, Clock, Mail } from 'lucide-react'

export const metadata = {
  title: 'Politique de retour | Mercado Nacer',
  description: 'Conditions de retour et remboursement',
}

export default function RefundPage() {
  return (
    <div className="container-custom py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2">
          <RotateCcw className="text-primary" size={28} />
          Politique de retour
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-border p-8 space-y-8">
        {/* Intro */}
        <section>
          <p className="text-text-secondary leading-relaxed">
            Chez Mercado Nacer, votre satisfaction est notre priorité. 
            Si vous n'êtes pas satisfait de votre commande, nous vous offrons 
            la possibilité de retourner les produits dans les conditions décrites ci-dessous.
          </p>
        </section>

        {/* Return period */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
            <Clock size={20} className="text-primary" />
            Délai de retour
          </h2>
          <div className="space-y-3 text-text-secondary">
            <p>
              Vous disposez de <strong className="text-text-primary">48 heures</strong> après 
              la réception de votre commande pour signaler tout problème.
            </p>
            <p>
              Passé ce délai, aucune réclamation ne pourra être acceptée.
            </p>
          </div>
        </section>

        {/* Accepted returns */}
        <section>
          <h2 className="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            Retours acceptés
          </h2>
          <div className="space-y-3 text-text-secondary">
            <p>Nous acceptons les retours dans les cas suivants:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Produit défectueux ou endommagé</li>
              <li>Produit ne correspondant pas à la description</li>
              <li>Erreur de notre part (mauvais produit livré)</li>
              <li>Produit manquant dans la commande</li>
              <li>Produit expiré (pour les produits alimentaires)</li>
            </ul>
          </div>
        </section>

        {/* Not accepted */}
        <section>
          <h2 className="text-xl font-bold text-red-700 mb-3 flex items-center gap-2">
            <XCircle size={20} className="text-red-600" />
            Retours non acceptés
          </h2>
          <div className="space-y-3 text-text-secondary">
            <p>Nous n'acceptons pas les retours dans les cas suivants:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Produit utilisé ou endommagé par le client</li>
              <li>Produit sans emballage d'origine</li>
              <li>Produits périssables déjà ouverts</li>
              <li>Produits personnalisés ou sur mesure</li>
              <li>Produits en promotion ou en solde</li>
              <li>Changement d'avis</li>
              <li>Commande passée par erreur</li>
            </ul>
          </div>
        </section>

        {/* Procedure */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
            <AlertCircle size={20} className="text-primary" />
            Procédure de retour
          </h2>
          <div className="space-y-4 text-text-secondary">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-text-primary">Contactez-nous</p>
                <p className="text-sm">
                  Contactez-nous par WhatsApp ou téléphone dans les 48h suivant la réception
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-text-primary">Fournissez des preuves</p>
                <p className="text-sm">
                  Envoyez des photos du produit défectueux ou du problème constaté
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-text-primary">Validation</p>
                <p className="text-sm">
                  Nous examinerons votre demande et vous répondrons sous 24-48h
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                4
              </div>
              <div>
                <p className="font-medium text-text-primary">Retour du produit</p>
                <p className="text-sm">
                  Si votre demande est acceptée, nous organiserons la récupération du produit
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                5
              </div>
              <div>
                <p className="font-medium text-text-primary">Remboursement ou échange</p>
                <p className="text-sm">
                  Remboursement ou échange selon votre préférence
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Refund methods */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">Modes de remboursement</h2>
          <div className="space-y-3 text-text-secondary">
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Espèces:</strong> remboursement direct (si commande récente)</li>
              <li><strong>Virement bancaire:</strong> sous 3-5 jours ouvrables</li>
              <li><strong>Bon d'achat:</strong> valable 6 mois sur tout le site</li>
              <li><strong>Échange:</strong> remplacement par un autre produit</li>
            </ul>
            <p className="mt-3">
              Les frais de livraison initiaux ne sont pas remboursables, sauf en cas 
              d'erreur de notre part.
            </p>
          </div>
        </section>

        {/* Damaged on arrival */}
        <section className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-lg font-bold text-yellow-800 mb-2 flex items-center gap-2">
            <AlertCircle size={20} />
            Produit endommagé à la réception
          </h2>
          <div className="space-y-2 text-sm text-yellow-700">
            <p>
              <strong>Vérifiez votre colis à la livraison !</strong>
            </p>
            <p>
              Si le produit est endommagé, refusez la livraison et contactez-nous immédiatement. 
              Nous vous enverrons un nouveau produit sans frais supplémentaires.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="pt-6 border-t border-border">
          <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
            <Mail size={20} className="text-primary" />
            Contact pour les retours
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
        <Link href="/delivery" className="text-sm text-primary hover:underline">
          Politique de livraison
        </Link>
      </div>
    </div>
  )
}