// base.js — minimal shared helpers used by pages
export function qs(sel, el=document){ return el.querySelector(sel); }
export function qsa(sel, el=document){ return [...el.querySelectorAll(sel)]; }

export const raf = (fn)=> requestAnimationFrame(fn);

export function onReady(fn){
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, {once:true});
  else fn();
}

// simple fade overlay control
export function mountFadeOverlay(){
  let overlay = document.getElementById("fadeOverlay");
  if(!overlay){
    overlay = document.createElement("div");
    overlay.id = "fadeOverlay";
    overlay.className = "fade-overlay";
    document.body.appendChild(overlay);
  }
  return overlay;
}