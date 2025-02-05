import React, { useState, useEffect } from "react";
import { X, Eye } from "lucide-react";

const AnnouncementFormModal = ({
  show,
  onClose,
  onSave,
  announcement = null,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Event",
    priority: "Normal",
    audience: [],
    publishDate: new Date().toISOString().split("T")[0],
    status: "Draft",
  });

  // Load announcement data if editing
  useEffect(() => {
    if (announcement) {
      setFormData(announcement);
    }
  }, [announcement]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="bg-black opacity-50 w-full h-full absolute"></div>{" "}
      {/* Backdrop */}
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 z-50 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {announcement ? "Edit Announcement" : "Create New Announcement"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              className="w-full rounded-md border border-gray-300 py-2 px-3 h-32"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              required
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              >
                <option value="Event">Event</option>
                <option value="Academic">Academic</option>
                <option value="Administrative">Administrative</option>
                <option value="Sports">Sports</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Audience *
            </label>
            <div className="space-y-2">
              {["Students", "Teachers", "Parents"].map((audience) => (
                <label key={audience} className="inline-flex items-center mr-4">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600"
                    checked={formData.audience.includes(audience)}
                    onChange={(e) => {
                      const newAudience = e.target.checked
                        ? [...formData.audience, audience]
                        : formData.audience.filter((a) => a !== audience);
                      setFormData({ ...formData, audience: newAudience });
                    }}
                  />
                  <span className="ml-2 text-sm text-gray-700">{audience}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Publish Date and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Publish Date *
              </label>
              <input
                type="date"
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                value={formData.publishDate}
                onChange={(e) =>
                  setFormData({ ...formData, publishDate: e.target.value })
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
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Scheduled">Scheduled</option>
              </select>
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
              {announcement ? "Save Changes" : "Create Announcement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementFormModal;
