// components/analytics.js
import React, { useState, useEffect } from "react";
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
  Users,
  Award,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Calendar,
  BookOpen,
  UserCheck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import LoadingSpinner from "../util/loaderSpinner";

// Constants for chart colors
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
const GRADE_COLORS = {
  A: "#4CAF50",
  B: "#8BC34A",
  C: "#FFC107",
  D: "#FF9800",
  E: "#FF5722",
  F: "#F44336",
};

const Analytics = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  // Filters and selections
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);

  const [selectedSession, setSelectedSession] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedExam, setSelectedExam] = useState("");

  // Analytics data
  const [classPerformance, setClassPerformance] = useState(null);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [subjectAnalysis, setSubjectAnalysis] = useState(null);

  // UI state
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    subjects: true,
    trends: true,
    students: true,
    comparison: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Load initial data - academic sessions
  useEffect(() => {
    const fetchAcademicSessions = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5010/api/grading/sessions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSessions(response.data);

        // Set current session as default
        const currentSession = response.data.find(
          (session) => session.is_current
        );
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
        const response = await axios.get(
          `http://localhost:5010/api/grading/classes?academic_session_id=${selectedSession}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setClasses(response.data);

        if (response.data.length > 0) {
          setSelectedClass(response.data[0].id);
        } else {
          setSelectedClass("");
        }

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
        const response = await axios.get(
          `http://localhost:5010/api/examgrading?academic_session_id=${selectedSession}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setExams(response.data);

        // Default to the most recent exam
        if (response.data.length > 0) {
          // Sort by start_date descending
          const sortedExams = [...response.data].sort(
            (a, b) => new Date(b.start_date) - new Date(a.start_date)
          );
          setSelectedExam(sortedExams[0].id);
        } else {
          setSelectedExam("");
        }
      } catch (err) {
        console.error("Failed to load examinations:", err);
      }
    };

    fetchClasses();
    fetchExams();
  }, [selectedSession]);

  // Load subjects when class changes
  useEffect(() => {
    if (!selectedClass) return;

    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5010/api/grading/subjects/${selectedClass}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSubjects(response.data);

        if (response.data.length > 0) {
          setSelectedSubject(response.data[0].id);
        } else {
          setSelectedSubject("");
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load subjects");
        setLoading(false);
        console.error(err);
      }
    };

    fetchSubjects();
  }, [selectedClass]);

  // Load class performance data
  useEffect(() => {
    if (!selectedClass || !selectedSession) return;

    const fetchClassPerformance = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5010/api/analytics/class-summary/${selectedClass}?academic_session_id=${selectedSession}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(response)
        setClassPerformance(response.data);

        // Extract trend data
        if (response.data.trendData) {
          setTrendData(response.data.trendData);
        }

        // Extract top students if available in the first exam
        if (
          response.data.examPerformance &&
          response.data.examPerformance.length > 0
        ) {
          setTopStudents(response.data.examPerformance[0].topStudents || []);
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load class performance data");
        setLoading(false);
        console.error(err);
      }
    };

    fetchClassPerformance();
  }, [selectedClass, selectedSession]);

  // Load subject performance data
  useEffect(() => {
    if (!selectedClass || !selectedExam) return;

    const fetchSubjectPerformance = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5010/api/examgrading/subject-performance/${selectedClass}?examination_id=${selectedExam}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSubjectPerformance(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load subject performance data");
        setLoading(false);
        console.error(err);
      }
    };

    fetchSubjectPerformance();
  }, [selectedClass, selectedExam]);

  // Load individual subject analysis
  useEffect(() => {
    if (!selectedSubject || !selectedClass || !selectedSession) return;

    const fetchSubjectAnalysis = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5010/api/analytics/subject-analysis/${selectedSubject}?class_id=${selectedClass}&academic_session_id=${selectedSession}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSubjectAnalysis(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load subject analysis data");
        setLoading(false);
        console.error(err);
      }
    };

    if (activeTab === "subjects") {
      fetchSubjectAnalysis();
    }
  }, [selectedSubject, selectedClass, selectedSession, activeTab]);

  // Prepare data for charts
  const prepareGradeDistribution = () => {
    if (
      !classPerformance ||
      !classPerformance.examPerformance ||
      classPerformance.examPerformance.length === 0
    ) {
      return [];
    }

    const latestExam = classPerformance.examPerformance[0];
    const performance = latestExam.performance || {};

    return [
      {
        name: "A (70-100%)",
        value: performance.a_grade_count || 0,
        color: GRADE_COLORS.A,
      },
      {
        name: "B (60-69%)",
        value: performance.b_grade_count || 0,
        color: GRADE_COLORS.B,
      },
      {
        name: "C (50-59%)",
        value: performance.c_grade_count || 0,
        color: GRADE_COLORS.C,
      },
      {
        name: "D (40-49%)",
        value: performance.d_grade_count || 0,
        color: GRADE_COLORS.D,
      },
      {
        name: "F (0-39%)",
        value: performance.fail_count || 0,
        color: GRADE_COLORS.F,
      },
    ];
  };

  const prepareSubjectPerformanceData = () => {
    if (!subjectPerformance || subjectPerformance.length === 0) return [];

    return subjectPerformance
      .map((subject) => ({
        name:
          subject.subject_name.length > 15
            ? subject.subject_name.substring(0, 15) + "..."
            : subject.subject_name,
        fullName: subject.subject_name,
        average: subject.average_marks,
        passed: subject.passed_count,
        failed: subject.failed_count,
        passRate: subject.pass_percentage,
      }))
      .sort((a, b) => b.average - a.average);
  };

  const preparePassFailData = () => {
    if (
      !classPerformance ||
      !classPerformance.examPerformance ||
      classPerformance.examPerformance.length === 0
    ) {
      return [];
    }

    const latestExam = classPerformance.examPerformance[0];
    const performance = latestExam.performance || {};

    // Sum up all students who passed (A to D grades)
    const passed =
      (performance.a_grade_count || 0) +
      (performance.b_grade_count || 0) +
      (performance.c_grade_count || 0) +
      (performance.d_grade_count || 0);

    const failed = performance.fail_count || 0;

    return [
      { name: "Passed", value: passed, color: "#4CAF50" },
      { name: "Failed", value: failed, color: "#F44336" },
    ];
  };

  const prepareSubjectDistribution = () => {
    if (!subjectAnalysis || !subjectAnalysis.examPerformance) return [];

    return subjectAnalysis.examPerformance
      .filter(
        (item) => item.gradeDistribution && item.gradeDistribution.length > 0
      )
      .map((item) => {
        const exam = item.exam || {};
        const date = new Date(exam.start_date);
        const formattedDate = `${date.getDate()}/${
          date.getMonth() + 1
        }/${date.getFullYear()}`;

        // Transform the grade distribution data
        const distribution = {};
        item.gradeDistribution.forEach((grade) => {
          distribution[grade.grade] = grade.count;
        });

        return {
          name: exam.name,
          date: formattedDate,
          A: distribution.A || 0,
          B: distribution.B || 0,
          C: distribution.C || 0,
          D: distribution.D || 0,
          F: distribution.F || 0,
          average: item.performance ? item.performance.average_score : 0,
        };
      });
  };

  const prepareSubjectTrendData = () => {
    if (!subjectAnalysis || !subjectAnalysis.trendData) return [];

    return subjectAnalysis.trendData.map((item) => {
      const date = new Date(item.start_date);
      return {
        name: item.exam_name,
        date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
        average: item.average_score,
      };
    });
  };

  const getExamName = (examId) => {
    if (!exams || exams.length === 0) return "Selected Exam";
    const exam = exams.find((e) => e.id.toString() === examId.toString());
    return exam ? exam.name : "Selected Exam";
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading indicator */}
      {loading && <LoadingSpinner />}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Analytics Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Session
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3"
              disabled={loading}
            >
              <option value="">Select Session</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.year} - Term {session.term}{" "}
                  {session.is_current ? "(Current)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3"
              disabled={loading || !selectedSession}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Examination
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3"
              disabled={loading || !selectedSession}
            >
              <option value="">Select Examination</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject Analysis
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3"
              disabled={loading || !selectedClass}
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Analytics Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <BarChartIcon className="h-5 w-5" />
              <span>Class Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("subjects")}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === "subjects"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <PieChartIcon className="h-5 w-5" />
              <span>Subject Analysis</span>
            </button>
            <button
              onClick={() => setActiveTab("trends")}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === "trends"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              <span>Performance Trends</span>
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === "students"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="h-5 w-5" />
              <span>Student Ranking</span>
            </button>
          </div>
        </div>
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Class Overview Section */}
              <div className="border rounded-lg overflow-hidden">
                <div
                  className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection("overview")}
                >
                  <h3 className="font-medium flex items-center space-x-2">
                    <BarChartIcon className="h-5 w-5 text-blue-600" />
                    <span>Class Performance Overview</span>
                  </h3>
                  {expandedSections.overview ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>

                {expandedSections.overview && (
                  <div className="p-4">
                    {classPerformance &&
                    classPerformance.examPerformance &&
                    classPerformance.examPerformance.length > 0 ? (
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm text-blue-600 mb-1">
                              Class Average
                            </div>
                            <div className="text-2xl font-bold">
                              {classPerformance.examPerformance[0].performance?.average_score?.toFixed(
                                1
                              ) || 0}
                              %
                            </div>
                            <div className="text-sm text-blue-600">
                              for {getExamName(selectedExam)}
                            </div>
                          </div>

                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-sm text-green-600 mb-1">
                              Highest Score
                            </div>
                            <div className="text-2xl font-bold">
                              {classPerformance.examPerformance[0].performance?.highest_score?.toFixed(
                                1
                              ) || 0}
                              %
                            </div>
                            <div className="text-sm text-green-600">
                              achieved in this exam
                            </div>
                          </div>

                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="text-sm text-yellow-600 mb-1">
                              Pass Rate
                            </div>
                            <div className="text-2xl font-bold">
                              {classPerformance.examPerformance[0]
                                .performance &&
                              classPerformance.examPerformance[0].performance
                                .total_students > 0
                                ? (
                                    (((classPerformance.examPerformance[0]
                                      .performance.a_grade_count || 0) +
                                      (classPerformance.examPerformance[0]
                                        .performance.b_grade_count || 0) +
                                      (classPerformance.examPerformance[0]
                                        .performance.c_grade_count || 0) +
                                      (classPerformance.examPerformance[0]
                                        .performance.d_grade_count || 0)) /
                                      classPerformance.examPerformance[0]
                                        .performance.total_students) *
                                    100
                                  ).toFixed(1)
                                : 0}
                              %
                            </div>
                            <div className="text-sm text-yellow-600">
                              overall pass percentage
                            </div>
                          </div>

                          <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="text-sm text-purple-600 mb-1">
                              Total Students
                            </div>
                            <div className="text-2xl font-bold">
                              {classPerformance.examPerformance[0].performance
                                ?.total_students || 0}
                            </div>
                            <div className="text-sm text-purple-600">
                              in this class
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                          {/* Grade distribution chart */}
                          <div>
                            <h4 className="text-md font-medium mb-2">
                              Grade Distribution
                            </h4>
                            <div className="h-80 border rounded-lg p-4">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={prepareGradeDistribution()}
                                  layout="vertical"
                                  margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                  }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis type="number" />
                                  <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={80}
                                  />
                                  <Tooltip
                                    formatter={(value) => [
                                      `${value} Students`,
                                      "Count",
                                    ]}
                                  />
                                  <Legend />
                                  <Bar dataKey="value" name="Students">
                                    {prepareGradeDistribution().map(
                                      (entry, index) => (
                                        <Cell
                                          key={`cell-${index}`}
                                          fill={entry.color}
                                        />
                                      )
                                    )}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Pass/Fail distribution */}
                          <div>
                            <h4 className="text-md font-medium mb-2">
                              Pass/Fail Distribution
                            </h4>
                            <div className="h-80 border rounded-lg p-4">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={preparePassFailData()}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) =>
                                      `${name}: ${(percent * 100).toFixed(0)}%`
                                    }
                                  >
                                    {preparePassFailData().map(
                                      (entry, index) => (
                                        <Cell
                                          key={`cell-${index}`}
                                          fill={entry.color}
                                        />
                                      )
                                    )}
                                  </Pie>
                                  <Tooltip
                                    formatter={(value) => [
                                      `${value} Students`,
                                      "Count",
                                    ]}
                                  />
                                  <Legend />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4 text-gray-500">
                        No performance data available for the selected class and
                        examination.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Subject Performance Section */}
              <div className="border rounded-lg overflow-hidden">
                <div
                  className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection("subjects")}
                >
                  <h3 className="font-medium flex items-center space-x-2">
                    <PieChartIcon className="h-5 w-5 text-green-600" />
                    <span>Subject Performance Comparison</span>
                  </h3>
                  {expandedSections.subjects ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>

                {expandedSections.subjects && (
                  <div className="p-4">
                    {subjectPerformance && subjectPerformance.length > 0 ? (
                      <div>
                        <div className="h-80 mb-6 border rounded-lg p-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={prepareSubjectPerformanceData()}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis domain={[0, 100]} />
                              <Tooltip
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-white p-3 border rounded-md shadow-sm">
                                        <p className="font-medium">
                                          {data.fullName}
                                        </p>
                                        <p>
                                          Average:{" "}
                                          {typeof data.average === "number"
                                            ? `${data.average.toFixed(1)}%`
                                            : `${data.average || 0}%`}
                                        </p>
                                        <p>
                                          Pass Rate:{" "}
                                          {typeof data.passRate === "number"
                                            ? `${data.passRate.toFixed(1)}%`
                                            : `${data.passRate || 0}%`}
                                        </p>
                                        <p>
                                          Passed/Failed: {data.passed}/
                                          {data.failed}
                                        </p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Legend />
                              <Bar
                                dataKey="average"
                                name="Average Score (%)"
                                fill="#8884d8"
                              />
                              <Bar
                                dataKey="passRate"
                                name="Pass Rate (%)"
                                fill="#82ca9d"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Subject
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Average Score
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Highest Score
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Pass Rate
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Passed/Failed
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {subjectPerformance.map((subject, index) => (
                                <tr key={index}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {subject?.subject_name || "N/A"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {typeof subject?.average_marks === "number"
                                      ? `${subject.average_marks.toFixed(1)}%`
                                      : subject?.average_marks || "N/A"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {typeof subject?.highest_marks === "number"
                                      ? `${subject.highest_marks.toFixed(1)}%`
                                      : subject?.highest_marks || "N/A"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {typeof subject?.pass_percentage ===
                                    "number"
                                      ? `${subject.pass_percentage.toFixed(1)}%`
                                      : subject?.pass_percentage || "N/A"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {subject?.passed_count !== undefined &&
                                    subject?.failed_count !== undefined
                                      ? `${subject.passed_count}/${subject.failed_count}`
                                      : "N/A"}
                                  </td>
                                </tr>
                              ))}{" "}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4 text-gray-500">
                        No subject performance data available for the selected
                        examination.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subject Analysis Tab */}
          {activeTab === "subjects" && (
            <div className="space-y-6">
              {selectedSubject && subjectAnalysis ? (
                <div>
                  {/* Subject Header */}
                  <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {subjectAnalysis.subject?.name || "Subject Analysis"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Teacher:{" "}
                          {subjectAnalysis.subject?.teacher_name ||
                            "Not Assigned"}
                        </p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {subjectAnalysis.subject?.code || ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subject Performance Overview */}
                  <div className="border rounded-lg overflow-hidden mb-6">
                    <div className="bg-gray-50 p-4">
                      <h3 className="font-medium flex items-center space-x-2">
                        <BarChartIcon className="h-5 w-5 text-blue-600" />
                        <span>Performance Overview</span>
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-sm text-blue-600 mb-1">
                            Average Score
                          </div>
                          <div className="text-2xl font-bold">
                            {subjectAnalysis.examPerformance &&
                            subjectAnalysis.examPerformance.length > 0 &&
                            subjectAnalysis.examPerformance[0].performance
                              ? typeof subjectAnalysis.examPerformance[0]
                                  .performance.average_score === "number"
                                ? `${subjectAnalysis.examPerformance[0].performance.average_score.toFixed(
                                    1
                                  )}`
                                : subjectAnalysis.examPerformance[0].performance
                                    .average_score || 0
                              : 0}
                            %
                          </div>
                          <div className="text-sm text-blue-600">
                            in {getExamName(selectedExam)}
                          </div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-sm text-green-600 mb-1">
                            Pass Rate
                          </div>
                          <div className="text-2xl font-bold">
                            {subjectAnalysis.examPerformance &&
                            subjectAnalysis.examPerformance.length > 0 &&
                            subjectAnalysis.examPerformance[0].performance
                              ? typeof subjectAnalysis.examPerformance[0]
                                  .performance.pass_percentage === "number"
                                ? `${subjectAnalysis.examPerformance[0].performance.pass_percentage.toFixed(
                                    1
                                  )}`
                                : subjectAnalysis.examPerformance[0].performance
                                    .pass_percentage || 0
                              : 0}
                            %
                          </div>
                          <div className="text-sm text-green-600">
                            students passed
                          </div>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-sm text-purple-600 mb-1">
                            Compared to Class
                          </div>
                          <div className="text-2xl font-bold">
                            {subjectAnalysis.examPerformance &&
                            subjectAnalysis.examPerformance.length > 0 &&
                            subjectAnalysis.examPerformance[0].performance &&
                            classPerformance &&
                            classPerformance.examPerformance &&
                            classPerformance.examPerformance.length > 0 &&
                            classPerformance.examPerformance[0].performance
                              ? typeof subjectAnalysis.examPerformance[0]
                                  .performance.average_score === "number" &&
                                typeof classPerformance.examPerformance[0]
                                  .performance.average_score === "number"
                                ? `${(
                                    subjectAnalysis.examPerformance[0]
                                      .performance.average_score -
                                    classPerformance.examPerformance[0]
                                      .performance.average_score
                                  ).toFixed(1)}`
                                : 0
                              : 0}
                            %
                          </div>
                          <div className="text-sm text-purple-600">
                            from class average
                          </div>
                        </div>
                      </div>

                      {/* Grade Distribution Chart */}
                      <div className="h-80 border rounded-lg p-4 mb-6">
                        <h4 className="text-md font-medium mb-2">
                          Grade Distribution by Exam
                        </h4>
                        <ResponsiveContainer width="100%" height="90%">
                          <BarChart
                            data={prepareSubjectDistribution()}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                              dataKey="A"
                              name="A (70-100%)"
                              stackId="a"
                              fill={GRADE_COLORS.A}
                            />
                            <Bar
                              dataKey="B"
                              name="B (60-69%)"
                              stackId="a"
                              fill={GRADE_COLORS.B}
                            />
                            <Bar
                              dataKey="C"
                              name="C (50-59%)"
                              stackId="a"
                              fill={GRADE_COLORS.C}
                            />
                            <Bar
                              dataKey="D"
                              name="D (40-49%)"
                              stackId="a"
                              fill={GRADE_COLORS.D}
                            />
                            <Bar
                              dataKey="F"
                              name="F (0-39%)"
                              stackId="a"
                              fill={GRADE_COLORS.F}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Performance Trend Chart */}
                      <div className="h-80 border rounded-lg p-4">
                        <h4 className="text-md font-medium mb-2">
                          Performance Trend Over Time
                        </h4>
                        <ResponsiveContainer width="100%" height="90%">
                          <LineChart
                            data={prepareSubjectTrendData()}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip
                              formatter={(value) => [
                                `${value}%`,
                                "Average Score",
                              ]}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="average"
                              stroke="#8884d8"
                              name="Average Score"
                              activeDot={{ r: 8 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Top Students in this Subject */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4">
                      <h3 className="font-medium flex items-center space-x-2">
                        <Award className="h-5 w-5 text-yellow-600" />
                        <span>Top Performing Students</span>
                      </h3>
                    </div>
                    <div className="p-4">
                      {subjectAnalysis.examPerformance &&
                      subjectAnalysis.examPerformance.length > 0 &&
                      subjectAnalysis.examPerformance[0].topStudents &&
                      subjectAnalysis.examPerformance[0].topStudents.length >
                        0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Rank
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Student
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Admission No.
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Score
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Grade
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {subjectAnalysis.examPerformance[0].topStudents.map(
                                (student, index) => (
                                  <tr key={index}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {index + 1}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {student.student_name}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                      {student.admission_number}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                      {student.marks_obtained}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                      {student.grade}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center p-4 text-gray-500">
                          No top student data available for this subject.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 text-gray-500">
                  Please select a subject to view detailed analysis.
                </div>
              )}
            </div>
          )}

          {/* Performance Trends Tab */}
          {activeTab === "trends" && (
            <div className="space-y-6">
              <div className="border rounded-lg overflow-hidden">
                <div
                  className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection("trends")}
                >
                  <h3 className="font-medium flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span>Class Performance Trends</span>
                  </h3>
                  {expandedSections.trends ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>

                {expandedSections.trends && (
                  <div className="p-4">
                    {trendData && trendData.length > 0 ? (
                      <div>
                        {/* Class Average Over Time */}
                        <div className="h-80 border rounded-lg p-4 mb-6">
                          <h4 className="text-md font-medium mb-2">
                            Class Average Over Time
                          </h4>
                          <ResponsiveContainer width="100%" height="90%">
                            <LineChart
                              data={trendData}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="exam_name" />
                              <YAxis domain={[0, 100]} />
                              <Tooltip
                                formatter={(value) => [
                                  `${value}%`,
                                  "Class Average",
                                ]}
                              />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="class_average"
                                name="Class Average (%)"
                                stroke="#8884d8"
                                activeDot={{ r: 8 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Subject Performance Comparison Over Time */}
                        {subjectPerformance &&
                          subjectPerformance.length > 0 && (
                            <div className="h-80 border rounded-lg p-4 mb-6">
                              <h4 className="text-md font-medium mb-2">
                                Subject Performance Comparison
                              </h4>
                              <ResponsiveContainer width="100%" height="90%">
                                <AreaChart
                                  data={trendData}
                                  margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                  }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="exam_name" />
                                  <YAxis domain={[0, 100]} />
                                  <Tooltip
                                    formatter={(value) => [
                                      `${value}%`,
                                      "Score",
                                    ]}
                                  />
                                  <Legend />
                                  <Area
                                    type="monotone"
                                    dataKey="class_average"
                                    name="Class Average"
                                    stroke="#8884d8"
                                    fill="#8884d8"
                                    fillOpacity={0.3}
                                  />
                                  {/* Additional subject lines would be added here if we had that data */}
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          )}

                        {/* Trend Data Table */}
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Exam
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Average Score
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Compared to Previous
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Date
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {trendData.map((exam, index) => {
                                // Calculate change from previous exam
                                const previousAvg =
                                  index < trendData.length - 1
                                    ? trendData[index + 1].class_average
                                    : null;
                                const change =
                                  previousAvg !== null
                                    ? exam.class_average - previousAvg
                                    : null;
                                const changeText =
                                  change !== null
                                    ? change > 0
                                      ? `+${change.toFixed(1)}%`
                                      : `${change.toFixed(1)}%`
                                    : "-";
                                const changeClass =
                                  change !== null
                                    ? change > 0
                                      ? "text-green-600"
                                      : change < 0
                                      ? "text-red-600"
                                      : "text-gray-500"
                                    : "";

                                // Format date
                                const date = new Date(exam.start_date);
                                const formattedDate = `${date.getDate()}/${
                                  date.getMonth() + 1
                                }/${date.getFullYear()}`;

                                return (
                                  <tr key={index}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {exam?.exam_name}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                      {typeof exam?.class_average === "number"
                                        ? exam.class_average.toFixed(1) + "%"
                                        : "0%"}
                                    </td>
                                    <td
                                      className={`px-4 py-3 whitespace-nowrap text-sm ${changeClass}`}
                                    >
                                      {changeText}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                      {formattedDate}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4 text-gray-500">
                        No trend data available for the selected class.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Comparative Analysis Section */}
              <div className="border rounded-lg overflow-hidden">
                <div
                  className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection("comparison")}
                >
                  <h3 className="font-medium flex items-center space-x-2">
                    <BarChartIcon className="h-5 w-5 text-indigo-600" />
                    <span>Comparative Analysis</span>
                  </h3>
                  {expandedSections.comparison ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>

                {expandedSections.comparison && (
                  <div className="p-4">
                    {/* This section would contain comparative data between exams, subjects, or classes */}
                    {trendData && trendData.length > 0 ? (
                      <div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                          {/* Term Comparison Chart */}
                          <div className="h-80 border rounded-lg p-4">
                            <h4 className="text-md font-medium mb-2">
                              Term-by-Term Comparison
                            </h4>
                            <ResponsiveContainer width="100%" height="90%">
                              <BarChart
                                layout="vertical"
                                data={[
                                  { name: "Term 1", average: 68.5 },
                                  { name: "Term 2", average: 72.3 },
                                  { name: "Term 3", average: 74.1 },
                                ]}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" domain={[0, 100]} />
                                <YAxis dataKey="name" type="category" />
                                <Tooltip
                                  formatter={(value) => [
                                    `${value}%`,
                                    "Class Average",
                                  ]}
                                />
                                <Legend />
                                <Bar
                                  dataKey="average"
                                  name="Class Average (%)"
                                  fill="#8884d8"
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Year-to-Year Comparison */}
                          <div className="h-80 border rounded-lg p-4">
                            <h4 className="text-md font-medium mb-2">
                              Year-to-Year Comparison
                            </h4>
                            <ResponsiveContainer width="100%" height="90%">
                              <LineChart
                                data={[
                                  { year: "2022", average: 67.2 },
                                  { year: "2023", average: 70.8 },
                                  { year: "2024", average: 72.4 },
                                ]}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip
                                  formatter={(value) => [
                                    `${value}%`,
                                    "Class Average",
                                  ]}
                                />
                                <Legend />
                                <Line
                                  type="monotone"
                                  dataKey="average"
                                  name="Class Average (%)"
                                  stroke="#82ca9d"
                                  activeDot={{ r: 8 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Note: This is demo data - in a real application, this would be populated from the API */}
                        <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm">
                          <p className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>
                              The comparative data shown here is sample data. In
                              a production environment, this would be populated
                              with actual historical data from your database.
                            </span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4 text-gray-500">
                        No comparative data available for the selected class.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Student Ranking Tab */}
          {activeTab === "students" && (
            <div className="space-y-6">
              <div className="border rounded-lg overflow-hidden">
                <div
                  className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection("students")}
                >
                  <h3 className="font-medium flex items-center space-x-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span>Student Rankings</span>
                  </h3>
                  {expandedSections.students ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>

                {expandedSections.students && (
                  <div className="p-4">
                    {topStudents && topStudents.length > 0 ? (
                      <div>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                          <h4 className="text-md font-medium">
                            Top Performing Students for{" "}
                            {getExamName(selectedExam)}
                          </h4>
                          <div className="mt-2 md:mt-0">
                            <select
                              className="border border-gray-300 rounded-md py-1 px-2 text-sm"
                              defaultValue="average"
                            >
                              <option value="average">Sort by Average</option>
                              <option value="position">Sort by Position</option>
                            </select>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Rank
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Student
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Admission No.
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Average Score
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Grade
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {topStudents.map((student, index) => {
                                // Define status based on score
                                let status;
                                let statusClass;
                                if (student.average_marks >= 70) {
                                  status = "Excellent";
                                  statusClass = "bg-green-100 text-green-800";
                                } else if (student.average_marks >= 60) {
                                  status = "Very Good";
                                  statusClass = "bg-blue-100 text-blue-800";
                                } else if (student.average_marks >= 50) {
                                  status = "Good";
                                  statusClass = "bg-blue-100 text-blue-800";
                                } else if (student.average_marks >= 40) {
                                  status = "Satisfactory";
                                  statusClass = "bg-yellow-100 text-yellow-800";
                                } else {
                                  status = "Needs Improvement";
                                  statusClass = "bg-red-100 text-red-800";
                                }

                                return (
                                  <tr key={index}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {index + 1}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {student.student_name}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                      {student.admission_number}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                      {student.average_marks?.toFixed(1)}%
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                      {student.grade}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                      <span
                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}
                                      >
                                        {status}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-4 flex justify-center">
                          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            View Complete Rankings
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4 text-gray-500">
                        No student ranking data available.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Student Improvement/Decline Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4">
                    <h3 className="font-medium flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span>Most Improved Students</span>
                    </h3>
                  </div>
                  <div className="p-4">
                    {/* In a real application, this would be populated with data from the API */}
                    <div className="text-center p-4 text-gray-500">
                      <UserCheck className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>
                        Most improved students would be shown here based on
                        their progress between exams.
                      </p>
                      <p className="text-sm mt-2">
                        This requires comparing results across multiple
                        examinations.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4">
                    <h3 className="font-medium flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span>Students Needing Support</span>
                    </h3>
                  </div>
                  <div className="p-4">
                    {/* In a real application, this would be populated with data from the API */}
                    <div className="text-center p-4 text-gray-500">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>
                        Students who might need additional academic support
                        would be listed here.
                      </p>
                      <p className="text-sm mt-2">
                        Based on consistently low performance or declining
                        scores.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* No data message */}
      {!loading &&
        !error &&
        ((activeTab === "overview" &&
          (!classPerformance || !subjectPerformance)) ||
          (activeTab === "subjects" &&
            (!selectedSubject || !subjectAnalysis)) ||
          (activeTab === "trends" && (!trendData || trendData.length === 0)) ||
          (activeTab === "students" &&
            (!topStudents || topStudents.length === 0))) && (
          <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>
                Select a class and exam to view analytics. Make sure exams have
                been conducted and grades have been entered.
              </p>
            </div>
          </div>
        )}
    </div>
  );
};

export default Analytics;
