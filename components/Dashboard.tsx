
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPoint } from './FraudMap';
import { X, ExternalLink, Download, FileText, BarChart3, Clock, AlertTriangle } from 'lucide-react';

const FraudMap = dynamic(() => import('./FraudMap'), { ssr: false });

interface DashboardProps {
    summary: {
        total: number;
        highRisk: number;
        mediumRisk: number;
        lowRisk: number;
    };
    results: any[];
    processingTime: number | null;
    onReset: () => void;
}

export default function Dashboard({ summary, results, processingTime, onReset }: DashboardProps) {
    const [selectedApp, setSelectedApp] = useState<any | null>(null);

    const mapPoints: MapPoint[] = results
        .filter(r => r.gps_lat && r.gps_long && r.riskLevel === 'High')
        .map(r => ({
            id: r.id,
            lat: r.gps_lat,
            lng: r.gps_long,
            name: r.name,
            isHighRisk: r.riskLevel === 'High',
            description: r.flags.map((f: any) => f.description).join(', ')
        }));

    const handleExport = () => {
        const headers = ['ID', 'Name', 'Aadhaar (L4)', 'Phone', 'Bank Account', 'Risk Level', 'Confidence', 'Flags'];
        const rows = results.map(r => [
            r.id,
            r.name,
            r.aadhaar_last4 || '',
            r.phone || '',
            r.bank_account || '',
            r.riskLevel,
            r.flags.length > 0 ? Math.max(...r.flags.map((f: any) => f.confidence || 0)) : 0,
            r.flags.map((f: any) => f.type).join('; ')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `SolarSuraksha_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getConfidence = (flags: any[]) => {
        if (!flags || flags.length === 0) return 0;
        return Math.max(...flags.map(f => f.confidence || 0));
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">ANALYSIS RESULTS</h2>
                    <p className="text-gray-300">Comprehensive risk assessment for uploaded batch</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={handleExport}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors font-medium tracking-wide text-sm"
                    >
                        <Download className="w-4 h-4" />
                        <span>EXPORT REPORT</span>
                    </button>
                    <button
                        onClick={onReset}
                        className="flex-1 md:flex-none px-6 py-2 rounded-lg bg-primary text-white hover:bg-emerald-600 transition-colors font-medium tracking-wide text-sm shadow-lg shadow-primary/20"
                    >
                        UPLOAD NEW BATCH
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl space-y-2">
                    <p className="text-sm font-medium text-gray-300 uppercase tracking-wider">Total Applications</p>
                    <p className="text-4xl font-bold text-white tracking-wider">{summary.total}</p>
                </div>
                <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 p-6 rounded-2xl space-y-2">
                    <p className="text-sm font-medium text-red-200 uppercase tracking-wider">High Risk</p>
                    <p className="text-4xl font-bold text-white tracking-wider">{summary.highRisk}</p>
                </div>
                <div className="bg-amber-500/20 backdrop-blur-md border border-amber-500/30 p-6 rounded-2xl space-y-2">
                    <p className="text-sm font-medium text-amber-200 uppercase tracking-wider">Medium Risk</p>
                    <p className="text-4xl font-bold text-white tracking-wider">{summary.mediumRisk}</p>
                </div>
                <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 p-6 rounded-2xl space-y-2">
                    <p className="text-sm font-medium text-emerald-200 uppercase tracking-wider">Low Risk</p>
                    <p className="text-4xl font-bold text-white tracking-wider">{summary.lowRisk}</p>
                </div>
            </div>

            {/* Stats Summary & Processing Time */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">High Risk Share</p>
                        <p className="text-xl font-bold text-white">{((summary.highRisk / summary.total) * 100).toFixed(1)}%</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <FileText className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Data Consistency</p>
                        <p className="text-xl font-bold text-white">{((summary.lowRisk / summary.total) * 100).toFixed(1)}%</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-xl">
                        <Clock className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Processing Time</p>
                        <p className="text-xl font-bold text-white">{processingTime || 0}ms</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Table View */}
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl lg:max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left border-collapse text-white">
                        <thead className="sticky top-0 bg-black/40 backdrop-blur-md z-20">
                            <tr className="border-b border-white/10 text-xs text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-4 font-semibold">Beneficiary</th>
                                <th className="px-6 py-4 font-semibold">Risk Level</th>
                                <th className="px-6 py-4 font-semibold">Confidence</th>
                                <th className="px-6 py-4 font-semibold">Flags</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {results.map((row) => (
                                <tr
                                    key={row.id}
                                    onClick={() => setSelectedApp(row)}
                                    className={`hover:bg-white/5 transition-colors cursor-pointer group ${row.riskLevel === 'High' ? 'bg-red-500/10' : ''}`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{row.name}</span>
                                            <span className="text-[10px] text-gray-400 font-mono">{row.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${row.riskLevel === 'High' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                            row.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                            }`}>
                                            {row.riskLevel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${row.riskLevel === 'High' ? 'bg-red-500' : row.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${getConfidence(row.flags)}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1 block">{getConfidence(row.flags)}%</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {row.flags.map((f: any, i: number) => (
                                                <span key={i} className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded border border-white/10" title={f.description}>
                                                    {f.type}
                                                </span>
                                            ))}
                                            {row.flags.length === 0 && <span className="text-xs text-gray-500 italic">No anomalies</span>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Map View */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl min-h-[500px] flex flex-col">
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Geospatial Risk Map (High Risk Only)</p>
                    </div>
                    <div className="flex-1">
                        <FraudMap points={mapPoints} />
                    </div>
                </div>
            </div>

            {/* Application Detail Modal */}
            {selectedApp && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-gray-900 border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div>
                                <h3 className="text-xl font-bold text-white">{selectedApp.name}</h3>
                                <p className="text-sm text-gray-400">Application Audit Journal • #{selectedApp.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedApp(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Risk Classification</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${selectedApp.riskLevel === 'High' ? 'bg-red-500' : selectedApp.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                        <span className="font-bold text-white uppercase tracking-wider">{selectedApp.riskLevel} Risk</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Verified Aadhaar</p>
                                    <p className="font-mono text-white">{selectedApp.aadhaar_last4 ? `XXXX XXXX ${selectedApp.aadhaar_last4}` : 'N/A'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-xs text-gray-500 uppercase tracking-widest">Audit Flags & Anomalies</p>
                                {selectedApp.flags.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedApp.flags.map((flag: any, idx: number) => (
                                            <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex gap-4">
                                                <div className="mt-1">
                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white mb-1">{flag.type.replace(/_/g, ' ')}</p>
                                                    <p className="text-sm text-gray-400 leading-relaxed">{flag.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center">
                                        <p className="text-sm text-emerald-400">No anomalies detected during initial verification.</p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t border-white/10 flex justify-end gap-3">
                                <button
                                    onClick={() => setSelectedApp(null)}
                                    className="px-6 py-2 text-sm text-gray-400 font-medium hover:text-white transition-colors"
                                >
                                    Close
                                </button>
                                <button className="flex items-center gap-2 px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-emerald-600 transition-colors">
                                    <ExternalLink className="w-4 h-4" />
                                    <span>FULL DOSSIER</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
