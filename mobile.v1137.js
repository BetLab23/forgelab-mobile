const URL='https://ocakkunttbjmlvljekbu.supabase.co/rest/v1',KEY='sb_publishable_qgTkkrzwbyWthC_zwWHKcw_PWyrwFKx';
const DAYS=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];let state={week:1,tab:'series',block:'main',blockName:'Bloc actif',blockDuration:13,nutritionContext:'maintenance',priorities:[],series:[]},poll;
const CARDIO_QUALITIES=['🟢 Base aérobie','🟠 Seuil','🔴 Haute intensité / VO₂max','⚫ Conditioning'];
const CARDIO_ENGINES=['Run','SkiErg','Bike','Rower'];
const CARDIO_FORMATS=['Continu','Intervalles'];
const CARDIO_TYPES=CARDIO_ENGINES;
const CARDIO_INTENSITIES=CARDIO_QUALITIES;
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
function programmingDraftKey(){return `forgelabMobileProgrammingDraft:${currentUser?.id||'guest'}`}
function programmingModeKey(){return `forgelabMobileProgrammingMode:${currentUser?.id||'guest'}`}
function programmingMetaKey(mode=programmingMode()){return `forgelabMobileProgrammingMeta:${currentUser?.id||'guest'}:${mode==='draft'?'draft':'active'}`}
function programmingMeta(mode=programmingMode()){
  try{const x=JSON.parse(localStorage.getItem(programmingMetaKey(mode))||'null');if(x)return x}catch(_){}
  return {name:mode==='draft'?'Nouveau bloc':(state.blockName||'Bloc actif'),duration:Number(state.blockDuration||14),rhythm:4}
}
function saveProgrammingMeta(meta,mode=programmingMode()){localStorage.setItem(programmingMetaKey(mode),JSON.stringify(meta))}
function phaseRanges(meta){const n=Math.max(1,Number(meta.duration||14)),r=Math.max(3,Math.min(6,Number(meta.rhythm||4))),out=[];let w=1,c=1;while(w<=n){const end=Math.min(n,w+r-1);out.push({label:`Cycle ${c}`,from:w,to:end,deload:false});w=end+1;if(w<=n){out.push({label:'Deload',from:w,to:w,deload:true});w++}c++}return out}
function programmingMode(){return localStorage.getItem(programmingModeKey())==='draft'?'draft':'active'}
function setProgrammingMode(mode){localStorage.setItem(programmingModeKey(),mode==='draft'?'draft':'active');drawProgramming()}
function programmingStorageKey(){return programmingMode()==='draft'?programmingDraftKey():programmingKey()}
function hasProgrammingDraft(){return !!localStorage.getItem(programmingDraftKey())}
function createProgrammingDraft(copyActive=true){const name=(prompt('Nom du bloc en préparation :','Nouveau bloc')||'').trim();if(!name)return;const duration=Math.max(1,Math.min(52,Number(prompt('Durée du bloc (semaines) :','14'))||14));const rhythm=Math.max(3,Math.min(6,Number(prompt('Semaines de travail avant deload (3 à 6) :','4'))||4));const src=copyActive?programmingDataFromKey(programmingKey()):blankProgramming();localStorage.setItem(programmingDraftKey(),JSON.stringify(src));saveProgrammingMeta({name,duration,rhythm},'draft');localStorage.setItem(programmingModeKey(),'draft');drawProgramming()}
function activateProgrammingDraft(){if(!hasProgrammingDraft())return;if(!confirm('Activer ce brouillon ? Le programme actif sera remplacé.'))return;localStorage.setItem(programmingKey(),localStorage.getItem(programmingDraftKey()));saveProgrammingMeta(programmingMeta('draft'),'active');localStorage.removeItem(programmingDraftKey());localStorage.removeItem(programmingMetaKey('draft'));localStorage.setItem(programmingModeKey(),'active');drawProgramming()}
function deleteProgrammingDraft(){if(!hasProgrammingDraft()||!confirm('Supprimer le brouillon ? Le programme actif ne sera pas modifié.'))return;localStorage.removeItem(programmingDraftKey());localStorage.setItem(programmingModeKey(),'active');drawProgramming()}
function programmingPresetKey(){return `forgelabMobileProgrammingPresets:${currentUser?.id||'guest'}`}
const PC_PROGRAMMING_IMPORT_V165={"Lun":[{"id":"47b888ba-8484-4a34-95c3-ed854f5a4137","muscle_key":"Deltoïde latéral","muscle_name":"Deltoïde latéral","sets":4},{"id":"e2843dc6-6d8b-4cc2-8979-0c9b38421f7f","muscle_key":"Trapèzes moyens","muscle_name":"Trapèzes moyens","sets":4},{"id":"6f78cd77-7234-426c-9963-c7495c566d71","muscle_key":"Pectoraux","muscle_name":"Pectoraux","sets":4},{"id":"ebd9e2bc-1bbc-4440-8f6c-7d9a46f965dc","muscle_key":"Abdominaux","muscle_name":"Abdominaux","sets":4},{"id":"d1b00296-9092-4e63-bd7f-a30917b76eba","muscle_key":"Cou","muscle_name":"Cou","sets":4}],"Mar":[{"id":"8354c8a0-75d3-4a97-91e5-fa0cc9c8ad17","muscle_key":"Adducteurs","muscle_name":"Adducteurs","sets":4},{"id":"b4fcf4c2-a24d-4734-ad4d-5420cf2ef0e6","muscle_key":"Quadriceps","muscle_name":"Quadriceps","sets":3},{"id":"c3d420b4-9848-49f1-9f45-d99c67489361","muscle_key":"Ischios","muscle_name":"Ischios","sets":4},{"id":"55abadd6-07da-47d3-ae46-2c26e152152c","muscle_key":"Fessiers","muscle_name":"Fessiers","sets":3},{"id":"45721ab5-d8f4-491f-ab05-dfa01113e2bb","muscle_key":"Mollets","muscle_name":"Mollets","sets":3}],"Mer":[{"id":"b993a249-9db0-48d9-b8ed-f04b37e8cd43","muscle_key":"Deltoïde latéral","muscle_name":"Deltoïde latéral","sets":4},{"id":"235610c4-751b-410a-970c-f2e04b30fc2c","muscle_key":"Trapèzes moyens","muscle_name":"Trapèzes moyens","sets":4},{"id":"a1b730c2-f4fd-40d6-bd08-7a66b73f06f2","muscle_key":"Dos","muscle_name":"Dos","sets":4},{"id":"bbfd74f5-d3e7-46e1-9168-fec0157b8e55","muscle_key":"Trapèzes supérieurs","muscle_name":"Trapèzes supérieurs","sets":4},{"id":"1cb9bbdd-f926-411c-9322-688c9988980d","muscle_key":"Abdominaux","muscle_name":"Abdominaux","sets":4}],"Jeu":[{"id":"64d655c1-85b3-4afd-abc7-7ffaf5251d06","muscle_key":"Adducteurs","muscle_name":"Adducteurs","sets":4},{"id":"f478d3d4-de8c-494d-acd8-74069294ea39","muscle_key":"Quadriceps","muscle_name":"Quadriceps","sets":3},{"id":"e3c54e79-e085-4f37-9837-8bb01b161f73","muscle_key":"Ischios","muscle_name":"Ischios","sets":4},{"id":"ae9e5431-e3b8-4307-9347-b742af54a864","muscle_key":"Fessiers","muscle_name":"Fessiers","sets":3},{"id":"455a2400-b16e-4260-b380-e8870db2ff32","muscle_key":"Mollets","muscle_name":"Mollets","sets":3}],"Ven":[{"id":"25de6897-62a3-4e56-a5f4-d3dea948257c","muscle_key":"Deltoïde latéral","muscle_name":"Deltoïde latéral","sets":4},{"id":"717fbb21-7b59-462c-956e-605beba2492c","muscle_key":"Trapèzes moyens","muscle_name":"Trapèzes moyens","sets":4},{"id":"5fdbe360-2dcb-41d6-8d15-e498aecf243c","muscle_key":"Pectoraux","muscle_name":"Pectoraux","sets":4},{"id":"a9aa911c-58c0-46ce-9704-5d53cde551ec","muscle_key":"Dos","muscle_name":"Dos","sets":4},{"id":"5cc2487f-932b-4006-b60e-ddb53d1ba8fd","muscle_key":"Trapèzes supérieurs","muscle_name":"Trapèzes supérieurs","sets":4}],"Sam":[{"id":"904114ff-2c99-4dad-b9c3-b097098c0db2","muscle_key":"Biceps","muscle_name":"Biceps","sets":4},{"id":"afe086b2-c754-415a-8162-53a707aed30c","muscle_key":"Triceps","muscle_name":"Triceps","sets":6},{"id":"e802f043-da09-4e0c-9e5f-49e13be7af2d","muscle_key":"Cou","muscle_name":"Cou","sets":4},{"id":"8364ebdb-9e8c-4a95-a57f-5ce78a77df6d","muscle_key":"Avant-bras","muscle_name":"Avant-bras","sets":3}],"Dim":[]};
function importPcProgrammingV165(){
  if(!currentUser?.id)return;
  const marker=`forgelabMobileProgrammingImport:v1123:${currentUser.id}`;
  if(localStorage.getItem(marker)==='1')return;
  localStorage.setItem(programmingKey(),JSON.stringify(PC_PROGRAMMING_IMPORT_V165));
  localStorage.setItem(marker,'1');
}
function newProgramId(){return 'pr_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8)}
function blankProgramming(){return Object.fromEntries(DAYS.map(d=>[d,[]]))}
function programmingDataFromKey(key){
  try{
    const raw=JSON.parse(localStorage.getItem(key)||'null');
    const out=blankProgramming();
    if(raw&&typeof raw==='object')DAYS.forEach(d=>{
      out[d]=Array.isArray(raw[d])?raw[d].map(x=>({id:x.id||newProgramId(),muscle_key:String(x.muscle_key||x.muscle||''),muscle_name:String(x.muscle_name||x.muscle||x.muscle_key||''),sets:Math.max(0,Number(x.sets||0))})).filter(x=>x.muscle_key):[];
    });
    return out;
  }catch(_){return blankProgramming()}
}
function programmingData(){return programmingDataFromKey(programmingStorageKey())}
function saveProgramming(p,redraw=true){localStorage.setItem(programmingStorageKey(),JSON.stringify(p));if(redraw&&state.tab==='programming')drawProgramming()}
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
function defaultCardio(){return {
  enabled:true,
  priority:'P1',
  modalities:[{id:'cardio_default',quality:'🟢 Base aérobie',engine:'Run',format:'Continu',target:2}],
  weeks:{},
  sessions:[{
    id:'cardio_benchmark_run_20260909',
    date:'2026-09-09',
    quality:'🟢 Base aérobie',
    engine:'Run',
    format:'Continu',
    duration:40,
    pace:'7:13',
    avgHr:145,
    rpe:2,
    benchmark:true
  }]
}}
function cardioNormalizeModality(m,i=0){
  const legacy=String(m?.type||'');
  let engine=m?.engine||'Run',quality=m?.quality||'🟢 Base aérobie',format=m?.format||'Continu';
  if(!m?.engine){
    if(/ski/i.test(legacy))engine='SkiErg';
    else if(/rameur|row/i.test(legacy))engine='Rower';
    else if(/vélo|bike/i.test(legacy))engine='Bike';
    else engine='Run';
  }
  if(!m?.quality){
    if(/hiit|intervalles/i.test(legacy))quality='🔴 Haute intensité / VO₂max';
    else if(/burpee|corde|circuit|sled|farmer/i.test(legacy))quality='⚫ Conditioning';
  }
  if(!m?.format && /intervalles/i.test(legacy))format='Intervalles';
  return {
    id:m?.id||('cardio_'+i),
    quality:CARDIO_QUALITIES.includes(quality)?quality:CARDIO_QUALITIES[0],
    engine:CARDIO_ENGINES.includes(engine)?engine:CARDIO_ENGINES[0],
    format:CARDIO_FORMATS.includes(format)?format:CARDIO_FORMATS[0],
    target:Math.max(0,Math.min(14,parseInt(m?.target,10)||0))
  }
}
function cardioData(){
  try{
    const x=JSON.parse(localStorage.getItem(cardioKey())||'null');
    if(!x||typeof x!=='object')return defaultCardio();
    const d={...defaultCardio(),...x,weeks:x.weeks||{},sessions:Array.isArray(x.sessions)?x.sessions:defaultCardio().sessions};
    if(!Array.isArray(d.modalities)||!d.modalities.length)d.modalities=[cardioNormalizeModality({id:'cardio_default',type:x.type,target:Number.isFinite(+x.target)?Math.max(0,+x.target):2},0)];
    d.modalities=d.modalities.map(cardioNormalizeModality);
    Object.keys(d.weeks||{}).forEach(k=>{
      const w=d.weeks[k];
      if(Array.isArray(w)){
        const first=d.modalities[0].id,days={};
        w.filter(x=>x&&x.done).forEach(x=>{const day=Math.max(1,Math.min(7,+x.day||1));days[day]=(days[day]||0)+1});
        d.weeks[k]={[first]:days};
      }
    });
    if(!d.sessions.some(s=>s?.id==='cardio_benchmark_run_20260909'))d.sessions.unshift(defaultCardio().sessions[0]);
    return d
  }catch(_){return defaultCardio()}
}
function saveCardio(data){localStorage.setItem(cardioKey(),JSON.stringify(data))}
function cardioWeek(){const d=cardioData(),k=String(state.week);if(!d.weeks[k]||Array.isArray(d.weeks[k]))d.weeks[k]={};return {data:d,week:d.weeks[k]}}
function cardioModalityTotal(modalityId){const {week}=cardioWeek(),days=week[modalityId]||{};return Object.values(days).reduce((a,n)=>a+(+n||0),0)}
function cardioTotalDone(){const d=cardioData();return d.modalities.reduce((a,m)=>a+cardioModalityTotal(m.id),0)}
function cardioTotalTarget(){const d=cardioData();return d.modalities.reduce((a,m)=>a+(+m.target||0),0)}
function cardioQualityOptions(selected){return CARDIO_QUALITIES.map(x=>`<option ${x===selected?'selected':''}>${esc(x)}</option>`).join('')}
function cardioEngineOptions(selected){return CARDIO_ENGINES.map(x=>`<option ${x===selected?'selected':''}>${esc(x)}</option>`).join('')}
function cardioFormatOptions(selected){return CARDIO_FORMATS.map(x=>`<option ${x===selected?'selected':''}>${esc(x)}</option>`).join('')}
function cardioTypeOptions(selected){return cardioEngineOptions(selected)}
function cardioIntensityOptions(selected){return cardioQualityOptions(selected)}
function cardioBaseRunSessions(){
  return cardioData().sessions.filter(s=>s.quality==='🟢 Base aérobie'&&s.engine==='Run').sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));
}
function paceToSeconds(p){
  const m=String(p||'').trim().match(/^(\d{1,2}):([0-5]\d)$/);
  return m?(+m[1]*60 + +m[2]):null
}
function cardioComparable(a,b){return Math.abs((+a.avgHr||0)-(+b.avgHr||0))<=5 && Math.abs((+a.rpe||0)-(+b.rpe||0))<=1}
function cardioSaveBaseRunSession(payload){
  const d=cardioData();
  d.sessions=Array.isArray(d.sessions)?d.sessions:[];
  d.sessions.push({
    id:'cardio_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),
    date:payload.date,
    quality:'🟢 Base aérobie',
    engine:'Run',
    format:'Continu',
    duration:Math.max(1,+payload.duration||0),
    pace:String(payload.pace||'').trim(),
    avgHr:Math.max(1,+payload.avgHr||0),
    rpe:Math.max(1,Math.min(10,+payload.rpe||0))
  });
  saveCardio(d);
}

const JOURNAL_LIBRARY={"Cou": ["Extension du cou", "Flexion du cou", "Flexion latérale du cou"], "Trapèzes supérieurs": ["Shrug haltères debout", "Shrug haltères assis", "Shrug barre", "Shrug haltères buste incliné", "Élévation en Y", "Farmer carry", "Tirage menton barre", "Rowing barre buste penché"], "Deltoïde antérieur": ["Développé militaire haltères assis", "Développé militaire haltères debout", "Développé militaire barre", "Développé Arnold assis", "Développé Arnold debout", "Élévation frontale haltères"], "Deltoïde latéral": ["Élévation latérale assise", "Élévation latérale debout"], "Deltoïde postérieur": ["Oiseau buste penché"], "Biceps": ["Curl haltères", "Curl barre", "Curl incliné", "Curl pupitre", "Curl marteau", "Traction supination"], "Triceps": ["Barre au front", "Extension haltères au front", "Dips", "Kickback", "Pompes diamant"], "Pectoraux": ["Développé couché haltères", "Développé couché barre", "Développé incliné haltères", "Développé incliné barre", "Développé décliné haltères", "Développé décliné barre", "Écarté couché haltères", "Écarté incliné haltères", "Écarté décliné haltères", "Pompes", "Pompes pieds surélevés", "Landmine Chest Press"], "Abdominaux": ["Crunch lesté", "Ab Wheel", "Relevé de jambes suspendu", "Relevé de genoux suspendu", "Flexion latérale obliques", "Rotation oblique Landmine"], "Dos": ["Rowing barre buste penché", "Rowing haltère buste penché", "Rowing haltères banc incliné", "Tirage bûcheron", "Traction pronation", "Traction prise neutre", "Rowing Landmine"], "Quadriceps": ["Leg extension", "Back squat", "Front squat", "Squat sumo haltère/kettlebell", "Fentes avant", "Air squat", "Fentes arrière"], "Ischios": ["Leg curl assis", "Leg curl allongé avec haltère", "Soulevé de terre jambes tendues barre", "Soulevé de terre jambes tendues haltères"], "Fessiers": ["Hip thrust", "Fentes arrière", "Soulevé de terre jambes semi-tendues"], "Mollets": ["Extension mollets debout barre", "Extension mollets debout haltères", "Extension mollets unilatérale haltère", "Extension mollets assis"], "Avant-bras": ["Flexion avant bras barre", "Flexion avant bras haltères", "Extension avant bras barre", "Extension avant bras haltères", "Bobine Andrieux", "Farmer carry"], "Trapèzes moyens": ["Rowing buste penché (coudes écartés)"], "Adducteurs": ["Copenhagen Plank", "Deadlift sumo", "Squat sumo barre", "Squat sumo Dumbbells"]};
let journalDraft=null;
const jKey=()=>`forgelabMobileJournal:${currentUser?.id||'guest'}`;
const jDraftKey=()=>`forgelabMobileJournalDrafts:${currentUser?.id||'guest'}`;
const jCloudStampKey=()=>`forgelabMobileJournalCloudStamp:${currentUser?.id||'guest'}`;
const jCloudDirtyKey=()=>`forgelabMobileJournalCloudDirty:${currentUser?.id||'guest'}`;

const jLoad=()=>{try{return JSON.parse(localStorage.getItem(jKey())||'[]')}catch(_){return[]}};
const jDraftLoad=()=>{try{return JSON.parse(localStorage.getItem(jDraftKey())||'[]')}catch(_){return[]}};
const jRawSave=x=>localStorage.setItem(jKey(),JSON.stringify(Array.isArray(x)?x:[]));
const jDraftRawSave=x=>localStorage.setItem(jDraftKey(),JSON.stringify(Array.isArray(x)?x:[]));

let journalCloudTimer=null,journalCloudBusy=false,journalCloudAvailable=true;

function journalCloudMarkDirty(){
  if(currentUser?.id)localStorage.setItem(jCloudDirtyKey(),'1');
}
function journalCloudQueue(){
  if(!currentUser?.id||!journalCloudAvailable)return;
  clearTimeout(journalCloudTimer);
  journalCloudTimer=setTimeout(()=>pushJournalCloud(),450);
}
const jSave=x=>{jRawSave(x);journalCloudMarkDirty();journalCloudQueue()};
const jDraftSave=x=>{jDraftRawSave(x);journalCloudMarkDirty();journalCloudQueue()};

function jMergeById(cloud=[],local=[]){
  const m=new Map();
  [...cloud,...local].forEach(x=>{if(x&&x.id)m.set(x.id,x)});
  return [...m.values()];
}
async function pushJournalCloud(){
  if(!currentUser?.id||journalCloudBusy||!journalCloudAvailable)return;
  journalCloudBusy=true;
  try{
    const now=new Date().toISOString();
    await req('/forgelab_journal_state?on_conflict=user_id',{
      method:'POST',
      headers:{Prefer:'resolution=merge-duplicates,return=minimal'},
      body:JSON.stringify({
        user_id:uid(),
        sessions:jLoad(),
        drafts:jDraftLoad(),
        updated_at:now
      })
    });
    localStorage.setItem(jCloudStampKey(),now);
    localStorage.removeItem(jCloudDirtyKey());
  }catch(e){
    // Si la migration SQL n'est pas encore installée, le Carnet continue
    // à fonctionner localement sans bloquer le reste de ForgeLab.
    console.warn('Synchronisation Carnet indisponible',e);
    if(String(e?.message||'').includes('forgelab_journal_state'))journalCloudAvailable=false;
  }finally{
    journalCloudBusy=false;
  }
}
async function syncJournalCloud(){
  if(!currentUser?.id||journalCloudBusy||!journalCloudAvailable)return false;
  journalCloudBusy=true;
  try{
    const rows=await req(`/forgelab_journal_state?select=user_id,sessions,drafts,updated_at&user_id=eq.${encodeURIComponent(uid())}&limit=1`);
    const row=rows?.[0]||null;
    const localSessions=jLoad(),localDrafts=jDraftLoad();
    const dirty=localStorage.getItem(jCloudDirtyKey())==='1';
    const stamp=localStorage.getItem(jCloudStampKey());

    if(!row){
      // Première utilisation du cloud : on envoie automatiquement les séances
      // déjà présentes dans Safari / ce contexte.
      if(localSessions.length||localDrafts.length){
        const now=new Date().toISOString();
        await req('/forgelab_journal_state?on_conflict=user_id',{
          method:'POST',
          headers:{Prefer:'resolution=merge-duplicates,return=minimal'},
          body:JSON.stringify({user_id:uid(),sessions:localSessions,drafts:localDrafts,updated_at:now})
        });
        localStorage.setItem(jCloudStampKey(),now);
        localStorage.removeItem(jCloudDirtyKey());
      }
      return true;
    }

    const cloudSessions=Array.isArray(row.sessions)?row.sessions:[];
    const cloudDrafts=Array.isArray(row.drafts)?row.drafts:[];

    if(!stamp){
      // Migration depuis l'ancien stockage local : union sans perte.
      const mergedSessions=jMergeById(cloudSessions,localSessions);
      const mergedDrafts=jMergeById(cloudDrafts,localDrafts);
      jRawSave(mergedSessions);
      jDraftRawSave(mergedDrafts);
      const now=new Date().toISOString();
      await req('/forgelab_journal_state?on_conflict=user_id',{
        method:'POST',
        headers:{Prefer:'resolution=merge-duplicates,return=minimal'},
        body:JSON.stringify({user_id:uid(),sessions:mergedSessions,drafts:mergedDrafts,updated_at:now})
      });
      localStorage.setItem(jCloudStampKey(),now);
      localStorage.removeItem(jCloudDirtyKey());
      return true;
    }

    if(dirty){
      // Modifications locales en attente : elles restent prioritaires.
      const now=new Date().toISOString();
      await req('/forgelab_journal_state?on_conflict=user_id',{
        method:'POST',
        headers:{Prefer:'resolution=merge-duplicates,return=minimal'},
        body:JSON.stringify({user_id:uid(),sessions:localSessions,drafts:localDrafts,updated_at:now})
      });
      localStorage.setItem(jCloudStampKey(),now);
      localStorage.removeItem(jCloudDirtyKey());
      return true;
    }

    // Aucun changement local : Supabase devient la référence et alimente
    // Safari comme la PWA écran d'accueil.
    const cloudTime=Date.parse(row.updated_at||0)||0;
    const localTime=Date.parse(stamp||0)||0;
    if(cloudTime>=localTime){
      jRawSave(cloudSessions);
      jDraftRawSave(cloudDrafts);
      localStorage.setItem(jCloudStampKey(),row.updated_at||new Date().toISOString());
    }
    return true;
  }catch(e){
    console.warn('Synchronisation Carnet indisponible',e);
    if(String(e?.message||'').includes('forgelab_journal_state'))journalCloudAvailable=false;
    return false;
  }finally{
    journalCloudBusy=false;
  }
}

function jCalendarDateForDay(day){
  const now=new Date();
  const current=now.getDay()===0?7:now.getDay();
  const d=new Date(now);
  d.setHours(12,0,0,0);
  d.setDate(d.getDate()+(+day-current));
  const p=n=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}
function jMuscleLabel(key){
  return state.priorities.find(p=>p.muscle_key===key)?.muscle_name || key;
}
function jDraftId(week,day){return `auto_${state.block||'main'}_S${week}_J${day}`}


function jMuscleKeyFromSessionExercise(e){
  if(e?.muscleKey)return e.muscleKey;
  const byName=state.priorities.find(p=>String(p.muscle_name||'').trim().toLocaleLowerCase('fr')===String(e?.muscle||'').trim().toLocaleLowerCase('fr'));
  return byName?.muscle_key||null;
}
function jFilledSetCount(e){
  return (e?.sets||[]).filter(s=>(+s.reps||0)>0 || (+s.kg||0)>0).length;
}
function jSeriesRequirementsFromHistory(){
  const required=new Map();
  const sessions=jLoad().filter(s=>s?.draftId && /^auto_.+_S\d+_J\d+$/.test(s.draftId));

  sessions.forEach(s=>{
    const m=String(s.draftId).match(/^auto_(.+)_S(\d+)_J(\d+)$/);
    if(!m)return;
    const block=m[1]||'main',week=+m[2],day=+m[3];
    if(block!==(state.block||'main') && block!=='main')return;

    (s.exercises||[]).forEach(e=>{
      const muscleKey=jMuscleKeyFromSessionExercise(e);
      if(!muscleKey)return;
      const count=jFilledSetCount(e);
      if(count<=0)return;
      const k=`${week}|${muscleKey}|${day}`;
      required.set(k,(required.get(k)||0)+count);
    });
  });
  return required;
}
async function repairSeriesFromCarnet(cloudRows){
  // v1.12.3 : fonction conservée uniquement pour compatibilité interne.
  // Le Carnet n'est plus autorisé à restaurer ou modifier Séries.
  return Array.isArray(cloudRows)?cloudRows:[];
}

function jSeriesBaselineForDraft(id){
  const sessions=jLoad()
    .filter(s=>s.draftId===id)
    .sort((a,b)=>String(b.validatedAt||b.updatedAt||b.createdAt||b.date||'').localeCompare(String(a.validatedAt||a.updatedAt||a.createdAt||a.date||'')));
  const last=sessions[0];
  if(!last)return new Map();

  // Les nouvelles validations mémorisent le cumul exact de l'onglet Séries.
  if(last.seriesSnapshot&&typeof last.seriesSnapshot==='object'){
    return new Map(Object.entries(last.seriesSnapshot).map(([k,v])=>[k,Math.max(0,+v||0)]));
  }

  // Compatibilité immédiate avec les séances déjà validées avant v1.12.3 :
  // le nombre de lignes du brouillon validé sert de référence.
  const out=new Map();
  (last.exercises||[]).forEach(e=>{
    const key=e.muscleKey||e.muscle;
    if(key)out.set(key,(out.get(key)||0)+(e.sets||[]).length);
  });
  return out;
}

