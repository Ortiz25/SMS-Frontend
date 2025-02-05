import React, { useState } from "react";
import { Search, Plus, MapPin, Users, Bus, DollarSign, Navigation } from "lucide-react";
import RouteFormModal from "./modals/routeForm";
import BusTrackingModal from "./modals/busTracking";

const TransportSection = () => {
  const [routes, setRoutes] = useState([
    {
      id: 1,
      routeNumber: "R001",
      name: "North Route",
      busNumber: "BUS-001",
      driver: {
        name: "Michael Johnson",
        contact: "555-0123",
        license: "DL12345",
      },
      stops: [
        { id: 1, name: "City Center", time: "7:30 AM" },
        { id: 2, name: "Market Square", time: "7:45 AM" },
      ],
      students: [
        {
          id: 1,
          name: "Alice Brown",
          class: "9A",
          stop: "City Center",
          fee: 2000,
        },
        {
          id: 2,
          name: "Bob Wilson",
          class: "10B",
          stop: "Market Square",
          fee: 2000,
        },
      ],
      status: "Active",
      lastLocation: "City Center",
      lastUpdated: "08:15 AM",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showRouteModal, setShowRouteModal] = useState(false);
  
  
  // Modal states
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [editingRoute, setEditingRoute] = useState(null);

  // Handle route creation/editing
  const handleSaveRoute = (formData) => {
    if (editingRoute) {
      setRoutes(routes.map(route => 
        route.id === editingRoute.id ? { ...formData, id: route.id } : route
      ));
    } else {
      const newRoute = {
        ...formData,
        id: Math.max(...routes.map(r => r.id), 0) + 1
      };
      setRoutes([...routes, newRoute]);
    }
    setShowRouteModal(false);
    setEditingRoute(null);
  };

  // Open tracking modal
  const handleTrackRoute = (route) => {
    setSelectedRoute(route);
    setShowTrackingModal(true);
  };

  // Open edit modal
  const handleEditRoute = (route) => {
    setEditingRoute(route);
    setShowRouteModal(true);
  };

  // Stats calculations
  const stats = {
    activeRoutes: routes.filter((r) => r.status === "Active").length,
    totalStudents: routes.reduce((sum, r) => sum + r.students.length, 0),
    totalBuses: routes.length,
    monthlyRevenue: routes.reduce(
      (sum, r) => sum + r.students.reduce((acc, s) => acc + s.fee, 0),
      0
    ),
  };

  return (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Active Routes"
          value={stats.activeRoutes}
          icon={<MapPin />}
          color="blue"
        />
        <StatCard
          title="Students"
          value={stats.totalStudents}
          icon={<Users />}
          color="green"
        />
        <StatCard
          title="Buses"
          value={stats.totalBuses}
          icon={<Bus />}
          color="yellow"
        />
        <StatCard
          title="Revenue"
          value={`$${stats.monthlyRevenue}`}
          icon={<DollarSign />}
          color="purple"
        />
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search routes, drivers or students..."
            className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowRouteModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Route
        </button>
      </div>

      {/* Routes List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {routes.map(route => (
          <RouteCard 
            key={route.id} 
            route={route}
            onTrack={() => handleTrackRoute(route)}
            onEdit={() => handleEditRoute(route)}
          />
        ))}
      </div>
        {/* Modals */}
        <RouteFormModal
        show={showRouteModal}
        onClose={() => {
          setShowRouteModal(false);
          setEditingRoute(null);
        }}
        onSave={handleSaveRoute}
        route={editingRoute}
      />

      <BusTrackingModal
        show={showTrackingModal}
        onClose={() => {
          setShowTrackingModal(false);
          setSelectedRoute(null);
        }}
        route={selectedRoute}
      />
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-semibold text-${color}-600`}>{value}</p>
      </div>
      <div className={`w-8 h-8 text-${color}-500`}>{icon}</div>
    </div>
  </div>
);

const RouteCard = ({ route, onTrack, onEdit }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900">{route.name}</h3>
        <p className="text-sm text-gray-500">Route #{route.routeNumber}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onTrack}
          className="p-2 hover:bg-blue-50 text-blue-600 rounded-md"
        >
          <Navigation className="w-4 h-4" />
        </button>
        <button onClick={onEdit} className="p-2 hover:bg-gray-50 rounded-md">
          <Bus className="w-4 h-4" />
        </button>
      </div>
    </div>

    {/* Rest of your RouteCard content */}
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <p className="text-sm text-gray-500">Bus Number</p>
        <p className="text-sm font-medium">{route.busNumber}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Driver</p>
        <p className="text-sm font-medium">{route.driver.name}</p>
      </div>
    </div>

    <div className="border-t border-gray-200 pt-4">
      <h4 className="text-sm font-medium text-gray-900 mb-2">Current Status</h4>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{route.lastLocation}</span>
        <span className="text-gray-900">{route.lastUpdated}</span>
      </div>
    </div>
  </div>
);

export default TransportSection;
