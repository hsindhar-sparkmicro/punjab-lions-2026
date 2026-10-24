(function(){
const D=window.PL_DATA, STATIC=document.documentElement.classList.contains('static');
const GOLD='#FFC72C',AMBER='#F5B421',ORANGE='#E8833A',BRONZE='#6B4E16',GREYB='#4A4436',WHITE='#FFF6DC',GRID='rgba(255,230,170,.08)';
const gradH=c=>{const ch=c.chart,a=ch.chartArea;if(!a)return GOLD;const g=ch.ctx.createLinearGradient(a.left,0,a.right,0);g.addColorStop(0,'#FFD23F');g.addColorStop(.5,AMBER);g.addColorStop(1,ORANGE);return g};
const gradV=c=>{const ch=c.chart,a=ch.chartArea;if(!a)return GOLD;const g=ch.ctx.createLinearGradient(0,a.bottom,0,a.top);g.addColorStop(0,ORANGE);g.addColorStop(1,'#FFD23F');return g};
const $=s=>document.querySelector(s), el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const MOB=()=>innerWidth<760;const short=n=>MOB()?n.split(' ')[0]+(n.split(' ').length>1?' '+n.split(' ').slice(-1)[0][0]+'.':''):n.replace('Harsimranjit Singh Sindhar','Harsimranjit S. Sindhar').replace('Darshpreet Singh Sidhu','Darshpreet S. Sidhu');
const NICK={'Mohamad Vahora':'Vahora'};const first=n=>NICK[n]||n.split(' ')[0];
Chart.defaults.font.family="Inter,system-ui,sans-serif";Chart.defaults.color='#d9cfb3';
if(STATIC){Chart.defaults.animation=false;}else{Object.assign(Chart.defaults.animation,{duration:1400,easing:'easeOutQuart'});}

/* Finish / points: from points_tables.txt and points_tables_t20.txt */
const META={
 premier_t20:{cls:'prem',finish:'2nd',of:12,pts:'7W 1L 3NR · 17 pts · NRR +0.921',note:'Level on points with Centennial, behind on NRR',ko:'QF: <b>68 all out</b> (17.5 ov). Montreal Legends won by 9 wkts and went on to win the league.',badge:''},
 premier:{cls:'prem',finish:'3rd',of:12,pts:'5W 2L 1T · 11 pts · NRR +1.150',note:'2nd in Super League 6',ko:'SF: Mavericks 203/9. We were <b>136 all out</b> (22.3 ov), lost by 67 runs.',badge:''},
 divx_t20:{cls:'divx',finish:'2nd',of:9,pts:'3W 1L 4NR · 10 pts · NRR +0.990',note:'One league win was a forfeit',ko:'QF beat Royal by 5 wkts · SF beat Legends by <b>115 runs</b> · Final: <b>131 all out</b>, MKR won by 9 wkts.',badge:'Runners-up'},
 divx:{cls:'divx',finish:'5th',of:9,pts:'4W 4L · 8 pts · NRR −0.072',note:'Played at 25/20/15 overs; one win a forfeit',ko:'Did not qualify for the knockouts.',badge:''}
};
const fmtDate=s=>{const d=new Date(s+'T12:00:00');return d.toLocaleDateString('en-CA',{day:'numeric',month:'short'})};
const chipTxt={W:'W',L:'L',T:'T',FW:'F',NR:'–'};

/* ---------- SHARED: photos, modal ---------- */
const P=D.photos||{players:{},beyond:{},flags:{}};
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const ini=n=>n.replace(/^XX /,'').split(' ').filter((w,j,a)=>j===0||j===a.length-1).map(w=>w[0]).join('');
const disp=n=>n.replace(/^XX /,'');
const photo=(n,cls)=>P.players[n]?`<img class="${cls||''}" src="${P.players[n]}" alt="${esc(disp(n))}, ${esc((P.credit||{})[n]||'CricClubs profile photo')}" loading="lazy">`:
  `<div class="ph-face ${cls||''}" role="img" aria-label="No photo yet for ${esc(disp(n))}"><img src="img/crest-128.png" alt=""><b>${ini(n)}</b><span>Punjab Lions</span></div>`;
const modal=$('#modal'),mbox=modal.querySelector('.mbox'),mbody=$('#mdBody');let opener=null;const builders={};
function openModal(id,from){const [k,...r]=id.split(':');const b=builders[k];if(!b)return;mbody.innerHTML=b(r.join(':'));mbox.className='mbox m-'+k;
  opener=from||document.activeElement;modal.hidden=false;document.documentElement.classList.add('modal-open');mbox.scrollTop=0;modal.querySelector('.mclose').focus()}
function closeModal(){if(modal.hidden)return;modal.hidden=true;document.documentElement.classList.remove('modal-open');if(opener&&opener.focus)opener.focus()}
modal.querySelector('.mclose').onclick=closeModal;
modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('a[href^="#"]'))closeModal()});
document.addEventListener('keydown',e=>{if(modal.hidden)return;if(e.key==='Escape'){e.preventDefault();closeModal()}
  if(e.key==='Tab'){const f=[...mbox.querySelectorAll('a[href],button,[tabindex="0"]')];if(!f.length)return;const a=f[0],z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});
document.addEventListener('click',e=>{const t=e.target.closest('[data-open]');if(t){e.preventDefault();openModal(t.dataset.open,t)}});

/* scenes: muted video loops (hero, moments) + the 15 Jul team photo (squad); poster only in static / reduced motion */
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const VIDS=P.videos||[],V=id=>VIDS.find(v=>v.id===id);
const mkVideo=(v,cls)=>{const e=document.createElement('video');e.className=cls;e.muted=true;e.defaultMuted=true;e.loop=true;e.playsInline=true;e.setAttribute('muted','');e.setAttribute('playsinline','');e.preload='none';e.poster=v.poster;
  e.innerHTML=`<source src="${v.webm}" type="video/webm"><source src="${v.mp4}" type="video/mp4">`;return e};
const playIO=new IntersectionObserver(es=>es.forEach(en=>{const vd=en.target;if(en.isIntersecting){vd.play().catch(()=>{})}else vd.pause()}),{threshold:.05});
document.querySelectorAll('.scene.vid').forEach(sc=>{const v=V(sc.dataset.clip);if(!v){sc.className='scene ph';return}
  sc.style.backgroundImage=`url(${v.poster})`;
  if(STATIC||RM)return;                     // poster frame only
  const vd=mkVideo(v,"bgvid");sc.appendChild(vd);playIO.observe(vd)});
if(P.hero){const e=$('#squadScene');if(e)e.style.backgroundImage=`url(${P.hero})`;
  $('#heroCredit').innerHTML=`Background: our own 2026 match clips · Team photo (Meet the Lions): <a href="${P.heroInfo.url}" target="_blank" rel="noopener">@punjablions.cc, ${fmtDate(P.heroInfo.date)}</a>`}
else document.querySelectorAll('.scene.photo').forEach(e=>e.classList.replace('photo','ph'));

/* season numbers (behind a click) */
builders.season=()=>`<h3 id="mdTitle" class="mdh">Season 2026 in numbers</h3><div class="counters">${[[19,'Wins'],[11,'Losses'],[1,'Tie'],[2,'Forfeit wins'],['3,745','Runs scored'],[221,'Wickets taken'],[134,'Sixes'],[1,'Final reached']].map(([v,l])=>`<div class="ctr"><b>${v}</b><span>${l}</span></div>`).join('')}</div>
 <p class="fine">Wins/losses/tie count matches actually played (31). 7 rain-abandoned fixtures excluded. Runs and wickets are the sum of the four CricClubs batting and bowling tables (batter runs, excluding extras).</p>`;

/* ---------- TEAMS (competitions): slim cards, results on click ---------- */
const grid=$('#compGrid');
D.comps.forEach((c,i)=>{
  const m=META[c.key], r=c.rec;
  const card=el('button','comp pop '+m.cls);card.type='button';card.dataset.open='comp:'+c.key;card.setAttribute('aria-haspopup','dialog');
  card.style.transitionDelay=(i*120)+'ms';
  card.innerHTML=`<div class="cimg" aria-hidden="true"><img src="img/crest-128.png" alt=""></div>${m.badge?`<span class="badge">${m.badge}</span>`:''}<span class="fmt">${c.fmt==='T20'?'T20':'Long format'}</span>
   <h3>${c.label}</h3>
   <div class="finish"><b>${m.finish}</b><span>of ${m.of}<br>league stage</span></div>
   <div class="strip">${c.matches.map(x=>`<i class="chip ${x.o}${x.stage!=='League'&&x.stage!=='Super League'?' ko':''}"></i>`).join('')}</div>
   <span class="more">Results &amp; table <i>+</i></span>`;
  grid.appendChild(card);
});
builders.comp=k=>{const c=D.comps.find(x=>x.key===k),m=META[k],r=c.rec;
  return `<div class="mdhead"><span class="fmt">${c.fmt==='T20'?'T20':'Long format'} · ${c.league} · ${k.startsWith('divx')?'CricClubs: Axe Division':'CricClubs: Premier Division'}</span><h3 id="mdTitle" class="mdh">${c.label}</h3></div>
  <div class="mdrow"><div class="finish"><b>${m.finish}</b><span>of ${m.of} · league stage</span></div>
   <dl class="facts"><dt>Points table</dt><dd>${m.pts}</dd><dt>Note</dt><dd>${m.note}</dd><dt>On field incl. knockouts</dt><dd>${r.W}W ${r.L}L${r.T?' '+r.T+'T':''}</dd><dt>Knockouts</dt><dd>${m.ko}</dd></dl></div>
  <div class="table-scroll"><table class="rtable"><thead><tr><th>Date</th><th>Stage</th><th>Opponent</th><th>Punjab Lions</th><th>Their score</th><th></th><th>Result</th></tr></thead><tbody>${
   [...c.matches].reverse().map(x=>{const ko=!/League/.test(x.stage);const nr=x.o==='NR'||x.o==='FW';
     return `<tr class="${ko?'ko':''}"><td class="c-date">${fmtDate(x.date)}</td><td class="stage c-stage">${x.stage}</td><td class="c-opp">${x.opp}</td><td class="c-us"><b>${nr?'—':x.us}</b> ${nr?'':`<span class="muted">(${x.usov})</span>`}</td><td class="c-them">${nr?'—':x.them} ${nr?'':`<span class="muted">(${x.thov})</span>`}</td><td class="c-chip"><i class="chip ${x.o}">${chipTxt[x.o]}</i></td><td class="c-res">${x.result}</td></tr>`}).join('')}</tbody></table></div>
  <p class="legend"><i class="chip W">W</i> won <i class="chip L">L</i> lost <i class="chip T">T</i> tie <i class="chip FW">F</i> forfeit win <i class="chip NR">–</i> abandoned</p>`};

/* ---------- CHART FACTORIES (lazy: build when scrolled into view) ---------- */
const lazy=[];
function whenVisible(canvasId,fn){lazy.push({el:document.getElementById(canvasId),fn,done:false})}
const baseScales=(xTitle)=>({x:{grid:{color:GRID},ticks:{color:'#d9cfb3'},title:xTitle?{display:true,text:xTitle,color:'#A89E86'}:undefined},y:{grid:{display:false},ticks:{color:WHITE,font:{weight:600}}}});

/* Batting */
const segs=[{k:'season',l:'Whole season'}].concat(D.comps.map(c=>({k:c.key,l:c.label})));
let batChart,bowlChart;
function batData(k){
  if(k==='season')return D.season.filter(p=>p.runs>0).sort((a,b)=>b.runs-a.runs).slice(0,10).map(p=>({n:p.name,v:p.runs,s:p.sr,a:p.avg}));
  return D.comps.find(c=>c.key===k).bat.filter(p=>p.runs>0).sort((a,b)=>b.runs-a.runs).slice(0,8).map(p=>({n:p.name,v:p.runs,s:p.sr,a:p.avg}));
}
function bowlData(k){
  if(k==='season')return D.season.filter(p=>p.wk>0).sort((a,b)=>b.wk-a.wk).slice(0,10).map(p=>({n:p.name,v:p.wk,e:p.econ,a:p.bavg}));
  return D.comps.find(c=>c.key===k).bowl.filter(p=>p.wkts>0).sort((a,b)=>b.wkts-a.wkts||a.econ-b.econ).slice(0,8).map(p=>({n:p.name,v:p.wkts,e:p.econ,a:p.avg}));
}
const top2=['Abhinav Singh','Harsimranjit Singh Sindhar'];
function barCfg(rows,label,colorFn,tip){
  return {type:'bar',data:{labels:rows.map(r=>short(r.n)),datasets:[{label,data:rows.map(r=>r.v),_k:rows.map(r=>top2.includes(r.n)?'T':'B'),backgroundColor:c=>{const k=c.dataset._k[c.dataIndex];return k==='T'?gradH(c):'#8C6A22'},borderRadius:6,barThickness:'flex',maxBarThickness:28}]},
   options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:tip}}},scales:baseScales(label),
     animation:STATIC?false:{duration:1300,easing:'easeOutQuart',delay:c=>c.type==='data'?c.dataIndex*90:0}}};
}
function mkSeg(host,onPick){segs.forEach((s,i)=>{const b=el('button',i?'':'on',s.l);b.onclick=()=>{[...host.children].forEach(x=>x.classList.remove('on'));b.classList.add('on');onPick(s)};host.appendChild(b)})}
whenVisible('batChart',()=>{const rows=batData('season');batChart=new Chart($('#batChart'),barCfg(rows,'Runs',null,c=>{const r=batData(curBat)[c.dataIndex];return ` ${r.v} runs · avg ${r.a??'–'} · SR ${r.s}`}))});
let curBat='season',curBowl='season';
mkSeg($('#batSeg'),s=>{curBat=s.k;$('#batTitle').textContent='Runs · '+s.l.toLowerCase();if(!batChart)return;const rows=batData(s.k);batChart.data.labels=rows.map(r=>short(r.n));batChart.data.datasets[0].data=rows.map(r=>r.v);batChart.data.datasets[0]._k=rows.map(r=>top2.includes(r.n)?'T':'B');batChart.update()});
whenVisible('srChart',()=>{
  const pts=D.season.filter(p=>p.ins>=10||p.runs>=150);
  new Chart($('#srChart'),{type:'bubble',data:{datasets:[{data:pts.map(p=>({x:p.sr,y:p.runs,r:Math.max(5,Math.sqrt(p.ins)*3.2),n:p.name,a:p.avg,i:p.ins})),backgroundColor:pts.map(p=>top2.includes(p.name)?GOLD+'ee':'#B07A2Acc'),borderColor:'#FFF6DC',borderWidth:1.5}]},
   options:{responsive:true,maintainAspectRatio:false,layout:{padding:{right:10,top:10}},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.raw.n}: ${c.raw.y} runs, SR ${c.raw.x}, avg ${c.raw.a??'–'} (${c.raw.i} inns)`}}},
    scales:{x:{min:40,max:180,grid:{color:GRID},title:{display:true,text:'Strike rate',color:'#A89E86'}},y:{min:0,max:900,grid:{color:GRID},title:{display:true,text:'Runs',color:'#A89E86'}}}},
   plugins:[{id:'lbl',afterDatasetsDraw(ch){const ctx=ch.ctx;ctx.save();ctx.font='600 12px Inter, Arial, sans-serif';ctx.fillStyle='#fff';ch.getDatasetMeta(0).data.forEach((e,i)=>{const p=ch.data.datasets[0].data[i];if(p.y<280)return;const left=p.x>150;ctx.textAlign=left?'right':'left';const rr=(e.options&&e.options.radius||8)+6;if(MOB()){ctx.textAlign='center';ctx.fillText(first(p.n),e.x,e.y-rr+1)}else ctx.fillText(first(p.n),e.x+(left?-rr:rr),e.y+4)});ctx.restore()}}]});
});
/* Bowling */
whenVisible('bowlChart',()=>{bowlChart=new Chart($('#bowlChart'),barCfg(bowlData('season'),'Wickets',null,c=>{const r=bowlData(curBowl)[c.dataIndex];return ` ${r.v} wkts · econ ${r.e} · avg ${r.a??'–'}`}))});
mkSeg($('#bowlSeg'),s=>{curBowl=s.k;$('#bowlTitle').textContent='Wickets · '+s.l.toLowerCase();if(!bowlChart)return;const rows=bowlData(s.k);bowlChart.data.labels=rows.map(r=>short(r.n));bowlChart.data.datasets[0].data=rows.map(r=>r.v);bowlChart.data.datasets[0]._k=rows.map(r=>top2.includes(r.n)?'T':'B');bowlChart.update()});
function donut(id,a,b,lab){whenVisible(id,()=>new Chart($('#'+id),{type:'doughnut',data:{labels:['Abhinav + Harsimranjit','Rest of squad'],datasets:[{data:[a,b],backgroundColor:[c=>gradH(c),'#4A3A16'],borderColor:'#050505',borderWidth:3}]},
  options:{cutout:'68%',maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.label}: ${c.raw.toLocaleString()}`}}},animation:STATIC?false:{animateRotate:true,duration:1600}},
  plugins:[{id:'c',afterDraw(ch){const{ctx,chartArea:ca}=ch;ctx.save();ctx.textAlign='center';ctx.fillStyle=GOLD;ctx.font='400 32px Anton, Oswald, Arial Narrow, sans-serif';ctx.fillText(Math.round(100*a/(a+b))+'%',(ca.left+ca.right)/2,(ca.top+ca.bottom)/2+4);ctx.font='500 11px Inter, Arial, sans-serif';ctx.fillStyle='#d9cfb3';ctx.fillText(a.toLocaleString()+' of '+(a+b).toLocaleString(),(ca.left+ca.right)/2,(ca.top+ca.bottom)/2+22);ctx.restore()}}]}))}