function syncJournalDraftFromSeries(week,day){
  week=+week; day=+day;
  const id=jDraftId(week,day);
  const baseline=jSeriesBaselineForDraft(id);
  const currentRows=state.series
    .filter(x=>+x.week===week && +x.day===day && (+x.series||0)>0)
    .map(x=>({...x,series:Math.max(0,(+x.series||0)-(baseline.get(x.muscle_key)||0))}))
    .filter(x=>(+x.series||0)>0);
  let drafts=jDraftLoad();
  const idx=drafts.findIndex(x=>x.id===id);

  if(!currentRows.length){
    if(idx>=0){
      // Un brouillon encore intact peut disparaître si toutes les séries sont remises à zéro.
      // Dès qu'il contient des performances/nom/notes, on le conserve.
      const d=drafts[idx];
      const touched=(d.sessionName||'').trim() || (d.notes||'').trim() ||
        (d.exercises||[]).some(e=>(e.sets||[]).some(s=>(+s.kg||0)||(+s.reps||0)));
      if(!touched){drafts.splice(idx,1);jDraftSave(drafts)}
    }
    return;
  }

  let d=idx>=0?drafts[idx]:{
    id,
    source:'series',
    status:'draft',
    block:state.block||'main',
    week,
    day,
    sessionName:'',
    date:jCalendarDateForDay(day),
    duration:0,
    notes:'',
    createdAt:new Date().toISOString(),
    exercises:[]
  };

  // Un groupe musculaire = un bloc précréé avec exactement le nombre de lignes
  // de séries demandé dans l'onglet Séries.
  // IMPORTANT : l'ordre du brouillon suit l'ordre de première saisie des groupes.
  d.hiddenMuscles=d.hiddenMuscles&&typeof d.hiddenMuscles==='object'?d.hiddenMuscles:{};
  currentRows.forEach(r=>{
    const hiddenAt=+d.hiddenMuscles[r.muscle_key]||0;
    // Si le nombre de séries change après suppression manuelle, le groupe redevient pertinent.
    if(hiddenAt && hiddenAt!==+r.series)delete d.hiddenMuscles[r.muscle_key];
  });
  const wanted=new Map(
    currentRows
      .filter(r=>!(r.muscle_key in d.hiddenMuscles))
      .map(r=>[r.muscle_key,Math.max(0,+r.series||0)])
  );
  const existingList=Array.isArray(d.exercises)?d.exercises:[];
  const existing=new Map(existingList.map(e=>[e.muscleKey||e.muscle,e]));
  const next=[];

  // 1. On conserve d'abord l'ordre déjà établi dans le brouillon.
  existingList.forEach(e=>{
    const key=e.muscleKey||e.muscle;
    const keepTouched=e.name || (e.sets||[]).some(s=>(+s.kg||0)||(+s.reps||0));
    if(!wanted.has(key) && !keepTouched)return;

    const n=wanted.has(key)?wanted.get(key):(e.sets||[]).length;
    e.muscleKey=key;
    e.muscle=jMuscleLabel(key);
    e.sets=Array.isArray(e.sets)?e.sets:[];
    while(e.sets.length<n)e.sets.push({kg:0,reps:0});
    while(wanted.has(key) && e.sets.length>n &&
      !(+e.sets[e.sets.length-1]?.kg||0) &&
      !(+e.sets[e.sets.length-1]?.reps||0)) e.sets.pop();
    next.push(e);
  });

  // 2. Les nouveaux groupes sont ajoutés à la fin, donc dans l'ordre où
  //    l'utilisateur les renseigne dans Séries.
  currentRows
    .filter(r=>!existing.has(r.muscle_key))
    .sort((a,b)=>(+a.journalEnteredAt||0)-(+b.journalEnteredAt||0))
    .forEach(r=>{
      const key=r.muscle_key, n=wanted.get(key);
      next.push({
        id:jId(),
        muscleKey:key,
        muscle:jMuscleLabel(key),
        name:'',
        journalEnteredAt:+r.journalEnteredAt||Date.now(),
        sets:Array.from({length:n},()=>({kg:0,reps:0}))
      });
    });

  d.exercises=next;
  d.updatedAt=new Date().toISOString();
  if(idx>=0) drafts[idx]=d; else drafts.push(d);
  jDraftSave(drafts);
}

function jDraftRemove(id){
  jDraftRawSave(jDraftLoad().filter(x=>x.id!==id));
  journalCloudMarkDirty();
  journalCloudQueue();
}
function jDeleteDraft(id){
  const d=jDraftLoad().find(x=>x.id===id);
  const name=(d?.sessionName||'').trim();
  if(!confirm(name?`Supprimer définitivement « ${name} » ?`:'Supprimer définitivement ce brouillon ?'))return;
  jDraftRemove(id);
  if(journalDraft?.id===id)journalDraft=null;
  pushJournalCloud();
  drawJournal();
}

function jDraftToJournal(d){
  return {
    ...JSON.parse(JSON.stringify(d)),
    id:jId(),
    source:'series',
    status:'session',
    draftId:d.id
  };
}

