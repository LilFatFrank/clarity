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
  bodyEl.classList.add("is-pre");
  bodyEl.innerHTML = `
    <div class="vizor-loading">
      <div class="vizor-spinner"></div>
      <div>${msg}</div>
    </div>
  `;
}

function renderText(text: string) {
  if (!bodyEl) return;
  bodyEl.classList.add("is-pre");
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

  // Ensure HTML rendering for insights
  bodyEl.classList.remove("is-pre");

  if (!data || !data.insights) {
    console.error("Invalid data structure:", data);
    renderText("Invalid data received from server.");
    return;
  }

  const insights = data.insights;
  const feeAmount = insights.fee.totalSol;
  const topPrograms = insights.topPrograms.slice(0, 3);

  bodyEl.innerHTML = `
    <div class="vizor-insights">
      <div class="vizor-insights-header">over 100 transactions</div>
      
      <div class="vizor-metric">
        <span class="vizor-metric-label">Total Fees Spent</span>
        <span class="vizor-metric-value vizor-fee-amount">${feeAmount.toFixed(6)} SOL</span>
      </div> 
      
      <div class="vizor-transaction-types">
        <div class="vizor-transaction-title">Transaction Types</div>
        <div class="vizor-type-labels">
          <span>Swaps</span>
          <span>Transfers</span>
          <span>Others</span>
        </div>
        <div class="vizor-progress-bar">
          <div style="width: ${insights.types.swap.pct}%; background: #5062EE; height: 100%; float: left;"></div>
          <div style="width: ${insights.types.transfer.pct}%; background: #B0E7F5; height: 100%; float: left;"></div>
          <div style="width: ${insights.types.other.pct}%; background: #F5F2F2; height: 100%; float: left;"></div>
        </div>
        <div class="vizor-percentage-labels">
          <span>${insights.types.swap.pct}%</span>
          <span>${insights.types.transfer.pct}%</span>
          <span>${insights.types.other.pct}%</span>
        </div>
      </div>
      
      <div class="vizor-top-programs">
        <div class="vizor-transaction-title">Top Programs</div>
        ${topPrograms.map((program: any) => `
          <div class="vizor-program-badge">
            ${program.program}
          </div>
        `).join('')}
      </div>
      
      <div class="vizor-metric vizor-collapsible">
        <span class="vizor-metric-label">Wallets Interacted</span>
        <span class="vizor-metric-value">${insights.uniqueCounterparties}</span>
      </div>
      <div class="vizor-counterparties-list" id="counterparties-list">
        <div style="color: #333; font-size: 12px; font-weight: 600; margin: 4px 0px 2px 0px;">Top Wallets</div>
        ${insights.topCounterparties ? insights.topCounterparties.slice(0, 5).map((counterparty: any) => `
          <div class="vizor-counterparty-item">
            <a href="${counterparty.url}" target="_blank" rel="noopener noreferrer" class="vizor-counterparty-address">
              ${counterparty.address}
            </a>
          </div>
        `).join('') : ''}
      </div>
      
      <div class="vizor-active-hours">
        <div style="display: flex; flex-direction: column;">
          <span class="vizor-metric-label">Active Hours</span>
          <span class="vizor-timezone-note">in your local timezone</span>
        </div>
        <span class="vizor-metric-value">${insights.activeHours.label}</span>
      </div>
    </div>
  `;

  // Add click handler for collapsible counterparties
  const collapsibleElement = bodyEl.querySelector('.vizor-collapsible');
  const counterpartiesList = bodyEl.querySelector('#counterparties-list');

  if (collapsibleElement && counterpartiesList) {
    collapsibleElement.addEventListener('click', () => {
      counterpartiesList.classList.toggle('expanded');
    });
  }
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
