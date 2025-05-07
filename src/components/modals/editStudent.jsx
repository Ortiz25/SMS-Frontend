import React, { useState, useEffect } from "react";
import {
  X,
  User,
  GraduationCap,
  Heart,
  Phone,
  Loader,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import PersonalInfoForm from "../forms/personalInfoForm";
import AcademicInfoForm from "../forms/academicInfoForm";
import MedicalInfoForm from "../forms/medicalInfoForm";
import axios from "axios";

const EditStudentModal = ({ isOpen, student, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [changedFields, setChangedFields] = useState({
    personal: {},
    guardian: {},
    academic: {},
    medical: {},
  });
  const mapFieldNameToApi = (field, section) => {
    const fieldMappings = {
      personal: {
        firstName: "first_name",
        lastName: "last_name",
        otherNames: "other_names",
        admissionNo: "admission_number",
        dateOfBirth: "date_of_birth",
        gender: "gender",
        address: "address",
        nationality: "nationality",
        nemisUpi: "nemis_upi",
      },
      academic: {
        class: "current_class",
        stream: "stream",
        previousSchool: "previous_school",
        admissionDate: "admission_date",
        curriculumType: "curriculum_type",
        studentType: "student_type",
      },
      medical: {
        bloodGroup: "blood_group",
        allergies: "allergies",
        emergencyContactName: "emergency_contact_name",
        emergencyContactPhone: "emergency_contact_phone",
        medical_conditions: "medical_conditions",
        // Add both variations to be safe
        medicalConditions: "medical_conditions",
        conditions: "medical_conditions",
      },
      guardian: {
        name: "name",
        relationship: "relationship",
        phone: "phone_primary",
        email: "email",
        idNumber: "id_number",
      },
    };

    // If the mapping doesn't exist, return the original field
    return fieldMappings[section]?.[field] || field;
  };
  // 1. Update initial state to match database schema
  const [formData, setFormData] = useState({
    personal: {
      firstName: "",
      lastName: "",
      otherNames: "",
      admissionNo: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      nationality: "Kenyan",
      nemisUpi: "",
    },
    guardian: {
      name: "",
      relationship: "",
      phone: "",
      email: "",
      idNumber: "",
    },
    academic: {
      class: "", // This is now the level string (e.g., "Grade 7", "Form 3")
      stream: "", // Stream value (e.g., "A", "B", "C")
      previousSchool: "",
      admissionDate: "",
      curriculumType: "", // CBC or 844
      subjects: [],
      studentType: "day_scholar", // day_scholar or boarder
    },
    medical: {
      bloodGroup: "",
      allergies: [], // Now an array directly, not a string
      emergencyContactName: "",
      emergencyContactPhone: "",
      medical_conditions: "",
    },
  });

  const [classes, setClasses] = useState([]);
  const [validation, setValidation] = useState({
    personal: true,
    academic: true,
    medical: true,
  });

  // Fetch available classes
  useEffect(() => {
    if (isOpen) {
      fetchClasses();
    }
  }, [isOpen]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/backend/api/classes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setClasses(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };
  useEffect(() => {
    if (isOpen) {
      setChangedFields({
        personal: {},
        guardian: {},
        academic: {},
        medical: {},
      });
      // Reset success and error messages when modal opens
      setSuccess(null);
      setError(null);
    }
  }, [isOpen, student]);

  // Initialize form with student data
  useEffect(() => {
    if (student) {
      //console.log("Initializing form with student data:", student);

      // Store original data for comparison
      const originalData = {
        personal: {
          firstName: student.first_name || "",
          lastName: student.last_name || "",
          otherNames: student.other_names || "",
          admissionNo: student.admission_number || student.admissionNo || "",
          dateOfBirth: student.date_of_birth || student.dateOfBirth || "",
          gender: student.gender || "",
          address: student.address || "",
          nationality: student.nationality || "Kenyan",
          nemisUpi: student.nemis_upi || "",
        },
        guardian: {
          name: student.guardian?.name || "",
          relationship: student.guardian?.relationship || "",
          phone: student.guardian?.phone_primary || "",
          email: student.guardian?.email || "",
          idNumber: student.guardian?.id_number || "",
        },
        academic: {
          class: student.current_class || student.class || "",
          stream: student.stream || "",
          previousSchool: student.previous_school || "",
          admissionDate: student.admission_date || "",
          curriculumType: student.curriculum_type || "",
          subjects: student.subjects || [],
          studentType: student.student_type || "day_scholar",
        },
        medical: {
          bloodGroup: student.blood_group || "",
          allergies: Array.isArray(student.allergies)
            ? student.allergies
            : student.allergies
            ? [student.allergies]
            : [],
          emergencyContactName: student.emergency_contact_name || "",
          emergencyContactPhone: student.emergency_contact_phone || "",
          medical_conditions: student.medical_conditions || "",
        },
      };

      setFormData(originalData);

      // Reset changed fields
      setChangedFields({
        personal: {},
        guardian: {},
        academic: {},
        medical: {},
      });
    }
  }, [student, isOpen]);

  const handleInputChange = (section, field, value) => {
    // Update the form data as before
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Compare with original data to see if the value has actually changed
    let hasChanged = false;

    if (section === "personal") {
      const originalFieldMapping = {
        firstName: "first_name",
        lastName: "last_name",
        otherNames: "other_names",
        admissionNo: "admission_number",
        dateOfBirth: "date_of_birth",
        gender: "gender",
        address: "address",
        nationality: "nationality",
        nemisUpi: "nemis_upi",
      };

      const originalField = originalFieldMapping[field] || field;
      hasChanged = student[originalField] !== value;
    } else if (section === "academic") {
      const originalFieldMapping = {
        class: "current_class",
        stream: "stream",
        previousSchool: "previous_school",
        admissionDate: "admission_date",
        curriculumType: "curriculum_type",
        studentType: "student_type",
      };

      const originalField = originalFieldMapping[field] || field;
      hasChanged = student[originalField] !== value;
    } else if (section === "medical") {
      const originalFieldMapping = {
        bloodGroup: "blood_group",
        emergencyContactName: "emergency_contact_name",
        emergencyContactPhone: "emergency_contact_phone",
        medical_conditions: "medical_conditions",
      };

      const originalField = originalFieldMapping[field] || field;

      // Special handling for allergies which is an array
      if (field === "allergies") {
        if (Array.isArray(value) && Array.isArray(student.allergies)) {
          hasChanged =
            JSON.stringify(value) !== JSON.stringify(student.allergies);
        } else {
          hasChanged = true; // If types don't match, consider it changed
        }
      } else {
        hasChanged = student[originalField] !== value;
      }
    } else if (section === "guardian") {
      if (student.guardian) {
        const originalFieldMapping = {
          name: "name",
          relationship: "relationship",
          phone: "phone_primary",
          email: "email",
          idNumber: "id_number",
        };

        const originalField = originalFieldMapping[field] || field;
        hasChanged = student.guardian[originalField] !== value;
      } else {
        // If there was no guardian data before but now there is, it has changed
        hasChanged = value !== "";
      }
    }

    // In handleInputChange, improve subject change detection
    if (section === "academic" && field === "subjects") {
      console.log("Checking if subjects changed...");

      // Normalize both arrays to just string IDs for comparison
      const normalizeSubjects = (subjects) => {
        if (!subjects) return [];
        return subjects
          .map((sub) => {
            if (typeof sub === "object" && sub !== null && sub.id) {
              return sub.id.toString();
            }
            return sub.toString();
          })
          .sort();
      };

      const originalSubjects = normalizeSubjects(student.subjects);
      const newSubjects = normalizeSubjects(value);

      console.log("Original subjects:", originalSubjects);
      console.log("New subjects:", newSubjects);

      // Compare as JSON strings after sorting
      hasChanged =
        JSON.stringify(originalSubjects) !== JSON.stringify(newSubjects);
      console.log("Subjects changed:", hasChanged);
    }

    console.log(
      `Field ${section}.${field} changed: ${hasChanged} (from "${
        section === "guardian" && student.guardian
          ? student.guardian[field]
          : student[mapFieldNameToApi(field, section)]
      }" to "${value}")`
    );

    // Only track as changed if it's different from the original
    if (hasChanged) {
      setChangedFields((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: true,
        },
      }));
    } else {
      // Remove from changed fields if it's the same as original
      setChangedFields((prev) => {
        const updatedSection = { ...prev[section] };
        delete updatedSection[field];
        return {
          ...prev,
          [section]: updatedSection,
        };
      });
    }
  };

  const handleValidationChange = (section, isValid) => {
    //console.log(`Validation change for ${section}: ${isValid}`);
    setValidation((prev) => ({
      ...prev,
      [section]: isValid,
    }));
  };

  const isFormValid = () => {
    // Allow form submission as long as each active tab is valid
    return validation[activeTab];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validation[activeTab]) {
      setError(
        "Please fix the validation errors in the current tab before saving"
      );
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create an object with only the changed fields
      const updateData = {
        id: student.id,
      };

      // Process personal fields
      Object.keys(changedFields.personal).forEach((field) => {
        if (changedFields.personal[field]) {
          const apiFieldName = mapFieldNameToApi(field, "personal");
          updateData[apiFieldName] = formData.personal[field];
        }
      });

      // Process academic fields
      Object.keys(changedFields.academic).forEach((field) => {
        if (changedFields.academic[field]) {
          const apiFieldName = mapFieldNameToApi(field, "academic");
          updateData[apiFieldName] = formData.academic[field];
        }
      });

      // Process medical fields
      Object.keys(changedFields.medical).forEach((field) => {
        if (changedFields.medical[field]) {
          const apiFieldName = mapFieldNameToApi(field, "medical");
          console.log(
            `Mapping medical field '${field}' to API field '${apiFieldName}'`
          );

          // Special handling for allergies
          if (
            field === "allergies" &&
            typeof formData.medical[field] === "string"
          ) {
            updateData[apiFieldName] = formData.medical[field]
              .split(",")
              .map((item) => item.trim());
          } else {
            updateData[apiFieldName] = formData.medical[field];
          }
        }
      });

      // Process guardian fields
      if (
        Object.keys(changedFields.guardian).some(
          (key) => changedFields.guardian[key]
        )
      ) {
        updateData.guardian = {};

        Object.keys(changedFields.guardian).forEach((field) => {
          if (changedFields.guardian[field]) {
            const apiFieldName = mapFieldNameToApi(field, "guardian");
            updateData.guardian[apiFieldName] = formData.guardian[field];
          }
        });
      }

      if (changedFields.academic && changedFields.academic.subjects) {
        // Ensure we're sending just an array of IDs
        updateData.subjects = (formData.academic.subjects || []).map(subject => {
          if (typeof subject === 'object' && subject !== null && subject.id) {
            return subject.id.toString();
          }
          return subject.toString();
        });
        
        console.log("Sending subjects to API:", updateData.subjects);
      }

      console.log("Submitting updated data:", updateData);

      // Proceed with the API call if there are changes or simply close if no changes
      if (Object.keys(updateData).length > 1) {
        // More than just the ID
        const token = localStorage.getItem("token");
        try {
          const response = await axios.put(
            `/backend/api/students/${student.id}`,
            updateData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log("API Response:", response.data);

          if (response.data && response.data.success) {
            setSuccess(
              `Student ${formData.personal.firstName} ${formData.personal.lastName} updated successfully!`
            );

            // Set a timeout to close the modal after showing success message
            setTimeout(() => {
              if (onSave && response.data.data) {
                onSave(response.data.data);
              } else if (onSave) {
                // If data is not in the expected format, still call onSave with basic info
                onSave({
                  id: student.id,
                  first_name: formData.personal.firstName,
                  last_name: formData.personal.lastName,
                  ...updateData,
                });
              }
              onClose();
            }, 2000); // Close after 2 seconds
          } else {
            throw new Error(response.data?.error || "Failed to update student");
          }
        } catch (apiError) {
          console.error("API Error:", apiError);
          setError(
            apiError.message || "Failed to update student. Please try again."
          );
          setLoading(false);
        }
      } else {
        // No changes were made
        setSuccess("No changes detected");
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Error updating student:", error);
      setError(
        error.response?.data?.error ||
          error.message ||
          "Failed to update student. Please try again."
      );
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "academic", label: "Academic", icon: GraduationCap },
    { id: "medical", label: "Medical", icon: Heart },
  ];
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="fixed inset-0 bg-black transition-opacity duration-300 opacity-50"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-lg shadow-xl w-[95%] sm:w-[85%] md:w-[75%] lg:w-[65%] xl:w-[55%] max-w-7xl mx-auto">
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
                disabled={loading}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Success message */}
            {success && (
              <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>{success}</span>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            )}

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
                    disabled={loading}
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
                  onValidationChange={(isValid) =>
                    handleValidationChange("personal", isValid)
                  }
                  disabled={loading}
                />
              )}
              {activeTab === "academic" && (
                <AcademicInfoForm
                  formData={formData.academic}
                  studentId={student.id}
                  onChange={(field, value) =>
                    handleInputChange("academic", field, value)
                  }
                  onValidationChange={(isValid) =>
                    handleValidationChange("academic", isValid)
                  }
                  classes={classes}
                  disabled={loading}
                />
              )}
              {activeTab === "medical" && (
                <MedicalInfoForm
                  formData={formData.medical}
                  onChange={(field, value) =>
                    handleInputChange("medical", field, value)
                  }
                  onValidationChange={(isValid) =>
                    handleValidationChange("medical", isValid)
                  }
                  disabled={loading}
                />
              )}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 bg-gray-50 flex justify-end space-x-4">
              <button
                type="submit"
                onClick={(e) => {
                  console.log("Save button clicked");
                  handleSubmit(e);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center"
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditStudentModal;
