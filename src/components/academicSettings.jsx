import React, { useState } from 'react';
import { Calendar, BookOpen, GraduationCap, FileText } from 'lucide-react';

// Import tab components
import AcademicSessionsTab from '../components/ui/academicSectionTab';
import ExaminationsTab from './ui/examinationsTab';
import GradingSystemsTab from '../components/ui/gradingSystemTabs';
import ExamTypesTab from '../components/ui/examTypesTab';

// Main Academic Settings component - integrates all tabs
const AcademicSettings = () => {
  const [activeTab, setActiveTab] = useState('academic-sessions');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Academic Settings</h1>
      
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('academic-sessions')}
              className={`inline-flex items-center gap-2 p-4 border-b-2 rounded-t-lg ${
                activeTab === 'academic-sessions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
            >
              <Calendar size={16} />
              <span>Academic Sessions</span>
            </button>
          </li>
           <li className="mr-2">
            <button
              onClick={() => setActiveTab('examinations')}
              className={`inline-flex items-center gap-2 p-4 border-b-2 rounded-t-lg ${
                activeTab === 'examinations'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
            >
              <BookOpen size={16} />
              <span>Examinations</span>
            </button>
          </li> 
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('grading-systems')}
              className={`inline-flex items-center gap-2 p-4 border-b-2 rounded-t-lg ${
                activeTab === 'grading-systems'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
            >
              <GraduationCap size={16} />
              <span>Grading Systems</span>
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('exam-types')}
              className={`inline-flex items-center gap-2 p-4 border-b-2 rounded-t-lg ${
                activeTab === 'exam-types'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
            >
              <FileText size={16} />
              <span>Exam Types</span>
            </button>
          </li>
        </ul>
      </div>
      
      {/* Tab Content - Renders the appropriate component based on active tab */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {activeTab === 'academic-sessions' && <AcademicSessionsTab />}
         {activeTab === 'examinations' && <ExaminationsTab />} 
        {activeTab === 'grading-systems' && <GradingSystemsTab />}
        {activeTab === 'exam-types' && <ExamTypesTab />}
      </div>
      
      {/* Schema Relationship Info - Shows how these settings tables relate to each other */}
      {/* <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Database Relationships</h3>
        <p className="mb-3 text-sm text-gray-600">
          This module manages the following database tables and their relationships:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-3 text-left">Table</th>
                <th className="py-2 px-3 text-left">Relates To</th>
                <th className="py-2 px-3 text-left">Relationship</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-2 px-3 font-medium">academic_sessions</td>
                <td className="py-2 px-3">classes, examinations, fee_structure</td>
                <td className="py-2 px-3">One-to-many (Parent)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium">grading_systems</td>
                <td className="py-2 px-3">grade_points, exam_types</td>
                <td className="py-2 px-3">One-to-many (Parent)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium">grade_points</td>
                <td className="py-2 px-3">grading_systems</td>
                <td className="py-2 px-3">Many-to-one (Child)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium">exam_types</td>
                <td className="py-2 px-3">grading_systems, examinations</td>
                <td className="py-2 px-3">Many-to-one/One-to-many</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div> */}
    </div>
  );
};

export default AcademicSettings;