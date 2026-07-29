import"./gallerySkin-CBgnk6Dj.js";import{m,c as u,s as r,b as l,t as h,e as g,a as y}from"./thumbBackdrop-D5n2xDeV.js";const{controls:i,chart:v,note:d}=m({title:"2nd metric encodings",intro:"How the secondary value shows up — none, knob size, or heat-map color. Quipu has its own page."}),c=u(v,{categories:l,groups:r,secondaryEncoding:"knob",backdrop:h("secondary-encoding")});g(c);const a=document.createElement("div");a.className="control-group";a.innerHTML='<label class="title" for="secondary-encoding">Encoding</label>';const t=document.createElement("select");t.id="secondary-encoding";t.innerHTML=`
  <option value="none">None</option>
  <option value="knob" selected>Knob size (D7)</option>
  <option value="heat">Heat-map (D8)</option>
`;a.appendChild(t);i.appendChild(a);const e=document.createElement("div");e.className="control-group";e.style.display="none";e.innerHTML=`<label class="title">Heat-map scale</label>
  <div class="heat-ramp">
    <span data-heat-min></span>
    <div class="heat-ramp-bar"></div>
    <span data-heat-max></span>
  </div>`;i.appendChild(e);const b=e.querySelector("[data-heat-min]"),H=e.querySelector("[data-heat-max]"),f=y(i,c,r);function p(){const o=t.value==="heat";if(e.style.display=o?"":"none",f.classList.toggle("heatmap-dimmed",o),o){const n=l.map(s=>s.secondaryValue).filter(s=>typeof s=="number");b.textContent=n.length?String(Math.min(...n)):"0",H.textContent=n.length?String(Math.max(...n)):"1"}}t.addEventListener("change",()=>{c.setSecondaryEncoding(t.value),p()});p();d.hidden=!1;d.textContent="For knotted khipu digits, open the Quipu knots feature page.";
