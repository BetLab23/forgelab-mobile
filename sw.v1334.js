const CACHE='forgelab-shell-v1334';
const ASSETS=['./','./index.html?build=1334','./mobile.v1334.css?build=1334','./mobile.v1334.js?build=1334','./manifest.v1334.webmanifest?build=1334','./auth-laurel-realistic-v1225.png?build=1334','./icon-192-v1334.png','./icon-512-v1334.png','./icon-1024-v1334.png','./apple-touch-icon-v1334.png','./archive-strength-dumbbell-v1333.png','./archive-cardio-heart-v1334.svg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?build=1334'))));});