const jId=()=>`j_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
const jToday=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`};
const jTon=s=>(s.exercises||[]).reduce((a,e)=>a+(e.sets||[]).reduce((b,x)=>b+(+x.kg||0)*(+x.reps||0),0),0);
const jSets=s=>(s.exercises||[]).reduce((a,e)=>a+(e.sets||[]).filter(x=>(+x.kg||0)||(+x.reps||0)).length,0);
const jDate=x=>x?x.split('-').reverse().join('/'):'—';
const jFmt=n=>new Intl.NumberFormat('fr-FR',{maximumFractionDigits:1}).format(+n||0);
function jPrev(s){
 const all=jLoad().filter(x=>x.id!==s.id);
 const sessionName=(s.sessionName||'').trim().toLocaleLowerCase('fr');
 if(sessionName){
  return all.filter(x=>(x.sessionName||'').trim().toLocaleLowerCase('fr')===sessionName).sort((a,b)=>(b.date||'').localeCompare(a.date||''))[0]||null;
 }
 // Compatibilité des anciennes séances sans nom : comparaison par liste d'exercices.
 const names=(s.exercises||[]).map(e=>e.name).filter(Boolean).sort().join('|');if(!names)return null;
 return all.filter(x=>!(x.sessionName||'').trim()&&(x.exercises||[]).map(e=>e.name).filter(Boolean).sort().join('|')===names).sort((a,b)=>(b.date||'').localeCompare(a.date||''))[0]||null
}
function jMuscles(sel=''){return Object.keys(JOURNAL_LIBRARY).map(x=>`<option ${x===sel?'selected':''}>${esc(x)}</option>`).join('')}
function jExercises(m,sel=''){return `<option value="" ${!sel?'selected':''}>Choisir un exercice…</option>`+(JOURNAL_LIBRARY[m]||[]).map(x=>`<option ${x===sel?'selected':''}>${esc(x)}</option>`).join('')}
function jHistoryTime(s){
 const stamp=s?.validatedAt||s?.updatedAt||s?.createdAt||'';
 const parsed=Date.parse(stamp);
 return Number.isFinite(parsed)?parsed:0;
}
function jHistorySort(a,b){
 const byDate=String(b?.date||'').localeCompare(String(a?.date||''));
 if(byDate)return byDate;
 // Même journée : séance la plus récente en premier.
 return jHistoryTime(b)-jHistoryTime(a);
}
function drawJournal(){
 const v=document.querySelector('#view'),
       drafts=jDraftLoad().sort((a,b)=>(b.date||'').localeCompare(a.date||'')),
       all=jLoad().sort(jHistorySort),
       last=[...all].sort((a,b)=>{
         const byDate=String(b?.date||'').localeCompare(String(a?.date||''));
         return byDate||jHistoryTime(b)-jHistoryTime(a);
       })[0];
 if(journalDraft)return drawJournalEdit();
 v.innerHTML=`<div class="j-title"><div><small>LA FORGE · CARNET</small><h2>Carnet d'entraînement</h2></div><button id="jNew">+ Séance</button></div>
 ${drafts.length?`<section class="j-card j-drafts"><div class="j-section">À compléter <span>${drafts.length}</span></div>
   <div class="j-draft-help">Créé automatiquement depuis tes séries. Les brouillons restent ici jusqu'à validation.</div>
   ${drafts.map(d=>`<div class="j-draft-wrap">
     <button class="j-history j-draft-row" data-jdraft="${d.id}">
       <span><b>${esc(d.sessionName||`Séance S${d.week} · ${DAYS[(+d.day||1)-1]}`)}</b><small>${jDate(d.date)} · ${(d.exercises||[]).map(e=>`${esc(e.muscle)} (${(e.sets||[]).length})`).join(' · ')}</small></span>
       <span><b>${(d.exercises||[]).reduce((a,e)=>a+(e.sets||[]).length,0)} séries</b><small>Brouillon</small></span>
     </button>
     <button type="button" class="j-draft-delete" data-jdraft-delete="${d.id}" aria-label="Supprimer ce brouillon">×</button>
   </div>`).join('')}</section>`:''}
 ${last?`<section class="j-card"><small>DERNIÈRE SÉANCE · ${jDate(last.date)}</small><h3 class="j-session-name">${esc(last.sessionName||'Séance sans nom')}</h3><div class="j-stats"><b>${last.duration||0}<i>min</i></b><b>${jSets(last)}<i>séries</i></b><b>${jFmt(jTon(last))}<i>kg</i></b></div>${last.exercises.map(e=>`<div class="j-perf"><strong>${esc(e.name)}</strong><span>${e.sets.map(s=>`${jFmt(s.kg)}×${+s.reps||0}`).join(' · ')}</span></div>`).join('')}<button id="jResume" class="j-wide">Reprendre cette séance</button></section>`:`<section class="j-card j-empty">Aucune séance validée.<br><span>Les séances issues de Séries apparaissent au-dessus comme brouillons.</span></section>`}
 <section class="j-card"><div class="j-section">Historique <span>${all.length}</span></div>${all.length?all.map(s=>`<button class="j-history" data-jopen="${s.id}"><span><b>${esc(s.sessionName||'Séance sans nom')}</b><small>${jDate(s.date)} · ${s.exercises.map(e=>e.name).slice(0,2).join(' · ')}</small></span><span><b>${jFmt(jTon(s))} kg</b><small>${s.duration||0} min</small></span></button>`).join(''):'<div class="j-muted">Ton historique apparaîtra ici après validation.</div>'}</section>`;
 document.querySelector('#jNew').onclick=()=>{journalDraft={id:jId(),sessionName:'',date:jToday(),duration:0,notes:'',exercises:[]};drawJournalEdit()};
 if(last)document.querySelector('#jResume').onclick=()=>{journalDraft=JSON.parse(JSON.stringify(last));journalDraft.id=jId();journalDraft.date=jToday();journalDraft.notes='';drawJournalEdit()};
 v.querySelectorAll('[data-jopen]').forEach(b=>b.onclick=()=>{journalDraft=JSON.parse(JSON.stringify(all.find(x=>x.id===b.dataset.jopen)));drawJournalEdit(true)});
 v.querySelectorAll('[data-jdraft]').forEach(b=>b.onclick=()=>{journalDraft=JSON.parse(JSON.stringify(drafts.find(x=>x.id===b.dataset.jdraft)));drawJournalEdit(false,true)});
 v.querySelectorAll('[data-jdraft-delete]').forEach(b=>b.onclick=e=>{e.stopPropagation();jDeleteDraft(b.dataset.jdraftDelete)});
}
function drawJournalEdit(readOnly=false,isDraft=false){
 const v=document.querySelector('#view'),d=journalDraft,prev=jPrev(d);
 v.innerHTML=`<div class="j-edit-head"><button id="jBack">‹ Carnet</button><b>${readOnly?'Séance enregistrée':isDraft?'Brouillon à compléter':'Saisie de séance'}</b></div>
 ${isDraft?`<div class="j-auto-note">S${d.week} · ${DAYS[(+d.day||1)-1]} · créé depuis l'onglet Séries</div>`:''}
 <div class="j-session-field"><label>Nom de séance<input id="jSessionName" type="text" maxlength="50" placeholder="Ex. Upper A, Lower 1…" value="${esc(d.sessionName||'')}" ${readOnly?'disabled':''}></label></div>
 <div class="j-top"><label>Date<input id="jDate" type="date" value="${d.date}" ${readOnly?'disabled':''}></label><label>Durée (min)<input id="jDur" type="number" inputmode="numeric" min="0" value="${d.duration||''}" ${readOnly?'disabled':''}></label></div>
 ${prev?`<section class="j-card j-ref"><small>RÉFÉRENCE · ${esc(prev.sessionName||'Même structure')} · ${jDate(prev.date)}</small>${prev.exercises.map(e=>`<div class="j-perf"><strong>${esc(e.name)}</strong><span>${e.sets.map(s=>`${jFmt(s.kg)}×${s.reps}`).join(' · ')}</span></div>`).join('')}</section>`:''}
 ${jDetailedCompare(d,prev)}
 <div id="jEx">${d.exercises.map((e,i)=>jExHtml(e,i,readOnly)).join('')}</div>
 ${readOnly?'':`<button id="jAddEx" class="j-wide">+ Ajouter un exercice</button>`}
 <div class="j-live"><div>Tonnage<b id="jTon">${jFmt(jTon(d))} kg</b></div><div>Séries<b id="jCount">${jSets(d)}</b></div>${prev?`<div>Vs précédente<b id="jDelta">${jTon(prev)>0?((jTon(d)-jTon(prev))/jTon(prev)*100).toFixed(1):'0.0'} %</b></div>`:'<div>Progression<b>Référence</b></div>'}</div>
 <label class="j-notes">Observations<textarea id="jNotes" ${readOnly?'disabled':''}>${esc(d.notes||'')}</textarea></label>
 ${readOnly?`<div class="j-read-actions"><button id="jEdit" class="j-edit">Modifier la séance</button><button id="jDelete" class="j-delete">Supprimer</button></div>`:`<button id="jValidate" class="j-validate">Valider la séance</button>`}`;
 document.querySelector('#jBack').onclick=()=>{
   if(isDraft){
     const drafts=jDraftLoad(),i=drafts.findIndex(x=>x.id===d.id);
     if(i>=0){drafts[i]=d;jDraftSave(drafts)}
   }
   journalDraft=null;drawJournal()
 };
 if(readOnly){document.querySelector('#jEdit').onclick=()=>drawJournalEdit(false);document.querySelector('#jDelete').onclick=()=>{if(confirm('Supprimer cette séance ?')){jSave(jLoad().filter(x=>x.id!==d.id));journalDraft=null;drawJournal()}};return}

 const persistDraftNow=()=>{
   if(!isDraft)return;
   d.updatedAt=new Date().toISOString();
   const drafts=jDraftLoad(),i=drafts.findIndex(x=>x.id===d.id);
   if(i>=0){drafts[i]=JSON.parse(JSON.stringify(d));jDraftSave(drafts)}
 };
 const syncTopFields=()=>{
   d.sessionName=(document.querySelector('#jSessionName')?.value||'').trim();
   d.date=document.querySelector('#jDate')?.value||jToday();
   d.duration=Math.max(0,+document.querySelector('#jDur')?.value||0);
   d.notes=document.querySelector('#jNotes')?.value||'';
   persistDraftNow();
 };
 document.querySelector('#jSessionName').addEventListener('input',syncTopFields);
 document.querySelector('#jDate').addEventListener('change',syncTopFields);
 document.querySelector('#jDur').addEventListener('input',syncTopFields);
 document.querySelector('#jNotes').addEventListener('input',syncTopFields);

 const refresh=()=>{document.querySelector('#jTon').textContent=jFmt(jTon(d))+' kg';document.querySelector('#jCount').textContent=jSets(d);if(prev&&document.querySelector('#jDelta'))document.querySelector('#jDelta').textContent=(jTon(prev)>0?((jTon(d)-jTon(prev))/jTon(prev)*100).toFixed(1):'0.0')+' %'};
 v.querySelectorAll('.j-ex').forEach(card=>{const i=+card.dataset.i,e=d.exercises[i];
  card.querySelector('[data-muscle]').onchange=x=>{e.muscle=x.target.value;e.name=JOURNAL_LIBRARY[e.muscle][0];persistDraftNow();drawJournalEdit(false,isDraft)};
  card.querySelector('[data-name]').onchange=x=>{e.name=x.target.value;persistDraftNow()};
  const rmEx=card.querySelector('[data-rmex]');if(rmEx)rmEx.onclick=()=>{
    const removed=d.exercises[i];
    if(isDraft&&removed?.muscleKey){
      d.hiddenMuscles=d.hiddenMuscles&&typeof d.hiddenMuscles==='object'?d.hiddenMuscles:{};
      const baseline=jSeriesBaselineForDraft(d.id).get(removed.muscleKey)||0;
      const row=state.series.find(x=>+x.week===+d.week&&+x.day===+d.day&&x.muscle_key===removed.muscleKey);
      d.hiddenMuscles[removed.muscleKey]=Math.max(0,(+row?.series||0)-baseline);
    }
    d.exercises.splice(i,1);persistDraftNow();drawJournalEdit(false,isDraft)
  };
  card.querySelector('[data-addset]').onclick=()=>{const q=e.sets.at(-1)||{kg:0,reps:0};e.sets.push({...q});persistDraftNow();drawJournalEdit(false,isDraft)};
  card.querySelectorAll('.j-set').forEach(r=>{const k=+r.dataset.k,s=e.sets[k];r.querySelector('[data-kg]').oninput=x=>{s.kg=Math.max(0,+x.target.value||0);refresh();persistDraftNow()};r.querySelector('[data-reps]').oninput=x=>{s.reps=Math.max(0,+x.target.value||0);refresh();persistDraftNow()};r.querySelector('[data-rmset]').onclick=()=>{e.sets.splice(k,1);if(!e.sets.length)e.sets=[{kg:0,reps:0}];persistDraftNow();drawJournalEdit(false,isDraft)}});
 });
 wireJournalBlockReorder(document.querySelector('#jEx'),d,isDraft);
 document.querySelector('#jAddEx').onclick=()=>{const m=Object.keys(JOURNAL_LIBRARY)[0];d.exercises.push({id:jId(),muscle:m,name:JOURNAL_LIBRARY[m][0],sets:[{kg:0,reps:0}]});persistDraftNow();drawJournalEdit(false,isDraft)};
 document.querySelector('#jValidate').onclick=async()=>{d.sessionName=(document.querySelector('#jSessionName').value||'').trim();d.date=document.querySelector('#jDate').value||jToday();d.duration=Math.max(0,+document.querySelector('#jDur').value||0);d.notes=document.querySelector('#jNotes').value||'';d.updatedAt=new Date().toISOString();d.exercises=d.exercises.filter(e=>e.name&&e.sets.some(s=>(+s.kg||0)||(+s.reps||0)));if(!d.exercises.length){alert('Renseigne au moins une série.');return}const a=jLoad();
   if(isDraft){
     const finalSession={...JSON.parse(JSON.stringify(d)),id:jId(),status:'session',draftId:d.id};
     finalSession.validatedAt=new Date().toISOString();
     finalSession.seriesSnapshot=Object.fromEntries(
       state.series
         .filter(x=>+x.week===+d.week && +x.day===+d.day)
         .map(x=>[x.muscle_key,Math.max(0,+x.series||0)])
     );
     delete finalSession.week; delete finalSession.day; delete finalSession.block;
     a.push(finalSession);
     jSave(a);
     jDraftRemove(d.id);
     // Le brouillon validé doit disparaître immédiatement et aussi du cloud.
     pushJournalCloud();
   }else{
     const i=a.findIndex(x=>x.id===d.id);i>=0?a[i]=d:a.push(d);jSave(a);
   }
   // La validation archive la séance uniquement.
   // Elle ne réécrit jamais l'onglet Séries.
   journalDraft=null;drawJournal()};
}

function persistJournalDraftOrder(d,isDraft){
  if(!isDraft)return;
  const drafts=jDraftLoad(),i=drafts.findIndex(x=>x.id===d.id);
  if(i>=0){drafts[i]=d;jDraftSave(drafts)}
}
function moveJournalExercise(d,from,to,isDraft){
  if(to<0||to>=d.exercises.length||from===to)return;
  const [item]=d.exercises.splice(from,1);
  d.exercises.splice(to,0,item);
  persistJournalDraftOrder(d,isDraft);
  drawJournalEdit(false,isDraft);
}
function wireJournalBlockReorder(root,d,isDraft){
  if(!root)return;
  let dragIndex=null,pointerId=null,startY=0,timer=null;

  const cards=()=>[...root.querySelectorAll('.j-ex')];
  const clearTimer=()=>{if(timer){clearTimeout(timer);timer=null}};
  const syncArrayFromDom=()=>{
    const order=cards().map(c=>+c.dataset.i);
    d.exercises=order.map(i=>d.exercises[i]).filter(Boolean);
    persistJournalDraftOrder(d,isDraft);
  };
  const cleanup=()=>{
    clearTimer();
    root.querySelectorAll('.j-ex.j-block-dragging').forEach(c=>c.classList.remove('j-block-dragging'));
    document.body.classList.remove('j-block-reorder-active');
    dragIndex=null;pointerId=null;
  };

  root.querySelectorAll('.j-ex').forEach((card,idx)=>{
    const up=card.querySelector('[data-move-up]');
    const down=card.querySelector('[data-move-down]');
    if(up)up.onclick=()=>moveJournalExercise(d,idx,idx-1,isDraft);
    if(down)down.onclick=()=>moveJournalExercise(d,idx,idx+1,isDraft);

    const handle=card.querySelector('.j-drag-handle');
    if(!handle)return;
    handle.style.touchAction='none';
    handle.oncontextmenu=e=>e.preventDefault();

    const begin=e=>{
      if(dragIndex!==null)return;
      dragIndex=idx;
      pointerId=e.pointerId;
      card.classList.add('j-block-dragging');
      document.body.classList.add('j-block-reorder-active');
      if(navigator.vibrate)try{navigator.vibrate(15)}catch(_){}
    };

    handle.addEventListener('pointerdown',e=>{
      if(e.pointerType==='mouse'&&e.button!==0)return;
      pointerId=e.pointerId;
      startY=e.clientY;
      clearTimer();
      timer=setTimeout(()=>begin(e),110);
    });

    handle.addEventListener('pointermove',e=>{
      if(pointerId!==e.pointerId)return;
      if(dragIndex===null){
        if(Math.abs(e.clientY-startY)>8){clearTimer();begin(e)}
        else return;
      }
      e.preventDefault();
      try{handle.setPointerCapture(e.pointerId)}catch(_){}

      const dragging=card;
      const others=cards().filter(c=>c!==dragging);
      let target=null,after=false,best=Infinity;
      others.forEach(c=>{
        const r=c.getBoundingClientRect(),mid=r.top+r.height/2,dist=Math.abs(e.clientY-mid);
        if(dist<best){best=dist;target=c;after=e.clientY>mid}
      });
      if(target){
        const r=target.getBoundingClientRect();
        if(best<Math.max(120,r.height*.75)){
          if(after)target.after(dragging); else target.before(dragging);
        }
      }

      const edge=120;
      if(e.clientY<edge)window.scrollBy(0,-14);
      else if(e.clientY>innerHeight-edge)window.scrollBy(0,14);
    },{passive:false});

    const finish=e=>{
      if(pointerId!==null&&e.pointerId!==pointerId)return;
      const moved=dragIndex!==null;
      if(moved)syncArrayFromDom();
      cleanup();
      if(moved)drawJournalEdit(false,isDraft);
    };
    handle.addEventListener('pointerup',finish);
    handle.addEventListener('pointercancel',finish);
  });
}


function jNormName(s){return String(s||'').trim().toLocaleLowerCase('fr')}
function jExerciseTon(e){return (e?.sets||[]).reduce((a,s)=>a+(+s.kg||0)*(+s.reps||0),0)}
function jExerciseReps(e){return (e?.sets||[]).reduce((a,s)=>a+(+s.reps||0),0)}
function jMaxKg(e){return Math.max(0,...(e?.sets||[]).map(s=>+s.kg||0))}
function jSigned(n,suffix=''){
  n=Number(n)||0;
  return `${n>0?'+':''}${jFmt(n)}${suffix}`
}
function jCompareClass(n){return n>0?'j-cmp-up':n<0?'j-cmp-down':'j-cmp-flat'}
function jDetailedCompare(cur,prev){
  if(!prev)return '';
  const prevByName=new Map((prev.exercises||[]).map(e=>[jNormName(e.name),e]));
  const rows=(cur.exercises||[]).map(e=>{
    const p=prevByName.get(jNormName(e.name));
    if(!p)return `<div class="j-cmp-ex"><div><strong>${esc(e.name||e.muscle||'Exercice')}</strong><small>Nouveau dans cette séance</small></div><b class="j-cmp-new">NOUVEAU</b></div>`;
    const ton=jExerciseTon(e)-jExerciseTon(p);
    const reps=jExerciseReps(e)-jExerciseReps(p);
    const kg=jMaxKg(e)-jMaxKg(p);
    let detail=[];
    detail.push(`<span class="${jCompareClass(kg)}">Charge max ${jSigned(kg,' kg')}</span>`);
    detail.push(`<span class="${jCompareClass(reps)}">Reps ${jSigned(reps)}</span>`);
    detail.push(`<span class="${jCompareClass(ton)}">Volume ${jSigned(ton,' kg')}</span>`);
    const score=(ton>0?1:ton<0?-1:0)+(reps>0?1:reps<0?-1:0)+(kg>0?1:kg<0?-1:0);
    const verdict=score>0?'Progression':score<0?'En retrait':'Stable';
    return `<div class="j-cmp-ex"><div><strong>${esc(e.name||e.muscle||'Exercice')}</strong><small>${detail.join(' · ')}</small></div><b class="${jCompareClass(score)}">${verdict}</b></div>`;
  }).join('');

  const curTon=jTon(cur),prevTon=jTon(prev),dTon=curTon-prevTon;
  const curSets=jSets(cur),prevSets=jSets(prev),dSets=curSets-prevSets;
  const curDur=+cur.duration||0,prevDur=+prev.duration||0,dDur=curDur-prevDur;
  const pct=prevTon>0?(dTon/prevTon*100):0;

  let summary;
  if(dTon>0)summary=`Volume global en hausse de ${jSigned(dTon,' kg')} (${pct>0?'+':''}${pct.toFixed(1)} %).`;
  else if(dTon<0)summary=`Volume global en baisse de ${jSigned(dTon,' kg')} (${pct.toFixed(1)} %).`;
  else summary='Volume global identique à la séance précédente.';

  return `<section class="j-card j-compare-card">
    <div class="j-section">COMPARAISON <span>${esc(cur.sessionName||'Séance')}</span></div>
    <p class="j-cmp-reference">vs ${esc(prev.sessionName||'séance précédente')} · ${jDate(prev.date)}</p>
    <div class="j-cmp-global">
      <div><small>TONNAGE</small><b class="${jCompareClass(dTon)}">${jSigned(dTon,' kg')}</b></div>
      <div><small>SÉRIES</small><b class="${jCompareClass(dSets)}">${jSigned(dSets)}</b></div>
      <div><small>DURÉE</small><b class="${jCompareClass(-dDur)}">${jSigned(dDur,' min')}</b></div>
    </div>
    <p class="j-cmp-summary">${summary}</p>
    <div class="j-cmp-list">${rows||'<div class="j-muted">Aucun exercice comparable.</div>'}</div>
  </section>`;
}

function jExHtml(e,i,ro){
 return `<section class="j-card j-ex" data-i="${i}">
   ${ro?'':`<div class="j-block-tools">
     <button class="j-drag-handle" type="button" aria-label="Déplacer ce bloc" title="Déplacer">≡</button>
     <div class="j-order-buttons">
       <button type="button" data-move-up aria-label="Monter ce bloc">↑</button>
       <button type="button" data-move-down aria-label="Descendre ce bloc">↓</button>
     </div>
   </div>`}
   <div class="j-exhead"><label>Groupe<select data-muscle ${ro?'disabled':''}>${jMuscles(e.muscle)}</select></label><label>Exercice<select data-name ${ro?'disabled':''}>${jExercises(e.muscle,e.name)}</select></label>${ro?'':`<button data-rmex aria-label="Supprimer ce groupe">×</button>`}</div>
   <div class="j-labels"><span>#</span><span>Charge kg</span><span>Reps</span><span></span></div>
   ${e.sets.map((s,k)=>`<div class="j-set" data-k="${k}"><b>${k+1}</b><input data-kg type="number" inputmode="decimal" step=".5" min="0" value="${s.kg||''}" ${ro?'disabled':''}><input data-reps type="number" inputmode="numeric" min="0" value="${s.reps||''}" ${ro?'disabled':''}>${ro?'<span></span>':`<button data-rmset>×</button>`}</div>`).join('')}
   ${ro?'':`<button data-addset class="j-addset">+ Série</button>`}
 </section>`
}

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
      <img class="auth-laurel" src="auth-laurel-realistic-v1137.png" alt="" aria-hidden="true">
      <div class="auth-brand">FORGELAB</div>
      <div class="auth-sub">ATLAS · ESPACE PERSONNEL</div>
      <div class="auth-version"><span>v1.12.3</span></div>
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
  const raw=(currentUser.email||'Compte').split('@')[0];
  const accountLabel=/^nicouleau[._-]?valentin$/i.test(raw)||/^valentin[._-]?nicouleau$/i.test(raw)?'Valentin':raw.split(/[._-]/).filter(Boolean).map(x=>x[0]?.toUpperCase()||'').slice(0,2).join('')||'VN';
  b.innerHTML=`<span>${esc(accountLabel)}</span><small>Déconnexion</small>`
}
function cloud(t,c=''){let e=document.querySelector('#cloud');e.textContent='● CLOUD · '+t;e.className='cloud '+c}
async function load(render=true){try{
  let[a,b,c]=await Promise.all([
    req(`/forgelab_state?select=*&id=eq.main&user_id=eq.${encodeURIComponent(uid())}`),
    req(`/forgelab_priorities?select=*&user_id=eq.${encodeURIComponent(uid())}&order=id.asc`),
    req(`/forgelab_series?select=*&block_key=eq.main&user_id=eq.${encodeURIComponent(uid())}`)
  ]);

  state.block=a[0]?.active_block||'main';
  state.blockName=a[0]?.block_name||'Bloc actif';
  state.blockDuration=Math.max(1,Number(a[0]?.block_duration||13));
  state.nutritionContext=['deficit','maintenance','surplus'].includes(a[0]?.nutrition_context)?a[0].nutrition_context:'maintenance';
  state.week=Math.min(state.blockDuration,Math.max(1,Number(state.userWeek||a[0]?.active_week||1)));
  state.priorities=b;

  // While a Series field is being edited, keep the local Series values.
  // Cloud data can refresh again as soon as editing has finished.
  const focusedSeries = document.activeElement && document.activeElement.classList?.contains('series-input');
  const hasPendingSeriesWrites = typeof saveState!=='undefined' && Object.values(saveState).some(s=>s && (s.sending || s.wanted!==s.lastSent));
  const editingNow = state.tab==='series' && (focusedSeries || hasPendingSeriesWrites || (typeof editingSeries!=='undefined' && editingSeries.size>0));
  if(!editingNow){
    // Séries est la source de vérité. Le Carnet ne doit jamais recréer
    // automatiquement des volumes dans une semaine.
    state.series=c;
  }

  cloud('SYNCHRONISÉ','ok');

  // Never rebuild the Series DOM while the iOS keyboard is open.
  if(render && !editingNow) draw();
}catch(e){console.error(e);cloud('HORS LIGNE','err')}}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function rows(m){return state.series.filter(x=>+x.week===+state.week&&x.muscle_key===m)}function total(m){return rows(m).reduce((a,x)=>a+(+x.series||0),0)}function pRange(p){return[+p.target_min,+p.target_max]}
function weeks(){
  let d=document.querySelector('#weekDots');
  d.style.setProperty('--week-count',String(state.blockDuration));
  d.innerHTML=Array.from({length:state.blockDuration},(_,i)=>`<button class="${state.week===i+1?'active':''}" data-w="${i+1}">${i+1}</button>`).join('');
  d.querySelectorAll('button').forEach(b=>b.onclick=()=>setWeek(+b.dataset.w))
}
async function setWeek(w){state.week=Math.min(state.blockDuration,Math.max(1,w));state.userWeek=state.week;await req(`/forgelab_state?id=eq.main&user_id=eq.${encodeURIComponent(uid())}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({active_week:state.week,updated_at:new Date().toISOString()})});draw()}
function draw(){
  ensureAccountButton();
  const wt=document.querySelector('#weekTitle');
  if(state.tab==='tracking'){
    wt.innerHTML=`<span class="week-kicker tracking-week-only">Semaine ${state.week}</span>`;
  }else{
    wt.innerHTML=`<span class="week-kicker">S${state.week}</span><span class="week-block-name">${esc(state.blockName||'Bloc actif')}</span>`;
  }
  const bt=document.querySelector('#blockTitle');
  if(bt) bt.textContent='';
  weeks();document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.tab));state.tab==='priorities'?drawPriorities():state.tab==='programming'?drawProgramming():state.tab==='journal'?drawJournal():state.tab==='tracking'?drawTracking():drawSeries()}
