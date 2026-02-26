import { useState, useCallback, useEffect } from ‘react’;

/* ================================================================
ESSA - Calculadora de Bonos BDPI
TODO en un solo archivo: estilos + logica + componentes
Prospecto de Informacion - Febrero 2026
================================================================ */

/* ── INYECTAR CSS GLOBALMENTE ── */
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400&display=swap'); *,*::before,*::after{box-sizing:border-box;margin:0;padding:0} html{scroll-behavior:smooth} body{font-family:'DM Sans',sans-serif;background:#F4F7FF;color:#374169;min-height:100vh;overflow-x:hidden} .bg-canvas{position:fixed;inset:0;z-index:0;pointer-events:none;background:linear-gradient(135deg,#00205B 0%,#0046B5 50%,#003087 100%);overflow:hidden} .bg-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:48px 48px} .bg-orb{position:absolute;border-radius:50%;filter:blur(60px);animation:orbit 15s linear infinite} .orb1{width:400px;height:400px;background:rgba(0,92,230,.4);top:-100px;right:-100px} .orb2{width:300px;height:300px;background:rgba(77,143,255,.25);bottom:-50px;left:-80px;animation-duration:20s;animation-direction:reverse} @keyframes orbit{0%{transform:rotate(0deg) translateX(30px) rotate(0deg)}100%{transform:rotate(360deg) translateX(30px) rotate(-360deg)}} .page-wrapper{position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column} .site-header{position:sticky;top:0;z-index:100;padding:0 40px;height:80px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.1);backdrop-filter:blur(12px);background:rgba(0,32,91,.6)} .logo-area{display:flex;align-items:center;gap:16px} .logo-mark{width:52px;height:52px;background:#fff;border-radius:14px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.3);flex-shrink:0} .logo-svg{width:44px;height:44px} .logo-text strong{font-family:'Playfair Display',serif;font-size:22px;font-weight:900;letter-spacing:1px;color:#fff;display:block;line-height:1} .logo-text span{font-size:11px;color:#B3CFFF;letter-spacing:2px;text-transform:uppercase} .header-badge{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#fff;padding:8px 18px;border-radius:40px;font-size:13px;font-weight:500} .hero{padding:80px 40px 60px;text-align:center;color:#fff} .hero-tag{display:inline-block;background:rgba(245,166,35,.2);border:1px solid rgba(245,166,35,.5);color:#F5A623;padding:6px 20px;border-radius:40px;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-bottom:24px} .hero h1{font-family:'Playfair Display',serif;font-size:clamp(36px,6vw,64px);font-weight:900;line-height:1.05;margin-bottom:20px} .hero h1 em{font-style:normal;color:#F5A623} .hero p{font-size:17px;color:#B3CFFF;max-width:600px;margin:0 auto 40px;line-height:1.6} .hero-stats{display:flex;justify-content:center;gap:40px;flex-wrap:wrap} .stat-item{text-align:center} .stat-num{font-family:'Playfair Display',serif;font-size:32px;font-weight:700;color:#fff} .stat-label{font-size:12px;color:#B3CFFF;text-transform:uppercase;letter-spacing:1.5px;margin-top:4px} .main-content{flex:1;padding:0 40px 80px;max-width:1300px;margin:0 auto;width:100%} .section-label{color:#fff;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-bottom:20px;opacity:.7;display:flex;align-items:center;gap:10px} .section-label::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.15)} .series-selector{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:28px} .series-btn{padding:11px 24px;border-radius:50px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;transition:all .25s;backdrop-filter:blur(8px);display:flex;align-items:center;gap:10px} .series-btn:hover{border-color:rgba(255,255,255,.5);background:rgba(255,255,255,.15)} .series-btn.active{background:#fff;color:#00205B;border-color:#fff;box-shadow:0 4px 20px rgba(0,0,0,.3)} .series-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;display:inline-block} .formula-card{background:linear-gradient(135deg,#00205B 0%,#001844 100%);border-radius:20px;padding:28px 32px;color:#fff;position:relative;overflow:hidden;margin-bottom:24px} .formula-title{font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#B3CFFF;margin-bottom:20px;font-weight:600;display:flex;align-items:center;gap:8px} .formula-title::before{content:'';width:24px;height:2px;background:#F5A623;display:inline-block} .formula-box{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:24px} .f-step-label{font-size:13px;color:#B3CFFF;margin-bottom:8px} .f-badge{background:#F5A623;color:#000;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;margin-right:8px;letter-spacing:1px} .f-main{font-family:'DM Mono',monospace;font-size:18px;color:#fff;text-align:center;margin:12px 0 18px;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:8px} .fh{color:#F5A623} .fb{color:#4D8FFF} .fg{color:#4FFFB0} .fo{color:rgba(255,255,255,.4);font-size:16px} .fsigma{font-size:26px;color:rgba(255,255,255,.6)} .f-legend{display:grid;grid-template-columns:auto 1fr;gap:8px 16px;font-size:13px;color:#B3CFFF;margin-top:16px} .sym{color:#F5A623;font-weight:600;font-family:'DM Mono',monospace} .calc-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px} .card{background:#fff;border-radius:20px;padding:32px;box-shadow:0 8px 40px rgba(0,32,91,.14);position:relative;overflow:hidden} .card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#0046B5,#4D8FFF)} .card-title{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#00205B;margin-bottom:8px} .card-sub{font-size:13px;color:#6B7594;margin-bottom:24px} .series-info{background:#E8F0FF;border:1px solid #B3CFFF;border-radius:12px;padding:14px 18px;margin-bottom:24px;font-size:13px;color:#003087;line-height:1.6} .form-group{margin-bottom:20px} .form-group label{display:block;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6B7594;margin-bottom:8px} .form-group input[type=number],.form-group select{width:100%;padding:13px 16px;border:2px solid #F0F2F7;border-radius:12px;font-family:'DM Sans',sans-serif;font-size:15px;color:#374169;background:#F0F2F7;outline:none;appearance:none;transition:all .2s} .form-group input[type=number]:focus,.form-group select:focus{border-color:#005CE6;background:#fff;box-shadow:0 0 0 4px rgba(0,70,181,.08)} .input-hint{font-size:12px;color:#6B7594;margin-top:6px} .tooltip-wrap{position:relative;display:inline-flex;align-items:center;gap:6px} .tooltip-icon{width:16px;height:16px;background:#E8F0FF;color:#0046B5;border-radius:50%;font-size:10px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;cursor:help;flex-shrink:0} .tooltip-text{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:#00205B;color:#fff;font-size:12px;line-height:1.5;padding:10px 14px;border-radius:10px;opacity:0;pointer-events:none;transition:opacity .2s;z-index:50;max-width:240px;white-space:normal;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.3)} .tooltip-icon:hover + .tooltip-text{opacity:1} .slider-wrap{display:flex;align-items:center;gap:16px;margin-bottom:8px} input[type=range]{flex:1;height:6px;-webkit-appearance:none;appearance:none;background:#F0F2F7;border-radius:99px;cursor:pointer;border:none;padding:0;outline:none} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;background:#0046B5;border-radius:50%;box-shadow:0 2px 8px rgba(0,70,181,.4);cursor:pointer;transition:transform .15s} input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.2)} .slider-val{min-width:60px;text-align:center;font-family:'DM Mono',monospace;font-size:13px;font-weight:500;color:#0046B5;background:#E8F0FF;padding:5px 10px;border-radius:8px} .btn-calc{width:100%;padding:18px;margin-top:8px;background:linear-gradient(135deg,#0046B5,#00205B);color:#fff;border:none;border-radius:12px;font-family:'DM Sans',sans-serif;font-size:16px;font-weight:700;cursor:pointer;transition:all .25s;box-shadow:0 6px 24px rgba(0,70,181,.35)} .btn-calc:hover{transform:translateY(-2px);box-shadow:0 10px 32px rgba(0,70,181,.5)} .preview-card{display:flex;flex-direction:column} .empty-state{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center;color:#6B7594} .empty-icon{font-size:64px;margin-bottom:16px;opacity:.15;filter:grayscale(1)} .mini-chart-wrap{width:100%;height:100px;margin-top:20px} .result-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;margin-top:20px} .result-item{background:#F4F7FF;border-radius:12px;padding:18px;text-align:center;border:1px solid #E8F0FF;transition:all .3s} .result-item:hover{transform:translateY(-3px);box-shadow:0 4px 24px rgba(0,32,91,.1)} .r-label{font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#6B7594;margin-bottom:8px;font-weight:600} .r-value{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#00205B;line-height:1} .r-value.big{font-size:26px;color:#0046B5} .r-sub{font-size:11px;color:#6B7594;margin-top:6px;font-family:'DM Mono',monospace} .result-item.highlight{background:linear-gradient(135deg,#0046B5,#00205B)} .result-item.highlight .r-label,.result-item.highlight .r-sub{color:#B3CFFF} .result-item.highlight .r-value{color:#fff} .result-item.gold{background:linear-gradient(135deg,#F5A623,#E8860A)} .result-item.gold .r-label,.result-item.gold .r-sub{color:rgba(0,0,0,.55)} .result-item.gold .r-value{color:#fff} .results-card{background:#fff;border-radius:20px;padding:32px;box-shadow:0 8px 40px rgba(0,32,91,.14);grid-column:1/-1;position:relative;overflow:hidden} .results-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#F5A623,#4D8FFF)} .flow-table-wrap{margin-top:24px;overflow-x:auto;border-radius:12px;border:1px solid #E8F0FF} table{width:100%;border-collapse:collapse;font-size:14px} thead{background:linear-gradient(135deg,#00205B,#0046B5);color:#fff} thead th{padding:14px 18px;text-align:left;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;white-space:nowrap} tbody tr{border-bottom:1px solid #F4F7FF;transition:background .15s} tbody tr:hover{background:#F4F7FF} .totals-row{background:#F4F7FF;font-weight:700} tbody td{padding:13px 18px;color:#374169;font-family:'DM Mono',monospace;font-size:13px} .td-period{font-family:'DM Sans',sans-serif;font-weight:600;color:#003087} .td-up{color:#00B274} .td-total{font-family:'Playfair Display',serif;font-size:15px;color:#00205B;font-weight:700} .summary-grid{margin-top:24px} footer{background:rgba(0,32,91,.92);border-top:1px solid rgba(255,255,255,.1);padding:28px 40px;color:#B3CFFF;font-size:12px;text-align:center;line-height:1.8;position:relative;z-index:1} footer strong{color:#fff} @media(max-width:900px){.calc-grid{grid-template-columns:1fr}} @media(max-width:768px){.site-header{padding:0 20px}.hero,.main-content{padding-left:20px;padding-right:20px}.hero h1{font-size:36px}.series-btn{font-size:12px;padding:9px 14px}.formula-card,.card{padding:20px}footer{padding:20px}}`;

/* ── DATOS DE CADA SERIE ── */
const SERIES_CONFIG = {
A: {
name: ‘Serie A - IPC + Margen’, color: ‘#4D8FFF’, nominal: 10000000, moneda: ‘COP’, convencion: 365,
info: ‘Bonos en Pesos. TEA = (1+IPC) x (1+Margen) - 1. Convencion 365/365. El IPC es certificado por el DANE.’,
labelInd: ‘IPC Anual (%) E.A.’, labelMar: ‘Margen Adicional (%) E.A.’,
ttInd: ‘Inflacion anual certificada por el DANE al inicio o fin del periodo.’,
ttMar: ‘Spread en terminos efectivos anuales, fijado en el Aviso de Oferta Publica.’,
showIBR: false, showUVR: false, showTRM: false,
},
B: {
name: ‘Serie B - Tasa Fija’, color: ‘#F5A623’, nominal: 10000000, moneda: ‘COP’, convencion: 365,
info: ‘Bonos en Pesos con tasa fija definida como Tasa Cupon en la Oferta Publica, expresada en terminos efectivos anuales.’,
labelInd: ‘Tasa Cupon Fija (%) E.A.’, labelMar: null,
ttInd: ‘Tasa fija en terminos efectivos anuales definida en la Oferta Publica.’,
showIBR: false, showUVR: false, showTRM: false,
},
C: {
name: ‘Serie C - IBR + Margen’, color: ‘#00B274’, nominal: 10000000, moneda: ‘COP’, convencion: 360,
info: ‘Bonos en Pesos. Tasa N = IBR + Margen. Convencion 360/360. IBR publicado por el Banco de la Republica.’,
labelInd: ‘IBR Nominal (%)’, labelMar: ‘Margen Adicional (%) Nominal’,
ttInd: ‘Tasa IBR publicada por el Banco de la Republica al plazo seleccionado.’,
ttMar: ‘Spread nominal adicional sobre el IBR.’,
showIBR: true, showUVR: false, showTRM: false,
},
D: {
name: ‘Serie D - UVR + Tasa Fija’, color: ‘#E86FAB’, nominal: 100000, moneda: ‘UVR’, convencion: 365,
info: ‘Bonos en UVR. Capital e intereses convertidos a Pesos por el valor UVR certificado por el Banco de la Republica.’,
labelInd: ‘Tasa Cupon Fija (%) E.A.’, labelMar: null,
ttInd: ‘Tasa fija E.A. sobre capital en UVR convertido a Pesos al ultimo dia del periodo.’,
showIBR: false, showUVR: true, showTRM: false,
},
E: {
name: ‘Serie E - USD + Tasa Fija’, color: ‘#FF7043’, nominal: 5000, moneda: ‘USD’, convencion: 365,
info: ‘Bonos en Dolares. Intereses en USD pagados en Pesos via TRM certificada por la SFC.’,
labelInd: ‘Tasa Cupon Fija (%) E.A.’, labelMar: null,
ttInd: ‘Tasa fija E.A. en dolares. Pagos en Pesos usando la TRM del ultimo dia del periodo.’,
showIBR: false, showUVR: false, showTRM: true,
},
};

