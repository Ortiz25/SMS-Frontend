// components/gradeEntry.js
import React, { useState, useEffect } from "react";
import {
  Filter,
  Search,
  Save,
  AlertCircle,
  CheckCircle,
  Download,
} from "lucide-react";
import axios from "axios";
import LoadingSpinner from "./../util/loaderSpinner";

const GradeEntry = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // State for filters and selections
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSession, setSelectedSession] = useState("");

  // Students and grades data
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [examSchedule, setExamSchedule] = useState(null);
  const token = localStorage.getItem("token");

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  // Load initial data - academic sessions
  useEffect(() => {
    const fetchAcademicSessions = async () => {
      try {
        const response = await axios.get(
          "/backend/api/grading/sessions",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSessions(response.data);

        // Set current session as default if available
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

  // Load exams when session changes
  useEffect(() => {
    if (!selectedSession) return;

    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/backend/api/examgrading?academic_session_id=${selectedSession}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setExams(response.data.examinations);
        setLoading(false);
      } catch (err) {
        setError("Failed to load examinations");
        setLoading(false);
        console.error(err);
      }
    };

    fetchExams();
  }, [selectedSession]);

  // Load classes when session changes
  useEffect(() => {
    if (!selectedSession) return;

    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/backend/api/grading/classes?academic_session_id=${selectedSession}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setClasses(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load classes");
        setLoading(false);
        console.error(err);
      }
    };

    fetchClasses();
  }, [selectedSession]);

  // Load subjects when both class AND exam are selected
  useEffect(() => {
    if (!selectedClass || !selectedExam) return;

    const fetchSubjects = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `/backend/api/grading/exam-subjects/${selectedClass}/${selectedExam}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSubjects(response.data);

        setLoading(false);
      } catch (err) {
        setError("Failed to load subjects with scheduled exams");
        setLoading(false);
        console.error(err);
      }
    };

    fetchSubjects();
  }, [selectedClass, selectedExam]); // Now depends on both class and exam

  // Load students when class changes
  useEffect(() => {
    if (!selectedClass) return;

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/backend/api/grading/students/${selectedClass}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStudents(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load students");
        setLoading(false);
        console.error(err);
      }
    };

    fetchStudents();
  }, [selectedClass]);

  // Find exam schedule and load existing grades
  useEffect(() => {
    //console.log(selectedExam, selectedClass, selectedSubject);
    if (!selectedExam || !selectedClass || !selectedSubject) return;

    const findExamSchedule = async () => {
      try {
        // Clear any previous errors
        setError(null);
        setLoading(true);

        // Get exam schedules for the selected exam
        const schedulesResponse = await axios.get(
          `/backend/api/examgrading/${selectedExam}/schedules`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Find schedule for selected class and subject
        const schedule = schedulesResponse.data.find(
          (s) =>
            s.class_id === parseInt(selectedClass) &&
            s.subject_id === parseInt(selectedSubject)
        );

        if (schedule) {
          setExamSchedule(schedule);

          // Load existing grades for this schedule
          const gradesResponse = await axios.get(
            `/backend/api/examgrading/schedules/${schedule.id}/results`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Create a map of student ID to grade result
          const gradeMap = {};
          gradesResponse.data.forEach((grade) => {
            gradeMap[grade.student_id] = grade;
          });

          // Get the subject name for filtering
          const subjectName = subjects.find(
            (sub) => sub.id === parseInt(selectedSubject)
          )?.name;

          // Filter students who are taking this subject
          const studentsForSubject = students.filter(
            (student) =>
              student.subjects && student.subjects.includes(subjectName)
          );

          if (studentsForSubject.length === 0) {
            setError(
              `No students in this class are taking ${subjectName}. Please check subject enrollments.`
            );
            setGrades([]);
          } else {
            // Initialize grades only for students taking this subject
            const initialGrades = studentsForSubject.map((student) => {
              const existingGrade = gradeMap[student.id];
              return {
                student_id: student.id,
                name: `${student.first_name} ${student.last_name}`,
                admission_number: student.admission_number,
                marks_obtained: existingGrade
                  ? existingGrade.marks_obtained
                  : null,
                is_absent: existingGrade ? existingGrade.is_absent : false,
                grade: existingGrade ? existingGrade.grade : null,
                points: existingGrade ? existingGrade.points : null,
              };
            });

            setGrades(initialGrades);
          }
        } else {
          setError("No exam schedule found for the selected combination");
          setExamSchedule(null);
          setGrades([]);
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load exam schedule and grades");
        setLoading(false);
        console.error(err);
      }
    };

    findExamSchedule();
  }, [selectedExam, selectedClass, selectedSubject, students]);

  // Handle grade input change
  const handleGradeChange = (studentId, field, value) => {
    setGrades((prevGrades) =>
      prevGrades.map((grade) =>
        grade.student_id === studentId
          ? {
              ...grade,
              [field]: value,
              // If marking as absent, clear marks
              ...(field === "is_absent" && value === true
                ? { marks_obtained: null }
                : {}),
            }
          : grade
      )
    );
  };

  // Save grades
  const saveGrades = async () => {
    if (!examSchedule) {
      setError("No exam schedule selected");
      return;
    }

    try {
      setLoading(true);
      // Format data for API
      const gradesToSave = grades.map(
        ({ student_id, marks_obtained, is_absent }) => ({
          student_id,
          marks_obtained,
          is_absent,
        })
      );

      // Save to API
      await axios.post(
        `/backend/api/examgrading/schedules/${examSchedule.id}/results`,
        { results: gradesToSave }, // Request body
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Grades saved successfully");

      // Refresh grades to get updated calculated fields
      const refreshResponse = await axios.get(
        `/backend/api/examgrading/schedules/${examSchedule.id}/results`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update grades with API response
      const updatedGrades = students.map((student) => {
        const updatedGrade = refreshResponse.data.find(
          (g) => g.student_id === student.id
        );
        return {
          student_id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          admission_number: student.admission_number,
          marks_obtained: updatedGrade ? updatedGrade.marks_obtained : null,
          is_absent: updatedGrade ? updatedGrade.is_absent : false,
          grade: updatedGrade ? updatedGrade.grade : null,
          points: updatedGrade ? updatedGrade.points : null,
        };
      });

      setGrades(updatedGrades);
      setLoading(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError("Failed to save grades");
      setLoading(false);
      console.error(err);

      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  // Export grades as CSV
  const exportGrades = () => {
    if (grades.length === 0) return;

    // Create CSV content
    const headers = "Admission Number,Student Name,Marks,Grade,Points,Absent\n";
    const rows = grades
      .map(
        (grade) =>
          `${grade.admission_number},"${grade.name}",${
            grade.marks_obtained || ""
          },${grade.grade || ""},${grade.points || ""},${
            grade.is_absent ? "Yes" : "No"
          }`
      )
      .join("\n");

    const csvContent = `data:text/csv;charset=utf-8,${headers}${rows}`;
    const encodedUri = encodeURI(csvContent);

    // Create download link
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Grades_${selectedExam}_${selectedClass}_${selectedSubject}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter students by search term
  const filteredGrades = grades.filter(
    (grade) =>
      grade.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Reset error when any selection changes
  useEffect(() => {
    setError(null);
  }, [selectedExam, selectedClass, selectedSubject, selectedSession]);
  return (
    <div className="space-y-6">
      {/* Alert messages */}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>{success}</span>
        </div>
      )}

      {/* Loading indicator */}
      {loading && <LoadingSpinner />}

      {/* Selection filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Grade Entry Filters</h2>
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
              {exams?.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3"
              disabled={loading || !selectedClass}
            >
              <option value="">Select Subject</option>
              {subjects.map((subject, index) => (
                <option
                  key={`subject-${subject.id}-${index}`}
                  value={subject.id}
                >
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grades table */}
      {grades.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-2 md:space-y-0">
            <h2 className="text-lg font-medium">Student Grades</h2>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {/* Search box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-md pl-8 pr-3 py-2 w-full sm:w-64"
                />
                <Search className="h-4 w-4 absolute left-2 top-3 text-gray-400" />
              </div>

              {/* Action buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={saveGrades}
                  disabled={loading || !examSchedule}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>

                <button
                  onClick={exportGrades}
                  disabled={loading || grades.length === 0}
                  className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grades table */}
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
                    Marks (out of {examSchedule?.total_marks || 100})
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Absent
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGrades.map((grade) => (
                  <tr key={grade.student_id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {grade.admission_number}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {grade.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <input
                        type="number"
                        min="0"
                        max={examSchedule?.total_marks || 100}
                        value={grade.marks_obtained || ""}
                        onChange={(e) =>
                          handleGradeChange(
                            grade.student_id,
                            "marks_obtained",
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                        disabled={grade.is_absent || loading}
                        className="border border-gray-300 rounded-md p-1 w-16 text-center disabled:bg-gray-100"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {grade.grade || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {grade.points || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <input
                        type="checkbox"
                        checked={grade.is_absent || false}
                        onChange={(e) =>
                          handleGradeChange(
                            grade.student_id,
                            "is_absent",
                            e.target.checked
                          )
                        }
                        disabled={loading}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredGrades.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No students match your search criteria
              </div>
            )}
          </div>
        </div>
      )}

      {!loading &&
        selectedClass &&
        selectedSubject &&
        selectedExam &&
        grades.length === 0 && (
          <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700">
            No exam schedule found for the selected combination. Please ensure
            that an exam schedule has been created.
          </div>
        )}
    </div>
  );
};

export default GradeEntry;
