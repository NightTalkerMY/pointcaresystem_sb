// src/hooks/usePCSMachines.js
import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore"; 
import { db } from "../services/firebase"; 

export function usePCSMachines() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reference the top-level PCS collection
    const pcsCollection = collection(db, "PCS");

    const unsubscribe = onSnapshot(pcsCollection, (snapshot) => {
      const machineList = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // HELPER: Convert activeUsers Map {"id": "Name"} -> Array ["Name", "Name"]
        // This makes it easy to display badges on the dashboard card
        const activeUserNames = data.activeUsers 
          ? Object.values(data.activeUsers) 
          : [];

        return {
          id: doc.id,
          lastSeen: data.lastSeen,     // Heartbeat
          activeUserNames: activeUserNames, 
        };
      });

      setMachines(machineList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { machines, loading };
}