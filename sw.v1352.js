const CACHE='forgelab-shell-v1352';
const ASSETS=['./','./index.html?build=1352','./mobile.v1352.css?build=1352','./mobile.v1352.js?build=1352','./manifest.v1352.webmanifest?build=1352','./auth-laurel-realistic-v1225.png?build=1352','./icon-192-v1352.png','./icon-512-v1352.png','./icon-1024-v1352.png','./apple-touch-icon-v1352.png','./archive-strength-dumbbell-v1333.png','./archive-cardio-heart-v1334.svg','./nav-priorites-v1230.png?build=1352','./nav-programmation-v1230.png?build=1352','./nav-series-v1230.png?build=1352','./nav-archive-v1248.png?build=1352','./nav-suivi-laurel-v1248.png?build=1352'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  const isNav=/\/nav-(priorites-v1230|programmation-v1230|series-v1230|archive-v1248|suivi-laurel-v1248)\.png$/.test(u.pathname);
  if(isNav){
    e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;})));
    return;
  }
  e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1352'))));
});
