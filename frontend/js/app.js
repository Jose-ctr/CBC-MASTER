"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2
| Local-First Application Engine
|--------------------------------------------------------------------------
| Privacy principles:
| - No third-party analytics
| - No advertising trackers
| - No automatic cloud sync
| - No personal-data console logging
| - Core workspace stored locally
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Storage
|--------------------------------------------------------------------------
*/

const STORAGE_KEY = "cbc_master_v2";
const STORAGE_VERSION = 2;


/*
|--------------------------------------------------------------------------
| Default Application State
|--------------------------------------------------------------------------
*/

const DEFAULT_STATE = {
  version: STORAGE_VERSION,

  teacher: {
    name: "Teacher",
    school: "",
    phone: "",
    email: ""
  },

  preferences: {
    grade: "Grade 5",
    term: "Term 1",
    year: new Date().getFullYear(),
    lowDataMode: false
  },

  students: [],
  reportBooks: [],
  schemes: [],
  lessonPlans: [],
  rubrics: [],
  documents: [],

  activity: {
    reportBooksCreated: 0,
    schemesCreated: 0,
    lessonPlansCreated: 0,
    rubricsCreated: 0,
    documentsCreated: 0
  },

  updatedAt: null
};


/*
|--------------------------------------------------------------------------
| Page Metadata
|--------------------------------------------------------------------------
*/

const PAGE_TITLES = {
  home: "Home",
  "report-books": "Report Books",
  schemes: "Schemes of Work",
  "lesson-plans": "Lesson Plans",
  rubrics: "Rubrics",
  students: "Students",
  documents: "Documents",
  analytics: "Analytics",
  profile: "Profile",
  settings: "Settings"
};


/*
|--------------------------------------------------------------------------
| Application State
|--------------------------------------------------------------------------
*/

let appState = loadState();


/*
|--------------------------------------------------------------------------
| Utility: Escape HTML
|--------------------------------------------------------------------------
*/

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/*
|--------------------------------------------------------------------------
| Utility: Format Date
|--------------------------------------------------------------------------
*/

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium"
  }).format(date);
}


/*
|--------------------------------------------------------------------------
| Storage: Load
|--------------------------------------------------------------------------
*/

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return structuredClone(DEFAULT_STATE);
    }

    const parsed = JSON.parse(saved);

    return mergeState(DEFAULT_STATE, parsed);

  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}


/*
|--------------------------------------------------------------------------
| Storage: Merge
|--------------------------------------------------------------------------
*/

function mergeState(defaults, saved) {
  if (
    typeof defaults !== "object" ||
    defaults === null ||
    Array.isArray(defaults)
  ) {
    return saved ?? defaults;
  }

  const result = {
    ...defaults
  };

  Object.keys(saved || {}).forEach((key) => {
    if (
      typeof defaults[key] === "object" &&
      defaults[key] !== null &&
      !Array.isArray(defaults[key]) &&
      typeof saved[key] === "object" &&
      saved[key] !== null &&
      !Array.isArray(saved[key])
    ) {
      result[key] = mergeState(defaults[key], saved[key]);
    } else {
      result[key] = saved[key];
    }
  });

  return result;
}


/*
|--------------------------------------------------------------------------
| Storage: Save
|--------------------------------------------------------------------------
*/

function saveState() {
  try {
    appState.updatedAt = new Date().toISOString();

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(appState)
    );

  } catch {
    showStatus(
      "Unable to save local data on this device."
    );
  }
}


/*
|--------------------------------------------------------------------------
| Render Home
|--------------------------------------------------------------------------
*/

function renderHome() {
  const container = document.getElementById("homeContent");

  if (!container) return;

  const students = Array.isArray(appState.students)
    ? appState.students.length
    : 0;

  const reportBooks = Array.isArray(appState.reportBooks)
    ? appState.reportBooks.length
    : 0;

  const schemes = Array.isArray(appState.schemes)
    ? appState.schemes.length
    : 0;

  const lessonPlans = Array.isArray(appState.lessonPlans)
    ? appState.lessonPlans.length
    : 0;

  container.innerHTML = `
    <div class="card card-accent">

      <div class="card-header">

        <div>
          <div class="card-title">
            Welcome to CBC MASTER
          </div>

          <div class="card-subtitle">
            ${escapeHTML(
              appState.teacher.name || "Teacher"
            )}
          </div>
        </div>

        <span class="badge badge-gold">
          ${escapeHTML(appState.preferences.grade)}
        </span>

      </div>

      <div class="row row-wrap">

        <span class="badge">
          ${escapeHTML(appState.preferences.term)}
        </span>

        <span class="badge">
          ${escapeHTML(appState.preferences.year)}
        </span>

        <span class="badge badge-success">
          Local
        </span>

      </div>

    </div>


    <div class="dashboard-grid">

      <div class="dashboard-card">
        <div class="dashboard-card-label">
          Students
        </div>

        <div class="dashboard-card-value">
          ${students}
        </div>

        <div class="dashboard-card-meta">
          Stored on this device
        </div>
      </div>


      <div class="dashboard-card">
        <div class="dashboard-card-label">
          Report Books
        </div>

        <div class="dashboard-card-value">
          ${reportBooks}
        </div>

        <div class="dashboard-card-meta">
          Created locally
        </div>
      </div>


      <div class="dashboard-card">
        <div class="dashboard-card-label">
          Schemes
        </div>

        <div class="dashboard-card-value">
          ${schemes}
        </div>

        <div class="dashboard-card-meta">
          Teaching plans
        </div>
      </div>


      <div class="dashboard-card">
        <div class="dashboard-card-label">
          Lesson Plans
        </div>

        <div class="dashboard-card-value">
          ${lessonPlans}
        </div>

        <div class="dashboard-card-meta">
          Teaching preparation
        </div>
      </div>

    </div>


    <div class="card">

      <div class="card-header">

        <div>
          <div class="card-title">
            Quick access
          </div>

          <div class="card-subtitle">
            Continue working on your CBC documents.
          </div>
        </div>

      </div>


      <div class="grid grid-2">

        <button
          class="btn btn-primary"
          type="button"
          data-page-target="report-books"
        >
          Report Books
        </button>

        <button
          class="btn btn-secondary"
          type="button"
          data-page-target="schemes"
        >
          Schemes
        </button>

        <button
          class="btn btn-secondary"
          type="button"
          data-page-target="lesson-plans"
        >
          Lesson Plans
        </button>

        <button
          class="btn btn-secondary"
          type="button"
          data-page-target="students"
        >
          Students
        </button>

      </div>

    </div>


    <div class="card">

      <div class="card-title">
        Privacy-first workspace
      </div>

      <p class="card-subtitle">
        Your teaching workspace is stored locally on this
        device. CBC MASTER does not require your student
        records to be sent to a third-party service.
      </p>

    </div>
  `;

  bindPageButtons(container);
}


/*
|--------------------------------------------------------------------------
| Render Generic Page
|--------------------------------------------------------------------------
*/

function renderGenericPage(page) {
  const contentIdMap = {
    "report-books": "reportBooksContent",
    schemes: "schemesContent",
    "lesson-plans": "lessonPlansContent",
    rubrics: "rubricsContent",
    students: "studentsContent",
    documents: "documentsContent",
    analytics: "analyticsContent",
    profile: "profileContent"
  };

  const contentId = contentIdMap[page];

  if (!contentId) return;

  const container = document.getElementById(contentId);

  if (!container) return;

  const title = PAGE_TITLES[page] || "CBC MASTER";

  container.innerHTML = `
    <div class="empty-state">

      <div class="empty-state-icon">
        +
      </div>

      <h3>
        ${escapeHTML(title)}
      </h3>

      <p>
        This workspace is ready for your CBC MASTER
        ${escapeHTML(title.toLowerCase())}.
      </p>

    </div>
  `;
}


/*
|--------------------------------------------------------------------------
| Render Profile
|--------------------------------------------------------------------------
*/

function renderProfile() {
  const container = document.getElementById("profileContent");

  if (!container) return;

  container.innerHTML = `
    <div class="card">

      <div class="card-header">

        <div>
          <div class="card-title">
            Teacher Profile
          </div>

          <div class="card-subtitle">
            Your profile is stored locally.
          </div>
        </div>

        <span class="badge badge-success">
          Private
        </span>

      </div>


      <div class="form-group">

        <label
          class="form-label"
          for="teacherName"
        >
          Name
        </label>

        <input
          id="teacherName"
          type="text"
          value="${escapeHTML(appState.teacher.name)}"
          placeholder="Teacher name"
          autocomplete="name"
        >

      </div>


      <div class="form-group">

        <label
          class="form-label"
          for="schoolName"
        >
          School
        </label>

        <input
          id="schoolName"
          type="text"
          value="${escapeHTML(appState.teacher.school)}"
          placeholder="School name"
        >

      </div>


      <div class="form-group">

        <label
          class="form-label"
          for="teacherPhone"
        >
          Phone
        </label>

        <input
          id="teacherPhone"
          type="tel"
          value="${escapeHTML(appState.teacher.phone)}"
          placeholder="+254..."
          autocomplete="tel"
        >

      </div>


      <div class="form-group">

        <label
          class="form-label"
          for="teacherEmail"
        >
          Email
        </label>

        <input
          id="teacherEmail"
          type="email"
          value="${escapeHTML(appState.teacher.email)}"
          placeholder="teacher@example.com"
          autocomplete="email"
        >

      </div>


      <button
        id="saveProfileButton"
        class="btn btn-primary btn-full"
        type="button"
        style="margin-top: 18px;"
      >
        Save Profile
      </button>

    </div>
  `;

  const saveButton = document.getElementById(
    "saveProfileButton"
  );

  if (!saveButton) return;

  saveButton.addEventListener("click", () => {

    appState.teacher.name =
      document.getElementById("teacherName").value.trim() ||
      "Teacher";

    appState.teacher.school =
      document.getElementById("schoolName").value.trim();

    appState.teacher.phone =
      document.getElementById("teacherPhone").value.trim();

    appState.teacher.email =
      document.getElementById("teacherEmail").value.trim();

    saveState();

    showStatus("Profile saved on this device.");

    renderHome();
  });
}


/*
|--------------------------------------------------------------------------
| Render Settings
|--------------------------------------------------------------------------
*/

function renderSettings() {
  const container = document.getElementById("settingsContent");

  if (!container) return;

  container.innerHTML = `
    <div class="settings-list">

      <div class="card">

        <div class="card-title">
          Teaching Preferences
        </div>

        <div class="card-subtitle">
          These preferences are stored locally.
        </div>


        <div class="form-group">

          <label
            class="form-label"
            for="gradeSelect"
          >
            Grade
          </label>

          <select id="gradeSelect">

            <option>PP1</option>
            <option>PP2</option>

            <option>Grade 1</option>
            <option>Grade 2</option>
            <option>Grade 3</option>

            <option>Grade 4</option>
            <option>Grade 5</option>
            <option>Grade 6</option>

            <option>Grade 7</option>
            <option>Grade 8</option>
            <option>Grade 9</option>

            <option>Grade 10</option>
            <option>Grade 11</option>
            <option>Grade 12</option>

          </select>

        </div>


        <div class="form-group">

          <label
            class="form-label"
            for="termSelect"
          >
            Term
          </label>

          <select id="termSelect">

            <option>Term 1</option>
            <option>Term 2</option>
            <option>Term 3</option>

          </select>

        </div>


        <div class="form-group">

          <label
            class="form-label"
            for="yearInput"
          >
            Academic Year
          </label>

          <input
            id="yearInput"
            type="number"
            min="2020"
            max="2100"
            value="${escapeHTML(appState.preferences.year)}"
          >

        </div>


        <button
          id="savePreferencesButton"
          class="btn btn-primary btn-full"
          type="button"
          style="margin-top: 18px;"
        >
          Save Preferences
        </button>

      </div>


      <div class="card">

        <div class="card-title">
          Data & Privacy
        </div>

        <div class="card-subtitle">
          CBC MASTER is designed around local-first
          teaching data storage.
        </div>


        <div class="settings-list" style="margin-top: 16px;">

          <div class="settings-item">

            <div class="settings-item-content">

              <div class="settings-item-title">
                Local-first storage
              </div>

              <div class="settings-item-description">
                Your workspace is stored in this browser
                on this device.
              </div>

            </div>

            <span class="badge badge-success">
              On
            </span>

          </div>


          <div class="settings-item">

            <div class="settings-item-content">

              <div class="settings-item-title">
                Low-data mode
              </div>

              <div class="settings-item-description">
                Reduce unnecessary network activity.
              </div>

            </div>

            <label class="toggle">

              <input
                id="lowDataToggle"
                type="checkbox"
                ${
                  appState.preferences.lowDataMode
                    ? "checked"
                    : ""
                }
              >

              <span class="toggle-track"></span>

            </label>

          </div>

        </div>

      </div>


      <div class="card">

        <div class="card-title">
          Backup
        </div>

        <div class="card-subtitle">
          Export your CBC MASTER workspace so you can
          keep a personal backup.
        </div>

        <button
          id="exportDataButton"
          class="btn btn-secondary btn-full"
          type="button"
          style="margin-top: 15px;"
        >
          Export My Data
        </button>

      </div>


      <div class="danger-zone">

        <h3>
          Delete all data
        </h3>

        <p>
          Permanently delete CBC MASTER teaching data
          stored on this device. This cannot be undone.
        </p>

        <button
          id="deleteDataButton"
          class="btn btn-danger btn-full"
          type="button"
        >
          Delete All CBC MASTER Data
        </button>

      </div>

    </div>
  `;


  const gradeSelect =
    document.getElementById("gradeSelect");

  const termSelect =
    document.getElementById("termSelect");

  const yearInput =
    document.getElementById("yearInput");

  const lowDataToggle =
    document.getElementById("lowDataToggle");

  const savePreferencesButton =
    document.getElementById("savePreferencesButton");

  const exportDataButton =
    document.getElementById("exportDataButton");

  const deleteDataButton =
    document.getElementById("deleteDataButton");


  if (gradeSelect) {
    gradeSelect.value =
      appState.preferences.grade;
  }

  if (termSelect) {
    termSelect.value =
      appState.preferences.term;
  }


  if (savePreferencesButton) {

    savePreferencesButton.addEventListener(
      "click",
      () => {

        appState.preferences.grade =
          gradeSelect.value;

        appState.preferences.term =
          termSelect.value;

        appState.preferences.year =
          Number(yearInput.value) ||
          new Date().getFullYear();

        saveState();

        showStatus(
          "Preferences saved on this device."
        );

        renderHome();
      }
    );
  }


  if (lowDataToggle) {

    lowDataToggle.addEventListener(
      "change",
      () => {

        appState.preferences.lowDataMode =
          lowDataToggle.checked;

        saveState();

        showStatus(
          lowDataToggle.checked
            ? "Low-data mode enabled."
            : "Low-data mode disabled."
        );
      }
    );
  }


  if (exportDataButton) {

    exportDataButton.addEventListener(
      "click",
      exportData
    );
  }


  if (deleteDataButton) {

    deleteDataButton.addEventListener(
      "click",
      deleteAllCBCMasterData
    );
  }
}


/*
|--------------------------------------------------------------------------
| Export Data
|--------------------------------------------------------------------------
*/

function exportData() {
  try {

    const backup = {
      app: "CBC MASTER",
      version: STORAGE_VERSION,
      exportedAt: new Date().toISOString(),
      data: appState
    };

    const json = JSON.stringify(
      backup,
      null,
      2
    );

    const blob = new Blob(
      [json],
      {
        type: "application/json"
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download =
      `cbc-master-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    showStatus(
      "CBC MASTER backup exported."
    );

  } catch {
    showStatus(
      "Unable to export your data."
    );
  }
}


/*
|--------------------------------------------------------------------------
| Delete All Data
|--------------------------------------------------------------------------
*/

async function deleteAllCBCMasterData() {

  const confirmed = window.confirm(
    "Delete all CBC MASTER data stored on this device?\n\n" +
    "This action cannot be undone."
  );

  if (!confirmed) {
    return;
  }

  try {

    /*
    |--------------------------------------------------------------------------
    | Delete primary local storage
    |--------------------------------------------------------------------------
    */

    localStorage.removeItem(
      STORAGE_KEY
    );


    /*
    |--------------------------------------------------------------------------
    | Delete CBC MASTER IndexedDB databases
    |--------------------------------------------------------------------------
    */

    if (
      window.indexedDB &&
      typeof indexedDB.databases === "function"
    ) {

      const databases =
        await indexedDB.databases();

      for (const database of databases) {

        if (!database.name) {
          continue;
        }

        const name =
          database.name.toLowerCase();

        if (
          name === STORAGE_KEY.toLowerCase() ||
          name.includes("cbc_master") ||
          name.includes("cbc-master")
        ) {

          await new Promise((resolve) => {

            const request =
              indexedDB.deleteDatabase(
                database.name
              );

            request.onsuccess = resolve;
            request.onerror = resolve;
            request.onblocked = resolve;

          });
        }
      }
    }


    /*
    |--------------------------------------------------------------------------
    | Delete CBC MASTER caches
    |--------------------------------------------------------------------------
    */

    if ("caches" in window) {

      const cacheNames =
        await caches.keys();

      for (const cacheName of cacheNames) {

        const name =
          cacheName.toLowerCase();

        if (
          name === "cbc-master-v2-cache-v1" ||
          name.includes("cbc-master")
        ) {

          await caches.delete(
            cacheName
          );
        }
      }
    }


    /*
    |--------------------------------------------------------------------------
    | Tell active service worker to clear caches
    |--------------------------------------------------------------------------
    */

    if (
      "serviceWorker" in navigator &&
      navigator.serviceWorker.controller
    ) {

      navigator.serviceWorker.controller.postMessage({
        type: "CLEAR_CBC_MASTER_CACHE"
      });
    }


    /*
    |--------------------------------------------------------------------------
    | Clear additional CBC MASTER localStorage keys
    |--------------------------------------------------------------------------
    */

    const keysToRemove = [];

    for (
      let i = 0;
      i < localStorage.length;
      i++
    ) {

      const key =
        localStorage.key(i);

      if (!key) {
        continue;
      }

      if (
        key === STORAGE_KEY ||
        key.startsWith("cbc_master_") ||
        key.startsWith("cbc-master-")
      ) {

        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });


    /*
    |--------------------------------------------------------------------------
    | Reset in-memory state
    |--------------------------------------------------------------------------
    */

    appState =
      structuredClone(DEFAULT_STATE);


    /*
    |--------------------------------------------------------------------------
    | Notify user
    |--------------------------------------------------------------------------
    */

    window.alert(
      "CBC MASTER data has been deleted from this device."
    );


    /*
    |--------------------------------------------------------------------------
    | Reload
    |--------------------------------------------------------------------------
    */

    window.location.reload();

  } catch {

    window.alert(
      "Some CBC MASTER data could not be deleted completely. " +
      "Please try again."
    );
  }
}


/*
|--------------------------------------------------------------------------
| Navigation
|--------------------------------------------------------------------------
*/

function navigateTo(page) {

  if (!PAGE_TITLES[page]) {
    page = "home";
  }


  /*
  |--------------------------------------------------------------------------
  | Hide all pages
  |--------------------------------------------------------------------------
  */

  document
    .querySelectorAll(".page")
    .forEach((section) => {

      section.hidden =
        section.dataset.page !== page;

      section.classList.toggle(
        "active",
        section.dataset.page === page
      );
    });


  /*
  |--------------------------------------------------------------------------
  | Update navigation
  |--------------------------------------------------------------------------
  */

  document
    .querySelectorAll("[data-page-target]")
    .forEach((button) => {

      button.classList.toggle(
        "active",
        button.dataset.pageTarget === page
      );
    });


  /*
  |--------------------------------------------------------------------------
  | Render page
  |--------------------------------------------------------------------------
  */

  renderPage(page);


  /*
  |--------------------------------------------------------------------------
  | Update document title
  |--------------------------------------------------------------------------
  */

  document.title =
    page === "home"
      ? "CBC MASTER"
      : `${PAGE_TITLES[page]} • CBC MASTER`;


  /*
  |--------------------------------------------------------------------------
  | Scroll to top
  |--------------------------------------------------------------------------
  */

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  /*
  |--------------------------------------------------------------------------
  | Optional URL hash
  |--------------------------------------------------------------------------
  */

  try {

    history.replaceState(
      null,
      "",
      `#${page}`
    );

  } catch {
    /* Ignore browser history limitations. */
  }
}


/*
|--------------------------------------------------------------------------
| Render Page
|--------------------------------------------------------------------------
*/

function renderPage(page) {

  switch (page) {

    case "home":
      renderHome();
      break;

    case "profile":
      renderProfile();
      break;

    case "settings":
      renderSettings();
      break;

    default:
      renderGenericPage(page);
      break;
  }
}


/*
|--------------------------------------------------------------------------
| Bind Navigation Buttons
|--------------------------------------------------------------------------
*/

function bindPageButtons(root = document) {

  root
    .querySelectorAll("[data-page-target]")
    .forEach((button) => {

      if (
        button.dataset.navigationBound === "true"
      ) {
        return;
      }

      button.dataset.navigationBound = "true";

      button.addEventListener(
        "click",
        () => {

          navigateTo(
            button.dataset.pageTarget
          );
        }
      );
    });
}


/*
|--------------------------------------------------------------------------
| Status Message
|--------------------------------------------------------------------------
*/

let statusTimer = null;

function showStatus(message) {

  const status =
    document.getElementById(
      "offlineStatus"
    );

  if (!status) {
    return;
  }

  status.textContent = message;

  status.hidden = false;


  clearTimeout(statusTimer);

  statusTimer =
    setTimeout(() => {

      status.hidden = true;

    }, 3000);
}


/*
|--------------------------------------------------------------------------
| Online / Offline Status
|--------------------------------------------------------------------------
*/

function updateNetworkStatus() {

  if (navigator.onLine) {

    showStatus(
      "Online"
    );

  } else {

    showStatus(
      "Offline mode"
    );
  }
}


/*
|--------------------------------------------------------------------------
| PWA Install Prompt
|--------------------------------------------------------------------------
*/

let deferredInstallPrompt = null;

function setupInstallPrompt() {

  const installButton =
    document.getElementById(
      "installButton"
    );

  if (!installButton) {
    return;
  }


  window.addEventListener(
    "beforeinstallprompt",
    (event) => {

      event.preventDefault();

      deferredInstallPrompt = event;

      installButton.hidden = false;
    }
  );


  installButton.addEventListener(
    "click",
    async () => {

      if (!deferredInstallPrompt) {
        return;
      }

      deferredInstallPrompt.prompt();

      await deferredInstallPrompt.userChoice;

      deferredInstallPrompt = null;

      installButton.hidden = true;
    }
  );


  window.addEventListener(
    "appinstalled",
    () => {

      deferredInstallPrompt = null;

      installButton.hidden = true;
    }
  );
}


/*
|--------------------------------------------------------------------------
| Service Worker
|--------------------------------------------------------------------------
*/

function registerServiceWorker() {

  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener(
    "load",
    async () => {

      try {

        await navigator.serviceWorker.register(
          "./sw.js"
        );

      } catch {
        /*
         * Do not expose unnecessary technical
         * information to the user.
         */
      }
    }
  );
}


/*
|--------------------------------------------------------------------------
| Initialisation
|--------------------------------------------------------------------------
*/

function initializeApp() {

  bindPageButtons();

  renderPage("home");

  setupInstallPrompt();

  registerServiceWorker();

  window.addEventListener(
    "online",
    updateNetworkStatus
  );

  window.addEventListener(
    "offline",
    updateNetworkStatus
  );

  /*
  |--------------------------------------------------------------------------
  | Initial network state
  |--------------------------------------------------------------------------
  */

  if (!navigator.onLine) {
    showStatus("Offline mode");
  }
}


/*
|--------------------------------------------------------------------------
| Start
|--------------------------------------------------------------------------
*/

if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    initializeApp
  );

} else {

  initializeApp();
}
