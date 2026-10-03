"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2
| Timetable Storage
|--------------------------------------------------------------------------
| Local-only timetable storage.
| Uses the main CBC MASTER localStorage data store.
|--------------------------------------------------------------------------
*/

(function () {
  const STORAGE_API = () => window.CBCMaster;

  const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday"
  ];

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  function getData() {
    const api = STORAGE_API();

    if (!api || typeof api.getData !== "function") {
      return {
        timetable: []
      };
    }

    const data = api.getData();

    if (!data || typeof data !== "object") {
      return {
        timetable: []
      };
    }

    if (!Array.isArray(data.timetable)) {
      data.timetable = [];
    }

    return data;
  }

  function saveData(data) {
    const api = STORAGE_API();

    if (!api || typeof api.saveData !== "function") {
      throw new Error("CBC MASTER storage is not available.");
    }

    api.saveData(data);
  }

  function createId() {
    const api = STORAGE_API();

    if (api && typeof api.createId === "function") {
      return api.createId("timetable");
    }

    return (
      "timetable_" +
      Date.now() +
      "_" +
      Math.random().toString(36).slice(2, 8)
    );
  }

  function normaliseText(value) {
    return String(value ?? "").trim();
  }

  function timeToMinutes(value) {
    const match = /^(\d{2}):(\d{2})$/.exec(value);

    if (!match) {
      return null;
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (
      !Number.isInteger(hours) ||
      !Number.isInteger(minutes) ||
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
  | Validation
  |--------------------------------------------------------------------------
  */

  function validateEntry(entry, existingEntries = [], editingId = null) {
    const day = normaliseText(entry.day);
    const subject = normaliseText(entry.subject);
    const grade = normaliseText(entry.grade);
    const start = normaliseText(entry.start);
    const end = normaliseText(entry.end);
    const teacher = normaliseText(entry.teacher);
    const room = normaliseText(entry.room);

    if (!DAYS.includes(day)) {
      return {
        valid: false,
        message: "Select a valid school day."
      };
    }

    if (!subject) {
      return {
        valid: false,
        message: "Enter the subject."
      };
    }

    if (!grade) {
      return {
        valid: false,
        message: "Enter the grade or class."
      };
    }

    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);

    if (startMinutes === null || endMinutes === null) {
      return {
        valid: false,
        message: "Enter valid start and end times."
      };
    }

    if (endMinutes <= startMinutes) {
      return {
        valid: false,
        message: "End time must be after start time."
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Prevent overlapping lessons for the same grade/class.
    |--------------------------------------------------------------------------
    */

    const hasOverlap = existingEntries.some((item) => {
      if (!item || item.id === editingId) {
        return false;
      }

      if (
        normaliseText(item.day) !== day ||
        normaliseText(item.grade).toLowerCase() !== grade.toLowerCase()
      ) {
        return false;
      }

      const existingStart = timeToMinutes(item.start);
      const existingEnd = timeToMinutes(item.end);

      if (
        existingStart === null ||
        existingEnd === null
      ) {
        return false;
      }

      return (
        startMinutes < existingEnd &&
        endMinutes > existingStart
      );
    });

    if (hasOverlap) {
      return {
        valid: false,
        message: "This class already has a lesson during that time."
      };
    }

    return {
      valid: true,
      value: {
        day,
        subject,
        grade,
        start,
        end,
        teacher,
        room
      }
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Read
  |--------------------------------------------------------------------------
  */

  function getEntries() {
    const data = getData();

    return Array.isArray(data.timetable)
      ? [...data.timetable]
      : [];
  }

  function getByDay(day) {
    return getEntries()
      .filter((entry) => entry.day === day)
      .sort((a, b) => {
        return (
          (timeToMinutes(a.start) ?? 9999) -
          (timeToMinutes(b.start) ?? 9999)
        );
      });
  }

  function getByDayAndGrade(day, grade) {
    const targetGrade = normaliseText(grade).toLowerCase();

    return getByDay(day).filter((entry) => {
      return normaliseText(entry.grade).toLowerCase() === targetGrade;
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Create
  |--------------------------------------------------------------------------
  */

  function saveEntry(input) {
    const data = getData();

    const validation = validateEntry(
      input,
      data.timetable,
      null
    );

    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const now = new Date().toISOString();

    const entry = {
      id: createId(),
      ...validation.value,
      createdAt: now,
      updatedAt: now
    };

    data.timetable.push(entry);

    saveData(data);

    return entry;
  }

  /*
  |--------------------------------------------------------------------------
  | Update
  |--------------------------------------------------------------------------
  */

  function updateEntry(id, input) {
    const data = getData();

    const index = data.timetable.findIndex(
      (entry) => entry.id === id
    );

    if (index === -1) {
      throw new Error("Timetable entry not found.");
    }

    const validation = validateEntry(
      input,
      data.timetable,
      id
    );

    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const existing = data.timetable[index];

    data.timetable[index] = {
      ...existing,
      ...validation.value,
      updatedAt: new Date().toISOString()
    };

    saveData(data);

    return data.timetable[index];
  }

  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

  function deleteEntry(id) {
    const data = getData();

    const originalLength = data.timetable.length;

    data.timetable = data.timetable.filter(
      (entry) => entry.id !== id
    );

    if (data.timetable.length === originalLength) {
      return false;
    }

    saveData(data);

    return true;
  }

  /*
  |--------------------------------------------------------------------------
  | Clear all timetable entries
  |--------------------------------------------------------------------------
  */

  function clear() {
    const data = getData();

    data.timetable = [];

    saveData(data);
  }

  /*
  |--------------------------------------------------------------------------
  | Public API
  |--------------------------------------------------------------------------
  */

  window.CBCMasterTimetableStorage = {
    DAYS,
    getEntries,
    getByDay,
    getByDayAndGrade,
    saveEntry,
    updateEntry,
    deleteEntry,
    validateEntry,
    clear,
    timeToMinutes
  };
})();
