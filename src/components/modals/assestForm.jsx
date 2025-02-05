import React from "react";

const AssetFormDialog = ({
  show,
  onClose,
  formData,
  setFormData,
  onSave,
  isEditing,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center ">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {isEditing ? "Edit Asset" : "Add New Asset"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <input
              type="text"
              placeholder="Asset Name *"
              className="rounded-md border border-gray-300 py-2 px-3"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <select
              className="rounded-md border border-gray-300 py-2 px-3"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            >
              <option value="">Select Category *</option>
              <option value="Furniture">Furniture</option>
              <option value="IT">IT Equipment</option>
              <option value="Lab">Lab Equipment</option>
            </select>

            {/* Asset Details */}
            <input
              type="text"
              placeholder="Serial Number *"
              className="rounded-md border border-gray-300 py-2 px-3"
              value={formData.serialNumber}
              onChange={(e) =>
                setFormData({ ...formData, serialNumber: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Location *"
              className="rounded-md border border-gray-300 py-2 px-3"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              required
            />
            <input
              type="date"
              placeholder="Purchase Date"
              className="rounded-md border border-gray-300 py-2 px-3"
              value={formData.purchaseDate}
              onChange={(e) =>
                setFormData({ ...formData, purchaseDate: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Assigned To"
              className="rounded-md border border-gray-300 py-2 px-3"
              value={formData.assignedTo}
              onChange={(e) =>
                setFormData({ ...formData, assignedTo: e.target.value })
              }
            />

            {/* Status and Condition */}
            <select
              className="rounded-md border border-gray-300 py-2 px-3"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              required
            >
              <option value="">Select Status *</option>
              <option value="In Use">In Use</option>
              <option value="In Storage">In Storage</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
            <select
              className="rounded-md border border-gray-300 py-2 px-3"
              value={formData.condition}
              onChange={(e) =>
                setFormData({ ...formData, condition: e.target.value })
              }
              required
            >
              <option value="">Select Condition *</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>

            {/* Maintenance Information */}
            <input
              type="date"
              placeholder="Last Maintenance Date"
              className="rounded-md border border-gray-300 py-2 px-3"
              value={formData.lastMaintenance}
              onChange={(e) =>
                setFormData({ ...formData, lastMaintenance: e.target.value })
              }
            />
            <input
              type="date"
              placeholder="Next Maintenance Date"
              className="rounded-md border border-gray-300 py-2 px-3"
              value={formData.nextMaintenance}
              onChange={(e) =>
                setFormData({ ...formData, nextMaintenance: e.target.value })
              }
            />
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={
                !formData.name ||
                !formData.serialNumber ||
                !formData.category ||
                !formData.status
              }
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditing ? "Save Changes" : "Add Asset"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetFormDialog;
