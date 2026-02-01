/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import CSVUploader from '@/components/CSVUploader';
import Dashboard from '@/components/Dashboard';
import { Upload, FileCheck, AlertTriangle, ClipboardCheck, ArrowRight, Shield, X, User, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const syncUserProfile = async (user: any) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
        last_sign_in_at: new Date().toISOString(),
      });

      if (error) {
        // Silently fail if table doesn't exist, as this is an enhancement
        console.warn('Error syncing user profile (table might not exist):', error);
      }
    } catch (err) {
      console.error('Exception syncing user profile:', err);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        syncUserProfile(user);
      }
    };
    checkUser();
  }, [supabase.auth]);

  const handleDataParsed = async (data: any[]) => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze data');
      }

      const result = await response.json();
      const endTime = performance.now();
      setProcessingTime(Math.round(endTime - startTime));
      setResults(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await syncUserProfile(data.user);
        setUser(data.user);
      }

      // Login successful
      setShowSignIn(false);
      setShowUpload(true); // Redirect to upload area or dashboard
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message);
      setAuthLoading(false);
    }
  };

  // Placeholder for future auth integration
  const handleAuthAction = (action: string) => {
    console.log(`[Auth] ${action} triggered`);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowUpload(false);
    setShowProfileMenu(false);
  };

  if (results) {
    return (
      <main className="min-h-screen p-8 bg-background">
        <Dashboard
          summary={results.summary}
          results={results.results}
          processingTime={processingTime}
          onReset={() => {
            setResults(null);
            setProcessingTime(null);
            setShowUpload(false);
          }}
        />
      </main>
    );
  }

  if (showUpload) {
    return (
      <div className="min-h-screen relative">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0" />

        <header className="sticky top-0 z-50 glass-header-footer">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/30 shadow-sm bg-white/10">
                <Image
                  src="/images/logo.png"
                  alt="SolarSuraksha Logo"
                  fill
                  className="object-cover p-1"
                />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">SolarSuraksha</h1>
            </div>
            <button
              onClick={() => setShowUpload(false)}
              className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              ← Back to Home
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12 relative z-10">
          {loading ? (
            <div className="flex flex-col items-center gap-6 py-20 bg-white/90 backdrop-blur-md rounded-3xl border border-gray-200 p-12 shadow-xl">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-lg font-medium text-white">Processing data...</p>
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
              <div className="mb-8 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Upload Data</h2>
                <p className="text-gray-200 text-lg">Submit CSV files for verification</p>
              </div>
              <CSVUploader
                onDataParsed={handleDataParsed}
                onError={(err) => setError(err)}
              />
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen relative overflow-hidden">

        <header className="fixed top-0 left-0 right-0 z-50 glass-header-footer">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm">
                <Image
                  src="/images/logo_v2.png"
                  alt="SolarSuraksha Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">SolarSuraksha</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUpload(true)}
                className="hidden sm:block px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-primary to-emerald-600 text-white rounded-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300"
              >
                Dashboard
              </button>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="p-2.5 glass-button rounded-full transition-all duration-300 flex items-center justify-center"
                  >
                    <User className="w-5 h-5 text-white" />
                  </button>
                  {showProfileMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-0"
                        onClick={() => setShowProfileMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 glass-card border border-white/20 rounded-xl shadow-xl overflow-hidden z-10">
                        <div className="p-3 border-b border-white/20 bg-white/10">
                          <p className="text-sm font-medium text-white truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={() => { setShowUpload(true); setShowProfileMenu(false); }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          Upload CSV
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowSignIn(true)}
                  className="px-5 py-2.5 text-sm font-medium glass-button text-gray-900 rounded-lg transition-all duration-300"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </header>

        <main>
          <section className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-left space-y-8 animate-in slide-in-from-left duration-1000">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-xl">
                    <Image src="/images/logo_v2.png" alt="Logo" fill className="object-cover" />
                  </div>
                  <div className="inline-flex items-center gap-2 px-5 py-2 backdrop-blur-md bg-white/80 border border-white/90 rounded-full shadow-lg shadow-black/10">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-gray-900">Subsidy Fraud Detection Portal</span>
                  </div>
                </div>

                <h2 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] drop-shadow-2xl">
                  PM-KUSUM <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400">Beneficiary Audit</span> <br />
                  System
                </h2>

                <p className="text-xl text-gray-200 max-w-xl leading-relaxed font-medium">
                  Identify and mitigate compliance deviations in application data through automated cross-validation and risk analysis.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                  <button
                    onClick={() => setShowUpload(true)}
                    className="group px-8 py-5 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-2xl font-bold shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-105 active:scale-95 text-lg"
                  >
                    <span className="flex items-center gap-3">
                      Upload Applications for Screening
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>

              <div className="relative flex justify-center lg:justify-end">
                {/* 
                   Transparent mascot floating naturally on the background 
                */}
                <div className="relative w-full max-w-[720px] aspect-square flex items-center justify-center">
                  <div className="relative w-full h-full animate-float">
                    <Image
                      src="/images/mascot_v2.png"
                      alt="Solar Suraksha Official Mascot"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="max-w-6xl mx-auto px-6 py-20 pt-32">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-white mb-4 drop-shadow-lg font-display tracking-tight text-balance">System Audit Framework</h3>
              <p className="text-gray-200 max-w-2xl mx-auto font-medium">Official protocols for fraud identification and application vetting</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group p-8 glass-card rounded-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <div className="w-14 h-14 backdrop-blur-md bg-gradient-to-br from-primary/30 to-emerald-600/30 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg shadow-primary/20">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg text-white mb-2">Batch Intake</h4>
                  <p className="text-sm text-gray-300 leading-relaxed font-medium">Ingest massive beneficiary datasets for concurrent processing</p>
                </div>
              </div>

              <div className="group p-8 glass-card rounded-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <div className="w-14 h-14 backdrop-blur-md bg-gradient-to-br from-primary/30 to-emerald-600/30 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg shadow-primary/20">
                    <FileCheck className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg text-white mb-2">Heuristic Screening</h4>
                  <p className="text-sm text-gray-300 leading-relaxed font-medium">Execute rule-based integrity checks across field datasets</p>
                </div>
              </div>

              <div className="group p-8 glass-card rounded-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <div className="w-14 h-14 backdrop-blur-md bg-gradient-to-br from-primary/30 to-emerald-600/30 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg shadow-primary/20">
                    <AlertTriangle className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg text-white mb-2">Pattern Isolation</h4>
                  <p className="text-sm text-gray-300 leading-relaxed font-medium">Identify suspect clusters and anomalous behavioral patterns</p>
                </div>
              </div>

              <div className="group p-8 glass-card rounded-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <div className="w-14 h-14 backdrop-blur-md bg-gradient-to-br from-primary/30 to-emerald-600/30 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg shadow-primary/20">
                    <ClipboardCheck className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg text-white mb-2">Official Dossier</h4>
                  <p className="text-sm text-gray-300 leading-relaxed font-medium">Generate compliance-ready audit reports for field officers</p>
                </div>
              </div>
            </div>
          </section>

          <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-white mb-4 drop-shadow-lg font-display tracking-tight">Audit Lifecycle</h3>
              <p className="text-gray-200 max-w-2xl mx-auto font-medium leading-relaxed">Four-stage automated screening process for application vetting</p>
            </div>
            <div className="space-y-6">
              {[
                { num: 1, title: 'Secure Data Ingestion', desc: 'Encrypted transfer of beneficiary datasets (CSV/Batch)' },
                { num: 2, title: 'Core Validation', desc: 'System executes heuristic and cross-reference checks' },
                { num: 3, title: 'Risk Stratification', desc: 'Anomalies are classified by advisory risk levels' },
                { num: 4, title: 'Advisory Review', desc: 'Final audit report generation for field validation' }
              ].map((step) => (
                <div key={step.num} className="group flex items-center gap-8 p-8 glass-card rounded-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xl shadow-primary/30 group-hover:scale-110 transition-transform">
                    {step.num}
                  </div>
                  <div className="relative">
                    <h4 className="font-bold text-xl text-white mb-2">{step.title}</h4>
                    <p className="text-gray-300 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="max-w-4xl mx-auto px-6 py-20 text-center">
            <div className="p-12 glass-card rounded-3xl relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl pointer-events-none" />
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Ready to Begin?</h3>
                <p className="text-gray-200 mb-8 font-medium">Commence automated application screening and audit verification</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => setShowUpload(true)}
                    className="px-8 py-4 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl font-bold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105"
                  >
                    Access Audit Dashboard
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="relative mt-20 glass-header-footer pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm">
                    <Image
                      src="/images/logo_v2.png"
                      alt="SolarSuraksha Logo"
                      fill
                      className="object-cover p-1"
                    />
                  </div>
                  <span className="text-xl font-bold text-white tracking-tight">SolarSuraksha</span>
                </div>
                <p className="text-sm text-gray-200 leading-relaxed">
                  Advanced automated audit system for PM-KUSUM verification. Ensuring transparency and integrity in solar energy distribution.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Resources</h4>
                <ul className="space-y-4">
                  {['Documentation', 'API Reference', 'User Guide', 'Status Dashboard'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-sm text-gray-300 hover:text-primary transition-colors">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Support</h4>
                <ul className="space-y-4">
                  {['Help Center', 'Technical Support', 'Community Forum', 'Contact Us'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-sm text-gray-300 hover:text-primary transition-colors">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Contact</h4>
                <ul className="space-y-4">
                  <li className="text-sm text-gray-300">
                    <span className="block font-medium text-white mb-1">Email</span>
                    support@solarsuraksha.gov.in
                  </li>
                  <li className="text-sm text-gray-300">
                    <span className="block font-medium text-white mb-1">Office</span>
                    Shastri Bhawan, New Delhi, India
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex gap-8">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-xs font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>

              <div className="text-xs font-medium text-gray-300">
                © {new Date().getFullYear()} Ministry of New and Renewable Energy.
              </div>
            </div>
          </div>
        </footer>

        <style jsx global>{`
          html {
            scroll-behavior: smooth;
          }
        `}</style>
      </div>

      {showSignIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
            <div className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl relative border border-white/20">
              <button
                onClick={() => setShowSignIn(false)}
                className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex justify-center mb-6">
                <div className="relative w-14 h-14 rounded-full overflow-hidden shadow-lg shadow-black/20">
                  <Image
                    src="/images/logo_v2.png"
                    alt="SolarSuraksha Logo"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-center text-white mb-2 tracking-tight">Login</h2>
              <p className="text-center text-gray-300 mb-10 text-sm">Secure access to verification portal</p>

              {authError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                  {authError}
                </div>
              )}

              <form onSubmit={handleEmailLogin} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-200 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/40"
                    />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Stay signed in</span>
                  </label>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleAuthAction('Password Recovery'); }}
                    className="text-sm font-semibold text-primary hover:text-emerald-700 transition-colors"
                  >
                    Reset Password
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {authLoading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-8 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-transparent text-gray-400 font-bold uppercase tracking-widest">Standard login</span>
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center gap-6">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all shadow-sm active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-sm font-bold text-gray-200">Google</span>
                </button>

                <p className="text-sm text-gray-400">
                  New administrator? <a href="#" className="font-bold text-primary hover:text-emerald-700 transition-colors uppercase tracking-tight">Request Access</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
