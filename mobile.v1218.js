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
function roman(n){const map=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];let out='';n=Math.max(1,Math.floor(+n||1));for(const [v,r] of map)while(n>=v){out+=r;n-=v}return out}
function draftRegistryKey(){return `forgelabProgrammingDraftRegistry:${currentUser?.id||'guest'}`}
function draftRegistry(){try{return JSON.parse(localStorage.getItem(draftRegistryKey())||'[]').filter(x=>x&&x.id)}catch(_){return[]}}
function saveDraftRegistry(x){localStorage.setItem(draftRegistryKey(),JSON.stringify(x))}
function selectedDraftKey(){return `forgelabProgrammingSelectedDraft:${currentUser?.id||'guest'}`}
function selectedDraftId(){return localStorage.getItem(selectedDraftKey())||''}
function setSelectedDraftId(id){if(id)localStorage.setItem(selectedDraftKey(),id);else localStorage.removeItem(selectedDraftKey())}
function ensureLegacyProgrammingDraftRegistered(){if(draftRegistry().length||!localStorage.getItem(`forgelabMobileProgrammingDraft:${currentUser?.id||'guest'}`))return;const id='draft-legacy';const m=(()=>{try{return JSON.parse(localStorage.getItem(`forgelabMobileProgrammingMeta:${currentUser?.id||'guest'}:draft`)||'null')}catch(_){return null}})()||{name:'Brouillon',duration:14,rhythm:4};saveDraftRegistry([{id,name:m.name||'Brouillon'}]);setSelectedDraftId(id);localStorage.setItem(`forgelabMobileProgrammingDraft:${currentUser?.id||'guest'}:${id}`,localStorage.getItem(`forgelabMobileProgrammingDraft:${currentUser?.id||'guest'}`));localStorage.setItem(`forgelabMobileProgrammingMeta:${currentUser?.id||'guest'}:draft:${id}`,JSON.stringify(m))}

function knownEmails(){try{return JSON.parse(localStorage.getItem(EMAILS_KEY)||'[]').filter(Boolean)}catch(_){return[]}}
function rememberEmail(email){email=String(email||'').trim().toLowerCase();if(!email)return;const all=[email,...knownEmails().filter(x=>x!==email)].slice(0,8);localStorage.setItem(EMAILS_KEY,JSON.stringify(all))}
function disabledKey(){return `forgelabMobileDisabled:${currentUser?.id||'guest'}${priorityMode()==='draft'?':draft:'+selectedPriorityDraftId():''}`}
function disabledMuscles(){try{return new Set(JSON.parse(localStorage.getItem(disabledKey())||'[]'))}catch(_){return new Set()}}
function setMuscleEnabled(muscleKey,enabled){const off=disabledMuscles();enabled?off.delete(muscleKey):off.add(muscleKey);localStorage.setItem(disabledKey(),JSON.stringify([...off]));draw()}
function muscleOrderKey(){return `forgelabMobileMuscleOrder:${currentUser?.id||'guest'}${priorityMode()==='draft'?':draft:'+selectedPriorityDraftId():''}`}
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
function programmingDraftKey(){return `forgelabMobileProgrammingDraft:${currentUser?.id||'guest'}:${selectedDraftId()||'default'}`}
function programmingModeKey(){return `forgelabMobileProgrammingMode:${currentUser?.id||'guest'}`}
function programmingMetaKey(mode=programmingMode()){return `forgelabMobileProgrammingMeta:${currentUser?.id||'guest'}:${mode==='draft'?'draft:'+(selectedDraftId()||'default'):'active'}`}
function programmingMeta(mode=programmingMode()){
  try{const x=JSON.parse(localStorage.getItem(programmingMetaKey(mode))||'null');if(x)return x}catch(_){}
  return {name:mode==='draft'?'Nouveau bloc':(state.blockName||'Bloc actif'),duration:Number(state.blockDuration||14),rhythm:4}
}
function saveProgrammingMeta(meta,mode=programmingMode()){localStorage.setItem(programmingMetaKey(mode),JSON.stringify(meta))}
function phaseRanges(meta){const n=Math.max(1,Number(meta.duration||14)),r=Math.max(3,Math.min(6,Number(meta.rhythm||4))),out=[];let w=1,c=1;while(w<=n){const end=Math.min(n,w+r-1);out.push({label:`Cycle ${roman(c)}`,from:w,to:end,deload:false});w=end+1;if(w<=n){out.push({label:'Deload',from:w,to:w,deload:true});w++}c++}return out}
function phaseId(q){return `s${q.from}-${q.to}${q.deload?'-d':''}`}
function selectedPhaseKey(mode=programmingMode()){return `forgelabMobileProgrammingSelectedPhase:${currentUser?.id||'guest'}:${mode}${mode==='draft'?':'+(selectedDraftId()||'default'):''}`}
function selectedPhaseId(meta=programmingMeta(),mode=programmingMode()){const phases=phaseRanges(meta),saved=localStorage.getItem(selectedPhaseKey(mode));return phases.some(q=>phaseId(q)===saved)?saved:phaseId(phases[0])}
function setSelectedPhase(id){localStorage.setItem(selectedPhaseKey(),id);drawProgramming()}
function phaseProgrammingKey(id,mode=programmingMode()){return `${mode==='draft'?programmingDraftKey():programmingKey()}:phase:${id}`}
function cloneProgrammingData(p){return JSON.parse(JSON.stringify(p||blankProgramming()))}
function ensurePhaseProgramming(meta=programmingMeta(),mode=programmingMode()){const phases=phaseRanges(meta),first=phaseId(phases[0]);phases.forEach((q,i)=>{const id=phaseId(q),k=phaseProgrammingKey(id,mode);if(!localStorage.getItem(k)){let src;if(i===0)src=programmingDataFromKey(mode==='draft'?programmingDraftKey():programmingKey());else src=programmingDataFromKey(phaseProgrammingKey(first,mode));localStorage.setItem(k,JSON.stringify(src))}});return phases}
function copyPreviousPhase(){const meta=programmingMeta(),ph=ensurePhaseProgramming(meta),id=selectedPhaseId(meta),i=ph.findIndex(q=>phaseId(q)===id);if(i<=0)return;const src=programmingDataFromKey(phaseProgrammingKey(phaseId(ph[i-1])));localStorage.setItem(phaseProgrammingKey(id),JSON.stringify(cloneProgrammingData(src)));drawProgramming()}
function programmingMode(){return localStorage.getItem(programmingModeKey())==='draft'?'draft':'active'}
function setProgrammingMode(mode){localStorage.setItem(programmingModeKey(),mode==='draft'?'draft':'active');drawProgramming()}
function programmingStorageKey(){const mode=programmingMode(),meta=programmingMeta(mode);ensurePhaseProgramming(meta,mode);return phaseProgrammingKey(selectedPhaseId(meta,mode),mode)}
function hasProgrammingDraft(){return !!(selectedDraftId()&&localStorage.getItem(programmingDraftKey()))}
function createProgrammingDraft(copyActive=true){const programName=(prompt('Nom du programme :','Nouveau programme')||'').trim();if(!programName)return;const id='draft-'+Date.now().toString(36);const regs=draftRegistry();regs.push({id,name:programName});saveDraftRegistry(regs);setSelectedDraftId(id);const duration=14,rhythm=4,src=copyActive?programmingDataFromKey(programmingKey()):blankProgramming();localStorage.setItem(programmingDraftKey(),JSON.stringify(src));saveProgrammingMeta({name:'Bloc I',duration,rhythm},'draft');localStorage.setItem(programmingModeKey(),'draft');ensureDraftProgramCardio();const fp={name:programName,selected:'bloc-1',blocks:[{id:'bloc-1',name:'Bloc I'}]};localStorage.setItem(fullProgramKey(),JSON.stringify(fp));saveCurrentIntoBlock('bloc-1');programmingScreen='editor';drawProgramming()}
function activateProgrammingDraft(){if(!hasProgrammingDraft())return;if(!confirm('Activer ce brouillon ? Le programme actif sera remplacé.'))return;saveCurrentIntoBlock();const fp=fullProgram();localStorage.setItem(programmingKey(),localStorage.getItem(programmingDraftKey())||JSON.stringify(blankProgramming()));saveProgrammingMeta(programmingMeta('draft'),'active');state.blockName=fp.name||state.blockName;localStorage.setItem(programmingModeKey(),'active');programmingScreen='chooser';drawProgramming()}
function deleteProgrammingDraft(){const id=selectedDraftId();if(!id||!confirm('Supprimer ce brouillon ? Le programme actif ne sera pas modifié.'))return;saveDraftRegistry(draftRegistry().filter(x=>x.id!==id));const pref=[`forgelabMobileProgrammingDraft:${currentUser?.id||'guest'}:${id}`,`forgelabMobileProgrammingMeta:${currentUser?.id||'guest'}:draft:${id}`,`forgelabFullProgram:${currentUser?.id||'guest'}:draft:${id}`,`forgelabProgramBlock:${currentUser?.id||'guest'}:draft:${id}:`];for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&pref.some(x=>k===x||k.startsWith(x)))localStorage.removeItem(k)}setSelectedDraftId('');programmingScreen='chooser';drawProgramming()}
function deleteProgrammingDraftById(id){if(!id)return;const d=draftRegistry().find(x=>x.id===id);if(!confirm(`Supprimer le brouillon « ${d?.name||'Programme'} » ?\n\nLe programme actif ne sera pas modifié.`))return;saveDraftRegistry(draftRegistry().filter(x=>x.id!==id));const uidKey=currentUser?.id||'guest',pref=[`forgelabMobileProgrammingDraft:${uidKey}:${id}`,`forgelabMobileProgrammingMeta:${uidKey}:draft:${id}`,`forgelabFullProgram:${uidKey}:draft:${id}`,`forgelabProgramBlock:${uidKey}:draft:${id}:`,`forgelabMobileProgrammingSelectedPhase:${uidKey}:draft:${id}`];for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&pref.some(x=>k===x||k.startsWith(x)))localStorage.removeItem(k)}if(selectedDraftId()===id)setSelectedDraftId('');programmingScreen='chooser';drawProgramming()}
function programmingPresetKey(){return `forgelabMobileProgrammingPresets:${currentUser?.id||'guest'}`}
const PC_PROGRAMMING_IMPORT_V169={"Lun":[{"id":"47b888ba-8484-4a34-95c3-ed854f5a4137","muscle_key":"Deltoïde latéral","muscle_name":"Deltoïde latéral","sets":4},{"id":"e2843dc6-6d8b-4cc2-8979-0c9b38421f7f","muscle_key":"Trapèzes moyens","muscle_name":"Trapèzes moyens","sets":4},{"id":"6f78cd77-7234-426c-9963-c7495c566d71","muscle_key":"Pectoraux","muscle_name":"Pectoraux","sets":4},{"id":"ebd9e2bc-1bbc-4440-8f6c-7d9a46f965dc","muscle_key":"Abdominaux","muscle_name":"Abdominaux","sets":4},{"id":"d1b00296-9092-4e63-bd7f-a30917b76eba","muscle_key":"Cou","muscle_name":"Cou","sets":4}],"Mar":[{"id":"8354c8a0-75d3-4a97-91e5-fa0cc9c8ad17","muscle_key":"Adducteurs","muscle_name":"Adducteurs","sets":4},{"id":"b4fcf4c2-a24d-4734-ad4d-5420cf2ef0e6","muscle_key":"Quadriceps","muscle_name":"Quadriceps","sets":3},{"id":"c3d420b4-9848-49f1-9f45-d99c67489361","muscle_key":"Ischios","muscle_name":"Ischios","sets":4},{"id":"55abadd6-07da-47d3-ae46-2c26e152152c","muscle_key":"Fessiers","muscle_name":"Fessiers","sets":3},{"id":"45721ab5-d8f4-491f-ab05-dfa01113e2bb","muscle_key":"Mollets","muscle_name":"Mollets","sets":3}],"Mer":[{"id":"b993a249-9db0-48d9-b8ed-f04b37e8cd43","muscle_key":"Deltoïde latéral","muscle_name":"Deltoïde latéral","sets":4},{"id":"235610c4-751b-410a-970c-f2e04b30fc2c","muscle_key":"Trapèzes moyens","muscle_name":"Trapèzes moyens","sets":4},{"id":"a1b730c2-f4fd-40d6-bd08-7a66b73f06f2","muscle_key":"Dos","muscle_name":"Dos","sets":4},{"id":"bbfd74f5-d3e7-46e1-9168-fec0157b8e55","muscle_key":"Trapèzes supérieurs","muscle_name":"Trapèzes supérieurs","sets":4},{"id":"1cb9bbdd-f926-411c-9322-688c9988980d","muscle_key":"Abdominaux","muscle_name":"Abdominaux","sets":4}],"Jeu":[{"id":"64d655c1-85b3-4afd-abc7-7ffaf5251d06","muscle_key":"Adducteurs","muscle_name":"Adducteurs","sets":4},{"id":"f478d3d4-de8c-494d-acd8-74069294ea39","muscle_key":"Quadriceps","muscle_name":"Quadriceps","sets":3},{"id":"e3c54e79-e085-4f37-9837-8bb01b161f73","muscle_key":"Ischios","muscle_name":"Ischios","sets":4},{"id":"ae9e5431-e3b8-4307-9347-b742af54a864","muscle_key":"Fessiers","muscle_name":"Fessiers","sets":3},{"id":"455a2400-b16e-4260-b380-e8870db2ff32","muscle_key":"Mollets","muscle_name":"Mollets","sets":3}],"Ven":[{"id":"25de6897-62a3-4e56-a5f4-d3dea948257c","muscle_key":"Deltoïde latéral","muscle_name":"Deltoïde latéral","sets":4},{"id":"717fbb21-7b59-462c-956e-605beba2492c","muscle_key":"Trapèzes moyens","muscle_name":"Trapèzes moyens","sets":4},{"id":"5fdbe360-2dcb-41d6-8d15-e498aecf243c","muscle_key":"Pectoraux","muscle_name":"Pectoraux","sets":4},{"id":"a9aa911c-58c0-46ce-9704-5d53cde551ec","muscle_key":"Dos","muscle_name":"Dos","sets":4},{"id":"5cc2487f-932b-4006-b60e-ddb53d1ba8fd","muscle_key":"Trapèzes supérieurs","muscle_name":"Trapèzes supérieurs","sets":4}],"Sam":[{"id":"904114ff-2c99-4dad-b9c3-b097098c0db2","muscle_key":"Biceps","muscle_name":"Biceps","sets":4},{"id":"afe086b2-c754-415a-8162-53a707aed30c","muscle_key":"Triceps","muscle_name":"Triceps","sets":6},{"id":"e802f043-da09-4e0c-9e5f-49e13be7af2d","muscle_key":"Cou","muscle_name":"Cou","sets":4},{"id":"8364ebdb-9e8c-4a95-a57f-5ce78a77df6d","muscle_key":"Avant-bras","muscle_name":"Avant-bras","sets":3}],"Dim":[]};
function importPcProgrammingV169(){
  if(!currentUser?.id)return;
  const marker=`forgelabMobileProgrammingImport:v1123:${currentUser.id}`;
  if(localStorage.getItem(marker)==='1')return;
  localStorage.setItem(programmingKey(),JSON.stringify(PC_PROGRAMMING_IMPORT_V169));
  localStorage.setItem(marker,'1');
}
function newProgramId(){return 'pr_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8)}
function programOpenExerciseKey(){return `forgelabMobileProgrammingOpenExercise:${currentUser?.id||'guest'}:${programmingMode()}:${selectedPhaseId(programmingMeta(),programmingMode())}`}
function programOpenExerciseId(){return localStorage.getItem(programOpenExerciseKey())||''}
function setProgramOpenExerciseId(id){if(id)localStorage.setItem(programOpenExerciseKey(),id);else localStorage.removeItem(programOpenExerciseKey())}
function exerciseLibraryKey(){return `forgelabMobileExerciseLibrary:${currentUser?.id||'guest'}`}
function loadCustomExerciseLibrary(){try{return JSON.parse(localStorage.getItem(exerciseLibraryKey())||'{}')}catch(_){return {}}}
function exerciseOptionsFor(muscle){const custom=loadCustomExerciseLibrary()[muscle]||[];return [...new Set([...(JOURNAL_LIBRARY[muscle]||[]),...custom])]}
function rememberExercise(muscle,name){const lib=loadCustomExerciseLibrary();lib[muscle]=[...new Set([...(lib[muscle]||[]),name])];localStorage.setItem(exerciseLibraryKey(),JSON.stringify(lib))}
function blankProgramming(){return Object.fromEntries(DAYS.map(d=>[d,[]]))}
function programCardioKey(mode=programmingMode()){return `forgelabProgrammingCardio:${currentUser?.id||'guest'}:${mode==='draft'?'draft:'+(selectedDraftId()||'default'):'active'}`}
function blankProgramCardio(){return Object.fromEntries(DAYS.map(d=>[d,[]]))}
function programCardioData(mode=programmingMode()){try{const raw=JSON.parse(localStorage.getItem(programCardioKey(mode))||'null'),out=blankProgramCardio();if(raw&&typeof raw==='object')DAYS.forEach(d=>{out[d]=Array.isArray(raw[d])?raw[d].map(x=>({id:x.id||cardioModalityId(),quality:String(x.quality||CARDIO_QUALITIES[0]),engine:String(x.engine||CARDIO_ENGINES[0]),format:String(x.format||CARDIO_FORMATS[0]),duration:Math.max(0,Number(x.duration||0))})):[]});return out}catch(_){return blankProgramCardio()}}
function saveProgramCardio(x,redraw=true){localStorage.setItem(programCardioKey(),JSON.stringify(x));if(redraw&&state.tab==='programming')drawProgramming()}
function ensureDraftProgramCardio(){if(programmingMode()!=='draft'||localStorage.getItem(programCardioKey('draft')))return;const active=localStorage.getItem(programCardioKey('active'));localStorage.setItem(programCardioKey('draft'),active||JSON.stringify(blankProgramCardio()))}
function programmingDataFromKey(key){
  try{
    const raw=JSON.parse(localStorage.getItem(key)||'null');
    const out=blankProgramming();
    if(raw&&typeof raw==='object')DAYS.forEach(d=>{
      out[d]=Array.isArray(raw[d])?raw[d].map(x=>({id:x.id||newProgramId(),muscle_key:String(x.muscle_key||x.muscle||''),muscle_name:String(x.muscle_name||x.muscle||x.muscle_key||''),sets:Math.max(0,Number(x.sets||0)),exercises:Array.isArray(x.exercises)?x.exercises.map(e=>({id:e.id||newProgramId(),name:String(e.name||''),sets:Math.max(0,Number(e.sets||0)),rest:Math.max(15,Number(e.rest||90))})).filter(e=>e.name):[]})).filter(x=>x.muscle_key):[];
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
function cardioKey(){return `forgelabMobileCardio:${currentUser?.id||'guest'}${priorityMode()==='draft'?':draft:'+selectedPriorityDraftId():''}`}
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

function jCalendarDateForDay(day,week=state.week){
  // Date strictement rattachée au programme actif et à sa propre S1.
  const start=forgeActiveProgramStartDate();
  start.setDate(start.getDate()+(Math.max(1,+week||1)-1)*7+(Math.max(1,+day||1)-1));
  const p=n=>String(n).padStart(2,'0');
  return `${start.getFullYear()}-${p(start.getMonth()+1)}-${p(start.getDate())}`;
}
function jActiveProgramForWeek(week){
  const uidKey=currentUser?.id||'guest';
  let fp=null;try{fp=JSON.parse(localStorage.getItem(`forgelabFullProgram:${uidKey}:active`)||'null')}catch(_){}
  const blocks=Array.isArray(fp?.blocks)?fp.blocks:[];
  const block=blocks.find(b=>+week>=+(b.from||1)&&+week<=+(b.to||0))||blocks.find(b=>!b.deload)||blocks[0]||null;
  let data=blankProgramming();
  if(block){
    const pre=`forgelabProgramBlock:${uidKey}:active:${block.id}:phase:active:`;
    const candidates=[];
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);if(k&&k.startsWith(pre))candidates.push(k);
    }
    // Les blocs ForgeLab utilisent actuellement une trame journalière commune à leurs semaines.
    for(const k of candidates.sort()){
      try{const x=programmingDataFromKey(k);if(DAYS.some(d=>(x[d]||[]).length)){data=x;break}}catch(_){}
    }
  }
  // Compatibilité avec les programmes actifs antérieurs au multi-blocs.
  if(!DAYS.some(d=>(data[d]||[]).length)){
    const meta=programmingMeta('active'),phase=phaseRanges(meta).find(q=>+week>=q.from&&+week<=q.to)||phaseRanges(meta)[0];
    if(phase)data=programmingDataFromKey(phaseProgrammingKey(phaseId(phase),'active'));
  }
  return {programName:fp?.name||state.blockName||'Programme ForgeLab',blockName:block?.name||state.blockName||'Bloc actif',block,data};
}
function jProgrammedMuscleForDay(week,day,muscleKey){
  const ctx=jActiveProgramForWeek(week),dayName=DAYS[Math.max(1,+day||1)-1];
  const row=(ctx.data?.[dayName]||[]).find(x=>x.muscle_key===muscleKey);
  return {ctx,row};
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
  // v1.21.8 : fonction conservée uniquement pour compatibilité interne.
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

  // Compatibilité immédiate avec les séances déjà validées avant v1.21.8 :
  // le nombre de lignes du brouillon validé sert de référence.
  const out=new Map();
  (last.exercises||[]).forEach(e=>{
    const key=e.muscleKey||e.muscle;
    if(key)out.set(key,(out.get(key)||0)+(e.sets||[]).length);
  });
  return out;
}

function syncJournalDraftFromSeries(week,day){
  // Isolation forte : un brouillon = bloc actif + semaine + jour.
  // Aucune lecture d'une autre semaine n'entre dans le calcul ci-dessous.
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
      const d=drafts[idx];
      const touched=(d.sessionName||'').trim() || (d.notes||'').trim() ||
        (d.exercises||[]).some(e=>(e.sets||[]).some(s=>(+s.kg||0)||(+s.reps||0)));
      if(!touched){drafts.splice(idx,1);jDraftSave(drafts)}
    }
    return;
  }

  const programCtx=jActiveProgramForWeek(week);
  let d=idx>=0?drafts[idx]:{
    id,source:'series',status:'draft',block:state.block||'main',week,day,
    sessionName:`${DAYS[day-1]} · ${programCtx.blockName}`,
    programName:programCtx.programName,blockName:programCtx.blockName,
    date:jCalendarDateForDay(day,week),duration:0,notes:'',createdAt:new Date().toISOString(),exercises:[]
  };
  d.programName=programCtx.programName;d.blockName=programCtx.blockName;
  // La date reste celle de Sx/Jx même si le brouillon est ouvert plusieurs semaines plus tard.
  if(!d.date)d.date=jCalendarDateForDay(day,week);
  d.hiddenMuscles=d.hiddenMuscles&&typeof d.hiddenMuscles==='object'?d.hiddenMuscles:{};

  currentRows.forEach(r=>{
    const hiddenAt=+d.hiddenMuscles[r.muscle_key]||0;
    if(hiddenAt && hiddenAt!==+r.series)delete d.hiddenMuscles[r.muscle_key];
  });

  const previous=Array.isArray(d.exercises)?d.exercises:[];
  const prevByProgramId=new Map(previous.filter(e=>e.programExerciseId).map(e=>[e.programExerciseId,e]));
  const prevByName=new Map(previous.filter(e=>e.name).map(e=>[`${e.muscleKey||e.muscle}|${e.name}`,e]));
  const next=[];

  currentRows
    .filter(r=>!(r.muscle_key in d.hiddenMuscles))
    .sort((a,b)=>(+a.journalEnteredAt||0)-(+b.journalEnteredAt||0))
    .forEach(r=>{
      const key=r.muscle_key,total=Math.max(0,+r.series||0);
      const {row:planned}=jProgrammedMuscleForDay(week,day,key);
      const plan=Array.isArray(planned?.exercises)?planned.exercises.filter(e=>e.name&&+e.sets>0):[];
      let remaining=total;

      if(plan.length){
        plan.forEach((pe,pi)=>{
          if(remaining<=0)return;
          let count=Math.min(remaining,Math.max(0,+pe.sets||0));
          // Si Séries dépasse le volume programmé, l'excédent reste sur le dernier exercice prévu.
          if(pi===plan.length-1)count=remaining;
          if(count<=0)return;
          const old=prevByProgramId.get(pe.id)||prevByName.get(`${key}|${pe.name}`);
          const sets=Array.isArray(old?.sets)?old.sets.map(x=>({...x})):[];
          while(sets.length<count)sets.push({kg:0,reps:0});
          while(sets.length>count && !(+sets.at(-1)?.kg||0) && !(+sets.at(-1)?.reps||0))sets.pop();
          next.push({
            id:old?.id||jId(),programExerciseId:pe.id,muscleKey:key,muscle:jMuscleLabel(key),
            name:pe.name,rest:+pe.rest||90,journalEnteredAt:+r.journalEnteredAt||Date.now(),sets
          });
          remaining-=count;
        });
      }else{
        // Pas d'exercice associé dans Programmation : on garde le comportement manuel de secours.
        const old=previous.find(e=>(e.muscleKey||e.muscle)===key);
        const sets=Array.isArray(old?.sets)?old.sets.map(x=>({...x})):[];
        while(sets.length<total)sets.push({kg:0,reps:0});
        while(sets.length>total && !(+sets.at(-1)?.kg||0) && !(+sets.at(-1)?.reps||0))sets.pop();
        next.push({id:old?.id||jId(),muscleKey:key,muscle:jMuscleLabel(key),name:old?.name||'',journalEnteredAt:+r.journalEnteredAt||Date.now(),sets});
      }
    });

  // Conserve les exercices ajoutés manuellement et déjà renseignés, sans les recopier vers une autre semaine.
  previous.filter(e=>!e.programExerciseId && (e.sets||[]).some(s=>(+s.kg||0)||(+s.reps||0)))
    .forEach(e=>{if(!next.some(n=>n.id===e.id))next.push(e)});

  d.exercises=next;
  d.updatedAt=new Date().toISOString();
  if(idx>=0)drafts[idx]=d;else drafts.push(d);
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
function jExercises(m,sel=''){const opts=[...new Set([...exerciseOptionsFor(m),...(sel?[sel]:[])])];return `<option value="" ${!sel?'selected':''}>Choisir un exercice…</option>`+opts.map(x=>`<option ${x===sel?'selected':''}>${esc(x)}</option>`).join('')}
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
      <img class="auth-laurel" src="auth-laurel-realistic-v1218.png" alt="" aria-hidden="true">
      <div class="auth-brand">FORGELAB</div>
      <div class="auth-sub">ATLAS · ESPACE PERSONNEL</div>
      <div class="auth-version"><span>v1.21.8</span></div>
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
function forgeActiveProgramStartDate(){
  const uidKey=currentUser?.id||'guest';
  try{
    const fp=JSON.parse(localStorage.getItem(`forgelabFullProgram:${uidKey}:active`)||'null');
    if(fp?.startDate&&/^\d{4}-\d{2}-\d{2}$/.test(fp.startDate)){const [y,m,d]=fp.startDate.split('-').map(Number);return new Date(y,m-1,d,12,0,0,0)}
  }catch(_){}
  // Compatibilité uniquement pour les anciens programmes qui n'avaient pas encore leur propre date de départ.
  return new Date(2026,7,31,12,0,0,0);
}
function forgeWeekDateRange(week=state.week){
  const start=forgeActiveProgramStartDate();
  start.setDate(start.getDate()+(Math.max(1,+week||1)-1)*7);
  const end=new Date(start);end.setDate(start.getDate()+6);
  const months=['JANV.','FÉVR.','MARS','AVR.','MAI','JUIN','JUIL.','AOÛT','SEPT.','OCT.','NOV.','DÉC.'];
  const left=start.getMonth()===end.getMonth()?String(start.getDate()):`${start.getDate()} ${months[start.getMonth()]}`;
  return `${left} — ${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`;
}
function forgeHeaderProgramContext(){
  const uidKey=currentUser?.id||'guest';
  const isDraft=state.tab==='programming'&&programmingScreen==='editor'&&programmingMode()==='draft';
  const key=isDraft?`forgelabFullProgram:${uidKey}:draft:${selectedDraftId()||'default'}`:`forgelabFullProgram:${uidKey}:active`;
  let fp=null;try{fp=JSON.parse(localStorage.getItem(key)||'null')}catch(_){}
  const programName=(fp?.name||'Programme ForgeLab').trim();
  let blockName=state.blockName||'Bloc actif';
  if(isDraft&&fp?.blocks?.length){
    const selected=fp.blocks.find(b=>b.id===fp.selected)||fp.blocks[0];
    if(selected?.name)blockName=selected.name;
  }else if(fp?.blocks?.length){
    const selected=fp.blocks.find(b=>b.id===fp.selected)||fp.blocks.find(b=>!b.deload)||fp.blocks[0];
    if(selected?.name)blockName=selected.name;
  }
  return {programName,blockName};
}
function draw(){
  ensureAccountButton();
  const wt=document.querySelector('#weekTitle');
  const hc=forgeHeaderProgramContext();
  wt.innerHTML=`<span class="week-number">S${state.week}</span><span class="week-date-range">${esc(forgeWeekDateRange(state.week))}</span><span class="week-program-name">${esc(hc.programName)}</span><span class="week-block-name">${esc(hc.blockName)}</span>`;
  const bt=document.querySelector('#blockTitle');
  if(bt) bt.textContent='';
  weeks();
  const weekDots=document.querySelector('#weekDots');
  if(weekDots){
    const hideWeeks=state.tab==='priorities' || (state.tab==='programming' && programmingScreen==='chooser');
    weekDots.hidden=hideWeeks;
    if(hideWeeks) weekDots.style.setProperty('display','none','important');
    else weekDots.style.removeProperty('display');
  }
  document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.tab));state.tab==='priorities'?drawPriorities():state.tab==='programming'?drawProgramming():state.tab==='journal'?drawJournal():state.tab==='tracking'?drawTracking():drawSeries()}
