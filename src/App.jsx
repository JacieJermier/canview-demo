import { useState } from "react";
import ClinicalCockpit from "./ClinicalCockpit";
import CohortForge from "./CohortForge";
import GovernanceFlow from "./GovernanceFlow";

const SCREENS = [
  { id: "cockpit", label: "Clinical Cockpit", color: "#2563EB" },
  { id: "forge", label: "Cohort Forge", color: "#4ecdc4" },
  { id: "governance", label: "Access Governance", color: "#ffd93d" },
];

export default function App() {
  const [active, setActive] = useState("cockpit");

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 1000,
        background: "#000", borderBottom: "1px solid #333",
        padding: "0 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 48,
        fontFamily: "'IBM Plex Sans', -apple-system, sans-serif",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
            CAN-VIEW
          </span>
          <span style={{ fontSize: 11, color: "#666", fontFamily: "monospace" }}>
            UI Demo &middot; March 2026
          </span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {SCREENS.map(s => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              style={{
                padding: "6px 16px", borderRadius: 4, fontSize: 12,
                fontWeight: active === s.id ? 600 : 400,
                cursor: "pointer", border: "none",
                fontFamily: "'IBM Plex Sans', sans-serif",
                background: active === s.id ? s.color : "transparent",
                color: active === s.id ? "#000" : "#999",
                transition: "all 0.15s",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {active === "cockpit" && <ClinicalCockpit />}
      {active === "forge" && <CohortForge />}
      {active === "governance" && <GovernanceFlow />}
    </div>
  );
}
