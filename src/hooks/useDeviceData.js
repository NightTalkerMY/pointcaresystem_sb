// src/hooks/useDeviceData.js
import { useState, useEffect } from "react";

export function useDeviceData(user) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (user && user.device) {
      setData(user.device);
    } else {
      setData(null);
    }
  }, [user]);

  return data;
}