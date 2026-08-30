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
function muscleOrderKey(){return `forgelabMobileMuscleOrder:${currentUser?.id||'guest'}`}
function muscleOrder(){try{return JSON.parse(localStorage.getItem(muscleOrderKey())||'[]').filter(Boolean)}catch(_){return[]}}
function orderedPriorities(){
  const order=muscleOrder(),pos=new Map(order.map((k,i)=>[k,i]));
  return [...state.priorities].sort((a,b)=>{
    const ai=pos.has(a.muscle_key)?pos.get(a.muscle_key):9999;
    const bi=pos.has(b.muscle_key)?pos.get(b.muscle_key):9999;
    return ai-bi;
  })
}
function saveMuscleOrder(keys){localStorage.setItem(muscleOrderKey(),JSON.stringify(keys))}
function programmingKey(){return `forgelabMobileProgramming:${currentUser?.id||'guest'}`}
function programmingPresetKey(){return `forgelabMobileProgrammingPresets:${currentUser?.id||'guest'}`}
const PC_PROGRAMMING_IMPORT_V165={"Lun":[{"id":"47b888ba-8484-4a34-95c3-ed854f5a4137","muscle_key":"Deltoïde latéral","muscle_name":"Deltoïde latéral","sets":4},{"id":"e2843dc6-6d8b-4cc2-8979-0c9b38421f7f","muscle_key":"Trapèzes moyens","muscle_name":"Trapèzes moyens","sets":4},{"id":"6f78cd77-7234-426c-9963-c7495c566d71","muscle_key":"Pectoraux","muscle_name":"Pectoraux","sets":4},{"id":"ebd9e2bc-1bbc-4440-8f6c-7d9a46f965dc","muscle_key":"Abdominaux","muscle_name":"Abdominaux","sets":4},{"id":"d1b00296-9092-4e63-bd7f-a30917b76eba","muscle_key":"Cou","muscle_name":"Cou","sets":4}],"Mar":[{"id":"8354c8a0-75d3-4a97-91e5-fa0cc9c8ad17","muscle_key":"Adducteurs","muscle_name":"Adducteurs","sets":4},{"id":"b4fcf4c2-a24d-4734-ad4d-5420cf2ef0e6","muscle_key":"Quadriceps","muscle_name":"Quadriceps","sets":3},{"id":"c3d420b4-9848-49f1-9f45-d99c67489361","muscle_key":"Ischios","muscle_name":"Ischios","sets":4},{"id":"55abadd6-07da-47d3-ae46-2c26e152152c","muscle_key":"Fessiers","muscle_name":"Fessiers","sets":3},{"id":"45721ab5-d8f4-491f-ab05-dfa01113e2bb","muscle_key":"Mollets","muscle_name":"Mollets","sets":3}],"Mer":[{"id":"b993a249-9db0-48d9-b8ed-f04b37e8cd43","muscle_key":"Deltoïde latéral","muscle_name":"Deltoïde latéral","sets":4},{"id":"235610c4-751b-410a-970c-f2e04b30fc2c","muscle_key":"Trapèzes moyens","muscle_name":"Trapèzes moyens","sets":4},{"id":"a1b730c2-f4fd-40d6-bd08-7a66b73f06f2","muscle_key":"Dos","muscle_name":"Dos","sets":4},{"id":"bbfd74f5-d3e7-46e1-9168-fec0157b8e55","muscle_key":"Trapèzes supérieurs","muscle_name":"Trapèzes supérieurs","sets":4},{"id":"1cb9bbdd-f926-411c-9322-688c9988980d","muscle_key":"Abdominaux","muscle_name":"Abdominaux","sets":4}],"Jeu":[{"id":"64d655c1-85b3-4afd-abc7-7ffaf5251d06","muscle_key":"Adducteurs","muscle_name":"Adducteurs","sets":4},{"id":"f478d3d4-de8c-494d-acd8-74069294ea39","muscle_key":"Quadriceps","muscle_name":"Quadriceps","sets":3},{"id":"e3c54e79-e085-4f37-9837-8bb01b161f73","muscle_key":"Ischios","muscle_name":"Ischios","sets":4},{"id":"ae9e5431-e3b8-4307-9347-b742af54a864","muscle_key":"Fessiers","muscle_name":"Fessiers","sets":3},{"id":"455a2400-b16e-4260-b380-e8870db2ff32","muscle_key":"Mollets","muscle_name":"Mollets","sets":3}],"Ven":[{"id":"25de6897-62a3-4e56-a5f4-d3dea948257c","muscle_key":"Deltoïde latéral","muscle_name":"Deltoïde latéral","sets":4},{"id":"717fbb21-7b59-462c-956e-605beba2492c","muscle_key":"Trapèzes moyens","muscle_name":"Trapèzes moyens","sets":4},{"id":"5fdbe360-2dcb-41d6-8d15-e498aecf243c","muscle_key":"Pectoraux","muscle_name":"Pectoraux","sets":4},{"id":"a9aa911c-58c0-46ce-9704-5d53cde551ec","muscle_key":"Dos","muscle_name":"Dos","sets":4},{"id":"5cc2487f-932b-4006-b60e-ddb53d1ba8fd","muscle_key":"Trapèzes supérieurs","muscle_name":"Trapèzes supérieurs","sets":4}],"Sam":[{"id":"904114ff-2c99-4dad-b9c3-b097098c0db2","muscle_key":"Biceps","muscle_name":"Biceps","sets":4},{"id":"afe086b2-c754-415a-8162-53a707aed30c","muscle_key":"Triceps","muscle_name":"Triceps","sets":6},{"id":"e802f043-da09-4e0c-9e5f-49e13be7af2d","muscle_key":"Cou","muscle_name":"Cou","sets":4},{"id":"8364ebdb-9e8c-4a95-a57f-5ce78a77df6d","muscle_key":"Avant-bras","muscle_name":"Avant-bras","sets":3}],"Dim":[]};
function importPcProgrammingV165(){
  if(!currentUser?.id)return;
  const marker=`forgelabMobileProgrammingImport:v167:${currentUser.id}`;
  if(localStorage.getItem(marker)==='1')return;
  localStorage.setItem(programmingKey(),JSON.stringify(PC_PROGRAMMING_IMPORT_V165));
  localStorage.setItem(marker,'1');
}
function newProgramId(){return 'pr_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8)}
function blankProgramming(){return Object.fromEntries(DAYS.map(d=>[d,[]]))}
function programmingData(){
  try{
    const raw=JSON.parse(localStorage.getItem(programmingKey())||'null');
    const out=blankProgramming();
    if(raw&&typeof raw==='object')DAYS.forEach(d=>{
      out[d]=Array.isArray(raw[d])?raw[d].map(x=>({id:x.id||newProgramId(),muscle_key:String(x.muscle_key||x.muscle||''),muscle_name:String(x.muscle_name||x.muscle||x.muscle_key||''),sets:Math.max(0,Number(x.sets||0))})).filter(x=>x.muscle_key):[];
    });
    return out;
  }catch(_){return blankProgramming()}
}
function saveProgramming(p,redraw=true){localStorage.setItem(programmingKey(),JSON.stringify(p));if(redraw&&state.tab==='programming')drawProgramming()}
function programmingPresets(){try{return JSON.parse(localStorage.getItem(programmingPresetKey())||'[]').filter(x=>x&&x.name&&x.programming)}catch(_){return[]}}
function saveProgrammingPresets(x){localStorage.setItem(programmingPresetKey(),JSON.stringify(x))}
function programPriority(muscleKey){return state.priorities.find(p=>p.muscle_key===muscleKey)?.priority||'P2'}
function programRange(muscleKey){const p=state.priorities.find(x=>x.muscle_key===muscleKey);return p?pRange(p):[0,0]}
function programTotals(p=programmingData()){
  const out={};activePriorities().forEach(x=>out[x.muscle_key]={sets:0,freq:0});
  DAYS.forEach(d=>(p[d]||[]).forEach(x=>{out[x.muscle_key] ||= {sets:0,freq:0};out[x.muscle_key].sets+=Number(x.sets||0);if(Number(x.sets||0)>0)out[x.muscle_key].freq++}));
  return out;
}
function distributeProgramTotal(total,n){const b=Math.floor(total/n),r=total%n;return Array.from({length:n},(_,i)=>b+(i<r?1:0))}
function autoProgramming(){
  const out=blankProgramming(),p1Patterns=[['Mar','Jeu'],['Lun','Jeu'],['Mar','Ven'],['Mer','Sam']],p2Days=['Mar','Jeu','Sam','Dim'];let p1=0,p2=0;
  activePriorities().forEach(m=>{
    const priority=m.priority||'P2',target=Math.max(0,Number(m.target_min||0));let days;
    if(priority==='P0')days=['Lun','Mer','Ven'];else if(priority==='P1')days=p1Patterns[p1++%p1Patterns.length];else days=[p2Days[p2++%p2Days.length]];
    const split=distributeProgramTotal(target,days.length);
    days.forEach((d,i)=>{if(split[i]>0)out[d].push({id:newProgramId(),muscle_key:m.muscle_key,muscle_name:m.muscle_name,sets:split[i]})});
  });
  saveProgramming(out);
}
function activePriorities(){const off=disabledMuscles();return orderedPriorities().filter(p=>!off.has(p.muscle_key))}
function cardioKey(){return `forgelabMobileCardio:${currentUser?.id||'guest'}`}
function cardioModalityId(){return 'cm_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7)}
function defaultCardio(){return {enabled:true,priority:'P1',modalities:[{id:'cardio_default',type:CARDIO_TYPES[0],target:2}],weeks:{}}}
function cardioData(){
  try{
    const x=JSON.parse(localStorage.getItem(cardioKey())||'null');
    if(!x||typeof x!=='object')return defaultCardio();
    const d={...defaultCardio(),...x,weeks:x.weeks||{}};
    if(!Array.isArray(d.modalities)||!d.modalities.length){d.modalities=[{id:'cardio_default',type:x.type||CARDIO_TYPES[0],target:Number.isFinite(+x.target)?Math.max(0,+x.target):2}]}
    d.modalities=d.modalities.map((m,i)=>({id:m.id||('cardio_'+i),type:CARDIO_TYPES.includes(m.type)?m.type:CARDIO_TYPES[0],target:Math.max(0,Math.min(14,parseInt(m.target,10)||0))}));
    // Migration v1.4.6: old completed-session list -> day counters on first modality.
    Object.keys(d.weeks||{}).forEach(k=>{
      const w=d.weeks[k];
      if(Array.isArray(w)){
        const first=d.modalities[0].id, days={};
        w.filter(x=>x&&x.done).forEach(x=>{const day=Math.max(1,Math.min(7,+x.day||1));days[day]=(days[day]||0)+1});
        d.weeks[k]={[first]:days};
      }
    });
    return d
  }catch(_){return defaultCardio()}
}
function saveCardio(data){localStorage.setItem(cardioKey(),JSON.stringify(data))}
function cardioWeek(){const d=cardioData(),k=String(state.week);if(!d.weeks[k]||Array.isArray(d.weeks[k]))d.weeks[k]={};return {data:d,week:d.weeks[k]}}
function cardioModalityTotal(modalityId){const {week}=cardioWeek(),days=week[modalityId]||{};return Object.values(days).reduce((a,n)=>a+(+n||0),0)}
function cardioTotalDone(){const d=cardioData();return d.modalities.reduce((a,m)=>a+cardioModalityTotal(m.id),0)}
function cardioTotalTarget(){const d=cardioData();return d.modalities.reduce((a,m)=>a+(+m.target||0),0)}
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
  const remembered=knownEmails();
  box.innerHTML=`<main class="auth-screen"><section class="auth-shell">
    <div class="auth-identity">
      <img class="auth-laurel" src="auth-laurel-realistic-v167.png" alt="" aria-hidden="true">
      <div class="auth-brand">FORGELAB</div>
      <div class="auth-sub">ATLAS · ESPACE PERSONNEL</div>
      <div class="auth-version"><span>v1.6.7</span></div>
    </div>
    <section class="auth-card">
      <div class="auth-welcome">Bienvenue</div>
      <div class="auth-intro">${authMode==='login'?'Connecte-toi à ton espace ForgeLab':'Crée ton espace ForgeLab'}</div>
      <div class="auth-tabs">
        <button class="${authMode==='login'?'active':''}" data-mode="login"><span class="auth-tab-icon">▣</span>Connexion</button>
        <button class="${authMode==='signup'?'active':''}" data-mode="signup"><span class="auth-tab-icon">＋</span>Créer un compte</button>
      </div>
      <label for="authEmail">E-mail</label>
      <div class="auth-field"><span class="auth-field-icon">✉</span><input id="authEmail" type="email" autocomplete="email" list="knownEmails" placeholder="ton@email.com" value="${esc(remembered[0]||'')}"></div>
      <datalist id="knownEmails">${remembered.map(e=>`<option value="${esc(e)}"></option>`).join('')}</datalist>
      ${remembered.length?`<div class="known-emails">${remembered.map(e=>`<button type="button" data-email="${esc(e)}">${esc(e)}</button>`).join('')}</div>`:''}
      <label for="authPassword">Mot de passe</label>
      <div class="auth-field"><span class="auth-field-icon">◇</span><input id="authPassword" type="password" autocomplete="${authMode==='login'?'current-password':'new-password'}" placeholder="••••••••"><button id="togglePassword" class="auth-eye" type="button" aria-label="Afficher le mot de passe">◉</button></div>
      <button id="authSubmit" class="auth-submit">${authMode==='login'?'Entrer dans la Forge':'Créer mon compte'}</button>
      <div class="auth-divider"><span></span><i>◇</i><span></span></div>
      <div class="auth-security"><span>♢</span>Données sécurisées et synchronisées</div>
      <div class="auth-message">${message||''}</div>
    </section>
    <div class="auth-motto">DISCIPLINA · CONSTANTIA · PROGRESSUS</div>
  </section></main>`;
  box.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{authMode=b.dataset.mode;showAuth()});
  box.querySelectorAll('[data-email]').forEach(b=>b.onclick=()=>{box.querySelector('#authEmail').value=b.dataset.email;box.querySelector('#authPassword').focus()});
  const pwd=box.querySelector('#authPassword'),eye=box.querySelector('#togglePassword');
  eye.onclick=()=>{const show=pwd.type==='password';pwd.type=show?'text':'password';eye.textContent=show?'◎':'◉';eye.setAttribute('aria-label',show?'Masquer le mot de passe':'Afficher le mot de passe')};
  box.querySelector('#authSubmit').onclick=async()=>{
    const email=box.querySelector('#authEmail').value.trim(),password=pwd.value;
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
function draw(){ensureAccountButton();document.querySelector('#weekTitle').textContent='S'+state.week;document.querySelector('#blockTitle').textContent=state.block==='main'?'Bloc actif':state.block;weeks();document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.tab));state.tab==='priorities'?drawPriorities():state.tab==='programming'?drawProgramming():state.tab==='tracking'?drawTracking():drawSeries()}
function title(t){return`<h2 class="section-title">${t}</h2>`}
function nutritionLabel(){return inferNutrition()==='deficit'?'Déficit':inferNutrition()==='surplus'?'Surplus':'Maintien'}
function drawPriorities(){
  let v=document.querySelector('#view'),counts={P0:0,P1:0,P2:0},off=disabledMuscles(),cd=cardioData();
  activePriorities().forEach(p=>counts[p.priority]=(counts[p.priority]||0)+1);
  if(cd.enabled)counts[cd.priority]=(counts[cd.priority]||0)+1;
  const cardioDone=cardioTotalDone(), cardioTarget=cardioTotalTarget();
  v.innerHTML=title('Priorités')+
  `<section class="priority-overview"><div><small>CONTEXTE DU BLOC</small><strong>${nutritionLabel()}</strong></div><div class="priority-counts"><span class="pc0">P0 · ${counts.P0}</span><span class="pc1">P1 · ${counts.P1}</span><span class="pc2">P2 · ${counts.P2}</span></div><p>Les priorités musculaires et cardio appartiennent au même bloc. Une priorité désactivée conserve ses données.</p></section>`+
  orderedPriorities().map(p=>{let t=total(p.muscle_key),disabled=off.has(p.muscle_key);return`<article class="card ${disabled?'disabled-muscle':p.priority.toLowerCase()} priority-card muscle-order-card" data-muscle-order="${esc(p.muscle_key)}"><div class="cardhead"><div><div class="muscle">${esc(p.muscle_name)}</div><div class="range">${disabled?'Groupe désactivé':`Cible · <b>${p.target_min}–${p.target_max}</b> séries / semaine`}</div></div><button class="muscle-toggle ${disabled?'off':'on'}" data-toggle="${esc(p.muscle_key)}" aria-label="${disabled?'Réactiver':'Désactiver'} ${esc(p.muscle_name)}">${disabled?'Réactiver':'Actif'}</button></div>${disabled?'':`<div class="priority-meta"><span>S${state.week} actuellement</span><strong>${t} séries</strong></div><div class="prio-buttons">${['P0','P1','P2'].map(x=>`<button data-m="${esc(p.muscle_key)}" data-p="${x}" class="${p.priority===x?'selected':''}">${x}<small>${derivedRange(p.muscle_name,x).join('–')}</small></button>`).join('')}</div>`}</article>`}).join('')+
  `<article class="card ${cd.enabled?cd.priority.toLowerCase():'disabled-muscle'} priority-card cardio-priority-card">
    <div class="cardhead"><div><div class="muscle">♥ Cardio</div><div class="range">${cd.enabled?`${cd.modalities.length} modalité${cd.modalities.length>1?'s':''} · <b>${cardioTarget}</b> séance${cardioTarget>1?'s':''} / semaine`:'Priorité cardio désactivée'}</div></div><button class="muscle-toggle ${cd.enabled?'on':'off'}" data-cardio-toggle>${cd.enabled?'Actif':'Réactiver'}</button></div>
    ${cd.enabled?`<div class="priority-meta"><span>S${state.week} actuellement</span><strong>${cardioDone}/${cardioTarget} séance${cardioTarget>1?'s':''}</strong></div>
    <div class="prio-buttons cardio-prio-buttons">${['P0','P1','P2'].map(x=>`<button data-cardio-priority="${x}" class="${cd.priority===x?'selected':''}">${x}<small>${x==='P0'?'majeure':x==='P1'?'secondaire':'entretien'}</small></button>`).join('')}</div>
    <div class="cardio-modalities"><div class="cardio-modalities-head"><span>MODALITÉS DU BLOC</span><button type="button" data-cardio-add-modality aria-label="Ajouter une modalité">＋</button></div>
      ${cd.modalities.map((m,i)=>`<div class="cardio-modality-row" data-modality="${esc(m.id)}"><label>Modalité<select data-cardio-type="${esc(m.id)}">${cardioTypeOptions(m.type)}</select></label><label>Séances / sem.<div class="stepper"><button type="button" data-cardio-minus="${esc(m.id)}">−</button><strong>${m.target}</strong><button type="button" data-cardio-plus="${esc(m.id)}">+</button></div></label>${cd.modalities.length>1?`<button type="button" class="cardio-modality-delete" data-cardio-delete-modality="${esc(m.id)}" aria-label="Supprimer ${esc(m.type)}">×</button>`:''}</div>`).join('')}
    </div>`:''}
  </article>`;
  v.querySelectorAll('.prio-buttons button[data-m]').forEach(b=>b.onclick=()=>changePriority(b.dataset.m,b.dataset.p));
  v.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>setMuscleEnabled(b.dataset.toggle,off.has(b.dataset.toggle)));
  v.querySelector('[data-cardio-toggle]').onclick=()=>{const d=cardioData();d.enabled=!d.enabled;saveCardio(d);drawPriorities()};
  v.querySelectorAll('[data-cardio-priority]').forEach(b=>b.onclick=()=>{const d=cardioData();d.priority=b.dataset.cardioPriority;saveCardio(d);drawPriorities()});
  if(cd.enabled){
    v.querySelector('[data-cardio-add-modality]').onclick=()=>{const d=cardioData();d.modalities.push({id:cardioModalityId(),type:CARDIO_TYPES[0],target:1});saveCardio(d);drawPriorities()};
    v.querySelectorAll('[data-cardio-type]').forEach(el=>el.onchange=e=>{const d=cardioData(),m=d.modalities.find(x=>x.id===e.target.dataset.cardioType);if(m)m.type=e.target.value;saveCardio(d);drawPriorities()});
    v.querySelectorAll('[data-cardio-minus]').forEach(b=>b.onclick=()=>{const d=cardioData(),m=d.modalities.find(x=>x.id===b.dataset.cardioMinus);if(m)m.target=Math.max(0,m.target-1);saveCardio(d);drawPriorities()});
    v.querySelectorAll('[data-cardio-plus]').forEach(b=>b.onclick=()=>{const d=cardioData(),m=d.modalities.find(x=>x.id===b.dataset.cardioPlus);if(m)m.target=Math.min(14,m.target+1);saveCardio(d);drawPriorities()});
    v.querySelectorAll('[data-cardio-delete-modality]').forEach(b=>b.onclick=()=>{const d=cardioData();d.modalities=d.modalities.filter(x=>x.id!==b.dataset.cardioDeleteModality);Object.values(d.weeks||{}).forEach(w=>{if(w&&typeof w==='object'&&!Array.isArray(w))delete w[b.dataset.cardioDeleteModality]});saveCardio(d);drawPriorities()});
  }
  wirePriorityReorder(v);
}
function wireMuscleReorder(root){
  const cards=[...root.querySelectorAll('.muscle-order-card[data-muscle-order]')];
  if(cards.length<2)return;

  let active=null,pointerId=null,timer=null,startX=0,startY=0,lastY=0;
  const clearTimer=()=>{if(timer){clearTimeout(timer);timer=null}};
  const cleanup=()=>{
    clearTimer();
    if(active){
      const keys=[...root.querySelectorAll('.muscle-order-card[data-muscle-order]')].map(x=>x.dataset.muscleOrder);
      saveMuscleOrder(keys);
      active.classList.remove('muscle-dragging');
    }
    root.querySelectorAll('.muscle-order-card').forEach(x=>x.classList.remove('muscle-drop-before','muscle-drop-after'));
    document.body.classList.remove('muscle-reordering');
    active=null;pointerId=null;
  };

  cards.forEach(card=>{
    // Real touch handle: easier and more reliable than dragging the whole card on iPhone.
    if(!card.querySelector('.muscle-drag-handle')){
      const h=document.createElement('span');
      h.className='muscle-drag-handle';
      h.textContent='≡';
      h.setAttribute('aria-hidden','true');
      card.appendChild(h);
    }
    const handle=card.querySelector('.muscle-drag-handle');

    handle.addEventListener('pointerdown',e=>{
      if(e.pointerType==='mouse' && e.button!==0)return;
      e.preventDefault();
      pointerId=e.pointerId;startX=e.clientX;startY=e.clientY;lastY=e.clientY;
      clearTimer();
      timer=setTimeout(()=>{
        active=card;timer=null;
        card.classList.add('muscle-dragging');
        document.body.classList.add('muscle-reordering');
        try{handle.setPointerCapture(pointerId)}catch(_){}
        try{navigator.vibrate?.(18)}catch(_){}
      },260);
    },{passive:false});

    handle.addEventListener('pointermove',e=>{
      if(e.pointerId!==pointerId)return;
      if(!active){
        if(Math.hypot(e.clientX-startX,e.clientY-startY)>14)clearTimer();
        return;
      }
      e.preventDefault();
      lastY=e.clientY;
      root.querySelectorAll('.muscle-order-card').forEach(x=>x.classList.remove('muscle-drop-before','muscle-drop-after'));
      const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.muscle-order-card[data-muscle-order]');
      if(!target||target===active)return;
      const r=target.getBoundingClientRect();
      if(e.clientY<r.top+r.height/2){
        target.classList.add('muscle-drop-before');
        target.before(active);
      }else{
        target.classList.add('muscle-drop-after');
        target.after(active);
      }
    },{passive:false});

    handle.addEventListener('pointerup',e=>{if(e.pointerId===pointerId)cleanup()});
    handle.addEventListener('pointercancel',e=>{if(e.pointerId===pointerId)cleanup()});
  });
}
function wirePriorityReorder(root){wireMuscleReorder(root)}

async function changePriority(muscleKey,priority){let p=state.priorities.find(x=>x.muscle_key===muscleKey);if(!p)return;let[min,max]=derivedRange(p.muscle_name,priority);cloud('ENREGISTREMENT…');await req('/forgelab_priorities?user_id=eq.'+encodeURIComponent(uid())+'&muscle_key=eq.'+encodeURIComponent(muscleKey),{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({priority,target_min:min,target_max:max,updated_at:new Date().toISOString()})});await load()}
let saveTimers={};
let saveState={}; // per-cell serialized cloud writes; latest value always wins

function programStatus(programmed,min,max){
  if(programmed<min)return [`Reste ${Math.max(0,min-programmed)}`,'remaining'];
  if(programmed===max)return ['Maximum atteint','maximum'];
  if(programmed>max)return ['Maximum dépassé','overmax'];
  return ['Minimum atteint','complete'];
}
function programDayMinutes(entries){return Math.round(entries.reduce((s,x)=>s+Number(x.sets||0),0)*2.5)}
function programOptions(selected=''){return activePriorities().map(p=>`<option value="${esc(p.muscle_key)}" ${p.muscle_key===selected?'selected':''}>${esc(p.muscle_name)}</option>`).join('')}
function drawProgramming(){
  const v=document.querySelector('#view'),p=programmingData(),totals=programTotals(p),presets=programmingPresets();
  const allSets=DAYS.reduce((a,d)=>a+(p[d]||[]).reduce((s,x)=>s+Number(x.sets||0),0),0);
  const daysUsed=DAYS.filter(d=>(p[d]||[]).some(x=>Number(x.sets||0)>0)).length;
  const rows=DAYS.map(day=>{
    const entries=p[day]||[],totalSets=entries.reduce((s,x)=>s+Number(x.sets||0),0),minutes=programDayMinutes(entries),durationClass=minutes>60?'over':minutes>50?'near':'';
    const items=entries.length?entries.map(x=>{
      const pr=programPriority(x.muscle_key),[mi,ma]=programRange(x.muscle_key),programmed=totals[x.muscle_key]?.sets||0,[label,klass]=programStatus(programmed,mi,ma);
      return `<div class="mobile-program-entry" data-id="${esc(x.id)}">
        <button type="button" class="mobile-program-drag" aria-label="Réordonner ${esc(x.muscle_name)}">⠿</button>
        <span class="mobile-program-badge ${pr.toLowerCase()}">${pr}</span>
        <div class="mobile-program-muscle"><strong>${esc(x.muscle_name)}</strong><small class="${klass}">${label}</small></div>
        <input class="mobile-program-sets" type="text" inputmode="numeric" pattern="[0-9]*" value="${Number(x.sets||0)}" data-program-sets aria-label="Séries ${esc(x.muscle_name)}">
        <button type="button" class="mobile-program-remove" data-program-remove aria-label="Retirer ${esc(x.muscle_name)}">×</button>
      </div>`;
    }).join(''):`<div class="mobile-program-empty">Aucun groupe programmé.</div>`;
    return `<article class="mobile-program-day" data-program-day="${day}">
      <header class="mobile-program-day-head">
        <button type="button" class="mobile-session-drag" aria-label="Déplacer la séance du ${day}">⠿</button>
        <div><strong>${({Lun:'Lundi',Mar:'Mardi',Mer:'Mercredi',Jeu:'Jeudi',Ven:'Vendredi',Sam:'Samedi',Dim:'Dimanche'})[day]}</strong><span>${totalSets} séries</span></div>
        <b class="mobile-program-duration ${durationClass}">≈ ${minutes} min</b>
      </header>
      <div class="mobile-program-list">${items}</div>
      <div class="mobile-program-add">
        <button type="button" data-program-add-trigger>＋ Ajouter un groupe</button>
        <div class="mobile-program-add-panel" hidden>
          <select data-program-muscle><option value="">Groupe musculaire</option>${programOptions()}</select>
          <select data-program-add-sets><option value="">Séries</option>${Array.from({length:20},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('')}</select>
          <button type="button" data-program-add-confirm disabled>Ajouter</button>
        </div>
      </div>
    </article>`;
  }).join('');
  const summary=activePriorities().map(m=>{const t=totals[m.muscle_key]||{sets:0,freq:0},mi=+m.target_min||0,ma=+m.target_max||0,[label,klass]=programStatus(t.sets,mi,ma);return `<div class="program-summary-row"><div><strong>${esc(m.muscle_name)}</strong><span>${m.priority} · cible ${mi}–${ma}</span></div><b>${t.sets}</b><em class="${klass}">${label}</em><i>${t.freq}×</i></div>`}).join('');
  v.innerHTML=title('Programmation des séances')+
   `<section class="program-mobile-steps"><div class="active"><b>1</b><span>Répartition musculaire</span></div><div><b>2</b><span>Programmation des exercices</span></div></section>`+
   `<p class="program-mobile-intro">Répartis les séries hebdomadaires sur tes séances. ForgeLab affiche les totaux, la fréquence et une estimation simple de la durée.</p>`+
   `<div class="program-mobile-actions"><button type="button" data-program-auto>Répartir selon les priorités</button><button type="button" class="secondary" data-program-clear>Vider</button></div>`+
   `<section class="program-mobile-library"><div><small>BIBLIOTHÈQUE DE BLOCS</small><strong>Enregistrer puis réutiliser une structure</strong></div><button type="button" data-program-save-preset>Enregistrer</button>${presets.length?`<select data-program-preset><option value="">Choisir un bloc enregistré</option>${presets.map((x,i)=>`<option value="${i}">${esc(x.name)}</option>`).join('')}</select><div class="program-preset-actions"><button type="button" data-program-restore-preset>Réintégrer</button><button type="button" class="danger" data-program-delete-preset>Supprimer</button></div>`:'<p>Aucun bloc enregistré.</p>'}</section>`+
   `<section class="program-mobile-note">Répartition automatique : P0 sur lundi / mercredi / vendredi, P1 sur deux séances, P2 sur une séance. Les séries proposées utilisent la borne basse de la fourchette actuelle.</section>`+
   `<div class="program-mobile-kpis"><div><b>${allSets}</b><span>séries programmées</span></div><div><b>${daysUsed}</b><span>séances utilisées</span></div></div>`+
   `<div class="program-mobile-days">${rows}</div>`+
   `<details class="program-mobile-summary"><summary>Bilan de la programmation</summary><div>${summary}</div></details>`;

  v.querySelector('[data-program-auto]').onclick=()=>autoProgramming();
  v.querySelector('[data-program-clear]').onclick=()=>{if(confirm('Vider toute la programmation ?'))saveProgramming(blankProgramming())};
  v.querySelector('[data-program-save-preset]').onclick=()=>{const name=(prompt('Nom du bloc à enregistrer :','Bloc ForgeLab')||'').trim();if(!name)return;const list=programmingPresets();list.push({name,programming:p,createdAt:new Date().toISOString()});saveProgrammingPresets(list);drawProgramming()};
  const presetSelect=v.querySelector('[data-program-preset]');
  v.querySelector('[data-program-restore-preset]')?.addEventListener('click',()=>{const i=Number(presetSelect?.value);if(!Number.isInteger(i)||!programmingPresets()[i])return;saveProgramming(structuredClone(programmingPresets()[i].programming))});
  v.querySelector('[data-program-delete-preset]')?.addEventListener('click',()=>{const i=Number(presetSelect?.value),list=programmingPresets();if(!Number.isInteger(i)||!list[i])return;list.splice(i,1);saveProgrammingPresets(list);drawProgramming()});

  v.querySelectorAll('.mobile-program-day').forEach(card=>{
    const day=card.dataset.programDay,list=card.querySelector('.mobile-program-list');
    card.querySelectorAll('.mobile-program-entry').forEach(row=>{
      const id=row.dataset.id,input=row.querySelector('[data-program-sets]');
      input.oninput=()=>{const n=Math.max(0,Math.min(30,parseInt((input.value||'').replace(/\D/g,''),10)||0));input.value=String(n);const d=programmingData(),item=d[day].find(x=>x.id===id);if(item)item.sets=n;saveProgramming(d,false)};
      input.onblur=()=>drawProgramming();
      row.querySelector('[data-program-remove]').onclick=()=>{const d=programmingData();d[day]=d[day].filter(x=>x.id!==id);saveProgramming(d)};
    });
    const trigger=card.querySelector('[data-program-add-trigger]'),panel=card.querySelector('.mobile-program-add-panel'),muscle=card.querySelector('[data-program-muscle]'),sets=card.querySelector('[data-program-add-sets]'),confirmBtn=card.querySelector('[data-program-add-confirm]');
    trigger.onclick=()=>{panel.hidden=!panel.hidden};
    const sync=()=>confirmBtn.disabled=!(muscle.value&&sets.value);muscle.onchange=sync;sets.onchange=sync;
    confirmBtn.onclick=()=>{if(!muscle.value||!sets.value)return;const d=programmingData(),pr=state.priorities.find(x=>x.muscle_key===muscle.value),existing=d[day].find(x=>x.muscle_key===muscle.value);if(existing)existing.sets+=Number(sets.value);else d[day].push({id:newProgramId(),muscle_key:muscle.value,muscle_name:pr?.muscle_name||muscle.value,sets:Number(sets.value)});saveProgramming(d)};
  });
  wireProgramRowReorder(v);
  wireSessionMove(v);
}
function wireProgramRowReorder(root){
  root.querySelectorAll('.mobile-program-day').forEach(card=>{
    const day=card.dataset.programDay,list=card.querySelector('.mobile-program-list');let active=null,pointerId=null,startY=0,timer=null;
    const finish=()=>{if(timer)clearTimeout(timer);timer=null;if(active){const d=programmingData(),ids=[...list.querySelectorAll('.mobile-program-entry')].map(x=>x.dataset.id),map=new Map(d[day].map(x=>[x.id,x]));d[day]=ids.map(id=>map.get(id)).filter(Boolean);saveProgramming(d,false);active.classList.remove('program-touch-dragging');active=null;drawProgramming()}pointerId=null};
    card.querySelectorAll('.mobile-program-entry').forEach(row=>{const h=row.querySelector('.mobile-program-drag');h.onpointerdown=e=>{e.preventDefault();pointerId=e.pointerId;startY=e.clientY;timer=setTimeout(()=>{active=row;row.classList.add('program-touch-dragging');try{h.setPointerCapture(pointerId)}catch(_){}},220)};h.onpointermove=e=>{if(e.pointerId!==pointerId)return;if(!active){if(Math.abs(e.clientY-startY)>12){clearTimeout(timer);timer=null}return}e.preventDefault();const siblings=[...list.querySelectorAll('.mobile-program-entry:not(.program-touch-dragging)')],next=siblings.find(el=>e.clientY<el.getBoundingClientRect().top+el.getBoundingClientRect().height/2);if(next)list.insertBefore(active,next);else list.appendChild(active)};h.onpointerup=finish;h.onpointercancel=finish});
  });
}
function wireSessionMove(root){
  let from=null,activeCard=null,pointerId=null,timer=null,startY=0,targetDay=null;
  const clearTargets=()=>root.querySelectorAll('.mobile-program-day').forEach(x=>x.classList.remove('session-drop-target','session-dragging'));
  const finish=()=>{if(timer)clearTimeout(timer);timer=null;if(from&&targetDay&&from!==targetDay){const d=programmingData(),a=d[from],b=d[targetDay];d[from]=b;d[targetDay]=a;saveProgramming(d,false)}clearTargets();from=null;targetDay=null;activeCard=null;pointerId=null;drawProgramming()};
  root.querySelectorAll('.mobile-program-day').forEach(card=>{const h=card.querySelector('.mobile-session-drag');h.onpointerdown=e=>{e.preventDefault();from=card.dataset.programDay;pointerId=e.pointerId;startY=e.clientY;timer=setTimeout(()=>{activeCard=card;card.classList.add('session-dragging');try{h.setPointerCapture(pointerId)}catch(_){}},260)};h.onpointermove=e=>{if(e.pointerId!==pointerId)return;if(!activeCard){if(Math.abs(e.clientY-startY)>13){clearTimeout(timer);timer=null}return}e.preventDefault();clearTargets();activeCard.classList.add('session-dragging');const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest('.mobile-program-day');if(hit&&hit!==activeCard){hit.classList.add('session-drop-target');targetDay=hit.dataset.programDay}else targetDay=null};h.onpointerup=finish;h.onpointercancel=finish});
}

function drawSeries(){
  let v=document.querySelector('#view');
  v.innerHTML=title('Séries / semaine')+activePriorities().map(p=>{
    let map=Object.fromEntries(rows(p.muscle_key).map(x=>[+x.day,+x.series]));
    return`<article class="card ${p.priority.toLowerCase()} muscle-order-card" data-card="${esc(p.muscle_key)}" data-muscle-order="${esc(p.muscle_key)}">
      <div class="cardhead"><div><div class="muscle">${esc(p.muscle_name)}</div><div class="range">Cible ${p.target_min}–${p.target_max}</div></div><span class="badge">${p.priority}</span></div>
      <div class="days">${DAYS.map((d,i)=>`<div class="day"><label>${d}</label><input class="series-input" type="text" inputmode="numeric" pattern="[0-9]*" enterkeyhint="done" value="${map[i+1]||0}" data-m="${esc(p.muscle_key)}" data-d="${i+1}" aria-label="${d} ${esc(p.muscle_name)}"></div>`).join('')}</div>
      <div class="totalrow"><span>Total semaine</span><b data-total="${esc(p.muscle_key)}">${total(p.muscle_key)} séries</b></div>
    </article>`
  }).join('')+cardioSeriesHtml();

  wireSeriesInputs(v);
  wireCardioSeries(v);
  wireMuscleReorder(v);
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
    return`<article class="card ${p.priority.toLowerCase()} tracking-card muscle-order-card" data-muscle-order="${esc(p.muscle_key)}">
      <div class="cardhead"><div><div class="muscle">${esc(p.muscle_name)}</div><div class="range">Priorité ${p.priority} · cible ${mi}–${ma}</div></div><span class="status ${st[1]}">${st[0]}</span></div>
      <div class="tracking-numbers"><div><span>Prévu</span><b>${mi}–${ma}</b></div><div><span>Réalisé</span><b>${t}</b></div><div><span>Reste</span><b>${left}</b></div></div>
      <div class="progress ${barClass}"><i style="width:${pc}%"></i></div>
      <div class="trackline"><span>${pc}% du minimum</span><strong>${t} / ${mi}</strong></div>
    </article>`
  }).join('');
  wireMuscleReorder(v);
}

function cardioSeriesHtml(){
  const d=cardioData();if(!d.enabled)return'';
  const target=cardioTotalTarget(),done=cardioTotalDone();
  return `<article class="card ${d.priority.toLowerCase()} cardio-series-card">
    <div class="cardhead"><div><div class="muscle">♥ Cardio</div><div class="range">${d.modalities.length} modalité${d.modalities.length>1?'s':''} · objectif ${target} séance${target>1?'s':''}</div></div><span class="badge">${d.priority}</span></div>
    <div class="cardio-series-progress"><span>S${state.week}</span><strong>${done} / ${target} réalisée${done>1?'s':''}</strong></div>
    <div class="cardio-series-modalities">${d.modalities.map(m=>{const {week}=cardioWeek(),days=week[m.id]||{},mt=cardioModalityTotal(m.id);return`<div class="cardio-series-modality"><div class="cardio-series-modality-head"><strong>${esc(m.type)}</strong><span>${mt}/${m.target}</span></div><div class="days cardio-days">${DAYS.map((day,i)=>`<div class="day"><label>${day}</label><input class="cardio-day-input" type="text" inputmode="numeric" pattern="[0-9]*" enterkeyhint="done" value="${+days[i+1]||0}" data-cardio-modality="${esc(m.id)}" data-cardio-day="${i+1}" aria-label="${day} ${esc(m.type)}"></div>`).join('')}</div></div>`}).join('')}</div>
    <div class="totalrow"><span>Total cardio semaine</span><b data-cardio-total>${done} séance${done>1?'s':''}</b></div>
  </article>`
}
function wireCardioSeries(v){
  v.querySelectorAll('.cardio-day-input').forEach(i=>{
    i.addEventListener('focus',()=>{try{i.select()}catch(_){}});
    i.addEventListener('input',()=>{
      const raw=(i.value||'').replace(/[^0-9]/g,'');if(raw==='')return;
      const n=Math.max(0,Math.min(9,parseInt(raw,10)||0)),d=cardioData(),k=String(state.week),mid=i.dataset.cardioModality,day=String(+i.dataset.cardioDay);
      if(!d.weeks[k]||Array.isArray(d.weeks[k]))d.weeks[k]={};if(!d.weeks[k][mid])d.weeks[k][mid]={};d.weeks[k][mid][day]=n;saveCardio(d);i.value=String(n);
      const modality=d.modalities.find(x=>x.id===mid),row=i.closest('.cardio-series-modality'),mt=Object.values(d.weeks[k][mid]).reduce((a,x)=>a+(+x||0),0);if(row)row.querySelector('.cardio-series-modality-head span').textContent=`${mt}/${modality?.target||0}`;
      const total=d.modalities.reduce((a,m)=>a+Object.values(d.weeks[k][m.id]||{}).reduce((s,x)=>s+(+x||0),0),0),tot=v.querySelector('[data-cardio-total]');if(tot)tot.textContent=`${total} séance${total>1?'s':''}`;const prog=v.querySelector('.cardio-series-progress strong');if(prog)prog.textContent=`${total} / ${cardioTotalTarget()} réalisée${total>1?'s':''}`;
    });
    i.addEventListener('blur',()=>{if((i.value||'')==='')i.value='0'});
  })
}
document.querySelectorAll('nav button').forEach(b=>b.onclick=async()=>{
  state.tab=b.dataset.tab;
  await load(false);
  draw();
});
document.querySelector('#prevWeek').onclick=()=>setWeek(state.week-1);
document.querySelector('#nextWeek').onclick=()=>setWeek(state.week+1);

async function boot(){importPcProgrammingV165();await load();clearInterval(poll);poll=setInterval(()=>load(!['series','programming'].includes(state.tab)),12000)}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&currentUser)load()});
(async()=>{if(await restoreAuth()){hideAuth();await boot()}else showAuth()})();
