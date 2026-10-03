"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2
| Live Timetable Clock
|--------------------------------------------------------------------------
| Local Kenya/EAT time engine.
| No network requests.
|--------------------------------------------------------------------------
*/

(function () {

  const TIME_ZONE = "Africa/Nairobi";

  const DAY_NAMES = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  let timer = null;
  let subscribers = new Set();

  /*
  |--------------------------------------------------------------------------
  | Kenya time
  |--------------------------------------------------------------------------
  */

  function getKenyaNow() {
    const now = new Date();

    const parts = new Intl.DateTimeFormat("en-KE", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).formatToParts(now);

    const values = {};

    parts.forEach((part) => {
      if (part.type !== "literal") {
        values[part.type] = part.value;
      }
    });

    let hour = Number(values.hour);

    /*
     * Some environments can return 24 for midnight.
     */
    if (hour === 24) {
      hour = 0;
    }

    return {
      date: new Date(
        Date.UTC(
          Number(values.year),
          Number(values.month) - 1,
          Number(values.day),
          hour,
          Number(values.minute),
          Number(values.second)
        )
      ),
      year: Number(values.year),
      month: Number(values.month),
      day: Number(values.day),
      weekday: values.weekday,
      hour,
      minute: Number(values.minute),
      second: Number(values.second)
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Current school day
  |--------------------------------------------------------------------------
  */

  function getCurrentDay() {
    return getKenyaNow().weekday;
  }

  /*
  |--------------------------------------------------------------------------
  | Convert HH:MM to minutes
  |--------------------------------------------------------------------------
  */

  function timeToMinutes(value) {
    if (!value) {
      return null;
    }

    const match = /^(\d{2}):(\d{2})$/.exec(String(value));

    if (!match) {
      return null;
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return null;
    }

    return hours * 60 + minutes;
  }

  /*
  |--------------------------------------------------------------------------
  | Current time in minutes
  |--------------------------------------------------------------------------
  */

  function getCurrentMinutes() {
    const now = getKenyaNow();

    return (
      now.hour * 60 +
      now.minute +
      now.second / 60
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Find current and next lesson
  |--------------------------------------------------------------------------
  */

  function getCurrentAndNext(entries) {
    const safeEntries = Array.isArray(entries)
      ? entries
      : [];

    const now = getKenyaNow();
    const currentMinutes = getCurrentMinutes();

    const todayEntries = safeEntries
      .filter((entry) => {
        return (
          entry &&
          entry.day === now.weekday
        );
      })
      .map((entry) => {
        return {
          ...entry,
          startMinutes: timeToMinutes(entry.start),
          endMinutes: timeToMinutes(entry.end)
        };
      })
      .filter((entry) => {
        return (
          entry.startMinutes !== null &&
          entry.endMinutes !== null
        );
      })
      .sort((a, b) => {
        return a.startMinutes - b.startMinutes;
      });

    let current = null;
    let next = null;

    for (const entry of todayEntries) {

      if (
        currentMinutes >= entry.startMinutes &&
        currentMinutes < entry.endMinutes
      ) {
        current = entry;
        continue;
      }

      if (
        entry.startMinutes > currentMinutes &&
        !next
      ) {
        next = entry;
      }
    }

    return {
      current,
      next,
      day: now.weekday,
      now
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Seconds until a lesson ends
  |--------------------------------------------------------------------------
  */

  function getSecondsUntilEnd(entry) {
    if (!entry) {
      return 0;
    }

    const now = getKenyaNow();

    const currentSeconds =
      now.hour * 3600 +
      now.minute * 60 +
      now.second;

    const endMinutes = timeToMinutes(entry.end);

    if (endMinutes === null) {
      return 0;
    }

    const endSeconds = endMinutes * 60;

    return Math.max(
      0,
      endSeconds - currentSeconds
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Seconds until next lesson
  |--------------------------------------------------------------------------
  */

  function getSecondsUntilStart(entry) {
    if (!entry) {
      return 0;
    }

    const now = getKenyaNow();

    const currentSeconds =
      now.hour * 3600 +
      now.minute * 60 +
      now.second;

    const startMinutes = timeToMinutes(entry.start);

    if (startMinutes === null) {
      return 0;
    }

    const startSeconds = startMinutes * 60;

    return Math.max(
      0,
      startSeconds - currentSeconds
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Countdown formatting
  |--------------------------------------------------------------------------
  */

  function formatCountdown(totalSeconds) {
    const seconds = Math.max(
      0,
      Math.floor(Number(totalSeconds) || 0)
    );

    const hours = Math.floor(seconds / 3600);

    const minutes = Math.floor(
      (seconds % 3600) / 60
    );

    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return (
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainingSeconds).padStart(2, "0")
      );
    }

    return (
      String(minutes).padStart(2, "0") +
      ":" +
      String(remainingSeconds).padStart(2, "0")
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Clock display
  |--------------------------------------------------------------------------
  */

  function formatClock() {
    const now = getKenyaNow();

    return (
      String(now.hour).padStart(2, "0") +
      ":" +
      String(now.minute).padStart(2, "0") +
      ":" +
      String(now.second).padStart(2, "0")
    );
  }

  function formatDate() {
    const now = getKenyaNow();

    return new Intl.DateTimeFormat("en-KE", {
      timeZone: TIME_ZONE,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(
      new Date(
        Date.UTC(
          now.year,
          now.month - 1,
          now.day
        )
      )
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Notify subscribers
  |--------------------------------------------------------------------------
  */

  function notify() {
    const payload = {
      now: getKenyaNow(),
      clock: formatClock(),
      date: formatDate()
    };

    subscribers.forEach((callback) => {
      try {
        callback(payload);
      } catch (error) {
        /*
         * Keep one subscriber from stopping
         * the timetable clock.
         */
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Start
  |--------------------------------------------------------------------------
  */

  function start() {
    stop();

    notify();

    timer = window.setInterval(
      notify,
      1000
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Stop
  |--------------------------------------------------------------------------
  */

  function stop() {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Subscribe
  |--------------------------------------------------------------------------
  */

  function subscribe(callback) {
    if (typeof callback !== "function") {
      return () => {};
    }

    subscribers.add(callback);

    return function unsubscribe() {
      subscribers.delete(callback);
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Public API
  |--------------------------------------------------------------------------
  */

  window.CBCMasterTimetableClock = {
    TIME_ZONE,
    DAY_NAMES,
    getKenyaNow,
    getCurrentDay,
    getCurrentMinutes,
    timeToMinutes,
    getCurrentAndNext,
    getSecondsUntilEnd,
    getSecondsUntilStart,
    formatCountdown,
    formatClock,
    formatDate,
    start,
    stop,
    subscribe
  };

})();
