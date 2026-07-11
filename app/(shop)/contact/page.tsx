'use client'

import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary">
            Contactez-<span className="text-gradient">Nous</span>
          </h1>
          <p className="text-xl text-text-secondary mt-4">
            Nous sommes là pour répondre à toutes vos questions
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-border/50 text-center">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Phone size={24} className="text-primary" />
            </div>
            <h3 className="font-semibold text-text-primary">Téléphone</h3>
            <p className="text-sm text-text-secondary">+212 5XX-XXXXXX</p>
            <p className="text-xs text-text-secondary">Lun-Ven 9h-18h</p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-sm border border-border/50 text-center">
            <div className="w-12 h-12 mx-auto bg-secondary/10 rounded-full flex items-center justify-center mb-3">
              <Mail size={24} className="text-secondary" />
            </div>
            <h3 className="font-semibold text-text-primary">Email</h3>
            <p className="text-sm text-text-secondary">contact@magasin.ma</p>
            <p className="text-xs text-text-secondary">Réponse sous 24h</p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-sm border border-border/50 text-center">
            <div className="w-12 h-12 mx-auto bg-accent/10 rounded-full flex items-center justify-center mb-3">
              <MapPin size={24} className="text-accent" />
            </div>
            <h3 className="font-semibold text-text-primary">Adresse</h3>
            <p className="text-sm text-text-secondary">Casablanca, Maroc</p>
            <p className="text-xs text-text-secondary">Voir sur Google Maps</p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-sm border border-border/50 text-center">
            <div className="w-12 h-12 mx-auto bg-accent-2/10 rounded-full flex items-center justify-center mb-3">
              <Clock size={24} className="text-accent-2" />
            </div>
            <h3 className="font-semibold text-text-primary">Horaires</h3>
            <p className="text-sm text-text-secondary">Lun-Ven: 9h-21h</p>
            <p className="text-xs text-text-secondary">Sam-Dim: 10h-18h</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-border/50">
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                Envoyez-nous un message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Sujet
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full bg-primary text-white hover:bg-primary/90">
                  Envoyer le message
                </Button>
              </form>
            </div>
          </div>

          {/* FAQ / Help */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
              <h3 className="font-bold text-text-primary mb-4">Questions fréquentes</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-text-primary">Comment passer une commande ?</h4>
                  <p className="text-sm text-text-secondary mt-1">
                    Ajoutez vos articles au panier, puis suivez les étapes de paiement.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">Quels sont les délais de livraison ?</h4>
                  <p className="text-sm text-text-secondary mt-1">
                    Livraison en 24-48h dans tout le Maroc.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">Quels moyens de paiement acceptez-vous ?</h4>
                  <p className="text-sm text-text-secondary mt-1">
                    Paiement à la livraison, carte bancaire, et plus.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}