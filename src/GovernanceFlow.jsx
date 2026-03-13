import { useState } from "react";

const STAGES = [
  "Query Definition",
  "Result Review", 
  "Cohort Refinement",
  "Downstream Action",
  "Access Governance"
];

const TIERS = [
  { id: "aggregate", label: "Aggregate Counts", color: "#4ecdc4", bg: "#1a3a2a", border: "#4ecdc433", desc: "Summary statistics only. No patient-level data.", status: "active" },
  { id: "deidentified", label: "De-identified", color: "#ffd93d", bg: "#2a2a1a", border: "#ffd93d33", desc: "Pseudonymized records with key clinical variables.", status: "pending" },
  { id: "protocol", label: "Protocol-Based", color: "#ff6b6b", bg: "#2a1a1a", border: "#ff6b6b33", desc: "Identified patient data under REB-approved protocol.", status: "locked" },
];

const REQUESTS = [
  { 
    id: "REQ-2026-0047",
    tier: "De-identified",
    query: "POAG, Age 40–75, IOP >21, RNFL declining >5μm/24mo",
    cohortSize: 1847,
    purpose: "Retrospective analysis of glaucoma progression risk factors in Canadian optometry patients",
    requestedBy: "Dr. S. Tanaka",
    requestDate: "2026-03-08",
    status: "approved",
    approvedDate: "2026-03-10",
    approvedBy: "Data Governance Office",
    expiresDate: "2026-09-10",
    notes: "Approved for 6 months. Re-identification prohibited. Export limited to 2,000 records."
  },
  {
    id: "REQ-2026-0051",
    tier: "De-identified",
    query: "Diabetic retinopathy, HbA1c >7.0, 2+ visits",
    cohortSize: 923,
    purpose: "Feasibility study for multi-site DR screening trial",
    requestedBy: "Dr. S. Tanaka",
    requestDate: "2026-03-11",
    status: "pending",
    approvedDate: null,
    approvedBy: null,
    expiresDate: null,
    notes: null
  },
  {
    id: "REQ-2026-0039",
    tier: "Protocol-Based",
    query: "POAG fast progressors, VF MD decline >1dB/yr",
    cohortSize: 312,
    purpose: "CAN-VIEW-GL01: Prospective glaucoma intervention study",
    requestedBy: "Dr. S. Tanaka",
    requestDate: "2026-02-20",
    status: "in_review",
    approvedDate: null,
    approvedBy: null,
    expiresDate: null,
    notes: "REB application submitted. Awaiting ethics board review."
  }
];

function AccessTierBadge({ tier, size = "normal" }) {
  const colors = {
    aggregate: { bg: "#1a3a2a", border: "#4ecdc4", text: "#4ecdc4", label: "Aggregate Counts" },
    deidentified: { bg: "#2a2a1a", border: "#ffd93d", text: "#ffd93d", label: "De-identified" },
    protocol: { bg: "#2a1a1a", border: "#ff6b6b", text: "#ff6b6b", label: "Protocol-Based" },
  };
  const c = colors[tier];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: size === "large" ? "5px 14px" : "3px 10px",
      background: c.bg, border: `1px solid ${c.border}`, borderRadius: 4,
      fontSize: size === "large" ? 13 : 11, color: c.text,
      fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.02em",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.text }} />
      {c.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    active: { bg: "#1a3a2a", color: "#4ecdc4", border: "#4ecdc433", label: "✓ Active", icon: "✓" },
    approved: { bg: "#1a3a2a", color: "#4ecdc4", border: "#4ecdc433", label: "✓ Approved", icon: "✓" },
    pending: { bg: "#2a2a1a", color: "#ffd93d", border: "#ffd93d33", label: "◷ Pending Review", icon: "◷" },
    in_review: { bg: "#1a2a3a", color: "#60a5fa", border: "#60a5fa33", label: "⟳ In Review", icon: "⟳" },
    locked: { bg: "#2a1a1a", color: "#ff6b6b", border: "#ff6b6b33", label: "🔒 Locked", icon: "🔒" },
    expired: { bg: "#1a1a1a", color: "#8b949e", border: "#30363d", label: "Expired", icon: "—" },
  };
  const s = styles[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 4, fontSize: 11, color: s.color,
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      {s.label}
    </span>
  );
}

