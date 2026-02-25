import { useState, useCallback } from ‘react’;
const SERIES_CONFIG = {
A: {
name: ‘Serie A - IPC + Margen’, color: ‘#4D8FFF’, nominal: 10000000, moneda: ‘COP’, convencion: 365,
info: ‘Bonos en Pesos. TEA = (1+IPC) x (1+Margen) - 1. Convencion 365/365.’,
labelInd: ‘IPC Anual (%) E.A.’, labelMar: ‘Margen Adicional (%) E.A.’,
ttInd: ‘Inflacion anual certificada por el DANE.’,
ttMar: ‘Spread en terminos efectivos anuales.’,
showIBRPlazo: false, showUVR: false, showTRM: false,
},
B: {
name: ‘Serie B - Tasa Fija’, color: ‘#F5A623’, nominal: 10000000, moneda: ‘COP’, convencion: 365,
info: ‘Bonos en Pesos con tasa fija definida como Tasa Cupon en la Oferta Publica.’,
labelInd: ‘Tasa Cupon Fija (%) E.A.’, labelMar: null,
ttInd: ‘Tasa fija en terminos efectivos anuales.’,
showIBRPlazo: false, showUVR: false, showTRM: false,
},
C: {
name: ‘Serie C - IBR + Margen’, color: ‘#00B274’, nominal: 10000000, moneda: ‘COP’, convencion: 360,
info: ‘Bonos en Pesos. Tasa N = IBR + Margen. Convencion 360/360.’,
labelInd: ‘IBR Nominal (%)’, labelMar: ‘Margen Adicional (%) Nominal’,
ttInd: ‘IBR publicado por el Banco de la Republica.’,
ttMar: ‘Spread nominal adicional sobre el IBR.’,
showIBRPlazo: true, showUVR: false, showTRM: false,
},
D: {
name: ‘Serie D - UVR + Tasa Fija’, color: ‘#E86FAB’, nominal: 100000, moneda: ‘UVR’, convencion: 365,
info: ‘Bonos en UVR. Capital e intereses se convierten a Pesos por el valor de la UVR.’,
labelInd: ‘Tasa Cupon Fija (%) E.A.’, labelMar: null,
ttInd: ‘Tasa fija E.A. sobre capital en UVR convertido a Pesos.’,
showIBRPlazo: false, showUVR: true, showTRM: false,
},
E: {
name: ‘Serie E - USD + Tasa Fija’, color: ‘#FF7043’, nominal: 5000, moneda: ‘USD’, convencion: 365,
info: ‘Bonos en Dolares. Intereses calculados en USD y pagados en Pesos via TRM.’,
labelInd: ‘Tasa Cupon Fija (%) E.A.’, labelMar: null,
ttInd: ‘Tasa fija E.A. en dolares, pagada en Pesos usando la TRM.’,
showIBRPlazo: false, showUVR: false, showTRM: true,
},
};