function title(t){return`<h2 class="section-title">${t}</h2>`}
function nutritionLabel(){return state.nutritionContext==='deficit'?'Déficit':state.nutritionContext==='surplus'?'Surplus':'Maintien'}

let prioritiesScreen='chooser';
function priorityModeKey(){return `forgelabPriorityMode:${currentUser?.id||'guest'}`}
function priorityMode(){return localStorage.getItem(priorityModeKey())==='draft'?'draft':'active'}
function setPriorityMode(m){localStorage.setItem(priorityModeKey(),m==='draft'?'draft':'active')}
function priorityDraftRegistryKey(){return `forgelabPriorityDraftRegistry:${currentUser?.id||'guest'}`}
function priorityDraftRegistry(){try{return JSON.parse(localStorage.getItem(priorityDraftRegistryKey())||'[]').filter(x=>x&&x.id)}catch(_){return[]}}
function savePriorityDraftRegistry(x){localStorage.setItem(priorityDraftRegistryKey(),JSON.stringify(x))}
function selectedPriorityDraftKey(){return `forgelabPrioritySelectedDraft:${currentUser?.id||'guest'}`}
function selectedPriorityDraftId(){return localStorage.getItem(selectedPriorityDraftKey())||''}
function setSelectedPriorityDraftId(id){if(id)localStorage.setItem(selectedPriorityDraftKey(),id);else localStorage.removeItem(selectedPriorityDraftKey())}
function priorityDraftDataKey(id=selectedPriorityDraftId()){return `forgelabPriorityDraftData:${currentUser?.id||'guest'}:${id}`}
function savePriorityDraftData(){if(priorityMode()!=='draft'||!selectedPriorityDraftId())return;localStorage.setItem(priorityDraftDataKey(),JSON.stringify(state.priorities))}
function loadPriorityDraftData(id){try{return JSON.parse(localStorage.getItem(priorityDraftDataKey(id))||'[]')}catch(_){return []}}
function createPriorityDraft(){const name=(prompt('Nom du brouillon de priorités :','Priorités futur programme')||'').trim();if(!name)return;const id='pd-'+Date.now().toString(36),regs=priorityDraftRegistry();regs.push({id,name});savePriorityDraftRegistry(regs);setSelectedPriorityDraftId(id);localStorage.setItem(priorityDraftDataKey(id),JSON.stringify(state.priorities));const activeDisabled=localStorage.getItem(`forgelabMobileDisabled:${currentUser?.id||'guest'}`);if(activeDisabled)localStorage.setItem(`forgelabMobileDisabled:${currentUser?.id||'guest'}:draft:${id}`,activeDisabled);const activeOrder=localStorage.getItem(`forgelabMobileMuscleOrder:${currentUser?.id||'guest'}`);if(activeOrder)localStorage.setItem(`forgelabMobileMuscleOrder:${currentUser?.id||'guest'}:draft:${id}`,activeOrder);const activeCardio=localStorage.getItem(`forgelabMobileCardio:${currentUser?.id||'guest'}`);if(activeCardio)localStorage.setItem(`forgelabMobileCardio:${currentUser?.id||'guest'}:draft:${id}`,activeCardio);setPriorityMode('draft');state.priorities=loadPriorityDraftData(id);prioritiesScreen='editor';drawPriorities()}
function deletePriorityDraftById(id){if(!id)return;const d=priorityDraftRegistry().find(x=>x.id===id);if(!confirm(`Supprimer le brouillon « ${d?.name||'Priorités'} » ?\n\nLes priorités actives ne seront pas modifiées.`))return;savePriorityDraftRegistry(priorityDraftRegistry().filter(x=>x.id!==id));const uidKey=currentUser?.id||'guest',prefixes=[`forgelabPriorityDraftData:${uidKey}:${id}`,`forgelabMobileDisabled:${uidKey}:draft:${id}`,`forgelabMobileMuscleOrder:${uidKey}:draft:${id}`,`forgelabMobileCardio:${uidKey}:draft:${id}`];for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&prefixes.some(x=>k===x||k.startsWith(x)))localStorage.removeItem(k)}if(selectedPriorityDraftId()===id)setSelectedPriorityDraftId('');prioritiesScreen='chooser';drawPriorities()}
function drawPrioritiesChooser(){const v=document.querySelector('#view'),ds=priorityDraftRegistry();v.innerHTML=title('Priorités')+`<section class="program-choice-screen"><div class="program-choice-intro"><small>ESPACE PRIORITÉS</small><strong>Quelles priorités veux-tu ouvrir ?</strong><span>Prépare les futurs programmes sans modifier tes priorités actives.</span></div><button type="button" class="program-choice-card active" data-priority-active><span class="program-choice-icon">I</span><div><small>PRIORITÉS ACTIVES</small><strong>${esc(state.blockName||'Programme actif')}</strong><span>Priorités actuellement utilisées</span></div><b>›</b></button><div class="program-draft-list">${ds.map((d,i)=>`<div class="draft-choice-row"><button type="button" class="program-choice-card draft" data-priority-draft="${esc(d.id)}"><span class="program-choice-icon">${roman(i+1)}</span><div><small>BROUILLON ${roman(i+1)}</small><strong>${esc(d.name)}</strong><span>Priorités d’un futur programme</span></div><b>›</b></button><button type="button" class="draft-delete-mini" data-priority-delete="${esc(d.id)}" aria-label="Supprimer ${esc(d.name)}">×</button></div>`).join('')}</div><button type="button" class="program-new-draft" data-priority-new>＋ Nouveau brouillon</button></section>`;v.querySelector('[data-priority-active]').onclick=async()=>{setPriorityMode('active');setSelectedPriorityDraftId('');prioritiesScreen='editor';await load(false);drawPriorities()};v.querySelectorAll('[data-priority-draft]').forEach(b=>b.onclick=()=>{setSelectedPriorityDraftId(b.dataset.priorityDraft);setPriorityMode('draft');state.priorities=loadPriorityDraftData(b.dataset.priorityDraft);prioritiesScreen='editor';drawPriorities()});v.querySelectorAll('[data-priority-delete]').forEach(b=>b.onclick=e=>{e.stopPropagation();deletePriorityDraftById(b.dataset.priorityDelete)});v.querySelector('[data-priority-new]').onclick=createPriorityDraft}

