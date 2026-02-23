// src/pages/MachineDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMachineDetails } from "../hooks/useMachineDetails"; 
import PageTransition from "../components/PageTransition";
import InventoryList from "../components/InventoryList";
import UserCard from "../components/UserCard";

export default function MachineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { machineData, systemState, inventory, users, loading } = useMachineDetails(id);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(i);
  }, []);

  if (loading || !machineData) {
    return <div className="p-10 text-center" style={{ padding: "40px", color: "#94a3b8" }}>Loading System...</div>;
  }

  const getSafeDate = (val) => (!val ? null : (typeof val.toDate === 'function' ? val.toDate() : new Date(val)));
  const lastSeenDate = getSafeDate(machineData.lastHeartbeat || machineData.lastSeen);
  const isOnline = lastSeenDate ? (now - lastSeenDate) / 1000 < 55 : false;

  const { errorState, lastReboot, lastDispenseUserID, lastDispenseStatus } = systemState || {};
  const isHardwareNormal = errorState === undefined ? true : Number(errorState) === 0;

  const formatRebootDate = (val) => {
    if (!val) return "N/A";
    const d = typeof val.toDate === 'function' ? val.toDate() : new Date(val);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleString('en-GB', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', second: '2-digit' 
    });
  };

  const getLastDispenseUser = () => {
    if (!lastDispenseUserID) return "--";
    const targetId = String(lastDispenseUserID);
    const u = users.find(u => String(u.firestoreId) === targetId);
    return u?.userName || u?.username || u?.name || targetId;
  };

  const currentDispenseStatus = lastDispenseStatus?.toUpperCase() || "IDLE";
  const statusColor = currentDispenseStatus === "SUCCESS" ? "#15803d" : "#f59e0b";

  return (
    <PageTransition mode="right">
      <style>{`
        @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
        @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
        @keyframes content-enter { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
        .tab-content-anim { animation: content-enter 0.3s ease-out forwards; }
      `}</style>

      <div className="page-container" style={{ padding: "15px 30px", maxWidth: "1400px", margin: "0 auto" }}>
        
        <div style={{ marginBottom: "15px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <div>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "0.8rem", padding: 0, marginBottom: "8px", display: "block" }}>
              &larr; Back to Dashboard
            </button>
            
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: "700", color: "#ffffff", lineHeight: 1 }}>{machineData.unitName || id}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "12px", background: isOnline ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ 
                  width: "8px", 
                  height: "8px", 
                  borderRadius: "50%", 
                  background: isOnline ? "#22c55e" : "#ef4444",
                  animation: isOnline ? "pulse-green 2s infinite" : "pulse-red 2s infinite" 
                }}></div>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: isOnline ? "#4ade80" : "#f87171" }}>{isOnline ? "ONLINE" : "OFFLINE"}</span>
              </div>
            </div>
            
            <p style={{ color: "#cbd5e1", margin: "8px 0 0 0", fontSize: "0.85rem", fontWeight: "500", letterSpacing: "0.3px" }}>
              Last Seen: {lastSeenDate ? lastSeenDate.toLocaleString() : "Never"}
            </p>
          </div>
        </div>

        <div style={{ position: "relative", width: "100%", borderBottom: "1px solid #334155" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", width: "300px" }}>
            <button onClick={() => setActiveTab('overview')} style={{ padding: "12px 0", cursor: "pointer", background: "none", border: "none", color: activeTab === 'overview' ? "#ffffff" : "#94a3b8", fontWeight: "600", fontSize: "1rem", transition: "color 0.3s" }}>Overview</button>
            <button onClick={() => setActiveTab('users')} style={{ padding: "12px 0", cursor: "pointer", background: "none", border: "none", color: activeTab === 'users' ? "#ffffff" : "#94a3b8", fontWeight: activeTab === 'users' ? "600" : "500", fontSize: "1rem", transition: "color 0.3s" }}>Patients <span style={{ fontSize: "0.8em", opacity: 0.7, marginLeft: "4px" }}>({users.length})</span></button>
          </div>
          <div style={{ position: "absolute", bottom: "-1px", left: 0, width: "150px", height: "3px", background: "#3b82f6", transform: activeTab === 'overview' ? 'translateX(0)' : 'translateX(100%)', transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}></div>
        </div>

        <div key={activeTab} className="tab-content-anim" style={{ marginTop: "20px" }}>
          {activeTab === 'overview' && (
            <div className="pcs-card" style={{ 
              background: "white", 
              borderRadius: "16px", 
              overflow: "hidden", 
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              marginTop: "10px",
              border: "1px solid #e2e8f0"
            }}>
              
              <div style={{ 
                background: !isHardwareNormal ? "#fff1f2" : "#f1f5f9", 
                padding: "12px 24px", 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                borderBottom: `2px solid ${!isHardwareNormal ? "#fecaca" : "#e2e8f0"}`,
                transition: "all 0.3s ease"
              }}>
                <h2 style={{ fontSize: "0.8rem", color: !isHardwareNormal ? "#be123c" : "#475569", textTransform: "uppercase", letterSpacing: "1.2px", fontWeight: "800", margin: 0 }}>
                  System Parameters
                </h2>
                
                <div style={{ display: "flex", gap: "35px", alignItems: "center" }}>
                  {!isHardwareNormal && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "0.9rem", color: "#e11d48", fontWeight: "900", animation: "pulse-red 1.5s infinite" }}>
                        ⚠️ HARDWARE FAULT
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#be123c", background: "#ffe4e6", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
                        CODE: {errorState}
                      </span>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Last Boot:</span>
                    <span style={{ fontSize: "0.85rem", color: "#0f172a", fontWeight: "700" }}>
                      {formatRebootDate(lastReboot)}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Last Dispense:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: statusColor }}></span>
                      <span style={{ fontSize: "0.9rem", color: statusColor, fontWeight: "800" }}>
                        {currentDispenseStatus}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Last Operator:</span>
                    <span style={{ fontSize: "0.85rem", color: "#0f172a", fontWeight: "800", background: "#e2e8f0", padding: "2px 8px", borderRadius: "4px" }}>
                      {getLastDispenseUser()}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ padding: "24px" }}>
                <h2 style={{ fontSize: "0.8rem", color: "#475569", textTransform: "uppercase", letterSpacing: "1.2px", fontWeight: "800", margin: "0 0 20px 0" }}>
                  Liquid Inventory
                </h2>
                <InventoryList tanks={inventory} />
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
              {users.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8", background: "rgba(255,255,255,0.05)", borderRadius: "10px" }}>
                  No patients assigned.
                </div> 
              ) : (
                users.map(user => (
                  <UserCard key={user.firestoreId} user={user} pcsId={id} inventory={inventory} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}