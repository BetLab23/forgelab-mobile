const CACHE='forgelab-shell-v1300';
const ASSETS=['./','./index.html?build=1300','./mobile.v1300.css?build=1300','./mobile.v1300.js?build=1300','./manifest.v1300.webmanifest?build=1300','./auth-laurel-realistic-v1225.png?build=1300','./icon-192-v1300.png','./icon-512-v1300.png','./icon-1024-v1300.png','./apple-touch-icon-v1300.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1300'))));});
