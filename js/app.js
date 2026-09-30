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
| - Core workspace stored locally
|--------------------------------------------------------------------------
*/

const STORAGE_KEY = "cbc_master_v2";
const STORAGE_VERSION = 2;


/*
|--------------------------------------------------------------------------
| Page metadata
|--------------------------------------------------------------------------
*/

const PAGE_TITLES = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Your CBC teaching workspace"
  },

  "report-books": {
    title: "Report Books",
    subtitle: "Manage learner assessment records"
  },

  schemes: {
    title: "Schemes of Work",
    subtitle: "Plan CBC teaching activities"
  },

  "lesson-plans": {
    title: "Lesson Plans",
    subtitle: "Prepare and manage daily lessons"
  },

  rubrics: {
    title: "Assessment Rubrics",
    subtitle: "Create reusable assessment criteria"
  },

  students: {
    title: "Students",
    subtitle: "Manage your learner records"
  },

  documents: {
    title: "Saved Documents",
    subtitle: "Manage your saved teaching documents"
  },

  analytics: {
    title: "Analytics",
    subtitle: "Review your teaching workspace"
  },

  profile: {
    title: "Teacher Profile",
    subtitle: "Manage your local teacher information"
  },

  settings: {
    title: "Settings",
    subtitle: "Manage your CBC MASTER preferences and data"
  }
};


/*
|--------------------------------------------------------------------------
| Default local data
|--------------------------------------------------------------------------
*/

const DEFAULT_DATA = {
  version: STORAGE_VERSION,

  teacher: {
    name: "Teacher",
    school: "",
    county: "",
    role: "CBC MASTER User"
  },

  preferences: {
    grade: "Grade 5",
    term: "Term 1",
    academicYear: "2026",
    lowDataMode: false
  },

  students: [],
  reportBooks: [],
  schemes: [],
  lessonPlans: [],
  rubrics: [],
  documents: [],
  activity: []
};


/*
|--------------------------------------------------------------------------
| Application state
|--------------------------------------------------------------------------
*/

let appData = loadData();


/*
|--------------------------------------------------------------------------
| DOM helpers
|--------------------------------------------------------------------------
*/

function $(selector) {
  return document.querySelector(selector);
}


function $$(selector) {
  return Array.from(document.querySelectorAll(selector));
}


/*
|--------------------------------------------------------------------------
| Safe text helper
|--------------------------------------------------------------------------
*/

function cleanDisplayText(value, fallback = "") {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value)
    .replace(/\s+/g, " ")
    .trim();
}


/*
|--------------------------------------------------------------------------
| Clone default data
|--------------------------------------------------------------------------
*/

function cloneDefaultData() {
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}


/*
|--------------------------------------------------------------------------
| Generate local record ID
|--------------------------------------------------------------------------
*/

function createId() {
  if (
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {
    return window.crypto.randomUUID();
  }

  if (
    window.crypto &&
    typeof window.crypto.getRandomValues === "function"
  ) {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);

    return Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}


/*
|--------------------------------------------------------------------------
| Basic data validation
|--------------------------------------------------------------------------
*/

function isObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}


function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}


function normaliseData(rawData) {
  const defaults = cloneDefaultData();

  if (!isObject(rawData)) {
    return defaults;
  }

  const data = {
    ...defaults,
    ...rawData
  };

  data.version = STORAGE_VERSION;

  data.teacher = {
    ...defaults.teacher,
    ...(isObject(rawData.teacher) ? rawData.teacher : {})
  };

  data.preferences = {
    ...defaults.preferences,
    ...(isObject(rawData.preferences)
      ? rawData.preferences
      : {})
  };

  data.students = ensureArray(rawData.students);
  data.reportBooks = ensureArray(rawData.reportBooks);
  data.schemes = ensureArray(rawData.schemes);
  data.lessonPlans = ensureArray(rawData.lessonPlans);
  data.rubrics = ensureArray(rawData.rubrics);
  data.documents = ensureArray(rawData.documents);
  data.activity = ensureArray(rawData.activity);

  return data;
}


/*
|--------------------------------------------------------------------------
| Load data
|--------------------------------------------------------------------------
*/

function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return cloneDefaultData();
    }

    const parsed = JSON.parse(stored);

    return normaliseData(parsed);
  } catch {
    return cloneDefaultData();
  }
}


/*
|--------------------------------------------------------------------------
| Save data
|--------------------------------------------------------------------------
*/

function saveData() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(appData)
    );

    return true;
  } catch {
    showToast(
      "Unable to save local data. Storage may be full.",
      "error"
    );

    return false;
  }
}


/*
|--------------------------------------------------------------------------
| Get current data
|--------------------------------------------------------------------------
*/

function getData() {
  return appData;
}


/*
|--------------------------------------------------------------------------
| Activity
|--------------------------------------------------------------------------
*/

function addActivity(message) {
  const safeMessage = cleanDisplayText(message);

  if (!safeMessage) {
    return;
  }

  appData.activity.unshift({
    id: createId(),
    message: safeMessage,
    createdAt: new Date().toISOString()
  });

  /*
   * Keep only the latest 50 generic activity records.
   * Personal information is deliberately not included here.
   */
  appData.activity = appData.activity.slice(0, 50);
}


/*
|--------------------------------------------------------------------------
| Generic record helper
|--------------------------------------------------------------------------
*/

function addRecord(collectionName, record, activityMessage) {
  if (!Array.isArray(appData[collectionName])) {
    appData[collectionName] = [];
  }

  const safeRecord = isObject(record)
    ? { ...record }
    : {};

  const newRecord = {
    id: safeRecord.id || createId(),
    createdAt:
      safeRecord.createdAt ||
      new Date().toISOString(),
    ...safeRecord
  };

  appData[collectionName].push(newRecord);

  if (activityMessage) {
    addActivity(activityMessage);
  }

  saveData();
  refresh();

  return newRecord;
}


/*
|--------------------------------------------------------------------------
| Add student
|--------------------------------------------------------------------------
*/

function addStudent(student = {}) {
  return addRecord(
    "students",
    student,
    "Student record added."
  );
}


/*
|--------------------------------------------------------------------------
| Add report book
|--------------------------------------------------------------------------
*/

function addReportBook(reportBook = {}) {
  return addRecord(
    "reportBooks",
    reportBook,
    "Report book added."
  );
}


/*
|--------------------------------------------------------------------------
| Add scheme
|--------------------------------------------------------------------------
*/

function addScheme(scheme = {}) {
  return addRecord(
    "schemes",
    scheme,
    "Scheme of work added."
  );
}


/*
|--------------------------------------------------------------------------
| Add lesson plan
|--------------------------------------------------------------------------
*/

function addLessonPlan(lessonPlan = {}) {
  return addRecord(
    "lessonPlans",
    lessonPlan,
    "Lesson plan added."
  );
}


/*
|--------------------------------------------------------------------------
| Add rubric
|--------------------------------------------------------------------------
*/

function addRubric(rubric = {}) {
  return addRecord(
    "rubrics",
    rubric,
    "Assessment rubric added."
  );
}


/*
|--------------------------------------------------------------------------
| Add document
|--------------------------------------------------------------------------
*/

function addDocument(documentData = {}) {
  return addRecord(
    "documents",
    documentData,
    "Document saved."
  );
}


/*
|--------------------------------------------------------------------------
| Update teacher profile
|--------------------------------------------------------------------------
*/

function updateTeacher(teacher = {}) {
  if (!isObject(teacher)) {
    return false;
  }

  appData.teacher = {
    ...appData.teacher,
    ...teacher
  };

  addActivity("Teacher profile updated.");

  saveData();
  refresh();

  return true;
}


/*
|--------------------------------------------------------------------------
| Update preferences
|--------------------------------------------------------------------------
*/

function updatePreferences(preferences = {}) {
  if (!isObject(preferences)) {
    return false;
  }

  appData.preferences = {
    ...appData.preferences,
    ...preferences
  };

  addActivity("Teaching preferences updated.");

  saveData();
  refresh();

  return true;
}


/*
|--------------------------------------------------------------------------
| Navigation
|--------------------------------------------------------------------------
*/

function navigate(pageName) {
  const page = PAGE_TITLES[pageName]
    ? pageName
    : "dashboard";

  $$("[data-page-section]").forEach((section) => {
    section.hidden =
      section.dataset.pageSection !== page;
  });


  /*
   * Sidebar navigation
   */

  $$(".nav-item[data-page]").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.page === page
    );
  });


  /*
   * Bottom navigation
   */

  $$(".bottom-nav-item[data-page]").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.page === page
    );
  });


  /*
   * Header
   */

  const metadata = PAGE_TITLES[page];

  const pageTitle = $("#pageTitle");
  const pageSubtitle = $("#pageSubtitle");

  if (pageTitle) {
    pageTitle.textContent = metadata.title;
  }

  if (pageSubtitle) {
    pageSubtitle.textContent = metadata.subtitle;
  }


  /*
   * Page-specific rendering
   */

  if (page === "settings") {
    renderSettingsPage();
  }

  if (page === "profile") {
    renderProfilePage();
  }

  if (page === "analytics") {
    renderAnalyticsPage();
  }

  if (page === "students") {
    renderStudentsPage();
  }
}


/*
|--------------------------------------------------------------------------
| Bind navigation
|--------------------------------------------------------------------------
*/

function bindNavigation() {
  $$("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      const page = button.dataset.page;

      if (PAGE_TITLES[page]) {
        navigate(page);
      }
    });
  });
}


/*
|--------------------------------------------------------------------------
| Module navigation
|--------------------------------------------------------------------------
*/

function bindModuleCards() {
  $$("[data-module]").forEach((card) => {
    card.addEventListener("click", () => {
      const module = card.dataset.module;

      if (PAGE_TITLES[module]) {
        navigate(module);
      }
    });
  });
}


/*
|--------------------------------------------------------------------------
| Quick actions
|--------------------------------------------------------------------------
*/

function bindQuickActions() {
  $$("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {

      const action = button.dataset.action;

      switch (action) {

        case "add-student":
          navigate("students");
          showToast(
            "Students is ready for learner records."
          );
          break;

        case "create-report-book":
          navigate("report-books");
          showToast(
            "Report Books is ready."
          );
          break;

        case "create-scheme":
          navigate("schemes");
          showToast(
            "Schemes of Work is ready."
          );
          break;

        case "create-lesson-plan":
          navigate("lesson-plans");
          showToast(
            "Lesson Plans is ready."
          );
          break;

        default:
          break;
      }
    });
  });
}


/*
|--------------------------------------------------------------------------
| Header actions
|--------------------------------------------------------------------------
*/

function bindHeaderActions() {

  const notificationButton =
    $("#notificationButton");

  if (notificationButton) {
    notificationButton.addEventListener(
      "click",
      () => {
        showToast(
          "Notifications are not connected to a cloud service."
        );
      }
    );
  }


  const settingsButton =
    $("#settingsButton");

  if (settingsButton) {
    settingsButton.addEventListener(
      "click",
      () => {
        navigate("settings");
      }
    );
  }
}


/*
|--------------------------------------------------------------------------
| Dashboard statistics
|--------------------------------------------------------------------------
*/

function updateDashboardStats() {

  const stats = {
    students: appData.students.length,
    "report-books": appData.reportBooks.length,
    schemes: appData.schemes.length,
    documents: appData.documents.length
  };


  Object.entries(stats).forEach(
    ([key, value]) => {

      const element =
        document.querySelector(
          `[data-stat="${key}"]`
        );

      if (element) {
        element.textContent = String(value);
      }

    }
  );
}


/*
|--------------------------------------------------------------------------
| Sidebar profile
|--------------------------------------------------------------------------
*/

function updateSidebarProfile() {

  const name =
    cleanDisplayText(
      appData.teacher.name,
      "Teacher"
    );

  const role =
    cleanDisplayText(
      appData.teacher.role,
      "CBC MASTER User"
    );


  const nameElement =
    $("#sidebarProfileName");

  const roleElement =
    $("#sidebarProfileRole");

  const avatarElement =
    $("#sidebarProfileAvatar");


  if (nameElement) {
    nameElement.textContent = name;
  }

  if (roleElement) {
    roleElement.textContent = role;
  }

  if (avatarElement) {
    avatarElement.textContent =
      name.charAt(0).toUpperCase() || "T";
  }
}


/*
|--------------------------------------------------------------------------
| Settings rendering
|--------------------------------------------------------------------------
*/

function renderSettingsPage() {

  const preferences =
    appData.preferences || {};


  /*
   * Preference controls
   */

  const grade =
    $("#settingsGrade");

  const term =
    $("#settingsTerm");

  const academicYear =
    $("#settingsAcademicYear");

  const lowDataMode =
    $("#settingsLowDataMode");


  if (grade) {
    grade.value =
      preferences.grade || "Grade 5";
  }

  if (term) {
    term.value =
      preferences.term || "Term 1";
  }

  if (academicYear) {
    academicYear.value =
      preferences.academicYear || "2026";
  }

  if (lowDataMode) {
    lowDataMode.checked =
      Boolean(preferences.lowDataMode);
  }


  /*
   * Storage counts
   */

  const counts = {
    settingsStudentCount:
      appData.students.length,

    settingsReportBookCount:
      appData.reportBooks.length,

    settingsSchemeCount:
      appData.schemes.length,

    settingsLessonPlanCount:
      appData.lessonPlans.length,

    settingsRubricCount:
      appData.rubrics.length,

    settingsDocumentCount:
      appData.documents.length
  };


  Object.entries(counts).forEach(
    ([id, value]) => {

      const element = document.getElementById(id);

      if (element) {
        element.textContent =
          String(value);
      }

    }
  );
}


/*
|--------------------------------------------------------------------------
| Bind Settings controls
|--------------------------------------------------------------------------
*/

function bindSettingsControls() {

  const saveButton =
    $("#saveSettingsButton");


  if (saveButton) {

    saveButton.addEventListener(
      "click",
      saveSettingsFromForm
    );

  }


  const exportButton =
    $("#exportDataButton");


  if (exportButton) {

    exportButton.addEventListener(
      "click",
      exportData
    );

  }


  const importInput =
    $("#importDataInput");


  if (importInput) {

    importInput.addEventListener(
      "change",
      async (event) => {

        const file =
          event.target.files &&
          event.target.files[0];

        if (!file) {
          return;
        }

        await importDataFile(file);

        /*
         * Reset input so the same file can be
         * selected again later.
         */

        event.target.value = "";

      }
    );

  }


  const deleteButton =
    $("#deleteAllDataButton");


  if (deleteButton) {

    deleteButton.addEventListener(
      "click",
      deleteAllData
    );

  }
}


/*
|--------------------------------------------------------------------------
| Save Settings form
|--------------------------------------------------------------------------
*/

function saveSettingsFromForm() {

  const grade =
    $("#settingsGrade");

  const term =
    $("#settingsTerm");

  const academicYear =
    $("#settingsAcademicYear");

  const lowDataMode =
    $("#settingsLowDataMode");


  const preferences = {
    grade:
      grade?.value || "Grade 5",

    term:
      term?.value || "Term 1",

    academicYear:
      academicYear?.value || "2026",

    lowDataMode:
      Boolean(lowDataMode?.checked)
  };


  updatePreferences(preferences);

  showToast(
    "Preferences saved on this device."
  );
}


/*
|--------------------------------------------------------------------------
| Export local backup
|--------------------------------------------------------------------------
*/

function exportData() {

  try {

    const backup = {
      app: "CBC MASTER V2",
      version: STORAGE_VERSION,
      exportedAt: new Date().toISOString(),
      data: appData
    };


    const json =
      JSON.stringify(
        backup,
        null,
        2
      );


    const blob =
      new Blob(
        [json],
        {
          type: "application/json"
        }
      );


    const url =
      URL.createObjectURL(blob);


    const link =
      document.createElement("a");


    const date =
      new Date()
        .toISOString()
        .slice(0, 10);


    link.href = url;

    link.download =
      `cbc-master-v2-backup-${date}.json`;


    document.body.appendChild(link);

    link.click();

    link.remove();


    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);


    showToast(
      "Backup exported successfully."
    );

  } catch {

    showToast(
      "Backup could not be created.",
      "error"
    );

  }
}


/*
|--------------------------------------------------------------------------
| Validate imported backup
|--------------------------------------------------------------------------
*/

function validateImportedData(candidate) {

  if (!isObject(candidate)) {
    return false;
  }


  /*
   * Accept both:
   *
   * {
   *   app: "CBC MASTER V2",
   *   data: {...}
   * }
   *
   * and a direct workspace object.
   */

  const workspace =
    isObject(candidate.data)
      ? candidate.data
      : candidate;


  if (!isObject(workspace)) {
    return false;
  }


  const requiredArrays = [
    "students",
    "reportBooks",
    "schemes",
    "lessonPlans",
    "rubrics",
    "documents"
  ];


  for (const key of requiredArrays) {

    if (
      key in workspace &&
      !Array.isArray(workspace[key])
    ) {
      return false;
    }

  }


  return true;
}


/*
|--------------------------------------------------------------------------
| Import backup
|--------------------------------------------------------------------------
*/

async function importDataFile(file) {

  if (!(file instanceof File)) {
    return;
  }


  if (
    file.type !== "application/json" &&
    !file.name.toLowerCase().endsWith(".json")
  ) {

    showToast(
      "Please select a CBC MASTER JSON backup.",
      "error"
    );

    return;
  }


  try {

    const text =
      await file.text();


    if (text.length > 10 * 1024 * 1024) {

      showToast(
        "Backup file is too large.",
        "error"
      );

      return;
    }


    const parsed =
      JSON.parse(text);


    if (!validateImportedData(parsed)) {

      showToast(
        "This backup file is not valid.",
        "error"
      );

      return;
    }


    const confirmed =
      window.confirm(
        "Import this backup? Your current local workspace will be replaced."
      );


    if (!confirmed) {
      return;
    }


    const importedWorkspace =
      isObject(parsed.data)
        ? parsed.data
        : parsed;


    appData =
      normaliseData(
        importedWorkspace
      );


    addActivity(
      "Workspace backup imported."
    );


    saveData();

    refresh();

    navigate("settings");


    showToast(
      "Backup restored successfully."
    );

  } catch {

    showToast(
      "The backup could not be read.",
      "error"
    );

  }
}


/*
|--------------------------------------------------------------------------
| Delete all local data
|--------------------------------------------------------------------------
*/

function deleteAllData() {

  const confirmed =
    window.confirm(
      "Delete ALL CBC MASTER data stored on this device? This cannot be undone unless you have a backup."
    );


  if (!confirmed) {
    return;
  }


  const secondConfirmation =
    window.confirm(
      "Final confirmation: permanently delete your local CBC MASTER workspace?"
    );


  if (!secondConfirmation) {
    return;
  }


  try {

    localStorage.removeItem(
      STORAGE_KEY
    );


    appData =
      cloneDefaultData();


    refresh();

    navigate("settings");


    showToast(
      "All local CBC MASTER data has been deleted."
    );

  } catch {

    showToast(
      "Local data could not be deleted.",
      "error"
    );

  }
}


/*
|--------------------------------------------------------------------------
| Storage summary
|--------------------------------------------------------------------------
*/

function getStorageSummary() {

  return {
    students:
      appData.students.length,

    reportBooks:
      appData.reportBooks.length,

    schemes:
      appData.schemes.length,

    lessonPlans:
      appData.lessonPlans.length,

    rubrics:
      appData.rubrics.length,

    documents:
      appData.documents.length,

    activity:
      appData.activity.length
  };
}


/*
|--------------------------------------------------------------------------
| Placeholder page renderers
|--------------------------------------------------------------------------
*/

function renderStudentsPage() {

  /*
   * Students module will be built next.
   */

}


function renderProfilePage() {

  /*
   * Profile module will be expanded later.
   */

}


function renderAnalyticsPage() {

  /*
   * Analytics will use real local workspace data.
   */

}


/*
|--------------------------------------------------------------------------
| Refresh application
|--------------------------------------------------------------------------
*/

function refresh() {

  updateDashboardStats();

  updateSidebarProfile();

  renderSettingsPage();
}


/*
|--------------------------------------------------------------------------
| Toast
|--------------------------------------------------------------------------
*/

let toastTimer = null;


function showToast(message, type = "success") {

  const toast =
    $("#cbcToast");


  if (!toast) {
    return;
  }


  toast.textContent =
    cleanDisplayText(message);


  toast.classList.remove(
    "show",
    "error"
  );


  if (type === "error") {
    toast.classList.add("error");
  }


  /*
   * Force reflow so repeated messages
   * can animate correctly.
   */

  void toast.offsetWidth;


  toast.classList.add("show");


  if (toastTimer) {
    clearTimeout(toastTimer);
  }


  toastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 3000);
}


/*
|--------------------------------------------------------------------------
| Service worker
|--------------------------------------------------------------------------
*/

function registerServiceWorker() {

  if (
    !("serviceWorker" in navigator)
  ) {
    return;
  }


  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register("./sw.js")
        .catch(() => {
          /*
           * Deliberately do not log
           * application or user data.
           */
        });

    }
  );
}


/*
|--------------------------------------------------------------------------
| Initialisation
|--------------------------------------------------------------------------
*/

function init() {

  bindNavigation();

  bindModuleCards();

  bindQuickActions();

  bindHeaderActions();

  bindSettingsControls();

  refresh();

  navigate("dashboard");

  registerServiceWorker();
}


/*
|--------------------------------------------------------------------------
| Public application API
|--------------------------------------------------------------------------
*/

window.CBCMaster = Object.freeze({

  getData,

  getStorageSummary,

  saveData,

  refresh,

  navigate,

  addStudent,

  addReportBook,

  addScheme,

  addLessonPlan,

  addRubric,

  addDocument,

  updateTeacher,

  updatePreferences,

  exportData,

  importDataFile,

  deleteAllData

});


/*
|--------------------------------------------------------------------------
| Start
|--------------------------------------------------------------------------
*/

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    init,
    {
      once: true
    }
  );

} else {

  init();

}
