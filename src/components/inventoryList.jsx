import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Edit,
  Trash,
  Plus,
  Minus,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { checkTokenAuth } from "../util/helperFunctions";

const InventoryList = ({ categoryFilter }) => {
  const token = localStorage.getItem("token");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null); // 'stock', 'edit', 'delete', 'new'
  const [stockAction, setStockAction] = useState("");
  const [stockAmount, setStockAmount] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [paginatedItems, setPaginatedItems] = useState([]);

  const [newItemData, setNewItemData] = useState({
    item_code: "",
    name: "",
    category_id: "",
    description: "",
    unit: "",
    current_quantity: 0,
    min_quantity: 0,
    unit_cost: 0,
    supplier: "",
    storage_location: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    category_id: "",
    description: "",
    unit: "",
    current_quantity: 0,
    min_quantity: 0,
    unit_cost: 0,
    supplier: "",
    storage_location: "",
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
    fetchInventoryItems();
    fetchCategories();
  }, [categoryFilter]);

  // Effect for dynamic filtering as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(inventoryItems);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = inventoryItems.filter(
      (item) =>
        item.item_code?.toLowerCase().includes(query) ||
        item.name?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.supplier?.toLowerCase().includes(query) ||
        item.storage_location?.toLowerCase().includes(query)
    );

    setFilteredItems(filtered);
    // Reset to first page when filtering
    setCurrentPage(1);
  }, [searchQuery, inventoryItems]);

  // Pagination calculation
  useEffect(() => {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    setPaginatedItems(
      filteredItems.slice(indexOfFirstRecord, indexOfLastRecord)
    );

    // Reset to first page if current page is now invalid
    if (
      currentPage > Math.ceil(filteredItems.length / recordsPerPage) &&
      filteredItems.length > 0
    ) {
      setCurrentPage(1);
    }
  }, [filteredItems, currentPage, recordsPerPage]);

  useEffect(() => {
    // Initialize form data when selected item changes (for edit modal)
    if (selectedItem && modalType === "edit") {
      setEditFormData({
        name: selectedItem.name || "",
        category_id: selectedItem.category_id || "",
        description: selectedItem.description || "",
        unit: selectedItem.unit || "",
        current_quantity: selectedItem.current_quantity || 0,
        min_quantity: selectedItem.min_quantity || 0,
        unit_cost: selectedItem.unit_cost || 0,
        supplier: selectedItem.supplier || "",
        storage_location: selectedItem.storage_location || "",
      });
    }
  }, [selectedItem, modalType]);

  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      let url = "/backend/api/inventory/inventory";
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
      setInventoryItems(response.data);
      setFilteredItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "/backend/api/inventory/inventory-categories",
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

  // Pagination controls
  const totalPages = Math.ceil(filteredItems.length / recordsPerPage);

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
  const openNewItemModal = () => {
    setModalType("new");
    setNewItemData({
      item_code: "",
      name: "",
      category_id: "",
      description: "",
      unit: "",
      current_quantity: 0,
      min_quantity: 0,
      unit_cost: 0,
      supplier: "",
      storage_location: "",
    });
  };

  const openStockModal = (item, action) => {
    setSelectedItem(item);
    setStockAction(action);
    setStockAmount(1);
    setModalType("stock");
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setModalType("edit");
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setModalType("delete");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedItem(null);
    setStockAction("");
    setStockAmount(1);
    setEditFormData({
      name: "",
      category_id: "",
      description: "",
      unit: "",
      current_quantity: 0,
      min_quantity: 0,
      unit_cost: 0,
      supplier: "",
      storage_location: "",
    });
    setNewItemData({
      item_code: "",
      name: "",
      category_id: "",
      description: "",
      unit: "",
      current_quantity: 0,
      min_quantity: 0,
      unit_cost: 0,
      supplier: "",
      storage_location: "",
    });
  };

  // Form handlers
  const handleEditFormChange = useCallback((e) => {
    const { name, value } = e.target;
    let parsedValue = value;

    // Convert numeric fields to numbers
    if (["current_quantity", "min_quantity", "unit_cost"].includes(name)) {
      parsedValue = value === "" ? 0 : parseFloat(value);
    }

    setEditFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  }, []);

  const handleNewItemChange = useCallback((e) => {
    const { name, value } = e.target;
    let parsedValue = value;

    // Convert numeric fields to numbers
    if (["current_quantity", "min_quantity", "unit_cost"].includes(name)) {
      parsedValue = value === "" ? 0 : parseFloat(value);
    }

    setNewItemData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  }, []);

  const handleStockAmountChange = useCallback((e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setStockAmount(value);
    }
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Action handlers
  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await axios.post(
        "/backend/api/inventory/inventory",
        newItemData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchInventoryItems();
      setActionLoading(false);
      closeModal();
    } catch (error) {
      console.error("Error creating inventory item:", error);
      setActionLoading(false);
      alert("Error creating inventory item. Please try again.");
    }
  };

  const handleStockChange = async () => {
    try {
      setActionLoading(true);
      const currentQuantity = selectedItem.current_quantity;
      const newQuantity =
        stockAction === "increase"
          ? currentQuantity + stockAmount
          : Math.max(0, currentQuantity - stockAmount);

      // Create a transaction record
      await axios.post(
        `/backend/api/inventory/inventory/${selectedItem.id}/transactions`,
        {
          transaction_type: stockAction === "increase" ? "in" : "out",
          quantity: stockAmount,
          notes: `Manual ${
            stockAction === "increase" ? "stock in" : "stock out"
          } adjustment`,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchInventoryItems();
      setActionLoading(false);
      closeModal();
    } catch (error) {
      console.error("Error updating inventory quantity:", error);
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await axios.patch(
        `/backend/api/inventory/inventory/${selectedItem.id}`,
        editFormData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchInventoryItems();
      setActionLoading(false);
      closeModal();
    } catch (error) {
      console.error("Error updating inventory item:", error);
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await axios.delete(
        `/backend/api/inventory/inventory/${selectedItem.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchInventoryItems();
      setActionLoading(false);
      closeModal();
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      setActionLoading(false);
    }
  };

  const NewItemModal = useMemo(() => {
    if (modalType !== "new") return null;
    return (
      <div className="fixed inset-0  flex items-center justify-center z-50 overflow-y-auto">
        <div
          className="fixed inset-0 bg-black opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>
        <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full my-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Add New Inventory Item</h3>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleCreateItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Code*
                </label>
                <input
                  type="text"
                  name="item_code"
                  value={newItemData.item_code}
                  onChange={handleNewItemChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={newItemData.name}
                  onChange={handleNewItemChange}
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
                  value={newItemData.category_id}
                  onChange={handleNewItemChange}
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
                  Unit*
                </label>
                <input
                  type="text"
                  name="unit"
                  value={newItemData.unit}
                  onChange={handleNewItemChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="e.g., pieces, boxes, liters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Quantity
                </label>
                <input
                  type="number"
                  name="current_quantity"
                  value={newItemData.current_quantity}
                  onChange={handleNewItemChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Quantity
                </label>
                <input
                  type="number"
                  name="min_quantity"
                  value={newItemData.min_quantity}
                  onChange={handleNewItemChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Cost
                </label>
                <input
                  type="number"
                  name="unit_cost"
                  value={newItemData.unit_cost}
                  onChange={handleNewItemChange}
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
                  value={newItemData.supplier}
                  onChange={handleNewItemChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Storage Location
                </label>
                <input
                  type="text"
                  name="storage_location"
                  value={newItemData.storage_location}
                  onChange={handleNewItemChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={newItemData.description}
                onChange={handleNewItemChange}
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
                {actionLoading ? "Creating..." : "Create Item"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }, [modalType, newItemData, categories, actionLoading]);

  const StockModal = useMemo(() => {
    if (modalType !== "stock") return null;
    return (
      <div className="fixed inset-0  flex items-center justify-center z-50">
        <div
          className="fixed inset-0 bg-black opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>
        <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {stockAction === "increase" ? "Add Stock" : "Remove Stock"}
            </h3>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-6">
            <p>
              {stockAction === "increase"
                ? `Add stock to ${selectedItem?.name}`
                : `Remove stock from ${selectedItem?.name}`}
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Quantity:{" "}
                  <span className="font-bold">
                    {selectedItem?.current_quantity} {selectedItem?.unit}
                  </span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {stockAction === "increase"
                    ? "Quantity to Add"
                    : "Quantity to Remove"}
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={stockAmount}
                    onChange={handleStockAmountChange}
                    min="1"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mr-2"
                  />
                  <span className="text-gray-500">{selectedItem?.unit}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Quantity:{" "}
                  <span className="font-bold">
                    {stockAction === "increase"
                      ? selectedItem?.current_quantity + stockAmount
                      : Math.max(
                          0,
                          selectedItem?.current_quantity - stockAmount
                        )}{" "}
                    {selectedItem?.unit}
                  </span>
                </label>
              </div>
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
              onClick={handleStockChange}
              className={`px-4 py-2 rounded-md text-white ${
                stockAction === "increase"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
              disabled={actionLoading}
            >
              {actionLoading
                ? "Processing..."
                : stockAction === "increase"
                ? "Add Stock"
                : "Remove Stock"}
            </button>
          </div>
        </div>
      </div>
    );
  }, [modalType, selectedItem, stockAction, stockAmount, actionLoading]);

  const EditModal = useMemo(() => {
    if (modalType !== "edit") return null;
    return (
      <div className="fixed inset-0  flex items-center justify-center z-50 overflow-y-auto">
        <div
          className="fixed inset-0 bg-black opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>
        <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full my-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Edit Inventory Item: {selectedItem?.name}
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
                  Item Name
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
                  Unit
                </label>
                <input
                  type="text"
                  name="unit"
                  value={editFormData.unit}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="e.g., pieces, boxes, liters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Quantity
                </label>
                <input
                  type="number"
                  name="current_quantity"
                  value={editFormData.current_quantity}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Quantity
                </label>
                <input
                  type="number"
                  name="min_quantity"
                  value={editFormData.min_quantity}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Cost
                </label>
                <input
                  type="number"
                  name="unit_cost"
                  value={editFormData.unit_cost}
                  onChange={handleEditFormChange}
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
                  value={editFormData.supplier}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Storage Location
                </label>
                <input
                  type="text"
                  name="storage_location"
                  value={editFormData.storage_location}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={editFormData.description}
                onChange={handleEditFormChange}
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
                {actionLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }, [modalType, selectedItem, editFormData, categories, actionLoading]);

  const DeleteModal = useMemo(() => {
    if (modalType !== "delete") return null;
    return (
      <div className="fixed inset-0  flex items-center justify-center z-50">
        <div
          className="fixed inset-0 bg-black opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>
        <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-red-600">
              Delete Inventory Item
            </h3>
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
              <strong>{selectedItem?.name}</strong>?
            </p>
            <p className="text-sm text-red-600 mt-2">
              This action cannot be undone. All data associated with this
              inventory item will be permanently removed.
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
              {actionLoading ? "Deleting..." : "Delete Item"}
            </button>
          </div>
        </div>
      </div>
    );
  }, [modalType, selectedItem, actionLoading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading inventory items...
      </div>
    );
  }

  return (
    <div>
      {NewItemModal}
      {StockModal}
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
            placeholder="Search inventory..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        {isAdmin && (
          <button
            onClick={openNewItemModal}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Item
          </button>
        )}
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Item Code
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
                Current Quantity
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Minimum Quantity
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Unit
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Last Restocked
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
            {paginatedItems.length > 0 ? (
              paginatedItems.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-50 ${
                    item.current_quantity <= item.min_quantity
                      ? "bg-red-50"
                      : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.item_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm ${
                        item.current_quantity <= item.min_quantity
                          ? "text-red-600 font-bold"
                          : "text-gray-900"
                      }`}
                    >
                      {item.current_quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.min_quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.last_restocked
                      ? new Date(item.last_restocked).toLocaleDateString()
                      : "Never"}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openStockModal(item, "increase")}
                          className="text-green-600 hover:text-green-900"
                          title="Add Stock"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openStockModal(item, "decrease")}
                          className="text-red-600 hover:text-red-900"
                          disabled={item.current_quantity <= 0}
                          title="Remove Stock"
                        >
                          <Minus
                            className={`w-5 h-5 ${
                              item.current_quantity <= 0 ? "opacity-50" : ""
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Item"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(item)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Item"
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
                  {searchQuery
                    ? "No matching inventory items found"
                    : "No inventory items found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredItems.length > 0 && (
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
                Showing {paginatedItems.length} of {filteredItems.length} items
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
};

export default InventoryList;
