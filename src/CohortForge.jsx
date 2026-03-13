import { useState } from "react";

const stages = ["Query Definition", "Result Review", "Cohort Refinement", "Downstream Action"];

const taxonomyCategories = [
  { name: "Demographics", items: ["Age Range", "Sex", "Ethnicity", "Province/Region"], icon: "👤" },
  { name: "Diagnostic Entities", items: ["ICD-Coded Diagnoses", "NLP-Extracted Diagnoses", "Comorbidities"], icon: "🏥" },
  { name: "Functional Measurements", items: ["Intraocular Pressure (IOP)", "Visual Acuity", "Visual Field Indices"], icon: "📊" },
  { name: "Structural Imaging", items: ["RNFL Thickness", "Macular Thickness", "Cup-to-Disc Ratio"], icon: "🔬" },
  { name: "Visit Metadata", items: ["Date Range", "Clinic Location", "Provider Type"], icon: "📅" },
  { name: "Treatment History", items: ["Medications", "Procedures", "Referrals"], icon: "💊" },
];

const mockCriteria = [
  { id: 1, field: "Diagnosis", operator: "equals", value: "Primary Open-Angle Glaucoma (POAG)", source: "ICD + NLP" },
  { id: 2, field: "Age", operator: "between", value: "40 – 75", source: "Demographics" },
  { id: 3, field: "IOP", operator: ">", value: "21 mmHg (2+ visits)", source: "Functional" },
  { id: 4, field: "RNFL Thickness", operator: "declining", value: "> 5μm over 24 months", source: "Structural" },
];

const mockResults = {
  totalPatients: 1847,
  sites: [
    { name: "UW Optometry Clinic", count: 423, pct: 22.9 },
    { name: "Toronto Western Eye", count: 389, pct: 21.1 },
    { name: "Vancouver Eye Care", count: 312, pct: 16.9 },
    { name: "Ottawa Eye Institute", count: 287, pct: 15.5 },
    { name: "Other (6 sites)", count: 436, pct: 23.6 },
  ],
  demographics: { meanAge: 58.3, female: 52, male: 48 },
  diagnoses: [
    { name: "POAG", pct: 100 },
    { name: "Ocular Hypertension", pct: 34 },
    { name: "Diabetes", pct: 22 },
    { name: "Hypertension", pct: 41 },
  ],
};

const mockPatients = [
  { id: "PT-00291", age: 62, sex: "F", iop: "24/22", rnfl: "68→61μm", vf: "-4.2dB", source: "ICD", visits: 8 },
  { id: "PT-01044", age: 55, sex: "M", iop: "26/25", rnfl: "72→64μm", vf: "-3.8dB", source: "NLP", visits: 6 },
  { id: "PT-00718", age: 71, sex: "F", iop: "23/21", rnfl: "65→58μm", vf: "-5.1dB", source: "ICD", visits: 11 },
  { id: "PT-02390", age: 48, sex: "M", iop: "28/27", rnfl: "74→67μm", vf: "-2.9dB", source: "ICD+NLP", visits: 5 },
  { id: "PT-01562", age: 67, sex: "F", iop: "22/23", rnfl: "70→62μm", vf: "-4.7dB", source: "NLP", visits: 9 },
];

const refinementHistory = [
  { step: "Initial query", count: 3241, change: null },
  { step: "+ Age 40–75", count: 2856, change: -385 },
  { step: "+ IOP > 21 mmHg", count: 2104, change: -752 },
  { step: "+ RNFL declining > 5μm", count: 1847, change: -257 },
];

function BarSimple({ value, max, color }) {
  return (
    <div style={{ width: "100%", height: 10, background: "#1a1f2e", borderRadius: 5 }}>
      <div
        style={{
          width: `${(value / max) * 100}%`,
          height: "100%",
          background: color || "#4ecdc4",
          borderRadius: 5,
          transition: "width 0.6s ease",
        }}
      />
    </div>
  );
}

function RNFLSparkline({ data, width = 120, height = 40 }) {
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - 50) / 30) * height;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline
        points={points}
        fill="none"
        stroke="#ff6b6b"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - 50) / 30) * height;
        return <circle key={i} cx={x} cy={y} r={2.5} fill="#ff6b6b" />;
      })}
    </svg>
  );
}

