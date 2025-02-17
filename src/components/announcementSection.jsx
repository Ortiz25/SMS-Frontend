import React, { useState } from "react";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import AnnouncementFormModal from "./modals/announcementForm";

const AnnouncementSection = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);

  // State for announcements
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Annual Sports Day",
      content: "Annual Sports Day will be held on March 15th, 2025.",
      category: "Event",
      priority: "High",
      publishDate: "2025-02-04",
      audience: ["Students", "Parents", "Teachers"],
      status: "Published",
    },
  ]);

  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // Handle create new
  const handleCreateNew = () => {
    setCurrentAnnouncement(null);
    setShowModal(true);
  };

  // Handle edit
  const handleEdit = (announcement) => {
    setCurrentAnnouncement(announcement);
    setShowModal(true);
  };

  // Handle save
  const handleSave = (formData) => {
    if (currentAnnouncement) {
      // Update existing announcement
      setAnnouncements(
        announcements.map((announcement) =>
          announcement.id === currentAnnouncement.id
            ? { ...formData, id: currentAnnouncement.id }
            : announcement
        )
      );
    } else {
      // Create new announcement
      const newAnnouncement = {
        ...formData,
        id: Math.max(...announcements.map((a) => a.id), 0) + 1,
      };
      setAnnouncements([...announcements, newAnnouncement]);
    }
  };

  // Handle delete
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      setAnnouncements(announcements.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex gap-4 justify-between">
        <div className="flex gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search announcements..."
              className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="rounded-md border border-gray-300 py-2 px-3"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Event">Event</option>
            <option value="Academic">Academic</option>
            <option value="Administrative">Administrative</option>
          </select>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {announcement.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {announcement.content}
                </p>
                <div className="mt-2 flex gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {announcement.category}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      announcement.priority === "High"
                        ? "bg-red-100 text-red-800"
                        : announcement.priority === "Urgent"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {announcement.priority}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(announcement)}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Announcement Form Modal */}
      <AnnouncementFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        announcement={currentAnnouncement}
      />
    </div>
  );
};

export default AnnouncementSection;
