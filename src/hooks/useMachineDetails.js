// src/hooks/useMachineDetails.js
import { useState, useEffect } from "react";
import { doc, collection, onSnapshot, query, where, documentId } from "firebase/firestore";
import { db } from "../services/firebase";

export function useMachineDetails(id) {
  const [machineData, setMachineData] = useState(null);
  const [systemState, setSystemState] = useState({}); // Health + Operation merged
  const [inventory, setInventory] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    // MACHINE INFO (Root)
    const unsubMachine = onSnapshot(doc(db, "PCS", id), (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        setMachineData(data);

        // USERS (Join Operation)
        // If activeUsers exists, fetch those specific docs from root 'users'
        const activeIds = data.activeUsers ? Object.keys(data.activeUsers) : [];
        if (activeIds.length > 0) {
          const q = query(collection(db, "users"), where(documentId(), "in", activeIds));
          onSnapshot(q, (snap) => {
            const userList = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
            setUsers(userList);
          });
        } else {
          setUsers([]);
        }
      }
    });

    // INVENTORY (Subcollection)
    const unsubInventory = onSnapshot(collection(db, "PCS", id, "config"), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.liquidName || a.id).localeCompare(b.liquidName || b.id));
      setInventory(list);
    });

    // SYSTEM STATE (Subcollections: Health & Operation)
    const unsubHealth = onSnapshot(doc(db, "PCS", id, "state", "health"), (snap) => {
        if(snap.exists()) setSystemState(prev => ({ ...prev, ...snap.data() }));
    });
    const unsubOp = onSnapshot(doc(db, "PCS", id, "state", "operation"), (snap) => {
        if(snap.exists()) setSystemState(prev => ({ ...prev, ...snap.data() }));
    });

    setLoading(false);

    return () => {
      unsubMachine();
      unsubInventory();
      unsubHealth();
      unsubOp();
    };
  }, [id]);

  return { machineData, systemState, inventory, users, loading };
}