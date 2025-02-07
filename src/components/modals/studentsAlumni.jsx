// StudentProfileModal.jsx
import React from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Download,
  Calendar,
  GraduationCap,
  Award,
  Users
} from "lucide-react";

const StudentProfileModal = ({ student, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900">Student Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Full Name", value: student.name, icon: User },
                { label: "Admission Number", value: student.admissionNo, icon: GraduationCap },
                { label: "Graduation Year", value: student.graduationYear, icon: Calendar },
                { label: "Course", value: student.course, icon: Award },
              ].map(({ label, value, icon: Icon }, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{value}</p>
                    <p className="text-sm text-gray-500">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[ 
              { title: "Achievements", data: student.achievements, icon: Award, color: "text-yellow-400" },
              { title: "Events Attended", data: student.events, icon: Calendar, color: "text-blue-400" },
              { title: "Volunteer Work", data: student.volunteerWork, icon: Users, color: "text-green-400" }
            ].map(({ title, data, icon: Icon, color }, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
                <div className="space-y-3">
                  {data.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 ${color}`} />
                      <p className="text-sm text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Mail className="h-5 w-5" /> Send Message
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="h-5 w-5" /> Export Data
              </button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${student.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
              {student.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileModal;
