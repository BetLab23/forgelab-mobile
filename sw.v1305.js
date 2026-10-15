const CACHE='forgelab-shell-v1305';
const ASSETS=['./','./index.html?build=1305','./mobile.v1305.css?build=1305','./mobile.v1305.js?build=1305','./manifest.v1305.webmanifest?build=1305','./auth-laurel-realistic-v1225.png?build=1305','./icon-192-v1305.png','./icon-512-v1305.png','./icon-1024-v1305.png','./apple-touch-icon-v1305.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1305'))));});
