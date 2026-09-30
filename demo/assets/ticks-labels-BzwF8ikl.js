import"./labelContrast-BR8LLLbA.js";import"./gallerySkin-CWX64URX.js";import{l as e,n as t,o as n,r,s as i,u as a}from"./thumbBackdrop-DQPvKFBk.js";import{t as o}from"./facade-DWAPskpp.js";var{controls:s,chart:c,note:l}=n({title:`Bead ticks & labels`,intro:`Scale knots along the cord (D6) and optional value captions on the labels.`}),u=o(c,{categories:e,groups:a,secondaryEncoding:`none`,showTicks:!0,labelValues:!0,tickTarget:8,backdrop:t(`ticks-labels`)});r(u);var d=document.createElement(`div`);d.className=`control-group`,d.innerHTML=`<label class="title">Scale reference</label>
  <div class="checkbox-row">
    <input type="checkbox" id="show-ticks" checked />
    <label for="show-ticks">Show thread knots (D6)</label>
  </div>`,s.appendChild(d),d.querySelector(`#show-ticks`).addEventListener(`change`,e=>{u.setOptions({showTicks:e.target.checked})});var f=document.createElement(`div`);f.className=`control-group`,f.innerHTML=`<label class="title">Labels</label>
  <div class="checkbox-row">
    <input type="checkbox" id="label-values" checked />
    <label for="label-values">Show value on 2nd line</label>
  </div>`,s.appendChild(f),f.querySelector(`#label-values`).addEventListener(`change`,e=>{u.setOptions({labelValues:e.target.checked})});var p=document.createElement(`div`);p.className=`control-group`,p.innerHTML=`<label class="title" for="tick-granularity-dial">Knot granularity</label>
  <div class="slider-row">
    <span class="slider-end-label">Coarse</span>
    <input type="range" id="tick-granularity-dial" min="2" max="10" value="8" step="1" />
    <span class="slider-end-label">Fine</span>
  </div>`,s.appendChild(p),p.querySelector(`#tick-granularity-dial`).addEventListener(`input`,e=>{u.setOptions({tickTarget:Number(e.target.value)})}),i(s,u,a),l.hidden=!1,l.textContent=`Quipu mode hides D6 bead-ticks while active — use this page to inspect ticks alone.`;