const CACHE='forgelab-shell-v1323';
const ASSETS=['./','./index.html?build=1323','./mobile.v1323.css?build=1323','./mobile.v1323.js?build=1323','./manifest.v1323.webmanifest?build=1323','./auth-laurel-realistic-v1225.png?build=1323','./icon-192-v1323.png','./icon-512-v1323.png','./icon-1024-v1323.png','./apple-touch-icon-v1323.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1323'))));});
