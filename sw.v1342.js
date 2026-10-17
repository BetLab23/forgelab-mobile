const CACHE='forgelab-shell-v1342';
const ASSETS=['./','./index.html?build=1342','./mobile.v1342.css?build=1342','./mobile.v1342.js?build=1342','./manifest.v1342.webmanifest?build=1342','./auth-laurel-realistic-v1225.png?build=1342','./icon-192-v1342.png','./icon-512-v1342.png','./icon-1024-v1342.png','./apple-touch-icon-v1342.png','./archive-strength-dumbbell-v1333.png','./archive-cardio-heart-v1334.svg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1342'))));});
