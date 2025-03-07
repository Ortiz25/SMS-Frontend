import React, { useState, useEffect } from "react";
import { Home, Building, Users, Plus, Search, Edit, Trash, Eye, Filter } from "lucide-react";
import ViewModal from "../components/modals/viewHostelModal";
import EditModal from "../components/modals/editHostelModal";
import AddModal from "../components/modals/addModal";

const HostelSection = () => {
  const token = localStorage.getItem("token");
  const [dormitories, setDormitories] = useState([]);
  const [activeView, setActiveView] = useState("dormitories"); // dormitories, allocations, students
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [boarders, setBoarders] = useState([]);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  useEffect(() => {
    const fetchDormitories = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/api/hostel-transport/dormitories', {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setDormitories(data.dormitories);
          setFilteredData(data.dormitories);
        }
      } catch (error) {
        console.error("Failed to fetch dormitories:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAllocations = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/api/hostel-transport/allocations', {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setAllocations(data.allocations);
          setFilteredData(data.allocations);
        }
      } catch (error) {
        console.error("Failed to fetch allocations:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchBoarders = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/api/hostel-transport/boarders', {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setBoarders(data.boarders);
          setFilteredData(data.boarders);
        }
      } catch (error) {
        console.error("Failed to fetch boarders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (activeView === "dormitories") {
      fetchDormitories();
    } else if (activeView === "allocations") {
      fetchAllocations();
    } else if (activeView === "students") {
      fetchBoarders();
    }
  }, [activeView, token]);

  useEffect(() => {
    // Filter based on search term
    if (activeView === "dormitories") {
      const filtered = dormitories.filter(dorm => 
        dorm.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else if (activeView === "students") {
      const filtered = boarders.filter(student => 
        student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admission_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else if (activeView === "allocations") {
      const filtered = allocations.filter(allocation => 
        allocation.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        allocation.dormitory_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        allocation.room_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, dormitories, allocations, boarders, activeView]);

  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleAddItem = (newItem) => {
    // Add the new item to the appropriate state based on active view
    if (activeView === "dormitories") {
      setDormitories(prev => [...prev, newItem]);
    } else if (activeView === "allocations") {
      setAllocations(prev => [...prev, newItem]);
    }
    // Note: We don't typically add new students from the hostel section,
    // so no handling for "students" view here
  };

  const handleUpdate = (updatedItem) => {
    // Update the corresponding data state based on active view
    if (activeView === "dormitories") {
      setDormitories(prev => 
        prev.map(item => item.id === updatedItem.id ? updatedItem : item)
      );
    } else if (activeView === "allocations") {
      setAllocations(prev => 
        prev.map(item => item.id === updatedItem.id ? updatedItem : item)
      );
    } else if (activeView === "students") {
      setBoarders(prev => 
        prev.map(item => item.id === updatedItem.id ? updatedItem : item)
      );
    }
  };

  const renderDormitories = () => {
    if (loading) {
      return <div className="flex justify-center items-center py-8">Loading dormitories...</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupied</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Per Term</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((dormitory) => (
              <tr key={dormitory.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Building className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{dormitory.name}</div>
                      <div className="text-sm text-gray-500">{dormitory.caretaker_name || 'No caretaker assigned'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{dormitory.gender === 'boys' ? 'Boys' : dormitory.gender === 'girls' ? 'Girls' : 'Mixed'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{dormitory.capacity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{dormitory.occupied}</div>
                  <div className="text-xs text-gray-500">{Math.round((dormitory.occupied / dormitory.capacity) * 100)}% occupied</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  KES {dormitory?.fee_per_term?.toLocaleString() || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${dormitory.status === 'active' ? 'bg-green-100 text-green-800' : 
                      dormitory.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {dormitory.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => handleView(dormitory)}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => handleEdit(dormitory)}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderAllocations = () => {
    if (loading) {
      return <div className="flex justify-center items-center py-8">Loading allocations...</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dormitory</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room & Bed</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((allocation) => (
              <tr key={allocation.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{allocation.student_name}</div>
                      <div className="text-sm text-gray-500">{allocation.admission_number}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{allocation.dormitory_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Room {allocation.room_number}</div>
                  <div className="text-sm text-gray-500">Bed {allocation.bed_number}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(allocation.allocation_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${allocation.status === 'active' ? 'bg-green-100 text-green-800' : 
                      allocation.status === 'transferred' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {allocation.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => handleView(allocation)}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => handleEdit(allocation)}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderBoarders = () => {
    if (loading) {
      return <div className="flex justify-center items-center py-8">Loading boarders...</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission Number</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Dormitory</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {student.photo_url ? (
                        <img className="h-10 w-10 rounded-full" src={student.photo_url} alt={`${student.first_name} ${student.last_name}`} />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {student.first_name} {student.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{student.other_names || ''}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.admission_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.current_class} {student.stream}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.gender === 'male' ? 'Male' : student.gender === 'female' ? 'Female' : 'Other'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.dormitory ? student.dormitory : 'Not Allocated'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${student.allocation_status === 'active' ? 'bg-green-100 text-green-800' : 
                      student.allocation_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {student.allocation_status || 'Not Allocated'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => handleView(student)}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => handleEdit(student)}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Get the appropriate add type based on active view
  const getAddType = () => {
    if (activeView === "dormitories") {
      return "dormitories";
    } else if (activeView === "allocations") {
      return "hostel-allocations";
    } else {
      return null; // No adding for students view
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveView("dormitories")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeView === "dormitories" 
                ? "bg-blue-100 text-blue-700" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Dormitories
          </button>
          <button 
            onClick={() => setActiveView("allocations")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeView === "allocations" 
                ? "bg-blue-100 text-blue-700" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Allocations
          </button>
          <button 
            onClick={() => setActiveView("students")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeView === "students" 
                ? "bg-blue-100 text-blue-700" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Boarders
          </button>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={handleAdd}
            disabled={activeView === "students"} // Disable for students view
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </button>
        </div>
      </div>

      {/* Content based on active view */}
      {activeView === "dormitories" && renderDormitories()}
      {activeView === "allocations" && renderAllocations()}
      {activeView === "students" && renderBoarders()}

      {/* View Modal */}
      {showViewModal && (
        <ViewModal 
          item={selectedItem} 
          viewType={activeView} 
          onClose={() => setShowViewModal(false)} 
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditModal 
          item={selectedItem} 
          editType={activeView} 
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdate}
          token={token}
        />
      )}

      {/* Add Modal - only show if we have a valid add type */}
      {showAddModal && getAddType() && (
        <AddModal 
          addType={getAddType()} 
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddItem}
          token={token}
        />
      )}
    </div>
  );
};

export default HostelSection;