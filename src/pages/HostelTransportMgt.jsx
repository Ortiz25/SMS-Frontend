import React, { useState } from "react";
import { Home, Bus, Users, MapPin } from "lucide-react";
import HostelSection from "../components/hostelSection";
import TransportSection from "../components/transportSection";
import Navbar from "../components/navbar";
import { useStore } from "../store/store";
import { useEffect } from "react";

const HostelTransportManagement = () => {
  const [activeTab, setActiveTab] = useState("hostel");
  const { updateActiveModule, activeModule } = useStore();
  
    useEffect(() => {
      updateActiveModule("transport");
    }, [activeModule]);
  
  

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
              150 Hostelers
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <Bus className="w-4 h-4 mr-2" />
              12 Buses
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
          {activeTab === "hostel" ? <HostelSection /> : <TransportSection />}
        </div>
      </div>
    </Navbar>
  );
};

export default HostelTransportManagement;
