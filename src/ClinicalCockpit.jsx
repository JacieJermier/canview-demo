import { useState } from "react";

const VISITS = [
  { date: "2026-02-14", label: "Feb 2026", iop_od: 23, iop_os: 21, rnfl_od: 61, rnfl_os: 68, vf_od: -4.8, vf_os: -3.1, cdr_od: 0.72, cdr_os: 0.65, va_od: "20/30", va_os: "20/25", cct_od: 528, cct_os: 532 },
  { date: "2025-08-10", label: "Aug 2025", iop_od: 22, iop_os: 20, rnfl_od: 63, rnfl_os: 69, vf_od: -4.2, vf_os: -2.8, cdr_od: 0.70, cdr_os: 0.64, va_od: "20/30", va_os: "20/25", cct_od: 529, cct_os: 533 },
  { date: "2025-02-05", label: "Feb 2025", iop_od: 24, iop_os: 22, rnfl_od: 65, rnfl_os: 71, vf_od: -3.8, vf_os: -2.5, cdr_od: 0.68, cdr_os: 0.63, va_od: "20/25", va_os: "20/25", cct_od: 530, cct_os: 534 },
  { date: "2024-08-12", label: "Aug 2024", iop_od: 21, iop_os: 19, rnfl_od: 67, rnfl_os: 72, vf_od: -3.4, vf_os: -2.3, cdr_od: 0.66, cdr_os: 0.62, va_od: "20/25", va_os: "20/20", cct_od: 531, cct_os: 535 },
  { date: "2024-02-08", label: "Feb 2024", iop_od: 25, iop_os: 23, rnfl_od: 70, rnfl_os: 74, vf_od: -2.9, vf_os: -2.0, cdr_od: 0.64, cdr_os: 0.60, va_od: "20/25", va_os: "20/20", cct_od: 531, cct_os: 536 },
  { date: "2023-07-20", label: "Jul 2023", iop_od: 20, iop_os: 18, rnfl_od: 73, rnfl_os: 76, vf_od: -2.4, vf_os: -1.7, cdr_od: 0.62, cdr_os: 0.58, va_od: "20/20", va_os: "20/20", cct_od: 532, cct_os: 536 },
];

const MEDS = [
  { name: "Timolol 0.5%", route: "OD/OS", freq: "BID", start: "2024-02", end: null, active: true, notes: null },
  { name: "Latanoprost 0.005%", route: "OD/OS", freq: "QHS", start: "2023-07", end: null, active: true, notes: null },
  { name: "Brimonidine 0.2%", route: "OD", freq: "TID", start: "2025-02", end: "2025-06", active: false, notes: "D/C — ocular allergy" },
];

const PATIENT = {
  name: "Margaret Chen", id: "PT-00291", dob: "1963-11-04", age: 62, sex: "F",
  dx: "Primary Open-Angle Glaucoma (POAG)", dxDate: "2023-07",
  allergies: "Sulfonamides", systemic: "Hypertension (controlled), Type 2 Diabetes",
};

// RNFL sector data (clock hours) for OCT circle visualization
// Sectors: T, TS, TI, N, NS, NI (Temporal, Temp-Sup, Temp-Inf, Nasal, Nas-Sup, Nas-Inf)
const RNFL_SECTORS = {
  od_current:  { T: 52, TS: 95, S: 78, NS: 68, N: 55, NI: 62, I: 82, TI: 98 },
  od_baseline: { T: 58, TS: 110, S: 92, NS: 78, N: 60, NI: 70, I: 95, TI: 112 },
  os_current:  { T: 58, TS: 105, S: 88, NS: 75, N: 60, NI: 68, I: 92, TI: 108 },
  os_baseline: { T: 62, TS: 115, S: 98, NS: 82, N: 64, NI: 74, I: 100, TI: 118 },
};

