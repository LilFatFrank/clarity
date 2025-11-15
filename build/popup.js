import{aH as y,aG as x}from"./assets/index.browser.esm-BdHCRyEa.js";const b="https://mainnet.helius-rpc.com/?api-key=d94f96c1-6be8-42be-90c4-311dec83c9f7",g=new y("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),h=document.getElementById("loading"),p=document.getElementById("create-wallet"),u=document.getElementById("unlock-wallet"),m=document.getElementById("wallet-dashboard");async function w(){const{hasWallet:n,isUnlocked:t}=await chrome.runtime.sendMessage({type:"CHECK_WALLET_STATUS"});n?t?(a("dashboard"),l()):a("unlock"):a("create")}function a(n){h.classList.add("hidden"),p.classList.add("hidden"),u.classList.add("hidden"),m.classList.add("hidden"),n==="create"?p.classList.remove("hidden"):n==="unlock"?u.classList.remove("hidden"):n==="dashboard"&&m.classList.remove("hidden")}document.getElementById("create-btn").addEventListener("click",async()=>{const n=document.getElementById("new-password").value,t=document.getElementById("confirm-password").value,e=document.getElementById("create-error");if(e.classList.add("hidden"),n.length<6){e.textContent="Password must be at least 6 characters",e.classList.remove("hidden");return}if(n!==t){e.textContent="Passwords don't match",e.classList.remove("hidden");return}const o=document.getElementById("create-btn");o.disabled=!0,o.textContent="Creating...";const d=await chrome.runtime.sendMessage({type:"CREATE_WALLET",password:n});d.ok?(a("dashboard"),l()):(e.textContent=d.error||"Failed to create wallet",e.classList.remove("hidden"),o.disabled=!1,o.textContent="Create Wallet")});document.getElementById("unlock-btn").addEventListener("click",async()=>{const n=document.getElementById("unlock-password").value,t=document.getElementById("unlock-error");t.classList.add("hidden");const e=document.getElementById("unlock-btn");e.disabled=!0,e.textContent="Unlocking...",(await chrome.runtime.sendMessage({type:"UNLOCK_WALLET",password:n})).ok?(a("dashboard"),l()):(t.textContent="Incorrect password",t.classList.remove("hidden"),e.disabled=!1,e.textContent="Unlock")});async function l(){const n=await chrome.runtime.sendMessage({type:"GET_WALLET_INFO"});if(n.ok&&n.address){const t=document.getElementById("wallet-address");t.textContent=`${n.address.slice(0,8)}...${n.address.slice(-8)}`;try{const e=new x(b,"confirmed"),o=new y(n.address),d=await e.getParsedTokenAccountsByOwner(o,{mint:g});let s=0;d.value.length>0&&(s=d.value[0].account.data.parsed.info.tokenAmount.uiAmount||0),document.getElementById("balance").textContent=`${s.toFixed(2)} USDC`,document.getElementById("balance-usd").textContent=`≈ $${s.toFixed(2)}`,s<.01&&(document.getElementById("balance").style.color="#dc3545")}catch(e){console.error("[vizor] Failed to fetch USDC balance:",e),document.getElementById("balance").textContent="Error loading balance"}}}document.getElementById("copy-address-btn").addEventListener("click",async()=>{const n=await chrome.runtime.sendMessage({type:"GET_WALLET_INFO"});if(n.ok&&n.address){await navigator.clipboard.writeText(n.address);const t=document.getElementById("copy-address-btn"),e=t.textContent;t.textContent="✓ Copied!",setTimeout(()=>{t.textContent=e},2e3)}});document.getElementById("export-key-btn").addEventListener("click",async()=>{f()});function f(){const n=document.getElementById("wallet-dashboard"),t=document.createElement("div");t.style.cssText=`
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
  `,t.innerHTML=`
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
  `,n.style.position="relative",n.appendChild(t);const e=t.querySelector("#export-password"),o=t.querySelector("#export-error"),d=t.querySelector("#export-cancel-btn"),s=t.querySelector("#export-confirm-btn");setTimeout(()=>e.focus(),100),d.onclick=()=>t.remove(),t.onclick=r=>{r.target===t&&t.remove()};const i=async()=>{const r=e.value;if(!r)return;o.style.display="none",s.disabled=!0,s.textContent="Exporting...";const c=await chrome.runtime.sendMessage({type:"EXPORT_PRIVATE_KEY",password:r});c.ok&&c.privateKey?(t.remove(),E(c.privateKey)):(o.textContent="Incorrect password",o.style.display="block",s.disabled=!1,s.textContent="Export")};s.onclick=i,e.onkeydown=r=>{r.key==="Enter"&&i()}}function E(n){const t=document.getElementById("wallet-dashboard"),e=document.createElement("div");e.style.cssText=`
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
  `,e.innerHTML=`
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
      ">${n}</div>
      
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
  `,t.appendChild(e);const o=e.querySelector("#copy-key-btn"),d=e.querySelector("#close-key-btn");o.onclick=async()=>{await navigator.clipboard.writeText(n),o.textContent="✓ Copied!",setTimeout(()=>{o.textContent="📋 Copy to Clipboard"},2e3)},d.onclick=()=>e.remove(),e.onclick=s=>{s.target===e&&e.remove()}}document.getElementById("lock-btn").addEventListener("click",async()=>{await chrome.runtime.sendMessage({type:"LOCK_WALLET"}),a("unlock")});w();
