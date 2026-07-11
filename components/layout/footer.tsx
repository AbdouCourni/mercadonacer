import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-foreground text-text-inverse mt-16">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent-2 flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white">Magasin</span>
                <span className="text-xs block text-text-secondary">Votre supermarché en ligne</span>
              </div>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              Plus de 5000 produits de qualité livrés directement à votre porte.
            </p>
            
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="text-text-secondary hover:text-white transition-colors">Tous les produits</Link></li>
              <li><Link href="/categories" className="text-text-secondary hover:text-white transition-colors">Catégories</Link></li>
              <li><Link href="/about" className="text-text-secondary hover:text-white transition-colors">À propos</Link></li>
              <li><Link href="/contact" className="text-text-secondary hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-text-secondary">
                <Phone size={16} />
                +212 5XX-XXXXXX
              </li>
              <li className="flex items-center gap-2 text-text-secondary">
                <Mail size={16} />
                contact@mercadonacer.ma
              </li>
              <li className="flex items-center gap-2 text-text-secondary">
                <MapPin size={16} />
                Casablanca, Maroc
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-lg mb-4">Newsletter</h3>
            <p className="text-sm text-text-secondary mb-4">
              Recevez nos offres exclusives et nouveautés.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="px-4 py-2 bg-primary rounded-full text-white hover:bg-primary/90 transition-colors">
                OK
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-text-secondary">
          <p>© 2024 Magasin. Tous droits réservés. Made with ❤️ au Maroc</p>
        </div>
      </div>
    </footer>
  )
}