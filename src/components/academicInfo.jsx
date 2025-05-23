import { useState, useEffect } from 'react';
import axios from 'axios';

const AcademicInfo = ({ student }) => {
    const [academicData, setAcademicData] = useState({
        academicStatus: {
            class: '',
            stream: '',
            averageGrade: '',
            average_score: 0
        },
        subjects: {},
        availableExams: []
    });
    const [selectedExam, setSelectedExam] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAcademicData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `/backend/api/academic/student/${student.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                let fetchedData = response.data.data;
                if (fetchedData && fetchedData.subjects) {
                    const examNames = Object.keys(fetchedData.subjects);
                    setAcademicData({
                        academicStatus: fetchedData.academicStatus || {},
                        subjects: fetchedData.subjects,
                        availableExams: examNames
                    });

                    // Auto-select the most recent exam
                    if (examNames.length > 0) {
                        setSelectedExam(examNames[0]);
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching academic data:', err);
                setError('Failed to load academic information');
                setLoading(false);
            }
        };

        if (student?.id) {
            fetchAcademicData();
        }
    }, [student]);

    if (loading) return <div className="p-4 text-center">Loading academic data...</div>;
    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

    const { academicStatus, subjects, availableExams } = academicData;
    const selectedSubjects = subjects[selectedExam] || [];

    // Helper function to get grade color
    const getGradeColor = (grade) => {
        if (!grade) return 'bg-gray-100 text-gray-800';
        
        const firstChar = grade.charAt(0);
        if (firstChar === 'A') return 'bg-green-100 text-green-800';
        if (firstChar === 'B') return 'bg-blue-100 text-blue-800';
        if (firstChar === 'C') return 'bg-yellow-100 text-yellow-800';
        if (firstChar === 'D') return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <div className="space-y-6">
            {/* Current Academic Status */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Academic Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-500">Class</label>
                        <p className="mt-1 text-lg font-medium">{academicStatus.class || student?.class || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-500">Stream</label>
                        <p className="mt-1 text-lg font-medium">{academicStatus.stream || student?.stream || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-500">Average Grade</label>
                        <p className="mt-1 text-lg font-medium">
                            {academicStatus.averageGrade || student?.averageGrade || 'N/A'}
                            {academicStatus.average_score ? ` (${+academicStatus.average_score}%)` : ''}
                        </p>
                    </div>
                </div>
            </div>

            {/* Exam Selector */}
            {availableExams.length > 0 && (
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Select Examination</h3>
                    <select
                        value={selectedExam}
                        onChange={(e) => setSelectedExam(e.target.value)}
                        className="w-full border border-gray-300 rounded-md py-2 px-3"
                    >
                        {availableExams.map((exam) => (
                            <option key={exam} value={exam}>{exam}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Recent Performance */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Exam Performance - {selectedExam}</h3>
                <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {selectedSubjects.length > 0 ? (
                                selectedSubjects.map((subject, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 text-sm text-gray-900">{subject.subject}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{subject.score} / {subject.outOf}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(subject.grade)}`}>
                                                {subject.grade}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{subject.remarks || '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No academic records found for {selectedExam}
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

export default AcademicInfo;
