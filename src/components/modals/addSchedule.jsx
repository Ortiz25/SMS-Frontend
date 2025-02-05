import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

const AddScheduleModal = ({ isOpen, onClose, onSave, teachers }) => {
  const [formData, setFormData] = useState({
    day: '',
    time: '',
    class: '',
    subject: '',
    teacher: '',
    room: ''
  });

  const [errors, setErrors] = useState({});

  // Available options
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];
  const classes = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
  const rooms = ['Room 101', 'Room 102', 'Room 103', 'Lab 1', 'Lab 2'];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.day) newErrors.day = 'Day is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.class) newErrors.class = 'Class is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.teacher) newErrors.teacher = 'Teacher is required';
    if (!formData.room) newErrors.room = 'Room is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 bg-black opacity-75" onClick={onClose} />

        <div className="relative bg-white rounded-lg w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium">Add Class Schedule</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Day Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day*
              </label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.day ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Day</option>
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              {errors.day && (
                <p className="mt-1 text-sm text-red-600">{errors.day}</p>
              )}
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time*
              </label>
              <select
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.time ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Time</option>
                {times.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              {errors.time && (
                <p className="mt-1 text-sm text-red-600">{errors.time}</p>
              )}
            </div>

            {/* Class Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class*
              </label>
              <select
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.class ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              {errors.class && (
                <p className="mt-1 text-sm text-red-600">{errors.class}</p>
              )}
            </div>

            {/* Teacher and Subject Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teacher*
              </label>
              <select
                value={formData.teacher}
                onChange={(e) => {
                  const selectedTeacher = teachers.find(t => t.name === e.target.value);
                  setFormData({ 
                    ...formData, 
                    teacher: e.target.value,
                    subject: '' // Reset subject when teacher changes
                  });
                }}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.teacher ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
                ))}
              </select>
              {errors.teacher && (
                <p className="mt-1 text-sm text-red-600">{errors.teacher}</p>
              )}
            </div>

            {/* Subject Selection - Based on selected teacher */}
            {formData.teacher && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject*
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.subject ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Subject</option>
                  {teachers
                    .find(t => t.name === formData.teacher)
                    ?.subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
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
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.room ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Room</option>
                {rooms.map(room => (
                  <option key={room} value={room}>{room}</option>
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
                Add Schedule
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddScheduleModal;