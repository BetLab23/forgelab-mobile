const CACHE='forgelab-shell-v1291';
const ASSETS=['./','./index.html?build=1291','./mobile.v1291.css?build=1291','./mobile.v1291.js?build=1291','./manifest.v1291.webmanifest?build=1291','./auth-laurel-realistic-v1225.png?build=1291','./icon-192-v1291.png','./icon-512-v1291.png','./icon-1024-v1291.png','./apple-touch-icon-v1291.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1291'))));});
