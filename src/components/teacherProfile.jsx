import React, { useState } from "react";
import {
  Briefcase,
  Users,
  BookOpen,
  Award,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
} from "lucide-react";
import EditTeacherModal, {
  ViewTeacherModal,
  DeleteConfirmationModal,
} from "./modals/teacherProfileModal";

const TeacherProfiles = ({ teachers }) => {
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const handleSave = (updatedTeacher) => {
    console.log("Saving updated teacher:", updatedTeacher);
    // Add your save logic here
    setShowEditModal(false);
    setSelectedTeacher(null);
  };

  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setShowEditModal(true);
  };

  const handleDelete = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDeleteModal(true);
  };

  const handleView = (teacher) => {
    setSelectedTeacher(teacher);
    setShowViewModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">
              Total Teachers
            </h3>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">42</div>
          <p className="text-xs text-green-600">+3 this term</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Departments</h3>
            <Briefcase className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">8</div>
          <p className="text-xs text-gray-600">Active departments</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">
              Subject Coverage
            </h3>
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">98%</div>
          <p className="text-xs text-green-600">All subjects covered</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">
              Average Experience
            </h3>
            <Award className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">7.5 yrs</div>
          <p className="text-xs text-gray-600">Teaching experience</p>
        </div>
      </div>

      {/* Teachers List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subjects
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
              {teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-600">
                          {teacher.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {teacher.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {teacher.position}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {teacher.department}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      {teacher.subjects.map((subject, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      {teacher.employmentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleView(teacher)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Showing 1 to 10 of 42 teachers
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
      {showDeleteModal && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          teacher={selectedTeacher}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={(teacherId) => {
            console.log("Deleting teacher:", teacherId);
            // Add your delete logic here
            setShowDeleteModal(false);
            setSelectedTeacher(null);
          }}
        />
      )}

      {/* Modals */}
      {showEditModal && (
        <EditTeacherModal
          teacher={selectedTeacher}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTeacher(null);
          }}
          onSave={handleSave}
        />
      )}

      {showViewModal && (
        <ViewTeacherModal
          isOpen={showViewModal}
          teacher={selectedTeacher}
          onClose={() => {
            setShowViewModal(false);
            setSelectedTeacher(null);
          }}
        />
      )}

      {showEditModal && (
        <EditTeacherModal
          isOpen={showEditModal}
          teacher={selectedTeacher}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTeacher(null);
          }}
          onSave={(updatedTeacher) => {
            console.log("Saving teacher:", updatedTeacher);
            // Add your save logic here
            setShowEditModal(false);
            setSelectedTeacher(null);
          }}
        />
      )}
    </div>
  );
};

export default TeacherProfiles;
