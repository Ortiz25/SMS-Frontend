import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const EditScheduleModal = ({ isOpen, onClose, onSave, scheduleData, teachers, subjects, rooms }) => {
  const [formData, setFormData] = useState({
    id: "",
    subject: "",
    subjectId: "",
    teacher: "",
    teacherId: "",
    room: "",
    startTime: "",
    endTime: "",
    day: "",
    time: ""
  });
  

  useEffect(() => {
    if (scheduleData) {
      setFormData({
        id: scheduleData.id || "",
        subject: scheduleData.subject || "",
        subjectId: scheduleData.subjectId || "",
        teacher: scheduleData.teacherName || "",
        teacherId: scheduleData.teacherId || "",
        room: scheduleData.room || "",
        startTime: scheduleData.startTime || "",
        endTime: scheduleData.endTime || "",
        day: scheduleData.day || "",
        time: scheduleData.time || ""
      });
    }
  }, [scheduleData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If teacher is changed, update teacherId as well
    if (name === "teacher" && teachers) {
      const selectedTeacher = teachers.find(t => t.name === value);
      setFormData({
        ...formData,
        teacher: value,
        teacherId: selectedTeacher ? selectedTeacher.id : ""
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a copy of the original data for reference
    const originalData = { ...scheduleData };
    
    // Combine with form data for the save handler
    onSave({
      ...formData,
      originalData
    });
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
       <div className="bg-black opacity-50 w-full h-full absolute"></div>
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 z-50 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Schedule</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teacher
              </label>
              <select
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="">Select Teacher</option>
                {teachers && teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.name}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room
              </label>
              <input
                type="text"
                name="room"
                value={formData.room}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditScheduleModal;