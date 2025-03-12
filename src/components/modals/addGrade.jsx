import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, CheckCircle, Plus, Upload } from "lucide-react";
import axios from "axios";
import LoadingSpinner from "../../util/loaderSpinner";

const AddGradesModal = ({ isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const token = localStorage.getItem("token");
  // Form data
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedSession, setSelectedSession] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedExam, setSelectedExam] = useState("");

  const [grades, setGrades] = useState([]);
  const [examSchedule, setExamSchedule] = useState(null);

  // Bulk entry
  const [showBulkEntry, setShowBulkEntry] = useState(false);
  const [bulkEntryText, setBulkEntryText] = useState("");

  // Load initial data
  useEffect(() => {
    if (!isOpen) return;

    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Get sessions
        const sessionsResponse = await axios.get("/backend/api/grading/sessions",{
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        });
        console.log(sessionsResponse.data)
        setSessions(sessionsResponse.data);

        // Set current session as default
        const currentSession = sessionsResponse.data.find(
          (session) => session.is_current
        );
        if (currentSession) {
          setSelectedSession(currentSession.id);
        } else if (sessionsResponse.data.length > 0) {
          setSelectedSession(sessionsResponse.data[0].id);
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load initial data");
        setLoading(false);
        console.error(err);
      }
    };

    fetchInitialData();
  }, [isOpen]);

  // Load classes when session changes
  useEffect(() => {
    if (!selectedSession) return;

    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/backend/api/grading/classes?academic_session_id=${selectedSession}`,{
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          }
        );
        setClasses(response.data);
        console.log(response.data)
        setSelectedClass("");
        setLoading(false);
      } catch (err) {
        setError("Failed to load classes");
        setLoading(false);
        console.error(err);
      }
    };

    // Get exams for this session
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/backend/api/examgrading?academic_session_id=${selectedSession}`,{
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          }
        );
        setExams(response.data);
        console.log(response.data)
        setSelectedExam("");
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

  // Load subjects when class changes
  useEffect(() => {
    if (!selectedClass) return;

    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/backend/api/grading/subjects/${selectedClass}`,{
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          }
        );

        setSubjects(response.data);
        console.log(response.data)
        setSelectedSubject("");
        setLoading(false);
      } catch (err) {
        setError("Failed to load subjects");
        setLoading(false);
        console.error(err);
      }
    };

    // Get students for this class
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/backend/api/grading/students/${selectedClass}`,{
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          }
        );
        setStudents(response.data);
         console.log(response.data)
        // Initialize grades array with all students having null marks
        const initialGrades = response.data.map((student) => ({
          student_id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          admission_number: student.admission_number,
          marks_obtained: null,
          is_absent: false,
        }));

        setGrades(initialGrades);

        setLoading(false);
      } catch (err) {
        setError("Failed to load students");
        setLoading(false);
        console.error(err);
      }
    };

    fetchSubjects();
    fetchStudents();
  }, [selectedClass]);

  // Find or create exam schedule
  useEffect(() => {
    if (!selectedExam || !selectedClass || !selectedSubject) return;

    const checkExamSchedule = async () => {
      try {
        setLoading(true);

        // Check if a schedule already exists
        const schedulesResponse = await axios.get(
          `/backend/api/examgrading/${selectedExam}/schedules`,{
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          }
        );

        // Find schedule for selected class and subject
        const schedule = schedulesResponse.data.find(
          (s) =>
            s.class_id.toString() === selectedClass.toString() &&
            s.subject_id.toString() === selectedSubject.toString()
        );

        if (schedule) {
          setExamSchedule(schedule);

          // Load existing grades for this schedule
          const gradesResponse = await axios.get(
            `/backend/api/examgrading/schedules/${schedule.id}/results`,{
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              }
            }
          );

          // Create a map of student ID to grade result
          const gradeMap = {};
          gradesResponse.data.forEach((grade) => {
            gradeMap[grade.student_id] = grade;
          });

          // Update grades with existing data
          setGrades((prevGrades) =>
            prevGrades.map((grade) => {
              const existingGrade = gradeMap[grade.student_id];
              return existingGrade
                ? {
                    ...grade,
                    marks_obtained: existingGrade.marks_obtained,
                    is_absent: existingGrade.is_absent,
                  }
                : grade;
            })
          );
        } else {
          setExamSchedule(null);
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to check exam schedule");
        setLoading(false);
        console.error(err);
      }
    };

    checkExamSchedule();
  }, [selectedExam, selectedClass, selectedSubject]);

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

  // Process bulk entry
  const processBulkEntry = () => {
    if (!bulkEntryText.trim()) {
      setError("Please enter data for bulk entry");
      return;
    }

    try {
      // Parse bulk entry text (expecting format: "admission_number,marks")
      const lines = bulkEntryText.trim().split("\n");
      const marksMap = {};

      lines.forEach((line) => {
        const [admNumber, marks] = line.split(",").map((s) => s.trim());
        if (admNumber && marks) {
          marksMap[admNumber] = parseFloat(marks);
        }
      });

      // Update grades using the parsed data
      setGrades((prevGrades) =>
        prevGrades.map((grade) => {
          const marks = marksMap[grade.admission_number];
          return marks !== undefined
            ? {
                ...grade,
                marks_obtained: marks,
                is_absent: false,
              }
            : grade;
        })
      );

      setShowBulkEntry(false);
      setBulkEntryText("");
      setSuccess("Bulk grades processed. Review and save to confirm.");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError("Failed to process bulk entry. Check the format.");
      console.error(err);
    }
  };

  // Create exam schedule if needed and save grades
