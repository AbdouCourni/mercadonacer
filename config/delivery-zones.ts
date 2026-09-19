// File: config/delivery-zones.ts
// Path: /config/delivery-zones.ts
// Description: Circular delivery zones - EASY TO ADJUST

export interface CircularZone {
  id: string
  name: string
  color: string
  fee: number
  min_order: number
  center: { lat: number; lng: number }
  radiusKm: number  // 🔥 Radius in kilometers
}

// ⚡ EASY TO ADJUST: Just change radiusKm and center!
export const DELIVERY_ZONES: CircularZone[] = [
  {
    id: 'inner',
    name: 'Zone Centre',
    color: '#22c55e',
    fee: 10,
    min_order: 100,
    center: { lat: 35.169829836951294, lng: -2.933249645530903 },
    radiusKm: 2,    // 🔥 3km radius from shop
  },
  {
    id: 'middle',
    name: 'Zone Moyenne',
    color: '#f59e0b',
    fee: 20,
    min_order: 150,
    center: { lat: 35.169829836951294, lng: -2.933249645530903 },
    radiusKm: 3.5,    // 🔥 7km radius from shop
  },
  {
    id: 'outer',
    name: 'Zone Extérieure',
    color: '#ef4444',
    fee: 30,
    min_order: 200,
    center: { lat: 35.169829836951294, lng: -2.933249645530903 },
    radiusKm: 5,   // 🔥 12km radius from shop
  }
]

// Helper: Check if a point is inside a zone
export function findCircularZone(point: { lat: number; lng: number }): CircularZone | null {
  const distance = getDistanceFromLatLonInKm(
    point.lat, point.lng,
    DELIVERY_ZONES[0].center.lat, DELIVERY_ZONES[0].center.lng
  )
  
  // Check from inner to outer
  for (const zone of DELIVERY_ZONES) {
    if (distance <= zone.radiusKm) {
      return zone
    }
  }
  return null
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}