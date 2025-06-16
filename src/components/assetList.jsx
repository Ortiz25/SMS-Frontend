import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Edit,
  Trash,
  FileCheck,
  AlertTriangle,
  X,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { checkTokenAuth } from "../util/helperFunctions";

const AssetsList = ({ categoryFilter }) => {
  const token = localStorage.getItem("token");
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [modalType, setModalType] = useState(null); // 'status', 'edit', 'delete', 'new'
  const [newStatus, setNewStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [paginatedAssets, setPaginatedAssets] = useState([]);

  const [newAssetData, setNewAssetData] = useState({
    asset_id: "",
    name: "",
    category_id: "",
    location: "",
    purchase_date: "",
    purchase_cost: "",
    supplier: "",
    warranty_expiry: "",
    status: "active",
    assigned_to: "",
    department_id: "",
    room_id: "",
    notes: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    category_id: "",
    location: "",
    purchase_date: "",
    purchase_cost: "",
    supplier: "",
    warranty_expiry: "",
    status: "",
    assigned_to: "",
    department_id: "",
    room_id: "",
    notes: "",
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    const adminRights = userInfo.role === "admin";
    setIsAdmin(adminRights);
    async function validate() {
      const { valid } = await checkTokenAuth();
      if (!valid) navigate("/");
    }
    validate();
  }, []);

  useEffect(() => {
    fetchAssets();
    fetchCategories();
    fetchDepartments();
    fetchRooms();
  }, [categoryFilter]);

  // Effect for dynamic filtering as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAssets(assets);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = assets.filter(
      (asset) =>
        asset.asset_id?.toLowerCase().includes(query) ||
        asset.name?.toLowerCase().includes(query) ||
        asset.category?.toLowerCase().includes(query) ||
        asset.location?.toLowerCase().includes(query) ||
        asset.assigned_to?.toLowerCase().includes(query)
    );

    setFilteredAssets(filtered);
    // Reset to first page when filtering
    setCurrentPage(1);
  }, [searchQuery, assets]);

  // Calculate pagination data
  const totalPages = Math.ceil(filteredAssets.length / recordsPerPage);

  // Update paginated data whenever filtered data changes
  useEffect(() => {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    setPaginatedAssets(
      filteredAssets.slice(indexOfFirstRecord, indexOfLastRecord)
    );

    // Reset to first page if current page is now invalid
    if (
      currentPage > Math.ceil(filteredAssets.length / recordsPerPage) &&
      filteredAssets.length > 0
    ) {
      setCurrentPage(1);
    }
  }, [filteredAssets, currentPage, recordsPerPage]);

  useEffect(() => {
    // Initialize form data when selected asset changes (for edit modal)
    if (selectedAsset && modalType === "edit") {
      setEditFormData({
        name: selectedAsset.name || "",
        category_id: selectedAsset.category_id || "",
        location: selectedAsset.location || "",
        purchase_date: selectedAsset.purchase_date
          ? new Date(selectedAsset.purchase_date).toISOString().split("T")[0]
          : "",
        purchase_cost: selectedAsset.purchase_cost || "",
        supplier: selectedAsset.supplier || "",
        warranty_expiry: selectedAsset.warranty_expiry
          ? new Date(selectedAsset.warranty_expiry).toISOString().split("T")[0]
          : "",
        status: selectedAsset.status || "",
        assigned_to: selectedAsset.assigned_to || "",
        department_id: selectedAsset.department_id || "",
        room_id: selectedAsset.room_id || "",
        notes: selectedAsset.notes || "",
      });
    }
  }, [selectedAsset, modalType]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      let url = "/backend/api/inventory/assets";
      const params = {};

      if (categoryFilter && categoryFilter !== "all") {
        params.category = categoryFilter;
      }

      const response = await axios.get(url, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAssets(response.data);
      setFilteredAssets(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "/backend/api/inventory/asset-categories",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        "/backend/api/inventory/departments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get(
        "/backend/api/inventory/rooms",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  // Pagination controls
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing records per page
  };

  // Modal openers
  const openNewAssetModal = () => {
    setModalType("new");
    setNewAssetData({
      asset_id: "",
      name: "",
      category_id: "",
      location: "",
      purchase_date: "",
      purchase_cost: "",
      supplier: "",
      warranty_expiry: "",
      status: "active",
      assigned_to: "",
      department_id: "",
      room_id: "",
      notes: "",
    });
  };

  const openStatusModal = (asset, status) => {
    setSelectedAsset(asset);
    setNewStatus(status);
    setModalType("status");
  };

  const openEditModal = (asset) => {
    setSelectedAsset(asset);
    setModalType("edit");
  };

  const openDeleteModal = (asset) => {
    setSelectedAsset(asset);
    setModalType("delete");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedAsset(null);
    setNewStatus("");
    setEditFormData({
      name: "",
      category_id: "",
      location: "",
      purchase_date: "",
      purchase_cost: "",
      supplier: "",
      warranty_expiry: "",
      status: "",
      assigned_to: "",
      department_id: "",
      room_id: "",
      notes: "",
    });
    setNewAssetData({
      asset_id: "",
      name: "",
      category_id: "",
      location: "",
      purchase_date: "",
      purchase_cost: "",
      supplier: "",
      warranty_expiry: "",
      status: "active",
      assigned_to: "",
      department_id: "",
      room_id: "",
      notes: "",
    });
  };

  // Form handlers
  const handleEditFormChange = useCallback((e) => {
    const { name, value } = e.target;
    let parsedValue = value;

    // Convert numeric fields to numbers if needed
    if (name === "purchase_cost") {
      parsedValue = value === "" ? "" : parseFloat(value);
    }

    setEditFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  }, []);

  const handleNewAssetChange = useCallback((e) => {
    const { name, value } = e.target;
    let parsedValue = value;

    // Convert numeric fields to numbers if needed
    if (name === "purchase_cost") {
      parsedValue = value === "" ? "" : parseFloat(value);
    }

    setNewAssetData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Action handlers
  const handleCreateAsset = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await axios.post(
        "/backend/api/inventory/assets",
        newAssetData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchAssets();
      setActionLoading(false);
      closeModal();
    } catch (error) {
      console.error("Error creating asset:", error);
      setActionLoading(false);
      alert("Error creating asset. Please try again.");
    }
  };

  const handleStatusChange = async () => {
    try {
      setActionLoading(true);
      await axios.patch(
        `/backend/api/inventory/assets/${selectedAsset.id}`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchAssets();
      setActionLoading(false);
      closeModal();
    } catch (error) {
      console.error("Error updating asset status:", error);
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await axios.patch(
        `/backend/api/inventory/assets/${selectedAsset.id}`,
        editFormData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchAssets();
      setActionLoading(false);
      closeModal();
    } catch (error) {
      console.error("Error updating asset:", error);
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await axios.delete(
        `/backend/api/inventory/assets/${selectedAsset.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchAssets();
      setActionLoading(false);
      closeModal();
    } catch (error) {
      console.error("Error deleting asset:", error);
      setActionLoading(false);
    }
  };
  const NewAssetModal = useMemo(() => {
    if (modalType !== "new") return null;
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 overflow-y-auto">
        <div
          className="fixed inset-0 bg-black opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>
        <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full my-8">
          <div className="flex justify-between items-center  mb-4 ">
            <h3 className="text-lg font-medium">Add New Asset</h3>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleCreateAsset} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset ID*
                </label>
                <input
                  type="text"
                  name="asset_id"
                  value={newAssetData.asset_id}
                  onChange={handleNewAssetChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={newAssetData.name}
                  onChange={handleNewAssetChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category_id"
                  value={newAssetData.category_id}
                  onChange={handleNewAssetChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={newAssetData.location}
                  onChange={handleNewAssetChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  name="department_id"
                  value={newAssetData.department_id}
                  onChange={handleNewAssetChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room
                </label>
                <select
                  name="room_id"
                  value={newAssetData.room_id}
                  onChange={handleNewAssetChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.room_number} - {room.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Date
                </label>
                <input
                  type="date"
                  name="purchase_date"
                  value={newAssetData.purchase_date}
                  onChange={handleNewAssetChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Cost
                </label>
                <input
                  type="number"
                  name="purchase_cost"
                  value={newAssetData.purchase_cost}
                  onChange={handleNewAssetChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={newAssetData.supplier}
                  onChange={handleNewAssetChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warranty Expiry
                </label>
                <input
                  type="date"
                  name="warranty_expiry"
                  value={newAssetData.warranty_expiry}
                  onChange={handleNewAssetChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={newAssetData.status}
                  onChange={handleNewAssetChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="disposed">Disposed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <input
                  type="text"
                  name="assigned_to"
                  value={newAssetData.assigned_to}
                  onChange={handleNewAssetChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={newAssetData.notes}
                onChange={handleNewAssetChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700"
                disabled={actionLoading}
              >
                {actionLoading ? "Creating..." : "Create Asset"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }, [newAssetData, categories, departments, rooms, actionLoading]);

  const StatusModal = useMemo(() => {
    if (modalType !== "status") return null;
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div
          className="fixed inset-0 bg-black opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>
        <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Change Asset Status</h3>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-6">
            <p>
              Are you sure you want to change the status of{" "}
              <strong>{selectedAsset?.name}</strong> to{" "}
              <strong>{newStatus}</strong>?
            </p>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {newStatus === "active"
                  ? "This will mark the asset as active and available for use."
                  : "This will mark the asset as requiring maintenance and not available for regular use."}
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleStatusChange}
              className={`px-4 py-2 rounded-md text-white ${
                newStatus === "active"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }`}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    );
  }, [selectedAsset, newStatus, actionLoading]);

  const EditModal = useMemo(() => {
    if (modalType !== "edit") return null;
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 overflow-y-auto">
        <div
          className="fixed inset-0 bg-black opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>
        <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full my-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Edit Asset: {selectedAsset?.name}
            </h3>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category_id"
                  value={editFormData.category_id}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={editFormData.location}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  name="department_id"
                  value={editFormData.department_id}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* More form fields go here */}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700"
                disabled={actionLoading}
              >
                {actionLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }, [editFormData, selectedAsset, categories, departments, actionLoading]);

  const DeleteModal = useMemo(() => {
    if (modalType !== "delete") return null;
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div
          className="fixed inset-0 bg-black opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>
        <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-red-600">Delete Asset</h3>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-6">
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedAsset?.name}</strong>?
            </p>
            <p className="text-sm text-red-600 mt-2">
              This action cannot be undone. All data associated with this asset
              will be permanently removed.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 rounded-md text-white hover:bg-red-700"
              disabled={actionLoading}
            >
              {actionLoading ? "Deleting..." : "Delete Asset"}
            </button>
          </div>
        </div>
      </div>
    );
  }, [selectedAsset, actionLoading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading assets...
      </div>
    );
  }

  return (
    <div>
      {NewAssetModal}
      {StatusModal}
      {EditModal}
      {DeleteModal}

      {/* Header with search and add button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search assets..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        {isAdmin && (
          <button
            onClick={openNewAssetModal}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Asset
          </button>
        )}
      </div>

      {/* Assets Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Asset ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Location
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Purchase Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Assigned To
              </th>
              {isAdmin && (
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedAssets.length > 0 ? (
              paginatedAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {asset.asset_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {asset.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {asset.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {asset.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {asset.purchase_date
                      ? new Date(asset.purchase_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        asset.status === "active"
                          ? "bg-green-100 text-green-800"
                          : asset.status === "maintenance"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {asset.assigned_to || "Not assigned"}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openStatusModal(asset, "active")}
                          className="text-green-600 hover:text-green-900"
                          disabled={asset.status === "active"}
                          title="Mark as Active"
                        >
                          <FileCheck
                            className={`w-5 h-5 ${
                              asset.status === "active" ? "opacity-50" : ""
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => openStatusModal(asset, "maintenance")}
                          className="text-yellow-600 hover:text-yellow-900"
                          disabled={asset.status === "maintenance"}
                          title="Mark for Maintenance"
                        >
                          <AlertTriangle
                            className={`w-5 h-5 ${
                              asset.status === "maintenance" ? "opacity-50" : ""
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => openEditModal(asset)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Asset"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(asset)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Asset"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  {searchQuery ? "No matching assets found" : "No assets found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {filteredAssets.length > 0 && (
        <div className="bg-white p-4 border-t mt-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-3 sm:mb-0">
              <label className="text-sm text-gray-600">Records per page:</label>
              <select
                value={recordsPerPage}
                onChange={handleRecordsPerPageChange}
                className="border rounded-md px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-700">
                Showing {paginatedAssets.length} of {filteredAssets.length}{" "}
                assets
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`p-1 rounded-md ${
                  currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex space-x-1">
                {/* Show pagination numbers */}
                {[...Array(totalPages)].map((_, index) => {
                  // Show limited page buttons with ellipsis for better UX
                  const page = index + 1;

                  // Always show first, last, current, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }

                  // Show ellipsis (but only once on each side)
                  if (
                    (page === 2 && currentPage > 3) ||
                    (page === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return (
                      <span key={page} className="px-2 py-1 text-gray-500">
                        ...
                      </span>
                    );
                  }

                  return null;
                })}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`p-1 rounded-md ${
                  currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; // End of AssetsList component

export default AssetsList;
