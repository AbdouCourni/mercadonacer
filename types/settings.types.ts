// File: types/settings.types.ts
// Path: /types/settings.types.ts
// Description: Settings type definitions

export interface Settings {
  id: string
  
  // Company Info
  company_name_fr: string | null
  company_name_ar: string | null
  company_email: string | null
  company_phone: string | null
  company_whatsapp: string | null
  company_address_fr: string | null
  company_address_ar: string | null
  
  // Legal Identifiers
  rc_number: string | null
  ice_number: string | null
  if_number: string | null
  patente_number: string | null
  cndp_declaration: string | null
  
  // Banking
  bank_name: string | null
  bank_rib: string | null
  bank_holder: string | null
  
  // Business Policies
  delivery_time_min: number
  delivery_time_max: number
  cod_max_amount: number
  bank_transfer_min: number
  bank_transfer_max: number
  in_person_only_above: number
  working_hours_fr: string | null
  working_hours_ar: string | null
  
  // Social Media
  facebook_url: string | null
  instagram_url: string | null
  tiktok_url: string | null
  
  // Legal Content
  about_text_fr: string | null
  about_text_ar: string | null
  privacy_text_fr: string | null
  privacy_text_ar: string | null
  terms_text_fr: string | null
  terms_text_ar: string | null
  legal_text_fr: string | null
  legal_text_ar: string | null
  refund_text_fr: string | null
  refund_text_ar: string | null
  delivery_text_fr: string | null
  delivery_text_ar: string | null
  
  // Meta
  updated_at: string
  updated_by: string | null
}

export type Language = 'fr' | 'ar'

export type SettingsField = keyof Omit<Settings, 'id' | 'updated_at' | 'updated_by'>

// Default values for new installs
export const DEFAULT_SETTINGS: Partial<Settings> = {
  company_name_fr: 'Mercado Nacer',
  company_name_ar: 'ميركادو ناصر',
  delivery_time_min: 24,
  delivery_time_max: 48,
  cod_max_amount: 1000,
  bank_transfer_min: 1000,
  bank_transfer_max: 3000,
  in_person_only_above: 3000,
  working_hours_fr: '7j/7 : 9h - 23h',
  working_hours_ar: ' 7j/7 : 9:00 - 23:00',
}

// Helper to get localized field
export function getLocalizedField<K extends SettingsField>(
  settings: Settings | null,
  field: K,
  language: Language
): string {
  if (!settings) return ''
  
  // For fields that have _fr and _ar variants
  const fieldFr = `${field}_fr` as SettingsField
  const fieldAr = `${field}_ar` as SettingsField
  
  if (fieldFr in settings && fieldAr in settings) {
    const value = language === 'ar' 
      ? settings[fieldAr] 
      : settings[fieldFr]
    return (value as string) || ''
  }
  
  // For fields without variants
  return (settings[field] as string) || ''
}