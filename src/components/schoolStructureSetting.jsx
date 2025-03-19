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
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

// API base URL
const BASE_URL = "/backend/api";

const SchoolStructureTab = () => {
  // Active tab state
  const [activeTab, setActiveTab] = useState("departments");

  // Token from localStorage
  const token = localStorage.getItem("token");

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-6">School Structure Settings</h2>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-flex items-center py-2 px-4 text-sm font-medium rounded-t-lg border-b-2 ${
                activeTab === "departments"
                  ? "text-blue-600 border-blue-600"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("departments")}
            >
              <Building className="w-4 h-4 mr-2" />
              Departments
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-flex items-center py-2 px-4 text-sm font-medium rounded-t-lg border-b-2 ${
                activeTab === "classes"
                  ? "text-blue-600 border-blue-600"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("classes")}
            >
              <Users className="w-4 h-4 mr-2" />
              Classes & Streams
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-flex items-center py-2 px-4 text-sm font-medium rounded-t-lg border-b-2 ${
                activeTab === "rooms"
                  ? "text-blue-600 border-blue-600"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("rooms")}
            >
              <Home className="w-4 h-4 mr-2" />
              Rooms & Facilities
            </button>
          </li>
          {/* <li>
            <button 
              className={`inline-flex items-center py-2 px-4 text-sm font-medium rounded-t-lg border-b-2 ${
                activeTab === 'timetable' 
                  ? 'text-blue-600 border-blue-600' 
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('timetable')}
            >
              <Clock className="w-4 h-4 mr-2" />
              Timetable Config
            </button>
          </li> */}
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
          axios.get(`${BASE_URL}/teachers`, { headers })
        ]);
    
        if (deptResponse.status === 200) setDepartments(deptResponse.data);
        if (teachersResponse.status === 200) setTeachers(teachersResponse.data.data);
      } catch (error) {
        if (error.response) {
          toast.error(`Error: ${error.response.status} - ${error.response.data.message}`);
        } else {
          toast.error('Network error: Failed to fetch data');
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
        response = await axios.post(`${BASE_URL}/departments`, formData, {
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
      const response = await axios.delete(`${BASE_URL}/departments/${id}`, {
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
    if (!id) return 'Not Assigned';
    const teacher = teachers.find(t => t.id === parseInt(id));
    return teacher ? teacher.name : 'Unknown';
  };
  

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Department Configuration</h3>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
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
        <div className="bg-gray-50 p-4 mb-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-medium mb-4">
            {editingDepartment ? "Edit Department" : "Add New Department"}
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
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
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="head_teacher_id"
                >
                  Department Head
                </label>
                <select
                  id="head_teacher_id"
                  name="head_teacher_id"
                  value={formData.head_teacher_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Department Head</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id.toString()}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  rows="3"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md ${
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
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left">Department Name</th>
                <th className="py-3 px-4 text-left">Department Head</th>
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {departments.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="py-4 px-4 text-center text-gray-500"
                  >
                    No departments found. Add your first department to get
                    started.
                  </td>
                </tr>
              ) : (
                departments.map((department) => (
                  <tr key={department.id}>
                    <td className="py-3 px-4">{department.name}</td>
                    <td className="py-3 px-4">
                      {getTeacherName(department.head_teacher_id)}
                    </td>
                    <td className="py-3 px-4">
                      {department.description || "No description"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(department)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit department"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(department.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
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
      )}
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Room & Facility Management</h3>
        <div className="flex gap-2">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
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
        <div className="bg-green-50 p-4 mb-6 rounded-lg border border-green-200">
          <h4 className="text-lg font-medium mb-4">
            {editingCategory ? "Edit Room Category" : "Add New Room Category"}
          </h4>
          <form onSubmit={handleCategorySubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
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
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g., Classroom, Laboratory, Office"
                  required
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
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
                  className="w-full p-2 border rounded-md"
                  placeholder="Brief description of this category"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                {editingCategory ? "Update Category" : "Save Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Room Form */}
      {showForm && (
        <div className="bg-gray-50 p-4 mb-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-medium mb-4">
            {editingRoom ? "Edit Room" : "Add New Room"}
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
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
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g., R101, LAB1"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
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
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g., Main Hall, Physics Lab"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="category_id"
                >
                  Room Category
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
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
                  className="w-full p-2 border rounded-md"
                  placeholder="Maximum number of people"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
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
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g., Main Block, Science Block"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
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
                  className="w-full p-2 border rounded-md"
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
                  className="h-4 w-4 text-blue-600"
                />
                <label className="ml-2 text-sm" htmlFor="is_lab">
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
                  className="h-4 w-4 text-blue-600"
                />
                <label className="ml-2 text-sm" htmlFor="is_available">
                  Room is available for use
                </label>
              </div>

              <div className="md:col-span-3">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="notes"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  rows="2"
                  placeholder="Additional information about this room"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                {editingRoom ? "Update Room" : "Save Room"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Room Categories Section */}
      <div className="mb-8">
        <h4 className="text-lg font-medium mb-3">Room Categories</h4>
        {loading ? (
          <div className="flex justify-center my-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left">Category Name</th>
                  <th className="py-3 px-4 text-left">Description</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {roomCategories.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="py-4 px-4 text-center text-gray-500"
                    >
                      No room categories found. Add your first category to get
                      started.
                    </td>
                  </tr>
                ) : (
                  roomCategories.map((category) => (
                    <tr key={category.id}>
                      <td className="py-3 px-4">{category.name}</td>
                      <td className="py-3 px-4">
                        {category.description || "No description"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit category"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
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
        )}
      </div>

      {/* Rooms Table */}
      <div>
        <h4 className="text-lg font-medium mb-3">Rooms & Facilities</h4>
        {loading ? (
          <div className="flex justify-center my-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left">Room Number</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Category</th>
                  <th className="py-3 px-4 text-left">Building</th>
                  <th className="py-3 px-4 text-center">Capacity</th>
                  <th className="py-3 px-4 text-center">Lab</th>
                  <th className="py-3 px-4 text-center">Available</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rooms.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-4 px-4 text-center text-gray-500"
                    >
                      No rooms found. Add your first room to get started.
                    </td>
                  </tr>
                ) : (
                  rooms.map((room) => (
                    <tr key={room.id}>
                      <td className="py-3 px-4">{room.room_number}</td>
                      <td className="py-3 px-4">{room.name}</td>
                      <td className="py-3 px-4">
                        {getCategoryName(room.category_id)}
                      </td>
                      <td className="py-3 px-4">{room.building || "N/A"}</td>
                      <td className="py-3 px-4 text-center">
                        {room.capacity || "Not set"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {room.is_lab ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {room.is_available !== false ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-red-600">No</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditRoom(room)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit room"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
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
          // Only include active teachers
          setTeachers(
            teachersResponse.data.data.filter((t) => t.status === "active")
          );
        }

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
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : "Unknown";
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
  const filteredClasses = classes.filter(cls => {
    return (
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedLevel ? cls.level === selectedLevel : true) &&
      (selectedTeacher ? cls.class_teacher_id?.toString() === selectedTeacher : true)
    );
  });
  

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Class & Stream Setup</h3>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

              <div className="md:col-span-3">
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
                      {teacher.first_name} {teacher.last_name} (
                      {teacher.staff_id})
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
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
                onClick={() => {
                  setShowForm(false);
                  setEditingClass(null);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                {editingClass ? "Update Class" : "Save Class"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Controls */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
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
        </div>

        <div>
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
            onChange={(e) => {
              // Filter logic would go here
            }}
            defaultValue=""
          >
            <option value="">All Curriculums</option>
            <option value="CBC">CBC</option>
            <option value="844">8-4-4</option>
          </select>
        </div>

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
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left border-b">Class Name</th>
                <th className="py-3 px-4 text-left border-b">Curriculum</th>
                <th className="py-3 px-4 text-left border-b">Level</th>
                <th className="py-3 px-4 text-left border-b">Stream</th>
                <th className="py-3 px-4 text-left border-b">Class Teacher</th>
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
      )}

      {/* Help/Info Section */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
        <h4 className="font-medium mb-2">Class Naming Guide:</h4>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>
            <span className="font-medium">CBC Classes</span>: PP1, PP2, Grade
            1-6, Junior 1-3, Senior 1-3
          </li>
          <li>
            <span className="font-medium">8-4-4 Classes</span>: Standard 1-8,
            Form 1-4
          </li>
          <li>
            <span className="font-medium">Streams</span>: Usually represented as
            letters (A, B, C) or colors/names
          </li>
        </ul>
        <p className="mt-2">
          Each class must be associated with an academic session. Classes for
          new academic sessions should be created separately.
        </p>
      </div>
    </div>
  );
};

export default SchoolStructureTab;
