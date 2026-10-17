const CACHE='forgelab-shell-v1331';
const ASSETS=['./','./index.html?build=1331','./mobile.v1331.css?build=1331','./mobile.v1331.js?build=1331','./manifest.v1331.webmanifest?build=1331','./auth-laurel-realistic-v1225.png?build=1331','./icon-192-v1331.png','./icon-512-v1331.png','./icon-1024-v1331.png','./apple-touch-icon-v1331.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1331'))));});
