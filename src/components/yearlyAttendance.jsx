import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import axios from "axios";

const YearlyAttendanceChart = () => {
  const token = localStorage.getItem("token");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [academicSessions, setAcademicSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  const termConfigs = {
    "Term 1": {
      color: "#8B5CF6", // Modern purple
      gradientId: "gradientTerm1",
      description: "Jan - March",
    },
    "Term 2": {
      color: "#EC4899", // Modern pink
      gradientId: "gradientTerm2",
      description: "May - July",
    },
    "Term 3": {
      color: "#06B6D4", // Modern cyan
      gradientId: "gradientTerm3",
      description: "Sept - Nov",
    },
  };

  // Fetch academic sessions
  useEffect(() => {
    const fetchAcademicSessions = async () => {
      try {
        const response = await axios.get('/backend/api/yearly',{
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.data && response.data.sessions) {
          setAcademicSessions(response.data.sessions);
          
          // Set the current session if available
          const currentSession = response.data.sessions.find(session => session.is_current);
          if (currentSession) {
            setSelectedSession(currentSession.id);
            setSelectedYear(currentSession.year);
          } else if (response.data.sessions.length > 0) {
            // Otherwise use the most recent session
            const sortedSessions = [...response.data.sessions].sort((a, b) => 
              new Date(b.start_date) - new Date(a.start_date)
            );
            setSelectedSession(sortedSessions[0].id);
            setSelectedYear(sortedSessions[0].year);
          }
        }
      } catch (err) {
        console.error("Failed to fetch academic sessions:", err);
        setError("Failed to load academic sessions. Please try again later.");
      }
    };

    fetchAcademicSessions();
  }, []);

  // Fetch attendance data when session changes
  useEffect(() => {
    if (!selectedSession) return;

    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/backend/api/yearly/summary/weekly?academic_session_id=${selectedSession}`,{
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.weeklyData) {
          // Transform data to match chart format
          const transformedData = response.data.weeklyData.map(week => {
            let currentTerm = "Term 1";
            if (week.week_number > 28) currentTerm = "Term 3";
            else if (week.week_number > 14) currentTerm = "Term 2";

            return {
              week: `Week ${week.week_number}`,
              students: week.present_count,
              term: currentTerm,
              description: termConfigs[currentTerm].description,
              fill: `url(#${termConfigs[currentTerm].gradientId})`,
              attendance_rate: week.attendance_rate,
              absent_count: week.absent_count,
              late_count: week.late_count,
              leave_count: week.leave_count,
              total_students: week.total_students
            };
          });

          setAttendanceData(transformedData);
        }
      } catch (err) {
        console.error("Failed to fetch attendance data:", err);
        setError("Failed to load attendance data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [selectedSession]);

  // Handle session change
  const handleSessionChange = (e) => {
    const sessionId = parseInt(e.target.value);
    setSelectedSession(sessionId);
    
    // Update year when session changes
    const session = academicSessions.find(s => s.id === sessionId);
    if (session) {
      setSelectedYear(session.year);
    }
  };

  if (loading && !attendanceData.length) {
    return (
      <div className="flex justify-center items-center h-80">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6">
        <h3 className="text-xl font-bold">Error Loading Data</h3>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-xl border  shadow-lg p-6  rounded-2xl  border-gray-200 shadow-md p-4 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 justify-between items-start sm:items-center mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 ">
              School Attendance {selectedYear}
            </h3>
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-300">
              Weekly attendance tracking
            </p>
          </div>
          
          {/* Session selector */}
          <div className="flex items-center">
            <label htmlFor="session-select" className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-200 ">Academic Session:</label>
            <select 
              id="session-select"
              value={selectedSession || ''}
              onChange={handleSessionChange}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm dark:text-gray-200 "
            >
              {academicSessions.map(session => (
                <option key={session.id} value={session.id}>
                  {session.year} - Term {session.term} {session.is_current ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 bg-gray-50/50 dark:bg-gray-500/50 px-4 py-2 rounded-full mb-6">
          {Object.entries(termConfigs).map(([term, config]) => (
            <div key={term} className="flex items-center">
              <div
                className="w-2.5 h-2.5 rounded-full mr-2"
                style={{ backgroundColor: config.color }}
              ></div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200 ">
                {term}
              </span>
              <span className="text-xs text-gray-400 ml-1 dark:text-gray-200 ">
                ({config.description})
              </span>
            </div>
          ))}
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={attendanceData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <defs>
                {Object.entries(termConfigs).map(([term, config]) => (
                  <linearGradient
                    key={config.gradientId}
                    id={config.gradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={config.color}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={config.color}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F3F4F6"
              />
              <XAxis
                dataKey="week"
                interval={3}
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const { 
                      term, 
                      description, 
                      attendance_rate, 
                      absent_count, 
                      late_count, 
                      leave_count, 
                      total_students 
                    } = payload[0].payload;
                    
                    return (
                      <div className="bg-white border border-gray-100 p-4 shadow-xl rounded-lg">
                        <p className="font-medium text-gray-600">{label}</p>
                        <p
                          className="text-2xl font-bold mt-1"
                          style={{ color: termConfigs[term].color }}
                        >
                          {payload[0].value.toLocaleString()} students
                        </p>
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Attendance Rate:</span>
                            <span className="font-medium">{attendance_rate}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Absent:</span>
                            <span className="font-medium">{absent_count} students</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Late:</span>
                            <span className="font-medium">{late_count} students</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">On Leave:</span>
                            <span className="font-medium">{leave_count} students</span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                            <span className="text-gray-500">Total Enrolled:</span>
                            <span className="font-medium">{total_students} students</span>
                          </div>
                        </div>
                        <div className="flex items-center mt-2 text-sm border-t border-gray-100 pt-1">
                          <span className="font-medium text-gray-700">
                            {term}
                          </span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-gray-500">{description}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Term divider lines */}
              <ReferenceLine
                x="Week 14"
                stroke="#E5E7EB"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                x="Week 28"
                stroke="#E5E7EB"
                strokeDasharray="3 3"
              />
              <Bar
                dataKey="students"
                radius={[6, 6, 0, 0]}
                fill={(entry) => entry.fill}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default YearlyAttendanceChart;