import React from 'react';

const ReportCardTemplate = ({ student, term, grades }) => {
  return (
    <div className="bg-white p-8 max-w-4xl mx-auto">
      {/* School Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">KENYA SCHOOL</h1>
        <p className="text-gray-600">P.O. Box 123, Nairobi</p>
        <h2 className="text-xl font-bold mt-4">ACADEMIC REPORT CARD</h2>
        <p className="text-gray-600">{term}</p>
      </div>

      {/* Student Information */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <p><span className="font-medium">Name:</span> {student.name}</p>
          <p><span className="font-medium">Admission No:</span> {student.admissionNo}</p>
          <p><span className="font-medium">Class:</span> {student.class}</p>
        </div>
        <div className="text-right">
          <p><span className="font-medium">Term:</span> {term}</p>
          <p><span className="font-medium">Year:</span> 2024</p>
          <p><span className="font-medium">Stream:</span> {student.stream}</p>
        </div>
      </div>

      {/* Academic Performance */}
      <table className="min-w-full divide-y divide-gray-200 mb-8">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {grades.map((grade, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {grade.subject}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {grade.score}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {grade.grade}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {grade.remarks}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="font-medium mb-2">Performance Summary</h3>
          <p><span className="font-medium">Total Marks:</span> {student.totalMarks}</p>
          <p><span className="font-medium">Average Score:</span> {student.average}%</p>
          <p><span className="font-medium">Grade:</span> {student.grade}</p>
        </div>
        <div>
          <h3 className="font-medium mb-2">Class Statistics</h3>
          <p><span className="font-medium">Class Position:</span> {student.position} out of {student.totalStudents}</p>
          <p><span className="font-medium">Stream Position:</span> {student.streamPosition} out of {student.streamTotal}</p>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-4 mb-8">
        <div>
          <h3 className="font-medium mb-2">Class Teacher's Comments</h3>
          <p className="text-sm text-gray-600 p-4 border rounded">
            {student.teacherComments}
          </p>
        </div>
        <div>
          <h3 className="font-medium mb-2">Principal's Comments</h3>
          <p className="text-sm text-gray-600 p-4 border rounded">
            {student.principalComments}
          </p>
        </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-3 gap-6 mt-12">
        <div className="text-center">
          <div className="border-t border-gray-300 pt-2">
            <p className="text-sm font-medium">Class Teacher</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-300 pt-2">
            <p className="text-sm font-medium">Principal</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-300 pt-2">
            <p className="text-sm font-medium">Parent/Guardian</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCardTemplate;