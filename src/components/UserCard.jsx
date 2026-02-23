// src/components/UserCard.jsx
import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef, useMemo } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useDeviceData } from "../hooks/useDeviceData";
import { HeartIcon, OxygenIcon, TempIcon, StressIcon, BPIcon, HRVIcon, StepsIcon, SleepIcon } from "./AnimatedIcons";

//  STATIC STYLES 
const styles = {
  cardShell: {
    position: "relative",
    background: "white", borderRadius: "12px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0",
    overflow: "hidden", display: "flex", flexDirection: "column" 
  },
  cardBody: {
    display: "flex", flexWrap: "wrap", width: "100%", flex: 1
  },
  cardFooter: {
    background: "#f8fafc", padding: "15px 20px", borderTop: "1px solid #e2e8f0",
    display: "flex", alignItems: "center", gap: "15px"
  },
  colIdentity: { 
    flex: "0 0 240px", padding: "20px", borderRight: "1px solid #e2e8f0", 
    display: "flex", flexDirection: "column", justifyContent: "center", gap: "15px" 
  },
  colVitals: { 
    flex: "1", padding: "20px", borderRight: "1px solid #e2e8f0", minWidth: "350px" 
  }, 
  colActions: { 
    flex: "0 0 300px", padding: "20px", background: "#fff", 
    display: "flex", flexDirection: "column"
  },
  sectionTitle: { 
    fontSize: "0.7rem", color: "#94a3b8", fontWeight: "700", 
    textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px", 
    display: "flex", justifyContent: "space-between", alignItems: "center" 
  }
};

export default function UserCard({ user, pcsId, inventory = [] }) {
  const deviceStats = useDeviceData(user);
  const toastRef = useRef();

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isEditingDosage, setIsEditingDosage] = useState(false);
  const [tempDosage, setTempDosage] = useState(user.dosageConfig || {});

  //  DATA SYNC & SORTING 
  useEffect(() => {
    if (!isEditingDosage) {
        setTempDosage(user.dosageConfig || {});
    }
  }, [user.dosageConfig, isEditingDosage]);

  const sortedInventory = useMemo(() => {
      return [...inventory].sort((a, b) => 
          (a.liquidName || "").localeCompare(b.liquidName || "")
      );
  }, [inventory]);

  //  HELPERS 
  const getLiquidName = (compId) => {
    const tank = inventory.find(t => t.id === compId);
    return tank ? tank.liquidName : compId; 
  };

  const formatTime = (timestamp) => {
      if (!timestamp) return "Never";
      let dateObj;
      if (timestamp && typeof timestamp.toDate === 'function') dateObj = timestamp.toDate();
      else if (timestamp instanceof Date) dateObj = timestamp;
      else dateObj = new Date(timestamp);
      
      if (isNaN(dateObj.getTime())) return "Invalid Date";
      return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
  };

  const calculateSleep = (sleepData) => {
      if (!sleepData) return { total: "--", deep: 0, rem: 0, light: 0 };
      const deep = sleepData.Deep || 0;
      const rem = sleepData.REM || 0;
      const light = sleepData.Light || 0;
      const nap = sleepData.Nap || 0;
      const totalMins = deep + rem + light + nap;
      return { 
          total: (totalMins / 60).toFixed(1) + " hours", 
          deep: deep + " mins", 
          rem: rem + " mins", 
          light: light + " mins" 
      };
  };

// Helper to get ISO string with offset (e.g. 2024-01-05T16:00:00+08:00)
const getMalaysiaTimeISO = () => {
    const now = new Date();
    const offset = 8 * 60; // Malaysia is UTC+8
    const localTime = new Date(now.getTime() + offset * 60 * 1000);
    return localTime.toISOString().replace("Z", "+08:00");
};

  //  ACTIONS 
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setIsSending(true);
    try {
        const userRef = doc(db, "users", user.firestoreId);      
      // FIX: Removed userName and wearableDeviceId to prevent redundancy
        await updateDoc(userRef, {
            messages: {
                text: message,
                receivedAt: getMalaysiaTimeISO() // Use this instead of new Date().toISOString()
            }
        });
      
      if (toastRef.current) toastRef.current.show("Advice sent to patient", "success");
      setMessage("");
    } catch (e) {
      if (toastRef.current) toastRef.current.show("Failed: " + e.message, "error");
    }
    setIsSending(false);
  };

  const handleSaveDosage = async () => {
    try {
        const userRef = doc(db, "users", user.firestoreId);
        const cleanConfig = {};
        Object.entries(tempDosage).forEach(([key, val]) => {
            const num = Number(val);
            if (num >= 0) cleanConfig[key] = num;
        });
        await updateDoc(userRef, { dosageConfig: cleanConfig });
        
        if (toastRef.current) toastRef.current.show("Prescription updated", "success");
        setIsEditingDosage(false);
    } catch (e) {
        if (toastRef.current) toastRef.current.show("Save failed: " + e.message, "error");
    }
  };

  const stats = deviceStats || {};
  const hasData = !!deviceStats;
  const sleepInfo = calculateSleep(stats.sleep);
  const deviceId = user.wearableDeviceId || "No Device";
  const isLinked = !!user.wearableDeviceId;

  return (
    <div style={styles.cardShell}>
      
      {/* 1. MAIN CONTENT BODY */}
      <div style={styles.cardBody}>

            {/* COL 1: IDENTITY */}
            <div style={styles.colIdentity}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {/* Profile Avatar */}
                    <div style={{ 
                        width: "54px", height: "54px", 
                        background: "#eff6ff", color: "#2563eb", 
                        borderRadius: "14px", fontSize: "1.4rem", 
                        fontWeight: "bold", display: "flex", 
                        alignItems: "center", justifyContent: "center",
                        border: "1px solid #dbeafe"
                    }}>
                        {user.userName ? user.userName.charAt(0).toUpperCase() : "?"}
                    </div>
                    
                    <div>
                        <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>Patient Name</div>
                        <div style={{ fontWeight: "800", color: "#1e293b", fontSize: "1.2rem", lineHeight: "1.1" }}>
                            {user.userName || "Unknown Patient"}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "4px" }}>
                            <span style={{ fontWeight: "600" }}>ID:</span> <span style={{ fontFamily: "monospace" }}>{user.firestoreId.slice(0, 8)}...</span>
                        </div>
                    </div>
                </div>

                <div style={{ 
                    background: "#f8fafc", 
                    borderRadius: "10px", 
                    border: "1px solid #e2e8f0", 
                    padding: "12px",
                    marginTop: "5px"
                }}>
                    <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px", display: "block" }}>
                        Wearable Device
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <div style={{ 
                            padding: "4px 8px", 
                            background: isLinked ? "#dcfce7" : "#f1f5f9", 
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                        }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: isLinked ? "#22c55e" : "#cbd5e1" }}></span>
                            <span style={{ fontSize: "0.75rem", color: isLinked ? "#166534" : "#64748b", fontWeight: "700", fontFamily: "monospace" }}>
                                {isLinked ? deviceId.slice(0, 12) + "..." : "Unlinked"}
                            </span>
                        </div>
                    </div>

                    <div style={{ 
                        fontSize: "0.75rem", 
                        color: hasData ? "#475569" : "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                    }}>
                        <span style={{ opacity: 0.8 }}>🕒</span>
                        <span>{hasData ? `Last Sync: ${formatTime(stats.lastSyncTime)}` : "Never Synced"}</span>
                    </div>
                </div>
            </div>

            {/* COL 2: DAILY AVERAGES */}
            <div style={styles.colVitals}>
                <div style={styles.sectionTitle}><span>Daily Health Averages</span></div>
                {hasData ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        
                            {/* 4-Column Grid for Primary Vitals */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
                                <StatCard icon={<HeartIcon />} label="Heart Rate" value={stats.avgHeartRate} unit="bpm" color="#ef4444" />
                                <StatCard icon={<OxygenIcon />} label="Blood Oxygen" value={stats.avgBloodOxygen} unit="%" color="#3b82f6" />
                                <StatCard icon={<TempIcon />} label="Temperature" value={stats.avgTemperature?.toFixed(1)} unit="°C" color="#f59e0b" />
                                <StatCard icon={<StressIcon />} label="Stress Level" value={stats.avgStress} unit="/100" color="#8b5cf6" />
                            </div>

                            {/* 3-Column Grid for Secondary Vitals */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                                <StatCard 
                                    icon={<BPIcon />} 
                                    label="Blood Pressure" 
                                    value={`${stats.avgBloodPressureHigh}/${stats.avgBloodPressureLow}`} 
                                    unit="mmHg" 
                                    color="#64748b" // Slate/Grey for medical gear
                                />
                                <StatCard 
                                    icon={<HRVIcon />} 
                                    label="HR Variability" 
                                    value={stats.avgHRV} 
                                    unit="ms" 
                                    color="#10b981" // Green to match your HRVIcon stroke
                                />
                                <StatCard 
                                    icon={<StepsIcon />} 
                                    label="Step Count" 
                                    value={stats.totalSteps} 
                                    unit="steps" 
                                    color="#f97316" // Orange to match your StepsIcon fill
                                />
                            </div>

                            {/* Sleep Section Update */}
                            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                                    {/* Replace with SleepIcon */}
                                    <SleepIcon />
                                    <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sleep Analysis</span>
                                </div>
                            
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                                <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#1e293b", lineHeight: "1" }}>
                                    {sleepInfo.total}
                                </div>
                                <div style={{ display: "flex", gap: "12px", fontSize: "0.85rem", color: "#64748b", fontWeight: "500" }}>
                                    <span>Deep: <b style={{ color: "#1e293b" }}>{sleepInfo.deep}</b></span>
                                    <span style={{ opacity: 0.3 }}>|</span>
                                    <span>REM: <b style={{ color: "#1e293b" }}>{sleepInfo.rem}</b></span>
                                    <span style={{ opacity: 0.3 }}>|</span>
                                    <span>Light: <b style={{ color: "#1e293b" }}>{sleepInfo.light}</b></span>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                ) : (
                    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", border: "2px dashed #e2e8f0", borderRadius: "8px", color: "#cbd5e1" }}>
                        <div style={{ fontSize: "1.5rem", marginBottom: "5px" }}>📉</div>
                        <div>No daily data synced yet</div>
                    </div>
                )}
            </div>

          {/* COL 3: PRESCRIPTION ONLY */}
          <div style={styles.colActions}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={styles.sectionTitle}>
                      <span>Prescription Plan</span>
                      <button onClick={() => isEditingDosage ? setIsEditingDosage(false) : setIsEditingDosage(true)} style={{ color: "#3b82f6", background: "none", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "0.75rem" }}>
                          {isEditingDosage ? "Cancel" : "Edit"}
                      </button>
                  </div>
                  <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "10px", border: "1px solid #f1f5f9", flex: 1, overflowY: "auto" }}>
                      
                      {/* VIEW MODE */}
                      {!isEditingDosage && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {sortedInventory.length > 0 ? (
                                  sortedInventory.map((tank) => {
                                      const amount = user.dosageConfig && user.dosageConfig[tank.id] ? user.dosageConfig[tank.id] : 0;
                                      const isZero = amount === 0;
                                      return (
                                          <div key={tank.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderBottom: "1px dashed #e2e8f0", paddingBottom: "4px" }}>
                                              <span style={{ color: isZero ? "#94a3b8" : "#334155", fontWeight: isZero ? "400" : "500" }}>
                                                  {tank.liquidName}
                                              </span>
                                              <span style={{ fontWeight: "700", color: isZero ? "#cbd5e1" : "#3b82f6" }}>
                                                  {amount} ml
                                              </span>
                                          </div>
                                      );
                                  })
                              ) : (
                                  <div style={{ fontSize: "0.85rem", color: "#94a3b8", fontStyle: "italic", textAlign: "center", padding: "10px" }}>Inventory empty.</div>
                              )}
                          </div>
                      )}

                      {/* EDIT MODE */}
                      {isEditingDosage && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              {sortedInventory.map((tank) => (
                                  <div key={tank.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.9rem" }}>
                                      <span style={{ fontWeight: "500", color: "#1e293b" }}>{tank.liquidName || tank.id}</span>
                                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                          <input 
                                            type="number" min="0" placeholder="0" 
                                            value={tempDosage[tank.id] || ""} 
                                            onChange={(e) => setTempDosage({ ...tempDosage, [tank.id]: e.target.value })} 
                                            style={{ width: "50px", padding: "4px", borderRadius: "4px", border: "1px solid #cbd5e1", textAlign: "right" }} 
                                          />
                                          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>ml</span>
                                      </div>
                                  </div>
                              ))}
                              <button onClick={handleSaveDosage} style={{ width: "100%", marginTop: "10px", background: "#16a34a", color: "white", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Save Changes</button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </div>

      {/* 2. FULL WIDTH FOOTER (Communication) */}
      <div style={styles.cardFooter}>
          <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#64748b", whiteSpace: "nowrap" }}>
              DOCTOR'S ADVICE:
          </div>
          <input 
              type="text" 
              placeholder="Type medical instructions or daily advice..." 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              style={{ flex: 1, padding: "10px 15px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem", outline: "none" }} 
          />
          <button 
              onClick={handleSendMessage} 
              disabled={isSending || !message} 
              style={{ background: isSending ? "#94a3b8" : "#3b82f6", color: "white", border: "none", borderRadius: "6px", padding: "10px 20px", cursor: isSending ? "wait" : "pointer", fontWeight: "600", fontSize: "0.9rem" }}
          >
              Send Advice
          </button>
      </div>

      <ToastContainer ref={toastRef} />
    </div>
  );
}

//  SUB-COMPONENTS 
const ToastContainer = forwardRef((props, ref) => {
    const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
    const timerRef = useRef(null);

    useImperativeHandle(ref, () => ({
        show: (msg, type = "success") => {
            if (timerRef.current) clearTimeout(timerRef.current);
            setToast({ show: true, msg, type });
            timerRef.current = setTimeout(() => {
                setToast(prev => ({ ...prev, show: false }));
            }, 3000);
        }
    }));

    const bgColor = toast.type === "error" ? "#fee2e2" : "#dcfce7";
    const textColor = toast.type === "error" ? "#b91c1c" : "#15803d";

    return (
        <div style={{
            position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)",
            background: bgColor, color: textColor, padding: "8px 16px", borderRadius: "30px",
            fontSize: "0.85rem", fontWeight: "600", zIndex: 99, 
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "6px",
            opacity: toast.show ? 1 : 0, visibility: toast.show ? "visible" : "hidden",
            transition: "all 0.3s ease-in-out", pointerEvents: toast.show ? "auto" : "none"
        }}>
            <span>{toast.type === "error" ? "⚠️" : "✅"}</span> {toast.msg}
        </div>
    );
});


function StatCard({ label, value, unit, color, icon }) {
    return (
        <div style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
        }}>
            {/* Header: Icon + Label */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                {/* Removed fontSize here so SVG scales naturally */}
                <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {label}
                </span>
            </div>
            
            {/* Value + Unit */}
            <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#1e293b", lineHeight: "1" }}>
                {value != null ? value : "--"} 
                <span style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: "600", marginLeft: "4px" }}>{unit}</span>
            </div>
            
            {/* Subtle Color Accent Line */}
            {color && (
                <div style={{ marginTop: "12px", height: "3px", width: "100%", background: color, borderRadius: "2px", opacity: 0.8 }}></div>
            )}
        </div>
    );
}