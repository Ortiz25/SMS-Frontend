import React, { useState, useEffect } from "react";
import { Calendar, X } from "lucide-react";
import axios from "axios";

const RequestLeaveModal = ({ isOpen, onClose, onSubmit, teacherId, teacherGender }) => {
  // Get token from localStorage
  const token = localStorage.getItem("token");
  const [formData, setFormData] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
    substitute_teacher_id: "",
    attachment_url: "",
  });
  
  const [allLeaveTypes, setAllLeaveTypes] = useState([]);
  const [filteredLeaveTypes, setFilteredLeaveTypes] = useState([]);
  const [substitutes, setSubstitutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch leave types and leave balances
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch leave types
        const typesResponse = await axios.get(
          "/backend/api/leavetypes",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setAllLeaveTypes(typesResponse.data);
      } catch (err) {
        setError("Failed to load leave types");
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // Filter leave types based on gender
  useEffect(() => {
    if (allLeaveTypes.length > 0 && teacherGender) {
      const filtered = allLeaveTypes.filter(type => {
        const typeName = type.name.toLowerCase();
        
        // If female, exclude paternity leave
        if (teacherGender === 'female' && typeName.includes('paternity')) {
          return false;
        }
        
        // If male, exclude maternity leave
        if (teacherGender === 'male' && typeName.includes('maternity')) {
          return false;
        }
        
        return true;
      });
      
      setFilteredLeaveTypes(filtered);
      
      // If the currently selected leave type is filtered out, reset it
      if (formData.leave_type_id) {
        const selectedType = allLeaveTypes.find(t => t.id === parseInt(formData.leave_type_id));
        if (selectedType) {
          const typeName = selectedType.name.toLowerCase();
          if ((teacherGender === 'female' && typeName.includes('paternity')) ||
              (teacherGender === 'male' && typeName.includes('maternity'))) {
            setFormData(prev => ({ ...prev, leave_type_id: "" }));
          }
        }
      }
    } else {
      setFilteredLeaveTypes(allLeaveTypes);
    }
  }, [allLeaveTypes, teacherGender, formData.leave_type_id]);

  // Fetch substitute teachers when dates change
  useEffect(() => {
    const fetchSubstitutes = async () => {
      if (formData.start_date && formData.end_date) {
        const user = JSON.parse(localStorage.getItem("user"));
    
        try {
          const response = await axios.get(
            "/backend/api/teachers/check/available-substitutes",
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              params: {
                start_date: formData.start_date,
                end_date: formData.end_date,
                exclude_teacher_id: user.teacher?.teacher_id,
              },
            }
          );
          console.log(response.data);
          setSubstitutes(response.data);
        } catch (err) {
          console.error("Failed to fetch substitutes:", err);
        }
      }
    };

    fetchSubstitutes();
  }, [formData.start_date, formData.end_date, teacherId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      // Calculate days between dates (excluding weekends)
      const daysCount = await calculateWorkingDays(
        formData.start_date,
        formData.end_date
      );

      // Add teacher ID and days count to form data
      const submitData = {
        ...formData,
        days_count: daysCount,
        teacher_id: user.teacher.teacher_id
      };
      
      onSubmit(submitData);
    } catch (err) {
      setError(err.message || "Failed to submit leave request");
    } finally {
      setLoading(false);
    }
  };

  // Calculate working days between two dates
  const calculateWorkingDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;

    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="relative z-10 bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-medium">Request Leave</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type
            </label>
            <select
              name="leave_type_id"
              value={formData.leave_type_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select leave type</option>
              {filteredLeaveTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 pr-10"
                  required
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  min={
                    formData.start_date ||
                    new Date().toISOString().split("T")[0]
                  }
                  className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 pr-10"
                  required
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Substitute Teacher
            </label>
            <select
              name="substitute_teacher_id"
              value={formData.substitute_teacher_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select substitute teacher</option>
              {substitutes.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.full_name} ({teacher.department})
                </option>
              ))}
            </select>
            {substitutes.length === 0 &&
              formData.start_date &&
              formData.end_date && (
                <p className="text-xs text-amber-600 mt-1">
                  No teachers available for the selected dates
                </p>
              )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Leave
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachment (Optional)
            </label>
            <input
              type="text"
              name="attachment_url"
              value={formData.attachment_url}
              onChange={handleChange}
              placeholder="Upload document URL"
              className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestLeaveModal;