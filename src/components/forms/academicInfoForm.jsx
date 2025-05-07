import React, { useState, useEffect } from "react";
import axios from "axios";
import shortid from "shortid";

const AcademicInfoForm = ({
  formData,
  onChange,
  onValidationChange,
  readOnly = false,
}) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [classes, setClasses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchClasses();
        await fetchSubjects();
      } catch (error) {
        console.error("Error loading form data:", error);
        setLoadingError("Failed to load form data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update streams when class changes
  useEffect(() => {
    if (formData.class && classes.length > 0) {
      const selectedClass = classes.find((c) => c.level === formData.class);
      if (selectedClass) {
        setStreams(selectedClass.streams || []);
      }
    }
  }, [formData.class, classes]);

  // Validate form when data changes
  useEffect(() => {
    const hasErrors = Object.values(errors).some((error) => error !== "");
    const requiredFieldsFilled =
      formData.class &&
      formData.stream &&
      formData.admissionDate &&
      formData.subjects?.length >= 6;

    onValidationChange(!hasErrors && requiredFieldsFilled);
  }, [formData, errors]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/backend/api/classes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      if (response.data.success) {
        // Group classes by level
        const groupedClasses = response.data.data.reduce((acc, cls) => {
          const levelKey = cls.level;
          if (!acc[levelKey]) {
            acc[levelKey] = {
              level: cls.level,
              curriculum_type: cls.curriculum_type,
              name: cls.level,
              streams: [],
            };
          }

          if (cls.stream && !acc[levelKey].streams.includes(cls.stream)) {
            acc[levelKey].streams.push(cls.stream);
          }

          return acc;
        }, {});

        setClasses(Object.values(groupedClasses));
      }
      return response;
    } catch (error) {
      console.error("Error fetching classes:", error);
      throw error;
    }
  };

  // Update the fetchSubjects function
  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem("token");

      // Use curriculum type from formData if available
      const params = formData.class
        ? {
            level: formData.class,
            curriculum_type:
              formData.curriculumType ||
              classes.find((c) => c.level === formData.class)?.curriculum_type,
          }
        : {};

      console.log("Subject fetch params:", params);

      const response = await axios.get(
        "/backend/api/classes/subjects",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        }
      );

      if (response.data.success) {
        setSubjects(response.data.data);
      }
      return response;
    } catch (error) {
      console.error("Error fetching subjects:", error);
      throw error;
    }
  };

  const validateField = (name, value) => {
    let fieldError = "";

    switch (name) {
      case "class":
        if (!value) fieldError = "Class is required";
        break;
      case "stream":
        if (!value && streams.length > 0) fieldError = "Stream is required";
        break;
      case "admissionDate":
        if (!value) {
          fieldError = "Admission date is required";
        } else {
          const admissionDate = new Date(value);
          const today = new Date();
          if (admissionDate > today) {
            fieldError = "Admission date cannot be in the future";
          }
        }
        break;
      case "subjects":
        if (!value || value.length < 6) {
          fieldError = "At least 6 subjects must be selected";
        }
        break;
      case "previousSchool":
        if (value && value.length < 3) {
          fieldError = "Previous school name must be at least 3 characters";
        }
        break;
    }

    return fieldError;
  };

  const handleChange = (field, value) => {
    onChange(field, value);

    if (touched[field]) {
      const fieldError = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: fieldError,
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    const fieldError = validateField(field, formData[field]);
    setErrors((prev) => ({
      ...prev,
      [field]: fieldError,
    }));
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const getDefaultSubjects = () => {
    return [
      "Mathematics",
      "English",
      "Kiswahili",
      "Biology",
      "Physics",
      "Chemistry",
      "History",
      "Geography",
      "CRE",
      "Business Studies",
      "Agriculture",
    ];
  };

  const getSubjectsToDisplay = () => {
    if (subjects.length > 0) {
      return subjects;
    }

    // Use default subjects when API subjects aren't available
    return getDefaultSubjects().map((name) => ({ id: name, name }));
  };

  // Format date for display (if in ISO format)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  if (loading && !formData.class) {
    return (
      <div className="flex justify-center p-8">
        Loading academic information...
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      {/* {loadingError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {loadingError}
        </div>
      )} */}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Academic Information
        </h3>
        {!readOnly && (
          <button
            type="button"
            onClick={toggleEditMode}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              isEditing
                ? "bg-gray-200 text-gray-800"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isEditing ? "Cancel" : "Edit Information"}
          </button>
        )}
      </div>

      {/* Class Information */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            {isEditing ? (
              <select
                value={formData.class || ""}
                onChange={(e) => handleChange("class", e.target.value)}
                onBlur={() => handleBlur("class")}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.class ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.level}>
                    {cls.level} (
                    {cls.curriculum_type === "844" ? "Secondary" : "Primary"})
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                {formData.class || "Not specified"}
              </div>
            )}
            {errors.class && touched.class && (
              <p className="mt-1 text-sm text-red-600">{errors.class}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stream
            </label>
            {isEditing ? (
              <select
                value={formData.stream || ""}
                onChange={(e) => handleChange("stream", e.target.value)}
                onBlur={() => handleBlur("stream")}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.stream ? "border-red-500" : "border-gray-300"
                }`}
                disabled={!formData.class}
              >
                <option value="">Select stream</option>
                {streams.map((stream) => (
                  <option key={shortid.generate()} value={stream}>
                    {stream}
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                {formData.stream || "Not specified"}
              </div>
            )}
            {errors.stream && touched.stream && (
              <p className="mt-1 text-sm text-red-600">{errors.stream}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Type
            </label>
            <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
              {formData.studentType === "day_scholar"
                ? "Day Scholar"
                : formData.studentType === "boarder"
                ? "Boarder"
                : formData.studentType || "Not specified"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admission Date
            </label>
            {isEditing ? (
              <input
                type="date"
                value={formatDate(formData.admissionDate) || ""}
                onChange={(e) => handleChange("admissionDate", e.target.value)}
                onBlur={() => handleBlur("admissionDate")}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.admissionDate ? "border-red-500" : "border-gray-300"
                }`}
              />
            ) : (
              <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                {formatDate(formData.admissionDate) || "Not specified"}
              </div>
            )}
            {errors.admissionDate && touched.admissionDate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.admissionDate}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Previous School
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.previousSchool || ""}
                onChange={(e) => handleChange("previousSchool", e.target.value)}
                onBlur={() => handleBlur("previousSchool")}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.previousSchool ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter previous school name"
              />
            ) : (
              <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                {formData.previousSchool || "Not specified"}
              </div>
            )}
            {errors.previousSchool && touched.previousSchool && (
              <p className="mt-1 text-sm text-red-600">
                {errors.previousSchool}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Subject Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Subjects {isEditing && "(Select at least 6 subjects)"}
        </h3>

        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            {getSubjectsToDisplay().map((subject) => (
              <label
                key={subject.id}
                className="flex items-center space-x-3 p-2 border border-gray-100 rounded-md hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={formData.subjects?.some(
                    (sub) =>
                      (typeof sub === "object" && sub.id === subject.id) ||
                      sub === subject.id.toString() ||
                      sub === subject.id ||
                      sub === subject.name
                  )}
                  onChange={(e) => {
                    // Create a new array of existing subject IDs (normalized to strings)
                    const currentSubjectIds = (formData.subjects || []).map(
                      (sub) => {
                        if (typeof sub === "object" && sub.id)
                          return sub.id.toString();
                        return sub.toString();
                      }
                    );

                    const subjectId = subject.id.toString();

                    let updatedSubjects;
                    if (e.target.checked) {
                      // Add subject ID if not already present
                      if (!currentSubjectIds.includes(subjectId)) {
                        updatedSubjects = [...currentSubjectIds, subjectId];
                      } else {
                        updatedSubjects = currentSubjectIds; // No change needed
                      }
                    } else {
                      // Remove subject ID
                      updatedSubjects = currentSubjectIds.filter(
                        (id) => id !== subjectId
                      );
                    }

                    // Log what's happening for debugging
                    console.log(
                      `Subject ${subject.name} (${subject.id}) ${
                        e.target.checked ? "checked" : "unchecked"
                      }`
                    );
                    console.log("Before:", currentSubjectIds);
                    console.log("After:", updatedSubjects);

                    handleChange("subjects", updatedSubjects);
                  }}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  {subject.name + (subject.code ? " " + subject.code : "")}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            {formData.subjects && formData.subjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {formData.subjects.map((subject) => (
                  <div key={shortid.generate()} className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm text-gray-800">
                      {typeof subject === "object" ? subject.name : subject}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No subjects selected</p>
            )}
          </div>
        )}

        {errors.subjects && touched.subjects && (
          <p className="mt-2 text-sm text-red-600">{errors.subjects}</p>
        )}
      </div>

      {isEditing && (
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={toggleEditMode}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default AcademicInfoForm;
