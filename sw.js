
// Using Workbox to handle service worker functionality for a more robust PWA.
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.1.0/workbox-sw.js');

if (workbox) {
  console.log(`[Service Worker] Workbox is loaded!`);

  const { precacheAndRoute } = workbox.precaching;
  const { registerRoute, NavigationRoute } = workbox.routing;
  const { NetworkFirst, StaleWhileRevalidate, CacheFirst } = workbox.strategies;
  const { ExpirationPlugin } = workbox.expiration;
  const { CacheableResponsePlugin } = workbox.cacheableResponse;
  
  // Immediately take control of the page.
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  // Pre-cache all the files that make up the app shell.
  const APP_SHELL_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/metadata.json',
    '/index.tsx',
    '/App.tsx',
    '/types.ts',
    '/constants.tsx',
    '/hooks/useSound.ts',
    // Components
    '/components/FloatingActionButton.tsx',
    '/components/AddChildModal.tsx',
    '/components/AddChoreModal.tsx',
    '/components/AllChoresDoneModal.tsx',
    '/components/BonusAwardedNotificationModal.tsx',
    '/components/BonusAwardModal.tsx',
    '/components/BonusNotificationButton.tsx',
    '/components/CashOutConfirmationModal.tsx',
    '/components/CashOutRequestNotificationModal.tsx',
    '/components/ChoreCard.tsx',
    '/components/ChoreList.tsx',
    '/components/DayButton.tsx',
    '/components/DeviceSetupModal.tsx',
    '/components/EarningsHistoryModal.tsx',
    '/components/EditProfileModal.tsx',
    '/components/FullScreenFireworks.tsx',
    '/components/Header.tsx',
    '/components/LineGraph.tsx',
    '/components/MotivationalBanner.tsx',
    '/components/OptionsMenuModal.tsx',
    '/components/ParentBonusConfirmationModal.tsx',
    '/components/PastChoresApprovalModal.tsx',
    '/components/PendingCashOutsModal.tsx',
    '/components/ProfileSelector.tsx',
    '/components/ReviewCashOutModal.tsx',
    '/components/SparkleEffect.tsx',
    '/components/ThemeModal.tsx',
    '/components/WelcomeModal.tsx',
    // Theme images
    '/images/android-launchericon-48-48.png',
    '/images/android-launchericon-72-72.png',
    '/images/android-launchericon-96-96.png',
    '/images/android-launchericon-144-144.png',
    '/images/android-launchericon-192-192.png',
    '/images/android-launchericon-512-512.png',
    '/images/lions_logo.png',
    '/images/Skateboard.png',
    '/images/jar.png',
    // Sounds
    'sounds/shimmer.mp3',
    'sounds/chore-complete.mp3',
    'sounds/cash-out.mp3',
    'sounds/all-chores-done.mp3',
    'sounds/bonus-notify.mp3',
    'sounds/button-click.mp3'
  ];
  
  precacheAndRoute(APP_SHELL_URLS.map(url => ({ url, revision: null })));

  // Caching strategy for navigation requests (HTML pages).
  // Network First: Try to get the latest version, fall back to cache.
  registerRoute(new NavigationRoute(new NetworkFirst({
    cacheName: 'pages-cache',
  })));

  // Caching strategy for Google Fonts.
  // Stale-While-Revalidate for stylesheets for quick loading.
  registerRoute(
    ({url}) => url.origin === 'https://fonts.googleapis.com',
    new StaleWhileRevalidate({ cacheName: 'google-fonts-stylesheets' })
  );
  // Cache-First for font files, as they are versioned and don't change.
  registerRoute(
    ({url}) => url.origin === 'https://fonts.gstatic.com',
    new CacheFirst({
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24 * 365, maxEntries: 30 }), // Cache for 1 year
      ],
    })
  );

  // Caching strategy for CDN assets (Tailwind, React, etc.).
  // Stale-While-Revalidate: Serve from cache immediately, update in background.
  registerRoute(
    ({url}) => url.origin === 'https://cdn.tailwindcss.com' || url.origin === 'https://esm.sh' || url.origin === 'https://www.gstatic.com',
    new StaleWhileRevalidate({
      cacheName: 'cdn-assets-cache',
      plugins: [ new ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24 * 30 }) ], // Cache for 30 days
    })
  );
  
  // Caching strategy for local images.
  // Cache-First: Once an image is cached, serve it from there.
  registerRoute(
    ({request}) => request.destination === 'image',
    new CacheFirst({
      cacheName: 'image-cache',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // Cache for 30 Days
        }),
      ],
    })
  );

} else {
  console.error(`[Service Worker] Workbox failed to load.`);
}