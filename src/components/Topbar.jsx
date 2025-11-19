import React, { useState } from "react";

export default function Topbar({ pageTitle, onSearch, onRefresh }) {
  const [query, setQuery] = useState("");

  return (
    <div className="topbar">
      <div style={{ display: "flex", gap: 12, alignItems: "center", width: "100%" }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{pageTitle}</div>
        <div style={{ flex: 1 }}></div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="search">
            <input
              placeholder="Tìm kiếm... (Users, Events, Feedback, Flood Reports)"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button className="btn" onClick={() => onSearch(query)}>Tìm</button>
          </div>
          <button className="btn" onClick={onRefresh}>Làm mới</button>
        </div>
      </div>
    </div>
  );
}
