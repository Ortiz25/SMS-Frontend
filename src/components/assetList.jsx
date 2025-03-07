import React, { useEffect, useState } from 'react';
import { Edit, Trash, FileCheck, AlertTriangle, X, Search, Plus } from 'lucide-react';
import axios from 'axios';

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
  const [newStatus, setNewStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newAssetData, setNewAssetData] = useState({
    asset_id: '',
    name: '',
    category_id: '',
    location: '',
    purchase_date: '',
    purchase_cost: '',
    supplier: '',
    warranty_expiry: '',
    status: 'active',
    assigned_to: '',
    department_id: '',
    room_id: '',
    notes: ''
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    category_id: '',
    location: '',
    purchase_date: '',
    purchase_cost: '',
    supplier: '',
    warranty_expiry: '',
    status: '',
    assigned_to: '',
    department_id: '',
    room_id: '',
    notes: ''
  });

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
    const filtered = assets.filter(asset => 
      asset.asset_id?.toLowerCase().includes(query) ||
      asset.name?.toLowerCase().includes(query) ||
      asset.category?.toLowerCase().includes(query) ||
      asset.location?.toLowerCase().includes(query) ||
      asset.assigned_to?.toLowerCase().includes(query)
    );
    
    setFilteredAssets(filtered);
  }, [searchQuery, assets]);

  useEffect(() => {
    // Initialize form data when selected asset changes (for edit modal)
    if (selectedAsset && modalType === 'edit') {
      setEditFormData({
        name: selectedAsset.name || '',
        category_id: selectedAsset.category_id || '',
        location: selectedAsset.location || '',
        purchase_date: selectedAsset.purchase_date ? new Date(selectedAsset.purchase_date).toISOString().split('T')[0] : '',
        purchase_cost: selectedAsset.purchase_cost || '',
        supplier: selectedAsset.supplier || '',
        warranty_expiry: selectedAsset.warranty_expiry ? new Date(selectedAsset.warranty_expiry).toISOString().split('T')[0] : '',
        status: selectedAsset.status || '',
        assigned_to: selectedAsset.assigned_to || '',
        department_id: selectedAsset.department_id || '',
        room_id: selectedAsset.room_id || '',
        notes: selectedAsset.notes || ''
      });
    }
  }, [selectedAsset, modalType]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/inventory/assets';
      const params = {};
      
      if (categoryFilter && categoryFilter !== 'all') {
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
      console.error('Error fetching assets:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inventory/asset-categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inventory/departments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inventory/rooms', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  // Modal openers
  const openNewAssetModal = () => {
    setModalType('new');
    setNewAssetData({
      asset_id: '',
      name: '',
      category_id: '',
      location: '',
      purchase_date: '',
      purchase_cost: '',
      supplier: '',
      warranty_expiry: '',
      status: 'active',
      assigned_to: '',
      department_id: '',
      room_id: '',
      notes: ''
    });
  };

  const openStatusModal = (asset, status) => {
    setSelectedAsset(asset);
    setNewStatus(status);
    setModalType('status');
  };

  const openEditModal = (asset) => {
    setSelectedAsset(asset);
    setModalType('edit');
  };

  const openDeleteModal = (asset) => {
    setSelectedAsset(asset);
    setModalType('delete');
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedAsset(null);
    setNewStatus('');
    setEditFormData({
      name: '',
      category_id: '',
      location: '',
      purchase_date: '',
      purchase_cost: '',
      supplier: '',
      warranty_expiry: '',
      status: '',
      assigned_to: '',
      department_id: '',
      room_id: '',
      notes: ''
    });
    setNewAssetData({
      asset_id: '',
      name: '',
      category_id: '',
      location: '',
      purchase_date: '',
      purchase_cost: '',
      supplier: '',
      warranty_expiry: '',
      status: 'active',
      assigned_to: '',
      department_id: '',
      room_id: '',
      notes: ''
    });
  };

  // Form handlers
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;
    
    // Convert numeric fields to numbers if needed
    if (name === 'purchase_cost') {
      parsedValue = value === '' ? '' : parseFloat(value);
    }
    
    setEditFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const handleNewAssetChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;
    
    // Convert numeric fields to numbers if needed
    if (name === 'purchase_cost') {
      parsedValue = value === '' ? '' : parseFloat(value);
    }
    
    setNewAssetData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Action handlers
  const handleCreateAsset = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await axios.post(
        'http://localhost:5000/api/inventory/assets',
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
      console.error('Error creating asset:', error);
      setActionLoading(false);
      alert('Error creating asset. Please try again.');
    }
  };

  const handleStatusChange = async () => {
    try {
      setActionLoading(true);
      await axios.patch(
        `http://localhost:5000/api/inventory/assets/${selectedAsset.id}`,
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
      console.error('Error updating asset status:', error);
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await axios.patch(
        `http://localhost:5000/api/inventory/assets/${selectedAsset.id}`,
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
      console.error('Error updating asset:', error);
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await axios.delete(
        `http://localhost:5000/api/inventory/assets/${selectedAsset.id}`,
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
      console.error('Error deleting asset:', error);
      setActionLoading(false);
    }
  };

  // Modal components
  const NewAssetModal = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black opacity-75 transition-opacity" aria-hidden="true"></div>
      <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full my-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Add New Asset</h3>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
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
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
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
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
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
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.room_number} - {room.name}</option>
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
              {actionLoading ? 'Creating...' : 'Create Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const StatusModal = () => (
    <div className="fixed inset-0  flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-75 transition-opacity" aria-hidden="true"></div>
      <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            Change Asset Status
          </h3>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-6">
          <p>Are you sure you want to change the status of <strong>{selectedAsset?.name}</strong> to <strong>{newStatus}</strong>?</p>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {newStatus === 'active' 
                ? 'This will mark the asset as active and available for use.' 
                : 'This will mark the asset as requiring maintenance and not available for regular use.'}
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
              newStatus === 'active' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );

  const EditModal = () => (
    <div className="fixed inset-0  flex items-center justify-center z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black opacity-75 transition-opacity" aria-hidden="true"></div>
      <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full my-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Edit Asset: {selectedAsset?.name}</h3>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
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
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
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
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room
              </label>
              <select
                name="room_id"
                value={editFormData.room_id}
                onChange={handleEditFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select room</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.room_number} - {room.name}</option>
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
                value={editFormData.purchase_date}
                onChange={handleEditFormChange}
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
                value={editFormData.purchase_cost}
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
                Warranty Expiry
              </label>
              <input
                type="date"
                name="warranty_expiry"
                value={editFormData.warranty_expiry}
                onChange={handleEditFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={editFormData.status}
                onChange={handleEditFormChange}
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
                value={editFormData.assigned_to}
                onChange={handleEditFormChange}
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
              value={editFormData.notes}
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
              {actionLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const DeleteModal = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-75 transition-opacity" aria-hidden="true" ></div>
      <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-red-600">Delete Asset</h3>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-6">
          <p>Are you sure you want to delete <strong>{selectedAsset?.name}</strong>?</p>
          <p className="text-sm text-red-600 mt-2">
            This action cannot be undone. All data associated with this asset will be permanently removed.
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
            {actionLoading ? 'Deleting...' : 'Delete Asset'}
          </button>
        </div>
      </div>
    </div>
  );
  
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading assets...</div>;
  }
  
  return (
    <div>
      {modalType === 'new' && <NewAssetModal />}
      {modalType === 'status' && <StatusModal />}
      {modalType === 'edit' && <EditModal />}
      {modalType === 'delete' && <DeleteModal />}
      
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
        <button 
          onClick={openNewAssetModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Asset
        </button>
      </div>
      
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Asset ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Purchase Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assigned To
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredAssets.length > 0 ? (
            filteredAssets.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.asset_id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${asset.status === 'active' ? 'bg-green-100 text-green-800' : 
                      asset.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {asset.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {asset.assigned_to || 'Not assigned'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => openStatusModal(asset, 'active')} 
                      className="text-green-600 hover:text-green-900"
                      disabled={asset.status === 'active'}
                      title="Mark as Active"
                    >
                      <FileCheck className={`w-5 h-5 ${asset.status === 'active' ? 'opacity-50' : ''}`} />
                    </button>
                    <button 
                      onClick={() => openStatusModal(asset, 'maintenance')} 
                      className="text-yellow-600 hover:text-yellow-900"
                      disabled={asset.status === 'maintenance'}
                      title="Mark for Maintenance"
                    >
                      <AlertTriangle className={`w-5 h-5 ${asset.status === 'maintenance' ? 'opacity-50' : ''}`} />
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
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                {searchQuery ? 'No matching assets found' : 'No assets found'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
  }; // End of AssetsList component
  
  export default AssetsList;