function drawPriorities(){
  if(prioritiesScreen==='chooser'){drawPrioritiesChooser();return}
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
    <div class="cardhead"><div><div class="muscle">${esc(p.muscle_name)}</div><div class="range">${disabled?'Groupe désactivé':`Cible · <b>${p.target_min}–${p.target_max}</b> séries / semaine`}</div></div><button class="muscle-toggle ${disabled?'off':'on'}" data-toggle="${esc(p.muscle_key)}" aria-label="${disabled?'Réactiver':'Désactiver'} ${esc(p.muscle_name)}">${disabled?'Réactiver':'Actif'}</button></div>${disabled?'':`<div class="priority-meta"><strong>${t} séries</strong></div><div class="prio-buttons">${['P0','P1','P2'].map(x=>`<button data-m="${esc(p.muscle_key)}" data-p="${x}" class="${p.priority===x?'selected':''}">${x}<small>${derivedRange(p.muscle_name,x).join('–')}</small></button>`).join('')}</div>`}</article>`}).join('')+
  `<article class="card ${cd.enabled?cd.priority.toLowerCase():'disabled-muscle'} priority-card cardio-priority-card">
    <div class="cardhead"><div><div class="muscle">♥ Cardio</div><div class="range">${cd.enabled?`${cd.modalities.length} séance-type · <b>${cardioTarget}</b> séance${cardioTarget>1?'s':''} / semaine`:'Priorité cardio désactivée'}</div></div><button class="muscle-toggle ${cd.enabled?'on':'off'}" data-cardio-toggle>${cd.enabled?'Actif':'Réactiver'}</button></div>
    ${cd.enabled?`<div class="priority-meta"><strong>${cardioDone}/${cardioTarget} séance${cardioTarget>1?'s':''}</strong></div>
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
  const pback=document.createElement('button');pback.type='button';pback.className='program-back-choice';pback.innerHTML='‹ <span>Priorités</span>';pback.onclick=async()=>{if(priorityMode()==='draft')savePriorityDraftData();else await load(false);prioritiesScreen='chooser';drawPriorities()};const ph=v.querySelector('.section-title');if(ph)ph.insertAdjacentElement('afterend',pback);
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

async function changePriority(muscleKey,priority){let p=state.priorities.find(x=>x.muscle_key===muscleKey);if(!p)return;let[min,max]=derivedRange(p.muscle_name,priority);if(priorityMode()==='draft'){p.priority=priority;p.target_min=min;p.target_max=max;savePriorityDraftData();drawPriorities();return}cloud('ENREGISTREMENT…');await req('/forgelab_priorities?user_id=eq.'+encodeURIComponent(uid())+'&muscle_key=eq.'+encodeURIComponent(muscleKey),{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({priority,target_min:min,target_max:max,updated_at:new Date().toISOString()})});await load()}
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
 const meta=programmingMeta(),p=programmingData(),fp=fullProgram();
 const activeDays=DAYS.filter(d=>(p[d]||[]).some(z=>+z.sets>0));
 if(!activeDays.length){alert('Aucune journée programmée dans ce bloc.');return}
 const selected=(fp.blocks||[]).find(b=>b.id===fp.selected), blockName=selected?.name||meta.name||'Bloc ForgeLab';
 const W=1080,H=1920,S=2,c=document.createElement('canvas');c.width=W*S;c.height=H*S;const g=c.getContext('2d');g.scale(S,S);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 const load=src=>new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=src});
 const assets={};for(const f of ['auth-laurel-realistic-v1218.png','footer-mountains-man-v1218.png']){try{assets[f]=await load(f)}catch(_){}}
 const gold='#e4bb68',gold2='#f2d38a',white='#f5f1e9',muted='#aaa397',line='rgba(228,187,104,.30)';
 const txt=(t,x,y,size,color=white,weight=700,align='left')=>{g.fillStyle=color;g.font=`${weight} ${size}px Georgia, serif`;g.textAlign=align;g.textBaseline='middle';g.fillText(String(t),x,y)};
 const sans=(t,x,y,size,color=white,weight=600,align='left')=>{g.fillStyle=color;g.font=`${weight} ${size}px Arial, sans-serif`;g.textAlign=align;g.textBaseline='middle';g.fillText(String(t),x,y)};
 const fit=(t,x,y,max,size,color=white,weight=800,align='left',serif=true)=>{let z=size;do{g.font=`${weight} ${z}px ${serif?'Georgia, serif':'Arial, sans-serif'}`;if(g.measureText(String(t)).width<=max)break;z--}while(z>11);(serif?txt:sans)(t,x,y,z,color,weight,align);return z};
 const wrap=(t,x,y,max,size,color=muted,weight=500,lineH=18,maxLines=2)=>{const words=String(t||'').split(/\s+/),lines=[];let cur='';g.font=`${weight} ${size}px Arial, sans-serif`;for(const w of words){const q=cur?cur+' '+w:w;if(g.measureText(q).width<=max)cur=q;else{if(cur)lines.push(cur);cur=w;if(lines.length>=maxLines-1)break}}if(cur&&lines.length<maxLines)lines.push(cur);lines.forEach((l,i)=>sans(l,x,y+i*lineH,size,color,weight));return lines.length};
 // Direction artistique ForgeLab : métal noir, architecture antique et lumière or.
 const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#020304');bg.addColorStop(.46,'#0a0b0c');bg.addColorStop(1,'#020202');g.fillStyle=bg;g.fillRect(0,0,W,H);
 // Texture très légère, déterministe : évite l'aplat noir sans gêner la lecture.
 g.save();g.globalAlpha=.055;for(let yy=0;yy<H;yy+=7){const a=((yy*37)%19)/19;g.fillStyle=a>.5?'#d8c69e':'#ffffff';g.fillRect(0,yy,W,1)}g.restore();
 const glow=g.createRadialGradient(W/2,100,10,W/2,100,660);glow.addColorStop(0,'rgba(242,211,138,.24)');glow.addColorStop(.34,'rgba(228,187,104,.08)');glow.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=glow;g.fillRect(0,0,W,590);
 // Colonnes grecques stylisées sur les bords, volontairement très sombres.
 const column=(x,flip=false)=>{g.save();g.globalAlpha=.20;const cw=42,top=20,bottom=H-92;const cg=g.createLinearGradient(x,0,x+(flip?-cw:cw),0);cg.addColorStop(0,'#070707');cg.addColorStop(.45,'#66583e');cg.addColorStop(1,'#050505');g.fillStyle=cg;g.fillRect(flip?x-cw:x,top,cw,bottom-top);g.fillStyle='rgba(228,187,104,.22)';for(let k=0;k<4;k++){const xx=(flip?x-cw:x)+7+k*9;g.fillRect(xx,58,2,bottom-92)}g.fillStyle='#5b4c33';g.fillRect((flip?x-cw:x)-7,20,cw+14,16);g.fillRect((flip?x-cw:x)-4,38,cw+8,9);g.fillRect((flip?x-cw:x)-8,bottom-22,cw+16,18);g.restore()};column(4);column(W-4,true);
 // Header compact pensé pour un seul écran iPhone.
 // Identité : le laurier est désormais clairement AU-DESSUS du nom FORGELAB.
 const laurel=assets['auth-laurel-realistic-v1218.png'];
 if(laurel){g.save();g.globalAlpha=.98;g.shadowColor='rgba(242,211,138,.22)';g.shadowBlur=16;g.drawImage(laurel,W/2-36,10,72,63);g.restore()}
 g.save();g.shadowColor='rgba(228,187,104,.35)';g.shadowBlur=12;txt('FORGELAB',W/2,94,29,gold2,900,'center');g.restore();
 sans('DISCIPLINA · CONSTANTIA · PROGRESSUS',W/2,126,10.5,'rgba(245,241,233,.70)',650,'center');
 // double filet antique : donne un vrai bandeau de titre sans prendre de hauteur.
 g.strokeStyle='rgba(228,187,104,.42)';g.lineWidth=1;g.beginPath();g.moveTo(90,148);g.lineTo(442,148);g.moveTo(638,148);g.lineTo(990,148);g.stroke();
 g.fillStyle=gold2;g.beginPath();g.moveTo(W/2,141);g.lineTo(W/2+9,148);g.lineTo(W/2,155);g.lineTo(W/2-9,148);g.closePath();g.fill();
 g.save();g.shadowColor='rgba(0,0,0,.95)';g.shadowBlur=8;g.shadowOffsetY=3;fit((fp.name||'PROGRAMME FORGELAB').toUpperCase(),W/2,188,W-96,49,gold2,900,'center',true);g.restore();
 let range='';try{range=selected&&typeof fl176RangeLabel==='function'?fl176RangeLabel(selected):''}catch(_){}
 const sub=[blockName.toUpperCase(),range].filter(Boolean).join(' · ');fit(sub,W/2,231,W-120,22,white,800,'center',false);
 const totalSets=activeDays.reduce((a,d)=>a+(p[d]||[]).reduce((s,e)=>s+(+e.sets||0),0),0);
 sans(`${activeDays.length} JOURS · ${totalSets} SÉRIES`,W/2,261,13,gold,800,'center');
 g.strokeStyle='rgba(228,187,104,.68)';g.lineWidth=1;g.beginPath();g.moveTo(72,286);g.lineTo(W-72,286);g.stroke();
 // Grille dynamique 2 colonnes. Le contenu, pas une illustration, est prioritaire.
 // Le cardio du bloc reste volontairement une séance libre : on affiche la trame, pas un faux jour fixe.
 const cardioTpl=(typeof flCardioTemplate==='function'?flCardioTemplate():{items:[]});
 const cardioItems=(cardioTpl.items||[]).filter(t=>(+t.target||0)>0);
 const cardioFrequency=cardioItems.reduce((n,t)=>n+(+t.target||0),0);
 const cardioStripH=cardioItems.length?88:0;
 const cols=activeDays.length===1?1:2,rows=Math.ceil(activeDays.length/cols),margin=30,gap=14,top=302,footerH=112,bottom=footerH+18+(cardioStripH?cardioStripH+10:0);
 const cardW=(W-margin*2-gap*(cols-1))/cols,cardH=(H-top-bottom-gap*(rows-1))/rows;
 activeDays.forEach((day,i)=>{
   const col=i%cols,row=Math.floor(i/cols),x=margin+col*(cardW+gap),y=top+row*(cardH+gap),entries=(p[day]||[]).filter(z=>+z.sets>0),daySets=entries.reduce((a,e)=>a+(+e.sets||0),0);
   const rr=(xx,yy,ww,hh,r)=>{g.beginPath();g.roundRect(xx,yy,ww,hh,r)};g.save();g.shadowColor='rgba(0,0,0,.65)';g.shadowBlur=18;g.shadowOffsetY=7;rr(x,y,cardW,cardH,12);const cg=g.createLinearGradient(x,y,x+cardW,y+cardH);cg.addColorStop(0,'rgba(17,18,18,.985)');cg.addColorStop(.55,'rgba(5,7,8,.985)');cg.addColorStop(1,'rgba(13,11,8,.985)');g.fillStyle=cg;g.fill();g.restore();rr(x+.8,y+.8,cardW-1.6,cardH-1.6,11);g.strokeStyle='rgba(228,187,104,.82)';g.lineWidth=1.5;g.stroke();g.strokeStyle='rgba(242,211,138,.16)';g.lineWidth=.7;rr(x+5,y+5,cardW-10,cardH-10,8);g.stroke();
   const headH=Math.max(46,Math.min(58,cardH*.13)),hg=g.createLinearGradient(x,y,x+cardW,y);hg.addColorStop(0,'rgba(228,187,104,.13)');hg.addColorStop(.55,'rgba(228,187,104,.035)');hg.addColorStop(1,'rgba(228,187,104,.09)');g.fillStyle=hg;rr(x+1,y+1,cardW-2,headH,9);g.fill();g.fillStyle=gold;g.fillRect(x+13,y+headH-1,cardW-26,1);
   // petits angles or, signature graphique ForgeLab
   g.strokeStyle='rgba(242,211,138,.75)';g.lineWidth=2;[[x+8,y+8,1,1],[x+cardW-8,y+8,-1,1],[x+8,y+cardH-8,1,-1],[x+cardW-8,y+cardH-8,-1,-1]].forEach(([cx,cy,sx,sy])=>{g.beginPath();g.moveTo(cx,cy+sy*11);g.lineTo(cx,cy);g.lineTo(cx+sx*11,cy);g.stroke()});
   g.save();g.shadowColor='rgba(228,187,104,.24)';g.shadowBlur=8;txt(day.toUpperCase(),x+18,y+headH/2,Math.min(25,headH*.46),gold2,900);g.restore();sans(`${daySets} SÉRIES`,x+cardW-16,y+headH/2,12,gold,850,'right');
   const usable=cardH-headH-12, per=Math.max(1,entries.length), rowH=usable/per;
   entries.forEach((e,j)=>{
     const ry=y+headH+j*rowH;if(j){g.strokeStyle=line;g.beginPath();g.moveTo(x+16,ry);g.lineTo(x+cardW-16,ry);g.stroke()}
     const cy=ry+Math.min(22,rowH*.28);fit((e.muscle_name||'GROUPE').toUpperCase(),x+18,cy,cardW-92,Math.min(16,Math.max(12,rowH*.18)),white,800,'left',false);sans(String(+e.sets||0),x+cardW-18,cy,Math.min(20,Math.max(14,rowH*.22)),gold2,900,'right');
     const ex=(e.exercises||[]).filter(q=>q.name&&+q.sets>0);
     const exerciseText=ex.length?ex.map(q=>q.name).join(' · '):'Exercice non renseigné';
     const exSize=Math.min(13,Math.max(10,rowH*.145)),exY=ry+Math.min(46,rowH*.58);wrap(exerciseText,x+18,exY,cardW-36,exSize,ex.length?muted:'#6f6b64',500,Math.max(14,exSize+3),rowH>66?2:1);
   });
 });
 // Carte cardio libre : thème + fréquence du bloc uniquement. Le détail reste programmé semaine par semaine dans ForgeLab.
 if(cardioItems.length){
   const x=margin,y=H-footerH-cardioStripH-10,w=W-margin*2,h=cardioStripH;
   g.save();g.shadowColor='rgba(0,0,0,.65)';g.shadowBlur=14;g.shadowOffsetY=5;g.beginPath();g.roundRect(x,y,w,h,12);const cg=g.createLinearGradient(x,y,x+w,y);cg.addColorStop(0,'rgba(18,19,19,.99)');cg.addColorStop(.55,'rgba(7,8,9,.99)');cg.addColorStop(1,'rgba(16,13,8,.99)');g.fillStyle=cg;g.fill();g.restore();
   g.beginPath();g.roundRect(x+.8,y+.8,w-1.6,h-1.6,11);g.strokeStyle='rgba(228,187,104,.82)';g.lineWidth=1.5;g.stroke();
   sans('SÉANCE LIBRE · CARDIO',x+20,y+24,13,gold,850);
   const themes=cardioItems.map(t=>String(t.quality||'Cardio').replace(/^\S+\s*/, '')).join(' · ');
   fit(themes.toUpperCase(),x+20,y+54,w-210,20,white,850,'left',false);
   sans(`${cardioFrequency} SÉANCE${cardioFrequency>1?'S':''} / SEMAINE`,x+w-20,y+54,13,gold2,850,'right');
 }
 // Signature ForgeLab très basse pour préserver la lisibilité des journées.
 const footer=assets['footer-mountains-man-v1218.png'];if(footer){g.save();g.globalAlpha=.66;const fw=W,fh=150,sy=Math.max(0,footer.height-footer.width*(fh/fw));g.drawImage(footer,0,sy,footer.width,footer.height-sy,0,H-footerH,fw,footerH);g.restore()}
 const fade=g.createLinearGradient(0,H-footerH-30,0,H);fade.addColorStop(0,'rgba(3,4,5,0)');fade.addColorStop(.45,'rgba(3,4,5,.45)');fade.addColorStop(1,'rgba(3,4,5,.90)');g.fillStyle=fade;g.fillRect(0,H-footerH-30,W,footerH+30);
 g.strokeStyle='rgba(228,187,104,.72)';g.beginPath();g.moveTo(285,H-39);g.lineTo(410,H-39);g.moveTo(670,H-39);g.lineTo(795,H-39);g.stroke();txt('DAILY WINS.',W/2,H-39,18,gold2,900,'center');
 const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png',1));if(!blob){alert('Impossible de générer l’image sur cet appareil.');return}const safe=String(blockName||'bloc').replace(/[^a-z0-9]+/gi,'_'),file=new File([blob],`ForgeLab_${safe}.png`,{type:'image/png'});try{if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:`ForgeLab · ${blockName}`});return}}catch(err){if(err&&err.name==='AbortError')return}const url=URL.createObjectURL(blob),w=window.open(url,'_blank');if(w){setTimeout(()=>URL.revokeObjectURL(url),120000);return}const a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
function flPdfDate(d){if(!(d instanceof Date)||isNaN(d))return'—';const p=n=>String(n).padStart(2,'0');return `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()}`}
function flActiveProgram(){try{return JSON.parse(localStorage.getItem(`forgelabFullProgram:${currentUser?.id||'guest'}:active`)||'null')}catch(_){return null}}
function flBlockPeriod(block,fp=flActiveProgram()){
  if(!block)return null;
  const from=Math.max(1,+block.from||1),to=Math.max(from,+block.to||from);
  // Programmes récents : la date de S1 reste la référence normale.
  if(fp?.startDate&&/^\d{4}-\d{2}-\d{2}$/.test(fp.startDate)){
    const [y,m,d]=fp.startDate.split('-').map(Number),start=new Date(y,m-1,d,12);start.setDate(start.getDate()+(from-1)*7);
    const end=new Date(y,m-1,d,12);end.setDate(end.getDate()+to*7-1);
    return {start,end,from,to,label:`${flPdfDate(start)} – ${flPdfDate(end)}`};
  }
  // Compatibilité exceptionnelle pour l'ancien programme actif : date propre au bloc, utilisée uniquement pour son bilan.
  if(block.exportStartDate&&/^\d{4}-\d{2}-\d{2}$/.test(block.exportStartDate)){
    const [y,m,d]=block.exportStartDate.split('-').map(Number),start=new Date(y,m-1,d,12),end=new Date(y,m-1,d,12);
    end.setDate(end.getDate()+((to-from+1)*7)-1);
    return {start,end,from,to,label:`${flPdfDate(start)} – ${flPdfDate(end)}`,legacyOverride:true};
  }
  return null;
}
function flActiveBlockNotes(blockId){return localStorage.getItem(`forgelabBlockNotes:${currentUser?.id||'guest'}:active:${blockId}`)||''}
function exportBlockPdf(blockId){
  const fp=flActiveProgram();if(!fp){alert('Aucun programme actif.');return}
  const block=fp.blocks?.find(b=>b.id===blockId)||fp.blocks?.find(b=>!b.deload);if(!block){alert('Bloc introuvable.');return}
  const period=flBlockPeriod(block,fp);if(!period){alert('Renseigne la date de début de ce bloc dans le pavé d’export exceptionnel.');return}
  const muscleNames=new Map((state.priorities||[]).map(x=>[x.muscle_key,x.muscle_name||x.muscle_key]));
  const rows=(state.series||[]).filter(r=>+r.week>=period.from&&+r.week<=period.to&&(+r.series||0)>0);
  const performed={};rows.forEach(r=>{const name=r.muscle_name||muscleNames.get(r.muscle_key)||r.muscle_key||'Groupe';performed[name]=(performed[name]||0)+(+r.series||0)});
  const muscleTotal=Object.values(performed).reduce((a,n)=>a+n,0),muscleSessions=new Set(rows.map(r=>`${r.week}:${r.day}`).filter(Boolean)).size;
  const cardio=cardioData(),cardioWeekCount=Object.entries(cardio.weeks||{}).filter(([wk])=>+wk>=period.from&&+wk<=period.to).reduce((sum,[,mods])=>sum+Object.values(mods||{}).reduce((a,days)=>a+Object.values(days||{}).reduce((x,n)=>x+(+n||0),0),0),0);
  const ymd=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const cardioSessions=(cardio.sessions||[]).filter(x=>x&&!x.benchmark&&x.date&&x.date>=ymd(period.start)&&x.date<=ymd(period.end));
  const cardioCount=Math.max(cardioWeekCount,cardioSessions.length),notes=flActiveBlockNotes(block.id);
  const cardioRows=cardioSessions.map(x=>`<tr><td>${esc(jDate(x.date))}</td><td>${esc(String(x.quality||'Cardio').replace(/^\S+\s*/,''))}</td><td>${esc(x.engine||'—')}</td><td>${x.duration?x.duration+' min':'—'}</td><td>${x.pace?esc(x.pace)+'/km':'—'}</td><td>${x.avgHr?x.avgHr+' bpm':'—'}</td><td>${x.rpe?'RPE '+x.rpe:'—'}</td></tr>`).join('');
  const muscleRows=Object.entries(performed).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<tr><td>${esc(k)}</td><td class="num">${v}</td></tr>`).join('');
  const html=`<!doctype html><html><head><meta charset="utf-8"><title>ForgeLab · Bilan ${esc(block.name||'Bloc')}</title><style>
  @page{size:A4;margin:13mm}*{box-sizing:border-box}body{margin:0;background:#0a0b0c;color:#eee;font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}.sheet{min-height:270mm;border:1px solid #9d7a39;background:linear-gradient(145deg,#151719,#08090a 55%,#17130c);padding:24px}.brand{text-align:center;border-bottom:1px solid #6f582d;padding-bottom:18px}.brand .mark{font-size:28px;color:#d9b86d;letter-spacing:5px;font-weight:900}.brand .motto{font-size:9px;color:#9e947f;letter-spacing:2px;margin-top:5px}.title{margin:22px 0 4px;font-size:27px;color:#e4c47b;text-transform:uppercase}.sub{color:#bbb;font-size:12px}.period{display:inline-block;margin-top:10px;padding:7px 12px;border:1px solid #806632;color:#e7cf94;font-weight:700}.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px 0}.kpi{border:1px solid #4c412c;background:#101214;padding:13px}.kpi b{display:block;font-size:24px;color:#e4c47b}.kpi span{font-size:9px;color:#aaa;text-transform:uppercase;letter-spacing:1px}h2{font-size:13px;letter-spacing:1.8px;color:#d9b86d;border-bottom:1px solid #4d412b;padding-bottom:7px;margin:22px 0 9px;text-transform:uppercase}table{width:100%;border-collapse:collapse;font-size:11px}th{color:#9f9277;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.8px}td,th{padding:7px 6px;border-bottom:1px solid #292a29}.num{text-align:right;color:#e4c47b;font-weight:800}.notes{white-space:pre-wrap;border-left:3px solid #b18b43;background:#111315;padding:12px;font-size:11px;line-height:1.45;color:#d8d8d8}.empty{color:#777;font-style:italic;padding:8px 0}.footer{text-align:center;color:#b8944d;font-size:10px;letter-spacing:3px;margin-top:24px}@media print{body{background:#0a0b0c}.sheet{min-height:auto}}
  </style></head><body><main class="sheet"><header class="brand"><div class="mark">FORGELAB</div><div class="motto">DISCIPLINA · CONSTANTIA · PROGRESSUS</div><div class="title">Bilan · ${esc(block.name||'Bloc')}</div><div class="sub">${esc(fp.name||'Programme ForgeLab')} · S${period.from}${period.to!==period.from?' à S'+period.to:''}</div><div class="period">${period.label}</div></header>
  <section class="kpis"><div class="kpi"><b>${muscleTotal}</b><span>Séries renseignées</span></div><div class="kpi"><b>${muscleSessions}</b><span>Séances musculation</span></div><div class="kpi"><b>${cardioCount}</b><span>Séances cardio</span></div></section>
  <h2>Musculation · réalisé sur la période</h2>${muscleRows?`<table><thead><tr><th>Groupe musculaire</th><th style="text-align:right">Séries renseignées</th></tr></thead><tbody>${muscleRows}</tbody></table>`:'<div class="empty">Aucune série renseignée sur cette période.</div>'}
  <h2>Cardio · réalisé sur la période</h2>${cardioRows?`<table><thead><tr><th>Date</th><th>Thème</th><th>Modalité</th><th>Durée</th><th>Allure</th><th>FC moy.</th><th>RPE</th></tr></thead><tbody>${cardioRows}</tbody></table>`:`<div class="empty">${cardioCount?cardioCount+' séance'+(cardioCount>1?'s':'')+' cardio renseignée'+(cardioCount>1?'s':'')+' dans Suivi sur ce bloc.':'Aucune séance cardio renseignée sur cette période.'}</div>`}
  ${notes?`<h2>Notes du bloc</h2><div class="notes">${esc(notes)}</div>`:''}<div class="footer">DAILY WINS.</div></main><script>window.onload=()=>window.print()<\/script></body></html>`;
  const w=window.open('','_blank');if(!w){alert('Autorise les fenêtres pop-up pour exporter le PDF.');return}w.document.write(html);w.document.close();
}
function exportProgramPdf(){const fp=flActiveProgram(),b=selectedFullBlock();if(fp&&b)return exportBlockPdf(b.id);alert('Aucun bloc actif à exporter.');}

