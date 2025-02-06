import React, { useState } from "react";
import { X } from "lucide-react";
import AnimatedModal from "./animateModal";

const AddStudentModal = ({
  showAddModal,
  setShowAddModal,
  handleSubmit,
  handleInputChange,
  formData,
}) => {

  const allRoutes = [
    {
      id: 'route-1',
      name: 'Route 1',
      areas: 'Karen, Langata',
      matches: ['karen', 'langata', 'lang\'ata'],
      pickupPoints: ['Karen Shopping Center', 'Langata Mall', 'Galleria']
    },
    {
      id: 'route-2',
      name: 'Route 2',
      areas: 'Westlands, Parklands',
      matches: ['westlands', 'parklands'],
      pickupPoints: ['Westlands Mall', 'Parklands Plaza', 'Sarit Center']
    },
    {
      id: 'route-3',
      name: 'Route 3',
      areas: 'Kileleshwa, Lavington',
      matches: ['kileleshwa', 'lavington'],
      pickupPoints: ['Lavington Mall', 'Kileleshwa Ring Road', 'Valley Arcade']
    },
    {
      id: 'route-4',
      name: 'Route 4',
      areas: 'South B, South C',
      matches: ['south b', 'south c', 'southb', 'southc'],
      pickupPoints: ['South B Shopping Center', 'Capital Center', 'City Stadium']
    }
  ];
  
  /**
   * Function to determine available bus routes based on address
   * @param {string} address - The student's home address
   * @returns {Array} Array of matching bus routes
   */
  const getAvailableBusRoutes = (address) => {
    // If no address provided, return empty array
    if (!address) return [];
    
    // Convert address to lowercase for case-insensitive matching
    const lowerAddress = address.toLowerCase();
    
    // Filter routes based on address matching
    const matchingRoutes = allRoutes.filter(route => 
      route.matches.some(area => lowerAddress.includes(area))
    );
  
    // If no matches found, return all routes as options
    if (matchingRoutes.length === 0) {
      console.log('No direct route matches found for address:', address);
      return allRoutes;
    }
  
    console.log(`Found ${matchingRoutes.length} matching routes for address:`, address);
    return matchingRoutes;
  };
  return (
    <AnimatedModal isOpen={showAddModal}>
      <form onSubmit={handleSubmit} className="">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-xl font-bold text-gray-900">Add New Student</h2>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name*
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
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
                >
                  <option value="">Select class</option>
                  <option value="Form 1">Form 1</option>
                  <option value="Form 2">Form 2</option>
                  <option value="Form 3">Form 3</option>
                  <option value="Form 4">Form 4</option>
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
                >
                  <option value="">Select stream</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Boarding Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Type*
                </label>
                <select
                  name="studentType"
                  value={formData.studentType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      >
                        <option value="">Select bus route</option>
                        {getAvailableBusRoutes(formData.address).map((route) => (
                          <option key={route.id} value={route.id}>
                            {route.name} - {route.areas}
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
                  >
                    <option value="">Select hostel</option>
                    <option value="Block A">Block A</option>
                    <option value="Block B">Block B</option>
                    <option value="Block C">Block C</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Medical Information
            </h3>
            <textarea
              name="medicalInfo"
              value={formData.medicalInfo}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter any medical conditions, allergies, or special needs"
            ></textarea>
          </div>

          {/* Guardian Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Guardian Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guardian Name*
                </label>
                <input
                  type="text"
                  name="guardianName"
                  value={formData.guardianName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
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

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows="2"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter physical address"
            ></textarea>
          </div>
        </div>

        {/* Form Actions */}
        <div className="border-t px-6 py-4 bg-gray-50 flex justify-between space-x-4 rounded-b-lg">
          <button
            type="button"
            onClick={() => setShowAddModal(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Save Student
          </button>
        </div>
      </form>
    </AnimatedModal>
  );
};

export default AddStudentModal;