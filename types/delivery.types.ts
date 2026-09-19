// File: types/delivery.types.ts
// Path: /types/delivery.types.ts
// Description: Shared delivery types

export interface Zone {
  id: string
  name: string
  color: string
  fee: number
  min_order: number
  coordinates: { lat: number; lng: number }[]
}