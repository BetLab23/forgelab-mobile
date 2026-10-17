const CACHE='forgelab-shell-v1322';
const ASSETS=['./','./index.html?build=1320','./mobile.v1322.css?build=1320','./mobile.v1322.js?build=1320','./manifest.v1322.webmanifest?build=1320','./auth-laurel-realistic-v1225.png?build=1320','./icon-192-v1322.png','./icon-512-v1322.png','./icon-1024-v1322.png','./apple-touch-icon-v1322.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1320'))));});
