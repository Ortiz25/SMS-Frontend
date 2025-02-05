import React from "react";
import ViewExamModal from "./modals/viewExam";
import ExamActions from "./examActions";
import EditExamModal from "./modals/editExam";
import DeleteExamModal from "./modals/deleteExam";
import { useState } from "react";

const ExamList = ({ exams = [] }) => {
  const [selectedExam, setSelectedExam] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSaveEdit = (updatedExam) => {
    // Add your update logic here
    console.log("Saving updated exam:", updatedExam);
    setShowEditModal(false);
    setSelectedExam(null);
  };

  const handleConfirmDelete = (examId) => {
    // Add your delete logic here
    console.log("Deleting exam:", examId);
    setShowDeleteModal(false);
    setSelectedExam(null);
  };

  const handleView = (exam) => {
    setSelectedExam(exam);
    setShowViewModal(true);
  };

  const handleDelete = (exam) => {
    setSelectedExam(exam);
    setShowDeleteModal(true);
  };

  const handleEdit = (exam) => {
    setSelectedExam(exam);
    setShowEditModal(true);
  };
  // Sample data if no exams provided
  const examData =
    exams.length > 0
      ? exams
      : [
          {
            id: 1,
            subject: "Mathematics",
            class: "Form 4",
            date: "2024-03-15",
            time: "9:00 AM",
            duration: "2 hours",
            room: "Hall 1",
            invigilator: "Mr. John Doe",
            status: "upcoming",
          },
          // Add more sample data
        ];

  const getStatusBadge = (status) => {
    const styles = {
      upcoming: "bg-blue-100 text-blue-700",
      ongoing: "bg-green-100 text-green-700",
      completed: "bg-gray-100 text-gray-700",
      cancelled: "bg-red-100 text-red-700",
    };

    return `px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Room
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Invigilator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {examData.map((exam) => (
              <tr key={exam.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {exam.subject}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {exam.class}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {exam.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{exam.time}</div>
                  <div className="text-sm text-gray-500">{exam.duration}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {exam.room}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {exam.invigilator}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(exam.status)}>
                    {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <ExamActions
                    exam={exam}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ViewExamModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedExam(null);
        }}
        exam={selectedExam}
      />
      <EditExamModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedExam(null);
        }}
        exam={selectedExam}
        onSave={handleSaveEdit}
      />

      <DeleteExamModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedExam(null);
        }}
        exam={selectedExam}
        onConfirm={handleConfirmDelete}
      />

      {/* Pagination */}
      <div className="px-6 py-3 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">
            Showing 1 to 10 of 20 exams
          </span>
          <div className="space-x-2">
            <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamList;
