// background.ts
const SOLSCAN_HOST = "solscan.io";

function notify(tabId: number, url?: string) {
  // Content script may not be injected on every page; ignore failures.
  chrome.tabs.sendMessage(tabId, { type: "URL_CHANGED", url }).catch(() => {});
}

function isSolscan(url?: string) {
  return !!url && url.includes("://solscan.io/");
}

/* ---------- URL change wiring ---------- */
// Prefer webNavigation when available (best SPA signal)
if ((chrome as any).webNavigation?.onCommitted) {
  const filter = { url: [{ hostEquals: SOLSCAN_HOST }] };
  const handler = (e: { tabId: number; url: string }) => notify(e.tabId, e.url);

  chrome.webNavigation.onCommitted.addListener(handler, filter);
  chrome.webNavigation.onHistoryStateUpdated.addListener(handler, filter);
} else {
  // Fallback: tabs events (needs "tabs" permission)
  console.warn("[vizor] webNavigation unavailable; using tabs fallback");

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const url = changeInfo.url ?? tab.url;
    if ((changeInfo.status === "complete" || changeInfo.url) && isSolscan(url)) {
      notify(tabId, url);
    }
  });

  chrome.tabs.onActivated.addListener(async (info) => {
    try {
      const tab = await chrome.tabs.get(info.tabId);
      if (isSolscan(tab.url)) notify(info.tabId, tab.url);
    } catch {}
  });
}

/* ---------- EXPLAIN_TX handler ---------- */

function buildDisplayText(d: any): string {
  // Accept either {text} or {explainer, keypoints, when}
  if (d?.text && typeof d.text === "string") return d.text;

  const lines: string[] = [];
  if (d?.explainer) lines.push(String(d.explainer));
  if (Array.isArray(d?.keypoints) && d.keypoints.length) {
    lines.push(""); // blank line before bullets
    for (const k of d.keypoints) lines.push(`• ${String(k)}`);
  }
  if (d?.when) {
    lines.push("");
    lines.push(String(d.when));
  }
  return lines.join("\n").trim() || "No explanation available.";
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "EXPLAIN_TX") {
    (async () => {
      try {
        const signature = String(msg.signature || "");
        const tz =
          String(msg.tz || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");

        if (!signature) {
          sendResponse({ ok: false, error: "Missing signature" });
          return;
        }

        const resp = await fetch("http://localhost:3001/api/transactions/explain", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ signature, tz }),
        });

        if (!resp.ok) {
          sendResponse({ ok: false, error: `API ${resp.status}` });
          return;
        }

        const data = await resp.json();
        const text = buildDisplayText(data);
        sendResponse({ ok: true, text });
      } catch (e: any) {
        sendResponse({ ok: false, error: e?.message || String(e) });
      }
    })();

    // Keep the message channel open for the async work above.
    return true;
  }

  if (msg?.type === "EXPLAIN_ACCOUNT") {
    (async () => {
      try {
        const address = String(msg.address || "");
        const tz =
          String(msg.tz || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");

        if (!address) {
          sendResponse({ ok: false, error: "Missing address" });
          return;
        }

        const resp = await fetch("http://localhost:3001/api/wallets/insights", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ address, tz }),
        });

        if (!resp.ok) {
          sendResponse({ ok: false, error: `API ${resp.status}` });
          return;
        }

        const data = await resp.json();
        console.log("Account insights response:", data);
        sendResponse({ ok: true, data });
      } catch (e: any) {
        sendResponse({ ok: false, error: e?.message || String(e) });
      }
    })();

    // Keep the message channel open for the async work above.
    return true;
  }

  return false; // Not handled
});
