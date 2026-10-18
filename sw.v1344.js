const CACHE='forgelab-shell-v1344';
const ASSETS=['./','./index.html?build=1344','./mobile.v1344.css?build=1344','./mobile.v1344.js?build=1344','./manifest.v1344.webmanifest?build=1344','./auth-laurel-realistic-v1225.png?build=1344','./icon-192-v1344.png','./icon-512-v1344.png','./icon-1024-v1344.png','./apple-touch-icon-v1344.png','./archive-strength-dumbbell-v1333.png','./archive-cardio-heart-v1334.svg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1344'))));});
