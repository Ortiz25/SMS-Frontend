// components/modals/reportPreview.js
import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  Printer,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader
} from "lucide-react";
import axios from "axios";
import LoadingSpinner from "../../util/loaderSpinner";

const ReportPreviewModal = ({ isOpen, onClose, studentData }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [activeExam, setActiveExam] = useState(0);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Load report data when modal opens and student changes
  useEffect(() => {
    if (!isOpen || !studentData) return;

    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // We need to determine the current academic session
        const sessionResponse = await axios.get('/api/grading/current-session');
        const currentSession = sessionResponse.data;
        
        // Now fetch the report card
        const response = await axios.get(`/api/grading/report-card/${studentData.id}/${currentSession.id}`);
        setReportData(response.data);
        
        // Set first exam as active by default
        if (response.data.examResults && response.data.examResults.length > 0) {
          setActiveExam(0);
        }
        
        setLoading(false);
      } catch (err) {
        setError("Failed to load report card data");
        setLoading(false);
        console.error(err);
      }
    };

    fetchReportData();
  }, [isOpen, studentData]);

  const handleSendEmail = async () => {
    if (!reportData || !reportData.student) return;
    
    try {
      setSendingEmail(true);
      await axios.post('/api/grading/email-report-card', {
        student_id: reportData.student.id,
        academic_session_id: reportData.academicSession.id
      });
      
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 3000);
      setSendingEmail(false);
    } catch (err) {
      setError("Failed to send email");
      setSendingEmail(false);
      console.error(err);
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleDownload = async () => {
    if (!reportData || !reportData.student) return;
    
    try {
      const response = await axios.get(`/api/grading/report-card-pdf/${reportData.student.id}/${reportData.academicSession.id}`, {
        responseType: 'blob'
      });
      
      const student = reportData.student;
      const fileName = `ReportCard_${student.admission_number}_${student.first_name}${student.last_name}.pdf`;
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError("Failed to download report card");
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {reportData?.student ? `${reportData.student.first_name} ${reportData.student.last_name}'s Report Card` : "Student Report Card"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {loading && <LoadingSpinner />}
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center space-x-2 mb-4">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
          
          {emailSuccess && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center space-x-2 mb-4">
              <CheckCircle className="h-5 w-5" />
              <span>Report card has been emailed successfully!</span>
            </div>
          )}
          
          {reportData && (
            <div className="space-y-6" id="printable-report-card">
              {/* Student and School Info */}
              <div className="text-center border-b pb-4">
                <h1 className="text-2xl font-bold mb-1">SCHOOL NAME</h1>
                <p className="text-sm text-gray-600 mb-2">P.O. Box 12345, City, Country</p>
                <h2 className="text-xl font-semibold">STUDENT PROGRESS REPORT</h2>
                <p className="text-sm text-gray-600">
                  Term {reportData.academicSession.term}, {reportData.academicSession.year}
                </p>
              </div>
              
              {/* Student Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><span className="font-semibold">Name:</span> {reportData.student.first_name} {reportData.student.last_name}</p>
                  <p><span className="font-semibold">Admission No:</span> {reportData.student.admission_number}</p>
                  <p><span className="font-semibold">Class:</span> {reportData.student.current_class} {reportData.student.stream}</p>
                </div>
                <div>
                  <p><span className="font-semibold">Gender:</span> {reportData.student.gender}</p>
                  <p><span className="font-semibold">Date of Birth:</span> {new Date(reportData.student.date_of_birth).toLocaleDateString()}</p>
                  <p><span className="font-semibold">Class Teacher:</span> {reportData.student.class_teacher_name || 'Not Assigned'}</p>
                </div>
              </div>
              
              {/* Exam Tabs if multiple exams */}
              {reportData.examResults && reportData.examResults.length > 0 && (
                <div>
                  <div className="flex overflow-x-auto border-b mb-4">
                    {reportData.examResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveExam(index)}
                        className={`px-4 py-2 whitespace-nowrap ${
                          activeExam === index 
                            ? "border-b-2 border-blue-600 text-blue-600 font-medium" 
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        {result.exam.name}
                      </button>
                    ))}
                  </div>
                  
                  {/* Active Exam Results */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">{reportData.examResults[activeExam].exam.name} Results</h3>
                    
                    {/* Subject Results Table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Subject
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Marks
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Grade
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Teacher's Comment
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reportData.examResults[activeExam].subjectResults.map((subject, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {subject.subject_name}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {subject.is_absent ? 'Absent' : subject.marks_obtained}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {subject.grade || '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {subject.remarks || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Summary */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Performance Summary</h4>
                        <p><span className="font-medium">Total Marks:</span> {reportData.examResults[activeExam].summary?.total_marks || 0}</p>
                        <p><span className="font-medium">Average:</span> {reportData.examResults[activeExam].summary?.average_marks || 0}%</p>
                        <p><span className="font-medium">Grade:</span> {reportData.examResults[activeExam].summary?.grade || '-'}</p>
                        <p><span className="font-medium">Position:</span> {reportData.examResults[activeExam].summary?.position_in_class || '-'} out of {reportData.examResults[activeExam].summary?.total_students || '-'}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Attendance</h4>
                        <p><span className="font-medium">Present:</span> {reportData.attendance?.present_days || 0} days</p>
                        <p><span className="font-medium">Absent:</span> {reportData.attendance?.absent_days || 0} days</p>
                        <p><span className="font-medium">Total School Days:</span> {reportData.attendance?.total_school_days || 0} days</p>
                        <p><span className="font-medium">Attendance Rate:</span> {reportData.attendance?.attendance_percentage || 0}%</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Teacher's Comments</h4>
                        <p className="italic">
                          {reportData.teacherComments || "No comments provided for this term."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {(!reportData.examResults || reportData.examResults.length === 0) && (
                <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700">
                  No exam results available for this student in the current academic session.
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={handleSendEmail}
            disabled={loading || sendingEmail || !reportData}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {sendingEmail ? (
              <>
                <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="-ml-1 mr-2 h-5 w-5" />
                Email to Parent
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            disabled={loading || !reportData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Printer className="-ml-1 mr-2 h-5 w-5" />
            Print
          </button>
          <button
            onClick={handleDownload}
            disabled={loading || !reportData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Download className="-ml-1 mr-2 h-5 w-5" />
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportPreviewModal;