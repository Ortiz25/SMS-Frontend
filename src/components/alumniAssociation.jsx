// AlumniAssociations.jsx
import React, { useState } from "react";
import {
  Plus,
  Search,
  Users,
  Calendar,
  GraduationCap,
  Mail,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import CreateAssociationModal from "./modals/createAssociation";

const AssociationCard = ({ association }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg hover:shadow-lg transition-shadow duration-200">
      {/* Card Header */}
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{association.name}</h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              association.status === "Active"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {association.status}
          </span>
        </div>

        {/* Basic Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span>{association.members} Members</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>
              Next Meeting:{" "}
              {new Date(association.nextMeeting).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-gray-400" />
            <span>Chair: {association.chair}</span>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show More <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            {/* Upcoming Events */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Upcoming Events
              </h4>
              <div className="space-y-2">
                {association.upcomingEvents.map((event) => (
                  <div key={event.id} className="text-sm">
                    <p className="font-medium">{event.name}</p>
                    <p className="text-gray-500">
                      {new Date(event.date).toLocaleDateString()} -{" "}
                      {event.location}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Updates */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recent Updates</h4>
              <div className="space-y-2">
                {association.recentUpdates.map((update) => (
                  <div key={update.id} className="text-sm">
                    <p>{update.content}</p>
                    <p className="text-gray-500">
                      {new Date(update.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Mail className="h-4 w-4" />
                Contact
              </button>
              <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                View Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AlumniAssociations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateAssociation = (formData) => {
    // Here you would typically make an API call to create the association
    console.log("Creating new association:", formData);

    // Close the modal after submission
    setIsCreateModalOpen(false);
  };

  // Mock data
  const associations = [
    {
      id: 1,
      name: "Class of 2020",
      members: 120,
      nextMeeting: "2025-03-15",
      chair: "Jane Smith",
      status: "Active",
      upcomingEvents: [
        {
          id: 1,
          name: "Career Fair",
          date: "2025-04-01",
          location: "Main Hall",
        },
        {
          id: 2,
          name: "Alumni Mixer",
          date: "2025-05-15",
          location: "Garden Area",
        },
      ],
      recentUpdates: [
        {
          id: 1,
          date: "2025-02-01",
          content: "New mentorship program launched",
        },
        { id: 2, date: "2025-01-15", content: "Scholarship fund raised" },
      ],
    },
    // Add more mock data here
  ];

  // Filter associations based on search and status
  const filteredAssociations = associations.filter((assoc) => {
    const matchesSearch = assoc.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || assoc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Alumni Associations
          </h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create New Association
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search associations..."
              className="pl-10 w-full rounded-lg border border-gray-300 p-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-300 p-2"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Associations Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssociations.map((association) => (
            <AssociationCard key={association.id} association={association} />
          ))}
        </div>
      </div>
      {/* Create Association Modal */}
      <CreateAssociationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateAssociation}
      />
    </div>
  );
};

export default AlumniAssociations;
