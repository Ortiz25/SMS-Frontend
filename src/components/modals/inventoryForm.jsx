import React from "react";

const InventoryFormDialog = ({
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
            {isEditing ? "Edit Inventory Item" : "Add New Item"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <input
              type="text"
              placeholder="Item Name *"
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
              <option value="Supplies">Supplies</option>
              <option value="Books">Books</option>
              <option value="Lab">Lab Supplies</option>
            </select>

            {/* Stock Information */}
            <input
              type="number"
              placeholder="Current Stock *"
              className="rounded-md border border-gray-300 py-2 px-3"
              value={formData.currentStock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currentStock: parseInt(e.target.value),
                })
              }
              required
            />
            <input
              type="number"
              placeholder="Minimum Stock Level *"
              className="rounded-md border border-gray-300 py-2 px-3"
              value={formData.minimumStock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minimumStock: parseInt(e.target.value),
                })
              }
              required
            />
            <input
              type="number"
              placeholder="Reorder Point *"
              className="rounded-md border border-gray-300 py-2 px-3"
              value={formData.reorderPoint}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reorderPoint: parseInt(e.target.value),
                })
              }
              required
            />
            <input
              type="number"
              placeholder="Unit Price *"
              className="rounded-md border border-gray-300 py-2 px-3"
              value={formData.unitPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  unitPrice: parseFloat(e.target.value),
                })
              }
              step="0.01"
              required
            />

            {/* Supplier and Location */}
            <input
              type="text"
              placeholder="Supplier *"
              className="rounded-md border border-gray-300 py-2 px-3"
              value={formData.supplier}
              onChange={(e) =>
                setFormData({ ...formData, supplier: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Storage Location *"
              className="rounded-md border border-gray-300 py-2 px-3"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              required
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
                !formData.name || !formData.currentStock || !formData.supplier
              }
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditing ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryFormDialog;
