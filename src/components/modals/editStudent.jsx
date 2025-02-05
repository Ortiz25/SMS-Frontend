import React, { useState, useEffect } from "react";
import { X, User, GraduationCap, Heart, Phone } from "lucide-react";
import PersonalInfoForm from "../forms/personalInfoForm";
import AcademicInfoForm from "../forms/academicInfoForm";
import MedicalInfoForm from "../forms/medicalInfoForm";

const EditStudentModal = ({ isOpen, student, onClose, onSave, handleValidationChange }) => {
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState({
    personal: {
      name: "",
      admissionNo: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      phone: "",
      email: "",
    },
    guardian: {
      name: "",
      relationship: "",
      phone: "",
      email: "",
      occupation: "",
      address: "",
    },
    academic: {
      class: "",
      stream: "",
      previousSchool: "",
      admissionDate: "",
      subjects: [],
    },
    medical: {
      bloodGroup: "",
      allergies: "",
      conditions: "",
      medications: "",
    },
  });


  useEffect(() => {
    if (student) {
      setFormData({
        personal: {
          name: student.name || "",
          admissionNo: student.admissionNo || "",
          dateOfBirth: student.dateOfBirth || "",
          gender: student.gender || "",
          address: student.address || "",
          phone: student.phone || "",
          email: student.email || "",
        },
        guardian: {
          name: student.guardian?.name || "",
          relationship: student.guardian?.relationship || "",
          phone: student.guardian?.phone || "",
          email: student.guardian?.email || "",
          occupation: student.guardian?.occupation || "",
          address: student.guardian?.address || "",
        },
        academic: {
          class: student.class || "",
          stream: student.stream || "",
          previousSchool: student.previousSchool || "",
          admissionDate: student.admissionDate || "",
          subjects: student.subjects || [],
        },
        medical: {
          bloodGroup: student.medical?.bloodGroup || "",
          allergies: student.medical?.allergies || "",
          conditions: student.medical?.conditions || "",
          medications: student.medical?.medications || "",
        },
      });
    }
  }, [student]);

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "academic", label: "Academic", icon: GraduationCap },
    { id: "medical", label: "Medical", icon: Heart },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-50" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className={`bg-white rounded-lg shadow-xl transition-all duration-300 transform 
            max-h-[90vh] overflow-y-auto w-[95%] sm:w-[85%] md:w-[75%] lg:w-[65%] xl:w-[55%] max-w-7xl mx-auto
            ${
              isOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-4"
            }`}
        >
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Edit Student Information
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b">
              <div className="flex overflow-x-auto px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
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
              {activeTab === "personal" && (
                <PersonalInfoForm
                  formData={formData.personal}
                  onChange={(field, value) =>
                    handleInputChange("personal", field, value)
                  }
                  activeTab={activeTab}
                  onValidationChange={(isValid) =>
                    handleValidationChange("personal", isValid)
                  }
                />
              )}
              {activeTab === "academic" && (
                <AcademicInfoForm
                  formData={formData.academic}
                  onChange={(field, value) =>
                    handleInputChange("academic", field, value)
                  }
                  onValidationChange={(isValid) =>
                    handleValidationChange("personal", isValid)
                  }
                />
              )}
              {activeTab === "medical" && (
                <MedicalInfoForm
                  formData={formData.medical}
                  onChange={(field, value) =>
                    handleInputChange("medical", field, value)
                  }
                  onValidationChange={(isValid) =>
                    handleValidationChange("personal", isValid)
                  }
                />
              )}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 bg-gray-50 flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditStudentModal;
