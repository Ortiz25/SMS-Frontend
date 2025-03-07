import React, { useState } from "react";
import { Edit, Trash2, Eye, FileText, Clock } from "lucide-react";
import EditExamModal from "./modals/editExam";
import DeleteExamModal from "./modals/deleteExam";
import ViewResultsModal from "./modals/viewExam";

const ExamList = ({
  examSchedules,
  classes,
  rooms,
  examTypes,
  onRefresh,
  searchTerm,
}) => {
  const [selectedExam, setSelectedExam] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // Filter exams based on search term
  const filteredExams = examSchedules.filter((exam) => {
    if (!searchTerm) return true;

    const subjectName = exam.subject_name?.toLowerCase() || "";
    const className = exam.class_name?.toLowerCase() || "";
    const venue = exam.venue?.toLowerCase() || "";
    const supervisorName = exam.supervisor_name?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return (
      subjectName.includes(search) ||
      className.includes(search) ||
      venue.includes(search) ||
      supervisorName.includes(search)
    );
  });

  // Function to format date for display
  const formatDate = (dateString) => {
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5); // Take only HH:MM part
  };

  // Get exam status based on date and status field
  const getExamStatus = (exam) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const examDate = new Date(exam.exam_date);
    examDate.setHours(0, 0, 0, 0);

    if (exam.status === "completed") {
      return {
        label: "Completed",
        color: "bg-gray-100 text-gray-700",
      };
    } else if (exam.status === "cancelled") {
      return {
        label: "Cancelled",
        color: "bg-red-100 text-red-700",
      };
    } else if (examDate < today) {
      return {
        label: "Pending Results",
        color: "bg-yellow-100 text-yellow-700",
      };
    } else if (examDate.getTime() === today.getTime()) {
      return {
        label: "Today",
        color: "bg-blue-100 text-blue-700",
      };
    } else {
      return {
        label: "Upcoming",
        color: "bg-green-100 text-green-700",
      };
    }
  };

  // Handle editing an exam
  const handleEditExam = async (updatedExam) => {
    try {
      const token = localStorage.getItem("token");
       console.log(updatedExam)
      const response = await fetch(
        `http://localhost:5000/api/exams/exam-schedules/${updatedExam.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subject_id: updatedExam.subjectId,
            class_id: updatedExam.classId,
            exam_date: updatedExam.examDate,
            start_time: updatedExam.startTime,
            end_time: updatedExam.endTime,
            venue: updatedExam.venue,
            supervisor_id: updatedExam.supervisorId,
            total_marks: updatedExam.totalMarks,
            passing_marks: updatedExam.passingMarks,
            status: updatedExam.status,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update exam schedule");

      setNotification({
        type: "success",
        message: "Exam schedule updated successfully",
      });

      // Close modal and refresh data
      setShowEditModal(false);
      setSelectedExam(null);
      if (onRefresh) onRefresh();

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error updating exam schedule:", error);
      setNotification({
        type: "error",
        message: error.message,
      });
    }
  };

  // Handle deleting an exam
  const handleDeleteExam = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/exams/exam-schedules/${selectedExam.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete exam schedule");

      setNotification({
        type: "success",
        message: "Exam schedule deleted successfully",
      });

      // Close modal and refresh data
      setShowDeleteModal(false);
      setSelectedExam(null);
      if (onRefresh) onRefresh();

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error deleting exam schedule:", error);
      setNotification({
        type: "error",
        message: error.message,
      });
    }
  };

  // Navigate to results entry page
  const handleViewResults = async () => {
    // We'll implement this later if needed
    setShowResultsModal(false);
    setSelectedExam(null);
  };

  // Sort exams by date, with upcoming ones first
  const sortedExams = [...filteredExams].sort((a, b) => {
    return new Date(a.exam_date) - new Date(b.exam_date);
  });
  console.log(sortedExams);
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Notification */}
      {notification && (
        <div
          className={`p-4 ${
            notification.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {notification.message}
        </div>
      )}

      {sortedExams.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supervisor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedExams.map((exam) => {
                const status = getExamStatus(exam);

                return (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {exam.subject_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {exam.examination_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exam.class_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(exam.exam_date)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(exam.start_time)} -{" "}
                        {formatTime(exam.end_time)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exam.venue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exam.supervisor_name || "Not assigned"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-3">
                        {exam.status === "scheduled" && (
                          <button
                            className="text-gray-400 hover:text-blue-600"
                            onClick={() => {
                              setSelectedExam(exam);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {exam.status === "scheduled" && (
                          <button
                            className="text-gray-400 hover:text-red-600"
                            onClick={() => {
                              setSelectedExam(exam);
                              setShowDeleteModal(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}

                        {exam.status === "completed" && (
                          <button
                            className="text-gray-400 hover:text-green-600"
                            onClick={() => {
                              setSelectedExam(exam);
                              setShowResultsModal(true);
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock className="mx-auto h-10 w-10 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No exams found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? "Try adjusting your search terms."
              : "Get started by scheduling an exam."}
          </p>
        </div>
      )}

      {/* Edit Modal */}
      <EditExamModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedExam(null);
        }}
        onSave={handleEditExam}
        examData={selectedExam}
        classes={classes}
        rooms={rooms}
      />

      {/* Delete Modal */}
      <DeleteExamModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedExam(null);
        }}
        onConfirm={handleDeleteExam}
        examData={selectedExam}
      />

      {/* View Results Modal */}
      <ViewResultsModal
        isOpen={showResultsModal}
        onClose={() => {
          setShowResultsModal(false);
          setSelectedExam(null);
        }}
        examData={selectedExam}
      />
    </div>
  );
};

export default ExamList;
