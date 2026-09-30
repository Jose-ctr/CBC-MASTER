"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2
| Privacy-First Local Application Engine
|--------------------------------------------------------------------------
|
| Privacy principles:
| - Teaching data stays in the browser.
| - No analytics.
| - No advertising trackers.
| - No third-party scripts.
| - No personal-data logging.
| - No automatic network transmission of workspace data.
| - Export and deletion remain under the teacher's control.
|
|--------------------------------------------------------------------------
*/

const STORAGE_KEY = "cbc_master_v2";
const STORAGE_VERSION = 2;

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
| DEFAULT LOCAL DATA
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
| APPLICATION STATE
|--------------------------------------------------------------------------
*/

let appData = null;
let toastTimer = null;


/*
|--------------------------------------------------------------------------
| START APPLICATION
|--------------------------------------------------------------------------
*/

document.addEventListener("DOMContentLoaded", () => {
  appData = loadData();

  cacheElements();
  bindNavigation();
  bindDashboardModules();
  bindQuickActions();
  bindHeaderActions();
  bindKeyboardAccessibility();

  updateHomeDashboard();
  navigateToPage("dashboard");

  registerServiceWorker();
});


/*
|--------------------------------------------------------------------------
| DOM CACHE
|--------------------------------------------------------------------------
*/

const elements = {
  pageTitle: null,
  pageSubtitle: null,
  notificationButton: null,
  settingsButton: null
};


function cacheElements() {
  elements.pageTitle = document.getElementById("pageTitle");
  elements.pageSubtitle = document.getElementById("pageSubtitle");
  elements.notificationButton = document.getElementById(
    "notificationButton"
  );
  elements.settingsButton = document.getElementById(
    "settingsButton"
  );
}


/*
|--------------------------------------------------------------------------
| LOCAL DATA
|--------------------------------------------------------------------------
*/

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      const freshData = cloneDefaultData();

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(freshData)
      );

      return freshData;
    }

    const parsed = JSON.parse(raw);

    if (!isValidDataObject(parsed)) {
      return cloneDefaultData();
    }

    return mergeData(DEFAULT_DATA, parsed);

  } catch {
    /*
    |--------------------------------------------------------------------------
    | Deliberately do not log storage contents.
    |--------------------------------------------------------------------------
    */

    return cloneDefaultData();
  }
}


function saveData() {
  if (!appData) {
    return false;
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(appData)
    );

    return true;

  } catch {
    showToast(
      "Unable to save data on this device."
    );

    return false;
  }
}


function cloneDefaultData() {
  return JSON.parse(
    JSON.stringify(DEFAULT_DATA)
  );
}


function mergeData(defaults, saved) {
  const result = cloneDefaultData();

  if (!saved || typeof saved !== "object") {
    return result;
  }

  if (
    saved.teacher &&
    typeof saved.teacher === "object" &&
    !Array.isArray(saved.teacher)
  ) {
    result.teacher = {
      ...defaults.teacher,
      ...saved.teacher
    };
  }

  if (
    saved.preferences &&
    typeof saved.preferences === "object" &&
    !Array.isArray(saved.preferences)
  ) {
    result.preferences = {
      ...defaults.preferences,
      ...saved.preferences
    };
  }

  const collections = [
    "students",
    "reportBooks",
    "schemes",
    "lessonPlans",
    "rubrics",
    "documents",
    "activity"
  ];

  collections.forEach((collection) => {
    if (Array.isArray(saved[collection])) {
      result[collection] = saved[collection];
    }
  });

  result.version = STORAGE_VERSION;

  return result;
}


function isValidDataObject(data) {
  return (
    data !== null &&
    typeof data === "object" &&
    !Array.isArray(data)
  );
}


/*
|--------------------------------------------------------------------------
| NAVIGATION
|--------------------------------------------------------------------------
*/

function bindNavigation() {
  document
    .querySelectorAll("[data-page]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const page = button.dataset.page;

        navigateToPage(page);
      });
    });
}


