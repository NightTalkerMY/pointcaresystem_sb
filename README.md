# PCS Admin Portal - Developer Documentation

## 📖 Overview
The PCS Admin Portal is a real-time React dashboard built to monitor and manage physical dispensing hardware ("PCS" machines). It bridges the gap between IoT hardware, patient health metrics, and medical prescriptions. 

The application tracks hardware connectivity, physical liquid inventory (tanks), and real-time dispensing status. Additionally, it integrates with patient wearable data to display vital signs, sleep metrics, and allows administrators to adjust liquid dosages and send direct medical advice to patients.

## 🛠 Tech Stack
* **Frontend Framework:** React (via Vite)
* **Routing:** `react-router-dom`
* **Backend / Database:** Firebase Firestore (Real-time `onSnapshot` listeners)
* **Animations:** Framer Motion (Page transitions) & Custom CSS/SVG Keyframes
* **Styling:** Inline CSS with dynamic theme logic based on hardware state.

---

## 📂 Directory Structure

```text
src/
├── assets/                 # Static assets (e.g., logo.png)
├── components/             # Reusable UI components
│   ├── AnimatedIcons.jsx   # Custom CSS-animated SVGs for health vitals
│   ├── InventoryList.jsx   # Renders physical tanks with wave animations & config modals
│   ├── PageTransition.jsx  # Framer motion wrapper for route animations
│   ├── SystemHealthCard.jsx# Displays hardware diagnostics and last-boot info
│   └── UserCard.jsx        # Patient profiles, wearable data, and prescription editing
├── hooks/                  # Custom React hooks for Firebase data fetching
│   ├── backup/             # (Deprecated/Archived hooks)
│   ├── useDeviceData.js    # Extracts wearable stats from the user object
│   ├── useMachineDetails.js# Deep fetch: Machine, config, health/operation state, and users
│   └── usePCSMachines.js   # Shallow fetch: Fleet-wide machine list for the dashboard
├── pages/                  # Route-level components
│   ├── Dashboard.jsx       # Main fleet overview (Table view of all machines)
│   └── MachineDetail.jsx   # Specific machine view (Tabs for Overview & Patients)
└── services/
    └── firebase.js         # Firebase initialization via Vite env vars

```

---

## 🔌 Data Flow & Firebase Schema

This application relies heavily on **Firebase Firestore real-time listeners (`onSnapshot`)**. Data is not fetched once; it is synced continuously to reflect the live state of the physical hardware.

### Expected Firestore Structure

The complete and up-to-date Firestore schema (including collections, documents, and subcollections for the `PCS` hardware and `users`) is managed and documented extensively in our team's Shared Drive. 

👉 **[View the Detailed Firestore Architecture Document Here](https://docs.google.com/document/d/1WhmcHUkb0gpV_aRnRkid53PEuWYSOK5rOPfFGLzRpmI/edit?tab=t.0)**

*Note for Developers: If you need to modify the database structure or add new fields, please ensure the Shared Drive documentation is updated accordingly so we maintain a single source of truth.*

---

## 🧩 Key Components & Concepts

### 1. Real-Time Hardware Monitoring

The `useMachineDetails` hook does the heavy lifting here. It sets up 4 simultaneous real-time listeners for a single machine:

1. The root machine document (for heartbeat/last seen).
2. The `config` subcollection (for the `InventoryList` tanks).
3. The `state/health` and `state/operation` documents (for diagnostics).
4. A joined query fetching data from the root `users` collection based on the `activeUsers` map in the machine document.

### 2. Patient Management (`UserCard.jsx`)

This is the most complex component. It handles:

* **Wearable Data Display:** Extracts data via `useDeviceData` and displays it using custom animated SVGs (`AnimatedIcons.jsx`).
* **Prescription Editing:** Allows the admin to set the `dosageConfig` (how much of each liquid the patient should receive). It maps the patient's dosage map against the machine's physical inventory list.
* **Doctor's Advice:** A messaging system that updates the `messages` field on the user's Firestore document, converting timestamps to Malaysia Standard Time (UTC+8).

### 3. Visual Hardware Representation (`InventoryList.jsx`)

Instead of boring progress bars, this component uses complex SVG paths and CSS keyframes to create a "liquid wave" effect that visually represents the `currentInventoryMl` vs `capacityMl`. It also includes a modal to configure the physical tank parameters.

### 4. Connection State Management

Both the Dashboard and Machine Detail views calculate connection status locally. They compare the current `new Date()` against the `lastSeen` or `lastHeartbeat` Firebase timestamp. If the machine hasn't "checked in" within 55 seconds, it is marked as Offline.

---

## 🚀 Getting Started for Next Devs

1. Ensure you have the environment variables set up in a `.env.local` file at the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

```


2. Run `npm install` to grab dependencies (`react-router-dom`, `firebase`, `framer-motion`).
3. Run `npm run dev` to start the Vite development server.

## ⚠️ Known Quirks & Notes

* **Timezones:** The `UserCard` hardcodes message timestamps to Malaysia Time (UTC+8) using a custom `getMalaysiaTimeISO()` helper instead of standard UTC. Keep this in mind if deploying globally.
* **SVG Scaling:** The `AnimatedIcons` rely on specific viewBoxes and inline `<style>` keyframes. If adding new icons, ensure the keyframe names don't collide.
* **Hardware Normalcy:** The `SystemHealthCard` assumes the hardware is perfectly fine (`isHardwareNormal = true`) if `errorState` is undefined. It only flags an error if `errorState` exists and is strictly greater than `0`.
