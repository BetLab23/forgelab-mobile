const CACHE='forgelab-shell-v1302';
const ASSETS=['./','./index.html?build=1302','./mobile.v1302.css?build=1302','./mobile.v1302.js?build=1302','./manifest.v1302.webmanifest?build=1302','./auth-laurel-realistic-v1225.png?build=1302','./icon-192-v1302.png','./icon-512-v1302.png','./icon-1024-v1302.png','./apple-touch-icon-v1302.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1302'))));});
