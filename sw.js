"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2
| Service Worker
|--------------------------------------------------------------------------
| Local-first / offline-first PWA
|
| Privacy principles:
| - No third-party requests
| - No analytics
| - No tracking
| - No personal-data logging
| - Same-origin resources only
|--------------------------------------------------------------------------
*/

const CACHE_NAME =
  "cbc-master-v2-cache-v4";


const APP_SHELL = [

  "./",

  "./index.html",

  "./css/app.css",

  "./js/app.js",

  "./js/students.js",

  "./js/report-books.js",

  "./manifest.json",

  "./icons/icon-192.png",

  "./icons/icon-512.png"

];


/*
|--------------------------------------------------------------------------
| Install
|--------------------------------------------------------------------------
*/

self.addEventListener(
  "install",
  (event) => {

    event.waitUntil(

      caches
        .open(
          CACHE_NAME
        )

        .then(
          (cache) =>
            cache.addAll(
              APP_SHELL
            )
        )

        .then(
          () =>
            self.skipWaiting()
        )

    );

  }
);


/*
|--------------------------------------------------------------------------
| Activate
|--------------------------------------------------------------------------
*/

self.addEventListener(
  "activate",
  (event) => {

    event.waitUntil(

      caches
        .keys()

        .then(
          (cacheNames) =>

            Promise.all(

              cacheNames

                .filter(
                  (cacheName) =>
                    cacheName !==
                    CACHE_NAME
                )

                .map(
                  (cacheName) =>
                    caches.delete(
                      cacheName
                    )
                )

            )

        )

        .then(
          () =>
            self.clients.claim()
        )

    );

  }
);


/*
|--------------------------------------------------------------------------
| Fetch
|--------------------------------------------------------------------------
*/

self.addEventListener(
  "fetch",
  (event) => {

    const request =
      event.request;


    /*
     * Only handle GET requests.
     */

    if (
      request.method !==
      "GET"
    ) {

      return;

    }


    const requestUrl =
      new URL(
        request.url
      );


    /*
     * Never intercept external requests.
     */

    if (
      requestUrl.origin !==
      self.location.origin
    ) {

      return;

    }


    /*
     * HTML navigation:
     *
     * Network first so a new deployment
     * can update the application shell.
     *
     * If offline, use the cached index.
     */

    if (

      request.mode ===
        "navigate" ||

      requestUrl.pathname.endsWith(
        "/index.html"
      )

    ) {

      event.respondWith(

        fetch(request)

          .then(
            (response) => {

              if (

                response &&

                response.status ===
                  200

              ) {

                const responseClone =
                  response.clone();


                caches

                  .open(
                    CACHE_NAME
                  )

                  .then(
                    (cache) =>

                      cache.put(
                        request,
                        responseClone
                      )

                  )

                  .catch(
                    () => {}
                  );

              }


              return response;

            }
          )

          .catch(
            () =>
              caches.match(
                "./index.html"
              )
          )

      );


      return;

    }


    /*
     * Static application resources:
     *
     * Cache first.
     */

    event.respondWith(

      caches

        .match(
          request
        )

        .then(
          (cachedResponse) => {

            if (
              cachedResponse
            ) {

              return cachedResponse;

            }


            return fetch(request)

              .then(
                (response) => {

                  /*
                   * Only cache successful
                   * same-origin basic responses.
                   */

                  if (

                    !response ||

                    response.status !==
                      200 ||

                    response.type !==
                      "basic"

                  ) {

                    return response;

                  }


                  const responseClone =
                    response.clone();


                  caches

                    .open(
                      CACHE_NAME
                    )

                    .then(
                      (cache) =>

                        cache.put(
                          request,
                          responseClone
                        )

                    )

                    .catch(
                      () => {}
                    );


                  return response;

                }
              )

              .catch(
                () =>
                  caches.match(
                    "./index.html"
                  )
              );

          }
        )

    );

  }
);
