import React from 'react';
import { X, Download, Printer, Share2 } from 'lucide-react';
import ReportCardTemplate from '../ui/reportCardTemplate';

const ReportPreviewModal = ({ isOpen, onClose, studentData }) => {
  if (!isOpen || !studentData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Add PDF generation and download logic
    console.log('Downloading report for:', studentData.name);
  };

  const handleShare = () => {
    // Add sharing functionality (email, etc.)
    console.log('Sharing report for:', studentData.name);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black opacity-75" onClick={onClose} />

        <div className="relative bg-white rounded-lg w-full max-w-5xl">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium">Report Card Preview</h3>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handlePrint}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <Printer className="h-5 w-5" />
                <span>Print</span>
              </button>
              
              <button 
                onClick={handleDownload}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <Download className="h-5 w-5" />
                <span>Download</span>
              </button>

              <button 
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <Share2 className="h-5 w-5" />
                <span>Share</span>
              </button>

              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Report Card Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(100vh-10rem)]">
            <div className="bg-gray-50 p-8 rounded-lg">
              <ReportCardTemplate
                student={studentData}
                term={studentData.term}
                grades={studentData.grades}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t rounded-b-lg">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPreviewModal;