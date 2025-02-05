import React from "react";

const IncidentFormDialog = ({
  show,
  onClose,
  formData,
  setFormData,
  onSave,
  isEditing,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Dialog Content */}
      <div className="relative bg-white rounded-lg max-w-2xl w-full p-6 z-50">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {isEditing ? "Edit Incident Record" : "New Incident Record"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Student Information */}
          <input
            type="text"
            placeholder="Student Name *"
            className="rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.studentName}
            onChange={(e) =>
              setFormData({ ...formData, studentName: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Student ID *"
            className="rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.studentId}
            onChange={(e) =>
              setFormData({ ...formData, studentId: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Grade/Class"
            className="rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.grade}
            onChange={(e) =>
              setFormData({ ...formData, grade: e.target.value })
            }
          />
          <input
            type="date"
            className="rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          {/* Incident Details */}
          <select
            className="rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
          >
            <option value="">Select Incident Type *</option>
            <option value="Misconduct">Misconduct</option>
            <option value="Academic">Academic</option>
            <option value="Attendance">Attendance</option>
            <option value="Other">Other</option>
          </select>

          <select
            className="rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.severity}
            onChange={(e) =>
              setFormData({ ...formData, severity: e.target.value })
            }
            required
          >
            <option value="">Select Severity *</option>
            <option value="Minor">Minor</option>
            <option value="Moderate">Moderate</option>
            <option value="Serious">Serious</option>
          </select>

          <div className="md:col-span-2">
            <textarea
              placeholder="Incident Description *"
              className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              required
            />
          </div>

          <input
            type="text"
            placeholder="Location"
            className="rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Witnesses"
            className="rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.witnesses}
            onChange={(e) =>
              setFormData({ ...formData, witnesses: e.target.value })
            }
          />

          {/* Action and Follow-up */}
          <select
            className="rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.action}
            onChange={(e) =>
              setFormData({ ...formData, action: e.target.value })
            }
            required
          >
            <option value="">Select Action Taken *</option>
            <option value="Verbal Warning">Verbal Warning</option>
            <option value="Written Warning">Written Warning</option>
            <option value="Parent Conference">Parent Conference</option>
            <option value="Detention">Detention</option>
            <option value="Suspension">Suspension</option>
            <option value="Other">Other</option>
          </select>

          <select
            className="rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            required
          >
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
          </select>

          <input
            type="date"
            placeholder="Follow-up Date"
            className="rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.followUp}
            onChange={(e) =>
              setFormData({ ...formData, followUp: e.target.value })
            }
          />
        </div>

        {/* Form Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={
              !formData.studentName ||
              !formData.studentId ||
              !formData.type ||
              !formData.severity ||
              !formData.description ||
              !formData.action
            }
            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? "Save Changes" : "Create Record"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentFormDialog;
