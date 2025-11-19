import React from "react";

export default function Panel({ children }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        marginBottom: "24px",
      }}
    >
      {children}
    </div>
  );
}
