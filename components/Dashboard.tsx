
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { MapPoint } from './FraudMap';

const FraudMap = dynamic(() => import('./FraudMap'), { ssr: false });

interface DashboardProps {
    summary: {
        total: number;
        highRisk: number;
        mediumRisk: number;
        lowRisk: number;
    };
    results: any[];
    onReset: () => void;
}

export default function Dashboard({ summary, results, onReset }: DashboardProps) {
    const mapPoints: MapPoint[] = results
        .filter(r => r.gps_lat && r.gps_long)
        .map(r => ({
            id: r.id,
            lat: r.gps_lat,
            lng: r.gps_long,
            name: r.name,
            isHighRisk: r.riskLevel === 'High',
            description: r.flags.map((f: any) => f.description).join(', ')
        }));

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-[family-name:var(--font-bebas)] tracking-wider text-primary">ANALYSIS RESULTS</h2>
                    <p className="text-muted-foreground font-[family-name:var(--font-playfair)] italic">Comprehensive risk assessment for uploaded batch</p>
                </div>
                <button
                    onClick={onReset}
                    className="px-6 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors font-[family-name:var(--font-bebas)] tracking-widest text-sm"
                >
                    UPLOAD NEW BATCH
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-card border border-border/50 p-6 rounded-2xl space-y-2">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Applications</p>
                    <p className="text-4xl font-[family-name:var(--font-bebas)] tracking-wider">{summary.total}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl space-y-2">
                    <p className="text-sm font-medium text-red-500 uppercase tracking-wider">High Risk</p>
                    <p className="text-4xl font-[family-name:var(--font-bebas)] tracking-wider text-red-500">{summary.highRisk}</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-2xl space-y-2">
                    <p className="text-sm font-medium text-amber-500 uppercase tracking-wider">Medium Risk</p>
                    <p className="text-4xl font-[family-name:var(--font-bebas)] tracking-wider text-amber-500">{summary.mediumRisk}</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl space-y-2">
                    <p className="text-sm font-medium text-emerald-500 uppercase tracking-wider">Low Risk</p>
                    <p className="text-4xl font-[family-name:var(--font-bebas)] tracking-wider text-emerald-500">{summary.lowRisk}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Table View */}
                <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl overflow-hidden shadow-xl lg:max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-card/80 backdrop-blur-md z-20">
                            <tr className="border-b border-border/50 text-xs text-muted-foreground uppercase tracking-widest">
                                <th className="px-6 py-4 font-semibold">ID</th>
                                <th className="px-6 py-4 font-semibold">Beneficiary</th>
                                <th className="px-6 py-4 font-semibold">Aadhaar (L4)</th>
                                <th className="px-6 py-4 font-semibold">Risk Level</th>
                                <th className="px-6 py-4 font-semibold">Flags</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {results.map((row) => (
                                <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{row.id}</td>
                                    <td className="px-6 py-4 text-sm font-medium">{row.name}</td>
                                    <td className="px-6 py-4 text-sm font-mono">{row.aadhaar_last4 || '--'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${row.riskLevel === 'High' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                                                row.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                                                    'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                                            }`}>
                                            {row.riskLevel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {row.flags.map((f: any, i: number) => (
                                                <span key={i} className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded border border-white/10" title={f.description}>
                                                    {f.type}
                                                </span>
                                            ))}
                                            {row.flags.length === 0 && <span className="text-xs text-muted-foreground italic">No anomalies detected</span>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Map View */}
                <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-xl min-h-[500px]">
                    <FraudMap points={mapPoints} />
                </div>
            </div>
        </div>
    );
}
