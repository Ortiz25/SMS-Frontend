import React, { useState } from "react";
import { X, Calendar, Clock, AlertCircle } from "lucide-react";
import { checkRoomConflict, checkInvigilatorConflict, checkClassConflict } from "../../util/conflictDetection";

const ScheduleExamModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    subject: "",
    class: "",
    date: "",
    startTime: "",
    duration: "",
    room: "",
    invigilator: "",
    instructions: "",
  });
  

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };
  const validateExamSchedule = (examData, existingExams) => {
    const conflicts = {
      room: checkRoomConflict(examData, existingExams),
      invigilator: checkInvigilatorConflict(examData, existingExams),
      class: checkClassConflict(examData, existingExams)
    };
  
    const messages = [];
    
    if (conflicts.room.length > 0) {
      messages.push(`Room ${examData.room} is already booked at this time`);
    }
    
    if (conflicts.invigilator.length > 0) {
      messages.push(`${examData.invigilator} is already assigned to another exam at this time`);
    }
    
    if (conflicts.class.length > 0) {
      messages.push(`Class ${examData.class} already has an exam scheduled at this time`);
    }
  
    return {
      hasConflicts: messages.length > 0,
      messages
    };
  };
  

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject) newErrors.subject = "Subject is required";
    if (!formData.class) newErrors.class = "Class is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.duration) newErrors.duration = "Duration is required";
    if (!formData.room) newErrors.room = "Room is required";
    if (!formData.invigilator)
      newErrors.invigilator = "Invigilator is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const conflicts = validateExamSchedule(formData, existingExams);
      
      if (conflicts.hasConflicts) {
        setErrors(prev => ({
          ...prev,
          conflicts: conflicts.messages
        }));
        return;
      }
      
      onSubmit(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div
          className="fixed inset-0 bg-black opacity-75"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-lg w-full max-w-2xl">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              Schedule New Exam
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* Basic Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject*
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      errors.subject ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                  </select>
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Class Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class*
                  </label>
                  <select
                    value={formData.class}
                    onChange={(e) => handleChange("class", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      errors.class ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Class</option>
                    <option value="Form 1">Form 1</option>
                    <option value="Form 2">Form 2</option>
                    <option value="Form 3">Form 3</option>
                    <option value="Form 4">Form 4</option>
                  </select>
                  {errors.class && (
                    <p className="mt-1 text-sm text-red-600">{errors.class}</p>
                  )}
                </div>
              </div>

              {/* Time and Duration Section - To be continued */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date*
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleChange("date", e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        errors.date ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                  )}
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time*
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        handleChange("startTime", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg ${
                        errors.startTime ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.startTime && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.startTime}
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration*
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => handleChange("duration", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      errors.duration ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Duration</option>
                    <option value="1">1 Hour</option>
                    <option value="1.5">1.5 Hours</option>
                    <option value="2">2 Hours</option>
                    <option value="2.5">2.5 Hours</option>
                    <option value="3">3 Hours</option>
                  </select>
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.duration}
                    </p>
                  )}
                </div>

                {/* Room Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room*
                  </label>
                  <select
                    value={formData.room}
                    onChange={(e) => handleChange("room", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      errors.room ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Room</option>
                    <option value="Hall 1">Hall 1</option>
                    <option value="Hall 2">Hall 2</option>
                    <option value="Room 101">Room 101</option>
                    <option value="Room 102">Room 102</option>
                  </select>
                  {errors.room && (
                    <p className="mt-1 text-sm text-red-600">{errors.room}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invigilator*
                </label>
                <select
                  value={formData.invigilator}
                  onChange={(e) => handleChange("invigilator", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.invigilator ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Invigilator</option>
                  <option value="Mr. John Doe">Mr. John Doe</option>
                  <option value="Mrs. Jane Smith">Mrs. Jane Smith</option>
                  <option value="Mr. David Wilson">Mr. David Wilson</option>
                </select>
                {errors.invigilator && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.invigilator}
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => handleChange("instructions", e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg border-gray-300"
                  placeholder="Add any special instructions or requirements..."
                />
              </div>

              {/* Warning Message */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <p className="ml-3 text-sm text-yellow-700">
                    Please ensure there are no scheduling conflicts before
                    confirming.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-4">
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
                  Schedule Exam
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleExamModal;
