// File: components/delivery/delivery-map-modal.tsx
// Path: /components/delivery/delivery-map-modal.tsx
// Description: Delivery map with circular zones and price note

'use client'

import { useState, useEffect, useCallback } from 'react'
import { GoogleMap, Circle, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api'
import { X, MapPin, Truck, Loader2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DELIVERY_ZONES, findCircularZone, CircularZone } from '@/config/delivery-zones'

const LIBRARIES: ('geometry' | 'drawing' | 'places')[] = ['geometry']
const mapContainerStyle = {
  width: '100%',
  height: '400px'
}

interface DeliveryMapModalProps {
  isOpen: boolean
  onClose: () => void
  shopLocation: { lat: number; lng: number; name?: string; address?: string }
  onZoneSelect: (zone: CircularZone) => void
  selectedZone: CircularZone | null
}

export function DeliveryMapModal({
  isOpen,
  onClose,
  shopLocation,
  onZoneSelect,
  selectedZone
}: DeliveryMapModalProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
  })

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setUserLocation(point)
        
        const zone = findCircularZone(point)
        if (zone) {
          onZoneSelect(zone)
        }
        setIsLocating(false)
      },
      () => {
        alert('Could not get your location. Please select manually on the map.')
        setIsLocating(false)
      }
    )
  }, [onZoneSelect])

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const point = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      }
      setUserLocation(point)
      
      const zone = findCircularZone(point)
      if (zone) {
        onZoneSelect(zone)
      }
    }
  }

  if (loadError) {
    return <div className="text-red-600 p-4">Erreur de chargement de la carte</div>
  }

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-[450px]">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Truck size={20} />
            Zone de livraison
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Shop Info */}
          <div className="bg-muted/30 rounded-lg p-3 text-sm">
            <p className="font-medium text-text-primary">
              📍 {shopLocation.name || 'MercadoNacer'}
            </p>
            <p className="text-text-secondary">
              {shopLocation.address || 'Nador, Maroc'}
            </p>
          </div>

          {/* Map */}
          <div className="relative rounded-xl overflow-hidden border border-border">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={{ lat: shopLocation.lat, lng: shopLocation.lng }}
              zoom={12}
              onClick={handleMapClick}
              options={{
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
            >
              {DELIVERY_ZONES.map((zone) => (
                <Circle
                  key={zone.id}
                  center={zone.center}
                  radius={zone.radiusKm * 1000}
                  options={{
                    fillColor: zone.color,
                    fillOpacity: hoveredZoneId === zone.id ? 0.35 : 0.2,
                    strokeColor: zone.color,
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    clickable: true,
                  }}
                  onMouseOver={() => setHoveredZoneId(zone.id)}
                  onMouseOut={() => setHoveredZoneId(null)}
                  onClick={() => {
                    onZoneSelect(zone)
                  }}
                />
              ))}

              {/* Shop Marker */}
              <Marker
                position={{ lat: shopLocation.lat, lng: shopLocation.lng }}
                label={{
                  text: '🛒',
                  fontSize: '28px',
                }}
                title="MercadoNacer"
              />

              {/* User Location Marker */}
              {userLocation && (
                <Marker
                  position={userLocation}
                  label={{
                    text: '📍',
                    fontSize: '24px',
                  }}
                  title="Votre position"
                />
              )}

              {/* Info Window for selected zone */}
              {selectedZone && userLocation && (
                <InfoWindow
                  position={userLocation}
                  onCloseClick={() => {}}
                >
                  <div className="p-2 max-w-[200px]">
                    <p className="font-medium text-text-primary">
                      {selectedZone.name}
                    </p>
                    <p className="text-primary font-bold">
                      Livraison: {selectedZone.fee} DH
                    </p>
                    <p className="text-xs text-text-secondary">
                      Rayon: {selectedZone.radiusKm} km
                    </p>
                    <p className="text-xs text-text-secondary">
                      Min. commande: {selectedZone.min_order} DH
                    </p>
                    <button
                      onClick={() => {
                        onZoneSelect(selectedZone)
                        onClose()
                      }}
                      className="mt-2 w-full px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary/90"
                    >
                      Sélectionner
                    </button>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>

            {/* Location button */}
            <button
              onClick={getUserLocation}
              disabled={isLocating}
              className="absolute bottom-4 right-4 bg-white shadow-lg rounded-full p-3 hover:bg-muted transition-colors disabled:opacity-50 z-10"
            >
              {isLocating ? (
                <Loader2 size={20} className="animate-spin text-primary" />
              ) : (
                <MapPin size={20} className="text-primary" />
              )}
            </button>
          </div>

          {/* Zone Legend */}
          <div className="flex flex-wrap gap-3 justify-center">
            {DELIVERY_ZONES.map((zone) => (
              <div
                key={zone.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full border-2 cursor-pointer transition-all",
                  selectedZone?.id === zone.id
                    ? `border-[${zone.color}] bg-[${zone.color}]/10`
                    : 'border-transparent hover:bg-muted'
                )}
                style={{
                  borderColor: selectedZone?.id === zone.id ? zone.color : 'transparent',
                  backgroundColor: selectedZone?.id === zone.id ? `${zone.color}20` : 'transparent'
                }}
                onClick={() => {
                  onZoneSelect(zone)
                  onClose()
                }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: zone.color }}
                />
                <span className="text-sm font-medium">{zone.name}</span>
                <span className="text-sm text-text-secondary">{zone.fee} DH</span>
                <span className="text-xs text-text-secondary">({zone.radiusKm}km)</span>
              </div>
            ))}
          </div>

          {/* 🔥 PRICE NOTE - Added here */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <Info size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800 font-medium">
                💡 Note sur les prix de livraison
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Ces prix sont approximatifs et peuvent être discutés avec le livreur en fonction de votre emplacement exact.
                Pour toute question, n'hésitez pas à nous contacter.
              </p>
            </div>
          </div>

          {/* Selected Zone Info */}
          {selectedZone && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
              <p className="text-sm text-text-secondary">
                Zone sélectionnée: <span className="font-medium text-text-primary">{selectedZone.name}</span>
                {' · '}
                <span className="text-primary font-bold">{selectedZone.fee} DH</span>
                {' · Rayon '}
                <span className="font-medium">{selectedZone.radiusKm} km</span>
                {' · Min. '}
                <span className="font-medium">{selectedZone.min_order} DH</span>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}