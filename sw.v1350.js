const CACHE='forgelab-shell-v1350';
const ASSETS=['./','./index.html?build=1350','./mobile.v1350.css?build=1350','./mobile.v1350.js?build=1350','./manifest.v1350.webmanifest?build=1350','./auth-laurel-realistic-v1225.png?build=1350','./icon-192-v1350.png','./icon-512-v1350.png','./icon-1024-v1350.png','./apple-touch-icon-v1350.png','./archive-strength-dumbbell-v1333.png','./archive-cardio-heart-v1334.svg','./nav-priorites-v1230.png?build=1350','./nav-programmation-v1230.png?build=1350','./nav-series-v1230.png?build=1350','./nav-archive-v1248.png?build=1350','./nav-suivi-laurel-v1248.png?build=1350'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  const isNav=/\/nav-(priorites-v1230|programmation-v1230|series-v1230|archive-v1248|suivi-laurel-v1248)\.png$/.test(u.pathname);
  if(isNav){
    e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;})));
    return;
  }
  e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1350'))));
});
