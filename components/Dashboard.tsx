
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
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">BENEFICIARY SCREENING REPORT</h2>
                    <p className="text-gray-600">Official audit results for application batch processing</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={handleExport}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium tracking-wide text-sm"
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
                <div className="bg-white/80 backdrop-blur-md border border-gray-200 p-6 rounded-2xl space-y-2 shadow-sm border-l-4 border-l-gray-400">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Applications Screened</p>
                    <p className="text-4xl font-bold text-gray-900 tracking-wider">{summary.total}</p>
                </div>
                <div className="bg-red-50/80 backdrop-blur-md border border-red-100 p-6 rounded-2xl space-y-2 border-l-4 border-l-red-500 shadow-sm">
                    <p className="text-sm font-medium text-red-600 uppercase tracking-wider">Critical Anomalies</p>
                    <p className="text-4xl font-bold text-red-700 tracking-wider">{summary.highRisk}</p>
                </div>
                <div className="bg-amber-50/80 backdrop-blur-md border border-amber-100 p-6 rounded-2xl space-y-2 border-l-4 border-l-amber-500 shadow-sm">
                    <p className="text-sm font-medium text-amber-600 uppercase tracking-wider">Moderate Deviations</p>
                    <p className="text-4xl font-bold text-amber-700 tracking-wider">{summary.mediumRisk}</p>
                </div>
                <div className="bg-emerald-50/80 backdrop-blur-md border border-emerald-100 p-6 rounded-2xl space-y-2 border-l-4 border-l-emerald-500 shadow-sm">
                    <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider">Validated Submissions</p>
                    <p className="text-4xl font-bold text-emerald-700 tracking-wider">{summary.lowRisk}</p>
                </div>
            </div>

            {/* Stats Summary & Processing Time */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Risk Incidence Share</p>
                        <p className="text-xl font-bold text-gray-900">{((summary.highRisk / summary.total) * 100).toFixed(1)}%</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <FileText className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Verification Index</p>
                        <p className="text-xl font-bold text-gray-900">{((summary.lowRisk / summary.total) * 100).toFixed(1)}%</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-xl">
                        <Clock className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Audit Latency</p>
                        <p className="text-xl font-bold text-gray-900">{processingTime ? `${processingTime}ms` : 'Rapid'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Table View */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl overflow-hidden shadow-xl lg:max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left border-collapse text-gray-900">
                        <thead className="sticky top-0 bg-gray-50/90 backdrop-blur-md z-20">
                            <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-widest">
                                <th className="px-6 py-4 font-semibold">Beneficiary Details</th>
                                <th className="px-6 py-4 font-semibold text-center">Advisory Risk</th>
                                <th className="px-6 py-4 font-semibold">Confidence</th>
                                <th className="px-6 py-4 font-semibold">Audit Observations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {results.map((row) => (
                                <tr
                                    key={row.id}
                                    onClick={() => setSelectedApp(row)}
                                    className={`hover:bg-gray-50 transition-colors cursor-pointer group ${row.riskLevel === 'High' ? 'bg-red-50' : ''}`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{row.name}</span>
                                            <span className="text-[10px] text-gray-500 font-mono">{row.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${row.riskLevel === 'High' ? 'bg-red-100 text-red-700 border border-red-200' :
                                            row.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                            }`}>
                                            {row.riskLevel === 'High' ? 'CRITICAL' : row.riskLevel === 'Medium' ? 'MODERATE' : 'VALIDATED'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${row.riskLevel === 'High' ? 'bg-red-500' : row.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${getConfidence(row.flags)}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-gray-500 mt-1 block font-medium">{getConfidence(row.flags)}% Probable</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            {row.flags.map((f: any, i: number) => (
                                                <div key={i} className="flex items-start gap-1.5">
                                                    <span className="text-[10px] text-gray-700 leading-tight">
                                                        <span className="mr-1 inline-block">•</span>
                                                        <span className="font-semibold text-[9px] mr-1">{f.type === 'GPS_CLUSTER' ? 'GPS cluster' : f.type === 'DUPLICATE_AADHAAR' ? 'Aadhaar reused' : f.type === 'BANK_MISMATCH' ? 'Bank details' : f.type}:</span>
                                                        {f.description.toLowerCase()}
                                                    </span>
                                                </div>
                                            ))}
                                            {row.flags.length === 0 && <span className="text-[10px] text-emerald-600 font-medium tracking-wide">CLEAN RECORD</span>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Map View */}
                <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl overflow-hidden shadow-xl min-h-[500px] flex flex-col">
                    <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                        <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Geospatial Risk Map (High Risk Only)</p>
                    </div>
                    <div className="flex-1">
                        <FraudMap points={mapPoints} />
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="max-w-7xl mx-auto px-4 mt-8">
                <p className="text-[10px] text-gray-400 text-center italic leading-relaxed">
                    Disclaimer: Risk scores and audit flags are indicative and intended for preliminary screening only.
                    Official disbursements must be cross-verified according to standard government field inspection protocols.
                    This system serves as an automated advisory tool under the PM-KUSUM verification framework.
                </p>
            </div>

            {/* Application Detail Modal */}
            {selectedApp && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white border border-gray-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedApp.name}</h3>
                                <p className="text-sm text-gray-500 font-medium">Official Disbursement Audit • Case ID: #{selectedApp.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedApp(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">Risk Assessment Classification</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${selectedApp.riskLevel === 'High' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : selectedApp.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                                        <span className={`font-bold text-base uppercase tracking-wider ${selectedApp.riskLevel === 'High' ? 'text-red-700' : selectedApp.riskLevel === 'Medium' ? 'text-amber-700' : 'text-emerald-700'}`}>
                                            {selectedApp.riskLevel === 'High' ? 'CRITICAL RISK' : selectedApp.riskLevel === 'Medium' ? 'MODERATE RISK' : 'VALIDATED'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Verified Aadhaar</p>
                                    <p className="font-mono text-gray-900">{selectedApp.aadhaar_last4 ? `XXXX XXXX ${selectedApp.aadhaar_last4}` : 'N/A'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Audit Observations</p>
                                {selectedApp.flags.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedApp.flags.map((flag: any, idx: number) => (
                                            <div key={idx} className="p-5 bg-white border border-gray-100 rounded-2xl flex gap-4 shadow-sm hover:border-gray-200 transition-colors">
                                                <div className="mt-1">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${selectedApp.riskLevel === 'High' ? 'bg-red-500' : 'bg-amber-500'}`} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 mb-1 tracking-tight">
                                                        {flag.type === 'GPS_CLUSTER' ? 'GPS Aggregation Detected' :
                                                            flag.type === 'DUPLICATE_AADHAAR' ? 'Aadhaar Re-use Identification' :
                                                                flag.type === 'BANK_MISMATCH' ? 'Financial Credential Inconsistency' :
                                                                    flag.type.replace(/_/g, ' ')}
                                                    </p>
                                                    <p className="text-sm text-gray-600 leading-relaxed italic border-l-2 border-gray-100 pl-3">
                                                        {flag.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
                                        <p className="text-sm text-emerald-700 font-medium">Compliance verification successful. No anomalies detected during primary screening.</p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    onClick={() => setSelectedApp(null)}
                                    className="px-6 py-2 text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors"
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
