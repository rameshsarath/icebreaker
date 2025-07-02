'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ProcessingProgress } from '@/lib/types';

interface UploadDropzoneProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
  progress?: ProcessingProgress;
}

export function UploadDropzone({ onUpload, isUploading, progress }: UploadDropzoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.name.endsWith('.xlsx')) {
        onUpload(file);
      } else {
        setError('Please upload an Excel (.xlsx) file');
      }
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false,
    disabled: isUploading
  });

  return (
    <div 
      {...getRootProps()} 
      className={`
        border-3 border-dashed rounded-2xl min-h-80 p-8 text-center transition-all duration-300 cursor-pointer
        ${isDragActive ? 'border-blue-500 bg-blue-50' : isUploading ? 'border-gray-300 bg-gray-50 cursor-not-allowed' : 'border-gray-400 bg-white hover:border-blue-500 hover:bg-blue-50 hover:-translate-y-1 hover:shadow-xl'}
      `}
    >
      <input {...getInputProps()} />
      
      {isUploading ? (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Processing your file...</h3>
          <p className="text-gray-600 mb-6">
            Our AI is researching companies and generating personalized icebreakers
          </p>
          {progress && progress.total > 0 && (
            <div className="w-full max-w-md">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg">
            📊
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">
            {isDragActive ? 'Drop your Excel file here' : 'Upload Excel File'}
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            Drag and drop your .xlsx file here, or click to browse
          </p>
          <div className="bg-gray-100 rounded-xl p-4 max-w-md">
            <p className="text-sm font-semibold text-gray-700">Expected columns: Name, JobTitle, CompanyWebsite</p>
            <p className="text-xs text-gray-500">Optional: CompanyName, LinkedInURL</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center justify-center gap-2">
            <span className="text-red-500 text-xl">⚠️</span>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}