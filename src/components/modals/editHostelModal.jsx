import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const EditModal = ({ item, editType, onClose, onUpdate, token }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      setLoading(true);
      let endpoint;
      
      // Hostel endpoints
      if (editType === "dormitories") {
        endpoint = `http://localhost:5010/api/hostel-transport/dormitories/${item.id}`;
      } else if (editType === "allocations") {
        endpoint = `http://localhost:5010/api/hostel-transport/allocations/${item.id}`;
      } else if (editType === "students") {
        endpoint = `http://localhost:5010/api/hostel-transport/boarders/${item.id}`;
      }
      // Transport endpoints
      else if (editType === "routes") {
        endpoint = `http://localhost:5010/api/hostel-transport/routes/${item.id}`;
      } else if (editType === "stops") {
        endpoint = `http://localhost:5010/api/hostel-transport/stops/${item.id}`;
      } else if (editType === "allocations") {
        endpoint = `http://localhost:5010/api/hostel-transport/allocations/${item.id}`;
      }
      
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      });
      
      const responseData = await response.json();
      
      if (responseData.success) {
        // Determine which property contains the updated item based on endpoint
        let updatedItem;
        
        // Extract the updated item
        if (editType === "dormitories") {
          updatedItem = responseData.dormitory;
        } else if (editType === "allocations" && formData.dormitory_name) {
          updatedItem = responseData.allocation; // hostel allocation
        } else if (editType === "students") {
          updatedItem = responseData.student;
        } else if (editType === "routes") {
          updatedItem = responseData.route;
        } else if (editType === "stops") {
          updatedItem = responseData.stop;
        } else if (editType === "allocations" && formData.route_name) {
          updatedItem = responseData.allocation; // transport allocation
        }
        
        // Update parent component's state
        onUpdate(updatedItem);
        onClose();
      } else {
        setError(responseData.message || "Failed to update");
      }
    } catch (error) {
      console.error("Error updating:", error);
      setError("An error occurred while updating");
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
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
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              name="gender"
              id="gender"
              value={formData.gender || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacity</label>
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
            <label htmlFor="fee_per_term" className="block text-sm font-medium text-gray-700">Fee Per Term (KES)</label>
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
            <label htmlFor="caretaker_name" className="block text-sm font-medium text-gray-700">Caretaker Name</label>
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
            <label htmlFor="caretaker_contact" className="block text-sm font-medium text-gray-700">Caretaker Contact</label>
            <input
              type="text"
              name="caretaker_contact"
              id="caretaker_contact"
              value={formData.caretaker_contact || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              id="status"
              value={formData.status || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="closed">Closed</option>
            </select>
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
            <p className="block text-sm font-medium text-gray-700">Student Name</p>
            <p className="mt-1 text-sm text-gray-900">{formData.student_name}</p>
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700">Dormitory</p>
            <p className="mt-1 text-sm text-gray-900">{formData.dormitory_name}</p>
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700">Room & Bed</p>
            <p className="mt-1 text-sm text-gray-900">Room {formData.room_number}, Bed {formData.bed_number}</p>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              id="status"
              value={formData.status || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="active">Active</option>
              <option value="transferred">Transferred</option>
              <option value="vacated">Vacated</option>
            </select>
          </div>
          {formData.status === "vacated" && (
            <div>
              <label htmlFor="vacated_date" className="block text-sm font-medium text-gray-700">Vacated Date</label>
              <input
                type="date"
                name="vacated_date"
                id="vacated_date"
                value={formData.vacated_date ? new Date(formData.vacated_date).toISOString().split('T')[0] : ""}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required={formData.status === "vacated"}
              />
            </div>
          )}
        </div>
      </form>
    );
  };

  const renderStudentForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="block text-sm font-medium text-gray-700">Full Name</p>
            <p className="mt-1 text-sm text-gray-900">
              {formData.first_name} {formData.last_name}
            </p>
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700">Admission Number</p>
            <p className="mt-1 text-sm text-gray-900">{formData.admission_number}</p>
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700">Current Dormitory</p>
            <p className="mt-1 text-sm text-gray-900">{formData.dormitory || 'Not Allocated'}</p>
          </div>
          
          {/* Only certain fields can be edited for students from the hostel module */}
          <div>
            <label htmlFor="allocation_status" className="block text-sm font-medium text-gray-700">Allocation Status</label>
            <select
              name="allocation_status"
              id="allocation_status"
              value={formData.allocation_status || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Not Allocated</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
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
            <label htmlFor="route_name" className="block text-sm font-medium text-gray-700">Route Name</label>
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
            <label htmlFor="departure_time" className="block text-sm font-medium text-gray-700">Departure Time</label>
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
            <label htmlFor="return_time" className="block text-sm font-medium text-gray-700">Return Time</label>
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
            <label htmlFor="fee_per_term" className="block text-sm font-medium text-gray-700">Fee Per Term (KES)</label>
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
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              id="status"
              value={formData.status || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
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
            <label htmlFor="stop_name" className="block text-sm font-medium text-gray-700">Stop Name</label>
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
            <p className="block text-sm font-medium text-gray-700">Route</p>
            <p className="mt-1 text-sm text-gray-900">{formData.route_name}</p>
          </div>
          <div>
            <label htmlFor="stop_order" className="block text-sm font-medium text-gray-700">Stop Order</label>
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
            <label htmlFor="morning_pickup_time" className="block text-sm font-medium text-gray-700">Morning Pickup Time</label>
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
            <label htmlFor="evening_dropoff_time" className="block text-sm font-medium text-gray-700">Evening Dropoff Time</label>
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
            <p className="block text-sm font-medium text-gray-700">Student Name</p>
            <p className="mt-1 text-sm text-gray-900">{formData.student_name}</p>
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700">Admission Number</p>
            <p className="mt-1 text-sm text-gray-900">{formData.admission_number}</p>
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700">Route</p>
            <p className="mt-1 text-sm text-gray-900">{formData.route_name}</p>
          </div>
          <div>
            <label htmlFor="pickup_stop_id" className="block text-sm font-medium text-gray-700">Pickup Stop</label>
            <select
              name="pickup_stop_id"
              id="pickup_stop_id"
              value={formData.pickup_stop_id || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select a stop</option>
              {/* Here you would ideally fetch stops for this route */}
              <option value={formData.pickup_stop_id}>{formData.stop_name}</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              id="status"
              value={formData.status || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          {formData.status === "inactive" && (
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                name="end_date"
                id="end_date"
                value={formData.end_date ? new Date(formData.end_date).toISOString().split('T')[0] : ""}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required={formData.status === "inactive"}
              />
            </div>
          )}
        </div>
      </form>
    );
  };

  const renderForm = () => {
    // Hostel forms
    if (editType === 'dormitories') {
      return renderDormitoryForm();
    } else if (editType === 'allocations' && formData.dormitory_name) {
      return renderHostelAllocationForm();
    } else if (editType === 'students') {
      return renderStudentForm();
    } 
    // Transport forms
    else if (editType === 'routes') {
      return renderRouteForm();
    } else if (editType === 'stops') {
      return renderStopForm();
    } else if (editType === 'allocations' && formData.route_name) {
      return renderTransportAllocationForm();
    } else {
      return <p>No form available</p>;
    }
  };

  // Get modal title based on edit type
  const getModalTitle = () => {
    // Hostel titles
    if (editType === 'dormitories') {
      return `Edit Dormitory: ${item?.name}`;
    } else if (editType === 'allocations' && item?.dormitory_name) {
      return `Edit Hostel Allocation: ${item?.student_name}`;
    } else if (editType === 'students') {
      return `Edit Student: ${item?.first_name} ${item?.last_name}`;
    }
    // Transport titles
    else if (editType === 'routes') {
      return `Edit Route: ${item?.route_name}`;
    } else if (editType === 'stops') {
      return `Edit Stop: ${item?.stop_name}`;
    } else if (editType === 'allocations' && item?.route_name) {
      return `Edit Transport Allocation: ${item?.student_name}`;
    } else {
      return 'Edit';
    }
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto z-50">
         <div className="bg-black opacity-50 w-full h-full absolute" onClick={onClose}></div>
      <div className="relative flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
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
              {loading ? 'Saving...' : 'Save Changes'}
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

export default EditModal;