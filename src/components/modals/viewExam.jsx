import React, { useState, useEffect } from "react";
import { X, FileText, Download, ArrowRight } from "lucide-react";

const ViewResultsModal = ({ isOpen, onClose, examData }) => {
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    present: 0,
    absent: 0,
    passed: 0,
    failed: 0,
    highestMarks: 0,
    lowestMarks: 0,
    averageMarks: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && examData && examData.id) {
      fetchExamResults(examData.id);
    }
  }, [isOpen, examData]);

  const fetchExamResults = async (examId) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:5000/api/exams/exam-results?examScheduleId=${examId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      console.log(response)
      
      if (!response.ok) throw new Error('Failed to fetch exam results');
      
      const data = await response.json();
      setResults(data.data);
      
      // Calculate statistics
      if (data.data && data.data.length > 0) {
        const totalStudents = data.data.length;
        const present = data.data.filter(r => !r.is_absent).length;
        const absent = data.data.filter(r => r.is_absent).length;
        
        // Only consider present students for marks calculations
        const presentStudents = data.data.filter(r => !r.is_absent);
        
        let passed = 0;
        let failed = 0;
        let totalMarks = 0;
        let highestMarks = 0;
        let lowestMarks = presentStudents.length > 0 ? 100 : 0;
        
        presentStudents.forEach(student => {
          const marks = student.marks_obtained || 0;
          totalMarks += marks;
          
          if (marks >= (examData.passing_marks || 40)) {
            passed++;
          } else {
            failed++;
          }
          
          if (marks > highestMarks) highestMarks = marks;
          if (marks < lowestMarks) lowestMarks = marks;
        });
        
        const averageMarks = presentStudents.length > 0 ? 
          (totalMarks / presentStudents.length).toFixed(2) : 0;
        
        setStats({
          totalStudents,
          present,
          absent,
          passed,
          failed,
          highestMarks,
          lowestMarks,
          averageMarks
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching exam results:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  // Handle navigating to the result entry page
  const handleEnterResults = () => {
    if (examData && examData.id) {
      window.location.href = `/exam-results/entry/${examData.id}`;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!isOpen || !examData) return null;

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50">
       <div className="bg-black opacity-50 w-full h-full absolute"></div>
      <div className="relative bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Exam Results</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-gray-900 text-lg">
              {examData.subject_name} - {examData.class_name}
            </h3>
            <p className="text-gray-600">
              {formatDate(examData.exam_date)}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">Total Students</div>
                <div className="text-lg font-bold text-blue-700">{stats.totalStudents}</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600">Passed</div>
                <div className="text-lg font-bold text-green-700">{stats.passed}</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded-lg">
                <div className="text-sm text-gray-600">Failed</div>
                <div className="text-lg font-bold text-red-700">{stats.failed}</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600">Average</div>
                <div className="text-lg font-bold text-purple-700">{stats.averageMarks}%</div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              Error: {error}
            </div>
          ) : results.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.admission_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {result.student_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {result.is_absent ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Absent
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Present
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.is_absent ? "--" : result.marks_obtained}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {result.is_absent ? (
                          "--"
                        ) : (
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${
                                result.marks_obtained >= (examData.passing_marks || 40)
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                          >
                            {result.grade || (result.marks_obtained >= (examData.passing_marks || 40) ? "Pass" : "Fail")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-10 w-10 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No results yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                No results have been entered for this exam yet.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          
          {/* <div className="flex space-x-3">
            {results.length > 0 && (
              <button
                type="button"
                className="flex items-center space-x-2 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            )}
            
            <button
              type="button"
              onClick={handleEnterResults}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <span>{results.length > 0 ? "Update Results" : "Enter Results"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ViewResultsModal;