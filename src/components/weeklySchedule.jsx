import React from "react";
import { Clock, Edit, Trash2 } from "lucide-react";
import { generateFullSchedule, teachers } from "../store/scheduleData";
import { useState } from "react";
import { useEffect } from "react";
import EditScheduleModal from "./modals/editSchedule";

const WeeklySchedule = ({ teachers }) => {
  const [schedule, setSchedule] = useState({});
  const [selectedTeacher, setSelectedTeacher] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  //Add this handler function
  const handleEdit = (scheduleItem, day, time) => {
    setSelectedSchedule({
      ...scheduleItem,
      day,
      time,
    });
    setShowEditModal(true);
  };

  //Add this save handler
  const handleEditSave = (editedData) => {
    setSchedule((prev) => ({
      ...prev,
      [editedData.day]: prev[editedData.day].map((timeSlot) => {
        if (timeSlot.time === editedData.time) {
          return {
            ...timeSlot,
            classes: timeSlot.classes.map((cls) => {
              if (
                cls.class === editedData.originalData.class &&
                cls.teacher === editedData.originalData.teacher
              ) {
                const teacherData = teachers.find(
                  (t) => t.name === editedData.teacher
                );
                return {
                  ...cls,
                  subject: editedData.subject,
                  teacher: editedData.teacher,
                  room: editedData.room,
                  color: teacherData.color,
                };
              }
              return cls;
            }),
          };
        }
        return timeSlot;
      }),
    }));
  };

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
  ];

  // Generate initial schedule data
  useEffect(() => {
    const initialSchedule = {};
    weekDays.forEach((day) => {
      initialSchedule[day] = timeSlots.map((time) => ({
        time,
        classes: generateClassesForTimeSlot(),
      }));
    });
    setSchedule(initialSchedule);
  }, []);

  // Helper function to generate classes for a time slot
  const generateClassesForTimeSlot = () => {
    const possibleClasses = ["Form 1", "Form 2", "Form 3", "Form 4"];
    const classAssignments = [];

    possibleClasses.forEach((classGroup) => {
      // 70% chance of having a class in this slot
      if (Math.random() < 0.7) {
        const teacher = teachers[Math.floor(Math.random() * teachers.length)];
        const subject =
          teacher.subjects[Math.floor(Math.random() * teacher.subjects.length)];

        classAssignments.push({
          class: classGroup,
          subject,
          teacher: teacher.name,
          room: `Room ${101 + Math.floor(Math.random() * 4)}`,
          color: teacher.color,
        });
      }
    });

    return classAssignments;
  };

  const filterSchedule = (classes = []) => {
    if (selectedTeacher === "all" && selectedClass === "all") return classes;

    return classes.filter((cls) => {
      const teacherMatch =
        selectedTeacher === "all" || cls.teacher === selectedTeacher;
      const classMatch = selectedClass === "all" || cls.class === selectedClass;
      return teacherMatch && classMatch;
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex space-x-4 mb-4">
        <select
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">All Teachers</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.name}>
              {teacher.name}
            </option>
          ))}
        </select>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">All Classes</option>
          <option value="Form 1">Form 1</option>
          <option value="Form 2">Form 2</option>
          <option value="Form 3">Form 3</option>
          <option value="Form 4">Form 4</option>
        </select>
      </div>

      {/* Timetable */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              {weekDays.map((day) => (
                <th
                  key={day}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timeSlots.map((time) => (
              <tr key={time}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {time}
                </td>
                {weekDays.map((day) => (
                  <td
                    key={`${day}-${time}`}
                    className="px-6 py-4 whitespace-nowrap"
                  >
                    <div className="space-y-2">
                      {schedule[day]?.find((slot) => slot.time === time)
                        ?.classes &&
                        filterSchedule(
                          schedule[day].find((slot) => slot.time === time)
                            .classes
                        ).map((cls, index) => (
                          <div
                            key={index}
                            className={`rounded-lg p-2 border ${
                              cls.color || "bg-gray-50 border-gray-100"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium">{`${cls.class} - ${cls.subject}`}</p>
                                <p className="text-xs text-gray-500">
                                  {cls.teacher}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {cls.room}
                                </p>
                              </div>
                              <button
                                onClick={() => handleEdit(cls, day, time)}
                                className="text-gray-400 hover:text-blue-600"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <EditScheduleModal
  isOpen={showEditModal}
  onClose={() => {
    setShowEditModal(false);
    setSelectedSchedule(null);
  }}
  onSave={handleEditSave}
  scheduleData={selectedSchedule}
  teachers={teachers}
/>

      {/* Legend */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Teachers</h4>
        <div className="flex flex-wrap gap-4">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded ${teacher.color}`}></div>
              <span className="text-sm text-gray-600">{teacher.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;
