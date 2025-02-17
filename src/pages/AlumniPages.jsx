import React, { useState } from "react";
import { GraduationCap, Users } from "lucide-react";
import StudentsTable from "../components/studentsTable";
import AlumniAssociations from "../components/alumniAssociation";
import Navbar from "../components/navbar";
import { useStore } from "../store/store";
import { useEffect } from "react";

const AlumniManagement = () => {
  const [activeTab, setActiveTab] = useState("records");
  const { updateActiveModule, activeModule } = useStore();

  useEffect(() => {
    updateActiveModule("alumni");
  }, [activeModule]);

  return (
    <Navbar>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Alumni & Records Management
        </h1>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("records")}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 ${
                activeTab === "records"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              Past Student Records
            </button>
            <button
              onClick={() => setActiveTab("associations")}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 ${
                activeTab === "associations"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Users className="h-4 w-4" />
              Alumni Associations
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "records" ? <StudentsTable /> : <AlumniAssociations />}
      </div>
    </Navbar>
  );
};

export default AlumniManagement;