const S=n=>D.season.find(p=>p.name===n);
const tr=S(top2[0]).runs+S(top2[1]).runs, tw=S(top2[0]).wk+S(top2[1]).wk;
donut('shareRuns',tr,D.totals.runs-tr);donut('shareWk',tw,D.totals.wkts-tw);

/* ---------- MEET THE LIONS: photo-first cards, stats on click ---------- */
const KEY=['Abhinav Singh','Harsimranjit Singh Sindhar','Pankaj Sharma','Darshpreet Singh Sidhu','Sujaan Singh','Humayun Afzal','Mohamad Vahora','Harjeet Singh'];
const ROLE={'Darshpreet Singh Sidhu':'Wicket Keeper'};
const tagTxt=t=>t?t.replace('VC premier','Premier vice-captain').replace('VC divx','DivX vice-captain').replace('C premier','Premier captain').replace('C divx','DivX captain').replace(' / ',' · '):'';
const roleOf=n=>{const m=D.players[n]||{};return [ROLE[n]||m.role,tagTxt(m.tag)].filter(Boolean).join(' · ')};
const headline=n=>{const p=S(n);if(!p)return '';const a=[];if(p.runs>=100)a.push(`${p.runs.toLocaleString()} runs`);if(p.wk>=5)a.push(`${p.wk} wickets`);if(!a.length&&p.dis)a.push(`${p.dis} dismissals`);if(!a.length)a.push(`${p.mat} matches`);return a.slice(0,2).join(' · ')};
const WORLD=P.world||[],worldOf=n=>WORLD.filter(w=>w.who.includes(n));
const badge=n=>worldOf(n).some(w=>w.key==='canada')?'<span class="qc ca">Team Canada 2026</span>':worldOf(n).length?'<span class="qc">Team Québec 2026</span>':'';
const cards=$('#cards');
KEY.forEach((n,i)=>{const c=el('button','pcard pop');c.type='button';c.dataset.open='player:'+n;c.setAttribute('aria-haspopup','dialog');c.style.transitionDelay=(i%4*110)+'ms';
  c.innerHTML=`<div class="pimg">${photo(n)}${badge(n)}</div><div class="pinfo"><span class="role">${esc(roleOf(n))}</span><h4>${esc(disp(n))}</h4><p>${headline(n)}</p><span class="more">Full stats <i>+</i></span></div>`;
  cards.appendChild(c)});
