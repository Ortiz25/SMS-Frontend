import React, { useState } from "react";
import { Search, Pencil, Trash2, Plus } from "lucide-react";
import AssetFormDialog from "./modals/assestForm";

const AssetsList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  // Assets state
  const [assets, setAssets] = useState([
    {
      id: 1,
      name: "Student Desk",
      category: "Furniture",
      location: "Classroom 101",
      status: "In Use",
      condition: "Good",
      serialNumber: "DSK-2024-001",
      purchaseDate: "2024-01-15",
      lastMaintenance: "2024-01-20",
      nextMaintenance: "2024-07-20",
      assignedTo: "Class 10A",
    },
  ]);

  // Dialog control states
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    location: "",
    status: "",
    condition: "",
    serialNumber: "",
    purchaseDate: "",
    lastMaintenance: "",
    nextMaintenance: "",
    assignedTo: "",
  });

  // Handler for opening dialog in "add" mode
  const handleAddNew = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      category: "",
      location: "",
      status: "",
      condition: "",
      serialNumber: "",
      purchaseDate: "",
      lastMaintenance: "",
      nextMaintenance: "",
      assignedTo: "",
    });
    setShowDialog(true);
  };

  // Handler for opening dialog in "edit" mode
  const handleEdit = (asset) => {
    setIsEditing(true);
    setFormData(asset);
    setShowDialog(true);
  };

  // Handler for saving asset
  const handleSave = () => {
    if (isEditing) {
      // Update existing asset
      setAssets(
        assets.map((asset) => (asset.id === formData.id ? formData : asset))
      );
    } else {
      // Add new asset
      const newAsset = {
        ...formData,
        id: Math.max(...assets.map((a) => a.id), 0) + 1,
      };
      setAssets([...assets, newAsset]);
    }
    setShowDialog(false);
  };

  // Filter assets based on search and category
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || asset.category === categoryFilter;

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
            placeholder="Search assets..."
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
          <option value="Furniture">Furniture</option>
          <option value="IT">IT Equipment</option>
          <option value="Lab">Lab Equipment</option>
        </select>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Asset
        </button>
      </div>

      {/* Assets Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Asset
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Condition
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Next Maintenance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAssets.map((asset) => (
              <tr key={asset.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {asset.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {asset.serialNumber}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {asset.location}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      asset.status === "In Use"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {asset.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      asset.condition === "Good"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {asset.condition}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {asset.nextMaintenance}
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => handleEdit(asset)}
                    className="p-1 border rounded-md hover:bg-gray-50"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button className="p-1 border rounded-md">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AssetFormDialog
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

export default AssetsList;
