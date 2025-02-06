import React, { useState } from "react";
import { Calendar, Clock, Plus, X, Users, BookOpen } from "lucide-react";

const WorkloadSchedule = ({teachers}) => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

 

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Average Load</h3>
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">26 hrs/week</div>
          <p className="text-xs text-gray-600">Per teacher</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Classes</h3>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-gray-600">Active classes</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Subjects</h3>
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-gray-600">Teaching subjects</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Utilization</h3>
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">85%</div>
          <p className="text-xs text-green-600">Optimal load</p>
        </div>
      </div>

      {/* Workload Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subjects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Load
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-600">
                          {teacher.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {teacher.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {teacher.department}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {teacher.subjects.map((subject, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            teacher.currentLoad / teacher.maxLoad > 0.9
                              ? "bg-red-500"
                              : teacher.currentLoad / teacher.maxLoad > 0.7
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${
                              (teacher.currentLoad / teacher.maxLoad) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {teacher.currentLoad}/{teacher.maxLoad} hrs
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setShowScheduleModal(true);
                      }}
                    >
                      View Schedule
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setShowAssignModal(true);
                      }}
                      className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Assign</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showScheduleModal && selectedTeacher && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="bg-black opacity-50 w-full h-full absolute z-40"></div>{" "}
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto z-50">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-3 mb-6">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedTeacher.name}'s Schedule
                  </h2>
                  <p className="text-sm text-gray-600">
                    Current Load: {selectedTeacher.currentLoad}/
                    {selectedTeacher.maxLoad} hours
                  </p>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Schedule Grid */}
              <div className="grid grid-cols-5 gap-4">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
                  (day) => (
                    <div key={day} className="space-y-3">
                      <div className="text-sm font-medium text-gray-900 bg-gray-100 p-2 rounded-t-lg">
                        {day}
                      </div>
                      {selectedTeacher.schedule
                        .find((s) => s.day === day)
                        ?.classes.map((className, index) => (
                          <div
                            key={index}
                            className="bg-blue-50 border border-blue-100 p-2 rounded-lg text-sm"
                          >
                            <div className="font-medium text-blue-700">
                              {className}
                            </div>
                            <div className="text-xs text-gray-600">
                              {selectedTeacher.subjects[0]}{" "}
                              {/* You might want to map this to specific classes */}
                            </div>
                          </div>
                        )) || (
                        <div className="text-sm text-gray-400 italic p-2">
                          No classes
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>

              {/* Load Indicator */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Workload Utilization</span>
                    <span>
                      {Math.round(
                        (selectedTeacher.currentLoad /
                          selectedTeacher.maxLoad) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        selectedTeacher.currentLoad / selectedTeacher.maxLoad >
                        0.9
                          ? "bg-red-500"
                          : selectedTeacher.currentLoad /
                              selectedTeacher.maxLoad >
                            0.7
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${
                          (selectedTeacher.currentLoad /
                            selectedTeacher.maxLoad) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Class Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="bg-black opacity-50 w-full h-full absolute z-40"></div>{" "}
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto z-50">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-xl font-bold">Assign Classes</h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Select class</option>
                    <option>Form 1A</option>
                    <option>Form 1B</option>
                    <option>Form 2A</option>
                    <option>Form 2B</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Select subject</option>
                    {selectedTeacher?.subjects.map((subject, index) => (
                      <option key={index}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day
                    </label>
                    <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>Select day</option>
                      <option>Monday</option>
                      <option>Tuesday</option>
                      <option>Wednesday</option>
                      <option>Thursday</option>
                      <option>Friday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Slot
                    </label>
                    <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>Select time</option>
                      <option>8:00 AM - 9:00 AM</option>
                      <option>9:00 AM - 10:00 AM</option>
                      <option>10:00 AM - 11:00 AM</option>
                      <option>11:00 AM - 12:00 PM</option>
                    </select>
                  </div>
                </div>

                {/* Current Schedule */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Current Schedule
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    {selectedTeacher?.schedule.map((day, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className="font-medium">{day.day}</span>
                        <div className="flex gap-2">
                          {day.classes.map((cls, idx) => (
                            <span key={idx} className="text-sm text-gray-600">
                              {cls}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle assignment logic here
                    setShowAssignModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Assign Class
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkloadSchedule;
