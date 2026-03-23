const $ = (id) => document.getElementById(id);

const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const debounce = (fn, delay = 180) => {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const apiJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok || data.success === false) throw new Error(data.error || data.message || "Request failed.");
  return data;
};

const replaceNode = (node) => {
  if (!node || !node.parentNode) return node;
  const clone = node.cloneNode(true);
  node.parentNode.replaceChild(clone, node);
  return clone;
};

const todayIso = () => new Date().toISOString().slice(0, 10);
const parseDisplayDate = (value) => {
  const match = String(value || "").match(/^(\d{2})-(\d{2})-(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : todayIso();
};
const formatDisplayDate = (iso) => {
  const match = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
};
const prettyDate = (iso) => {
  const [y, m, d] = String(iso || "").split("-").map(Number);
  return y && m && d ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(y, m - 1, d)) : iso;
};
const shortStation = (label) => {
  const value = String(label || "").trim();
  const match = value.match(/^(.*)\(([A-Z0-9]{2,6})\)$/);
  if (!match) return value;
  return `${match[1].trim()} (${match[2]})`;
};
const compactTime = (value) => {
  const match = String(value || "").match(/^(\d{1,2}:\d{2})/);
  return match ? match[1] : String(value || "");
};
const durationToMinutes = (value) => {
  const match = String(value || "").match(/(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?/i);
  if (!match) return Number.POSITIVE_INFINITY;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  return (hours * 60) + minutes;
};
const moneyToNumber = (value) => {
  const digits = String(value || "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : Number.POSITIVE_INFINITY;
};
const monthTitle = (year, monthIndex) => new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(year, monthIndex, 1));
const addDays = (iso, days) => {
  const [y, m, d] = String(iso).split("-").map(Number);
  const next = new Date(y, m - 1, d);
  next.setDate(next.getDate() + days);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
};
const tone = (text) => {
  const value = String(text || "").toLowerCase();
  if (value.includes("regret") || value.includes("no seat")) return "availability-red";
  if (value.includes("wl") || value.includes("wait") || value.includes("rac") || value.includes("limited") || value.includes("moderate")) return "availability-amber";
  if (value.includes("avail") || value.includes("good") || value.includes("confirm") || value.includes("open")) return "availability-green";
  return "availability-green";
};

function injectTheme() {
  if ($("railmate-liquid-theme")) return;
  const style = document.createElement("style");
  style.id = "railmate-liquid-theme";
  style.textContent = `
    body{background:radial-gradient(circle at 0% 14%,rgba(255,153,51,.14),transparent 24%),radial-gradient(circle at 100% 8%,rgba(19,136,8,.10),transparent 24%),linear-gradient(180deg,#fbfdff 0%,#eef3f9 100%);color:#0f172a}
    header{background:rgba(255,255,255,.78)!important;border-color:rgba(148,163,184,.18)!important;backdrop-filter:blur(20px) saturate(160%);-webkit-backdrop-filter:blur(20px) saturate(160%)}
    .section-bg-alt,#ai-planner,footer{background:transparent!important}
    .text-gray-500,.text-gray-600,.text-gray-400{color:#64748b!important}
    .text-gray-700,.text-gray-800,.text-gray-900{color:#14213d!important}
    .feature-card{background:linear-gradient(180deg,rgba(255,255,255,.82),rgba(255,255,255,.60))!important;border:1px solid rgba(255,255,255,.84)!important;box-shadow:0 24px 56px rgba(148,163,184,.16),inset 0 1px 0 rgba(255,255,255,.86)!important}
    .booking-stage{margin-top:1.4rem;padding:1.25rem;border-radius:30px;background:linear-gradient(180deg,rgba(244,247,251,.94),rgba(255,255,255,.82));border:1px solid rgba(255,255,255,.92);box-shadow:inset 0 1px 0 rgba(255,255,255,.95),0 22px 42px rgba(148,163,184,.12)}
    .booking-stage-head{display:grid;gap:1rem}
    .booking-stage-pills{display:flex;flex-wrap:wrap;gap:.6rem}
    .booking-stage-pill{display:inline-flex;align-items:center;justify-content:center;padding:.45rem .8rem;border-radius:999px;background:rgba(255,255,255,.8);border:1px solid rgba(226,232,240,.95);color:#475569;font-size:.86rem;font-weight:700}
    .booking-search-surface{padding:.9rem;border-radius:28px;background:linear-gradient(180deg,rgba(255,255,255,.95),rgba(255,255,255,.86));border:1px solid rgba(255,255,255,.94);box-shadow:inset 0 1px 0 rgba(255,255,255,.98),0 18px 34px rgba(148,163,184,.10)}
    .booking-topbar{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr) minmax(220px,.9fr) minmax(190px,.7fr);gap:.9rem;align-items:end}
    .booking-field{min-width:0}
    .booking-submit{height:100%}
    .swap-trigger{width:3.25rem;height:3.25rem;align-self:center;border-radius:999px;border:1px solid rgba(226,232,240,.95);background:linear-gradient(180deg,rgba(255,255,255,.94),rgba(248,250,252,.82));box-shadow:inset 0 1px 0 rgba(255,255,255,.98),0 14px 26px rgba(148,163,184,.12);display:inline-flex;align-items:center;justify-content:center;color:#1e293b;transition:transform .22s ease,box-shadow .22s ease}
    .swap-trigger:hover{transform:translateY(-2px) rotate(8deg);box-shadow:inset 0 1px 0 rgba(255,255,255,.98),0 18px 30px rgba(148,163,184,.15)}
    .glass-shell{background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.56));border:1px solid rgba(255,255,255,.84);box-shadow:0 24px 56px rgba(148,163,184,.16),inset 0 1px 0 rgba(255,255,255,.86);backdrop-filter:blur(24px) saturate(165%);-webkit-backdrop-filter:blur(24px) saturate(165%);border-radius:30px}
    .booking-surface{overflow:visible!important}
    .glass-input{position:relative;background:linear-gradient(180deg,rgba(255,255,255,.92),rgba(255,255,255,.72));border:1px solid rgba(203,213,225,.9);box-shadow:inset 0 1px 0 rgba(255,255,255,.88),0 10px 20px rgba(148,163,184,.10);border-radius:28px}
    .glass-input input{background:transparent!important;border:0!important;box-shadow:none!important;border-radius:28px!important;padding:1rem 1.15rem!important;font-size:1.04rem;color:#0f172a!important}
    #dep-date{padding-right:4.2rem!important}
    .glass-input label{background:rgba(255,255,255,.88)!important;color:#64748b!important}
    .glass-button{border-radius:28px!important;border:1px solid rgba(255,255,255,.18);background:linear-gradient(180deg,rgba(19,32,56,.96),rgba(29,46,77,.92));box-shadow:0 18px 38px rgba(15,23,42,.22),inset 0 1px 0 rgba(255,255,255,.08)}
    .results-wrap,.panel-wrap{display:grid;gap:1rem;padding:.85rem 0 0;background:transparent}
    .summary-card,.best-card,.choice-card,.next-card,.live-form,.live-board,.planner-card{border-radius:24px;border:1px solid rgba(255,255,255,.88);background:linear-gradient(180deg,rgba(255,255,255,.9),rgba(255,255,255,.72));box-shadow:inset 0 1px 0 rgba(255,255,255,.92),0 14px 26px rgba(148,163,184,.12)}
    .summary-card,.next-card,.planner-card{padding:1rem 1.1rem}
    .summary-top{display:grid;gap:.9rem}
    .summary-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.7rem}
    .summary-tile{padding:.85rem .95rem;border-radius:20px;background:rgba(255,255,255,.84);border:1px solid rgba(226,232,240,.92);box-shadow:inset 0 1px 0 rgba(255,255,255,.94)}
    .summary-label{font-size:.73rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#94a3b8}
    .summary-value{margin-top:.35rem;font-size:1.02rem;font-weight:800;color:#14213d;line-height:1.25}
    .summary-copy{font-size:1rem;line-height:1.55;color:#475569}
    .booking-layout{display:grid;grid-template-columns:320px minmax(0,1fr);gap:1rem}
    .booking-sidebar,.booking-main{display:grid;gap:1rem}
    .insight-card{display:grid;gap:.85rem}
    .stats-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.7rem}
    .stat-card{padding:.85rem .9rem;border-radius:18px;background:rgba(255,255,255,.82);border:1px solid rgba(226,232,240,.95);box-shadow:inset 0 1px 0 rgba(255,255,255,.96)}
    .stat-label{font-size:.72rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#94a3b8}
    .stat-value{margin-top:.3rem;font-size:1.02rem;font-weight:800;color:#16233f;line-height:1.25}
    .sidebar-card,.train-card{padding:1.05rem 1.15rem;border-radius:24px;border:1px solid rgba(255,255,255,.88);background:linear-gradient(180deg,rgba(255,255,255,.95),rgba(255,255,255,.84));box-shadow:inset 0 1px 0 rgba(255,255,255,.94),0 14px 26px rgba(148,163,184,.12)}
    .sidebar-title{font-size:.8rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#94a3b8}
    .sidebar-block{display:grid;gap:.65rem}
    .sidebar-insight{font-size:1rem;line-height:1.6;color:#475569}
    .sidebar-route{display:grid;gap:.55rem}
    .route-station-chip{display:flex;align-items:center;gap:.55rem;padding:.8rem .9rem;border-radius:18px;background:rgba(255,255,255,.84);border:1px solid rgba(226,232,240,.95);color:#1e293b;font-size:.94rem;font-weight:700}
    .route-station-chip::before{content:"";width:.55rem;height:.55rem;border-radius:999px;background:linear-gradient(180deg,rgba(255,153,51,.92),rgba(19,136,8,.86));box-shadow:0 0 0 4px rgba(255,245,235,.72)}
    .backup-card{display:grid;gap:.7rem;padding:1rem;border-radius:22px;background:linear-gradient(180deg,rgba(255,248,220,.72),rgba(255,255,255,.86));border:1px solid rgba(250,204,21,.34)}
    .backup-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem}
    .train-card-header{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start}
    .train-card-title{font-size:1.55rem;font-weight:900;line-height:1.05;color:#14213d;letter-spacing:-.04em}
    .train-card-sub{margin-top:.35rem;color:#64748b;font-size:.96rem}
    .price-chip{display:grid;gap:.35rem;justify-items:end;padding:.75rem .9rem;border-radius:22px;background:linear-gradient(180deg,rgba(248,250,252,.96),rgba(255,255,255,.86));border:1px solid rgba(226,232,240,.95);min-width:180px;box-shadow:inset 0 1px 0 rgba(255,255,255,.95)}
    .price-chip-label{font-size:.72rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#94a3b8}
    .price-chip-value{font-size:1.8rem;font-weight:900;line-height:1;color:#16233f;letter-spacing:-.04em}
    .price-chip-copy{font-size:.85rem;color:#64748b;font-weight:700}
    .journey-grid{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:1rem;align-items:center;margin-top:1rem}
    .journey-time{font-size:2.15rem;font-weight:900;color:#14213d;letter-spacing:-.05em}
    .journey-label{margin-top:.35rem;color:#64748b;font-size:.92rem;font-weight:700}
    .journey-middle{display:grid;gap:.55rem}
    .duration-pill{width:max-content;padding:.35rem .7rem;border-radius:999px;background:rgba(226,232,240,.82);color:#475569;font-size:.82rem;font-weight:800}
    .route-track{height:4px;border-radius:999px;background:linear-gradient(90deg,rgba(255,153,51,.9),rgba(19,136,8,.75));position:relative}
    .route-track::before,.route-track::after{content:"";position:absolute;top:50%;transform:translateY(-50%);width:12px;height:12px;border-radius:999px;background:#fff;border:3px solid rgba(24,37,60,.85)}
    .route-track::before{left:0}
    .route-track::after{right:0}
    .route-station-row{display:flex;justify-content:space-between;gap:.75rem;color:#64748b;font-size:.82rem;font-weight:700}
    .route-station-row span{flex:1}
    .route-station-row span:last-child{text-align:right}
    .info-row{display:flex;flex-wrap:wrap;gap:.55rem;margin-top:1rem}
    .info-pill{padding:.4rem .72rem;border-radius:999px;background:rgba(220,252,231,.92);border:1px solid rgba(187,247,208,.95);color:#15803d;font-size:.84rem;font-weight:700}
    .service-copy{display:grid;gap:.6rem;margin-top:1rem}
    .service-line{font-size:.98rem;color:#475569;line-height:1.55}
    .alt-list{display:grid;gap:.85rem}
    .alt-train-card{width:100%;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1rem;text-align:left;padding:1rem 1.05rem;border-radius:22px;border:1px solid rgba(226,232,240,.92);background:linear-gradient(180deg,rgba(255,255,255,.92),rgba(255,255,255,.78));box-shadow:inset 0 1px 0 rgba(255,255,255,.94),0 10px 20px rgba(148,163,184,.08);transition:transform .24s ease,box-shadow .24s ease,border-color .24s ease}
    .alt-train-card.active{border-color:rgba(59,130,246,.28);box-shadow:inset 0 1px 0 rgba(255,255,255,.94),0 14px 24px rgba(59,130,246,.08)}
    .alt-train-card:hover{transform:translateY(-2px);box-shadow:inset 0 1px 0 rgba(255,255,255,.94),0 16px 28px rgba(148,163,184,.12)}
    .alt-train-meta{display:grid;gap:.25rem}
    .alt-train-times{display:flex;align-items:center;gap:.75rem;color:#475569;font-size:.96rem;font-weight:700}
    .alt-train-arrow{color:#94a3b8}
    .alt-card{display:grid;grid-template-columns:minmax(0,1fr) auto auto auto;gap:.7rem;align-items:center;padding:.9rem 1rem;border-radius:22px;background:linear-gradient(180deg,rgba(255,248,220,.84),rgba(255,255,255,.84));border:1px solid rgba(250,204,21,.34)}
    .alt-badge{display:inline-flex;align-items:center;justify-content:center;padding:.38rem .7rem;border-radius:999px;background:rgba(34,197,94,.12);color:#15803d;font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
    .alt-meta{display:grid;gap:.2rem}
    .alt-title{font-size:1.03rem;font-weight:800;color:#14213d}
    .alt-sub{font-size:.9rem;color:#64748b}
    .chip-row,.coach-row,.tag-row{display:flex;flex-wrap:wrap;gap:.6rem}
    .route-chip{padding:.48rem .8rem;border-radius:999px;background:rgba(255,255,255,.72);border:1px solid rgba(226,232,240,.9);color:#475569;font-size:.9rem;font-weight:600}
    .tag-chip{padding:.42rem .74rem;border-radius:999px;background:rgba(220,252,231,.92);border:1px solid rgba(187,247,208,.95);color:#15803d;font-size:.88rem;font-weight:700}
    .best-card{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1rem;padding:1.1rem;align-items:start}
    .kicker{width:max-content;padding:.42rem .86rem;border-radius:999px;border:1px solid rgba(52,211,153,.36);background:rgba(220,252,231,.88);color:#047857;font-size:.84rem;font-weight:800;letter-spacing:.22em;text-transform:uppercase}
    .coach-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.75rem}
    .coach-chip{min-width:92px;padding:.85rem .95rem;border-radius:22px;border:1px solid rgba(226,232,240,.92);background:linear-gradient(180deg,rgba(255,255,255,.92),rgba(255,255,255,.80));box-shadow:inset 0 1px 0 rgba(255,255,255,.92),0 10px 20px rgba(148,163,184,.08);text-align:left;display:grid;gap:.35rem;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}
    .coach-chip.active{background:linear-gradient(180deg,rgba(236,253,245,.95),rgba(255,255,255,.82));border-color:rgba(52,211,153,.36)}
    .coach-chip:hover{transform:translateY(-2px);box-shadow:inset 0 1px 0 rgba(255,255,255,.92),0 14px 24px rgba(148,163,184,.12)}
    .coach-chip-top{display:flex;align-items:center;justify-content:space-between;gap:.55rem}
    .coach-chip-fare{font-size:.92rem;font-weight:800;color:#16233f}
    .coach-chip .status-pill{width:max-content}
    .fare-card{display:flex;flex-direction:column;gap:.55rem;align-items:flex-end;justify-content:center;padding:.7rem .9rem;text-align:right;background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(248,250,252,.74));border:1px solid rgba(226,232,240,.92);box-shadow:inset 0 1px 0 rgba(255,255,255,.94);border-radius:24px;min-width:210px}
    .fare-label{color:#94a3b8;text-transform:uppercase;letter-spacing:.22em;font-size:.74rem;font-weight:800}
    .fare-value{color:#16233f;font-size:clamp(1.65rem,2.6vw,2.35rem);line-height:1;letter-spacing:-.05em;font-weight:900}
    .availability-green{background:rgba(34,197,94,.14);color:#15803d}
    .availability-amber{background:rgba(250,204,21,.18);color:#b45309}
    .availability-red{background:rgba(239,68,68,.14);color:#dc2626}
    .status-pill{display:inline-flex;align-items:center;justify-content:center;padding:.42rem .8rem;border-radius:999px;font-weight:700;font-size:.92rem}
    .choice-card{width:100%;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.7rem;text-align:left;padding:1rem}
    .choice-card.active{border-color:rgba(19,136,8,.30)}
    .note-box{padding:.95rem 1rem;border-radius:22px;border:1px solid rgba(250,204,21,.34);background:linear-gradient(180deg,rgba(255,251,235,.92),rgba(255,247,214,.82));color:#b45309}
    .station-suggestions{max-height:320px;overflow:auto;scrollbar-width:none;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94))!important;border-color:rgba(226,232,240,.95)!important;z-index:80!important}
    .station-suggestions::-webkit-scrollbar{display:none}
    .station-option-title{display:block;font-size:1rem;font-weight:700;color:#16233f}
    .station-option-sub{display:block;font-size:.85rem;color:#64748b;margin-top:.12rem}
    .date-panel{width:340px;padding:1rem;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94))!important;border-color:rgba(226,232,240,.95)!important}
    .date-head,.date-foot{display:flex;align-items:center;justify-content:space-between}
    .date-nav{display:flex;gap:.45rem}
    .date-nav button{width:2.4rem;height:2.4rem;border-radius:999px;border:1px solid rgba(226,232,240,.95);background:rgba(255,255,255,.82);color:#16233f}
    .date-week,.date-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:.42rem}
    .date-week{margin:.8rem 0 .5rem;color:#64748b;font-size:.82rem;font-weight:700;text-align:center}
    .date-cell{background:rgba(255,255,255,.82);color:#16233f;border:1px solid transparent}
    .date-cell.active{background:linear-gradient(180deg,rgba(24,37,60,.96),rgba(44,63,104,.92));color:#fff}
    .date-cell.muted{opacity:.38}
    .live-grid{display:grid;gap:1rem}
    .live-form{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(170px,.55fr);gap:1rem;padding:1rem}
    .live-board{padding:1.2rem;color:#16233f;background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(248,250,252,.86));border:1px solid rgba(226,232,240,.9);box-shadow:inset 0 1px 0 rgba(255,255,255,.94)}
    .track-line{height:10px;border-radius:999px;background:rgba(203,213,225,.55);position:relative;overflow:hidden}
    .track-fill{position:absolute;inset:0 auto 0 0;width:var(--progress,0%);background:linear-gradient(90deg,rgba(255,255,255,.92),rgba(255,153,51,.94),rgba(19,136,8,.92))}
    .track-dot{position:absolute;top:50%;left:var(--progress,0%);transform:translate(-50%,-50%);width:28px;height:28px;border-radius:999px;background:#fff;border:4px solid rgba(255,153,51,.92)}
    .station-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(95px,1fr));gap:.8rem;margin-top:1rem}
    .station-stop{text-align:center;font-size:.92rem;font-weight:700;color:#334155}
    .station-stop .dot{width:12px;height:12px;border-radius:999px;margin:0 auto .5rem;background:rgba(148,163,184,.55)}
    .station-stop.active .dot{background:#34d399;box-shadow:0 0 18px rgba(52,211,153,.60)}
    .next-stop{padding:1rem 1.1rem;border-radius:28px;background:linear-gradient(180deg,rgba(241,245,249,.92),rgba(255,255,255,.86));border:1px solid rgba(226,232,240,.95)}
    .planner-item{display:grid;grid-template-columns:auto minmax(0,1fr);gap:1rem;padding:1rem;border-radius:24px;background:rgba(255,255,255,.78);border:1px solid rgba(226,232,240,.9)}
    .planner-icon{width:3rem;height:3rem;border-radius:18px;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(180deg,rgba(24,37,60,.92),rgba(58,92,151,.86));color:#fff;font-size:.82rem;font-weight:800}
    #train-search-results,#pnr-output,#ai-planner-output{background:transparent!important;border:0!important;box-shadow:none!important}
    .next-card{padding:.2rem 0 0;background:transparent;border:0;box-shadow:none;color:#475569}
    .choice-card .text-slate-800,.summary-card .text-slate-800,.planner-card .text-slate-800,.planner-item .text-slate-800,.planner-item .text-slate-900,.fare-card .text-slate-500,.text-slate-600,.text-slate-500,.text-slate-400{color:inherit!important}
    .date-trigger{display:flex!important;align-items:center!important;justify-content:center!important;padding:0!important}
    .date-trigger svg{display:block}
    .empty-state{padding:1.4rem 1.2rem;border-radius:24px;border:1px dashed rgba(203,213,225,.92);background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(255,255,255,.58));color:#475569}
    @media (max-width:1180px){.booking-topbar{grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);}.booking-field:last-of-type{grid-column:1 / span 2}.booking-submit{grid-column:3}}
    @media (max-width:1024px){.booking-layout,.best-card,.backup-grid,.stats-grid{grid-template-columns:1fr}.fare-card{align-items:flex-start;text-align:left;padding:0}.summary-grid,.alt-card,.live-form,.journey-grid,.booking-topbar{grid-template-columns:1fr}.price-chip{justify-items:start}.train-card-header{flex-direction:column;align-items:flex-start}.swap-trigger{display:none}.booking-field:last-of-type,.booking-submit{grid-column:auto}}
  `;
  document.head.appendChild(style);
}

function setupLandingAnimations() {
  const animated = Array.from(document.querySelectorAll(".animated-element"));
  if (!animated.length) return;

  animated.forEach((node) => node.classList.add("visible"));

  if (typeof IntersectionObserver !== "function") {
    return;
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    animated.forEach((node) => observer.observe(node));
  }

  document.querySelector(".notification-bubble")?.classList.add("active");
  document.querySelector(".ar-glow-effect")?.classList.add("active");
  document.querySelector(".airtag-finder")?.classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
  injectTheme();
  setupLandingAnimations();

  const fromInput = $("from-station");
  const toInput = $("to-station");
  const depDateInput = $("dep-date");
  const fromSuggestions = $("from-suggestions");
  const toSuggestions = $("to-suggestions");
  const dateToggle = $("date-picker-toggle");
  const datePanel = $("date-picker-panel");
  const trainResults = $("train-search-results");
  const liveStatusContent = $("live-status-content");
  const pnrStatusContent = $("pnr-status-content");
  const pnrOutput = $("pnr-output");
  const plannerOutput = $("ai-planner-output");
  const plannerInput = $("planner-input");
  const plannerExamples = $("planner-examples");
  const pnrInput = $("pnr-input");
  const bookingShell = trainResults?.closest(".bg-white");
  const bookingPanel = trainResults?.closest(".bg-gray-50");

  [fromInput, toInput, depDateInput, plannerInput, pnrInput].forEach((input) => {
    if (!input) return;
    input.setAttribute("spellcheck", "false");
    input.setAttribute("autocomplete", "off");
  });

  [fromInput, toInput, depDateInput].forEach((input) => input?.parentElement?.classList.add("glass-input"));
  bookingShell?.classList.add("glass-shell", "booking-surface");
  bookingPanel?.classList.add("glass-shell", "booking-surface");
  pnrOutput?.classList.add("glass-shell");
  plannerOutput?.classList.add("glass-shell");

  let trainBtn = replaceNode($("train-search-btn"));
  let swapBtn = replaceNode($("swap-stations-btn"));
  let liveTab = replaceNode($("status-tab-live"));
  let pnrTab = replaceNode($("status-tab-pnr"));
  let pnrBtn = replaceNode($("pnr-btn"));
  let planBtn = replaceNode($("planner-btn"));
  let tabItinerary = replaceNode($("tab-itinerary"));
  let tabStation = replaceNode($("tab-station"));
  [trainBtn, pnrBtn, planBtn].forEach((button) => button?.classList.add("glass-button"));
  swapBtn?.classList.add("swap-trigger");

  const state = {
    booking: null,
    selectedTrain: 0,
    selectedClass: "",
    bookingNote: "",
    liveData: null,
    liveNote: "",
    liveJourney: { from: fromInput.value, to: toInput.value },
    plannerMode: "itinerary",
    dateIso: parseDisplayDate(depDateInput.value),
    dateView: null
  };
  {
    const [year, month] = state.dateIso.split("-").map(Number);
    state.dateView = { year, monthIndex: month - 1 };
  }
  depDateInput.value = "";

  const selectedTrainData = () => state.booking?.data?.trains?.[state.selectedTrain] || null;
  const selectedClassData = () => {
    const train = selectedTrainData();
    const code = state.selectedClass || train?.classes?.[0] || "";
    const details = train?.classDetails?.[code] || {};
    return { code, fare: details.fare || train?.fare || "Check fare", availability: details.availability || train?.classAvailability?.[code] || train?.availability || "Check seats" };
  };

  const renderSuggestions = (panel, suggestions, onPick) => {
    if (!suggestions.length) {
      panel.classList.add("hidden");
      panel.innerHTML = "";
      return;
    }
    panel.innerHTML = `<div class="px-4 pt-3 pb-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Matching and nearby stations</div>${suggestions.map((station, index) => `<button type="button" class="station-option" data-index="${index}"><span class="station-option-title">${escapeHtml(station.stationName)} (${escapeHtml(station.stationCode)})</span><span class="station-option-sub">Tap to use this station</span></button>`).join("")}`;
    panel.classList.remove("hidden");
    panel.querySelectorAll("[data-index]").forEach((button) => button.addEventListener("click", () => onPick(suggestions[Number(button.dataset.index)])));
  };

  const wireAutocomplete = (input, panel, onPick) => {
    const load = debounce(async () => {
      try {
        const payload = await apiJson(`/api/station-suggestions?query=${encodeURIComponent(input.value.trim())}`);
        renderSuggestions(panel, payload.data || [], (station) => {
          input.value = station.label;
          panel.classList.add("hidden");
          onPick(station);
        });
      } catch {
        panel.classList.add("hidden");
      }
    });
    input.addEventListener("focus", load);
    input.addEventListener("input", load);
    input.addEventListener("blur", () => setTimeout(() => panel.classList.add("hidden"), 120));
  };

  const renderDatePicker = () => {
    const { year, monthIndex } = state.dateView;
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const prevDays = new Date(year, monthIndex, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i += 1) cells.push({ label: prevDays - firstDay + i + 1, iso: "", muted: true });
    for (let day = 1; day <= daysInMonth; day += 1) cells.push({ label: day, iso: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`, muted: false });
    while (cells.length < 42) cells.push({ label: cells.length - firstDay - daysInMonth + 1, iso: "", muted: true });
    datePanel.innerHTML = `<div class="date-head"><div class="font-bold text-slate-800 text-lg">${escapeHtml(monthTitle(year, monthIndex))}</div><div class="date-nav"><button type="button" data-nav="-1">&#8249;</button><button type="button" data-nav="1">&#8250;</button></div></div><div class="date-week"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div><div class="date-grid">${cells.map((cell) => `<button type="button" class="date-cell ${cell.muted ? "muted" : ""} ${cell.iso === state.dateIso ? "active" : ""}" ${cell.iso ? `data-iso="${cell.iso}"` : "disabled"}>${cell.label}</button>`).join("")}</div><div class="date-foot mt-4"><button type="button" data-jump="today" class="font-bold text-teal-700">Today</button><button type="button" data-jump="tomorrow" class="font-bold text-teal-700">Tomorrow</button></div>`;
    datePanel.querySelectorAll("[data-nav]").forEach((button) => button.addEventListener("click", () => {
      const next = new Date(year, monthIndex + Number(button.dataset.nav), 1);
      state.dateView = { year: next.getFullYear(), monthIndex: next.getMonth() };
      renderDatePicker();
    }));
    datePanel.querySelectorAll("[data-iso]").forEach((button) => button.addEventListener("click", () => {
      state.dateIso = button.dataset.iso;
      depDateInput.value = formatDisplayDate(state.dateIso);
      datePanel.classList.add("hidden");
      renderDatePicker();
    }));
    datePanel.querySelectorAll("[data-jump]").forEach((button) => button.addEventListener("click", () => {
      state.dateIso = button.dataset.jump === "tomorrow" ? addDays(todayIso(), 1) : todayIso();
      const [nextYear, nextMonth] = state.dateIso.split("-").map(Number);
      state.dateView = { year: nextYear, monthIndex: nextMonth - 1 };
      depDateInput.value = formatDisplayDate(state.dateIso);
      datePanel.classList.add("hidden");
      renderDatePicker();
    }));
  };

  const openDatePicker = () => {
    state.dateIso = depDateInput.value ? parseDisplayDate(depDateInput.value) : state.dateIso || todayIso();
    const [year, month] = state.dateIso.split("-").map(Number);
    state.dateView = { year, monthIndex: month - 1 };
    datePanel.classList.remove("hidden");
    renderDatePicker();
  };

  const renderBooking = () => {
    if (!state.booking?.data) {
      trainResults.innerHTML = `<div class="results-wrap"><div class="empty-state"><div class="text-lg font-bold text-slate-700">Choose your route to load trains.</div><div class="mt-2 text-base">You will get fare, coach-wise seat mood, food notes, and alternative trains after you select <strong>From</strong>, <strong>To</strong>, and <strong>Date</strong>.</div></div></div>`;
      return;
    }

    const data = state.booking.data;
    const train = selectedTrainData();
    if (!state.selectedClass) state.selectedClass = train?.classes?.[0] || "";
    const coach = selectedClassData();
    const sidebarStations = data.routeStations?.length ? data.routeStations : [data.journey.from, data.journey.to].filter(Boolean);
    const visibleAlternatives = (data.trains || []).filter((_, index) => index !== state.selectedTrain);

    trainResults.innerHTML = `<div class="results-wrap">
      <div class="booking-layout">
        <div class="booking-sidebar">
          <div class="sidebar-card">
            <div class="sidebar-block">
              <div class="sidebar-title">Route Snapshot</div>
              <div class="summary-grid">
                <div class="summary-tile">
                  <div class="summary-label">From</div>
                  <div class="summary-value">${escapeHtml(data.journey.from)}</div>
                </div>
                <div class="summary-tile">
                  <div class="summary-label">To</div>
                  <div class="summary-value">${escapeHtml(data.journey.to)}</div>
                </div>
                <div class="summary-tile">
                  <div class="summary-label">Date</div>
                  <div class="summary-value">${escapeHtml(prettyDate(data.journey.date))}</div>
                </div>
              </div>
              <div class="sidebar-insight">${escapeHtml(data.insight || "RailMate route shortlist is ready.")}</div>
            </div>
          </div>
          ${sidebarStations.length ? `<div class="sidebar-card">
            <div class="sidebar-block">
              <div class="sidebar-title">Stations On Route</div>
              <div class="sidebar-route">${sidebarStations.map((station) => `<div class="route-station-chip">${escapeHtml(shortStation(station))}</div>`).join("")}</div>
            </div>
          </div>` : ""}
          ${data.nextAlternative ? `<div class="sidebar-card">
            <div class="backup-card">
              <div class="alt-badge">Backup Pick</div>
              <div class="alt-title">${escapeHtml(data.nextAlternative.trainName)}</div>
              <div class="alt-sub">${escapeHtml(data.nextAlternative.trainNumber)} leaves on ${escapeHtml(data.nextAlternative.date)}</div>
              <div class="backup-grid">
                <div class="summary-tile">
                  <div class="summary-label">Departs</div>
                  <div class="summary-value">${escapeHtml(data.nextAlternative.departure)}</div>
                </div>
                <div class="summary-tile">
                  <div class="summary-label">Fare</div>
                  <div class="summary-value">${escapeHtml(data.nextAlternative.fare)}</div>
                </div>
                <div class="summary-tile">
                  <div class="summary-label">Use When</div>
                  <div class="summary-value">Later option</div>
                </div>
              </div>
            </div>
          </div>` : ""}
          ${state.bookingNote ? `<div class="note-box">${escapeHtml(state.bookingNote)}</div>` : ""}
        </div>
        <div class="booking-main">
          ${train ? `<div class="train-card">
            <div class="train-card-header">
              <div>
                <div class="kicker">Best Match</div>
                <div class="train-card-title mt-3">${escapeHtml(train.trainNumber)} ${escapeHtml(train.trainName)}</div>
                <div class="train-card-sub">${escapeHtml(data.journey.from)} to ${escapeHtml(data.journey.to)}</div>
              </div>
              <div class="price-chip">
                <div class="price-chip-label">Selected Fare</div>
                <div class="price-chip-value">${escapeHtml(coach.fare)}</div>
                <div class="status-pill ${tone(coach.availability)}">${escapeHtml(coach.availability)}</div>
                <div class="price-chip-copy">For ${escapeHtml(coach.code || train.classes?.[0] || "selected class")}</div>
              </div>
            </div>
            <div class="journey-grid">
              <div>
                <div class="journey-time">${escapeHtml(compactTime(train.departure))}</div>
                <div class="journey-label">${escapeHtml(shortStation(data.journey.from))}</div>
              </div>
              <div class="journey-middle">
                <div class="duration-pill">${escapeHtml(train.duration)}</div>
                <div class="route-track"></div>
                <div class="route-station-row">
                  <span>${escapeHtml(shortStation(data.journey.from))}</span>
                  <span>${escapeHtml(shortStation(data.journey.to))}</span>
                </div>
              </div>
              <div class="text-right">
                <div class="journey-time">${escapeHtml(compactTime(train.arrival))}</div>
                <div class="journey-label">${escapeHtml(shortStation(data.journey.to))}</div>
              </div>
            </div>
            <div class="info-row">
              ${(train.tags || []).map((tag) => `<span class="info-pill">${escapeHtml(tag)}</span>`).join("")}
              ${train.food ? `<span class="info-pill">${escapeHtml(train.food)}</span>` : ""}
              ${train.availability ? `<span class="status-pill ${tone(train.availability)}">${escapeHtml(train.availability)}</span>` : ""}
            </div>
            ${train.classes?.length ? `<div class="coach-row mt-4">${train.classes.map((classCode) => {
              const details = train.classDetails?.[classCode] || {};
              const fare = details.fare || train.fare || "Check fare";
              const label = details.availability || train.classAvailability?.[classCode] || train.availability || "Check seats";
              return `<button type="button" class="coach-chip ${classCode === coach.code ? "active" : ""}" data-class="${escapeHtml(classCode)}">
                <div class="coach-chip-top">
                  <span class="block text-sm font-bold tracking-[0.14em] text-slate-500 uppercase">${escapeHtml(classCode)}</span>
                  <span class="coach-chip-fare">${escapeHtml(fare)}</span>
                </div>
                <span class="status-pill ${tone(label)}">${escapeHtml(label)}</span>
              </button>`;
            }).join("")}</div>` : ""}
            ${train.foodNote ? `<div class="mt-4 text-[1rem] text-slate-600"><strong class="text-slate-800">Food:</strong> ${escapeHtml(train.foodNote)}</div>` : ""}
            ${train.ticketTip ? `<div class="mt-2 text-[1rem] text-slate-600"><strong class="text-slate-800">Ticket tip:</strong> ${escapeHtml(train.ticketTip)}</div>` : ""}
          </div>` : ""}
          ${visibleAlternatives.length ? `<div class="train-card">
            <div class="sidebar-title">Alternative Matches</div>
            <div class="alt-list mt-3">${visibleAlternatives.map((item) => {
              const index = data.trains.indexOf(item);
              return `<button type="button" class="alt-train-card" data-train="${index}">
                <div class="alt-train-meta">
                  <div class="alt-title">${escapeHtml(item.trainNumber)} ${escapeHtml(item.trainName)}</div>
                  <div class="alt-train-times">
                    <span>${escapeHtml(compactTime(item.departure))}</span>
                    <span class="alt-train-arrow">&rarr;</span>
                    <span>${escapeHtml(compactTime(item.arrival))}</span>
                    <span class="text-slate-400">•</span>
                    <span>${escapeHtml(item.duration)}</span>
                  </div>
                  <div class="alt-sub">${escapeHtml(item.food || "Food guidance available")}</div>
                  <div class="info-row">${(item.tags || []).map((tag) => `<span class="info-pill">${escapeHtml(tag)}</span>`).join("")}</div>
                </div>
                <div class="text-right grid gap-2 justify-items-end">
                  <div class="price-chip">
                    <div class="price-chip-label">Fare</div>
                    <div class="price-chip-value">${escapeHtml(item.fare || "Check fare")}</div>
                    <div class="status-pill ${tone(item.availability)}">${escapeHtml(item.availability || "Check seats")}</div>
                  </div>
                </div>
              </button>`;
            }).join("")}</div>
          </div>` : ""}
        </div>
      </div>
    </div>`;

    trainResults.querySelectorAll("[data-class]").forEach((button) => button.addEventListener("click", () => { state.selectedClass = button.dataset.class; renderBooking(); }));
    trainResults.querySelectorAll("[data-train]").forEach((button) => button.addEventListener("click", () => { state.selectedTrain = Number(button.dataset.train); state.selectedClass = selectedTrainData()?.classes?.[0] || ""; renderBooking(); }));
  };

  const renderBookingBoard = () => {
    if (!state.booking?.data) {
      trainResults.innerHTML = `<div class="results-wrap"><div class="empty-state"><div class="text-lg font-bold text-slate-700">Start with your route.</div><div class="mt-2 text-base">Pick <strong>From</strong>, <strong>To</strong>, and <strong>Date</strong> to open a cleaner ticket board with classes, fares, seat mood, food notes, and a fallback train.</div></div></div>`;
      return;
    }

    const data = state.booking.data;
    const trains = data.trains || [];
    const train = selectedTrainData();
    if (!state.selectedClass) state.selectedClass = train?.classes?.[0] || "";
    const coach = selectedClassData();
    const sidebarStations = data.routeStations?.length ? data.routeStations : [data.journey.from, data.journey.to].filter(Boolean);
    const visibleAlternatives = trains.map((item, index) => ({ item, index })).filter(({ index }) => index !== state.selectedTrain);
    const fastestTrain = [...trains].sort((a, b) => durationToMinutes(a.duration) - durationToMinutes(b.duration))[0] || train;
    const cheapestTrain = [...trains].sort((a, b) => moneyToNumber(a.fare) - moneyToNumber(b.fare))[0] || train;
    const allClasses = Array.from(new Set(trains.flatMap((item) => item.classes || [])));
    const stats = [
      { label: "Fastest", value: fastestTrain ? `${fastestTrain.trainNumber} • ${fastestTrain.duration}` : "Check times" },
      { label: "Lowest Fare", value: cheapestTrain?.fare || "Check fares" },
      { label: "Classes", value: allClasses.length ? allClasses.join(" / ") : "Will appear here" }
    ];

    trainResults.innerHTML = `<div class="results-wrap">
      <div class="sidebar-card insight-card">
        <div class="sidebar-title">Browse Tickets</div>
        <div class="train-card-title">${escapeHtml(shortStation(data.journey.from))} to ${escapeHtml(shortStation(data.journey.to))}</div>
        <div class="train-card-sub">Traveling on ${escapeHtml(prettyDate(data.journey.date))}. ${escapeHtml(data.insight || "RailMate shortlist is ready.")}</div>
        <div class="stats-grid">${stats.map((stat) => `<div class="stat-card"><div class="stat-label">${escapeHtml(stat.label)}</div><div class="stat-value">${escapeHtml(stat.value)}</div></div>`).join("")}</div>
      </div>
      <div class="booking-layout">
        <div class="booking-sidebar">
          <div class="sidebar-card">
            <div class="sidebar-block">
              <div class="sidebar-title">Route Snapshot</div>
              <div class="summary-grid">
                <div class="summary-tile">
                  <div class="summary-label">From</div>
                  <div class="summary-value">${escapeHtml(data.journey.from)}</div>
                </div>
                <div class="summary-tile">
                  <div class="summary-label">To</div>
                  <div class="summary-value">${escapeHtml(data.journey.to)}</div>
                </div>
                <div class="summary-tile">
                  <div class="summary-label">Date</div>
                  <div class="summary-value">${escapeHtml(prettyDate(data.journey.date))}</div>
                </div>
              </div>
              <div class="sidebar-insight">A quick decision board for route, fare, class mood, and backup planning.</div>
            </div>
          </div>
          ${sidebarStations.length ? `<div class="sidebar-card">
            <div class="sidebar-block">
              <div class="sidebar-title">Stations On Route</div>
              <div class="sidebar-route">${sidebarStations.map((station) => `<div class="route-station-chip">${escapeHtml(shortStation(station))}</div>`).join("")}</div>
            </div>
          </div>` : ""}
          ${data.nextAlternative ? `<div class="sidebar-card">
            <div class="backup-card">
              <div class="alt-badge">Backup Pick</div>
              <div class="alt-title">${escapeHtml(data.nextAlternative.trainName)}</div>
              <div class="alt-sub">${escapeHtml(data.nextAlternative.trainNumber)} leaves on ${escapeHtml(data.nextAlternative.date)}</div>
              <div class="backup-grid">
                <div class="summary-tile">
                  <div class="summary-label">Departs</div>
                  <div class="summary-value">${escapeHtml(data.nextAlternative.departure)}</div>
                </div>
                <div class="summary-tile">
                  <div class="summary-label">Fare</div>
                  <div class="summary-value">${escapeHtml(data.nextAlternative.fare)}</div>
                </div>
                <div class="summary-tile">
                  <div class="summary-label">Why Keep</div>
                  <div class="summary-value">Backup hold</div>
                </div>
              </div>
            </div>
          </div>` : ""}
          ${state.bookingNote ? `<div class="note-box">${escapeHtml(state.bookingNote)}</div>` : ""}
        </div>
        <div class="booking-main">
          ${train ? `<div class="train-card">
            <div class="train-card-header">
              <div>
                <div class="kicker">Best Match</div>
                <div class="train-card-title mt-3">${escapeHtml(train.trainNumber)} ${escapeHtml(train.trainName)}</div>
                <div class="train-card-sub">${escapeHtml(shortStation(data.journey.from))} to ${escapeHtml(shortStation(data.journey.to))}</div>
              </div>
              <div class="price-chip">
                <div class="price-chip-label">Selected Fare</div>
                <div class="price-chip-value">${escapeHtml(coach.fare)}</div>
                <div class="status-pill ${tone(coach.availability)}">${escapeHtml(coach.availability)}</div>
                <div class="price-chip-copy">For ${escapeHtml(coach.code || train.classes?.[0] || "selected class")}</div>
              </div>
            </div>
            <div class="journey-grid">
              <div>
                <div class="journey-time">${escapeHtml(compactTime(train.departure))}</div>
                <div class="journey-label">${escapeHtml(shortStation(data.journey.from))}</div>
              </div>
              <div class="journey-middle">
                <div class="duration-pill">${escapeHtml(train.duration)}</div>
                <div class="route-track"></div>
                <div class="route-station-row">
                  <span>${escapeHtml(shortStation(data.journey.from))}</span>
                  <span>${escapeHtml(shortStation(data.journey.to))}</span>
                </div>
              </div>
              <div class="text-right">
                <div class="journey-time">${escapeHtml(compactTime(train.arrival))}</div>
                <div class="journey-label">${escapeHtml(shortStation(data.journey.to))}</div>
              </div>
            </div>
            <div class="info-row">
              ${(train.tags || []).map((tag) => `<span class="info-pill">${escapeHtml(tag)}</span>`).join("")}
              ${train.food ? `<span class="info-pill">${escapeHtml(train.food)}</span>` : ""}
              ${train.availability ? `<span class="status-pill ${tone(train.availability)}">${escapeHtml(train.availability)}</span>` : ""}
            </div>
            ${train.classes?.length ? `<div class="coach-row mt-4">${train.classes.map((classCode) => {
              const details = train.classDetails?.[classCode] || {};
              const fare = details.fare || train.fare || "Check fare";
              const label = details.availability || train.classAvailability?.[classCode] || train.availability || "Check seats";
              return `<button type="button" class="coach-chip ${classCode === coach.code ? "active" : ""}" data-class="${escapeHtml(classCode)}">
                <div class="coach-chip-top">
                  <span class="block text-sm font-bold tracking-[0.14em] text-slate-500 uppercase">${escapeHtml(classCode)}</span>
                  <span class="coach-chip-fare">${escapeHtml(fare)}</span>
                </div>
                <span class="status-pill ${tone(label)}">${escapeHtml(label)}</span>
              </button>`;
            }).join("")}</div>` : ""}
            <div class="service-copy">
              ${train.foodNote ? `<div class="service-line"><strong class="text-slate-800">Food:</strong> ${escapeHtml(train.foodNote)}</div>` : ""}
              ${train.ticketTip ? `<div class="service-line"><strong class="text-slate-800">Ticket tip:</strong> ${escapeHtml(train.ticketTip)}</div>` : ""}
            </div>
          </div>` : ""}
          ${visibleAlternatives.length ? `<div class="train-card">
            <div class="sidebar-title">Alternative Matches</div>
            <div class="alt-list mt-3">${visibleAlternatives.map(({ item, index }) => `<button type="button" class="alt-train-card" data-train="${index}">
                <div class="alt-train-meta">
                  <div class="alt-title">${escapeHtml(item.trainNumber)} ${escapeHtml(item.trainName)}</div>
                  <div class="alt-train-times">
                    <span>${escapeHtml(compactTime(item.departure))}</span>
                    <span class="alt-train-arrow">&rarr;</span>
                    <span>${escapeHtml(compactTime(item.arrival))}</span>
                    <span class="text-slate-400">&bull;</span>
                    <span>${escapeHtml(item.duration)}</span>
                  </div>
                  <div class="alt-sub">${escapeHtml(item.food || "Food guidance available")}</div>
                  <div class="info-row">${(item.tags || []).map((tag) => `<span class="info-pill">${escapeHtml(tag)}</span>`).join("")}</div>
                </div>
                <div class="text-right grid gap-2 justify-items-end">
                  <div class="price-chip">
                    <div class="price-chip-label">Fare</div>
                    <div class="price-chip-value">${escapeHtml(item.fare || "Check fare")}</div>
                    <div class="status-pill ${tone(item.availability)}">${escapeHtml(item.availability || "Check seats")}</div>
                  </div>
                </div>
              </button>`).join("")}</div>
          </div>` : ""}
        </div>
      </div>
    </div>`;

    trainResults.querySelectorAll("[data-class]").forEach((button) => button.addEventListener("click", () => {
      state.selectedClass = button.dataset.class;
      renderBookingBoard();
    }));
    trainResults.querySelectorAll("[data-train]").forEach((button) => button.addEventListener("click", () => {
      state.selectedTrain = Number(button.dataset.train);
      state.selectedClass = selectedTrainData()?.classes?.[0] || "";
      renderBookingBoard();
    }));
  };

  const renderLive = () => {
    const data = state.liveData || null;
    const journey = { from: state.liveJourney.from || "", to: state.liveJourney.to || "" };
    const tracking = data?.tracking || null;
    if (!tracking) {
      liveStatusContent.innerHTML = `<div class="glass-shell live-grid">
        <div class="live-form">
          <div class="glass-input"><label for="live-from" class="absolute -top-2 left-4 bg-white/85 px-2 rounded-full text-xs text-slate-500">Track From</label><input id="live-from" type="text" autocomplete="off" value="${escapeHtml(journey.from)}"><div id="live-from-suggestions" class="station-suggestions hidden"></div></div>
          <div class="glass-input"><label for="live-to" class="absolute -top-2 left-4 bg-white/85 px-2 rounded-full text-xs text-slate-500">Track To</label><input id="live-to" type="text" autocomplete="off" value="${escapeHtml(journey.to)}"><div id="live-to-suggestions" class="station-suggestions hidden"></div></div>
          <button id="live-track-btn" class="bg-gray-900 text-white font-semibold p-3 rounded-lg">Track Train</button>
        </div>
        <div class="planner-card">
          <div class="text-2xl font-bold text-slate-800">Select a route to load real live train status.</div>
          <div class="text-base text-slate-500 mt-2">No placeholder stops are being shown here anymore. This panel will only render actual live-train data.</div>
          ${state.liveNote ? `<div class="note-box mt-4">${escapeHtml(state.liveNote)}</div>` : ""}
        </div>
      </div>`;
      const liveBtn = replaceNode($("live-track-btn"));
      liveBtn.classList.add("glass-button");
      const liveFrom = $("live-from");
      const liveTo = $("live-to");
      [liveFrom, liveTo].forEach((input) => {
        if (!input) return;
        input.setAttribute("spellcheck", "false");
        input.setAttribute("autocomplete", "off");
      });
      liveBtn.addEventListener("click", async () => {
        state.liveJourney = { from: liveFrom.value.trim(), to: liveTo.value.trim() };
        state.liveNote = "Real-time live status needs a RapidAPI key subscribed to the liveTrainStatus endpoint. The current key is not authorized for that endpoint.";
        renderLive();
      });
      wireAutocomplete(liveFrom, $("live-from-suggestions"), (station) => { state.liveJourney.from = station.label; });
      wireAutocomplete(liveTo, $("live-to-suggestions"), (station) => { state.liveJourney.to = station.label; });
      return;
    }

    const stops = tracking.stations?.length ? tracking.stations : data.routeStations || [journey.from, journey.to].filter(Boolean);
    const progress = Number(tracking?.progress || 42);
    const activeIndex = stops.length > 1 ? Math.min(stops.length - 1, Math.max(0, Math.round((progress / 100) * (stops.length - 1)))) : 0;
    liveStatusContent.innerHTML = `<div class="glass-shell live-grid">
      <div class="live-form">
        <div class="glass-input"><label for="live-from" class="absolute -top-2 left-4 bg-white/85 px-2 rounded-full text-xs text-slate-500">Track From</label><input id="live-from" type="text" autocomplete="off" value="${escapeHtml(state.liveJourney.from || journey.from || "")}"><div id="live-from-suggestions" class="station-suggestions hidden"></div></div>
        <div class="glass-input"><label for="live-to" class="absolute -top-2 left-4 bg-white/85 px-2 rounded-full text-xs text-slate-500">Track To</label><input id="live-to" type="text" autocomplete="off" value="${escapeHtml(state.liveJourney.to || journey.to || "")}"><div id="live-to-suggestions" class="station-suggestions hidden"></div></div>
        <button id="live-track-btn" class="bg-gray-900 text-white font-semibold p-3 rounded-lg">Track Train</button>
      </div>
      <div class="live-board">
        <div class="flex justify-between gap-4 flex-wrap">
          <div><div class="text-3xl font-extrabold tracking-tight">${escapeHtml(`${tracking.trainName} / ${tracking.trainNumber}`)}</div><div class="text-slate-300 mt-1">${escapeHtml(journey.from)} to ${escapeHtml(journey.to)}</div></div>
          <div class="text-right"><div class="text-2xl font-bold text-green-300">${escapeHtml(tracking.status || "Expected on time")}</div><div class="text-sm text-slate-300 mt-1">${escapeHtml(tracking.lastUpdated || "Updated just now")}</div></div>
        </div>
        <div class="mt-4"><div class="track-line"><div class="track-fill" style="--progress:${progress}%"></div><div class="track-dot" style="--progress:${progress}%"></div></div><div class="station-row">${stops.map((stop, index) => `<div class="station-stop ${index === activeIndex ? "active" : ""}"><div class="dot"></div><div>${escapeHtml(stop)}</div></div>`).join("")}</div></div>
        <div class="next-stop"><div class="text-sm font-bold uppercase tracking-[0.24em] text-slate-300">Next Stop</div><div class="mt-2 text-4xl font-extrabold tracking-tight">${escapeHtml(tracking.nextStop || stops[Math.min(activeIndex + 1, stops.length - 1)] || journey.to)}</div><div class="mt-2 text-xl text-slate-200">Arriving in ${escapeHtml(tracking.arrivalIn || "Check timing")}</div></div>
        ${state.liveNote && !state.liveNote.includes("Showing RailMate booking knowledge") ? `<div class="note-box">${escapeHtml(state.liveNote)}</div>` : ""}
      </div>
    </div>`;
    const liveBtn = replaceNode($("live-track-btn"));
    liveBtn.classList.add("glass-button");
    liveBtn.addEventListener("click", async () => {
      try {
        const from = $("live-from").value.trim();
        const to = $("live-to").value.trim();
        const payload = await apiJson(`/api/search-trains?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(state.dateIso)}`);
        state.liveData = payload.data;
        state.liveNote = "";
        state.liveJourney = { from: payload.data?.journey?.from || from, to: payload.data?.journey?.to || to };
      } catch (error) {
        state.liveNote = error.message;
      }
      renderLive();
    });
    const liveFrom = $("live-from");
    const liveTo = $("live-to");
    [liveFrom, liveTo].forEach((input) => {
      if (!input) return;
      input.setAttribute("spellcheck", "false");
      input.setAttribute("autocomplete", "off");
    });
    wireAutocomplete(liveFrom, $("live-from-suggestions"), (station) => { state.liveJourney.from = station.label; });
    wireAutocomplete(liveTo, $("live-to-suggestions"), (station) => { state.liveJourney.to = station.label; });
  };

  const renderPnr = (payload) => {
    if (!payload?.data) {
      pnrOutput.innerHTML = `<div class="panel-wrap"><div class="planner-card text-center text-slate-500">Your PNR status will appear here with passenger details.</div></div>`;
      return;
    }
    const data = payload.data;
    pnrOutput.innerHTML = `<div class="panel-wrap"><div class="planner-card"><div class="text-sm uppercase tracking-[0.24em] text-slate-400 font-bold">PNR Snapshot</div><div class="text-3xl font-extrabold tracking-tight text-slate-800 mt-2">${escapeHtml(data.trainName)} / ${escapeHtml(data.trainNumber)}</div><div class="text-lg text-slate-500 mt-1">PNR ${escapeHtml(data.pnr)} / ${escapeHtml(data.chartStatus)}</div></div>${(data.passengers || []).map((passenger) => `<div class="planner-item"><div class="planner-icon">P${escapeHtml(passenger.passenger)}</div><div><div class="text-xl font-bold text-slate-800">Passenger ${escapeHtml(passenger.passenger)}</div><div class="text-base text-slate-600 mt-1">Booked: ${escapeHtml(passenger.bookingStatus)}</div><div class="text-base text-slate-600 mt-1">Current: ${escapeHtml(passenger.currentStatus)}</div></div></div>`).join("")}${payload.note ? `<div class="note-box">${escapeHtml(payload.note)}</div>` : ""}</div>`;
  };

  const renderPlanner = (payload, query) => {
    if (!payload) {
      plannerOutput.innerHTML = `<div class="panel-wrap"><div class="planner-card text-center text-slate-500">Your personalized travel plan will appear here.</div></div>`;
      return;
    }
    if (state.plannerMode === "station") {
      plannerOutput.innerHTML = `<div class="panel-wrap"><div class="planner-card"><div class="text-sm uppercase tracking-[0.24em] text-slate-400 font-bold">Nearest Station</div><div class="text-lg text-slate-600 mt-2">Nearest railhead for <strong>${escapeHtml(query)}</strong></div><div class="text-4xl font-extrabold tracking-tight text-slate-800 mt-3">${escapeHtml(payload.data.stationName)} (${escapeHtml(payload.data.stationCode)})</div></div>${payload.note ? `<div class="note-box">${escapeHtml(payload.note)}</div>` : ""}</div>`;
      return;
    }
    const sections = payload.data?.sections || [];
    plannerOutput.innerHTML = `<div class="panel-wrap"><div class="planner-card"><div class="text-sm uppercase tracking-[0.24em] text-slate-400 font-bold">AI Trip Plan</div><div class="text-3xl font-extrabold tracking-tight text-slate-800 mt-2">${escapeHtml(payload.data?.title || "Travel Plan")}</div><div class="text-lg text-slate-600 mt-2">${escapeHtml(payload.data?.summary || "A practical rail-first itinerary.")}</div></div>${sections.map((section) => `<div class="planner-item"><div class="planner-icon">${escapeHtml((section.icon || "plan").slice(0, 4).toUpperCase())}</div><div><div class="text-2xl font-bold tracking-tight text-slate-900">${escapeHtml(section.title || "Plan")}</div>${(section.details || []).map((detail) => `<div class="text-base text-slate-600 mt-2">${escapeHtml(detail)}</div>`).join("")}${(section.tags || []).length ? `<div class="tag-row mt-3">${section.tags.map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`).join("")}</div>` : ""}</div></div>`).join("")}${payload.note ? `<div class="note-box">${escapeHtml(payload.note)}</div>` : ""}</div>`;
  };

  const setPlannerMode = (mode) => {
    state.plannerMode = mode;
    tabItinerary.classList.toggle("active", mode === "itinerary");
    tabStation.classList.toggle("active", mode === "station");
    plannerInput.placeholder = mode === "itinerary" ? "e.g., Chandigarh to Goa" : "e.g., Taj Mahal or Charminar";
    if (plannerExamples) {
      plannerExamples.innerHTML = mode === "itinerary" ? 'Try: <button class="hover:text-orange-500">Delhi to Kolkata</button> / <button class="hover:text-orange-500">Mumbai to Kerala</button>' : 'Try: <button class="hover:text-orange-500">Taj Mahal</button> / <button class="hover:text-orange-500">India Gate</button>';
      plannerExamples.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => { plannerInput.value = button.textContent.trim(); plannerInput.focus(); }));
    }
  };

  const setStatusMode = (mode) => {
    const live = mode === "live";
    liveTab.classList.toggle("active", live);
    liveTab.classList.toggle("bg-white", live);
    liveTab.classList.toggle("shadow", live);
    pnrTab.classList.toggle("active", !live);
    pnrTab.classList.toggle("bg-white", !live);
    pnrTab.classList.toggle("shadow", !live);
    liveStatusContent.classList.toggle("hidden", !live);
    pnrStatusContent.classList.toggle("hidden", live);
  };

  wireAutocomplete(fromInput, fromSuggestions, () => {});
  wireAutocomplete(toInput, toSuggestions, () => {});

  dateToggle?.addEventListener("click", (event) => { event.stopPropagation(); openDatePicker(); });
  depDateInput?.addEventListener("click", (event) => { event.stopPropagation(); openDatePicker(); });
  document.addEventListener("click", (event) => {
    if (datePanel && !datePanel.contains(event.target) && event.target !== dateToggle && event.target !== depDateInput) datePanel.classList.add("hidden");
  });

  trainBtn.addEventListener("click", async () => {
    if (!fromInput.value.trim() || !toInput.value.trim() || !depDateInput.value.trim()) {
      trainResults.innerHTML = `<div class="results-wrap"><div class="summary-card"><div class="text-lg font-semibold text-slate-600">Select from, to, and date first to load train data.</div></div></div>`;
      return;
    }
    try {
      trainBtn.disabled = true;
      trainBtn.textContent = "Searching...";
      const payload = await apiJson(`/api/search-trains?from=${encodeURIComponent(fromInput.value.trim())}&to=${encodeURIComponent(toInput.value.trim())}&date=${encodeURIComponent(state.dateIso)}`);
      state.booking = payload;
      state.bookingNote = payload.note || "";
      state.selectedTrain = 0;
      state.selectedClass = payload.data?.trains?.[0]?.classes?.[0] || "";
      state.liveJourney = { from: payload.data?.journey?.from || fromInput.value.trim(), to: payload.data?.journey?.to || toInput.value.trim() };
      state.liveData = null;
      state.liveNote = "";
      renderBookingBoard();
      renderLive();
    } catch (error) {
      trainResults.innerHTML = `<div class="results-wrap"><div class="note-box">${escapeHtml(error.message)}</div></div>`;
    } finally {
      trainBtn.disabled = false;
      trainBtn.textContent = "Search Trains";
    }
  });

  liveTab.addEventListener("click", () => setStatusMode("live"));
  pnrTab.addEventListener("click", () => setStatusMode("pnr"));

  pnrBtn.addEventListener("click", async () => {
    try {
      pnrBtn.disabled = true;
      pnrBtn.textContent = "Checking...";
      renderPnr(await apiJson(`/api/pnr-status?pnr=${encodeURIComponent(($("pnr-input")?.value || "").trim())}`));
    } catch (error) {
      renderPnr();
      pnrOutput.innerHTML = `<div class="panel-wrap"><div class="note-box">${escapeHtml(error.message)}</div></div>`;
    } finally {
      pnrBtn.disabled = false;
      pnrBtn.textContent = "Check";
    }
  });

  planBtn.addEventListener("click", async () => {
    try {
      planBtn.disabled = true;
      planBtn.textContent = state.plannerMode === "itinerary" ? "Generating..." : "Finding...";
      const query = plannerInput.value.trim();
      const payload = state.plannerMode === "station"
        ? await apiJson(`/api/find-station?query=${encodeURIComponent(query)}`)
        : await apiJson("/api/plan-trip", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
      renderPlanner(payload, query);
    } catch (error) {
      plannerOutput.innerHTML = `<div class="panel-wrap"><div class="note-box">${escapeHtml(error.message)}</div></div>`;
    } finally {
      planBtn.disabled = false;
      planBtn.textContent = state.plannerMode === "itinerary" ? "Generate" : "Find";
    }
  });

  tabItinerary.addEventListener("click", () => setPlannerMode("itinerary"));
  tabStation.addEventListener("click", () => setPlannerMode("station"));
  pnrInput?.addEventListener("keydown", (event) => event.key === "Enter" && pnrBtn.click());
  plannerInput?.addEventListener("keydown", (event) => event.key === "Enter" && planBtn.click());
  [fromInput, toInput].forEach((input) => input?.addEventListener("keydown", (event) => event.key === "Enter" && trainBtn.click()));
  swapBtn?.addEventListener("click", () => {
    const fromValue = fromInput.value;
    fromInput.value = toInput.value;
    toInput.value = fromValue;
    fromSuggestions?.classList.add("hidden");
    toSuggestions?.classList.add("hidden");
  });

  setPlannerMode("itinerary");
  setStatusMode("live");
  renderBookingBoard();
  renderDatePicker();
  renderPnr();
  renderPlanner();
  renderLive();
});
