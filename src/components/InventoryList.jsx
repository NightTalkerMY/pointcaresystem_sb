// src/components/InventoryList.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function InventoryList({ tanks = [] }) {
  const { id: pcsId } = useParams(); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    docId: "", 
    liquidName: "",
    capacityMl: 500,
    currentInventoryMl: 0,
    enabled: true
  });

  const openEditModal = (tank) => {
    setFormData({
      docId: tank.id, 
      liquidName: tank.liquidName || "",
      capacityMl: tank.capacityMl || 500,
      currentInventoryMl: tank.currentInventoryMl || 0,
      enabled: tank.enabled ?? true
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const docRef = doc(db, "PCS", pcsId, "config", formData.docId);
      await updateDoc(docRef, {
        liquidName: formData.liquidName,
        capacityMl: Number(formData.capacityMl),
        currentInventoryMl: Number(formData.currentInventoryMl),
        enabled: formData.enabled
      });
      setIsModalOpen(false); 
    } catch (err) {
      alert("Error updating: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getPercentage = (current, capacity) => {
    if (!capacity || capacity === 0) return 0;
    const pct = Math.floor((current / capacity) * 100);
    return pct > 100 ? 100 : pct;
  };

  return (
    <div>
       {/* 1. SEAMLESS WAVE ANIMATION */}
       <style>
        {`
          @keyframes wave-move {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); } 
          }
        `}
       </style>

       {/* GRID LAYOUT */}
       <div style={{ 
           display: "grid", 
           gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
           gap: "20px" 
       }}>
         {tanks.map((tank) => {
           const pct = getPercentage(tank.currentInventoryMl, tank.capacityMl);
           
           return (
             <div key={tank.id} style={{ 
                border: "1px solid #e2e8f0", borderRadius: "16px", padding: "25px 20px", 
                background: tank.enabled ? "white" : "#f8fafc",
                opacity: tank.enabled ? 1 : 0.7,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                display: "flex", flexDirection: "column", alignItems: "center",
                position: "relative"
             }}>
                
                <button 
                    onClick={() => openEditModal(tank)}
                    style={{ 
                        position: "absolute", top: "12px", right: "12px",
                        background: "none", border: "none", cursor: "pointer", 
                        fontSize: "1.1rem", opacity: 0.4, transition: "opacity 0.2s", zIndex: 10
                    }} 
                    title="Configure"
                    onMouseOver={(e) => e.target.style.opacity = 1}
                    onMouseOut={(e) => e.target.style.opacity = 0.4}
                >
                    ⚙️
                </button>

                <VerticalTank pct={pct} />

                <div style={{ marginTop: "18px", textAlign: "center", width: "100%" }}>
                    <div style={{ fontWeight: "700", color: "#334155", fontSize: "1.1rem", marginBottom: "6px" }}>
                        {tank.liquidName || "Unassigned"}
                    </div>
                    
                    {!tank.enabled && (
                        <div style={{ 
                            fontSize: "0.75rem", color: "#64748b", fontWeight: "700", 
                            background: "#e2e8f0", padding: "2px 8px", borderRadius: "4px",
                            display: "inline-block", marginBottom: "8px"
                        }}>
                            Disabled
                        </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "center", gap: "8px", alignItems: "baseline" }}>
                        <span style={{ fontSize: "1.2rem", fontWeight: "700", color: "#3b82f6" }}>{pct}%</span>
                        {/* Darkened "filled" text to #64748b */}
                        <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "500" }}>filled</span>
                    </div>

                    {/* Darkened ml text to #64748b, slightly bumped font size to 0.85rem, added fontWeight */}
                    <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "4px", fontFamily: "monospace", fontWeight: "600" }}>
                        {tank.currentInventoryMl} / {tank.capacityMl} ml
                    </div>
                </div>

             </div>
           );
         })}

         {tanks.length === 0 && (
             <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "#cbd5e1", border: "2px dashed #e2e8f0", borderRadius: "10px" }}>
                 No hardware configuration found.
             </div>
         )}
       </div>

       {/* MODAL (Edit Only) */}
       {isModalOpen && (
           <div style={{
               position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
               background: "rgba(0,0,0,0.5)", zIndex: 1000,
               display: "flex", alignItems: "center", justifyContent: "center",
               backdropFilter: "blur(2px)" 
           }}>
               <div style={{ background: "white", padding: "25px", borderRadius: "12px", width: "90%", maxWidth: "400px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
                   <h3 style={{ margin: "0 0 5px 0", color: "#1e293b" }}>Configure Tank</h3>
                   <p style={{ margin: "0 0 20px 0", fontSize: "0.9rem", color: "#64748b", fontFamily: "monospace" }}>Target ID: {formData.docId}</p>
                   
                   <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                       <div>
                           <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "5px", color: "#64748b" }}>Liquid Name</label>
                           <input type="text" required disabled={isSaving} value={formData.liquidName} onChange={(e) => setFormData({...formData, liquidName: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "1rem", boxSizing: "border-box" }} />
                       </div>
                       <div style={{ display: "flex", gap: "15px" }}>
                           <div style={{ flex: 1 }}>
                               <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "5px", color: "#64748b" }}>Max (ml)</label>
                               <input type="number" required min="0" disabled={isSaving} value={formData.capacityMl} onChange={(e) => setFormData({...formData, capacityMl: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "1rem", boxSizing: "border-box" }} />
                           </div>
                           <div style={{ flex: 1 }}>
                               <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "5px", color: "#64748b" }}>Current (ml)</label>
                               <input type="number" required min="0" disabled={isSaving} value={formData.currentInventoryMl} onChange={(e) => setFormData({...formData, currentInventoryMl: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "1rem", boxSizing: "border-box" }} />
                           </div>
                       </div>
                       <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid #e2e8f0" }}>
                           <input type="checkbox" id="enableCheck" disabled={isSaving} checked={formData.enabled} onChange={(e) => setFormData({...formData, enabled: e.target.checked})} style={{ width: "18px", height: "18px", cursor: "pointer" }} />
                           <label htmlFor="enableCheck" style={{ fontSize: "0.9rem", color: "#334155", cursor: "pointer", fontWeight: "500" }}>Enable Dispensing</label>
                       </div>
                       <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                           <button type="button" disabled={isSaving} onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: "12px", background: "white", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: isSaving ? "not-allowed" : "pointer", color: "#64748b", fontWeight: "600" }}>Cancel</button>
                           <button type="submit" disabled={isSaving} style={{ flex: 1, padding: "12px", background: isSaving ? "#93c5fd" : "#3b82f6", border: "none", borderRadius: "6px", cursor: isSaving ? "wait" : "pointer", color: "white", fontWeight: "bold" }}>{isSaving ? "Saving..." : "Save"}</button>
                       </div>
                   </form>
               </div>
           </div>
       )}
    </div>
  );
}

// --- FLAWLESS SINGLE-LAYER WAVE ---
function VerticalTank({ pct }) {
    let colorStart = "#3b82f6"; 
    let colorEnd = "#2563eb"; 
    
    if (pct < 10) { 
        colorStart = "#ef4444"; colorEnd = "#dc2626"; 
    } else if (pct < 50) {
        colorStart = "#f59e0b"; colorEnd = "#ea580c"; 
    }

    // THE CLEAN SVG PATH
    // Width: 200. Center line Y: 10.
    // Amplitude: 2px (Goes from 8 to 12).
    // Loop: x=0 matches x=100.
    const wavePath = "M 0 10 Q 25 8 50 10 Q 75 12 100 10 Q 125 8 150 10 Q 175 12 200 10 V 20 H 0 Z";

    return (
        <div style={{
            position: "relative",
            width: "80px", 
            height: "150px",
            background: "#f1f5f9", 
            borderRadius: "40px", 
            border: "4px solid white", 
            boxShadow: "0 0 0 1px #cbd5e1, inset 0 0 20px rgba(0,0,0,0.05)",
            overflow: "hidden", 
            transform: "translateZ(0)"
        }}>
            
            {/* LIQUID CONTAINER */}
            <div style={{
                position: "absolute",
                bottom: 0, left: 0, right: 0,
                // height is percentage + slight buffer for wave
                height: `calc(${pct}% + 5px)`, 
                transition: "height 0.8s ease-out", 
                minHeight: pct > 0 ? "5px" : "0px",
            }}>
                
                {/* 1. THE WAVE CAP (Top of liquid) */}
                <div style={{
                    position: "absolute",
                    top: "-14px", // Sits perfectly on top
                    left: 0,
                    width: "200%", // Double width to allow sliding
                    height: "15px", // Match SVG height
                    animation: "wave-move 3s linear infinite",
                    fill: colorStart, // Matches the solid block below
                }}>
                    <svg viewBox="0 0 200 20" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                        <path d={wavePath} />
                    </svg>
                </div>

                {/* 2. THE SOLID BODY (Rest of liquid) */}
                <div style={{
                    width: "100%",
                    height: "100%", 
                    background: `linear-gradient(to bottom, ${colorStart}, ${colorEnd})`,
                    marginTop: "-1px" // Overlap slightly to seal gap
                }}></div>

            </div>

            {/* Glass Glare Overlay */}
            <div style={{
                position: "absolute", top: 0, bottom: 0, left: "20%", width: "15%",
                background: "linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0.4), rgba(255,255,255,0))",
                borderRadius: "20px",
                pointerEvents: "none",
                zIndex: 10
            }}></div>
            
        </div>
    );
}