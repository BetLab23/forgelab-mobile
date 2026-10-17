const CACHE='forgelab-shell-v1338';
const ASSETS=['./','./index.html?build=1338','./mobile.v1338.css?build=1338','./mobile.v1338.js?build=1338','./manifest.v1338.webmanifest?build=1338','./auth-laurel-realistic-v1225.png?build=1338','./icon-192-v1338.png','./icon-512-v1338.png','./icon-1024-v1338.png','./apple-touch-icon-v1338.png','./archive-strength-dumbbell-v1333.png','./archive-cardio-heart-v1334.svg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1338'))));});
