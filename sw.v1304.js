const CACHE='forgelab-shell-v1304';
const ASSETS=['./','./index.html?build=1304','./mobile.v1304.css?build=1304','./mobile.v1304.js?build=1304','./manifest.v1304.webmanifest?build=1304','./auth-laurel-realistic-v1225.png?build=1304','./icon-192-v1304.png','./icon-512-v1304.png','./icon-1024-v1304.png','./apple-touch-icon-v1304.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1304'))));});
