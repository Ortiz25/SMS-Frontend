import React, { useState, useEffect } from "react";
import {
  Building,
  Users,
  BookOpen,
  Calendar,
  Plus,
  Edit,
  Trash,
  Clock,
  Home,
  Save,
  School,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

// API base URL
const BASE_URL = "/backend/api";

const SchoolStructureTab = () => {
  // Active tab state
  const [activeTab, setActiveTab] = useState("departments");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Token from localStorage
  const token = localStorage.getItem("token");
  if (user.role !== "admin") {
    return null;
  }
  return (
    <div className="p-2 sm:p-4">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
        School Structure Settings
      </h2>

      {/* Tab Navigation - Scrollable on mobile */}
      <div className="border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto">
        <ul className="flex flex-nowrap min-w-full -mb-px">
          <li className="mr-1 sm:mr-2">
            <button
              className={`inline-flex items-center py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap ${
                activeTab === "departments"
                  ? "text-blue-600 border-blue-600"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("departments")}
            >
              <Building className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Departments
            </button>
          </li>
          <li className="mr-1 sm:mr-2">
            <button
              className={`inline-flex items-center py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap ${
                activeTab === "classes"
                  ? "text-blue-600 border-blue-600"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("classes")}
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Classes & Streams
            </button>
          </li>
          <li className="mr-1 sm:mr-2">
            <button
              className={`inline-flex items-center py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap ${
                activeTab === "rooms"
                  ? "text-blue-600 border-blue-600"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("rooms")}
            >
              <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Rooms & Facilities
            </button>
          </li>
        </ul>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "departments" && <DepartmentTab />}
        {activeTab === "classes" && <ClassesTab />}
        {activeTab === "rooms" && <RoomsTab />}
      </div>
    </div>
  );
};

// Department Tab Component
const DepartmentTab = () => {
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    head_teacher_id: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Token from localStorage
  const token = localStorage.getItem("token");

  // Common headers for API requests
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Fetch departments and teachers on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [deptResponse, teachersResponse] = await Promise.all([
          axios.get(`${BASE_URL}/inventory/departments`, { headers }),
          axios.get(`${BASE_URL}/teachers`, { headers }),
        ]);

        if (deptResponse.status === 200) setDepartments(deptResponse.data);
        if (teachersResponse.status === 200)
          setTeachers(teachersResponse.data.data);
      } catch (error) {
        if (error.response) {
          toast.error(
            `Error: ${error.response.status} - ${error.response.data.message}`
          );
        } else {
          toast.error("Network error: Failed to fetch data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let response;
      if (editingDepartment) {
        response = await axios.put(
          `${BASE_URL}/school-structure/departments/${editingDepartment.id}`,
          formData,
          { headers }
        );
      } else {
        response = await axios.post(`${BASE_URL}/school-structure/departments`, formData, {
          headers,
        });
      }

      if (response.data.success) {
        toast.success(
          editingDepartment
            ? "Department updated successfully"
            : "Department created successfully"
        );
        setDepartments(
          editingDepartment
            ? departments.map((dept) =>
                dept.id === editingDepartment.id ? response.data.data : dept
              )
            : [...departments, response.data.data]
        );
      }

      // Reset form
      setShowForm(false);
      setEditingDepartment(null);
      setFormData({ name: "", description: "", head_teacher_id: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save department");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || "",
      head_teacher_id: department.head_teacher_id
        ? department.head_teacher_id.toString()
        : "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) {
      return;
    }

    try {
      const response = await axios.delete(`${BASE_URL}/school-structure/departments/${id}`, {
        headers,
      });

      if (response.data.success) {
        toast.success("Department deleted successfully");
        setDepartments(departments.filter((dept) => dept.id !== id));
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete department"
      );
    }
  };

  const getTeacherName = (id) => {
    if (!id) return "Not Assigned";
    const teacher = teachers.find((t) => t.id === parseInt(id));
    return teacher ? teacher.name : "Unknown";
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="bg-purple-100 text-purple-700 p-2 rounded-lg">
            🏛️
          </span>{" "}
          Department Configuration
        </h3>
        <button
          className={`px-4 py-2.5 rounded-lg font-medium ${
            showForm
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-purple-600 text-white hover:bg-purple-700"
          } shadow-sm hover:shadow-md transition duration-200 flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto`}
          onClick={() => {
            setEditingDepartment(null);
            setFormData({
              name: "",
              description: "",
              head_teacher_id: "",
            });
            setShowForm(!showForm);
          }}
        >
          {showForm ? (
            "Cancel"
          ) : (
            <>
              <Plus size={16} /> Add Department
            </>
          )}
        </button>
      </div>

      {/* Department Form */}
      {showForm && (
        <div className="bg-purple-50 p-5 mb-8 rounded-xl border border-purple-200 shadow-sm animate-fadeIn">
          <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
            <span className="bg-purple-200 p-1.5 rounded-md text-purple-700">
              {editingDepartment ? <Edit size={16} /> : <Plus size={16} />}
            </span>
            {editingDepartment ? "Edit Department" : "Add New Department"}
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1 text-gray-700"
                  htmlFor="name"
                >
                  Department Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition duration-150"
                  placeholder="e.g., Mathematics, Science, Arts"
                  required
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1 text-gray-700"
                  htmlFor="head_teacher_id"
                >
                  Department Head
                </label>
                <select
                  id="head_teacher_id"
                  name="head_teacher_id"
                  value={formData.head_teacher_id}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition duration-150"
                >
                  <option value="">Select Department Head</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id.toString()}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label
                  className="block text-sm font-medium mb-1 text-gray-700"
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition duration-150"
                  rows="3"
                  placeholder="Brief description of the department's focus and responsibilities"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition duration-200 ${
                  submitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : editingDepartment
                  ? "Update Department"
                  : "Save Department"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Departments Table */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-purple-100 text-purple-700 p-1.5 rounded-md">
            📋
          </span>{" "}
          Departments
        </h4>

        {loading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-t-transparent border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* Desktop and tablet view */}
            <div className="hidden sm:block overflow-hidden rounded-xl border border-purple-200 shadow-sm">
              <table className="w-full bg-white">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="py-3.5 px-5 text-left text-sm font-semibold text-purple-800 border-b border-purple-100">
                      Department Name
                    </th>
                    <th className="py-3.5 px-5 text-left text-sm font-semibold text-purple-800 border-b border-purple-100">
                      Department Head
                    </th>
                    <th className="py-3.5 px-5 text-left text-sm font-semibold text-purple-800 border-b border-purple-100">
                      Description
                    </th>
                    <th className="py-3.5 px-5 text-center text-sm font-semibold text-purple-800 border-b border-purple-100 w-40">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {departments.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-8 px-5 text-center text-gray-500 italic bg-white"
                      >
                        No departments found. Add your first department to get
                        started.
                      </td>
                    </tr>
                  ) : (
                    departments.map((department) => (
                      <tr
                        key={department.id}
                        className="hover:bg-purple-50 transition duration-150"
                      >
                        <td className="py-4 px-5 font-medium text-gray-800">
                          {department.name}
                        </td>
                        <td className="py-4 px-5 text-gray-700">
                          {getTeacherName(department.head_teacher_id) ? (
                            <div className="flex items-center gap-2">
                              <span className="bg-blue-100 text-blue-700 p-1 rounded-full">
                                👤
                              </span>
                              {getTeacherName(department.head_teacher_id)}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">
                              Not assigned
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-gray-600">
                          {department.description || (
                            <span className="text-gray-400 italic">
                              No description
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => handleEdit(department)}
                              className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition"
                              title="Edit department"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(department.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete department"
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile view - Card layout */}
            <div className="sm:hidden space-y-4">
              {departments.length === 0 ? (
                <div className="bg-white border border-purple-200 text-gray-500 rounded-xl p-5 text-center shadow-sm">
                  No departments found. Add your first department to get
                  started.
                </div>
              ) : (
                departments.map((department) => (
                  <div
                    key={department.id}
                    className="bg-white p-5 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800 text-lg">
                          {department.name}
                        </h4>
                        <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                          <span>
                            {getTeacherName(department.head_teacher_id) ? (
                              <span className="flex items-center gap-1">
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 text-xs rounded-full">
                                  Department Head
                                </span>
                                {getTeacherName(department.head_teacher_id)}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic text-xs">
                                No department head assigned
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                        Department
                      </span>
                    </div>

                    {department.description && (
                      <div className="mb-4 border-b border-gray-100 pb-3">
                        <p className="text-sm text-gray-600">
                          {department.description}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleEdit(department)}
                        className="flex items-center gap-1 text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(department.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                      >
                        <Trash size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Rooms Tab Component
const RoomsTab = () => {
  const [rooms, setRooms] = useState([]);
  const [roomCategories, setRoomCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    room_number: "",
    name: "",
    category_id: "",
    capacity: "",
    building: "",
    floor: "",
    is_lab: false,
    is_available: true,
    notes: "",
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
  });

  // Token from localStorage
  const token = localStorage.getItem("token");

  // Common headers for API requests
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [roomsResponse, categoriesResponse] = await Promise.all([
          axios.get(`${BASE_URL}/school-structure/rooms`, { headers }),
          axios.get(`${BASE_URL}/school-structure/room-categories`, {
            headers,
          }),
        ]);

        if (roomsResponse.data.success) {
          setRooms(roomsResponse.data.data);
        }

        if (categoriesResponse.data.success) {
          setRoomCategories(categoriesResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load rooms data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.room_number || !formData.name) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const payload = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
      };

      let response;

      if (editingRoom) {
        // Update existing room
        response = await axios.put(
          `${BASE_URL}/school-structure/rooms/${editingRoom.id}`,
          payload,
          { headers }
        );

        if (response.data.success) {
          toast.success("Room updated successfully");
          // Update the room in the local state
          setRooms(
            rooms.map((room) =>
              room.id === editingRoom.id ? response.data.data : room
            )
          );
        }
      } else {
        // Create new room
        response = await axios.post(
          `${BASE_URL}/school-structure/rooms`,
          payload,
          { headers }
        );

        if (response.data.success) {
          toast.success("Room created successfully");
          setRooms([...rooms, response.data.data]);
        }
      }

      // Reset form and state
      setShowForm(false);
      setEditingRoom(null);
      setFormData({
        room_number: "",
        name: "",
        category_id: "",
        capacity: "",
        building: "",
        floor: "",
        is_lab: false,
        is_available: true,
        notes: "",
      });
    } catch (error) {
      console.error("Error saving room:", error);
      toast.error(error.response?.data?.message || "Failed to save room");
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!categoryFormData.name) {
      toast.error("Category name is required");
      return;
    }

    try {
      let response;

      if (editingCategory) {
        // Update existing category
        response = await axios.put(
          `${BASE_URL}/school-structure/room-categories/${editingCategory.id}`,
          categoryFormData,
          { headers }
        );

        if (response.data.success) {
          toast.success("Category updated successfully");
          // Update the category in the local state
          setRoomCategories(
            roomCategories.map((cat) =>
              cat.id === editingCategory.id ? response.data.data : cat
            )
          );
        }
      } else {
        // Create new category
        response = await axios.post(
          `${BASE_URL}/school-structure/room-categories`,
          categoryFormData,
          { headers }
        );

        if (response.data.success) {
          toast.success("Category created successfully");
          setRoomCategories([...roomCategories, response.data.data]);
        }
      }

      // Reset form and state
      setShowCategoryForm(false);
      setEditingCategory(null);
      setCategoryFormData({
        name: "",
        description: "",
      });
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(error.response?.data?.message || "Failed to save category");
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      name: room.name,
      category_id: room.category_id ? room.category_id.toString() : "",
      capacity: room.capacity ? room.capacity.toString() : "",
      building: room.building || "",
      floor: room.floor || "",
      is_lab: room.is_lab || false,
      is_available: room.is_available !== false, // Default to true if undefined
      notes: room.notes || "",
    });
    setShowForm(true);
    setShowCategoryForm(false);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || "",
    });
    setShowCategoryForm(true);
    setShowForm(false);
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) {
      return;
    }

    try {
      const response = await axios.delete(`${BASE_URL}/rooms/${id}`, {
        headers,
      });

      if (response.data.success) {
        toast.success("Room deleted successfully");
        setRooms(rooms.filter((room) => room.id !== id));
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error(error.response?.data?.message || "Failed to delete room");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this category? This may affect rooms assigned to this category."
      )
    ) {
      return;
    }

    try {
      const response = await axios.delete(
        `${BASE_URL}/school-structure/room-categories/${id}`,
        { headers }
      );

      if (response.data.success) {
        toast.success("Category deleted successfully");
        setRoomCategories(roomCategories.filter((cat) => cat.id !== id));
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  const getCategoryName = (id) => {
    if (!id) return "Uncategorized";
    const category = roomCategories.find((cat) => cat.id === parseInt(id));
    return category ? category.name : "Unknown";
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-700 p-2 rounded-lg">
            🏢
          </span>{" "}
          Room & Facility Management
        </h3>
        <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
          <button
            className={`px-4 py-2.5 rounded-lg font-medium ${
              showCategoryForm
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            } shadow-sm hover:shadow-md transition duration-200 flex items-center justify-center gap-2`}
            onClick={() => {
              setEditingCategory(null);
              setCategoryFormData({
                name: "",
                description: "",
              });
              setShowCategoryForm(!showCategoryForm);
              setShowForm(false);
            }}
          >
            {showCategoryForm ? (
              "Cancel"
            ) : (
              <>
                <Plus size={16} /> Add Category
              </>
            )}
          </button>
          <button
            className={`px-4 py-2.5 rounded-lg font-medium ${
              showForm
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            } shadow-sm hover:shadow-md transition duration-200 flex items-center justify-center gap-2`}
            onClick={() => {
              setEditingRoom(null);
              setFormData({
                room_number: "",
                name: "",
                category_id: "",
                capacity: "",
                building: "",
                floor: "",
                is_lab: false,
                is_available: true,
                notes: "",
              });
              setShowForm(!showForm);
              setShowCategoryForm(false);
            }}
          >
            {showForm ? (
              "Cancel"
            ) : (
              <>
                <Plus size={16} /> Add Room
              </>
            )}
          </button>
        </div>
      </div>

      {/* Category Form */}
      {showCategoryForm && (
        <div className="bg-emerald-50 p-5 mb-6 rounded-xl border border-emerald-200 shadow-sm animate-fadeIn">
          <h4 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center gap-2">
            <span className="bg-emerald-200 p-1.5 rounded-md text-emerald-700">
              {editingCategory ? <Edit size={16} /> : <Plus size={16} />}
            </span>
            {editingCategory ? "Edit Room Category" : "Add New Room Category"}
          </h4>
          <form onSubmit={handleCategorySubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1 text-gray-700"
                  htmlFor="category_name"
                >
                  Category Name *
                </label>
                <input
                  type="text"
                  id="category_name"
                  name="name"
                  value={categoryFormData.name}
                  onChange={handleCategoryInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition duration-150"
                  placeholder="e.g., Classroom, Laboratory, Office"
                  required
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1 text-gray-700"
                  htmlFor="category_description"
                >
                  Description
                </label>
                <input
                  type="text"
                  id="category_description"
                  name="description"
                  value={categoryFormData.description}
                  onChange={handleCategoryInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition duration-150"
                  placeholder="Brief description of this category"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition duration-200"
              >
                {editingCategory ? "Update Category" : "Save Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Room Form */}
      {showForm && (
        <div className="bg-indigo-50 p-5 mb-6 rounded-xl border border-indigo-200 shadow-sm animate-fadeIn">
          <h4 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
            <span className="bg-indigo-200 p-1.5 rounded-md text-indigo-700">
              {editingRoom ? <Edit size={16} /> : <Plus size={16} />}
            </span>
            {editingRoom ? "Edit Room" : "Add New Room"}
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1 text-gray-700"
                  htmlFor="room_number"
                >
                  Room Number *
                </label>
                <input
                  type="text"
                  id="room_number"
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition duration-150"
                  placeholder="e.g., R101, LAB1"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1 text-gray-700"
                  htmlFor="name"
                >
                  Room Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition duration-150"
                  placeholder="e.g., Main Hall, Physics Lab"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1 text-gray-700"
                  htmlFor="category_id"
                >
                  Room Category
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition duration-150"
                >
                  <option value="">Select Room Category</option>
                  {roomCategories.map((category) => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1 text-gray-700"
                  htmlFor="capacity"
                >
                  Capacity
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition duration-150"
                  placeholder="Maximum number of people"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1 text-gray-700"
                  htmlFor="building"
                >
                  Building
                </label>
                <input
                  type="text"
                  id="building"
                  name="building"
                  value={formData.building}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition duration-150"
                  placeholder="e.g., Main Block, Science Block"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1 text-gray-700"
                  htmlFor="floor"
                >
                  Floor
                </label>
                <input
                  type="text"
                  id="floor"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition duration-150"
                  placeholder="e.g., Ground, First, 2nd"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_lab"
                  name="is_lab"
                  checked={formData.is_lab}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-400"
                />
                <label className="ml-2 text-sm text-gray-700" htmlFor="is_lab">
                  This is a laboratory
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_available"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-400"
                />
                <label
                  className="ml-2 text-sm text-gray-700"
                  htmlFor="is_available"
                >
                  Room is available for use
                </label>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label
                  className="block text-sm font-medium mb-1 text-gray-700"
                  htmlFor="notes"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition duration-150"
                  rows="2"
                  placeholder="Additional information about this room"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition duration-200"
              >
                {editingRoom ? "Update Room" : "Save Room"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Room Categories Section */}
      <div className="mb-10">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-700 p-1.5 rounded-md">
            📂
          </span>{" "}
          Room Categories
        </h4>
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-t-transparent border-emerald-600"></div>
          </div>
        ) : (
          <>
            {/* Desktop/Tablet View for Categories */}
            <div className="hidden sm:block overflow-hidden rounded-xl border border-emerald-200 shadow-sm">
              <table className="w-full bg-white">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="py-3.5 px-5 text-left text-sm font-semibold text-emerald-800 border-b border-emerald-100">
                      Category Name
                    </th>
                    <th className="py-3.5 px-5 text-left text-sm font-semibold text-emerald-800 border-b border-emerald-100">
                      Description
                    </th>
                    <th className="py-3.5 px-5 text-center text-sm font-semibold text-emerald-800 border-b border-emerald-100 w-40">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {roomCategories.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="py-8 px-5 text-center text-gray-500 italic bg-white"
                      >
                        No room categories found. Add your first category to get
                        started.
                      </td>
                    </tr>
                  ) : (
                    roomCategories.map((category) => (
                      <tr
                        key={category.id}
                        className="hover:bg-emerald-50 transition duration-150"
                      >
                        <td className="py-4 px-5 font-medium text-gray-800">
                          {category.name}
                        </td>
                        <td className="py-4 px-5 text-gray-600">
                          {category.description || "No description"}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition"
                              title="Edit category"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete category"
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View for Categories */}
            <div className="sm:hidden space-y-4">
              {roomCategories.length === 0 ? (
                <div className="bg-white border border-emerald-200 text-gray-500 rounded-xl p-5 text-center shadow-sm">
                  No room categories found. Add your first category to get
                  started.
                </div>
              ) : (
                roomCategories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition duration-200"
                  >
                    <div className="font-semibold text-gray-800 mb-2 flex justify-between items-center">
                      <span>{category.name}</span>
                      <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">
                        Category
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 border-b border-gray-100 pb-3">
                      {category.description || "No description"}
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                      >
                        <Trash size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Rooms Table */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-md">
            🚪
          </span>{" "}
          Rooms & Facilities
        </h4>
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-t-transparent border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Desktop/Tablet View for Rooms */}
            <div className="hidden sm:block overflow-hidden rounded-xl border border-indigo-200 shadow-sm">
              <table className="w-full bg-white">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="py-3.5 px-4 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-100">
                      Room Number
                    </th>
                    <th className="py-3.5 px-4 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-100">
                      Name
                    </th>
                    <th className="py-3.5 px-4 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-100">
                      Category
                    </th>
                    <th className="py-3.5 px-4 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-100">
                      Building
                    </th>
                    <th className="py-3.5 px-4 text-center text-sm font-semibold text-indigo-800 border-b border-indigo-100">
                      Capacity
                    </th>
                    <th className="py-3.5 px-4 text-center text-sm font-semibold text-indigo-800 border-b border-indigo-100">
                      Lab
                    </th>
                    <th className="py-3.5 px-4 text-center text-sm font-semibold text-indigo-800 border-b border-indigo-100">
                      Available
                    </th>
                    <th className="py-3.5 px-4 text-center text-sm font-semibold text-indigo-800 border-b border-indigo-100 w-40">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100">
                  {rooms.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="py-8 px-5 text-center text-gray-500 italic bg-white"
                      >
                        No rooms found. Add your first room to get started.
                      </td>
                    </tr>
                  ) : (
                    rooms.map((room) => (
                      <tr
                        key={room.id}
                        className="hover:bg-indigo-50 transition duration-150"
                      >
                        <td className="py-4 px-4 font-medium text-gray-800">
                          {room.room_number}
                        </td>
                        <td className="py-4 px-4 text-gray-700">{room.name}</td>
                        <td className="py-4 px-4">
                          <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 text-xs rounded-full">
                            {getCategoryName(room.category_id)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {room.building || "N/A"}
                        </td>
                        <td className="py-4 px-4 text-center text-gray-600">
                          {room.capacity || "Not set"}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {room.is_lab ? (
                            <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs">
                              No
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {room.is_available !== false ? (
                            <span className="inline-flex items-center justify-center bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                              Unavailable
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => handleEditRoom(room)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                              title="Edit room"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteRoom(room.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete room"
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View for Rooms */}
            <div className="sm:hidden space-y-4">
              {rooms.length === 0 ? (
                <div className="bg-white border border-indigo-200 text-gray-500 rounded-xl p-5 text-center shadow-sm">
                  No rooms found. Add your first room to get started.
                </div>
              ) : (
                rooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm hover:shadow-md transition duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                          {room.room_number}
                          {room.is_lab && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 text-xs rounded-full">
                              Lab
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{room.name}</div>
                      </div>
                      {room.is_available !== false ? (
                        <span className="bg-green-100 text-green-700 px-2.5 py-1 text-xs rounded-full">
                          Available
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-2.5 py-1 text-xs rounded-full">
                          Unavailable
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 border-b border-gray-100 pb-3">
                      <div className="text-xs text-gray-500">
                        Category
                        <div className="text-sm font-medium text-gray-700 mt-0.5">
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs rounded-full">
                            {getCategoryName(room.category_id)}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Building
                        <div className="text-sm font-medium text-gray-700 mt-0.5">
                          {room.building || "N/A"}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Capacity
                        <div className="text-sm font-medium text-gray-700 mt-0.5">
                          {room.capacity || "Not set"}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Floor
                        <div className="text-sm font-medium text-gray-700 mt-0.5">
                          {room.floor || "N/A"}
                        </div>
                      </div>
                    </div>

                    {room.notes && (
                      <div className="mb-4 text-sm border-b border-gray-100 pb-3">
                        <span className="text-xs text-gray-500">Notes:</span>
                        <p className="mt-1 text-gray-600">{room.notes}</p>
                      </div>
                    )}

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleEditRoom(room)}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                      >
                        <Trash size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Classes Tab Component
const ClassesTab = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [academicSessions, setAcademicSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    curriculum_type: "CBC",
    level: "",
    stream: "",
    class_teacher_id: "",
    academic_session_id: "",
    capacity: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");

  console.log(teachers)

  // Token from localStorage
  const token = localStorage.getItem("token");

  // Common headers for API requests
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [classesResponse, teachersResponse, sessionsResponse] =
          await Promise.all([
            axios.get(`${BASE_URL}/school-structure/classes`, { headers }),
            axios.get(`${BASE_URL}/teachers`, { headers }),
            axios.get(`${BASE_URL}/sessions/academic-sessions`, { headers }),
          ]);

        if (classesResponse.data.success) {
          setClasses(classesResponse.data.data);
        }

        if (teachersResponse.data.success) {
          console.log(teachersResponse.data.data)
          // Only include active teachers
          setTeachers(
            teachersResponse.data.data
          );
        }
      console.log(teachers)
        if (sessionsResponse.data.success) {
          const sessions = sessionsResponse.data.data;
          setAcademicSessions(sessions);

          // Find current academic session
          const current = sessions.find((session) => session.is_current);
          if (current) {
            setCurrentSession(current);

            // Set current session as default for the form
            setFormData((prev) => ({
              ...prev,
              academic_session_id: current.id.toString(),
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load class data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If level or stream changes, update the name automatically
    if (name === "level" || name === "stream") {
      const updatedLevel = name === "level" ? value : formData.level;
      const updatedStream = name === "stream" ? value : formData.stream;

      if (updatedLevel) {
        let className = updatedLevel;
        if (updatedStream) {
          className += ` ${updatedStream}`;
        }

        setFormData((prev) => ({
          ...prev,
          name: className,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name || !formData.level || !formData.academic_session_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const payload = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
      };

      let response;

      if (editingClass) {
        // Update existing class
        response = await axios.put(
          `${BASE_URL}/school-structure/classes/${editingClass.id}`,
          payload,
          { headers }
        );

        if (response.data.success) {
          toast.success("Class updated successfully");
          // Update the class in the local state
          setClasses(
            classes.map((cls) =>
              cls.id === editingClass.id ? response.data.data : cls
            )
          );
        }
      } else {
        // Create new class
        response = await axios.post(
          `${BASE_URL}/school-structure/classes`,
          payload,
          { headers }
        );

        if (response.data.success) {
          toast.success("Class created successfully");
          setClasses([...classes, response.data.data]);
        }
      }

      // Reset form and state
      setShowForm(false);
      setEditingClass(null);
      setFormData({
        name: "",
        curriculum_type: "CBC",
        level: "",
        stream: "",
        class_teacher_id: "",
        academic_session_id: currentSession ? currentSession.id.toString() : "",
        capacity: "",
      });
    } catch (error) {
      console.error("Error saving class:", error);
      toast.error(error.response?.data?.message || "Failed to save class");
    }
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      curriculum_type: classItem.curriculum_type,
      level: classItem.level,
      stream: classItem.stream || "",
      class_teacher_id: classItem.class_teacher_id
        ? classItem.class_teacher_id.toString()
        : "",
      academic_session_id: classItem.academic_session_id.toString(),
      capacity: classItem.capacity ? classItem.capacity.toString() : "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this class? This will remove all associated data including student enrollments and timetable."
      )
    ) {
      return;
    }

    try {
      const response = await axios.delete(
        `${BASE_URL}/school-structure/classes/${id}`,
        { headers }
      );

      if (response.data.success) {
        toast.success("Class deleted successfully");
        setClasses(classes.filter((cls) => cls.id !== id));
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error(error.response?.data?.message || "Failed to delete class");
    }
  };

  const getTeacherName = (id) => {
    if (!id) return "Not Assigned";
    const teacher = teachers.find((t) => t.id === parseInt(id));
    return teacher ? `${teacher.name}` : "Unknown";
  };

  const getSessionName = (id) => {
    if (!id) return "Unknown";
    const session = academicSessions.find((s) => s.id === parseInt(id));
    return session
      ? `Term ${session.term} ${session.year}${
          session.is_current ? " (Current)" : ""
        }`
      : "Unknown";
  };

  const getCurriculumTypeBadge = (type) => {
    const badgeClass =
      type === "CBC"
        ? "bg-green-100 text-green-800"
        : "bg-blue-100 text-blue-800";
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${badgeClass}`}>
        {type}
      </span>
    );
  };
  const filteredClasses = classes.filter((cls) => {
    return (
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedLevel ? cls.level === selectedLevel : true) &&
      (selectedTeacher
        ? cls.class_teacher_id?.toString() === selectedTeacher
        : true)
    );
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
        <h3 className="text-xl font-semibold">Class & Stream Setup</h3>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 w-full sm:w-auto"
          onClick={() => {
            setEditingClass(null);
            setFormData({
              name: "",
              curriculum_type: "CBC",
              level: "",
              stream: "",
              class_teacher_id: "",
              academic_session_id: currentSession
                ? currentSession.id.toString()
                : "",
              capacity: "",
            });
            setShowForm(!showForm);
          }}
        >
          {showForm ? (
            "Cancel"
          ) : (
            <>
              <Plus size={16} /> Add Class
            </>
          )}
        </button>
      </div>

      {/* Class Form */}
      {showForm && (
        <div className="bg-gray-50 p-4 mb-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-medium mb-4">
            {editingClass
              ? `Edit Class: ${editingClass.name}`
              : "Add New Class"}
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="curriculum_type"
                >
                  Curriculum Type *
                </label>
                <select
                  id="curriculum_type"
                  name="curriculum_type"
                  value={formData.curriculum_type}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="CBC">CBC (Competency Based Curriculum)</option>
                  <option value="844">8-4-4</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="level"
                >
                  Class Level *
                </label>
                <input
                  type="text"
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  placeholder="e.g., Grade 4, Form 1"
                  className="w-full p-2 border rounded-md"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  For CBC: PP1, PP2, Grade 1-6, Junior 1-3, Senior 1-3
                </p>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="stream"
                >
                  Stream
                </label>
                <input
                  type="text"
                  id="stream"
                  name="stream"
                  value={formData.stream}
                  onChange={handleInputChange}
                  placeholder="e.g., A, B, Red, Blue"
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="name"
                >
                  Class Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  The class name is auto-generated from level and stream but can
                  be customized
                </p>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="class_teacher_id"
                >
                  Class Teacher
                </label>
                <select
                  id="class_teacher_id"
                  name="class_teacher_id"
                  value={formData.class_teacher_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Class Teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id.toString()}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="academic_session_id"
                >
                  Academic Session *
                </label>
                <select
                  id="academic_session_id"
                  name="academic_session_id"
                  value={formData.academic_session_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select Academic Session</option>
                  {academicSessions.map((session) => (
                    <option key={session.id} value={session.id.toString()}>
                      Term {session.term} {session.year}{" "}
                      {session.is_current ? "(Current)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="capacity"
                >
                  Capacity
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Maximum number of students"
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md order-2 sm:order-1"
                onClick={() => {
                  setShowForm(false);
                  setEditingClass(null);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md order-1 sm:order-2 mb-2 sm:mb-0"
              >
                {editingClass ? "Update Class" : "Save Class"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Controls */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="filter_session"
          >
            Filter by Academic Session
          </label>
          <select
            id="filter_session"
            name="filter_session"
            className="w-full p-2 border rounded-md"
            onChange={(e) => {
              // Filter logic would go here
            }}
            defaultValue={currentSession ? currentSession.id.toString() : ""}
          >
            <option value="">All Sessions</option>
            {academicSessions.map((session) => (
              <option key={session.id} value={session.id.toString()}>
                Term {session.term} {session.year}{" "}
                {session.is_current ? "(Current)" : ""}
              </option>
            ))}
          </select>
        </div> */}

        {/* <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="filter_curriculum"
          >
            Filter by Curriculum
          </label>
          <select
            id="filter_curriculum"
            name="filter_curriculum"
            className="w-full p-2 border rounded-md"
            onChange={(e) => setSearchTerm(e.target.value)}
            defaultValue=""
          >
            <option value="">All Curriculums</option>
            <option value="CBC">CBC</option>
            <option value="844">8-4-4</option>
          </select>
        </div> */}

        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="search_class"
          >
            Search Classes
          </label>
          <input
            type="text"
            id="search_class"
            name="search_class"
            placeholder="Search by name or level..."
            className="w-full p-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Classes Table */}
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Desktop/Tablet View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left border-b">Class Name</th>
                  <th className="py-3 px-4 text-left border-b">Curriculum</th>
                  <th className="py-3 px-4 text-left border-b">Level</th>
                  <th className="py-3 px-4 text-left border-b">Stream</th>
                  <th className="py-3 px-4 text-left border-b">
                    Class Teacher
                  </th>
                  <th className="py-3 px-4 text-left border-b">
                    Academic Session
                  </th>
                  <th className="py-3 px-4 text-center border-b">Capacity</th>
                  <th className="py-3 px-4 text-center border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-4 px-4 text-center text-gray-500"
                    >
                      No classes found. Add your first class to get started.
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map((classItem, index) => (
                    <tr
                      key={classItem.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="py-3 px-4 border-b">{classItem.name}</td>
                      <td className="py-3 px-4 border-b">
                        {getCurriculumTypeBadge(classItem.curriculum_type)}
                      </td>
                      <td className="py-3 px-4 border-b">{classItem.level}</td>
                      <td className="py-3 px-4 border-b">
                        {classItem.stream || "N/A"}
                      </td>
                      <td className="py-3 px-4 border-b">
                        {getTeacherName(classItem.class_teacher_id)}
                      </td>
                      <td className="py-3 px-4 border-b">
                        {getSessionName(classItem.academic_session_id)}
                      </td>
                      <td className="py-3 px-4 text-center border-b">
                        {classItem.capacity ? (
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                            {classItem.capacity}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(classItem)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit class"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(classItem.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete class"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View - Card Layout */}
          <div className="sm:hidden space-y-4">
            {classes.length === 0 ? (
              <div className="p-4 bg-white border border-gray-200 rounded-lg text-center text-gray-500">
                No classes found. Add your first class to get started.
              </div>
            ) : (
              filteredClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-lg">{classItem.name}</h4>
                      <div className="mt-1">
                        {getCurriculumTypeBadge(classItem.curriculum_type)}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(classItem)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(classItem.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Level:</span>
                      <p>{classItem.level}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Stream:</span>
                      <p>{classItem.stream || "N/A"}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Teacher:</span>
                      <p>{getTeacherName(classItem.class_teacher_id)}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Session:</span>
                      <p>{getSessionName(classItem.academic_session_id)}</p>
                    </div>
                    {classItem.capacity && (
                      <div className="mt-1">
                        <span className="text-gray-500">Capacity:</span>
                        <span className="ml-2 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                          {classItem.capacity} students
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Help/Info Section */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
        <h4 className="font-medium mb-2">Class Naming Guide:</h4>
        <div className="space-y-1 ml-2">
          <p>
            <span className="font-medium">•</span>{" "}
            <span className="font-medium">CBC Classes</span>: PP1, PP2, Grade
            1-6, Junior 1-3, Senior 1-3
          </p>
          <p>
            <span className="font-medium">•</span>{" "}
            <span className="font-medium">8-4-4 Classes</span>: Standard 1-8,
            Form 1-4
          </p>
          <p>
            <span className="font-medium">•</span>{" "}
            <span className="font-medium">Streams</span>: Usually represented as
            letters (A, B, C) or colors/names
          </p>
        </div>
        <p className="mt-2">
          Each class must be associated with an academic session. Classes for
          new academic sessions should be created separately.
        </p>
      </div>
    </div>
  );
};

export default SchoolStructureTab;
