import React, { useState, useEffect } from "react";
import { Bus, Users, MapPin, Plus, Search, Edit, Trash, Eye, Filter, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import ViewModal from "../components/modals/viewHostelModal";
import EditModal from "../components/modals/editHostelModal";
import AddModal from "../components/modals/addModal";

const TransportSection = () => {
  const token = localStorage.getItem("token");
  const [routes, setRoutes] = useState([]);
  const [activeView, setActiveView] = useState("routes"); // routes, stops, allocations
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [stops, setStops] = useState([]);
  const [allocations, setAllocations] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [paginatedData, setPaginatedData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5010/api/hostel-transport/routes', {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setRoutes(data.routes);
          setFilteredData(data.routes);
        }
      } catch (error) {
        console.error("Failed to fetch routes:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchStops = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5010/api/hostel-transport/stops', {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setStops(data.stops);
          setFilteredData(data.stops);
        }
      } catch (error) {
        console.error("Failed to fetch stops:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAllocations = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5010/api/hostel-transport/transport-allocations', {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        });
        const data = await response.json();
        console.log(data)
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

    if (activeView === "routes") {
      fetchRoutes();
    } else if (activeView === "stops") {
      fetchStops();
    } else if (activeView === "allocations") {
      fetchAllocations();
    }
    
    // Reset to first page when switching views
    setCurrentPage(1);
  }, [activeView, token]);

  useEffect(() => {
    // Filter based on search term
    if (activeView === "routes") {
      const filtered = routes.filter(route => 
        route.route_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else if (activeView === "stops") {
      const filtered = stops.filter(stop => 
        stop.stop_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        stop.route_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else if (activeView === "allocations") {
      const filtered = allocations.filter(allocation => 
        allocation.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        allocation.route_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        allocation.stop_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    }
    
    // Reset to first page when filtering changes
    setCurrentPage(1);
  }, [searchTerm, routes, stops, allocations, activeView]);
  
  // Calculate pagination whenever filtered data changes
  useEffect(() => {
    const totalPagesCount = Math.ceil(filteredData.length / recordsPerPage);
    setTotalPages(totalPagesCount);
    
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    setPaginatedData(filteredData.slice(indexOfFirstRecord, indexOfLastRecord));
    
    // Reset to first page if current page is now invalid
    if (currentPage > totalPagesCount && totalPagesCount > 0) {
      setCurrentPage(1);
    }
  }, [filteredData, currentPage, recordsPerPage]);

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  // Modal handlers
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
    if (activeView === "routes") {
      setRoutes(prev => [...prev, newItem]);
    } else if (activeView === "stops") {
      setStops(prev => [...prev, newItem]);
    } else if (activeView === "allocations") {
      setAllocations(prev => [...prev, newItem]);
    }
  };

  const handleUpdate = (updatedItem) => {
    // Update the corresponding data state based on active view
    if (activeView === "routes") {
      setRoutes(prev => 
        prev.map(item => item.id === updatedItem.id ? updatedItem : item)
      );
    } else if (activeView === "stops") {
      setStops(prev => 
        prev.map(item => item.id === updatedItem.id ? updatedItem : item)
      );
    } else if (activeView === "allocations") {
      setAllocations(prev => 
        prev.map(item => item.id === updatedItem.id ? updatedItem : item)
      );
    }
  };// Pagination component
  const PaginationControls = () => {
    return (
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              currentPage === 1 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              currentPage === totalPages 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center space-x-2">
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
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{paginatedData.length}</span> of{' '}
                <span className="font-medium">{filteredData.length}</span> results
              </p>
            </div>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 ${
                  currentPage === 1 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {/* Page numbers */}
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                
                // Always show first, last, current page and pages around current
                if (
                  pageNumber === 1 || 
                  pageNumber === totalPages || 
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        currentPage === pageNumber
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                
                // Show ellipsis when needed (but only once per gap)
                if ((pageNumber === 2 && currentPage > 3) || (pageNumber === totalPages - 1 && currentPage < totalPages - 2)) {
                  return (
                    <span
                      key={pageNumber}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700"
                    >
                      ...
                    </span>
                  );
                }
                
                return null;
              })}
              
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 ${
                  currentPage === totalPages 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };
  const renderRoutes = () => {
    if (loading) {
      return <div className="flex justify-center items-center py-8">Loading routes...</div>;
    }

    return (
      <div className="overflow-hidden shadow  sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departure Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Per Term</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stops</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((route) => (
                <tr key={route.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Bus className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{route.route_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{route.departure_time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{route.return_time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    KES {route.fee_per_term?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {route.stops_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${route.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {route.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleView(route)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => handleEdit(route)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No routes found. Please adjust your search or add new routes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredData.length > 0 && <PaginationControls />}
      </div>
    );
  };

  const renderStops = () => {
    if (loading) {
      return <div className="flex justify-center items-center py-8">Loading stops...</div>;
    }

    return (
      <div className="overflow-hidden shadow  sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stop Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Morning Pickup</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evening Dropoff</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((stop) => (
                <tr key={stop.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-amber-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{stop.stop_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{stop.route_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stop.stop_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stop.morning_pickup_time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stop.evening_dropoff_time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleView(stop)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => handleEdit(stop)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No stops found. Please adjust your search or add new stops.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredData.length > 0 && <PaginationControls />}
      </div>
    );
  };
  const renderAllocations = () => {
    if (loading) {
      return <div className="flex justify-center items-center py-8">Loading allocations...</div>;
    }

    return (
      <div className="overflow-hidden shadow  sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Stop</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((allocation) => (
                <tr key={allocation.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {allocation.photo_url ? (
                          <img className="h-10 w-10 rounded-full" src={allocation.photo_url} alt={allocation.student_name} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{allocation.student_name}</div>
                        <div className="text-sm text-gray-500">{allocation.admission_number}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{allocation.route_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{allocation.stop_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(allocation.allocation_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${allocation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No allocations found. Please adjust your search or add new allocations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredData.length > 0 && <PaginationControls />}
      </div>
    );
  };

  // Get the appropriate add type based on active view
  const getAddType = () => {
    if (activeView === "routes") {
      return "routes";
    } else if (activeView === "stops") {
      return "stops";
    } else if (activeView === "allocations") {
      return "transport-allocations";
    } else {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between mb-4">
        <div className="flex space-x-2 mb-2 sm:mb-0">
          <button 
            onClick={() => setActiveView("routes")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeView === "routes" 
                ? "bg-blue-100 text-blue-700" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Routes
          </button>
          <button 
            onClick={() => setActiveView("stops")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeView === "stops" 
                ? "bg-blue-100 text-blue-700" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Stops
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
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </button>
        </div>
      </div>

      {/* Content based on active view */}
      {activeView === "routes" && renderRoutes()}
      {activeView === "stops" && renderStops()}
      {activeView === "allocations" && renderAllocations()}

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

      {/* Add Modal */}
      {showAddModal && (
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

export default TransportSection;

