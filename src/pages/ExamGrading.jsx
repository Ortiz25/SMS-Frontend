import React, { useState } from "react";
import {
  BookOpen,
  FileText,
  BarChart,
  Download,
  Filter,
  Search,
  Plus,
} from "lucide-react";
import { useStore } from "../store/store";
import GradeEntry from "../components/gradeEntry";
import ReportCards from "../components/reportCards";
import Analytics from "../components/analytics";
import { useEffect } from "react";
import Navbar from "../components/navbar";
import ReportPreviewModal from "../components/modals/reportPreview";
import BatchReportGenerator from "../components/batchReportGenerator";
import AddGradesModal from "../components/modals/addGrade";

// Sample student data
const students = [
  {
    id: 1,
    name: "John Doe",
    class: "Form 4A",
    term: "Term 1",
    grades: [
      { subject: "Mathematics", score: 85, grade: "A", remarks: "Excellent" },
      {
        subject: "English",
        score: 78,
        grade: "B+",
        remarks: "Good performance",
      },
    ],
  },
  // Add more students...
];

const ExamGrading = () => {
  const [activeTab, setActiveTab] = useState("grading");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const { updateActiveModule, activeModule } = useStore();
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAddGrades, setShowAddGrades] = useState(false);

  const handleSaveGrades = (gradeData) => {
    console.log("Saving grades:", gradeData);
    // Add your grade saving logic here
    setShowAddGrades(false);
  };

  const handleViewReport = (student) => {
    setSelectedStudent(student);
    setShowReportPreview(true);
  };

  useEffect(() => {
    updateActiveModule("grading");
  }, [activeModule]);

  const tabs = [
    { id: "grading", label: "Grade Entry", icon: BookOpen },
    { id: "reports", label: "Report Cards", icon: FileText },
    { id: "analytics", label: "Analytics", icon: BarChart },
  ];

  return (
    <Navbar>
      <div className="space-y-6  px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Exam Grading
          </h1>
          <p className="text-gray-600">
            Manage exam grades, generate reports, and view analytics
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Exams</h3>
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-gray-600">This term</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Graded</h3>
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-green-600">75% complete</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Pending</h3>
              <FileText className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-yellow-600">Needs grading</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">
                Average Score
              </h3>
              <BarChart className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">72%</div>
            <p className="text-xs text-blue-600">Class average</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">All Classes</option>
              <option value="form1">Form 1</option>
              <option value="form2">Form 2</option>
              <option value="form3">Form 3</option>
              <option value="form4">Form 4</option>
            </select>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">All Subjects</option>
              <option value="mathematics">Mathematics</option>
              <option value="english">English</option>
              <option value="science">Science</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
              <Download className="h-5 w-5" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowAddGrades(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              <span>Add Grades</span>
            </button>
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

        {/* Content based on active tab */}
        {activeTab === "grading" && <GradeEntry />}

        {activeTab === "reports" && (
          <div className="space-y-6">
            {/* Batch Report Generator */}
            <BatchReportGenerator
              classes={[
                { id: "form1", name: "Form 1" },
                { id: "form2", name: "Form 2" },
                { id: "form3", name: "Form 3" },
                { id: "form4", name: "Form 4" },
              ]}
              onGenerate={(results) => {
                console.log("Generated reports:", results);
                // Handle batch generation results
              }}
            />

            {/* Individual Reports List */}
            <div className="bg-white rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                {/* Your existing table headers */}
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.class}</td>
                      <td>
                        <button
                          onClick={() => handleViewReport(student)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === "analytics" && <Analytics />}
        <ReportPreviewModal
          isOpen={showReportPreview}
          onClose={() => {
            setShowReportPreview(false);
            setSelectedStudent(null);
          }}
          studentData={selectedStudent}
        />
        <AddGradesModal
          isOpen={showAddGrades}
          onClose={() => setShowAddGrades(false)}
          onSave={handleSaveGrades}
        />
      </div>
    </Navbar>
  );
};

export default ExamGrading;
