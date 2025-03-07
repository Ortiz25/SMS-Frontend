import React, { useState, useEffect } from "react";
import { Plus, Filter, Search, Edit, Trash2 } from "lucide-react";
import AllocationModal from "./modals/addAllocation";
import EditAllocationModal from "./modals/editAllocation";
import DeleteConfirmationModal from "./modals/deleteAllocation";

const ClassAllocation = ({rooms}) => {
  console.log(rooms)
  const [allocations, setAllocations] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [notification, setNotification] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [academicSessions, setAcademicSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);

  // Fetch allocations and reference data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        // Fetch academic sessions and determine current session
        const sessionsResponse = await fetch(
          "http://localhost:5000/api/sessions/academic-sessions",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!sessionsResponse.ok)
          throw new Error("Failed to fetch academic sessions");

        const sessionsData = await sessionsResponse.json();

        setAcademicSessions(sessionsData.data);

        const currentSessionData = sessionsData.data.find(
          (session) => session.is_current
        );
        if (currentSessionData) setCurrentSession(currentSessionData.id);

        // Fetch allocations - using teacher_subjects table as per schema
        const allocationsResponse = await fetch(
          "http://localhost:5000/api/allocations/allocations",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!allocationsResponse.ok)
          throw new Error("Failed to fetch allocations");

        const allocationsData = await allocationsResponse.json();
        console.log(allocationsData);
        setAllocations(allocationsData.data);

        // Fetch reference data
        const fetchReferenceData = async () => {
          try {
            const response = await fetch(
              "http://localhost:5000/api/helpers/reference-data",
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!response.ok) throw new Error("Failed to fetch reference data");

            const result = await response.json();

            // Now you have all data in one object
            const { classes, teachers, subjects, currentSession } = result.data;

            // Update your state
            setClasses(classes);
            setTeachers(teachers);
            setSubjects(subjects);
            setCurrentSession(currentSession);
          } catch (error) {
            console.error("Error fetching reference data:", error);
            // Handle error
          }
        };

        fetchReferenceData();
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to calculate weekly hours based on timetable entries
  const calculateWeeklyHours = (allocation) => {
    // In a real implementation, fetch actual hours from timetable
    // For now, let's return a placeholder value based on subject
    const subjectHours = {
      Mathematics: 6,
      Physics: 4,
      Chemistry: 4,
      Biology: 4,
      English: 5,
      Kiswahili: 4,
      History: 3,
      Geography: 3,
    };

    return subjectHours[allocation.subject_name] || 3;
  };

  // Filter allocations based on search term and filters
  const filteredAllocations = allocations.filter((allocation) => {
    const matchesSearch =
      allocation.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allocation.subject_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      allocation.teacher_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass =
      !selectedClass || allocation.class_id.toString() === selectedClass;
    const matchesTeacher =
      !selectedTeacher || allocation.teacher_id.toString() === selectedTeacher;
    const matchesSubject =
      !selectedSubject || allocation.subject_id.toString() === selectedSubject;

    return matchesSearch && matchesClass && matchesTeacher && matchesSubject;
  });

  // Handler for new allocation submission
  const handleSaveAllocation = async (allocationData) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/allocations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teacher_id: allocationData.teacherId,
          subject_id: allocationData.subjectId,
          class_id: allocationData.classId,
          academic_session_id:
            allocationData.academicSessionId || currentSession,
        }),
      });

      if (!response.ok) throw new Error("Failed to create allocation");

      const result = await response.json();

      // Update local state
      setAllocations((prev) => [
        ...prev,
        {
          id: result.data.id,
          teacher_id: allocationData.teacherId,
          teacher_name:
            teachers.find(
              (t) => t.id.toString() === allocationData.teacherId.toString()
            )?.full_name || "",
          subject_id: allocationData.subjectId,
          subject_name:
            subjects.find(
              (s) => s.id.toString() === allocationData.subjectId.toString()
            )?.name || "",
          class_id: allocationData.classId,
          class_name:
            classes.find(
              (c) => c.id.toString() === allocationData.classId.toString()
            )?.name || "",
          academic_session_id:
            allocationData.academicSessionId || currentSession,
          status: "active",
        },
      ]);

      setShowAddModal(false);
      setNotification({
        type: "success",
        message: "Allocation created successfully",
      });

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error saving allocation:", error);
      setNotification({
        type: "error",
        message: error.message,
      });
    }
  };

  // Handler for editing allocation
  const handleEditAllocation = async (allocationData) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/allocations/${allocationData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            teacher_id: allocationData.teacherId,
            subject_id: allocationData.subjectId,
            class_id: allocationData.classId,
            academic_session_id:
              allocationData.academicSessionId || currentSession,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update allocation");

      // Update local state
      setAllocations((prev) =>
        prev.map((item) =>
          item.id === allocationData.id
            ? {
                ...item,
                teacher_id: allocationData.teacherId,
                teacher_name:
                  teachers.find(
                    (t) =>
                      t.id.toString() === allocationData.teacherId.toString()
                  )?.full_name || "",
                subject_id: allocationData.subjectId,
                subject_name:
                  subjects.find(
                    (s) =>
                      s.id.toString() === allocationData.subjectId.toString()
                  )?.name || "",
                class_id: allocationData.classId,
                class_name:
                  classes.find(
                    (c) => c.id.toString() === allocationData.classId.toString()
                  )?.name || "",
              }
            : item
        )
      );

      setShowEditModal(false);
      setSelectedAllocation(null);
      setNotification({
        type: "success",
        message: "Allocation updated successfully",
      });

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error updating allocation:", error);
      setNotification({
        type: "error",
        message: error.message,
      });
    }
  };

  // Handler for deleting allocation
  const handleDeleteAllocation = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/allocations/${selectedAllocation.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete allocation");

      // Update local state
      setAllocations((prev) =>
        prev.filter((item) => item.id !== selectedAllocation.id)
      );

      setShowDeleteModal(false);
      setSelectedAllocation(null);
      setNotification({
        type: "success",
        message: "Allocation deleted successfully",
      });

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error deleting allocation:", error);
      setNotification({
        type: "error",
        message: error.message,
      });
    }
  };

  // Handler for edit button click
  const handleEditClick = (allocation) => {
    setSelectedAllocation(allocation);
    setShowEditModal(true);
  };

  // Handler for delete button click
  const handleDeleteClick = (allocation) => {
    setSelectedAllocation(allocation);
    setShowDeleteModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg text-sm ${
            notification.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <div className="relative">
            <input
              type="text"
              placeholder="Search allocations..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <select
            className="px-3 py-2 border rounded-lg w-full"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>

          <select
            className="px-3 py-2 border rounded-lg w-full"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
          >
            <option value="">All Teachers</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.first_name} {teacher.last_name}
              </option>
            ))}
          </select>

          <select
            className="px-3 py-2 border rounded-lg w-full"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>

          {/* Button inside the grid */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 w-full sm:w-auto sm:col-span-2 lg:col-span-1"
          >
            <Plus className="h-4 w-4" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Allocation Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Class
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Subject
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Teacher
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Hours/Week
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAllocations.length > 0 ? (
                filteredAllocations.map((allocation) => (
                  <tr key={allocation.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                      {allocation.class_name}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        {allocation.subject_name}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                      {allocation.teacher_name}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                      {calculateWeeklyHours(allocation)}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          allocation.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {allocation.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEditClick(allocation)}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(allocation)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No allocations found. Please add a new allocation or adjust
                    your search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AllocationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveAllocation}
        classes={classes}
        teachers={teachers}
        subjects={subjects}
        academicSessions={academicSessions}
        currentSession={currentSession}
        rooms={rooms}
      />

      <EditAllocationModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAllocation(null);
        }}
        onSave={handleEditAllocation}
        allocation={selectedAllocation}
        classes={classes}
        teachers={teachers}
        subjects={subjects}
        academicSessions={academicSessions}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAllocation(null);
        }}
        onConfirm={handleDeleteAllocation}
        allocation={selectedAllocation}
      />
    </div>
  );
};

export default ClassAllocation;
