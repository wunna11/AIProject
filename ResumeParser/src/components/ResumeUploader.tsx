import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface ResumeUploaderProps {
  onUpload: (content: string) => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onUpload }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          onUpload(text);
          setUploadStatus('idle');
        } catch (error) {
          setUploadStatus('error');
          setErrorMessage('Failed to process the resume');
        }
      };
      reader.onerror = () => {
        setUploadStatus('error');
        setErrorMessage('Failed to read the file');
      };
      reader.readAsText(file);
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage('An error occurred while processing the file');
    }
  }, [onUpload]);

  return (
    <div className="w-full max-w-xl">
      <label 
        htmlFor="resume-upload"
        className={`
          flex flex-col items-center justify-center w-full h-64 
          border-2 border-dashed rounded-lg cursor-pointer 
          transition-colors duration-200
          ${uploadStatus === 'error' 
            ? 'border-red-300 bg-red-50 hover:bg-red-100' 
            : uploadStatus === 'uploading'
              ? 'border-blue-300 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {uploadStatus === 'error' ? (
            <>
              <AlertCircle className="w-10 h-10 mb-3 text-red-500" />
              <p className="mb-2 text-sm text-red-500">{errorMessage}</p>
              <p className="text-xs text-red-400">Click to try again</p>
            </>
          ) : uploadStatus === 'uploading' ? (
            <>
              <Loader className="w-10 h-10 mb-3 text-blue-500 animate-spin" />
              <p className="mb-2 text-sm text-blue-500">Processing resume...</p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                TXT, PDF, or DOC (MAX. 10MB)
              </p>
            </>
          )}
        </div>
        <input
          id="resume-upload"
          type="file"
          className="hidden"
          accept=".txt,.pdf,.doc,.docx"
          onChange={handleFileUpload}
          disabled={uploadStatus === 'uploading'}
        />
      </label>
    </div>
  );
};