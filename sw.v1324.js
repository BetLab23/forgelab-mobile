const CACHE='forgelab-shell-v1324';
const ASSETS=['./','./index.html?build=1324','./mobile.v1324.css?build=1324','./mobile.v1324.js?build=1324','./manifest.v1324.webmanifest?build=1324','./auth-laurel-realistic-v1225.png?build=1324','./icon-192-v1324.png','./icon-512-v1324.png','./icon-1024-v1324.png','./apple-touch-icon-v1324.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1324'))));});
