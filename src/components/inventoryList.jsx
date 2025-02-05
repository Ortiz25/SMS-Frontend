import React, { useState } from "react";
import { Search, Pencil, Trash2, Plus, AlertCircle } from "lucide-react";
import InventoryFormDialog from "./modals/inventoryForm";

const InventoryList = () => {
  // Dialog control states
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    currentStock: "",
    minimumStock: "",
    reorderPoint: "",
    unitPrice: "",
    supplier: "",
    location: "",
    lastRestocked: new Date().toISOString().split("T")[0],
    status: "Adequate",
  });

  // Handler for opening dialog in "add" mode
  const handleAddNew = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      category: "",
      currentStock: "",
      minimumStock: "",
      reorderPoint: "",
      unitPrice: "",
      supplier: "",
      location: "",
      lastRestocked: new Date().toISOString().split("T")[0],
      status: "Adequate",
    });
    setShowDialog(true);
  };

  // Handler for opening dialog in "edit" mode
  const handleEdit = (item) => {
    setIsEditing(true);
    setFormData(item);
    setShowDialog(true);
  };

  // Handler for saving inventory item
  const handleSave = () => {
    if (isEditing) {
      // Update existing item
      setInventory(
        inventory.map((item) => (item.id === formData.id ? formData : item))
      );
    } else {
      // Add new item
      const newItem = {
        ...formData,
        id: Math.max(...inventory.map((i) => i.id), 0) + 1,
      };
      setInventory([...inventory, newItem]);
    }
    setShowDialog(false);
  };

  // Handler for deleting inventory item
  const handleDelete = (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setInventory(inventory.filter((item) => item.id !== itemId));
    }
  };
  const [inventory, setInventory] = useState([
    {
      id: 1,
      name: "Whiteboard Marker",
      category: "Supplies",
      currentStock: 150,
      minimumStock: 50,
      reorderPoint: 75,
      unitPrice: 1.5,
      supplier: "Office Supplies Co.",
      location: "Store Room A",
      lastRestocked: "2024-01-10",
      status: "Adequate",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Filter inventory items
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search inventory..."
            className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="rounded-md border border-gray-300 py-2 px-3"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="Supplies">Supplies</option>
          <option value="Books">Books</option>
          <option value="Lab">Lab Supplies</option>
        </select>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </button>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Current Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Last Restocked
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInventory.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {item.name}
                  </div>
                  <div className="text-sm text-gray-500">{item.category}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {item.currentStock}
                  </div>
                  {item.currentStock <= item.reorderPoint && (
                    <div className="flex items-center text-xs text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Low Stock
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      item.currentStock > item.reorderPoint
                        ? "bg-green-100 text-green-800"
                        : item.currentStock <= item.minimumStock
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {item.currentStock <= item.minimumStock
                      ? "Critical"
                      : item.currentStock <= item.reorderPoint
                      ? "Low"
                      : "Adequate"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {item.supplier}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {item.location}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {item.lastRestocked}
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1 border rounded-md hover:bg-gray-50"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 border rounded-md hover:bg-gray-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <InventoryFormDialog
        show={showDialog}
        onClose={() => setShowDialog(false)}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        isEditing={isEditing}
      />
    </div>
  );
};

export default InventoryList;
