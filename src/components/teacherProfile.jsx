import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Users,
  Award,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import EditTeacherModal, {
  ViewTeacherModal,
  DeleteConfirmationModal,
} from "./modals/teacherProfileModal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { checkTokenAuth } from "../util/helperFunctions";

const TeacherProfiles = ({
  teachers,
  updateTeachers,
  fetchDashboardStats,
  loading,
  error,
  stats,
}) => {
  const token = localStorage.getItem("token");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [paginatedTeachers, setPaginatedTeachers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    const adminRights = userInfo.role === "admin";
    setIsAdmin(adminRights);
    async function validate() {
      const { valid } = await checkTokenAuth();
      if (!valid) navigate("/");
    }
    validate();
  }, []);

  const fetchTeachers = async () => {
    try {
      const apiUrl = `/backend/api/teachers`;
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      // Parse the response data
      const data = await response.json();

      console.log(data);
      updateTeachers(data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [teachers]);

  // Calculate pagination whenever teachers or pagination settings change
  useEffect(() => {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    setPaginatedTeachers(teachers.slice(indexOfFirstRecord, indexOfLastRecord));
  }, [teachers, currentPage, recordsPerPage]);

  // Total pages
  const totalPages = Math.ceil(teachers.length / recordsPerPage);

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

  const handleDeleteTeacher = async (teacherId) => {
    try {
      const response = await fetch(
        `/backend/api/teachers/${teacherId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete teacher");
      }

      console.log("Teacher deleted successfully");
      setShowDeleteModal(false);
      setSelectedTeacher(null);
      // Refresh teacher list (if applicable)
    } catch (error) {
      console.error("Error deleting teacher:", error);
    }
  };

  const handleSave = async (updatedTeacher) => {
    // First, check if updatedTeacher is an object with message/status/timestamp
    if (updatedTeacher && typeof updatedTeacher === "object") {
      // Check if it has message/status/timestamp keys which shouldn't be rendered
      if (
        updatedTeacher.message &&
        updatedTeacher.status &&
        updatedTeacher.timestamp
      ) {
        console.log("API response object received instead of teacher data");
        setShowEditModal(false);
        setSelectedTeacher(null);
        return;
      }
    }

    //console.log("Saving updated teacher:", updatedTeacher);
    try {
      const token = localStorage.getItem("token");
      // Only make API call if not already done in the modal
      if (updatedTeacher && updatedTeacher.id) {
        await axios.put(
          `/backend/api/teachers/${updatedTeacher.id}`,
          updatedTeacher,
          {
            headers: {
              "Content-Type": "application/json", // Changed from multipart/form-data as formData upload happens in modal
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // After successful save, you may want to refresh your teacher list
      fetchTeachers(); // Uncomment if you have a function to refresh the list
    } catch (error) {
      console.error(
        "Error in parent component handling teacher update:",
        error
      );
    }
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

  if (loading) {
    return (
      <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center">
        <CheckCircle className="h-5 w-5 mr-2" />
        Loading stats..
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          Error loading profile: {error}
        </div>
      </div>
    );
  }
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
          <div className="text-2xl font-bold">{stats.teachers.total}</div>
          <p className="text-xs text-green-600">
            +{stats.teachers.newThisTerm} this term
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Departments</h3>
            <Briefcase className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">{stats.departments.total}</div>
          <p className="text-xs text-gray-600">Active departments</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">
              Average Experience
            </h3>
            <Award className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">
            {stats.experience.averageYears} yrs
          </div>
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
              {paginatedTeachers.map((teacher) => (
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
                      {isAdmin ? (
                        <>
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
                        </>
                      ) : (
                        <></>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-3 sm:mb-0">
              <label className="text-sm text-gray-600">Records per page:</label>
              <select
                value={recordsPerPage}
                onChange={handleRecordsPerPageChange}
                className="border rounded-md px-2 cursor-pointer py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-700">
                Showing {paginatedTeachers.length} of {teachers.length} teachers
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`p-1 rounded-md cursor-pointer ${
                  currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
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
                        className={`px-3 py-1 cursor-pointer rounded-md text-sm ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
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
                    return (
                      <span key={page} className="px-2 py-1 text-gray-500">
                        ...
                      </span>
                    );
                  }

                  return null;
                })}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`p-1 rounded-md cursor-pointer ${
                  currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronRight className="h-5 w-5" />
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
          onConfirm={handleDeleteTeacher}
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
          teacherId={selectedTeacher.id}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTeacher(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default TeacherProfiles;
