import { useState, useEffect } from 'react';
import axios from 'axios';

const AttendanceInfo = ({ student }) => {
    const [attendanceData, setAttendanceData] = useState({
        summary: {
            total_days: 0,
            present_days: 0,
            absent_days: 0,
            present_percentage: 0,
            absent_percentage:  0
        },
        recent: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    
    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `/backend/api/attendance/student/${student.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                
                setAttendanceData(response.data.data)
                setLoading(false);
            } catch (err) {
                console.error('Error fetching attendance data:', err);
                setError('Failed to load attendance information');
                setLoading(false);
            }
        };
        
        console.log()
        if (student?.id) {
            fetchAttendanceData();
        }
    }, [student]);
    
    if (loading) return <div className="p-4 text-center">Loading attendance data...</div>;
    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
    
    const { summary, recent } = attendanceData;
   
    return (
        <div className="space-y-6">
            {/* Attendance Summary */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-green-700">Present</label>
                        <p className="mt-1 text-2xl font-medium text-green-900">{summary.present_percentage}%</p>
                        <p className="text-sm text-green-600">{summary.present_days} days</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-red-700">Absent</label>
                        <p className="mt-1 text-2xl font-medium text-red-900">{summary.absent_percentage}%</p>
                        <p className="text-sm text-red-600">{summary.absent_days} days</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-blue-700">Total</label>
                        <p className="mt-1 text-2xl font-medium text-blue-900">{summary.total_days}</p>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {recent.length > 0 ? (
                                recent?.slice(0,5).map((record, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 text-sm text-gray-900">{record.date}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{record.session_type || 'Full day'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                record.status.toLowerCase() === 'present'
                                                    ? 'bg-green-100 text-green-800'
                                                    : record.status.toLowerCase() === 'late'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{record.remarks || '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No attendance records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttendanceInfo;