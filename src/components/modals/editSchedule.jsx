import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";

const EditScheduleModal = ({
  isOpen,
  onClose,
  onSave,
  scheduleData,
  teachers,
}) => {
  const [conflicts, setConflicts] = useState([]);
  const [formData, setFormData] = useState({
    day: "",
    time: "",
    class: "",
    subject: "",
    teacher: "",
    room: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (scheduleData) {
      setFormData({
        day: scheduleData.day,
        time: scheduleData.time,
        class: scheduleData.class,
        subject: scheduleData.subject,
        teacher: scheduleData.teacher,
        room: scheduleData.room,
      });
    }
  }, [scheduleData]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const times = [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
  ];
  const classes = ["Form 1", "Form 2", "Form 3", "Form 4"];
  const rooms = ["Room 101", "Room 102", "Room 103", "Lab 1", "Lab 2"];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.subject) newErrors.subject = "Subject is required";
    if (!formData.teacher) newErrors.teacher = "Teacher is required";
    if (!formData.room) newErrors.room = "Room is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (!isOpen) return null;

  // Add check before form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Check for validation errors first
    if (!validateForm()) return;

    // Check for scheduling conflicts
    const currentConflicts = checkScheduleConflicts(
      formData,
      existingSchedule,
      scheduleData // original schedule data
    );

    if (currentConflicts.length > 0) {
      setConflicts(currentConflicts);
      return;
    }

    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 bg-black opacity-75" onClick={onClose} />

        <div className="relative bg-white rounded-lg w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium">Edit Class Schedule</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Read-only fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day
                </label>
                <input
                  type="text"
                  value={formData.day}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="text"
                  value={formData.time}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                />
              </div>
            </div>

            {/* Editable fields */}
            {/* Teacher Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teacher*
              </label>
              <select
                value={formData.teacher}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    teacher: e.target.value,
                    subject: "", // Reset subject when teacher changes
                  });
                }}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.teacher ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.name}>
                    {teacher.name}
                  </option>
                ))}
              </select>
              {errors.teacher && (
                <p className="mt-1 text-sm text-red-600">{errors.teacher}</p>
              )}
            </div>

            {/* Subject Selection */}
            {formData.teacher && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject*
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.subject ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Subject</option>
                  {teachers
                    .find((t) => t.name === formData.teacher)
                    ?.subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                </select>
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                )}
              </div>
            )}

            {/* Room Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room*
              </label>
              <select
                value={formData.room}
                onChange={(e) =>
                  setFormData({ ...formData, room: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.room ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Room</option>
                {rooms.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
              {errors.room && (
                <p className="mt-1 text-sm text-red-600">{errors.room}</p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="pt-4 border-t flex justify-end space-x-4">
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
          {conflicts.length > 0 && (
            <div className="space-y-2">
              {conflicts.map((conflict, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Scheduling Conflict
                    </p>
                    <p className="text-sm text-red-600">{conflict.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditScheduleModal;
