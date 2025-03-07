// components/reportCards.js
import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Download,
  Printer,
  Mail,
  Filter,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import axios from "axios";
import LoadingSpinner from "../util/loaderSpinner";
import BatchReportGenerator from "../util/batchGenerator";

const ReportCards = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  // Filters and selections
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Student report cards
  const [reportCards, setReportCards] = useState([]);
  
  // Load academic sessions
  useEffect(() => {
    const fetchAcademicSessions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/grading/sessions',{
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setSessions(response.data);
        
        // Set current session as default
        const currentSession = response.data.find(session => session.is_current);
        if (currentSession) {
          setSelectedSession(currentSession.id);
        } else if (response.data.length > 0) {
          setSelectedSession(response.data[0].id);
        }
        
        setLoading(false);
      } catch (err) {
        setError("Failed to load academic sessions");
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchAcademicSessions();
  }, []);
  
  // Load classes when session changes
  useEffect(() => {
    if (!selectedSession) return;
    
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/grading/classes?academic_session_id=${selectedSession}`,{
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setClasses(response.data);
        setSelectedClass(""); // Reset class selection
        setLoading(false);
      } catch (err) {
        setError("Failed to load classes");
        setLoading(false);
        console.error(err);
      }
    };
    
    // Load exams for this session
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/examgrading?academic_session_id=${selectedSession}`,{
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setExams(response.data);
        
        // Default to the most recent exam
        if (response.data.length > 0) {
          // Sort by start_date descending
          const sortedExams = [...response.data].sort((a, b) => 
            new Date(b.start_date) - new Date(a.start_date)
          );
          setSelectedExam(sortedExams[0].id);
        } else {
          setSelectedExam("");
        }
        
        setLoading(false);
      } catch (err) {
        setError("Failed to load examinations");
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchClasses();
    fetchExams();
  }, [selectedSession]);
  
  // Load students when class changes
  useEffect(() => {
    if (!selectedClass) return;
    
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/grading/students/${selectedClass}`,{
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setStudents(response.data);
        
        // Pre-populate report card data
        const reportCardData = response.data.map(student => ({
          id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          admission_number: student.admission_number,
          class: student.current_class + ' ' + student.stream,
          term: sessions.find(s => s.id.toString() === selectedSession.toString())?.term || '',
          year: sessions.find(s => s.id.toString() === selectedSession.toString())?.year || '',
          download_url: `/api/grading/report-card/${student.id}/${selectedSession}`
        }));
        
        setReportCards(reportCardData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load students");
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchStudents();
  }, [selectedClass, selectedSession, sessions]);
  
  // Generate batch report cards
  const handleBatchGeneration = async (data) => {
    try {
      setLoading(true);
      
      const response = await axios.post('http://localhost:5000/api/grading/batch-report-cards', {
        class_id: data.classId,
        academic_session_id: data.academicSessionId
      },{
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      setLoading(false);
      return response.data;
    } catch (err) {
      setError("Failed to generate batch report cards");
      setLoading(false);
      console.error(err);
      return { error: err.message };
    }
  };
  
  // View individual report card
  const viewReportCard = (studentId) => {
    window.open(`/report-cards/view/${studentId}/${selectedSession}`, '_blank');
  };
  
  // Download individual report card
  const downloadReportCard = async (studentId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/grading/report-card/${studentId}/${selectedSession}`, {
        responseType: 'blob'
      },{
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      // Create download link
      const student = students.find(s => s.id === studentId);
      const fileName = `ReportCard_${student.admission_number}_${student.first_name}${student.last_name}.pdf`;
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setLoading(false);
    } catch (err) {
      setError("Failed to download report card");
      setLoading(false);
      console.error(err);
    }
  };
  
  // Email report card to parent
  const emailReportCard = async (studentId) => {
    try {
      setLoading(true);
      await axios.post(`http://localhost:5000/api/grading/email-report-card`, {
        student_id: studentId,
        academic_session_id: selectedSession,
        examination_id: selectedExam
      },{
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      setLoading(false);
      alert("Report card has been emailed to the parent");
    } catch (err) {
      setError("Failed to email report card");
      setLoading(false);
      console.error(err);
    }
  };
  
  // Filter students by search term
  const filteredReportCards = reportCards.filter(card =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && <LoadingSpinner />}
      
      {/* Batch Report Generator */}
      <BatchReportGenerator
        classes={classes}
        sessions={sessions}
        onGenerate={handleBatchGeneration}
      />
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Report Card Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Session</label>
            <select
              value={selectedSession}
              onChange={e => setSelectedSession(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3"
              disabled={loading}
            >
              <option value="">Select Session</option>
              {sessions.map(session => (
                <option key={session.id} value={session.id}>
                  {session.year} - Term {session.term} {session.is_current ? "(Current)" : ""}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3"
              disabled={loading || !selectedSession}
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Examination</label>
            <select
              value={selectedExam}
              onChange={e => setSelectedExam(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3"
              disabled={loading || !selectedSession}
            >
              <option value="">Select Examination</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Search Box */}
        <div className="mt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or admission number..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md pl-8 pr-3 py-2 w-full"
            />
            <Search className="h-4 w-4 absolute left-2 top-3 text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* Report Cards List */}
      {reportCards.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Individual Report Cards</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adm. No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Term
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReportCards.map(student => (
                  <tr key={student.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {student.admission_number}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {student.class}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      Term {student.term}, {student.year}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => viewReportCard(student.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Report"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => downloadReportCard(student.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Download Report"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="text-gray-600 hover:text-gray-800"
                          title="Print Report"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => emailReportCard(student.id)}
                          className="text-purple-600 hover:text-purple-800"
                          title="Email to Parent"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredReportCards.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No students match your search criteria
              </div>
            )}
          </div>
        </div>
      )}
      
      {!loading && selectedClass && reportCards.length === 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700">
          No students found in this class. Please check your selection.
        </div>
      )}
    </div>
  );
};

export default ReportCards;