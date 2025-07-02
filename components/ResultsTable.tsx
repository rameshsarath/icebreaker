'use client';

import React from 'react';
import { EnrichedRowData } from '@/lib/types';

interface ResultsTableProps {
  data: EnrichedRowData[];
  onDownload: (fileId: string) => void;
  fileId?: string; // Add fileId prop
}

export function ResultsTable({ data, onDownload, fileId }: ResultsTableProps) {
  const handleDownload = () => {
    if (fileId) {
      onDownload(fileId);
    } else {
      // Fallback to timestamp-based ID
      const fallbackId = Date.now().toString();
      onDownload(fallbackId);
    }
  };

  const successCount = data.filter(row => 
    !row.Icebreaker1.includes('Error') && !row.Icebreaker1.includes('failed')
  ).length;

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Processing Complete! 🎉</h2>
            <p className="text-lg text-gray-600">
              Generated {successCount} successful icebreakers out of {data.length} prospects
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            📥 Download Full Results
          </button>
        </div>
      </div>

      {/* Preview Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-700 font-medium">
          📋 Showing preview of first {Math.min(data.length, 10)} rows. 
          Download the complete file to see all results with full formatting.
        </p>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto max-h-96">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 min-w-48">Prospect</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 min-w-52">Company</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 min-w-80">Statement Icebreaker</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 min-w-80">Question Icebreaker</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 min-w-24">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.slice(0, 10).map((row, index) => {
                const hasError = row.Icebreaker1?.includes('Error') || row.Icebreaker1?.includes('failed');
                
                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{row.Name}</p>
                        <p className="text-sm text-gray-600">{row.JobTitle}</p>
                        {row.LinkedInURL && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                            LinkedIn
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        {row.CompanyName && (
                          <p className="font-medium text-gray-900">{row.CompanyName}</p>
                        )}
                        <p className="text-sm text-gray-600 break-all">
                          {row.CompanyWebsite.replace(/^https?:\/\//, '').split('/')[0]}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm leading-relaxed ${hasError ? 'italic text-red-600' : 'text-gray-800'}`}>
                        {row.Icebreaker1}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm leading-relaxed ${hasError ? 'italic text-red-600' : 'text-gray-800'}`}>
                        {row.Icebreaker2}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                        hasError 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {hasError ? 'Error' : 'Success'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}