const DOT_COLORS = { A: ‘#4D8FFF’, B: ‘#F5A623’, C: ‘#00B274’, D: ‘#E86FAB’, E: ‘#FF7043’ };

/* ── UTILIDADES ── */
function fmtCOP(v) {
return ’$ ’ + Math.round(v).toLocaleString(‘es-CO’);
}
function periodoLabel(i, m) {
var map = { 12: ‘Mes’, 4: ‘Trim’, 2: ‘Sem’, 1: ‘Ano’ };
return (map[m] || ‘Per’) + ’ ’ + i;
}

/* ── COMPONENTE: FORMULA POR SERIE ── */
function FormulaCard({ serie }) {
var fA = (
<div>
<div className="formula-title">Formula Oficial - Serie A - IPC + Margen</div>
<div className="formula-box">
<div className="f-step-label"><span className="f-badge">PASO 1</span>Tasa Efectiva Anual compuesta</div>
<div className="f-main">
<span className="fh">TEA</span><span className="fo">=</span>
<span>(1+<span className="fb">IPC</span>) x (1+<span className="fg">M</span>) - 1</span>
</div>
<div className="f-step-label"><span className="f-badge">PASO 2</span>Precio de Suscripcion (Valor Presente)</div>
<div className="f-main">
<span className="fh">P</span><span className="fo">=</span>
<span className="fsigma">S</span>
<span className="fb">Fi</span><span className="fo">/</span>
<span>(1+<span className="fh">r</span>)<sup className="fg">ti</sup></span>
</div>
<div className="f-legend">
<span className="sym">TEA</span><span>Tasa Efectiva Anual combinada del periodo</span>
<span className="sym">IPC</span><span>Inflacion certificada DANE - E.A.</span>
<span className="sym">M</span><span>Margen adicional - E.A.</span>
<span className="sym">P</span><span>Precio de Suscripcion en COP</span>
<span className="sym">Fi</span><span>Flujo de interes o amortizacion periodo i</span>
<span className="sym">r</span><span>Tasa de Corte E.A.</span>
<span className="sym">ti</span><span>Tiempo en anos hasta pago i - conv 365/365</span>
</div>
</div>
</div>
);
var fB = (
<div>
<div className="formula-title">Formula Oficial - Serie B - Tasa Fija</div>
<div className="formula-box">
<div className="f-step-label"><span className="f-badge">PASO 1</span>Conversion E.A. a Tasa Nominal periodica</div>
<div className="f-main">
<span className="fh">inom</span><span className="fo">=</span>
<span>m x [(1+<span className="fb">TEA</span>)<sup>1/m</sup> - 1]</span>
</div>
<div className="f-step-label"><span className="f-badge">PASO 2</span>Precio de Suscripcion</div>
<div className="f-main">
<span className="fh">P</span><span className="fo">=</span>
<span className="fsigma">S</span>
<span className="fb">Fi</span><span className="fo">/</span>
<span>(1+<span className="fh">r</span>)<sup className="fg">ti</sup></span>
</div>
<div className="f-legend">
<span className="sym">TEA</span><span>Tasa Cupon fija E.A.</span>
<span className="sym">m</span><span>Periodos por ano (12, 4, 2 o 1)</span>
<span className="sym">inom</span><span>Tasa nominal periodica equivalente</span>
<span className="sym">r</span><span>Tasa de Corte E.A.</span>
</div>
</div>
</div>
);
var fC = (
<div>
<div className="formula-title">Formula Oficial - Serie C - IBR + Margen (360/360)</div>
<div className="formula-box">
<div className="f-step-label"><span className="f-badge">PASO 1</span>Tasa Nominal Total segun plazo IBR</div>
<div className="f-main">
<span className="fh">inom</span><span className="fo">=</span>
<span className="fb">IBR</span><span className="fo">+</span><span className="fg">Margen</span>
</div>
<div className="f-step-label"><span className="f-badge">PASO 2</span>Interes del periodo (conv 360/360)</div>
<div className="f-main">
<span className="fh">Interes</span><span className="fo">=</span>
<span>Capital x <span className="fb">inom</span> x (n/360)</span>
</div>
<div className="f-step-label"><span className="f-badge">PASO 3</span>Precio de Suscripcion</div>
<div className="f-main">
<span className="fh">P</span><span className="fo">=</span>
<span className="fsigma">S</span>
<span className="fb">Fi</span><span className="fo">/</span>
<span>(1+<span className="fh">r</span>)<sup className="fg">ti</sup></span>
</div>
<div className="f-legend">
<span className="sym">IBR</span><span>IBR nominal al plazo NMV / NTV / NSV / NAV (base 360 dias)</span>
<span className="sym">n</span><span>Dias del periodo de intereses</span>
<span className="sym">r</span><span>Tasa de descuento E.A. para valoracion</span>
</div>
</div>
</div>
);
var fD = (
<div>
<div className="formula-title">Formula Oficial - Serie D - UVR + Tasa Fija</div>
<div className="formula-box">
<div className="f-step-label"><span className="f-badge">PASO 1</span>Conversion Capital UVR a Pesos</div>
<div className="f-main">
<span className="fh">CapCOP</span><span className="fo">=</span>
<span>CapUVR x <span className="fb">UVRt</span></span>
</div>
<div className="f-step-label"><span className="f-badge">PASO 2</span>Interes del periodo en Pesos</div>
<div className="f-main">
<span className="fh">IntCOP</span><span className="fo">=</span>
<span>CapUVR x <span className="fb">UVRfin</span> x inom</span>
</div>
<div className="f-step-label"><span className="f-badge">PASO 3</span>Precio Suscripcion en Pesos</div>
<div className="f-main">
<span className="fh">P</span><span className="fo">=</span>
<span className="fsigma">S</span>
<span className="fb">Fi</span><span className="fo">/</span>
<span>(1+r)<sup>ti</sup></span>
<span className="fo">x</span><span className="fb">UVRs</span>
</div>
<div className="f-legend">
<span className="sym">UVRt</span><span>UVR certificada Banco de la Republica en fecha t</span>
<span className="sym">UVRfin</span><span>UVR al ultimo dia del periodo de intereses</span>
<span className="sym">UVRs</span><span>UVR en Fecha de Suscripcion</span>
</div>
</div>
</div>
);
var fE = (
<div>
<div className="formula-title">Formula Oficial - Serie E - USD Tasa Fija via TRM</div>
<div className="formula-box">
<div className="f-step-label"><span className="f-badge">PASO 1</span>Interes en Dolares del periodo</div>
<div className="f-main">
<span className="fh">IntUSD</span><span className="fo">=</span>
<span>CapUSD x inom</span>
</div>
<div className="f-step-label"><span className="f-badge">PASO 2</span>Conversion a Pesos usando TRM</div>
<div className="f-main">
<span className="fh">IntCOP</span><span className="fo">=</span>
<span>CapUSD x inom x <span className="fb">TRMfin</span></span>
</div>
<div className="f-step-label"><span className="f-badge">PASO 3</span>Precio Suscripcion en Pesos</div>
<div className="f-main">
<span className="fh">P</span><span className="fo">=</span>
<span className="fsigma">S</span>
<span className="fb">Fi</span><span className="fo">/</span>
<span>(1+r)<sup>ti</sup></span>
<span className="fo">x</span><span className="fb">TRMs</span>
</div>
<div className="f-legend">
<span className="sym">TRMfin</span><span>TRM certificada por SFC al ultimo dia del periodo</span>
<span className="sym">TRMs</span><span>TRM vigente en la Fecha de Suscripcion</span>
</div>
</div>
</div>
);
var map = { A: fA, B: fB, C: fC, D: fD, E: fE };
return map[serie] || fA;
}

/* ── COMPONENTE: SLIDER CON INPUT ── */
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
<input type=“range” min={min} max={max} step={step} value={value}
onChange={function(e) { onChange(parseFloat(e.target.value)); }} />
<span className="slider-val">{display}</span>
</div>
<input type=“number” value={value} step={step} min={min} max={max}
style={{ marginTop: ‘8px’, width: ‘100%’, padding: ‘10px 14px’, border: ‘2px solid #F0F2F7’, borderRadius: ‘12px’, fontFamily: ‘DM Sans,sans-serif’, fontSize: ‘15px’, color: ‘#374169’, background: ‘#F0F2F7’, outline: ‘none’ }}
onChange={function(e) { onChange(parseFloat(e.target.value) || 0); }} />
</div>
);
}

/* ── COMPONENTE: GRAFICO DE BARRAS ── */
function MiniChart({ flujos, serie }) {
var col = DOT_COLORS[serie] || ‘#4D8FFF’;
var maxVal = Math.max.apply(null, flujos.map(function(f) { return f.flujoTotal; }));
var W = 700, H = 90, PAD = 8;
var bw = Math.max(2, (W - PAD * 2) / flujos.length - 2);
return (
<svg viewBox={’0 0 ’ + W + ’ ’ + H} preserveAspectRatio=“none” style={{ width: ‘100%’, height: ‘100%’, display: ‘block’ }}>
<defs>
<linearGradient id="gbg" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stopColor={col} stopOpacity="0.1" />
<stop offset="100%" stopColor={col} stopOpacity="0.02" />
</linearGradient>
</defs>
<rect x={0} y={0} width={W} height={H} rx="8" fill="url(#gbg)" />
{flujos.map(function(f, idx) {
var bh = Math.max(2, (f.flujoTotal / maxVal) * (H - PAD - 12));
var x = PAD + idx * ((W - PAD * 2) / flujos.length) + 1;
var y = H - PAD - bh - 8;
return <rect key={idx} x={x.toFixed(1)} y={y.toFixed(1)} width={bw.toFixed(1)} height={bh.toFixed(1)} rx="3" fill={col} opacity={f.amort > 0 ? 1 : 0.55} />;
})}
<text x={W / 2} y={H - 1} textAnchor=“middle” fontSize=“9” fill=”#999” fontFamily=“DM Sans,sans-serif”>
Flujos de caja - ultima barra incluye devolucion de capital
</text>
</svg>
);
}

/* ════════════════════════════════════════
COMPONENTE PRINCIPAL
════════════════════════════════════════ */
export default function App() {
/* Inyectar CSS una sola vez */
useEffect(function() {
var tag = document.getElementById(‘essa-styles’);
if (!tag) {
var s = document.createElement(‘style’);
s.id = ‘essa-styles’;
s.innerHTML = CSS;
document.head.appendChild(s);
}
}, []);

/* Estado */
var r1 = useState(‘A’); var serie = r1[0]; var setSerie = r1[1];
var r2 = useState(10); var numBonos = r2[0]; var setNumBonos = r2[1];
var r3 = useState(6.5); var indVal = r3[0]; var setIndVal = r3[1];
var r4 = useState(2.5); var marVal = r4[0]; var setMarVal = r4[1];
var r5 = useState(5); var plazo = r5[0]; var setPlazo = r5[1];
var r6 = useState(2); var m = r6[0]; var setM = r6[1];
var r7 = useState(10.5); var descVal = r7[0]; var setDescVal = r7[1];
var r8 = useState(388.45); var uvr = r8[0]; var setUvr = r8[1];
var r9 = useState(4250); var trm = r9[0]; var setTrm = r9[1];
var r10 = useState(null); var results = r10[0]; var setResults = r10[1];

var cfg = SERIES_CONFIG[serie];

function nominalDisplay() {
var n = numBonos * cfg.nominal;
if (cfg.moneda === ‘COP’) return ’Valor nominal total: ’ + fmtCOP(n);
if (cfg.moneda === ‘UVR’) return n.toLocaleString(‘es-CO’) + ’ UVR aprox ’ + fmtCOP(n * uvr);
return ’USD ’ + n.toLocaleString(‘es-CO’) + ’ aprox ’ + fmtCOP(n * trm);
}

/* CALCULO PRINCIPAL */
var calcular = useCallback(function() {
var ind = indVal / 100;
var mar = marVal / 100;
var r = descVal / 100;
var capMult = serie === ‘D’ ? uvr : serie === ‘E’ ? trm : 1;
var teaAnual, iPer;

```
if (serie === 'A') {
  teaAnual = (1 + ind) * (1 + mar) - 1;
  iPer = Math.pow(1 + teaAnual, 1 / m) - 1;
} else if (serie === 'C') {
  var iN = ind + mar;
  teaAnual = Math.pow(1 + iN / m, m) - 1;
  iPer = iN / m;
} else {
  teaAnual = ind;
  iPer = Math.pow(1 + teaAnual, 1 / m) - 1;
}

var totalP = plazo * m;
var capBase = cfg.nominal * numBonos;
var flujos = [];
var totalInt = 0;

for (var i = 1; i <= totalP; i++) {
  var intP = capBase * iPer * capMult;
  var amort = i === totalP ? capBase * capMult : 0;
  var ft = intP + amort;
  var ti = i / m;
  var vp = ft / Math.pow(1 + r, ti);
  totalInt += intP;
  var fecha = new Date();
  fecha.setMonth(fecha.getMonth() + Math.round((12 / m) * i));
  var fechaStr = fecha.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  flujos.push({ i: i, fechaStr: fechaStr, capital: capBase * capMult, intPeriodo: intP, amort: amort, flujoTotal: ft, vp: vp, ti: ti });
}

var precio = flujos.reduce(function(a, f) { return a + f.vp; }, 0);
var duracion = flujos.reduce(function(a, f) { return a + f.ti * (f.vp / precio); }, 0);

setResults({
  teaAnual: teaAnual, flujos: flujos, precio: precio,
  totalIntereses: totalInt, capitalBase: capBase * capMult,
  duracion: duracion, totalPeriodos: totalP, r: r,
});

setTimeout(function() {
  var el = document.getElementById('results-section');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}, 100);
```

}, [serie, numBonos, indVal, marVal, plazo, m, descVal, uvr, trm, cfg]);

var summaryItems = results ? [
{ l: ‘Capital Total’, v: fmtCOP(results.capitalBase), s: numBonos + ’ bono(s)’ },
{ l: ‘Intereses Totales’, v: fmtCOP(results.totalIntereses), s: results.totalPeriodos + ’ pagos’ },
{ l: ‘Retorno Bruto’, v: ((results.totalIntereses / results.capitalBase) * 100).toFixed(2) + ‘%’, s: ‘Sobre el capital’ },
{ l: ‘Precio Suscripcion Total’, v: fmtCOP(results.precio), s: (results.precio / results.capitalBase * 100).toFixed(2) + ‘% del nominal’, c: ‘highlight’ },
{ l: ‘Duracion Macaulay’, v: results.duracion.toFixed(3), s: ‘anos’ },
{ l: ‘Tasa Cupon E.A.’, v: (results.teaAnual * 100).toFixed(4) + ‘%’, s: ‘Conv. ’ + cfg.convencion + ‘/365’ },
{ l: ‘Tasa Desc. Aplicada’, v: (results.r * 100).toFixed(2) + ‘%’, s: ‘Para precio suscripcion’, c: ‘gold’ },
{ l: ‘Plazo Total’, v: plazo + ’ anos’, s: results.totalPeriodos + ’ periodos’ },
] : [];

/* ── RENDER ── */
return (
<div>
{/* FONDO ANIMADO */}
<div className="bg-canvas">
<div className="bg-grid" />
<div className="bg-orb orb1" />
<div className="bg-orb orb2" />
</div>

```
  <div className="page-wrapper">

    {/* HEADER */}
    <header className="site-header">
      <div className="logo-area">
        <div className="logo-mark">
          <svg className="logo-svg" viewBox="0 0 44 44" fill="none">
            <rect width="44" height="44" rx="10" fill="#00205B" />
            <path d="M26 6L14 22H22L18 38L30 20H22L26 6Z" fill="#F5A623" />
            <circle cx="12" cy="22" r="2.5" fill="white" opacity="0.6" />
            <circle cx="32" cy="22" r="2.5" fill="white" opacity="0.6" />
            <line x1="12" y1="22" x2="16" y2="22" stroke="white" strokeWidth="1.5" opacity="0.4" />
            <line x1="28" y1="22" x2="32" y2="22" stroke="white" strokeWidth="1.5" opacity="0.4" />
          </svg>
        </div>
        <div className="logo-text">
          <strong>ESSA</strong>
          <span>Electrificadora de Santander</span>
        </div>
      </div>
      <div className="header-badge">Mercado de Valores - Colombia</div>
    </header>

    {/* HERO */}
    <div className="hero">
      <div className="hero-tag">Prospecto de Informacion - Febrero 2026</div>
      <h1>Bonos de <em>Deuda Publica</em><br />Interna BDPI</h1>
      <p>Calculadora interactiva de rendimiento segun el Prospecto oficial de Emision y Colocacion. Selecciona la serie que te interesa.</p>
      <div className="hero-stats">
        <div className="stat-item"><div className="stat-num">$200MM</div><div className="stat-label">Monto Total COP</div></div>
        <div className="stat-item"><div className="stat-num">5</div><div className="stat-label">Series A B C D E</div></div>
        <div className="stat-item"><div className="stat-num">1-50</div><div className="stat-label">Anos Plazo Maximo</div></div>
        <div className="stat-item"><div className="stat-num">BVC</div><div className="stat-label">Bolsa de Valores</div></div>
      </div>
    </div>

    {/* CONTENIDO PRINCIPAL */}
    <div className="main-content">
      <div className="section-label">Selecciona la Serie del Bono</div>

      {/* SELECTOR DE SERIES */}
      <div className="series-selector">
        {Object.keys(SERIES_CONFIG).map(function(s) {
          return (
            <button key={s}
              className={'series-btn' + (serie === s ? ' active' : '')}
              onClick={function() { setSerie(s); setResults(null); }}>
              <span className="series-dot" style={{ background: DOT_COLORS[s] }} />
              {SERIES_CONFIG[s].name}
            </button>
          );
        })}
      </div>

      {/* FORMULA */}
      <div className="formula-card">
        <FormulaCard serie={serie} />
      </div>

      {/* GRID CALCULADORA */}
      <div className="calc-grid">

        {/* COLUMNA IZQUIERDA - PARAMETROS */}
        <div className="card">
          <div className="card-title">Parametros del Bono</div>
          <div className="card-sub">{cfg.name} - {cfg.moneda}</div>
          <div className="series-info">{cfg.info}</div>

          <div className="form-group">
            <label>Numero de Bonos a Suscribir</label>
            <input type="number" value={numBonos} min="1" max="10000"
              onChange={function(e) { setNumBonos(parseInt(e.target.value) || 1); }} />
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
              <option value={12}>Mes Vencido (12 pagos/ano)</option>
              <option value={4}>Trimestre Vencido (4 pagos/ano)</option>
              <option value={2}>Semestre Vencido (2 pagos/ano)</option>
              <option value={1}>Ano Vencido (1 pago/ano)</option>
            </select>
          </div>

          {cfg.showIBR && (
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

        {/* COLUMNA DERECHA - VISTA PREVIA */}
        <div className="card preview-card">
          <div className="card-title">Vista Previa del Calculo</div>
          <div className="card-sub">Presiona Calcular para ver el detalle completo</div>

          {!results ? (
            <div className="empty-state">
              <div className="empty-icon">&#9889;</div>
              <div>Los resultados apareceran aqui</div>
            </div>
          ) : (
            <div>
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

        {/* TABLA COMPLETA DE FLUJOS */}
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
                        <td className="td-period">{periodoLabel(f.i, m)}</td>
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

    {/* FOOTER */}
    <footer>
      <strong>Electrificadora de Santander S.A. E.S.P. - ESSA</strong><br />
      Prospecto de Informacion - Bonos de Deuda Publica Interna - Febrero 2026<br />
      Uso academico e ilustrativo - BVC - Administrado por Deceval S.A.
    </footer>

  </div>
</div>
```

);
}
