const CACHE='forgelab-shell-v1333';
const ASSETS=['./','./index.html?build=1333','./mobile.v1333.css?build=1333','./mobile.v1333.js?build=1333','./manifest.v1333.webmanifest?build=1333','./auth-laurel-realistic-v1225.png?build=1333','./icon-192-v1333.png','./icon-512-v1333.png','./icon-1024-v1333.png','./apple-touch-icon-v1333.png','./archive-strength-dumbbell-v1333.png','./archive-cardio-heart-v1333.svg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1333'))));});
