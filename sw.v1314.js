const CACHE='forgelab-shell-v1314';
const ASSETS=['./','./index.html?build=1313','./mobile.v1314.css?build=1313','./mobile.v1314.js?build=1313','./manifest.v1314.webmanifest?build=1313','./auth-laurel-realistic-v1225.png?build=1313','./icon-192-v1314.png','./icon-512-v1314.png','./icon-1024-v1314.png','./apple-touch-icon-v1314.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1313'))));});
