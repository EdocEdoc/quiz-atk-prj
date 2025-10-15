import clsx from "clsx";
import React from "react";

function Card({ children, className = "", ...props }) {
  return (
    <div
      className={clsx(
        "bg-gray-800/60 border border-gray-700 rounded-lg shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
