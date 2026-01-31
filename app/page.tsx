'use client';

import React, { useState } from 'react';
import CSVUploader from '@/components/CSVUploader';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const handleDataParsed = async (data: any[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/analyze', {
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
      setResults(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  if (results) {
    return (
      <main className="min-h-screen p-8 bg-background">
        <Dashboard
          summary={results.summary}
          results={results.results}
          onReset={() => {
            setResults(null);
            setShowUpload(false);
          }}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-6 py-20 relative overflow-hidden">
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

      {/* Hero Content with Staggered Reveals */}
      <div className="max-w-5xl w-full text-center space-y-6 z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-sm"
          style={{ animation: 'slideInDown 0.8s ease-out backwards' }}>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-primary text-sm font-medium tracking-wide">AI-POWERED SECURITY PLATFORM</span>
        </div>

        {/* Main Heading - Bebas Neue */}
        <h1 className="font-[family-name:var(--font-bebas)] text-7xl md:text-9xl leading-none tracking-wider"
          style={{ animation: 'slideInUp 0.8s ease-out 0.2s backwards' }}>
          <span className="block text-primary drop-shadow-[0_0_30px_rgba(0,217,255,0.5)]">
            PM-KUSUM
          </span>
          <span className="block text-foreground mt-2">
            FRAUD DETECTION
          </span>
        </h1>

        {/* Subheading - Playfair Display */}
        {!showUpload && (
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-[family-name:var(--font-playfair)] italic"
            style={{ animation: 'fadeInScale 0.8s ease-out 0.4s backwards' }}>
            Advanced anomaly detection & real-time monitoring system
            <br />
            <span className="text-secondary-foreground not-italic font-medium">
              powered by machine learning intelligence
            </span>
          </p>
        )}

        {/* Stats Grid */}
        {!showUpload && (
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto py-8"
            style={{ animation: 'slideInUp 0.8s ease-out 0.6s backwards' }}>
            <div className="space-y-1">
              <div className="font-[family-name:var(--font-bebas)] text-4xl text-primary tracking-wider">99.7%</div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
            </div>
            <div className="space-y-1 border-x border-border/50">
              <div className="font-[family-name:var(--font-bebas)] text-4xl text-accent tracking-wider">24/7</div>
              <div className="text-sm text-muted-foreground">Monitoring</div>
            </div>
            <div className="space-y-1">
              <div className="font-[family-name:var(--font-bebas)] text-4xl text-secondary-foreground tracking-wider">&lt;2MIN</div>
              <div className="text-sm text-muted-foreground">Detection Time</div>
            </div>
          </div>
        )}

        {/* CTA Buttons or Upload Zone */}
        <div className="flex flex-col items-center justify-center gap-6 pt-4 min-h-[200px]"
          style={{ animation: 'slideInUp 0.8s ease-out 0.8s backwards' }}>

          {!showUpload ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowUpload(true)}
                className="group relative px-8 py-4 rounded-lg bg-primary text-primary-foreground font-[family-name:var(--font-bebas)] text-xl tracking-widest overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,217,255,0.4)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative">GET STARTED</span>
              </button>

              <button className="group px-8 py-4 rounded-lg border-2 border-accent text-accent font-[family-name:var(--font-bebas)] text-xl tracking-widest transition-all duration-300 hover:bg-accent hover:text-accent-foreground hover:scale-105 hover:shadow-[0_0_30px_rgba(255,149,0,0.3)]">
                LEARN MORE
              </button>
            </div>
          ) : (
            <div className="w-full max-w-xl animate-in fade-in zoom-in-95 duration-500">
              {loading ? (
                <div className="flex flex-col items-center gap-4 py-12">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="font-[family-name:var(--font-bebas)] tracking-widest text-xl animate-pulse">ANALYZING FRAUD PATTERNS...</p>
                </div>
              ) : (
                <CSVUploader
                  onDataParsed={handleDataParsed}
                  onError={(err) => setError(err)}
                />
              )}
              {error && <p className="mt-4 text-red-500 text-sm font-medium">{error}</p>}
              {!loading && (
                <button
                  onClick={() => setShowUpload(false)}
                  className="mt-6 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                >
                  ← BACK TO HOME
                </button>
              )}
            </div>
          )}
        </div>

        {/* Feature Pills */}
        {!showUpload && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6"
            style={{ animation: 'fadeInScale 0.8s ease-out 1s backwards' }}>
            {['Real-time Alerts', 'Pattern Recognition', 'Predictive Analytics', 'Geographic Mapping'].map((feature, index) => (
              <div key={feature}
                className="px-4 py-2 rounded-full bg-card border border-border/50 text-sm text-foreground/80 backdrop-blur-sm hover:border-primary/50 hover:text-primary transition-all duration-300 cursor-pointer"
                style={{ animation: `fadeInScale 0.6s ease-out ${1.2 + index * 0.1}s backwards` }}>
                {feature}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      {!showUpload && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce"
          style={{ animation: 'fadeInScale 0.8s ease-out 1.5s backwards, bounce 2s ease-in-out 2s infinite' }}>
          <span className="text-xs text-muted-foreground tracking-widest">SCROLL TO EXPLORE</span>
          <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
            <div className="w-1 h-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      )}
    </main>
  );
}