const rest=D.season.filter(p=>!KEY.includes(p.name)&&p.mat>0).sort((a,b)=>b.mat-a.mat);
const tiles=$('#tiles');
rest.forEach((p,i)=>{const c=el('button','ptile pop');c.type='button';c.dataset.open='player:'+p.name;c.setAttribute('aria-haspopup','dialog');c.style.transitionDelay=(i%6*60)+'ms';
  c.innerHTML=`<div class="tface">${photo(p.name)}</div><b>${esc(disp(p.name))}</b><span>${esc((D.players[p.name]||{}).role||'')}</span>`;tiles.appendChild(c)});
/* hero faces */
const faces=$('#faces');[...KEY,...rest.map(p=>p.name)].filter(n=>P.players[n]).slice(0,14).forEach(n=>{const b=el('button','hface');b.type='button';b.dataset.open='player:'+n;b.title=disp(n);b.setAttribute('aria-label',disp(n)+': open stats');b.innerHTML=`<img src="${P.players[n]}" alt="">`;faces.appendChild(b)});
{const a=el('a','hface more-f','<span>Meet the<br>squad</span>');a.href='#squad';faces.appendChild(a)}
/* ---------- FUT-style card helpers: shared by the hero card and the player detail window ---------- */
const FUT=(()=>{
 const PH=new Set(['Lakhwinder Singh','Jashan Lubana','Sarvpreet Guru']); // poor / missing photos -> crest + initials art
 const POS={'All Rounder':'AR','Batter':'BAT','Bowler':'BWL','Wicket Keeper':'WK'};
 const pool=D.season.filter(p=>p.mat>0).map(p=>p.name);
 const slug=n=>disp(n).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),f1=v=>(Math.round(v*10)/10).toFixed(1);
 /* Rating (60-95), deterministic, from the player's real 2026 season totals in data.js only:
      bat   = 0.7*min(1, runs/700) + 0.3*min(1, SR/150)        (SR counts only with 20+ balls faced)
      bowl  = 0.75*min(1, wickets/40) + 0.25*clamp((8-econ)/4, 0, 1)   (econ counts only with 60+ balls bowled)
      adj   = outfield catches + run-outs (direct + assist) + 0.5*(keeper catches + stumpings)   (CricClubs fielding tables;
              keepers get more chances, so their catches count half)
      field = 0.5*min(1, adj/20) + 0.3*min(1, (adj/matches)/0.8) + 0.2*min(1, keyDismissals/5)
              keyDismissals = dismissals in the 5 knockouts + 6 close games (<=20 runs, <=3 wkts or a tie), from the scorecards
      games = min(1, matches/30)
      impact = max(bat,bowl) + 0.35*min(bat,bowl) + 0.30*field + 0.10*games
      rating = round(60 + 35*min(1, impact/1.4))                -> 60 (no contribution) ... 95 (squad-leading all-round season) */
 const FK=D.fieldKey||{},BADGE=(D.recog||{}).badges||{};
 function fsum(n){const o={ct:0,wk:0,dro:0,iro:0,st:0,tot:0},num=x=>+x||0;
   for(const c of Object.values((D.pcomp||{})[n]||{})){const f=c.field;if(!f)continue;o.ct+=num(f.Catches);o.wk+=num(f['WK Catches']);o.dro+=num(f['Direct RO']);o.iro+=num(f['Indirect RO']);o.st+=num(f.Stumpings);o.tot+=num(f.Total)}
   o.key=FK[n]||0;return o}
 function parts(p){const bat=.7*Math.min(1,p.runs/700)+(p.balls>=20&&p.sr?.3*Math.min(1,p.sr/150):0);
   const bowl=.75*Math.min(1,p.wk/40)+(p.bb>=60&&p.econ!=null?.25*cl((8-p.econ)/4,0,1):0);
   const f=fsum(p.name),adj=f.ct+f.dro+f.iro+.5*(f.wk+f.st);
   const field=.5*Math.min(1,adj/20)+.3*Math.min(1,p.mat?(adj/p.mat)/.8:0)+.2*Math.min(1,f.key/5);
   return {bat,bowl,field,adj,f}}
 function rating(p){const {bat,bowl,field}=parts(p);
   const imp=Math.max(bat,bowl)+.35*Math.min(bat,bowl)+.3*field+.1*Math.min(1,p.mat/30);
   return Math.round(60+35*Math.min(1,imp/1.4))}
 /* fielding is his top skill -> the card leads with fielding lines */
 const fieldLed=p=>{const x=parts(p);return x.field>x.bat+1e-9&&x.field>x.bowl+1e-9};
 /* 4-6 attributes, only numbers that exist for him; bowlers lead with bowling, fielders with fielding */
 function attrs(p){const bat=[['RUNS',p.runs]];if(p.balls>=20&&p.sr!=null)bat.push(['SR',f1(p.sr)]);if(p.ins>=3&&p.avg!=null)bat.push(['AVG',f1(p.avg)]);if(p.ins>0)bat.push(['HS',p.hs]);
   const bowl=[['WKTS',p.wk]];if(p.bb>=30&&p.econ!=null)bowl.push(['ECON',p.econ.toFixed(2)]);
   if(fieldLed(p)){const {f,bat:b,bowl:w}=parts(p),ct=f.ct+f.wk;
     return [['CT',ct],['RO',f.dro+f.iro],['CT/M',p.mat?(ct/p.mat).toFixed(2):'0.00'],['BIG',f.key],...(w>b&&p.wk>0?bowl:bat)].slice(0,6)}
   const lead=p.wk>=10&&p.wk*20>=p.runs,bowled=p.bb>0,L=lead?bowl:bat,O=lead?bat:bowled?bowl:[];
   const a=[...L.slice(0,3),...O.slice(0,2),['FLD',p.dis],...L.slice(3),...O.slice(2),['MAT',p.mat]];
   if(a.length<4&&!a.some(x=>x[0]==='WKTS'))a.splice(a.length-1,0,['WKTS',p.wk]); // never bowled: 0 wickets shown only to reach 4 lines
   return a.slice(0,6)}
 const cname=n=>{const w=disp(n).split(' ');return w.length>2?w[0]+' '+w.slice(1,-1).map(x=>x[0]+'.').join(' ')+' '+w[w.length-1]:w.join(' ')};
 const art=n=>(!PH.has(n)&&P.players[n])?`<img class="fut-photo" src="${P.players[n]}" alt="" decoding="async">`:`<span class="fut-photo fut-ph" aria-hidden="true"><img src="img/crest-128.png" alt=""><b>${ini(n)}</b></span>`;
 /* card face markup; full=true -> all 6 attribute lines (detail window) */
 const face=(n,full)=>{const p=S(n),r=rating(p),role=(D.players[n]||{}).role||'',pos=POS[role]||'';
   return `<span class="fut-top"><span class="fut-ovr">${r}</span>${pos?`<span class="fut-pos">${pos}</span>`:''}<img class="fut-club" src="img/crest-128.png" alt=""></span>
     <span class="fut-art">${art(n)}</span>${BADGE[n]?`<span class="fut-badge">${esc(BADGE[n])}</span>`:''}<span class="fut-name${cname(n).length>18?' xl':cname(n).length>15?' l':''}">${esc(cname(n))}</span>
     <span class="fut-attrs">${attrs(p).map(([k,v])=>`<span><b>${v}</b><i>${k}</i></span>`).join('')}</span><span class="fut-shine"></span>`};
 return {PH,POS,pool,slug,cl,f1,rating,attrs,cname,art,face,fsum,parts,fieldLed,BADGE};
})();
/* ---------- HERO: one floating FUT-style card (random player, new one every 7 s) ---------- */
(function(){
 const host=$('.hero-inner'),crest=$('.hero-crest>img');if(!host||!crest)return;
 const {PH,POS,pool,slug,cl,rating,attrs,face}=FUT;
 const btn=el('button','fut');btn.type='button';btn.setAttribute('aria-haspopup','dialog');
 btn.innerHTML='<span class="fut-float"><span class="fut-tilt"><span class="fut-card"></span></span></span>';host.appendChild(btn);
 const card=btn.querySelector('.fut-card'),tilt=btn.querySelector('.fut-tilt');
 // preload portraits so a swap never shows a half-loaded image
 pool.forEach(n=>{if(!PH.has(n)&&P.players[n]){const i=new Image();i.src=P.players[n]}});
 function fill(n){const r=rating(S(n)),role=(D.players[n]||{}).role||'';
   btn.dataset.open='player:'+n;btn.dataset.fut=slug(n);
   btn.setAttribute('aria-label',`Featured Lion: ${disp(n)}, rating ${r}${role?', '+role:''}. Open 2026 stats`);
   card.innerHTML=face(n)}
 /* placement: phones -> beside the crest (unchanged); tablets + desktops -> hovering over the shield's lower-left,
    toward the page centre, never over the hero copy (text runs + buttons), the face circles or the stats strip.
    Layout offsets only, so the crest's float and the reveal transforms never move it */
 const copyR=()=>{let r=0;const c=$('#top .hero-copy');if(!c)return 0;const tw=document.createTreeWalker(c,NodeFilter.SHOW_TEXT);let tn;
   while(tn=tw.nextNode()){if(!tn.nodeValue.trim())continue;const g=document.createRange();g.selectNodeContents(tn);for(const q of g.getClientRects())r=Math.max(r,q.right)}
   c.querySelectorAll('a,button').forEach(b=>{const q=b.getBoundingClientRect();if(q.width)r=Math.max(r,q.right)});return r};
 function place(){let x=0,y=0,e=crest;while(e&&e!==host){x+=e.offsetLeft;y+=e.offsetTop;e=e.offsetParent}
   const cw=crest.offsetWidth,mob=matchMedia("(max-width:760px)").matches,hr=host.getBoundingClientRect(),maxR=hr.width+(innerWidth-hr.right)-10;let w,l,t;
   let off=false;
   if(mob){l=x+cw*.9;w=cl(maxR-l,84,100);t=y+cw*.2;l=Math.min(l,maxR-w)}
   else{const tr=copyR()-hr.left+18;w=cl(cw*.47,112,200);l=Math.max(x-cw*.04,tr);t=y+cw*.58-w*131/184;
     if(l+w>Math.min(maxR,x+cw))off=true} // no room over the shield without touching the copy -> no card
   {const fc=$('#faces'),lc=fc&&fc.lastElementChild;if(lc&&l<fc.offsetLeft+lc.offsetLeft+lc.offsetWidth&&fc.offsetParent===host)t=Math.min(t,fc.offsetTop-w*262/184-8)} // never sit on the face circles
   if(!mob&&t<y-cw*.08)off=true;
   hidden=off;btn.hidden=off;btn.classList.toggle('compact',mob||w<150);btn.classList.toggle('tabc',!mob&&w<150);btn.style.cssText=`left:${l.toFixed(1)}px;top:${t.toFixed(1)}px;width:${w.toFixed(1)}px;font-size:${(w/184*16).toFixed(2)}px`}
 const q=new URLSearchParams(location.search).get('fut'),want=q&&pool.find(n=>slug(n)===slug(q)||n===q);
 /* own random source, so the rest of the page's Math.random sequence is untouched */
 const rndI=n=>{try{return crypto.getRandomValues(new Uint32Array(1))[0]%n}catch(e){return Math.floor(Math.random()*n)}};
 let hidden=false,cur=want||pool[rndI(pool.length)],hist=[cur],el7=0,hover=false,focus=false,vis=true,busy=false;
 const pick=()=>{let n;do{n=pool[rndI(pool.length)]}while(n===cur&&pool.length>1);return n};
 const still=STATIC||RM;
 async function swap(){if(busy)return;busy=true;const n=pick();
   if(still||!tilt.animate){fill(n)}else{
     await tilt.animate([{transform:'rotateY(0deg)'},{transform:'rotateY(90deg)'}],{duration:260,easing:'ease-in'}).finished;fill(n);
     await tilt.animate([{transform:'rotateY(-90deg)'},{transform:'rotateY(0deg)'}],{duration:320,easing:'ease-out'}).finished}
   cur=n;hist.push(n);busy=false}
 fill(cur);place();
 addEventListener('resize',place);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(place);
 btn.addEventListener('pointerenter',()=>hover=true);btn.addEventListener('pointerleave',()=>{hover=false;tilt.style.removeProperty('--rx');tilt.style.removeProperty('--ry')});
 btn.addEventListener('focusin',()=>focus=true);btn.addEventListener('focusout',()=>focus=false);
 if(!still)btn.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const r=btn.getBoundingClientRect(),dx=(e.clientX-r.left)/r.width-.5,dy=(e.clientY-r.top)/r.height-.5;
   tilt.style.setProperty('--ry',(dx*16).toFixed(1)+'deg');tilt.style.setProperty('--rx',(-dy*12).toFixed(1)+'deg')});
 new IntersectionObserver(es=>{vis=es[0].isIntersecting}).observe($('#top'));
 const modalEl=$('#modal');let lastT=performance.now();
 setInterval(()=>{const t=performance.now(),dt=t-lastT;lastT=t;
   const paused=hidden||hover||focus||!vis||document.hidden||!modalEl.hidden;btn.classList.toggle('paused',paused);
   if(paused)return;el7+=dt;if(el7>=7000&&!busy){el7-=7000;swap()}},100);
 window.__fut={get hidden(){return hidden},get name(){return cur},get history(){return hist.slice()},get elapsed(){return el7},rating:n=>rating(S(n)),attrs:n=>attrs(S(n)),parts:n=>FUT.parts(S(n)),pool};
})();
/* highlight reel: poster cards; video attached lazily (IntersectionObserver, preload=none); hover or click/tap plays */
{const R=$('#reelGrid');
 VIDS.forEach((v,i)=>{const c=el('article','vcard pop'+(v.id==='clip3'?' wide':''));c.style.transitionDelay=(i*90)+'ms';c.dataset.clip=v.id;
  c.innerHTML=`<button type="button" class="vplay" aria-label="Play clip: ${esc(v.title)}" aria-pressed="false"><img class="vposter" src="${v.poster}" alt="" loading="lazy"><span class="vicon" aria-hidden="true"></span></button>
   <div class="vmeta"><b>${esc(v.title)}</b><span>${esc(v.desc)}</span></div>`;R.appendChild(c)});
 const attach=c=>{if(c._v)return c._v;const v=V(c.dataset.clip),vd=mkVideo(v,'rvid');c.querySelector('.vplay').prepend(vd);c._v=vd;return vd};
 const play=c=>{const vd=attach(c);vd.play().then(()=>{c.classList.add('playing');c.querySelector('.vplay').setAttribute('aria-pressed','true')}).catch(()=>{})};
 const stop=c=>{if(!c._v)return;c._v.pause();c.classList.remove('playing');c.querySelector('.vplay').setAttribute('aria-pressed','false')};
 if(!STATIC){const lio=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){attach(en.target);lio.unobserve(en.target)}}),{rootMargin:'200px'});
  R.querySelectorAll('.vcard').forEach(c=>{lio.observe(c);
   const hov=matchMedia('(hover: hover)').matches;
   if(hov){c.addEventListener('mouseenter',()=>play(c));c.addEventListener('mouseleave',()=>stop(c))}
   c.querySelector('.vplay').addEventListener('click',()=>{if(c.classList.contains('playing')&&(!hov||c._clicked)){c._clicked=false;stop(c)}else{c._clicked=true;play(c)}})});
  new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)R.querySelectorAll('.vcard.playing').forEach(stop)})).observe(R)}
 /* 'Watch' buttons in a player's stats (data-play=clipN): the modal closes on #reel, then scroll to that clip and play it */
 document.addEventListener('click',e=>{const b=e.target.closest('[data-play]');if(!b)return;e.preventDefault();const c=R.querySelector(`.vcard[data-clip="${b.dataset.play}"]`);if(!c)return;
  closeModal();c.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});c._clicked=true;play(c);c.querySelector('.vplay').focus({preventScroll:true})})}
/* lions on the world stage (+ the mentor's rest day) */
{const W=$('#worldGrid'),ca=WORLD.find(w=>w.key==='canada'),qc=WORLD.filter(w=>w.key!=='canada'),F=P.fun;
 W.innerHTML=`${ca?`<article class="wfeature pop" id="canada"><div class="wimg"><img src="${ca.img}" alt="Selected for Team Canada: Harsimran Sindhar, Québec's Pride, IMC Over-40s World Cup 2026, Guyana, Oct 17–31" loading="lazy"></div>
   <div class="wbody"><span class="kick">Proud moment for Quebec and Punjab</span><h3>${esc(ca.title)}</h3><p class="wwho">${esc(disp(ca.who[0]))}</p><p>${esc(ca.sub)}</p><p class="muted2">${esc(ca.note)}. ${S(ca.who[0])?`${S(ca.who[0]).wk} wickets and ${S(ca.who[0]).runs} runs for the Lions in 2026; now he takes the black-and-gold spirit to a World Cup.`:''}</p>
   <div class="wbtns"><button type="button" class="btn gold" data-open="player:${esc(ca.who[0])}" aria-haspopup="dialog">His 2026 stats</button></div><span class="srcl">${esc(ca.source)}</span></div></article>`:''}
  <div class="wrow">${qc.map(x=>`<a class="witem pop" href="${x.url}" target="_blank" rel="noopener"><img src="${x.img}" alt="${esc(x.title)}" loading="lazy"><span><b>${esc(x.title)}</b>${esc(x.sub)}<em>${x.who.map(disp).join(' & ')} · Instagram · ${fmtDate(x.date)} ↗</em></span></a>`).join('')}
  ${F?`<article class="witem fun pop"><img src="${F.img}" alt="${esc(disp(F.who))} napping in kit under a tree, with a cartoon ZZZZ bubble" loading="lazy"><span><i class="tagfun">Off the field</i><b>${esc(F.title)}</b>${esc(F.sub)}
    <span class="flinks"><button type="button" class="more" data-open="player:${esc(F.who)}" aria-haspopup="dialog">${esc(first(F.who))}'s stats <i>+</i></button>${ca?'<a class="more" href="#canada">Team Canada feature <i>↑</i></a>':''}</span></span></article>`:''}</div>`}
/* photo note */
{const all=D.season.map(p=>p.name),real=all.filter(n=>P.players[n]),ph=all.filter(n=>!P.players[n]);
 $('#photoNote').innerHTML=`Player photos: CricClubs profile pictures; the crest stands in where there is none. &ldquo;Matches&rdquo; is the sum of CricClubs Mat columns and may include abandoned games.`}
/* player modal: batting / bowling / fielding per competition */
const CL=k=>D.comps.find(c=>c.key===k).label;
/* player detail window = a FUT-style card (same rating() / attrs() as the hero card) + the full 2026 stats, FUT-style */
builders.player=n=>{const pc=(D.pcomp||{})[n]||{},m=D.players[n]||{},ks=D.comps.map(c=>c.key).filter(k=>pc[k]),p=S(n);
  const v=x=>x==null||x===''?'–':x,num=x=>{const f=parseFloat(x);return isFinite(f)?f:0};
  const sum=(get,f)=>ks.reduce((a,k)=>a+(pc[k][get]?num(pc[k][get][f]):0),0),has=get=>ks.some(k=>pc[k][get]);
  const T=(title,cols,get)=>{const rows=ks.filter(k=>pc[k][get]);if(!rows.length)return '';return `<div class="fby"><h5>${title}</h5><div class="table-scroll"><table class="stbl futbl"><thead><tr><th>Competition</th>${cols.map(c=>`<th>${c[0]}</th>`).join('')}</tr></thead><tbody>${rows.map(k=>`<tr><td>${CL(k)}</td>${cols.map(c=>`<td>${c[1](pc[k][get])??'–'}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`};
  const bat=T('Batting',[['Mat',b=>v(b.Mat)],['Inns',b=>v(b.Ins)],['NO',b=>v(b.No)],['Runs',b=>v(b.Runs)],['Balls',b=>v(b.Balls)],['HS',b=>v(b.Hs)],['Avg',b=>v(b.Avg)],['SR',b=>v(b.Sr)],['50s',b=>v(b['50s'])],['4s',b=>v(b['4s'])],['6s',b=>v(b['6s'])]],'bat');
  const bowl=T('Bowling',[['Mat',b=>v(b.Mat)],['Inns',b=>v(b.Inns)],['Overs',b=>v(b.Overs)],['Mdns',b=>v(b.Mdns)],['Runs',b=>v(b.Runs)],['Wkts',b=>v(b.Wkts)],['Econ',b=>v(b.Econ)],['Avg',b=>v(b.Ave)],['SR',b=>v(b.SR)],['Wides',b=>v(b.Wides)]],'bowl');
  const fld=T('Fielding',[['Catches',f=>v(f.Catches)],['WK catches',f=>v(f['WK Catches'])],['Run outs (direct)',f=>v(f['Direct RO'])],['Run outs (indirect)',f=>v(f['Indirect RO'])],['Stumpings',f=>v(f.Stumpings)],['Total',f=>v(f.Total)]],'field');
  const by=worldOf(n).map(w=>({url:w.url||'#canada',img:w.img,caption:w.title+(w.sub?' - '+w.sub:''),meta:w.date?fmtDate(w.date)+' · Instagram ↗':'Lions on the world stage ↓',ext:!!w.url}));
  /* season tiles: CricClubs season totals from data.js; 50s / maidens / fielding columns are sums of the per-competition rows below */
  const tile=(k,val,hot)=>`<span class="ftile${hot?' hot':''}"><b>${val==null||val===''||(typeof val==='number'&&!isFinite(val))?'–':val}</b><i>${k}</i></span>`;
  const panel=(t,big,tiles)=>`<section class="fpanel fp-${t.toLowerCase()}"><header><h4>${t}</h4>${big}</header><div class="ftiles">${tiles.join('')}</div></section>`;
  let panels='';
  if(p){const F=FUT.f1,ov=b=>`${Math.floor(b/6)}${b%6?'.'+b%6:''}`;
    panels+=panel('Batting',`<span class="fbig"><b>${p.runs}</b><i>runs</i></span>`,[tile('Mat',p.mat),tile('Inns',p.ins),tile('NO',p.no),tile('Runs',p.runs,1),tile('Balls',p.balls),tile('HS',p.ins?p.hs:null),tile('Avg',p.avg!=null?F(p.avg):null,1),tile('SR',p.sr!=null?F(p.sr):null,1),tile('50s',has('bat')?sum('bat','50s'):null),tile('4s',p.fours),tile('6s',p.sixes)]);
    if(p.bb>0)panels+=panel('Bowling',`<span class="fbig"><b>${p.wk}</b><i>wickets</i></span>`,[tile('Overs',ov(p.bb)),tile('Mdns',has('bowl')?sum('bowl','Mdns'):null),tile('Runs',p.rc),tile('Wkts',p.wk,1),tile('Econ',p.econ!=null?p.econ.toFixed(2):null,1),tile('Avg',p.wk&&p.bavg!=null?F(p.bavg):null,1),tile('SR',p.wk?F(p.bb/p.wk):null),tile('Wides',p.wides)]);
    else panels+=panel('Bowling','',['<p class="fnone">No bowling in the 2026 CricClubs tables.</p>']);
    {const f=FUT.fsum(n);
     panels+=panel('Fielding',`<span class="fbig"><b>${p.dis}</b><i>dismissals</i></span>`,has('field')?[tile('Catches',f.ct,1),tile('WK catches',f.wk),tile('Stumpings',f.st),tile('Run outs',f.dro,1),tile('RO assists',f.iro),tile('Big-game',f.key,1)]:[])}}
  const GG=(D.recog||{}).goldGlove,dlist=GG&&GG.player===n?`<h4 class="fsec">Every dismissal, by match</h4><div class="table-scroll"><table class="stbl futbl gglist"><thead><tr><th>Match</th><th>Game</th><th>Result</th><th>Dismissals</th><th>Context</th></tr></thead><tbody>${GG.rows.map(r=>`<tr${r.hot?' class="hot"':''}><td><a href="https://cricclubs.com/QCF/viewScorecard.do?matchId=${r.mid}&amp;clubId=1834" target="_blank" rel="noopener">${r.mid} ↗</a></td><td>${esc(r.game)}</td><td>${esc(r.result)}</td><td><b>${esc(r.dis)}</b></td><td>${esc(r.ctx)}</td></tr>`).join('')}</tbody></table></div>`:'';
  const r=p?FUT.rating(p):null,watch=VIDS.filter(x=>x.who===n);
  return `<div class="mdfut"><div class="mdfut-card">${p?`<span class="fut fut-detail" role="img" aria-label="${esc(disp(n))} player card: rating ${r}${m.role?', '+esc(m.role):''}"><span class="fut-tilt"><span class="fut-card">${FUT.face(n)}</span></span></span>`:`<div class="mdface">${photo(n)}</div>`}</div>
   <div class="mdfut-info"><span class="fmt">${esc(roleOf(n))}</span><h3 id="mdTitle" class="mdh">${esc(disp(n))}</h3>
    ${p?`<div class="fratings"><span class="fr"><b>${r}</b><i>Lions rating</i></span>${m.role?`<span class="fr"><b>${FUT.POS[m.role]||'–'}</b><i>${esc(m.role)}</i></span>`:''}<span class="fr"><b>${p.mat}</b><i>matches</i></span>${FUT.BADGE[n]?`<span class="fbadge">${esc(FUT.BADGE[n])}</span>`:''}</div>`:''}
    <p class="one">${headline(n)} <span class="muted">· whole season</span></p>
    <div class="mdbtns">${m.url?`<a class="btn ghost sm" href="${m.url}" target="_blank" rel="noopener">CricClubs profile ↗</a>`:''}${watch.map(x=>`<a class="btn gold sm watch" href="#reel" data-play="${x.id}">${esc(x.label||'Watch the clip')} ▶</a>`).join('')}</div>
    ${by.length?`<div class="mdbeyond">${by.map(x=>`<a href="${x.url}"${x.ext?' target="_blank" rel="noopener"':''}><img src="${x.img}" alt="${esc(x.caption)}"><span>${esc(x.caption.split(' - ')[0])}<em>${x.meta}</em></span></a>`).join('')}</div>`:''}</div></div>
   ${p?`<h4 class="fsec">2026 season</h4><div class="fpanels">${panels}</div>`:''}
   ${dlist}${ks.length?`<h4 class="fsec">By competition</h4>${bat}${bowl}${fld}`:'<p class="note">No 2026 records in the CricClubs tables.</p>'}
   <p class="fine">Source: CricClubs 2026 batting, bowling and fielding tables per competition. Lions rating: the same formula as the hero card (season runs, strike rate, wickets, economy, fielding, matches). Fielding counts catches and run-outs (keeper catches and stumpings at half), per match, and big-game dismissals: those in the 5 knockouts and 6 close games, from the scorecards.</p>`};

/* ---------- FORMATS ---------- */
const C=k=>D.comps.find(c=>c.key===k);
const fmtBar=(id,label,vals,suffix)=>whenVisible(id,()=>new Chart($('#'+id),{type:'bar',data:{labels:['Premier','DivX'],datasets:[{label:'T20',data:vals[0],backgroundColor:ORANGE,borderRadius:6},{label:'Long format',data:vals[1],backgroundColor:GOLD,borderRadius:6}]},
  options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:WHITE}},tooltip:{callbacks:{label:c=>` ${c.dataset.label}: ${c.raw}${suffix}`}}},scales:{x:{grid:{display:false},ticks:{color:WHITE,font:{weight:700,size:13}}},y:{beginAtZero:true,grid:{color:GRID},title:{display:true,text:label,color:'#A89E86'}}}},
  plugins:[{id:'v',afterDatasetsDraw(ch){const ctx=ch.ctx;ctx.save();ctx.font='700 13px Inter, Arial, sans-serif';ctx.fillStyle='#fff';ctx.textAlign='center';ch.data.datasets.forEach((d,di)=>ch.getDatasetMeta(di).data.forEach((b,i)=>ctx.fillText(label.startsWith('Runs per')?d.data[i].toFixed(1):d.data[i].toFixed(2),b.x,b.y-6)));ctx.restore()}}]}));
