import"./gallerySkin-CBgnk6Dj.js";import{s,m as t,c as u,t as i,e as d,d as l,a as c}from"./thumbBackdrop-D5n2xDeV.js";const a=s,g=[{id:"q-one",name:"Figure-eight (1)",groupId:"sales",value:72,secondaryValue:1},{id:"q-four",name:"Long knot (4)",groupId:"sales",value:58,secondaryValue:4},{id:"q-seven",name:"Long knot (7)",groupId:"product",value:81,secondaryValue:7},{id:"q-nine",name:"Long knot (9)",groupId:"product",value:45,secondaryValue:9},{id:"q-tens",name:"Tens + units (24)",groupId:"support",value:66,secondaryValue:24},{id:"q-hundreds",name:"Hundreds (105)",groupId:"finance",value:90,secondaryValue:105},{id:"q-neg",name:"Negative (−3)",groupId:"product",value:40,secondaryValue:-3},{id:"q-zero-band",name:"Bare tens (203)",groupId:"sales",value:55,secondaryValue:203},{id:"q-parent",name:"With children (8)",groupId:"sales",value:88,secondaryValue:8,children:[{id:"q-child-a",name:"Child A",groupId:"sales",value:30,secondaryValue:2},{id:"q-child-b",name:"Child B",groupId:"sales",value:28,secondaryValue:5}]}],p="https://ancienthistoryx.com/quipu-incas-ancient-knotted-codex/",{controls:r,chart:m,root:h}=t({title:"Quipu knots",intro:"The 2nd metric as khipu numbers on each cord — read bottom-up from the knob (units nearest the free end)."}),e=document.createElement("aside");e.className="demo-quipu-legend";e.innerHTML=`
  <h2>How to read</h2>
  <ul>
    <li><strong>Figure-eight</strong> = 1 (units)</li>
    <li><strong>Long knot</strong> wraps = 2–9 (units)</li>
    <li><strong>Bead clusters</strong> = tens / hundreds digits</li>
    <li><strong>Bare band</strong> = 0</li>
    <li><strong>Every 5th</strong> knot from the bottom is bigger</li>
    <li>Too-short cords → one cluster captioned <strong>×N</strong></li>
  </ul>
  <p class="demo-quipu-ref">
    Historical context:
    <a href="${p}" target="_blank" rel="noopener noreferrer">
      Quipu: Incas Ancient Knotted Codex
    </a>
  </p>
`;var n;(n=h.querySelector(".demo-header"))==null||n.after(e);const o=u(m,{categories:g,groups:a,secondaryEncoding:"quipu",showTicks:!1,backdrop:i("quipu")});d(o);l(r,o,"straight");c(r,o,a);
