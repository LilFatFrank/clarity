// content.ts

console.log("[vizor] content script loaded on", location.href);

// ---------- Minimal styles ----------
const STYLE = `
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
`;

function ensureStyle() {
  if (document.getElementById("vizor-style")) return;
  const style = document.createElement("style");
  style.id = "vizor-style";
  style.textContent = STYLE;
  document.documentElement.appendChild(style);
}

// ---------- Helpers ----------
const isTxPage = (url = location.href) =>
  /:\/\/(?:www\.)?solscan\.io\/tx\//i.test(url);

const isAccountPage = (url = location.href) =>
  /:\/\/(?:www\.)?solscan\.io\/account\//i.test(url);

const isSupportedPage = (url = location.href) =>
  isTxPage(url) || isAccountPage(url);

function getSignature(url = location.href): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean); // ["tx", "<sig>"]
    const i = parts.indexOf("tx");
    return i >= 0 && parts[i + 1] ? parts[i + 1] : null;
  } catch {
    return null;
  }
}

function getAddress(url = location.href): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean); // ["account", "<address>"]
    const i = parts.indexOf("account");
    return i >= 0 && parts[i + 1] ? parts[i + 1] : null;
  } catch {
    return null;
  }
}

// ---------- UI State ----------
let popup: HTMLDivElement | null = null;
let overlay: HTMLDivElement | null = null;
let bodyEl: HTMLDivElement | null = null;
let btn: HTMLImageElement | null = null;

let currentUrl: string = "";
let currentSignature: string | null = null;
let currentAddress: string | null = null;
let currentResponse: string | null = null;

