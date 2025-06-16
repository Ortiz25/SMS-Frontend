// components/announcementSection.js
import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Filter,
  ChevronDown,
  PenSquare,
  UserCheck,
  Users,
} from "lucide-react";
import {
  getAnnouncements,
  createAnnouncement,
  getClasses,
  getDepartments,
} from "../util/communicationServices";
import { format } from "date-fns";

const AnnouncementSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({
    message: "",
    recipientType: "all",
    recipientGroupId: "",
  });
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await getAnnouncements();
      setAnnouncements(data);
      setError(null);
    } catch (error) {
      setError("Failed to load announcements");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recipient options (classes, departments)
  const fetchRecipientOptions = async () => {
    try {
      const [classesData, departmentsData] = await Promise.all([
        getClasses(),
        getDepartments(),
      ]);
      setClasses(classesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error("Error fetching recipient options:", error);
    }
  };

  useEffect(() => {
    const adminRights = userInfo.role === "admin";
    setIsAdmin(adminRights);
    fetchAnnouncements();
    fetchRecipientOptions();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAnnouncement(formData);
      // Clear form and hide it
      setFormData({
        message: "",
        recipientType: "all",
        recipientGroupId: "",
      });
      setShowNewForm(false);
      // Refresh announcements list
      fetchAnnouncements();
    } catch (error) {
      console.error("Error creating announcement:", error);
      setError("Failed to create announcement");
    }
  };

  // Filter announcements
  const filteredAnnouncements =
    filter === "all"
      ? announcements
      : announcements.filter((announcement) =>
          announcement.audience.toLowerCase().includes(filter.toLowerCase())
        );

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Announcements</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>
            {/* Filter dropdown would go here */}
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowNewForm(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Announcement
            </button>
          )}
        </div>
      </div>

      {/* New Announcement Form */}
      {showNewForm && (
        <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium mb-4">New Announcement</h3>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient
                </label>
                <select
                  name="recipientType"
                  value={formData.recipientType}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Users</option>
                  <option value="class">Specific Class</option>
                  <option value="department">Specific Department</option>
                </select>
              </div>

              {formData.recipientType === "class" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Class
                  </label>
                  <select
                    name="recipientGroupId"
                    value={formData.recipientGroupId}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select a class...</option>
                    {classes.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.recipientType === "department" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Department
                  </label>
                  <select
                    name="recipientGroupId"
                    value={formData.recipientGroupId}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select a department...</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter your announcement message..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Post Announcement
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        /* Announcements list */
        <div className="space-y-4">
          {filteredAnnouncements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No announcements found
            </div>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-white p-4 rounded-md border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-md font-medium text-gray-900">
                      {announcement.sender_name}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>
                        {format(
                          new Date(announcement.created_at),
                          "MMM d, yyyy • h:mm a"
                        )}
                      </span>
                      <span>•</span>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{announcement.audience}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {announcement.status}
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-line">
                  {announcement.message}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AnnouncementSection;
