import"./gallerySkin-CBgnk6Dj.js";import{m as d,c as p,s as a,b as h,e as u,a as m,t as f}from"./thumbBackdrop-D5n2xDeV.js";const i=.15,{controls:n,chart:g,note:r}=d({title:"Breeze",intro:"Wind stirring the hanging cords — with or without a sheet. Use the wind icon on the chart to start or stop the breeze."}),l=f("breeze"),t=p(g,{categories:h,groups:a,backdrop:l,secondaryEncoding:"none",stiffness:i});u(t);const o=document.createElement("div");o.className="control-group";o.innerHTML='<label class="title" for="backdrop-select">Sheet (optional)</label>';const e=document.createElement("select");e.id="backdrop-select";e.innerHTML=`
  <option value="off">Off</option>
  <option value="plain">White sheet</option>
  <option value="tablecloth">Tablecloth</option>
  <option value="bavarian">Bavarian check</option>
`;e.value=l;o.appendChild(e);n.appendChild(o);e.addEventListener("change",()=>{t.setBackdrop(e.value)});const s=document.createElement("div");s.className="control-group";s.innerHTML=`<label class="title" for="stiffness-slider">String flexibility (D10)</label>
  <div class="slider-row">
    <span class="slider-end-label">Flexible</span>
    <input type="range" id="stiffness-slider" min="0" max="100" value="${Math.round(i*100)}" step="1" />
    <span class="slider-end-label">Rigid</span>
  </div>`;n.appendChild(s);s.querySelector("#stiffness-slider").addEventListener("input",c=>{t.setOptions({stiffness:Number(c.target.value)/100})});m(n,t,a);r.hidden=!1;r.textContent="Breeze works with the sheet off — the wind toggle controls cord sway. Softer strings bow more in the wind. Cloth patterns alone: Backdrop clothes.";
