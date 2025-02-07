// StudentsTable.jsx
import React, { useState } from "react";
import {
  Search,
  Download,
  Mail,
  Trash,
  ChevronDown,
  ChevronUp,
  Edit,
  Share,
  Filter,
  User,
  Users
} from "lucide-react";
import StudentProfileModal from "./modals/studentsAlumni";


const StudentFilters = ({ onFilterChange, onExport }) => {
  const years = ["2020", "2021", "2022", "2023", "2024"];
  const courses = ["Sciences", "Arts", "Technical", "Commerce"];
  const statuses = ["Active", "Inactive", "Alumni"];

  return (
    <div className="flex flex-wrap gap-4">
      {/* Year Filter */}
      <select
        onChange={(e) => onFilterChange("year", e.target.value)}
        className="rounded-lg border border-gray-300 p-2"
        defaultValue=""
      >
        <option value="">All Years</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      {/* Course Filter */}
      <select
        onChange={(e) => onFilterChange("course", e.target.value)}
        className="rounded-lg border border-gray-300 p-2"
        defaultValue=""
      >
        <option value="">All Courses</option>
        {courses.map((course) => (
          <option key={course} value={course}>
            {course}
          </option>
        ))}
      </select>

      {/* Status Filter */}
      <select
        onChange={(e) => onFilterChange("status", e.target.value)}
        className="rounded-lg border border-gray-300 p-2"
        defaultValue=""
      >
        <option value="">All Statuses</option>
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      {/* Advanced Filters Button */}
      <button
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        onClick={() => {
          /* Implement advanced filters modal */
        }}
      >
        <Filter className="h-4 w-4" />
        More Filters
      </button>

      {/* Export Button */}
      <button
        onClick={onExport}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <Download className="h-4 w-4" />
        Export
      </button>
    </div>
  );
};

const ExpandedStudentView = ({ student }) => {
  return (
    <tr>
      <td colSpan="7" className="px-6 py-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-4">
          {/* Achievements */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Achievements</h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {student.achievements.map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
          </div>

          {/* Volunteer Work */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Volunteer Work</h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {student.volunteerWork.map((work, index) => (
                <li key={index}>{work}</li>
              ))}
            </ul>
          </div>

          {/* Events */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Events Attended</h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {student.events.map((event, index) => (
                <li key={index}>{event}</li>
              ))}
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
            <div className="flex gap-2">
              <button className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                Send Message
              </button>
              <button className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                View Full Profile
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

const StudentsTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    field: "name",
    direction: "asc",
  });
  const [selectedProfile, setSelectedProfile] = useState(null);

  const renderActionButtons = (student) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() =>
          setExpandedStudentId(
            expandedStudentId === student.id ? null : student.id
          )
        }
        className="text-gray-400 hover:text-gray-600"
      >
        {expandedStudentId === student.id ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      <button
        onClick={() => setSelectedProfile(student)}
        className="text-blue-600 hover:text-blue-800"
      >
        <User className="h-4 w-4" />
      </button>
      <button className="text-gray-400 hover:text-gray-600">
        <Share className="h-4 w-4" />
      </button>
    </div>
  );
  

  // Mock data - expanded for better demonstration
  const students = [
    {
      id: 1,
      name: "John Doe",
      admissionNo: "2016-001",
      graduationYear: "2020",
      course: "Sciences",
      status: "Active",
      achievements: ["First Class Honors", "Science Club President"],
      volunteerWork: ["Alumni Mentor"],
      events: ["2023 Homecoming"],
    },
    {
      id: 2,
      name: "Jane Smith",
      admissionNo: "2016-002",
      graduationYear: "2020",
      course: "Arts",
      status: "Active",
      achievements: ["Drama Club Lead", "Best Actress Award"],
      volunteerWork: ["Theater Workshop Conductor"],
      events: ["Annual Play 2023"],
    },
    {
      id: 3,
      name: "Bob Wilson",
      admissionNo: "2016-003",
      graduationYear: "2020",
      course: "Technical",
      status: "Inactive",
      achievements: ["Technical Fair Winner", "Robotics Team Lead"],
      volunteerWork: ["Code Mentor"],
      events: ["Tech Expo 2023"],
    },
  ];

  const handleBulkAction = (action) => {
    console.log(action, selectedStudents);
  };

  const handleSort = (field) => {
    setSortConfig({
      field,
      direction:
        sortConfig.field === field && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(students.map((student) => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Search and Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search students..."
              className="pl-10 w-full rounded-lg border border-gray-300 p-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <StudentFilters onFilterChange={() => {}} onExport={() => {}} />
        </div>

        {/* Bulk Actions */}
        {selectedStudents.length > 0 && (
          <div className="mt-4 p-2 bg-gray-50 rounded-lg flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {selectedStudents.length} selected
            </span>
            <button
              onClick={() => handleBulkAction("email")}
              className="text-sm flex items-center gap-1"
            >
              <Mail className="h-4 w-4" /> Email
            </button>
            <button
              onClick={() => handleBulkAction("export")}
              className="text-sm flex items-center gap-1"
            >
              <Download className="h-4 w-4" /> Export
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="text-sm text-red-600 flex items-center gap-1"
            >
              <Trash className="h-4 w-4" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedStudents.length === students.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Name{" "}
                {sortConfig.field === "name" &&
                  (sortConfig.direction === "asc" ? (
                    <ChevronUp className="inline h-4 w-4" />
                  ) : (
                    <ChevronDown className="inline h-4 w-4" />
                  ))}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Admission No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Graduation Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Course
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
            {students.map((student) => (
              <React.Fragment key={student.id}>
                <tr
                  className={
                    expandedStudentId === student.id ? "bg-gray-50" : ""
                  }
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleSelectStudent(student.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderActionButtons(student)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.admissionNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.graduationYear}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setExpandedStudentId(
                            expandedStudentId === student.id ? null : student.id
                          )
                        }
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedStudentId === student.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      <button className="text-blue-600 hover:text-blue-800">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Share className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedStudentId === student.id && (
                  <ExpandedStudentView student={student} />
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {/* Add the modal */}
      <StudentProfileModal
        student={selectedProfile}
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
      />
    </div>
  );
};

export default StudentsTable;
