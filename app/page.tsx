'use client';

import React, { useState } from 'react';
import CSVUploader from '@/components/CSVUploader';
import Dashboard from '@/components/Dashboard';
import { Upload, FileCheck, AlertTriangle, ClipboardCheck, ArrowRight } from 'lucide-react';

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

  if (showUpload) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-semibold">PK</span>
              </div>
              <h1 className="text-xl font-semibold text-foreground">PM-KUSUM Fraud Detection</h1>
            </div>
            <button
              onClick={() => setShowUpload(false)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Home
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12">
          {loading ? (
            <div className="flex flex-col items-center gap-6 py-20">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-lg font-medium text-muted-foreground">Processing data...</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">Upload Beneficiary Data</h2>
                <p className="text-muted-foreground">
                  Upload CSV files containing PM-KUSUM beneficiary information for validation and fraud detection.
                </p>
              </div>
              <CSVUploader
                onDataParsed={handleDataParsed}
                onError={(err) => setError(err)}
              />
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-semibold">PK</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">PM-KUSUM</h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#overview" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Overview
            </a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <button
              onClick={() => setShowUpload(true)}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Go to Dashboard
            </button>
          </nav>
        </div>
      </header>

      <main>
        <section className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            PM-KUSUM Fraud Detection
          </h2>
          <p className="text-xl text-foreground mb-3">
            A verification system for detecting irregularities in PM-KUSUM solar subsidy applications
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Built to support administrators and auditors in maintaining program integrity through systematic checks and validation of beneficiary data.
          </p>
          <a
            href="#overview"
            className="inline-flex items-center gap-2 px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            View System Overview
            <ArrowRight className="w-4 h-4" />
          </a>
        </section>

        <section id="overview" className="bg-white border-y border-border py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h3 className="text-2xl font-bold text-foreground mb-6">Overview</h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                The PM-KUSUM (Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyaan) scheme provides financial support to farmers for installing solar pumps and other renewable energy systems. Like any subsidy program, it requires oversight to prevent misuse.
              </p>
              <p>
                This system helps administrators, auditors, and government authorities identify potential irregularities in beneficiary applications—such as duplicate entries, incomplete documentation, geographic inconsistencies, or other red flags that warrant further investigation.
              </p>
              <p>
                The tool is designed for use by nodal officers, district coordinators, and audit teams responsible for program monitoring and compliance.
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Features</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white border border-border rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Data Ingestion & Validation</h4>
                <p className="text-sm text-muted-foreground">
                  Upload beneficiary data in CSV format. The system validates file structure, required fields, and data formats before processing.
                </p>
              </div>

              <div className="p-6 bg-white border border-border rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileCheck className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Rule-Based Anomaly Checks</h4>
                <p className="text-sm text-muted-foreground">
                  Applies predefined validation rules to flag entries with missing information, duplicate identifiers, or inconsistent patterns.
                </p>
              </div>

              <div className="p-6 bg-white border border-border rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Monitoring & Flagging</h4>
                <p className="text-sm text-muted-foreground">
                  Entries that fail validation checks are flagged for manual review, categorized by severity and type of irregularity.
                </p>
              </div>

              <div className="p-6 bg-white border border-border rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <ClipboardCheck className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Reporting & Summaries</h4>
                <p className="text-sm text-muted-foreground">
                  Generates summary reports with flagged entries, validation statistics, and exportable logs for audit trails.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-white border-y border-border py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">How It Works</h3>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Data Submission</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload CSV files containing beneficiary information including names, Aadhaar details, bank accounts, and location data.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Validation & Checks</h4>
                  <p className="text-sm text-muted-foreground">
                    The system runs validation rules to check for formatting errors, missing required fields, duplicate entries, and other common issues.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Flagging Irregularities</h4>
                  <p className="text-sm text-muted-foreground">
                    Entries that fail one or more checks are flagged and categorized by risk level (high, medium, low) based on the type and number of issues detected.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Review & Reporting</h4>
                  <p className="text-sm text-muted-foreground">
                    Review flagged entries in the dashboard, export reports for further investigation, and track resolution status.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-8">
              Upload beneficiary data to begin validation and fraud detection checks.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowUpload(true)}
                className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Open Dashboard
              </button>
              <button
                onClick={() => setShowUpload(true)}
                className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Upload Data
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>PM-KUSUM Fraud Detection System · Government of India</p>
        </div>
      </footer>
    </div>
  );
}
