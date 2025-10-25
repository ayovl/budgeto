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
      size="sm"
      className="flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 text-xs sm:text-sm px-1 sm:px-4 py-1 sm:py-2 whitespace-nowrap shrink-0"
    >
      {loading ? (
        <>
          <div className="animate-spin w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full" />
          <span className="hidden sm:inline">Generating...</span>
          <span className="sm:hidden">...</span>
        </>
      ) : (
        <>
          <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
          <Download className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden md:inline">Export PDF Report</span>
          <span className="md:hidden">PDF</span>
        </>
      )}
    </Button>
  );
};