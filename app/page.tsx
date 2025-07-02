'use client';

import React, { useState } from 'react';
import { UploadDropzone } from '@/components/UploadDropzone';
import { ResultsTable } from '@/components/ResultsTable';
import { EnrichedRowData } from '@/lib/types';

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<EnrichedRowData[] | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setResults(null);
    setFileId(null);
    setProgress({ current: 0, total: 0 });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file: base64 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process file');
      }

      const data = await response.json();
      setResults(data.results);
      setFileId(data.fileId); // Store the fileId from the response
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file. Please check your file format and try again.');
      console.error('Upload error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (id: string) => {
    window.open(`/api/download?id=${id}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            AI Icebreaker Generator
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your prospect list into personalized conversation starters with AI-powered research
          </p>
          
          <div className="flex justify-center gap-8 mb-8 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xl">
                🔍
              </div>
              <span className="font-semibold text-gray-700">AI Company Research</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xl">
                💼
              </div>
              <span className="font-semibold text-gray-700">LinkedIn Insights</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xl">
                ⚡
              </div>
              <span className="font-semibold text-gray-700">Smart Icebreakers</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-xl">⚠️</span>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!results ? (
          <UploadDropzone 
            onUpload={handleFileUpload} 
            isUploading={isProcessing}
            progress={progress}
          />
        ) : (
          <ResultsTable 
            data={results} 
            onDownload={handleDownload}
            fileId={fileId || undefined}
          />
        )}

        {/* How it works */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">How it works</h2>
          <ol className="space-y-4">
            <li className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</span>
              <p className="text-gray-700 leading-relaxed">
                <strong>Upload your Excel file</strong> with columns: Name, JobTitle, CompanyWebsite, CompanyName (optional), LinkedInURL (optional)
              </p>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">2</span>
              <p className="text-gray-700 leading-relaxed">
                <strong>AI researches each company</strong> using live web search to gather recent news, achievements, and key differentiators
              </p>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">3</span>
              <p className="text-gray-700 leading-relaxed">
                <strong>LinkedIn profiles are analyzed</strong> (when provided) to understand prospect background and experience
              </p>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">4</span>
              <p className="text-gray-700 leading-relaxed">
                <strong>Personalized icebreakers are generated</strong> using B2B copywriting expertise and specific prospect/company insights
              </p>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">5</span>
              <p className="text-gray-700 leading-relaxed">
                <strong>Download your enriched file</strong> with two unique icebreakers for each prospect
              </p>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}