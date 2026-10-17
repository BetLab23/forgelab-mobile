const CACHE='forgelab-shell-v1329';
const ASSETS=['./','./index.html?build=1327','./mobile.v1329.css?build=1327','./mobile.v1329.js?build=1327','./manifest.v1329.webmanifest?build=1327','./auth-laurel-realistic-v1225.png?build=1327','./icon-192-v1329.png','./icon-512-v1329.png','./icon-1024-v1329.png','./apple-touch-icon-v1329.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1327'))));});
