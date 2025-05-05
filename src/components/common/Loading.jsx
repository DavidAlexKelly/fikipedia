// src/components/common/Loading.jsx
import React from 'react';

/**
 * Reusable loading spinner component
 */
const Loading = ({ 
  size = 'md', 
  message = 'Loading...', 
  fullPage = false 
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const containerClasses = fullPage
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50'
    : 'flex flex-col items-center justify-center py-6';

  return (
    <div className={containerClasses}>
      <div className={`animate-spin rounded-full border-t-2 border-blue-500 ${sizeClasses[size]}`}></div>
      {message && <p className="mt-2 text-gray-600">{message}</p>}
    </div>
  );
};

export default Loading;