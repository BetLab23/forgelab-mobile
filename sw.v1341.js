const CACHE='forgelab-shell-v1341';
const ASSETS=['./','./index.html?build=1341','./mobile.v1341.css?build=1341','./mobile.v1341.js?build=1341','./manifest.v1341.webmanifest?build=1341','./auth-laurel-realistic-v1225.png?build=1341','./icon-192-v1341.png','./icon-512-v1341.png','./icon-1024-v1341.png','./apple-touch-icon-v1341.png','./archive-strength-dumbbell-v1333.png','./archive-cardio-heart-v1334.svg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1341'))));});
