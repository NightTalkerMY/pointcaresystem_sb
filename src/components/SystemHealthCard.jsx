// src/components/SystemHealthCard.jsx
import React from "react";

export default function SystemHealthCard({ state, users = [], isOnline = false }) {
  // Read fields from the merged systemState object
  const { errorState, lastReboot, lastDispenseUserID, lastDispenseStatus } = state || {};
  
  // Safety: If errorState is undefined (loading), assume normal (true) to prevent scary red alerts
  const isHardwareNormal = errorState === undefined ? true : Number(errorState) === 0;

  // Helpers
  const formatDate = (val) => {
    if (!val) return "N/A";
    const d = typeof val.toDate === 'function' ? val.toDate() : new Date(val);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getLastDispenseUser = () => {
  if (!lastDispenseUserID) return "--";

  const targetId = String(lastDispenseUserID);
  const u = users.find(u => String(u.firestoreId) === targetId);
  console.log("lastDispenseUserID:", lastDispenseUserID);
  console.log("users:", users);

  return u?.userName || u?.username || u?.name || targetId;
  };

  // Theme Logic
  let theme = { color: "#0ea5e9", bg: "linear-gradient(to right, #f0f9ff, #ffffff)", text: "DIAGNOSTICS OK" };
  if (!isOnline) theme = { color: "#94a3b8", bg: "#f8fafc", text: "CONNECTION LOST" };
  else if (!isHardwareNormal) theme = { color: "#ef4444", bg: "#fef2f2", text: "HARDWARE FAULT" };

  return (
    <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", overflow: "hidden", border: isOnline ? "1px solid #e2e8f0" : "1px dashed #cbd5e1", opacity: isOnline ? 1 : 0.8 }}>
      
      {/* HEADER */}
      <div style={{ background: theme.bg, padding: "20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ width: "20px", height: "20px", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: theme.color, zIndex: 2 }}></div>
                {isOnline && <div style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", background: theme.color, opacity: 0.4, animation: "pulse-ring 2s infinite" }}></div>}
            </div>
            <div>
                <div style={{ fontSize: "1.1rem", fontWeight: "800", color: theme.color }}>{theme.text}</div>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    {!isOnline ? "Displaying last known state" : isHardwareNormal ? "All sensors active" : `Error Code: ${errorState}`}
                </div>
            </div>
        </div>
      </div>

      {/* GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ padding: "20px", borderRight: "1px solid #f1f5f9" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Last Boot Sequence</span>
            <div style={{ fontSize: "0.95rem", color: "#1e293b", fontFamily: "monospace", marginTop: "5px" }}>{formatDate(lastReboot)}</div>
        </div>
        <div style={{ padding: "20px" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Dispense Mechanism</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "5px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: lastDispenseStatus === "success" ? "#10b981" : "#f59e0b" }}></span>
                <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "#334155" }}>{lastDispenseStatus?.toUpperCase() || "IDLE"}</span>
            </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ padding: "12px 20px", background: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Last Operator</span>
        <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>{getLastDispenseUser()}</span>
      </div>
      
      <style>{`@keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(2.5); opacity: 0; } }`}</style>
    </div>
  );
}