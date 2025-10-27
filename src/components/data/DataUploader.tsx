// Component for uploading Excel/CSV files and generating diagrams
import { useState } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import { parseExcel, parseCSV, type ParsedData } from '../../lib/excelParser';

interface DataUploaderProps {
  onDataUploaded: (data: ParsedData, fileName: string) => void;
  onClose?: () => void;
}

export default function DataUploader({ onDataUploaded, onClose }: DataUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      let parsedData: ParsedData;

      if (fileExtension === 'csv') {
        parsedData = await parseCSV(selectedFile);
      } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
        parsedData = await parseExcel(selectedFile);
      } else {
        throw new Error('Unsupported file type. Please upload .xlsx, .xls, or .csv');
      }

      // Automatically send data to chat after upload
      onDataUploaded(parsedData, selectedFile.name);
      
      // Close modal
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Data File</h2>
            <p className="text-sm text-gray-500 mt-1">Upload your Excel or CSV file, then ask the AI what diagram you want in the chat</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <FiX className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FiUpload className="w-16 h-16 mb-4 text-primary" />
                <p className="mb-2 text-lg font-medium text-gray-700">
                  Click to upload
                </p>
                <p className="text-sm text-gray-500 mb-1">Excel (.xlsx, .xls) or CSV files</p>
                <p className="text-xs text-gray-400 mt-2 text-center px-4">
                  After uploading, you can ask the AI in natural language<br/>
                  Example: "Show me a pie chart with all neurodivergences"
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-sm text-gray-600">Processing file...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900 font-medium">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