fmtBar('fmtSR','Runs per 100 balls',[[C('premier_t20').sr,C('divx_t20').sr],[C('premier').sr,C('divx').sr]],'');
fmtBar('fmtEcon','Runs conceded per over',[[C('premier_t20').econ,C('divx_t20').econ],[C('premier').econ,C('divx').econ]],'');
const FP=['Abhinav Singh','Harsimranjit Singh Sindhar','Pankaj Sharma','Humayun Afzal','Darshpreet Singh Sidhu','Harjeet Singh','Mohamad Vahora'];
whenVisible('fmtPlayers',()=>new Chart($('#fmtPlayers'),{type:'bar',data:{labels:FP.map(n=>first(n)),datasets:[{label:'T20 strike rate',data:FP.map(n=>S(n).byFmt.T20.sr),backgroundColor:ORANGE,borderRadius:5},{label:'Long-format strike rate',data:FP.map(n=>S(n).byFmt.LONG.sr),backgroundColor:GOLD,borderRadius:5}]},
  options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:WHITE}}},scales:{x:{grid:{display:false},ticks:{color:WHITE,font:{weight:600}}},y:{beginAtZero:true,grid:{color:GRID}}}}}));
const FC=[
 ['Abhinav Singh','Elite in both. His bowling takes more wickets in T20.','bat'],
 ['Harsimranjit Singh Sindhar','Bats faster in T20; bowls best in the long format.','both'],
 ['Pankaj Sharma','A T20 finisher. Batting does not carry to the long format; his long-format bowling does.','bat'],
 ['Mohamad Vahora','A long-format bowler. Bowled 1 over in the Premier T20.','bowl']];
