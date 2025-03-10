import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const AddScheduleModal = ({ isOpen, onClose, onSave, classes, teachers, rooms }) => {
  const token = localStorage.getItem("token");
  const initialState = {
    classId: "",
    class: "",
    subjectId: "",
    subject: "",
    teacherId: "",
    teacherName: "",
    room: "",
    day: "",
    startTime: "",
    endTime: "",
    academicSessionId: ""
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, updateSubjects] = useState()


   // Fetch users on component mount
    useEffect(() => {
      const fetchSubjects = async () => {
        try {
          setLoading(true);
          const response = await fetch("/backend/api/helpers", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
  
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
  
          const data = await response.json();
            console.log(data)
          updateSubjects(data.data);
          setError(null);
        } catch (err) {
          setError(`Failed to fetch users: ${err.message}`);
          console.error("Error fetching users:", err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchSubjects();
    }, [formData]);

    console.log(subjects)

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setFormData(initialState);
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "class" && classes) {
      const selectedClass = classes.find(c => c.name === value);
      setFormData({
        ...formData,
        class: value,
        classId: selectedClass ? selectedClass.id : ""
      });
    } else if (name === "teacher" && teachers) {
      const selectedTeacher = teachers.find(t => t.name === value);
      setFormData({
        ...formData,
        teacherName: value,
        teacherId: selectedTeacher ? selectedTeacher.id : ""
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.class) newErrors.class = "Class is required";
    if (!formData.subject) newErrors.subject = "Subject is required";
    if (!formData.subjectId) newErrors.subjectId = "Subject ID is required";
    if (!formData.teacherName) newErrors.teacher = "Teacher is required";
    if (!formData.room) newErrors.room = "Room is required";
    if (!formData.day) newErrors.day = "Day is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";
    
    // Check if end time is after start time
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = "End time must be after start time";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
      setFormData(initialState);
      onClose();
    }
  };

  if (!isOpen) return null;

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-black opacity-50 w-full h-full absolute"></div>
      <div className="relative bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Schedule</h2>
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
                Class
              </label>
              <select
                name="class"
                value={formData.class}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errors.class ? 'border-red-500' : ''}`}
              >
                <option value="">Select Class</option>
                {classes && classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.class && <p className="text-red-500 text-xs mt-1">{errors.class}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errors.subject ? 'border-red-500' : ''}`}
              >
                <option value="">Select Subject</option>
                {subjects && subjects.map((subject) => (
                  <option key={subject.id} value={subject.name}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject ID
              </label>
              <input
                type="text"
                name="subjectId"
                value={subjects?.find(s => s.name === formData.subject)?.id || ''}
                readOnly
                className={`w-full p-2 border rounded-lg bg-gray-100 ${errors.subjectId ? 'border-red-500' : ''}`}
                placeholder="Subject ID will be auto-populated"
              />
              {errors.subjectId && <p className="text-red-500 text-xs mt-1">{errors.subjectId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teacher
              </label>
              <select
                name="teacher"
                value={formData.teacherName}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errors.teacher ? 'border-red-500' : ''}`}
              >
                <option value="">Select Teacher</option>
                {teachers && teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.name}>
                    {teacher.name}
                  </option>
                ))}
              </select>
              {errors.teacher && <p className="text-red-500 text-xs mt-1">{errors.teacher}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room
              </label>
              <select
                name="room"
                value={formData.room}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errors.room ? 'border-red-500' : ''}`}
              >
                <option value="">Select Room</option>
                {rooms && rooms.map((room) => (
                  <option key={room.name} value={room.name}>
                    {room.name}
                  </option>
                ))}
              </select>
              {errors.room && <p className="text-red-500 text-xs mt-1">{errors.room}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day
              </label>
              <select
                name="day"
                value={formData.day}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errors.day ? 'border-red-500' : ''}`}
              >
                <option value="">Select Day</option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              {errors.day && <p className="text-red-500 text-xs mt-1">{errors.day}</p>}
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
                  className={`w-full p-2 border rounded-lg ${errors.startTime ? 'border-red-500' : ''}`}
                />
                {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
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
                  className={`w-full p-2 border rounded-lg ${errors.endTime ? 'border-red-500' : ''}`}
                />
                {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Session ID
              </label>
              <input
                type="text"
                name="academicSessionId"
                value={formData.academicSessionId}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                placeholder="Leave blank for current session"
              />
              <p className="text-xs text-gray-500 mt-1">Optional - defaults to current session</p>
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
                Add Schedule
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddScheduleModal;