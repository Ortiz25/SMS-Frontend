import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";

const RouteFormModal = ({ show, onClose, onSave, route = null }) => {
  const [formData, setFormData] = useState({
    routeNumber: "",
    name: "",
    busNumber: "",
    driver: {
      name: "",
      contact: "",
      license: "",
    },
    stops: [],
    status: "Active",
  });

  const [newStop, setNewStop] = useState({ name: "", time: "" });

  useEffect(() => {
    if (route) {
      setFormData(route);
    }
  }, [route]);

  const handleAddStop = () => {
    if (newStop.name && newStop.time) {
      setFormData({
        ...formData,
        stops: [...formData.stops, { ...newStop, id: Date.now() }],
      });
      setNewStop({ name: "", time: "" });
    }
  };

  const handleRemoveStop = (stopId) => {
    setFormData({
      ...formData,
      stops: formData.stops.filter((stop) => stop.id !== stopId),
    });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="bg-black opacity-50 w-full h-full absolute"></div>{" "}
      {/* Backdrop */}
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 z-50 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {route ? "Edit Route" : "Add New Route"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
          className="space-y-4"
        >
          {/* Basic Route Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Route Number *
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                value={formData.routeNumber}
                onChange={(e) =>
                  setFormData({ ...formData, routeNumber: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Route Name *
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Bus and Driver Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bus Number *
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                value={formData.busNumber}
                onChange={(e) =>
                  setFormData({ ...formData, busNumber: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          {/* Driver Details */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver Name *
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                value={formData.driver.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    driver: { ...formData.driver, name: e.target.value },
                  })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number *
              </label>
              <input
                type="tel"
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                value={formData.driver.contact}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    driver: { ...formData.driver, contact: e.target.value },
                  })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Number *
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                value={formData.driver.license}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    driver: { ...formData.driver, license: e.target.value },
                  })
                }
                required
              />
            </div>
          </div>

          {/* Route Stops */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Route Stops
            </label>
            <div className="space-y-2">
              {formData.stops.map((stop) => (
                <div key={stop.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={stop.name}
                    className="flex-1 rounded-md border border-gray-300 py-2 px-3"
                    readOnly
                  />
                  <input
                    type="time"
                    value={stop.time}
                    className="w-32 rounded-md border border-gray-300 py-2 px-3"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveStop(stop.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Stop Name"
                  className="flex-1 rounded-md border border-gray-300 py-2 px-3"
                  value={newStop.name}
                  onChange={(e) =>
                    setNewStop({ ...newStop, name: e.target.value })
                  }
                />
                <input
                  type="time"
                  className="w-32 rounded-md border border-gray-300 py-2 px-3"
                  value={newStop.time}
                  onChange={(e) =>
                    setNewStop({ ...newStop, time: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={handleAddStop}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {route ? "Save Changes" : "Create Route"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RouteFormModal;
