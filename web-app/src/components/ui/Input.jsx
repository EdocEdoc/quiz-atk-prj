import { clsx } from "clsx";

import React from "react";

function Input({ className = "", size = "md", ...props }) {
  const baseClasses =
    "w-full border border-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white  ";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <input
      className={clsx(baseClasses, sizeClasses[size], className)}
      {...props}
    />
  );
}

export default Input;
