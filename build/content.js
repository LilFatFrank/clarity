console.log("[vizor] content script loaded on",location.href);const f=`
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
`;function x(){if(document.getElementById("vizor-style"))return;const e=document.createElement("style");e.id="vizor-style",e.textContent=f,document.documentElement.appendChild(e)}const v=(e=location.href)=>/:\/\/(?:www\.)?solscan\.io\/tx\//i.test(e);function h(e=location.href){try{const i=new URL(e).pathname.split("/").filter(Boolean),l=i.indexOf("tx");return l>=0&&i[l+1]?i[l+1]:null}catch{return null}}let o=null,s=null,t=null,c="",a=null,r=null;function g(){if(o)return;o=document.createElement("div"),o.className="vizor-popup vizor-hidden",o.innerHTML=`
    <div class="vizor-card">
      <div class="vizor-close" title="Close">×</div>
      <div class="vizor-body">Ready.</div>
    </div>
  `,document.documentElement.appendChild(o),s=o.querySelector(".vizor-body");const e=o.querySelector(".vizor-close");e.onclick=()=>o.classList.add("vizor-hidden"),document.addEventListener("keydown",n=>{n.key==="Escape"&&o&&!o.classList.contains("vizor-hidden")&&o.classList.add("vizor-hidden")})}function m(){g(),o.classList.remove("vizor-hidden")}function z(e="Explaining transaction…"){s&&(s.innerHTML=`
    <div class="vizor-loading">
      <div class="vizor-spinner"></div>
      <div>${e}</div>
    </div>
  `)}function d(e){s&&(s.textContent=e)}function b(){if(t)return;x(),t=document.createElement("img"),t.id="vizor-btn",t.className="vizor-floating",t.src=chrome.runtime.getURL("icons/vizor-icon-128.png"),t.alt="Explain TX",t.tabIndex=0,document.documentElement.appendChild(t);const e=()=>{const n=h();if(m(),!n){d("No signature detected on this page.");return}w(n)};t.onclick=e}function y(){t&&(t.remove(),t=null)}function p(){a=null,r=null}function u(e){if(e===c)return;c=e,v(e)?b():(y(),p(),o&&!o.classList.contains("vizor-hidden")&&o.classList.add("vizor-hidden"))}function w(e){if(a===e&&r){d(r);return}a!==e&&(p(),a=e),z();const n=Intl.DateTimeFormat().resolvedOptions().timeZone;chrome.runtime.sendMessage({type:"EXPLAIN_TX",signature:e,tz:n},i=>{if(!i?.ok){r=null,d(i?.error||"Failed to explain.");return}r=i.text,d(i.text)})}u(location.href);chrome.runtime.onMessage.addListener(e=>{e?.type==="URL_CHANGED"&&u(e.url||location.href)});
