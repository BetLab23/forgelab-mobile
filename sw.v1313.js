const CACHE='forgelab-shell-v1313';
const ASSETS=['./','./index.html?build=1313','./mobile.v1313.css?build=1313','./mobile.v1313.js?build=1313','./manifest.v1313.webmanifest?build=1313','./auth-laurel-realistic-v1225.png?build=1313','./icon-192-v1313.png','./icon-512-v1313.png','./icon-1024-v1313.png','./apple-touch-icon-v1313.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1313'))));});
