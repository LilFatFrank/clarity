console.log("[vizor] content script loaded on",location.href);const v=`
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
`;function g(){if(document.getElementById("vizor-style"))return;const e=document.createElement("style");e.id="vizor-style",e.textContent=v,document.documentElement.appendChild(e)}const h=(e=location.href)=>/:\/\/(?:www\.)?solscan\.io\/tx\//i.test(e);function m(e=location.href){try{const r=new URL(e).pathname.split("/").filter(Boolean),p=r.indexOf("tx");return p>=0&&r[p+1]?r[p+1]:null}catch{return null}}let t=null,o=null,a=null,n=null,u="",l=null,s=null;function y(){if(t)return;o=document.createElement("div"),o.className="vizor-overlay",o.style.cssText=`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.1);
    z-index: 2147483646;
    opacity: 0;
    pointer-events: none;
  `,document.documentElement.appendChild(o),t=document.createElement("div"),t.className="vizor-popup",t.style.cssText=`
    position: fixed;
    right: 18px;
    bottom: 70px;
    z-index: 2147483647;
    opacity: 0;
    pointer-events: none;
  `,t.innerHTML=`
    <div class="vizor-card">
      <div class="vizor-close" title="Close">×</div>
      <div class="vizor-body">Ready.</div>
    </div>
  `,document.documentElement.appendChild(t),a=t.querySelector(".vizor-body");const e=t.querySelector(".vizor-close");e.onclick=()=>d(),o.onclick=()=>d(),document.addEventListener("keydown",i=>{i.key==="Escape"&&t&&t.style.opacity!=="0"&&d()})}function b(){y(),o.style.opacity="1",o.style.pointerEvents="auto",t.style.opacity="1",t.style.pointerEvents="auto"}function d(){o&&(o.style.opacity="0",o.style.pointerEvents="none"),t&&(t.style.opacity="0",t.style.pointerEvents="none")}function z(e="Explaining transaction…"){a&&(a.innerHTML=`
    <div class="vizor-loading">
      <div class="vizor-spinner"></div>
      <div>${e}</div>
    </div>
  `)}function c(e){a&&(a.textContent=e)}function w(){if(n)return;g(),n=document.createElement("img"),n.id="vizor-btn",n.className="vizor-floating",n.src=chrome.runtime.getURL("icons/vizor-logo.png"),n.alt="Explain TX",n.tabIndex=0,document.documentElement.appendChild(n);const e=()=>{const i=m();if(b(),!i){c("No signature detected on this page.");return}T(i)};n.onclick=e}function E(){n&&(n.remove(),n=null),o&&(o.remove(),o=null),t&&(t.remove(),t=null)}function x(){l=null,s=null}function f(e){if(e===u)return;u=e,h(e)?w():(E(),x(),t&&!t.classList.contains("vizor-hidden")&&d())}function T(e){if(l===e&&s){c(s);return}l!==e&&(x(),l=e),z();const i=Intl.DateTimeFormat().resolvedOptions().timeZone;chrome.runtime.sendMessage({type:"EXPLAIN_TX",signature:e,tz:i},r=>{if(!r?.ok){s=null,c(r?.error||"Failed to explain.");return}s=r.text,c(r.text)})}f(location.href);chrome.runtime.onMessage.addListener(e=>{e?.type==="URL_CHANGED"&&f(e.url||location.href)});
