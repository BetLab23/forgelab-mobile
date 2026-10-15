const CACHE='forgelab-shell-v1301';
const ASSETS=['./','./index.html?build=1301','./mobile.v1301.css?build=1301','./mobile.v1301.js?build=1301','./manifest.v1301.webmanifest?build=1301','./auth-laurel-realistic-v1225.png?build=1301','./icon-192-v1301.png','./icon-512-v1301.png','./icon-1024-v1301.png','./apple-touch-icon-v1301.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1301'))));});
