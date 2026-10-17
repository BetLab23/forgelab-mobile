const CACHE='forgelab-shell-v1332';
const ASSETS=['./','./index.html?build=1332','./mobile.v1332.css?build=1332','./mobile.v1332.js?build=1332','./manifest.v1332.webmanifest?build=1332','./auth-laurel-realistic-v1225.png?build=1332','./icon-192-v1332.png','./icon-512-v1332.png','./icon-1024-v1332.png','./apple-touch-icon-v1332.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1332'))));});
