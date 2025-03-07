import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EditAllocationModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  allocation, 
  classes, 
  teachers, 
  subjects, 
  academicSessions 
}) => {
  const [formData, setFormData] = useState({
    id: '',
    classId: '',
    teacherId: '',
    subjectId: '',
    academicSessionId: ''
  });
  
  const [errors, setErrors] = useState({});
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  // Initialize form data when allocation or modal state changes
  useEffect(() => {
    if (isOpen && allocation) {
      setFormData({
        id: allocation.id,
        classId: allocation.class_id?.toString() || '',
        teacherId: allocation.teacher_id?.toString() || '',
        subjectId: allocation.subject_id?.toString() || '',
        academicSessionId: allocation.academic_session_id?.toString() || ''
      });
      setErrors({});
    }
  }, [isOpen, allocation]);

  // Filter subjects based on teacher's specialization when teacher changes
  useEffect(() => {
    if (formData.teacherId) {
      const selectedTeacher = teachers.find(t => t.id.toString() === formData.teacherId.toString());
      
      if (selectedTeacher && selectedTeacher.subject_specialization && selectedTeacher.subject_specialization.length > 0) {
        // Filter subjects based on teacher's specialization
        const filtered = subjects.filter(subject => 
          selectedTeacher.subject_specialization.includes(subject.name) || 
          selectedTeacher.subject_specialization.includes(subject.code)
        );
        
        setFilteredSubjects(filtered);
      } else {
        // If no specialization or teacher not found, show all subjects
        setFilteredSubjects(subjects);
      }
    } else {
      // If no teacher selected, show all subjects
      setFilteredSubjects(subjects);
    }
  }, [formData.teacherId, teachers, subjects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear errors for the field being edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.classId) newErrors.classId = 'Class is required';
    if (!formData.teacherId) newErrors.teacherId = 'Teacher is required';
    if (!formData.subjectId) newErrors.subjectId = 'Subject is required';
    if (!formData.academicSessionId) newErrors.academicSessionId = 'Academic session is required';
    
    // Check for compatibility between teacher and subject
    if (formData.teacherId && formData.subjectId) {
      const selectedTeacher = teachers.find(t => t.id.toString() === formData.teacherId.toString());
      const selectedSubject = subjects.find(s => s.id.toString() === formData.subjectId.toString());
      
      if (selectedTeacher && selectedSubject && selectedTeacher.subject_specialization && 
          !selectedTeacher.subject_specialization.includes(selectedSubject.name) && 
          !selectedTeacher.subject_specialization.includes(selectedSubject.code)) {
        newErrors.subjectId = 'Selected subject is not in teacher\'s specialization';
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

  if (!isOpen || !allocation) return null;

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50">
      <div className="bg-black opacity-50 w-full h-full absolute"></div>
      <div className="relative bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Class Allocation</h2>
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
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errors.classId ? 'border-red-500' : ''}`}
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              {errors.classId && <p className="text-red-500 text-xs mt-1">{errors.classId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teacher
              </label>
              <select
                name="teacherId"
                value={formData.teacherId}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errors.teacherId ? 'border-red-500' : ''}`}
              >
                <option value="">Select Teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.first_name} {teacher.last_name} - {teacher.subject_specialization?.join(', ') || 'No specialization'}
                  </option>
                ))}
              </select>
              {errors.teacherId && <p className="text-red-500 text-xs mt-1">{errors.teacherId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                name="subjectId"
                value={formData.subjectId}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errors.subjectId ? 'border-red-500' : ''}`}
              >
                <option value="">Select Subject</option>
                {filteredSubjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
              {errors.subjectId && <p className="text-red-500 text-xs mt-1">{errors.subjectId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Session
              </label>
              <select
                name="academicSessionId"
                value={formData.academicSessionId}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errors.academicSessionId ? 'border-red-500' : ''}`}
              >
                <option value="">Select Academic Session</option>
                {academicSessions.map(session => (
                  <option key={session.id} value={session.id}>
                    {session.year} - Term {session.term} {session.is_current ? '(Current)' : ''}
                  </option>
                ))}
              </select>
              {errors.academicSessionId && <p className="text-red-500 text-xs mt-1">{errors.academicSessionId}</p>}
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

export default EditAllocationModal;