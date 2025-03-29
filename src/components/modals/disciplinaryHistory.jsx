import React from "react";
import {
  X,
  User,
  Calendar,
  Clock,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import LoadingSpinner from "../../util/loaderSpinner";

const StatusHistoryDialog = ({
  show,
  onClose,
  studentData,
  statusHistory,
  loading,
}) => {
  if (!show) return null;
 
  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = { month: "short", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  // Function to get the latest status change text
  function getLatestStatusChange(statusHistoryArray) {
    if (!Array.isArray(statusHistoryArray) || statusHistoryArray.length === 0) {
      return "Unknown"; // Fallback text if no history exists
    }

    // Sort the array by effective_date (descending), then by created_at (descending)
    const latestEntry = statusHistoryArray.sort((a, b) => {
      // First compare by effective_date
      const dateComparison =
        new Date(b.effective_date) - new Date(a.effective_date);

      // If dates are the same, use created_at for tiebreaker
      if (dateComparison === 0) {
        return new Date(b.created_at) - new Date(a.created_at);
      }

      return dateComparison;
    })[0]; // Get the first (latest) entry after sorting

    // Return the new_status from the latest entry
    return latestEntry.new_status;
  }

  // Format relative time (e.g., "3 months ago")
  const getRelativeTime = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? "s" : ""} ago`;
    }

    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  };

  // Get status badge style
  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "suspended":
        return "bg-orange-100 text-orange-800";
      case "on_probation":
      case "on probation":
        return "bg-purple-100 text-purple-800";
      case "expelled":
        return "bg-red-100 text-red-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-black opacity-50 w-full h-full absolute"></div>
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Student Status History
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Student Info */}
              {studentData && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Student Name</p>
                      <p className="font-medium text-gray-900">
                        {studentData.first_name} {studentData.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Admission Number</p>
                      <p className="font-medium text-gray-900">
                        {studentData.admission_number}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Class</p>
                      <p className="font-medium text-gray-900">
                        {studentData.current_class} {studentData.stream}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current Status</p>
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(
                          getLatestStatusChange(statusHistory)
                        )}`}
                      >
                        {getLatestStatusChange(statusHistory)}
                      </span>
                    </div>
                  </div>

                  {studentData.status !== "active" &&
                    studentData.status_end_date && (
                      <div className="mt-3 flex items-center text-sm text-blue-700">
                        <Clock className="h-4 w-4 mr-1" />
                        Status will return to active on{" "}
                        {formatDate(studentData.status_end_date)}
                      </div>
                    )}
                </div>
              )}

              {/* Status History Timeline */}
              {Array.isArray(statusHistory) && statusHistory.length ? (
                <div className="relative">
                  <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-200"></div>

                  <ul className="space-y-6">
                    {statusHistory?.map((entry, index) => (
                      <li key={index} className="relative pl-14">
                        {/* Timeline dot */}
                        <div className="absolute left-5 top-0.5 -translate-x-1/2 h-4 w-4 rounded-full bg-blue-500 border-2 border-white"></div>

                        {/* Entry card */}
                        <div className="p-4 border rounded-lg shadow-sm">
                          {/* Date & reason */}
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center text-gray-600 text-sm">
                              <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                              <span>{formatDate(entry.effective_date)}</span>
                              <span className="mx-1 text-gray-400">•</span>
                              <span className="text-gray-500">
                                {getRelativeTime(entry.effective_date)}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
                              {entry.reason_type?.replace("_", " ")}
                            </span>
                          </div>

                          {/* Status change */}
                          <div className="flex items-center mb-2">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(
                                entry.previous_status
                              )}`}
                            >
                              {entry.previous_status?.replace("_", " ")}
                            </span>
                            <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(
                                entry.new_status
                              )}`}
                            >
                              {entry.new_status?.replace("_", " ")}
                            </span>
                          </div>

                          {/* Duration if applicable */}
                          {entry.end_date && (
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <Clock className="h-4 w-4 mr-1 text-gray-500" />
                              <span>
                                Until {formatDate(entry.end_date)}
                                {entry.auto_restore && " (auto-restore)"}
                              </span>
                            </div>
                          )}

                          {/* Additional info */}
                          {entry.notes && (
                            <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                              {entry.notes}
                            </p>
                          )}

                          {/* Related incident link if available */}
                          {entry.disciplinary_action_id && (
                            <div className="mt-3">
                              <a
                                href="#"
                                className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center"
                              >
                                View related incident
                              </a>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    No status change history found for this student.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusHistoryDialog;
