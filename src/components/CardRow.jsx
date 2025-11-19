import React from "react";

export default function CardRow({ usersCount, eventsCount, apiStatus }) {
  return (
    <div className="card-row">
      <div className="card">
        <h3>Tổng users</h3>
        <div className="num">{usersCount ?? "—"}</div>
      </div>
      <div className="card">
        <h3>Sự kiện</h3>
        <div className="num">{eventsCount ?? "—"}</div>
      </div>
      <div className="card">
        <h3>API Status</h3>
        <div className="num">{apiStatus ?? "—"}</div>
      </div>
    </div>
  );
}
