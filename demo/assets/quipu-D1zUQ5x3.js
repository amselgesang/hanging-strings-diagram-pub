import"./labelContrast-BR8LLLbA.js";import"./gallerySkin-CWX64URX.js";import{c as e,n as t,o as n,r,s as i,u as a}from"./thumbBackdrop-DQPvKFBk.js";import{t as o}from"./facade-DWAPskpp.js";var s=a,c=[{id:`q-one`,name:`Figure-eight (1)`,groupId:`sales`,value:72,secondaryValue:1},{id:`q-four`,name:`Long knot (4)`,groupId:`sales`,value:58,secondaryValue:4},{id:`q-seven`,name:`Long knot (7)`,groupId:`product`,value:81,secondaryValue:7},{id:`q-nine`,name:`Long knot (9)`,groupId:`product`,value:45,secondaryValue:9},{id:`q-tens`,name:`Tens + units (24)`,groupId:`support`,value:66,secondaryValue:24},{id:`q-hundreds`,name:`Hundreds (105)`,groupId:`finance`,value:90,secondaryValue:105},{id:`q-neg`,name:`Negative (−3)`,groupId:`product`,value:40,secondaryValue:-3},{id:`q-zero-band`,name:`Bare tens (203)`,groupId:`sales`,value:55,secondaryValue:203},{id:`q-parent`,name:`With children (8)`,groupId:`sales`,value:88,secondaryValue:8,children:[{id:`q-child-a`,name:`Child A`,groupId:`sales`,value:30,secondaryValue:2},{id:`q-child-b`,name:`Child B`,groupId:`sales`,value:28,secondaryValue:5}]}],l=`https://ancienthistoryx.com/quipu-incas-ancient-knotted-codex/`,{controls:u,chart:d,root:f}=n({title:`Quipu knots`,intro:`The 2nd metric as khipu numbers on each cord — read bottom-up from the knob (units nearest the free end).`}),p=document.createElement(`aside`);p.className=`demo-quipu-legend`,p.innerHTML=`
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
    <a href="${l}" target="_blank" rel="noopener noreferrer">
      Quipu: Incas Ancient Knotted Codex
    </a>
  </p>
`,f.querySelector(`.demo-header`)?.after(p);var m=o(d,{categories:c,groups:s,secondaryEncoding:`quipu`,showTicks:!1,backdrop:t(`quipu`)});r(m),e(u,m,`straight`),i(u,m,s);