export default function GovernanceFlow() {
  const [activeView, setActiveView] = useState("overview");
  const [showRequestPanel, setShowRequestPanel] = useState(false);
  const [requestPurpose, setRequestPurpose] = useState("");
  const [requestJustification, setRequestJustification] = useState("");

  return (
    <div style={{
      minHeight: "100vh", background: "#0d1117", color: "#c9d1d9",
      fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ borderBottom: "1px solid #21262d", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0d1117" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: "linear-gradient(135deg, #4ecdc4, #44a08d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, color: "#0d1117" }}>CF</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#e6edf3", letterSpacing: "-0.01em" }}>Cohort Forge</div>
            <div style={{ fontSize: 11, color: "#8b949e", fontFamily: "'IBM Plex Mono', monospace" }}>CAN-VIEW Research Interface</div>
          </div>
        </div>
        <AccessTierBadge tier="aggregate" />
      </div>

      {/* Stage Navigation */}
      <div style={{ display: "flex", borderBottom: "1px solid #21262d", background: "#161b22", padding: "0 24px" }}>
        {STAGES.map((stage, i) => (
          <button key={i} style={{
            padding: "12px 20px", background: "none", border: "none",
            color: i === 4 ? "#4ecdc4" : "#8b949e", cursor: "pointer",
            fontSize: 13, fontWeight: i === 4 ? 600 : 400,
            fontFamily: "'IBM Plex Sans', sans-serif",
            borderBottom: i === 4 ? "2px solid #4ecdc4" : "2px solid transparent",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{
              width: 20, height: 20, borderRadius: "50%",
              background: i <= 4 ? "#4ecdc4" : "#30363d",
              color: i <= 4 ? "#0d1117" : "#8b949e",
              fontSize: 11, fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{i + 1}</span>
            {stage}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>

        {/* View Toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[
            { id: "overview", label: "Access Tiers" },
            { id: "requests", label: "My Requests" },
            { id: "escalate", label: "New Request" },
          ].map(v => (
            <button key={v.id} onClick={() => { setActiveView(v.id); setShowRequestPanel(false); }}
              style={{
                padding: "8px 18px", borderRadius: 6, fontSize: 13, cursor: "pointer",
                fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 500,
                background: activeView === v.id ? "#4ecdc4" : "#161b22",
                color: activeView === v.id ? "#0d1117" : "#8b949e",
                border: `1px solid ${activeView === v.id ? "#4ecdc4" : "#21262d"}`,
              }}>
              {v.label}
            </button>
          ))}
        </div>

        {/* === ACCESS TIERS OVERVIEW === */}
        {activeView === "overview" && (
          <div>
            <div style={{ fontSize: 14, color: "#e6edf3", fontWeight: 600, marginBottom: 6 }}>
              Tiered Access Model
            </div>
            <div style={{ fontSize: 13, color: "#8b949e", marginBottom: 20, lineHeight: 1.6 }}>
              CAN-VIEW uses a progressive access model. Your current tier determines what data is visible in query results. Escalation requests are submitted directly from Cohort Forge — your query context is automatically attached.
            </div>

            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
              {TIERS.map((tier, i) => (
                <div key={tier.id} style={{
                  flex: 1, background: "#161b22", border: `1px solid ${tier.id === "aggregate" ? "#4ecdc4" : "#21262d"}`,
                  borderRadius: 8, padding: 20, position: "relative", overflow: "hidden",
                }}>
                  {tier.id === "aggregate" && (
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#4ecdc4" }} />
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <AccessTierBadge tier={tier.id} size="large" />
                    <StatusBadge status={tier.status} />
                  </div>
                  <div style={{ fontSize: 13, color: "#c9d1d9", marginBottom: 12, lineHeight: 1.5 }}>{tier.desc}</div>
                  
                  <div style={{ fontSize: 11, color: "#8b949e", lineHeight: 1.6 }}>
                    {tier.id === "aggregate" && (
                      <div>
                        <div style={{ marginBottom: 6, fontWeight: 500, color: "#e6edf3" }}>What you can see:</div>
                        <div>• Total patient counts per query</div>
                        <div>• Geographic distribution across sites</div>
                        <div>• Demographic breakdowns (age, sex)</div>
                        <div>• Diagnostic distributions</div>
                      </div>
                    )}
                    {tier.id === "deidentified" && (
                      <div>
                        <div style={{ marginBottom: 6, fontWeight: 500, color: "#e6edf3" }}>Unlocks:</div>
                        <div>• Row-level patient records (pseudonymized)</div>
                        <div>• Individual clinical variables</div>
                        <div>• RNFL/IOP/VF trend sparklines per patient</div>
                        <div>• CSV/REDCap export of cohort data</div>
                      </div>
                    )}
                    {tier.id === "protocol" && (
                      <div>
                        <div style={{ marginBottom: 6, fontWeight: 500, color: "#e6edf3" }}>Unlocks:</div>
                        <div>• Identifiable patient records</div>
                        <div>• Direct contact for recruitment</div>
                        <div>• Full imaging data access (DICOM)</div>
                        <div>• Longitudinal chart-level review</div>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 16 }}>
                    {tier.id === "aggregate" && (
                      <div style={{ padding: "8px 12px", background: "#1a3a2a", border: "1px solid #4ecdc433", borderRadius: 6, fontSize: 12, color: "#4ecdc4", textAlign: "center" }}>
                        ✓ Currently Active
                      </div>
                    )}
                    {tier.id === "deidentified" && (
                      <button onClick={() => setActiveView("escalate")} style={{
                        width: "100%", padding: "8px 12px", background: "#2a2a1a",
                        border: "1px solid #ffd93d", borderRadius: 6,
                        fontSize: 12, color: "#ffd93d", cursor: "pointer",
                        fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 500,
                      }}>
                        Request Access →
                      </button>
                    )}
                    {tier.id === "protocol" && (
                      <div style={{ padding: "8px 12px", background: "#1a1a1a", border: "1px solid #30363d", borderRadius: 6, fontSize: 12, color: "#8b949e", textAlign: "center" }}>
                        Requires REB Approval
                      </div>
                    )}
                  </div>

                  {/* Arrow connector */}
                  {i < 2 && (
                    <div style={{ position: "absolute", right: -12, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "#30363d", zIndex: 2 }}>→</div>
                  )}
                </div>
              ))}
            </div>

            {/* How it works */}
            <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", marginBottom: 14 }}>How Access Escalation Works</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {[
                  { step: "1", title: "Run Query", desc: "Build your cohort at aggregate tier. See counts, demographics, distributions.", color: "#4ecdc4" },
                  { step: "2", title: "Request Access", desc: "Click 'Request Access' — your query, cohort size, and feasibility data are auto-attached.", color: "#ffd93d" },
                  { step: "3", title: "Review & Approval", desc: "Data governance team reviews. REB documentation required for protocol-based tier.", color: "#60a5fa" },
                  { step: "4", title: "Access Unlocked", desc: "Return to the same query — results now show the approved tier of detail. No re-querying.", color: "#4ecdc4" },
                ].map(s => (
                  <div key={s.step} style={{ padding: 14, background: "#0d1117", border: "1px solid #21262d", borderRadius: 6 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", background: `${s.color}20`,
                      border: `1px solid ${s.color}40`, color: s.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 600, marginBottom: 10,
                    }}>{s.step}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: "#8b949e", lineHeight: 1.5 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === MY REQUESTS === */}
        {activeView === "requests" && (
          <div>
            <div style={{ fontSize: 14, color: "#e6edf3", fontWeight: 600, marginBottom: 16 }}>
              Access Requests
            </div>

            {REQUESTS.map((req, i) => (
              <div key={i} style={{
                background: "#161b22", border: "1px solid #21262d", borderRadius: 8,
                padding: 20, marginBottom: 12,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", color: "#4ecdc4", fontWeight: 500 }}>{req.id}</span>
                    <AccessTierBadge tier={req.tier === "De-identified" ? "deidentified" : "protocol"} />
                    <StatusBadge status={req.status} />
                  </div>
                  <span style={{ fontSize: 11, color: "#8b949e", fontFamily: "'IBM Plex Mono', monospace" }}>{req.requestDate}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Query Criteria</div>
                    <div style={{ fontSize: 12, color: "#c9d1d9", fontFamily: "'IBM Plex Mono', monospace", padding: "8px 10px", background: "#0d1117", borderRadius: 4, border: "1px solid #21262d" }}>
                      {req.query}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Research Purpose</div>
                    <div style={{ fontSize: 12, color: "#c9d1d9", padding: "8px 10px", background: "#0d1117", borderRadius: 4, border: "1px solid #21262d" }}>
                      {req.purpose}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: "#8b949e" }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Cohort: {req.cohortSize.toLocaleString()} patients</span>
                  </div>
                  
                  {req.status === "approved" && (
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginLeft: "auto" }}>
                      <span style={{ fontSize: 11, color: "#8b949e" }}>
                        Approved by {req.approvedBy} · Expires {req.expiresDate}
                      </span>
                      <button style={{
                        padding: "6px 14px", background: "#1a3a2a", border: "1px solid #4ecdc4",
                        borderRadius: 6, color: "#4ecdc4", fontSize: 12, cursor: "pointer",
                        fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 500,
                      }}>
                        View Cohort →
                      </button>
                    </div>
                  )}

                  {req.status === "pending" && (
                    <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "#ffd93d" }}>Submitted to Data Governance Office</span>
                    </div>
                  )}

                  {req.status === "in_review" && (
                    <div style={{ marginLeft: "auto" }}>
                      <span style={{ fontSize: 11, color: "#60a5fa" }}>{req.notes}</span>
                    </div>
                  )}
                </div>

                {req.status === "approved" && req.notes && (
                  <div style={{
                    marginTop: 12, padding: "10px 12px", background: "#1a3a2a",
                    border: "1px solid #4ecdc433", borderRadius: 6,
                    fontSize: 11, color: "#4ecdc4", lineHeight: 1.5,
                  }}>
                    <strong>Conditions:</strong> {req.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* === NEW REQUEST (ESCALATION FORM) === */}
        {activeView === "escalate" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
            
            {/* Left: Request Form */}
            <div>
              <div style={{ fontSize: 14, color: "#e6edf3", fontWeight: 600, marginBottom: 6 }}>
                Request De-identified Access
              </div>
              <div style={{ fontSize: 13, color: "#8b949e", marginBottom: 20, lineHeight: 1.5 }}>
                Your query context and cohort summary are automatically included. Provide a research purpose and justification to complete your request.
              </div>

              {/* Auto-attached context */}
              <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 18, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12, fontWeight: 500 }}>
                  Auto-Attached from Your Query
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#8b949e", marginBottom: 4 }}>QUERY CRITERIA</div>
                    <div style={{ fontSize: 12, color: "#e6edf3", fontFamily: "'IBM Plex Mono', monospace", padding: "10px", background: "#0d1117", border: "1px solid #21262d", borderRadius: 6 }}>
                      <div>Diagnosis = POAG</div>
                      <div>Age: 40–75</div>
                      <div>IOP {">"} 21 mmHg (2+ visits)</div>
                      <div>RNFL declining {">"} 5μm/24mo</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#8b949e", marginBottom: 4 }}>FEASIBILITY SUMMARY</div>
                    <div style={{ fontSize: 12, padding: "10px", background: "#0d1117", border: "1px solid #21262d", borderRadius: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ color: "#8b949e" }}>Total patients</span>
                        <span style={{ color: "#4ecdc4", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>1,847</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ color: "#8b949e" }}>Contributing sites</span>
                        <span style={{ color: "#e6edf3", fontFamily: "'IBM Plex Mono', monospace" }}>11</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ color: "#8b949e" }}>Mean age</span>
                        <span style={{ color: "#e6edf3", fontFamily: "'IBM Plex Mono', monospace" }}>58.3</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#8b949e" }}>Sex distribution</span>
                        <span style={{ color: "#e6edf3", fontFamily: "'IBM Plex Mono', monospace" }}>52% F / 48% M</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <AccessTierBadge tier="aggregate" />
                  <span style={{ fontSize: 18, color: "#30363d", display: "flex", alignItems: "center" }}>→</span>
                  <AccessTierBadge tier="deidentified" />
                </div>
              </div>

              {/* Researcher input */}
              <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 18 }}>
                <div style={{ fontSize: 11, color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12, fontWeight: 500 }}>
                  Your Information
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: "#c9d1d9", marginBottom: 6, fontWeight: 500 }}>Research Purpose *</div>
                  <input
                    type="text"
                    value={requestPurpose}
                    onChange={e => setRequestPurpose(e.target.value)}
                    placeholder="e.g. Retrospective analysis of glaucoma progression risk factors..."
                    style={{
                      width: "100%", padding: "10px 14px", background: "#0d1117",
                      border: "1px solid #30363d", borderRadius: 6, color: "#c9d1d9",
                      fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", outline: "none",
                    }}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: "#c9d1d9", marginBottom: 6, fontWeight: 500 }}>Justification for De-identified Access *</div>
                  <textarea
                    value={requestJustification}
                    onChange={e => setRequestJustification(e.target.value)}
                    placeholder="Explain why aggregate counts are insufficient for your research objectives..."
                    rows={4}
                    style={{
                      width: "100%", padding: "10px 14px", background: "#0d1117",
                      border: "1px solid #30363d", borderRadius: 6, color: "#c9d1d9",
                      fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", outline: "none",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: "#c9d1d9", marginBottom: 6, fontWeight: 500 }}>Institutional Affiliation</div>
                  <div style={{ padding: "10px 14px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, color: "#8b949e", fontSize: 13 }}>
                    University of Waterloo — School of Optometry & Vision Science
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: "#c9d1d9", marginBottom: 6, fontWeight: 500 }}>Data Use Agreement</div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 6 }}>
                    <input type="checkbox" style={{ accentColor: "#4ecdc4", marginTop: 2 }} />
                    <span style={{ fontSize: 12, color: "#8b949e", lineHeight: 1.5 }}>
                      I agree to the CAN-VIEW Data Use Terms. De-identified data will not be re-identified, linked to external datasets, or shared outside the approved research team. Access expires after 6 months unless renewed.
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button style={{
                    padding: "10px 24px", background: "#4ecdc4", border: "none",
                    borderRadius: 6, color: "#0d1117", fontWeight: 600, fontSize: 13,
                    cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif",
                  }}>
                    Submit Request
                  </button>
                  <button style={{
                    padding: "10px 18px", background: "transparent",
                    border: "1px solid #30363d", borderRadius: 6, color: "#8b949e",
                    fontSize: 13, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif",
                  }}>
                    Save Draft
                  </button>
                </div>
              </div>
            </div>

            {/* Right: What happens next */}
            <div>
              <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 18, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", marginBottom: 12 }}>What Happens Next</div>
                
                {[
                  { step: "1", label: "Request Submitted", desc: "Your query criteria, cohort summary, and research purpose are sent to the Data Governance Office.", color: "#4ecdc4", done: false },
                  { step: "2", label: "Governance Review", desc: "The governance team reviews your purpose, institutional affiliation, and data use agreement (typically 2–5 business days).", color: "#ffd93d", done: false },
                  { step: "3", label: "Access Granted", desc: "You'll receive a notification. Return to this query — de-identified records will be visible without re-querying.", color: "#4ecdc4", done: false },
                  { step: "4", label: "Time-Limited Access", desc: "Access is valid for 6 months. Audit logs track all exports and record views for compliance.", color: "#8b949e", done: false },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 3 ? 14 : 0 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      background: `${s.color}15`, border: `1px solid ${s.color}30`,
                      color: s.color, fontSize: 11, fontWeight: 600,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{s.step}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#e6edf3", marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: "#8b949e", lineHeight: 1.5 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 18, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", marginBottom: 10 }}>Need Protocol-Based Access?</div>
                <div style={{ fontSize: 12, color: "#8b949e", lineHeight: 1.6, marginBottom: 12 }}>
                  Protocol-based access requires REB approval. You can use your Cohort Forge feasibility summary to support your REB application — export it from the Downstream Action stage.
                </div>
                <div style={{ fontSize: 12, color: "#8b949e", lineHeight: 1.6 }}>
                  Once you have REB approval, upload the documentation here to request protocol-based identified access.
                </div>
                <button style={{
                  marginTop: 12, padding: "8px 14px", background: "#2a1a1a",
                  border: "1px solid #ff6b6b33", borderRadius: 6,
                  color: "#ff6b6b", fontSize: 12, cursor: "pointer",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }}>
                  Upload REB Documentation
                </button>
              </div>

              <div style={{ background: "#1a2332", border: "1px solid #21262d", borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: 11, color: "#8b949e", lineHeight: 1.6 }}>
                  <strong style={{ color: "#60a5fa" }}>Audit Note:</strong> All access requests, approvals, data views, and exports are logged in CAN-VIEW's immutable audit trail. This supports compliance reporting and REB renewal documentation.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
