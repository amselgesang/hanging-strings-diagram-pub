import"./gallerySkin-CBgnk6Dj.js";import{m as o,c as l,s as t,b as d,t as p,e as c,a as m}from"./thumbBackdrop-D5n2xDeV.js";const n=.12,{controls:i,chart:u,note:a}=o({title:"String physics",intro:"Drag the disc to spin it. Cords chase their hangers with momentum and inertia — they bend and whip instead of locking stiff to the plate."}),e=l(u,{categories:d,groups:t,theme:"studio",secondaryEncoding:"none",backdrop:p("physics"),stiffness:n});e.setRailMode("ring");c(e);const s=document.createElement("div");s.className="control-group";s.innerHTML=`<label class="title" for="stiffness-slider">String flexibility (D10)</label>
  <div class="slider-row">
    <span class="slider-end-label">Flexible</span>
    <input type="range" id="stiffness-slider" min="0" max="100" value="${Math.round(n*100)}" step="1" />
    <span class="slider-end-label">Rigid</span>
  </div>`;i.appendChild(s);s.querySelector("#stiffness-slider").addEventListener("input",r=>{e.setOptions({stiffness:Number(r.target.value)/100})});m(i,e,t);a.hidden=!1;a.textContent="Ring rail only, Studio theme, default kernmantle texture, no backdrop. Softer strings lag more when you spin.";