// Visual field points (simplified 24-2 grid)
// Values represent sensitivity in dB; lower = worse
const VF_GRID = {
  od: [
    [null,null,28, 26, 24, 20,null,null],
    [null, 29, 28, 25, 22, 18, 15,null],
    [30, 29, 27, 24, 20, 16, 12, 10],
    [30, 28, 26, 23, 19, 14, 10,  8],
    [30, 29, 27, 24, 20, 15, 11,  9],
    [null, 29, 28, 25, 22, 17, 14,null],
    [null,null,28, 27, 24, 20,null,null],
  ],
  os: [
    [null,null,20, 24, 26, 28,null,null],
    [null, 22, 24, 26, 28, 29, 29,null],
    [18, 20, 23, 25, 27, 28, 29, 30],
    [16, 19, 22, 25, 27, 28, 29, 30],
    [17, 21, 24, 26, 27, 28, 29, 30],
    [null, 22, 25, 26, 28, 29, 29,null],
    [null,null,24, 26, 27, 28,null,null],
  ],
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --bg: #FAFAF8;
    --surface: #FFFFFF;
    --border: #E8E6E1;
    --border-light: #F0EEEA;
    --text-primary: #1A1A18;
    --text-secondary: #6B6960;
    --text-tertiary: #9C9889;
    --accent: #2563EB;
    --accent-light: #EFF6FF;
    --decline: #DC2626;
    --decline-bg: #FEF2F2;
    --decline-light: #FECACA;
    --caution: #D97706;
    --caution-bg: #FFFBEB;
    --stable: #059669;
    --stable-bg: #ECFDF5;
    --od-color: #2563EB;
    --os-color: #7C3AED;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .cockpit {
    min-height: 100vh;
    background: var(--bg);
    font-family: 'DM Sans', sans-serif;
    color: var(--text-primary);
  }

  .cockpit-header {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 12px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .cockpit-brand { display: flex; align-items: center; gap: 10px; }

  .cockpit-logo {
    width: 28px; height: 28px; border-radius: 6px;
    background: linear-gradient(135deg, #1e40af, #3b82f6);
    display: flex; align-items: center; justify-content: center;
    color: white; font-weight: 700; font-size: 11px;
  }

  .cockpit-title { font-family: 'Source Serif 4', serif; font-size: 17px; font-weight: 600; letter-spacing: -0.02em; }
  .cockpit-subtitle { font-size: 11px; color: var(--text-tertiary); font-family: 'JetBrains Mono', monospace; }

  .patient-banner {
    background: var(--surface); border-bottom: 1px solid var(--border);
    padding: 14px 28px; display: flex; align-items: center; gap: 24px;
  }

  .patient-name { font-family: 'Source Serif 4', serif; font-size: 22px; font-weight: 600; letter-spacing: -0.03em; }

  .patient-meta { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  .meta-chip { font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 4px; }
  .meta-chip .label { color: var(--text-tertiary); font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; }
  .dx-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: var(--decline-bg); border: 1px solid var(--decline-light); border-radius: 4px; font-size: 12px; font-weight: 500; color: var(--decline); }
  .allergy-chip { font-size: 11px; padding: 3px 8px; border-radius: 4px; background: var(--decline-bg); border: 1px solid var(--decline-light); color: var(--decline); font-weight: 500; }

  .cockpit-body { padding: 20px 28px; display: grid; grid-template-columns: 1fr 300px; gap: 20px; max-width: 1440px; margin: 0 auto; }
  .main-col { display: flex; flex-direction: column; gap: 16px; }
  .side-col { display: flex; flex-direction: column; gap: 16px; }

  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
  .card-header { padding: 14px 18px 10px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); }
  .card-title { font-family: 'Source Serif 4', serif; font-size: 15px; font-weight: 600; letter-spacing: -0.01em; }
  .card-body { padding: 16px 18px; }

  .trend-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  .eye-label { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px; }
  .eye-label.od { color: var(--od-color); }
  .eye-label.os { color: var(--os-color); }

  .metric-current { font-family: 'JetBrains Mono', monospace; font-size: 28px; font-weight: 500; letter-spacing: -0.03em; line-height: 1; }
  .metric-unit { font-size: 12px; color: var(--text-tertiary); font-family: 'DM Sans', sans-serif; margin-left: 2px; }
  .metric-delta { font-size: 11px; font-family: 'JetBrains Mono', monospace; margin-top: 4px; display: inline-flex; align-items: center; gap: 3px; padding: 2px 6px; border-radius: 3px; }
  .metric-delta.decline { color: var(--decline); background: var(--decline-bg); }
  .metric-delta.caution { color: var(--caution); background: var(--caution-bg); }
  .metric-delta.stable { color: var(--stable); background: var(--stable-bg); }

  .sparkline-container { margin-top: 10px; position: relative; }

  .visit-nav { display: flex; gap: 6px; flex-wrap: wrap; }
  .visit-pill { padding: 5px 10px; border: 1px solid var(--border); border-radius: 20px; font-size: 11px; font-family: 'JetBrains Mono', monospace; cursor: pointer; background: var(--surface); color: var(--text-secondary); transition: all 0.15s; }
  .visit-pill:hover { border-color: var(--accent); color: var(--accent); }
  .visit-pill.active { background: var(--accent); color: white; border-color: var(--accent); }

  .med-item { padding: 10px 0; border-bottom: 1px solid var(--border-light); display: flex; gap: 10px; align-items: flex-start; }
  .med-item:last-child { border-bottom: none; }
  .med-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
  .med-dot.active { background: var(--stable); }
  .med-dot.inactive { background: var(--text-tertiary); }
  .med-name { font-size: 13px; font-weight: 500; }
  .med-detail { font-size: 11px; color: var(--text-tertiary); font-family: 'JetBrains Mono', monospace; }
  .med-note { font-size: 11px; color: var(--caution); font-style: italic; }

  .insight-card { background: #F8FAFF; border: 1px solid #DBEAFE; border-radius: 8px; padding: 14px; margin-bottom: 10px; }
  .insight-card:last-child { margin-bottom: 0; }
  .insight-tag { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent); margin-bottom: 6px; }
  .insight-text { font-size: 12.5px; line-height: 1.55; }
  .insight-source { font-size: 10px; color: var(--text-tertiary); margin-top: 6px; font-family: 'JetBrains Mono', monospace; }

  .progression-bar { display: flex; align-items: center; gap: 8px; padding: 8px 0; }
  .progression-label { font-size: 12px; color: var(--text-secondary); min-width: 80px; }
  .progression-track { flex: 1; height: 6px; background: var(--border-light); border-radius: 3px; overflow: hidden; }
  .progression-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
  .progression-value { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--text-secondary); min-width: 50px; text-align: right; }

  .compare-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-family: 'JetBrains Mono', monospace; padding: 3px 8px; border-radius: 4px; color: var(--text-tertiary); background: var(--bg); border: 1px solid var(--border); }

  .tab-row { display: flex; gap: 0; border-bottom: 1px solid var(--border); padding: 0 18px; }
  .tab-btn { padding: 10px 16px; font-size: 12px; font-weight: 500; color: var(--text-tertiary); background: none; border: none; cursor: pointer; border-bottom: 2px solid transparent; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
  .tab-btn:hover { color: var(--text-secondary); }
  .tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); }

  .systemic-row { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
  .systemic-chip { font-size: 11px; padding: 3px 8px; border-radius: 4px; background: var(--bg); border: 1px solid var(--border); color: var(--text-secondary); }

  .imaging-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .imaging-panel { text-align: center; }
  .imaging-label { font-size: 10px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 8px; }
  .imaging-timestamp { font-size: 9px; color: var(--text-tertiary); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

  .sector-legend { display: flex; gap: 10px; justify-content: center; margin-top: 12px; flex-wrap: wrap; }
  .sector-legend-item { display: flex; align-items: center; gap: 4px; font-size: 10px; color: var(--text-secondary); }
  .sector-legend-dot { width: 10px; height: 10px; border-radius: 2px; }

  .vf-grid-container { display: inline-block; background: #111; border-radius: 6px; padding: 8px; }
`;

function Sparkline({ data, color, width = 200, height = 50 }) {
  const min = Math.min(...data) - 2;
  const max = Math.max(...data) + 2;
  const points = data.map((v, i) => {
    const x = 8 + (i / (data.length - 1)) * (width - 16);
    const y = 6 + ((max - v) / (max - min)) * (height - 12);
    return { x, y, v };
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  return (
    <svg width={width} height={height + 16} style={{ display: "block" }}>
      <line x1={8} y1={6} x2={width - 8} y2={6} stroke="#E8E6E1" strokeWidth={0.5} strokeDasharray="3,3" />
      <line x1={8} y1={height - 6} x2={width - 8} y2={height - 6} stroke="#E8E6E1" strokeWidth={0.5} strokeDasharray="3,3" />
      <text x={width - 8} y={4} textAnchor="end" fontSize={8} fill="#9C9889" fontFamily="JetBrains Mono">{max.toFixed(0)}</text>
      <text x={width - 8} y={height} textAnchor="end" fontSize={8} fill="#9C9889" fontFamily="JetBrains Mono">{min.toFixed(0)}</text>
      <path d={`${path} L ${points[points.length - 1].x} ${height - 6} L ${points[0].x} ${height - 6} Z`} fill={color} opacity={0.07} />
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3.5} fill="white" stroke={color} strokeWidth={1.5} />
          <text x={p.x} y={height + 14} textAnchor="middle" fontSize={7} fill="#9C9889" fontFamily="JetBrains Mono">{VISITS[VISITS.length - 1 - i].label.split(" ")[0]}</text>
        </g>
      ))}
    </svg>
  );
}

function ProgressionMeter({ label, current, baseline, unit, worse = "lower" }) {
  const change = current - baseline;
  const pct = Math.min(Math.abs(change / baseline) * 100, 100);
  const severity = pct > 10 ? "decline" : pct > 5 ? "caution" : "stable";
  const colors = { decline: "#DC2626", caution: "#D97706", stable: "#059669" };
  return (
    <div className="progression-bar">
      <span className="progression-label">{label}</span>
      <div className="progression-track">
        <div className="progression-fill" style={{ width: `${Math.min(pct * 3, 100)}%`, background: colors[severity] }} />
      </div>
      <span className="progression-value" style={{ color: colors[severity] }}>
        {change > 0 ? "+" : ""}{change.toFixed(1)}{unit}
      </span>
    </div>
  );
}

// OCT RNFL Circle Map — shows thickness by sector around optic nerve
function RNFLCircleMap({ sectors, eye, size = 180 }) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 8;
  const innerR = size / 6;
  const sectorNames = ["T", "TS", "S", "NS", "N", "NI", "I", "TI"];
  const sectorAngles = sectorNames.map((_, i) => (i * 360) / 8 - 90);
  const eyeColor = eye === "od" ? "#2563EB" : "#7C3AED";

  function getColor(val) {
    if (val >= 90) return "#22c55e";
    if (val >= 70) return "#86efac";
    if (val >= 55) return "#fbbf24";
    if (val >= 40) return "#f97316";
    return "#ef4444";
  }

  function polarToCart(angle, r) {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function sectorPath(startAngle, endAngle, innerR, outerR) {
    const s1 = polarToCart(startAngle, innerR);
    const e1 = polarToCart(endAngle, innerR);
    const s2 = polarToCart(startAngle, outerR);
    const e2 = polarToCart(endAngle, outerR);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${s2.x} ${s2.y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${e2.x} ${e2.y} L ${e1.x} ${e1.y} A ${innerR} ${innerR} 0 ${largeArc} 0 ${s1.x} ${s1.y} Z`;
  }

  return (
    <svg width={size} height={size} style={{ display: "block", margin: "0 auto" }}>
      {/* Background disc */}
      <circle cx={cx} cy={cy} r={outerR} fill="#f5f5f0" stroke="#E8E6E1" strokeWidth={1} />

      {/* Sectors */}
      {sectorNames.map((name, i) => {
        const startAngle = sectorAngles[i] - 22.5;
        const endAngle = sectorAngles[i] + 22.5;
        const val = sectors[name];
        const mid = polarToCart(sectorAngles[i], (innerR + outerR) / 2);
        return (
          <g key={name}>
            <path d={sectorPath(startAngle, endAngle, innerR, outerR)} fill={getColor(val)} opacity={0.85} stroke="white" strokeWidth={1.5} />
            <text x={mid.x} y={mid.y - 4} textAnchor="middle" fontSize={10} fontWeight={600} fill="#1A1A18" fontFamily="JetBrains Mono">{val}</text>
            <text x={mid.x} y={mid.y + 7} textAnchor="middle" fontSize={7} fill="#6B6960" fontFamily="DM Sans">{name}</text>
          </g>
        );
      })}

      {/* Center - optic disc */}
      <circle cx={cx} cy={cy} r={innerR} fill="#FFF8F0" stroke="#E8E6E1" strokeWidth={1} />
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize={9} fontWeight={600} fill={eyeColor} fontFamily="JetBrains Mono">
        {eye.toUpperCase()}
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize={7} fill="#9C9889" fontFamily="DM Sans">RNFL</text>
    </svg>
  );
}

// Fundus / Optic Disc visualization showing cup-to-disc ratio
function FundusDisc({ cdr, eye, size = 160 }) {
  const cx = size / 2;
  const cy = size / 2;
  const discR = size / 2 - 16;
  const cupR = discR * cdr;
  const eyeColor = eye === "od" ? "#2563EB" : "#7C3AED";
  const severity = cdr >= 0.7 ? "#DC2626" : cdr >= 0.6 ? "#D97706" : "#059669";

  // Simulate blood vessels
  const vessels = [
    { angle: -40, length: discR * 1.3 },
    { angle: -60, length: discR * 1.2 },
    { angle: -80, length: discR * 1.1 },
    { angle: 40, length: discR * 1.3 },
    { angle: 60, length: discR * 1.2 },
    { angle: 80, length: discR * 1.1 },
    { angle: 200, length: discR * 1.0 },
    { angle: 220, length: discR * 1.1 },
    { angle: 160, length: discR * 1.0 },
    { angle: 140, length: discR * 1.1 },
  ];

  return (
    <svg width={size} height={size} style={{ display: "block", margin: "0 auto" }}>
      {/* Retinal background */}
      <circle cx={cx} cy={cy} r={size / 2 - 4} fill="#C85A2B" opacity={0.15} />
      <circle cx={cx} cy={cy} r={size / 2 - 4} fill="none" stroke="#C85A2B" strokeWidth={0.5} opacity={0.3} />

      {/* Blood vessels */}
      {vessels.map((v, i) => {
        const rad = (v.angle * Math.PI) / 180;
        const ex = cx + v.length * Math.cos(rad);
        const ey = cy + v.length * Math.sin(rad);
        const ctrl1x = cx + (discR * 0.3) * Math.cos(rad + 0.3);
        const ctrl1y = cy + (discR * 0.3) * Math.sin(rad + 0.3);
        return (
          <path key={i} d={`M ${cx} ${cy} Q ${ctrl1x} ${ctrl1y} ${ex} ${ey}`}
            fill="none" stroke="#8B2010" strokeWidth={1.2} opacity={0.25} strokeLinecap="round" />
        );
      })}

      {/* Neuroretinal rim (disc) */}
      <circle cx={cx} cy={cy} r={discR} fill="#F5C87A" stroke="#D4A856" strokeWidth={1} opacity={0.9} />

      {/* Cup */}
      <circle cx={cx} cy={cy} r={cupR} fill="#FEFCE8" stroke={severity} strokeWidth={1.5} strokeDasharray="3,2" opacity={0.95} />

      {/* Labels */}
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize={11} fontWeight={600} fill={severity} fontFamily="JetBrains Mono">
        {cdr.toFixed(2)}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={7} fill="#6B6960" fontFamily="DM Sans">C/D</text>

      {/* Eye label */}
      <text x={size - 8} y={14} textAnchor="end" fontSize={10} fontWeight={600} fill={eyeColor} fontFamily="JetBrains Mono">
        {eye.toUpperCase()}
      </text>
    </svg>
  );
}

// Visual Field grayscale map
function VisualFieldMap({ grid, eye, size = 180 }) {
  const rows = grid.length;
  const cols = grid[0].length;
  const cellSize = Math.floor((size - 16) / Math.max(rows, cols));
  const offsetX = (size - cols * cellSize) / 2;
  const offsetY = (size - rows * cellSize) / 2;
  const eyeColor = eye === "od" ? "#2563EB" : "#7C3AED";

  function getGray(val) {
    if (val === null) return "transparent";
    // Map 0-32 dB to brightness (32=bright, 0=black)
    const brightness = Math.round((val / 32) * 220);
    return `rgb(${brightness}, ${brightness + 10}, ${brightness})`;
  }

  function getDefectColor(val) {
    if (val === null) return "transparent";
    if (val >= 26) return "#22c55e20";
    if (val >= 20) return "#86efac30";
    if (val >= 14) return "#fbbf2440";
    if (val >= 8) return "#f9731650";
    return "#ef444460";
  }

  return (
    <svg width={size} height={size + 20} style={{ display: "block", margin: "0 auto" }}>
      <rect x={offsetX - 4} y={offsetY - 4} width={cols * cellSize + 8} height={rows * cellSize + 8} rx={6} fill="#111" />
      {grid.map((row, r) =>
        row.map((val, c) => {
          if (val === null) return null;
          const x = offsetX + c * cellSize;
          const y = offsetY + r * cellSize;
          return (
            <g key={`${r}-${c}`}>
              <rect x={x + 0.5} y={y + 0.5} width={cellSize - 1} height={cellSize - 1} rx={2} fill={getGray(val)} />
              <rect x={x + 0.5} y={y + 0.5} width={cellSize - 1} height={cellSize - 1} rx={2} fill={getDefectColor(val)} />
              <text x={x + cellSize / 2} y={y + cellSize / 2 + 3} textAnchor="middle" fontSize={7} fill={val < 14 ? "#fca5a5" : "#888"} fontFamily="JetBrains Mono">
                {val}
              </text>
            </g>
          );
        })
      )}
      {/* Blind spot */}
      <circle cx={offsetX + (eye === "od" ? 5.5 : 2.5) * cellSize} cy={offsetY + 3.5 * cellSize} r={cellSize * 0.35} fill="#111" stroke="#333" strokeWidth={0.5} />

      <text x={size / 2} y={size + 14} textAnchor="middle" fontSize={9} fontWeight={600} fill={eyeColor} fontFamily="JetBrains Mono">
        {eye.toUpperCase()} · 24-2
      </text>
    </svg>
  );
}

export default function ClinicalCockpit() {
  const [selectedVisit, setSelectedVisit] = useState(0);
  const [activeTab, setActiveTab] = useState("trends");
  const [imageTab, setImageTab] = useState("oct");
  const [viewMode, setViewMode] = useState("patient");
  const [practiceQuery, setPracticeQuery] = useState("");

  const current = VISITS[0];
  const baseline = VISITS[VISITS.length - 1];
  const previous = VISITS[1];

  const iopData_od = VISITS.map(v => v.iop_od).reverse();
  const iopData_os = VISITS.map(v => v.iop_os).reverse();
  const rnflData_od = VISITS.map(v => v.rnfl_od).reverse();
  const rnflData_os = VISITS.map(v => v.rnfl_os).reverse();
  const vfData_od = VISITS.map(v => v.vf_od).reverse();
  const vfData_os = VISITS.map(v => v.vf_os).reverse();

  return (
    <div className="cockpit">
      <style>{CSS}</style>

      {/* Header */}
      <div className="cockpit-header">
        <div className="cockpit-brand">
          <div className="cockpit-logo">CC</div>
          <div>
            <div className="cockpit-title">Clinical Cockpit</div>
            <div className="cockpit-subtitle">CAN-VIEW · Glaucoma Monitor</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", background: "var(--bg)", borderRadius: 6, border: "1px solid var(--border)", overflow: "hidden" }}>
            {[{ id: "patient", label: "Patient View" }, { id: "practice", label: "Practice Search" }].map(m => (
              <button key={m.id} onClick={() => setViewMode(m.id)} style={{ padding: "6px 14px", fontSize: 11, fontWeight: viewMode === m.id ? 600 : 400, cursor: "pointer", border: "none", fontFamily: "'DM Sans', sans-serif", background: viewMode === m.id ? "var(--accent)" : "transparent", color: viewMode === m.id ? "white" : "var(--text-secondary)", transition: "all 0.15s" }}>{m.label}</button>
            ))}
          </div>
          <div className="compare-badge">Last visit: {previous.label} · Next: Aug 2026</div>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>SW</div>
        </div>
      </div>

      {/* Practice Search Mode */}
      {viewMode === "practice" && (
        <div style={{ padding: "20px 28px", maxWidth: 1440, margin: "0 auto" }}>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <div className="card-title">Practice-Level Search</div>
              <div className="compare-badge">Circle of Care · UW Optometry Clinic · 2,847 patients</div>
            </div>
            <div className="card-body">
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input type="text" value={practiceQuery} onChange={e => setPracticeQuery(e.target.value)} placeholder="e.g. Glaucoma patients with IOP above target on current medication..." style={{ flex: 1, padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
                <button style={{ padding: "10px 20px", background: "var(--accent)", border: "none", borderRadius: 6, color: "white", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Search</button>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Glaucoma patients with IOP > 21", "RNFL thinning > 5μm since last visit", "Patients overdue for visual field test", "Uncontrolled IOP on dual therapy", "New patients presenting as asymptomatic with findings"].map((q, i) => (
                  <button key={i} onClick={() => setPracticeQuery(q)} style={{ padding: "5px 10px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 11, cursor: "pointer", background: "var(--surface)", color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif" }}>{q}</button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
            {[{ label: "Matching Patients", value: "142", color: "var(--accent)" }, { label: "Above IOP Target", value: "38", color: "var(--decline)" }, { label: "Fast Progressors", value: "12", color: "var(--decline)" }, { label: "Asymptomatic w/ Findings", value: "67", color: "var(--caution)" }].map((s, i) => (
              <div key={i} className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 300, color: s.color, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <div className="card-title">Matching Patients</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Sorted by progression severity</div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)" }}>
                    {["Patient", "Age", "Dx", "IOP (OD/OS)", "RNFL Change", "VF MD Rate", "Last Visit", "Status"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "var(--text-tertiary)", fontWeight: 500, fontSize: 11 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "M. Chen", age: 62, dx: "POAG", iop: "24/22", rnfl: "-12μm", vfRate: "-0.9 dB/yr", lastVisit: "Feb 2026", status: "urgent" },
                    { name: "R. Patel", age: 58, dx: "POAG", iop: "26/24", rnfl: "-9μm", vfRate: "-0.7 dB/yr", lastVisit: "Jan 2026", status: "watch" },
                    { name: "J. Wilson", age: 71, dx: "POAG suspect", iop: "22/20", rnfl: "-7μm", vfRate: "-0.5 dB/yr", lastVisit: "Dec 2025", status: "watch" },
                    { name: "L. Kim", age: 45, dx: "OHT", iop: "23/23", rnfl: "-3μm", vfRate: "-0.2 dB/yr", lastVisit: "Feb 2026", status: "stable" },
                    { name: "S. Nair", age: 66, dx: "POAG", iop: "19/18", rnfl: "-2μm", vfRate: "-0.1 dB/yr", lastVisit: "Jan 2026", status: "stable" },
                  ].map((p, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border-light)", cursor: "pointer" }} onClick={() => setViewMode("patient")}>
                      <td style={{ padding: "10px 14px", fontWeight: 500 }}>{p.name}</td>
                      <td style={{ padding: "10px 14px" }}>{p.age}</td>
                      <td style={{ padding: "10px 14px" }}>{p.dx}</td>
                      <td style={{ padding: "10px 14px", fontFamily: "'JetBrains Mono', monospace" }}>{p.iop}</td>
                      <td style={{ padding: "10px 14px", fontFamily: "'JetBrains Mono', monospace", color: parseInt(p.rnfl) < -5 ? "var(--decline)" : "var(--text-secondary)" }}>{p.rnfl}</td>
                      <td style={{ padding: "10px 14px", fontFamily: "'JetBrains Mono', monospace", color: parseFloat(p.vfRate) < -0.5 ? "var(--decline)" : "var(--text-secondary)" }}>{p.vfRate}</td>
                      <td style={{ padding: "10px 14px", color: "var(--text-tertiary)" }}>{p.lastVisit}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 500, background: p.status === "urgent" ? "var(--decline-bg)" : p.status === "watch" ? "var(--caution-bg)" : "var(--stable-bg)", color: p.status === "urgent" ? "var(--decline)" : p.status === "watch" ? "var(--caution)" : "var(--stable)", border: `1px solid ${p.status === "urgent" ? "var(--decline-light)" : p.status === "watch" ? "#FDE68A" : "#A7F3D0"}` }}>
                          {p.status === "urgent" ? "⚠ Urgent" : p.status === "watch" ? "◉ Watch" : "✓ Stable"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Practice Insights</div></div>
            <div className="card-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div className="insight-card">
                  <div className="insight-tag">Asymptomatic Alert</div>
                  <div className="insight-text">67 patients who presented as asymptomatic had clinically significant findings detected at their last exam, including new diagnoses, RNFL changes, or IOP elevation.</div>
                </div>
                <div className="insight-card">
                  <div className="insight-tag">Treatment Gap</div>
                  <div className="insight-text">38 glaucoma patients have IOP above target ({">"} 21 mmHg) on their current medication regimen. 12 of these are on dual therapy and may need referral for SLT or surgical evaluation.</div>
                </div>
                <div className="insight-card">
                  <div className="insight-tag">Follow-up Overdue</div>
                  <div className="insight-text">23 patients with known POAG have not been seen in over 12 months. 8 of these were classified as fast progressors at their last visit.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient View Mode */}
      {viewMode === "patient" && (<>

      {/* Patient Banner */}
      <div className="patient-banner">
        <div className="patient-name">{PATIENT.name}</div>
        <div className="patient-meta">
          <div className="meta-chip"><span className="label">ID</span> {PATIENT.id}</div>
          <div className="meta-chip"><span className="label">Age</span> {PATIENT.age}F</div>
          <div className="meta-chip"><span className="label">Since</span> {PATIENT.dxDate}</div>
          <div className="dx-badge">⬤ {PATIENT.dx}</div>
          <div className="allergy-chip">⚠ {PATIENT.allergies}</div>
        </div>
      </div>

      {/* Visit Timeline */}
      <div style={{ padding: "12px 28px", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>Visit Timeline</span>
          <div className="visit-nav">
            {VISITS.map((v, i) => (
              <button key={i} className={`visit-pill ${selectedVisit === i ? "active" : ""}`} onClick={() => setSelectedVisit(i)}>{v.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="cockpit-body">
        <div className="main-col">

          {/* Imaging Section */}
          <div className="card">
            <div className="tab-row">
              {[
                { id: "oct", label: "OCT · RNFL Map" },
                { id: "fundus", label: "Optic Disc" },
                { id: "vf", label: "Visual Fields" },
              ].map(t => (
                <button key={t.id} className={`tab-btn ${imageTab === t.id ? "active" : ""}`} onClick={() => setImageTab(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>

            {imageTab === "oct" && (
              <div className="card-body">
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>
                  RNFL thickness by sector — color indicates severity relative to normative database
                </div>
                <div className="imaging-grid">
                  <div className="imaging-panel">
                    <div className="eye-label od" style={{ textAlign: "center" }}>OD (Right Eye)</div>
                    <RNFLCircleMap sectors={RNFL_SECTORS.od_current} eye="od" />
                    <div className="imaging-label">Current · Feb 2026</div>
                  </div>
                  <div className="imaging-panel">
                    <div className="eye-label os" style={{ textAlign: "center" }}>OS (Left Eye)</div>
                    <RNFLCircleMap sectors={RNFL_SECTORS.os_current} eye="os" />
                    <div className="imaging-label">Current · Feb 2026</div>
                  </div>
                </div>

                {/* Baseline comparison */}
                <div style={{ borderTop: "1px solid var(--border-light)", marginTop: 16, paddingTop: 16 }}>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500 }}>
                    Baseline Comparison · Jul 2023
                  </div>
                  <div className="imaging-grid">
                    <div className="imaging-panel">
                      <RNFLCircleMap sectors={RNFL_SECTORS.od_baseline} eye="od" size={140} />
                      <div className="imaging-timestamp">Baseline · Jul 2023</div>
                    </div>
                    <div className="imaging-panel">
                      <RNFLCircleMap sectors={RNFL_SECTORS.os_baseline} eye="os" size={140} />
                      <div className="imaging-timestamp">Baseline · Jul 2023</div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="sector-legend" style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border-light)" }}>
                  {[
                    { color: "#22c55e", label: "Normal (≥90μm)" },
                    { color: "#86efac", label: "Borderline (70–89)" },
                    { color: "#fbbf24", label: "Thin (55–69)" },
                    { color: "#f97316", label: "Abnormal (40–54)" },
                    { color: "#ef4444", label: "Severe (<40)" },
                  ].map(l => (
                    <div key={l.label} className="sector-legend-item">
                      <div className="sector-legend-dot" style={{ background: l.color }} />
                      <span>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {imageTab === "fundus" && (
              <div className="card-body">
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>
                  Optic disc cup-to-disc ratio — larger cup indicates greater glaucomatous damage
                </div>
                <div className="imaging-grid">
                  <div className="imaging-panel">
                    <div className="eye-label od" style={{ textAlign: "center" }}>OD (Right Eye)</div>
                    <FundusDisc cdr={current.cdr_od} eye="od" />
                    <div className="imaging-label">C/D: {current.cdr_od} · Feb 2026</div>
                    <div className="imaging-timestamp">Baseline was {baseline.cdr_od} · Δ +{(current.cdr_od - baseline.cdr_od).toFixed(2)}</div>
                  </div>
                  <div className="imaging-panel">
                    <div className="eye-label os" style={{ textAlign: "center" }}>OS (Left Eye)</div>
                    <FundusDisc cdr={current.cdr_os} eye="os" />
                    <div className="imaging-label">C/D: {current.cdr_os} · Feb 2026</div>
                    <div className="imaging-timestamp">Baseline was {baseline.cdr_os} · Δ +{(current.cdr_os - baseline.cdr_os).toFixed(2)}</div>
                  </div>
                </div>

                {/* Historical C/D progression */}
                <div style={{ borderTop: "1px solid var(--border-light)", marginTop: 20, paddingTop: 16 }}>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500 }}>
                    C/D Ratio Progression
                  </div>
                  <div className="imaging-grid">
                    {VISITS.slice(0, 4).map((v, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: i < 3 ? "1px solid var(--border-light)" : "none" }}>
                        <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "JetBrains Mono", minWidth: 70 }}>{v.label}</span>
                        <div style={{ display: "flex", gap: 12 }}>
                          <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", color: "var(--od-color)" }}>OD: {v.cdr_od}</span>
                          <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", color: "var(--os-color)" }}>OS: {v.cdr_os}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 14, padding: "10px 12px", background: "var(--decline-bg)", borderRadius: 6, border: "1px solid var(--decline-light)" }}>
                  <div style={{ fontSize: 11, color: "var(--decline)", fontWeight: 500 }}>
                    ⚠ OD cup-to-disc ratio ({current.cdr_od}) exceeds 0.7 — consistent with moderate glaucomatous cupping. Asymmetry between eyes (Δ {(current.cdr_od - current.cdr_os).toFixed(2)}) warrants close monitoring.
                  </div>
                </div>
              </div>
            )}

            {imageTab === "vf" && (
              <div className="card-body">
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>
                  24-2 visual field sensitivity (dB) — darker regions indicate greater field loss
                </div>
                <div className="imaging-grid">
                  <div className="imaging-panel">
                    <div className="eye-label od" style={{ textAlign: "center" }}>OD (Right Eye)</div>
                    <VisualFieldMap grid={VF_GRID.od} eye="od" />
                    <div className="imaging-label">MD: {current.vf_od} dB · Feb 2026</div>
                    <div className="imaging-timestamp">Rate: −0.9 dB/yr (approaching fast progressor)</div>
                  </div>
                  <div className="imaging-panel">
                    <div className="eye-label os" style={{ textAlign: "center" }}>OS (Left Eye)</div>
                    <VisualFieldMap grid={VF_GRID.os} eye="os" />
                    <div className="imaging-label">MD: {current.vf_os} dB · Feb 2026</div>
                    <div className="imaging-timestamp">Rate: −0.5 dB/yr (moderate)</div>
                  </div>
                </div>

                <div className="sector-legend" style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border-light)" }}>
                  {[
                    { color: "#22c55e", label: "Normal (≥26dB)" },
                    { color: "#86efac", label: "Mild loss (20–25)" },
                    { color: "#fbbf24", label: "Moderate (14–19)" },
                    { color: "#f97316", label: "Severe (8–13)" },
                    { color: "#ef4444", label: "Dense (<8dB)" },
                  ].map(l => (
                    <div key={l.label} className="sector-legend-item">
                      <div className="sector-legend-dot" style={{ background: l.color }} />
                      <span>{l.label}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 14, padding: "10px 12px", background: "var(--caution-bg)", borderRadius: 6, border: "1px solid #FDE68A" }}>
                  <div style={{ fontSize: 11, color: "var(--caution)", fontWeight: 500 }}>
                    OD shows nasal step pattern with inferior arcuate defect emerging — correlates with superior RNFL thinning (TS: 95μm). OS relatively preserved with mild superior sensitivity reduction.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progression Summary */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Progression Summary</div>
              <div className="compare-badge">vs baseline {baseline.label}</div>
            </div>
            <div className="card-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div className="eye-label od">⬤ OD (Right)</div>
                  <ProgressionMeter label="RNFL" current={current.rnfl_od} baseline={baseline.rnfl_od} unit="μm" worse="lower" />
                  <ProgressionMeter label="VF MD" current={current.vf_od} baseline={baseline.vf_od} unit="dB" worse="lower" />
                  <ProgressionMeter label="C/D Ratio" current={current.cdr_od} baseline={baseline.cdr_od} unit="" worse="higher" />
                </div>
                <div>
                  <div className="eye-label os">⬤ OS (Left)</div>
                  <ProgressionMeter label="RNFL" current={current.rnfl_os} baseline={baseline.rnfl_os} unit="μm" worse="lower" />
                  <ProgressionMeter label="VF MD" current={current.vf_os} baseline={baseline.vf_os} unit="dB" worse="lower" />
                  <ProgressionMeter label="C/D Ratio" current={current.cdr_os} baseline={baseline.cdr_os} unit="" worse="higher" />
                </div>
              </div>
            </div>
          </div>

          {/* Trend Charts */}
          <div className="card">
            <div className="tab-row">
              {["trends", "compare"].map(t => (
                <button key={t} className={`tab-btn ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
                  {t === "trends" ? "Longitudinal Trends" : "Visit Comparison"}
                </button>
              ))}
            </div>
            {activeTab === "trends" && (
              <div className="card-body">
                {[
                  { title: "Intraocular Pressure", unit: "mmHg · target <21", dataOd: iopData_od, dataOs: iopData_os, currentOd: current.iop_od, currentOs: current.iop_os, prevOd: previous.iop_od, prevOs: previous.iop_os, colorOd: "var(--od-color)", colorOs: "var(--os-color)", warnOd: current.iop_od > 21, warnOs: current.iop_os > 21 },
                  { title: "RNFL Thickness", unit: "μm · declining = progression", dataOd: rnflData_od, dataOs: rnflData_os, currentOd: current.rnfl_od, currentOs: current.rnfl_os, prevOd: previous.rnfl_od, prevOs: previous.rnfl_os, colorOd: "#DC2626", colorOs: "#D97706", declineOd: true, declineOs: true },
                  { title: "Visual Field Mean Deviation", unit: "dB · >-1dB/yr = fast progressor", dataOd: vfData_od, dataOs: vfData_os, currentOd: current.vf_od, currentOs: current.vf_os, prevOd: previous.vf_od, prevOs: previous.vf_os, colorOd: "#DC2626", colorOs: "#D97706", declineOd: true, declineOs: false },
                ].map((metric, idx) => (
                  <div key={idx} style={{ marginBottom: idx < 2 ? 24 : 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      {metric.title}
                      <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontFamily: "JetBrains Mono", fontWeight: 400 }}>{metric.unit}</span>
                    </div>
                    <div className="trend-row">
                      <div>
                        <div className="eye-label od">OD</div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                          <span className="metric-current" style={metric.declineOd ? { color: "#DC2626" } : {}}>{metric.currentOd}</span>
                          <span className="metric-unit">{metric.unit.split(" ")[0]}</span>
                          <span className={`metric-delta ${metric.warnOd || metric.declineOd ? "decline" : "stable"}`}>
                            {metric.declineOd
                              ? `↓ ${Math.abs(metric.currentOd - baseline[idx === 0 ? "iop_od" : idx === 1 ? "rnfl_od" : "vf_od"])} total`
                              : `${metric.currentOd > metric.prevOd ? "↑" : "↓"} ${Math.abs(metric.currentOd - metric.prevOd)} from last`}
                          </span>
                        </div>
                        <div className="sparkline-container"><Sparkline data={metric.dataOd} color={metric.colorOd} /></div>
                      </div>
                      <div>
                        <div className="eye-label os">OS</div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                          <span className="metric-current" style={metric.declineOs ? { color: "#D97706" } : {}}>{metric.currentOs}</span>
                          <span className="metric-unit">{metric.unit.split(" ")[0]}</span>
                          <span className={`metric-delta ${metric.declineOs ? "caution" : "stable"}`}>
                            {metric.declineOs
                              ? `↓ ${Math.abs(metric.currentOs - baseline[idx === 0 ? "iop_os" : idx === 1 ? "rnfl_os" : "vf_os"])} total`
                              : `${metric.currentOs > metric.prevOs ? "↑" : "↓"} ${Math.abs(metric.currentOs - metric.prevOs)} from last`}
                          </span>
                        </div>
                        <div className="sparkline-container"><Sparkline data={metric.dataOs} color={metric.colorOs} /></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "compare" && (
              <div className="card-body">
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>
                  Side-by-side: <strong>{VISITS[selectedVisit].label}</strong> vs previous visit
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)" }}>
                      <th style={{ padding: "8px 0", textAlign: "left", color: "var(--text-tertiary)", fontWeight: 500 }}>Metric</th>
                      <th style={{ padding: "8px 0", textAlign: "center", color: "var(--od-color)", fontWeight: 600 }}>OD Current</th>
                      <th style={{ padding: "8px 0", textAlign: "center", color: "var(--od-color)", fontWeight: 400, opacity: 0.6 }}>OD Prev</th>
                      <th style={{ padding: "8px 0", textAlign: "center", color: "var(--os-color)", fontWeight: 600 }}>OS Current</th>
                      <th style={{ padding: "8px 0", textAlign: "center", color: "var(--os-color)", fontWeight: 400, opacity: 0.6 }}>OS Prev</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontFamily: "JetBrains Mono" }}>
                    {[
                      { label: "IOP (mmHg)", k: "iop" },
                      { label: "RNFL (μm)", k: "rnfl" },
                      { label: "VF MD (dB)", k: "vf" },
                      { label: "C/D Ratio", k: "cdr" },
                      { label: "VA", k: "va" },
                      { label: "CCT (μm)", k: "cct" },
                    ].map(({ label, k }) => {
                      const sel = VISITS[selectedVisit];
                      const prev = VISITS[Math.min(selectedVisit + 1, VISITS.length - 1)];
                      return (
                        <tr key={k} style={{ borderBottom: "1px solid var(--border-light)" }}>
                          <td style={{ padding: "10px 0", fontFamily: "DM Sans", fontWeight: 500 }}>{label}</td>
                          <td style={{ padding: "10px 0", textAlign: "center" }}>{sel[`${k}_od`]}</td>
                          <td style={{ padding: "10px 0", textAlign: "center", opacity: 0.5 }}>{prev[`${k}_od`]}</td>
                          <td style={{ padding: "10px 0", textAlign: "center" }}>{sel[`${k}_os`]}</td>
                          <td style={{ padding: "10px 0", textAlign: "center", opacity: 0.5 }}>{prev[`${k}_os`]}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="side-col">
          <div className="card">
            <div className="card-header">
              <div className="card-title">AI Insights</div>
              <span style={{ fontSize: 9, color: "var(--accent)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Assistive</span>
            </div>
            <div className="card-body">
              <div className="insight-card">
                <div className="insight-tag">⚠ Progression Alert</div>
                <div className="insight-text">
                  OD RNFL thinning rate of <strong>4.6 μm/yr</strong> exceeds age-adjusted norm. Superior RNFL sectors (TS: 95μm) correlate with emerging inferior arcuate VF defect. VF MD decline of <strong>−0.9 dB/yr</strong> approaches fast-progressor threshold.
                </div>
                <div className="insight-source">OCT + VF correlation · 6 visits</div>
              </div>
              <div className="insight-card">
                <div className="insight-tag">Treatment Note</div>
                <div className="insight-text">
                  IOP OD remains above target (23 mmHg) on dual therapy. Note: <strong>sulfonamide allergy</strong> contraindicates dorzolamide. Consider prostaglandin analog adjustment or adherence reassessment.
                </div>
                <div className="insight-source">Allergy flag · contraindication check</div>
              </div>
              <div className="insight-card">
                <div className="insight-tag">Referral Consideration</div>
                <div className="insight-text">
                  If IOP remains uncontrolled at next visit, consider SLT or ophthalmology referral for surgical evaluation given progressive structural and functional loss.
                </div>
                <div className="insight-source">Clinical pathway · glaucoma guidelines</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Medications</div></div>
            <div className="card-body">
              {MEDS.map((m, i) => (
                <div key={i} className="med-item">
                  <div className={`med-dot ${m.active ? "active" : "inactive"}`} />
                  <div>
                    <div className="med-name">{m.name}</div>
                    <div className="med-detail">{m.route} · {m.freq} · since {m.start}</div>
                    {m.notes && <div className="med-note">{m.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Patient Context</div></div>
            <div className="card-body">
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>Systemic Conditions</div>
              <div className="systemic-row">
                <span className="systemic-chip">Hypertension (controlled)</span>
                <span className="systemic-chip">Type 2 Diabetes</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, marginTop: 14 }}>Allergies</div>
              <div className="systemic-row">
                <span className="allergy-chip">⚠ Sulfonamides</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, marginTop: 14 }}>Corneal Thickness</div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.5 }}>
                CCT OD: {current.cct_od}μm · OS: {current.cct_os}μm
                <div style={{ fontSize: 11, color: "var(--caution)", marginTop: 4 }}>
                  ⚠ Thin cornea — IOP may be underestimated by ~1-2 mmHg
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>)}
    </div>
  );
}