function navigateToPage(page) {
  if (!PAGE_TITLES[page]) {
    return;
  }

  updatePageTitle(page);
  updateActiveNavigation(page);
  showPage(page);

  if (page === "dashboard") {
    updateHomeDashboard();
  }

  if (page === "students") {
    renderStudentsPage();
  }

  if (page === "settings") {
    renderSettingsPage();
  }

  if (page === "profile") {
    renderProfilePage();
  }

  if (page === "analytics") {
    renderAnalyticsPage();
  }
}


function showPage(page) {
  document
    .querySelectorAll(".app-page")
    .forEach((pageElement) => {
      pageElement.classList.add("page-hidden");
    });

  const pageElement = getPageElement(page);

  if (pageElement) {
    pageElement.classList.remove("page-hidden");
  }
}


function getPageElement(page) {
  const pageMap = {
    dashboard: "dashboardPage",
    "report-books": "reportBooksPage",
    schemes: "schemesPage",
    "lesson-plans": "lessonPlansPage",
    rubrics: "rubricsPage",
    students: "studentsPage",
    documents: "documentsPage",
    analytics: "analyticsPage",
    profile: "profilePage",
    settings: "settingsPage"
  };

  const elementId = pageMap[page];

  return elementId
    ? document.getElementById(elementId)
    : null;
}


function updatePageTitle(page) {
  const pageInfo = PAGE_TITLES[page];

  if (!pageInfo) {
    return;
  }

  if (elements.pageTitle) {
    elements.pageTitle.textContent = pageInfo.title;
  }

  if (elements.pageSubtitle) {
    elements.pageSubtitle.textContent =
      pageInfo.subtitle;
  }

  document.title =
    `${pageInfo.title} • CBC MASTER V2`;
}


function updateActiveNavigation(page) {
  document
    .querySelectorAll("[data-page]")
    .forEach((button) => {
      const isActive =
        button.dataset.page === page;

      button.classList.toggle(
        "active",
        isActive
      );

      if (isActive) {
        button.setAttribute(
          "aria-current",
          "page"
        );
      } else {
        button.removeAttribute(
          "aria-current"
        );
      }
    });
}


/*
|--------------------------------------------------------------------------
| DASHBOARD MODULE NAVIGATION
|--------------------------------------------------------------------------
*/

function bindDashboardModules() {
  document
    .querySelectorAll("[data-module]")
    .forEach((card) => {
      card.addEventListener("click", () => {
        navigateToPage(
          card.dataset.module
        );
      });
    });
}


/*
|--------------------------------------------------------------------------
| QUICK ACTIONS
|--------------------------------------------------------------------------
*/

function bindQuickActions() {
  document
    .querySelectorAll("[data-action]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        handleQuickAction(
          button.dataset.action
        );
      });
    });
}


function handleQuickAction(action) {
  const actions = {
    "add-student": {
      page: "students",
      message: "Student workspace opened."
    },

    "create-report-book": {
      page: "report-books",
      message: "Report Books workspace opened."
    },

    "create-scheme": {
      page: "schemes",
      message: "Schemes workspace opened."
    },

    "create-lesson-plan": {
      page: "lesson-plans",
      message: "Lesson Plans workspace opened."
    }
  };

  const selectedAction =
    actions[action];

  if (!selectedAction) {
    return;
  }

  navigateToPage(
    selectedAction.page
  );

  showToast(
    selectedAction.message
  );
}


/*
|--------------------------------------------------------------------------
| HEADER ACTIONS
|--------------------------------------------------------------------------
*/

function bindHeaderActions() {
  if (elements.notificationButton) {
    elements.notificationButton.addEventListener(
      "click",
      showNotifications
    );
  }

  if (elements.settingsButton) {
    elements.settingsButton.addEventListener(
      "click",
      () => {
        navigateToPage("settings");
      }
    );
  }
}


function showNotifications() {
  const notifications =
    getNotifications();

  if (!notifications.length) {
    showToast(
      "No new notifications."
    );

    return;
  }

  showToast(
    notifications[0]
  );
}


function getNotifications() {
  const notifications = [];

  if (
    Array.isArray(appData.students) &&
    appData.students.length === 0
  ) {
    notifications.push(
      "Your student list is empty."
    );
  }

  if (
    Array.isArray(appData.documents) &&
    appData.documents.length === 0
  ) {
    notifications.push(
      "You have no saved documents yet."
    );
  }

  return notifications;
}


/*
|--------------------------------------------------------------------------
| HOME DASHBOARD
|--------------------------------------------------------------------------
*/

function updateHomeDashboard() {
  updateTeacherIdentity();
  updateWelcomeArea();
  updateModuleCounts();
  updateQuickStatistics();
}


function updateTeacherIdentity() {
  const teacher =
    appData.teacher || {};

  const name =
    cleanDisplayText(
      teacher.name,
      "Teacher"
    );

  const role =
    cleanDisplayText(
      teacher.role,
      "CBC MASTER User"
    );

  const nameElement =
    document.getElementById(
      "sidebarProfileName"
    );

  const roleElement =
    document.getElementById(
      "sidebarProfileRole"
    );

  const avatarElement =
    document.getElementById(
      "sidebarProfileAvatar"
    );

  if (nameElement) {
    nameElement.textContent = name;
  }

  if (roleElement) {
    roleElement.textContent = role;
  }

  if (avatarElement) {
    avatarElement.textContent =
      getInitials(name);
  }
}


function updateWelcomeArea() {
  const titleElement =
    document.getElementById(
      "welcomeTitle"
    );

  const textElement =
    document.getElementById(
      "welcomeText"
    );

  if (!titleElement || !textElement) {
    return;
  }

  const teacherName =
    cleanDisplayText(
      appData.teacher?.name,
      "Teacher"
    );

  const firstName =
    teacherName
      .trim()
      .split(/\s+/)[0] ||
      "Teacher";

  titleElement.textContent =
    `${getGreeting()}, ${firstName}`;

  const grade =
    cleanDisplayText(
      appData.preferences?.grade,
      "Grade 5"
    );

  const term =
    cleanDisplayText(
      appData.preferences?.term,
      "Term 1"
    );

  textElement.textContent =
    `Your ${grade} • ${term} teaching workspace.`;
}


function getGreeting() {
  const hour =
    new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}


function updateModuleCounts() {
  const counts = {
    "report-books":
      getCollectionLength(
        "reportBooks"
      ),

    schemes:
      getCollectionLength(
        "schemes"
      ),

    "lesson-plans":
      getCollectionLength(
        "lessonPlans"
      ),

    rubrics:
      getCollectionLength(
        "rubrics"
      )
  };

  Object.entries(counts)
    .forEach(([key, value]) => {
      document
        .querySelectorAll(
          `[data-count="${key}"]`
        )
        .forEach((element) => {
          element.textContent =
            String(value);
        });
    });
}


function updateQuickStatistics() {
  const statistics = {
    students:
      getCollectionLength(
        "students"
      ),

    "report-books":
      getCollectionLength(
        "reportBooks"
      ),

    schemes:
      getCollectionLength(
        "schemes"
      ),

    documents:
      getCollectionLength(
        "documents"
      )
  };

  Object.entries(statistics)
    .forEach(([key, value]) => {
      document
        .querySelectorAll(
          `[data-stat="${key}"]`
        )
        .forEach((element) => {
          element.textContent =
            String(value);
        });
    });
}


function getCollectionLength(
  collectionName
) {
  return Array.isArray(
    appData?.[collectionName]
  )
    ? appData[collectionName].length
    : 0;
}


/*
|--------------------------------------------------------------------------
| PRIVACY-SAFE DISPLAY CLEANING
|--------------------------------------------------------------------------
*/

function cleanDisplayText(
  value,
  fallback = ""
) {
  if (
    typeof value !== "string"
  ) {
    return fallback;
  }

  const cleaned =
    value
      .trim()
      .replace(/\s+/g, " ");

  return cleaned || fallback;
}


/*
|--------------------------------------------------------------------------
| INITIALS
|--------------------------------------------------------------------------
*/

