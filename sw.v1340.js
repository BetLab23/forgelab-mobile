const CACHE='forgelab-shell-v1340';
const ASSETS=['./','./index.html?build=1340','./mobile.v1340.css?build=1340','./mobile.v1340.js?build=1340','./manifest.v1340.webmanifest?build=1340','./auth-laurel-realistic-v1225.png?build=1340','./icon-192-v1340.png','./icon-512-v1340.png','./icon-1024-v1340.png','./apple-touch-icon-v1340.png','./archive-strength-dumbbell-v1333.png','./archive-cardio-heart-v1334.svg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1340'))));});
