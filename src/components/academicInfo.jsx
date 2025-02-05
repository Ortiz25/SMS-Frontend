const AcademicInfo = ({ student }) => {
    return (
      <div className="space-y-6">
        {/* Current Academic Status */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Academic Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-500">Class</label>
              <p className="mt-1 text-lg font-medium">{student?.class}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-500">Stream</label>
              <p className="mt-1 text-lg font-medium">{student?.stream}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-500">Average Grade</label>
              <p className="mt-1 text-lg font-medium">{student?.averageGrade || 'B+'}</p>
            </div>
          </div>
        </div>
  
        {/* Recent Performance */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Performance</h3>
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(student?.subjects || [
                  { subject: 'Mathematics', score: 85, grade: 'A' },
                  { subject: 'English', score: 78, grade: 'B+' },
                  { subject: 'Physics', score: 82, grade: 'A-' },
                  { subject: 'Chemistry', score: 75, grade: 'B' },
                ]).map((subject, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm text-gray-900">{subject.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{subject.score}%</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {subject.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  export default AcademicInfo;