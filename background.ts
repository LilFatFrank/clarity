// background.ts
import { Keypair, Connection } from "@solana/web3.js";
import bs58 from "bs58";
import { createPaymentHeader } from "x402/client";
import { svm, decodeXPaymentResponse } from "x402/shared";
import type { PaymentRequirements } from "x402/types";
import {
  generateKeypair,
  encryptPrivateKey,
  decryptPrivateKey,
} from "./wallet";

const SOLSCAN_HOST = "solscan.io";
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://vizor-api.vercel.app";
const RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

// Wallet state
let unlockedWallet: Keypair | null = null;
let unlockedSigner: any = null;
const connection = new Connection(RPC_URL, "confirmed");

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
    console.log("[vizor] Got 402, wallet unlocked:", !!unlockedSigner);
    
    if (!unlockedSigner) {
      console.error("[vizor] Wallet locked. Please unlock your wallet first.");
      throw new Error("Wallet locked. Please unlock your wallet to continue.");
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
      
      // Note: Network fees are covered by the facilitator, user only needs USDC
      console.log("[vizor] Creating payment (network fees covered by facilitator)...");
      
      // Create payment header using x402 SDK
      console.log("[vizor] Creating payment header...");
      const paymentHeader = await createPaymentHeader(
        unlockedSigner,
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
    } catch (error: any) {
      console.error("[vizor] Payment failed:", error);
      
      // Provide user-friendly error messages
      if (error.message?.includes("Insufficient funds") || error.message?.includes("insufficient")) {
        throw new Error("⚠️ Insufficient USDC. You need at least 0.01 USDC. Click the extension icon to see your address and add USDC.");
      }
      
      if (error.message?.includes("simulation failed")) {
        throw new Error("⚠️ Payment failed. Please ensure you have at least 0.01 USDC in your wallet.");
      }
      
      throw error;
    }
  }
  
  return response;
}

// Wallet Management Handlers
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  // Check wallet status
  if (msg?.type === "CHECK_WALLET_STATUS") {
    (async () => {
      const { encryptedWallet } = await chrome.storage.local.get(["encryptedWallet"]);
      console.log("[vizor] Wallet status check - hasWallet:", !!encryptedWallet, "isUnlocked:", !!unlockedWallet);
      sendResponse({
        hasWallet: !!encryptedWallet,
        isUnlocked: !!unlockedWallet,
      });
    })();
    return true;
  }

  // Clear wallet (for debugging/recovery)
  if (msg?.type === "CLEAR_WALLET") {
    (async () => {
      await chrome.storage.local.remove(["encryptedWallet"]);
      unlockedWallet = null;
      unlockedSigner = null;
      console.log("[vizor] Wallet data cleared");
      sendResponse({ ok: true });
    })();
    return true;
  }

  // Create wallet
  if (msg?.type === "CREATE_WALLET") {
    (async () => {
      try {
        const keypair = generateKeypair();
        const encrypted = await encryptPrivateKey(keypair.secretKey, msg.password);

        await chrome.storage.local.set({ encryptedWallet: encrypted });

        // Auto-unlock after creation
        unlockedWallet = keypair;
        unlockedSigner = await svm.createSignerFromBase58(
          bs58.encode(keypair.secretKey)
        );

        console.log("[vizor] Wallet created:", keypair.publicKey.toBase58());
        sendResponse({ ok: true });
      } catch (error: any) {
        console.error("[vizor] Wallet creation failed:", error);
        sendResponse({ ok: false, error: error.message });
      }
    })();
    return true;
  }

  // Unlock wallet
  if (msg?.type === "UNLOCK_WALLET") {
    (async () => {
      try {
        const { encryptedWallet } = await chrome.storage.local.get(["encryptedWallet"]);

        if (!encryptedWallet) {
          console.log("[vizor] No encrypted wallet found in storage");
          sendResponse({ ok: false, error: "No wallet found" });
          return;
        }

        console.log("[vizor] Attempting to decrypt wallet...");
        const decrypted = await decryptPrivateKey(encryptedWallet, msg.password);

        if (!decrypted) {
          console.log("[vizor] Decryption returned null (incorrect password)");
          sendResponse({ ok: false, error: "Incorrect password" });
          return;
        }

        console.log("[vizor] Wallet decrypted successfully, creating keypair...");
        unlockedWallet = Keypair.fromSecretKey(decrypted);
        
        console.log("[vizor] Creating signer...");
        unlockedSigner = await svm.createSignerFromBase58(bs58.encode(decrypted));

        console.log("[vizor] Wallet unlocked:", unlockedWallet.publicKey.toBase58());
        sendResponse({ ok: true });
      } catch (error: any) {
        console.error("[vizor] Unlock failed with exception:", error.message || error);
        sendResponse({ ok: false, error: error.message || "Failed to unlock wallet" });
      }
    })();
    return true;
  }

  // Lock wallet
  if (msg?.type === "LOCK_WALLET") {
    unlockedWallet = null;
    unlockedSigner = null;
    console.log("[vizor] Wallet locked");
    sendResponse({ ok: true });
    return true;
  }

  // Get wallet info
  if (msg?.type === "GET_WALLET_INFO") {
    if (!unlockedWallet) {
      sendResponse({ ok: false, error: "Wallet locked" });
      return true;
    }

    sendResponse({
      ok: true,
      address: unlockedWallet.publicKey.toBase58(),
    });
    return true;
  }

  // Export private key
  if (msg?.type === "EXPORT_PRIVATE_KEY") {
    (async () => {
      try {
        const { encryptedWallet } = await chrome.storage.local.get(["encryptedWallet"]);

        if (!encryptedWallet) {
          sendResponse({ ok: false, error: "No wallet found" });
          return;
        }

        const decrypted = await decryptPrivateKey(encryptedWallet, msg.password);

        if (!decrypted) {
          sendResponse({ ok: false, error: "Incorrect password" });
          return;
        }

        sendResponse({
          ok: true,
          privateKey: bs58.encode(decrypted),
        });
      } catch (error: any) {
        sendResponse({ ok: false, error: error.message });
      }
    })();
    return true;
  }

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
