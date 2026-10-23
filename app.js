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
const photo=(n,cls)=>P.players[n]?`<img class="${cls||''}" src="${P.players[n]}" alt="${esc(disp(n))}, CricClubs profile photo" loading="lazy">`:
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
/* hero squad orbit: every player gets a card that circles the crest (desktop), a looping row passing under it (phones),
   a static ring / scrollable row with prefers-reduced-motion or ?static=1. Clicking a card opens the existing player modal. */
(function(){
 const stage=$('#orbit'),track=$('#orbitTrack');if(!stage||!track)return;
 const PH=new Set(['Mohamad Vahora','Lakhwinder Singh','Jashan Lubana','Abu Taher Arafat','Sarvpreet Guru']); // poor / missing CricClubs photos
 const names=[...KEY,...rest.map(p=>p.name)].filter((n,i,a)=>a.indexOf(n)===i);
 const cname=n=>{const w=disp(n).split(' ');return w.length>2?w[0]+' '+w.slice(1,-1).map(x=>x[0]+'.').join(' ')+' '+w[w.length-1]:w.join(' ')};
 const face=n=>(!PH.has(n)&&P.players[n])?`<img src="${P.players[n]}" alt="${esc(disp(n))}, CricClubs profile photo" decoding="async">`:
   `<span class="ph-face oc-ph" role="img" aria-label="Punjab Lions crest placeholder for ${esc(disp(n))}"><img src="img/crest-128.png" alt=""><b>${ini(n)}</b></span>`;
 const mk=(n,dup)=>{const role=(D.players[n]||{}).role||'';const c=el('button','ocard');c.type='button';c.dataset.open='player:'+n;c.setAttribute('aria-haspopup','dialog');
   c.setAttribute('aria-label',disp(n)+(role?', '+role:'')+': open 2026 stats');if(dup){c.tabIndex=-1;c.setAttribute('aria-hidden','true')}
   c.innerHTML=`<span class="oc-in"><span class="oc-face">${face(n)}</span><b class="oc-name">${esc(cname(n))}</b>${role?`<span class="oc-role">${esc(role)}</span>`:''}</span>`;return c};
 const still=STATIC||RM, wide=matchMedia('(min-width:1200px)');
 let cards=[],mode='',raf=0,ang=0,clk=0,spd=0,hold=false,vis=true,last=0,geo=null,zs=[];
 function build(){cancelAnimationFrame(raf);raf=0;track.innerHTML='';mode=wide.matches?'ring':'row';stage.className='orbit '+mode+(still?' still':'');
   if(mode==='ring'){cards=names.map(n=>mk(n));cards.forEach(c=>track.appendChild(c));zs=cards.map(()=>-1);measure();frame(clk);if(!still)loop()}
   else{cards=[];const row=el('div','oc-row');names.forEach(n=>row.appendChild(mk(n)));if(!still)names.forEach(n=>row.appendChild(mk(n,true)));track.appendChild(row)}}
 function measure(){const W=stage.clientWidth,H=stage.clientHeight,sr=stage.getBoundingClientRect();
   // never let the ring reach the headline column: find the right-most edge of the hero copy's text and buttons
   let edge=0;const w=document.createTreeWalker($('.hero-copy'),NodeFilter.SHOW_TEXT),rg=document.createRange();let tn;
   while(tn=w.nextNode()){rg.selectNodeContents(tn);for(const r of rg.getClientRects())edge=Math.max(edge,r.right)}
   document.querySelectorAll('.hero-copy .btn').forEach(b=>edge=Math.max(edge,b.getBoundingClientRect().right));
   const rx=Math.max(150,Math.min(290,W*.65,sr.left+W/2-edge-52));geo={cx:W/2,cy:H*.6,rx,ry:rx*.36}}
 function frame(t){const g=geo,N=cards.length;for(let i=0;i<N;i++){const a=ang+i*2*Math.PI/N,s=Math.sin(a),d=(s+1)/2; // d: 0 = back (behind crest), 1 = front
     const bob=still?0:Math.sin(t/900+i*1.7)*5,x=g.cx+Math.cos(a)*g.rx,y=g.cy+s*g.ry+bob,sc=.52+.48*d;
     const c=cards[i];c.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%) perspective(700px) rotateY(${(Math.cos(a)*-48).toFixed(1)}deg) scale(${sc.toFixed(3)})`;c.style.opacity=(s<0?.22+.6*d:.5+.5*d).toFixed(2);
     const z=s<-.05?1+Math.round(d*8):12+Math.round(d*20);if(z!==zs[i]){zs[i]=z;c.style.zIndex=z}}}
 function loop(){last=performance.now();const step=t=>{const dt=Math.min(50,t-last);last=t;const target=hold?0:1;spd+=(target-spd)*(hold?1:Math.min(1,dt/600));
     ang+=spd*dt*2*Math.PI/90000;clk+=spd*dt; // one lap every ~90 s; the bob clock stops with the ring
     frame(clk);raf=vis?requestAnimationFrame(step):0};raf=requestAnimationFrame(step)}
 const wake=()=>{if(mode==='ring'&&!still&&!raf&&vis&&!document.hidden)loop()};
 track.addEventListener('pointerover',e=>{if(e.target.closest('.ocard'))hold=true});
 track.addEventListener('pointerout',e=>{if(!e.relatedTarget||!e.relatedTarget.closest||!e.relatedTarget.closest('.ocard'))hold=track.contains(document.activeElement)&&document.activeElement.matches(':focus-visible')});
 track.addEventListener('focusin',e=>{if(e.target.matches(':focus-visible')){hold=true;stage.classList.add('hold')}}); // a focused card never slides away from the keyboard user
 track.addEventListener('focusout',()=>{hold=false;stage.classList.remove('hold')});
 // phones: pause the row while a finger is on it, resume shortly after
 let tt=0;track.addEventListener('touchstart',()=>{clearTimeout(tt);stage.classList.add('hold')},{passive:true});
 track.addEventListener('touchend',()=>{clearTimeout(tt);tt=setTimeout(()=>{if(!track.contains(document.activeElement))stage.classList.remove('hold')},2500)},{passive:true});
 new IntersectionObserver(es=>{vis=es[0].isIntersecting;stage.classList.toggle('off',!vis);if(vis)wake();else{cancelAnimationFrame(raf);raf=0}}).observe(stage);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else wake()});
 if(window.ResizeObserver)new ResizeObserver(()=>{if(mode==='ring'){measure();frame(clk)}}).observe(stage);
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{if(mode==='ring'){measure();frame(clk)}});
 (wide.addEventListener?wide.addEventListener('change',build):wide.addListener(build));
 build();
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
  new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)R.querySelectorAll('.vcard.playing').forEach(stop)})).observe(R)}}
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
builders.player=n=>{const pc=(D.pcomp||{})[n]||{},m=D.players[n]||{},ks=D.comps.map(c=>c.key).filter(k=>pc[k]);
  const T=(title,cols,get)=>{const rows=ks.filter(k=>pc[k][get]);if(!rows.length)return '';return `<h4>${title}</h4><div class="table-scroll"><table class="stbl"><thead><tr><th>Competition</th>${cols.map(c=>`<th>${c[0]}</th>`).join('')}</tr></thead><tbody>${rows.map(k=>`<tr><td>${CL(k)}</td>${cols.map(c=>`<td>${c[1](pc[k][get])??'–'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`};
  const v=x=>x==null||x===''?'–':x;
  const bat=T('Batting',[['Mat',b=>v(b.Mat)],['Inns',b=>v(b.Ins)],['NO',b=>v(b.No)],['Runs',b=>v(b.Runs)],['Balls',b=>v(b.Balls)],['HS',b=>v(b.Hs)],['Avg',b=>v(b.Avg)],['SR',b=>v(b.Sr)],['50s',b=>v(b['50s'])],['4s',b=>v(b['4s'])],['6s',b=>v(b['6s'])]],'bat');
  const bowl=T('Bowling',[['Mat',b=>v(b.Mat)],['Inns',b=>v(b.Inns)],['Overs',b=>v(b.Overs)],['Mdns',b=>v(b.Mdns)],['Runs',b=>v(b.Runs)],['Wkts',b=>v(b.Wkts)],['Econ',b=>v(b.Econ)],['Avg',b=>v(b.Ave)],['SR',b=>v(b.SR)],['Wides',b=>v(b.Wides)]],'bowl');
  const fld=T('Fielding',[['Catches',f=>v(f.Catches)],['WK catches',f=>v(f['WK Catches'])],['Run outs (direct)',f=>v(f['Direct RO'])],['Run outs (indirect)',f=>v(f['Indirect RO'])],['Stumpings',f=>v(f.Stumpings)],['Total',f=>v(f.Total)]],'field');
  const by=worldOf(n).map(w=>({url:w.url||'#canada',img:w.img,caption:w.title+(w.sub?' - '+w.sub:''),meta:w.date?fmtDate(w.date)+' · Instagram ↗':'Lions on the world stage ↓',ext:!!w.url}));
  return `<div class="mdplayer"><div class="mdface">${photo(n)}</div><div><span class="fmt">${esc(roleOf(n))}</span><h3 id="mdTitle" class="mdh">${esc(disp(n))}</h3><p class="one">${headline(n)} <span class="muted">· whole season</span></p>
   ${m.url?`<a class="btn ghost sm" href="${m.url}" target="_blank" rel="noopener">CricClubs profile ↗</a>`:''}
   ${by.length?`<div class="mdbeyond">${by.map(x=>`<a href="${x.url}"${x.ext?' target="_blank" rel="noopener"':''}><img src="${x.img}" alt="${esc(x.caption)}"><span>${esc(x.caption.split(' - ')[0])}<em>${x.meta}</em></span></a>`).join('')}</div>`:''}</div></div>
   ${bat}${bowl}${fld}${ks.length?'':'<p class="note">No 2026 records in the CricClubs tables.</p>'}<p class="fine">Source: CricClubs 2026 batting, bowling and fielding tables per competition.</p>`};

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

/* ---------- KNOCKOUTS ---------- */
const KO=[];D.comps.forEach(c=>c.matches.filter(m=>!/League/.test(m.stage)).forEach(m=>KO.push({...m,comp:c.label})));
KO.sort((a,b)=>(a.o==='W')-(b.o==='W')||a.date.localeCompare(b.date));
const koOrder=KO.filter(k=>k.o==='L').concat(KO.filter(k=>k.o==='W'&&k.stage==='Semi Final'));
const koG=$('#koGrid');
koOrder.forEach((k,i)=>{const [r,w]=k.us.split('/').map(Number);const win=k.o==='W';
  const d=el('div','kocard pop'+(win?' win':''),`<span class="stg">${k.comp} · ${k.stage}${win?' · the contrast':''}</span>
   <div class="score"><span data-count="${r}">${r}</span><small>/${w}</small></div><div class="ov">${win?'':'all out · '}${k.usov.split('/')[0]} overs · ${k.batFirst?'batting first':'chasing '+(parseInt(k.them)+1)}</div>
   <div class="wk">${Array.from({length:10},(_,j)=>`<i class="${j<w?'':'off'}" style="animation-delay:${j*60}ms"></i>`).join('')}</div>
   <div class="res">${k.result}${k.o==='L'?` (${k.them} in ${k.thov.split('/')[0]} ov)`:''}</div>`);
  d.style.transitionDelay=(i*120)+'ms';koG.appendChild(d)});
whenVisible('alloutChart',()=>new Chart($('#alloutChart'),{type:'bar',data:{labels:D.comps.map(c=>c.label),datasets:[{label:'Bowled out',data:D.comps.map(c=>c.allOut),backgroundColor:ORANGE,borderRadius:6},{label:'Not bowled out',data:D.comps.map(c=>c.played-c.allOut),backgroundColor:'#3A3428',borderRadius:6}]},
  options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:WHITE}},tooltip:{callbacks:{footer:it=>{const c=D.comps[it[0].dataIndex];return `${c.allOut} of ${c.played} innings`}}}},scales:{x:{stacked:true,grid:{display:false},ticks:{color:WHITE,font:{weight:600}}},y:{stacked:true,grid:{color:GRID},ticks:{color:'#d9cfb3',stepSize:1},title:{display:true,text:'Innings',color:'#A89E86'}}}}}));
whenVisible('widesChart',()=>new Chart($('#widesChart'),{type:'bar',data:{labels:D.comps.map(c=>`${c.label} (${c.wides} in ${c.overs} ov)`),datasets:[{label:'Wides per over',data:D.comps.map(c=>c.widesPerOver),backgroundColor:D.comps.map(c=>c.key==='premier_t20'?ORANGE:'#6B5A38'),borderRadius:6}]},
  options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{min:0,max:0.7,grid:{color:GRID},ticks:{color:'#d9cfb3'}},y:{grid:{display:false},ticks:{color:WHITE,font:{weight:600}}}}},
  plugins:[{id:'v',afterDatasetsDraw(ch){const ctx=ch.ctx;ctx.save();ctx.font='700 12px Inter, Arial, sans-serif';ctx.fillStyle=WHITE;ch.getDatasetMeta(0).data.forEach((b,i)=>ctx.fillText(ch.data.datasets[0].data[i].toFixed(2),b.x+6,b.y+4));ctx.restore()}}]}));


/* ---------- LIONS MOMENTS (v3): data.js <- build_data.py <- lions_moments.json ---------- */
const M=D.moments, CAT={comeback:'Comeback',dominant:'Dominant','turning point':'Turning point',drama:'Drama'};
const meta=m=>[m.comp+(m.compNote?` (${m.compNote})`:''),m.stage,fmtDate(m.date),'v '+m.opp].filter(Boolean).join(' · ');
const firstSentence=t=>{const i=t.search(/\.\s/);return i>0?t.slice(0,i+1):t};
const pic=m=>(m.people||[]).find(n=>P.players[n]);
const mimg=(m,cls)=>{const n=pic(m);return n?`<div class="mimg ${cls||''}"><img src="${P.players[n]}" alt="${esc(disp(n))}" loading="lazy"><span class="who">${esc(disp(n))}</span></div>`:
  `<div class="mimg ph ${cls||''}" aria-hidden="true"><img src="img/crest-128.png" alt=""></div>`};
const sc=m=>`<a class="src" href="${m.url}" target="_blank" rel="noopener">Scorecard <i>↗</i></a>`;
const mid=m=>m.rank?'top:'+m.rank:'hm:'+M.hm.indexOf(m);
const card=(m,cls)=>`<article class="mcard ${cls}">${mimg(m)}<button type="button" class="mhit" data-open="moment:${mid(m)}" aria-haspopup="dialog">
  <div class="mtop">${m.rank?`<span class="rk">${String(m.rank).padStart(2,'0')}</span>`:''}<span class="cat c-${m.cat.replace(' ','-')}">${CAT[m.cat]||m.cat}</span></div>
  <span class="k">${esc(meta(m))}</span><h4>${esc(m.title)}</h4>${cls==='small'?'':`<p>${esc(firstSentence(m.story))}</p>`}<span class="more">Read the story <i>+</i></span></button>${sc(m)}</article>`;
{const f=M.top[0];$('#mFeature').innerHTML=`<article class="feature pop">${mimg(f,'big')}<div class="fbody"><button type="button" class="mhit" data-open="moment:top:1" aria-haspopup="dialog">
  <div class="mtop"><span class="rk big1">01</span><span class="cat c-${f.cat.replace(' ','-')}">${CAT[f.cat]}</span></div><span class="k">${esc(meta(f))}</span>
  <h3 class="ftitle">${esc(f.title)}</h3><p>${esc(firstSentence(f.story))}</p><span class="more">Read the story <i>+</i></span></button>${sc(f)}</div></article>`}
const put=(id,html)=>{const H=$(id);H.innerHTML=html;[...H.children].forEach((c,i)=>{c.classList.add('flipin');c.style.transitionDelay=(i%3*140)+'ms'})};
put('#mTop',M.top.slice(1).map(m=>card(m,'')).join(''));
put('#mHM',M.hm.map(m=>card(m,'small')).join(''));
$('#mSrc').textContent='Moments: CricClubs QCF scorecards and ball-by-ball. Pictures are the CricClubs profile photo of the Lion named first in the moment; there are no match-day photos in the set.';
builders.moment=id=>{const [g,i]=id.split(':');const m=g==='top'?M.top.find(x=>x.rank==+i):M.hm[+i];
  return `<div class="mdmoment">${mimg(m,'big')}<div><div class="mtop">${m.rank?`<span class="rk">${String(m.rank).padStart(2,'0')}</span>`:'<span class="rk hm">HM</span>'}<span class="cat c-${m.cat.replace(' ','-')}">${CAT[m.cat]||m.cat}</span></div>
  <span class="k">${esc(meta(m))}</span><h3 id="mdTitle" class="mdh">${esc(m.title)}</h3><p>${esc(m.story)}</p><div class="ks">${esc(m.stat)}</div>
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
