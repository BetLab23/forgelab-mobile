const URL='https://ocakkunttbjmlvljekbu.supabase.co/rest/v1',KEY='sb_publishable_qgTkkrzwbyWthC_zwWHKcw_PWyrwFKx';
const DAYS=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];let state={week:1,tab:'series',block:'main',priorities:[],series:[]},poll;
const ranges={maintenance:{'Cou':{P0:[8,12],P1:[5,8],P2:[2,4]},'Trapèzes supérieurs':{P0:[12,16],P1:[8,12],P2:[4,6]},'Trapèzes moyens':{P0:[12,16],P1:[8,12],P2:[4,6]},'Deltoïde antérieur':{P0:[8,12],P1:[6,8],P2:[2,4]},'Deltoïde latéral':{P0:[12,18],P1:[8,12],P2:[4,6]},'Deltoïde postérieur':{P0:[12,16],P1:[8,12],P2:[4,6]},'Pectoraux':{P0:[12,18],P1:[8,12],P2:[4,6]},'Dos':{P0:[12,18],P1:[8,12],P2:[4,6]},'Biceps':{P0:[12,16],P1:[8,12],P2:[4,6]},'Triceps':{P0:[12,18],P1:[8,12],P2:[4,6]},'Avant-bras':{P0:[8,12],P1:[6,8],P2:[2,4]},'Abdominaux':{P0:[8,12],P1:[6,8],P2:[2,4]},'Quadriceps':{P0:[12,18],P1:[8,12],P2:[4,6]},'Adducteurs':{P0:[8,12],P1:[6,8],P2:[2,4]},'Ischios':{P0:[10,16],P1:[6,10],P2:[3,5]},'Fessiers':{P0:[12,18],P1:[8,12],P2:[4,6]},'Mollets':{P0:[9,12],P1:[6,9],P2:[3,5]}}};
const delta={deficit:-1,surplus:1};function derivedRange(m,p){let base=ranges.maintenance[m]?.[p]||[0,0],mode=inferNutrition();if(mode==='maintenance')return base;return base.map(x=>Math.max(0,x+(delta[mode]||0)))}
function inferNutrition(){for(const r of state.priorities){const b=ranges.maintenance[r.muscle_name]?.[r.priority];if(!b)continue;if(+r.target_min===b[0]&&+r.target_max===b[1])return'maintenance';if(+r.target_min===Math.max(0,b[0]-1)&&+r.target_max===Math.max(0,b[1]-1))return'deficit';if(+r.target_min===b[0]+1&&+r.target_max===b[1]+1)return'surplus'}return'maintenance'}
function hdr(extra={}){return{apikey:KEY,'Content-Type':'application/json',...extra}}async function req(path,opt={}){let r=await fetch(URL+path,{...opt,headers:hdr(opt.headers)});if(!r.ok)throw Error(await r.text());return r.status===204?null:r.json()}
function cloud(t,c=''){let e=document.querySelector('#cloud');e.textContent='● CLOUD · '+t;e.className='cloud '+c}
async function load(render=true){try{
  let[a,b,c]=await Promise.all([
    req('/forgelab_state?select=*&id=eq.main'),
    req('/forgelab_priorities?select=*&order=id.asc'),
    req('/forgelab_series?select=*&block_key=eq.main')
  ]);

  state.block=a[0]?.active_block||'main';
  state.week=state.userWeek||a[0]?.active_week||1;
  state.priorities=b;

  // While a Series field is being edited, keep the local Series values.
  // Cloud data can refresh again as soon as editing has finished.
  const focusedSeries = document.activeElement && document.activeElement.classList?.contains('series-input');
  const editingNow = state.tab==='series' && (focusedSeries || (typeof editingSeries!=='undefined' && editingSeries.size>0));
  if(!editingNow) state.series=c;

  cloud('SYNCHRONISÉ','ok');

  // Never rebuild the Series DOM while the iOS keyboard is open.
  if(render && !editingNow) draw();
}catch(e){console.error(e);cloud('HORS LIGNE','err')}}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function rows(m){return state.series.filter(x=>+x.week===+state.week&&x.muscle_key===m)}function total(m){return rows(m).reduce((a,x)=>a+(+x.series||0),0)}function pRange(p){return[+p.target_min,+p.target_max]}
function weeks(){let d=document.querySelector('#weekDots');d.innerHTML=Array.from({length:13},(_,i)=>`<button class="${state.week===i+1?'active':''}" data-w="${i+1}">${i+1}</button>`).join('');d.querySelectorAll('button').forEach(b=>b.onclick=()=>setWeek(+b.dataset.w))}
async function setWeek(w){state.week=Math.min(13,Math.max(1,w));state.userWeek=state.week;await req('/forgelab_state?id=eq.main',{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({active_week:state.week,updated_at:new Date().toISOString()})});draw()}
function draw(){document.querySelector('#weekTitle').textContent='S'+state.week;document.querySelector('#blockTitle').textContent=state.block==='main'?'Bloc actif':state.block;weeks();document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.tab));state.tab==='priorities'?drawPriorities():state.tab==='tracking'?drawTracking():drawSeries()}
function title(t){return`<h2 class="section-title">${t}</h2>`}
function nutritionLabel(){return inferNutrition()==='deficit'?'Déficit':inferNutrition()==='surplus'?'Surplus':'Maintien'}
function drawPriorities(){let v=document.querySelector('#view'),counts={P0:0,P1:0,P2:0};state.priorities.forEach(p=>counts[p.priority]=(counts[p.priority]||0)+1);v.innerHTML=title('Priorités')+`<section class="priority-overview"><div><small>CONTEXTE DU BLOC</small><strong>${nutritionLabel()}</strong></div><div class="priority-counts"><span class="pc0">P0 · ${counts.P0}</span><span class="pc1">P1 · ${counts.P1}</span><span class="pc2">P2 · ${counts.P2}</span></div><p>Les cibles sont synchronisées avec ForgeLab PC. Touchez P0, P1 ou P2 pour modifier une priorité.</p></section>`+state.priorities.map(p=>{let t=total(p.muscle_key);return`<article class="card ${p.priority.toLowerCase()} priority-card"><div class="cardhead"><div><div class="muscle">${esc(p.muscle_name)}</div><div class="range">Cible · <b>${p.target_min}–${p.target_max}</b> séries / semaine</div></div><span class="badge">${p.priority}</span></div><div class="priority-meta"><span>S${state.week} actuellement</span><strong>${t} séries</strong></div><div class="prio-buttons">${['P0','P1','P2'].map(x=>`<button data-m="${esc(p.muscle_key)}" data-p="${x}" class="${p.priority===x?'selected':''}">${x}<small>${derivedRange(p.muscle_name,x).join('–')}</small></button>`).join('')}</div></article>`}).join('');v.querySelectorAll('.prio-buttons button').forEach(b=>b.onclick=()=>changePriority(b.dataset.m,b.dataset.p))}
async function changePriority(muscleKey,priority){let p=state.priorities.find(x=>x.muscle_key===muscleKey);if(!p)return;let[min,max]=derivedRange(p.muscle_name,priority);cloud('ENREGISTREMENT…');await req('/forgelab_priorities?muscle_key=eq.'+encodeURIComponent(muscleKey),{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({priority,target_min:min,target_max:max,updated_at:new Date().toISOString()})});await load()}
let saveTimers={};
function drawSeries(){
  let v=document.querySelector('#view');
  v.innerHTML=title('Séries / semaine')+state.priorities.map(p=>{
    let map=Object.fromEntries(rows(p.muscle_key).map(x=>[+x.day,+x.series]));
    return`<article class="card ${p.priority.toLowerCase()}" data-card="${esc(p.muscle_key)}">
      <div class="cardhead"><div><div class="muscle">${esc(p.muscle_name)}</div><div class="range">Cible ${p.target_min}–${p.target_max}</div></div><span class="badge">${p.priority}</span></div>
      <div class="days">${DAYS.map((d,i)=>`<div class="day"><label>${d}</label><input class="series-input" type="text" inputmode="numeric" pattern="[0-9]*" enterkeyhint="done" value="${map[i+1]||0}" data-m="${esc(p.muscle_key)}" data-d="${i+1}" aria-label="${d} ${esc(p.muscle_name)}"></div>`).join('')}</div>
      <div class="totalrow"><span>Total semaine</span><b data-total="${esc(p.muscle_key)}">${total(p.muscle_key)} séries</b></div>
    </article>`
  }).join('');

  wireSeriesInputs(v);
}

