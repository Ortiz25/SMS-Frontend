import React from "react";
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

const YearlyAttendanceChart = () => {
  // Modern term configuration with updated colors
  const termConfigs = {
    "Term 1": {
      color: "#8B5CF6", // Modern purple
      gradientId: "gradientTerm1",
      weeks: [1, 14],
      description: "Jan - March",
    },
    "Term 2": {
      color: "#EC4899", // Modern pink
      gradientId: "gradientTerm2",
      weeks: [15, 28],
      description: "May - July",
    },
    "Term 3": {
      color: "#06B6D4", // Modern cyan
      gradientId: "gradientTerm3",
      weeks: [29, 42],
      description: "Sept - Nov",
    },
  };

  // Generate sample data aligned with Kenyan school calendar
  const generateYearlyData = () => {
    const data = [];
    const baseAttendance = 460;

    for (let week = 1; week <= 42; week++) {
      let attendance = baseAttendance;

      if ([1, 14, 15, 28, 29, 42].includes(week)) {
        attendance *= 0.85;
      }
      if ([7, 21, 35].includes(week)) {
        attendance *= 1.1;
      }

      attendance += baseAttendance * (Math.random() * 0.06 - 0.03);

      let currentTerm = "Term 1";
      if (week > 28) currentTerm = "Term 3";
      else if (week > 14) currentTerm = "Term 2";

      data.push({
        week: `Week ${week}`,
        students: Math.round(attendance),
        term: currentTerm,
        description: termConfigs[currentTerm].description,
      });
    }
    return data;
  };

  const attendanceData = generateYearlyData();

  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-xl border border-gray-100 shadow-lg p-6">
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 justify-between items-start sm:items-center mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900">School Attendance</h3>
            <p className="text-sm text-gray-500 mt-1">
              Weekly attendance tracking
            </p>
          </div>
          <div className="flex flex-wrap gap-4 bg-gray-50/50 px-4 py-2 rounded-full">
            {Object.entries(termConfigs).map(([term, config]) => (
              <div key={term} className="flex items-center">
                <div
                  className="w-2.5 h-2.5 rounded-full mr-2"
                  style={{ backgroundColor: config.color }}
                ></div>
                <span className="text-xs font-medium text-gray-700">{term}</span>
                <span className="text-xs text-gray-400 ml-1">
                  ({config.description})
                </span>
              </div>
            ))}
          </div>
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
                    <stop offset="0%" stopColor={config.color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={config.color} stopOpacity={0.1} />
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
                    const { term, description } = payload[0].payload;
                    return (
                      <div className="bg-white border border-gray-100 p-4 shadow-xl rounded-lg">
                        <p className="font-medium text-gray-600">{label}</p>
                        <p
                          className="text-2xl font-bold mt-1"
                          style={{ color: termConfigs[term].color }}
                        >
                          {payload[0].value.toLocaleString()}
                        </p>
                        <div className="flex items-center mt-2 text-sm">
                          <span className="font-medium text-gray-700">{term}</span>
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
                {...{
                  fill: (data) => `url(#${termConfigs[data.term].gradientId})`,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default YearlyAttendanceChart;