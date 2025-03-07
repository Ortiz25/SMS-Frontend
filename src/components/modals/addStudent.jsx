import React, { useState, useEffect } from "react";
import { X, Loader, AlertCircle, Check } from "lucide-react";
import AnimatedModal from "./animateModal";
import axios from "axios";

const AddStudentModal = ({ showAddModal, setShowAddModal, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    otherName: "",
    admissionNo: "",
    class: "",
    stream: "",
    dateOfBirth: "",
    gender: "",
    studentType: "",
    address: "",
    busRoute: "",
    hostel: "",
    medicalInfo: "",
    guardianFirstName: "",
    guardianLastName: "",
    guardianPhone: "",
    guardianEmail: "",
    guardianRelation: "",
    guardianAddress: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [busRoutes, setBusRoutes] = useState([]);

  // Fetch classes, hostels, and bus routes on component mount
  useEffect(() => {
    if (showAddModal) {
      fetchClasses();
      fetchHostels();
      fetchBusRoutes();
    }
  }, [showAddModal]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5001/api/classes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);

      if (response.data.success) {
        setClasses(response.data.data);
        console.log(response.data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchHostels = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5001/api/hostels", {
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
        "http://localhost:5001/api/hostel-transport/routes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setBusRoutes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching bus routes:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5001/api/students/add",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Clear form data
        setFormData({
          firstName: "",
          lastName: "",
          otherName: "",
          admissionNo: "",
          class: "",
          stream: "",
          dateOfBirth: "",
          gender: "",
          studentType: "",
          address: "",
          busRoute: "",
          hostel: "",
          medicalInfo: "",
          guardianFirstName: "",
          guardianLastName: "",
          guardianPhone: "",
          guardianEmail: "",
          guardianRelation: "",
          guardianAddress: "",
        });

        // Close modal and notify parent component
        setShowAddModal(false);
        if (onSuccess) {
          onSuccess(response.data.data);
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

  /**
   * Function to determine available bus routes based on address
   * @param {string} address - The student's home address
   * @returns {Array} Array of matching bus routes
   */
  const getAvailableBusRoutes = (address) => {
    if (!address || busRoutes.length === 0) return [];

    // If we have fetched bus routes from API, use those
    if (busRoutes.length > 0) {
      return busRoutes;
    }

    // Fallback to the static routes if API fetch failed
    const allRoutes = [
      {
        id: "route-1",
        route_name: "Route 1",
        areas: "Karen, Langata",
        matches: ["karen", "langata", "lang'ata"],
        pickupPoints: ["Karen Shopping Center", "Langata Mall", "Galleria"],
      },
      // Other routes...
    ];

    // Convert address to lowercase for case-insensitive matching
    const lowerAddress = address.toLowerCase();

    // Filter routes based on address matching
    const matchingRoutes = allRoutes.filter((route) =>
      route.matches.some((area) => lowerAddress.includes(area))
    );

    // If no matches found, return all routes as options
    if (matchingRoutes.length === 0) {
      return allRoutes;
    }

    return matchingRoutes;
  };

  console.log(classes);

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
              className="text-gray-400 hover:text-gray-500"
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
                  Other Name*
                </label>
                <input
                  type="text"
                  name="otherName"
                  value={formData.otherName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
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
                  Class*
                </label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="">Select class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stream
                </label>
                <select
                  name="stream"
                  value={formData.stream}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="">Select stream</option>
                  {formData.class ? (
                    <>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </>
                  ) : null}
                </select>
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
                        {busRoutes.map((route) => (
                          <option key={route.id} value={route.id}>
                            {route.route_name} - {route.description}
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
                        {hostel.name} ({hostel.occupied}/{hostel.capacity})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

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
                  Phone Number*
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
                    <p className="mt-1 text-sm text-gray-500">
                      This will help determine available bus routes
                    </p>
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
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="border-t px-6 py-4 bg-gray-50 flex justify-between space-x-4 rounded-b-lg">
          <button
            type="button"
            onClick={() => setShowAddModal(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border rounded-lg"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center"
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
