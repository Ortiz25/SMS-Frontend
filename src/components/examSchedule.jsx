import React, { useState, useEffect, useMemo } from "react";
import { Plus, Calendar, Search, Filter, Download, ChevronLeft, ChevronRight } from "lucide-react";
import ExamList from "./examList";
import ScheduleExamModal from "./modals/examSchedule";

const ExamSchedule = () => {
  const [academicSessions, setAcademicSessions] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [examSchedules, setExamSchedules] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  const [selectedSession, setSelectedSession] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalExams: 0,
    upcomingExams: 0,
    completedExams: 0,
    roomsUsed: 0,
  });

  // Fetch necessary data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        // Fetch academic sessions
        const sessionsResponse = await fetch(
          "http://localhost:5010/api/sessions/academic-sessions",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!sessionsResponse.ok)
          throw new Error("Failed to fetch academic sessions");

        const sessionsData = await sessionsResponse.json();

        setAcademicSessions(sessionsData.data);

        // Set default selected session to current session
        const currentSession = sessionsData.data.find(
          (session) => session.is_current
        );
        if (currentSession) setSelectedSession(currentSession.id.toString());

        // Fetch exam types
        const typesResponse = await fetch(
          "http://localhost:5010/api/exams/exam-types",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!typesResponse.ok) throw new Error("Failed to fetch exam types");

        const typesData = await typesResponse.json();
        setExamTypes(typesData.data);

        // Fetch classes
        const classesResponse = await fetch(
          "http://localhost:5010/api/helpers/classes",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!classesResponse.ok) throw new Error("Failed to fetch classes");

        const classesData = await classesResponse.json();
        setClasses(classesData.data);

        // Fetch rooms
        const roomsResponse = await fetch("http://localhost:5010/api/rooms", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!roomsResponse.ok) throw new Error("Failed to fetch rooms");

        const roomsData = await roomsResponse.json();
        setRooms(roomsData);

        // Load exams and exam schedules after setting the selected session
        await loadExamData(currentSession ? currentSession.id : null);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Load exam data when selected session changes
  useEffect(() => {
    if (selectedSession) {
      loadExamData(selectedSession);
    }
  }, [selectedSession]);

  // Load exam data and calculate stats
  const loadExamData = async (sessionId) => {
    try {
      const token = localStorage.getItem("token");

      // Fetch examinations for the selected session
      const examsResponse = await fetch(
        `http://localhost:5010/api/exams/examinations?academicSessionId=${sessionId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!examsResponse.ok) throw new Error("Failed to fetch examinations");

      const examsData = await examsResponse.json();
      setExaminations(examsData.data);

      // Fetch exam schedules for the selected session
      const params = new URLSearchParams({
        academicSessionId: sessionId,
      });

      if (selectedClass !== "all") {
        params.append("classId", selectedClass);
      }

      const schedulesResponse = await fetch(
        `http://localhost:5010/api/exams/exam-schedules?${params}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!schedulesResponse.ok)
        throw new Error("Failed to fetch exam schedules");

      const schedulesData = await schedulesResponse.json();
      setExamSchedules(schedulesData.data);

      // Calculate stats
      calculateStats(examsData.data, schedulesData.data);
      // Reset to first page when data changes
      setCurrentPage(1);
    } catch (error) {
      console.error("Error loading exam data:", error);
      setError(error.message);
    }
  };

  // Calculate statistics for display
  const calculateStats = (exams, schedules) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);

    // Count upcoming exams (within next 7 days)
    const upcoming = schedules.filter((schedule) => {
      const examDate = new Date(schedule.exam_date);
      examDate.setHours(0, 0, 0, 0);
      return examDate >= today && examDate <= oneWeekLater;
    }).length;

    // Count completed exams
    const completed = schedules.filter((schedule) => {
      const examDate = new Date(schedule.exam_date);
      examDate.setHours(0, 0, 0, 0);
      return examDate < today || schedule.status === "completed";
    }).length;

    // Count unique rooms used
    const uniqueRooms = new Set(schedules.map((schedule) => schedule.venue))
      .size;

    setStats({
      totalExams: schedules.length,
      upcomingExams: upcoming,
      completedExams: completed,
      roomsUsed: uniqueRooms,
    });
  };

  // Handle scheduling a new exam
  const handleScheduleExam = async (examData) => {
    try {
      const token = localStorage.getItem("token");

      // First, check if the examination already exists, or create it
      let examinationId = examData.examinationId;

      if (!examinationId) {
        // Create a new examination if it doesn't exist
        const examResponse = await fetch(
          "http://localhost:5010/api/exams/examinations",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: examData.examinationName,
              exam_type_id: examData.examTypeId,
              academic_session_id: selectedSession,
              start_date: examData.startDate,
              end_date: examData.endDate,
              status: "scheduled",
            }),
          }
        );

        if (!examResponse.ok) throw new Error("Failed to create examination");

        const examResult = await examResponse.json();
        examinationId = examResult.data.id;
      }

      // Now create the exam schedule
      const scheduleResponse = await fetch(
        "http://localhost:5010/api/exams/exam-schedules",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            examination_id: examinationId,
            subject_id: examData.subjectId,
            class_id: examData.classId,
            exam_date: examData.examDate,
            start_time: examData.startTime,
            end_time: examData.endTime,
            venue: examData.venue,
            supervisor_id: examData.supervisorId,
            total_marks: examData.totalMarks || 100,
            passing_marks: examData.passingMarks || 40,
            status: "scheduled",
          }),
        }
      );

      if (!scheduleResponse.ok)
        throw new Error("Failed to create exam schedule");

      // Reload exam data to refresh the list
      await loadExamData(selectedSession);

      setShowScheduleModal(false);
    } catch (error) {
      console.error("Error scheduling exam:", error);
      setError(error.message);
    }
  };

  const handleSessionChange = (e) => {
    setSelectedSession(e.target.value);
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  // Get filtered exams based on status - memoize to prevent recalculation
  const filteredExamSchedules = useMemo(() => {
    return selectedStatus === 'all' 
      ? examSchedules 
      : examSchedules.filter(exam => exam.status === selectedStatus);
  }, [examSchedules, selectedStatus]);

  // Pagination calculations - moved out of useEffect to render time
  const totalPages = Math.max(1, Math.ceil(filteredExamSchedules.length / recordsPerPage));
  
  // Ensure current page is valid
  const validCurrentPage = Math.min(currentPage, totalPages);
  
  // If page is invalid, update it once
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages]);
  
  // Calculate paginated items directly (no state or useEffect needed)
  const paginatedExams = useMemo(() => {
    if (filteredExamSchedules.length === 0) return [];
    
    const indexOfLastRecord = validCurrentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    return filteredExamSchedules.slice(indexOfFirstRecord, indexOfLastRecord);
  }, [filteredExamSchedules, validCurrentPage, recordsPerPage]);

  // Pagination controls
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing records per page
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <select
            value={selectedSession}
            onChange={handleSessionChange}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">Select Academic Session</option>
            {academicSessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.year} - Term {session.term}{" "}
                {session.is_current ? "(Current)" : ""}
              </option>
            ))}
          </select>

          <select
            value={selectedClass}
            onChange={handleClassChange}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <div className="relative">
            <input
              type="text"
              placeholder="Search exams..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            <span>Schedule Exam</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Exams</h3>
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">{stats.totalExams}</div>
          <p className="text-xs text-gray-600">Scheduled this term</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Upcoming</h3>
            <Calendar className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold">{stats.upcomingExams}</div>
          <p className="text-xs text-green-600">Within next 7 days</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Completed</h3>
            <Calendar className="h-5 w-5 text-gray-600" />
          </div>
          <div className="text-2xl font-bold">{stats.completedExams}</div>
          <p className="text-xs text-gray-600">This term</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Rooms Used</h3>
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">{stats.roomsUsed}</div>
          <p className="text-xs text-gray-600">Active exam rooms</p>
        </div>
      </div>

      {/* Exam List */}
      <ExamList
        examSchedules={paginatedExams}
        classes={classes}
        rooms={rooms}
        examTypes={examTypes}
        onRefresh={() => loadExamData(selectedSession)}
        searchTerm={searchTerm}
      />

      {/* Pagination Controls */}
      {filteredExamSchedules.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-t">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 mb-3 sm:mb-0">
                <label className="text-sm text-gray-600">Records per page:</label>
                <select
                  value={recordsPerPage}
                  onChange={handleRecordsPerPageChange}
                  className="border rounded-md px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-700">
                  Showing {paginatedExams.length} of {filteredExamSchedules.length} exams
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`p-1 rounded-md ${
                    currentPage === 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <div className="flex space-x-1">
                  {/* Show pagination numbers */}
                  {[...Array(totalPages)].map((_, index) => {
                    // Show limited page buttons with ellipsis for better UX
                    const page = index + 1;
                    
                    // Always show first, last, current, and pages around current
                    if (
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-md text-sm ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                    
                    // Show ellipsis (but only once on each side)
                    if (
                      (page === 2 && currentPage > 3) || 
                      (page === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return <span key={page} className="px-2 py-1 text-gray-500">...</span>;
                    }
                    
                    return null;
                  })}
                </div>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-1 rounded-md ${
                    currentPage === totalPages 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Exam Modal */}
      <ScheduleExamModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSubmit={handleScheduleExam}
        examinations={examinations}
        examTypes={examTypes}
        classes={classes}
        rooms={rooms}
        academicSessionId={selectedSession}
      />
    </div>
  );
};

export default ExamSchedule;