function getInitials(name) {
  const safeName =
    cleanDisplayText(
      name,
      "Teacher"
    );

  const parts =
    safeName
      .split(" ")
      .filter(Boolean);

  if (!parts.length) {
    return "T";
  }

  if (parts.length === 1) {
    return parts[0]
      .charAt(0)
      .toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}


/*
|--------------------------------------------------------------------------
| ACTIVITY
|--------------------------------------------------------------------------
*/

function addActivity(
  type,
  message
) {
  if (
    typeof type !== "string" ||
    typeof message !== "string"
  ) {
    return false;
  }

  const activity = {
    id: createId(),
    type: type.slice(0, 50),
    message: message.slice(0, 250),
    createdAt:
      new Date().toISOString()
  };

  if (!Array.isArray(
    appData.activity
  )) {
    appData.activity = [];
  }

  appData.activity.unshift(
    activity
  );

  /*
  |--------------------------------------------------------------------------
  | Keep only recent local activity.
  |--------------------------------------------------------------------------
  */

  appData.activity =
    appData.activity.slice(0, 100);

  return saveData();
}


/*
|--------------------------------------------------------------------------
| STUDENTS
|--------------------------------------------------------------------------
*/

function addStudent(student) {
  if (
    !student ||
    typeof student !== "object"
  ) {
    return null;
  }

  const record = {
    id: createId(),

    name: cleanDisplayText(
      student.name
    ),

    grade: cleanDisplayText(
      student.grade,
      appData.preferences.grade
    ),

    className: cleanDisplayText(
      student.className
    ),

    admissionNumber:
      cleanDisplayText(
        student.admissionNumber
      ),

    createdAt:
      new Date().toISOString()
  };

  if (!record.name) {
    return null;
  }

  appData.students.push(record);

  addActivity(
    "student",
    "Student record added."
  );

  saveData();
  updateHomeDashboard();

  return record;
}


/*
|--------------------------------------------------------------------------
| REPORT BOOKS
|--------------------------------------------------------------------------
*/

function addReportBook(
  reportBook
) {
  if (
    !reportBook ||
    typeof reportBook !== "object"
  ) {
    return null;
  }

  const record = {
    id: createId(),
    ...reportBook,
    createdAt:
      new Date().toISOString()
  };

  appData.reportBooks.push(
    record
  );

  addActivity(
    "report-book",
    "Report book created."
  );

  saveData();
  updateHomeDashboard();

  return record;
}


/*
|--------------------------------------------------------------------------
| SCHEMES
|--------------------------------------------------------------------------
*/

function addScheme(scheme) {
  if (
    !scheme ||
    typeof scheme !== "object"
  ) {
    return null;
  }

  const record = {
    id: createId(),
    ...scheme,
    createdAt:
      new Date().toISOString()
  };

  appData.schemes.push(record);

  addActivity(
    "scheme",
    "Scheme created."
  );

  saveData();
  updateHomeDashboard();

  return record;
}


/*
|--------------------------------------------------------------------------
| LESSON PLANS
|--------------------------------------------------------------------------
*/

function addLessonPlan(
  lessonPlan
) {
  if (
    !lessonPlan ||
    typeof lessonPlan !== "object"
  ) {
    return null;
  }

  const record = {
    id: createId(),
    ...lessonPlan,
    createdAt:
      new Date().toISOString()
  };

  appData.lessonPlans.push(
    record
  );

  addActivity(
    "lesson-plan",
    "Lesson plan created."
  );

  saveData();
  updateHomeDashboard();

  return record;
}


/*
|--------------------------------------------------------------------------
| RUBRICS
|--------------------------------------------------------------------------
*/

function addRubric(rubric) {
  if (
    !rubric ||
    typeof rubric !== "object"
  ) {
    return null;
  }

  const record = {
    id: createId(),
    ...rubric,
    createdAt:
      new Date().toISOString()
  };

  appData.rubrics.push(record);

  addActivity(
    "rubric",
    "Assessment rubric created."
  );

  saveData();
  updateHomeDashboard();

  return record;
}


/*
|--------------------------------------------------------------------------
| DOCUMENTS
|--------------------------------------------------------------------------
*/

function addDocument(
  documentData
) {
  if (
    !documentData ||
    typeof documentData !== "object"
  ) {
    return null;
  }

  const record = {
    id: createId(),
    ...documentData,
    createdAt:
      new Date().toISOString()
  };

  appData.documents.push(
    record
  );

  addActivity(
    "document",
    "Document saved."
  );

  saveData();
  updateHomeDashboard();

  return record;
}


/*
|--------------------------------------------------------------------------
| TEACHER PROFILE
|--------------------------------------------------------------------------
*/

function updateTeacher(
  teacher
) {
  if (
    !teacher ||
    typeof teacher !== "object"
  ) {
    return false;
  }

  appData.teacher = {
    ...appData.teacher,
    name: cleanDisplayText(
      teacher.name,
      "Teacher"
    ),
    school: cleanDisplayText(
      teacher.school
    ),
    county: cleanDisplayText(
      teacher.county
    ),
    role: cleanDisplayText(
      teacher.role,
      "CBC MASTER User"
    )
  };

  addActivity(
    "profile",
    "Teacher profile updated."
  );

  saveData();
  updateHomeDashboard();

  return true;
}


/*
|--------------------------------------------------------------------------
| PREFERENCES
|--------------------------------------------------------------------------
*/

function updatePreferences(
  preferences
) {
  if (
    !preferences ||
    typeof preferences !== "object"
  ) {
    return false;
  }

  appData.preferences = {
    ...appData.preferences,
    ...preferences
  };

  saveData();
  updateHomeDashboard();

  return true;
}


/*
|--------------------------------------------------------------------------
| EXPORT / BACKUP
|--------------------------------------------------------------------------
|
| The export is generated locally in the browser.
| Nothing is uploaded.
|--------------------------------------------------------------------------
*/

function exportData() {
  if (!appData) {
    return false;
  }

  try {
    const exportObject = {
      app: "CBC MASTER V2",
      version: STORAGE_VERSION,
      exportedAt:
        new Date().toISOString(),
      data: appData
    };

    const json =
      JSON.stringify(
        exportObject,
        null,
        2
      );

    const blob =
      new Blob(
        [json],
        {
          type:
            "application/json"
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement(
        "a"
      );

    const date =
      new Date()
        .toISOString()
        .slice(0, 10);

    link.href = url;
    link.download =
      `cbc-master-backup-${date}.json`;

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    showToast(
      "Backup created on this device."
    );

    return true;

  } catch {
    showToast(
      "Unable to create backup."
    );

    return false;
  }
}


/*
|--------------------------------------------------------------------------
| IMPORT / RESTORE
|--------------------------------------------------------------------------
*/

function importDataFile(file) {
  if (!(file instanceof File)) {
    return false;
  }

  const reader =
    new FileReader();

  reader.onload = () => {
    try {
      const parsed =
        JSON.parse(
          reader.result
        );

      if (
        !parsed ||
        typeof parsed !== "object" ||
        !parsed.data ||
        !isValidDataObject(
          parsed.data
        )
      ) {
        throw new Error(
          "Invalid backup"
        );
      }

      appData =
        mergeData(
          DEFAULT_DATA,
          parsed.data
        );

      saveData();
      updateHomeDashboard();

      showToast(
        "Backup restored locally."
      );

    } catch {
      showToast(
        "Invalid CBC MASTER backup."
      );
    }
  };

  reader.onerror = () => {
    showToast(
      "Unable to read backup."
    );
  };

  reader.readAsText(file);

  return true;
}


/*
|--------------------------------------------------------------------------
| DELETE ALL LOCAL DATA
|--------------------------------------------------------------------------
*/

function deleteAllData() {
  const confirmed =
    window.confirm(
      "Delete all CBC MASTER data stored on this device? This cannot be undone unless you have a backup."
    );

  if (!confirmed) {
    return false;
  }

  try {
    localStorage.removeItem(
      STORAGE_KEY
    );

    appData =
      cloneDefaultData();

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(appData)
    );

    updateHomeDashboard();
    navigateToPage("dashboard");

    showToast(
      "All local CBC MASTER data was deleted."
    );

    return true;

  } catch {
    showToast(
      "Unable to delete local data."
    );

    return false;
  }
}


/*
|--------------------------------------------------------------------------
| STORAGE INFORMATION
|--------------------------------------------------------------------------
*/

function getStorageSummary() {
  return {
    students:
      getCollectionLength(
        "students"
      ),

    reportBooks:
      getCollectionLength(
        "reportBooks"
      ),

    schemes:
      getCollectionLength(
        "schemes"
      ),

    lessonPlans:
      getCollectionLength(
        "lessonPlans"
      ),

    rubrics:
      getCollectionLength(
        "rubrics"
      ),

    documents:
      getCollectionLength(
        "documents"
      )
  };
}


/*
|--------------------------------------------------------------------------
| ID GENERATION
|--------------------------------------------------------------------------
*/

function createId() {
  if (
    window.crypto &&
    typeof window.crypto.randomUUID ===
      "function"
  ) {
    return window.crypto.randomUUID();
  }

  return (
    Date.now().toString(36) +
    "-" +
    Math.random()
      .toString(36)
      .slice(2, 10)
  );
}


/*
|--------------------------------------------------------------------------
| TOAST
|--------------------------------------------------------------------------
*/

function showToast(message) {
  const toast =
    document.getElementById(
      "cbcToast"
    );

  if (!toast) {
    return;
  }

  window.clearTimeout(
    toastTimer
  );

  toast.textContent =
    cleanDisplayText(
      message,
      "Done."
    );

  toast.classList.add(
    "show"
  );

  toastTimer =
    window.setTimeout(() => {
      toast.classList.remove(
        "show"
      );
    }, 3000);
}


/*
|--------------------------------------------------------------------------
| KEYBOARD ACCESSIBILITY
|--------------------------------------------------------------------------
*/

function bindKeyboardAccessibility() {
  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Escape"
      ) {
        const toast =
          document.getElementById(
            "cbcToast"
          );

        if (toast) {
          toast.classList.remove(
            "show"
          );
        }
      }
    }
  );
}