let editingSeries = new Set();

function seriesEditKey(el){
  return `${state.week}|${el.dataset.m}|${el.dataset.d}`;
}

function wireSeriesInputs(v){
  v.querySelectorAll('.series-input').forEach(i=>{
    i.addEventListener('focus',()=>{
      editingSeries.add(seriesEditKey(i));
      if(i.value==='0') i.select();
    });

    i.addEventListener('input',()=>{
      let raw=i.value.replace(/[^0-9]/g,'');
      if(raw!==i.value) i.value=raw;
      const n=raw==='' ? 0 : Math.max(0,Math.min(99,parseInt(raw,10)||0));
      editingSeries.add(seriesEditKey(i));
      updateSeriesLocal(i.dataset.m,+i.dataset.d,n);
      queueSeriesSave(i.dataset.m,+i.dataset.d,n);
    });

    i.addEventListener('blur',()=>{
      const key=seriesEditKey(i);
      setTimeout(()=>editingSeries.delete(key), 250);
    });
  });
}

function renderAfterCloudLoad(){
  if(state.view==='series' && editingSeries.size>0) return;
  if(typeof render==='function') render();
}

function updateSeriesLocal(m,d,n){
  let r=state.series.find(x=>+x.week===+state.week&&x.muscle_key===m&&+x.day===+d);
  if(r) r.series=n;
  else state.series.push({block_key:'main',week:state.week,muscle_key:m,day:d,series:n});
  const totalEl=document.querySelector(`[data-total="${CSS.escape(m)}"]`);
  if(totalEl) totalEl.textContent=total(m)+' séries';
}
function queueSeriesSave(m,d,n){
  const k=`${state.week}|${m}|${d}`;
  clearTimeout(saveTimers[k]);
  cloud('ENREGISTREMENT…');
  saveTimers[k]=setTimeout(()=>saveSeries(m,d,n),500);
}
async function saveSeries(m,d,n){
  n=Math.max(0,Math.round(n||0));
  try{
    let path=`/forgelab_series?block_key=eq.main&week=eq.${state.week}&muscle_key=eq.${encodeURIComponent(m)}&day=eq.${d}`;
    if(n===0) await req(path,{method:'DELETE',headers:{Prefer:'return=minimal'}});
    else await req('/forgelab_series?on_conflict=block_key,week,muscle_key,day',{
      method:'POST',
      headers:{Prefer:'resolution=merge-duplicates,return=minimal'},
      body:JSON.stringify([{block_key:'main',week:state.week,muscle_key:m,day:d,series:n,updated_at:new Date().toISOString()}])
    });
    cloud('SYNCHRONISÉ','ok');
  }catch(e){
    console.error(e);
    cloud('HORS LIGNE','err');
  }
}
function drawTracking(){
  const minimum=state.priorities.reduce((a,p)=>a+(+p.target_min||0),0);
  const done=state.priorities.reduce((a,p)=>a+total(p.muscle_key),0);
  const remain=state.priorities.reduce((a,p)=>a+Math.max(0,(+p.target_min||0)-total(p.muscle_key)),0);
  const credited=state.priorities.reduce((a,p)=>a+Math.min(total(p.muscle_key),(+p.target_min||0)),0);
  const pct=minimum?Math.round(credited/minimum*100):0;
  const atMin=state.priorities.filter(p=>total(p.muscle_key)>=(+p.target_min||0)).length;
  let v=document.querySelector('#view');
  v.innerHTML=title('Suivi hebdomadaire')+
  `<p class="tracking-intro">Compare les cibles définies dans « Priorités » aux séries renseignées dans « Séries / semaine ».</p>`+
  `<div class="summary tracking-summary">
    <div class="kpi"><b>${minimum}</b><span>minimum recommandé cumulé</span></div>
    <div class="kpi"><b>${done}</b><span>séries réalisées</span></div>
    <div class="kpi"><b>${remain}</b><span>restantes jusqu’aux minimums</span></div>
    <div class="kpi"><b>${pct}%</b><span>avancement global</span></div>
  </div>`+
  `<section class="tracking-headline"><div><small>SEMAINE ${state.week}</small><strong>${atMin} / ${state.priorities.length}</strong><span>groupes au minimum</span></div><div class="overall-ring"><b>${pct}%</b><span>progression</span></div></section>`+
  state.priorities.map(p=>{
    const t=total(p.muscle_key),[mi,ma]=pRange(p),left=Math.max(0,mi-t);
    const pc=mi?Math.min(100,Math.round(t/mi*100)):100;
    const st=t<mi?['Sous la cible','low']:t>ma?['Maximum dépassé','high']:['Dans la cible','ok'];
    const barClass=t>ma?'over':t>=mi?'target':'under';
    return`<article class="card ${p.priority.toLowerCase()} tracking-card">
      <div class="cardhead"><div><div class="muscle">${esc(p.muscle_name)}</div><div class="range">Priorité ${p.priority} · cible ${mi}–${ma}</div></div><span class="status ${st[1]}">${st[0]}</span></div>
      <div class="tracking-numbers"><div><span>Prévu</span><b>${mi}–${ma}</b></div><div><span>Réalisé</span><b>${t}</b></div><div><span>Reste</span><b>${left}</b></div></div>
      <div class="progress ${barClass}"><i style="width:${pc}%"></i></div>
      <div class="trackline"><span>${pc}% du minimum</span><strong>${t} / ${mi}</strong></div>
    </article>`
  }).join('')
}
document.querySelectorAll('nav button').forEach(b=>b.onclick=async()=>{
  state.tab=b.dataset.tab;
  await load(false);
  draw();
});document.querySelector('#prevWeek').onclick=()=>setWeek(state.week-1);document.querySelector('#nextWeek').onclick=()=>setWeek(state.week+1);load();poll=setInterval(()=>load(state.tab!=='series'),12000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)load()});
