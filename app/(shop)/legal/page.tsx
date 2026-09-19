// File: app/(shop)/legal/page.tsx
// Path: /app/(shop)/legal/page.tsx
// Description: Legal Mentions page (required by Moroccan law)

import Link from 'next/link'
import { ArrowLeft, Building2, User, FileCheck, Server, Mail, Shield } from 'lucide-react'

export const metadata = {
  title: 'Mentions légales | Mercado Nacer',
  description: 'Mentions légales et informations sur l\'éditeur du site',
}

export default function LegalPage() {
  return (
    <div className="container-custom py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2">
          <Building2 className="text-primary" size={28} />
          Mentions légales
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-border p-8 space-y-8">
        {/* Editor */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <Building2 size={20} className="text-primary" />
            Éditeur du site
          </h2>
          <div className="space-y-2 text-text-secondary">
            <p><strong className="text-text-primary">Raison sociale:</strong> Mercado Nacer</p>
            <p><strong className="text-text-primary">Forme juridique:</strong> [SARL / Auto-entrepreneur / etc.]</p>
            <p><strong className="text-text-primary">Capital social:</strong> [Montant] DH</p>
            <p><strong className="text-text-primary">RC (Registre de Commerce):</strong> [Numéro RC]</p>
            <p><strong className="text-text-primary">ICE (Identifiant Commun de l'Entreprise):</strong> [Numéro ICE]</p>
            <p><strong className="text-text-primary">Numéro fiscal:</strong> [Numéro IF]</p>
            <p><strong className="text-text-primary">Patente:</strong> [Numéro de patente]</p>
            <p><strong className="text-text-primary">Adresse:</strong> [Votre adresse complète], Nador, Maroc</p>
            <p><strong className="text-text-primary">Téléphone:</strong> <a href="tel:+212XXXXXXXXX" className="text-primary hover:underline">+212 6XX XXX XXX</a></p>
            <p><strong className="text-text-primary">Email:</strong> <a href="mailto:contact@mercadonacer.com" className="text-primary hover:underline">contact@mercadonacer.com</a></p>
          </div>
        </section>

        {/* Director */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <User size={20} className="text-primary" />
            Directeur de publication
          </h2>
          <div className="space-y-2 text-text-secondary">
            <p><strong className="text-text-primary">Nom:</strong> [Nom du responsable]</p>
            <p><strong className="text-text-primary">Qualité:</strong> Gérant</p>
            <p><strong className="text-text-primary">Contact:</strong> <a href="mailto:contact@mercadonacer.com" className="text-primary hover:underline">contact@mercadonacer.com</a></p>
          </div>
        </section>

        {/* Hosting */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <Server size={20} className="text-primary" />
            Hébergement
          </h2>
          <div className="space-y-2 text-text-secondary">
            <p><strong className="text-text-primary">Hébergeur:</strong> Vercel Inc.</p>
            <p><strong className="text-text-primary">Adresse:</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
            <p><strong className="text-text-primary">Site:</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">vercel.com</a></p>
            <p className="mt-3"><strong className="text-text-primary">Base de données:</strong> Supabase Inc.</p>
            <p><strong className="text-text-primary">Site:</strong> <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">supabase.com</a></p>
          </div>
        </section>

        {/* Intellectual Property */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <FileCheck size={20} className="text-primary" />
            Propriété intellectuelle
          </h2>
          <div className="space-y-3 text-text-secondary">
            <p>
              L'ensemble du site (structure, textes, images, logos, vidéos) est la propriété 
              exclusive de Mercado Nacer et est protégé par les lois marocaines et 
              internationales relatives à la propriété intellectuelle.
            </p>
            <p>
              Toute reproduction, représentation, modification ou exploitation, totale ou partielle, 
              sans autorisation écrite préalable est strictement interdite.
            </p>
          </div>
        </section>

        {/* Data Protection */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <Shield size={20} className="text-primary" />
            Protection des données
          </h2>
          <div className="space-y-3 text-text-secondary">
            <p>
              Conformément à la loi n° 09-08 relative à la protection des personnes physiques 
              à l'égard du traitement des données à caractère personnel, vous disposez d'un droit 
              d'accès, de rectification et de suppression de vos données.
            </p>
            <p>
              Pour exercer ces droits, contactez-nous à:{' '}
              <a href="mailto:contact@mercadonacer.com" className="text-primary hover:underline">
                contact@mercadonacer.com
              </a>
            </p>
            <p>
              <Link href="/privacy" className="text-primary hover:underline">
                Voir notre politique de confidentialité complète →
              </Link>
            </p>
          </div>
        </section>

        {/* CNDP Declaration */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">Déclaration CNDP</h2>
          <div className="space-y-3 text-text-secondary">
            <p>
              Ce site a fait l'objet d'une déclaration auprès de la Commission Nationale 
              de contrôle de la protection des Données à caractère Personnel (CNDP).
            </p>
            <p><strong className="text-text-primary">Numéro de déclaration:</strong> [À remplir]</p>
            <p className="text-sm">
              Site CNDP:{' '}
              <a href="https://www.cndp.ma" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                www.cndp.ma
              </a>
            </p>
          </div>
        </section>

        {/* Cookies */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">Cookies</h2>
          <div className="space-y-3 text-text-secondary">
            <p>
              Ce site utilise des cookies pour améliorer l'expérience utilisateur 
              et analyser le trafic. En continuant à naviguer, vous acceptez l'utilisation 
              de cookies conformément à notre politique de confidentialité.
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
              <li>📱 Téléphone: <a href="tel:+212XXXXXXXXX" className="text-primary hover:underline">+212 6XX XXX XXX</a></li>
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
        <Link href="/terms" className="text-sm text-primary hover:underline">
          Conditions d'utilisation
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