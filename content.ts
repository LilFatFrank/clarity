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

/* Popup + card etc. (unchanged) */
.vizor-popup { position: fixed; right: 18px; bottom: 70px; z-index: 2147483647; }
.vizor-hidden { display: none; }
.vizor-card {
  width: 420px; max-height: 72vh; overflow:auto;
  background:#fff; color:#111; border-radius:14px; padding:16px 16px 10px;
  box-shadow:0 16px 44px rgba(0,0,0,.22);
  font: 14px/1.5 system-ui, -apple-system, Segoe UI, Roboto, Arial;
}
.vizor-card h3 { margin: 0 0 8px; font-size: 16px; }
.vizor-close { position: absolute; right: 28px; margin-top: -4px; cursor: pointer; font-size: 18px; }
.vizor-body { white-space: pre-wrap; }
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

// ---------- UI State ----------
let popup: HTMLDivElement | null = null;
let bodyEl: HTMLDivElement | null = null;
let btn: HTMLImageElement | null = null;

let currentUrl: string = "";
let currentSignature: string | null = null;
let currentResponse: string | null = null;

function ensurePopup() {
  if (popup) return;
  popup = document.createElement("div");
  popup.className = "vizor-popup vizor-hidden";
  popup.innerHTML = `
    <div class="vizor-card">
      <div class="vizor-close" title="Close">×</div>
      <div class="vizor-body">Ready.</div>
    </div>
  `;
  document.documentElement.appendChild(popup);

  bodyEl = popup.querySelector(".vizor-body") as HTMLDivElement;
  const close = popup.querySelector(".vizor-close") as HTMLDivElement;
  close.onclick = () => popup!.classList.add("vizor-hidden");

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      popup &&
      !popup.classList.contains("vizor-hidden")
    ) {
      popup.classList.add("vizor-hidden");
    }
  });
}

function showPopup() {
  ensurePopup();
  popup!.classList.remove("vizor-hidden");
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

function injectButton() {
  if (btn) return;
  ensureStyle();

  btn = document.createElement("img");
  btn.id = "vizor-btn";
  btn.className = "vizor-floating"; // Always keep the pulse
  btn.src = chrome.runtime.getURL("icons/vizor-icon-128.png");
  btn.alt = "Explain TX";
  btn.tabIndex = 0; // keyboard focusable

  document.documentElement.appendChild(btn);

  const trigger = () => {
    const sig = getSignature();
    showPopup();
    if (!sig) {
      renderText("No signature detected on this page.");
      return;
    }
    explainTransaction(sig);
  };

  btn.onclick = trigger;
}

function removeButton() {
  if (btn) {
    btn.remove();
    btn = null;
  }
}

function clearState() {
  currentSignature = null;
  currentResponse = null;
}

function handleUrlChange(url: string) {
  if (url === currentUrl) return;
  currentUrl = url;
  const onTx = isTxPage(url);

  if (onTx) {
    injectButton();
  } else {
    removeButton();
    clearState();
    if (popup && !popup.classList.contains("vizor-hidden")) {
      popup.classList.add("vizor-hidden");
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

// ---------- Boot + listeners ----------
handleUrlChange(location.href);

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "URL_CHANGED") {
    handleUrlChange(msg.url || location.href);
  }
});
