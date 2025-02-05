import React, { useState } from 'react';
import { 
  X, 
  User, 
  GraduationCap, 
  Calendar, 
  Heart
} from 'lucide-react';
import PersonalInfo from '../personalInfo';
import AcademicInfo from '../academicInfo';
import MedicalInfo from '../medicalInfo';
import AttendanceInfo from '../attendanceInfo';

const ViewDetailsModal = ({ isOpen, student, onClose }) => {
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'medical', label: 'Medical', icon: Heart }
  ];

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className={`bg-white rounded-lg shadow-xl transition-all duration-300 transform 
            max-h-[90vh] overflow-y-auto
            w-[95%] sm:w-[85%] md:w-[75%] lg:w-[65%] xl:w-[55%]
            max-w-7xl mx-auto
            scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
            ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-lg font-medium text-blue-600">
                  {student?.name?.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{student?.name}</h2>
                <p className="text-sm text-gray-500">{student?.admissionNo}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex overflow-x-auto px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'personal' && <PersonalInfo student={student}/>}
            {activeTab === 'academic' && <AcademicInfo student={student} />}
            {activeTab === 'attendance' && <AttendanceInfo student={student} />}
            {activeTab === 'medical' && <MedicalInfo student={student} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailsModal;