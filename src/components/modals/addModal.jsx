import React, { useState } from "react";
import { X } from "lucide-react";
import { useEffect } from "react";

const AddModal = ({ addType, onClose, onAdd, token }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [students, setStudents] = useState([]);
  const [dormitoryRooms, setDormitoryRooms] = useState([]);
  const [academicSessions, setAcademicSessions] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  
  useEffect(() => {
    // Fetch necessary data based on the form type
    const fetchData = async () => {
      try {
        // Common data that multiple forms might need
        if (["hostel-allocations", "transport-allocations"].includes(addType)) {
          // Fetch students (only boarders for hostel and day scholars for transport)
          const studentType =
            addType === "hostel-allocations" ? "/hostel-transport/boarders/" : "/hostel-transport//day-scholars";
          const studentsResponse = await fetch(
            `http://localhost:5010/api${studentType}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const studentsData = await studentsResponse.json();
          console.log(studentsData)
          setStudents(studentsData?.dayScholars || studentsData?.boarders || []);

          // Fetch academic sessions
          const sessionsResponse = await fetch(
            "http://localhost:5010/api/sessions/academic-sessions",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const sessionsData = await sessionsResponse.json();
          console.log(sessionsData)
          setAcademicSessions(sessionsData.data || []);
        }

        // Form-specific data
        if (addType === "hostel-allocations") {
          // Fetch dormitory rooms with available beds
          const roomsResponse = await fetch(
            "http://localhost:5010/api/hostel-transport/rooms",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const roomsData = await roomsResponse.json();
          setDormitoryRooms(roomsData.rooms || []);
        } else if (addType === "stops") {
          // Fetch routes for stops
          const routesResponse = await fetch(
            "http://localhost:5010/api/hostel-transport/routes",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const routesData = await routesResponse.json();
          console.log(routesData)
          setRoutes(routesData.routes || []);
        } else if (addType === "transport-allocations") {
          // Fetch active routes
          const routesResponse = await fetch(
            "http://localhost:5010/api/hostel-transport/routes",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const routesData = await routesResponse.json();
          setRoutes(routesData.routes || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load form data");
      }
    };

    fetchData();
  }, [addType, token]);

  useEffect(() => {
    const fetchStops = async () => {
      if (formData.route_id && addType === "transport-allocations") {
        try {
          const stopsResponse = await fetch(
            `http://localhost:5010/api/transport/stops?route_id=${formData.route_id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const stopsData = await stopsResponse.json();
          setStops(stopsData.stops || []);
        } catch (error) {
          console.error("Error fetching stops:", error);
        }
      }
    };

    fetchStops();
  }, [formData.route_id, addType, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      let endpoint;

      // Hostel endpoints
      if (addType === "dormitories") {
        endpoint = "http://localhost:5010/api/hostel-transport/dormitories";
        // Set default values if not provided
        if (!formData.status) formData.status = "active";
      } else if (addType === "hostel-allocations") {
        endpoint = "http://localhost:5010/api/hostel-transport/allocations";
        // Set default values
        if (!formData.status) formData.status = "active";
      }
      // Transport endpoints
      else if (addType === "routes") {
        endpoint = "http://localhost:5010/api/hostel-transport/routes";
        // Set default values
        if (!formData.status) formData.status = "active";
      } else if (addType === "stops") {
        endpoint = "http://localhost:5010/api/hostel-transport/stops";
      } else if (addType === "transport-allocations") {
        endpoint = "http://localhost:5010/api/hostel-transport/allocations";
        // Set default values
        if (!formData.status) formData.status = "active";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (responseData.success) {
        // Determine which property contains the new item based on endpoint
        let newItem;

        // Extract the new item
        if (addType === "dormitories") {
          newItem = responseData.dormitory;
        } else if (addType === "hostel-allocations") {
          newItem = responseData.allocation;
        } else if (addType === "routes") {
          newItem = responseData.route;
        } else if (addType === "stops") {
          newItem = responseData.stop;
        } else if (addType === "transport-allocations") {
          newItem = responseData.allocation;
        }

        // Update parent component's state
        onAdd(newItem);
        onClose();
      } else {
        setError(responseData.message || "Failed to add");
      }
    } catch (error) {
      console.error("Error adding item:", error);
      setError("An error occurred while adding");
    } finally {
      setLoading(false);
    }
  };

  // Hostel-related forms
  const renderDormitoryForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700"
            >
              Gender
            </label>
            <select
              name="gender"
              id="gender"
              value={formData.gender || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select gender</option>
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="capacity"
              className="block text-sm font-medium text-gray-700"
            >
              Capacity
            </label>
            <input
              type="number"
              name="capacity"
              id="capacity"
              value={formData.capacity || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
              min="1"
            />
          </div>
          <div>
            <label
              htmlFor="fee_per_term"
              className="block text-sm font-medium text-gray-700"
            >
              Fee Per Term (KES)
            </label>
            <input
              type="number"
              name="fee_per_term"
              id="fee_per_term"
              value={formData.fee_per_term || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
              min="0"
            />
          </div>
          <div>
            <label
              htmlFor="caretaker_name"
              className="block text-sm font-medium text-gray-700"
            >
              Caretaker Name
            </label>
            <input
              type="text"
              name="caretaker_name"
              id="caretaker_name"
              value={formData.caretaker_name || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="caretaker_contact"
              className="block text-sm font-medium text-gray-700"
            >
              Caretaker Contact
            </label>
            <input
              type="text"
              name="caretaker_contact"
              id="caretaker_contact"
              value={formData.caretaker_contact || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </form>
    );
  };

  const renderHostelAllocationForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="student_id"
              className="block text-sm font-medium text-gray-700"
            >
              Student
            </label>
            <select
              name="student_id"
              id="student_id"
              value={formData.student_id || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.admission_number} - {student.first_name}{" "}
                  {student.last_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="room_id"
              className="block text-sm font-medium text-gray-700"
            >
              Room
            </label>
            <select
              name="room_id"
              id="room_id"
              value={formData.room_id || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select a room</option>
              {dormitoryRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.dormitory_name} - Room {room.room_number} (
                  {room.capacity - room.occupied} beds available)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="bed_number"
              className="block text-sm font-medium text-gray-700"
            >
              Bed Number
            </label>
            <input
              type="text"
              name="bed_number"
              id="bed_number"
              value={formData.bed_number || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="academic_session_id"
              className="block text-sm font-medium text-gray-700"
            >
              Academic Session
            </label>
            <select
              name="academic_session_id"
              id="academic_session_id"
              value={formData.academic_session_id || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select a session</option>
              {academicSessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.year} Term {session.term}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    );
  };

  // Transport-related forms
  const renderRouteForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="route_name"
              className="block text-sm font-medium text-gray-700"
            >
              Route Name
            </label>
            <input
              type="text"
              name="route_name"
              id="route_name"
              value={formData.route_name || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="departure_time"
              className="block text-sm font-medium text-gray-700"
            >
              Departure Time
            </label>
            <input
              type="time"
              name="departure_time"
              id="departure_time"
              value={formData.departure_time || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="return_time"
              className="block text-sm font-medium text-gray-700"
            >
              Return Time
            </label>
            <input
              type="time"
              name="return_time"
              id="return_time"
              value={formData.return_time || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="fee_per_term"
              className="block text-sm font-medium text-gray-700"
            >
              Fee Per Term (KES)
            </label>
            <input
              type="number"
              name="fee_per_term"
              id="fee_per_term"
              value={formData.fee_per_term || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
              min="0"
            />
          </div>
        </div>
      </form>
    );
  };

  const renderStopForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="route_id"
              className="block text-sm font-medium text-gray-700"
            >
              Route
            </label>
            <select
              name="route_id"
              id="route_id"
              value={formData.route_id || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select a route</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.route_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="stop_name"
              className="block text-sm font-medium text-gray-700"
            >
              Stop Name
            </label>
            <input
              type="text"
              name="stop_name"
              id="stop_name"
              value={formData.stop_name || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="stop_order"
              className="block text-sm font-medium text-gray-700"
            >
              Stop Order
            </label>
            <input
              type="number"
              name="stop_order"
              id="stop_order"
              value={formData.stop_order || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
              min="1"
            />
          </div>
          <div>
            <label
              htmlFor="morning_pickup_time"
              className="block text-sm font-medium text-gray-700"
            >
              Morning Pickup Time
            </label>
            <input
              type="time"
              name="morning_pickup_time"
              id="morning_pickup_time"
              value={formData.morning_pickup_time || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="evening_dropoff_time"
              className="block text-sm font-medium text-gray-700"
            >
              Evening Dropoff Time
            </label>
            <input
              type="time"
              name="evening_dropoff_time"
              id="evening_dropoff_time"
              value={formData.evening_dropoff_time || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </form>
    );
  };

  const renderTransportAllocationForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="student_id"
              className="block text-sm font-medium text-gray-700"
            >
              Student
            </label>
            <select
              name="student_id"
              id="student_id"
              value={formData.student_id || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.admission_number} - {student.first_name}{" "}
                  {student.last_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="route_id"
              className="block text-sm font-medium text-gray-700"
            >
              Route
            </label>
            <select
              name="route_id"
              id="route_id"
              value={formData.route_id || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select a route</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.route_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="pickup_stop_id"
              className="block text-sm font-medium text-gray-700"
            >
              Pickup Stop
            </label>
            <select
              name="pickup_stop_id"
              id="pickup_stop_id"
              value={formData.pickup_stop_id || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select a stop</option>
              {stops.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.stop_name} -{" "}
                  {stop.morning_pickup_time
                    ? `Pickup: ${stop.morning_pickup_time}`
                    : "No time set"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="academic_session_id"
              className="block text-sm font-medium text-gray-700"
            >
              Academic Session
            </label>
            <select
              name="academic_session_id"
              id="academic_session_id"
              value={formData.academic_session_id || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select a session</option>
              {academicSessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.year} Term {session.term}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    );
  };

  const renderForm = () => {
    // Hostel forms
    if (addType === "dormitories") {
      return renderDormitoryForm();
    } else if (addType === "hostel-allocations") {
      return renderHostelAllocationForm();
    }
    // Transport forms
    else if (addType === "routes") {
      return renderRouteForm();
    } else if (addType === "stops") {
      return renderStopForm();
    } else if (addType === "transport-allocations") {
      return renderTransportAllocationForm();
    } else {
      return <p>No form available</p>;
    }
  };

  // Get modal title based on add type
  const getModalTitle = () => {
    if (loading && ['hostel-allocations', 'transport-allocations', 'stops'].includes(addType)) {
      return <div className="py-4 text-center">Loading form data...</div>;
    }
    // Hostel titles
    if (addType === "dormitories") {
      return "Add New Dormitory";
    } else if (addType === "hostel-allocations") {
      return "Add New Hostel Allocation";
    }
    // Transport titles
    else if (addType === "routes") {
      return "Add New Transport Route";
    } else if (addType === "stops") {
      return "Add New Route Stop";
    } else if (addType === "transport-allocations") {
      return "Add New Transport Allocation";
    } else {
      return "Add New";
    }
  };

  return (
    <div className="fixed inset-0  overflow-y-auto z-50">
      <div
        className="fixed inset-0 bg-black opacity-75 transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      ></div>
      <div className="relative flex min-h-screen items-end z- justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <span
          className="hidden sm:inline-block sm:h-screen sm:align-middle"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className=" inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center">
                  <h3
                    className="text-lg leading-6 font-medium text-gray-900"
                    id="modal-title"
                  >
                    {getModalTitle()}
                  </h3>
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-2">
                  {error && (
                    <div className="mb-4 bg-red-50 p-2 rounded text-red-500 text-sm">
                      {error}
                    </div>
                  )}
                  {renderForm()}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add"}
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddModal;
