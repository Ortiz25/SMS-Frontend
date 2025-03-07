import React, { useState, useEffect } from "react";
import { FileText, AlertCircle } from "lucide-react";
import DisciplineAnalytics from "../components/disciplineAnalytics";
import IncidentList from "../components/incidentList";
import IncidentFormDialog from "../components/modals/incidentForm";
import Navbar from "../components/navbar";
import { useStore } from "../store/store";
import disciplinaryService from "../util/disciplinaryServices";
import { toast } from "react-toastify";
import { redirect } from "react-router-dom";

const DisciplineMgt = () => {
  const { updateActiveModule } = useStore();

  useEffect(() => {
    updateActiveModule("disciplinary");
    
    // Fetch all incidents once when component mounts
    fetchAllIncidents();
  }, [updateActiveModule]);

  // State for incidents
  const [allIncidents, setAllIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state management
  const [showIncidentDialog, setShowIncidentDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [formLoading, setFormLoading] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    studentName: "",
    admissionNumber: "",
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

  // Fetch all incidents data once
  const fetchAllIncidents = async () => {
    try {
      setLoading(true);
      // Get all incidents without filtering
      const data = await disciplinaryService.getIncidents();
      setAllIncidents(data);
      setFilteredIncidents(data); // Initially show all incidents
      setError(null);
    } catch (err) {
      console.error("Error fetching incidents:", err);
      setError("Failed to load incidents. Please try again later.");
      toast.error("Failed to load incidents");
    } finally {
      setLoading(false);
    }
  };

  // Filter incidents locally when search or filter changes
  useEffect(() => {
    const filterIncidents = () => {
      return allIncidents.filter((incident) => {
        // Search query filtering
        const matchesSearch = !searchQuery ? true : (
          (incident.studentName && incident.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (incident.admission_number && incident.admission_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (incident.description && incident.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        
        // Status filtering
        const matchesFilter = selectedFilter === "all" || 
          (incident.status && incident.status.toLowerCase() === selectedFilter.toLowerCase());
        
        return matchesSearch && matchesFilter;
      });
    };
    
    setFilteredIncidents(filterIncidents());
  }, [searchQuery, selectedFilter, allIncidents]);

  // Handlers
  const handleAddIncident = () => {
    setIsEditing(false);
    setIncidentForm({
      studentName: "",
      admissionNumber: "",
      grade: "",
      date: new Date().toISOString().split('T')[0], // Default to today
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
    
    // Format the date correctly for the date input
    const formattedIncident = {
      ...incident,
      admissionNumber: incident.admission_number, // Map from API field to form field
      date: incident.date ? new Date(incident.date).toISOString().split('T')[0] : "",
      followUp: incident.follow_up ? new Date(incident.follow_up).toISOString().split('T')[0] : ""
    };
    
    setIncidentForm(formattedIncident);
    setShowIncidentDialog(true);
  };

  const handleDeleteIncident = async (incidentId) => {
    if (window.confirm("Are you sure you want to delete this incident record?")) {
      try {
        await disciplinaryService.deleteIncident(incidentId);
        
        // Update local state by removing the deleted incident
        const updatedIncidents = allIncidents.filter((incident) => incident.id !== incidentId);
        setAllIncidents(updatedIncidents);
        
        toast.success("Incident deleted successfully");
      } catch (err) {
        console.error("Error deleting incident:", err);
        toast.error("Failed to delete incident");
      }
    }
  };

  console.log(allIncidents)

  const handleSaveIncident = async () => {
    try {
      setFormLoading(true);
      
      if (isEditing) {
        // Update existing incident
        const updatedIncident = await disciplinaryService.updateIncident(
          incidentForm.id,
          incidentForm
        );
        
        // Update in local state
        setAllIncidents(
          allIncidents.map((incident) =>
            incident.id === updatedIncident.id ? updatedIncident : incident
          )
        );
        
        toast.success("Incident updated successfully");
      } else {
        // Create new incident
        const newIncident = await disciplinaryService.createIncident(incidentForm);
        
        // Add to local state
        setAllIncidents([...allIncidents, newIncident]);
        
        toast.success("Incident created successfully");
      }
      
      setShowIncidentDialog(false);
    } catch (err) {
      console.error("Error saving incident:", err);
      toast.error(isEditing ? "Failed to update incident" : "Failed to create incident");
    } finally {
      setFormLoading(false);
    }
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
              {allIncidents.length} Incidents
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              <AlertCircle className="w-4 h-4 mr-2" />
              {allIncidents.filter((i) => i.status === "Pending").length} Pending
            </span>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <DisciplineAnalytics incidents={allIncidents} />

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
          loading={loading}
          error={error}
        />

        {/* Incident Form Dialog */}
        <IncidentFormDialog
          show={showIncidentDialog}
          onClose={() => setShowIncidentDialog(false)}
          formData={incidentForm}
          setFormData={setIncidentForm}
          onSave={handleSaveIncident}
          isEditing={isEditing}
          loading={formLoading}
        />
      </div>
    </Navbar>
  );
};

export default DisciplineMgt;

export async function loader({ params }) {
  try {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If no token exists, redirect to login\
   
    if (!token) {
      return redirect("/");
    }
  
    const tokenUrl = "http://localhost:5000/api/auth/verify-token";

    const tokenResponse = await fetch(tokenUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const tokenData = await tokenResponse.json();

    // If token is invalid or expired
    if (!tokenResponse.ok || tokenData.error) {
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return redirect("/");
    }

    return null
  } catch (error) {
    console.error("Error loading timetable:", error);
    return {
      error: {
        message: error.message,
        status: error.status || 500,
      },
    };
  }
}