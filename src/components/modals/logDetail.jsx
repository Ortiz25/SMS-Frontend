import React from 'react';
import { X, User, MapPin, Monitor, Clock, Shield, Info, Globe, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const LogDetailModal = ({ show, onClose, log }) => {
  if (!show || !log) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {getStatusIcon(log.status)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{log.event}</h2>
              <p className="text-sm text-gray-500">Event ID: {log.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Banner */}
          <div className={`rounded-lg border px-4 py-3 ${getStatusStyle(log.status)}`}>
            <div className="flex items-center gap-2">
              {getStatusIcon(log.status)}
              <div className="flex-1">
                <h3 className="font-medium">Event Status: {log.status.charAt(0).toUpperCase() + log.status.slice(1)}</h3>
                {log.statusMessage && (
                  <p className="text-sm mt-1">{log.statusMessage}</p>
                )}
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-2 gap-6">
            {/* Timing Information */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timing Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2">
                  <span className="text-sm text-gray-500">Timestamp</span>
                  <span className="text-sm font-medium">{log.timestamp}</span>
                </div>
                {log.duration && (
                  <div className="grid grid-cols-2">
                    <span className="text-sm text-gray-500">Duration</span>
                    <span className="text-sm font-medium">{log.duration}ms</span>
                  </div>
                )}
              </div>
            </div>

            {/* User Information */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                User Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2">
                  <span className="text-sm text-gray-500">User</span>
                  <span className="text-sm font-medium">{log.user}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-sm text-gray-500">Role</span>
                  <span className="text-sm font-medium">{log.role}</span>
                </div>
              </div>
            </div>

            {/* Access Information */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Access Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2">
                  <span className="text-sm text-gray-500">IP Address</span>
                  <span className="text-sm font-medium">{log.ip}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-sm text-gray-500">Device</span>
                  <span className="text-sm font-medium">{log.device}</span>
                </div>
                {log.location && (
                  <div className="grid grid-cols-2">
                    <span className="text-sm text-gray-500">Location</span>
                    <span className="text-sm font-medium">{log.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Details */}
            {log.details && (
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Additional Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm whitespace-pre-wrap">{
                    typeof log.details === 'object' 
                      ? JSON.stringify(log.details, null, 2)
                      : log.details
                  }</pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogDetailModal;