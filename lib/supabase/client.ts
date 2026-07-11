// File: lib/supabase/client.ts
// Path: /lib/supabase/client.ts
// Description: Supabase browser client for MercadoNacer

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}