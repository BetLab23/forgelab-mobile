const CACHE='forgelab-shell-v1265';
const ASSETS=['./','./index.html?build=1265','./mobile.v1265.css?build=1265','./mobile.v1265.js?build=1265','./manifest.v1225.webmanifest?build=1265','./auth-laurel-realistic-v1225.png?build=1256','./icon-192-v1256.png','./icon-512-v1256.png','./icon-1024-v1256.png','./apple-touch-icon-v1256.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1265'))));});
