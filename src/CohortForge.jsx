import { useState } from "react";

const stages = ["Live Query Builder", "Result Review", "Downstream Action"];

const taxonomyCategories = [
  { name: "Demographics", stream: "contextual", items: ["Age Range", "Sex", "Ethnicity", "Province/Region"], icon: "👤" },
  { name: "Diagnostic Entities", stream: "contextual", items: ["ICD-Coded Diagnoses", "NLP-Extracted Diagnoses", "Comorbidities"], icon: "🏥" },
  { name: "Functional Measurements", stream: "functional", items: ["Intraocular Pressure (IOP)", "Visual Acuity", "Visual Field Indices"], icon: "📊" },
  { name: "Structural Imaging", stream: "structural", items: ["RNFL Thickness", "Macular Thickness", "Cup-to-Disc Ratio"], icon: "🔬" },
  { name: "Visit Metadata", stream: "contextual", items: ["Date Range", "Clinic Location", "Provider Type"], icon: "📅" },
  { name: "Treatment History", stream: "contextual", items: ["Medications", "Procedures", "Referrals"], icon: "💊" },
];

const streamColors = { contextual: "#60a5fa", functional: "#4ecdc4", structural: "#c084fc" };

const mockCriteria = [
  { id: 1, field: "Diagnosis", operator: "equals", value: "Primary Open-Angle Glaucoma (POAG)", source: "ICD + NLP", confidence: 0.96, stream: "contextual", impact: -9209 },
  { id: 2, field: "Age", operator: "between", value: "40 – 75", source: "Demographics", confidence: 1.0, stream: "contextual", impact: -385 },
  { id: 3, field: "IOP", operator: ">", value: "21 mmHg (2+ visits)", source: "Functional", confidence: 0.98, stream: "functional", impact: -752 },
  { id: 4, field: "RNFL Thickness", operator: "declining", value: "> 5μm over 24 months", source: "Structural", confidence: 0.91, stream: "structural", impact: -257 },
];

const additiveFilters = [
  { id: 5, field: "Include Diabetes", value: "Type 2 Diabetes", source: "ICD", stream: "contextual", impact: 342 },
  { id: 6, field: "Include Hypertension", value: "Hypertension", source: "ICD", stream: "contextual", impact: 218 },
];

const countMap = { 4: 1847, 3: 2104, 2: 2856, 1: 3241, 0: 12450 };

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
  confidenceDistribution: { high: 78, medium: 16, low: 6 },
};

const mockPatients = [
  { id: "PT-01562", age: 67, sex: "F", iop: "22/23", rnfl: "70→62μm", rnflData: [70, 68, 65, 62], vf: "-4.7dB", source: "NLP", confidence: 0.72, visits: 9, matchedText: "Impression: likely glaucomatous damage, r/o NTG" },
  { id: "PT-01044", age: 55, sex: "M", iop: "26/25", rnfl: "72→64μm", rnflData: [72, 70, 67, 64], vf: "-3.8dB", source: "NLP", confidence: 0.87, visits: 6, matchedText: "Assessment: POAG progressing, consider SLT" },
  { id: "PT-02390", age: 48, sex: "M", iop: "28/27", rnfl: "74→67μm", rnflData: [74, 72, 70, 67], vf: "-2.9dB", source: "ICD+NLP", confidence: 0.94, visits: 5, matchedText: "Dx: POAG. Note: 'patient reports no blurry vision'" },
  { id: "PT-00291", age: 62, sex: "F", iop: "24/22", rnfl: "68→61μm", rnflData: [68, 66, 64, 61], vf: "-4.2dB", source: "ICD", confidence: 0.98, visits: 8, matchedText: "Dx: primary open-angle glaucoma, bilateral" },
  { id: "PT-00718", age: 71, sex: "F", iop: "23/21", rnfl: "65→58μm", rnflData: [65, 63, 60, 58], vf: "-5.1dB", source: "ICD", confidence: 0.99, visits: 11, matchedText: "ICD-10: H40.1131 - POAG, bilateral, mild stage" },
];