function title(t){return`<h2 class="section-title">${t}</h2>`}
function nutritionLabel(){return state.nutritionContext==='deficit'?'Déficit':state.nutritionContext==='surplus'?'Surplus':'Maintien'}
function drawPriorities(){
  let v=document.querySelector('#view'),counts={P0:0,P1:0,P2:0},off=disabledMuscles(),cd=cardioData();
  activePriorities().forEach(p=>counts[p.priority]=(counts[p.priority]||0)+1);
  if(cd.enabled)counts[cd.priority]=(counts[cd.priority]||0)+1;
  const cardioDone=cardioTotalDone(), cardioTarget=cardioTotalTarget();
  v.innerHTML=title('Priorités')+
  `<section class="priority-overview">
    <div class="priority-counts"><span class="pc0">P0 · ${counts.P0}</span><span class="pc1">P1 · ${counts.P1}</span><span class="pc2">P2 · ${counts.P2}</span></div>
    <p>Définis ici uniquement les groupes musculaires à prioriser et leur niveau P0 / P1 / P2.</p>
  </section>`+
  orderedPriorities().map(p=>{let t=total(p.muscle_key),disabled=off.has(p.muscle_key);return`<article class="card ${disabled?'disabled-muscle':p.priority.toLowerCase()} priority-card muscle-order-card" data-muscle-order="${esc(p.muscle_key)}">
    <div class="priority-order-tools">
      <button type="button" class="muscle-drag-handle" aria-label="Déplacer ${esc(p.muscle_name)}" title="Déplacer">≡</button>
      <div class="priority-order-buttons">
        <button type="button" data-prio-up="${esc(p.muscle_key)}" aria-label="Monter ${esc(p.muscle_name)}">↑</button>
        <button type="button" data-prio-down="${esc(p.muscle_key)}" aria-label="Descendre ${esc(p.muscle_name)}">↓</button>
      </div>
    </div>
    <div class="cardhead"><div><div class="muscle">${esc(p.muscle_name)}</div><div class="range">${disabled?'Groupe désactivé':`Cible · <b>${p.target_min}–${p.target_max}</b> séries / semaine`}</div></div><button class="muscle-toggle ${disabled?'off':'on'}" data-toggle="${esc(p.muscle_key)}" aria-label="${disabled?'Réactiver':'Désactiver'} ${esc(p.muscle_name)}">${disabled?'Réactiver':'Actif'}</button></div>${disabled?'':`<div class="priority-meta"><span>S${state.week} actuellement</span><strong>${t} séries</strong></div><div class="prio-buttons">${['P0','P1','P2'].map(x=>`<button data-m="${esc(p.muscle_key)}" data-p="${x}" class="${p.priority===x?'selected':''}">${x}<small>${derivedRange(p.muscle_name,x).join('–')}</small></button>`).join('')}</div>`}</article>`}).join('')+
  `<article class="card ${cd.enabled?cd.priority.toLowerCase():'disabled-muscle'} priority-card cardio-priority-card">
    <div class="cardhead"><div><div class="muscle">♥ Cardio</div><div class="range">${cd.enabled?`${cd.modalities.length} séance-type · <b>${cardioTarget}</b> séance${cardioTarget>1?'s':''} / semaine`:'Priorité cardio désactivée'}</div></div><button class="muscle-toggle ${cd.enabled?'on':'off'}" data-cardio-toggle>${cd.enabled?'Actif':'Réactiver'}</button></div>
    ${cd.enabled?`<div class="priority-meta"><span>S${state.week} actuellement</span><strong>${cardioDone}/${cardioTarget} séance${cardioTarget>1?'s':''}</strong></div>
    <div class="prio-buttons cardio-prio-buttons">${['P0','P1','P2'].map(x=>`<button data-cardio-priority="${x}" class="${cd.priority===x?'selected':''}">${x}<small>${x==='P0'?'majeure':x==='P1'?'secondaire':'entretien'}</small></button>`).join('')}</div>
    <div class="cardio-modalities"><div class="cardio-modalities-head"><span>SÉANCES CARDIO DU BLOC</span><button type="button" data-cardio-add-modality aria-label="Ajouter une séance-type">＋</button></div>
      ${cd.modalities.map((m,i)=>`<div class="cardio-modality-row cardio-taxonomy-row" data-modality="${esc(m.id)}">
        <label>Qualité<select data-cardio-quality="${esc(m.id)}">${cardioQualityOptions(m.quality)}</select></label>
        <label>Engine<select data-cardio-engine="${esc(m.id)}">${cardioEngineOptions(m.engine)}</select></label>
        <label>Format<select data-cardio-format="${esc(m.id)}">${cardioFormatOptions(m.format)}</select></label>
        <label>Séances / sem.<div class="stepper"><button type="button" data-cardio-minus="${esc(m.id)}">−</button><strong>${m.target}</strong><button type="button" data-cardio-plus="${esc(m.id)}">+</button></div></label>
        ${cd.modalities.length>1?`<button type="button" class="cardio-modality-delete" data-cardio-delete-modality="${esc(m.id)}" aria-label="Supprimer cette séance-type">×</button>`:''}
      </div>`).join('')}
    </div>`:''}
  </article>`;
  v.querySelectorAll('.prio-buttons button[data-m]').forEach(b=>b.onclick=()=>changePriority(b.dataset.m,b.dataset.p));
  v.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>setMuscleEnabled(b.dataset.toggle,off.has(b.dataset.toggle)));
  v.querySelector('[data-cardio-toggle]').onclick=()=>{const d=cardioData();d.enabled=!d.enabled;saveCardio(d);drawPriorities()};
  v.querySelectorAll('[data-cardio-priority]').forEach(b=>b.onclick=()=>{const d=cardioData();d.priority=b.dataset.cardioPriority;saveCardio(d);drawPriorities()});
  if(cd.enabled){
    v.querySelector('[data-cardio-add-modality]').onclick=()=>{const d=cardioData();d.modalities.push({id:cardioModalityId(),quality:CARDIO_QUALITIES[0],engine:CARDIO_ENGINES[0],format:CARDIO_FORMATS[0],target:1});saveCardio(d);drawPriorities()};
    v.querySelectorAll('[data-cardio-quality]').forEach(el=>el.onchange=e=>{const d=cardioData(),m=d.modalities.find(x=>x.id===e.target.dataset.cardioQuality);if(m)m.quality=e.target.value;saveCardio(d);drawPriorities()});
    v.querySelectorAll('[data-cardio-engine]').forEach(el=>el.onchange=e=>{const d=cardioData(),m=d.modalities.find(x=>x.id===e.target.dataset.cardioEngine);if(m)m.engine=e.target.value;saveCardio(d);drawPriorities()});
    v.querySelectorAll('[data-cardio-format]').forEach(el=>el.onchange=e=>{const d=cardioData(),m=d.modalities.find(x=>x.id===e.target.dataset.cardioFormat);if(m)m.format=e.target.value;saveCardio(d);drawPriorities()});

    
    v.querySelectorAll('[data-cardio-minus]').forEach(b=>b.onclick=()=>{const d=cardioData(),m=d.modalities.find(x=>x.id===b.dataset.cardioMinus);if(m)m.target=Math.max(0,m.target-1);saveCardio(d);drawPriorities()});
    v.querySelectorAll('[data-cardio-plus]').forEach(b=>b.onclick=()=>{const d=cardioData(),m=d.modalities.find(x=>x.id===b.dataset.cardioPlus);if(m)m.target=Math.min(14,m.target+1);saveCardio(d);drawPriorities()});
    v.querySelectorAll('[data-cardio-delete-modality]').forEach(b=>b.onclick=()=>{const d=cardioData();d.modalities=d.modalities.filter(x=>x.id!==b.dataset.cardioDeleteModality);Object.values(d.weeks||{}).forEach(w=>{if(w&&typeof w==='object'&&!Array.isArray(w))delete w[b.dataset.cardioDeleteModality]});saveCardio(d);drawPriorities()});
  }
  wirePriorityReorder(v);
}
function wireMuscleReorder(root){
  if(!root)return;
  const cards=()=>[...root.querySelectorAll('.muscle-order-card[data-muscle-order]')];
  const handles=[...root.querySelectorAll('.muscle-drag-handle')];
  let timer=null,drag=null,pointerId=null,startY=0;

  const clearTimer=()=>{if(timer){clearTimeout(timer);timer=null}};
  const cleanup=()=>{
    clearTimer();
    if(drag)drag.classList.remove('muscle-dragging');
    document.body.classList.remove('muscle-reorder-active');
    drag=null;pointerId=null;
  };
  const begin=(handle,e)=>{
    if(drag)return;
    drag=handle.closest('.muscle-order-card');
    if(!drag)return;
    pointerId=e.pointerId;
    drag.classList.add('muscle-dragging');
    document.body.classList.add('muscle-reorder-active');
    if(navigator.vibrate)try{navigator.vibrate(18)}catch(_){}
  };
  const moveCard=y=>{
    if(!drag)return;
    const others=cards().filter(c=>c!==drag);
    let target=null,after=false,best=Infinity;
    others.forEach(c=>{
      const r=c.getBoundingClientRect(),cy=r.top+r.height/2,dist=Math.abs(y-cy);
      if(dist<best){best=dist;target=c;after=y>cy}
    });
    if(target){
      const r=target.getBoundingClientRect();
      if(best<Math.max(110,r.height*.9)){
        if(after)target.after(drag);else target.before(drag);
      }
    }
    const edge=120;
    if(y<edge)window.scrollBy(0,-14);
    else if(y>innerHeight-edge)window.scrollBy(0,14);
  };

  handles.forEach(handle=>{
    handle.style.touchAction='none';
    handle.oncontextmenu=e=>e.preventDefault();
    handle.addEventListener('pointerdown',e=>{
      if(e.pointerType==='mouse'&&e.button!==0)return;
      clearTimer();pointerId=e.pointerId;startY=e.clientY;
      timer=setTimeout(()=>begin(handle,e),110);
    });
    handle.addEventListener('pointermove',e=>{
      if(pointerId!==e.pointerId)return;
      if(!drag){
        if(Math.abs(e.clientY-startY)>8){clearTimer();begin(handle,e)}
        else return;
      }
      e.preventDefault();
      try{handle.setPointerCapture(e.pointerId)}catch(_){}
      moveCard(e.clientY);
    },{passive:false});
    const finish=e=>{
      if(pointerId!==null&&e.pointerId!==pointerId)return;
      if(drag)saveMuscleOrder(cards().map(c=>c.dataset.muscleOrder).filter(Boolean));
      cleanup();
    };
    handle.addEventListener('pointerup',finish);
    handle.addEventListener('pointercancel',finish);
  });
}
function wirePriorityReorder(root){
  if(!root)return;
  wireMuscleReorder(root);
  const orderedCards=()=>[...root.querySelectorAll('.priority-card.muscle-order-card[data-muscle-order]')];
  const move=(key,dir)=>{
    const cards=orderedCards();
    const from=cards.findIndex(c=>c.dataset.muscleOrder===key);
    const to=from+dir;
    if(from<0||to<0||to>=cards.length)return;
    const order=cards.map(c=>c.dataset.muscleOrder);
    [order[from],order[to]]=[order[to],order[from]];
    saveMuscleOrder(order);
    drawPriorities();
  };
  root.querySelectorAll('[data-prio-up]').forEach(b=>b.onclick=e=>{e.stopPropagation();move(b.dataset.prioUp,-1)});
  root.querySelectorAll('[data-prio-down]').forEach(b=>b.onclick=e=>{e.stopPropagation();move(b.dataset.prioDown,1)});
}

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
async function generateProgramImage(){
 const meta=programmingMeta(),p=programmingData(),ph=phaseRanges(meta);
 const activeDays=DAYS.filter(d=>(p[d]||[]).some(z=>+z.sets>0));
 const W=1024,H=1536,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 const load=src=>new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=src});
 let ref=null,laurel=null,footerScene=null;try{ref=await load('template-reference-v1137.png')}catch(_){ }try{laurel=await load('auth-laurel-realistic-v1137.png')}catch(_){ }try{footerScene=await load('footer-mountains-man-v1137.png')}catch(_){ }
 if(ref)g.drawImage(ref,0,0,W,H);else{g.fillStyle='#03080c';g.fillRect(0,0,W,H)}
 const white='#f4f6f7',muted='#aab4bb',blue='#21aaf5',green='#09c89b',grey='#b8bdc1',dark='rgba(3,8,12,.97)',panel='rgba(7,14,19,.97)';
 const box=(x,y,w,h,fill=dark)=>{g.fillStyle=fill;g.fillRect(x,y,w,h)};
 const txt=(t,x,y,size,color=white,weight=700,align='left',family='Arial')=>{g.fillStyle=color;g.font=`${weight} ${size}px ${family}`;g.textAlign=align;g.textBaseline='middle';g.fillText(String(t),x,y)};
 const fit=(t,x,y,max,size,color=white,weight=800,align='left')=>{let z=size;do{g.font=`${weight} ${z}px Arial`;if(g.measureText(String(t)).width<=max)break;z--}while(z>11);txt(t,x,y,z,color,weight,align)};
 const wrap=(t,x,y,max,size,color=white,weight=600,lineH=16,maxLines=2,align='left')=>{const words=String(t||'').split(/\s+/),lines=[];let cur='';g.font=`${weight} ${size}px Arial`;for(const w of words){const test=cur?cur+' '+w:w;if(g.measureText(test).width<=max)cur=test;else{if(cur)lines.push(cur);cur=w;if(lines.length>=maxLines-1)break}}if(cur&&lines.length<maxLines)lines.push(cur);if(lines.length===maxLines&&words.join(' ').length>lines.join(' ').length){let last=lines[maxLines-1];while(last.length>2&&g.measureText(last+'…').width>max)last=last.slice(0,-1);lines[maxLines-1]=last.replace(/[ ·\/]$/,'')+'…'}lines.forEach((ln,i)=>txt(ln,x,y+i*lineH,size,color,weight,align));return lines.length};
 const line=(x1,y1,x2,y2,color=blue,w=2)=>{g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.strokeStyle=color;g.lineWidth=w;g.stroke()};
 // Header: preserve the approved composition, replace its original F mark with ForgeLab laurel identity.
 box(0,0,W,94,'rgba(2,7,11,.995)');if(laurel)g.drawImage(laurel,381,8,78,78);txt('FORGELAB',470,37,34,white,900);line(0,94,W,94,blue,2);
 // Dynamic title and metadata, exactly in the reference zones.
 box(105,103,815,92,'rgba(3,8,12,.98)');fit((meta.name||'PROGRAMME FORGELAB').toUpperCase(),512,138,790,47,white,900,'center');txt('CONSTRUIRE AUJOURD’HUI LA MEILLEURE VERSION DE DEMAIN',512,180,13,white,500,'center');
 box(24,211,976,82,'rgba(3,8,12,.98)');const info=[['DURÉE',`${meta.duration} SEMAINES`],['OBJECTIF','HYPERTROPHIE'],['FRÉQUENCE',`${activeDays.length} SÉANCE${activeDays.length>1?'S':''} / SEMAINE`],['TRAME',`${meta.rhythm} + DELOAD`]];info.forEach((a,i)=>{const x=26+i*244;g.strokeStyle='#3b4b55';g.lineWidth=1;g.strokeRect(x,214,232,75);txt(a[0],x+20,237,12,muted,600);fit(a[1],x+20,266,198,16,white,800)});
 // Cycles / deloads.
 box(20,310,984,190,'rgba(3,8,12,.98)');const gap=12,pw=(976-gap*(ph.length-1))/ph.length;ph.forEach((q,i)=>{const x=24+i*(pw+gap),ac=q.deload?grey:blue;g.fillStyle=panel;g.fillRect(x,318,pw,176);g.strokeStyle=ac;g.strokeRect(x,318,pw,176);g.fillStyle=ac;g.fillRect(x,318,pw,37);txt(q.deload?`DELOAD ${ph.slice(0,i+1).filter(z=>z.deload).length}`:`CYCLE ${ph.slice(0,i+1).filter(z=>!z.deload).length}`,x+pw/2,337,14,q.deload?'#11171b':'#031016',900,'center');txt(`S${q.from}${q.to!==q.from?' – S'+q.to:''}`,x+pw/2,381,18,white,900,'center');txt(q.deload?'RÉCUPÉRATION':(i===0?'DÉVELOPPEMENT':i===ph.length-1?'SPÉCIALISATION':'INTENSIFICATION'),x+pw/2,421,13,q.deload?grey:blue,800,'center');fit(q.deload?'Volume réduit · récupération':'Progression · technique · qualité',x+pw/2,459,pw-18,11,muted,500,'center')});
 // Weekly section. Preserve the reference grid style; adapt to 1–7 programmed days.
 box(18,520,988,485,'rgba(3,8,12,.985)');txt(`TRAME HEBDOMADAIRE (${activeDays.length} SÉANCE${activeDays.length>1?'S':''})`,26,540,21,white,900);txt('GROUPES MUSCULAIRES · SÉRIES PROGRAMMÉES',994,540,9,muted,500,'right');
 const cols=Math.min(activeDays.length,6)||1,cardGap=9,cardW=(972-cardGap*(cols-1))/cols,cardY=560,cardH=430;
 const zone=name=>{const n=(name||'').toLowerCase();if(/quad|isch|adduct|fess|mollet/.test(n))return'legs';if(/pect/.test(n))return'chest';if(/delto|épaule|epaule/.test(n))return'shoulder';if(/dos|trap/.test(n))return'back';if(/biceps|triceps|avant-bras/.test(n))return'arms';if(/abdo/.test(n))return'core';if(/cou/.test(n))return'neck';return'body'};
 // Silhouettes anatomiques extraites directement du template de référence validé.
 // On choisit la silhouette la plus proche du focus de la séance, plutôt que de redessiner un corps en Canvas.
 const anatomyCrops={
   push:{x:70,y:630,w:105,h:110},
   pull:{x:265,y:630,w:105,h:110},
   legs:{x:460,y:630,w:105,h:110},
   upper:{x:655,y:630,w:105,h:110},
   back:{x:850,y:630,w:105,h:110}
 };
 const anatomyKind=names=>{const zs=names.map(zone),count=z=>zs.filter(x=>x===z).length;if(count('legs'))return'legs';if(count('back')>=2||count('back')+count('arms')>=3)return'back';if(count('chest')||count('shoulder'))return'push';if(count('back')||count('arms'))return'pull';return'upper'};
 const anatomy=(cx,cy,names,accent)=>{if(!ref)return;const crop=anatomyCrops[anatomyKind(names)]||anatomyCrops.upper;g.save();g.globalAlpha=.98;g.drawImage(ref,crop.x,crop.y,crop.w,crop.h,cx-49,cy-58,98,116);g.restore()};
 activeDays.slice(0,6).forEach((d,i)=>{const x=26+i*(cardW+cardGap),entries=(p[d]||[]).filter(z=>+z.sets>0),ac=i%2?green:blue;g.fillStyle='rgba(6,13,18,.98)';g.fillRect(x,cardY,cardW,cardH);g.strokeStyle=ac;g.strokeRect(x,cardY,cardW,cardH);g.fillStyle=ac;g.globalAlpha=.25;g.fillRect(x,cardY,cardW,38);g.globalAlpha=1;txt(d.toUpperCase(),x+cardW/2,cardY+20,14,white,900,'center');wrap(entries.slice(0,3).map(z=>z.muscle_name).join(' · '),x+cardW/2,cardY+55,cardW-16,10,white,700,13,2,'center');anatomy(x+cardW/2,cardY+150,entries.map(z=>z.muscle_name),ac);let yy=cardY+258;entries.slice(0,5).forEach(z=>{const lines=wrap(z.muscle_name,x+8,yy,cardW-42,10,white,600,12,2,'left');txt(`${z.sets}`,x+cardW-9,yy,10,white,800,'right');yy+=Math.max(22,lines*12+7)});if(entries.length>5)txt(`+${entries.length-5} groupe${entries.length-5>1?'s':''}`,x+8,Math.min(yy,cardY+cardH-63),9,muted,600);g.fillStyle='#101a20';g.fillRect(x+8,cardY+cardH-47,cardW-16,37);txt('FOCUS',x+14,cardY+cardH-35,9,ac,900);wrap(entries.slice(0,2).map(z=>z.muscle_name).join(' / '),x+14,cardY+cardH-21,cardW-28,8,white,500,10,1,'left')});
 if(activeDays.length>6){txt(`+ ${activeDays.length-6} JOUR PROGRAMMÉ : ${activeDays.slice(6).join(', ')}`,512,997,11,muted,700,'center')}
 // Lower blocks, keeping the approved poster structure and Daily Wins footer.
 box(20,1018,984,205,'rgba(3,8,12,.985)');const lows=[['CARDIO','Selon le cycle','Basse intensité · seuil · intervalles'],['PROGRESSION','Surcharge progressive','Charges · répétitions · exécution'],['NOTES','Récupération','Deload · ressenti · qualité']];lows.forEach((a,i)=>{const x=26+i*326;g.fillStyle='rgba(7,14,19,.98)';g.fillRect(x,1030,310,180);g.strokeStyle=i===1?green:blue;g.strokeRect(x,1030,310,180);txt(a[0],x+20,1060,18,white,900);txt(a[1],x+20,1102,13,i===1?green:blue,800);fit(a[2],x+20,1144,270,12,muted,500)});
 // Footer v1.13.7 : une seule scène continue, sans raccord ni inscription.
 // On dessine UNE SEULE FOIS la ressource validée : personnage, rocher et montagnes restent dans le même panorama.
 if(footerScene){
   const fw=footerScene.naturalWidth||footerScene.width,fh=footerScene.naturalHeight||footerScene.height;
   const footerH=312;
   // Crop continu de la partie basse : assez haut pour garder le personnage entier, sans recomposer deux images.
   const cropH=Math.min(fh,Math.round(fw*(footerH/1024)*1.52));
   const cropY=Math.max(0,fh-cropH);
   g.drawImage(footerScene,0,cropY,fw,cropH,0,1224,1024,footerH);
 }else if(ref){
   g.drawImage(ref,0,1224,1024,312,0,1224,1024,312);
 }else{
   box(0,1224,1024,312,'rgba(2,7,11,.98)');
 }
 // Aucun texte, aucune citation, aucun logo sur la chaîne de montagnes.
 const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png',1));if(!blob){alert("Impossible de générer l’image sur cet appareil.");return}const safe=String(meta.name||'programme').replace(/[^a-z0-9]+/gi,'_'),file=new File([blob],`ForgeLab_${safe}.png`,{type:'image/png'});try{if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:`ForgeLab · ${meta.name||'Programme'}`});return}}catch(err){if(err&&err.name==='AbortError')return}const url=URL.createObjectURL(blob),w=window.open(url,'_blank');if(w){setTimeout(()=>URL.revokeObjectURL(url),120000);return}const a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}

