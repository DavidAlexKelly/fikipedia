// src/components/common/Card.jsx
import React from 'react';

/**
 * Reusable Card component
 */
const Card = ({ 
  children, 
  title, 
  className = '', 
  headerClassName = '',
  bodyClassName = '',
  footerContent,
  footerClassName = ''
}) => {
  return (
    <div className={`bg-white border border-gray-300 rounded overflow-hidden ${className}`}>
      {title && (
        <div className={`px-4 py-3 bg-gray-50 border-b border-gray-300 ${headerClassName}`}>
          {typeof title === 'string' ? (
            <h3 className="text-lg font-medium">{title}</h3>
          ) : (
            title
          )}
        </div>
      )}
      
      <div className={`p-4 ${bodyClassName}`}>
        {children}
      </div>
      
      {footerContent && (
        <div className={`px-4 py-3 bg-gray-50 border-t border-gray-300 ${footerClassName}`}>
          {footerContent}
        </div>
      )}
    </div>
  );
};

export default Card;