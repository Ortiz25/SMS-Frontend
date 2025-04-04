import React, { useState } from "react";
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  FileText, 
  Filter,
  User,
  Clock,
  AlertTriangle
} from "lucide-react";

const IncidentList = ({
  incidents,
  searchQuery,
  setSearchQuery,
  selectedFilter,
  setSelectedFilter,
  onAdd,
  onEdit,
  onDelete,
  onViewStatusHistory,
  loading,
  error
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "minor":
        return "bg-blue-100 text-blue-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "severe":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusChangeColor = (statusChange) => {
    switch (statusChange?.toLowerCase()) {
      case "expelled":
        return "bg-red-100 text-red-800";
      case "suspended":
        return "bg-orange-100 text-orange-800";
      case "on_probation":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date function to replace date-fns import
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Handle search input change locally
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // No API call is triggered since filtering happens in the parent component
  };

  if (loading) {
    return <div className="p-4 text-center">Loading incidents...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <h2 className="text-xl font-semibold text-gray-700">Incidents</h2>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex items-center w-full md:w-64">
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
            <input
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9 pr-4 py-2 w-full border rounded-md"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 px-3 py-2 rounded-md border border-gray-300 text-gray-700 text-sm"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button
              onClick={onAdd}
              className="flex items-center gap-1 px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              <Plus className="h-4 w-4" />
              New Incident
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 p-3 rounded-md mb-4 flex flex-wrap gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border rounded p-2 text-sm bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Change
            </label>
            <select
              onChange={(e) => setSelectedFilter(e.target.value === "status_changed" ? "status_changed" : "all")}
              className="border rounded p-2 text-sm bg-white"
              defaultValue=""
            >
              <option value="">Filter by Status Change</option>
              <option value="status_changed">Only Status-Changing Incidents</option>
              <option value="no_status_change">No Status Change</option>
            </select>
          </div> */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severity
            </label>
            <select
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border rounded p-2 text-sm bg-white"
              defaultValue="all"
            >
              <option value="all">All Severities</option>
              <option value="minor">Minor</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>
        </div>
      )}

      {incidents.length === 0 ? (
        <div className="text-center p-4 bg-gray-50 rounded-md">
          <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-500">No incidents found.</p>
          {searchQuery || selectedFilter !== "all" ? (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedFilter("all");
              }}
              className="text-blue-600 hover:text-blue-800 text-sm mt-2"
            >
              Clear filters
            </button>
          ) : (
            <button 
              onClick={onAdd}
              className="text-blue-600 hover:text-blue-800 text-sm mt-2"
            >
              Create your first incident record
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Change</th>
                <th scope="col" className="relative px-6 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{incident.student_name}</div>
                      <div className="text-xs text-gray-500">{incident.grade} • {incident.admission_number}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(incident.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{incident.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(incident.status)}`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{incident.action}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {incident.affects_status && incident.status_change ? (
                      <div className="flex flex-col">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusChangeColor(incident.status_change)}`}>
                          {incident.status_change.replace('_', ' ')}
                        </span>
                        {incident.end_date && (
                          <span className="text-xs text-gray-500 mt-1 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Until: {formatDate(incident.end_date)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative inline-block text-left">
                      <div>
                        <button 
                          type="button" 
                          className="text-gray-500 hover:bg-gray-100 p-1 rounded-full"
                          onClick={() => document.getElementById(`dropdown-${incident.id}`).classList.toggle('hidden')}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                      <div 
                        id={`dropdown-${incident.id}`}
                        className="hidden origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                      >
                        <div className="py-1">
                          <button
                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              onEdit(incident);
                              document.getElementById(`dropdown-${incident.id}`).classList.add('hidden');
                            }}
                          >
                            <Edit className="h-4 w-4 inline mr-2" />
                            Edit Incident
                          </button>
                          <button
                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              onViewStatusHistory(incident.student_id, incident);
                              document.getElementById(`dropdown-${incident.id}`).classList.add('hidden');
                            }}
                          >
                            <User className="h-4 w-4 inline mr-2" />
                            View Status History
                          </button>
                          <button
                            className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            onClick={() => {
                              onDelete(incident.id);
                              document.getElementById(`dropdown-${incident.id}`).classList.add('hidden');
                            }}
                          >
                            <Trash2 className="h-4 w-4 inline mr-2" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default IncidentList;