function drawProgramming(){
  ensureDraftProgramCardio();
  const v=document.querySelector('#view'),p=programmingData(),totals=programTotals(p),presets=programmingPresets(),pc=programCardioData();
  const allSets=DAYS.reduce((a,d)=>a+(p[d]||[]).reduce((s,x)=>s+Number(x.sets||0),0),0);
  const daysUsed=DAYS.filter(d=>(p[d]||[]).some(x=>Number(x.sets||0)>0)).length;
  const rows=DAYS.map(day=>{
    const entries=p[day]||[],totalSets=entries.reduce((s,x)=>s+Number(x.sets||0),0),minutes=programDayMinutes(entries),durationClass=minutes>60?'over':minutes>50?'near':'';
    const items=entries.length?entries.map(x=>{
      const pr=programPriority(x.muscle_key),[mi,ma]=programRange(x.muscle_key),programmed=totals[x.muscle_key]?.sets||0,[label,klass]=programStatus(programmed,mi,ma);
      return `<div class="mobile-program-entry" data-id="${esc(x.id)}" data-muscle-name="${esc(x.muscle_name)}">
        <button type="button" class="mobile-program-drag" aria-label="Réordonner ${esc(x.muscle_name)}">⠿</button>
        <span class="mobile-program-badge ${pr.toLowerCase()}">${pr}</span>
        <div class="mobile-program-muscle"><strong>${esc(x.muscle_name)}</strong><small class="${klass}">${label}</small></div>
        <input class="mobile-program-sets" type="text" inputmode="numeric" pattern="[0-9]*" value="${Number(x.sets||0)}" data-program-sets aria-label="Séries ${esc(x.muscle_name)}">
        <button type="button" class="mobile-program-remove" data-program-remove aria-label="Retirer ${esc(x.muscle_name)}">×</button>
        <div class="program-exercises" data-program-exercises ${programOpenExerciseId()===x.id?'':'hidden'}>
          ${(()=>{const ex=x.exercises||[],used=ex.reduce((a,e)=>a+Number(e.sets||0),0),diff=Number(x.sets||0)-used,cl=diff===0?'ok':diff>0?'warn':'over';return `<div class="program-exercise-status ${cl}"><b>${used}/${Number(x.sets||0)} séries attribuées</b><span>${diff===0?'Complet':diff>0?diff+' à programmer':Math.abs(diff)+' en trop'}</span></div>${ex.length?`<div class="program-exercise-list">${ex.map(e=>`<article class="program-exercise-card" data-exercise-id="${esc(e.id)}"><div class="program-exercise-card-head"><strong title="${esc(e.name)}">${esc(e.name)}</strong><button type="button" data-ex-remove aria-label="Supprimer ${esc(e.name)}">×</button></div><div class="program-exercise-card-fields"><label><span>Séries</span><input data-ex-sets type="number" min="1" max="20" value="${Number(e.sets||1)}" aria-label="Séries"></label><label><span>Repos</span><select data-ex-rest aria-label="Repos">${[30,45,60,75,90,120,150,180,240].map(r=>`<option value="${r}" ${Number(e.rest||90)===r?'selected':''}>${r+' s'}</option>`).join('')}</select></label></div><input data-ex-name type="hidden" value="${esc(e.name)}"></article>`).join('')}</div>`:'<div class="program-exercise-empty">Aucun exercice programmé pour ce groupe.</div>'}<div class="program-exercise-add-shell"><button type="button" class="program-exercise-plus" data-ex-add-trigger aria-label="Ajouter un exercice">＋</button><div class="program-exercise-add" data-ex-add-panel hidden><label class="program-exercise-picker"><span>Exercice</span><select data-ex-new-name aria-label="Exercice"><option value="">Choisir dans la bibliothèque…</option>${exerciseOptionsFor(x.muscle_name).map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('')}<option value="__custom__">＋ Nouvel exercice…</option></select></label><input data-ex-custom-name placeholder="Nom du nouvel exercice" hidden><div class="program-exercise-add-fields"><label><span>Séries</span><input data-ex-new-sets type="number" min="1" max="20" value="1" aria-label="Séries"></label><label><span>Repos</span><select data-ex-new-rest>${[60,90,120,150,180].map(r=>`<option value="${r}" ${r===90?'selected':''}>${r} s</option>`).join('')}</select></label></div><button type="button" data-ex-add>Ajouter</button></div></div>`})()}
        </div>
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
      <div class="program-cardio-day" data-program-cardio-day="${day}"><div class="program-cardio-head"><strong>♥ CARDIO</strong><button type="button" data-program-cardio-add>＋</button></div>${(pc[day]||[]).map(c=>`<div class="program-cardio-entry" data-cardio-id="${esc(c.id)}"><select data-cardio-quality>${CARDIO_QUALITIES.map(x=>`<option ${x===c.quality?'selected':''}>${esc(x)}</option>`).join('')}</select><select data-cardio-engine>${CARDIO_ENGINES.map(x=>`<option ${x===c.engine?'selected':''}>${esc(x)}</option>`).join('')}</select><select data-cardio-format>${CARDIO_FORMATS.map(x=>`<option ${x===c.format?'selected':''}>${esc(x)}</option>`).join('')}</select><label><input data-cardio-duration type="number" min="0" max="300" value="${Number(c.duration||0)}"><span>min</span></label><button type="button" data-program-cardio-remove>×</button></div>`).join('')||'<small class="program-cardio-empty">Aucune séance cardio programmée.</small>'}</div>
    </article>`;
  }).join('');
  const summary=activePriorities().map(m=>{const t=totals[m.muscle_key]||{sets:0,freq:0},mi=+m.target_min||0,ma=+m.target_max||0,[label,klass]=programStatus(t.sets,mi,ma);return `<div class="program-summary-row"><div><strong>${esc(m.muscle_name)}</strong><span>${m.priority} · cible ${mi}–${ma}</span></div><b>${t.sets}</b><em class="${klass}">${label}</em><i>${t.freq}×</i></div>`}).join('');
  const mode=programmingMode(),hasDraft=hasProgrammingDraft(),meta=programmingMeta(mode),phases=ensurePhaseProgramming(meta,mode),selectedPhase=selectedPhaseId(meta,mode);
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
      <div class="program-phase-strip">${phases.map(q=>`<span data-program-phase="${phaseId(q)}" class="${q.deload?'deload ':''}${phaseId(q)===selectedPhase?'selected':''}">${q.label}<b>S${q.from}${q.to!==q.from?'–S'+q.to:''}</b></span>`).join('')}</div><div class="program-phase-toolbar"><small>Chaque phase possède maintenant sa propre programmation.</small>${phases.findIndex(q=>phaseId(q)===selectedPhase)>0?'<button type="button" class="secondary" data-copy-prev-phase>Copier la phase précédente</button>':''}</div>
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
  v.querySelectorAll('[data-program-phase]').forEach(el=>el.addEventListener('click',()=>setSelectedPhase(el.dataset.programPhase)));
  v.querySelector('[data-copy-prev-phase]')?.addEventListener('click',copyPreviousPhase);

  v.querySelectorAll('[data-program-cardio-day]').forEach(box=>{const day=box.dataset.programCardioDay;box.querySelector('[data-program-cardio-add]')?.addEventListener('click',()=>{const d=programCardioData();d[day].push({id:cardioModalityId(),quality:CARDIO_QUALITIES[0],engine:CARDIO_ENGINES[0],format:CARDIO_FORMATS[0],duration:40});saveProgramCardio(d)});box.querySelectorAll('[data-cardio-id]').forEach(row=>{const id=row.dataset.cardioId,save=()=>{const d=programCardioData(),c=d[day].find(x=>x.id===id);if(!c)return;c.quality=row.querySelector('[data-cardio-quality]').value;c.engine=row.querySelector('[data-cardio-engine]').value;c.format=row.querySelector('[data-cardio-format]').value;c.duration=Math.max(0,Number(row.querySelector('[data-cardio-duration]').value||0));saveProgramCardio(d,false)};row.querySelectorAll('select,input').forEach(el=>el.addEventListener('change',save));row.querySelector('[data-program-cardio-remove]').onclick=()=>{const d=programCardioData();d[day]=d[day].filter(x=>x.id!==id);saveProgramCardio(d)}})});

  v.querySelectorAll('.mobile-program-day').forEach(card=>{
    const day=card.dataset.programDay,list=card.querySelector('.mobile-program-list');
    card.querySelectorAll('.mobile-program-entry').forEach(row=>{
      const id=row.dataset.id,input=row.querySelector('[data-program-sets]');
      row.querySelector('.mobile-program-muscle')?.addEventListener('click',()=>{const box=row.querySelector('[data-program-exercises]');const opening=box.hidden;box.hidden=!opening;setProgramOpenExerciseId(opening?id:'')});
      const mutateExercises=(fn,redraw=true)=>{const d=programmingData(),item=d[day].find(z=>z.id===id);if(!item)return;item.exercises=Array.isArray(item.exercises)?item.exercises:[];fn(item.exercises);saveProgramming(d,redraw)};
      row.querySelectorAll('[data-exercise-id]').forEach(er=>{const eid=er.dataset.exerciseId;const saveEx=()=>mutateExercises(ex=>{const e=ex.find(a=>a.id===eid);if(e){e.name=er.querySelector('[data-ex-name]').value.trim();e.sets=Math.max(1,+er.querySelector('[data-ex-sets]').value||1);e.rest=Math.max(15,+er.querySelector('[data-ex-rest]').value||90)}});er.querySelector('[data-ex-name]').addEventListener('change',saveEx);er.querySelector('[data-ex-sets]').addEventListener('change',saveEx);er.querySelector('[data-ex-rest]').addEventListener('change',saveEx);er.querySelector('[data-ex-remove]').addEventListener('click',()=>mutateExercises(ex=>{const i=ex.findIndex(a=>a.id===eid);if(i>=0)ex.splice(i,1)}))});
      const addTrigger=row.querySelector('[data-ex-add-trigger]'),addPanel=row.querySelector('[data-ex-add-panel]');addTrigger?.addEventListener('click',()=>{if(addPanel){addPanel.hidden=!addPanel.hidden;addTrigger.classList.toggle('open',!addPanel.hidden);if(!addPanel.hidden)setTimeout(()=>row.querySelector('[data-ex-new-name]')?.focus(),0)}});const exPicker=row.querySelector('[data-ex-new-name]'),customName=row.querySelector('[data-ex-custom-name]');exPicker?.addEventListener('change',()=>{if(customName)customName.hidden=exPicker.value!=='__custom__'});row.querySelector('[data-ex-add]')?.addEventListener('click',()=>{let name=(exPicker?.value||'').trim();if(name==='__custom__')name=(customName?.value||'').trim();if(!name)return;const sets=Math.max(1,+row.querySelector('[data-ex-new-sets]').value||1),rest=Math.max(15,+row.querySelector('[data-ex-new-rest]').value||90);if(exPicker?.value==='__custom__')rememberExercise(row.dataset.muscleName||'',name);setProgramOpenExerciseId(id);mutateExercises(ex=>ex.push({id:newProgramId(),name,sets,rest}))});
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
  const fp=flActiveProgram();let start;
  if(fp?.startDate&&/^\d{4}-\d{2}-\d{2}$/.test(fp.startDate)){const [y,m,d]=fp.startDate.split('-').map(Number);start=new Date(y,m-1,d,12)}
  else start=new Date(2026,7,31,12,0,0,0);
  start.setDate(start.getDate()+(Math.max(1,+state.week||1)-1)*7);
  const end=new Date(start);end.setDate(start.getDate()+6);
  return `${flPdfDate(start)} – ${flPdfDate(end)}`;
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
    <div class="story-forgelab-brand"><img src="auth-laurel-realistic-v1218.png" alt=""><strong>ForgeLab</strong></div>
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
  if(state.tab==='programming') programmingScreen='chooser';
  if(state.tab==='priorities') prioritiesScreen='chooser';
  if(state.tab==='journal'&&!journalDraft)await syncJournalCloud();
  await load(false);
  draw();
});
document.querySelector('#prevWeek').onclick=()=>setWeek(state.week-1);
document.querySelector('#nextWeek').onclick=()=>setWeek(state.week+1);


// v1.21.8 : aucun nettoyage automatique de Séries.
 // Une mise à jour de ForgeLab ne doit jamais supprimer des données utilisateur.

async function boot(){
  importPcProgrammingV169();
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

/* v1.21.8 — splash d'ouverture */
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


/* ===== ForgeLab v1.17.0 — Programme complet / multi-blocs ===== */
function fullProgramKey(){return `forgelabFullProgram:${currentUser?.id||'guest'}${programmingMode()==='draft'?':draft:'+(selectedDraftId()||'default'):':active'}`}
function fullProgram(){
  try{const x=JSON.parse(localStorage.getItem(fullProgramKey())||'null');if(x&&Array.isArray(x.blocks)&&x.blocks.length)return x}catch(_){}
  const x={name:'Programme ForgeLab',selected:'bloc-1',blocks:[{id:'bloc-1',name:programmingMeta('draft').name||programmingMeta('active').name||'Bloc 1'}]};
  localStorage.setItem(fullProgramKey(),JSON.stringify(x));return x
}
function saveFullProgram(x){localStorage.setItem(fullProgramKey(),JSON.stringify(x))}
function selectedFullBlock(){const x=fullProgram();return x.blocks.find(b=>b.id===x.selected)||x.blocks[0]}
function blockPrefix(id=selectedFullBlock().id){return `forgelabProgramBlock:${currentUser?.id||'guest'}${programmingMode()==='draft'?':draft:'+(selectedDraftId()||'default'):':active'}:${id}`}
function blockSnapshot(id=selectedFullBlock().id){
 const pre=blockPrefix(id),o={};
 for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(pre+':'))o[k.slice(pre.length+1)]=localStorage.getItem(k)}
 return o
}
function saveCurrentIntoBlock(id=selectedFullBlock().id){
 const pre=blockPrefix(id), mode=programmingMode();
 localStorage.setItem(pre+':mode',mode);
 ['active','draft'].forEach(m=>{
   const mk=programmingMetaKey(m); const mv=localStorage.getItem(mk); if(mv)localStorage.setItem(pre+':meta:'+m,mv);
   const meta=programmingMeta(m); phaseRanges(meta).forEach(q=>{const pid=phaseId(q),v=localStorage.getItem(phaseProgrammingKey(pid,m));if(v)localStorage.setItem(pre+':phase:'+m+':'+pid,v)})
 })
}
function loadBlockIntoCurrent(id){
 const pre=blockPrefix(id), mode=localStorage.getItem(pre+':mode')||'draft';
 localStorage.setItem(programmingModeKey(),mode);
 ['active','draft'].forEach(m=>{
   const mv=localStorage.getItem(pre+':meta:'+m); if(mv)localStorage.setItem(programmingMetaKey(m),mv);
   const meta=mv?JSON.parse(mv):programmingMeta(m);
   phaseRanges(meta).forEach(q=>{const pid=phaseId(q),v=localStorage.getItem(pre+':phase:'+m+':'+pid);if(v)localStorage.setItem(phaseProgrammingKey(pid,m),v)})
 })
}
function selectFullBlock(id){const x=fullProgram();saveCurrentIntoBlock(x.selected);x.selected=id;saveFullProgram(x);loadBlockIntoCurrent(id);drawProgramming()}
function addFullBlock(){
 const x=fullProgram();saveCurrentIntoBlock(x.selected);const n=x.blocks.length+1,id='bloc-'+Date.now();
 const name=(prompt('Nom du nouveau bloc :',`Bloc ${roman(n)}`)||'').trim();if(!name)return;
 x.blocks.push({id,name});x.selected=id;saveFullProgram(x);
 localStorage.setItem(blockPrefix(id)+':mode','draft');
 localStorage.setItem(blockPrefix(id)+':meta:draft',JSON.stringify({name,duration:4,rhythm:4}));
 localStorage.setItem(programmingModeKey(),'draft');saveProgrammingMeta({name,duration:4,rhythm:4},'draft');
 const ph=phaseRanges({name,duration:4,rhythm:4});localStorage.setItem(phaseProgrammingKey(phaseId(ph[0]),'draft'),JSON.stringify(blankProgramming()));
 saveCurrentIntoBlock(id);drawProgramming()
}
function renameFullBlock(){const x=fullProgram(),b=x.blocks.find(z=>z.id===x.selected);if(!b)return;const n=(prompt('Nom du bloc :',b.name)||'').trim();if(!n)return;b.name=n;saveFullProgram(x);const m=programmingMeta();m.name=n;saveProgrammingMeta(m);saveCurrentIntoBlock(b.id);drawProgramming()}
function deleteFullBlock(){const x=fullProgram();if(x.blocks.length<=1)return alert('Le programme doit contenir au moins un bloc.');const b=x.blocks.find(z=>z.id===x.selected);if(!confirm(`Supprimer ${b?.name||'ce bloc'} ?`))return;x.blocks=x.blocks.filter(z=>z.id!==x.selected);x.selected=x.blocks[0].id;saveFullProgram(x);loadBlockIntoCurrent(x.selected);drawProgramming()}
function blockReadableData(id){
 const pre=blockPrefix(id), mode=localStorage.getItem(pre+':mode')||'draft', ms=localStorage.getItem(pre+':meta:'+mode);const meta=ms?JSON.parse(ms):{name:'Bloc',duration:4,rhythm:4};
 const phases=phaseRanges(meta).map(q=>{const pid=phaseId(q),raw=localStorage.getItem(pre+':phase:'+mode+':'+pid);let data=blankProgramming();try{if(raw)data=JSON.parse(raw)}catch(_){}return {q,data}});return {meta,phases}
}
async function generateCompleteProgram(){
 saveCurrentIntoBlock();const fp=fullProgram();
 const blocks=fp.blocks.map((b,i)=>({b,i,...blockReadableData(b.id)}));
 const W=1600, headerH=220, blockH=420, gap=28, H=headerH+blocks.length*(blockH+gap)+80;
 const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.scale(2,2);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#070604');bg.addColorStop(1,'#11100b');g.fillStyle=bg;g.fillRect(0,0,W,H);
 const gold='#e2bd70',white='#f7f1e6',muted='#bdb39f';
 const txt=(t,x,y,size,color=white,weight=700,align='left')=>{g.fillStyle=color;g.font=`${weight} ${size}px Arial`;g.textAlign=align;g.textBaseline='middle';g.fillText(String(t),x,y)};
 const fit=(t,x,y,max,size,color=white,weight=800,align='left')=>{let z=size;do{g.font=`${weight} ${z}px Arial`;if(g.measureText(String(t)).width<=max)break;z--}while(z>14);txt(t,x,y,z,color,weight,align)};
 fit((fp.name||'PROGRAMME FORGELAB').toUpperCase(),W/2,72,W-180,44,gold,900,'center');txt(`PROGRAMME COMPLET · ${blocks.length} BLOC${blocks.length>1?'S':''}`,W/2,128,18,muted,700,'center');g.strokeStyle='rgba(226,189,112,.55)';g.beginPath();g.moveTo(120,166);g.lineTo(W-120,166);g.stroke();
 blocks.forEach(({b,i,meta,phases})=>{const y=headerH+i*(blockH+gap);g.fillStyle='rgba(15,14,10,.98)';g.fillRect(55,y,W-110,blockH);g.strokeStyle='rgba(226,189,112,.55)';g.lineWidth=2;g.strokeRect(55,y,W-110,blockH);txt(`BLOC ${roman(i+1)}`,88,y+42,15,gold,900);fit((b.name||meta.name||`Cycle ${i+1}`).toUpperCase(),88,y+82,W-240,30,white,900);txt(`${meta.duration} semaines · trame ${meta.rhythm} + deload`,88,y+118,14,muted,600);
   let yy=y+160;phases.forEach(({q,data})=>{txt(`${q.label} · S${q.from}${q.to!==q.from?'–S'+q.to:''}`,88,yy,15,q.deload?muted:gold,800);yy+=28;const days=DAYS.filter(d=>(data[d]||[]).some(z=>+z.sets>0));const summary=days.map(d=>`${d}: ${(data[d]||[]).filter(z=>+z.sets>0).map(z=>`${z.muscle_name} ${z.sets}`).join(' · ')}`).join('   |   ');fit(summary||'Repos / récupération',88,yy,W-180,13,white,600);yy+=45;});
 });
 txt('DAILY WINS.',W/2,H-35,18,gold,900,'center');
 const blob=await new Promise(r=>c.toBlob(r,'image/png',1));if(!blob)return alert('Impossible de générer le programme complet.');const safe=String(fp.name||'programme_complet').replace(/[^a-z0-9]+/gi,'_'),file=new File([blob],`ForgeLab_${safe}_COMPLET.png`,{type:'image/png'});try{if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:`ForgeLab · ${fp.name||'Programme complet'}`});return}}catch(e){if(e?.name==='AbortError')return}const u=URL.createObjectURL(blob),w=window.open(u,'_blank');if(!w){const a=document.createElement('a');a.href=u;a.download=file.name;a.click()}setTimeout(()=>URL.revokeObjectURL(u),120000)
}

let programmingScreen='chooser';
const _drawProgrammingV1162=drawProgramming;
function drawProgrammingChooser(){
 const v=document.querySelector('#view');if(!v)return;ensureLegacyProgrammingDraftRegistered();const active=programmingMeta('active'),drafts=draftRegistry();
 v.innerHTML=title('Programmation')+`<section class="program-choice-screen">
   <div class="program-choice-intro"><small>ESPACE PROGRAMMATION</small><strong>Quel programme veux-tu ouvrir ?</strong><span>Programme actif ou l’un de tes programmes en préparation.</span></div>
   <button type="button" class="program-choice-card active" data-program-choice="active"><span class="program-choice-icon">I</span><div><small>PROGRAMME ACTIF</small><strong>${esc(state.blockName||active.name||'Programme actif')}</strong><span>${state.blockDuration||active.duration} semaine${Number(state.blockDuration||active.duration)>1?'s':''} · ${nutritionLabel()}</span></div><b>›</b></button>
   <div class="program-draft-list">${drafts.map((d,i)=>`<div class="draft-choice-row"><button type="button" class="program-choice-card draft" data-program-draft-id="${esc(d.id)}"><span class="program-choice-icon">${roman(i+1)}</span><div><small>BROUILLON ${roman(i+1)}</small><strong>${esc(d.name||'Programme en préparation')}</strong><span>Programme indépendant · modifiable sans toucher à l’actif</span></div><b>›</b></button><button type="button" class="draft-delete-mini" data-program-draft-delete="${esc(d.id)}" aria-label="Supprimer ${esc(d.name||'ce brouillon')}">×</button></div>`).join('')}</div>
   <button type="button" class="program-new-draft" data-program-create-draft>＋ Nouveau brouillon</button>
   <div class="program-choice-foot"><i>DISCIPLINA · CONSTANTIA · PROGRESSUS</i></div>
 </section>`;
 v.querySelector('[data-program-choice="active"]').onclick=()=>{programBlockOpen=false;setSelectedDraftId('');programmingScreen='editor';setProgrammingMode('active')};
 v.querySelectorAll('[data-program-draft-id]').forEach(b=>b.onclick=()=>{programBlockOpen=false;setSelectedDraftId(b.dataset.programDraftId);programmingScreen='editor';setProgrammingMode('draft')});
 v.querySelectorAll('[data-program-draft-delete]').forEach(b=>b.onclick=e=>{e.stopPropagation();deleteProgrammingDraftById(b.dataset.programDraftDelete)});
 v.querySelector('[data-program-create-draft]').onclick=()=>createProgrammingDraft(true);
}
drawProgramming=function(){
 if(programmingScreen==='chooser'){drawProgrammingChooser();return}
 _drawProgrammingV1162();const v=document.querySelector('#view');if(!v)return;const fp=fullProgram(),sel=selectedFullBlock(); v.querySelectorAll('.program-status-card,.program-draft-actions').forEach(x=>x.remove());
 const back=document.createElement('button');back.type='button';back.className='program-back-choice';back.innerHTML='‹ <span>Programmation</span>';back.onclick=()=>{saveCurrentIntoBlock();if(programmingMode()==='draft'){const regs=draftRegistry(),r=regs.find(x=>x.id===selectedDraftId());if(r){r.name=fullProgram().name||r.name;saveDraftRegistry(regs)}}programmingScreen='chooser';drawProgramming()};
 const heading=v.querySelector('.section-title');if(heading)heading.insertAdjacentElement('afterend',back);else v.prepend(back);
 const host=document.createElement('section');host.className='full-program-manager';host.innerHTML=`<div class="full-program-head"><div><small>NOM DU PROGRAMME</small><strong>${esc(fp.name||'Programme ForgeLab')}</strong><input class="full-program-name" data-full-program-name value="${esc(fp.name||'Programme ForgeLab')}" aria-label="Nom du programme complet"></div><button data-full-add>+ Bloc</button></div><div class="full-block-tabs">${fp.blocks.map((b,i)=>`<button class="${b.id===fp.selected?'active':''}" data-full-block="${esc(b.id)}"><small>BLOC ${roman(i+1)}</small><b>${esc(b.name)}</b></button>`).join('')}</div><div class="full-program-actions"><button class="secondary" data-full-rename>Renommer le bloc</button><button class="secondary" data-full-delete>Supprimer</button><button data-full-current>Générer ce bloc</button><button class="gold" data-full-complete>Générer le programme complet</button></div>`;
 const anchor=v.querySelector('.program-mobile-steps')||v.firstChild;v.insertBefore(host,anchor);
 host.querySelector('[data-full-program-name]').addEventListener('change',e=>{const x=fullProgram();x.name=(e.target.value||'').trim()||'Programme ForgeLab';saveFullProgram(x);if(programmingMode()==='draft'){const regs=draftRegistry(),r=regs.find(z=>z.id===selectedDraftId());if(r){r.name=x.name;saveDraftRegistry(regs)}}drawProgramming()});host.querySelector('[data-full-add]').onclick=addFullBlock;host.querySelector('[data-full-rename]').onclick=renameFullBlock;host.querySelector('[data-full-delete]').onclick=deleteFullBlock;host.querySelector('[data-full-current]').onclick=()=>{saveCurrentIntoBlock();generateProgramImage()};host.querySelector('[data-full-complete]').onclick=generateCompleteProgram;host.querySelectorAll('[data-full-block]').forEach(x=>x.onclick=()=>selectFullBlock(x.dataset.fullBlock));
};

/* ===== ForgeLab v1.21.8 — Brouillon structuré : Programme > Trame > Blocs > Génération ===== */
let programBlockOpen=false;
function fl176TrameCount(fp){return Math.max(1,Number(fp?.trameBlocks||4))}
function fl176Schedule(totalDuration,blockLength){
  const length=Math.max(1,Number(blockLength)||4), total=Math.max(1,Number(totalDuration)||14);
  const out=[];let week=1,index=0;
  while(week<=total){
    const from=week,to=Math.min(total,week+length-1);
    out.push({kind:'block',index,from,to});
    week=to+1;
    if(week<=total){out.push({kind:'deload',index,from:week,to:week});week++;}
    index++;
  }
  return {total,items:out};
}
function fl176EnsureStructure(){
  const fp=fullProgram();
  if(!fp.totalDuration) fp.totalDuration=Math.max(1,Number(programmingMeta().duration||14));
  if(!fp.trameBlocks) fp.trameBlocks=Math.max(1,(fp.blocks||[]).filter(b=>!b.deload).length||3);
  const wanted=fl176TrameCount(fp), sched=fl176Schedule(fp.totalDuration,wanted);fp.totalDuration=sched.total;
  const old=Array.isArray(fp.blocks)?fp.blocks:[], oldBlocks=old.filter(x=>!x.deload), oldDeloads=old.filter(x=>x.deload||/^deload/i.test(x.name||'')), next=[];
  sched.items.forEach(item=>{
    if(item.kind==='block'){
      let b=oldBlocks[item.index];
      if(!b)b={id:'bloc-'+Date.now().toString(36)+'-'+item.index,name:`Bloc ${roman(item.index+1)}`};
      b.deload=false;b.blockIndex=item.index+1;b.from=item.from;b.to=item.to;if(!b.name)b.name=`Bloc ${roman(item.index+1)}`;next.push(b);
    }else{
      let d=oldDeloads[item.index];
      if(!d)d={id:'deload-'+Date.now().toString(36)+'-'+item.index,name:`Deload ${roman(item.index+1)}`,deload:true};
      d.deload=true;d.blockIndex=item.index+1;d.name=`Deload ${roman(item.index+1)}`;d.from=item.from;d.to=item.to;next.push(d);
    }
  });
  fp.blocks=next;if(!next.some(b=>b.id===fp.selected))fp.selected=next[0].id;saveFullProgram(fp);
  next.forEach(b=>{const pre=blockPrefix(b.id);if(!localStorage.getItem(pre+':meta:draft'))localStorage.setItem(pre+':meta:draft',JSON.stringify({name:b.name,duration:1,rhythm:6}));});
  return fp;
}
function fl176RangeLabel(b){return b.from===b.to?`S${b.from}`:`S${b.from} à S${b.to}`}
function fl176BlockComplete(id){
  if(id===selectedFullBlock()?.id)saveCurrentIntoBlock(id);
  const r=blockReadableData(id);return r.phases.some(({data})=>DAYS.some(d=>(data[d]||[]).some(x=>Number(x.sets||0)>0)));
}
function fl176SetTrame(n){
  const fp=fullProgram();saveCurrentIntoBlock(fp.selected);fp.trameBlocks=Math.max(1,Math.min(8,Number(n)||3));saveFullProgram(fp);fl176EnsureStructure();const x=fullProgram();x.selected=x.blocks[0].id;saveFullProgram(x);loadBlockIntoCurrent(x.selected);programBlockOpen=false;drawProgramming();
}
function fl176SelectBlock(id){
  const fp=fullProgram();if(fp.selected===id){programBlockOpen=!programBlockOpen;drawProgramming();return}
  saveCurrentIntoBlock(fp.selected);fp.selected=id;saveFullProgram(fp);loadBlockIntoCurrent(id);programBlockOpen=true;drawProgramming();
}
function fl176RenameSelected(value){const fp=fullProgram(),b=fp.blocks.find(x=>x.id===fp.selected);if(!b||b.deload)return;b.name=(value||'').trim()||b.name;saveFullProgram(fp);saveProgrammingMeta({name:b.name,duration:1,rhythm:6},programmingMode());saveCurrentIntoBlock(b.id)}
function fl176GenerateBlock(id){const fp=fullProgram();if(fp.selected!==id){saveCurrentIntoBlock(fp.selected);fp.selected=id;saveFullProgram(fp);loadBlockIntoCurrent(id)}generateProgramImage()}
function activateFullProgrammingDraft(){
  if(programmingMode()!=='draft'||!selectedDraftId())return;
  saveCurrentIntoBlock();
  const draftId=selectedDraftId(),uidKey=currentUser?.id||'guest',fp=fullProgram();
  const now=new Date();
  const startDate=String(fp.startDate||'').trim();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(startDate)){alert('Renseigne d’abord la date de début du programme dans « Structure du programme ». Cette date correspond au premier jour de S1.');return}
  if(!confirm(`Rendre « ${fp.name||'ce brouillon'} » actif ?\n\nS1 débutera le ${startDate.split('-').reverse().join('/')}. Le programme actif actuel sera remplacé. Ton brouillon et tes paramètres existants sont conservés.`))return;
  // Replace the complete active-program namespace with the selected draft.
  const activeFullKey=`forgelabFullProgram:${uidKey}:active`;
  const activeBlockPrefix=`forgelabProgramBlock:${uidKey}:active:`;
  for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&(k===activeFullKey||k.startsWith(activeBlockPrefix)))localStorage.removeItem(k)}
  const activeFp=structuredClone(fp);activeFp.startDate=startDate;activeFp.selected=activeFp.blocks[0]?.id||fp.selected;localStorage.setItem(activeFullKey,JSON.stringify(activeFp));
  fp.blocks.forEach(b=>{
    const src=`forgelabProgramBlock:${uidKey}:draft:${draftId}:${b.id}`;
    const dst=`forgelabProgramBlock:${uidKey}:active:${b.id}`;
    const entries=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(src+':'))entries.push([k,localStorage.getItem(k)])}
    entries.forEach(([k,val])=>{let suffix=k.slice(src.length);suffix=suffix.replace(/:mode$/,':mode').replace(/:meta:draft/g,':meta:active').replace(/:phase:draft:/g,':phase:active:');if(suffix===':mode')val='active';localStorage.setItem(dst+suffix,val)});
    // Canonicalise explicitement le contenu du brouillon vers le bloc actif.
    const draftMeta=localStorage.getItem(src+':meta:draft');if(draftMeta)localStorage.setItem(dst+':meta:active',draftMeta);
    if(draftMeta){try{const dm=JSON.parse(draftMeta);phaseRanges(dm).forEach(q=>{const pid=phaseId(q),raw=localStorage.getItem(src+':phase:draft:'+pid);if(raw)localStorage.setItem(dst+':phase:active:'+pid,raw)})}catch(_){}}
    localStorage.setItem(dst+':mode','active');
  });
  // v1.21.8 : conserver aussi les notes et la trame cardio propres à chaque bloc lors de l'activation.
  fp.blocks.forEach(b=>{
    const draftScope=`${uidKey}:draft:${draftId}:${b.id}`,activeScope=`${uidKey}:active:${b.id}`;
    const notes=localStorage.getItem(`forgelabBlockNotes:${draftScope}`);if(notes!==null)localStorage.setItem(`forgelabBlockNotes:${activeScope}`,notes);
    const tpl=localStorage.getItem(`forgelabCardioTemplate:${draftScope}`);if(tpl!==null)localStorage.setItem(`forgelabCardioTemplate:${activeScope}`,tpl);
  });
  // Load the first block into the active working area so the active screen immediately reflects the new program.
  const first=activeFp.blocks[0];if(first){const src=`forgelabProgramBlock:${uidKey}:active:${first.id}`,metaRaw=localStorage.getItem(src+':meta:active');if(metaRaw){localStorage.setItem(`forgelabMobileProgrammingMeta:${uidKey}:active`,metaRaw);try{const meta=JSON.parse(metaRaw);phaseRanges(meta).forEach(q=>{const pid=phaseId(q),raw=localStorage.getItem(src+':phase:active:'+pid);if(raw)localStorage.setItem(`${programmingKey()}:phase:${pid}`,raw)})}catch(_){}}}
  // Le planning cardio du brouillon est copié séparément, sans effacer le brouillon source.
  const draftCardio=localStorage.getItem(`forgelabProgrammingCardio:${uidKey}:draft:${draftId}`);if(draftCardio)localStorage.setItem(`forgelabProgrammingCardio:${uidKey}:active`,draftCardio);
  state.blockName=fp.name||state.blockName;state.blockDuration=Number(fp.totalDuration||state.blockDuration||14);
  const [sy,sm,sd]=startDate.split('-').map(Number),start=new Date(sy,sm-1,sd,12),diff=Math.floor((new Date(now.getFullYear(),now.getMonth(),now.getDate(),12)-start)/604800000);state.week=Math.max(1,Math.min(state.blockDuration,diff+1));state.userWeek=state.week;
  req(`/forgelab_state?id=eq.main&user_id=eq.${encodeURIComponent(uid())}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({active_week:state.week,updated_at:new Date().toISOString()})}).catch(()=>{});
  localStorage.setItem(programmingModeKey(),'active');setSelectedDraftId('');programBlockOpen=false;programmingScreen='editor';drawProgramming();
}
const _drawProgrammingV1175=drawProgramming;
function fl184ProgrammingWeeks(duration){
  const d=document.querySelector('#weekDots');if(!d)return;
  const count=Math.max(1,Math.min(52,Number(duration)||1));
  if(state.week>count)state.week=count;
  d.style.setProperty('--week-count',String(count));
  d.innerHTML=Array.from({length:count},(_,i)=>`<button class="${state.week===i+1?'active':''}" data-w="${i+1}">${i+1}</button>`).join('');
  d.querySelectorAll('button').forEach(b=>b.onclick=()=>setWeek(+b.dataset.w));
  d.hidden=false;d.style.removeProperty('display');
}
drawProgramming=function(){
  if(programmingScreen==='chooser'){drawProgrammingChooser();return}
  _drawProgrammingV1162();const v=document.querySelector('#view');if(!v)return;
  const mode=programmingMode();if(mode!=='draft'){
    v.querySelectorAll('.program-status-card,.program-draft-actions').forEach(x=>x.remove());
    // Active program: manual programming only.
    v.querySelector('[data-program-auto]')?.closest('.program-mobile-actions')?.remove();
    v.querySelector('.program-mobile-note')?.remove();
    const back=document.createElement('button');back.type='button';back.className='program-back-choice';back.innerHTML='‹ <span>Programmation</span>';back.onclick=()=>{saveCurrentIntoBlock();programmingScreen='chooser';drawProgramming()};const h=v.querySelector('.section-title');h?h.insertAdjacentElement('afterend',back):v.prepend(back);
    const activeFp=fullProgram();fl184ProgrammingWeeks(activeFp?.totalDuration||state.blockDuration||programmingMeta('active').duration);
    // v1.21.8 : le programme actif reprend la même architecture par blocs que le brouillon.
    const sel=selectedFullBlock();
    const legacySteps=v.querySelector('.program-mobile-steps');
    const manager=document.createElement('section');manager.className='fl176-panel fl176-block-manager fl-active-block-manager';
    manager.innerHTML=`<div class="fl176-panel-title"><small>PROGRAMME ACTIF</small><strong>${esc(activeFp.name||'Programme ForgeLab')}</strong>${activeFp.startDate?`<span>Début S1 · ${esc(activeFp.startDate.split('-').reverse().join('/'))}</span>`:''}</div><div class="fl176-block-list">${activeFp.blocks.map((b,i)=>{const open=b.id===activeFp.selected&&programBlockOpen;return `<div class="fl179-block-slot ${open?'open':''}" data-fl179-slot="${esc(b.id)}"><button type="button" class="fl176-block-card ${b.deload?'deload':''} ${open?'open':''}" data-fl176-block="${esc(b.id)}"><span><small>${b.deload?`DELOAD ${roman(b.blockIndex||i+1)}`:`BLOC ${roman(b.blockIndex||i+1)}`}</small><strong>${fl176RangeLabel(b)}</strong></span><em>${esc(b.name||'Bloc')}</em><b>${open?'⌃':'⌄'}</b></button>${open?`<div class="fl176-open-block"><div><small>${fl176RangeLabel(b)}</small><strong>${esc(b.name||'Bloc')}</strong></div></div><div class="fl179-inline-program" data-fl179-inline-program></div>`:''}</div>`}).join('')}</div>`;
    const anchor=legacySteps||v.firstChild;v.insertBefore(manager,anchor);
    const dailyNodes=[legacySteps,v.querySelector('.program-mobile-intro'),v.querySelector('.program-mobile-library'),v.querySelector('.program-mobile-kpis'),v.querySelector('.program-mobile-days'),v.querySelector('.program-mobile-summary'),v.querySelector('.program-mobile-grid'),v.querySelector('.program-summary')].filter(Boolean);
    if(!programBlockOpen){dailyNodes.forEach(n=>n.remove())}else{const inline=manager.querySelector('[data-fl179-inline-program]');if(inline)dailyNodes.forEach(n=>inline.appendChild(n))}
    manager.querySelectorAll('[data-fl176-block]').forEach(b=>b.onclick=()=>fl176SelectBlock(b.dataset.fl176Block));
    return;
  }
  let fp=fl176EnsureStructure(),sel=selectedFullBlock();fl184ProgrammingWeeks(fp.totalDuration||programmingMeta('draft').duration);
  // Remove legacy duplicated controls / nested phase UI / exports.
  v.querySelectorAll('.program-status-card,.program-draft-actions,.program-current-banner,.program-meta-edit,.program-export-actions,.program-phase-strip,.program-phase-toolbar').forEach(x=>x.remove());
  const back=document.createElement('button');back.type='button';back.className='program-back-choice';back.innerHTML='‹ <span>Programmation</span>';back.onclick=()=>{saveCurrentIntoBlock();const regs=draftRegistry(),r=regs.find(x=>x.id===selectedDraftId());if(r){r.name=fullProgram().name||r.name;saveDraftRegistry(regs)}programmingScreen='chooser';drawProgramming()};const heading=v.querySelector('.section-title');heading?heading.insertAdjacentElement('afterend',back):v.prepend(back);
  const legacySteps=v.querySelector('.program-mobile-steps');
  const config=document.createElement('section');config.className='fl176-panel fl176-program-config';config.innerHTML=`<div class="fl176-panel-title"><small>I · PROGRAMME COMPLET</small><strong>Structure du programme</strong></div><div class="fl176-config-grid"><label><span>Nom du programme</span><input data-fl176-name value="${esc(fp.name||'Programme ForgeLab')}"></label><label><span>Durée totale</span><div class="fl176-duration"><input type="number" min="1" max="52" data-fl176-duration value="${Number(fp.totalDuration||14)}"><b>semaines</b></div></label><label class="wide fl1218-start-date"><span>Date de début du programme</span><div class="fl1218-date-row"><input type="date" data-fl176-start-date value="${esc(fp.startDate||'')}" aria-label="Date de début du programme"><b>${fp.startDate?`S1 débute le ${esc(fp.startDate.split('-').reverse().join('/'))}`:'À renseigner avant activation'}</b></div><small>Cette date correspond au premier jour de S1 et pilote toutes les dates du programme.</small></label><label class="wide"><span>Trame</span><select data-fl176-trame>${[2,3,4,5,6].map(n=>`<option value="${n}" ${n===fl176TrameCount(fp)?'selected':''}>${n} semaines par bloc + deload</option>`).join('')}</select></label></div><div class="fl176-trame-preview">${fp.blocks.map(b=>`<span class="${b.deload?'deload':''}"><strong>${b.deload?`DELOAD ${roman(b.blockIndex)}`:`BLOC ${roman(b.blockIndex)}`}</strong><b>${fl176RangeLabel(b)}</b></span>`).join('<i>›</i>')}</div>`;
  const blocks=document.createElement('section');blocks.className='fl176-panel fl176-block-manager';blocks.innerHTML=`<div class="fl176-panel-title"><small>II · PARAMÉTRAGE DES BLOCS</small><strong>Choisis un bloc à programmer</strong></div><div class="fl176-block-list">${fp.blocks.map((b,i)=>{const ok=fl176BlockComplete(b.id),active=b.id===fp.selected&&programBlockOpen;return `<div class="fl179-block-slot ${active?'open':''}" data-fl179-slot="${esc(b.id)}"><button type="button" class="fl176-block-card ${b.deload?'deload':''} ${active?'open':''}" data-fl176-block="${esc(b.id)}"><span><small>${b.deload?`DELOAD ${roman(b.blockIndex)}`:`BLOC ${roman(b.blockIndex)}`}</small><strong>${fl176RangeLabel(b)}</strong></span><em class="${ok?'ok':''}">${ok?'Paramétré':'À paramétrer'}</em><b>${active?'⌃':'⌄'}</b></button>${active?`<div class="fl176-open-block"><div><small>${sel.deload?`DELOAD ${roman(sel.blockIndex)}`:`BLOC ${roman(sel.blockIndex)}`} · ${fl176RangeLabel(sel)}</small>${sel.deload?`<strong>Deload</strong>`:`<label>Nom du bloc<input data-fl176-block-name value="${esc(sel.name)}"></label>`}</div></div><div class="fl179-inline-program" data-fl179-inline-program></div>`:''}</div>`}).join('')}</div>`;
  const generation=document.createElement('section');generation.className='fl176-panel fl176-generation fl180-generation';const statuses=fp.blocks.map(b=>fl176BlockComplete(b.id)),allOk=statuses.every(Boolean);generation.innerHTML=`<div class="fl176-panel-title"><small>III · GÉNÉRATION</small><strong>Générer une image</strong></div><div class="fl180-generate-row"><select data-fl180-generation-choice aria-label="Élément à générer">${fp.blocks.map((b,i)=>`<option value="${esc(b.id)}" ${statuses[i]?'':'disabled'}>${b.deload?`Deload ${roman(b.blockIndex)}`:`Bloc ${roman(b.blockIndex)}`} · ${fl176RangeLabel(b)}${statuses[i]?'':' · à paramétrer'}</option>`).join('')}<option value="__complete__" ${allOk?'':'disabled'}>Programme complet${allOk?'':' · incomplet'}</option></select><button type="button" data-fl180-generate>Générer</button></div>${allOk?'':`<p>Les éléments non paramétrés restent indisponibles.</p>`}<div class="fl180-activate-wrap"><button type="button" class="fl180-activate" data-fl180-activate>Rendre ce brouillon actif</button><small>Remplace le programme actif après confirmation.</small></div>`;
  const anchor=legacySteps||v.firstChild;v.insertBefore(config,anchor);v.insertBefore(blocks,anchor);
  // Draft UX: no automatic priority distribution. Keep only the block-save action.
  v.querySelector('.program-mobile-actions')?.remove();
  v.querySelector('.program-mobile-note')?.remove();
  const lib=v.querySelector('.program-mobile-library');
  if(lib){
    lib.classList.add('fl179-save-only');
    lib.querySelector('div:first-child')?.remove();
    lib.querySelector('[data-program-preset]')?.remove();
    lib.querySelector('.program-preset-actions')?.remove();
    lib.querySelector('p')?.remove();
    const saveBtn=lib.querySelector('[data-program-save-preset]');if(saveBtn)saveBtn.textContent='Enregistrer le bloc';
  }
  // Daily programming is injected immediately below the block the user opened.
  const dailyNodes=[legacySteps,v.querySelector('.program-mobile-intro'),lib,v.querySelector('.program-mobile-kpis'),v.querySelector('.program-mobile-days'),v.querySelector('.program-mobile-summary'),v.querySelector('.program-mobile-grid'),v.querySelector('.program-summary')].filter(Boolean);
  if(!programBlockOpen){dailyNodes.forEach(n=>n.remove());v.appendChild(generation)}else{
    const inline=blocks.querySelector('[data-fl179-inline-program]');
    if(inline)dailyNodes.forEach(n=>inline.appendChild(n));
    v.appendChild(generation);
  }
  config.querySelector('[data-fl176-name]').onchange=e=>{fp=fullProgram();fp.name=(e.target.value||'').trim()||'Programme ForgeLab';saveFullProgram(fp);const regs=draftRegistry(),r=regs.find(x=>x.id===selectedDraftId());if(r){r.name=fp.name;saveDraftRegistry(regs)}drawProgramming()};
  config.querySelector('[data-fl176-duration]').onchange=e=>{fp=fullProgram();fp.totalDuration=Math.max(1,Math.min(52,Number(e.target.value)||14));saveFullProgram(fp);fl176EnsureStructure();programBlockOpen=false;drawProgramming()};
  config.querySelector('[data-fl176-start-date]').onchange=e=>{fp=fullProgram();const value=(e.target.value||'').trim();if(value&&!/^\d{4}-\d{2}-\d{2}$/.test(value))return;fp.startDate=value;saveFullProgram(fp)};
  config.querySelector('[data-fl176-trame]').onchange=e=>fl176SetTrame(e.target.value);
  blocks.querySelectorAll('[data-fl176-block]').forEach(b=>b.onclick=()=>fl176SelectBlock(b.dataset.fl176Block));
  blocks.querySelector('[data-fl176-block-name]')?.addEventListener('change',e=>{fl176RenameSelected(e.target.value);drawProgramming()});
  generation.querySelector('[data-fl180-generate]')?.addEventListener('click',()=>{const choice=generation.querySelector('[data-fl180-generation-choice]')?.value;if(!choice)return;if(choice==='__complete__'){saveCurrentIntoBlock();generateCompleteProgram()}else fl176GenerateBlock(choice)});
  generation.querySelector('[data-fl180-activate]')?.addEventListener('click',activateFullProgrammingDraft);
};

/* ===== ForgeLab v1.21.8 — Cardio du bloc : trame uniquement, séance dans Séries ===== */
function flCardioScope(mode=programmingMode()){
  const uidKey=currentUser?.id||'guest',draft=mode==='draft'?':draft:'+(selectedDraftId()||'default'):':active',block=selectedFullBlock()?.id||'bloc-1';
  return `${uidKey}${draft}:${block}`;
}
function flCardioTemplateKey(){return `forgelabCardioTemplate:${flCardioScope()}`}
function flCardioWeeksKey(){return `forgelabCardioWeeks:${flCardioScope()}`}
function flCardioTemplate(){
  try{const x=JSON.parse(localStorage.getItem(flCardioTemplateKey())||'null');if(x&&Array.isArray(x.items))return x}catch(_){}
  // Migration non destructive : si du cardio jour-par-jour existait déjà, on s'en sert seulement pour préremplir la trame.
  const legacy=programCardioData(),seen=new Set(),items=[];
  DAYS.forEach(day=>(legacy[day]||[]).forEach(c=>{const sig=[c.quality,c.engine,c.format].join('|');if(!seen.has(sig)){seen.add(sig);items.push({id:cardioModalityId(),quality:c.quality,engine:c.engine,format:c.format,target:1})}}));
  return {items:items.length?items:[{id:cardioModalityId(),quality:CARDIO_QUALITIES[0],engine:'Run',format:'Continu',target:1}]};
}
function flSaveCardioTemplate(x){localStorage.setItem(flCardioTemplateKey(),JSON.stringify(x))}
function flCardioWeeks(){try{const x=JSON.parse(localStorage.getItem(flCardioWeeksKey())||'{}');return x&&typeof x==='object'?x:{}}catch(_){return {}}}
function flSaveCardioWeeks(x){localStorage.setItem(flCardioWeeksKey(),JSON.stringify(x))}
function flSelectedBlockWeeks(){const b=selectedFullBlock();return {from:Math.max(1,+b?.from||1),to:Math.max(1,+b?.to||+b?.from||1)}}
function flCardioWeekSelectedKey(){return `forgelabCardioWeekSelected:${flCardioScope()}`}
function flCardioWeekSelected(){const r=flSelectedBlockWeeks(),n=+localStorage.getItem(flCardioWeekSelectedKey());return n>=r.from&&n<=r.to?n:r.from}
function flSetCardioWeekSelected(n){localStorage.setItem(flCardioWeekSelectedKey(),String(n));drawProgramming()}
function flCardioPlanFromTemplate(){return flCardioTemplate().items.flatMap(t=>Array.from({length:Math.max(0,+t.target||0)},()=>({id:cardioModalityId(),day:'',quality:t.quality,engine:t.engine,format:t.format,duration:t.quality==='🟢 Base aérobie'?40:0,target:''})))}
function flCardioProgressivePanel(){
  const tpl=flCardioTemplate();
  const rows=tpl.items.map(t=>`<div class="fl-cardio-template-row" data-fl-cardio-template-id="${esc(t.id)}"><select data-flct-quality>${CARDIO_QUALITIES.map(x=>`<option ${x===t.quality?'selected':''}>${esc(x)}</option>`).join('')}</select><select data-flct-engine>${CARDIO_ENGINES.map(x=>`<option ${x===t.engine?'selected':''}>${esc(x)}</option>`).join('')}</select><select data-flct-format>${CARDIO_FORMATS.map(x=>`<option ${x===t.format?'selected':''}>${esc(x)}</option>`).join('')}</select><label class="fl-cardio-frequency"><button type="button" data-flct-minus>−</button><strong>${+t.target||0}</strong><span>/ sem.</span><button type="button" data-flct-plus>+</button></label>${tpl.items.length>1?'<button type="button" class="fl-cardio-x" data-flct-remove>×</button>':''}</div>`).join('');
  return `<section class="fl-cardio-progressive"><div class="fl-cardio-title"><div><small>♥ CARDIO · ${esc(selectedFullBlock()?.name||'BLOC')}</small><strong>Trame du bloc</strong><span>Définis ici uniquement le thème et la fréquence. La séance concrète se paramètre dans Séries.</span></div><button type="button" data-flct-add>＋</button></div><div class="fl-cardio-template-list">${rows}</div></section>`;
}
function flWireCardioProgressive(v){
  v.querySelector('[data-flct-add]')?.addEventListener('click',()=>{const x=flCardioTemplate();x.items.push({id:cardioModalityId(),quality:CARDIO_QUALITIES[0],engine:'Run',format:'Continu',target:1});flSaveCardioTemplate(x);drawProgramming()});
  v.querySelectorAll('[data-fl-cardio-template-id]').forEach(row=>{const id=row.dataset.flCardioTemplateId;const mutate=fn=>{const x=flCardioTemplate(),t=x.items.find(a=>a.id===id);if(t){fn(t,x);flSaveCardioTemplate(x);drawProgramming()}};row.querySelector('[data-flct-quality]').onchange=e=>mutate(t=>t.quality=e.target.value);row.querySelector('[data-flct-engine]').onchange=e=>mutate(t=>t.engine=e.target.value);row.querySelector('[data-flct-format]').onchange=e=>mutate(t=>t.format=e.target.value);row.querySelector('[data-flct-minus]').onclick=()=>mutate(t=>t.target=Math.max(0,(+t.target||0)-1));row.querySelector('[data-flct-plus]').onclick=()=>mutate(t=>t.target=Math.min(7,(+t.target||0)+1));row.querySelector('[data-flct-remove]')?.addEventListener('click',()=>{const x=flCardioTemplate();x.items=x.items.filter(a=>a.id!==id);flSaveCardioTemplate(x);drawProgramming()})});
}
const _drawProgrammingCardioProgressive=drawProgramming;
drawProgramming=function(){
  _drawProgrammingCardioProgressive();
  if(programmingScreen==='chooser')return;
  const v=document.querySelector('#view');if(!v)return;
  // L'ancien cardio jour-par-jour reste en stockage pour compatibilité, mais n'est plus l'interface de programmation.
  v.querySelectorAll('.program-cardio-day').forEach(x=>x.remove());
  const days=v.querySelector('.mobile-program-days')||v.querySelector('.program-mobile-days')||v.querySelector('.fl176-block-editor');
  if(days){const wrap=document.createElement('div');wrap.innerHTML=flCardioProgressivePanel();const panel=wrap.firstElementChild;days.insertAdjacentElement('afterend',panel);flWireCardioProgressive(v)}
}

/* ===== ForgeLab v1.21.8 — Focus bloc + notes libres ===== */
function flBlockNotesKey(){return `forgelabBlockNotes:${flCardioScope()}`}
function flBlockNotes(){return localStorage.getItem(flBlockNotesKey())||''}
function flSaveBlockNotes(value){localStorage.setItem(flBlockNotesKey(),String(value||''))}
const _drawProgrammingBlockFocus=drawProgramming;
drawProgramming=function(){
  _drawProgrammingBlockFocus();
  if(programmingScreen==='chooser'||!programBlockOpen)return;
  const v=document.querySelector('#view');if(!v)return;
  const sel=selectedFullBlock();if(!sel)return;
  // En mode « Paramétrer », l'écran est volontairement consacré au bloc ouvert.
  v.querySelector('.fl176-program-config')?.remove();
  v.querySelector('.fl176-generation')?.remove();
  v.querySelectorAll('.program-mobile-summary,.program-summary,.program-mobile-kpis').forEach(x=>x.remove());
  const manager=v.querySelector('.fl176-block-manager');
  if(manager){
    manager.querySelector('.fl176-panel-title')?.remove();
    manager.querySelectorAll('[data-fl179-slot]').forEach(slot=>{if(slot.dataset.fl179Slot!==sel.id)slot.remove()});
    const card=[...manager.querySelectorAll('[data-fl176-block]')].find(x=>x.dataset.fl176Block===sel.id);if(card){const em=card.querySelector('em');if(em)em.textContent='Paramétrage du bloc';}
  }
  const cardio=v.querySelector('.fl-cardio-progressive');
  const inline=v.querySelector('[data-fl179-inline-program]')||manager;
  if(!inline)return;
  const notes=document.createElement('section');notes.className='fl-block-notes';notes.innerHTML=`<div class="fl-block-notes-head"><small>NOTES DU BLOC</small><strong>Contexte & repères</strong><span>Texte libre · sauvegarde automatique</span></div><textarea data-fl-block-notes maxlength="3000" placeholder="Ex. Maintien calorique · objectif du bloc · récupération · contraintes…">${esc(flBlockNotes())}</textarea>`;
  const activeMode=programmingMode()==='active',activeFp=activeMode?flActiveProgram():null;
  let legacyDate=null;
  // Ancien bloc actif sans date programme : autoriser UNE date locale au bloc pour pouvoir clôturer/exporter ce bilan.
  if(activeMode&&(!activeFp?.startDate||!/^\d{4}-\d{2}-\d{2}$/.test(activeFp.startDate))){
    legacyDate=document.createElement('section');legacyDate.className='fl-block-legacy-date';legacyDate.innerHTML=`<div><small>EXPORT EXCEPTIONNEL · ANCIEN BLOC</small><strong>Date de début de ce bloc</strong><span>Utilisée uniquement pour calculer la période de ce bilan PDF.</span></div><input type="date" data-fl-legacy-block-date value="${esc(sel.exportStartDate||'')}">`;
  }
  const actions=document.createElement('section');actions.className='fl-block-focus-actions';actions.innerHTML=`<button type="button" class="gold" data-fl-block-generate>Générer l’image de ce bloc</button>${activeMode?'<button type="button" class="secondary" data-fl-block-pdf>Exporter le bilan PDF</button>':''}`;
  (cardio||inline.lastElementChild)?.insertAdjacentElement('afterend',notes);
  if(legacyDate){notes.insertAdjacentElement('afterend',legacyDate);legacyDate.insertAdjacentElement('afterend',actions)}else notes.insertAdjacentElement('afterend',actions);
  notes.querySelector('[data-fl-block-notes]').addEventListener('input',e=>flSaveBlockNotes(e.target.value));
  legacyDate?.querySelector('[data-fl-legacy-block-date]')?.addEventListener('change',e=>{
    const value=(e.target.value||'').trim(),fp=flActiveProgram();if(!fp)return;
    const b=fp.blocks?.find(x=>x.id===sel.id);if(!b)return;
    b.exportStartDate=value;localStorage.setItem(`forgelabFullProgram:${currentUser?.id||'guest'}:active`,JSON.stringify(fp));sel.exportStartDate=value;
  });
  actions.querySelector('[data-fl-block-generate]').onclick=()=>{flSaveBlockNotes(notes.querySelector('[data-fl-block-notes]').value);saveCurrentIntoBlock();fl176GenerateBlock(sel.id)};
  actions.querySelector('[data-fl-block-pdf]')?.addEventListener('click',()=>{flSaveBlockNotes(notes.querySelector('[data-fl-block-notes]').value);exportBlockPdf(sel.id)});
}
