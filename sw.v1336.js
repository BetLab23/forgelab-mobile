const CACHE='forgelab-shell-v1336';
const ASSETS=['./','./index.html?build=1336','./mobile.v1336.css?build=1336','./mobile.v1336.js?build=1336','./manifest.v1336.webmanifest?build=1336','./auth-laurel-realistic-v1225.png?build=1336','./icon-192-v1336.png','./icon-512-v1336.png','./icon-1024-v1336.png','./apple-touch-icon-v1336.png','./archive-strength-dumbbell-v1333.png','./archive-cardio-heart-v1334.svg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1336'))));});
