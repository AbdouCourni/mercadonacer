import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
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
                <span className="text-xs block text-gray-300">Votre supermarché en ligne</span>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              Plus de 5000 produits de qualité livrés directement à votre porte.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="text-gray-300 hover:text-primary transition-colors">Tous les produits</Link></li>
              <li><Link href="/categories" className="text-gray-300 hover:text-primary transition-colors">Catégories</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-primary transition-colors">À propos</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <Phone size={16} />
                +212 5XX-XXXXXX
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} />
                contact@mercadonacer.ma
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} />
                Nador, Maroc
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Informations</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-300 hover:text-primary">À propos</Link></li>
              <li><Link href="/privacy" className="text-gray-300 hover:text-primary">Confidentialité</Link></li>
              <li><Link href="/terms" className="text-gray-300 hover:text-primary">CGU</Link></li>
              <li><Link href="/legal" className="text-gray-300 hover:text-primary">Mentions légales</Link></li>
              <li><Link href="/refund" className="text-gray-300 hover:text-primary">Retours</Link></li>
              <li><Link href="/delivery" className="text-gray-300 hover:text-primary">Livraison</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Newsletter</h3>
            <p className="text-sm text-gray-300 mb-4">
              Recevez nos offres exclusives et nouveautés.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="px-4 py-2 bg-primary rounded-full text-white hover:bg-primary/90 transition-colors">
                OK
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-300">
          <p>© 2024 Magasin. Tous droits réservés. Made with ❤️ au Maroc</p>
        </div>
      </div>
    </footer>
  )
}