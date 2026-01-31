
'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async () => {
        setLoading(true)
        setError(null)
        const supabase = createClient()

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${location.origin}/auth/callback`,
                },
            })
            if (error) throw error
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
            {/* Geometric Accent Elements */}
            <div className="absolute top-20 right-10 w-64 h-64 border border-primary/20 rounded-3xl rotate-12 pointer-events-none"
                style={{ animation: 'fadeInScale 1s ease-out 0.3s backwards' }} />
            <div className="absolute bottom-40 left-10 w-48 h-48 border-2 border-accent/30 rotate-45 pointer-events-none"
                style={{ animation: 'fadeInScale 1s ease-out 0.5s backwards' }} />

            {/* Floating Orbs */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary/10 blur-3xl pointer-events-none"
                style={{ animation: 'glowPulse 4s ease-in-out infinite' }} />
            <div className="absolute bottom-1/3 right-1/3 w-40 h-40 rounded-full bg-accent/10 blur-3xl pointer-events-none"
                style={{ animation: 'glowPulse 5s ease-in-out infinite 1s' }} />

            <div className="w-full max-w-md p-8 bg-card border border-border/50 rounded-2xl shadow-xl backdrop-blur-sm z-10"
                style={{ animation: 'slideInUp 0.8s ease-out' }}>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 mb-4">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-primary text-xs font-medium tracking-wide">SECURE ACCESS</span>
                    </div>
                    <h1 className="text-3xl font-[family-name:var(--font-bebas)] tracking-wider text-foreground">WELCOME BACK</h1>
                    <p className="text-muted-foreground font-[family-name:var(--font-playfair)] italic mt-2">Sign in to access the fraud detection dashboard</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full group relative px-6 py-4 rounded-lg bg-card border-2 border-border hover:border-primary/50 text-foreground font-medium transition-all duration-300 flex items-center justify-center gap-3 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            <span>Continue with Google</span>
                        </>
                    )}
                </button>

                <p className="text-center text-xs text-muted-foreground mt-8">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    )
}
