import React, { useState } from "react";
import {
  Search,
  Eye,
  UserPlus,
  Users,
  Calendar,
  Cctv,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Download,
  ChevronDown,
  BookOpen,
  Activity,
  Heart,
  X,
} from "lucide-react";
import Navbar from "../components/navbar";
import AddStudentModal from "../components/modals/addStudent";
import EditStudentModal from "../components/modals/editStudent";
import DeleteStudentModal from "../components/modals/deleteStudent";
import ViewDetailsModal from "../components/modals/studentDetailModal";
import AttendanceEntryModal from "../components/modals/attendanceEntry";
import { useEffect } from "react";
import { useStore } from "../store/store";

// Sample student data
const sampleStudents = [
  {
    id: 1,
    name: "John Kamau",
    admissionNo: "KPS2024001",
    class: "Form 4",
    stream: "A",
    gender: "Male",
    attendance: "95%",
    performance: "A",
    status: "active",
    guardian: {
      name: "Jane Kamau",
      phone: "+254 712 345 678",
      email: "jane.kamau@example.com",
      relationship: "Mother",
    },
  },
  {
    id: 2,
    name: "Sarah Wanjiku",
    admissionNo: "KPS2024002",
    class: "Form 4",
    stream: "B",
    gender: "Female",
    attendance: "92%",
    performance: "A-",
    status: "active",
    guardian: {
      name: "Peter Wanjiku",
      phone: "+254 713 456 789",
      email: "peter.wanjiku@example.com",
      relationship: "Father",
    },
  },
  {
    id: 3,
    name: "Michael Ochieng",
    admissionNo: "KPS2024003",
    class: "Form 3",
    stream: "A",
    gender: "Male",
    attendance: "88%",
    performance: "B+",
    status: "active",
    guardian: {
      name: "Alice Ochieng",
      phone: "+254 714 567 890",
      email: "alice.ochieng@example.com",
      relationship: "Mother",
    },
  },
  {
    id: 4,
    name: "Grace Muthoni",
    admissionNo: "KPS2024004",
    class: "Form 3",
    stream: "C",
    gender: "Female",
    attendance: "90%",
    performance: "B",
    status: "active",
    guardian: {
      name: "James Muthoni",
      phone: "+254 715 678 901",
      email: "james.muthoni@example.com",
      relationship: "Father",
    },
  },
  {
    id: 5,
    name: "Rhoda Muthoni",
    admissionNo: "KPS2024004",
    class: "Form 3",
    stream: "C",
    gender: "Female",
    attendance: "90%",
    performance: "B",
    status: "suspended",
    guardian: {
      name: "James Muthoni",
      phone: "+254 715 678 901",
      email: "james.muthoni@example.com",
      relationship: "Father",
    },
  },
];

const StudentManagement = () => {
  const { activeModule, updateActiveModule } = useStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [filteredData, setFilteredData] = useState(sampleStudents);
  const [formValidation, setFormValidation] = useState({
    personal: false,
    academic: false,
    medical: false,
  });

  const [formData, setFormData] = useState({
    fullName: "",
    admissionNo: "",
    class: "",
    stream: "",
    dateOfBirth: "",
    gender: "",
    medicalInfo: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    guardianRelation: "",
    address: "",
  });

  const handleValidationChange = (section, isValid) => {
    setFormValidation((prev) => ({
      ...prev,
      [section]: isValid,
    }));
  };

  const handleClose = () => {
    setShowEditModal(false);
    setSelectedStudent(null);
    setFormValidation({
      personal: false,
      academic: false,
      medical: false,
    });
  };

  const handleSave = (formData) => {
    // Check if all sections are valid
    const isAllValid = Object.values(formValidation).every((valid) => valid);
    if (isAllValid) {
      console.log("Saving form data:", formData);
      // Add your save logic here
      handleClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add form submission logic here
    setShowAddModal(false);
  };

  // Tabs data
  const tabs = [
    { id: "all", label: "All Students" },
    { id: "active", label: "Active" },
    { id: "alumni", label: "Alumni" },
    { id: "suspended", label: "Suspended" },
  ];

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleDelete = (student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  useEffect(() => {
    updateActiveModule("students");
    if (activeTab === "all") {
      setFilteredData(sampleStudents);
    } else {
      setFilteredData(
        sampleStudents.filter((student) => student.status === activeTab)
      );
    }
  }, [activeTab]);

  // Pass this down to your forms
  const handleInputChange = (section, field, value) => {
    // Your input change logic here
  };

  return (
    <Navbar>
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Student Management
          </h1>
          <p className="text-gray-600">
            Manage student information, attendance, and academic records
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Students */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">
                Total Students
              </h3>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-green-600">+15 this term</p>
          </div>

          {/* Attendance Rate */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">
                Attendance Rate
              </h3>
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-green-600">+2% from last term</p>
          </div>

          {/* Average Performance */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">
                Average Performance
              </h3>
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">B+</div>
            <p className="text-xs text-green-600">Improved from B</p>
          </div>

          {/* Medical Cases */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">
                Medical Cases
              </h3>
              <Heart className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-yellow-600">2 need attention</p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search students..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => setShowAddModal(true)}
              >
                <UserPlus className="h-5 w-5" />
                <span>Add Student</span>
              </button>
              <button
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => setShowAttendanceModal(true)}
              >
                <Cctv className="h-5 w-5" />
                <span>Record Attendance</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
                <Download className="h-5 w-5" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Student List Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-500">
                    Student Name
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-500">
                    Admission No.
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-500">
                    Class
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-500">
                    Attendance
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-500">
                    Performance
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredData.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {student.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {student.admissionNo}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {student.class} {student.stream}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {student.attendance}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        {student.performance}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        {student.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setShowDetailsModal(true);
                            setSelectedStudent(student);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            console.log(showEditModal);
                            setShowEditModal(true);
                            setSelectedStudent(student);
                          }}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
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
          <div className="px-4 py-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing 1 to 10 of 1,234 students
              </span>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border rounded text-sm text-gray-600 hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 border rounded text-sm text-gray-600 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Add Student Modal */}
      {showAddModal && (
        <AddStudentModal
          showAddModal={showAddModal}
          setShowAddModal={setShowAddModal}
          handleSubmit={handleSubmit}
          formData={formData}
          handleInputChange={handleInputChange}
        />
      )}

      {showDeleteModal && (
        <DeleteStudentModal
          isOpen={showDeleteModal}
          student={selectedStudent}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedStudent(null);
          }}
          onConfirm={(studentId) => {
            // Handle delete
            console.log("Deleting student:", studentId);
            setShowDeleteModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
      {showEditModal && (
        <EditStudentModal
          isOpen={showEditModal}
          student={selectedStudent}
          handleValidationChange={handleValidationChange}
          onClose={() => {
            setShowEditModal(false);
            setSelectedStudent(null);
          }}
          onSave={(studentId, formData) => {
            // Handle save
            console.log("Saving student:", studentId, formData);
            setShowEditModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
      <ViewDetailsModal
        isOpen={showDetailsModal}
        tads={tabs}
        student={selectedStudent}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedStudent(null);
        }}
      />
       <AttendanceEntryModal
        isOpen={showAttendanceModal}
        student={selectedStudent}
        onClose={() => {
          setShowAttendanceModal(false);
          setSelectedStudent(null);
        }}
      />
    </Navbar>
  );
};

export default StudentManagement;
