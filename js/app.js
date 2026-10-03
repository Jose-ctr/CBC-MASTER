"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2
| Local-first application engine
|--------------------------------------------------------------------------
| Privacy principles:
| - No third-party analytics
| - No advertising trackers
| - No automatic cloud sync
| - No personal-data console logging
| - Teaching records remain local
|--------------------------------------------------------------------------
*/

(function () {
  /*
  |--------------------------------------------------------------------------
  | Constants
  |--------------------------------------------------------------------------
  */

  const STORAGE_KEY = "cbc_master_v2";
  const STORAGE_VERSION = 2;

  const PAGE_TITLES = {
    dashboard: "Dashboard",
    "report-books": "Report Books",
    schemes: "Schemes of Work",
    "lesson-plans": "Lesson Plans",
    rubrics: "Assessment Rubrics",
    students: "Students",
    timetable: "Timetable",
    documents: "Saved Documents",
    analytics: "Analytics",
    profile: "Profile",
    settings: "Settings"
  };

  /*
  |--------------------------------------------------------------------------
  | DOM helpers
  |--------------------------------------------------------------------------
  */

  function $(selector) {
    if (typeof selector !== "string") {
      return null;
    }

    const value = selector.trim();

    if (!value) {
      return null;
    }

    /*
     * CBC MASTER modules commonly call:
     *
     * API.$("studentFormCard")
     *
     * Treat a plain identifier as an element ID.
     *
     * Selectors such as:
     *
     * $("#studentFormCard")
     * [data-page="students"]
     *
     * still work normally.
     */
    if (/^[A-Za-z][A-Za-z0-9_-]*$/.test(value)) {
      return document.getElementById(value);
    }

    try {
      return document.querySelector(value);
    } catch (_) {
      return null;
    }
  }

  function $$(selector) {
    if (typeof selector !== "string") {
      return [];
    }

    try {
      return Array.from(document.querySelectorAll(selector));
    } catch (_) {
      return [];
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Text helpers
  |--------------------------------------------------------------------------
  */

  function cleanDisplayText(value) {
    return String(value ?? "")
      .replace(/\s+/g, " ")
      .trim();
  }

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
  | ID generator
  |--------------------------------------------------------------------------
  */

  function createId(prefix = "item") {
    const randomPart =
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 10)}`;

    return `${prefix}_${randomPart}`;
  }

  /*
  |--------------------------------------------------------------------------
  | Default data
  |--------------------------------------------------------------------------
  */

  function createDefaultData() {
    return {
      version: STORAGE_VERSION,

      teacher: {
        name: "Teacher",
        school: "",
        county: "",
        role: "Teacher"
      },

      preferences: {
        grade: "Grade 5",
        term: "Term 1",
        academicYear: String(new Date().getFullYear()),
        lowDataMode: false
      },

      students: [],
      reportBooks: [],
      schemes: [],
      lessonPlans: [],
      rubrics: [],
      documents: [],
      timetable: [],

      activities: [],

      settings: {
        theme: "dark",
        notifications: true
      }
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Data normalization
  |--------------------------------------------------------------------------
  */

  function normalizeData(data) {
    const defaults = createDefaultData();

    if (!data || typeof data !== "object") {
      return defaults;
    }

    const result = {
      ...defaults,
      ...data
    };

    result.version = STORAGE_VERSION;

    result.teacher = {
      ...defaults.teacher,
      ...(data.teacher || {})
    };

    result.preferences = {
      ...defaults.preferences,
      ...(data.preferences || {})
    };

    result.settings = {
      ...defaults.settings,
      ...(data.settings || {})
    };

    const arrayKeys = [
      "students",
      "reportBooks",
      "schemes",
      "lessonPlans",
      "rubrics",
      "documents",
      "timetable",
      "activities"
    ];

    arrayKeys.forEach((key) => {
      if (!Array.isArray(result[key])) {
        result[key] = [];
      }
    });

    return result;
  }

  /*
  |--------------------------------------------------------------------------
  | Storage
  |--------------------------------------------------------------------------
  */

  function getData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return createDefaultData();
      }

      return normalizeData(JSON.parse(raw));
    } catch (_) {
      return createDefaultData();
    }
  }

  function saveData(data) {
    try {
      const normalized = normalizeData(data);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(normalized)
      );

      return true;
    } catch (_) {
      showToast(
        "Could not save your local data. Please check available storage.",
        true
      );

      return false;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Activity history
  |--------------------------------------------------------------------------
  */

  function addActivity(message) {
    const cleanMessage = cleanDisplayText(message);

    if (!cleanMessage) {
      return;
    }

    const data = getData();

    if (!Array.isArray(data.activities)) {
      data.activities = [];
    }

    data.activities.unshift({
      id: createId("activity"),
      message: cleanMessage,
      createdAt: new Date().toISOString()
    });

    data.activities = data.activities.slice(0, 50);

    saveData(data);
  }

  /*
  |--------------------------------------------------------------------------
  | Toast
  |--------------------------------------------------------------------------
  */

  let toastTimer = null;

  function showToast(message, isError = false) {
    const text = cleanDisplayText(message);

    if (!text) {
      return;
    }

    let toast = $("appToast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "appToast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");

      document.body.appendChild(toast);
    }

    toast.textContent = text;
    toast.dataset.type = isError ? "error" : "success";

    toast.hidden = false;
    toast.removeAttribute("hidden");

    clearTimeout(toastTimer);

    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
      toast.setAttribute("hidden", "");
    }, 2800);
  }

  /*
  |--------------------------------------------------------------------------
  | Page navigation
  |--------------------------------------------------------------------------
  */

  function setActiveNavigation(page) {
    $$("[data-page]").forEach((item) => {
      const isActive = item.dataset.page === page;

      item.classList.toggle("active", isActive);

      if (isActive) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    });
  }

  function updatePageTitle(page) {
    const title = PAGE_TITLES[page] || "CBC MASTER";

    const pageTitle =
      $("pageTitle") ||
      $(".page-title") ||
      $("[data-page-title]");

    if (pageTitle) {
      pageTitle.textContent = title;
    }

    if (document.title !== `CBC MASTER V2 • ${title}`) {
      document.title = `CBC MASTER V2 • ${title}`;
    }
  }

  function hideAllPages() {
    $$("[data-page-section]").forEach((section) => {
      section.hidden = true;
      section.setAttribute("hidden", "");
    });
  }

  function showPage(page) {
    const section = $(
      `[data-page-section="${CSS.escape(page)}"]`
    );

    if (!section) {
      return false;
    }

    hideAllPages();

    section.hidden = false;
    section.removeAttribute("hidden");

    setActiveNavigation(page);
    updatePageTitle(page);

    window.scrollTo({
      top: 0,
      behavior: "auto"
    });

    return true;
  }

  function navigateTo(page) {
    const target = cleanDisplayText(page);

    if (!target) {
      return;
    }

    const shown = showPage(target);

    if (!shown) {
      return;
    }

    try {
      history.replaceState(
        {
          page: target
        },
        "",
        `#${encodeURIComponent(target)}`
      );
    } catch (_) {
      /* Ignore history errors. */
    }

    refreshModules(target);
  }

  function getInitialPage() {
    const hash = window.location.hash.replace(/^#/, "");

    if (!hash) {
      return "dashboard";
    }

    try {
      const decoded = decodeURIComponent(hash);

      if (PAGE_TITLES[decoded]) {
        return decoded;
      }
    } catch (_) {
      /* Ignore malformed hash. */
    }

    return "dashboard";
  }

  /*
  |--------------------------------------------------------------------------
  | Module refresh
  |--------------------------------------------------------------------------
  */

  function callModuleRender(moduleName) {
    const module = window[moduleName];

    if (!module || typeof module.render !== "function") {
      return;
    }

    try {
      module.render();
    } catch (_) {
      /* Module failures must not break the whole application. */
    }
  }

  function refreshModules(page = "") {
    callModuleRender("CBCMasterStudents");
    callModuleRender("CBCMasterReportBooks");
    callModuleRender("CBCMasterSchemes");
    callModuleRender("CBCMasterLessonPlans");
    callModuleRender("CBCMasterRubrics");
    callModuleRender("CBCMasterDocuments");
    callModuleRender("CBCMasterAnalytics");
    callModuleRender("CBCMasterProfile");

    if (
      page === "timetable" &&
      window.CBCMasterTimetable &&
      typeof window.CBCMasterTimetable.render === "function"
    ) {
      try {
        window.CBCMasterTimetable.render();
      } catch (_) {
        /* Ignore timetable refresh errors. */
      }
    }

    updateDashboard();
  }

  function refresh() {
    const currentPage =
      document.querySelector(
        "[data-page-section]:not([hidden])"
      )?.dataset.pageSection || "dashboard";

    refreshModules(currentPage);
  }

  /*
  |--------------------------------------------------------------------------
  | Dashboard
  |--------------------------------------------------------------------------
  */

  function updateElementText(id, value) {
    const element = $(id);

    if (element) {
      element.textContent = String(value);
    }
  }

  function updateDashboard() {
    const data = getData();

    updateElementText(
      "dashboardStudentCount",
      data.students.length
    );

    updateElementText(
      "dashboardReportBookCount",
      data.reportBooks.length
    );

    updateElementText(
      "dashboardSchemeCount",
      data.schemes.length
    );

    updateElementText(
      "dashboardLessonPlanCount",
      data.lessonPlans.length
    );

    updateElementText(
      "dashboardRubricCount",
      data.rubrics.length
    );

    updateElementText(
      "dashboardDocumentCount",
      data.documents.length
    );

    updateElementText(
      "studentCount",
      data.students.length
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Quick Actions
  |--------------------------------------------------------------------------
  */

  function waitForStudentsModule(callback) {
    const started = Date.now();
    const timeout = 5000;

    function check() {
      const studentsModule = window.CBCMasterStudents;

      if (
        studentsModule &&
        typeof studentsModule.open === "function"
      ) {
        callback(studentsModule);
        return;
      }

      if (Date.now() - started >= timeout) {
        showToast(
          "Learner module could not be loaded. Please refresh the app.",
          true
        );
        return;
      }

      window.setTimeout(check, 50);
    }

    check();
  }

  function openAddLearner() {
    /*
     * First move to Students.
     */
    navigateTo("students");

    /*
     * Then wait for students.js to expose its public API.
     */
    waitForStudentsModule((studentsModule) => {
      studentsModule.open();

      /*
       * Extra fallback:
       * If the module opened the form but navigation/rendering
       * happened after this call, make sure the form is visible.
       */
      const formCard = $("studentFormCard");

      if (formCard) {
        formCard.hidden = false;
        formCard.removeAttribute("hidden");

        const nameField = $("studentName");

        if (nameField) {
          window.setTimeout(() => {
            nameField.focus();
          }, 50);
        }
      }
    });
  }

  function runQuickAction(action) {
    switch (action) {
      case "add-student":
        openAddLearner();
        break;

      case "create-report-book":
        navigateTo("report-books");

        window.setTimeout(() => {
          const module = window.CBCMasterReportBooks;

          if (module && typeof module.open === "function") {
            module.open();
          }
        }, 100);

        break;

      case "create-scheme":
        navigateTo("schemes");

        window.setTimeout(() => {
          const module = window.CBCMasterSchemes;

          if (module && typeof module.open === "function") {
            module.open();
          }
        }, 100);

        break;

      case "create-lesson-plan":
        navigateTo("lesson-plans");

        window.setTimeout(() => {
          const module = window.CBCMasterLessonPlans;

          if (
            module &&
            typeof module.open === "function"
          ) {
            module.open();
          }
        }, 100);

        break;

      default:
        break;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Navigation events
  |--------------------------------------------------------------------------
  */

  function bindNavigation() {
    $$("[data-page]").forEach((item) => {
      item.addEventListener("click", (event) => {
        event.preventDefault();

        const page = item.dataset.page;

        if (!page) {
          return;
        }

        navigateTo(page);
      });
    });
  }

  function bindQuickActions() {
    $$("[data-action]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();

        const action = button.dataset.action;

        if (!action) {
          return;
        }

        runQuickAction(action);
      });
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Mobile navigation
  |--------------------------------------------------------------------------
  */

  function bindMobileNavigation() {
    const menuButton =
      $("menuButton") ||
      $("mobileMenuButton") ||
      $("[data-action='toggle-menu']");

    const sidebar =
      $("sidebar") ||
      $(".sidebar");

    if (!menuButton || !sidebar) {
      return;
    }

    menuButton.addEventListener("click", () => {
      sidebar.classList.toggle("open");

      const isOpen = sidebar.classList.contains("open");

      menuButton.setAttribute(
        "aria-expanded",
        String(isOpen)
      );
    });

    $$("[data-page]").forEach((item) => {
      item.addEventListener("click", () => {
        sidebar.classList.remove("open");
        menuButton.setAttribute(
          "aria-expanded",
          "false"
        );
      });
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Settings
  |--------------------------------------------------------------------------
  */

  function bindSettings() {
    const lowDataMode =
      $("lowDataMode") ||
      $("settingsLowDataMode");

    if (lowDataMode) {
      const data = getData();

      lowDataMode.checked =
        data.preferences.lowDataMode === true;

      lowDataMode.addEventListener("change", () => {
        const current = getData();

        current.preferences.lowDataMode =
          lowDataMode.checked;

        saveData(current);

        addActivity(
          lowDataMode.checked
            ? "Enabled low-data mode"
            : "Disabled low-data mode"
        );

        showToast(
          lowDataMode.checked
            ? "Low-data mode enabled."
            : "Low-data mode disabled."
        );
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Backup
  |--------------------------------------------------------------------------
  */

  function exportBackup() {
    const data = getData();

    const payload = {
      app: "CBC MASTER V2",
      version: STORAGE_VERSION,
      exportedAt: new Date().toISOString(),
      data
    };

    const blob = new Blob(
      [JSON.stringify(payload, null, 2)],
      {
        type: "application/json"
      }
    );

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download =
      `cbc-master-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);

    showToast("Backup exported successfully.");
  }

  function importBackup(file) {
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);

        const imported =
          parsed && parsed.data
            ? parsed.data
            : parsed;

        const normalized = normalizeData(imported);

        const confirmed = window.confirm(
          "Restore this backup? Existing local CBC MASTER data will be replaced."
        );

        if (!confirmed) {
          return;
        }

        if (!saveData(normalized)) {
          return;
        }

        addActivity("Restored local backup");

        showToast(
          "Backup restored successfully."
        );

        window.setTimeout(() => {
          window.location.reload();
        }, 500);
      } catch (_) {
        showToast(
          "The selected backup file is invalid.",
          true
        );
      }
    };

    reader.onerror = () => {
      showToast(
        "Could not read the backup file.",
        true
      );
    };

    reader.readAsText(file);
  }

  function bindBackupControls() {
    const exportButton =
      $("exportDataButton") ||
      $("exportBackupButton") ||
      $("[data-action='export-data']");

    const importButton =
      $("importDataButton") ||
      $("importBackupButton") ||
      $("[data-action='import-data']");

    const importInput =
      $("importDataInput") ||
      $("backupFileInput");

    if (exportButton) {
      exportButton.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          exportBackup();
        }
      );
    }

    if (importButton && importInput) {
      importButton.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          importInput.click();
        }
      );

      importInput.addEventListener(
        "change",
        () => {
          importBackup(importInput.files?.[0]);
          importInput.value = "";
        }
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Delete local data
  |--------------------------------------------------------------------------
  */

  function deleteAllLocalData() {
    const confirmed = window.confirm(
      "Delete all CBC MASTER local data? This cannot be undone unless you have a backup."
    );

    if (!confirmed) {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);

      showToast(
        "All local CBC MASTER data has been deleted."
      );

      window.setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (_) {
      showToast(
        "Could not delete local data.",
        true
      );
    }
  }

  function bindDeleteDataControl() {
    const button =
      $("deleteAllDataButton") ||
      $("deleteLocalDataButton") ||
      $("[data-action='delete-data']");

    if (!button) {
      return;
    }

    button.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        deleteAllLocalData();
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Keyboard support
  |--------------------------------------------------------------------------
  */

  function bindKeyboardShortcuts() {
    document.addEventListener("keydown", (event) => {
      /*
       * Do not trigger shortcuts while typing.
       */
      const target = event.target;

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable
      ) {
        return;
      }

      /*
       * A = Add learner
       */
      if (
        event.key.toLowerCase() === "a" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        event.preventDefault();
        openAddLearner();
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Service worker
  |--------------------------------------------------------------------------
  */

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    window.addEventListener(
      "load",
      () => {
        navigator.serviceWorker
          .register("./sw.js")
          .catch(() => {
            /*
             * Offline support is optional at runtime.
             * Do not expose technical errors to users.
             */
          });
      },
      { once: true }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Public API
  |--------------------------------------------------------------------------
  */

  window.CBCMaster = Object.freeze({
    $,
    $$,

    STORAGE_KEY,
    STORAGE_VERSION,

    cleanDisplayText,
    escapeHTML,

    createId,

    getData,
    saveData,

    addActivity,

    showToast,

    navigateTo,
    refresh,

    updateDashboard,

    exportBackup,
    importBackup,

    deleteAllLocalData
  });

  /*
  |--------------------------------------------------------------------------
  | Initialization
  |--------------------------------------------------------------------------
  */

  function init() {
    /*
     * Make sure the data structure exists.
     */
    const existing = localStorage.getItem(STORAGE_KEY);

    if (!existing) {
      saveData(createDefaultData());
    } else {
      /*
       * Normalize existing records without destroying them.
       */
      saveData(getData());
    }

    /*
     * Bind core UI.
     */
    bindNavigation();
    bindQuickActions();
    bindMobileNavigation();
    bindSettings();
    bindBackupControls();
    bindDeleteDataControl();
    bindKeyboardShortcuts();

    /*
     * Show initial page.
     */
    const initialPage = getInitialPage();

    if (!showPage(initialPage)) {
      showPage("dashboard");
    }

    /*
     * Give modules a moment to initialize.
     */
    window.setTimeout(() => {
      refreshModules(initialPage);
    }, 0);

    registerServiceWorker();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }
})();