const DOT_COLORS = { A: ‘#4D8FFF’, B: ‘#F5A623’, C: ‘#00B274’, D: ‘#E86FAB’, E: ‘#FF7043’ };

function fmtCOP(v) {
return ’$ ’ + Math.round(v).toLocaleString(‘es-CO’);
}

function getPeriodoLabel(i, m) {
var labels = { 12: ‘Mes’, 4: ‘Trim’, 2: ‘Sem’, 1: ‘Ano’ };
return (labels[m] || ‘Per’) + ’ ’ + i;
}

function FormulaCard({ serie }) {
if (serie === ‘A’) return (
<div>
<div className="formula-title">Formula Oficial - Serie A - IPC + Margen</div>
<div className="formula-box">
<div className="f-step"><span className="f-step-badge">PASO 1</span> Tasa Efectiva Anual compuesta</div>
<div className="f-main">
<span className="fh">TEA</span><span className="fo"> = </span>
<span>(1 + <span className="fb">IPC</span>) x (1 + <span className="fg">M</span>) - 1</span>
</div>
<div className="f-step"><span className="f-step-badge">PASO 2</span> Precio de Suscripcion (VP)</div>
<div className="f-main">
<span className="fh">P</span><span className="fo"> = </span>
<span className="fσ">Σ</span>
<span className="fb"> Fi </span><span className="fo"> / </span>
<span>(1 + <span className="fh">r</span>)<sup className="fg">ti</sup></span>
</div>
<div className="f-legend">
<span className="sym">TEA</span><span>Tasa Efectiva Anual combinada</span>
<span className="sym">IPC</span><span>Inflacion certificada DANE - E.A.</span>
<span className="sym">M</span><span>Margen adicional - E.A.</span>
<span className="sym">P</span><span>Precio de Suscripcion en COP</span>
<span className="sym">Fi</span><span>Flujo de interes o amortizacion en periodo i</span>
<span className="sym">r</span><span>Tasa de Corte E.A.</span>
<span className="sym">ti</span><span>Tiempo en anos hasta pago i - conv. 365/365</span>
</div>
</div>
</div>
);
if (serie === ‘B’) return (
<div>
<div className="formula-title">Formula Oficial - Serie B - Tasa Fija</div>
<div className="formula-box">
<div className="f-step"><span className="f-step-badge">PASO 1</span> Conversion E.A. a Tasa Nominal</div>
<div className="f-main">
<span className="fh">inom</span><span className="fo"> = </span>
<span>m x [(1 + <span className="fb">TEA</span>)<sup>1/m</sup> - 1]</span>
</div>
<div className="f-step"><span className="f-step-badge">PASO 2</span> Precio de Suscripcion</div>
<div className="f-main">
<span className="fh">P</span><span className="fo"> = </span>
<span className="fσ">Σ</span>
<span className="fb"> Fi </span><span className="fo"> / </span>
<span>(1 + <span className="fh">r</span>)<sup className="fg">ti</sup></span>
</div>
<div className="f-legend">
<span className="sym">TEA</span><span>Tasa Cupon fija - E.A.</span>
<span className="sym">m</span><span>Periodos por ano (12, 4, 2 o 1)</span>
<span className="sym">inom</span><span>Tasa nominal equivalente al periodo</span>
<span className="sym">r</span><span>Tasa de Corte E.A.</span>
</div>
</div>
</div>
);
if (serie === ‘C’) return (
<div>
<div className="formula-title">Formula Oficial - Serie C - IBR + Margen</div>
<div className="formula-box">
<div className="f-step"><span className="f-step-badge">PASO 1</span> Tasa Nominal Total</div>
<div className="f-main">
<span className="fh">inom</span><span className="fo"> = </span>
<span className="fb">IBR</span><span className="fo"> + </span><span className="fg">Margen</span>
</div>
<div className="f-step"><span className="f-step-badge">PASO 2</span> Interes del periodo (360/360)</div>
<div className="f-main">
<span className="fh">Interes</span><span className="fo"> = </span>
<span>Capital x <span className="fb">inom</span> x (n/360)</span>
</div>
<div className="f-step"><span className="f-step-badge">PASO 3</span> Precio de Suscripcion</div>
<div className="f-main">
<span className="fh">P</span><span className="fo"> = </span>
<span className="fσ">Σ</span>
<span className="fb"> Fi </span><span className="fo"> / </span>
<span>(1 + <span className="fh">r</span>)<sup className="fg">ti</sup></span>
</div>
<div className="f-legend">
<span className="sym">IBR</span><span>IBR nominal al plazo (base 360 dias)</span>
<span className="sym">n</span><span>Dias del periodo de intereses</span>
<span className="sym">r</span><span>Tasa de descuento E.A.</span>
</div>
</div>
</div>
);
if (serie === ‘D’) return (
<div>
<div className="formula-title">Formula Oficial - Serie D - UVR + Tasa Fija</div>
<div className="formula-box">
<div className="f-step"><span className="f-step-badge">PASO 1</span> Conversion Capital UVR a Pesos</div>
<div className="f-main">
<span className="fh">CapCOP</span><span className="fo"> = </span>
<span>CapUVR x <span className="fb">UVRt</span></span>
</div>
<div className="f-step"><span className="f-step-badge">PASO 2</span> Interes del periodo en Pesos</div>
<div className="f-main">
<span className="fh">IntCOP</span><span className="fo"> = </span>
<span>CapUVR x <span className="fb">UVRfin</span> x inom</span>
</div>
<div className="f-step"><span className="f-step-badge">PASO 3</span> Precio Suscripcion en Pesos</div>
<div className="f-main">
<span className="fh">Pcop</span><span className="fo"> = </span>
<span className="fσ">Σ</span>
<span className="fb"> Fi </span><span className="fo"> / </span>
<span>(1+r)<sup>ti</sup></span>
<span className="fo"> x </span><span className="fb">UVRsuscrip</span>
</div>
<div className="f-legend">
<span className="sym">UVRt</span><span>UVR certificada por Banco de la Republica en fecha t</span>
<span className="sym">UVRfin</span><span>UVR vigente al ultimo dia del periodo</span>
</div>
</div>
</div>
);
return (
<div>
<div className="formula-title">Formula Oficial - Serie E - USD Tasa Fija via TRM</div>
<div className="formula-box">
<div className="f-step"><span className="f-step-badge">PASO 1</span> Interes en Dolares</div>
<div className="f-main">
<span className="fh">IntUSD</span><span className="fo"> = </span>
<span>CapUSD x inom</span>
</div>
<div className="f-step"><span className="f-step-badge">PASO 2</span> Conversion a Pesos</div>
<div className="f-main">
<span className="fh">IntCOP</span><span className="fo"> = </span>
<span>CapUSD x inom x <span className="fb">TRMfin</span></span>
</div>
<div className="f-step"><span className="f-step-badge">PASO 3</span> Precio Suscripcion</div>
<div className="f-main">
<span className="fh">Pcop</span><span className="fo"> = </span>
<span className="fσ">Σ</span>
<span className="fb"> Fi </span><span className="fo"> / </span>
<span>(1+r)<sup>ti</sup></span>
<span className="fo"> x </span><span className="fb">TRMsuscrip</span>
</div>
<div className="f-legend">
<span className="sym">TRMfin</span><span>TRM certificada por SFC al ultimo dia del periodo</span>
<span className="sym">TRMsuscrip</span><span>TRM vigente en la Fecha de Suscripcion</span>
</div>
</div>
</div>
);
}

function SliderInput({ label, tooltip, min, max, step, value, onChange, isSuffix }) {
var display = isSuffix ? (value + ’ anos’) : (parseFloat(value).toFixed(2) + ‘%’);
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
<input
type=“range” min={min} max={max} step={step} value={value}
onChange={function(e) { onChange(parseFloat(e.target.value)); }}
/>
<span className="slider-val">{display}</span>
</div>
<input
type=“number” value={value} step={step} min={min} max={max}
onChange={function(e) { onChange(parseFloat(e.target.value) || 0); }}
/>
</div>
);
}

