"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2
| Progressive Web App Service Worker
|--------------------------------------------------------------------------
| Local-first • Offline-first • Mobile-first
|
| Responsibilities:
| - Cache the CBC MASTER application shell
| - Provide offline access
| - Update cached application files
| - Remove old CBC MASTER caches
| - Support the app's "delete data" workflow
|--------------------------------------------------------------------------
*/

const CACHE_NAME = "cbc-master-v2-cache-v1";


/*
|--------------------------------------------------------------------------
| APPLICATION SHELL
|--------------------------------------------------------------------------
| These files are required for the basic CBC MASTER application to load
| when the device is offline.
|--------------------------------------------------------------------------
*/

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/app.css",
  "./js/app.js",
  "./js/profile-photo.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];


/*
|--------------------------------------------------------------------------
| INSTALL
|--------------------------------------------------------------------------
| Open the CBC MASTER cache and store the application shell.
|--------------------------------------------------------------------------
*/

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(APP_SHELL);
      })
      .then(() => {
        /*
         * Activate the new service worker immediately.
         */
        return self.skipWaiting();
      })
  );
});


/*
|--------------------------------------------------------------------------
| ACTIVATE
|--------------------------------------------------------------------------
| Remove old CBC MASTER cache versions.
|--------------------------------------------------------------------------
*/

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return (
                cacheName.startsWith("cbc-master-") &&
                cacheName !== CACHE_NAME
              );
            })
            .map((cacheName) => {
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        /*
         * Allow the new service worker to control open pages.
         */
        return self.clients.claim();
      })
  );
});


/*
|--------------------------------------------------------------------------
| FETCH
|--------------------------------------------------------------------------
| Handle GET requests only.
|--------------------------------------------------------------------------
*/

self.addEventListener("fetch", (event) => {
  const request = event.request;

  /*
   * Never interfere with POST, PUT, DELETE, etc.
   */
  if (request.method !== "GET") {
    return;
  }


  /*
   * ---------------------------------------------------------------
   * NAVIGATION REQUESTS
   * ---------------------------------------------------------------
   *
   * Try the network first.
   * If the network is unavailable, load the cached index.html.
   */

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {

          /*
           * Store a successful page response.
           */
          if (response && response.ok) {
            const responseClone = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                return cache.put(
                  request,
                  responseClone
                );
              })
              .catch(() => {
                /*
                 * Cache failure should never break the app.
                 */
              });
          }

          return response;
        })
        .catch(() => {
          /*
           * Offline fallback.
           */
          return caches.match("./index.html");
        })
    );

    return;
  }


  /*
   * ---------------------------------------------------------------
   * STATIC RESOURCES
   * ---------------------------------------------------------------
   *
   * Cache first.
   * If the resource is not cached, fetch it from the network and
   * store a successful response for future offline use.
   */

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {

        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {

            /*
             * Do not cache unsuccessful or opaque responses.
             */
            if (
              !response ||
              response.status !== 200 ||
              response.type === "opaque"
            ) {
              return response;
            }

            const responseClone =
              response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                return cache.put(
                  request,
                  responseClone
                );
              })
              .catch(() => {
                /*
                 * Cache failure should not break the request.
                 */
              });

            return response;
          });
      })
  );
});


/*
|--------------------------------------------------------------------------
| MESSAGE HANDLER
|--------------------------------------------------------------------------
| Allows CBC MASTER to request removal of its cached application data.
|--------------------------------------------------------------------------
*/

self.addEventListener("message", (event) => {

  if (!event.data) {
    return;
  }


  /*
   * Clear all CBC MASTER caches.
   */
  if (
    event.data.type ===
    "CLEAR_CBC_MASTER_CACHE"
  ) {

    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {

          return Promise.all(
            cacheNames
              .filter((cacheName) => {
                return cacheName.startsWith(
                  "cbc-master-"
                );
              })
              .map((cacheName) => {
                return caches.delete(
                  cacheName
                );
              })
          );
        })
    );
  }
});


/*
|--------------------------------------------------------------------------
| SERVICE WORKER ERROR PROTECTION
|--------------------------------------------------------------------------
| Service-worker errors should not crash the application itself.
|--------------------------------------------------------------------------
*/

self.addEventListener("error", () => {
  /*
   * Intentionally empty.
   *
   * CBC MASTER remains usable through the normal browser
   * application even if a service-worker operation fails.
   */
});
