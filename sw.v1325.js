const CACHE='forgelab-shell-v1325';
const ASSETS=['./','./index.html?build=1325','./mobile.v1325.css?build=1325','./mobile.v1325.js?build=1325','./manifest.v1325.webmanifest?build=1325','./auth-laurel-realistic-v1225.png?build=1325','./icon-192-v1325.png','./icon-512-v1325.png','./icon-1024-v1325.png','./apple-touch-icon-v1325.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1325'))));});
