import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const EditExamModal = ({
  isOpen,
  onClose,
  onSave,
  examData,
  classes,
  rooms
}) => {
  const initialState = {
    id: "",
    subjectId: "",
    classId: "",
    examDate: "",
    startTime: "",
    endTime: "",
    venue: "",
    supervisorId: "",
    totalMarks: "",
    passingMarks: "",
    status: ""
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // Initialize form data when modal is opened or exam data changes
  useEffect(() => {
    if (isOpen && examData) {
      setFormData({
        id: examData.id || "",
        subjectId: examData.subject_id?.toString() || "",
        classId: examData.class_id?.toString() || "",
        examDate: examData.exam_date || "",
        startTime: examData.start_time || "",
        endTime: examData.end_time || "",
        venue: examData.venue || "",
        supervisorId: examData.supervisor_id?.toString() || "",
        totalMarks: examData.total_marks?.toString() || "100",
        passingMarks: examData.passing_marks?.toString() || "40",
        status: examData.status || "scheduled"
      });
      setErrors({});
      fetchSubjectsAndTeachers();
    }
  }, [isOpen, examData]);

  const fetchSubjectsAndTeachers = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch subjects
      const subjectsResponse = await fetch('http://localhost:5000/api/helpers/subjects', {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!subjectsResponse.ok) throw new Error('Failed to fetch subjects');
      
      const subjectsData = await subjectsResponse.json();
      setSubjects(subjectsData.data);
      
      // Fetch teachers
      const teachersResponse = await fetch('http://localhost:5000/api/teachers', {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!teachersResponse.ok) throw new Error('Failed to fetch teachers');
      
      const teachersData = await teachersResponse.json();
      console.log(teachersData.data)
      setTeachers(teachersData.data);
    } catch (error) {
      console.error('Error fetching subjects and teachers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.subjectId) newErrors.subjectId = "Subject is required";
    if (!formData.classId) newErrors.classId = "Class is required";
    if (!formData.examDate) newErrors.examDate = "Exam date is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";
    if (!formData.venue) newErrors.venue = "Venue is required";
    
    // Validate start time is before end time
    if (formData.startTime && formData.endTime) {
      const start = formData.startTime;
      const end = formData.endTime;
      if (start >= end) {
        newErrors.endTime = "End time must be after start time";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!isOpen || !examData) return null;

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50">
      <div className="bg-black opacity-50 w-full h-full absolute"></div>
      <div className="relative bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Exam Schedule</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Hidden ID field */}
            <input type="hidden" name="id" value={formData.id} />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                name="subjectId"
                value={formData.subjectId}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errors.subjectId ? "border-red-500" : ""}`}
                disabled={examData.status === 'completed'}
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
              {errors.subjectId && <p className="text-red-500 text-xs mt-1">{errors.subjectId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errors.classId ? "border-red-500" : ""}`}
                disabled={examData.status === 'completed'}
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              {errors.classId && <p className="text-red-500 text-xs mt-1">{errors.classId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Date
              </label>
              <input
                type="date"
                name="examDate"
                value={formData.examDate}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errors.examDate ? "border-red-500" : ""}`}
                disabled={examData.status === 'completed'}
              />
              {errors.examDate && <p className="text-red-500 text-xs mt-1">{errors.examDate}</p>}
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
                  className={`w-full p-2 border rounded-lg ${errors.startTime ? "border-red-500" : ""}`}
                  disabled={examData.status === 'completed'}
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
                  className={`w-full p-2 border rounded-lg ${errors.endTime ? "border-red-500" : ""}`}
                  disabled={examData.status === 'completed'}
                />
                {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue
              </label>
              <select
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errors.venue ? "border-red-500" : ""}`}
              >
                <option value="">Select Venue</option>
                {rooms?.map((room) => (
                  <option key={room.id} value={room.room_number}>
                    {room.name || room.room_number} ({room.capacity} capacity)
                  </option>
                ))}
              </select>
              {errors.venue && <p className="text-red-500 text-xs mt-1">{errors.venue}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supervisor (Optional)
              </label>
              <select
                name="supervisorId"
                value={formData.supervisorId}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select Supervisor</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Marks
                </label>
                <input
                  type="number"
                  name="totalMarks"
                  value={formData.totalMarks}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passing Marks
                </label>
                <input
                  type="number"
                  name="passingMarks"
                  value={formData.passingMarks}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                  min="1"
                  max={formData.totalMarks}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
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

export default EditExamModal;