import React, { useState, useEffect } from "react";
import { Home, Bus, Users, MapPin, Building, Check, X, Clock } from "lucide-react";
import HostelSection from "../components/hostelSection";
import TransportSection from "../components/transportSection";
import Navbar from "../components/navbar";
import { useStore } from "../store/store";
import { redirect } from "react-router-dom";

const HostelTransportManagement = () => {
  const token = localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("hostel");
  const { updateActiveModule } = useStore();
  const [stats, setStats] = useState({
    hostelers: 0,
    dormitories: 0,
    busRoutes: 0,
    transportUsers: 0
  });
  
  useEffect(() => {
    updateActiveModule("transport");
    
    // Fetch statistics data
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5010/api/hostel-transport/stats',{
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        
        if (data.success) {
          setStats({
            hostelers: data.stats.hostelers,
            dormitories: data.stats.dormitories,
            busRoutes: data.stats.busRoutes,
            transportUsers: data.stats.transportUsers
          });
        }
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      }
    };
    
    fetchStats();
  }, [updateActiveModule]);

  return (
    <Navbar>
      <div className="p-6 space-y-6 bg-white rounded-lg shadow-sm m-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Hostel & Transport Management
          </h1>
          <div className="flex gap-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <Home className="w-4 h-4 mr-2" />
              {stats.hostelers} Hostelers
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              <Building className="w-4 h-4 mr-2" />
              {stats.dormitories} Dormitories
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <Bus className="w-4 h-4 mr-2" />
              {stats.busRoutes} Routes
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
              <Users className="w-4 h-4 mr-2" />
              {stats.transportUsers} Transport Users
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "hostel"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("hostel")}
            >
              <div className="flex items-center">
                <Home className="w-4 h-4 mr-2" />
                Hostel Management
              </div>
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "transport"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("transport")}
            >
              <div className="flex items-center">
                <Bus className="w-4 h-4 mr-2" />
                Transport Management
              </div>
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="mt-6">
          {activeTab === "hostel" ? (
            <HostelSection />
          ) : (
            <TransportSection />
          )}
        </div>
      </div>
    </Navbar>
  );
};

export default HostelTransportManagement;

export async function loader({ params }) {
  try {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If no token exists, redirect to login\
   
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