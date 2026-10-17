const CACHE='forgelab-shell-v1330';
const ASSETS=['./','./index.html?build=1330','./mobile.v1330.css?build=1330','./mobile.v1330.js?build=1330','./manifest.v1330.webmanifest?build=1330','./auth-laurel-realistic-v1225.png?build=1330','./icon-192-v1330.png','./icon-512-v1330.png','./icon-1024-v1330.png','./apple-touch-icon-v1330.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1330'))));});
