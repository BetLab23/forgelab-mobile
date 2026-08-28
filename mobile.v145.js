const URL='https://ocakkunttbjmlvljekbu.supabase.co/rest/v1',KEY='sb_publishable_qgTkkrzwbyWthC_zwWHKcw_PWyrwFKx';
const DAYS=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];let state={week:1,tab:'series',block:'main',priorities:[],series:[]},poll;
const CARDIO_TYPES=['Course · endurance','Course · intervalles','Vélo','Rameur','Air bike','Elliptique','Marche inclinée','Corde à sauter','Burpees','Circuit maison','Sled push / pull','Farmer carry'];
const CARDIO_INTENSITIES=['Facile · Z2','Modérée','Soutenue','Intervalles · HIIT'];
let authSession=null,currentUser=null,authMode='login';
const AUTH_BASE=URL.replace('/rest/v1','');
const EMAILS_KEY='forgelabMobileKnownEmails';
function knownEmails(){try{return JSON.parse(localStorage.getItem(EMAILS_KEY)||'[]').filter(Boolean)}catch(_){return[]}}
function rememberEmail(email){email=String(email||'').trim().toLowerCase();if(!email)return;const all=[email,...knownEmails().filter(x=>x!==email)].slice(0,8);localStorage.setItem(EMAILS_KEY,JSON.stringify(all))}
function disabledKey(){return `forgelabMobileDisabled:${currentUser?.id||'guest'}`}
function disabledMuscles(){try{return new Set(JSON.parse(localStorage.getItem(disabledKey())||'[]'))}catch(_){return new Set()}}
function setMuscleEnabled(muscleKey,enabled){const off=disabledMuscles();enabled?off.delete(muscleKey):off.add(muscleKey);localStorage.setItem(disabledKey(),JSON.stringify([...off]));draw()}
function activePriorities(){const off=disabledMuscles();return state.priorities.filter(p=>!off.has(p.muscle_key))}
function cardioKey(){return `forgelabMobileCardio:${currentUser?.id||'guest'}`}
function defaultCardio(){return {enabled:true,priority:'P1',target:2,type:CARDIO_TYPES[0],weeks:{}}}
function cardioData(){try{const x=JSON.parse(localStorage.getItem(cardioKey())||'null');return x&&typeof x==='object'?{...defaultCardio(),...x,weeks:x.weeks||{}}:defaultCardio()}catch(_){return defaultCardio()}}
function saveCardio(data){localStorage.setItem(cardioKey(),JSON.stringify(data))}
function cardioWeek(){const d=cardioData(),k=String(state.week);if(!Array.isArray(d.weeks[k]))d.weeks[k]=[];return {data:d,list:d.weeks[k]}}
function cardioTypeOptions(selected){return CARDIO_TYPES.map(x=>`<option ${x===selected?'selected':''}>${esc(x)}</option>`).join('')}
function cardioIntensityOptions(selected){return CARDIO_INTENSITIES.map(x=>`<option ${x===selected?'selected':''}>${esc(x)}</option>`).join('')}
const ranges={maintenance:{'Cou':{P0:[8,12],P1:[5,8],P2:[2,4]},'Trapèzes supérieurs':{P0:[12,16],P1:[8,12],P2:[4,6]},'Trapèzes moyens':{P0:[12,16],P1:[8,12],P2:[4,6]},'Deltoïde antérieur':{P0:[8,12],P1:[6,8],P2:[2,4]},'Deltoïde latéral':{P0:[12,18],P1:[8,12],P2:[4,6]},'Deltoïde postérieur':{P0:[12,16],P1:[8,12],P2:[4,6]},'Pectoraux':{P0:[12,18],P1:[8,12],P2:[4,6]},'Dos':{P0:[12,18],P1:[8,12],P2:[4,6]},'Biceps':{P0:[12,16],P1:[8,12],P2:[4,6]},'Triceps':{P0:[12,18],P1:[8,12],P2:[4,6]},'Avant-bras':{P0:[8,12],P1:[6,8],P2:[2,4]},'Abdominaux':{P0:[8,12],P1:[6,8],P2:[2,4]},'Quadriceps':{P0:[12,18],P1:[8,12],P2:[4,6]},'Adducteurs':{P0:[8,12],P1:[6,8],P2:[2,4]},'Ischios':{P0:[10,16],P1:[6,10],P2:[3,5]},'Fessiers':{P0:[12,18],P1:[8,12],P2:[4,6]},'Mollets':{P0:[9,12],P1:[6,9],P2:[3,5]}}};
const delta={deficit:-1,surplus:1};function derivedRange(m,p){let base=ranges.maintenance[m]?.[p]||[0,0],mode=inferNutrition();if(mode==='maintenance')return base;return base.map(x=>Math.max(0,x+(delta[mode]||0)))}
function inferNutrition(){for(const r of state.priorities){const b=ranges.maintenance[r.muscle_name]?.[r.priority];if(!b)continue;if(+r.target_min===b[0]&&+r.target_max===b[1])return'maintenance';if(+r.target_min===Math.max(0,b[0]-1)&&+r.target_max===Math.max(0,b[1]-1))return'deficit';if(+r.target_min===b[0]+1&&+r.target_max===b[1]+1)return'surplus'}return'maintenance'}
function hdr(extra={}){return{apikey:KEY,Authorization:`Bearer ${authSession?.access_token||KEY}`,'Content-Type':'application/json',...extra}}
async function req(path,opt={}){let r=await fetch(URL+path,{...opt,headers:hdr(opt.headers)});if(!r.ok)throw Error(await r.text());return r.status===204?null:r.json()}
function uid(){if(!currentUser?.id)throw Error('Utilisateur non connecté');return currentUser.id}
function saveAuth(s){authSession=s||null;currentUser=s?.user||null;s?localStorage.setItem('forgelabMobileAuth',JSON.stringify(s)):localStorage.removeItem('forgelabMobileAuth')}
async function authFetch(path,body){
  const r=await fetch(`${AUTH_BASE}/auth/v1/${path}`,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify(body)});
  const txt=await r.text();let d={};try{d=txt?JSON.parse(txt):{}}catch(_){}
  if(!r.ok)throw Error(d?.msg||d?.error_description||d?.message||'Connexion impossible');
  return d
}
async function restoreAuth(){
  const raw=localStorage.getItem('forgelabMobileAuth');if(!raw)return false;
  try{
    let s=JSON.parse(raw);if(!s?.access_token)return false;
    let r=await fetch(`${AUTH_BASE}/auth/v1/user`,{headers:{apikey:KEY,Authorization:`Bearer ${s.access_token}`}});
    if(!r.ok&&s.refresh_token){
      s=await authFetch('token?grant_type=refresh_token',{refresh_token:s.refresh_token});
      saveAuth(s);
      r=await fetch(`${AUTH_BASE}/auth/v1/user`,{headers:{apikey:KEY,Authorization:`Bearer ${s.access_token}`}});
    }
    if(!r.ok)throw Error('Session expirée');
    const user=await r.json();s.user=user;saveAuth(s);return true;
  }catch(e){saveAuth(null);return false}
}
async function login(email,password){const s=await authFetch('token?grant_type=password',{email,password});saveAuth(s);rememberEmail(email)}
async function signup(email,password){const s=await authFetch('signup',{email,password});rememberEmail(email);if(s?.access_token)saveAuth(s);return s}
async function logout(){
  try{if(authSession?.access_token)await fetch(`${AUTH_BASE}/auth/v1/logout`,{method:'POST',headers:{apikey:KEY,Authorization:`Bearer ${authSession.access_token}`}})}catch(_){}
  clearInterval(poll);saveAuth(null);showAuth()
}
function showAuth(message=''){
  document.body.classList.add('auth-locked');
  let box=document.querySelector('#authOverlay');
  if(!box){box=document.createElement('div');box.id='authOverlay';document.body.appendChild(box)}
  box.innerHTML=`<main class="auth-screen"><section class="auth-card">
    <div class="auth-mark">⚒</div>
    <div class="auth-brand">FORGELAB</div>
    <div class="auth-sub">ATLAS · ESPACE PERSONNEL</div>
    <div class="auth-tabs">
      <button class="${authMode==='login'?'active':''}" data-mode="login">Connexion</button>
      <button class="${authMode==='signup'?'active':''}" data-mode="signup">Créer un compte</button>
    </div>
    <label>E-mail</label><input id="authEmail" type="email" autocomplete="email" list="knownEmails" value="${esc(knownEmails()[0]||'')}"><datalist id="knownEmails">${knownEmails().map(e=>`<option value="${esc(e)}"></option>`).join('')}</datalist>${knownEmails().length?`<div class="known-emails">${knownEmails().map(e=>`<button type="button" data-email="${esc(e)}">${esc(e)}</button>`).join('')}</div>`:''}
    <label>Mot de passe</label><input id="authPassword" type="password" autocomplete="${authMode==='login'?'current-password':'new-password'}">
    <button id="authSubmit" class="auth-submit">${authMode==='login'?'Entrer dans la Forge':'Créer mon compte'}</button>
    <div class="auth-message">${message||''}</div>
  </section></main>`;
  box.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{authMode=b.dataset.mode;showAuth()});
  box.querySelectorAll('[data-email]').forEach(b=>b.onclick=()=>{box.querySelector('#authEmail').value=b.dataset.email;box.querySelector('#authPassword').focus()});
  box.querySelector('#authSubmit').onclick=async()=>{
    const email=box.querySelector('#authEmail').value.trim(),password=box.querySelector('#authPassword').value;
    if(!email||!password){showAuth('Renseigne ton e-mail et ton mot de passe.');return}
    try{
      if(authMode==='login'){await login(email,password);hideAuth();await boot()}
      else{
        const s=await signup(email,password);
        if(s?.access_token){hideAuth();await boot()}
        else showAuth('Compte créé. Vérifie ton e-mail si une confirmation est demandée.')
      }
    }catch(e){showAuth(e.message)}
  }
}
function hideAuth(){document.body.classList.remove('auth-locked');document.querySelector('#authOverlay')?.remove()}
function ensureAccountButton(){
  if(!currentUser)return;
  let b=document.querySelector('#accountBtn');
  if(!b){b=document.createElement('button');b.id='accountBtn';b.className='account-btn';b.onclick=logout;document.body.appendChild(b)}
  b.innerHTML=`<span>${esc((currentUser.email||'Compte').split('@')[0])}</span><small>Déconnexion</small>`
}
function cloud(t,c=''){let e=document.querySelector('#cloud');e.textContent='● CLOUD · '+t;e.className='cloud '+c}
async function load(render=true){try{
  let[a,b,c]=await Promise.all([
    req(`/forgelab_state?select=*&id=eq.main&user_id=eq.${encodeURIComponent(uid())}`),
    req(`/forgelab_priorities?select=*&user_id=eq.${encodeURIComponent(uid())}&order=id.asc`),
    req(`/forgelab_series?select=*&block_key=eq.main&user_id=eq.${encodeURIComponent(uid())}`)
  ]);

  state.block=a[0]?.active_block||'main';
  state.week=state.userWeek||a[0]?.active_week||1;
  state.priorities=b;

  // While a Series field is being edited, keep the local Series values.
  // Cloud data can refresh again as soon as editing has finished.
  const focusedSeries = document.activeElement && document.activeElement.classList?.contains('series-input');
  const hasPendingSeriesWrites = typeof saveState!=='undefined' && Object.values(saveState).some(s=>s && (s.sending || s.wanted!==s.lastSent));
  const editingNow = state.tab==='series' && (focusedSeries || hasPendingSeriesWrites || (typeof editingSeries!=='undefined' && editingSeries.size>0));
  if(!editingNow) state.series=c;

  cloud('SYNCHRONISÉ','ok');

  // Never rebuild the Series DOM while the iOS keyboard is open.
  if(render && !editingNow) draw();
}catch(e){console.error(e);cloud('HORS LIGNE','err')}}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function rows(m){return state.series.filter(x=>+x.week===+state.week&&x.muscle_key===m)}function total(m){return rows(m).reduce((a,x)=>a+(+x.series||0),0)}function pRange(p){return[+p.target_min,+p.target_max]}
function weeks(){let d=document.querySelector('#weekDots');d.innerHTML=Array.from({length:13},(_,i)=>`<button class="${state.week===i+1?'active':''}" data-w="${i+1}">${i+1}</button>`).join('');d.querySelectorAll('button').forEach(b=>b.onclick=()=>setWeek(+b.dataset.w))}
async function setWeek(w){state.week=Math.min(13,Math.max(1,w));state.userWeek=state.week;await req(`/forgelab_state?id=eq.main&user_id=eq.${encodeURIComponent(uid())}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({active_week:state.week,updated_at:new Date().toISOString()})});draw()}
function draw(){ensureAccountButton();document.querySelector('#weekTitle').textContent='S'+state.week;document.querySelector('#blockTitle').textContent=state.block==='main'?'Bloc actif':state.block;weeks();document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.tab));state.tab==='priorities'?drawPriorities():state.tab==='tracking'?drawTracking():drawSeries()}
function title(t){return`<h2 class="section-title">${t}</h2>`}
function nutritionLabel(){return inferNutrition()==='deficit'?'Déficit':inferNutrition()==='surplus'?'Surplus':'Maintien'}
function drawPriorities(){
  let v=document.querySelector('#view'),counts={P0:0,P1:0,P2:0},off=disabledMuscles(),cd=cardioData();
  activePriorities().forEach(p=>counts[p.priority]=(counts[p.priority]||0)+1);
  if(cd.enabled)counts[cd.priority]=(counts[cd.priority]||0)+1;
  const cardioDone=cardioWeek().list.filter(x=>x.done).length;
  v.innerHTML=title('Priorités')+
  `<section class="priority-overview"><div><small>CONTEXTE DU BLOC</small><strong>${nutritionLabel()}</strong></div><div class="priority-counts"><span class="pc0">P0 · ${counts.P0}</span><span class="pc1">P1 · ${counts.P1}</span><span class="pc2">P2 · ${counts.P2}</span></div><p>Les priorités musculaires et cardio appartiennent au même bloc. Une priorité désactivée conserve ses données.</p></section>`+
  state.priorities.map(p=>{let t=total(p.muscle_key),disabled=off.has(p.muscle_key);return`<article class="card ${disabled?'disabled-muscle':p.priority.toLowerCase()} priority-card"><div class="cardhead"><div><div class="muscle">${esc(p.muscle_name)}</div><div class="range">${disabled?'Groupe désactivé':`Cible · <b>${p.target_min}–${p.target_max}</b> séries / semaine`}</div></div><button class="muscle-toggle ${disabled?'off':'on'}" data-toggle="${esc(p.muscle_key)}" aria-label="${disabled?'Réactiver':'Désactiver'} ${esc(p.muscle_name)}">${disabled?'Réactiver':'Actif'}</button></div>${disabled?'':`<div class="priority-meta"><span>S${state.week} actuellement</span><strong>${t} séries</strong></div><div class="prio-buttons">${['P0','P1','P2'].map(x=>`<button data-m="${esc(p.muscle_key)}" data-p="${x}" class="${p.priority===x?'selected':''}">${x}<small>${derivedRange(p.muscle_name,x).join('–')}</small></button>`).join('')}</div>`}</article>`}).join('')+
  `<article class="card ${cd.enabled?cd.priority.toLowerCase():'disabled-muscle'} priority-card cardio-priority-card">
    <div class="cardhead"><div><div class="muscle">♥ Cardio</div><div class="range">${cd.enabled?`Modalité · <b>${esc(cd.type)}</b>`:'Priorité cardio désactivée'}</div></div><button class="muscle-toggle ${cd.enabled?'on':'off'}" data-cardio-toggle>${cd.enabled?'Actif':'Réactiver'}</button></div>
    ${cd.enabled?`<div class="priority-meta"><span>S${state.week} actuellement</span><strong>${cardioDone}/${cd.target} séance${cd.target>1?'s':''}</strong></div>
    <div class="prio-buttons cardio-prio-buttons">${['P0','P1','P2'].map(x=>`<button data-cardio-priority="${x}" class="${cd.priority===x?'selected':''}">${x}<small>${x==='P0'?'majeure':x==='P1'?'secondaire':'entretien'}</small></button>`).join('')}</div>
    <div class="cardio-priority-settings"><label>Modalité<select data-cardio-setting="type">${cardioTypeOptions(cd.type)}</select></label><label>Séances / semaine<div class="stepper"><button type="button" data-cardio-minus>−</button><strong>${cd.target}</strong><button type="button" data-cardio-plus>+</button></div></label></div>`:''}
  </article>`;
  v.querySelectorAll('.prio-buttons button[data-m]').forEach(b=>b.onclick=()=>changePriority(b.dataset.m,b.dataset.p));
  v.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>setMuscleEnabled(b.dataset.toggle,off.has(b.dataset.toggle)));
  v.querySelector('[data-cardio-toggle]').onclick=()=>{const d=cardioData();d.enabled=!d.enabled;saveCardio(d);drawPriorities()};
  v.querySelectorAll('[data-cardio-priority]').forEach(b=>b.onclick=()=>{const d=cardioData();d.priority=b.dataset.cardioPriority;saveCardio(d);drawPriorities()});
  if(cd.enabled){
    v.querySelector('[data-cardio-setting="type"]').onchange=e=>{const d=cardioData();d.type=e.target.value;saveCardio(d);drawPriorities()};
    v.querySelector('[data-cardio-minus]').onclick=()=>{const d=cardioData();d.target=Math.max(0,d.target-1);saveCardio(d);drawPriorities()};
    v.querySelector('[data-cardio-plus]').onclick=()=>{const d=cardioData();d.target=Math.min(7,d.target+1);saveCardio(d);drawPriorities()};
  }
}
async function changePriority(muscleKey,priority){let p=state.priorities.find(x=>x.muscle_key===muscleKey);if(!p)return;let[min,max]=derivedRange(p.muscle_name,priority);cloud('ENREGISTREMENT…');await req('/forgelab_priorities?user_id=eq.'+encodeURIComponent(uid())+'&muscle_key=eq.'+encodeURIComponent(muscleKey),{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({priority,target_min:min,target_max:max,updated_at:new Date().toISOString()})});await load()}
let saveTimers={};
let saveState={}; // per-cell serialized cloud writes; latest value always wins

function drawSeries(){
  let v=document.querySelector('#view');
  v.innerHTML=title('Séries / semaine')+activePriorities().map(p=>{
    let map=Object.fromEntries(rows(p.muscle_key).map(x=>[+x.day,+x.series]));
    return`<article class="card ${p.priority.toLowerCase()}" data-card="${esc(p.muscle_key)}">
      <div class="cardhead"><div><div class="muscle">${esc(p.muscle_name)}</div><div class="range">Cible ${p.target_min}–${p.target_max}</div></div><span class="badge">${p.priority}</span></div>
      <div class="days">${DAYS.map((d,i)=>`<div class="day"><label>${d}</label><input class="series-input" type="text" inputmode="numeric" pattern="[0-9]*" enterkeyhint="done" value="${map[i+1]||0}" data-m="${esc(p.muscle_key)}" data-d="${i+1}" aria-label="${d} ${esc(p.muscle_name)}"></div>`).join('')}</div>
      <div class="totalrow"><span>Total semaine</span><b data-total="${esc(p.muscle_key)}">${total(p.muscle_key)} séries</b></div>
    </article>`
  }).join('')+cardioSeriesHtml();

  wireSeriesInputs(v);
  wireCardioSeries(v);
}

let editingSeries = new Set();

function seriesEditKey(el){
  return `${state.week}|${el.dataset.m}|${el.dataset.d}`;
}

function wireSeriesInputs(v){
  v.querySelectorAll('.series-input').forEach(i=>{
    i.dataset.lastValid = i.value || '0';

    i.addEventListener('focus',()=>{
      editingSeries.add(seriesEditKey(i));
      i.dataset.lastValid = i.value || '0';
      // Select the current value for fast replacement, but do not modify it.
      try{i.select()}catch(_){}
    });

    i.addEventListener('input',()=>{
      const raw=(i.value||'').replace(/[^0-9]/g,'');

      // Safari/iOS may transiently emit an empty string during replacement.
      // Ignore it completely: no local update and no cloud request.
      if(raw==='') return;

      const n=Math.max(0,Math.min(99,parseInt(raw,10)||0));
      i.dataset.lastValid=String(n);

      // Optimistic UI/state: instant.
      updateSeriesLocal(i.dataset.m,+i.dataset.d,n);

      // Cloud is background-only and serialized per cell.
      queueSeriesSave(i.dataset.m,+i.dataset.d,n);
    });

    i.addEventListener('blur',()=>{
      const key=seriesEditKey(i);

      // If the field visually ended empty, restore the last actual value.
      if((i.value||'')==='') i.value=i.dataset.lastValid || '0';

      setTimeout(()=>editingSeries.delete(key),250);
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
  if(!saveState[k]) saveState[k]={wanted:n,sending:false,lastSent:null};
  saveState[k].wanted=n;

  clearTimeout(saveTimers[k]);
  cloud('ENREGISTREMENT…');

  // Tiny debounce only to coalesce very fast keystrokes.
  saveTimers[k]=setTimeout(()=>flushSeriesSave(k,m,d),180);
}

async function flushSeriesSave(k,m,d){
  const slot=saveState[k];
  if(!slot || slot.sending) return;

  const n=Math.max(0,Math.round(slot.wanted||0));
  slot.sending=true;
  slot.lastSent=n;

  try{
    const path=`/forgelab_series?user_id=eq.${encodeURIComponent(uid())}&block_key=eq.main&week=eq.${state.week}&muscle_key=eq.${encodeURIComponent(m)}&day=eq.${d}`;

    if(n===0){
      await req(path,{method:'DELETE',headers:{Prefer:'return=minimal'}});
    }else{
      await req('/forgelab_series?on_conflict=user_id,block_key,week,muscle_key,day',{
        method:'POST',
        headers:{Prefer:'resolution=merge-duplicates,return=minimal'},
        body:JSON.stringify([{
          user_id:uid(),
          block_key:'main',
          week:state.week,
          muscle_key:m,
          day:d,
          series:n,
          updated_at:new Date().toISOString()
        }])
      });
    }

    slot.sending=false;

    // If the user changed the field while this request was in flight,
    // immediately send the newest value. Old requests can no longer "win".
    if(slot.wanted!==slot.lastSent){
      flushSeriesSave(k,m,d);
    }else{
      cloud('SYNCHRONISÉ','ok');
    }
  }catch(e){
    console.error(e);
    slot.sending=false;
    cloud('HORS LIGNE','err');
    clearTimeout(saveTimers[k]);
    saveTimers[k]=setTimeout(()=>flushSeriesSave(k,m,d),1200);
  }
}
function weeklyTodoRecap(){
  const notStarted=state.priorities.filter(p=>total(p.muscle_key)===0);
  const partial=state.priorities.filter(p=>{
    const t=total(p.muscle_key);
    return t>0 && t<(+p.target_min||0);
  });

  const chips = notStarted.length
    ? notStarted.map(p=>`<span class="todo-chip ${p.priority.toLowerCase()}"><b>${esc(p.muscle_name)}</b><small>${p.priority} · ${p.target_min}–${p.target_max}</small></span>`).join('')
    : `<div class="todo-empty">Tous les groupes ont été commencés cette semaine.</div>`;

  const partialHtml = partial.length
    ? `<div class="todo-partial"><span>À compléter</span>${partial.map(p=>{
        const t=total(p.muscle_key);
        const left=Math.max(0,(+p.target_min||0)-t);
        return `<em>${esc(p.muscle_name)} · ${left} série${left>1?'s':''}</em>`;
      }).join('')}</div>`
    : '';

  return `<section class="weekly-todo">
    <div class="weekly-todo-head">
      <div><small>RÉCAP HEBDO</small><h3>Reste à faire</h3></div>
      <strong>${notStarted.length}</strong>
    </div>
    <p>Groupes musculaires encore non travaillés en S${state.week}.</p>
    <div class="todo-chips">${chips}</div>
    ${partialHtml}
  </section>`;
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
  `<section class="tracking-headline"><div><small>SEMAINE ${state.week}</small><strong>${atMin} / ${activePriorities().length}</strong><span>groupes au minimum</span></div><div class="overall-ring"><b>${pct}%</b><span>progression</span></div></section>`+
  weeklyTodoRecap()+
  activePriorities().map(p=>{
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

function cardioSeriesHtml(){
  const d=cardioData();if(!d.enabled)return'';
  const {list}=cardioWeek(),done=list.filter(x=>x.done).length;
  return `<article class="card ${d.priority.toLowerCase()} cardio-series-card">
    <div class="cardhead"><div><div class="muscle">♥ Cardio</div><div class="range">${esc(d.type)} · objectif ${d.target} séance${d.target>1?'s':''}</div></div><span class="badge">${d.priority}</span></div>
    <div class="cardio-series-progress"><span>S${state.week}</span><strong>${done} / ${d.target} réalisée${done>1?'s':''}</strong></div>
    <div class="cardio-done-list">${list.map((x,i)=>`<div class="cardio-done-row"><span>${DAYS[(+x.day||1)-1]||'Jour'} · ${esc(x.type||d.type)}${x.duration?` · ${+x.duration} min`:''}</span><button data-cardio-remove-done="${i}" aria-label="Retirer cette séance">×</button></div>`).join('')}</div>
    <button class="cardio-add-done" data-cardio-add-done>＋ Ajouter une séance effectuée</button>
  </article>`
}
function wireCardioSeries(v){
  const add=v.querySelector('[data-cardio-add-done]');if(add)add.onclick=()=>{const d=cardioData(),w=cardioWeek();w.list.push({type:d.type,day:new Date().getDay()||7,duration:0,intensity:'',done:true});saveCardio(w.data);drawSeries()};
  v.querySelectorAll('[data-cardio-remove-done]').forEach(b=>b.onclick=()=>{const w=cardioWeek();w.list.splice(+b.dataset.cardioRemoveDone,1);saveCardio(w.data);drawSeries()});
}

document.querySelectorAll('nav button').forEach(b=>b.onclick=async()=>{
  state.tab=b.dataset.tab;
  await load(false);
  draw();
});document.querySelector('#prevWeek').onclick=()=>setWeek(state.week-1);document.querySelector('#nextWeek').onclick=()=>setWeek(state.week+1);
async function boot(){await load();clearInterval(poll);poll=setInterval(()=>load(state.tab!=='series'),12000)}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&currentUser)load()});
(async()=>{if(await restoreAuth()){hideAuth();await boot()}else showAuth()})();
