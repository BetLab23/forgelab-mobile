const CACHE='forgelab-shell-v1315';
const ASSETS=['./','./index.html?build=1315','./mobile.v1315.css?build=1315','./mobile.v1315.js?build=1315','./manifest.v1315.webmanifest?build=1315','./auth-laurel-realistic-v1225.png?build=1315','./icon-192-v1315.png','./icon-512-v1315.png','./icon-1024-v1315.png','./apple-touch-icon-v1315.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1315'))));});
