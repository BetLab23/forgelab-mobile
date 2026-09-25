const CACHE='forgelab-shell-v1267';
const ASSETS=['./','./index.html?build=1267','./mobile.v1267.css?build=1267','./mobile.v1267.js?build=1267','./manifest.v1225.webmanifest?build=1267','./auth-laurel-realistic-v1225.png?build=1256','./icon-192-v1256.png','./icon-512-v1256.png','./icon-1024-v1256.png','./apple-touch-icon-v1256.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1267'))));});
