import React, { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import EditScheduleModal from "./modals/editSchedule";
import DeleteConfirmationModal from "./modals/deleteSchedule";
import { redirect } from "react-router-dom";

const WeeklySchedule = ({
  timetableData,
  selectedClass,
  selectedTeacher,
  selectedRoom,
  refetchTimetableData,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // Define time slots and days
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = [
    "8:00 AM - 9:00 AM",
    "9:00 AM  - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 1:00 PM",
    "1:00 PM - 2:00 PM",
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
  ];

  // Handler for edit button click
  const handleEdit = (scheduleItem, day, time) => {
    setSelectedSchedule({
      ...scheduleItem,
      day,
      time,
    });
    setShowEditModal(true);
  };

  // Handler for saving edited schedule
  const handleEditSave = async (editedData) => {
    try {
      const token = localStorage.getItem("token");
      console.log(editedData);
      // API call to update the schedule
      const response = await fetch(
        `/backend/api/timetable/${editedData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subject_id: editedData.subjectId,
            teacher_id: editedData.teacherId,
            start_time: editedData.startTime,
            end_time: editedData.endTime,
            room_number: editedData.room,
            subject_name: editedData.subject,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update schedule");
      }

      // Show success notification
      setNotification({
        type: "success",
        message: "Schedule updated successfully",
      });

      // Close modal
      setShowEditModal(false);
      setSelectedSchedule(null);

      // Reload the page to refresh data
      // Refetch the timetable data
      const refetchSuccess = await refetchTimetableData();

      // if (!refetchSuccess) {
      //   setScheduleSuccess("Schedule was added, but the timetable couldn't be refreshed. Please reload the page.");
      // }
    } catch (error) {
      console.error("Error updating schedule:", error);
      setNotification({
        type: "error",
        message: "Error updating schedule",
      });
    }
  };

  // Handler for delete button click
  const handleDeleteClick = (schedule) => {
    setSelectedSchedule(schedule);
    setShowDeleteModal(true);
  };

  // Handler for confirming deletion
  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");

      // API call to delete the schedule
      const response = await fetch(
        `/backend/api/timetable/${selectedSchedule.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete schedule");
      }

      // Show success notification
      setNotification({
        type: "success",
        message: "Schedule deleted successfully",
      });

      // Close modal
      setShowDeleteModal(false);
      setSelectedSchedule(null);

      // Reload the page to refresh data
      redirect("/timetable");
    } catch (error) {
      console.error("Error deleting schedule:", error);
      setNotification({
        type: "error",
        message: "Error deleting schedule",
      });
    }
  };

  // Helper function to generate teacher color based on teacher ID
  const generateTeacherColor = (teacherId) => {
    const colors = [
      "bg-blue-50 border-blue-100 text-blue-700",
      "bg-green-50 border-green-100 text-green-700",
      "bg-purple-50 border-purple-100 text-purple-700",
      "bg-red-50 border-red-100 text-red-700",
      "bg-yellow-50 border-yellow-100 text-yellow-700",
      "bg-indigo-50 border-indigo-100 text-indigo-700",
      "bg-pink-50 border-pink-100 text-pink-700",
      "bg-teal-50 border-teal-100 text-teal-700",
    ];
    return colors[teacherId % colors.length];
  };

  // Function to get schedule data for a specific day, time slot and filter type
  const getScheduleForTimeSlot = (day, timeSlot) => {
    if (!timetableData) return [];

    let scheduleItems = [];

    // Get the day details based on filter type
    if (selectedTeacher !== "all" && timetableData.teachers?.length > 0) {
      // Teacher filter
      const teacher = timetableData.teachers.find(
        (t) => t.id.toString() === selectedTeacher
      );
      if (teacher) {
        const daySchedule = teacher.weekly_schedule.find((d) => d.day === day);
        if (daySchedule) {
          scheduleItems = daySchedule.classes
            .filter((c) => {
              // Check if this class is within the current time slot
              return isWithinTimeSlot(c.start_time, c.end_time, timeSlot);
            })
            .map((c) => ({
              id: c.timetable_id,
              class: c.class_name,
              subject: c.subject_name,
              room: c.room,
              startTime: c.start_time,
              endTime: c.end_time,
              teacherId: teacher.id,
              teacherName: teacher.name,
              color: generateTeacherColor(teacher.id),
            }));
        }
      }
    } else if (selectedClass !== "all" && timetableData.classes?.length > 0) {
      // Class filter
      const classObj = timetableData.classes.find(
        (c) => c.id.toString() === selectedClass
      );
      if (classObj) {
        const daySchedule = classObj.weekly_schedule.find((d) => d.day === day);
        if (daySchedule) {
          scheduleItems = daySchedule.classes
            .filter((c) => {
              return isWithinTimeSlot(c.start_time, c.end_time, timeSlot);
            })
            .map((c) => ({
              id: c.timetable_id,
              class: classObj.name,
              subject: c.subject_name,
              room: c.room,
              startTime: c.start_time,
              endTime: c.end_time,
              teacherId: c.teacher_id,
              teacherName: c.teacher_name,
              color: generateTeacherColor(c.teacher_id),
            }));
        }
      }
    } else if (selectedRoom !== "all" && timetableData.rooms?.length > 0) {
      // Room filter
      const room = timetableData.rooms.find((r) => r.name === selectedRoom);
      if (room) {
        const daySchedule = room.weekly_schedule.find((d) => d.day === day);
        if (daySchedule) {
          scheduleItems = daySchedule.classes
            .filter((c) => {
              return isWithinTimeSlot(c.start_time, c.end_time, timeSlot);
            })
            .map((c) => ({
              id: c.timetable_id,
              class: c.class_name,
              subject: c.subject_name,
              room: room.name,
              startTime: c.start_time,
              endTime: c.end_time,
              teacherId: c.teacher_id,
              teacherName: c.teacher_name,
              color: generateTeacherColor(c.teacher_id),
            }));
        }
      }
    } else {
      // No specific filter, try to show all schedules
      // This is more complex as we need to combine data from different sources
      // Let's handle teachers for simplicity in this example
      if (timetableData.teachers) {
        timetableData.teachers.forEach((teacher) => {
          const daySchedule = teacher.weekly_schedule.find(
            (d) => d.day === day
          );
          if (daySchedule) {
            const teacherClasses = daySchedule.classes
              .filter((c) => {
                return isWithinTimeSlot(c.start_time, c.end_time, timeSlot);
              })
              .map((c) => ({
                id: c.timetable_id,
                class: c.class_name,
                subject: c.subject_name,
                room: c.room,
                startTime: c.start_time,
                endTime: c.end_time,
                teacherId: teacher.id,
                teacherName: teacher.name,
                color: generateTeacherColor(teacher.id),
              }));

            scheduleItems = [...scheduleItems, ...teacherClasses];
          }
        });
      }
    }

    return scheduleItems;
  };

  // Helper to check if a class is within a time slot
  const isWithinTimeSlot = (classStart, classEnd, timeSlotLabel) => {
    // Parse the UI time slot (e.g., "11:00 AM - 12:00 PM")
    const [startPart, endPart] = timeSlotLabel.split(" - ");

    // Parse the start time (e.g., "11:00 AM")
    const startTimeParts = startPart.split(":");
    let startHour = parseInt(startTimeParts[0]);
    const startMinute = parseInt(startTimeParts[1].split(" ")[0]);
    const startIsPM = startPart.includes("PM") && startHour !== 12;

    // Convert to 24-hour format
    startHour = startIsPM ? startHour + 12 : startHour;
    if (startPart.includes("AM") && startHour === 12) startHour = 0;

    // Parse the end time (e.g., "12:00 PM")
    const endTimeParts = endPart.split(":");
    let endHour = parseInt(endTimeParts[0]);
    const endMinute = parseInt(endTimeParts[1].split(" ")[0]);
    const endIsPM = endPart.includes("PM") && endHour !== 12;

    // Convert to 24-hour format
    endHour = endIsPM ? endHour + 12 : endHour;
    if (endPart.includes("AM") && endHour === 12) endHour = 0;

    // Convert to minutes for easier comparison
    const uiStartMinutes = startHour * 60 + startMinute;
    const uiEndMinutes = endHour * 60 + endMinute;

    // Parse class start/end times (in 24-hour format, e.g., "11:00")
    const [classStartHour, classStartMin] = classStart.split(":").map(Number);
    const [classEndHour, classEndMin] = classEnd.split(":").map(Number);

    const classStartMinutes = classStartHour * 60 + classStartMin;
    const classEndMinutes = classEndHour * 60 + classEndMin;

    // Check for overlap between time periods
    // A time period overlaps if:
    // 1. The class starts during the UI time slot, OR
    // 2. The class ends during the UI time slot, OR
    // 3. The class completely envelops the UI time slot
    return (
      (classStartMinutes >= uiStartMinutes &&
        classStartMinutes < uiEndMinutes) || // Class starts during the slot
      (classEndMinutes > uiStartMinutes && classEndMinutes <= uiEndMinutes) || // Class ends during the slot
      (classStartMinutes <= uiStartMinutes && classEndMinutes >= uiEndMinutes) // Class spans the entire slot
    );
  };

  // Check if the time slot is lunch time or break time
  const isLunchTime = (timeSlot) => {
    return timeSlot === "1:00 PM - 2:00 PM";
  };

  const isBreakTime = (timeSlot) => {
    return timeSlot === "10:00 AM - 11:00 AM";
  };

  const isSpecialTimeSlot = (timeSlot) => {
    return isLunchTime(timeSlot) || isBreakTime(timeSlot);
  };

  // Get background color for special time slots
  const getSpecialSlotBgColor = (timeSlot) => {
    if (isLunchTime(timeSlot)) return "bg-slate-100";
    if (isBreakTime(timeSlot)) return "bg-blue-50";
    return "";
  };

  // Get text color for special time slots
  const getSpecialSlotTextColor = (timeSlot) => {
    if (isLunchTime(timeSlot)) return "text-slate-800";
    if (isBreakTime(timeSlot)) return "text-blue-800";
    return "text-gray-900";
  };

  // Get label for special time slots
  const getSpecialSlotLabel = (timeSlot) => {
    if (isLunchTime(timeSlot)) return "(Lunch Break)";
    if (isBreakTime(timeSlot)) return "(Break Time)";
    return "";
  };
  console.log(timetableData);
  // Get all teachers for the legend
  const getAllTeachers = () => {
    if (!timetableData || !timetableData.teachers) return [];

    return timetableData.teachers.map((teacher) => ({
      id: teacher.id,
      name: teacher.name,
      color: generateTeacherColor(teacher.id),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg mb-4 ${
            notification.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {notification.message}
        </div>
      )}

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
              <tr key={time} className={getSpecialSlotBgColor(time)}>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getSpecialSlotTextColor(
                    time
                  )}`}
                >
                  {time}
                  {isSpecialTimeSlot(time) && (
                    <span
                      className={`ml-2 ${
                        isLunchTime(time) ? "text-slate-700" : "text-blue-700"
                      } font-semibold`}
                    >
                      {getSpecialSlotLabel(time)}
                    </span>
                  )}
                </td>
                {weekDays.map((day) => (
                  <td
                    key={`${day}-${time}`}
                    className={`px-6 py-4 whitespace-nowrap ${getSpecialSlotBgColor(
                      time
                    )}`}
                  >
                    {isSpecialTimeSlot(time) ? (
                      <div className="flex justify-center items-center h-full">
                        <span
                          className={`font-medium ${
                            isLunchTime(time)
                              ? "text-slate-700"
                              : "text-blue-700"
                          }`}
                        >
                          {isLunchTime(time) ? "LUNCH BREAK" : "BREAK TIME"}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {getScheduleForTimeSlot(day, time).map(
                          (scheduleItem, index) => (
                            <div
                              key={index}
                              className={`rounded-lg p-2 border ${
                                scheduleItem.color ||
                                "bg-gray-50 border-gray-100"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-medium">{`${scheduleItem.class} - ${scheduleItem.subject}`}</p>
                                  <p className="text-xs text-gray-500">
                                    {scheduleItem.teacherName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {scheduleItem.room}
                                  </p>
                                </div>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() =>
                                      handleEdit(scheduleItem, day, time)
                                    }
                                    className="text-gray-400 hover:text-blue-600"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteClick(scheduleItem)
                                    }
                                    className="text-gray-400 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <EditScheduleModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedSchedule(null);
        }}
        onSave={handleEditSave}
        scheduleData={selectedSchedule}
        teachers={getAllTeachers()}
      />

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedSchedule(null);
        }}
        onConfirm={handleConfirmDelete}
        schedule={selectedSchedule}
      />

      {/* Legend */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Teachers</h4>
        <div className="flex flex-wrap gap-4">
          {getAllTeachers()
            .filter(
              (entry, index, self) =>
                index ===
                self.findIndex(
                  (e) => e.name.toLowerCase() === entry.name.toLowerCase()
                )
            )
            .map((teacher, index) => (
              <div
                key={`${teacher.id}-${index}`}
                className="flex items-center space-x-2"
              >
                <div
                  className={`w-4 h-4 rounded ${teacher.color.split(" ")[0]}`}
                ></div>
                <span className="text-sm text-gray-600">{teacher.name}</span>
              </div>
            ))}
          <div className="flex items-center space-x-2 ml-4">
            <div className="w-4 h-4 rounded bg-slate-100"></div>
            <span className="text-sm text-gray-600">
              Lunch Break (1:00 PM - 2:00 PM)
            </span>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <div className="w-4 h-4 rounded bg-blue-50"></div>
            <span className="text-sm text-gray-600">
              Break Time (10:00 AM - 11:00 AM)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;
