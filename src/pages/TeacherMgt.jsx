import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  Search,
  Filter,
  Download,
  MoreVertical,
  BookOpen,
  Briefcase,
} from "lucide-react";
import Navbar from "../components/navbar";
import TeacherProfiles from "../components/teacherProfile";
import WorkloadSchedule from "../components/workSchedule";
import PayrollTable from "../components/payrollTable";
import LeaveManagement from "../components/leaveMgt";
import AddTeacherModal from "../components/modals/addTeacher";
import { useStore } from "../store/store";

const teachers = [
  {
    id: 1,
    name: "John Doe",
    photo: "/path/to/photo.jpg",
    gender: "Male",
    dateOfBirth: "1985-06-15",
    position: "Senior Teacher",
    department: "Mathematics",
    employmentStatus: "Full Time",
    email: "john.doe@school.com",
    phone: "+254 712 345 678",
    address: "Nairobi, Kenya",
    subjects: ["Mathematics", "Physics"],
    qualifications: ["B.Ed Mathematics", "M.Ed Education"],
    yearsOfExperience: 10,
    joinDate: "2020-01-15",
    currentLoad: 24,
    maxLoad: 30,
    schedule: [
      { day: "Monday", classes: ["Form 1A", "Form 2B", "Form 4A"] },
      { day: "Tuesday", classes: ["Form 3A", "Form 4B", "Form 1B"] },
    ],
  },
  {
    id: 2,
    name: "Sarah Wanjiru",
    photo: "/path/to/photo.jpg",
    gender: "Female",
    dateOfBirth: "1990-09-25",
    position: "Assistant Teacher",
    department: "Languages",
    employmentStatus: "Part Time",
    email: "sarah.wanjiru@school.com",
    phone: "+254 713 456 789",
    address: "Mombasa, Kenya",
    subjects: ["English", "Literature", "Kiswahili"],
    qualifications: ["B.Ed English", "Diploma in Linguistics"],
    yearsOfExperience: 5,
    joinDate: "2022-03-10",
    currentLoad: 28,
    maxLoad: 30,
    schedule: [
      { day: "Monday", classes: ["Form 2A", "Form 3B", "Form 4C"] },
      { day: "Wednesday", classes: ["Form 1C", "Form 2B", "Form 3A"] },
    ],
  },
  {
    id: 3,
    name: "Michael Ochieng",
    photo: "/path/to/photo.jpg",
    gender: "Male",
    dateOfBirth: "1980-12-10",
    position: "Head of Science Department",
    department: "Sciences",
    employmentStatus: "Full Time",
    email: "michael.ochieng@school.com",
    phone: "+254 714 567 890",
    address: "Kisumu, Kenya",
    subjects: ["Biology", "Chemistry"],
    qualifications: ["B.Sc Chemistry", "M.Sc Biochemistry"],
    yearsOfExperience: 15,
    joinDate: "2015-06-20",
    currentLoad: 20,
    maxLoad: 30,
    schedule: [
      { day: "Tuesday", classes: ["Form 3C", "Form 4A", "Form 2A"] },
      { day: "Thursday", classes: ["Form 1B", "Form 2C", "Form 4B"] },
    ],
  },
  {
    id: 4,
    name: "Grace Muthoni",
    photo: "/path/to/photo.jpg",
    gender: "Female",
    dateOfBirth: "1992-03-05",
    position: "Class Teacher",
    department: "Humanities",
    employmentStatus: "Full Time",
    email: "grace.muthoni@school.com",
    phone: "+254 715 678 901",
    address: "Nakuru, Kenya",
    subjects: ["History", "Geography", "CRE"],
    qualifications: ["B.Ed Arts", "PGDE"],
    yearsOfExperience: 7,
    joinDate: "2018-09-12",
    currentLoad: 26,
    maxLoad: 30,
    schedule: [
      { day: "Monday", classes: ["Form 1A", "Form 3B", "Form 4C"] },
      { day: "Friday", classes: ["Form 2C", "Form 3A", "Form 4B"] },
    ],
  },
  {
    id: 5,
    name: "Paul Kamau",
    photo: "/path/to/photo.jpg",
    gender: "Male",
    dateOfBirth: "1987-11-20",
    position: "Sports Coordinator",
    department: "Physical Education",
    employmentStatus: "Full Time",
    email: "paul.kamau@school.com",
    phone: "+254 716 789 012",
    address: "Thika, Kenya",
    subjects: ["Physical Education", "Health Education"],
    qualifications: ["B.Ed Physical Education"],
    yearsOfExperience: 9,
    joinDate: "2016-04-25",
    currentLoad: 22,
    maxLoad: 30,
    schedule: [
      { day: "Wednesday", classes: ["Form 2B", "Form 3A", "Form 4C"] },
      { day: "Friday", classes: ["Form 1A", "Form 2C", "Form 3B"] },
    ],
  },
];



const TeacherManagement = () => {
  const { activeModule, updateActiveModule } = useStore();
  const [activeTab, setActiveTab] = useState("profiles");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  useEffect(() => {
    updateActiveModule("teachers");
  }, [activeModule]);

  const handleAddTeacher = (teacherData) => {
    console.log("New teacher data:", teacherData);
    // Add your API call or data handling logic here
    setShowAddModal(false);
  };

  const tabs = [
    { id: "profiles", label: "Teacher Profiles", icon: Users },
    { id: "workload", label: "Workload & Schedule", icon: Clock },
    // { id: "payroll", label: "Payroll", icon: DollarSign },
    { id: "leave", label: "Leave Management", icon: Calendar },
  ];

  return (
    <Navbar>
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Teacher & Staff Management
          </h1>
          <p className="text-gray-600">
            Manage teaching staff, workload, payroll, and leave requests
          </p>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search teachers..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
              >
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <UserPlus className="h-5 w-5" />
                <span>Add Teacher</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
                <Download className="h-5 w-5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              <select className="px-3 py-2 border rounded-lg">
                <option>All Departments</option>
                <option>Sciences</option>
                <option>Languages</option>
                <option>Mathematics</option>
              </select>
              <select className="px-3 py-2 border rounded-lg">
                <option>All Positions</option>
                <option>Teacher</option>
                <option>Head of Department</option>
                <option>Administrator</option>
              </select>
              <select className="px-3 py-2 border rounded-lg">
                <option>Employment Status</option>
                <option>Full Time</option>
                <option>Part Time</option>
                <option>Contract</option>
              </select>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content area - will be replaced with specific tab content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === "profiles" && <TeacherProfiles teachers={teachers} />}
          {activeTab === "workload" && <WorkloadSchedule teachers={teachers} />}
          {/* {activeTab === "payroll" && <PayrollTable />} */}
          {activeTab === "leave" && <LeaveManagement />}
        </div>
        <AddTeacherModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddTeacher}
        />
      </div>
    </Navbar>
  );
};

export default TeacherManagement;
