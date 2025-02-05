import React, { useState } from 'react';
import { X, Upload, Save, AlertCircle } from 'lucide-react';

// Helper function to calculate grade
const calculateGrade = (score) => {
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'E';
  };

const AddGradesModal = ({ isOpen, onClose, onSave }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [grades, setGrades] = useState([]);
  const [errors, setErrors] = useState({});

  // Sample students data - in real app, fetch based on selected class
  const students = [
    { id: 1, name: 'John Doe', admissionNo: 'KPS2024001' },
    { id: 2, name: 'Jane Smith', admissionNo: 'KPS2024002' },
    { id: 3, name: 'Mike Johnson', admissionNo: 'KPS2024003' },
  ];

  const handleGradeChange = (studentId, value) => {
    const score = parseInt(value);
    if (isNaN(score) || score < 0 || score > 100) {
      setErrors(prev => ({
        ...prev,
        [studentId]: 'Score must be between 0 and 100'
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[studentId];
        return newErrors;
      });
    }

    setGrades(prev => {
      const existing = prev.findIndex(g => g.studentId === studentId);
      if (existing >= 0) {
        return prev.map(g => 
          g.studentId === studentId ? { ...g, score } : g
        );
      }
      return [...prev, { studentId, score }];
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject || !examDate) {
      setErrors(prev => ({
        ...prev,
        form: 'Please fill in all required fields'
      }));
      return;
    }

    if (Object.keys(errors).length > 0) return;

    onSave({
      class: selectedClass,
      subject: selectedSubject,
      examDate,
      grades
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black opacity-75" onClick={onClose} />

        <div className="relative bg-white rounded-lg w-full max-w-4xl">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-medium">Add Exam Grades</h3>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class*
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select Class</option>
                    <option value="Form 1">Form 1</option>
                    <option value="Form 2">Form 2</option>
                    <option value="Form 3">Form 3</option>
                    <option value="Form 4">Form 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject*
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Date*
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Grade Entry Table */}
              <div className="mt-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {student.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.admissionNo}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className={`w-20 px-2 py-1 border rounded ${
                              errors[student.id] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            onChange={(e) => handleGradeChange(student.id, e.target.value)}
                          />
                          {errors[student.id] && (
                            <p className="mt-1 text-xs text-red-600">{errors[student.id]}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {grades.find(g => g.studentId === student.id)?.score >= 0 && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {calculateGrade(grades.find(g => g.studentId === student.id)?.score)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t ">
              {errors.form && (
                <p className="text-sm text-red-600">{errors.form}</p>
              )}
              <div className=" flex justify-between items-center">
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
                  Save Grades
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};



export default AddGradesModal;