import React from 'react';
import { FileText, Download } from 'lucide-react';
import { Button } from '../ui/Button';

interface PDFExportButtonProps {
  onExport: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  onExport,
  disabled = false,
  loading = false,
}) => {
  return (
    <Button
      onClick={onExport}
      disabled={disabled || loading}
      variant="secondary"
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
    >
      {loading ? (
        <>
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          Generating...
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          <Download className="w-4 h-4" />
          Export PDF Report
        </>
      )}
    </Button>
  );
};