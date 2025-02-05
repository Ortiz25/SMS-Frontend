import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DisciplineAnalytics = ({ incidents }) => {
  const analyticsData = [
    { name: 'Misconduct', count: incidents.filter(i => i.type === 'Misconduct').length },
    { name: 'Academic', count: incidents.filter(i => i.type === 'Academic').length },
    { name: 'Attendance', count: incidents.filter(i => i.type === 'Attendance').length },
    { name: 'Other', count: incidents.filter(i => !['Misconduct', 'Academic', 'Attendance'].includes(i.type)).length }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Incident Type Distribution</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Incidents</p>
            <p className="text-2xl font-bold text-gray-900">{incidents.length}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Resolved</p>
            <p className="text-2xl font-bold text-green-600">
              {incidents.filter(i => i.status === 'Resolved').length}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Serious Cases</p>
            <p className="text-2xl font-bold text-red-600">
              {incidents.filter(i => i.severity === 'Serious').length}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-2xl font-bold text-blue-600">
              {incidents.filter(i => new Date(i.date).getMonth() === new Date().getMonth()).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisciplineAnalytics;