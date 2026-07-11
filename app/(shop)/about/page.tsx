import { Button } from '../../../components/ui/button'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary">
            À propos de <span className="text-gradient">Magasin</span>
          </h1>
          <p className="text-xl text-text-secondary mt-4">
            Votre supermarché en ligne de confiance au Maroc
          </p>
        </div>

        {/* Story */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-border/50 mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Notre Histoire
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            Fondé en 2024, Magasin est né d'une vision simple : rendre les courses 
            quotidiennes plus faciles et plus agréables pour les familles marocaines.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Nous croyons que faire ses courses devrait être un plaisir, pas une corvée. 
            C'est pourquoi nous proposons plus de 5000 produits de qualité, des fruits 
            frais aux appareils électroménagers, le tout livré directement à votre porte.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-6 bg-muted rounded-2xl">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-3xl mb-4">
              🥬
            </div>
            <h3 className="font-bold text-text-primary mb-2">Produits Frais</h3>
            <p className="text-sm text-text-secondary">
              Sélectionnés avec soin pour garantir la meilleure qualité
            </p>
          </div>
          <div className="text-center p-6 bg-muted rounded-2xl">
            <div className="w-16 h-16 mx-auto bg-secondary/10 rounded-full flex items-center justify-center text-3xl mb-4">
              🚚
            </div>
            <h3 className="font-bold text-text-primary mb-2">Livraison Rapide</h3>
            <p className="text-sm text-text-secondary">
              Recevez vos courses en 24h dans tout le Maroc
            </p>
          </div>
          <div className="text-center p-6 bg-muted rounded-2xl">
            <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center text-3xl mb-4">
              💰
            </div>
            <h3 className="font-bold text-text-primary mb-2">Prix Compétitifs</h3>
            <p className="text-sm text-text-secondary">
              Les meilleurs prix du marché, sans compromis sur la qualité
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Prêt à faire vos courses ?
          </h2>
          <Link href="/products">
            <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
              Découvrir nos produits
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}