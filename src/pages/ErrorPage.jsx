import React from 'react';
import { AlertCircle, RefreshCw, Home, AlertTriangle } from 'lucide-react';
import Navbar from '../components/navbar';

const ErrorPage = ({ 
  errorCode = 404, 
  errorMessage = "Page Not Found", 
  supportMessage = "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.",
  onRetry = () => window.location.reload(),
  onHomeClick = () => window.location.href = '/'
}) => {
  return (
    <Navbar>
           <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-white shadow-xl rounded-xl p-8">
          <div className="flex justify-center mb-6">
            <AlertTriangle className="text-red-500 w-16 h-16" strokeWidth={1.5} />
          </div>
          
          <h1 className="text-6xl font-bold text-gray-800 mb-4">
            {errorCode}
          </h1>
          
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            {errorMessage}
          </h2>
          
          <p className="text-gray-500 mb-6">
            {supportMessage}
          </p>
          
          {/* <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="font-semibold">Error Details</span>
            </div>
            <p>
              Unable to load the requested page. Please try again or contact support.
            </p>
          </div>
           */}
          <div className="flex justify-between gap-4">
            <button 
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
            <button 
              onClick={onHomeClick}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
    </Navbar>
   
  );
};

export default ErrorPage;