function MiniChart({ flujos, serie }) {
var col = DOT_COLORS[serie] || ‘#4D8FFF’;
var maxVal = Math.max.apply(null, flujos.map(function(f) { return f.flujoTotal; }));
var W = 700, H = 100, PAD = 10;
var bw = Math.max(2, (W - PAD * 2) / flujos.length - 2);
return (
<svg viewBox={’0 0 ’ + W + ’ ’ + H} preserveAspectRatio=“none” className=“mini-chart-svg”>
<defs>
<linearGradient id="mcBg" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stopColor={col} stopOpacity="0.1" />
<stop offset="100%" stopColor={col} stopOpacity="0.02" />
</linearGradient>
</defs>
<rect x={0} y={0} width={W} height={H} rx="8" fill="url(#mcBg)" />
{flujos.map(function(f, idx) {
var bh = Math.max(2, (f.flujoTotal / maxVal) * (H - PAD - 14));
var x = PAD + idx * ((W - PAD * 2) / flujos.length) + 1;
var y = H - PAD - bh - 12;
return (
<rect
key={idx}
x={x.toFixed(1)} y={y.toFixed(1)}
width={bw.toFixed(1)} height={bh.toFixed(1)}
rx="3" fill={col} opacity={f.amort > 0 ? 1 : 0.55}
/>
);
})}
<text x={W / 2} y={H - 2} textAnchor=“middle” fontSize=“9” fill=”#888” fontFamily=“DM Sans, sans-serif”>
Flujos de caja - ultima barra incluye devolucion de capital
</text>
</svg>
);
}

