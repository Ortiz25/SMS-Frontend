import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

const AllocationModal = ({ isOpen, onClose, onSave, classes, teachers, rooms, subjects }) => {
  const [formData, setFormData] = useState({
    classId: '',
    subjectId: '',
    teacherId: '',
    hours: '',
    room: '',
    days: []
  });
  const uniqueSubjects = [...new Set(subjects.map((subject) => subject.name))];
  const formattedSubjects = uniqueSubjects.map(name => ({ name }));
  const [errors, setErrors] = useState({});

 
  const validateForm = () => {
    const newErrors = {};
    if (!formData.classId) newErrors.classId = 'Class is required';
    if (!formData.subjectId) newErrors.subjectId = 'Subject is required';
    if (!formData.teacherId) newErrors.teacherId = 'Teacher is required';
    if (!formData.hours) newErrors.hours = 'Hours per week is required';

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
  const random = Math.floor(Math.random() * 10);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 bg-black opacity-75" onClick={onClose} />

        <div className="relative bg-white rounded-lg w-full max-w-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium">New Class Allocation</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class*
              </label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.class ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Class</option>
                {classes.map((cls, index) => (
                  <option key={`${cls.id}-${random}`} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
             
              </select>
              {errors.class && (
                <p className="mt-1 text-sm text-red-600">{errors.class}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject*
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.subject ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Subject</option>
                {subjects.map(sb => (
                  <option key={sb.id} value={sb.id}>
                    {`${sb.name}-${sb.code}`}
                  </option>
                ))}
             
              </select>
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teacher*
              </label>
              <select
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.teacher ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.first_name} {teacher.last_name} - {teacher.subject_specialization?.join(', ') || 'No specialization'}
                  </option>
                ))}
              
              </select>
              {errors.teacher && (
                <p className="mt-1 text-sm text-red-600">{errors.teacher}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hours per Week*
              </label>
              <input
                type="number"
                min="1"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.hours ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.hours && (
                <p className="mt-1 text-sm text-red-600">{errors.hours}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room
              </label>
              <select
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.teacher ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Room</option>
                {rooms.map(sb => (
                  <option key={sb.id} value={sb.name}>
                    {sb.name}
                  </option>
                ))}
              </select>
              {errors.teacher && (
                <p className="mt-1 text-sm text-red-600">{errors.teacher}</p>
              )}
            </div>

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
                Save Allocation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AllocationModal;