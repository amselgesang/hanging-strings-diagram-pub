import"./gallerySkin-CBgnk6Dj.js";import{m as l,c,s,b as d,t as p,e as u,d as h,a as g}from"./thumbBackdrop-DnUTYqJk.js";const{controls:i,chart:y,note:a}=l({title:"Sonification — the strings sing",intro:"Every cord is a string instrument: pitch is its length (a real string's frequency is inversely proportional to length — longer = lower), plucked with Karplus-Strong synthesis, panned to its place on the rail. Press Play and hear the chart's contour left to right."}),e=c(y,{categories:d,groups:s,sonification:!0,backdrop:p("sonification")});u(e);const o=document.createElement("div");o.className="control-group";o.innerHTML=`<label class="title">Sound (D31)</label>
  <div class="row" style="display:flex; gap:8px">
    <button class="reset-btn" id="sonify-play">▶ Play the chart</button>
    <button class="reset-btn" id="sonify-stop">■ Stop</button>
  </div>`;i.appendChild(o);const n=o.querySelector("#sonify-play");n.addEventListener("click",()=>{n.disabled=!0,e.play().finally(()=>{n.disabled=!1})});o.querySelector("#sonify-stop").addEventListener("click",()=>{e.stop(),n.disabled=!1});const t=document.createElement("div");t.className="control-group";t.innerHTML=`<label class="title">Pitch direction (Q33)</label>
  <div class="checkbox-row"><label>
    <input type="radio" name="sonify-dir" value="physical" checked /> longer = lower (physical)
  </label></div>
  <div class="checkbox-row"><label>
    <input type="radio" name="sonify-dir" value="convention" /> bigger = higher (convention)
  </label></div>`;i.appendChild(t);t.addEventListener("change",()=>{const r=t.querySelector('input[name="sonify-dir"]:checked').value;e.setSonification({pitchDirection:r})});h(i,e,"straight");g(i,e,s);a.hidden=!1;a.textContent="D31 defaults: pentatonic over two octaves from A2 (quantized rungs, never a sour interval), Karplus-Strong plucks, stereo pan follows x, 150 ms per string. Slide or reorder cords, then Play again — the melody follows the layout. Audio is opt-in per instance and only ever starts from a click.";
