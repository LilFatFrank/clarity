// background.ts
import { Keypair, Connection } from "@solana/web3.js";
import bs58 from "bs58";
import { createPaymentHeader } from "x402/client";
import { svm, decodeXPaymentResponse } from "x402/shared";
import type { PaymentRequirements } from "x402/types";

const SOLSCAN_HOST = "solscan.io";
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
const RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

// Load Solana wallet from private key
const PRIVATE_KEY = import.meta.env.VITE_SOLANA_PRIVATE_KEY;

let wallet: Keypair | null = null;
let signer: any = null;
let connection: Connection | null = null;

// Initialize wallet and signer
(async () => {
  if (PRIVATE_KEY) {
    try {
      const keyArray = JSON.parse(PRIVATE_KEY);
      wallet = Keypair.fromSecretKey(new Uint8Array(keyArray));
      connection = new Connection(RPC_URL, "confirmed");
      
      // Create proper signer using x402 SDK
      const privateKeyBase58 = bs58.encode(wallet.secretKey);
      signer = await svm.createSignerFromBase58(privateKeyBase58);
      
      console.log("[vizor] Wallet loaded:", wallet.publicKey.toBase58());
    } catch (error) {
      console.error("[vizor] Failed to load wallet:", error);
    }
  }
})();

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

// Custom fetch wrapper using x402 SDK (matches reference code pattern)
async function fetchWithPayment(url: string, options: RequestInit = {}): Promise<Response> {
  // First attempt without payment
  let response = await fetch(url, options);
  
  // If 402 Payment Required, handle it
  if (response.status === 402) {
    console.log("[vizor] Got 402, signer available:", !!signer, "connection available:", !!connection);
    
    if (!signer || !connection) {
      console.error("[vizor] Wallet not initialized yet. Please wait for wallet to load.");
      return response;
    }
    
    try {
      // Get payment requirements from 402 response
      const paymentReq = await response.json();
      console.log("[vizor] Raw payment requirements:", JSON.stringify(paymentReq, null, 2));
      
      // Extract the first payment option from accepts array
      if (!paymentReq.accepts || !Array.isArray(paymentReq.accepts) || paymentReq.accepts.length === 0) {
        throw new Error("No payment options in accepts array");
      }
      
      const paymentOption = paymentReq.accepts[0];
      console.log("[vizor] Selected payment option:", JSON.stringify(paymentOption, null, 2));
      
      // Create payment header using x402 SDK
      console.log("[vizor] Creating payment header...");
      const paymentHeader = await createPaymentHeader(
        signer,
        1, // x402Version
        paymentOption as PaymentRequirements,
        {
          svmConfig: {
            rpcUrl: connection.rpcEndpoint,
          },
        }
      );
      console.log("[vizor] Payment header created, length:", paymentHeader.length);
      
      // Retry with payment header
      console.log("[vizor] Retrying request with payment...");
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          "x-payment": paymentHeader,
        },
      });
      console.log("[vizor] Retry response status:", response.status);
    } catch (error) {
      console.error("[vizor] Payment failed:", error);
      // Return error response instead of consumed 402
      throw error;
    }
  }
  
  return response;
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

        const resp = await fetchWithPayment(`${BASE_URL}/api/transactions/explain`, {
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
        
        // Decode payment response if present
        const paymentHeader = resp.headers.get("x-payment-response");
        if (paymentHeader) {
          const paymentResponse = decodeXPaymentResponse(paymentHeader);
          console.log("[vizor] Payment:", paymentResponse);
        }
        
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

        const resp = await fetchWithPayment(`${BASE_URL}/api/wallets/insights`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ address, tz }),
        });

        if (!resp.ok) {
          sendResponse({ ok: false, error: `API ${resp.status}` });
          return;
        }

        const data = await resp.json();
        
        // Decode payment response if present
        const paymentHeader = resp.headers.get("x-payment-response");
        if (paymentHeader) {
          const paymentResponse = decodeXPaymentResponse(paymentHeader);
          console.log("[vizor] Payment:", paymentResponse);
        }
        
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
