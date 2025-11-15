console.log("[vizor] content script loaded on",location.href);const L=`
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

/* Password Prompt Overlay */
.vizor-password-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: vizorFadeIn 0.2s ease;
}

.vizor-password-modal {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 380px;
  animation: vizorSlideUp 0.3s ease;
}

.vizor-password-header {
  text-align: center;
  margin-bottom: 20px;
}

.vizor-password-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.vizor-password-title {
  font-size: 22px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.vizor-password-subtitle {
  font-size: 14px;
  color: #666;
}

.vizor-password-input {
  width: 100%;
  padding: 14px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  margin-bottom: 16px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.vizor-password-input:focus {
  outline: none;
  border-color: #667eea;
}

.vizor-password-error {
  color: #dc3545;
  font-size: 13px;
  margin-bottom: 12px;
  text-align: center;
}

.vizor-password-buttons {
  display: flex;
  gap: 12px;
}

.vizor-password-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.vizor-password-btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.vizor-password-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.vizor-password-btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.vizor-password-btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.vizor-password-btn-secondary:hover {
  background: #f8f9fa;
}

.vizor-password-help {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
  text-align: center;
  font-size: 12px;
  color: #666;
}

.vizor-password-help-link {
  color: #667eea;
  cursor: pointer;
  text-decoration: underline;
}

@keyframes vizorFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes vizorSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
`;function T(){if(document.getElementById("vizor-style"))return;const e=document.createElement("style");e.id="vizor-style",e.textContent=L,document.documentElement.appendChild(e)}const z=(e=location.href)=>/:\/\/(?:www\.)?solscan\.io\/tx\//i.test(e),y=(e=location.href)=>/:\/\/(?:www\.)?solscan\.io\/account\//i.test(e),C=(e=location.href)=>z(e)||y(e);function U(e=location.href){try{const o=new URL(e).pathname.split("/").filter(Boolean),i=o.indexOf("tx");return i>=0&&o[i+1]?o[i+1]:null}catch{return null}}function $(e=location.href){try{const o=new URL(e).pathname.split("/").filter(Boolean),i=o.indexOf("account");return i>=0&&o[i+1]?o[i+1]:null}catch{return null}}let r=null,s=null,n=null,a=null,m="",v=null,x=null,l=null;function w(){if(r)return;s=document.createElement("div"),s.className="vizor-overlay",s.style.cssText=`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.1);
    z-index: 2147483646;
    opacity: 0;
    pointer-events: none;
  `,document.documentElement.appendChild(s),r=document.createElement("div"),r.className="vizor-popup",r.style.cssText=`
    position: fixed;
    right: 18px;
    bottom: 70px;
    z-index: 2147483647;
    opacity: 0;
    pointer-events: none;
  `,r.innerHTML=`
    <div class="vizor-card">
      <div class="vizor-close" title="Close">×</div>
      <div class="vizor-body">Ready.</div>
    </div>
  `,document.documentElement.appendChild(r),n=r.querySelector(".vizor-body");const e=r.querySelector(".vizor-close");e.onclick=()=>g(),s.onclick=()=>g(),document.addEventListener("keydown",t=>{t.key==="Escape"&&r&&r.style.opacity!=="0"&&g()})}function P(){w(),s.style.opacity="1",s.style.pointerEvents="auto",r.style.opacity="1",r.style.pointerEvents="auto"}function g(){s&&(s.style.opacity="0",s.style.pointerEvents="none"),r&&(r.style.opacity="0",r.style.pointerEvents="none")}function k(e="Explaining transaction…"){n&&(n.classList.add("is-pre"),n.innerHTML=`
    <div class="vizor-loading">
      <div class="vizor-spinner"></div>
      <div>${e}</div>
    </div>
  `)}function p(e){n&&(n.classList.add("is-pre"),n.textContent=e)}function h(e){if(!n&&(console.error("bodyEl is null, ensuring popup is created"),w(),n=r?.querySelector(".vizor-body"),!n)){console.error("Still no bodyEl after ensuring popup");return}if(n.classList.remove("is-pre"),!e||!e.insights){console.error("Invalid data structure:",e),p("Invalid data received from server.");return}const t=e.insights,o=t.fee.totalSol,i=t.topPrograms.slice(0,3);n.innerHTML=`
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
        ${i.map(d=>`
          <div class="vizor-program-badge">
            ${d.program}
          </div>
        `).join("")}
      </div>
      
      <div class="vizor-metric vizor-collapsible">
        <span class="vizor-metric-label">Wallets Interacted</span>
        <span class="vizor-metric-value">${t.uniqueCounterparties}</span>
      </div>
      <div class="vizor-counterparties-list" id="counterparties-list">
        <div style="color: #333; font-size: 12px; font-weight: 600; margin: 4px 0px 2px 0px;">Top Wallets</div>
        ${t.topCounterparties?t.topCounterparties.slice(0,5).map(d=>`
          <div class="vizor-counterparty-item">
            <a href="${d.url}" target="_blank" rel="noopener noreferrer" class="vizor-counterparty-address">
              ${d.address}
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
  `;const c=n.querySelector(".vizor-collapsible"),u=n.querySelector("#counterparties-list");c&&u&&c.addEventListener("click",()=>{u.classList.toggle("expanded")})}function b(e){const t=document.querySelector(".vizor-unlock-prompt");t&&t.remove();const o=e==="create",i=document.createElement("div");i.className="vizor-unlock-prompt",i.style.cssText=`
    position: fixed;
    right: 18px;
    bottom: 80px;
    z-index: 2147483646;
    width: 320px;
    background: white;
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 16px 44px rgba(0,0,0,0.22);
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
    animation: vizorSlideUp 0.3s ease;
  `,i.innerHTML=`
    <div style="text-align: center; margin-bottom: 16px;">
      <div style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 6px;">
        ${o?"Wallet Setup Required":"Wallet Locked"}
      </div>
      <div style="font-size: 14px; color: #666;">
        ${o?"Create your wallet to continue":"Unlock your wallet to continue"}
      </div>
    </div>
    
    <button id="vizor-open-extension-btn" style="
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
      margin-bottom: 12px;
    ">
      ${o?"Create Wallet":"Unlock Wallet"}
    </button>
    
    <button id="vizor-unlock-cancel-btn" style="
      width: 100%;
      padding: 12px;
      background: transparent;
      color: #666;
      border: none;
      font-size: 14px;
      cursor: pointer;
    ">
      Cancel
    </button>
    
    <div style="font-size: 12px; color: #888; text-align: center; margin-top: 12px;">
      ${o?"This will open the Vizor extension":"Click the extension icon to unlock"}
    </div>
  `,document.body.appendChild(i);const c=i.querySelector("#vizor-open-extension-btn");c.onmouseover=()=>{c.style.transform="translateY(-1px)"},c.onmouseout=()=>{c.style.transform="none"},c.onclick=()=>{const d=document.createElement("div");d.style.cssText=`
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 2147483647;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      font-family: system-ui;
      font-size: 14px;
      animation: vizorFadeIn 0.3s ease;
    `;const S=chrome.runtime.getURL("icons/vizor-logo.png");d.innerHTML=`
      <div style="display: flex; align-items: center; gap: 12px;">
        <img src="${S}" alt="Vizor" style="width: 32px; height: 32px; border-radius: 50%;" />
        <div>
          <div style="font-weight: 600; margin-bottom: 2px;">Click the Vizor icon</div>
          <div style="opacity: 0.9; font-size: 12px;">Look in your browser toolbar →</div>
        </div>
      </div>
    `,document.body.appendChild(d),setTimeout(()=>d.remove(),4e3),i.remove()};const u=i.querySelector("#vizor-unlock-cancel-btn");u.onclick=()=>i.remove(),setTimeout(()=>{i.parentElement&&i.remove()},1e4)}function A(){if(a)return;T(),a=document.createElement("img"),a.id="vizor-btn",a.className="vizor-floating",a.src=chrome.runtime.getURL("icons/vizor-logo.png"),a.alt="Explain TX",a.tabIndex=0,document.documentElement.appendChild(a);const e=async()=>{const{hasWallet:t,isUnlocked:o}=await chrome.runtime.sendMessage({type:"CHECK_WALLET_STATUS"});if(!t){b("create");return}if(!o){b("unlock");return}if(P(),z()){const i=U();if(!i){p("No signature detected on this page.");return}N(i)}else if(y()){const i=$();if(!i){p("No address detected on this page.");return}F(i)}else p("Unsupported page type.")};a.onclick=e}function I(){a&&(a.remove(),a=null),s&&(s.remove(),s=null),r&&(r.remove(),r=null)}function f(){v=null,x=null,l=null}function E(e){if(e===m)return;m=e,C(e)?A():(I(),f(),r&&!r.classList.contains("vizor-hidden")&&g())}function N(e){if(v===e&&l){p(l);return}v!==e&&(f(),v=e),k();const t=Intl.DateTimeFormat().resolvedOptions().timeZone;chrome.runtime.sendMessage({type:"EXPLAIN_TX",signature:e,tz:t},o=>{if(!o?.ok){l=null,p(o?.error||"Failed to explain.");return}l=o.text,p(o.text)})}function F(e){if(x===e&&l){try{const o=JSON.parse(l);h(o)}catch{p(l)}return}x!==e&&(f(),x=e),k("Analyzing account…");const t=Intl.DateTimeFormat().resolvedOptions().timeZone;chrome.runtime.sendMessage({type:"EXPLAIN_ACCOUNT",address:e,tz:t},o=>{if(!o?.ok){l=null,p(o?.error||"Failed to analyze account.");return}if(!o.data){p("No data received from server.");return}l=JSON.stringify(o.data),h(o.data)})}E(location.href);chrome.runtime.onMessage.addListener(e=>{e?.type==="URL_CHANGED"&&E(e.url||location.href)});
