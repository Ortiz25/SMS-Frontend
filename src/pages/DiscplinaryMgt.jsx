import React, { useState, useEffect } from "react";
import { FileText, AlertCircle, Users } from "lucide-react";
import DisciplineAnalytics from "../components/disciplineAnalytics";
import IncidentList from "../components/incidentList";
import IncidentFormDialog from "../components/modals/incidentForm";
import StatusHistoryDialog from "../components/modals/disciplinaryHistory";
import Navbar from "../components/navbar";
import { useStore } from "../store/store";
import disciplinaryService from "../util/disciplinaryServices";
import { toast } from "react-toastify";
import { redirect } from "react-router-dom";

const DisciplineMgt = () => {
  const { updateActiveModule } = useStore();
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
    status: "",
    followUp: "",
    // New fields for status change functionality
    affectsStatus: false,
    statusChange: "",
    effectiveDate: new Date().toISOString().split('T')[0],
    endDate: "",
    autoRestore: true
  });

  useEffect(() => {
    updateActiveModule("disciplinary");
    // Fetch all incidents once when component mounts
    fetchAllIncidents();
    
    // Fetch status mapping data
    fetchStatusMappings();
  }, [updateActiveModule, incidentForm]);

  // State for incidents
  const [allIncidents, setAllIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for status mappings
  const [actionStatusMappings, setActionStatusMappings] = useState([]);

  // UI state management
  const [showIncidentDialog, setShowIncidentDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [formLoading, setFormLoading] = useState(false);
  
  // State for status history modal
  const [showStatusHistoryDialog, setShowStatusHistoryDialog] = useState(false);
  const [statusHistoryLoading, setStatusHistoryLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  


  // Fetch status mappings data
  const fetchStatusMappings = async () => {
    try {
      const data = await disciplinaryService.getActionStatusMappings();
      setActionStatusMappings(data);
    } catch (err) {
      console.error("Error fetching status mappings:", err);
      // Non-critical, so just log error
    }
  };

  // Fetch all incidents data once
  const fetchAllIncidents = async () => {
    try {
      setLoading(true);
      // Get all incidents without filtering
      const data = await disciplinaryService.getIncidents();
      setAllIncidents(data || []);
      setFilteredIncidents(data || []); // Initially show all incidents
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
          (incident.student_name && incident.student_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (incident.admission_number && incident.admission_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (incident.description && incident.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        // Status filtering
        const matchesFilter = selectedFilter === "all" || 
          (incident.status && incident.status.toLowerCase() === selectedFilter.toLowerCase()) ||
          (incident.severity && incident.severity.toLowerCase() === selectedFilter.toLowerCase())
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
      // New fields with defaults
      affectsStatus: false,
      statusChange: "",
      effectiveDate: new Date().toISOString().split('T')[0],
      endDate: "",
      autoRestore: true
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
      followUp: incident.follow_up ? new Date(incident.follow_up).toISOString().split('T')[0] : "",
      // Include status change fields if they exist, otherwise use defaults
      affectsStatus: incident.affects_status || false,
      statusChange: incident.status_change || "",
      effectiveDate: incident.effective_date ? new Date(incident.effective_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: incident.end_date ? new Date(incident.end_date).toISOString().split('T')[0] : "",
      autoRestore: incident.auto_restore !== undefined ? incident.auto_restore : true
    };
    
    setIncidentForm(formattedIncident);
    setShowIncidentDialog(true);
  };

  const handleDeleteIncident = async (incidentId) => {
    if (window.confirm("Are you sure you want to delete this incident record? This may reverse any status changes associated with it.")) {
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

  const handleSaveIncident = async () => {
    console.log(incidentForm)
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

  // Handle action selection
  const handleActionChange = (action) => {
    // Find corresponding status mapping
    const mapping = actionStatusMappings.find(m => m.action_type === action);
    
    if (mapping) {
      // Auto-fill status change fields
      const endDate = mapping.default_duration ? 
        new Date(Date.now() + mapping.default_duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
        "";
      
      setIncidentForm({
        ...incidentForm,
        action,
        affectsStatus: true,
        statusChange: mapping.resulting_status,
        endDate: endDate
      });
    } else {
      // No mapping found, just update action
      setIncidentForm({
        ...incidentForm,
        action
      });
    }
  };

  // View student status history
  const handleViewStatusHistory = async (studentId, incident) => {
    try {
      setStatusHistoryLoading(true);
      setShowStatusHistoryDialog(true);
      
      // Student data still works as before
      const studentData = {
        id: studentId,
        first_name: incident.student_name?.split(' ')[0] || '',
        last_name: incident.student_name?.split(' ').slice(1).join(' ') || '',
        admission_number: incident.admission_number,
        current_class: incident.grade,
        status: incident.status_change || 'active'
      };
      
      setSelectedStudent(studentData);
      
      // Fetch status history with better error handling
      const history = await disciplinaryService.getStudentStatusHistory(studentId);
      
      // Always ensure we have an array
    
      setStatusHistory(Array.isArray(history) ? history : []);
      
    } catch (err) {
      console.error("Error fetching status history:", err);
      toast.error("Failed to load student status history");
      setStatusHistory([]);
    } finally {
      setStatusHistoryLoading(false);
    }
  };

  // Close status history modal
  const handleCloseStatusHistory = () => {
    setShowStatusHistoryDialog(false);
    setSelectedStudent(null);
    setStatusHistory([]);
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
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              <Users className="w-4 h-4 mr-2" />
              {allIncidents.filter((i) => i.affects_status).length} Status Affected
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
          onViewStatusHistory={handleViewStatusHistory}
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
          onActionChange={handleActionChange}
          isEditing={isEditing}
          loading={formLoading}
          actionStatusMappings={actionStatusMappings}
        />
        
        {/* Status History Dialog */}
        <StatusHistoryDialog
          show={showStatusHistoryDialog}
          onClose={handleCloseStatusHistory}
          studentData={selectedStudent}
          statusHistory={statusHistory}
          loading={statusHistoryLoading}
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

    // If no token exists, redirect to login
    if (!token) {
      return redirect("/");
    }
  
    const tokenUrl = "http://localhost:5010/api/auth/verify-token";

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