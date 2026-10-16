const CACHE='forgelab-shell-v1308';
const ASSETS=['./','./index.html?build=1308','./mobile.v1308.css?build=1308','./mobile.v1308.js?build=1308','./manifest.v1308.webmanifest?build=1308','./auth-laurel-realistic-v1225.png?build=1308','./icon-192-v1308.png','./icon-512-v1308.png','./icon-1024-v1308.png','./apple-touch-icon-v1308.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1308'))));});
