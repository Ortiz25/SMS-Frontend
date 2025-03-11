import React, { useState, useEffect } from "react";
import { X, Upload, Trash2 } from "lucide-react";
import axios from "axios";

const EditTeacherModal = ({ 
    isOpen, 
    onClose, 
    teacherId, 
    onSave 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    id_number: "",
    email: "",
    phone_primary: "",
    phone_secondary: "",
    tsc_number: "",
    joining_date: "",
    employment_type: "",
    department: "",
    subject_specialization: [],
    education: "",
    certifications: "",
    experience: "",
    status: "active",
    photo_url: null,
    documents: []
  });

  const [files, setFiles] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Fetch teacher details when modal opens
  useEffect(() => {
    if (isOpen && teacherId) {
      fetchTeacherDetails();
    }
  }, [isOpen, teacherId]);

  const fetchTeacherDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/teachers/${teacherId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const teacherData = response.data.data;
      
      // Parse and set form data
      setFormData({
        first_name: teacherData.first_name,
        last_name: teacherData.last_name,
        id_number: teacherData.id_number,
        email: teacherData.email,
        phone_primary: teacherData.phone_primary,
        phone_secondary: teacherData.phone_secondary || "",
        tsc_number: teacherData.tsc_number,
        joining_date: teacherData.joining_date 
          ? new Date(teacherData.joining_date).toISOString().split('T')[0] 
          : "",
        employment_type: teacherData.employment_type,
        department: teacherData.department,
        subject_specialization: teacherData.subject_specialization || [],
        education: teacherData.education || "",
        certifications: teacherData.certifications || "",
        experience: teacherData.experience || "",
        status: teacherData.status || "active",
        photo_url: teacherData.photo_url,
        documents: []
      });

      // Set existing documents if any
      try {
        const existingDocs = teacherData.documents 
          ? JSON.parse(teacherData.documents) 
          : [];
        setExistingDocuments(existingDocs);
      } catch (parseError) {
        console.warn('Error parsing existing documents:', parseError);
      }

    } catch (error) {
      console.error('Error fetching teacher details:', error);
      setError(error.response?.data?.error || 'Failed to fetch teacher details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubjectChange = (subject) => {
    const currentSubjects = formData.subject_specialization || [];
    const updatedSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter((s) => s !== subject)
      : [...currentSubjects, subject];
    handleChange("subject_specialization", updatedSubjects);
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index, isExisting = false) => {
    if (isExisting) {
      // Remove from existing documents
      const updatedDocs = existingDocuments.filter((_, i) => i !== index);
      setExistingDocuments(updatedDocs);
    } else {
      // Remove from newly added files
      const updatedFiles = files.filter((_, i) => i !== index);
      setFiles(updatedFiles);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formDataUpload = new FormData();
    
    // Append form fields
    Object.keys(formData).forEach(key => {
      if (key === 'subject_specialization') {
        formDataUpload.append(key, formData[key].join(','));
      } else if (key !== 'documents' && formData[key] !== null && formData[key] !== undefined) {
        formDataUpload.append(key, formData[key]);
      }
    });

    // Append existing documents
    formDataUpload.append('existing_documents', 
      JSON.stringify(existingDocuments)
    );

    // Append existing photo URL
    if (formData.photo_url) {
      formDataUpload.append('existing_photo_url', formData.photo_url);
    }

    // Append new files
    files.forEach((file, index) => {
      formDataUpload.append('documents', file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/teachers/${teacherId}`, formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      // Call the onSave callback with updated teacher data
      onSave(response.data.data);
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error updating teacher:', error);
      setError(error.response?.data?.error || 'Failed to update teacher');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div
          className="fixed inset-0 bg-black opacity-75"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-lg max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-medium">Edit Teacher</h3>
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

          {/* Loading and Error States */}
          {isLoading && (
            <div className="p-4 text-center text-blue-600">Loading...</div>
          )}
          {error && (
            <div className="p-4 bg-red-100 text-red-600">{error}</div>
          )}

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
                        value={formData.first_name}
                        onChange={(e) => handleChange("first_name", e.target.value)}
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
                        value={formData.last_name}
                        onChange={(e) => handleChange("last_name", e.target.value)}
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
                        value={formData.id_number}
                        onChange={(e) => handleChange("id_number", e.target.value)}
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
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Phone*
                      </label>
                      <input
                        type="tel"
                        value={formData.phone_primary}
                        onChange={(e) => handleChange("phone_primary", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secondary Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone_secondary || ""}
                        onChange={(e) => handleChange("phone_secondary", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employment Date*
                      </label>
                      <input
                        type="date"
                        value={formData.joining_date}
                        onChange={(e) => handleChange("joining_date", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TSC Number*
                      </label>
                      <input
                        type="text"
                        value={formData.tsc_number}
                        onChange={(e) => handleChange("tsc_number", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department*
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => handleChange("department", e.target.value)}
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employment Type*
                      </label>
                      <select
                        value={formData.employment_type}
                        onChange={(e) => handleChange("employment_type", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="contract">Contract</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                      >
                        <option value="active">Active</option>
                        <option value="on_leave">On Leave</option>
                        <option value="retired">Retired</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Teaching Subjects*
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {subjects.map((subject) => (
                          <label
                            key={subject}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              checked={formData.subject_specialization.includes(subject)}
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
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Education Background*
                    </label>
                    <textarea
                      value={formData.education}
                      onChange={(e) => handleChange("education", e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                      placeholder="List your educational qualifications"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Professional Certifications
                    </label>
                    <textarea
                      value={formData.certifications}
                      onChange={(e) => handleChange("certifications", e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                      placeholder="List any professional certifications"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teaching Experience
                    </label>
                    <textarea
                      value={formData.experience}
                      onChange={(e) => handleChange("experience", e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                      placeholder="Describe your teaching experience"
                    />
                  </div>

                  {/* Document Upload Section */}
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

                    {/* Existing Documents */}
                    {existingDocuments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">
                          Existing Documents
                        </h4>
                        {existingDocuments.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                          >
                            <span className="text-sm text-gray-600">
                              {doc.name || `Document ${index + 1}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(index, true)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Newly Added Files */}
                    {files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">
                          New Documents
                        </h4>
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
                              <Trash2 className="h-4 w-4" />
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
                  Update Teacher
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTeacherModal;