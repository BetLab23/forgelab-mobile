const CACHE='forgelab-shell-v1306';
const ASSETS=['./','./index.html?build=1306','./mobile.v1306.css?build=1306','./mobile.v1306.js?build=1306','./manifest.v1306.webmanifest?build=1306','./auth-laurel-realistic-v1225.png?build=1306','./icon-192-v1306.png','./icon-512-v1306.png','./icon-1024-v1306.png','./apple-touch-icon-v1306.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1306'))));});