function AccessTierBadge({ tier }) {
  const c = { aggregate: { bg: "#1a3a2a", border: "#4ecdc4", text: "#4ecdc4", label: "Aggregate Counts" }, deidentified: { bg: "#2a2a1a", border: "#ffd93d", text: "#ffd93d", label: "De-identified" }, protocol: { bg: "#2a1a1a", border: "#ff6b6b", text: "#ff6b6b", label: "Protocol-Based" } }[tier];
  return (<span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", background: c.bg, border: `1px solid ${c.border}`, borderRadius: 4, fontSize: 11, color: c.text, fontFamily: "'IBM Plex Mono', monospace" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: c.text }} />{c.label}</span>);
}
function SourceBadge({ source }) {
  const n = source.includes("NLP");
  return (<span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: n ? "#2a2a1a" : "#1a2a1a", color: n ? "#ffd93d" : "#4ecdc4", border: `1px solid ${n ? "#ffd93d33" : "#4ecdc433"}`, fontFamily: "'IBM Plex Mono', monospace" }}>{source}</span>);
}
function StreamBadge({ stream }) {
  return (<span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: `${streamColors[stream]}15`, color: streamColors[stream], border: `1px solid ${streamColors[stream]}30`, fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: "0.04em" }}>{stream}</span>);
}
function ConfidenceBadge({ score }) {
  const color = score >= 0.9 ? "#4ecdc4" : score >= 0.75 ? "#ffd93d" : "#ff6b6b";
  return (<span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, background: `${color}15`, color, border: `1px solid ${color}30`, fontFamily: "'IBM Plex Mono', monospace", display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: color }} />{(score * 100).toFixed(0)}%</span>);
}
function RNFLSparkline({ data, width = 100, height = 32 }) {
  const mn = Math.min(...data) - 3, mx = Math.max(...data) + 3;
  const pts = data.map((v, i) => `${4 + (i / (data.length - 1)) * (width - 8)},${4 + ((mx - v) / (mx - mn)) * (height - 8)}`).join(" ");
  return (<svg width={width} height={height} style={{ display: "block" }}><polyline points={pts} fill="none" stroke="#ff6b6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />{data.map((v, i) => { const x = 4 + (i / (data.length - 1)) * (width - 8), y = 4 + ((mx - v) / (mx - mn)) * (height - 8); return <circle key={i} cx={x} cy={y} r={2} fill="#ff6b6b" />; })}</svg>);
}
function BarSimple({ value, max, color }) {
  return (<div style={{ width: "100%", height: 10, background: "#1a1f2e", borderRadius: 5 }}><div style={{ width: `${(value / max) * 100}%`, height: "100%", background: color || "#4ecdc4", borderRadius: 5, transition: "width 0.6s ease" }} /></div>);
}

export default function CohortForgeWireframe() {
  const [activeStage, setActiveStage] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [showPatientList, setShowPatientList] = useState(false);
  const [showProvenance, setShowProvenance] = useState(null);
  const [nlQuery, setNlQuery] = useState("");
  const [enabledCriteria, setEnabledCriteria] = useState([1, 2, 3, 4]);
  const [showAdditive, setShowAdditive] = useState(false);
  const [enabledAdditive, setEnabledAdditive] = useState([]);

  const currentCount = (countMap[enabledCriteria.length] || 12450) + enabledAdditive.reduce((sum, id) => sum + (additiveFilters.find(f => f.id === id)?.impact || 0), 0);

  const refinementSteps = [
    { step: "Base population", count: 12450, change: null, color: null },
    ...mockCriteria.filter(c => enabledCriteria.includes(c.id)).map(c => ({ step: `+ ${c.field} ${c.operator} ${c.value}`, count: null, change: c.impact, color: "#ef4444" })),
    ...additiveFilters.filter(c => enabledAdditive.includes(c.id)).map(c => ({ step: `+ ${c.field}: ${c.value}`, count: null, change: c.impact, color: "#4ecdc4" })),
  ];
  let running = 12450;
  refinementSteps.forEach(r => { if (r.change) running += r.change; r.count = running; });

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#c9d1d9", fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div style={{ borderBottom: "1px solid #21262d", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: "linear-gradient(135deg, #4ecdc4, #44a08d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, color: "#0d1117" }}>CF</div>
          <div><div style={{ fontSize: 16, fontWeight: 600, color: "#e6edf3" }}>Cohort Forge</div><div style={{ fontSize: 11, color: "#8b949e", fontFamily: "'IBM Plex Mono', monospace" }}>CAN-VIEW Research Interface</div></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 6 }}>{Object.entries(streamColors).map(([s, c]) => (<span key={s} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 3, background: `${c}15`, color: c, border: `1px solid ${c}30`, fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase" }}>{s}</span>))}</div>
          <AccessTierBadge tier={showPatientList ? "deidentified" : "aggregate"} />
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #21262d", background: "#161b22", padding: "0 24px" }}>
        {stages.map((stage, i) => (
          <button key={i} onClick={() => { setActiveStage(i); if (i === 0) setShowPatientList(false); }} style={{ padding: "12px 20px", background: "none", border: "none", color: activeStage === i ? "#4ecdc4" : "#8b949e", cursor: "pointer", fontSize: 13, fontWeight: activeStage === i ? 600 : 400, fontFamily: "'IBM Plex Sans', sans-serif", borderBottom: activeStage === i ? "2px solid #4ecdc4" : "2px solid transparent", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", background: activeStage >= i ? "#4ecdc4" : "#30363d", color: activeStage >= i ? "#0d1117" : "#8b949e", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>{stage}
          </button>
        ))}
      </div>

      <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>

        {activeStage === 0 && (
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ width: 280, flexShrink: 0 }}>
              <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#8b949e", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Data Taxonomy</div>
                {taxonomyCategories.map((cat, i) => (
                  <div key={i} style={{ marginBottom: 4 }}>
                    <button onClick={() => setExpandedCategory(expandedCategory === i ? null : i)} style={{ width: "100%", padding: "8px 10px", background: expandedCategory === i ? "#1a2332" : "transparent", border: "1px solid transparent", borderColor: expandedCategory === i ? "#21262d" : "transparent", borderRadius: 6, color: "#c9d1d9", cursor: "pointer", fontSize: 13, textAlign: "left", display: "flex", alignItems: "center", gap: 8, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                      <span>{cat.icon}</span><span style={{ flex: 1 }}>{cat.name}</span><span style={{ width: 6, height: 6, borderRadius: "50%", background: streamColors[cat.stream] }} />
                    </button>
                    {expandedCategory === i && (<div style={{ paddingLeft: 32, paddingTop: 4, paddingBottom: 4 }}>{cat.items.map((item, j) => (<div key={j} style={{ padding: "5px 8px", fontSize: 12, color: "#8b949e", cursor: "pointer", borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace" }}>+ {item}</div>))}</div>)}
                  </div>
                ))}
              </div>

              <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#8b949e", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Live Impact</div>
                {refinementSteps.map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < refinementSteps.length - 1 ? "1px solid #21262d" : "none" }}>
                    <span style={{ fontSize: 11, color: "#8b949e", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.step}</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 500, color: "#e6edf3" }}>{r.count.toLocaleString()}</span>
                    {r.change && (<span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: r.color, minWidth: 50, textAlign: "right" }}>{r.change > 0 ? "+" : ""}{r.change.toLocaleString()}</span>)}
                  </div>
                ))}
                <div style={{ marginTop: 10 }}>
                  <BarSimple value={currentCount} max={12450} color="#4ecdc4" />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#8b949e", marginTop: 4 }}><span>Current: {currentCount.toLocaleString()}</span><span>Base: 12,450</span></div>
                </div>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#8b949e", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Natural Language Query</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="text" value={nlQuery} onChange={e => setNlQuery(e.target.value)} placeholder="e.g. Patients aged 40-75 with POAG and progressive RNFL thinning..." style={{ flex: 1, padding: "10px 14px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, color: "#c9d1d9", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", outline: "none" }} />
                  <button style={{ padding: "10px 20px", background: "#4ecdc4", border: "none", borderRadius: 6, color: "#0d1117", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Parse</button>
                </div>
              </div>

              <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.05em" }}>Restrictive Criteria</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 300, color: "#4ecdc4" }}>{currentCount.toLocaleString()} <span style={{ fontSize: 11, color: "#8b949e" }}>patients</span></div>
                </div>
                {mockCriteria.map(c => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: enabledCriteria.includes(c.id) ? "#0d1117" : "#0d111766", border: "1px solid #21262d", borderRadius: 6, marginBottom: 6, fontSize: 13, opacity: enabledCriteria.includes(c.id) ? 1 : 0.5 }}>
                    <input type="checkbox" checked={enabledCriteria.includes(c.id)} onChange={() => setEnabledCriteria(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])} style={{ accentColor: "#4ecdc4" }} />
                    <StreamBadge stream={c.stream} />
                    <span style={{ color: "#4ecdc4", fontWeight: 600, minWidth: 90, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{c.field}</span>
                    <span style={{ color: "#8b949e" }}>{c.operator}</span>
                    <span style={{ color: "#e6edf3", flex: 1 }}>{c.value}</span>
                    <SourceBadge source={c.source} />
                    <ConfidenceBadge score={c.confidence} />
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#ef4444", minWidth: 50, textAlign: "right" }}>{c.impact.toLocaleString()}</span>
                  </div>
                ))}
                <button onClick={() => setShowAdditive(!showAdditive)} style={{ marginTop: 10, fontSize: 12, color: "#4ecdc4", background: "none", border: "1px dashed #4ecdc433", borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", width: "100%" }}>
                  {showAdditive ? "Hide" : "Show"} Additive Filters (expand cohort)
                </button>
                {showAdditive && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#4ecdc4", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Additive Criteria</div>
                    {additiveFilters.map(c => (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "#0d1117", border: "1px solid #1a3a2a", borderRadius: 6, marginBottom: 6, fontSize: 13 }}>
                        <input type="checkbox" checked={enabledAdditive.includes(c.id)} onChange={() => setEnabledAdditive(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])} style={{ accentColor: "#4ecdc4" }} />
                        <StreamBadge stream={c.stream} />
                        <span style={{ color: "#4ecdc4", fontWeight: 600, minWidth: 90, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{c.field}</span>
                        <span style={{ color: "#e6edf3", flex: 1 }}>{c.value}</span>
                        <SourceBadge source={c.source} />
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#4ecdc4", minWidth: 50, textAlign: "right" }}>+{c.impact}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#8b949e", textTransform: "uppercase" }}>Live Preview</div>
                  <button onClick={() => setActiveStage(1)} style={{ padding: "8px 16px", background: "#4ecdc4", border: "none", borderRadius: 6, color: "#0d1117", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Full Results →</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[{ label: "Patients", val: currentCount.toLocaleString(), color: "#4ecdc4" }, { label: "Sites", val: "11", color: "#e6edf3" }, { label: "Avg Confidence", val: "94%", color: "#4ecdc4", sub: "records ≥ 0.9" }].map((m, i) => (
                    <div key={i} style={{ padding: 12, background: "#0d1117", borderRadius: 6, border: "1px solid #21262d" }}>
                      <div style={{ fontSize: 10, color: "#8b949e", textTransform: "uppercase" }}>{m.label}</div>
                      <div style={{ fontSize: 24, fontWeight: 300, color: m.color, fontFamily: "'IBM Plex Mono', monospace" }}>{m.val}</div>
                      {m.sub && <div style={{ fontSize: 9, color: "#8b949e" }}>{m.sub}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeStage === 1 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
              <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 10, color: "#8b949e", textTransform: "uppercase" }}>Total Patients</div>
                <div style={{ fontSize: 30, fontWeight: 300, color: "#4ecdc4", fontFamily: "'IBM Plex Mono', monospace" }}>{mockResults.totalPatients.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: "#8b949e" }}>across {mockResults.sites.length} sites</div>
              </div>
              <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 10, color: "#8b949e", textTransform: "uppercase" }}>Mean Age</div>
                <div style={{ fontSize: 30, fontWeight: 300, color: "#e6edf3", fontFamily: "'IBM Plex Mono', monospace" }}>{mockResults.demographics.meanAge}</div>
                <div style={{ fontSize: 11, color: "#8b949e" }}>{mockResults.demographics.female}% F · {mockResults.demographics.male}% M</div>
              </div>
              <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 10, color: "#8b949e", textTransform: "uppercase" }}>NLP Confidence</div>
                <div style={{ display: "flex", gap: 4, marginTop: 8, marginBottom: 6 }}>
                  <div style={{ flex: 78, height: 8, background: "#4ecdc4", borderRadius: "4px 0 0 4px" }} />
                  <div style={{ flex: 16, height: 8, background: "#ffd93d" }} />
                  <div style={{ flex: 6, height: 8, background: "#ff6b6b", borderRadius: "0 4px 4px 0" }} />
                </div>
                <div style={{ display: "flex", gap: 8, fontSize: 10 }}>
                  <span style={{ color: "#4ecdc4" }}>78% High</span>
                  <span style={{ color: "#ffd93d" }}>16% Med</span>
                  <span style={{ color: "#ff6b6b" }}>6% Low</span>
                </div>
              </div>
              <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 10, color: "#8b949e", textTransform: "uppercase" }}>Access Tier</div>
                <div style={{ marginTop: 8 }}><AccessTierBadge tier="aggregate" /></div>
                <div style={{ fontSize: 11, color: "#4ecdc4", marginTop: 6, cursor: "pointer" }}>Request de-identified →</div>
              </div>
            </div>

            <div style={{ background: "#1a2332", border: "1px solid #21262d", borderRadius: 8, padding: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 18 }}>🛡️</span>
              <div style={{ fontSize: 12, color: "#c9d1d9", lineHeight: 1.5 }}>
                <strong style={{ color: "#60a5fa" }}>Trust Summary:</strong> 78% of records matched at ≥0.9 confidence. 6% ({Math.round(1847 * 0.06)} patients) flagged as low confidence — highlighted in the patient table for spot-checking. Click "Source" on any record to view the original clinical text that triggered the NLP extraction.
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#8b949e", marginBottom: 14, textTransform: "uppercase" }}>Geographic Distribution</div>
                {mockResults.sites.map((site, i) => (<div key={i} style={{ marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span>{site.name}</span><span style={{ color: "#8b949e", fontFamily: "'IBM Plex Mono', monospace" }}>{site.count} ({site.pct}%)</span></div><BarSimple value={site.count} max={500} color="#4ecdc4" /></div>))}
              </div>
              <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#8b949e", marginBottom: 14, textTransform: "uppercase" }}>Triple-Stream Data Coverage</div>
                {[{ stream: "Contextual", desc: "Demographics, diagnoses, medications", pct: 100, color: streamColors.contextual }, { stream: "Functional", desc: "IOP, visual acuity, visual field", pct: 94, color: streamColors.functional }, { stream: "Structural", desc: "RNFL, macular thickness, C/D ratio", pct: 87, color: streamColors.structural }].map((s, i) => (
                  <div key={i} style={{ marginBottom: 14 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}><span style={{ color: s.color, fontWeight: 500 }}>{s.stream}</span><span style={{ color: "#8b949e", fontFamily: "'IBM Plex Mono', monospace" }}>{s.pct}% available</span></div><div style={{ fontSize: 10, color: "#8b949e", marginBottom: 4 }}>{s.desc}</div><BarSimple value={s.pct} max={100} color={s.color} /></div>
                ))}
              </div>
            </div>

            <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showPatientList ? 16 : 0 }}>
                <div><div style={{ fontSize: 12, fontWeight: 600, color: "#8b949e", textTransform: "uppercase" }}>De-identified Patient Records</div>{!showPatientList && <div style={{ fontSize: 12, color: "#8b949e", marginTop: 4 }}>Requires de-identified access tier</div>}</div>
                <button onClick={() => setShowPatientList(!showPatientList)} style={{ padding: "8px 16px", background: showPatientList ? "#21262d" : "#1a3a2a", border: `1px solid ${showPatientList ? "#30363d" : "#4ecdc4"}`, borderRadius: 6, color: showPatientList ? "#8b949e" : "#4ecdc4", fontSize: 12, cursor: "pointer" }}>{showPatientList ? "Collapse ▴" : "Expand Records ▾"}</button>
              </div>
              {showPatientList && (<div>
                <div style={{ marginBottom: 10, display: "flex", gap: 8, alignItems: "center" }}><AccessTierBadge tier="deidentified" /><span style={{ fontSize: 11, color: "#8b949e" }}>Sorted by confidence (lowest first for spot-checking)</span></div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead><tr style={{ borderBottom: "1px solid #21262d" }}>{["ID", "Age", "Sex", "IOP", "RNFL", "Trend", "VF MD", "Source", "Confidence", ""].map(h => (<th key={h} style={{ padding: "8px 8px", textAlign: "left", color: "#8b949e", fontWeight: 500, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }}>{h}</th>))}</tr></thead>
                  <tbody>{mockPatients.map((p, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #161b22", background: p.confidence < 0.8 ? "#2a1a1a" : "transparent" }}>
                      <td style={{ padding: "10px 8px", fontFamily: "'IBM Plex Mono', monospace", color: "#4ecdc4" }}>{p.id}</td>
                      <td style={{ padding: "10px 8px" }}>{p.age}</td>
                      <td style={{ padding: "10px 8px" }}>{p.sex}</td>
                      <td style={{ padding: "10px 8px", fontFamily: "'IBM Plex Mono', monospace" }}>{p.iop}</td>
                      <td style={{ padding: "10px 8px", fontFamily: "'IBM Plex Mono', monospace", color: "#ff6b6b" }}>{p.rnfl}</td>
                      <td style={{ padding: "10px 6px" }}><RNFLSparkline data={p.rnflData} /></td>
                      <td style={{ padding: "10px 8px", fontFamily: "'IBM Plex Mono', monospace" }}>{p.vf}</td>
                      <td style={{ padding: "10px 8px" }}><SourceBadge source={p.source} /></td>
                      <td style={{ padding: "10px 8px" }}><ConfidenceBadge score={p.confidence} /></td>
                      <td style={{ padding: "10px 8px" }}><button onClick={() => setShowProvenance(showProvenance === p.id ? null : p.id)} style={{ fontSize: 10, padding: "3px 8px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 4, color: "#8b949e", cursor: "pointer" }}>{showProvenance === p.id ? "Hide" : "Source"}</button></td>
                    </tr>
                  ))}</tbody>
                </table>
                {showProvenance && (
                  <div style={{ marginTop: 12, padding: "12px 14px", background: "#0d1117", border: "1px solid #21262d", borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: "#8b949e", textTransform: "uppercase", marginBottom: 6 }}>Source Provenance — {showProvenance}</div>
                    <div style={{ fontSize: 12, color: "#e6edf3", fontFamily: "'IBM Plex Mono', monospace", padding: "8px 10px", background: "#161b22", borderRadius: 4, border: "1px solid #21262d" }}>"{mockPatients.find(p => p.id === showProvenance)?.matchedText}"</div>
                    <div style={{ fontSize: 10, color: "#8b949e", marginTop: 6 }}>Original clinical text that triggered the NLP extraction. Verify that the extracted diagnosis matches the clinical intent.</div>
                  </div>
                )}
                <div style={{ fontSize: 10, color: "#8b949e", marginTop: 10, fontStyle: "italic" }}>Low-confidence records (highlighted) sorted first for efficient spot-checking. Click "Source" to view original clinical text.</div>
              </div>)}
            </div>
          </div>
        )}

        {activeStage === 2 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
              {[{ title: "Save & Share", desc: "Save cohort definition or share with collaborators", icon: "💾", actions: ["Save query", "Share with team", "Duplicate as template"] }, { title: "Export for REB / Grants", desc: "Generate feasibility summaries for ethics board and grant proposals", icon: "📄", actions: ["Feasibility report (PDF)", "Cohort summary (CSV)", "Site distribution report"] }, { title: "Transfer to REDCap", desc: "Export validated cohort via API for structured data capture", icon: "🔗", actions: ["Create REDCap project", "Map variables", "Initiate transfer"] }].map((card, i) => (
                <div key={i} style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 24, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{card.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#e6edf3", marginBottom: 6 }}>{card.title}</div>
                  <div style={{ fontSize: 12, color: "#8b949e", marginBottom: 16, lineHeight: 1.5 }}>{card.desc}</div>
                  <div style={{ marginTop: "auto" }}>{card.actions.map((a, j) => (<button key={j} style={{ display: "block", width: "100%", padding: "8px 12px", marginBottom: 6, background: j === 0 ? "#1a3a2a" : "#0d1117", border: `1px solid ${j === 0 ? "#4ecdc4" : "#21262d"}`, borderRadius: 6, color: j === 0 ? "#4ecdc4" : "#8b949e", fontSize: 12, cursor: "pointer", textAlign: "left", fontFamily: "'IBM Plex Sans', sans-serif" }}>{a}</button>))}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#1a2332", border: "1px solid #21262d", borderRadius: 8, padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 11, color: "#8b949e", lineHeight: 1.6 }}><span style={{ fontWeight: 600, color: "#e6edf3" }}>Governance Note: </span>Export actions are constrained by your current access tier. Aggregate-level exports are available now. De-identified cohort export requires tier escalation. Protocol-based identified access requires REB approval.</div>
              <div style={{ flexShrink: 0, display: "flex", gap: 8 }}><AccessTierBadge tier="aggregate" /><AccessTierBadge tier="deidentified" /><AccessTierBadge tier="protocol" /></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
