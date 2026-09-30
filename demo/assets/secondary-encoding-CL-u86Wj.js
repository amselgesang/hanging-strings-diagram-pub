import"./labelContrast-BR8LLLbA.js";import"./gallerySkin-CWX64URX.js";import{l as e,n as t,o as n,r,s as i,u as a}from"./thumbBackdrop-DQPvKFBk.js";import{t as o}from"./facade-DWAPskpp.js";var{controls:s,chart:c,note:l}=n({title:`2nd metric encodings`,intro:`How the secondary value shows up — none, knob size, or heat-map color. Quipu has its own page.`}),u=o(c,{categories:e,groups:a,secondaryEncoding:`knob`,backdrop:t(`secondary-encoding`)});r(u);var d=document.createElement(`div`);d.className=`control-group`,d.innerHTML=`<label class="title" for="secondary-encoding">Encoding</label>`;var f=document.createElement(`select`);f.id=`secondary-encoding`,f.innerHTML=`
  <option value="none">None</option>
  <option value="knob" selected>Knob size (D7)</option>
  <option value="heat">Heat-map (D8)</option>
`,d.appendChild(f),s.appendChild(d);var p=document.createElement(`div`);p.className=`control-group`,p.style.display=`none`,p.innerHTML=`<label class="title">Heat-map scale</label>
  <div class="heat-ramp">
    <span data-heat-min></span>
    <div class="heat-ramp-bar"></div>
    <span data-heat-max></span>
  </div>`,s.appendChild(p);var m=p.querySelector(`[data-heat-min]`),h=p.querySelector(`[data-heat-max]`),g=i(s,u,a);function _(){let t=f.value===`heat`;if(p.style.display=t?``:`none`,g.classList.toggle(`heatmap-dimmed`,t),t){let t=e.map(e=>e.secondaryValue).filter(e=>typeof e==`number`);m.textContent=t.length?String(Math.min(...t)):`0`,h.textContent=t.length?String(Math.max(...t)):`1`}}f.addEventListener(`change`,()=>{u.setSecondaryEncoding(f.value),_()}),_(),l.hidden=!1,l.textContent=`For knotted khipu digits, open the Quipu knots feature page.`;