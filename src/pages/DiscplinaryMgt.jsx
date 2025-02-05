import React, { useState } from "react";
import { FileText, AlertCircle } from "lucide-react";
import DisciplineAnalytics from "../components/disciplineAnalytics";
import IncidentList from "../components/incidentList";
import IncidentFormDialog from "../components/modals/incidentForm";
import Navbar from "../components/navbar";
import { useStore } from "../store/store";
import { useEffect } from "react";

const DisciplineMgt = () => {
  const { updateActiveModule, activeModule } = useStore();

  useEffect(() => {
    updateActiveModule("disciplinary");
  }, [activeModule]);

  // Initial state for incidents
  const [incidents, setIncidents] = useState([
    {
      id: 1,
      studentName: "Michael Ochieng",
      studentId: "KPS2024003",
      grade: "10A",
      date: "2025-02-01",
      type: "Misconduct",
      severity: "Moderate",
      description: "Disrupting class discussion",
      location: "Classroom",
      witnesses: "Mrs. Ochieng",
      action: "Verbal Warning",
      status: "Resolved",
      followUp: "2025-02-08",
    },
    {
      id: 2,
      studentName: "Sarah Wanjiku",
      studentId: "KPS2024002",
      grade: "10A",
      date: "2025-02-01",
      type: "Misconduct",
      severity: "Moderate",
      description: "Disrupting class discussion",
      location: "Classroom",
      witnesses: "Mrs. Kamau",
      action: "Verbal Warning",
      status: "Resolved",
      followUp: "2025-02-10",
    },
  ]);

  // UI state management
  const [showIncidentDialog, setShowIncidentDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [incidentForm, setIncidentForm] = useState({
    studentName: "",
    studentId: "",
    grade: "",
    date: "",
    type: "",
    severity: "",
    description: "",
    location: "",
    witnesses: "",
    action: "",
    status: "Pending",
    followUp: "",
  });

  // Filter incidents
  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" ||
      incident.status.toLowerCase() === selectedFilter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  // Handlers
  const handleAddIncident = () => {
    setIsEditing(false);
    setIncidentForm({
      studentName: "",
      studentId: "",
      grade: "",
      date: "",
      type: "",
      severity: "",
      description: "",
      location: "",
      witnesses: "",
      action: "",
      status: "Pending",
      followUp: "",
    });
    setShowIncidentDialog(true);
  };

  const handleEditIncident = (incident) => {
    setIsEditing(true);
    setIncidentForm(incident);
    setShowIncidentDialog(true);
  };

  const handleDeleteIncident = (incidentId) => {
    if (
      window.confirm("Are you sure you want to delete this incident record?")
    ) {
      setIncidents(incidents.filter((incident) => incident.id !== incidentId));
    }
  };

  const handleSaveIncident = () => {
    if (isEditing) {
      setIncidents(
        incidents.map((incident) =>
          incident.id === incidentForm.id ? incidentForm : incident
        )
      );
    } else {
      const newIncident = {
        id: Math.max(...incidents.map((i) => i.id)) + 1,
        ...incidentForm,
      };
      setIncidents([...incidents, newIncident]);
    }
    setShowIncidentDialog(false);
  };

  return (
    <Navbar>
      <div className="p-6 space-y-6 bg-white rounded-lg shadow-sm m-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Discipline & Behavior Tracking
          </h1>
          <div className="flex gap-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              <FileText className="w-4 h-4 mr-2" />
              {incidents.length} Incidents
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              <AlertCircle className="w-4 h-4 mr-2" />
              {incidents.filter((i) => i.status === "Pending").length} Pending
            </span>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <DisciplineAnalytics incidents={incidents} />

        {/* Incident List */}
        <IncidentList
          incidents={filteredIncidents}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          onAdd={handleAddIncident}
          onEdit={handleEditIncident}
          onDelete={handleDeleteIncident}
        />

        {/* Incident Form Dialog */}
        <IncidentFormDialog
          show={showIncidentDialog}
          onClose={() => setShowIncidentDialog(false)}
          formData={incidentForm}
          setFormData={setIncidentForm}
          onSave={handleSaveIncident}
          isEditing={isEditing}
        />
      </div>
    </Navbar>
  );
};

export default DisciplineMgt;
