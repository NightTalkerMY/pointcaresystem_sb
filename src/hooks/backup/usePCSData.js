// src/hooks/usePCSData.js
import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { doc, collection, onSnapshot } from "firebase/firestore";

export const usePCSData = (pcsId) => {
  const [machineData, setMachineData] = useState(null); // Root info (lastSeen)
  const [inventory, setInventory] = useState([]);       // config/ subcollection
  const [users, setUsers] = useState([]);               // users/ subcollection
  const [state, setState] = useState({ health: {}, operation: {} }); // state/
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pcsId) return;

    // Root Document Listener
    const unsubPCS = onSnapshot(doc(db, "PCS", pcsId), (doc) => {
      setMachineData(doc.data());
    });

    // Config Listener (Tanks)
    const unsubConfig = onSnapshot(collection(db, "PCS", pcsId, "config"), (snapshot) => {
      const tanks = snapshot.docs.map((doc) => ({
        id: doc.id,   // e.g. "comp_1"
        ...doc.data()
      }));
      // Sort them so comp_1 is always first
      setInventory(tanks.sort((a, b) => a.id.localeCompare(b.id)));
    });

    // Users Listener
    const unsubUsers = onSnapshot(collection(db, "PCS", pcsId, "users"), (snapshot) => {
      const userList = snapshot.docs.map((doc) => ({
        firestoreId: doc.id, 
        ...doc.data()
      }));
      setUsers(userList);
    });

    // State Listener (Health & Operation)
    const unsubState = onSnapshot(collection(db, "PCS", pcsId, "state"), (snapshot) => {
      const stateObj = { health: {}, operation: {} };
      snapshot.docs.forEach((doc) => {
        if (doc.id === "health") stateObj.health = doc.data();
        if (doc.id === "operation") stateObj.operation = doc.data();
      });
      setState(stateObj);
    });

    setLoading(false);

    return () => {
      unsubPCS();
      unsubConfig();
      unsubUsers();
      unsubState();
    };
  }, [pcsId]);

  return { machineData, inventory, users, state, loading };
};