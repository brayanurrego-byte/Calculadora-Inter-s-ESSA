import { useState, useCallback } from “react”;
import “./App.css”;

const SERIES_CONFIG = {
A: {
name: “Serie A — IPC + Margen”, color: “#4D8FFF”, nominal: 10_000_000, moneda: “COP”, convencion: 365,
info: “Bonos denominados en <strong>Pesos</strong>. La tasa efectiva anual se forma combinando el IPC certificado por el DANE más un margen, usando la fórmula multiplicativa: <strong>TEA = (1+IPC) × (1+Margen) - 1</strong>. Aplica convención 365/365.”,
labelInd: “IPC Anual (%) E.A.”, labelMar: “Margen Adicional (%) E.A.”,
ttInd: “Inflación anual certificada por el DANE al inicio o fin del período de intereses.”,
ttMar: “Spread en términos efectivos anuales, fijado en el Aviso de Oferta Pública.”,
showIBRPlazo: false, showUVR: false, showTRM: false,
},
B: {
name: “Serie B — Tasa Fija”, color: “#F5A623”, nominal: 10_000_000, moneda: “COP”, convencion: 365,
info: “Bonos denominados en <strong>Pesos</strong> con tasa de interés <strong>fija</strong> definida como Tasa Cupón en la Oferta Pública, expresada en términos efectivos anuales.”,
labelInd: “Tasa Cupón Fija (%) E.A.”, labelMar: null,
ttInd: “Tasa fija determinada como Tasa Cupón, expresada en términos efectivos anuales.”,
showIBRPlazo: false, showUVR: false, showTRM: false,
},
C: {
name: “Serie C — IBR + Margen”, color: “#00B274”, nominal: 10_000_000, moneda: “COP”, convencion: 360,
info: “Bonos denominados en <strong>Pesos</strong>. Tasa nominal = IBR + Margen. Aplica convención <strong>360/360</strong>.”,
labelInd: “IBR Nominal (%)”, labelMar: “Margen Adicional (%) Nominal”,
ttInd: “Tasa IBR publicada por el Banco de la República al plazo seleccionado.”,
ttMar: “Spread nominal adicional sobre el IBR, fijado en el Aviso de Oferta Pública.”,
showIBRPlazo: true, showUVR: false, showTRM: false,
},
D: {
name: “Serie D — UVR + Tasa Fija”, color: “#E86FAB”, nominal: 100_000, moneda: “UVR”, convencion: 365,
info: “Bonos denominados en <strong>UVR</strong>. Capital e intereses se convierten a Pesos multiplicando por el valor vigente de la UVR certificado por el Banco de la República.”,
labelInd: “Tasa Cupón Fija (%) E.A.”, labelMar: null,
ttInd: “Tasa fija E.A. aplicada sobre el capital en UVR convertido a Pesos al último día del período.”,
showIBRPlazo: false, showUVR: true, showTRM: false,
},
E: {
name: “Serie E — USD + Tasa Fija”, color: “#FF7043”, nominal: 5_000, moneda: “USD”, convencion: 365,
info: “Bonos denominados en <strong>Dólares</strong>. Intereses calculados en USD y pagados en Pesos aplicando la TRM certificada por la SFC.”,
labelInd: “Tasa Cupón Fija (%) E.A.”, labelMar: null,
ttInd: “Tasa fija E.A. en dólares. El pago se realiza en Pesos usando la TRM del último día del período.”,
showIBRPlazo: false, showUVR: false, showTRM: true,
},
};

