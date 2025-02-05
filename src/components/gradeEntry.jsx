import React, { useState } from 'react';
import { Edit, Save, X } from 'lucide-react';

// Helper function to calculate grade from score
const calculateGrade = (score) => {
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'E';
  };
  

const GradeEntry = () => {
  const [editMode, setEditMode] = useState(false);
  const [grades, setGrades] = useState({});

  // Sample student data
  const students = [
    { id: 1, name: 'John Doe', admissionNo: 'KPS2024001' },
    { id: 2, name: 'Jane Smith', admissionNo: 'KPS2024002' },
    // Add more students...
  ];

  const handleGradeChange = (studentId, field, value) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const calculateTotal = (studentId) => {
    const studentGrades = grades[studentId] || {};
    const total = parseFloat(studentGrades.score || 0);
    return total.toFixed(1);
  };

  return (
    <div>
      <div className="overflow-x-auto">
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Remarks
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
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
                  {editMode ? (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={grades[student.id]?.score || ''}
                      onChange={(e) => handleGradeChange(student.id, 'score', e.target.value)}
                      className="w-20 px-2 py-1 border rounded"
                    />
                  ) : (
                    <span className="text-sm text-gray-900">
                      {grades[student.id]?.score || '-'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {calculateGrade(calculateTotal(student.id))}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editMode ? (
                    <input
                      type="text"
                      value={grades[student.id]?.remarks || ''}
                      onChange={(e) => handleGradeChange(student.id, 'remarks', e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    <span className="text-sm text-gray-900">
                      {grades[student.id]?.remarks || '-'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-end space-x-4">
        {editMode ? (
          <>
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              <span>Save Grades</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Grades</span>
          </button>
        )}
      </div>
    </div>
  );
};


export default GradeEntry;