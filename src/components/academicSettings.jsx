import React, { useState } from "react";
import { Calendar, BookOpen, GraduationCap, FileText } from "lucide-react";

// Import tab components
import AcademicSessionsTab from "../components/ui/academicSectionTab";
import ExaminationsTab from "./ui/examinationsTab";
import GradingSystemsTab from "../components/ui/gradingSystemTabs";
import ExamTypesTab from "../components/ui/examTypesTab";



// Main Academic Settings component - integrates all tabs
const AcademicSettings = () => {
  const [activeTab, setActiveTab] = useState("academic-sessions");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if(user.role !== "admin"){return null}

  return (
    <div className="container mx-auto p-2 sm:p-4">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        Academic Settings
      </h1>

      {/* Tabs Navigation - Scrollable on mobile */}
      <div className="border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto">
        <ul className="flex whitespace-nowrap text-xs sm:text-sm font-medium text-center min-w-full">
          <li className="mr-1 sm:mr-2">
            <button
              onClick={() => setActiveTab("academic-sessions")}
              className={`inline-flex items-center gap-1 sm:gap-2 py-2 px-2 sm:p-4 border-b-2 rounded-t-lg ${
                activeTab === "academic-sessions"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
            >
              <Calendar size={14} className="sm:text-base" />
              <span className="hidden xs:inline">Academic Sessions</span>
              <span className="xs:hidden">Sessions</span>
            </button>
          </li>
          <li className="mr-1 sm:mr-2">
            <button
              onClick={() => setActiveTab("examinations")}
              className={`inline-flex items-center gap-1 sm:gap-2 py-2 px-2 sm:p-4 border-b-2 rounded-t-lg ${
                activeTab === "examinations"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
            >
              <BookOpen size={14} className="sm:text-base" />
              <span className="hidden xs:inline">Examinations</span>
              <span className="xs:hidden">Exams</span>
            </button>
          </li>
          <li className="mr-1 sm:mr-2">
            <button
              onClick={() => setActiveTab("grading-systems")}
              className={`inline-flex items-center gap-1 sm:gap-2 py-2 px-2 sm:p-4 border-b-2 rounded-t-lg ${
                activeTab === "grading-systems"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
            >
              <GraduationCap size={14} className="sm:text-base" />
              <span className="hidden xs:inline">Grading Systems</span>
              <span className="xs:hidden">Grading</span>
            </button>
          </li>
          <li className="mr-1 sm:mr-2">
            <button
              onClick={() => setActiveTab("exam-types")}
              className={`inline-flex items-center gap-1 sm:gap-2 py-2 px-2 sm:p-4 border-b-2 rounded-t-lg ${
                activeTab === "exam-types"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
            >
              <FileText size={14} className="sm:text-base" />
              <span className="hidden xs:inline">Exam Types</span>
              <span className="xs:hidden">Types</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Tab Content - Renders the appropriate component based on active tab */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {activeTab === "academic-sessions" && <AcademicSessionsTab />}
        {activeTab === "examinations" && <ExaminationsTab />}
        {activeTab === "grading-systems" && <GradingSystemsTab />}
        {activeTab === "exam-types" && <ExamTypesTab />}
      </div>
    </div>
  );
};

export default AcademicSettings;