const DOT_COLORS = { A: “#4D8FFF”, B: “#F5A623”, C: “#00B274”, D: “#E86FAB”, E: “#FF7043” };

const fmtCOP = v => “$ “ + Math.round(v).toLocaleString(“es-CO”);
const getPeriodoLabel = (i, m) => ({ 12: `Mes`, 4: `Trim`, 2: `Sem`, 1: `Año` }[m] || “Per”) + ` ${i}`;

function getFormulaHTML(s) {
const defs = {
A: {
title: “Serie A · IPC + Margen”,
steps: [
{ n: 1, desc: “Calcular la Tasa Efectiva Anual compuesta”, formula: ‘<span class="fh">TEA</span> <span class="fo">=</span> (1 + <span class="fb">IPC</span><sub>%EA</sub>) <span class="fo">×</span> (1 + <span class="fg">M</span><sub>%EA</sub>) <span class="fo">− 1</span>’ },
{ n: 2, desc: “Precio de Suscripción (Valor Presente Neto)”, formula: ‘<span class="fh">P</span> <span class="fo">=</span> <span class="fσ">∑</span> <span class="fb">Fᵢ</span> <span class="fo">÷</span> (1 + <span class="fh">r</span>)<sup class="fg">tᵢ</sup>’ },
],
legend: [[“TEA”,“Tasa Efectiva Anual combinada del período”],[“IPC”,“Inflación certificada DANE — términos E.A.”],[“M”,“Margen adicional — términos E.A.”],[“P”,“Precio de Suscripción en COP”],[“Fᵢ”,“Flujo de interés o amortización en período i”],[“r”,“Tasa de Corte / Rendimiento ofrecido E.A.”],[“tᵢ”,“Tiempo en años desde suscripción hasta pago i · conv. 365/365”]],
},
B: {
title: “Serie B · Tasa Fija”,
steps: [
{ n: 1, desc: “Conversión Tasa E.A. → Tasa Nominal Equivalente”, formula: ‘<span class="fh">iₙₒₘ</span> <span class="fo">=</span> m × [(1 + <span class="fb">TEA</span>)<sup>1/m</sup> − 1]’ },
{ n: 2, desc: “Precio de Suscripción (Valor Presente)”, formula: ‘<span class="fh">P</span> <span class="fo">=</span> <span class="fσ">∑</span> <span class="fb">Fᵢ</span> <span class="fo">÷</span> (1 + <span class="fh">r</span>)<sup class="fg">tᵢ</sup>’ },
],
legend: [[“TEA”,“Tasa Cupón fija definida en la Oferta Pública — E.A.”],[“m”,“Número de períodos por año (12, 4, 2 ó 1)”],[“iₙₒₘ”,“Tasa nominal equivalente al período de pago”],[“P”,“Precio de Suscripción · conv. 365/365”],[“r”,“Tasa de Corte / Tasa de Rendimiento Ofrecida E.A.”]],
},
C: {
title: “Serie C · IBR + Margen (Nominal · 360/360)”,
steps: [
{ n: 1, desc: “Tasa Nominal Total según plazo IBR”, formula: ‘<span class="fh">iₙₒₘ</span> <span class="fo">=</span> <span class="fb">IBR</span><sub>N·P·V</sub> <span class="fo">+</span> <span class="fg">Margen</span><sub>N·P·V</sub>’ },
{ n: 2, desc: “Factor de Liquidación (conv. 360/360)”, formula: ‘<span class="fh">Interés</span> <span class="fo">=</span> Capital × <span class="fb">iₙₒₘ</span> × (n/360)’ },
{ n: 3, desc: “Precio de Suscripción”, formula: ‘<span class="fh">P</span> <span class="fo">=</span> <span class="fσ">∑</span> <span class="fb">Fᵢ</span> <span class="fo">÷</span> (1+<span class="fh">r</span>)<sup class="fg">tᵢ</sup>’ },
],
legend: [[“IBR”,“IBR nominal al plazo: N.M.V / N.T.V / N.S.V / N.A.V (base 360 días)”],[“n”,“Días calendario del período de intereses”],[“P”,“Precio de Suscripción · conv. 360/360”],[“r”,“Tasa de descuento E.A. para valoración”]],
},
D: {
title: “Serie D · UVR + Tasa Fija”,
steps: [
{ n: 1, desc: “Conversión Capital UVR → Pesos”, formula: ‘<span class="fh">Capital</span><sub>COP</sub> <span class="fo">=</span> Capital<sub>UVR</sub> × <span class="fb">UVR</span><sub>t</sub>’ },
{ n: 2, desc: “Interés del período en Pesos”, formula: ‘<span class="fh">Interés</span><sub>COP</sub> <span class="fo">=</span> Capital<sub>UVR</sub> × <span class="fb">UVR</span><sub>fin</sub> × iₙₒₘ’ },
{ n: 3, desc: “Precio Suscripción en Pesos”, formula: ‘<span class="fh">P</span><sub>COP</sub> <span class="fo">=</span> <span class="fσ">∑</span> <span class="fb">Fᵢ</span> <span class="fo">÷</span> (1+r)<sup>tᵢ</sup> × <span class="fb">UVR</span><sub>suscrip</sub>’ },
],
legend: [[“UVR_t”,“Valor de la UVR certificada por el Banco de la República en fecha t”],[“UVR_fin”,“UVR vigente al último día del período de intereses”],[“iₙₒₘ”,“Tasa nominal equivalente derivada de la Tasa Cupón E.A.”]],
},
E: {
title: “Serie E · USD Tasa Fija → Pesos vía TRM”,
steps: [
{ n: 1, desc: “Interés en Dólares del período”, formula: ‘<span class="fh">Interés</span><sub>USD</sub> <span class="fo">=</span> Capital<sub>USD</sub> × iₙₒₘ’ },
{ n: 2, desc: “Conversión a Pesos usando TRM”, formula: ‘<span class="fh">Interés</span><sub>COP</sub> <span class="fo">=</span> Capital<sub>USD</sub> × iₙₒₘ × <span class="fb">TRM</span><sub>fin</sub>’ },
{ n: 3, desc: “Precio Suscripción en Pesos”, formula: ‘<span class="fh">P</span><sub>COP</sub> <span class="fo">=</span> <span class="fσ">∑</span> <span class="fb">F</span><sub>i,USD</sub> <span class="fo">÷</span> (1+r)<sup>tᵢ</sup> × <span class="fb">TRM</span><sub>suscrip</sub>’ },
],
legend: [[“TRM_fin”,“Tasa Representativa del Mercado certificada por la SFC al último día del período”],[“TRM_suscrip”,“TRM vigente en la Fecha de Suscripción”],[“iₙₒₘ”,“Tasa nominal equivalente derivada de la Tasa Cupón E.A.”]],
},
};
const d = defs[s];
return `<div class="formula-title">Fórmula Oficial · ${d.title}</div> <div class="formula-box"> ${d.steps.map(st =>`
<div class="f-step"><span class="f-step-badge">PASO ${st.n}</span> ${st.desc}</div>
<div class="f-main">${st.formula}</div>
`).join("")} <div class="f-legend"> ${d.legend.map(([k, v]) => `<span class="sym">${k}</span><span>${v}</span>`).join("")} </div> </div>`;
}

function SliderInput({ label, tooltip, min, max, step, value, onChange, isSuffix }) {
const display = isSuffix ? `${value} años` : `${parseFloat(value).toFixed(2)}%`;
return (
<div className="form-group">
<label>
{label}
{tooltip && (
<span className="tooltip-wrap">
<span className="tooltip-icon">?</span>
<span className="tooltip-text">{tooltip}</span>
</span>
)}
</label>
<div className="slider-wrap">
<input type=“range” min={min} max={max} step={step} value={value}
onChange={e => onChange(parseFloat(e.target.value))} />
<span className="slider-val">{display}</span>
</div>
<input type=“number” value={value} step={step} min={min} max={max}
onChange={e => onChange(parseFloat(e.target.value) || 0)} />
</div>
);
}

function MiniChart({ flujos, serie }) {
const col = DOT_COLORS[serie] || “#4D8FFF”;
const maxVal = Math.max(…flujos.map(f => f.flujoTotal));
const W = 700, H = 100, PAD = 10;
const bw = Math.max(2, (W - PAD * 2) / flujos.length - 2);
return (
<svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio=“none” className=“mini-chart-svg”>
<defs>
<linearGradient id="mcBg" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stopColor={col} stopOpacity="0.1" />
<stop offset="100%" stopColor={col} stopOpacity="0.02" />
</linearGradient>
</defs>
<rect x={0} y={0} width={W} height={H} rx="8" fill="url(#mcBg)" />
{flujos.map((f, idx) => {
const bh = Math.max(2, (f.flujoTotal / maxVal) * (H - PAD - 14));
const x = PAD + idx * ((W - PAD * 2) / flujos.length) + 1;
const y = H - PAD - bh - 12;
return <rect key={idx} x={x.toFixed(1)} y={y.toFixed(1)} width={bw.toFixed(1)} height={bh.toFixed(1)} rx="3" fill={col} opacity={f.amort > 0 ? 1 : 0.55} />;
})}
<text x={W / 2} y={H - 2} textAnchor=“middle” fontSize=“9” fill=”#888” fontFamily=“DM Sans, sans-serif”>
Flujos de caja · última barra incluye devolución de capital
</text>
</svg>
);
}

export default function App() {
const [serie, setSerie] = useState(“A”);
const [numBonos, setNumBonos] = useState(10);
const [indVal, setIndVal] = useState(6.5);
const [marVal, setMarVal] = useState(2.5);
const [plazo, setPlazo] = useState(5);
const [m, setM] = useState(2);
const [descVal, setDescVal] = useState(10.5);
const [uvr, setUvr] = useState(388.45);
const [trm, setTrm] = useState(4250);
const [results, setResults] = useState(null);

const cfg = SERIES_CONFIG[serie];

const calcular = useCallback(() => {
const ind = indVal / 100, mar = marVal / 100, r = descVal / 100;
const capMult = serie === “D” ? uvr : serie === “E” ? trm : 1;
let teaAnual, iPeriodica;
if (serie === “A”) { teaAnual = (1 + ind) * (1 + mar) - 1; iPeriodica = Math.pow(1 + teaAnual, 1 / m) - 1; }
else if (serie === “C”) { const iN = ind + mar; teaAnual = Math.pow(1 + iN / m, m) - 1; iPeriodica = iN / m; }
else { teaAnual = ind; iPeriodica = Math.pow(1 + teaAnual, 1 / m) - 1; }

```
const totalPeriodos = plazo * m;
const capitalBase = cfg.nominal * numBonos;
const flujos = [];
let totalIntereses = 0;

for (let i = 1; i <= totalPeriodos; i++) {
  const intPeriodo = capitalBase * iPeriodica * capMult;
  const amort = i === totalPeriodos ? capitalBase * capMult : 0;
  const flujoTotal = intPeriodo + amort;
  const ti = i / m;
  const vp = flujoTotal / Math.pow(1 + r, ti);
  totalIntereses += intPeriodo;
  const fecha = new Date(); fecha.setMonth(fecha.getMonth() + Math.round((12 / m) * i));
  const fechaStr = fecha.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });
  flujos.push({ i, fechaStr, capital: capitalBase * capMult, intPeriodo, amort, flujoTotal, vp, ti });
}
const precio = flujos.reduce((a, f) => a + f.vp, 0);
const duracion = flujos.reduce((a, f) => a + f.ti * (f.vp / precio), 0);
setResults({ teaAnual, flujos, precio, totalIntereses, capitalBase: capitalBase * capMult, duracion, totalPeriodos });
setTimeout(() => document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
```

}, [serie, numBonos, indVal, marVal, plazo, m, descVal, uvr, trm, cfg]);

const nominalDisplay = () => {
const n = numBonos * cfg.nominal;
if (cfg.moneda === “COP”) return `Valor nominal total: ${fmtCOP(n)}`;
if (cfg.moneda === “UVR”) return `${n.toLocaleString("es-CO")} UVR ≈ ${fmtCOP(n * uvr)}`;
return `USD ${n.toLocaleString("es-CO")} ≈ ${fmtCOP(n * trm)}`;
};

return (
<div className="app">
<div className="bg-canvas"><div className="bg-grid" /><div className="bg-orb orb1" /><div className="bg-orb orb2" /></div>

```
  <header>
    <div className="logo-area">
      <div className="logo-mark">
        <svg viewBox="0 0 44 44" fill="none" className="logo-svg">
          <rect width="44" height="44" rx="10" fill="#00205B"/>
          <path d="M26 6L14 22H22L18 38L30 20H22L26 6Z" fill="#F5A623" strokeLinejoin="round"/>
          <circle cx="12" cy="22" r="2.5" fill="white" opacity="0.6"/>
          <circle cx="32" cy="22" r="2.5" fill="white" opacity="0.6"/>
          <line x1="12" y1="22" x2="16" y2="22" stroke="white" strokeWidth="1.5" opacity="0.4"/>
          <line x1="28" y1="22" x2="32" y2="22" stroke="white" strokeWidth="1.5" opacity="0.4"/>
        </svg>
      </div>
      <div className="logo-text"><strong>ESSA</strong><span>Electrificadora de Santander</span></div>
    </div>
    <div className="header-badge">Mercado de Valores · Colombia</div>
  </header>

  <div className="hero">
    <div className="hero-tag">⚡ Prospecto de Información · Febrero 2026</div>
    <h1>Bonos de <em>Deuda Pública</em><br/>Interna BDPI</h1>
    <p>Calculadora interactiva de rendimiento según el Prospecto oficial de Emisión y Colocación.</p>
    <div className="hero-stats">
      {[{n:"$200MM",l:"Monto Total COP"},{n:"5",l:"Series A·B·C·D·E"},{n:"1–50",l:"Años Plazo Máximo"},{n:"BVC",l:"Bolsa de Valores"}].map(s=>(
        <div className="stat-item" key={s.l}><div className="stat-num">{s.n}</div><div className="stat-label">{s.l}</div></div>
      ))}
    </div>
  </div>

  <div className="main-content">
    <div className="section-label">Selecciona la Serie del Bono</div>
    <div className="series-selector">
      {Object.keys(SERIES_CONFIG).map(s=>(
        <button key={s} className={`series-btn${serie===s?" active":""}`} onClick={()=>{setSerie(s);setResults(null);}}>
          <span className="series-dot" style={{background:DOT_COLORS[s]}}/>
          {SERIES_CONFIG[s].name}
        </button>
      ))}
    </div>

    <div className="formula-card" dangerouslySetInnerHTML={{__html:getFormulaHTML(serie)}}/>

    <div className="calc-grid">
      {/* INPUT */}
      <div className="card">
        <div className="card-title"><span>⚙️</span> Parámetros del Bono</div>
        <div className="card-sub">{cfg.name} · {cfg.moneda}</div>
        <div className="series-info" dangerouslySetInnerHTML={{__html:cfg.info}}/>

        <div className="form-group">
          <label>Número de Bonos a Suscribir</label>
          <input type="number" value={numBonos} min="1" max="10000" onChange={e=>setNumBonos(parseInt(e.target.value)||1)}/>
          <div className="input-hint">{nominalDisplay()}</div>
        </div>

        <SliderInput label={cfg.labelInd} tooltip={cfg.ttInd} min={0} max={25} step={0.1} value={indVal} onChange={setIndVal}/>
        {cfg.labelMar && <SliderInput label={cfg.labelMar} tooltip={cfg.ttMar} min={0} max={10} step={0.05} value={marVal} onChange={setMarVal}/>}
        <SliderInput label="Plazo de Redención (Años)" tooltip="Entre 1 y 50 años según el Prospecto." min={1} max={50} step={1} value={plazo} onChange={setPlazo} isSuffix/>

        <div className="form-group">
          <label>Periodicidad de Pago de Intereses</label>
          <select value={m} onChange={e=>setM(parseInt(e.target.value))}>
            <option value={12}>Mes Vencido (12/año)</option>
            <option value={4}>Trimestre Vencido (4/año)</option>
            <option value={2}>Semestre Vencido (2/año)</option>
            <option value={1}>Año Vencido (1/año)</option>
          </select>
        </div>

        {cfg.showIBRPlazo && <div className="form-group"><label>Plazo IBR</label><select><option>1 mes (N.M.V)</option><option>3 meses (N.T.V)</option><option>6 meses (N.S.V)</option><option>12 meses (N.A.V)</option></select></div>}
        {cfg.showUVR && <div className="form-group"><label>Valor UVR vigente (COP)</label><input type="number" value={uvr} step={0.01} onChange={e=>setUvr(parseFloat(e.target.value)||388.45)}/></div>}
        {cfg.showTRM && <div className="form-group"><label>TRM vigente (COP/USD)</label><input type="number" value={trm} step={1} onChange={e=>setTrm(parseFloat(e.target.value)||4250)}/></div>}

        <SliderInput label="Tasa de Descuento / Corte (r%) — E.A." tooltip="Tasa de mercado o Tasa de Corte para valorar el precio de suscripción." min={0} max={30} step={0.1} value={descVal} onChange={setDescVal}/>
        <button className="btn-calc" onClick={calcular}>Calcular Rendimiento</button>
      </div>

      {/* PREVIEW */}
      <div className="card preview-card">
        <div className="card-title"><span>📊</span> Vista Previa</div>
        <div className="card-sub">Presiona Calcular para ver el detalle</div>
        {!results ? (
          <div className="empty-state"><div className="empty-icon">⚡</div><div>Los resultados aparecerán aquí</div></div>
        ) : (
          <div className="quick-results">
            <div className="result-grid">
              <div className="result-item highlight"><div className="r-label">Tasa Cupón E.A.</div><div className="r-value big">{(results.teaAnual*100).toFixed(4)}%</div><div className="r-sub">Efectiva Anual</div></div>
              <div className="result-item gold"><div className="r-label">Precio Suscripción</div><div className="r-value">{fmtCOP(results.precio/numBonos)}</div><div className="r-sub">{(results.precio/results.capitalBase*100).toFixed(2)}% del nominal</div></div>
              <div className="result-item"><div className="r-label">Cupón Periódico</div><div className="r-value">{fmtCOP(results.flujos[0].intPeriodo)}</div><div className="r-sub">Interés por período</div></div>
              <div className="result-item"><div className="r-label">Total Intereses</div><div className="r-value">{fmtCOP(results.totalIntereses)}</div><div className="r-sub">Suma todos los períodos</div></div>
            </div>
            <div className="mini-chart-wrap"><MiniChart flujos={results.flujos} serie={serie}/></div>
          </div>
        )}
      </div>

      {/* FULL RESULTS */}
      {results && (
        <div className="results-card" id="results-section">
          <div className="card-title"><span>📋</span> Tabla de Flujos de Caja</div>
          <div className="card-sub">Proyección completa · Prospecto ESSA · Febrero 2026</div>
          <div className="flow-table-wrap">
            <table>
              <thead><tr><th>Período</th><th>Fecha Pago</th><th>Saldo Capital</th><th>Interés Período</th><th>Amortización</th><th>Flujo Total</th><th>VP Flujo</th></tr></thead>
              <tbody>
                {results.flujos.map(f=>(
                  <tr key={f.i}>
                    <td className="td-period">{getPeriodoLabel(f.i,m)}</td>
                    <td>{f.fechaStr}</td>
                    <td>{fmtCOP(f.capital)}</td>
                    <td className="td-up">{fmtCOP(f.intPeriodo)}</td>
                    <td>{f.amort>0?fmtCOP(f.amort):"—"}</td>
                    <td>{fmtCOP(f.flujoTotal)}</td>
                    <td>{fmtCOP(f.vp)}</td>
                  </tr>
                ))}
                <tr className="totals-row">
                  <td colSpan={3} className="td-total">TOTALES</td>
                  <td className="td-total td-up">{fmtCOP(results.totalIntereses)}</td>
                  <td className="td-total">{fmtCOP(results.capitalBase)}</td>
                  <td className="td-total">{fmtCOP(results.totalIntereses+results.capitalBase)}</td>
                  <td className="td-total">{fmtCOP(results.precio)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="result-grid summary-grid">
            {[
              {l:"Capital Total",v:fmtCOP(results.capitalBase),s:`${numBonos} bono(s)`},
              {l:"Intereses Totales",v:fmtCOP(results.totalIntereses),s:`${results.totalPeriodos} pagos`},
              {l:"Retorno Bruto",v:`${((results.totalIntereses/results.capitalBase)*100).toFixed(2)}%`,s:"Sobre el capital"},
              {l:"Precio Suscripción Total",v:fmtCOP(results.precio),s:`${(results.precio/results.capitalBase*100).toFixed(2)}% del nominal`,c:"highlight"},
              {l:"Duración Macaulay",v:results.duracion.toFixed(3),s:"años"},
              {l:"Tasa Cupón E.A.",v:`${(results.teaAnual*100).toFixed(4)}%`,s:`Conv. ${cfg.convencion}/365`},
              {l:"Tasa Desc. Aplicada",v:`${descVal.toFixed(2)}%`,s:"Para precio de suscripción",c:"gold"},
              {l:"Plazo Total",v:`${plazo} años`,s:`${results.totalPeriodos} períodos`},
            ].map(item=>(
              <div className={`result-item${item.c?" "+item.c:""}`} key={item.l}>
                <div className="r-label">{item.l}</div>
                <div className={`r-value${item.c==="highlight"?" big":""}`}>{item.v}</div>
                <div className="r-sub">{item.s}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>

  <footer>
    <strong>Electrificadora de Santander S.A. E.S.P. — ESSA</strong><br/>
    Prospecto de Información · Bonos de Deuda Pública Interna · Febrero 2026<br/>
    Uso académico e ilustrativo · <strong>BVC</strong> · Administrado por <strong>Deceval S.A.</strong>
  </footer>
</div>
```

);
}
