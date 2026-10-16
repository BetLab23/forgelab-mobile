const CACHE='forgelab-shell-v1311';
const ASSETS=['./','./index.html?build=1311','./mobile.v1311.css?build=1311','./mobile.v1311.js?build=1311','./manifest.v1311.webmanifest?build=1311','./auth-laurel-realistic-v1225.png?build=1311','./icon-192-v1311.png','./icon-512-v1311.png','./icon-1024-v1311.png','./apple-touch-icon-v1311.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1311'))));});
