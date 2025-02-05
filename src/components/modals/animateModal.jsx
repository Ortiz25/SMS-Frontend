import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

// Animated Modal Wrapper
const AnimatedModal = ({ isOpen, onClose, children }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  return (
    <div 
    className={`fixed inset-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
  >
    {/* Backdrop */}
    <div 
      className={`absolute inset-0 bg-black transition-opacity duration-300 ${
        isAnimating ? 'opacity-50' : 'opacity-0'
      }`}
      onClick={onClose}
    />
    
    {/* Modal Content */}
    <div className="flex items-center justify-center min-h-screen p-4">
      <div 
        className={`bg-white rounded-lg shadow-xl transition-all duration-300 transform 
          max-h-[90vh] overflow-y-auto
          w-[95%] sm:w-[85%] md:w-[75%] lg:w-[65%] xl:w-[55%]
          max-w-7xl mx-auto
          scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
          hover:scrollbar-thumb-gray-400 ${
          isAnimating 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
        }`}
        style={{
          '--scrollbar-width': '8px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgb(209 213 219) transparent',
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            width: var(--scrollbar-width);
          }
          
          div::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          
          div::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 4px;
          }
          
          div::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }
        `}</style>
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  </div>
  );
};

export default AnimatedModal