const fcH=$('#fmtCards');
FC.forEach(([n,txt,mode],i)=>{const p=S(n),t=p.byFmt.T20,l=p.byFmt.LONG;
  const line=f=>mode==='bowl'?`<b>${f.wk}</b> wkts<br>econ ${f.econ.toFixed(2)}<br>bowl avg ${f.bavg}`:mode==='both'?`<b>${f.runs}</b> runs<br>SR ${f.sr}<br><b>${f.wk}</b> wkts<br>econ ${f.econ.toFixed(2)}`:`<b>${f.runs}</b> runs<br>avg ${f.avg.toFixed(1)}<br>SR ${f.sr.toFixed(1)}${f.wk?`<br><b>${f.wk}</b> wkts · avg ${f.bavg}`:''}`;
  const d=el('div','fcard pop',`<h4>${first(n)}</h4><div class="vs"><div><i>T20</i>${line(t)}</div><div><i>LONG</i>${line(l)}</div></div><p>${txt}</p>`);d.style.transitionDelay=(i*100)+'ms';fcH.appendChild(d)});

/* ---------- AWARDS 2026: Captain's Gold Glove + the two stat awards (recognition_2026.json via data.js; counts re-checked from the CricClubs fielding tables) ---------- */
const RG=D.recog||{};
{const G=RG.goldGlove,H=$('#awards');if(G&&H){const gp=S(G.player),gf=FUT.fsum(G.player);
  const lead=L=>{const f=FUT.fsum(L.player),p=S(L.player),val=L.award==='Safe Hands'?f.ct:p.dis;   // the shown number is the data's, never the JSON's
    return `<button type="button" class="award pop" data-open="player:${esc(L.player)}" aria-haspopup="dialog"><span class="aimg">${photo(L.player)}</span><span class="abody"><span class="akick">${esc(L.award)}</span><span class="asub">${esc(L.sub)}</span>
     <b class="aname">${esc(disp(L.player))}</b><span class="aval"><b data-count="${val}">${STATIC?val:0}</b><i>${esc(L.unit)}</i></span><span class="anote">${esc(L.note)}</span></span></button>`};
  H.innerHTML=`<article class="gglove reveal"><div class="gg-photo"><button type="button" class="gg-face" data-open="player:${esc(G.player)}" aria-haspopup="dialog" aria-label="${esc(disp(G.player))}: open 2026 stats">${photo(G.player)}</button><span class="gg-medal" aria-hidden="true">GOLD<br>GLOVE</span></div>
    <div class="gg-body"><span class="akick">${esc(G.title)}</span><h3>${esc(disp(G.player))}</h3>
     <p class="gg-sum"><b data-count="${gf.tot}">${STATIC?gf.tot:0}</b> ${esc(G.summary.replace(/^\d+\s*/,''))}</p>
     <div class="gg-hl">${G.highlights.map(h=>`<span class="pop"><b>${esc(h.big)}</b><i>${esc(h.label)}</i><em>${esc(h.note)}</em></span>`).join('')}</div>
     <blockquote class="gg-cite"><p>${esc(G.citation)}</p><footer>${esc(G.citationBy)} · captain&rsquo;s pick, not a stat</footer></blockquote>
     <details class="gg-list"><summary>All ${gf.tot} dismissals, match by match <i>+</i></summary><ol>${G.rows.map(r=>`<li${r.hot?' class="hot"':''}><span class="gl-d">${esc(r.dis)}</span><span class="gl-g"><b>${esc(r.game)}</b> · ${esc(r.result)}${r.hot?` <em>${esc(r.hot)}</em>`:''}<br>${esc(r.ctx)}</span><a href="https://cricclubs.com/QCF/viewScorecard.do?matchId=${r.mid}&amp;clubId=1834" target="_blank" rel="noopener" aria-label="Scorecard, match ${r.mid}">${r.mid} ↗</a></li>`).join('')}</ol></details>
    </div></article><div class="aside">${G.leaders.map(lead).join('')}</div>`;
  if(gf.tot!==gp.dis)console.warn('gold glove: fielding table total differs from season dismissals')}}

/* ---------- ROAD TO 2027 (replaces "Where we grow next"): recognition_2026.json + live season data ---------- */
{const pct=(a,b)=>(100*a/b).toFixed(1);
 const strip=(H,html)=>{const e=$(H);if(e)e.innerHTML=html};
 /* strengths */
 strip('#rStrengths',(RG.strengths||[]).map((x,i)=>`<div class="str pop${i===0?' wide':''}" style="transition-delay:${i%4*90}ms"><b>${esc(x.big)}</b><span class="sk">${esc(x.k)}</span><p>${esc(x.v)}</p></div>`).join(''));
 /* Beyond the Big Two: computed here from data.js season totals */
 {const R=D.totals.runs,W=D.totals.wkts,bt=tr,bw=tw,ko=(RG.bigTwo||{}).koRunsShare;
  const bar=(lab,rest,all,unit)=>`<div class="sbar"><div class="sl"><span>${lab}</span><b><span data-count="${pct(rest,all)}">${STATIC?pct(rest,all):'0.0'}</span>%</b></div><div class="st"><i class="rest" style="--w:${pct(rest,all)}%"></i><i class="big2" style="--w:${pct(all-rest,all)}%"></i></div>
    <div class="sx"><span>Rest of the squad: ${rest.toLocaleString()} ${unit}</span><span>Harsimran + Abhinav: ${(all-rest).toLocaleString()}</span></div></div>`;
  strip('#rBig2',bar('Runs from the rest of the squad',R-bt,R,'runs')+bar('Wickets from the rest of the squad',W-bw,W,'wkts')+
   (ko?`<p class="goalline"><b>Goal:</b> grow the runs share. In the knockouts the rest of the squad made ${(100-ko).toFixed(1)}% of the bat runs, against ${pct(R-bt,R)}% all season.</p>`:''))}
 /* momentum meter */
 strip('#rMomentum',(RG.momentum||[]).map(m=>{const mx=Math.max(m.a,m.b),up=m.lower?m.b<m.a:m.b>m.a,f=v=>Number.isInteger(v)?v:v.toFixed(2);
   return `<div class="mm${up?' up':' down'}"><span class="mn">${esc(first(m.player))}</span><span class="ml">${esc(m.label)}</span>
    <span class="mb"><i class="h1" style="--w:${(100*m.a/mx).toFixed(1)}%"><em>${f(m.a)}</em></i><i class="h2" style="--w:${(100*m.b/mx).toFixed(1)}%"><em>${f(m.b)}</em></i></span>
    <span class="ma" aria-label="${up?'rising':'dipped'}">${up?'▲':'▼'}</span>${m.note?`<span class="mnote">${esc(m.note)}</span>`:''}</div>`}).join('')+'<p class="legend2"><i class="k1"></i>May&ndash;Jul <i class="k2"></i>Aug&ndash;Oct <span>Re-derived from the scorecards; the competition mix differs between halves, so read it as a guide.</span></p>');
 /* Rising Lions carousel */
 strip('#rTrack',(RG.rising||[]).map(r=>`<button type="button" class="rl" data-open="player:${esc(r.player)}" aria-haspopup="dialog"><span class="rlimg">${photo(r.player)}</span><span class="rlb">${r.badges.map(b=>`<em>${esc(b)}</em>`).join('')}</span><b>${esc(disp(r.player))}</b><span>${esc(r.line)}</span></button>`).join(''));
 {const T=$('#rTrack'),C=$('#rRising');if(T&&C){const step=d=>{const c=T.querySelector('.rl');T.scrollBy({left:d*((c?c.offsetWidth:260)+14),behavior:RM||STATIC?'auto':'smooth'})};
   C.querySelector('.prev').onclick=()=>step(-1);C.querySelector('.next').onclick=()=>step(1);
   T.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();step(1)}if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}})}}
 /* phase heatmap (T20 over summaries) */
 {const ph=RG.phases;if(ph){
   const good=(side,k,v)=>side==='Batting'?(k==='rr'?(v-6)/3:(3.2-v)/1.6):(k==='rr'?(9.5-v)/3.5:(v-1.6)/1.8);
   const cell=(side,r,j)=>{const g=Math.max(0,Math.min(1,(good(side,'rr',r.rr[j])+good(side,'wk',r.wk[j]))/2));
     return `<td class="hc" style="--g:${g.toFixed(2)}"><b>${r.rr[j].toFixed(2)}</b><i>runs/over</i><span>${r.wk[j].toFixed(2)} wkts/inns</span><small>${r.n[j]} inns</small></td>`};
   strip('#rHeat',`<div class="table-scroll"><table class="heatt"><thead><tr><th></th>${ph.cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${ph.rows.map(r=>`<tr${r.scope!=='All T20'?' class="ko"':''}><th>${r.side}<i>${r.scope}</i></th>${ph.cols.map((c,j)=>cell(r.side,r,j)).join('')}</tr>`).join('')}</tbody></table></div>
    <p class="legend2"><i class="hk lo"></i>gap to close <i class="hk hi"></i>strength <span>Batting: more runs, fewer wickets lost = stronger. Bowling: fewer runs, more wickets = stronger.</span></p><p class="note">${esc(ph.note)} The knockout rows are small samples (2&ndash;4 innings).</p>`)}}
 /* knockout pressure meter */
 strip('#rPress',(RG.pressure||[]).map(k=>`<div class="pm ${k.res==='W'?'w':'l'}${k.at6[1]>=3?' hot':''}"><span class="pst">${esc(k.stage)}<em>v ${esc(k.opp)}</em></span>
   <span class="pg" role="img" aria-label="${k.at6[0]} for ${k.at6[1]} after 6 overs">${Array.from({length:5},(_,j)=>`<i class="${j<k.at6[1]?'on':''}"></i>`).join('')}</span>
   <span class="ps"><b>${k.at6[0]}/${k.at6[1]}</b><i>after 6</i></span><span class="pr"><i class="chip ${k.res}">${k.res}</i>${esc(k.result)}</span></div>`).join('')+
   `<p class="goalline"><b>The lesson:</b> both knockout wins were 2 or fewer down after 6 overs. 4 down after 6 lost the Final and the Premier T20 quarter-final. Goal 1 below is built on this.</p>`);
 /* six goals */
 strip('#rGoals',(RG.goals||[]).map((g,i)=>`<article class="goal pop" style="transition-delay:${i%3*110}ms"><span class="gn">${String(g.n).padStart(2,'0')}</span><h4>${esc(g.area)}</h4>
   <dl><dt>2026</dt><dd>${esc(g.base)}</dd><dt>Practice</dt><dd>${esc(g.practice)}</dd><dt class="t">2027 target</dt><dd class="t">${esc(g.target)}</dd></dl></article>`).join(''));
 /* goal tracker: bar from 2026 baseline to the 2027 flag; scale fits both */
 strip('#rTrack27',(RG.goals||[]).map(g=>{const t=g.track;if(!t)return '';const mx=Math.max(t.base,t.goal)*1.25,bp=100*t.base/mx,gp=100*t.goal/mx,dp=Number.isInteger(t.base)?0:2;
   return `<div class="tk"><span class="tl"><b>${String(g.n).padStart(2,'0')}</b>${esc(t.label)}</span><span class="tb"><i class="tfill" style="--w:${bp.toFixed(1)}%"></i><i class="tgap" style="--l:${Math.min(bp,gp).toFixed(1)}%;--w:${Math.abs(gp-bp).toFixed(1)}%"></i>
     <span class="tflag" style="--l:${gp.toFixed(1)}%" aria-hidden="true">⚑</span></span><span class="tv"><span>2026 <b>${esc(t.baseText||t.base.toFixed(dp))}</b></span><span class="tg">2027 ${t.goalText?esc(t.goalText):`${t.lower?'≤':''}<b>${t.goal.toFixed(dp)}</b>${t.lower?'':'+'}`}</span><span class="t0">0 matches logged</span></span></div>`}).join(''));
 /* personal challenge cards */
 strip('#rChall',(RG.challenges||[]).map((c,i)=>`<button type="button" class="ch pop" style="transition-delay:${i%3*100}ms" data-open="player:${esc(c.player)}" aria-haspopup="dialog"><span class="chimg">${photo(c.player)}</span><span class="chb"><i>2027 challenge</i><b>${esc(disp(c.player))}</b><strong>${esc(c.goal)}</strong><span>${esc(c.base)}</span></span></button>`).join(''));
 strip('#rSrc','Sources: CricClubs QCF 2026 scorecards, ball-by-ball and season tables. Phase numbers use the T20 over summaries only; momentum compares May&ndash;Jul with Aug&ndash;Oct. No ages are recorded, so &ldquo;Rising Lions&rdquo; means rising form, not age.');
}

