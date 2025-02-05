import React, { useState } from 'react';
import { FileText, AlertCircle, Check } from 'lucide-react';

const BatchReportGenerator = ({ onGenerate, classes }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle, generating, completed, error

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setStatus('generating');
      setProgress(0);

      // Simulate report generation with progress
      const totalStudents = 30; // Example count
      for(let i = 1; i <= totalStudents; i++) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate processing
        setProgress(Math.round((i / totalStudents) * 100));
      }

      setStatus('completed');
    } catch (error) {
      setStatus('error');
      console.error('Error generating reports:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium mb-4">Batch Report Generation</h3>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Term
          </label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Select Term</option>
            <option value="term1">Term 1</option>
            <option value="term2">Term 2</option>
            <option value="term3">Term 3</option>
          </select>
        </div>
      </div>

      {status === 'generating' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Generating reports...
            </span>
            <span className="text-sm text-gray-500">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {status === 'completed' && (
        <div className="flex items-center space-x-2 text-green-600 mb-4">
          <Check className="h-5 w-5" />
          <span>Reports generated successfully</span>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center space-x-2 text-red-600 mb-4">
          <AlertCircle className="h-5 w-5" />
          <span>Error generating reports</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleGenerate}
          disabled={!selectedClass || !selectedTerm || generating}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            generating || !selectedClass || !selectedTerm
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <FileText className="h-5 w-5" />
          <span>Generate Reports</span>
        </button>
      </div>
    </div>
  );
};

export default BatchReportGenerator;