const handleSubmit = async () => {
  if (!selectedExam || !selectedClass || !selectedSubject) {
    setError("Please select exam, class, and subject");
    return;
  }

  try {
    setLoading(true);
    let scheduleId;

    // Create schedule if one doesn't exist
    if (!examSchedule) {
      const scheduleResponse = await axios.post(
        `/backend/api/examgrading/${selectedExam}/schedules`,
        {
          subject_id: selectedSubject,
          class_id: selectedClass,
          exam_date: new Date().toISOString().split("T")[0], // Today's date
          start_time: "08:00:00",
          end_time: "10:00:00",
          venue: "Classroom",
          total_marks: 100,
          passing_marks: 40,
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }
      );

      scheduleId = scheduleResponse.data.id;
    } else {
      scheduleId = examSchedule.id;
    }

    // Format data for API
    const gradesToSave = grades.map(
      ({ student_id, marks_obtained, is_absent }) => ({
        student_id,
        marks_obtained,
        is_absent,
      })
    );

    // Save grades - FIXED: Added proper headers and removed incorrect method parameter
    await axios.post(
      `/backend/api/examgrading/schedules/${scheduleId}/results`, 
      {
        results: gradesToSave,
      },
      {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      }
    );

    setSuccess("Grades saved successfully");

    // Call parent onSave if provided
    if (onSave) {
      onSave({
        exam_id: selectedExam,
        class_id: selectedClass,
        subject_id: selectedSubject,
        schedule_id: scheduleId,
        grades: gradesToSave,
      });
    }

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess(null);
      onClose();
    }, 3000);

    setLoading(false);
  } catch (err) {
    setError(
      "Failed to save grades: " + (err.response?.data?.msg || err.message)
    );
    setLoading(false);
    console.error(err);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="bg-black opacity-50 w-full h-full absolute"></div>
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Add Exam Grades</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {loading && <LoadingSpinner />}

          {/* Alerts */}
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center space-x-2 mb-4">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center space-x-2 mb-4">
              <CheckCircle className="h-5 w-5" />
              <span>{success}</span>
            </div>
          )}

          {/* Selection Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3"
                disabled={loading || !selectedClass}
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
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
          </div>

          {/* Bulk Entry Toggle */}
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowBulkEntry(!showBulkEntry)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              {showBulkEntry ? "Hide Bulk Entry" : "Bulk Entry"}
            </button>
          </div>

          {/* Bulk Entry Form */}
          {showBulkEntry && (
            <div className="mb-6 p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Bulk Grade Entry</h3>
              <p className="text-sm text-gray-600 mb-2">
                Enter grades in format: "Admission Number,Marks". One entry per
                line.
                <br />
                Example: <code>ADM001,85</code>
              </p>
              <textarea
                value={bulkEntryText}
                onChange={(e) => setBulkEntryText(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3 h-32 font-mono text-sm"
                placeholder="ADM001,85&#10;ADM002,76&#10;ADM003,92"
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={processBulkEntry}
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Process Bulk Entry
                </button>
              </div>
            </div>
          )}

          {/* Grades Form */}
          {grades.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Student Grades</h3>
              <div className="overflow-y-auto max-h-96 border rounded-lg">
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
                        Marks (out of 100)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Absent
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {grades.map((grade) => (
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
                            max="100"
                            value={grade.marks_obtained || ""}
                            onChange={(e) =>
                              handleGradeChange(
                                grade.student_id,
                                "marks_obtained",
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : null
                              )
                            }
                            disabled={grade.is_absent || loading}
                            className="border border-gray-300 rounded-md p-1 w-16 text-center disabled:bg-gray-100"
                          />
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
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              !selectedExam ||
              !selectedClass ||
              !selectedSubject ||
              grades.length === 0
            }
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Save className="h-5 w-5 mr-2" />
            Save Grades
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGradesModal;
