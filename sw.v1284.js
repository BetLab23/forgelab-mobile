const CACHE='forgelab-shell-v1284';
const ASSETS=['./','./index.html?build=1284','./mobile.v1284.css?build=1284','./mobile.v1284.js?build=1284','./manifest.v1284.webmanifest?build=1284','./auth-laurel-realistic-v1225.png?build=1284','./icon-192-v1284.png','./icon-512-v1284.png','./icon-1024-v1284.png','./apple-touch-icon-v1284.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1284'))));});
