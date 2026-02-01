
import React, { useState } from 'react';
import Papa from 'papaparse';
import { UploadCloud } from 'lucide-react';

interface CSVUploaderProps {
    onDataParsed: (data: any[]) => void;
    onError?: (error: string) => void;
}

export default function CSVUploader({ onDataParsed, onError }: CSVUploaderProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [parsing, setParsing] = useState(false);

    const handleFile = (file: File) => {
        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            if (onError) onError('Please upload a valid CSV file.');
            return;
        }

        setParsing(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setParsing(false);
                if (results.errors && results.errors.length > 0) {
                    console.error(results.errors);
                    if (onError) onError('Error parsing CSV file. Check console for details.');
                } else {
                    onDataParsed(results.data);
                }
            },
            error: (error) => {
                setParsing(false);
                if (onError) onError(`Parse error: ${error.message}`);
            }
        });
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const onDragLeave = () => {
        setIsDragOver(false);
    };

    const loadSampleData = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const sampleData = [
            {
                "Beneficiary Name": "Rajesh Kumar",
                "Aadhaar": "1234",
                "Mobile": "9876543210",
                "Bank Account": "SBIN0012345",
                "Latitude": "28.6139",
                "Longitude": "77.2090"
            },
            {
                "Beneficiary Name": "Anita Devi",
                "Aadhaar": "1234", // Duplicate Aadhaar
                "Mobile": "9876543211",
                "Bank Account": "SBIN0012346",
                "Latitude": "28.6140",
                "Longitude": "77.2091"
            },
            {
                "Beneficiary Name": "Suresh Singh",
                "Aadhaar": "5678",
                "Mobile": "9876543212",
                "Bank Account": "SBIN0012345", // Duplicate Bank
                "Latitude": "28.6145",
                "Longitude": "77.2095"
            },
            {
                "Beneficiary Name": "Priyanka Verma",
                "Aadhaar": "9012",
                "Mobile": "9876543210", // Duplicate Mobile with Rajesh
                "Bank Account": "ICIC0012345",
                "Latitude": "19.0760",
                "Longitude": "72.8777"
            },
            {
                "Beneficiary Name": "Manoj Tiwari",
                "Aadhaar": "3456",
                "Mobile": "9876543214",
                "Bank Account": "HDFC0012345",
                "Latitude": "28.6138", // GPS Cluster with Rajesh
                "Longitude": "77.2089"
            }
        ];
        onDataParsed(sampleData);
    };

    return (
        <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 cursor-pointer group ${isDragOver
                ? 'border-primary bg-primary/10 scale-[1.02]'
                : 'border-gray-200 bg-white/80 hover:border-primary/50 hover:bg-white'
                }`}
        >
            <input
                type="file"
                accept=".csv"
                className="hidden"
                id="csvValidation"
                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            />
            <div className="flex flex-col items-center justify-center gap-4">
                <label htmlFor="csvValidation" className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-4">
                    {parsing ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                            <p className="text-gray-600 font-medium">Parsing CSV...</p>
                        </div>
                    ) : (
                        <>
                            <div className={`p-4 rounded-full transition-all duration-300 ${isDragOver ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-110'}`}>
                                <UploadCloud className="w-10 h-10" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-gray-900 mb-2">
                                    Submit Beneficiary Dataset (CSV)
                                </p>
                                <p className="text-gray-500 group-hover:text-gray-700 transition-colors font-medium">
                                    Authorized upload protocol for batch screening
                                </p>
                            </div>
                        </>
                    )}
                </label>
                {!parsing && (
                    <div className="mt-4 pt-4 border-t border-gray-100 w-full">
                        <button
                            onClick={loadSampleData}
                            className="text-primary hover:text-emerald-600 text-sm font-bold transition-colors underline decoration-primary/30 underline-offset-4"
                        >
                            Simulate via official sample dataset
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
