// popup.ts
import { Connection, PublicKey } from "@solana/web3.js";

const RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

// USDC mint address on Solana mainnet
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

// UI Elements
const loading = document.getElementById("loading")!;
const createWalletView = document.getElementById("create-wallet")!;
const unlockWalletView = document.getElementById("unlock-wallet")!;
const dashboardView = document.getElementById("wallet-dashboard")!;

// Initialize
async function init() {
  const { hasWallet, isUnlocked } = await chrome.runtime.sendMessage({
    type: "CHECK_WALLET_STATUS",
  });

  if (!hasWallet) {
    showView("create");
  } else if (!isUnlocked) {
    showView("unlock");
  } else {
    showView("dashboard");
    loadWalletData();
  }
}

function showView(view: "create" | "unlock" | "dashboard") {
  loading.classList.add("hidden");
  createWalletView.classList.add("hidden");
  unlockWalletView.classList.add("hidden");
  dashboardView.classList.add("hidden");

  if (view === "create") createWalletView.classList.remove("hidden");
  else if (view === "unlock") unlockWalletView.classList.remove("hidden");
  else if (view === "dashboard") dashboardView.classList.remove("hidden");
}

// Create Wallet
document.getElementById("create-btn")!.addEventListener("click", async () => {
  const password = (document.getElementById("new-password") as HTMLInputElement).value;
  const confirm = (document.getElementById("confirm-password") as HTMLInputElement).value;
  const errorEl = document.getElementById("create-error")!;

  errorEl.classList.add("hidden");

  if (password.length < 6) {
    errorEl.textContent = "Password must be at least 6 characters";
    errorEl.classList.remove("hidden");
    return;
  }

  if (password !== confirm) {
    errorEl.textContent = "Passwords don't match";
    errorEl.classList.remove("hidden");
    return;
  }

  const btn = document.getElementById("create-btn") as HTMLButtonElement;
  btn.disabled = true;
  btn.textContent = "Creating...";

  const result = await chrome.runtime.sendMessage({
    type: "CREATE_WALLET",
    password,
  });

  if (result.ok) {
    showView("dashboard");
    loadWalletData();
  } else {
    errorEl.textContent = result.error || "Failed to create wallet";
    errorEl.classList.remove("hidden");
    btn.disabled = false;
    btn.textContent = "Create Wallet";
  }
});

// Unlock Wallet
document.getElementById("unlock-btn")!.addEventListener("click", async () => {
  const password = (document.getElementById("unlock-password") as HTMLInputElement).value;
  const errorEl = document.getElementById("unlock-error")!;

  errorEl.classList.add("hidden");

  const btn = document.getElementById("unlock-btn") as HTMLButtonElement;
  btn.disabled = true;
  btn.textContent = "Unlocking...";

  const result = await chrome.runtime.sendMessage({
    type: "UNLOCK_WALLET",
    password,
  });

  if (result.ok) {
    showView("dashboard");
    loadWalletData();
  } else {
    errorEl.textContent = "Incorrect password";
    errorEl.classList.remove("hidden");
    btn.disabled = false;
    btn.textContent = "Unlock";
  }
});

// Load Wallet Data
async function loadWalletData() {
  const result = await chrome.runtime.sendMessage({ type: "GET_WALLET_INFO" });

  if (result.ok && result.address) {
    // Display address
    const addressEl = document.getElementById("wallet-address")!;
    addressEl.textContent = `${result.address.slice(0, 8)}...${result.address.slice(-8)}`;

    // Fetch USDC balance
    try {
      const connection = new Connection(RPC_URL, "confirmed");
      const publicKey = new PublicKey(result.address);
      
      // Get USDC token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        mint: USDC_MINT,
      });

      let usdcBalance = 0;
      if (tokenAccounts.value.length > 0) {
        const usdcAccount = tokenAccounts.value[0].account.data.parsed.info;
        usdcBalance = usdcAccount.tokenAmount.uiAmount || 0;
      }

      document.getElementById("balance")!.textContent = `${usdcBalance.toFixed(2)} USDC`;
      document.getElementById("balance-usd")!.textContent = `≈ $${usdcBalance.toFixed(2)}`;
      
      // Show warning if balance is low
      if (usdcBalance < 0.01) {
        document.getElementById("balance")!.style.color = "#dc3545";
      }
    } catch (error) {
      console.error("[vizor] Failed to fetch USDC balance:", error);
      document.getElementById("balance")!.textContent = "Error loading balance";
    }
  }
}

// Copy Address
document.getElementById("copy-address-btn")!.addEventListener("click", async () => {
  const result = await chrome.runtime.sendMessage({ type: "GET_WALLET_INFO" });
  
  if (result.ok && result.address) {
    await navigator.clipboard.writeText(result.address);
    const btn = document.getElementById("copy-address-btn") as HTMLButtonElement;
    const originalText = btn.textContent;
    btn.textContent = "✓ Copied!";
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  }
});

// Export Private Key - Show inline prompt
document.getElementById("export-key-btn")!.addEventListener("click", async () => {
  showExportKeyPrompt();
});

function showExportKeyPrompt() {
  const dashboardView = document.getElementById("wallet-dashboard")!;
  
  // Create overlay
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;
  
  overlay.innerHTML = `
    <div style="background: white; padding: 20px; border-radius: 12px; width: 300px; box-shadow: 0 4px 16px rgba(0,0,0,0.2);">
      <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #1a1a1a;">Export Private Key</h3>
      <p style="margin: 0 0 16px 0; font-size: 13px; color: #666;">Enter your password to view your private key</p>
      
      <input type="password" id="export-password" placeholder="Password" style="
        width: 100%;
        padding: 10px;
        border: 2px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        margin-bottom: 12px;
        box-sizing: border-box;
      " />
      
      <div id="export-error" style="color: #dc3545; font-size: 12px; margin-bottom: 12px; display: none;"></div>
      
      <div style="display: flex; gap: 8px;">
        <button id="export-cancel-btn" style="
          flex: 1;
          padding: 10px;
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        ">Cancel</button>
        <button id="export-confirm-btn" style="
          flex: 1;
          padding: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        ">Export</button>
      </div>
    </div>
  `;
  
  dashboardView.style.position = "relative";
  dashboardView.appendChild(overlay);
  
  const passwordInput = overlay.querySelector("#export-password") as HTMLInputElement;
  const errorEl = overlay.querySelector("#export-error") as HTMLDivElement;
  const cancelBtn = overlay.querySelector("#export-cancel-btn") as HTMLButtonElement;
  const confirmBtn = overlay.querySelector("#export-confirm-btn") as HTMLButtonElement;
  
  // Focus input
  setTimeout(() => passwordInput.focus(), 100);
  
  // Cancel
  cancelBtn.onclick = () => overlay.remove();
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };
  
  // Confirm
  const doExport = async () => {
    const password = passwordInput.value;
    if (!password) return;
    
    errorEl.style.display = "none";
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Exporting...";
    
    const result = await chrome.runtime.sendMessage({
      type: "EXPORT_PRIVATE_KEY",
      password,
    });
    
    if (result.ok && result.privateKey) {
      overlay.remove();
      showPrivateKeyDisplay(result.privateKey);
    } else {
      errorEl.textContent = "Incorrect password";
      errorEl.style.display = "block";
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Export";
    }
  };
  
  confirmBtn.onclick = doExport;
  passwordInput.onkeydown = (e) => {
    if (e.key === "Enter") doExport();
  };
}

function showPrivateKeyDisplay(privateKey: string) {
  const dashboardView = document.getElementById("wallet-dashboard")!;
  
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
  `;
  
  overlay.innerHTML = `
    <div style="background: white; padding: 20px; border-radius: 12px; max-width: 320px; box-shadow: 0 4px 16px rgba(0,0,0,0.2);">
      <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #1a1a1a;">⚠️ Your Private Key</h3>
      <p style="margin: 0 0 12px 0; font-size: 12px; color: #dc3545; font-weight: 600;">
        NEVER share this with anyone! Anyone with this key can access your funds.
      </p>
      
      <div style="
        background: #f8f9fa;
        padding: 12px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 11px;
        word-break: break-all;
        margin-bottom: 12px;
        max-height: 200px;
        overflow-y: auto;
      ">${privateKey}</div>
      
      <button id="copy-key-btn" style="
        width: 100%;
        padding: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        margin-bottom: 8px;
      ">📋 Copy to Clipboard</button>
      
      <button id="close-key-btn" style="
        width: 100%;
        padding: 10px;
        background: white;
        color: #667eea;
        border: 2px solid #667eea;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
      ">Close</button>
      
      <p style="margin: 12px 0 0 0; font-size: 11px; color: #666; line-height: 1.4;">
        💾 Save this key in a secure location (password manager, encrypted file, etc.)
      </p>
    </div>
  `;
  
  dashboardView.appendChild(overlay);
  
  const copyBtn = overlay.querySelector("#copy-key-btn") as HTMLButtonElement;
  const closeBtn = overlay.querySelector("#close-key-btn") as HTMLButtonElement;
  
  copyBtn.onclick = async () => {
    await navigator.clipboard.writeText(privateKey);
    copyBtn.textContent = "✓ Copied!";
    setTimeout(() => {
      copyBtn.textContent = "📋 Copy to Clipboard";
    }, 2000);
  };
  
  closeBtn.onclick = () => overlay.remove();
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };
}

// Lock Wallet
document.getElementById("lock-btn")!.addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "LOCK_WALLET" });
  showView("unlock");
});

// Start
init();

