import React, { useState } from 'react';
import { X, Navigation, Clock, MapPin } from 'lucide-react';

const BusTrackingModal = ({ show, onClose, route }) => {
  const [currentStop, setCurrentStop] = useState(route?.stops[0]);
  
  if (!show || !route) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 z-50 ${
        show ? "" : "hidden"
      }`}
    >
     <div className="absolute inset-0 bg-black opacity-50"></div>
     <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Bus Location Tracking</h2>
            <p className="text-sm text-gray-500">{route.name} - {route.busNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Live Status */}
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Current Location</p>
                  <p className="text-lg font-semibold text-blue-700">
                    {route.lastLocation}
                  </p>
                </div>
                <Navigation className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Last Updated</p>
                  <p className="text-lg font-semibold text-gray-700">
                    {route.lastUpdated}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-gray-500" />
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-900">Next Stop</p>
                  <p className="text-lg font-semibold text-yellow-700">
                    {currentStop?.name}
                  </p>
                  <p className="text-sm text-yellow-600">
                    Expected: {currentStop?.time}
                  </p>
                </div>
                <MapPin className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Route Timeline */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Route Timeline</h3>
            <div className="space-y-6">
              {route.stops.map((stop, index) => (
                <div key={stop.id} className="relative">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      stop.name === route.lastLocation
                        ? 'bg-blue-500'
                        : index < route.stops.indexOf(currentStop)
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`} />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{stop.name}</p>
                      <p className="text-sm text-gray-500">{stop.time}</p>
                    </div>
                  </div>
                  {index < route.stops.length - 1 && (
                    <div className="absolute left-1.5 ml-px h-14 w-px bg-gray-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>Driver: {route.driver.name}</div>
            <div>Contact: {route.driver.contact}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusTrackingModal;