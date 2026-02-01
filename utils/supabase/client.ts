
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    // Fallback to placeholder values to prevent build errors if env vars are missing
    // Note: The application will not function correctly without valid credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.example_signature'

    return createBrowserClient(
        supabaseUrl,
        supabaseKey
    )
}
