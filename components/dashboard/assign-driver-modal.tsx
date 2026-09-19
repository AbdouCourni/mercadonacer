// File: components/dashboard/assign-driver-modal.tsx
// Path: /components/dashboard/assign-driver-modal.tsx
// Description: Modal for assigning a driver to an order

'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Truck, User, Phone, MapPin, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Driver {
  id: string
  full_name: string
  phone: string
  is_available: boolean
  driver_zone: string | null
  is_active: boolean
}

interface AssignDriverModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  orderNumber: string
  currentDriverName: string | null
  onAssign: (orderId: string, driverId: string) => Promise<void>
}

export function AssignDriverModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  currentDriverName,
  onAssign
}: AssignDriverModalProps) {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState<string | null>(null)
  const [selectedDriverId, setSelectedDriverId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch drivers
  useEffect(() => {
    if (isOpen) {
      fetchDrivers()
    }
  }, [isOpen])

  const fetchDrivers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/dashboard/drivers')
      if (response.ok) {
        const data = await response.json()
        setDrivers(data.drivers || [])
        // Auto-select current driver if assigned
        if (currentDriverName) {
          const current = data.drivers?.find((d: Driver) => d.full_name === currentDriverName)
          if (current) {
            setSelectedDriverId(current.id)
          }
        }
      } else {
        setError('Impossible de charger la liste des livreurs')
      }
    } catch (error) {
      console.error('Error fetching drivers:', error)
      setError('Erreur lors du chargement des livreurs')
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedDriverId) {
      setError('Veuillez sélectionner un livreur')
      return
    }

    setAssigning(selectedDriverId)
    setError(null)
    try {
      await onAssign(orderId, selectedDriverId)
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'assignation')
    } finally {
      setAssigning(null)
    }
  }

  // Filter drivers by search
  const filteredDrivers = drivers.filter(driver => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      driver.full_name.toLowerCase().includes(search) ||
      driver.phone.includes(search) ||
      (driver.driver_zone && driver.driver_zone.toLowerCase().includes(search))
    )
  })

  const availableDrivers = filteredDrivers.filter(d => d.is_available && d.is_active !== false)
  const unavailableDrivers = filteredDrivers.filter(d => !d.is_available || d.is_active === false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Truck size={22} className="text-primary" />
              Assigner un livreur
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Commande #{orderNumber}
              {currentDriverName && (
                <span className="ml-2 text-green-600">
                  • Actuel: {currentDriverName}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Rechercher un livreur (nom, téléphone, zone)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-12">
              <Truck size={48} className="mx-auto text-text-secondary/30 mb-4" />
              <h3 className="text-lg font-medium text-text-primary">Aucun livreur</h3>
              <p className="text-text-secondary text-sm">
                Aucun livreur n'est disponible pour le moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Available Drivers */}
              {availableDrivers.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-green-600 mb-2 flex items-center gap-2">
                    <CheckCircle size={14} />
                    {availableDrivers.length} livreur{availableDrivers.length > 1 ? 's' : ''} disponible{availableDrivers.length > 1 ? 's' : ''}
                  </h3>
                  <div className="space-y-2">
                    {availableDrivers.map((driver) => (
                      <DriverCard
                        key={driver.id}
                        driver={driver}
                        isSelected={selectedDriverId === driver.id}
                        onSelect={() => setSelectedDriverId(driver.id)}
                        isAssigning={assigning === driver.id}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Unavailable Drivers */}
              {unavailableDrivers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h3 className="text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                    <AlertCircle size={14} />
                    {unavailableDrivers.length} livreur{unavailableDrivers.length > 1 ? 's' : ''} indisponible{unavailableDrivers.length > 1 ? 's' : ''}
                  </h3>
                  <div className="space-y-2 opacity-60">
                    {unavailableDrivers.map((driver) => (
                      <DriverCard
                        key={driver.id}
                        driver={driver}
                        isSelected={false}
                        onSelect={() => {}}
                        isAssigning={false}
                        disabled
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30 flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={!!assigning}
          >
            Annuler
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedDriverId || !!assigning || loading}
            className="bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
          >
            {assigning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Assignation...
              </>
            ) : (
              <>
                <Truck size={16} />
                Assigner le livreur
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Driver Card Component
// ============================================

interface DriverCardProps {
  driver: Driver
  isSelected: boolean
  onSelect: () => void
  isAssigning: boolean
  disabled?: boolean
}

function DriverCard({ driver, isSelected, onSelect, isAssigning, disabled }: DriverCardProps) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "w-full text-left p-4 rounded-xl border-2 transition-all",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border hover:border-primary/50 hover:bg-muted/30",
        disabled && "opacity-60 cursor-not-allowed hover:border-border hover:bg-transparent"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            isSelected ? "bg-primary/10" : "bg-muted"
          )}>
            <User size={18} className={isSelected ? "text-primary" : "text-text-secondary"} />
          </div>
          <div>
            <p className="font-medium text-text-primary">{driver.full_name}</p>
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <Phone size={12} />
                {driver.phone}
              </span>
              {driver.driver_zone && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {driver.driver_zone}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSelected && (
            <CheckCircle size={18} className="text-primary" />
          )}
          {isAssigning && (
            <Loader2 size={16} className="animate-spin text-primary" />
          )}
          {driver.is_available && (
            <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
              Disponible
            </span>
          )}
        </div>
      </div>
    </button>
  )
}