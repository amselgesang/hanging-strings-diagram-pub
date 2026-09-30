import"./labelContrast-BR8LLLbA.js";import"./gallerySkin-CWX64URX.js";import{l as e,n as t,o as n,r,s as i,u as a}from"./thumbBackdrop-DQPvKFBk.js";import{t as o}from"./facade-DWAPskpp.js";var s=.15,{controls:c,chart:l,note:u}=n({title:`Breeze`,intro:`Wind stirring the hanging cords — with or without a sheet. Use the wind icon on the chart to start or stop the breeze.`}),d=t(`breeze`),f=o(l,{categories:e,groups:a,backdrop:d,secondaryEncoding:`none`,stiffness:s});r(f);var p=document.createElement(`div`);p.className=`control-group`,p.innerHTML=`<label class="title" for="backdrop-select">Sheet (optional)</label>`;var m=document.createElement(`select`);m.id=`backdrop-select`,m.innerHTML=`
  <option value="off">Off</option>
  <option value="plain">White sheet</option>
  <option value="tablecloth">Tablecloth</option>
  <option value="bavarian">Bavarian check</option>
`,m.value=d,p.appendChild(m),c.appendChild(p),m.addEventListener(`change`,()=>{f.setBackdrop(m.value)});var h=document.createElement(`div`);h.className=`control-group`,h.innerHTML=`<label class="title" for="stiffness-slider">String flexibility (D10)</label>
  <div class="slider-row">
    <span class="slider-end-label">Flexible</span>
    <input type="range" id="stiffness-slider" min="0" max="100" value="${Math.round(s*100)}" step="1" />
    <span class="slider-end-label">Rigid</span>
  </div>`,c.appendChild(h),h.querySelector(`#stiffness-slider`).addEventListener(`input`,e=>{f.setOptions({stiffness:Number(e.target.value)/100})}),i(c,f,a),u.hidden=!1,u.textContent=`Breeze works with the sheet off — the wind toggle controls cord sway. Softer strings bow more in the wind. Cloth patterns alone: Backdrop clothes.`;