function AccessTierBadge({ tier }) {
  const colors = {
    aggregate: { bg: "#1a3a2a", border: "#4ecdc4", text: "#4ecdc4", label: "Aggregate Counts" },
    deidentified: { bg: "#2a2a1a", border: "#ffd93d", text: "#ffd93d", label: "De-identified" },
    protocol: { bg: "#2a1a1a", border: "#ff6b6b", text: "#ff6b6b", label: "Protocol-Based" },
  };
  const c = colors[tier];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 4,
        fontSize: 11,
        color: c.text,
        fontFamily: "'IBM Plex Mono', monospace",
        letterSpacing: "0.02em",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.text }} />
      {c.label}
    </span>
  );
}

function SourceBadge({ source }) {
  const isNLP = source.includes("NLP");
  return (
    <span
      style={{
        fontSize: 10,
        padding: "2px 6px",
        borderRadius: 3,
        background: isNLP ? "#2a2a1a" : "#1a2a1a",
        color: isNLP ? "#ffd93d" : "#4ecdc4",
        border: `1px solid ${isNLP ? "#ffd93d33" : "#4ecdc433"}`,
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      {source}
    </span>
  );
}

export default function CohortForgeWireframe() {
  const [activeStage, setActiveStage] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [showPatientList, setShowPatientList] = useState(false);
  const [nlQuery, setNlQuery] = useState("");
  const [savedQueries] = useState(["Glaucoma progressors 40-75", "Diabetic retinopathy cohort"]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d1117",
        color: "#c9d1d9",
        fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #21262d",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#0d1117",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: "linear-gradient(135deg, #4ecdc4, #44a08d)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 600,
              color: "#0d1117",
            }}
          >
            CF
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#e6edf3", letterSpacing: "-0.01em" }}>
              Cohort Forge
            </div>
            <div style={{ fontSize: 11, color: "#8b949e", fontFamily: "'IBM Plex Mono', monospace" }}>
              CAN-VIEW Research Interface
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AccessTierBadge tier={activeStage < 2 ? "aggregate" : showPatientList ? "deidentified" : "aggregate"} />
        </div>
      </div>

      {/* Stage Navigation */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #21262d",
          background: "#161b22",
          padding: "0 24px",
        }}
      >
        {stages.map((stage, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveStage(i);
              if (i < 2) setShowPatientList(false);
            }}
            style={{
              padding: "12px 20px",
              background: "none",
              border: "none",
              color: activeStage === i ? "#4ecdc4" : "#8b949e",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: activeStage === i ? 600 : 400,
              fontFamily: "'IBM Plex Sans', sans-serif",
              borderBottom: activeStage === i ? "2px solid #4ecdc4" : "2px solid transparent",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: activeStage >= i ? "#4ecdc4" : "#30363d",
                color: activeStage >= i ? "#0d1117" : "#8b949e",
                fontSize: 11,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {i + 1}
            </span>
            {stage}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        {/* Stage 1: Query Definition */}
        {activeStage === 0 && (
          <div style={{ display: "flex", gap: 20 }}>
            {/* Left: Taxonomy Browser */}
            <div
              style={{
                width: 280,
                background: "#161b22",
                border: "1px solid #21262d",
                borderRadius: 8,
                padding: 16,
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: "#8b949e", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Data Taxonomy
              </div>
              {taxonomyCategories.map((cat, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === i ? null : i)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      background: expandedCategory === i ? "#1a2332" : "transparent",
                      border: "1px solid transparent",
                      borderColor: expandedCategory === i ? "#21262d" : "transparent",
                      borderRadius: 6,
                      color: "#c9d1d9",
                      cursor: "pointer",
                      fontSize: 13,
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontFamily: "'IBM Plex Sans', sans-serif",
                    }}
                  >
                    <span>{cat.icon}</span>
                    <span style={{ flex: 1 }}>{cat.name}</span>
                    <span style={{ fontSize: 10, color: "#8b949e" }}>{expandedCategory === i ? "▾" : "▸"}</span>
                  </button>
                  {expandedCategory === i && (
                    <div style={{ paddingLeft: 32, paddingTop: 4, paddingBottom: 4 }}>
                      {cat.items.map((item, j) => (
                        <div
                          key={j}
                          style={{
                            padding: "5px 8px",
                            fontSize: 12,
                            color: "#8b949e",
                            cursor: "pointer",
                            borderRadius: 4,
                            fontFamily: "'IBM Plex Mono', monospace",
                          }}
                        >
                          + {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div style={{ borderTop: "1px solid #21262d", marginTop: 12, paddingTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#8b949e", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Saved Queries
                </div>
                {savedQueries.map((q, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "6px 10px",
                      fontSize: 12,
                      color: "#4ecdc4",
                      cursor: "pointer",
                      borderRadius: 4,
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    📁 {q}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Query Builder */}
            <div style={{ flex: 1 }}>
              {/* NL Search */}
              <div
                style={{
                  background: "#161b22",
                  border: "1px solid #21262d",
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: "#8b949e", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Natural Language Query
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={nlQuery}
                    onChange={(e) => setNlQuery(e.target.value)}
                    placeholder="e.g. Patients aged 40-75 with POAG and progressive RNFL thinning..."
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      background: "#0d1117",
                      border: "1px solid #30363d",
                      borderRadius: 6,
                      color: "#c9d1d9",
                      fontSize: 13,
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      outline: "none",
                    }}
                  />
                  <button
                    style={{
                      padding: "10px 20px",
                      background: "#4ecdc4",
                      border: "none",
                      borderRadius: 6,
                      color: "#0d1117",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "'IBM Plex Sans', sans-serif",
                    }}
                  >
                    Parse
                  </button>
                </div>
                <div style={{ fontSize: 11, color: "#8b949e", marginTop: 6, fontStyle: "italic" }}>
                  Semantic search translates free-text into structured filters via NLP
                </div>
              </div>

              {/* Active Criteria */}
              <div
                style={{
                  background: "#161b22",
                  border: "1px solid #21262d",
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: "#8b949e", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Active Inclusion Criteria
                </div>
                {mockCriteria.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      background: "#0d1117",
                      border: "1px solid #21262d",
                      borderRadius: 6,
                      marginBottom: 8,
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: "#4ecdc4", fontWeight: 600, minWidth: 120, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>
                      {c.field}
                    </span>
                    <span style={{ color: "#8b949e" }}>{c.operator}</span>
                    <span style={{ color: "#e6edf3", flex: 1 }}>{c.value}</span>
                    <SourceBadge source={c.source} />
                    <span style={{ color: "#f85149", cursor: "pointer", fontSize: 16 }}>×</span>
                  </div>
                ))}
                <button
                  onClick={() => setActiveStage(1)}
                  style={{
                    marginTop: 12,
                    padding: "10px 24px",
                    background: "#4ecdc4",
                    border: "none",
                    borderRadius: 6,
                    color: "#0d1117",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                >
                  Run Query →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stage 2: Result Review */}
        {activeStage === 1 && (
          <div>
            {/* Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
              <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 11, color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Patients</div>
                <div style={{ fontSize: 36, fontWeight: 300, color: "#4ecdc4", marginTop: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
                  {mockResults.totalPatients.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: "#8b949e", marginTop: 4 }}>across {mockResults.sites.length} contributing sites</div>
              </div>
              <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 11, color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.05em" }}>Mean Age</div>
                <div style={{ fontSize: 36, fontWeight: 300, color: "#e6edf3", marginTop: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
                  {mockResults.demographics.meanAge}
                </div>
                <div style={{ fontSize: 12, color: "#8b949e", marginTop: 4 }}>
                  {mockResults.demographics.female}% F · {mockResults.demographics.male}% M
                </div>
              </div>
              <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 11, color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.05em" }}>Access Tier</div>
                <div style={{ marginTop: 10 }}>
                  <AccessTierBadge tier="aggregate" />
                </div>
                <div style={{ fontSize: 12, color: "#8b949e", marginTop: 10 }}>
                  Summary statistics only · <span style={{ color: "#4ecdc4", cursor: "pointer" }}>Request de-identified access →</span>
                </div>
              </div>
            </div>

            {/* Site Distribution + Diagnoses */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#8b949e", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Geographic Distribution
                </div>
                {mockResults.sites.map((site, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span>{site.name}</span>
                      <span style={{ color: "#8b949e", fontFamily: "'IBM Plex Mono', monospace" }}>{site.count} ({site.pct}%)</span>
                    </div>
                    <BarSimple value={site.count} max={500} color="#4ecdc4" />
                  </div>
                ))}
              </div>
              <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#8b949e", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Diagnostic Distributions
                </div>
                {mockResults.diagnoses.map((dx, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span>{dx.name}</span>
                      <span style={{ color: "#8b949e", fontFamily: "'IBM Plex Mono', monospace" }}>{dx.pct}%</span>
                    </div>
                    <BarSimple value={dx.pct} max={100} color={i === 0 ? "#4ecdc4" : "#44a08d"} />
                  </div>
                ))}
              </div>
            </div>

            {/* Expand to patient list */}
            <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showPatientList ? 16 : 0 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    De-identified Patient Records
                  </div>
                  {!showPatientList && (
                    <div style={{ fontSize: 12, color: "#8b949e", marginTop: 4 }}>
                      Requires de-identified access tier authorization
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowPatientList(!showPatientList)}
                  style={{
                    padding: "8px 16px",
                    background: showPatientList ? "#21262d" : "#1a3a2a",
                    border: `1px solid ${showPatientList ? "#30363d" : "#4ecdc4"}`,
                    borderRadius: 6,
                    color: showPatientList ? "#8b949e" : "#4ecdc4",
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                >
                  {showPatientList ? "Collapse ▴" : "Expand Records ▾"}
                </button>
              </div>

              {showPatientList && (
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <AccessTierBadge tier="deidentified" />
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #21262d" }}>
                        {["ID", "Age", "Sex", "IOP (OD/OS)", "RNFL Trend", "RNFL Visual", "VF MD", "Source", "Visits"].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "8px 10px",
                              textAlign: "left",
                              color: "#8b949e",
                              fontWeight: 500,
                              fontFamily: "'IBM Plex Mono', monospace",
                              fontSize: 11,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mockPatients.map((p, i) => {
                        const rnflValues = [
                          parseInt(p.rnfl.split("→")[0]),
                          parseInt(p.rnfl.split("→")[0]) - 2,
                          parseInt(p.rnfl.split("→")[0]) - 4,
                          parseInt(p.rnfl.split("→")[1]),
                        ];
                        return (
                          <tr key={i} style={{ borderBottom: "1px solid #161b22" }}>
                            <td style={{ padding: "10px 10px", fontFamily: "'IBM Plex Mono', monospace", color: "#4ecdc4" }}>{p.id}</td>
                            <td style={{ padding: "10px 10px" }}>{p.age}</td>
                            <td style={{ padding: "10px 10px" }}>{p.sex}</td>
                            <td style={{ padding: "10px 10px", fontFamily: "'IBM Plex Mono', monospace" }}>{p.iop}</td>
                            <td style={{ padding: "10px 10px", fontFamily: "'IBM Plex Mono', monospace", color: "#ff6b6b" }}>{p.rnfl}</td>
                            <td style={{ padding: "10px 6px" }}>
                              <RNFLSparkline data={rnflValues} />
                            </td>
                            <td style={{ padding: "10px 10px", fontFamily: "'IBM Plex Mono', monospace" }}>{p.vf}</td>
                            <td style={{ padding: "10px 10px" }}><SourceBadge source={p.source} /></td>
                            <td style={{ padding: "10px 10px", fontFamily: "'IBM Plex Mono', monospace" }}>{p.visits}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div style={{ fontSize: 11, color: "#8b949e", marginTop: 10, fontStyle: "italic" }}>
                    RNFL Visual column shows compact trend sparklines — optometry-specific visualization within search results
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stage 3: Cohort Refinement */}
        {activeStage === 2 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Refinement History */}
            <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#8b949e", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Refinement History
              </div>
              <div style={{ fontSize: 12, color: "#8b949e", marginBottom: 16 }}>
                Real-time impact of each criterion on cohort size
              </div>
              {refinementHistory.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px",
                    background: "#0d1117",
                    border: "1px solid #21262d",
                    borderRadius: 6,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "#1a3a2a",
                      color: "#4ecdc4",
                      fontSize: 11,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ flex: 1, fontSize: 13 }}>{r.step}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, fontWeight: 600, color: "#e6edf3" }}>
                    {r.count.toLocaleString()}
                  </span>
                  {r.change && (
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#ff6b6b" }}>
                      {r.change.toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
              <div style={{ marginTop: 16 }}>
                <BarSimple value={1847} max={3241} color="#4ecdc4" />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#8b949e", marginTop: 4 }}>
                  <span>Current: 1,847</span>
                  <span>Initial: 3,241</span>
                </div>
              </div>
            </div>

            {/* Modify Criteria */}
            <div>
              <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#8b949e", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Adjust Criteria
                </div>
                {mockCriteria.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      background: "#0d1117",
                      border: "1px solid #21262d",
                      borderRadius: 6,
                      marginBottom: 6,
                      fontSize: 12,
                    }}
                  >
                    <input type="checkbox" defaultChecked style={{ accentColor: "#4ecdc4" }} />
                    <span style={{ color: "#4ecdc4", fontFamily: "'IBM Plex Mono', monospace", minWidth: 90 }}>{c.field}</span>
                    <span style={{ color: "#8b949e", flex: 1 }}>{c.operator} {c.value}</span>
                    <span style={{ color: "#8b949e", cursor: "pointer" }}>✎</span>
                  </div>
                ))}
                <button
                  style={{
                    marginTop: 10,
                    padding: "6px 14px",
                    background: "transparent",
                    border: "1px dashed #30363d",
                    borderRadius: 6,
                    color: "#8b949e",
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                >
                  + Add criterion
                </button>
              </div>

              <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#8b949e", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Compare Versions
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1, padding: 12, background: "#0d1117", border: "1px solid #4ecdc433", borderRadius: 6 }}>
                    <div style={{ fontSize: 11, color: "#4ecdc4", marginBottom: 4 }}>Current</div>
                    <div style={{ fontSize: 20, fontWeight: 300, fontFamily: "'IBM Plex Mono', monospace" }}>1,847</div>
                    <div style={{ fontSize: 11, color: "#8b949e" }}>4 criteria</div>
                  </div>
                  <div style={{ flex: 1, padding: 12, background: "#0d1117", border: "1px solid #30363d", borderRadius: 6 }}>
                    <div style={{ fontSize: 11, color: "#8b949e", marginBottom: 4 }}>Saved v1</div>
                    <div style={{ fontSize: 20, fontWeight: 300, fontFamily: "'IBM Plex Mono', monospace" }}>2,104</div>
                    <div style={{ fontSize: 11, color: "#8b949e" }}>3 criteria</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stage 4: Downstream Action */}
        {activeStage === 3 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
              {[
                {
                  title: "Save & Share",
                  desc: "Save cohort definition for future sessions or share with collaborators",
                  icon: "💾",
                  actions: ["Save query", "Share with team", "Duplicate as template"],
                },
                {
                  title: "Export for REB / Grants",
                  desc: "Generate feasibility summaries for ethics board applications and grant proposals",
                  icon: "📄",
                  actions: ["Feasibility report (PDF)", "Cohort summary (CSV)", "Site distribution report"],
                },
                {
                  title: "Transfer to REDCap",
                  desc: "Export validated cohort via API for structured data capture and study workflows",
                  icon: "🔗",
                  actions: ["Create REDCap project", "Map variables", "Initiate transfer"],
                },
              ].map((card, i) => (
                <div
                  key={i}
                  style={{
                    background: "#161b22",
                    border: "1px solid #21262d",
                    borderRadius: 8,
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{card.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#e6edf3", marginBottom: 6 }}>{card.title}</div>
                  <div style={{ fontSize: 12, color: "#8b949e", marginBottom: 16, lineHeight: 1.5 }}>{card.desc}</div>
                  <div style={{ marginTop: "auto" }}>
                    {card.actions.map((a, j) => (
                      <button
                        key={j}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "8px 12px",
                          marginBottom: 6,
                          background: j === 0 ? "#1a3a2a" : "#0d1117",
                          border: `1px solid ${j === 0 ? "#4ecdc4" : "#21262d"}`,
                          borderRadius: 6,
                          color: j === 0 ? "#4ecdc4" : "#8b949e",
                          fontSize: 12,
                          cursor: "pointer",
                          textAlign: "left",
                          fontFamily: "'IBM Plex Sans', sans-serif",
                        }}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Governance reminder */}
            <div
              style={{
                background: "#1a2332",
                border: "1px solid #21262d",
                borderRadius: 8,
                padding: 16,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{ fontSize: 11, color: "#8b949e", lineHeight: 1.6 }}>
                <span style={{ fontWeight: 600, color: "#e6edf3" }}>Governance Note: </span>
                Export actions are constrained by your current access tier. Aggregate-level exports are available now.
                De-identified cohort export requires tier escalation through the appropriate governance workflow.
                Protocol-based identified access requires REB approval documentation.
              </div>
              <div style={{ flexShrink: 0, display: "flex", gap: 8 }}>
                <AccessTierBadge tier="aggregate" />
                <AccessTierBadge tier="deidentified" />
                <AccessTierBadge tier="protocol" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
