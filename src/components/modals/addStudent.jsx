import React, { useState, useEffect } from "react";
import { X, Loader, AlertCircle, Check } from "lucide-react";
import AnimatedModal from "./animateModal";
import axios from "axios";

const AddStudentModal = ({ showAddModal, setShowAddModal, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    otherNames: "",
    admissionNo: "",
    class: "",
    stream: "",
    dateOfBirth: "",
    gender: "",
    nationality: "Kenyan",
    nemisUpi: "",
    previousSchool: "",
    bloodGroup: "",
    studentType: "",
    address: "",
    busRoute: "",
    hostel: "",
    roomNumber: "",
    medicalInfo: "",
    guardianFirstName: "",
    guardianLastName: "",
    guardianPhone: "",
    guardianPhoneSecondary: "",
    guardianEmail: "",
    guardianRelation: "",
    guardianAddress: "",
    guardianIdNumber: "",
    selectedSubjects: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [busRoutes, setBusRoutes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [currentAcademicSession, setCurrentAcademicSession] = useState(null);

  const fetchCurrentAcademicSession = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "/backend/api/sessions/academic-sessions/current",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        setCurrentAcademicSession(response.data);
      }
    } catch (error) {
      console.error("Error fetching current academic session:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "/backend/api/subjects/subjects",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        setSubjects(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

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

  const fetchHostels = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/backend/api/hostels", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setHostels(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching hostels:", error);
    }
  };

  const fetchBusRoutes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "/backend/api/hostel-transport/routes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        setBusRoutes(response.data.routes);
      }
    } catch (error) {
      console.error("Error fetching bus routes:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Special handling for subject checkboxes
    if (name === "subject") {
      const subjectId = parseInt(value, 10);

      if (checked) {
        // Add subject to selectedSubjects
        setFormData((prev) => ({
          ...prev,
          selectedSubjects: [...prev.selectedSubjects, subjectId],
        }));
      } else {
        // Remove subject from selectedSubjects
        setFormData((prev) => ({
          ...prev,
          selectedSubjects: prev.selectedSubjects.filter(
            (id) => id !== subjectId
          ),
        }));
      }
      return;
    }

    // Special handling for class selection
    if (name === "class") {
      // Find the selected class from the classes array
      const selectedClass = classes.find((cls) => cls.id.toString() === value);
      
      if (selectedClass) {
        //console.log("Selected class:", selectedClass);
        
        // Filter subjects based on curriculum type and level
        const filteredSubjects = subjects.filter((subject) => 
          // Match both curriculum type and either exact level or "all" level
          subject.curriculum_type === selectedClass.curriculum_type && 
          (subject.level === selectedClass.level || 
           // For 844 curriculum, "Secondary" level applies to all Form levels
           (selectedClass.curriculum_type === "844" && 
            selectedClass.level.startsWith("Form") && 
            subject.level === "Secondary") ||
           // For CBC curriculum, "Junior Secondary" level applies to all JSS levels
           (selectedClass.curriculum_type === "CBC" && 
            selectedClass.level.startsWith("JSS") && 
            subject.level === "Junior Secondary") ||
           // For CBC curriculum, "Upper Primary" level applies to Grade 4-6
           (selectedClass.curriculum_type === "CBC" && 
            selectedClass.level.startsWith("Grade") && 
            parseInt(selectedClass.level.split(" ")[1]) <= 6 && 
            subject.level === "Upper Primary"))
        );
        
       // console.log("Filtered subjects:", filteredSubjects);
        setAvailableSubjects(filteredSubjects);

        // Store the actual class level instead of id
        setFormData((prev) => ({
          ...prev,
          [name]: selectedClass.level,
          // If the class has a stream attached, automatically set it
          ...(selectedClass.stream && { stream: selectedClass.stream }),
          // Reset selected subjects when class changes
          selectedSubjects: [],
        }));

        // console.log(
        //   `Selected class: ${selectedClass.level}, Stream: ${selectedClass.stream}`
        // );
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          selectedSubjects: [],
        }));
        setAvailableSubjects([]);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      // Prepare data for submission - make sure to extract the right class and stream
      const selectedClass = classes.find(
        (cls) => cls.level === formData.class && cls.stream === formData.stream
      );

      // Create a new object for submission to ensure it matches the backend format
      const submitData = {
        ...formData,
        // Ensure gender is lowercase for backend compatibility
        gender: formData.gender.toLowerCase(),
        // Make sure the class is set correctly
        class: formData.class, // This should be the level from the class
        // Stream is already set by the class selection
      };

      console.log("Submitting student data:", submitData);

      // Step 1: Create the student record
      const response = await axios.post(
        "/backend/api/students/add",
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const newStudent = response.data.data;
        console.log("Student created successfully:", newStudent);

        // Step 2: If subjects were selected, create student-subject relationships
        if (
          formData.selectedSubjects.length > 0 &&
          selectedClass &&
          currentAcademicSession
        ) {
          try {
            // Prepare subject enrollment data
            const subjectEnrollments = formData.selectedSubjects.map(
              (subjectId) => ({
                studentId: newStudent.id,
                subjectId: subjectId,
                classId: selectedClass.id,
                academicSessionId: currentAcademicSession.id,
                isElective: false, // Set based on your business logic
                status: "active",
              })
            );

            console.log("Creating subject enrollments:", subjectEnrollments);

            // Create student-subject relationships
            const enrollmentResponse = await axios.post(
              "/backend/api/students/enroll-subjects",
              { enrollments: subjectEnrollments },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (enrollmentResponse.data.success) {
              console.log("Subject enrollments created successfully");
            } else {
              console.warn(
                "Failed to create subject enrollments:",
                enrollmentResponse.data.error
              );
            }
          } catch (enrollError) {
            console.error("Error creating subject enrollments:", enrollError);
            // We don't want to fail the whole operation if subject enrollment fails
          }
        }

        // Clear form data
        setFormData({
          firstName: "",
          lastName: "",
          otherNames: "",
          admissionNo: "",
          class: "",
          stream: "",
          dateOfBirth: "",
          gender: "",
          nationality: "Kenyan",
          nemisUpi: "",
          previousSchool: "",
          bloodGroup: "",
          studentType: "",
          address: "",
          busRoute: "",
          hostel: "",
          roomNumber: "",
          medicalInfo: "",
          guardianFirstName: "",
          guardianLastName: "",
          guardianPhone: "",
          guardianPhoneSecondary: "",
          guardianEmail: "",
          guardianRelation: "",
          guardianAddress: "",
          guardianIdNumber: "",
          selectedSubjects: [],
        });

        // Close modal and notify parent component
        setShowAddModal(false);
        if (onSuccess) {
          onSuccess(newStudent);
        }
      } else {
        setError(response.data.error || "Failed to add student");
      }
    } catch (error) {
      console.error("Error adding student:", error);
      setError(
        error.response?.data?.error ||
          "Failed to add student. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes, hostels, bus routes, and subjects on component mount
  useEffect(() => {
    if (showAddModal) {
      fetchClasses();
      fetchHostels();
      fetchBusRoutes();
      fetchSubjects();
      fetchCurrentAcademicSession();
    }
  }, [showAddModal]);

  // Subject Selection UI Component
  const SubjectSelectionSection = () => {
    if (!formData.class) {
      return (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            Please select a class first to see available subjects.
          </p>
        </div>
      );
    }

    if (availableSubjects.length === 0) {
      return (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">
            No subjects available for this class level and curriculum type. Please contact the administrator.
          </p>
        </div>
      );
    }

    // Find the selected class to display curriculum type
    const selectedClass = classes.find(
      (cls) => cls.level === formData.class && cls.stream === formData.stream
    );
    
    const curriculumType = selectedClass ? selectedClass.curriculum_type : "";
    console.log(hostels)

    return (
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Subject Selection ({curriculumType} Curriculum)
        </h3>
        <div className="bg-white p-4 border rounded-lg">
          <p className="text-sm text-gray-600 mb-3">
            Select the subjects for this student. Only subjects compatible with {curriculumType} curriculum 
            and {formData.class} level are shown.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableSubjects.map((subject) => (
              <div key={subject.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`subject-${subject.id}`}
                  name="subject"
                  value={subject.id}
                  checked={formData.selectedSubjects.includes(subject.id)}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label
                  htmlFor={`subject-${subject.id}`}
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  {subject.name}{" "}
                  <span className="text-gray-500 text-xs">
                    ({subject.code})
                  </span>
                </label>
              </div>
            ))}
          </div>
          {formData.selectedSubjects.length > 0 && (
            <p className="mt-3 text-sm text-gray-600">
              {formData.selectedSubjects.length} subjects selected
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <AnimatedModal isOpen={showAddModal}>
      <form onSubmit={handleSubmit} className="">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-xl font-extrabold text-gray-900">
              Add New Student
            </h2>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 cursor-pointer hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name*
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name*
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Other Names
                </label>
                <input
                  type="text"
                  name="otherNames"
                  value={formData.otherNames}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admission Number*
                </label>
                <input
                  type="text"
                  name="admissionNo"
                  value={formData.admissionNo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NEMIS UPI
                </label>
                <input
                  type="text"
                  name="nemisUpi"
                  value={formData.nemisUpi}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationality
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class*
                </label>
                <select
                  name="class"
                  value={
                    classes.find(
                      (cls) =>
                        cls.level === formData.class &&
                        cls.stream === formData.stream
                    )?.id || ""
                  }
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="">Select class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.level} {cls.stream})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stream (Auto-set from class)
                </label>
                <input
                  type="text"
                  name="stream"
                  value={formData.stream || ""}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-700"
                  disabled={true}
                  readOnly
                />
                <p className="mt-1 text-xs text-gray-500">
                  Stream is automatically set when you select a class
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth*
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender*
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Previous School
                </label>
                <input
                  type="text"
                  name="previousSchool"
                  value={formData.previousSchool}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Boarding Status */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Boarding Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Student Type*
                </label>
                <select
                  name="studentType"
                  value={formData.studentType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="">Select student type</option>
                  <option value="Day Scholar">Day Scholar</option>
                  <option value="Boarder">Boarder</option>
                </select>
              </div>

              {/* Conditional Fields based on Student Type */}
              {formData.studentType === "Day Scholar" && (
                <>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Home Address*
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter physical address"
                      required
                      disabled={loading}
                    ></textarea>
                    <p className="mt-1 text-sm text-gray-500">
                      This will help determine available bus routes
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Bus Routes
                    </label>
                    {formData.address ? (
                      <select
                        name="busRoute"
                        value={formData.busRoute}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                      >
                        <option value="">Select bus route</option>
                        {busRoutes?.map((route) => (
                          <option key={route.id} value={route.id}>
                            {route.route_name} - {route.description || ""}
                          </option>
                        ))}
                        <option value="None">No Bus Required</option>
                      </select>
                    ) : (
                      <div className="text-sm text-gray-500 p-2 border rounded-lg bg-gray-50">
                        Please enter your address to see available bus routes
                      </div>
                    )}
                  </div>
                </>
              )}

              {formData.studentType === "Boarder" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hostel Assignment
                    </label>
                    <select
                      name="hostel"
                      value={formData.hostel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading}
                    >
                      <option value="">Select hostel</option>
                      {hostels.map((hostel) => (
                        <option key={hostel.id} value={hostel.name}>
                          {hostel?.name}-{hostel?.hostel_type} ({hostel?.occupied || 0}/{hostel?.capacity || 0})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Number (Optional)
                    </label>
                    <input
                      type="text"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Leave blank for auto-assignment"
                      disabled={loading}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Subject Selection Section */}
          <SubjectSelectionSection />

          {/* Medical Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Medical Information
            </h3>
            <textarea
              name="medicalInfo"
              value={formData.medicalInfo}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter any medical conditions, allergies, or special needs"
              disabled={loading}
            ></textarea>
          </div>

          {/* Guardian Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Guardian Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guardian First Name*
                </label>
                <input
                  type="text"
                  name="guardianFirstName"
                  value={formData.guardianFirstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guardian Last Name*
                </label>
                <input
                  type="text"
                  name="guardianLastName"
                  value={formData.guardianLastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Number
                </label>
                <input
                  type="text"
                  name="guardianIdNumber"
                  value={formData.guardianIdNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship*
                </label>
                <select
                  name="guardianRelation"
                  value={formData.guardianRelation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="">Select relationship</option>
                  <option value="Parent">Parent</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Phone*
                </label>
                <input
                  type="tel"
                  name="guardianPhone"
                  value={formData.guardianPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Phone
                </label>
                <input
                  type="tel"
                  name="guardianPhoneSecondary"
                  value={formData.guardianPhoneSecondary}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="guardianEmail"
                  value={formData.guardianEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Guardian Address*
                </label>
                <textarea
                  name="guardianAddress"
                  value={formData.guardianAddress}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter physical address"
                  required
                  disabled={loading}
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="border-t px-6 py-4 bg-gray-50  flex justify-between space-x-4 rounded-b-lg">
          <button
            type="button"
            onClick={() => setShowAddModal(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 border rounded-lg"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium cursor-pointer text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Student
              </>
            )}
          </button>
        </div>
      </form>
    </AnimatedModal>
  );
};

export default AddStudentModal;
