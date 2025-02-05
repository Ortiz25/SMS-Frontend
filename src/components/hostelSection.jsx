import React, { useState } from 'react';
import { Search, Plus, Pencil, Users, Home } from 'lucide-react';
import HostelFormModal from './modals/hostelRoom';

const HostelSection = () => {
   // State for hostel data
   const [rooms, setRooms] = useState([
    {
      id: 1,
      roomNumber: '101',
      block: 'A',
      floor: '1',
      capacity: 4,
      occupants: [
        { id: 1, name: 'John Doe', class: '10A', admissionNo: 'ST001' },
        { id: 2, name: 'Jane Smith', class: '10A', admissionNo: 'ST002' }
      ],
      type: 'Standard',
      facilities: ['Fan', 'Cupboard', 'Study Table']
    }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [blockFilter, setBlockFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const handleSaveRoom = (formData) => {
    if (editingRoom) {
      setRooms(rooms.map(room => 
        room.id === editingRoom.id ? { ...formData, id: room.id } : room
      ));
    } else {
      const newRoom = {
        ...formData,
        id: Math.max(...rooms.map(r => r.id), 0) + 1
      };
      setRooms([...rooms, newRoom]);
    }
    setShowModal(false);
    setEditingRoom(null);
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.occupants.some(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesSearch && (blockFilter === 'all' || room.block === blockFilter);
  });

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rooms</p>
              <p className="text-2xl font-semibold text-gray-900">{rooms.length}</p>
            </div>
            <Home className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600">Occupants</p>
              <p className="text-2xl font-semibold text-green-600">
                {rooms.reduce((sum, room) => sum + room.occupants.length, 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600">Vacant Beds</p>
              <p className="text-2xl font-semibold text-yellow-600">
                {rooms.reduce((sum, room) => sum + (room.capacity - room.occupants.length), 0)}
              </p>
            </div>
            <Home className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 justify-between">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms or students..."
              className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="rounded-md border border-gray-300 py-2 px-3"
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
          >
            <option value="all">All Blocks</option>
            <option value="A">Block A</option>
            <option value="B">Block B</option>
            <option value="C">Block C</option>
          </select>
        </div>
        <button
          onClick={() => {
            setEditingRoom(null);
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Room
        </button>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map(room => (
          <div key={room.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Room {room.roomNumber}</h3>
                <p className="text-sm text-gray-500">Block {room.block}, Floor {room.floor}</p>
              </div>
              <button
                onClick={() => {
                  setEditingRoom(room);
                  setShowModal(true);
                }}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Occupancy</span>
                <span className="font-medium">{room.occupants.length}/{room.capacity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Type</span>
                <span className="font-medium">{room.type}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {room.facilities.map((facility, index) => (
                  <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {facility}
                  </span>
                ))}
              </div>
            </div>

            {room.occupants.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Occupants</h4>
                <div className="space-y-2">
                  {room.occupants.map((student, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {student.name} - {student.class}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <HostelFormModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingRoom(null);
        }}
        onSave={handleSaveRoom}
        room={editingRoom}
      />
    </div>
  );
};

export default HostelSection;