const CACHE='forgelab-shell-v1309';
const ASSETS=['./','./index.html?build=1309','./mobile.v1309.css?build=1309','./mobile.v1309.js?build=1309','./manifest.v1309.webmanifest?build=1309','./auth-laurel-realistic-v1225.png?build=1309','./icon-192-v1309.png','./icon-512-v1309.png','./icon-1024-v1309.png','./apple-touch-icon-v1309.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1309'))));});
