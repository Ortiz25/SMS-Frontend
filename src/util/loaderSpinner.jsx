// components/ui/loadingSpinner.js
import React from "react";

const LoadingSpinner = ({ size = "md" }) => {
  // Size variants
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex justify-center items-center my-4">
      <div className={`${sizeClass} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`}></div>
    </div>
  );
};

export default LoadingSpinner;