/*
|--------------------------------------------------------------------------
| SERVICE WORKER
|--------------------------------------------------------------------------
*/

function registerServiceWorker() {
  if (
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  /*
  |--------------------------------------------------------------------------
  | Service workers require a secure context.
  |--------------------------------------------------------------------------
  | HTTPS is used in production deployments such as GitHub Pages/Vercel.
  |--------------------------------------------------------------------------
  */

  window.addEventListener(
    "load",
    () => {
      navigator.serviceWorker
        .register(
          "./sw.js"
        )
        .catch(() => {
          /*
          |--------------------------------------------------------------------------
          | Do not expose application state or personal data in errors.
          |--------------------------------------------------------------------------
          */
        });
    }
  );
}


/*
|--------------------------------------------------------------------------
| FUTURE PAGE RENDERERS
|--------------------------------------------------------------------------
|
| These functions are intentionally lightweight until each module is built.
|--------------------------------------------------------------------------
*/

function renderStudentsPage() {
  const page =
    document.getElementById(
      "studentsPage"
    );

  if (!page) {
    return;
  }

  /*
  |--------------------------------------------------------------------------
  | Students UI will be implemented in the Students module.
  |--------------------------------------------------------------------------
  */

  if (!page.dataset.initialized) {
    page.dataset.initialized =
      "true";
  }
}


function renderSettingsPage() {
  const page =
    document.getElementById(
      "settingsPage"
    );

  if (!page) {
    return;
  }

  if (!page.dataset.initialized) {
    page.dataset.initialized =
      "true";
  }
}


function renderProfilePage() {
  const page =
    document.getElementById(
      "profilePage"
    );

  if (!page) {
    return;
  }

  if (!page.dataset.initialized) {
    page.dataset.initialized =
      "true";
  }
}


function renderAnalyticsPage() {
  const page =
    document.getElementById(
      "analyticsPage"
    );

  if (!page) {
    return;
  }

  if (!page.dataset.initialized) {
    page.dataset.initialized =
      "true";
  }
}


/*
|--------------------------------------------------------------------------
| PUBLIC CBC MASTER API
|--------------------------------------------------------------------------
|
| Exposed only for the application's own modules.
| No data is automatically transmitted.
|--------------------------------------------------------------------------
*/

window.CBCMaster = Object.freeze({

  getData() {
    return appData;
  },

  getStorageSummary() {
    return getStorageSummary();
  },

  saveData() {
    return saveData();
  },

  refresh() {
    updateHomeDashboard();
  },

  navigate(page) {
    navigateToPage(page);
  },

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
