import React from "react";

function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4  border-2",
    md: "w-8 h-8  border-4",
    lg: "w-12 h-12  border-6",
    xl: "w-16 h-16  border-8",
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-purple-900 ${sizeClasses[size]}`}
      ></div>
    </div>
  );
}

export default LoadingSpinner;
