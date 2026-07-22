import"./gallerySkin-B45H45tQ.js";import{m as u,c as d,e as h,a as b,t as g,s as c,b as p}from"./thumbBackdrop-DwklJQZl.js";const{controls:l,chart:v,note:r}=u({title:"Backdrop clothes",intro:"The sheet behind the hanging strings — plain white, tablecloth weave, or Bavarian check. Pick a cloth to see how the scene reads against it."}),i=g("backdrop-clothes"),n=d(v,{categories:p,groups:c,backdrop:i,secondaryEncoding:"none"});h(n);const a=document.createElement("div");a.className="control-group";a.innerHTML=`<label class="title">Cloth</label>
  <div class="segmented" data-cloth>
    <button type="button" data-value="off">Off</button>
    <button type="button" data-value="plain">White sheet</button>
    <button type="button" data-value="tablecloth">Tablecloth</button>
    <button type="button" data-value="bavarian">Bavarian check</button>
  </div>`;l.appendChild(a);const o=a.querySelector("[data-cloth]");for(const e of o.querySelectorAll("button"))e.classList.toggle("active",e.getAttribute("data-value")===i);o.addEventListener("click",e=>{const t=e.target.closest("button");if(t!=null&&t.dataset.value){n.setBackdrop(t.dataset.value);for(const s of o.querySelectorAll("button"))s.classList.toggle("active",s===t)}});b(l,n,c);r.hidden=!1;r.textContent="Cloth choice is independent of the breeze wind toggle on the chart (D21.8). Try Bavarian check for a strong pattern read.";
