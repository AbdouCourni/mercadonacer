'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Loader2, User, Phone, Truck, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DeliveryDriver {
  id: string
  full_name: string
  phone: string
  vehicle_type: string
  license_plate: string
  max_deliveries_per_day: number
  is_available: boolean
  total_deliveries: number
  rating: number
  created_at: string
}

export default function DeliveryDriversPage() {
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  // Fetch drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch('/api/dashboard/drivers')
        if (response.ok) {
          const data = await response.json()
          setDrivers(data.drivers || [])
        }
      } catch (error) {
        console.error('Error fetching drivers:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDrivers()
  }, [])

  // Toggle driver availability
  const toggleAvailability = async (id: string, isAvailable: boolean) => {
    try {
      const response = await fetch(`/api/dashboard/drivers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !isAvailable })
      })
      if (response.ok) {
        setDrivers(drivers.map(d => 
          d.id === id ? { ...d, is_available: !isAvailable } : d
        ))
      }
    } catch (error) {
      console.error('Error updating driver:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Livreurs</h1>
          <p className="text-text-secondary text-sm">{drivers.length} livreur{drivers.length > 1 ? 's' : ''}</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white hover:bg-primary/90"
        >
          <Plus size={18} className="mr-2" />
          Ajouter un livreur
        </Button>
      </div>

      {/* Drivers Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={40} className="animate-spin text-primary" />
        </div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-border">
          <Truck size={48} className="mx-auto text-text-secondary/30 mb-4" />
          <h3 className="text-lg font-medium text-text-primary">Aucun livreur</h3>
          <p className="text-text-secondary">Commencez par ajouter votre premier livreur.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((driver) => (
            <div key={driver.id} className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{driver.full_name}</p>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Phone size={14} />
                      {driver.phone}
                    </div>
                  </div>
                </div>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  driver.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {driver.is_available ? 'Disponible' : 'Occupé'}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="bg-muted/30 p-2 rounded-lg text-center">
                  <p className="text-text-secondary text-xs">Véhicule</p>
                  <p className="font-medium text-text-primary capitalize">{driver.vehicle_type || 'N/A'}</p>
                </div>
                <div className="bg-muted/30 p-2 rounded-lg text-center">
                  <p className="text-text-secondary text-xs">Livraisons</p>
                  <p className="font-medium text-text-primary">{driver.total_deliveries || 0}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-sm font-medium text-text-primary">{driver.rating?.toFixed(1) || '0.0'}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAvailability(driver.id, driver.is_available)}
                    className="text-xs px-2 py-1 rounded border border-border hover:bg-muted transition-colors"
                  >
                    {driver.is_available ? 'Marquer occupé' : 'Marquer disponible'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}