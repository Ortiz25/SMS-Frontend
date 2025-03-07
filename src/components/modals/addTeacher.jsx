import React, { useState } from "react";
import { X, Upload } from "lucide-react";
import axios from "axios";

const AddTeacherModal = ({ isOpen, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    first_name: "",
    last_name: "",
    id_number: "",
    email: "",
    phone_primary: "",
    phone_secondary: "",

    // Employment Details
    staff_id: "", // Auto-generated
    tsc_number: "",
    joining_date: "",
    employment_type: "",
    department: "",

    // New Fields
    subject_specialization: [],
    education: "",
    certifications: "",
    experience: "",
    status: "active",
    photo_url: "",

    // Documents handling
    documents: [],
  });

  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const updatedFiles = [...files, ...newFiles];

    setFiles(updatedFiles);

    // Prepare documents with file details
    const documentDetails = updatedFiles.map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
    }));

    setFormData((prev) => ({
      ...prev,
      documents: documentDetails,
    }));
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setFormData((prev) => ({
      ...prev,
      documents: updatedFiles,
    }));
  };

  const steps = [
    { id: 1, title: "Personal Info" },
    { id: 2, title: "Employment" },
    { id: 3, title: "Qualifications" },
  ];
  const departments = [
    "Mathematics",
    "Sciences",
    "Languages",
    "Humanities",
    "Technical Subjects",
  ];

  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Kiswahili",
    "History",
    "Geography",
  ];

  const handleSubjectChange = (subject) => {
    const currentSubjects = formData.subject_specialization || [];
    const updatedSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter((s) => s !== subject)
      : [...currentSubjects, subject];
    handleChange("subject_specialization", updatedSubjects);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataUpload = new FormData();

    // Append other form fields
    Object.keys(formData).forEach((key) => {
      if (key === "subject_specialization") {
        formDataUpload.append(key, formData[key].join(","));
      } else if (key === "documents") {
        // Skip documents field, we'll handle files separately
        return;
      } else if (formData[key] !== null && formData[key] !== undefined) {
        formDataUpload.append(key, formData[key]);
      }
    });

    // Append files to 'documents' field
    files.forEach((file) => {
      formDataUpload.append("documents", file);
    });

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:5000/api/teachers", formDataUpload, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      onSubmit(response.data);
      onClose();
    } catch (error) {
      console.error("Error adding teacher:", error);
      // Handle error (show error message, etc.)
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 bg-black opacity-75" onClick={onClose} />

        <div className="relative bg-white rounded-lg max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-medium">Add New Teacher</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`rounded-full h-8 w-8 flex items-center justify-center border-2 
                    ${
                      currentStep > step.id
                        ? "bg-blue-600 border-blue-600 text-white"
                        : currentStep === step.id
                        ? "border-blue-600 text-blue-600"
                        : "border-gray-300 text-gray-300"
                    }`}
                  >
                    {step.id}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-600">
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className="w-12 h-1 bg-gray-200 mx-4" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name*
                      </label>
                      <input
                        type="text"
                        value={formData.first_name || ""}
                        onChange={(e) =>
                          handleChange("first_name", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name*
                      </label>
                      <input
                        type="text"
                        value={formData.last_name || ""}
                        onChange={(e) =>
                          handleChange("last_name", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email*
                      </label>
                      <input
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number*
                      </label>
                      <input
                        type="tel"
                        value={formData.phone_primary || ""}
                        onChange={(e) =>
                          handleChange("phone_primary", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        National ID*
                      </label>
                      <input
                        type="text"
                        value={formData.id_number || ""}
                        onChange={(e) =>
                          handleChange("id_number", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth*
                      </label>
                      <input
                        type="date"
                        value={formData.date_of_birth || ""}
                        onChange={(e) =>
                          handleChange("date_of_birth", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={formData.address || ""}
                      onChange={(e) => handleChange("address", e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                    />
                  </div>
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Employment Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employment Date*
                      </label>
                      <input
                        type="date"
                        value={formData.joining_date || ""}
                        onChange={(e) =>
                          handleChange("joining_date", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                        required
                      />
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department*
                      </label>
                      <select
                        value={formData.department || ""}
                        onChange={(e) =>
                          handleChange("department", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Position */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position*
                      </label>
                      <select
                        value={formData.position || ""}
                        onChange={(e) =>
                          handleChange("position", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                        required
                      >
                        <option value="">Select Position</option>
                        <option value="teacher">Teacher</option>
                        <option value="hod">Head of Department</option>
                        <option value="senior-teacher">Senior Teacher</option>
                      </select>
                    </div>

                    {/* TSC Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TSC Number*
                      </label>
                      <input
                        type="text"
                        value={formData.tsc_number || ""}
                        onChange={(e) =>
                          handleChange("tsc_number", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                        required
                      />
                    </div>

                    {/* Employment Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employment Type*
                      </label>
                      <select
                        value={formData.employment_type || ""}
                        onChange={(e) =>
                          handleChange("employment_type", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="contract">Contract</option>
                      </select>
                    </div>

                    {/* Salary Scale */}
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Salary Scale
                      </label>
                      <input
                        type="text"
                        value={formData.salaryScale || ""}
                        onChange={(e) =>
                          handleChange("salaryScale", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                        placeholder="e.g., T-Scale 10"
                      />
                    </div> */}
                  </div>

                  {/* Teaching Subjects */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Teaching Subjects*
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {subjects.map((subject) => (
                        <label
                          key={subject}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={(
                              formData.subject_specialization || []
                            ).includes(subject)}
                            onChange={() => handleSubjectChange(subject)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            {subject}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Education Background */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Education Background*
                    </label>
                    <textarea
                      value={formData.education || ""}
                      onChange={(e) =>
                        handleChange("education", e.target.value)
                      }
                      rows="3"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                      placeholder="List your educational qualifications (e.g., Bachelor's in Education, Master's in Mathematics)"
                      required
                    />
                  </div>

                  {/* Professional Certifications */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Professional Certifications
                    </label>
                    <textarea
                      value={formData.certifications || ""}
                      onChange={(e) =>
                        handleChange("certifications", e.target.value)
                      }
                      rows="3"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                      placeholder="List any relevant certifications or professional qualifications"
                    />
                  </div>

                  {/* Teaching Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teaching Experience
                    </label>
                    <textarea
                      value={formData.experience || ""}
                      onChange={(e) =>
                        handleChange("experience", e.target.value)
                      }
                      rows="3"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                      placeholder="Describe your previous teaching experience"
                    />
                  </div>

                  {/* Document Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Upload Documents
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4 flex text-sm justify-center">
                          <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Upload files</span>
                            <input
                              type="file"
                              className="sr-only"
                              multiple
                              onChange={handleFileChange}
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                          </label>
                          <p className="pl-1 text-gray-500">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          PDF, DOC, DOCX, JPG up to 10MB each
                        </p>
                      </div>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                          >
                            <span className="text-sm text-gray-600">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border rounded-lg"
                >
                  Back
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Submit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTeacherModal;
