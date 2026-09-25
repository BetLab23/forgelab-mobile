const CACHE='forgelab-shell-v1269';
const ASSETS=['./','./index.html?build=1269','./mobile.v1269.css?build=1269','./mobile.v1269.js?build=1269','./manifest.v1225.webmanifest?build=1269','./auth-laurel-realistic-v1225.png?build=1256','./icon-192-v1256.png','./icon-512-v1256.png','./icon-1024-v1256.png','./apple-touch-icon-v1256.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1269'))));});
