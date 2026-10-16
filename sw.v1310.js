const CACHE='forgelab-shell-v1310';
const ASSETS=['./','./index.html?build=1310','./mobile.v1310.css?build=1310','./mobile.v1310.js?build=1310','./manifest.v1310.webmanifest?build=1310','./auth-laurel-realistic-v1225.png?build=1310','./icon-192-v1310.png','./icon-512-v1310.png','./icon-1024-v1310.png','./apple-touch-icon-v1310.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1310'))));});
