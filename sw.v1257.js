const CACHE='forgelab-shell-v1257';
const ASSETS=['./','./index.html','./mobile.v1257.css?build=1257','./mobile.v1257.js?build=1257','./manifest.v1225.webmanifest?build=1257','./auth-laurel-realistic-v1225.png?build=1256','./icon-192-v1257.png','./icon-512-v1257.png','./icon-1024-v1257.png','./apple-touch-icon-v1257.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));});
