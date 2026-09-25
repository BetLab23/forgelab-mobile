const CACHE='forgelab-shell-v1263';
const ASSETS=['./','./index.html','./mobile.v1263.css?build=1263','./mobile.v1263.js?build=1263','./manifest.v1225.webmanifest?build=1263','./auth-laurel-realistic-v1225.png?build=1256','./icon-192-v1256.png','./icon-512-v1256.png','./icon-1024-v1256.png','./apple-touch-icon-v1256.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));});
