// disciplinaryService.js
import axios from "axios";

const BASE_URL = "/backend/api";

const disciplinaryService = {
  // Get all disciplinary incidents
  getIncidents: async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${BASE_URL}/disciplinary/incidents`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Get incident by ID
  getIncidentById: async (id) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${BASE_URL}/disciplinary/incidents/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Create new incident
  createIncident: async (incidentData) => {
    const token = localStorage.getItem("token");

    // Transform form data to API format
    const apiData = {
      student_id: incidentData.student_id,
      student_name: incidentData.studentName,
      admission_number: incidentData.admissionNumber,
      grade: incidentData.grade,
      date: incidentData.date,
      type: incidentData.type,
      severity: incidentData.severity,
      description: incidentData.description,
      location: incidentData.location,
      witnesses: incidentData.witnesses,
      action: incidentData.action,
      status: incidentData.status,
      follow_up: incidentData.followUp,
      // Status change fields
      affects_status: incidentData.affectsStatus,
      status_change: incidentData.statusChange,
      effective_date: incidentData.effectiveDate,
      end_date: incidentData.endDate,
      auto_restore: incidentData.autoRestore,
    };

    const response = await axios.post(
      `${BASE_URL}/disciplinary/incidents`,
      apiData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  // Update existing incident
  updateIncident: async (id, incidentData) => {
    const token = localStorage.getItem("token");

    // Transform form data to API format
    const apiData = {
      student_id: incidentData.student_id,
      student_name: incidentData.studentName,
      admission_number: incidentData.admissionNumber,
      grade: incidentData.grade,
      date: incidentData.date,
      type: incidentData.type,
      severity: incidentData.severity,
      description: incidentData.description,
      location: incidentData.location,
      witnesses: incidentData.witnesses,
      action: incidentData.action,
      status: incidentData.status,
      follow_up: incidentData.followUp,
      // Status change fields
      affects_status: incidentData.affectsStatus,
      status_change: incidentData.statusChange,
      effective_date: incidentData.effectiveDate,
      end_date: incidentData.endDate,
      auto_restore: incidentData.autoRestore,
    };
    console.log(apiData)

    const response = await axios.put(
      `${BASE_URL}/disciplinary/incidents/${id}`,
      apiData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  // Delete incident
  deleteIncident: async (id) => {
    const token = localStorage.getItem("token");
    await axios.delete(`${BASE_URL}/disciplinary/incidents/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return true;
  },

  // Get disciplinary actions for an incident
  getDisciplinaryActions: async (incidentId) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${BASE_URL}/disciplinary/incidents/${incidentId}/actions`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Create disciplinary action
  createDisciplinaryAction: async (incidentId, actionData) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${BASE_URL}/disciplinary/incidents/${incidentId}/actions`,
      actionData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  // Get action to status mappings
  getActionStatusMappings: async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${BASE_URL}/disciplinary/action-status-mappings`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Get student status history

  // Get student status history
  getStudentStatusHistory: async (studentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/disciplinary/students/${studentId}/status-history`, // Add BASE_URL here
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add token here
          },
        }
      );

      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error(
        `Error fetching status history for student ${studentId}:`,
        error
      );
      // Return empty array as fallback
      return [];
    }
  },

  // Get incidents by student
  getIncidentsByStudent: async (studentId) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${BASE_URL}/disciplinary/students/${studentId}/incidents`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Get analytics data
  getDisciplinaryAnalytics: async (filters) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${BASE_URL}/disciplinary/analytics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: filters,
    });
    return response.data;
  },
};

export default disciplinaryService;
