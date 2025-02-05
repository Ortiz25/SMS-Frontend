const AttendanceInfo = ({ student }) => {
    return (
      <div className="space-y-6">
        {/* Attendance Summary */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-green-700">Present</label>
              <p className="mt-1 text-2xl font-medium text-green-900">95%</p>
              <p className="text-sm text-green-600">142 days</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-red-700">Absent</label>
              <p className="mt-1 text-2xl font-medium text-red-900">5%</p>
              <p className="text-sm text-red-600">8 days</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-blue-700">Total</label>
              <p className="mt-1 text-2xl font-medium text-blue-900">150</p>
              <p className="text-sm text-blue-600">School days</p>
            </div>
          </div>
        </div>
  
        {/* Recent Attendance */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Attendance</h3>
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {( [
                  { date: '2024-02-01', status: 'Present', remarks: '' },
                  { date: '2024-02-02', status: 'Present', remarks: '' },
                  { date: '2024-02-03', status: 'Absent', remarks: 'Sick leave' },
                  { date: '2024-02-04', status: 'Present', remarks: '' },
                ]).map((record, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm text-gray-900">{record.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        record.status === 'Present' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{record.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  export default AttendanceInfo;