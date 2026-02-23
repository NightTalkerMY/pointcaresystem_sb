// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePCSMachines } from "../hooks/usePCSMachines"; 
import PageTransition from "../components/PageTransition"; 

export default function Dashboard() {
  const { machines, loading } = usePCSMachines();
  const navigate = useNavigate();

  if (loading) return <div className="p-10 text-white">Loading Fleet...</div>;

  return (
    <PageTransition mode="left">
      <div className="page-container" style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/*  HEADER  */}
        <div style={{ marginBottom: "40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            
            {/* LOGO SECTION */}
            <div style={{ 
              width: "60px", height: "60px", background: "white", borderRadius: "12px", 
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)", overflow: "hidden" 
            }}>
                <img 
                    src="/logo.png" 
                    alt="PCS Logo" 
                    style={{ width: "100%", height: "100%", objectFit: "contain", padding: "5px" }}
                    onError={(e) => {
                        e.target.style.display = 'none'; 
                    }}
                />
            </div>

            <div>
              <h1 style={{ margin: 0, fontSize: "1.8rem", color: "#ffffff" }}>PCS Admin Portal</h1>
              <p style={{ margin: "5px 0 0 0", color: "#cbd5e1" }}>
                Active Machines: <strong>{machines.length}</strong>
              </p>
            </div>
          </div>

        </div>

        {/*  DATA TABLE  */}
        <div className="pcs-card table-container" style={{ padding: 0, overflow: "hidden", background: "white", borderRadius: "12px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <tr>
                <th style={{ padding: "16px", fontWeight: "600", color: "#475569" }}>Machine ID</th>
                <th style={{ padding: "16px", fontWeight: "600", color: "#475569" }}>Logged-in Patients</th>
                <th style={{ padding: "16px", fontWeight: "600", color: "#475569" }}>Connectivity</th>
                <th style={{ padding: "16px", fontWeight: "600", color: "#475569" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((machine) => (
                <tr key={machine.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ 
                          width: "36px", height: "36px", 
                          background: "#eff6ff", borderRadius: "8px", 
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#2563eb", fontWeight: "bold", fontSize: "0.9rem"
                      }}>
                        {machine.id.substring(4, 6) || "00"}
                      </div>
                      <div style={{ fontWeight: "700", color: "#334155" }}>{machine.id}</div>
                    </div>
                  </td>
                  
                  <td style={{ padding: "16px" }}>
                    {machine.activeUserNames && machine.activeUserNames.length > 0 ? (
                      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                        {machine.activeUserNames.map((name, idx) => (
                          <span key={idx} style={{ 
                            background: "#dbeafe", color: "#1e40af", 
                            padding: "4px 8px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "600" 
                          }}>
                            {name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Idle (No Users)</span>
                    )}
                  </td>

                  <td style={{ padding: "16px" }}>
                    <StatusBadge lastSeen={machine.lastSeen} />
                  </td>

                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button 
                            onClick={() => navigate(`/machine/${machine.id}`)} 
                            className="btn-primary" 
                            style={{ padding: "6px 12px", fontSize: "0.85em" }}
                        >
                          Manage
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {machines.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
              No machines found.
            </div>
          )}
        </div>


      </div>
    </PageTransition>
  );
}

function StatusBadge({ lastSeen }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = React.useMemo(() => {
    if (!lastSeen) return false;
    let date;
    if (typeof lastSeen.toDate === 'function') {
      date = lastSeen.toDate();
    } else {
      date = new Date(lastSeen);
    }
    if (isNaN(date.getTime())) return false;
    const diffSeconds = (now - date) / 1000;
    return diffSeconds < 55; // give leeway of 5 second for firebase to respond
  }, [lastSeen, now]);

  return (
    <span className={`badge ${isOnline ? "online" : "offline"}`}>
      {isOnline ? "● Online" : "○ Offline"}
    </span>
  );
}