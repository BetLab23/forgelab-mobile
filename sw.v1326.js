const CACHE='forgelab-shell-v1326';
const ASSETS=['./','./index.html?build=1326','./mobile.v1326.css?build=1326','./mobile.v1326.js?build=1326','./manifest.v1326.webmanifest?build=1326','./auth-laurel-realistic-v1225.png?build=1326','./icon-192-v1326.png','./icon-512-v1326.png','./icon-1024-v1326.png','./apple-touch-icon-v1326.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1326'))));});
