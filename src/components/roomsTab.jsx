import React, { useState, useEffect } from "react";
import axios from "axios";
import { Edit } from "lucide-react";
import { toast } from "react-toastify";

// Pagination component to add after the table

function RoomsTab({ isAdmin }) {
  const [rooms, setRooms] = useState([]);
  const [dormitories, setDormitories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRooms, setFilteredRooms] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    dormitory_id: "",
    room_number: "",
    capacity: "",
  });

  useEffect(() => {
    if (rooms.length > 0) {
      const results = rooms.filter(
        (room) =>
          room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.dormitory_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRooms(results);
      setCurrentPage(1); // Reset to first page on search
    }
  }, [searchTerm, rooms]);

  // Fetch rooms and dormitories when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [roomsRes, dormitoriesRes] = await Promise.all([
          axios.get("/backend/api/hostel-transport/rooms", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get("/backend/api/hostel-transport/dormitories", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);

        if (roomsRes.data.success) {
          setRooms(roomsRes.data.rooms);
        }

        if (dormitoriesRes.data.success) {
          setDormitories(dormitoriesRes.data.dormitories);
        }
      } catch (error) {
        console.error("Error fetching rooms data:", error);
        toast.error("Failed to load rooms data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({
      dormitory_id: "",
      room_number: "",
      capacity: "",
    });
    setIsAdding(false);
    setIsEditing(false);
    setSelectedRoom(null);
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "/backend/api/hostel-transport/rooms",
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        // Add the new room to the rooms array
        setRooms([...rooms, response.data.room]);
        toast.success("Room added successfully");
        resetForm();
      }
    } catch (error) {
      console.error("Error adding room:", error);
      toast.error(error.response?.data?.message || "Failed to add room");
    }
  };

  const handleEditRoom = async (e) => {
    e.preventDefault();

    if (!selectedRoom) return;

    try {
      const response = await axios.put(
        `/backend/api/hostel-transport/rooms/${selectedRoom.id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        // Update the room in the rooms array
        const updatedRooms = rooms.map((room) =>
          room.id === selectedRoom.id ? response.data.room : room
        );
        setRooms(updatedRooms);
        toast.success("Room updated successfully");
        resetForm();
      }
    } catch (error) {
      console.error("Error updating room:", error);
      toast.error(error.response?.data?.message || "Failed to update room");
    }
  };

  const handleSelectRoomForEdit = (room) => {
    setSelectedRoom(room);
    setFormData({
      dormitory_id: room.dormitory_id,
      room_number: room.room_number,
      capacity: room.capacity,
    });
    setIsEditing(true);
    setIsAdding(false);
  };

  const Pagination = () => {
    const pageNumbers = [];

    // Generate page numbers based on total pages
    // Show limited page numbers with ellipsis for better UX
    const maxDisplayedPages = 5;

    if (totalPages <= maxDisplayedPages) {
      // If we have fewer pages than our max, show all
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate start and end of middle section
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust to always show 3 middle pages when possible
      if (currentPage <= 2) {
        endPage = 3;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 2;
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push("...");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      // Always show last page
      pageNumbers.push(totalPages);
    }

    if (totalPages <= 1) {
      return null; // Don't show pagination if only one page
    }

    return (
      <nav
        className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4"
        aria-label="Pagination"
      >
        <div className="hidden sm:block">
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div className="flex-1 flex justify-between sm:justify-end">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"
            } mr-3`}
          >
            Previous
          </button>

          <div className="hidden md:flex">
            {pageNumbers.map((number, index) => (
              <button
                key={index}
                onClick={() =>
                  typeof number === "number" ? paginate(number) : null
                }
                className={`relative inline-flex items-center px-4 py-2 border ${
                  number === currentPage
                    ? "bg-indigo-50 border-indigo-500 text-indigo-600 z-10"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                } text-sm font-medium ${
                  typeof number !== "number" ? "cursor-default" : ""
                }`}
                disabled={typeof number !== "number"}
              >
                {number}
              </button>
            ))}
          </div>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"
            } ml-3`}
          >
            Next
          </button>
        </div>
      </nav>
    );
  };

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  // Function to change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Function to handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const TableControls = () => (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-3 sm:space-y-0">
      <div className="w-full sm:w-64">
        <label htmlFor="search" className="sr-only">
          Search
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            id="search"
            name="search"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search rooms or dormitories"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
            // Added this to maintain focus when typing
            autoFocus={searchTerm !== ""}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="flex items-center border border-gray-300 rounded-md p-1">
          <label
            htmlFor="itemsPerPage"
            className="text-sm text-gray-600 mr-2 whitespace-nowrap"
          >
            Show
          </label>
          <select
            id="itemsPerPage"
            className="block pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="text-sm text-gray-500 whitespace-nowrap">
          <span className="hidden sm:inline">Showing </span>
          <span className="font-medium">
            {filteredRooms.length > 0 ? indexOfFirstItem + 1 : 0}-
            {indexOfLastItem > filteredRooms.length
              ? filteredRooms.length
              : indexOfLastItem}
          </span>
          <span className="hidden sm:inline"> of </span>
          <span className="sm:hidden inline">/</span>
          <span className="font-medium">{filteredRooms.length}</span>
        </div>
      </div>
    </div>
  );
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Rooms Management</h2>

        {isAdmin && (
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add New Room
          </button>
        )}
      </div>
      {/* Add/Edit Room Form */}
      {(isAdding || isEditing) && (
        <div className="bg-white shadow-md rounded p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {isAdding ? "Add New Room" : "Edit Room"}
          </h3>
          <form onSubmit={isAdding ? handleAddRoom : handleEditRoom}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Dormitory
              </label>
              <select
                name="dormitory_id"
                value={formData.dormitory_id}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Select Dormitory</option>
                {dormitories.map((dorm) => (
                  <option key={dorm.id} value={dorm.id}>
                    {dorm.name} ({dorm.gender})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Room Number
              </label>
              <input
                type="text"
                name="room_number"
                value={formData.room_number}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Capacity
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
                min="1"
              />
            </div>
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {isAdding ? "Add Room" : "Update Room"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rooms Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-pulse text-gray-600">
            Loading rooms data...
          </div>
        </div>
      ) : (
        <>
          <TableControls />

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Room Number
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Dormitory
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Gender
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Capacity
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Occupied
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
                  {currentItems.length > 0 ? (
                    currentItems.map((room, index) => (
                      <tr
                        key={room.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {room.room_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {room.dormitory_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {room.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {room.capacity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              room.occupied >= room.capacity
                                ? "bg-red-100 text-red-800"
                                : room.occupied >= room.capacity * 0.8
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {room.occupied} / {room.capacity}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => handleSelectRoomForEdit(room)}
                              className="text-indigo-600 hover:text-indigo-900 transition duration-150 ease-in-out"
                            >
                              <Edit />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-8 text-center text-sm text-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <svg
                            className="w-12 h-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                          <span>
                            {searchTerm
                              ? `No rooms found matching "${searchTerm}"`
                              : "No rooms found"}
                          </span>
                          {!searchTerm && (
                            <button
                              onClick={() => {
                                resetForm();
                                setIsAdding(true);
                              }}
                              className="mt-1 text-sm text-indigo-600 hover:text-indigo-900"
                            >
                              Add your first room
                            </button>
                          )}
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm("")}
                              className="mt-1 text-sm text-indigo-600 hover:text-indigo-900"
                            >
                              Clear search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination />
        </>
      )}
    </div>
  );
}

export default RoomsTab;
