import React from "react";
import { X } from "lucide-react";

const ViewModal = ({ item, viewType, onClose }) => {
  if (!item) return null;

  // Hostel-related views
  const renderDormitoryDetails = () => {
    return (
      <div className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Name</h3>
            <p className="mt-1 text-sm text-gray-900">{item.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Gender</h3>
            <p className="mt-1 text-sm text-gray-900">
              {item.gender === 'boys' ? 'Boys' : 
               item.gender === 'girls' ? 'Girls' : 'Mixed'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Capacity</h3>
            <p className="mt-1 text-sm text-gray-900">{item.capacity}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Occupied</h3>
            <p className="mt-1 text-sm text-gray-900">
              {item.occupied} ({Math.round((item.occupied / item.capacity) * 100)}%)
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Fee Per Term</h3>
            <p className="mt-1 text-sm text-gray-900">KES {item.fee_per_term?.toLocaleString() || 0}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="mt-1">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${item.status === 'active' ? 'bg-green-100 text-green-800' : 
                  item.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'}`}>
                {item.status}
              </span>
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Caretaker</h3>
            <p className="mt-1 text-sm text-gray-900">{item.caretaker_name || 'Not assigned'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Caretaker Contact</h3>
            <p className="mt-1 text-sm text-gray-900">{item.caretaker_contact || 'N/A'}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderHostelAllocationDetails = () => {
    return (
      <div className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Student Name</h3>
            <p className="mt-1 text-sm text-gray-900">{item.student_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Admission Number</h3>
            <p className="mt-1 text-sm text-gray-900">{item.admission_number}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Dormitory</h3>
            <p className="mt-1 text-sm text-gray-900">{item.dormitory_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Room & Bed</h3>
            <p className="mt-1 text-sm text-gray-900">
              Room {item.room_number}, Bed {item.bed_number}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Allocation Date</h3>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(item.allocation_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="mt-1">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${item.status === 'active' ? 'bg-green-100 text-green-800' : 
                  item.status === 'transferred' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'}`}>
                {item.status}
              </span>
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Academic Session</h3>
            <p className="mt-1 text-sm text-gray-900">{item.academic_session}</p>
          </div>
          {item.vacated_date && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Vacated Date</h3>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(item.vacated_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStudentDetails = () => {
    return (
      <div className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
            <p className="mt-1 text-sm text-gray-900">
              {item.first_name} {item.last_name} {item.other_names || ''}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Admission Number</h3>
            <p className="mt-1 text-sm text-gray-900">{item.admission_number}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Class</h3>
            <p className="mt-1 text-sm text-gray-900">
              {item.current_class} {item.stream}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Gender</h3>
            <p className="mt-1 text-sm text-gray-900">
              {item.gender === 'male' ? 'Male' : 
               item.gender === 'female' ? 'Female' : 'Other'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
            <p className="mt-1 text-sm text-gray-900">
              {item.date_of_birth ? new Date(item.date_of_birth).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Current Dormitory</h3>
            <p className="mt-1 text-sm text-gray-900">
              {item.dormitory || 'Not Allocated'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Allocation Status</h3>
            <p className="mt-1">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${item.allocation_status === 'active' ? 'bg-green-100 text-green-800' : 
                  item.allocation_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'}`}>
                {item.allocation_status || 'Not Allocated'}
              </span>
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Student Type</h3>
            <p className="mt-1 text-sm text-gray-900">
              {item.student_type === 'boarder' ? 'Boarder' : 'Day Scholar'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Transport-related views
  const renderRouteDetails = () => {
    return (
      <div className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Route Name</h3>
            <p className="mt-1 text-sm text-gray-900">{item.route_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Departure Time</h3>
            <p className="mt-1 text-sm text-gray-900">{item.departure_time}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Return Time</h3>
            <p className="mt-1 text-sm text-gray-900">{item.return_time}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Fee Per Term</h3>
            <p className="mt-1 text-sm text-gray-900">KES {item.fee_per_term?.toLocaleString() || 0}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Number of Stops</h3>
            <p className="mt-1 text-sm text-gray-900">{item.stops_count || 0}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Number of Students</h3>
            <p className="mt-1 text-sm text-gray-900">{item.students_count || 0}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="mt-1">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {item.status}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderStopDetails = () => {
    return (
      <div className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Stop Name</h3>
            <p className="mt-1 text-sm text-gray-900">{item.stop_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Route</h3>
            <p className="mt-1 text-sm text-gray-900">{item.route_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Stop Order</h3>
            <p className="mt-1 text-sm text-gray-900">{item.stop_order}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Morning Pickup Time</h3>
            <p className="mt-1 text-sm text-gray-900">{item.morning_pickup_time || 'Not set'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Evening Dropoff Time</h3>
            <p className="mt-1 text-sm text-gray-900">{item.evening_dropoff_time || 'Not set'}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderTransportAllocationDetails = () => {
    return (
      <div className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Student Name</h3>
            <p className="mt-1 text-sm text-gray-900">{item.student_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Admission Number</h3>
            <p className="mt-1 text-sm text-gray-900">{item.admission_number}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Route</h3>
            <p className="mt-1 text-sm text-gray-900">{item.route_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Pickup Stop</h3>
            <p className="mt-1 text-sm text-gray-900">{item.stop_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Allocation Date</h3>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(item.allocation_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="mt-1">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {item.status}
              </span>
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Academic Session</h3>
            <p className="mt-1 text-sm text-gray-900">{item.academic_session}</p>
          </div>
          {item.end_date && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">End Date</h3>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(item.end_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    // Hostel views
    if (viewType === 'dormitories') {
      return renderDormitoryDetails();
    } else if (viewType === 'allocations') {
      return renderHostelAllocationDetails();
    } else if (viewType === 'students') {
      return renderStudentDetails();
    }
    // Transport views
    else if (viewType === 'routes') {
      return renderRouteDetails();
    } else if (viewType === 'stops') {
      return renderStopDetails();
    } else if (viewType === 'transport-allocations') {
      return renderTransportAllocationDetails();
    } else {
      return <p>No details available</p>;
    }
  };

  // Get modal title based on view type
  const getModalTitle = () => {
    // Hostel titles
    if (viewType === 'dormitories') {
      return `Dormitory Details: ${item.name}`;
    } else if (viewType === 'allocations') {
      return `Hostel Allocation Details: ${item.student_name}`;
    } else if (viewType === 'students') {
      return `Student Details: ${item.first_name} ${item.last_name}`;
    }
    // Transport titles
    else if (viewType === 'routes') {
      return `Route Details: ${item.route_name}`;
    } else if (viewType === 'stops') {
      return `Stop Details: ${item.stop_name}`;
    } else if (viewType === 'transport-allocations') {
      return `Transport Allocation Details: ${item.student_name}`;
    } else {
      return 'Details';
    }
  };

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
                  {renderContent()}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewModal;