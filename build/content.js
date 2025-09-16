console.log("[vizor] content script loaded on",location.href);const S=`
.vizor-floating {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 2147483647;
  width: 48px;
  height: 48px;
  cursor: pointer;
  border-radius: 50%;
  display: block;
  /* motion & visuals */
  transition: transform .18s ease, filter .18s ease, box-shadow .18s ease, opacity .18s ease;
  /* Layered, stronger shadow that respects PNG transparency */
  filter:
    drop-shadow(0 10px 20px rgba(0,0,0,.28))
    drop-shadow(0 2px 6px rgba(0,0,0,.20)); /* a tighter inner edge */
  /* keeps focus ring smooth */
  box-shadow: 0 0 0 0 rgba(0,0,0,0);
  outline: none;
}

.vizor-floating:hover {
  transform: translateY(-1px) scale(1.06);
  filter:
    drop-shadow(0 14px 28px rgba(0,0,0,.34))
    drop-shadow(0 4px 10px rgba(0,0,0,.22));
}

.vizor-floating:active {
  transform: translateY(0) scale(0.98);
}

.vizor-floating:focus-visible {
  /* high-contrast focus ring for keyboard users */
  box-shadow:
    0 0 0 3px rgba(255,255,255,.95),
    0 0 0 6px rgba(26,115,232,.75);
}

/* Popup + card etc. */
.vizor-popup { 
  position: fixed; 
  right: 18px; 
  bottom: 70px; 
  z-index: 2147483647;
}
.vizor-card {
  width: 420px; max-height: 72vh; overflow:auto;
  background:#fff; color:#111; border-radius:14px; padding:16px 16px 10px;
  box-shadow:0 16px 44px rgba(0,0,0,.22);
  font: 14px/1.5 system-ui, -apple-system, Segoe UI, Roboto, Arial;
}

/* Wallet insights styles */
.vizor-insights {
  font-size: 13px;
  line-height: 1.4;
}

.vizor-insights-header {
  font-size: 11px;
  color: #666;
  margin-bottom: 12px;
  text-align: center;
  font-weight: 500;
}

.vizor-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.vizor-metric:last-child {
  border-bottom: none;
}

.vizor-metric-label {
  color: #555;
  font-weight: 500;
}

.vizor-metric-value {
  color: #111;
  font-weight: 600;
  text-align: right;
}

.vizor-fee-amount {
  color: #e74c3c;
  font-weight: 700;
}

.vizor-percentage {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 8px;
}

.vizor-transaction-types {
  display: flex;
  gap: 8px;
  margin: 8px 0;
}

.vizor-type-badge {
  flex: 1;
  text-align: center;
  padding: 6px 4px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
}

.vizor-type-swap {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
}

.vizor-type-transfer {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;
}

.vizor-type-other {
  background: linear-gradient(135deg, #a8e6cf, #7fcdcd);
  color: #2c3e50;
}

.vizor-top-program {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 8px 12px;
  border-radius: 10px;
  margin: 8px 0;
  text-align: center;
  font-weight: 600;
  position: relative;
}

.vizor-program-percentage {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ff6b6b;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  border: 2px solid white;
}

.vizor-unique-addresses {
  background: linear-gradient(135deg, #ffeaa7, #fab1a0);
  color: #2d3436;
  padding: 8px 12px;
  border-radius: 10px;
  text-align: center;
  font-weight: 600;
  margin: 8px 0;
}

.vizor-active-hours {
  background: linear-gradient(135deg, #74b9ff, #0984e3);
  color: white;
  padding: 8px 12px;
  border-radius: 10px;
  text-align: center;
  font-weight: 600;
  margin: 8px 0;
  position: relative;
}

.vizor-timezone-note {
  font-size: 10px;
  color: rgba(255,255,255,0.8);
  font-weight: 400;
  margin-top: 2px;
}
.vizor-card h3 { margin: 0 0 8px; font-size: 16px; }
.vizor-close { position: absolute; right: 16px; margin-top: -4px; cursor: pointer; font-size: 18px; }
.vizor-body { 
  white-space: pre-wrap; 
  padding-right: 24px; /* Add right padding to prevent text overlap with close button */
}
.vizor-loading { display:flex; align-items:center; gap:10px; }
.vizor-spinner {
  width:16px; height:16px; border-radius:50%;
  border:2px solid #ddd; border-top-color:#111; animation: vizor-spin 0.8s linear infinite;
}
@keyframes vizor-spin { to { transform: rotate(360deg); } }
`;function T(){if(document.getElementById("vizor-style"))return;const e=document.createElement("style");e.id="vizor-style",e.textContent=S,document.documentElement.appendChild(e)}const x=(e=location.href)=>/:\/\/(?:www\.)?solscan\.io\/tx\//i.test(e),h=(e=location.href)=>/:\/\/(?:www\.)?solscan\.io\/account\//i.test(e),P=(e=location.href)=>x(e)||h(e);function L(e=location.href){try{const o=new URL(e).pathname.split("/").filter(Boolean),l=o.indexOf("tx");return l>=0&&o[l+1]?o[l+1]:null}catch{return null}}function A(e=location.href){try{const o=new URL(e).pathname.split("/").filter(Boolean),l=o.indexOf("account");return l>=0&&o[l+1]?o[l+1]:null}catch{return null}}let i=null,n=null,c=null,r=null,v="",d=null,p=null,a=null;function m(){if(i)return;n=document.createElement("div"),n.className="vizor-overlay",n.style.cssText=`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.1);
    z-index: 2147483646;
    opacity: 0;
    pointer-events: none;
  `,document.documentElement.appendChild(n),i=document.createElement("div"),i.className="vizor-popup",i.style.cssText=`
    position: fixed;
    right: 18px;
    bottom: 70px;
    z-index: 2147483647;
    opacity: 0;
    pointer-events: none;
  `,i.innerHTML=`
    <div class="vizor-card">
      <div class="vizor-close" title="Close">×</div>
      <div class="vizor-body">Ready.</div>
    </div>
  `,document.documentElement.appendChild(i),c=i.querySelector(".vizor-body");const e=i.querySelector(".vizor-close");e.onclick=()=>u(),n.onclick=()=>u(),document.addEventListener("keydown",t=>{t.key==="Escape"&&i&&i.style.opacity!=="0"&&u()})}function C(){m(),n.style.opacity="1",n.style.pointerEvents="auto",i.style.opacity="1",i.style.pointerEvents="auto"}function u(){n&&(n.style.opacity="0",n.style.pointerEvents="none"),i&&(i.style.opacity="0",i.style.pointerEvents="none")}function z(e="Explaining transaction…"){c&&(c.innerHTML=`
    <div class="vizor-loading">
      <div class="vizor-spinner"></div>
      <div>${e}</div>
    </div>
  `)}function s(e){c&&(c.textContent=e)}function f(e){if(!c&&(console.error("bodyEl is null, ensuring popup is created"),m(),c=i?.querySelector(".vizor-body"),!c)){console.error("Still no bodyEl after ensuring popup");return}if(console.log("Rendering wallet insights with data:",e,e.insights),!e||!e.insights){console.error("Invalid data structure:",e),s("Invalid data received from server.");return}const t=e.insights,o=t.totalTx,l=t.fee.totalSol,y=Math.round(t.successRate*100),w=t.topPrograms[0],E=Math.round(t.topProgramShare*100),k=o>=100?`over ${Math.floor(o/100)*100} transactions`:`${o} transactions`;c.innerHTML=`
    <div class="vizor-insights">
      <div class="vizor-insights-header">${k}</div>
      
      <div class="vizor-metric">
        <span class="vizor-metric-label">Total Fees Spent</span>
        <span class="vizor-metric-value vizor-fee-amount">${l.toFixed(6)} SOL</span>
      </div>
      
      <div class="vizor-metric">
        <span class="vizor-metric-label">Success Rate</span>
        <span class="vizor-metric-value">${y}%</span>
      </div>
      
      <div class="vizor-transaction-types">
        <div class="vizor-type-badge vizor-type-swap">
          Swaps<br><small>${t.types.swap.pct}%</small>
        </div>
        <div class="vizor-type-badge vizor-type-transfer">
          Transfers<br><small>${t.types.transfer.pct}%</small>
        </div>
        <div class="vizor-type-badge vizor-type-other">
          Other<br><small>${t.types.other.pct}%</small>
        </div>
      </div>
      
      <div class="vizor-top-program">
        <div class="vizor-program-percentage">${E}%</div>
        ${w.program}
      </div>
      
      <div class="vizor-unique-addresses">
        ${t.uniqueCounterparties} unique addresses
      </div>
      
      <div class="vizor-active-hours">
        Most active: ${t.activeHours.label}
        <div class="vizor-timezone-note">in your local timezone</div>
      </div>
    </div>
  `}function N(){if(r)return;T(),r=document.createElement("img"),r.id="vizor-btn",r.className="vizor-floating",r.src=chrome.runtime.getURL("icons/vizor-logo.png"),r.alt="Explain TX",r.tabIndex=0,document.documentElement.appendChild(r);const e=()=>{if(C(),x()){const t=L();if(!t){s("No signature detected on this page.");return}R(t)}else if(h()){const t=A();if(!t){s("No address detected on this page.");return}I(t)}else s("Unsupported page type.")};r.onclick=e}function $(){r&&(r.remove(),r=null),n&&(n.remove(),n=null),i&&(i.remove(),i=null)}function g(){d=null,p=null,a=null}function b(e){if(e===v)return;v=e,P(e)?N():($(),g(),i&&!i.classList.contains("vizor-hidden")&&u())}function R(e){if(d===e&&a){s(a);return}d!==e&&(g(),d=e),z();const t=Intl.DateTimeFormat().resolvedOptions().timeZone;chrome.runtime.sendMessage({type:"EXPLAIN_TX",signature:e,tz:t},o=>{if(!o?.ok){a=null,s(o?.error||"Failed to explain.");return}a=o.text,s(o.text)})}function I(e){if(p===e&&a){try{const o=JSON.parse(a);f(o)}catch{s(a)}return}p!==e&&(g(),p=e),z("Analyzing account…");const t=Intl.DateTimeFormat().resolvedOptions().timeZone;chrome.runtime.sendMessage({type:"EXPLAIN_ACCOUNT",address:e,tz:t},o=>{if(console.log("Account insights response:",o.data),!o?.ok){a=null,s(o?.error||"Failed to analyze account.");return}if(!o.data){s("No data received from server.");return}a=JSON.stringify(o.data),f(o.data)})}b(location.href);chrome.runtime.onMessage.addListener(e=>{e?.type==="URL_CHANGED"&&b(e.url||location.href)});
