console.log("[vizor] content script loaded on",location.href);const k=`
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
  text-align: left;
  font-weight: 500;
}

.vizor-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.vizor-active-hours {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 8px 0;
}

.vizor-metric:last-child {
  border-bottom: none;
}

.vizor-metric-label {
  color: #333;
  font-weight: 600;
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
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.vizor-transaction-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.vizor-progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  margin-bottom: 4px;
  margin-top: 2px;
}

.vizor-type-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #666;
  margin-top: 4px;
}

.vizor-percentage-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #333;
  font-weight: 600;
  margin-top: 4px;
}

.vizor-top-programs {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.vizor-program-badge {
  display: inline-block;
  background: #5062EE;
  color: white;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  margin: 0px 4px 0px 0;
}

.vizor-timezone-note {
  font-size: 10px;
  color: #666;
  font-weight: 400;
}

.vizor-collapsible {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.vizor-collapsible:hover {
  background-color: #f8f9fa;
}

.vizor-counterparties-list {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  border-radius: 6px;
}

.vizor-counterparties-list.expanded {
  max-height: 200px;
}

.vizor-counterparty-item {
  padding: 2px;
  font-size: 11px;
}

.vizor-counterparty-item:last-child {
  border-bottom: none;
}

.vizor-counterparty-address {
  color: #5062EE;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
}

.vizor-counterparty-address:hover {
  text-decoration: underline;
}

.vizor-counterparty-stats {
  color: #666;
  font-size: 10px;
}
.vizor-card h3 { margin: 0 0 8px; font-size: 16px; }
.vizor-close { position: absolute; right: 16px; margin-top: -4px; cursor: pointer; font-size: 18px; }
.vizor-body { 
  white-space: normal; 
  padding-right: 24px; /* Add right padding to prevent text overlap with close button */
}
.vizor-body.is-pre {
  white-space: pre-wrap;
}
.vizor-loading { display:flex; align-items:center; gap:10px; }
.vizor-spinner {
  width:16px; height:16px; border-radius:50%;
  border:2px solid #ddd; border-top-color:#111; animation: vizor-spin 0.8s linear infinite;
}
@keyframes vizor-spin { to { transform: rotate(360deg); } }
`;function L(){if(document.getElementById("vizor-style"))return;const e=document.createElement("style");e.id="vizor-style",e.textContent=k,document.documentElement.appendChild(e)}const z=(e=location.href)=>/:\/\/(?:www\.)?solscan\.io\/tx\//i.test(e),y=(e=location.href)=>/:\/\/(?:www\.)?solscan\.io\/account\//i.test(e),S=(e=location.href)=>z(e)||y(e);function T(e=location.href){try{const o=new URL(e).pathname.split("/").filter(Boolean),p=o.indexOf("tx");return p>=0&&o[p+1]?o[p+1]:null}catch{return null}}function A(e=location.href){try{const o=new URL(e).pathname.split("/").filter(Boolean),p=o.indexOf("account");return p>=0&&o[p+1]?o[p+1]:null}catch{return null}}let i=null,n=null,r=null,s=null,h="",d=null,v=null,a=null;function b(){if(i)return;n=document.createElement("div"),n.className="vizor-overlay",n.style.cssText=`
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
  `,document.documentElement.appendChild(i),r=i.querySelector(".vizor-body");const e=i.querySelector(".vizor-close");e.onclick=()=>u(),n.onclick=()=>u(),document.addEventListener("keydown",t=>{t.key==="Escape"&&i&&i.style.opacity!=="0"&&u()})}function P(){b(),n.style.opacity="1",n.style.pointerEvents="auto",i.style.opacity="1",i.style.pointerEvents="auto"}function u(){n&&(n.style.opacity="0",n.style.pointerEvents="none"),i&&(i.style.opacity="0",i.style.pointerEvents="none")}function w(e="Explaining transaction…"){r&&(r.classList.add("is-pre"),r.innerHTML=`
    <div class="vizor-loading">
      <div class="vizor-spinner"></div>
      <div>${e}</div>
    </div>
  `)}function l(e){r&&(r.classList.add("is-pre"),r.textContent=e)}function m(e){if(!r&&(console.error("bodyEl is null, ensuring popup is created"),b(),r=i?.querySelector(".vizor-body"),!r)){console.error("Still no bodyEl after ensuring popup");return}if(r.classList.remove("is-pre"),console.log("Rendering wallet insights with data:",e,e.insights),!e||!e.insights){console.error("Invalid data structure:",e),l("Invalid data received from server.");return}const t=e.insights,o=t.fee.totalSol,p=t.topPrograms.slice(0,3);r.innerHTML=`
    <div class="vizor-insights">
      <div class="vizor-insights-header">over 100 transactions</div>
      
      <div class="vizor-metric">
        <span class="vizor-metric-label">Total Fees Spent</span>
        <span class="vizor-metric-value vizor-fee-amount">${o.toFixed(6)} SOL</span>
      </div> 
      
      <div class="vizor-transaction-types">
        <div class="vizor-transaction-title">Transaction Types</div>
        <div class="vizor-type-labels">
          <span>Swaps</span>
          <span>Transfers</span>
          <span>Others</span>
        </div>
        <div class="vizor-progress-bar">
          <div style="width: ${t.types.swap.pct}%; background: #5062EE; height: 100%; float: left;"></div>
          <div style="width: ${t.types.transfer.pct}%; background: #B0E7F5; height: 100%; float: left;"></div>
          <div style="width: ${t.types.other.pct}%; background: #F5F2F2; height: 100%; float: left;"></div>
        </div>
        <div class="vizor-percentage-labels">
          <span>${t.types.swap.pct}%</span>
          <span>${t.types.transfer.pct}%</span>
          <span>${t.types.other.pct}%</span>
        </div>
      </div>
      
      <div class="vizor-top-programs">
        <div class="vizor-transaction-title">Top Programs</div>
        ${p.map(c=>`
          <div class="vizor-program-badge">
            ${c.program}
          </div>
        `).join("")}
      </div>
      
      <div class="vizor-metric vizor-collapsible">
        <span class="vizor-metric-label">Unique Addresses</span>
        <span class="vizor-metric-value">${t.uniqueCounterparties}</span>
      </div>
      <div class="vizor-counterparties-list" id="counterparties-list">
        <div style="color: #333; font-size: 12px; font-weight: 600; margin: 4px 0px 2px 0px;">Top Addresses</div>
        ${t.topCounterparties?t.topCounterparties.slice(0,5).map(c=>`
          <div class="vizor-counterparty-item">
            <a href="${c.url}" target="_blank" rel="noopener noreferrer" class="vizor-counterparty-address">
              ${c.address}
            </a>
          </div>
        `).join(""):""}
      </div>
      
      <div class="vizor-active-hours">
        <div style="display: flex; flex-direction: column;">
          <span class="vizor-metric-label">Active Hours</span>
          <span class="vizor-timezone-note">in your local timezone</span>
        </div>
        <span class="vizor-metric-value">${t.activeHours.label}</span>
      </div>
    </div>
  `;const g=r.querySelector(".vizor-collapsible"),x=r.querySelector("#counterparties-list");g&&x&&g.addEventListener("click",()=>{x.classList.toggle("expanded")})}function $(){if(s)return;L(),s=document.createElement("img"),s.id="vizor-btn",s.className="vizor-floating",s.src=chrome.runtime.getURL("icons/vizor-logo.png"),s.alt="Explain TX",s.tabIndex=0,document.documentElement.appendChild(s);const e=()=>{if(P(),z()){const t=T();if(!t){l("No signature detected on this page.");return}N(t)}else if(y()){const t=A();if(!t){l("No address detected on this page.");return}F(t)}else l("Unsupported page type.")};s.onclick=e}function C(){s&&(s.remove(),s=null),n&&(n.remove(),n=null),i&&(i.remove(),i=null)}function f(){d=null,v=null,a=null}function E(e){if(e===h)return;h=e,S(e)?$():(C(),f(),i&&!i.classList.contains("vizor-hidden")&&u())}function N(e){if(d===e&&a){l(a);return}d!==e&&(f(),d=e),w();const t=Intl.DateTimeFormat().resolvedOptions().timeZone;chrome.runtime.sendMessage({type:"EXPLAIN_TX",signature:e,tz:t},o=>{if(!o?.ok){a=null,l(o?.error||"Failed to explain.");return}a=o.text,l(o.text)})}function F(e){if(v===e&&a){try{const o=JSON.parse(a);m(o)}catch{l(a)}return}v!==e&&(f(),v=e),w("Analyzing account…");const t=Intl.DateTimeFormat().resolvedOptions().timeZone;chrome.runtime.sendMessage({type:"EXPLAIN_ACCOUNT",address:e,tz:t},o=>{if(console.log("Account insights response:",o.data),!o?.ok){a=null,l(o?.error||"Failed to analyze account.");return}if(!o.data){l("No data received from server.");return}a=JSON.stringify(o.data),m(o.data)})}E(location.href);chrome.runtime.onMessage.addListener(e=>{e?.type==="URL_CHANGED"&&E(e.url||location.href)});