export default function App() {
var s1 = useState(‘A’); var serie = s1[0]; var setSerie = s1[1];
var s2 = useState(10); var numBonos = s2[0]; var setNumBonos = s2[1];
var s3 = useState(6.5); var indVal = s3[0]; var setIndVal = s3[1];
var s4 = useState(2.5); var marVal = s4[0]; var setMarVal = s4[1];
var s5 = useState(5); var plazo = s5[0]; var setPlazo = s5[1];
var s6 = useState(2); var m = s6[0]; var setM = s6[1];
var s7 = useState(10.5); var descVal = s7[0]; var setDescVal = s7[1];
var s8 = useState(388.45); var uvr = s8[0]; var setUvr = s8[1];
var s9 = useState(4250); var trm = s9[0]; var setTrm = s9[1];
var s10 = useState(null); var results = s10[0]; var setResults = s10[1];

var cfg = SERIES_CONFIG[serie];

var calcular = useCallback(function() {
var ind = indVal / 100;
var mar = marVal / 100;
var r = descVal / 100;
var capMult = serie === ‘D’ ? uvr : serie === ‘E’ ? trm : 1;
var teaAnual, iPeriodica;

```
if (serie === 'A') {
  teaAnual = (1 + ind) * (1 + mar) - 1;
  iPeriodica = Math.pow(1 + teaAnual, 1 / m) - 1;
} else if (serie === 'C') {
  var iN = ind + mar;
  teaAnual = Math.pow(1 + iN / m, m) - 1;
  iPeriodica = iN / m;
} else {
  teaAnual = ind;
  iPeriodica = Math.pow(1 + teaAnual, 1 / m) - 1;
}

var totalPeriodos = plazo * m;
var capitalBase = cfg.nominal * numBonos;
var flujos = [];
var totalIntereses = 0;

for (var i = 1; i <= totalPeriodos; i++) {
  var intPeriodo = capitalBase * iPeriodica * capMult;
  var amort = i === totalPeriodos ? capitalBase * capMult : 0;
  var flujoTotal = intPeriodo + amort;
  var ti = i / m;
  var vp = flujoTotal / Math.pow(1 + r, ti);
  totalIntereses += intPeriodo;
  var fecha = new Date();
  fecha.setMonth(fecha.getMonth() + Math.round((12 / m) * i));
  var fechaStr = fecha.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  flujos.push({ i: i, fechaStr: fechaStr, capital: capitalBase * capMult, intPeriodo: intPeriodo, amort: amort, flujoTotal: flujoTotal, vp: vp, ti: ti });
}

var precio = flujos.reduce(function(a, f) { return a + f.vp; }, 0);
var duracion = flujos.reduce(function(a, f) { return a + f.ti * (f.vp / precio); }, 0);

setResults({
  teaAnual: teaAnual, flujos: flujos, precio: precio,
  totalIntereses: totalIntereses, capitalBase: capitalBase * capMult,
  duracion: duracion, totalPeriodos: totalPeriodos
});

setTimeout(function() {
  var el = document.getElementById('results-section');
  if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}, 100);
```

}, [serie, numBonos, indVal, marVal, plazo, m, descVal, uvr, trm, cfg]);

function nominalDisplay() {
var n = numBonos * cfg.nominal;
if (cfg.moneda === ‘COP’) { return ’Valor nominal total: ’ + fmtCOP(n); }
if (cfg.moneda === ‘UVR’) { return n.toLocaleString(‘es-CO’) + ’ UVR aprox ’ + fmtCOP(n * uvr); }
return ’USD ’ + n.toLocaleString(‘es-CO’) + ’ aprox ’ + fmtCOP(n * trm);
}

var summaryItems = results ? [
{ l: ‘Capital Total’, v: fmtCOP(results.capitalBase), s: numBonos + ’ bono(s)’ },
{ l: ‘Intereses Totales’, v: fmtCOP(results.totalIntereses), s: results.totalPeriodos + ’ pagos’ },
{ l: ‘Retorno Bruto’, v: ((results.totalIntereses / results.capitalBase) * 100).toFixed(2) + ‘%’, s: ‘Sobre el capital’ },
{ l: ‘Precio Suscripcion Total’, v: fmtCOP(results.precio), s: (results.precio / results.capitalBase * 100).toFixed(2) + ‘% del nominal’, c: ‘highlight’ },
{ l: ‘Duracion Macaulay’, v: results.duracion.toFixed(3), s: ‘anos’ },
{ l: ‘Tasa Cupon E.A.’, v: (results.teaAnual * 100).toFixed(4) + ‘%’, s: ‘Conv. ’ + cfg.convencion + ‘/365’ },
{ l: ‘Tasa Desc. Aplicada’, v: descVal.toFixed(2) + ‘%’, s: ‘Para precio de suscripcion’, c: ‘gold’ },
{ l: ‘Plazo Total’, v: plazo + ’ anos’, s: results.totalPeriodos + ’ periodos’ },
] : [];

return (
<div className="app">
<div className="bg-canvas">
<div className="bg-grid" />
<div className="bg-orb orb1" />
<div className="bg-orb orb2" />
</div>

```
  <header>
    <div className="logo-area">
      <div className="logo-mark">
        <svg viewBox="0 0 44 44" fill="none" className="logo-svg">
          <rect width="44" height="44" rx="10" fill="#00205B"/>
          <path d="M26 6L14 22H22L18 38L30 20H22L26 6Z" fill="#F5A623"/>
          <circle cx="12" cy="22" r="2.5" fill="white" opacity="0.6"/>
          <circle cx="32" cy="22" r="2.5" fill="white" opacity="0.6"/>
          <line x1="12" y1="22" x2="16" y2="22" stroke="white" strokeWidth="1.5" opacity="0.4"/>
          <line x1="28" y1="22" x2="32" y2="22" stroke="white" strokeWidth="1.5" opacity="0.4"/>
        </svg>
      </div>
      <div className="logo-text">
        <strong>ESSA</strong>
        <span>Electrificadora de Santander</span>
      </div>
    </div>
    <div className="header-badge">Mercado de Valores - Colombia</div>
  </header>

  <div className="hero">
    <div className="hero-tag">Prospecto de Informacion - Febrero 2026</div>
    <h1>Bonos de <em>Deuda Publica</em><br/>Interna BDPI</h1>
    <p>Calculadora interactiva de rendimiento segun el Prospecto oficial.</p>
    <div className="hero-stats">
      <div className="stat-item"><div className="stat-num">$200MM</div><div className="stat-label">Monto Total COP</div></div>
      <div className="stat-item"><div className="stat-num">5</div><div className="stat-label">Series A B C D E</div></div>
      <div className="stat-item"><div className="stat-num">1-50</div><div className="stat-label">Anos Plazo Maximo</div></div>
      <div className="stat-item"><div className="stat-num">BVC</div><div className="stat-label">Bolsa de Valores</div></div>
    </div>
  </div>

  <div className="main-content">
    <div className="section-label">Selecciona la Serie del Bono</div>

    <div className="series-selector">
      {Object.keys(SERIES_CONFIG).map(function(s) {
        return (
          <button
            key={s}
            className={'series-btn' + (serie === s ? ' active' : '')}
            onClick={function() { setSerie(s); setResults(null); }}
          >
            <span className="series-dot" style={{ background: DOT_COLORS[s] }} />
            {SERIES_CONFIG[s].name}
          </button>
        );
      })}
    </div>

    <div className="formula-card">
      <FormulaCard serie={serie} />
    </div>

    <div className="calc-grid">

      <div className="card">
        <div className="card-title">Parametros del Bono</div>
        <div className="card-sub">{cfg.name} - {cfg.moneda}</div>
        <div className="series-info">{cfg.info}</div>

        <div className="form-group">
          <label>Numero de Bonos a Suscribir</label>
          <input
            type="number" value={numBonos} min="1" max="10000"
            onChange={function(e) { setNumBonos(parseInt(e.target.value) || 1); }}
          />
          <div className="input-hint">{nominalDisplay()}</div>
        </div>

        <SliderInput label={cfg.labelInd} tooltip={cfg.ttInd} min={0} max={25} step={0.1} value={indVal} onChange={setIndVal} />

        {cfg.labelMar && (
          <SliderInput label={cfg.labelMar} tooltip={cfg.ttMar} min={0} max={10} step={0.05} value={marVal} onChange={setMarVal} />
        )}

        <SliderInput label="Plazo de Redencion (Anos)" tooltip="Entre 1 y 50 anos segun el Prospecto." min={1} max={50} step={1} value={plazo} onChange={setPlazo} isSuffix={true} />

        <div className="form-group">
          <label>Periodicidad de Pago de Intereses</label>
          <select value={m} onChange={function(e) { setM(parseInt(e.target.value)); }}>
            <option value={12}>Mes Vencido (12/ano)</option>
            <option value={4}>Trimestre Vencido (4/ano)</option>
            <option value={2}>Semestre Vencido (2/ano)</option>
            <option value={1}>Ano Vencido (1/ano)</option>
          </select>
        </div>

        {cfg.showIBRPlazo && (
          <div className="form-group">
            <label>Plazo IBR</label>
            <select>
              <option>1 mes NMV</option>
              <option>3 meses NTV</option>
              <option>6 meses NSV</option>
              <option>12 meses NAV</option>
            </select>
          </div>
        )}

        {cfg.showUVR && (
          <div className="form-group">
            <label>Valor UVR vigente (COP)</label>
            <input type="number" value={uvr} step={0.01}
              onChange={function(e) { setUvr(parseFloat(e.target.value) || 388.45); }} />
          </div>
        )}

        {cfg.showTRM && (
          <div className="form-group">
            <label>TRM vigente (COP/USD)</label>
            <input type="number" value={trm} step={1}
              onChange={function(e) { setTrm(parseFloat(e.target.value) || 4250); }} />
          </div>
        )}

        <SliderInput label="Tasa de Descuento / Corte (r%) E.A." tooltip="Tasa de mercado para valorar el precio de suscripcion." min={0} max={30} step={0.1} value={descVal} onChange={setDescVal} />

        <button className="btn-calc" onClick={calcular}>Calcular Rendimiento</button>
      </div>

      <div className="card preview-card">
        <div className="card-title">Vista Previa</div>
        <div className="card-sub">Presiona Calcular para ver el detalle</div>
        {!results ? (
          <div className="empty-state">
            <div className="empty-icon">&#9889;</div>
            <div>Los resultados apareceran aqui</div>
          </div>
        ) : (
          <div className="quick-results">
            <div className="result-grid">
              <div className="result-item highlight">
                <div className="r-label">Tasa Cupon E.A.</div>
                <div className="r-value big">{(results.teaAnual * 100).toFixed(4)}%</div>
                <div className="r-sub">Efectiva Anual</div>
              </div>
              <div className="result-item gold">
                <div className="r-label">Precio Suscripcion</div>
                <div className="r-value">{fmtCOP(results.precio / numBonos)}</div>
                <div className="r-sub">{(results.precio / results.capitalBase * 100).toFixed(2)}% del nominal</div>
              </div>
              <div className="result-item">
                <div className="r-label">Cupon Periodico</div>
                <div className="r-value">{fmtCOP(results.flujos[0].intPeriodo)}</div>
                <div className="r-sub">Interes por periodo</div>
              </div>
              <div className="result-item">
                <div className="r-label">Total Intereses</div>
                <div className="r-value">{fmtCOP(results.totalIntereses)}</div>
                <div className="r-sub">Suma todos los periodos</div>
              </div>
            </div>
            <div className="mini-chart-wrap">
              <MiniChart flujos={results.flujos} serie={serie} />
            </div>
          </div>
        )}
      </div>

      {results && (
        <div className="results-card" id="results-section">
          <div className="card-title">Tabla de Flujos de Caja</div>
          <div className="card-sub">Proyeccion completa - Prospecto ESSA - Febrero 2026</div>
          <div className="flow-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Periodo</th><th>Fecha Pago</th><th>Saldo Capital</th>
                  <th>Interes Periodo</th><th>Amortizacion</th>
                  <th>Flujo Total</th><th>VP Flujo</th>
                </tr>
              </thead>
              <tbody>
                {results.flujos.map(function(f) {
                  return (
                    <tr key={f.i}>
                      <td className="td-period">{getPeriodoLabel(f.i, m)}</td>
                      <td>{f.fechaStr}</td>
                      <td>{fmtCOP(f.capital)}</td>
                      <td className="td-up">{fmtCOP(f.intPeriodo)}</td>
                      <td>{f.amort > 0 ? fmtCOP(f.amort) : '-'}</td>
                      <td>{fmtCOP(f.flujoTotal)}</td>
                      <td>{fmtCOP(f.vp)}</td>
                    </tr>
                  );
                })}
                <tr className="totals-row">
                  <td colSpan={3} className="td-total">TOTALES</td>
                  <td className="td-total td-up">{fmtCOP(results.totalIntereses)}</td>
                  <td className="td-total">{fmtCOP(results.capitalBase)}</td>
                  <td className="td-total">{fmtCOP(results.totalIntereses + results.capitalBase)}</td>
                  <td className="td-total">{fmtCOP(results.precio)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="result-grid summary-grid">
            {summaryItems.map(function(item) {
              return (
                <div className={'result-item' + (item.c ? ' ' + item.c : '')} key={item.l}>
                  <div className="r-label">{item.l}</div>
                  <div className={'r-value' + (item.c === 'highlight' ? ' big' : '')}>{item.v}</div>
                  <div className="r-sub">{item.s}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  </div>

  <footer>
    <strong>Electrificadora de Santander S.A. E.S.P. ESSA</strong><br/>
    Prospecto de Informacion - Bonos de Deuda Publica Interna - Febrero 2026<br/>
    Uso academico e ilustrativo - BVC - Administrado por Deceval S.A.
  </footer>
</div>
```

);
}
