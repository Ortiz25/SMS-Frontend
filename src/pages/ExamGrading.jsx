import React, { useState, useEffect } from "react";
import {
  BookOpen,
  FileText,
  BarChart,
  Download,
  Filter,
  Search,
  Plus,
} from "lucide-react";
import { useStore } from "../store/store";
import GradeEntry from "../components/gradeEntry";
import ReportCards from "../components/reportCards";
import Analytics from "../components/analytics";
import Navbar from "../components/navbar";
import ReportPreviewModal from "../components/modals/reportPreview";
import AddGradesModal from "../components/modals/addGrade";
import axios from "axios";
import LoadingSpinner from "../util/loaderSpinner";
import { redirect } from "react-router-dom";

const ExamGrading = () => {
  const token = localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("grading");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const { updateActiveModule, activeModule } = useStore();
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAddGrades, setShowAddGrades] = useState(false);
  
  // Stats data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalExams: 0,
    gradedExams: 0,
    pendingExams: 0,
    classAverage: 0
  });
  
  // Filters data
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  
  // Students for report preview
  const [students, setStudents] = useState([]);

  const handleSaveGrades = (gradeData) => {
    // Refresh stats data after saving grades
    fetchGradingStats();
    setShowAddGrades(false);
  };

  const handleViewReport = (student) => {
    setSelectedStudent(student);
    setShowReportPreview(true);
  };

  useEffect(() => {
    updateActiveModule("grading");
    
    // Fetch initial data
    fetchClasses();
    fetchCurrentSession();
    fetchGradingStats();
  }, [activeModule]);
  
  // Fetch classes for filter
  const fetchClasses = async () => {
    try {
      const response = await axios.get('/backend/api/grading/classes',{
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      setClasses(response.data);
    } catch (err) {
      console.error("Failed to load classes:", err);
      setError("Failed to load classes");
    }
  };
  
  // Fetch subjects when class changes
  useEffect(() => {
    if (selectedClass === "all") {
      setSubjects([]);
      return;
    }
    
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(`/backend/api/grading/subjects/${selectedClass}`,{
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        });
        setSubjects(response.data);
      } catch (err) {
        console.error("Failed to load subjects:", err);
      }
    };
    
    fetchSubjects();
  }, [selectedClass]);
  
  // Fetch current academic session
  const fetchCurrentSession = async () => {
    try {
      const response = await axios.get('/backend/api/grading/current-session',{
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      setCurrentSession(response.data);
    } catch (err) {
      console.error("Failed to load current session:", err);
    }
  };
  
  // Fetch grading stats for dashboard
  const fetchGradingStats = async () => {
    try {
      setLoading(true);
      
      // Get current session
      const sessionResponse = await axios.get('/backend/api/grading/current-session',{
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      const currentSession = sessionResponse.data;
      
      // Get all exams for this session
      const examsResponse = await axios.get(`/backend/api/examgrading?academic_session_id=${currentSession.id}`,{
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      const exams = examsResponse.data;
      
      // Count total exams
      const totalExams = exams.length;
      
      // Count graded exams (status = 'graded')
      const gradedExams = exams.filter(exam => exam.status === 'graded').length;
      
      // Pending exams
      const pendingExams = totalExams - gradedExams;
      
      // Get class average across all exams
      let classAverage = 0;
      
      // If we have a selected class, get specific average
      if (selectedClass !== "all") {
        const analyticsResponse = await axios.get(`/backend/api/analytics/class-performance/${selectedClass}?academic_session_id=${currentSession.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        });
       
        if (analyticsResponse.data && analyticsResponse.data.length > 0) {
          // Calculate average across all exams
          const averages = analyticsResponse.data.map(item => item.class_average).filter(avg => !isNaN(parseFloat(avg)));
         
          if (averages.length > 0) {
            classAverage = averages.reduce((sum, avg) => sum + parseFloat(avg), 0) / averages.length;
          }
        }
      } else {
        // Get overall school average
        const schoolAnalyticsResponse = await axios.get(`/backend/api/analytics/school-performance?academic_session_id=${currentSession.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        });
       
        if (schoolAnalyticsResponse.data && schoolAnalyticsResponse.data.classPerformance) {
          // Use weighted average based on student count
          let totalWeightedScore = 0;
          let totalStudents = 0;
          
          schoolAnalyticsResponse.data.classPerformance.forEach(c => {
            const studentCount = parseInt(c.student_count);
            const avgScore = parseFloat(c.average_score);
            
            if (!isNaN(studentCount) && !isNaN(avgScore)) {
              totalWeightedScore += studentCount * avgScore;
              totalStudents += studentCount;
            }
          });
          
          if (totalStudents > 0) {
            classAverage = totalWeightedScore / totalStudents;
          }
        }
      }
      
      setStats({
        totalExams,
        gradedExams,
        pendingExams,
        classAverage: Math.round(classAverage * 10) / 10 // Round to 1 decimal place
      });

      
      setLoading(false);
    } catch (err) {
      console.error("Failed to load grading stats:", err);
      setLoading(false);
    }
  };
  
  // Fetch students when class changes (for report viewing)
  useEffect(() => {
    if (selectedClass === "all") {
      setStudents([]);
      return;
    }
    
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`/backend/api/grading/students/${selectedClass}`,{
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        });
        setStudents(response.data);
      } catch (err) {
        console.error("Failed to load students:", err);
      }
    };
    
    fetchStudents();
  }, [selectedClass]);
  
  // Class change handler
  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    // Refresh stats with new class selection
    fetchGradingStats();
  };
  
  // Subject change handler
  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  const tabs = [
    { id: "grading", label: "Grade Entry", icon: BookOpen },
    { id: "reports", label: "Report Cards", icon: FileText },
    { id: "analytics", label: "Analytics", icon: BarChart },
  ];
  
  // Handle export of grades
  const handleExportGrades = async () => {
    try {
      // Get selected class and subject details
      const classInfo = classes.find(c => c.id.toString() === selectedClass.toString());
      const subjectInfo = subjects.find(s => s.id.toString() === selectedSubject.toString());
      
      // Prepare filename with class and subject
      const fileName = `Grades_${classInfo ? classInfo.name : 'All'}_${subjectInfo ? subjectInfo.name : 'All'}.csv`;
      
      // Create export URL based on filters
      let exportUrl = `/api/grading/export-grades?`;
      
      if (selectedClass !== "all") {
        exportUrl += `class_id=${selectedClass}&`;
      }
      
      if (selectedSubject !== "all") {
        exportUrl += `subject_id=${selectedSubject}&`;
      }
      
      if (currentSession) {
        exportUrl += `academic_session_id=${currentSession.id}`;
      }
      
      // Trigger download
      const response = await axios.get(exportUrl, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export grades:", err);
    }
  };

  return (
    <Navbar>
      <div className="space-y-6 px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Exam Grading
          </h1>
          <p className="text-gray-600">
            Manage exam grades, generate reports, and view analytics
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Exams</h3>
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{stats.totalExams}</div>
            <p className="text-xs text-gray-600">
              {currentSession ? `Term ${currentSession.term}, ${currentSession.year}` : "This term"}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Graded</h3>
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold">{stats.gradedExams}</div>
            <p className="text-xs text-green-600">
              {stats.totalExams > 0 ? `${Math.round((stats.gradedExams / stats.totalExams) * 100)}% complete` : "0% complete"}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Pending</h3>
              <FileText className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold">{stats.pendingExams}</div>
            <p className="text-xs text-yellow-600">Needs grading</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">
                Average Score
              </h3>
              <BarChart className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{stats.classAverage}%</div>
            <p className="text-xs text-blue-600">
              {selectedClass !== "all" ? "Class average" : "School average"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <select
              value={selectedClass}
              onChange={handleClassChange}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">All Classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>

            <select
              value={selectedSubject}
              onChange={handleSubjectChange}
              className="px-3 py-2 border rounded-lg"
              disabled={selectedClass === "all" || subjects.length === 0}
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            {/* <button 
              onClick={handleExportGrades}
              className="flex items-center space-x-2 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <Download className="h-5 w-5" />
              <span>Export</span>
            </button> */}
            <button
              onClick={() => setShowAddGrades(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              <span>Add Grades</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "grading" && <GradeEntry />}

        {activeTab === "reports" && (
          <ReportCards />
        )}
        
        {activeTab === "analytics" && <Analytics />}
        
        {/* Modals */}
        <ReportPreviewModal
          isOpen={showReportPreview}
          onClose={() => {
            setShowReportPreview(false);
            setSelectedStudent(null);
          }}
          studentData={selectedStudent}
        />
        
        <AddGradesModal
          isOpen={showAddGrades}
          onClose={() => setShowAddGrades(false)}
          onSave={handleSaveGrades}
        />
      </div>
    </Navbar>
  );
};

export default ExamGrading;

export async function loader({ params }) {
  try {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If no token exists, redirect to login
    if (!token) {
      return redirect("/");
    }

    const tokenUrl = "/backend/api/auth/verify-token";

    const tokenResponse = await fetch(tokenUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const tokenData = await tokenResponse.json();

    // If token is invalid or expired
    if (!tokenResponse.ok || tokenData.error) {
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return redirect("/");
    }

    return null
  } catch (error) {
    console.error("Error loading timetable:", error);
    return {
      error: {
        message: error.message,
        status: error.status || 500,
      },
    };
  }
}