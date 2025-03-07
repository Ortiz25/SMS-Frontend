// components/batchReportGenerator.js
import React, { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader
} from "lucide-react";

const BatchReportGenerator = ({ classes, sessions, onGenerate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerateReports = async () => {
    if (!selectedClass || !selectedSession) {
      setError("Please select a class and academic session");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await onGenerate({
        classId: selectedClass,
        academicSessionId: selectedSession
      });

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Failed to generate reports: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = () => {
    if (!result || !result.reportCards || result.reportCards.length === 0) return;
    
    // In a real application, this would need to be handled by the backend
    // to create a ZIP file of all PDFs, here we just open a download link
    const downloadUrl = `/api/grading/batch-download?class_id=${selectedClass}&academic_session_id=${selectedSession}`;
    window.open(downloadUrl, '_blank');
  };

  const handlePrintAll = () => {
    if (!result || !result.reportCards || result.reportCards.length === 0) return;
    
    // In a real application, this would trigger a print preview with all reports
    window.alert("Print functionality would be implemented here");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <h2 className="font-medium">Batch Report Generation</h2>
        </div>
        <div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3"
                disabled={loading}
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Session</label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3"
                disabled={loading}
              >
                <option value="">Select Session</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.year} - Term {session.term} {session.is_current ? "(Current)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0">
            <button
              onClick={handleGenerateReports}
              disabled={loading || !selectedClass || !selectedSession}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
              <span>{loading ? "Generating..." : "Generate Report Cards"}</span>
            </button>

            {result && result.reportCards && result.reportCards.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={handleDownloadAll}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Download className="h-5 w-5" />
                  <span>Download All</span>
                </button>
                <button
                  onClick={handlePrintAll}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Printer className="h-5 w-5" />
                  <span>Print All</span>
                </button>
              </div>
            )}
          </div>

          {/* Results */}
          {result && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>{result.message || `Successfully generated ${result.reportCards?.length || 0} report cards`}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchReportGenerator;