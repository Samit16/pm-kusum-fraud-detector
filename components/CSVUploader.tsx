
import React, { useState } from 'react';
import Papa from 'papaparse';

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

    return (
        <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
        >
            <input
                type="file"
                accept=".csv"
                className="hidden"
                id="csvValidation"
                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            />
            <label htmlFor="csvValidation" className="cursor-pointer w-full h-full block">
                {parsing ? (
                    <p className="text-gray-600">Parsing CSV...</p>
                ) : (
                    <div>
                        <p className="text-lg font-medium text-gray-700">Drag & Drop CSV here</p>
                        <p className="text-sm text-gray-500 mt-2">or click to browse</p>
                    </div>
                )}
            </label>
        </div>
    );
}
