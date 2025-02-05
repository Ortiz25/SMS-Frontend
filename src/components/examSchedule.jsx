import React, { useState } from "react";
import { Plus, Calendar, Search, Filter, Download } from "lucide-react";
import ExamList from "./examList";
import ScheduleExamModal from "./modals/examSchedule";


const ExamSchedule = () => {
  const [selectedTerm, setSelectedTerm] = useState("term1");
  const [selectedClass, setSelectedClass] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [examList, setExamList] = useState([]);


  const handleScheduleExam = (examData) => {
    // Add new exam to the list
    const newExam = {
      id: Date.now(), // temporary ID
      ...examData,
      status: "upcoming",
    };

    setExamList((prevExams) => [...prevExams, newExam]);
    setShowScheduleModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="term1">Term 1</option>
            <option value="term2">Term 2</option>
            <option value="term3">Term 3</option>
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Classes</option>
            <option value="form1">Form 1</option>
            <option value="form2">Form 2</option>
            <option value="form3">Form 3</option>
            <option value="form4">Form 4</option>
          </select>

          <div className="relative">
            <input
              type="text"
              placeholder="Search exams..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
            <Download className="h-5 w-5" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Schedule Exam</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Exams</h3>
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-gray-600">Scheduled this term</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Upcoming</h3>
            <Calendar className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold">5</div>
          <p className="text-xs text-green-600">Within next 7 days</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Completed</h3>
            <Calendar className="h-5 w-5 text-gray-600" />
          </div>
          <div className="text-2xl font-bold">7</div>
          <p className="text-xs text-gray-600">This term</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Rooms Used</h3>
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">4</div>
          <p className="text-xs text-gray-600">Active exam rooms</p>
        </div>
      </div>
      
      {/* Exam List will be added next */}
      <ExamList />
      <ScheduleExamModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSubmit={handleScheduleExam}
      />
    </div>
  );
};

export default ExamSchedule;