/* ---------- LIONS MOMENTS (v3): data.js <- build_data.py <- lions_moments.json ---------- */
const M=D.moments, CAT={comeback:'Comeback',dominant:'Dominant','turning point':'Turning point',drama:'Drama','big stage':'Big stage'};
/* featured player's line (lions_moments.json feature / feature_line) */
const fl=(m,cls)=>m.feature&&m.featLine?`<span class="fline ${cls||''}"><b>${esc(first(m.feature))}</b>${esc(m.featLine)}</span>`:'';
const meta=m=>[m.comp+(m.compNote?` (${m.compNote})`:''),m.stage,fmtDate(m.date),'v '+m.opp].filter(Boolean).join(' · ');
const firstSentence=t=>{const i=t.search(/\.\s/);return i>0?t.slice(0,i+1):t};
const pic=m=>(m.people||[]).find(n=>P.players[n]);
const mimg=(m,cls)=>{const n=pic(m);return n?`<div class="mimg ${cls||''}"><img src="${P.players[n]}" alt="${esc(disp(n))}" loading="lazy"><span class="who">${esc(disp(n))}</span></div>`:
  `<div class="mimg ph ${cls||''}" aria-hidden="true"><img src="img/crest-128.png" alt=""></div>`};
const sc=m=>`<a class="src" href="${m.url}" target="_blank" rel="noopener">Scorecard <i>↗</i></a>`;
const mid=m=>m.rank?'top:'+m.rank:'hm:'+M.hm.indexOf(m);
const card=(m,cls)=>`<article class="mcard ${cls}">${mimg(m)}<button type="button" class="mhit" data-open="moment:${mid(m)}" aria-haspopup="dialog">
  <div class="mtop">${m.rank?`<span class="rk">${String(m.rank).padStart(2,'0')}</span>`:''}<span class="cat c-${m.cat.replace(' ','-')}">${CAT[m.cat]||m.cat}</span></div>
  <span class="k">${esc(meta(m))}</span><h4>${esc(m.title)}</h4>${fl(m)}${cls==='small'?'':`<p>${esc(firstSentence(m.story))}</p>`}<span class="more">Read the story <i>+</i></span></button>${sc(m)}</article>`;
{const f=M.top[0];$('#mFeature').innerHTML=`<article class="feature pop">${mimg(f,'big')}<div class="fbody"><button type="button" class="mhit" data-open="moment:top:1" aria-haspopup="dialog">
  <div class="mtop"><span class="rk big1">01</span><span class="cat c-${f.cat.replace(' ','-')}">${CAT[f.cat]}</span></div><span class="k">${esc(meta(f))}</span>
  <h3 class="ftitle">${esc(f.title)}</h3>${fl(f,'big')}<p>${esc(firstSentence(f.story))}</p><span class="more">Read the story <i>+</i></span></button>${sc(f)}</div></article>`}
const put=(id,html)=>{const H=$(id);H.innerHTML=html;[...H.children].forEach((c,i)=>{c.classList.add('flipin');c.style.transitionDelay=(i%3*140)+'ms'})};
put('#mTop',M.top.filter(m=>m.rank>1&&m.rank<=10).map(m=>card(m,'')).join(''));
/* the Final: a card of its own (rank 11 in lions_moments.json), framed as fight on the biggest stage */
{const H=$('#mFinal'),xs=M.top.filter(m=>m.rank>10);if(H)H.innerHTML=xs.map(f=>`<article class="feature final pop">${mimg(f,'big')}<div class="fbody"><button type="button" class="mhit" data-open="moment:top:${f.rank}" aria-haspopup="dialog">
  <div class="mtop"><span class="rk big1 fin">Final</span><span class="cat c-big-stage">Fight on the biggest stage</span></div><span class="k">${esc(meta(f))}</span>
  <h3 class="ftitle">${esc(f.title)}</h3>${fl(f,'big')}<p>${esc(f.story)}</p><span class="more">Read the story <i>+</i></span></button>${sc(f)}</div></article>`).join('')}
put('#mHM',M.hm.map(m=>card(m,'small')).join(''));
$('#mSrc').textContent='Moments: CricClubs QCF scorecards and ball-by-ball. Each card features one Lion: his CricClubs profile photo and his line from the scorecard. There are no match-day photos in the set.';
builders.moment=id=>{const [g,i]=id.split(':');const m=g==='top'?M.top.find(x=>x.rank==+i):M.hm[+i];
  return `<div class="mdmoment">${mimg(m,'big')}<div><div class="mtop">${m.rank>10?'<span class="rk fin">Final</span>':m.rank?`<span class="rk">${String(m.rank).padStart(2,'0')}</span>`:'<span class="rk hm">HM</span>'}<span class="cat c-${m.cat.replace(' ','-')}">${CAT[m.cat]||m.cat}</span></div>
  <span class="k">${esc(meta(m))}</span><h3 id="mdTitle" class="mdh">${esc(m.title)}</h3>${fl(m,'big')}<p>${esc(m.story)}</p><div class="ks">${esc(m.stat)}</div>
  <a class="btn gold" href="${m.url}" target="_blank" rel="noopener">Full scorecard · match ${m.mid} ↗</a></div></div>`};

/* ---------- KNOCKOUT FALL OF WICKETS (lions_moments.json knockout_collapses + md Pattern) ---------- */
$('#fowPattern').textContent=M.pattern;
const tops=[...M.pattern.matchAll(/(\d+)\/(\d+) \((\d+)\.(\d)\)/g)].map(x=>({r:+x[1],w:+x[2],x:+x[3]+(+x[4])/6}));
M.ko.forEach((k,i)=>{const d=el('div','fow-card reveal');const last=k.fow[k.fow.length-1];
  let col='';if(k.collapse){const a=k.fow.find(p=>p.w===k.collapse[0]),b=k.fow.find(p=>p.w===k.collapse[1]);col=`<span class="pill">${b.w-a.w} wickets for ${b.r-a.r} runs · ${a.r}/${a.w} → ${b.r}/${b.w}</span>`}
  d.innerHTML=`<div class="fh"><span class="k">${esc(k.stage)} · ${fmtDate(k.date)} · v ${esc(k.opp)}</span><h4>${esc(k.batting)}</h4><span class="res">${esc(k.result)}</span></div>
   <div class="chart-box fowbox"><canvas id="fow${i}"></canvas></div>${col}
   <p>${esc(k.note)}</p><div class="fowtxt">FOW: ${esc(k.fow.map(p=>`${p.r}/${p.w} (${p.o})`).join(', '))}</div>
   <a class="src" href="${k.url}" target="_blank" rel="noopener">Full scorecard · match ${k.mid} ↗</a>`;
  $('#fowGrid').appendChild(d);
  const top=tops[i], xmax=Math.max(20,Math.ceil(last.x));
  const shade={id:'shade'+i,beforeDatasetsDraw(c){const {ctx,chartArea:A,scales:{x}}=c;if(!top)return;ctx.save();
     ctx.fillStyle='rgba(232,131,58,.16)';const x1=x.getPixelForValue(top.x);ctx.fillRect(A.left,A.top,x1-A.left,A.bottom-A.top);
     ctx.fillStyle='#E8833A';ctx.font='600 10px Inter, Arial, sans-serif';ctx.fillText(`top order ${top.r}/${top.w}`,A.left+4,A.top+12);
     if(k.collapse){const a=k.fow.find(p=>p.w===k.collapse[0]),b=k.fow.find(p=>p.w===k.collapse[1]);ctx.fillStyle='rgba(255,199,44,.10)';const xa=x.getPixelForValue(a.x),xb=x.getPixelForValue(b.x);ctx.fillRect(xa,A.top+18,xb-xa,A.bottom-A.top-18)}
     ctx.restore()}};
  const lab={id:'lab'+i,afterDatasetsDraw(c){const {ctx}=c,meta=c.getDatasetMeta(0);ctx.save();ctx.font='700 9.5px Inter, Arial, sans-serif';ctx.fillStyle=WHITE;ctx.textAlign='center';
     meta.data.forEach((pt,j)=>{const p=k.fow[j-1];if(!p)return;ctx.fillText(p.w,pt.x,pt.y+3.5)});ctx.restore()}};
  whenVisible('fow'+i,()=>new Chart($('#fow'+i),{type:'line',data:{datasets:[{data:[{x:0,y:0},...k.fow.map(p=>({x:p.x,y:p.r}))],borderColor:GOLD,borderWidth:2,tension:0,
     pointRadius:[0,...k.fow.map(()=>8)],pointBackgroundColor:[GOLD,...k.fow.map(p=>k.collapse&&p.w>k.collapse[0]&&p.w<=k.collapse[1]?ORANGE:'#5a4a22')],pointBorderColor:'#050505',fill:{target:'origin',above:'rgba(255,199,44,.07)'}}]},
     options:{maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>{const p=k.fow[c.dataIndex-1];return p?` ${p.r}/${p.w} after ${p.o} overs`:''},title:()=>''}}},
      scales:{x:{type:'linear',min:0,max:xmax,ticks:{color:'#d9cfb3',stepSize:xmax>20?5:4},grid:{color:GRID},title:{display:true,text:'Overs',color:'#A89E86'}},
              y:{min:0,ticks:{color:'#d9cfb3'},grid:{color:GRID},title:{display:true,text:'Runs',color:'#A89E86'}}}},plugins:[shade,lab]}));
});

/* ---------- PARTICLES (hero embers) & GOLD BURST (moments) ---------- */
function embers(cv,opts){const ctx=cv.getContext('2d');let W,H,P=[];const dpr=Math.min(2,devicePixelRatio||1);
  function size(){W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
  size();addEventListener('resize',()=>{size();if(STATIC)draw(0)});
  const n=Math.round((W*H)/(opts.density||9000));const rnd=(a,b)=>a+Math.random()*(b-a);
  const mk=(y)=>({x:opts.cx!=null&&Math.random()<.55?W*opts.cx+rnd(-1,1)*W*.25:rnd(0,W),y:y??rnd(0,H),r:rnd(.8,3),vy:rnd(.15,.7),vx:rnd(-.25,.25),a:rnd(.25,1),h:rnd(36,48),tw:rnd(0,6.28)});
  for(let i=0;i<n;i++)P.push(mk());
  function draw(t){ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='lighter';
    for(const p of P){const tw=.6+.4*Math.sin(t/600+p.tw);const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);g.addColorStop(0,`hsla(${p.h},100%,62%,${p.a*tw})`);g.addColorStop(1,`hsla(${p.h},100%,50%,0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*4,0,6.283);ctx.fill();ctx.fillStyle=`hsla(${p.h},100%,78%,${Math.min(1,p.a*tw+.2)})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r*.7,0,6.283);ctx.fill()}
    ctx.globalCompositeOperation='source-over'}
  if(STATIC){draw(0);return}
  (function loop(t){for(const p of P){p.y-=p.vy;p.x+=p.vx+Math.sin(t/1500+p.tw)*.15;if(p.y<-10)Object.assign(p,mk(H+10))}draw(t);requestAnimationFrame(loop)})(0);
}
embers($('#particles'),{density:3200,cx:.72});
(function burst(){const cv=$('#burst'),ctx=cv.getContext('2d');const dpr=Math.min(2,devicePixelRatio||1);let W,H;
  function size(){W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}size();addEventListener('resize',()=>{size();if(STATIC)staticFrame()});
  const rnd=(a,b)=>a+Math.random()*(b-a);let parts=[],conf=[];
  function fire(x,y,n){for(let i=0;i<n;i++){const a=rnd(0,6.283),v=rnd(2,7.5);parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:1,d:rnd(.008,.016),h:rnd(32,50),r:rnd(1.2,2.8)})}}
  function confetti(n){for(let i=0;i<n;i++)conf.push({x:rnd(0,W),y:rnd(-H*.4,-10),vy:rnd(1.2,3),vx:rnd(-.6,.6),rot:rnd(0,6.28),vr:rnd(-.15,.15),w:rnd(6,11),h:rnd(3,6),c:['#FFD23F','#F5B421','#E8833A','#FFF2B0'][i%4]})}
  function staticFrame(){ // final "after-glow": sparkles around the header + a few resting confetti
    const n=Math.round(W*H/7000);ctx.globalCompositeOperation='lighter';
    for(let i=0;i<n;i++){const top=Math.random()<.6;const x=top?W/2+rnd(-1,1)*W*.42:rnd(0,W),y=top?rnd(20,420):rnd(0,H),r=rnd(.6,2.4),h=rnd(34,50);const g=ctx.createRadialGradient(x,y,0,x,y,r*4);g.addColorStop(0,`hsla(${h},100%,62%,${rnd(.3,.9)})`);g.addColorStop(1,'hsla(40,100%,50%,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*4,0,6.283);ctx.fill()}
    ctx.globalCompositeOperation='source-over';}
  if(STATIC){staticFrame();return}
  let running=false,t0;
  function loop(t){if(!t0)t0=t;ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='lighter';
    parts=parts.filter(p=>p.life>0);for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.vy+=.06;p.vx*=.985;p.life-=p.d;ctx.fillStyle=`hsla(${p.h},100%,${55+p.life*20}%,${p.life})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fill()}
    ctx.globalCompositeOperation='source-over';
    conf=conf.filter(c=>c.y<H+20);for(const c of conf){c.y+=c.vy;c.x+=c.vx+Math.sin((t+c.rot*500)/400)*.6;c.rot+=c.vr;ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.rot);ctx.fillStyle=c.c;ctx.fillRect(-c.w/2,-c.h/2,c.w,c.h*Math.abs(Math.cos(c.rot*2)));ctx.restore()}
    if(parts.length||conf.length)requestAnimationFrame(loop);else running=false}
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting||running)return;running=true;t0=0;
    const y0=Math.min(320,H*.12);[[.5,y0,160],[.22,y0+80,90],[.78,y0+80,90]].forEach(([fx,y,n],i)=>setTimeout(()=>fire(W*fx,y,n),i*260));
    setTimeout(()=>fire(W*.5,y0+40,120),900);confetti(Math.min(220,Math.round(W/6)));requestAnimationFrame(loop)}),{threshold:.2});
  io.observe($('#moments'));
})();

/* ---------- COUNTERS ---------- */
function countUp(e){if(e.dataset.done)return;e.dataset.done=1;const to=parseFloat(e.dataset.count);if(isNaN(to))return;const dec=(e.dataset.count.split('.')[1]||'').length;
  if(STATIC){e.textContent=to.toLocaleString(undefined,{minimumFractionDigits:dec,maximumFractionDigits:dec});return}
  const t0=performance.now(),dur=1600;(function f(t){const k=Math.min(1,(t-t0)/dur),v=to*(1-Math.pow(1-k,3));e.textContent=v.toLocaleString(undefined,{minimumFractionDigits:dec,maximumFractionDigits:dec});if(k<1)requestAnimationFrame(f)})(t0)}

/* ---------- REVEAL ENGINE ---------- */
const revealables=document.querySelectorAll('.reveal,.pop,.flipin');
if(STATIC){
  document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager');
  const fd=$('#fowDetails');if(fd)fd.open=true;
  revealables.forEach(e=>e.classList.add('in'));document.querySelectorAll('[data-count]').forEach(countUp);lazy.forEach(l=>{l.fn();l.done=true});
  {const o=new URLSearchParams(location.search).get('open');if(o)openModal(o,null)}
  window.__ready=true;
}else{
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;const t=en.target;t.classList.add('in');t.querySelectorAll('[data-count]').forEach(countUp);if(t.dataset.count)countUp(t);io.unobserve(t)}),{threshold:.15,rootMargin:'0px 0px -8% 0px'});
  revealables.forEach(e=>io.observe(e));document.querySelectorAll('.sub [data-count]').forEach(e=>io.observe(e));
  const cio=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;const l=lazy.find(x=>x.el===en.target);if(l&&!l.done){l.done=true;l.fn()}cio.unobserve(en.target)}),{threshold:.25});
  lazy.forEach(l=>cio.observe(l.el));
  window.__ready=true;
}
/* progress bar + active nav */
const prog=$('#progress'),links=[...document.querySelectorAll('.nav nav a')];
addEventListener('scroll',()=>{const h=document.documentElement;prog.style.width=(100*h.scrollTop/(h.scrollHeight-h.clientHeight))+'%';
  let cur='';document.querySelectorAll('section[id]').forEach(s=>{if(s.getBoundingClientRect().top<120)cur=s.id});links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+cur))},{passive:true});
})();
