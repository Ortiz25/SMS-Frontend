// src/components/disciplineAnalytics.jsx
import React, { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts";
import disciplinaryService from "../util/disciplinaryServices";

const DisciplineAnalytics = ({ incidents }) => {
  const [period, setPeriod] = useState('year');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hard-coded visualization data for a guaranteed display
  const [analyticsData, setAnalyticsData] = useState({
    incidentsByType: [],
    incidentsBySeverity: [
      { name: "Minor", value: 0 },
      { name: "Moderate", value: 0 },
      { name: "Severe", value: 0 }
    ],
    incidentsByStatus: [
      { name: "Pending", value: 0 },
      { name: "In Progress", value: 0 },
      { name: "Resolved", value: 0 }
    ],
    incidentsByMonth: [],
    incidentsByClass: []
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Specific colors for severity
  const SEVERITY_COLORS = {
    "Minor": "#00C49F",  // Green
    "Moderate": "#FFBB28", // Yellow
    "Severe": "#FF8042"  // Orange/Red
  };
  
  // Specific colors for status
  const STATUS_COLORS = {
    "Pending": "#FFBB28",  // Yellow
    "In Progress": "#0088FE", // Blue
    "Resolved": "#00C49F"  // Green
  };

  // Use local calculation for analytics
  useEffect(() => {
    const calculateAnalytics = () => {
      if (!incidents || incidents.length === 0) {
        return;
      }
      
      try {
        setLoading(true);
        
        // Count incidents by type
        const typeCount = {};
        incidents.forEach(incident => {
          if (incident.type) {
            typeCount[incident.type] = (typeCount[incident.type] || 0) + 1;
          }
        });
        const incidentsByType = Object.keys(typeCount)
          .map(type => ({ type, count: typeCount[type] }))
          .sort((a, b) => b.count - a.count);

        // Count incidents by severity
        const severityCount = { "Minor": 0, "Moderate": 0, "Severe": 0 };
        incidents.forEach(incident => {
          if (incident.severity) {
            severityCount[incident.severity] = (severityCount[incident.severity] || 0) + 1;
          }
        });
        const incidentsBySeverity = Object.keys(severityCount)
          .map(severity => ({ name: severity, value: severityCount[severity] }));

        // Count incidents by status
        const statusCount = { "Pending": 0, "In Progress": 0, "Resolved": 0 };
        incidents.forEach(incident => {
          if (incident.status) {
            statusCount[incident.status] = (statusCount[incident.status] || 0) + 1;
          }
        });
        const incidentsByStatus = Object.keys(statusCount)
          .map(status => ({ name: status, value: statusCount[status] }));

        // Count incidents by month (current year)
        const currentYear = new Date().getFullYear();
        const monthCount = {};
        incidents.forEach(incident => {
          if (incident.date) {
            const date = new Date(incident.date);
            if (date.getFullYear() === currentYear) {
              const month = date.getMonth();
              monthCount[month] = (monthCount[month] || 0) + 1;
            }
          }
        });
        const incidentsByMonth = Object.keys(monthCount)
          .map(month => ({ 
            name: MONTHS[parseInt(month)], 
            count: monthCount[month] 
          }))
          .sort((a, b) => parseInt(MONTHS.indexOf(a.name)) - parseInt(MONTHS.indexOf(b.name)));

        // Count incidents by class
        const classCount = {};
        incidents.forEach(incident => {
          if (incident.grade) {
            classCount[incident.grade] = (classCount[incident.grade] || 0) + 1;
          }
        });
        const incidentsByClass = Object.keys(classCount)
          .map(grade => ({ class: grade, count: classCount[grade] }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setAnalyticsData({
          incidentsByType,
          incidentsBySeverity,
          incidentsByStatus,
          incidentsByMonth,
          incidentsByClass
        });
        
      } catch (err) {
        console.error("Error calculating analytics:", err);
        setError("Failed to calculate analytics data");
      } finally {
        setLoading(false);
      }
    };

    calculateAnalytics();
  }, [incidents, period]);

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading analytics...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Discipline Analytics</h2>
        <select
          value={period}
          onChange={handlePeriodChange}
          className="border rounded p-2 text-sm bg-white"
        >
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {incidents.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No incident data available for analytics. Add incidents to see statistics.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Incidents by Type */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Incidents by Type</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.incidentsByType} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="type" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Incidents by Severity - Simple Pie Chart */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Incidents by Severity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.incidentsBySeverity}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                  >
                    {analyticsData.incidentsBySeverity.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={SEVERITY_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Incidents by Month */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Incidents by Month</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.incidentsByMonth}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Incidents by Status - Simple Pie Chart */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Incidents by Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.incidentsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                  >
                    {analyticsData.incidentsByStatus.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Classes with Most Incidents */}
      {analyticsData.incidentsByClass.length > 0 && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Classes with Most Incidents</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.incidentsByClass}>
                <XAxis dataKey="class" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisciplineAnalytics;