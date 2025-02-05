import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Filter } from 'lucide-react';

const Analytics = () => {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('term1');

  // Sample performance data
  const classPerformance = [
    { subject: 'Mathematics', A: 15, B: 25, C: 30, D: 20, E: 10 },
    { subject: 'English', A: 20, B: 30, C: 25, D: 15, E: 10 },
    { subject: 'Physics', A: 10, B: 20, C: 35, D: 25, E: 10 },
    { subject: 'Chemistry', A: 12, B: 28, C: 32, D: 18, E: 10 },
    { subject: 'Biology', A: 18, B: 22, C: 30, D: 20, E: 10 }
  ];

  // Sample trend data
  const trendData = [
    { month: 'Jan', average: 65 },
    { month: 'Feb', average: 68 },
    { month: 'Mar', average: 72 },
    { month: 'Apr', average: 70 },
    { month: 'May', average: 75 }
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
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

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">All Subjects</option>
          <option value="mathematics">Mathematics</option>
          <option value="english">English</option>
          <option value="physics">Physics</option>
        </select>

        <select
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="term1">Term 1</option>
          <option value="term2">Term 2</option>
          <option value="term3">Term 3</option>
        </select>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Grade Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="A" fill="#4CAF50" />
                <Bar dataKey="B" fill="#2196F3" />
                <Bar dataKey="C" fill="#FFC107" />
                <Bar dataKey="D" fill="#FF9800" />
                <Bar dataKey="E" fill="#F44336" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Trends */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="average" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Class Average</p>
              <p className="text-2xl font-bold text-gray-900">72%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Highest Score</p>
              <p className="text-2xl font-bold text-green-600">92%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Lowest Score</p>
              <p className="text-2xl font-bold text-red-600">45%</p>
            </div>
          </div>
        </div>

        {/* Pass Rate */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pass Rate</h3>
          <div className="space-y-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                    Pass Rate
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-green-600">
                    78%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                <div style={{ width: "78%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;