import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Plus, Edit2, Trash2, Filter, X } from "lucide-react";
import { toast } from "react-toastify";
import ConfirmDeleteModal from "../modals/confirmDelete";

const SubjectsTab = () => {
  const token = localStorage.getItem("token");
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal and form states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [formMode, setFormMode] = useState("add"); // "add" or "edit"
  const [currentSubject, setCurrentSubject] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCurriculum, setFilterCurriculum] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    curriculum_type: "CBC",
    department_id: "",
    level: "",
    passing_marks: 50,
  });

  const API_URL = "/backend/api";

  // Available curriculum types and levels
  const curriculumTypes = ["CBC", "844"];
  const educationLevels = [
    "Pre-Primary",
    "Lower Primary",
    "Upper Primary",
    "Junior Secondary",
    "Senior Secondary",
    "Primary",
    "Secondary",
    
  ];

  // Fetch subjects and departments on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [subjectsRes, departmentsRes] = await Promise.all([
          axios.get(`${API_URL}/subjects-settings`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`${API_URL}/subjects-settings/departments`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        setSubjects(subjectsRes.data);
        setDepartments(departmentsRes.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
        toast.error("Failed to load subjects data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      curriculum_type: "CBC",
      department_id: "",
      level: "",
      passing_marks: 50,
    });
  };

  // Open modal for adding a new subject
  const handleAddNew = () => {
    resetForm();
    setFormMode("add");
    setShowModal(true);
  };

  // Open modal for editing an existing subject
  const handleEdit = (subject) => {
    setCurrentSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      curriculum_type: subject.curriculum_type,
      department_id: subject.department_id,
      level: subject.level,
      passing_marks: subject.passing_marks,
    });
    setFormMode("edit");
    setShowModal(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (subject) => {
    setSubjectToDelete(subject);
    setShowDeleteModal(true);
  };

  // Handle form submission for adding or editing a subject
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure numeric values are properly formatted
    const submissionData = {
      ...formData,
      department_id: parseInt(formData.department_id, 10),
      passing_marks: parseFloat(formData.passing_marks)
    };

    try {
      if (formMode === "add") {
        const response = await axios.post(`${API_URL}/subjects-settings`, submissionData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSubjects((prev) => [...prev, response.data]);
        toast.success("Subject added successfully");
      } else {
        const response = await axios.put(
          `${API_URL}/subjects-settings/${currentSubject.id}`,
          submissionData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSubjects((prev) =>
          prev.map((item) =>
            item.id === currentSubject.id ? response.data : item
          )
        );
        toast.success("Subject updated successfully");
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error(err.response?.data?.message || "Failed to save subject");
    }
  };

  // Handle subject deletion
  const handleDelete = async () => {
    if (!subjectToDelete) return;
    
    try {
      await axios.delete(`${API_URL}/subjects-settings/${subjectToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSubjects((prev) => prev.filter((subject) => subject.id !== subjectToDelete.id));
      toast.success("Subject deleted successfully");
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error deleting subject:", err);
      toast.error(err.response?.data?.message || "Failed to delete subject");
      setShowDeleteModal(false);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setFilterCurriculum("");
    setFilterLevel("");
    setFilterDepartment("");
  };

  // Apply filters to the subjects list
  const filteredSubjects = subjects.filter((subject) => {
    return (
      (searchTerm === "" ||
        subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterCurriculum === "" ||
        subject.curriculum_type === filterCurriculum) &&
      (filterLevel === "" || subject.level === filterLevel) &&
      (filterDepartment === "" ||
        subject.department_id.toString() === filterDepartment)
    );
  });

  // Get department name by ID
  const getDepartmentName = (departmentId) => {
    const department = departments.find((dept) => dept.id === departmentId);
    return department ? department.name : "Unknown";
  };

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold">Subjects Management</h2>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search subjects..."
              className="pl-9 pr-4 py-2 border rounded-lg w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            {searchTerm && (
              <X
                className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 cursor-pointer"
                onClick={() => setSearchTerm("")}
              />
            )}
          </div>

          <button
            onClick={handleAddNew}
            className="flex items-center justify-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center mb-3">
          <Filter size={16} className="mr-2 text-gray-600" />
          <h3 className="font-medium">Filters</h3>
          {(filterCurriculum || filterLevel || filterDepartment) && (
            <button
              onClick={resetFilters}
              className="ml-auto text-sm text-blue-600 hover:text-blue-800"
            >
              Reset All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Curriculum Type
            </label>
            <select
              className="w-full p-2 border rounded-md"
              value={filterCurriculum}
              onChange={(e) => setFilterCurriculum(e.target.value)}
            >
              <option value="">All Curriculums</option>
              {curriculumTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Education Level
            </label>
            <select
              className="w-full p-2 border rounded-md"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
            >
              <option value="">All Levels</option>
              {educationLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              className="w-full p-2 border rounded-md"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subjects Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-bold font-medium text-gray-900 uppercase tracking-wider">
                  Subject Name
                </th>
                <th className="px-4 py-3 text-left text-bold font-medium text-gray-900 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-bold font-medium text-gray-900 uppercase tracking-wider">
                  Curriculum
                </th>
                <th className="px-4 py-3 text-left text-bold font-medium text-gray-900 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-4 py-3 text-left text-bold font-medium text-gray-900 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-bold font-medium text-gray-900 uppercase tracking-wider">
                  Passing Marks
                </th>
                <th className="px-4 py-3 text-right text-bold font-medium text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-4 text-center text-sm text-gray-500"
                  >
                    No subjects found
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {subject.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {subject.code}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {subject.curriculum_type}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {subject.level}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {getDepartmentName(subject.department_id)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {subject.passing_marks}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(subject)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Subject Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50" ></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 z-100">
            <h2 className="text-xl font-semibold mb-4">
              {formMode === "add" ? "Add New Subject" : "Edit Subject"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g. Mathematics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Code*
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g. CBC-MATH-UP"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Curriculum Type*
                  </label>
                  <select
                    name="curriculum_type"
                    value={formData.curriculum_type}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Curriculum</option>
                    {curriculumTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department*
                  </label>
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Education Level*
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Level</option>
                    {educationLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passing Marks*
                  </label>
                  <input
                    type="number"
                    name="passing_marks"
                    value={formData.passing_marks}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max="100"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {formMode === "add" ? "Add Subject" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        itemName={subjectToDelete?.name || "this subject"}
        itemType="subject"
      />
    </div>
  );
};

export default SubjectsTab;