function exportProgramPdf(){
 const meta=programmingMeta('active'),p=programmingDataFromKey(programmingKey()),ph=phaseRanges(meta),sessions=jLoad();
 const performed={};(state.series||[]).forEach(r=>{performed[r.muscle_name||r.muscle_key]=(performed[r.muscle_name||r.muscle_key]||0)+(+r.series||0)});
 const html=`<!doctype html><meta charset="utf-8"><title>ForgeLab · ${esc(meta.name)}</title><style>body{font-family:Arial;margin:36px;color:#17130e}h1{margin-bottom:4px}h2{margin-top:28px;border-bottom:1px solid #bbb;padding-bottom:6px}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:7px;text-align:left}.muted{color:#666}@media print{button{display:none}}</style><h1>ForgeLab · ${esc(meta.name)}</h1><div class="muted">Bilan global · ${meta.duration} semaines · trame ${meta.rhythm} + deload</div><h2>Cycles</h2>${ph.map(q=>`<div>${q.label} · S${q.from}${q.to!==q.from?'–S'+q.to:''}${q.deload?' · Deload':''}</div>`).join('')}<h2>Programmation prévue</h2>${DAYS.map(d=>`<h3>${d}</h3>${(p[d]||[]).map(z=>`<div>${esc(z.muscle_name)} — ${z.sets} séries</div>`).join('')||'<div class="muted">Repos</div>'}`).join('')}<h2>Réalisation</h2><p>${sessions.length} séance${sessions.length!==1?'s':''} enregistrée${sessions.length!==1?'s':''} dans le Carnet.</p><table><tr><th>Groupe</th><th>Séries effectuées</th></tr>${Object.entries(performed).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${v}</td></tr>`).join('')}</table><script>window.onload=()=>window.print()<\/script>`;
 const w=window.open('','_blank');if(!w){alert('Autorise les fenêtres pop-up pour exporter le PDF.');return}w.document.write(html);w.document.close();
}
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
  const mode=programmingMode(),hasDraft=hasProgrammingDraft(),meta=programmingMeta(mode),phases=phaseRanges(meta);
  v.innerHTML=title('Programmation des séances')+
   `<section class="program-workspace program-workspace-clear program-mode-${mode}">
      <article class="program-status-card ${mode==='active'?'current':''}">
        <div><small>PROGRAMME ACTIF</small><strong>${esc(state.blockName||'Bloc actif')}</strong><span>${state.blockDuration} semaine${state.blockDuration>1?'s':''} · ${nutritionLabel()}</span></div>
        ${mode==='draft'?`<button type="button" class="secondary" data-program-mode="active">Voir</button>`:'<em>En cours</em>'}
      </article>
      <article class="program-status-card draft ${mode==='draft'?'current':''}">
        <div><small>PROCHAIN PROGRAMME</small><strong>${hasDraft?esc(programmingMeta('draft').name||'Brouillon en préparation'):'Aucun brouillon'}</strong><span>${hasDraft?'Modifiable sans toucher au programme actif':'Prépare ton prochain bloc séparément'}</span></div>
        ${hasDraft?(mode==='draft'?'<em>Ouvert</em>':'<button type="button" data-program-mode="draft">Ouvrir</button>'):'<button type="button" data-program-create-draft>Créer</button>'}
      </article>
      ${mode==='draft'?`<div class="program-draft-actions"><button type="button" data-program-activate-draft>Activer ce programme</button><button type="button" class="danger" data-program-delete-draft>Supprimer le brouillon</button></div>`:''}
      <div class="program-current-banner"><b>${mode==='draft'?'BROUILLON · EN PRÉPARATION':'PROGRAMME ACTIF · EN COURS'}</b><span>${esc(meta.name)} · ${meta.duration} semaines · ${meta.rhythm} + deload</span></div>
      ${mode==='draft'?`<div class="program-meta-edit"><label>Nom du bloc<input data-program-meta-name value="${esc(meta.name)}"></label><label>Durée<input data-program-meta-duration type="number" min="1" max="52" value="${meta.duration}"></label><label>Trame<select data-program-meta-rhythm>${[3,4,5,6].map(n=>`<option value="${n}" ${n===meta.rhythm?'selected':''}>${n} + deload</option>`).join('')}</select></label></div>`:''}
      <div class="program-export-actions"><button type="button" data-program-image>Générer le programme</button>${mode==='active'?'<button type="button" class="secondary" data-program-pdf>Exporter le bilan PDF</button>':''}</div>
      <div class="program-phase-strip">${phases.map(q=>`<span class="${q.deload?'deload':''}">${q.label}<b>S${q.from}${q.to!==q.from?'–S'+q.to:''}</b></span>`).join('')}</div>
      <p class="program-workspace-help">La durée du bloc et l'organisation du programme se gèrent ici. L'onglet Priorités reste consacré aux P0 / P1 / P2.</p>
    </section>`+
   `<section class="program-mobile-steps"><div class="active"><b>1</b><span>Répartition musculaire</span></div><div><b>2</b><span>Programmation des exercices</span></div></section>`+
   `<p class="program-mobile-intro">Répartis les séries hebdomadaires sur tes séances. ForgeLab affiche les totaux, la fréquence et une estimation simple de la durée.</p>`+
   `<div class="program-mobile-actions"><button type="button" data-program-auto>Répartir selon les priorités</button><button type="button" class="secondary" data-program-clear>Vider</button></div>`+
   `<section class="program-mobile-library"><div><small>BIBLIOTHÈQUE DE BLOCS</small><strong>Enregistrer puis réutiliser une structure</strong></div><button type="button" data-program-save-preset>Enregistrer</button>${presets.length?`<select data-program-preset><option value="">Choisir un bloc enregistré</option>${presets.map((x,i)=>`<option value="${i}">${esc(x.name)}</option>`).join('')}</select><div class="program-preset-actions"><button type="button" data-program-restore-preset>Réintégrer</button><button type="button" class="danger" data-program-delete-preset>Supprimer</button></div>`:'<p>Aucun bloc enregistré.</p>'}</section>`+
   `<section class="program-mobile-note">Répartition automatique : P0 sur lundi / mercredi / vendredi, P1 sur deux séances, P2 sur une séance. Les séries proposées utilisent la borne basse de la fourchette actuelle.</section>`+
   `<div class="program-mobile-kpis"><div><b>${allSets}</b><span>séries programmées</span></div><div><b>${daysUsed}</b><span>séances utilisées</span></div></div>`+
   `<div class="program-mobile-days">${rows}</div>`+
   `<details class="program-mobile-summary"><summary>Bilan de la programmation</summary><div>${summary}</div></details>`;

  v.querySelectorAll('[data-program-mode]').forEach(b=>b.onclick=()=>{if(b.dataset.programMode==='draft'&&!hasProgrammingDraft())return;setProgrammingMode(b.dataset.programMode)});
  v.querySelector('[data-program-create-draft]')?.addEventListener('click',()=>hasProgrammingDraft()?setProgrammingMode('draft'):createProgrammingDraft(true));
  v.querySelector('[data-program-activate-draft]')?.addEventListener('click',activateProgrammingDraft);
  v.querySelector('[data-program-delete-draft]')?.addEventListener('click',deleteProgrammingDraft);
v.querySelector('[data-program-image]')?.addEventListener('click',generateProgramImage);
  v.querySelector('[data-program-pdf]')?.addEventListener('click',exportProgramPdf);
  const saveMeta=()=>{const n=v.querySelector('[data-program-meta-name]'),d=v.querySelector('[data-program-meta-duration]'),r=v.querySelector('[data-program-meta-rhythm]');if(!n)return;saveProgrammingMeta({name:(n.value||'Nouveau bloc').trim()||'Nouveau bloc',duration:Math.max(1,Math.min(52,+d.value||14)),rhythm:Math.max(3,Math.min(6,+r.value||4))},'draft');drawProgramming()};
  v.querySelector('[data-program-meta-name]')?.addEventListener('change',saveMeta);v.querySelector('[data-program-meta-duration]')?.addEventListener('change',saveMeta);v.querySelector('[data-program-meta-rhythm]')?.addEventListener('change',saveMeta);
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

function currentWeekdayIndex(){const d=new Date().getDay();return d===0?7:d}
function drawSeries(){
  let v=document.querySelector('#view');
  v.innerHTML=title('Séries / semaine')+activePriorities().map(p=>{
    let map=Object.fromEntries(rows(p.muscle_key).map(x=>[+x.day,+x.series]));
    return`<article class="card ${p.priority.toLowerCase()} muscle-order-card" data-card="${esc(p.muscle_key)}" data-muscle-order="${esc(p.muscle_key)}">
      <div class="cardhead"><div><div class="muscle">${esc(p.muscle_name)}</div><div class="range">Cible ${p.target_min}–${p.target_max}</div></div><span class="badge">${p.priority}</span></div>
      <div class="days">${DAYS.map((d,i)=>`<div class="day ${i+1===currentWeekdayIndex()?'is-today':''}"><label>${d}</label><input class="series-input" type="text" inputmode="numeric" pattern="[0-9]*" enterkeyhint="done" value="${map[i+1]||0}" data-m="${esc(p.muscle_key)}" data-d="${i+1}" aria-label="${d} ${esc(p.muscle_name)}"></div>`).join('')}</div>
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
  const before=+(r?.series||0);
  if(r){
    r.series=n;
    if(before<=0 && n>0)r.journalEnteredAt=Date.now();
  }else{
    r={block_key:'main',week:state.week,muscle_key:m,day:d,series:n,journalEnteredAt:n>0?Date.now():0};
    state.series.push(r);
  }
  const totalEl=document.querySelector(`[data-total="${CSS.escape(m)}"]`);
  if(totalEl) totalEl.textContent=total(m)+' séries';
  syncJournalDraftFromSeries(state.week,d);
}
function seriesPendingKey(){return `forgelabSeriesPending:${currentUser?.id||'guest'}`}
function saveSeriesPending(){
  try{
    const pending=Object.entries(saveState).filter(([,s])=>s&&s.wanted!==s.lastSent).map(([k,s])=>({k,week:s.week,m:s.m,d:s.d,wanted:s.wanted}));
    localStorage.setItem(seriesPendingKey(),JSON.stringify(pending));
  }catch(_){}
}
function restoreSeriesPending(){
  try{
    const pending=JSON.parse(localStorage.getItem(seriesPendingKey())||'[]');
    pending.forEach(x=>{
      if(!x?.k||!x.week||!x.m||!x.d)return;
      saveState[x.k]={week:+x.week,m:x.m,d:+x.d,wanted:+x.wanted||0,sending:false,lastSent:null};
      flushSeriesSave(x.k);
    });
  }catch(_){}
}
function queueSeriesSave(m,d,n){
  const week=+state.week;
  const k=`${week}|${m}|${d}`;
  if(!saveState[k]) saveState[k]={week,m,d,wanted:n,sending:false,lastSent:null};
  Object.assign(saveState[k],{week,m,d,wanted:n});

  clearTimeout(saveTimers[k]);
  saveSeriesPending();
  cloud('ENREGISTREMENT…');

  // Tiny debounce only to coalesce very fast keystrokes.
  saveTimers[k]=setTimeout(()=>flushSeriesSave(k),180);
}

async function flushSeriesSave(k){
  const slot=saveState[k];
  if(!slot || slot.sending) return;

  const {week,m,d}=slot;
  const n=Math.max(0,Math.round(slot.wanted||0));
  slot.sending=true;
  slot.lastSent=n;
  saveSeriesPending();

  try{
    const path=`/forgelab_series?user_id=eq.${encodeURIComponent(uid())}&block_key=eq.main&week=eq.${week}&muscle_key=eq.${encodeURIComponent(m)}&day=eq.${d}`;

    if(n===0){
      await req(path,{method:'DELETE',headers:{Prefer:'return=minimal'}});
    }else{
      await req('/forgelab_series?on_conflict=user_id,block_key,week,muscle_key,day',{
        method:'POST',
        headers:{Prefer:'resolution=merge-duplicates,return=minimal'},
        body:JSON.stringify([{
          user_id:uid(),
          block_key:'main',
          week,
          muscle_key:m,
          day:d,
          series:n,
          updated_at:new Date().toISOString()
        }])
      });
    }

    slot.sending=false;
    if(slot.wanted!==slot.lastSent){
      saveSeriesPending();
      flushSeriesSave(k);
    }else{
      delete saveState[k];
      clearTimeout(saveTimers[k]);
      saveSeriesPending();
      cloud('SYNCHRONISÉ','ok');
    }
  }catch(e){
    console.error(e);
    slot.sending=false;
    saveSeriesPending();
    cloud('HORS LIGNE','err');
    clearTimeout(saveTimers[k]);
    saveTimers[k]=setTimeout(()=>flushSeriesSave(k),1200);
  }
}
function weeklyTodoRecap(){
  const active=activePriorities();
  const notStarted=active.filter(p=>total(p.muscle_key)===0);
  const partial=active.filter(p=>{
    const t=total(p.muscle_key);
    return t>0 && t<(+p.target_min||0);
  });
  const completed=active.filter(p=>total(p.muscle_key)>=(+p.target_min||0)).length;
  const c=cardioData(),cardioOn=!!c.enabled,cardioDone=cardioOn?cardioTotalDone():0,cardioTarget=cardioOn?cardioTotalTarget():0;
  const cardioLeft=Math.max(0,cardioTarget-cardioDone);

  const todo=[
    ...notStarted.map(p=>`<div class="weekly-action ${p.priority.toLowerCase()}"><span class="weekly-action-dot"></span><div><b>${esc(p.muscle_name)}</b><small>À commencer · cible ${p.target_min}–${p.target_max} séries</small></div><strong>${p.target_min}</strong></div>`),
    ...partial.map(p=>{
      const t=total(p.muscle_key),left=Math.max(0,(+p.target_min||0)-t);
      return `<div class="weekly-action ${p.priority.toLowerCase()}"><span class="weekly-action-dot"></span><div><b>${esc(p.muscle_name)}</b><small>${t} réalisées · cible ${p.target_min}–${p.target_max}</small></div><strong>+${left}</strong></div>`;
    }),
    ...(cardioOn&&cardioLeft>0?[`<div class="weekly-action cardio"><span class="weekly-action-dot"></span><div><b>Cardio</b><small>${cardioDone} réalisée${cardioDone>1?'s':''} · objectif ${cardioTarget}</small></div><strong>+${cardioLeft}</strong></div>`]:[])
  ];

  return `<section class="weekly-dashboard">
    <div class="weekly-dashboard-top">
      <div><small>BILAN · SEMAINE ${state.week}</small><h3>Suivi hebdomadaire</h3><p>${todo.length?'Encore quelques objectifs à compléter.':'Objectifs de la semaine atteints.'}</p></div>
      <div class="weekly-score"><b>${completed}</b><span>/ ${active.length}</span><small>GROUPES OK</small></div>
    </div>
    ${cardioOn?`<div class="weekly-cardio-mini"><div><span>◆</span><div><b>Cardio</b><small>${c.modalities.length} modalité${c.modalities.length>1?'s':''}</small></div></div><strong>${cardioDone} / ${cardioTarget}</strong></div>`:''}
    <div class="weekly-actions-head"><span>À faire</span><b>${todo.length}</b></div>
    <div class="weekly-actions">${todo.join('')||`<div class="weekly-complete"><b>SEMAINE VALIDÉE</b><span>Minimums musculaires${cardioOn?' et cardio':''} atteints.</span></div>`}</div>
  </section>`;
}

function cardioTrackingHtml(){
  const d=cardioData();if(!d.enabled)return'';
  const target=cardioTotalTarget(),done=cardioTotalDone(),left=Math.max(0,target-done);
  const pct=target?Math.min(100,Math.round(done/target*100)):100;
  const status=done<target?['À compléter','low']:done===target?['Objectif atteint','ok']:['Objectif dépassé','ok'];
  const sessions=cardioBaseRunSessions();
  const benchmark=sessions.find(s=>s.benchmark)||sessions[0];
  const latest=sessions.at(-1);
  const chain=sessions.slice(-5).map(s=>`<span class="${benchmark&&cardioComparable(s,benchmark)?'comparable':''}">${esc(s.pace)}/km</span>`).join('<i>→</i>');
  const delta=benchmark&&latest&&paceToSeconds(benchmark.pace)&&paceToSeconds(latest.pace)?paceToSeconds(latest.pace)-paceToSeconds(benchmark.pace):0;
  const deltaTxt=latest&&benchmark&&latest.id!==benchmark.id?(delta<0?`${Math.abs(delta)} s/km plus vite`:delta>0?`${delta} s/km plus lent`:'allure identique'):'Référence initiale';
  return `<section class="card cardio-tracking-card ${d.priority.toLowerCase()}">
    <div class="cardio-track-head">
      <div><small>CARDIO</small><div class="muscle">Qualité · Engine · Format</div><div class="range">${d.modalities.length} séance-type · objectif ${target}/sem.</div></div>
      <span class="status ${status[1]}">${status[0]}</span>
    </div>
    <div class="cardio-track-score"><div><b>${done}</b><span>/ ${target}</span><small>séances réalisées</small></div><strong>${pct}%</strong></div>
    <div class="progress ${done>=target?'target':'under'}"><i style="width:${pct}%"></i></div>
    <div class="cardio-quality-list">${d.modalities.map(m=>`<div><span>${esc(m.quality)}</span><b>${esc(m.engine)} · ${esc(m.format)}</b></div>`).join('')}</div>
    <section class="base-run-tracking">
      <div class="base-run-track-head"><div><small>🟢 BASE AÉROBIE</small><strong>Run</strong></div><span>${sessions.length} point${sessions.length>1?'s':''}</span></div>
      ${benchmark?`<div class="base-run-benchmark"><small>RÉFÉRENCE · ${jDate(benchmark.date)}</small><b>${benchmark.duration} min · ${esc(benchmark.pace)}/km · ${benchmark.avgHr} bpm · RPE ${benchmark.rpe}</b></div>`:''}
      <div class="base-run-chain">${chain||'<span>Aucune séance</span>'}</div>
      ${latest?`<div class="base-run-latest"><span>Dernière : <b>${esc(latest.pace)}/km</b> · ${latest.avgHr} bpm · RPE ${latest.rpe}</span><strong>${deltaTxt}</strong></div>`:''}
      <p>Comparer l’allure uniquement quand FC et RPE restent proches de la référence.</p>
    </section>
    <div class="trackline"><span>${left?`${left} séance${left>1?'s':''} restante${left>1?'s':''}`:'Objectif cardio atteint'}</span><strong>${done} réalisée${done>1?'s':''}</strong></div>
  </section>`;
}

let trackingMode='muscu';

function trackingWeekDates(){
  // Bloc I démarré le lundi 31/08/2026 : S3 = 14/09 → 20/09.
  const start=new Date(2026,7,31,12,0,0,0);
  start.setDate(start.getDate()+(Math.max(1,+state.week||1)-1)*7);
  const end=new Date(start);end.setDate(start.getDate()+6);
  const p=n=>String(n).padStart(2,'0');
  const fmt=d=>`${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()}`;
  return `${fmt(start)} – ${fmt(end)}`;
}
function trackingSeriesSessionCount(){
  // Source unique : state.series pour la semaine affichée.
  // Un jour ayant au moins une série > 0 = une séance détectée.
  // Aucun accès au Carnet et aucune écriture/modification des séries.
  const activeKeys=new Set(activePriorities().map(p=>p.muscle_key));
  const days=new Set(
    state.series
      .filter(r=>+r.week===+state.week && activeKeys.has(r.muscle_key) && (+r.series||0)>0)
      .map(r=>+r.day)
      .filter(d=>d>=1&&d<=7)
  );
  return days.size;
}
function trackingMuscuTrend(done,minimum,inTarget,under,over,totalGroups,overNames=[]){
  const pct=minimum?Math.round(done/minimum*100):0;
  const overDetail=overNames.length
    ? ` ${overNames.length} groupe${overNames.length>1?'s':''} musculaire${overNames.length>1?'s':''} avec volume dépassé (${overNames.join(', ')}).`
    : '';
  if(under===0&&over===0)return `Semaine complète : ${pct}% du volume minimum réalisé et ${inTarget}/${totalGroups} objectifs musculaires atteints.`;
  if(under===0)return `Semaine complète : ${inTarget}/${totalGroups} objectifs musculaires atteints.${overDetail}`;
  if(pct>=90)return `Semaine presque complète : ${pct}% du volume minimum réalisé. Il reste ${under} groupe${under>1?'s':''} musculaire${under>1?'s':''} à compléter.${overDetail}`;
  if(pct>=70)return `Bonne progression : ${pct}% du volume minimum réalisé. ${under} groupe${under>1?'s':''} reste${under>1?'nt':''} à compléter.${overDetail}`;
  return `Semaine en cours : ${pct}% du volume minimum réalisé. Priorité aux ${under} groupe${under>1?'s':''} encore sous leur cible.${overDetail}`;
}
function trackingMuscuSummary(){
  const active=activePriorities();
  const minimum=active.reduce((a,p)=>a+(+p.target_min||0),0);
  const done=active.reduce((a,p)=>a+total(p.muscle_key),0);
  const remain=active.reduce((a,p)=>a+Math.max(0,(+p.target_min||0)-total(p.muscle_key)),0);
  const pct=minimum?Math.round(done/minimum*100):0;
  const sessions=trackingSeriesSessionCount();
  const barPct=Math.min(100,pct);
  // Pour le récap global : objectif atteint = minimum hebdomadaire atteint.
  // Un groupe au-dessus du maximum reste donc compté comme objectif atteint,
  // tout en étant signalé séparément dans "volume dépassé".
  const inTarget=active.filter(p=>total(p.muscle_key)>=pRange(p)[0]).length;
  const under=active.filter(p=>total(p.muscle_key)<pRange(p)[0]).length;
  const overPriorities=active.filter(p=>total(p.muscle_key)>pRange(p)[1]);
  const over=overPriorities.length;
  const overNames=overPriorities.map(p=>p.muscle_key);
  const complete=under===0;
  const trend=trackingMuscuTrend(done,minimum,inTarget,under,over,active.length,overNames);

  return `<section class="track-muscu-recap story-recap ${complete?'week-complete':''}">
    <div class="story-forgelab-brand"><img src="auth-laurel-realistic-v1137.png" alt=""><strong>ForgeLab</strong></div>
    <div class="story-recap-head">
      <div><small>BILAN MUSCULATION</small><strong>SEMAINE ${state.week}</strong></div>
      <span>${trackingWeekDates()}</span>
    </div>

    <div class="story-volume">
      <div class="story-volume-main"><b>${done}</b><span>/ ${minimum}</span><small>SÉRIES<br>RÉALISÉES</small></div>
      <div class="story-volume-pct"><b>${pct}%</b><span>${complete?'VOLUME MINIMUM ATTEINT':'DU MINIMUM PRÉVU'}</span><div class="track-recap-bar"><i style="width:${barPct}%"></i></div></div>
    </div>

    <div class="story-session-line"><b>${sessions}</b><div><strong>SÉANCE${sessions>1?'S':''} MUSCULATION</strong><span>détectée${sessions>1?'s':''} depuis les séries saisies</span></div></div>

    <div class="story-status-grid">
      <div class="ok"><b>${inTarget}</b><strong>GROUPE${inTarget>1?'S':''} MUSCULAIRE${inTarget>1?'S':''} TRAVAILLÉ${inTarget>1?'S':''}</strong><span>objectif${inTarget>1?'s':''} atteint${inTarget>1?'s':''}</span></div>
      <div class="low"><b>${under}</b><strong>GROUPE${under>1?'S':''} MUSCULAIRE${under>1?'S':''}</strong><span>à compléter</span></div>
      <div class="high"><b>${over}</b><strong>GROUPE${over>1?'S':''} MUSCULAIRE${over>1?'S':''}</strong><span>volume dépassé</span></div>
    </div>

    <div class="story-remaining ${complete?'done':''}">
      <b>${remain}</b><div><strong>SÉRIE${remain>1?'S':''} RESTANTE${remain>1?'S':''}</strong><span>${complete?'Tous les minimums hebdomadaires sont atteints.':'pour atteindre tous les minimums hebdomadaires.'}</span></div>
    </div>

    <div class="story-trend ${complete?'done':''}">
      <small>TENDANCE DE LA SEMAINE</small>
      <p>${esc(trend)}</p>
    </div>
  </section>`;
}

function trackingMuscleDetails(){
  const active=activePriorities();
  return `<div class="tracking-section-label"><span>DÉTAIL MUSCULAIRE</span><b>${active.filter(p=>total(p.muscle_key)>=pRange(p)[0]).length}/${active.length} au minimum</b></div>`+
  active.map(p=>{
    const t=total(p.muscle_key),[mi,ma]=pRange(p),left=Math.max(0,mi-t);
    const pc=mi?Math.min(100,Math.round(t/mi*100)):100;
    const st=t<mi?['Sous la cible','low']:t>ma?['Maximum dépassé','high']:['Dans la cible','ok'];
    const barClass=t>ma?'over':t>=mi?'target':'under';
    return`<article class="card ${p.priority.toLowerCase()} tracking-card muscle-order-card" data-muscle-order="${esc(p.muscle_key)}">
      <div class="cardhead"><div><div class="muscle">${esc(p.muscle_name)}</div><div class="range">Priorité ${p.priority} · cible ${mi}–${ma}</div></div><span class="status ${st[1]}">${st[0]}</span></div>
      <div class="tracking-numbers"><div><span>Prévu</span><b>${mi}–${ma}</b></div><div><span>Réalisé</span><b>${t}</b></div><div><span>Reste</span><b>${left}</b></div></div>
      <div class="progress ${barClass}"><i style="width:${pc}%"></i></div>
      <div class="trackline">${t<mi?`<span>${pc}% du minimum</span><strong>${t} / ${mi}</strong>`:t>ma?`<span>Maximum dépassé</span><strong>${t} séries · max ${ma}</strong>`:`<span>Dans la cible</span><strong>${t} séries · cible ${mi}–${ma}</strong>`}</div>
    </article>`
  }).join('');
}
function drawTracking(){
  let v=document.querySelector('#view');
  const cardioOn=cardioData().enabled;
  v.innerHTML=title('Suivi')+
  `<div class="tracking-date">Semaine ${state.week} · ${trackingWeekDates()}</div>
   <div class="tracking-mode-switch">
     <button type="button" data-track-mode="muscu" class="${trackingMode==='muscu'?'active':''}">MUSCULATION</button>
     <button type="button" data-track-mode="cardio" class="${trackingMode==='cardio'?'active':''}">CARDIO</button>
   </div>
   <div id="trackingModeContent">${trackingMode==='muscu'
     ? trackingMuscuSummary()+`<details class="tracking-details"><summary>Voir le détail par groupe</summary>${trackingMuscleDetails()}</details>`
     : (cardioOn?cardioTrackingHtml():`<section class="card cardio-tracking-card"><div class="muscle">Cardio</div><div class="range">Cardio non activé dans les priorités.</div></section>`)
   }</div>`;
  v.querySelectorAll('[data-track-mode]').forEach(b=>b.onclick=()=>{
    trackingMode=b.dataset.trackMode;
    drawTracking();
  });
  if(trackingMode==='muscu')wireMuscleReorder(v);
}

function cardioSeriesHtml(){
  const d=cardioData();if(!d.enabled)return'';
  const target=cardioTotalTarget(),done=cardioTotalDone();
  return `<article class="card ${d.priority.toLowerCase()} cardio-series-card">
    <div class="cardhead"><div><div class="muscle">♥ Cardio</div><div class="range">Qualité · Engine · Format</div></div><span class="badge">${d.priority}</span></div>
    <div class="cardio-series-progress"><span>S${state.week}</span><strong>${done} / ${target} réalisée${done>1?'s':''}</strong></div>
    <div class="cardio-series-modalities">${d.modalities.map(m=>{const {week}=cardioWeek(),days=week[m.id]||{},mt=cardioModalityTotal(m.id);return`<div class="cardio-series-modality">
      <div class="cardio-series-modality-head"><div><strong>${esc(m.quality)}</strong><small>${esc(m.engine)} · ${esc(m.format)}</small></div><span>${mt}/${m.target}</span></div>
      <div class="days cardio-days">${DAYS.map((day,i)=>`<div class="day ${i+1===currentWeekdayIndex()?'is-today':''}"><label>${day}</label><input class="cardio-day-input" type="text" inputmode="numeric" pattern="[0-9]*" enterkeyhint="done" value="${+days[i+1]||0}" data-cardio-modality="${esc(m.id)}" data-cardio-day="${i+1}" aria-label="${day} ${esc(m.quality)} ${esc(m.engine)}"></div>`).join('')}</div>
    </div>`}).join('')}</div>
    <div class="totalrow"><span>Total cardio semaine</span><b data-cardio-total>${done} séance${done>1?'s':''}</b></div>
    <section class="base-run-entry">
      <div class="base-run-entry-head"><div><small>🟢 BASE AÉROBIE · RUN</small><strong>Enregistrer une séance</strong></div><span>4 données</span></div>
      <div class="base-run-fields">
        <label>Date<input id="baseRunDate" type="date" value="${new Date().toISOString().slice(0,10)}"></label>
        <label>Durée<input id="baseRunDuration" type="number" min="1" inputmode="numeric" placeholder="40"><i>min</i></label>
        <label class="pace-field">Allure moy.
  <div class="pace-inputs">
    <input id="baseRunPaceMin" type="number" min="0" max="20" inputmode="numeric" placeholder="7">
    <span>:</span>
    <input id="baseRunPaceSec" type="number" min="0" max="59" inputmode="numeric" placeholder="13">
    <i>/km</i>
  </div>
</label>
        <label>FC moy.<input id="baseRunHr" type="number" min="1" inputmode="numeric" placeholder="145"><i>bpm</i></label>
        <label>RPE<input id="baseRunRpe" type="number" min="1" max="10" inputmode="numeric" placeholder="2"><i>/10</i></label>
      </div>
      <button type="button" class="base-run-save" id="baseRunSave">Enregistrer la séance 🟢</button>
      <p class="base-run-note">Suivi volontairement simple : allure, FC et RPE. Seuil et VO₂max seront détaillés plus tard.</p>
    </section>
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
  });
  const save=v.querySelector('#baseRunSave');
  if(save)save.onclick=()=>{
    const date=v.querySelector('#baseRunDate')?.value;
    const duration=+v.querySelector('#baseRunDuration')?.value||0;
    const paceMin=Math.max(0,+v.querySelector('#baseRunPaceMin')?.value||0);
    const paceSec=Math.max(0,Math.min(59,+v.querySelector('#baseRunPaceSec')?.value||0));
    const pace=`${paceMin}:${String(paceSec).padStart(2,'0')}`;
    const avgHr=+v.querySelector('#baseRunHr')?.value||0;
    const rpe=+v.querySelector('#baseRunRpe')?.value||0;
    if(!date||duration<=0||paceMin<=0||avgHr<=0||rpe<1||rpe>10){alert('Renseigne : date, durée, allure (minutes + secondes), FC moyenne et RPE /10.');return}
    cardioSaveBaseRunSession({date,duration,pace,avgHr,rpe});
    alert('Séance Base aérobie · Run enregistrée.');
    drawSeries();
  };
}

document.querySelectorAll('nav button').forEach(b=>b.onclick=async()=>{
  state.tab=b.dataset.tab;
  if(state.tab==='journal'&&!journalDraft)await syncJournalCloud();
  await load(false);
  draw();
});
document.querySelector('#prevWeek').onclick=()=>setWeek(state.week-1);
document.querySelector('#nextWeek').onclick=()=>setWeek(state.week+1);


// v1.12.3 : aucun nettoyage automatique de Séries.
 // Une mise à jour de ForgeLab ne doit jamais supprimer des données utilisateur.

async function boot(){
  importPcProgrammingV165();
  journalCloudAvailable=true;
  await syncJournalCloud();
  restoreSeriesPending();
  await load();
  clearInterval(poll);
  poll=setInterval(()=>load(!['series','programming','journal'].includes(state.tab)),12000)
}
document.addEventListener('visibilitychange',async()=>{
  if(!document.hidden&&currentUser){
    if(!journalDraft)await syncJournalCloud();
    await load(!journalDraft)
  }
});
window.addEventListener('online',()=>{if(currentUser)syncJournalCloud()});
(async()=>{if(await restoreAuth()){hideAuth();await boot()}else showAuth()})();

/* v1.12.3 — splash d'ouverture */
(function(){
  const splash=document.getElementById('forgeSplash');
  if(!splash)return;
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){
    setTimeout(()=>splash.remove(),350);
    return;
  }
  requestAnimationFrame(()=>splash.classList.add('is-leaving'));
  setTimeout(()=>{try{splash.remove()}catch(_){}},6025);
})();