function ensurePopup() {
  if (popup) return;
  
  // Create overlay with very light background
  overlay = document.createElement("div");
  overlay.className = "vizor-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.1);
    z-index: 2147483646;
    opacity: 0;
    pointer-events: none;
  `;
  document.documentElement.appendChild(overlay);
  
  // Create popup with inline styles
  popup = document.createElement("div");
  popup.className = "vizor-popup";
  popup.style.cssText = `
    position: fixed;
    right: 18px;
    bottom: 70px;
    z-index: 2147483647;
    opacity: 0;
    pointer-events: none;
  `;
  popup.innerHTML = `
    <div class="vizor-card">
      <div class="vizor-close" title="Close">×</div>
      <div class="vizor-body">Ready.</div>
    </div>
  `;
  document.documentElement.appendChild(popup);

  bodyEl = popup.querySelector(".vizor-body") as HTMLDivElement;
  const close = popup.querySelector(".vizor-close") as HTMLDivElement;
  close.onclick = () => hidePopup();
  
  // Close on overlay click
  overlay.onclick = () => hidePopup();

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      popup &&
      popup.style.opacity !== "0"
    ) {
      hidePopup();
    }
  });
}

function showPopup() {
  ensurePopup();
  
  overlay!.style.opacity = "1";
  overlay!.style.pointerEvents = "auto";
  popup!.style.opacity = "1";
  popup!.style.pointerEvents = "auto";
}

function hidePopup() {
  if (overlay) {
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
  }
  if (popup) {
    popup.style.opacity = "0";
    popup.style.pointerEvents = "none";
  }
}

function setLoading(msg = "Explaining transaction…") {
  if (!bodyEl) return;
  bodyEl.innerHTML = `
    <div class="vizor-loading">
      <div class="vizor-spinner"></div>
      <div>${msg}</div>
    </div>
  `;
}

function renderText(text: string) {
  if (!bodyEl) return;
  bodyEl.textContent = text;
}

function renderWalletInsights(data: any) {
  if (!bodyEl) {
    console.error("bodyEl is null, ensuring popup is created");
    ensurePopup();
    bodyEl = popup?.querySelector(".vizor-body") as HTMLDivElement;
    if (!bodyEl) {
      console.error("Still no bodyEl after ensuring popup");
      return;
    }
  }
  
  console.log("Rendering wallet insights with data:", data, data.insights);
  
  if (!data || !data.insights) {
    console.error("Invalid data structure:", data);
    renderText("Invalid data received from server.");
    return;
  }
  
  const insights = data.insights;
  const totalTx = insights.totalTx;
  const feeAmount = insights.fee.totalSol;
  const successRate = Math.round(insights.successRate * 100);
  const topProgram = insights.topPrograms[0];
  const topProgramPct = Math.round(insights.topProgramShare * 100);
  
  // Format transaction count header
  const txCountText = totalTx >= 100 ? `over ${Math.floor(totalTx / 100) * 100} transactions` : `${totalTx} transactions`;
  
  bodyEl.innerHTML = `
    <div class="vizor-insights">
      <div class="vizor-insights-header">${txCountText}</div>
      
      <div class="vizor-metric">
        <span class="vizor-metric-label">Total Fees Spent</span>
        <span class="vizor-metric-value vizor-fee-amount">${feeAmount.toFixed(6)} SOL</span>
      </div>
      
      <div class="vizor-metric">
        <span class="vizor-metric-label">Success Rate</span>
        <span class="vizor-metric-value">${successRate}%</span>
      </div>
      
      <div class="vizor-transaction-types">
        <div class="vizor-type-badge vizor-type-swap">
          Swaps<br><small>${insights.types.swap.pct}%</small>
        </div>
        <div class="vizor-type-badge vizor-type-transfer">
          Transfers<br><small>${insights.types.transfer.pct}%</small>
        </div>
        <div class="vizor-type-badge vizor-type-other">
          Other<br><small>${insights.types.other.pct}%</small>
        </div>
      </div>
      
      <div class="vizor-top-program">
        <div class="vizor-program-percentage">${topProgramPct}%</div>
        ${topProgram.program}
      </div>
      
      <div class="vizor-unique-addresses">
        ${insights.uniqueCounterparties} unique addresses
      </div>
      
      <div class="vizor-active-hours">
        Most active: ${insights.activeHours.label}
        <div class="vizor-timezone-note">in your local timezone</div>
      </div>
    </div>
  `;
}

function injectButton() {
  if (btn) return;
  ensureStyle();

  btn = document.createElement("img");
  btn.id = "vizor-btn";
  btn.className = "vizor-floating"; // Always keep the pulse
  btn.src = chrome.runtime.getURL("icons/vizor-logo.png");
  btn.alt = "Explain TX";
  btn.tabIndex = 0; // keyboard focusable

  document.documentElement.appendChild(btn);

  const trigger = () => {
    showPopup();
    
    if (isTxPage()) {
      const sig = getSignature();
      if (!sig) {
        renderText("No signature detected on this page.");
        return;
      }
      explainTransaction(sig);
    } else if (isAccountPage()) {
      const address = getAddress();
      if (!address) {
        renderText("No address detected on this page.");
        return;
      }
      explainAccount(address);
    } else {
      renderText("Unsupported page type.");
    }
  };

  btn.onclick = trigger;
}

function removeButton() {
  if (btn) {
    btn.remove();
    btn = null;
  }
  if (overlay) {
    overlay.remove();
    overlay = null;
  }
  if (popup) {
    popup.remove();
    popup = null;
  }
}

function clearState() {
  currentSignature = null;
  currentAddress = null;
  currentResponse = null;
}

function handleUrlChange(url: string) {
  if (url === currentUrl) return;
  currentUrl = url;
  const onSupportedPage = isSupportedPage(url);

  if (onSupportedPage) {
    injectButton();
  } else {
    removeButton();
    clearState();
    if (popup && !popup.classList.contains("vizor-hidden")) {
      hidePopup();
    }
  }
}

// ---------- Explain flow ----------
function explainTransaction(signature: string) {
  // Serve cached response if same signature
  if (currentSignature === signature && currentResponse) {
    renderText(currentResponse);
    return;
  }
  if (currentSignature !== signature) {
    clearState();
    currentSignature = signature;
  }

  setLoading();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  chrome.runtime.sendMessage({ type: "EXPLAIN_TX", signature, tz }, (resp) => {
    if (!resp?.ok) {
      currentResponse = null;
      renderText(resp?.error || "Failed to explain.");
      return;
    }
    currentResponse = resp.text;
    renderText(resp.text);
  });
}

function explainAccount(address: string) {
  // Serve cached response if same address
  if (currentAddress === address && currentResponse) {
    // Check if we have structured data or text response
    try {
      const data = JSON.parse(currentResponse);
      renderWalletInsights(data);
    } catch {
      renderText(currentResponse);
    }
    return;
  }
  if (currentAddress !== address) {
    clearState();
    currentAddress = address;
  }

  setLoading("Analyzing account…");
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  chrome.runtime.sendMessage({ type: "EXPLAIN_ACCOUNT", address, tz }, (resp) => {
    console.log("Account insights response:", resp.data);
    if (!resp?.ok) {
      currentResponse = null;
      renderText(resp?.error || "Failed to analyze account.");
      return;
    }

    if (!resp.data) {
      renderText("No data received from server.");
      return;
    }

    // Store the structured data as JSON string for caching
    currentResponse = JSON.stringify(resp.data);
    renderWalletInsights(resp.data);
  });
}

// ---------- Boot + listeners ----------
handleUrlChange(location.href);

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "URL_CHANGED") {
    handleUrlChange(msg.url || location.href);
  }
});
