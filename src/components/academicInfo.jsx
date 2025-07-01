import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Award, BookOpen, Users, ChevronDown, ChevronRight } from 'lucide-react';

const AcademicInfo = ({ student }) => {
    const [academicData, setAcademicData] = useState({
        academicStatus: {
            class: '',
            stream: '',
            curriculum_type: '',
            averageGrade: '',
            average_score: 0
        },
        subjects: {},
        availableExams: [],
        promotionHistory: [],
        examSummaries: []
    });
    const [selectedExam, setSelectedExam] = useState('');
    const [selectedPreviousExam, setSelectedPreviousExam] = useState('');
    const [activeTab, setActiveTab] = useState('current-performance');
    const [expandedPromotion, setExpandedPromotion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAcademicData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch(
                    `/backend/api/academic/student/${student.id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch academic data');
                }

                const data = await response.json();
                let fetchedData = data.data;
                if (fetchedData) {
                    const examNames = Object.keys(fetchedData.subjects || {});
                    setAcademicData({
                        academicStatus: fetchedData.academicStatus || {},
                        subjects: fetchedData.subjects || {},
                        availableExams: examNames,
                        promotionHistory: fetchedData.promotionHistory || [],
                        examSummaries: fetchedData.examSummaries || []
                    });

                    // Auto-select the most recent exam
                    if (examNames.length > 0) {
                        setSelectedExam(examNames[0]);
                    }

                    // Auto-select the most recent previous exam
                    const previousExamNames = examNames.filter(examKey => 
                        fetchedData.subjects[examKey]?.sessionType === 'Previous'
                    );
                    if (previousExamNames.length > 0) {
                        setSelectedPreviousExam(previousExamNames[0]);
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

    if (loading) return (
        <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading academic data...</p>
        </div>
    );
    
    if (error) return (
        <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg">
            {error}
        </div>
    );

    const { academicStatus, subjects, availableExams, promotionHistory, examSummaries } = academicData;
    const selectedSubjects = subjects[selectedExam]?.subjects || [];

    // Helper function to get grade color
    const getGradeColor = (grade) => {
        if (!grade) return 'bg-gray-100 text-gray-800';
        
        const firstChar = grade.charAt(0).toUpperCase();
        if (firstChar === 'A') return 'bg-green-100 text-green-800';
        if (firstChar === 'B') return 'bg-blue-100 text-blue-800';
        if (firstChar === 'C') return 'bg-yellow-100 text-yellow-800';
        if (firstChar === 'D') return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
    };

    // Helper function to get promotion status color
    const getPromotionStatusColor = (status) => {
        switch (status) {
            case 'promoted':
                return 'bg-green-100 text-green-800';
            case 'repeated':
                return 'bg-yellow-100 text-yellow-800';
            case 'transferred':
                return 'bg-blue-100 text-blue-800';
            case 'graduated':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Filter exams by current vs previous sessions
    const currentExams = Object.entries(subjects).filter(([key, value]) => 
        value.sessionType === 'Current'
    );
    const previousExams = Object.entries(subjects).filter(([key, value]) => 
        value.sessionType === 'Previous'
    );

    const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
        <button
            onClick={() => onClick(id)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                isActive
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
            <Icon className="w-4 h-4 mr-2" />
            {label}
        </button>
    );

    const ExamPerformanceTable = ({ examData, title }) => (
        <div className="mb-6">
            <h4 className="text-base font-medium text-gray-900 mb-3">{title}</h4>
            <div className="bg-white border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {examData.length > 0 ? (
                            examData.map((subject, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">{subject.subject}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {subject.score} / {subject.outOf}
                                        <span className="text-xs text-gray-500 ml-1">
                                            ({((subject.score / subject.outOf) * 100).toFixed(1)}%)
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(subject.grade)}`}>
                                            {subject.grade}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{subject.points || '-'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-4 py-6 text-center text-sm text-gray-500">
                                    No exam records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Current Academic Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-blue-500" />
                    Current Academic Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <label className="block text-sm font-medium text-blue-700">Class</label>
                        <p className="mt-1 text-lg font-semibold text-blue-900">
                            {academicStatus.class || student?.current_class || 'N/A'}
                        </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <label className="block text-sm font-medium text-green-700">Stream</label>
                        <p className="mt-1 text-lg font-semibold text-green-900">
                            {academicStatus.stream || student?.stream || 'N/A'}
                        </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <label className="block text-sm font-medium text-purple-700">Curriculum</label>
                        <p className="mt-1 text-lg font-semibold text-purple-900">
                            {academicStatus.curriculum_type || student?.curriculum_type || 'N/A'}
                        </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <label className="block text-sm font-medium text-yellow-700">Average Grade</label>
                        <p className="mt-1 text-lg font-semibold text-yellow-900">
                            {academicStatus.averageGrade || 'N/A'}
                            {academicStatus.average_score && typeof academicStatus.average_score === 'number' && academicStatus.average_score > 0 ? (
                                <span className="text-sm text-yellow-600 block">
                                    ({academicStatus.average_score.toFixed(1)}%)
                                </span>
                            ) : ''}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2">
                <TabButton
                    id="current-performance"
                    label="Current Performance"
                    icon={TrendingUp}
                    isActive={activeTab === 'current-performance'}
                    onClick={setActiveTab}
                />
                <TabButton
                    id="previous-performance"
                    label="Previous Performance"
                    icon={BookOpen}
                    isActive={activeTab === 'previous-performance'}
                    onClick={setActiveTab}
                />
                <TabButton
                    id="promotions"
                    label="Promotion History"
                    icon={Users}
                    isActive={activeTab === 'promotions'}
                    onClick={setActiveTab}
                />
            </div>

            {/* Tab Content */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                {activeTab === 'current-performance' && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Academic Session Performance</h3>
                        
                        {currentExams.length > 0 ? (
                            <div className="space-y-6">
                                {/* Exam Selector for Current Exams */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Examination</label>
                                    <div className="relative max-w-md">
                                        <select
                                            value={selectedExam}
                                            onChange={(e) => setSelectedExam(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md py-2 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {currentExams.map(([examKey]) => (
                                                <option key={examKey} value={examKey}>{examKey}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Selected Exam Performance */}
                                {selectedExam && subjects[selectedExam] && (
                                    <ExamPerformanceTable 
                                        examData={subjects[selectedExam].subjects}
                                        title={`${subjects[selectedExam].examName} Results`}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No current exam records found</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'previous-performance' && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Previous Academic Sessions Performance</h3>
                        
                        {previousExams.length > 0 ? (
                            <div className="space-y-6">
                                {/* Exam Selector for Previous Exams */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Previous Examination</label>
                                    <div className="relative max-w-md">
                                        <select
                                            value={selectedPreviousExam}
                                            onChange={(e) => setSelectedPreviousExam(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md py-2 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Choose an examination...</option>
                                            {previousExams.map(([examKey]) => (
                                                <option key={examKey} value={examKey}>{examKey}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Selected Previous Exam Performance */}
                                {selectedPreviousExam && subjects[selectedPreviousExam] ? (
                                    <ExamPerformanceTable 
                                        examData={subjects[selectedPreviousExam].subjects}
                                        title={`${subjects[selectedPreviousExam].examName} Results (${subjects[selectedPreviousExam].year} Term ${subjects[selectedPreviousExam].term})`}
                                    />
                                ) : selectedPreviousExam ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p>No data found for selected examination</p>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p>Please select an examination to view results</p>
                                    </div>
                                )}

                                {/* Summary of all previous exams */}
                                {selectedPreviousExam && (
                                    <div className="mt-8 pt-6 border-t border-gray-200">
                                        <h4 className="text-base font-medium text-gray-900 mb-4">All Previous Examinations Summary</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {previousExams.map(([examKey, examData]) => (
                                                <div 
                                                    key={examKey}
                                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                        selectedPreviousExam === examKey 
                                                            ? 'border-blue-500 bg-blue-50' 
                                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                                    }`}
                                                    onClick={() => setSelectedPreviousExam(examKey)}
                                                >
                                                    <h5 className="font-medium text-gray-900 truncate">{examData.examName}</h5>
                                                    <p className="text-sm text-gray-600">{examData.year} Term {examData.term}</p>
                                                    <p className="text-sm text-blue-600 mt-1">
                                                        {examData.subjects.length} subjects
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No previous exam records found</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'promotions' && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Class Promotion History</h3>
                        
                        {promotionHistory.length > 0 ? (
                            <div className="space-y-3">
                                {promotionHistory.map((promotion, index) => (
                                    <div 
                                        key={index} 
                                        className="border border-gray-200 rounded-lg overflow-hidden"
                                    >
                                        <div 
                                            className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => setExpandedPromotion(expandedPromotion === index ? null : index)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center">
                                                        {expandedPromotion === index ? 
                                                            <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                                                            <ChevronRight className="w-4 h-4 text-gray-500" />
                                                        }
                                                        <span className="ml-2 font-medium text-gray-900">
                                                            From: {promotion.from_class}
                                                        </span>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPromotionStatusColor(promotion.promotion_status)}`}>
                                                        {promotion.promotion_status.charAt(0).toUpperCase() + promotion.promotion_status.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {promotion.academic_year} Term {promotion.term}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {expandedPromotion === index && (
                                            <div className="p-4 bg-white border-t border-gray-200">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-medium text-gray-700">Promotion Date:</span>
                                                        <p className="text-gray-600">
                                                            {new Date(promotion.promoted_on).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    {promotion.promoted_by && (
                                                        <div>
                                                            <span className="font-medium text-gray-700">Promoted By:</span>
                                                            <p className="text-gray-600">{promotion.promoted_by}</p>
                                                        </div>
                                                    )}
                                                    {promotion.remarks && (
                                                        <div className="md:col-span-2">
                                                            <span className="font-medium text-gray-700">Remarks:</span>
                                                            <p className="text-gray-600 mt-1">{promotion.remarks}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No promotion history found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AcademicInfo;