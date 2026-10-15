const CACHE='forgelab-shell-v1303';
const ASSETS=['./','./index.html?build=1303','./mobile.v1303.css?build=1303','./mobile.v1303.js?build=1303','./manifest.v1303.webmanifest?build=1303','./auth-laurel-realistic-v1225.png?build=1303','./icon-192-v1303.png','./icon-512-v1303.png','./icon-1024-v1303.png','./apple-touch-icon-v1303.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1303'))));});
