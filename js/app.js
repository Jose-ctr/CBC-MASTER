"use strict";

/* =========================================================
   CBC MASTER V2
   Main Application
   Privacy-first • Offline-first
   ========================================================= */


/* ---------------------------------------------------------
   STORAGE
   --------------------------------------------------------- */

const STORAGE_KEY = "cbc_master_v2";
const STORAGE_VERSION = 2;


/* ---------------------------------------------------------
   PAGE TITLES
   The global topbar is the single source of page titles.
   --------------------------------------------------------- */

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


/* ---------------------------------------------------------
   DEFAULT DATA
   --------------------------------------------------------- */

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


/* ---------------------------------------------------------
   APP STATE
   --------------------------------------------------------- */

let appData = null;
let toastTimer = null;


/* ---------------------------------------------------------
   DOM CACHE
   --------------------------------------------------------- */

const elements = {
  pageTitle: null,
  pageSubtitle: null,
  notificationButton: null,
  settingsButton: null
};


/* =========================================================
   START APPLICATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  appData = loadData();

  cacheElements();

  bindNavigation();

  bindDashboardModules();

  bindQuickActions();

  bindHeaderActions();

  bindSettingsActions();

  bindStudentActions();

  updateHomeDashboard();

  navigateToPage("dashboard");

  registerServiceWorker();

});


/* =========================================================
   DOM
   ========================================================= */

function cacheElements() {

  elements.pageTitle =
    document.getElementById("pageTitle");

  elements.pageSubtitle =
    document.getElementById("pageSubtitle");

  elements.notificationButton =
    document.getElementById("notificationButton");

  elements.settingsButton =
    document.getElementById("settingsButton");

}


/* =========================================================
   STORAGE
   ========================================================= */

function loadData() {

  try {

    const raw =
      localStorage.getItem(STORAGE_KEY);

    if (!raw) {

      const fresh =
        cloneDefaultData();

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(fresh)
      );

      return fresh;
    }


    const parsed =
      JSON.parse(raw);


    if (!isValidDataObject(parsed)) {

      return cloneDefaultData();

    }


    return mergeData(
      DEFAULT_DATA,
      parsed
    );

  } catch {

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

  const result =
    cloneDefaultData();


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

      result[collection] =
        saved[collection];

    }

  });


  result.version =
    STORAGE_VERSION;


  return result;

}


function isValidDataObject(data) {

  return (
    data !== null &&
    typeof data === "object" &&
    !Array.isArray(data)
  );

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function bindNavigation() {

  document
    .querySelectorAll("[data-page]")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          const page =
            button.dataset.page;

          navigateToPage(page);

        }
      );

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

  const targetId =
    getPageId(page);


  document
    .querySelectorAll(".page-section")
    .forEach((section) => {

      const isTarget =
        section.id === targetId ||
        section.dataset.pageSection === page;


      section.hidden =
        !isTarget;

    });

}


function getPageId(page) {

  const pageMap = {

    dashboard:
      "dashboardPage",

    "report-books":
      "reportBooksPage",

    schemes:
      "schemesPage",

    "lesson-plans":
      "lessonPlansPage",

    rubrics:
      "rubricsPage",

    students:
      "studentsPage",

    documents:
      "documentsPage",

    analytics:
      "analyticsPage",

    profile:
      "profilePage",

    settings:
      "settingsPage"

  };


  return pageMap[page] || "";

}


/* =========================================================
   GLOBAL PAGE HEADER
   ========================================================= */

function updatePageTitle(page) {

  const info =
    PAGE_TITLES[page];


  if (!info) {
    return;
  }


  if (elements.pageTitle) {

    elements.pageTitle.textContent =
      info.title;

  }


  if (elements.pageSubtitle) {

    elements.pageSubtitle.textContent =
      info.subtitle;

  }


  document.title =
    `${info.title} • CBC MASTER V2`;

}


/* =========================================================
   ACTIVE NAVIGATION
   ========================================================= */

function updateActiveNavigation(page) {

  document
    .querySelectorAll("[data-page]")
    .forEach((button) => {

      const active =
        button.dataset.page === page;


      button.classList.toggle(
        "active",
        active
      );


      if (active) {

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


/* =========================================================
   DASHBOARD MODULES
   ========================================================= */

function bindDashboardModules() {

  document
    .querySelectorAll("[data-module]")
    .forEach((card) => {

      card.addEventListener(
        "click",
        () => {

          navigateToPage(
            card.dataset.module
          );

        }
      );

    });

}


/* =========================================================
   QUICK ACTIONS
   ========================================================= */

function bindQuickActions() {

  document
    .querySelectorAll("[data-action]")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          handleQuickAction(
            button.dataset.action
          );

        }
      );

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


  const selected =
    actions[action];


  if (!selected) {
    return;
  }


  navigateToPage(
    selected.page
  );


  showToast(
    selected.message
  );

}


/* =========================================================
   HEADER ACTIONS
   ========================================================= */

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


  if (!appData.students.length) {

    notifications.push(
      "Your student list is empty."
    );

  }


  if (!appData.documents.length) {

    notifications.push(
      "You have no saved documents yet."
    );

  }


  return notifications;

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateHomeDashboard() {

  updateTeacherIdentity();

  updateWelcomeArea();

  updateModuleCounts();

  updateQuickStatistics();

}


/* =========================================================
   TEACHER IDENTITY
   ========================================================= */

function updateTeacherIdentity() {

  const name =
    cleanDisplayText(
      appData.teacher?.name,
      "Teacher"
    );


  const role =
    cleanDisplayText(
      appData.teacher?.role,
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

    nameElement.textContent =
      name;

  }


  if (roleElement) {

    roleElement.textContent =
      role;

  }


  if (avatarElement) {

    avatarElement.textContent =
      getInitials(name);

  }

}


/* =========================================================
   WELCOME AREA
   ========================================================= */

function updateWelcomeArea() {

  const titleElement =
    document.getElementById(
      "welcomeTitle"
    );


  const textElement =
    document.getElementById(
      "welcomeText"
    );


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


  if (titleElement) {

    titleElement.textContent =
      `${getGreeting()}, ${firstName}`;

  }


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


  if (textElement) {

    textElement.textContent =
      `Your ${grade} • ${term} teaching workspace.`;

  }

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


/* =========================================================
   DASHBOARD COUNTS
   ========================================================= */

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


/* =========================================================
   COLLECTION HELPERS
   ========================================================= */

function getCollectionLength(name) {

  return Array.isArray(
    appData?.[name]
  )
    ? appData[name].length
    : 0;

}


/* =========================================================
   SAFE TEXT HELPERS
   ========================================================= */

function cleanDisplayText(
  value,
  fallback = ""
) {

  if (typeof value !== "string") {
    return fallback;
  }


  const cleaned =
    value
      .trim()
      .replace(/\s+/g, " ");


  return cleaned || fallback;

}


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


/* =========================================================
   IDs
   ========================================================= */

function createId() {

  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {

    return crypto.randomUUID();

  }


  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {

    const bytes =
      new Uint8Array(16);


    crypto.getRandomValues(bytes);


    return Array.from(bytes)
      .map(
        (byte) =>
          byte
            .toString(16)
            .padStart(2, "0")
      )
      .join("");

  }


  return (
    Date.now().toString(36) +
    "-" +
    String(Date.now())
  );

}


/* =========================================================
   ACTIVITY
   ========================================================= */

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

    type:
      type
        .slice(0, 50),

    message:
      message
        .slice(0, 250),

    createdAt:
      new Date().toISOString()

  };


  if (
    !Array.isArray(
      appData.activity
    )
  ) {

    appData.activity = [];

  }


  appData.activity.unshift(
    activity
  );


  appData.activity =
    appData.activity.slice(
      0,
      100
    );


  return saveData();

}


/* =========================================================
   STUDENTS
   ========================================================= */

function bindStudentActions() {

  const addButton =
    document.getElementById(
      "addStudentBtn"
    );


  if (addButton) {

    addButton.addEventListener(
      "click",
      addStudent
    );

  }

}


function renderStudentsPage() {

  const page =
    document.getElementById(
      "studentsPage"
    );


  if (!page) {
    return;
  }


  const content =
    page.querySelector(
      ".page-content"
    );


  if (!content) {
    return;
  }


  let list =
    document.getElementById(
      "studentsList"
    );


  if (!list) {

    list =
      document.createElement(
        "div"
      );

    list.id =
      "studentsList";

    content.prepend(list);

  }


  list.replaceChildren();


  const students =
    Array.isArray(
      appData.students
    )
      ? appData.students
      : [];


  if (!students.length) {

    const empty =
      document.createElement(
        "div"
      );


    empty.className =
      "empty-page";


    const icon =
      document.createElement(
        "span"
      );

    icon.className =
      "empty-icon";

    icon.textContent =
      "♙";


    const heading =
      document.createElement(
        "h2"
      );

    heading.textContent =
      "No learners yet";


    const paragraph =
      document.createElement(
        "p"
      );

    paragraph.textContent =
      "Add your first learner to begin managing local learner records.";


    empty.append(
      icon,
      heading,
      paragraph
    );


    list.appendChild(empty);


    return;

  }


  const grid =
    document.createElement(
      "div"
    );


  grid.className =
    "list-grid";


  students.forEach(
    (student) => {

      const card =
        createStudentCard(
          student
        );


      grid.appendChild(card);

    }
  );


  list.appendChild(grid);

}


function createStudentCard(student) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "stat-card";


  const name =
    document.createElement(
      "strong"
    );


  name.textContent =
    cleanDisplayText(
      student?.name,
      "Unnamed learner"
    );


  const details =
    document.createElement(
      "small"
    );


  const grade =
    cleanDisplayText(
      student?.grade,
      ""
    );


  const className =
    cleanDisplayText(
      student?.className,
      ""
    );


  const admissionNumber =
    cleanDisplayText(
      student?.admissionNumber,
      ""
    );


  const parts = [];


  if (grade) {
    parts.push(grade);
  }


  if (className) {
    parts.push(className);
  }


  if (admissionNumber) {
    parts.push(
      `ID: ${admissionNumber}`
    );
  }


  details.textContent =
    parts.join(" • ");


  card.append(
    name,
    details
  );


  return card;

}


