self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('TechPro-Media').then((cache) => cache.addAll([
      '/',
      'Styles/main.css',
      'Images/green_background.jpg',
      'Images/logo_new.svg',
      'Images/logo_new.png',
      'Scripts/main.js',
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});
