import React, { useState } from "react";
import { Package, ShoppingCart, AlertCircle, Plus } from "lucide-react";
import AssetsList from "../components/assetList";
import InventoryList from "../components/inventoryList";
import { useStore } from "../store/store";
import Navbar from "../components/navbar";
import { useEffect } from "react";
import { redirect } from "react-router-dom";

const InventoryManagement = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState("assets");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { updateActiveModule, activeModule } = useStore();

  useEffect(() => {
    updateActiveModule("inventory");
  }, [activeModule]);

  return (
    <Navbar>
      <div className="p-6 space-y-6 bg-white rounded-lg shadow-sm m-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Inventory & Asset Management
          </h1>
          <div className="flex gap-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              <Package className="w-4 h-4 mr-2" />
              Total Assets
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              <AlertCircle className="w-4 h-4 mr-2" />
              Maintenance Required
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Low Stock Items
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "assets"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("assets")}
            >
              Assets
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "inventory"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("inventory")}
            >
              Inventory
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="mt-6">
          {activeTab === "assets" ? <AssetsList /> : <InventoryList />}
        </div>
      </div>
    </Navbar>
  );
};

export default InventoryManagement;

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