function addStudent() {

  const name =
    window.prompt(
      "Learner name:"
    );


  if (name === null) {
    return;
  }


  const cleanName =
    cleanDisplayText(
      name,
      ""
    );


  if (!cleanName) {

    showToast(
      "Learner name is required."
    );

    return;

  }


  const student = {

    id: createId(),

    name: cleanName,

    grade:
      cleanDisplayText(
        appData.preferences?.grade,
        "Grade 5"
      ),

    className: "",

    admissionNumber: "",

    createdAt:
      new Date().toISOString()

  };


  appData.students.push(
    student
  );


  saveData();


  addActivity(
    "student",
    "Learner added"
  );


  updateHomeDashboard();

  renderStudentsPage();


  showToast(
    "Learner added."
  );

}


/* =========================================================
   SETTINGS
   ========================================================= */

function renderSettingsPage() {

  const setGrade =
    document.getElementById(
      "settingsGrade"
    );


  const setTerm =
    document.getElementById(
      "settingsTerm"
    );


  const setYear =
    document.getElementById(
      "settingsAcademicYear"
    );


  const setLow =
    document.getElementById(
      "settingsLowDataMode"
    );


  if (setGrade) {

    setGrade.value =
      appData.preferences.grade;

  }


  if (setTerm) {

    setTerm.value =
      appData.preferences.term;

  }


  if (setYear) {

    setYear.value =
      appData.preferences.academicYear;

  }


  if (setLow) {

    setLow.checked =
      !!appData.preferences.lowDataMode;

  }


  const map = {

    settingsStudentCount:
      "students",

    settingsReportBookCount:
      "reportBooks",

    settingsSchemeCount:
      "schemes",

    settingsLessonPlanCount:
      "lessonPlans",

    settingsRubricCount:
      "rubrics",

    settingsDocumentCount:
      "documents"

  };


  Object.entries(map)
    .forEach(
      ([id, collection]) => {

        const element =
          document.getElementById(
            id
          );


        if (element) {

          element.textContent =
            String(
              getCollectionLength(
                collection
              )
            );

        }

      }
    );

}


function bindSettingsActions() {

  const saveButton =
    document.getElementById(
      "saveSettingsButton"
    );


  if (saveButton) {

    saveButton.addEventListener(
      "click",
      saveSettings
    );

  }


  const exportButton =
    document.getElementById(
      "exportDataButton"
    );


  if (exportButton) {

    exportButton.addEventListener(
      "click",
      exportData
    );

  }


  const importInput =
    document.getElementById(
      "importDataInput"
    );


  if (importInput) {

    importInput.addEventListener(
      "change",
      importData
    );

  }


  const deleteButton =
    document.getElementById(
      "deleteAllDataButton"
    );


  if (deleteButton) {

    deleteButton.addEventListener(
      "click",
      deleteAllData
    );

  }

}


function saveSettings() {

  const grade =
    document.getElementById(
      "settingsGrade"
    )?.value;


  const term =
    document.getElementById(
      "settingsTerm"
    )?.value;


  const year =
    document.getElementById(
      "settingsAcademicYear"
    )?.value;


  const lowDataMode =
    document.getElementById(
      "settingsLowDataMode"
    )?.checked;


  if (grade) {

    appData.preferences.grade =
      cleanDisplayText(
        grade,
        "Grade 5"
      );

  }


  if (term) {

    appData.preferences.term =
      cleanDisplayText(
        term,
        "Term 1"
      );

  }


  if (year) {

    appData.preferences.academicYear =
      cleanDisplayText(
        year,
        "2026"
      );

  }


  appData.preferences.lowDataMode =
    !!lowDataMode;


  if (saveData()) {

    updateHomeDashboard();

    renderSettingsPage();

    showToast(
      "Preferences saved."
    );

  }

}


/* =========================================================
   PROFILE
   ========================================================= */

function renderProfilePage() {

  updateTeacherIdentity();

}


/* =========================================================
   ANALYTICS
   ========================================================= */

function renderAnalyticsPage() {

  const page =
    document.getElementById(
      "analyticsPage"
    );


  if (!page) {
    return;
  }


  const content =
    page.querySelector(
      ".page-content"
    );


  if (!content) {
    return;
  }


  content.replaceChildren();


  const grid =
    document.createElement(
      "div"
    );


  grid.className =
    "stats-grid";


  const stats = [

    [
      "Students",
      getCollectionLength(
        "students"
      )
    ],

    [
      "Schemes",
      getCollectionLength(
        "schemes"
      )
    ],

    [
      "Lesson Plans",
      getCollectionLength(
        "lessonPlans"
      )
    ],

    [
      "Documents",
      getCollectionLength(
        "documents"
      )
    ]

  ];


  stats.forEach(
    ([label, value]) => {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "stat-card";


      const labelElement =
        document.createElement(
          "span"
        );


      labelElement.className =
        "stat-label";


      labelElement.textContent =
        label;


      const valueElement =
        document.createElement(
          "strong"
        );


      valueElement.className =
        "stat-value";


      valueElement.textContent =
        String(value);


      card.append(
        labelElement,
        valueElement
      );


      grid.appendChild(card);

    }
  );


  content.appendChild(grid);

}


/* =========================================================
   BACKUP / RESTORE
   ========================================================= */

function exportData() {

  try {

    const dataString =
      JSON.stringify(
        appData,
        null,
        2
      );


    const blob =
      new Blob(
        [dataString],
        {
          type:
            "application/json"
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href =
      url;


    link.download =
      `cbc-master-backup-${
        new Date()
          .toISOString()
          .slice(0, 10)
      }.json`;


    document.body.appendChild(
      link
    );


    link.click();


    link.remove();


    setTimeout(
      () => {
        URL.revokeObjectURL(url);
      },
      1000
    );


    showToast(
      "Backup exported."
    );

  } catch {

    showToast(
      "Unable to export backup."
    );

  }

}


function importData(event) {

  const input =
    event.target;


  const file =
    input?.files?.[0];


  if (!file) {
    return;
  }


  const MAX_BACKUP_SIZE =
    5 * 1024 * 1024;


  if (
    file.size >
    MAX_BACKUP_SIZE
  ) {

    showToast(
      "Backup file is too large."
    );


    input.value =
      "";


    return;

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
        !isValidDataObject(
          parsed
        )
      ) {

        throw new Error(
          "Invalid backup"
        );

      }


      const confirmed =
        window.confirm(
          "Restore this backup? Current local data will be replaced."
        );


      if (!confirmed) {

        input.value =
          "";

        return;

      }


      appData =
        mergeData(
          DEFAULT_DATA,
          parsed
        );


      if (!saveData()) {

        input.value =
          "";

        return;

      }


      updateHomeDashboard();

      renderSettingsPage();


      showToast(
        "Backup restored."
      );

    } catch {

      showToast(
        "Invalid backup file."
      );

    }


    input.value =
      "";

  };


  reader.onerror = () => {

    showToast(
      "Unable to read backup file."
    );


    input.value =
      "";

  };


  reader.readAsText(
    file
  );

}


/* =========================================================
   DELETE LOCAL DATA
   ========================================================= */

function deleteAllData() {

  const confirmed =
    window.confirm(
      "Delete all local CBC MASTER data? This cannot be undone."
    );


  if (!confirmed) {
    return;
  }


  try {

    localStorage.removeItem(
      STORAGE_KEY
    );


    appData =
      cloneDefaultData();


    updateHomeDashboard();

    renderSettingsPage();

    renderStudentsPage();


    showToast(
      "Local data deleted."
    );

  } catch {

    showToast(
      "Unable to delete local data."
    );

  }

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

  const toast =
    document.getElementById(
      "cbcToast"
    );


  if (!toast) {
    return;
  }


  toast.textContent =
    cleanDisplayText(
      String(message),
      ""
    );


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2500
    );

}


/* =========================================================
   SERVICE WORKER
   ========================================================= */

function registerServiceWorker() {

  if (
    "serviceWorker" in
    navigator
  ) {

    navigator.serviceWorker
      .register("./sw.js")
      .catch(() => {
        /* Intentionally silent. */
      });

  }

}
