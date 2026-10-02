"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2
| Local-first application engine
|--------------------------------------------------------------------------
| Responsibilities:
| - Local storage
| - Navigation
| - Dashboard
| - Settings
| - Backup / restore
| - Delete local data
| - Shared application API
|
| Module-specific logic lives in:
| - students.js
| - report-books.js
| - schemes.js
| - lesson-plans.js
| - rubrics.js
| - documents.js
| - analytics.js
| - profile.js
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
    subtitle: "Manage learner report book records"
  },

  schemes: {
    title: "Schemes of Work",
    subtitle: "Plan your CBC teaching term"
  },

  "lesson-plans": {
    title: "Lesson Plans",
    subtitle: "Prepare structured classroom lessons"
  },

  rubrics: {
    title: "Assessment Rubrics",
    subtitle: "Create and manage assessment criteria"
  },

  students: {
    title: "Students",
    subtitle: "Manage your local learner records"
  },

  documents: {
    title: "Saved Documents",
    subtitle: "Keep your teaching documents locally"
  },

  analytics: {
    title: "Analytics",
    subtitle: "Understand your local teaching workspace"
  },

  profile: {
    title: "Profile",
    subtitle: "Manage your teacher workspace"
  },

  settings: {
    title: "Settings",
    subtitle: "Privacy, preferences and local data"
  }
};


/*
|--------------------------------------------------------------------------
| Default data
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
| DOM helpers
|--------------------------------------------------------------------------
*/

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return Array.from(
    document.querySelectorAll(selector)
  );
}


/*
|--------------------------------------------------------------------------
| Safe display text
|--------------------------------------------------------------------------
*/

function cleanDisplayText(value) {
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .trim();
}


/*
|--------------------------------------------------------------------------
| Object helpers
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
  return Array.isArray(value)
    ? value
    : [];
}


/*
|--------------------------------------------------------------------------
| Clone default data
|--------------------------------------------------------------------------
*/

function cloneDefaultData() {
  return JSON.parse(
    JSON.stringify(DEFAULT_DATA)
  );
}


/*
|--------------------------------------------------------------------------
| ID generator
|--------------------------------------------------------------------------
*/

function createId(prefix = "record") {
  if (
    window.crypto &&
    typeof window.crypto.randomUUID ===
      "function"
  ) {
    return `${prefix}_${window.crypto.randomUUID()}`;
  }

  return (
    `${prefix}_` +
    Date.now().toString(36) +
    "_" +
    Math.random()
      .toString(36)
      .slice(2, 10)
  );
}


/*
|--------------------------------------------------------------------------
| Normalize stored data
|--------------------------------------------------------------------------
*/

function normaliseData(input) {
  const defaults =
    cloneDefaultData();

  if (!isObject(input)) {
    return defaults;
  }

  return {
    version:
      Number(input.version) ||
      STORAGE_VERSION,

    teacher: {
      ...defaults.teacher,

      ...(isObject(input.teacher)
        ? input.teacher
        : {})
    },

    preferences: {
      ...defaults.preferences,

      ...(isObject(input.preferences)
        ? input.preferences
        : {})
    },

    students:
      ensureArray(input.students),

    reportBooks:
      ensureArray(input.reportBooks),

    schemes:
      ensureArray(input.schemes),

    lessonPlans:
      ensureArray(input.lessonPlans),

    rubrics:
      ensureArray(input.rubrics),

    documents:
      ensureArray(input.documents),

    activity:
      ensureArray(input.activity)
  };
}


/*
|--------------------------------------------------------------------------
| Load local data
|--------------------------------------------------------------------------
*/

function loadData() {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return cloneDefaultData();
    }

    const parsed =
      JSON.parse(raw);

    return normaliseData(parsed);
  } catch (error) {
    /*
     * Do not log local teaching data.
     */

    return cloneDefaultData();
  }
}


/*
|--------------------------------------------------------------------------
| Save local data
|--------------------------------------------------------------------------
*/

function saveData(data) {
  try {
    const normalized =
      normaliseData(data);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(normalized)
    );

    return true;
  } catch (error) {
    showToast(
      "Unable to save local data.",
      true
    );

    return false;
  }
}


/*
|--------------------------------------------------------------------------
| Current data
|--------------------------------------------------------------------------
*/

function getData() {
  return loadData();
}


/*
|--------------------------------------------------------------------------
| Local activity
|--------------------------------------------------------------------------
*/

function addActivity(
  action,
  metadata = {}
) {
  const data =
    getData();

  /*
   * Only store a simple activity
   * description. Do not store
   * personal student information.
   */

  data.activity.push({
    id: createId("activity"),

    action:
      cleanDisplayText(action),

    timestamp:
      new Date().toISOString(),

    metadata:
      isObject(metadata)
        ? metadata
        : {}
  });

  /*
   * Keep local activity history
   * intentionally small.
   */

  if (data.activity.length > 100) {
    data.activity =
      data.activity.slice(-100);
  }

  saveData(data);
}


/*
|--------------------------------------------------------------------------
| Generic record helpers
|--------------------------------------------------------------------------
*/

function addRecord(
  collection,
  record
) {
  const data =
    getData();

  if (
    !Array.isArray(
      data[collection]
    )
  ) {
    data[collection] = [];
  }

  const newRecord = {
    id:
      record.id ||
      createId(collection),

    ...record,

    createdAt:
      record.createdAt ||
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString()
  };

  data[collection].unshift(
    newRecord
  );

  saveData(data);

  return newRecord;
}


/*
|--------------------------------------------------------------------------
| Public record helpers
|--------------------------------------------------------------------------
*/

function addStudent(student) {
  return addRecord(
    "students",
    student
  );
}

function addReportBook(record) {
  return addRecord(
    "reportBooks",
    record
  );
}

function addScheme(record) {
  return addRecord(
    "schemes",
    record
  );
}

function addLessonPlan(record) {
  return addRecord(
    "lessonPlans",
    record
  );
}

function addRubric(record) {
  return addRecord(
    "rubrics",
    record
  );
}

function addDocument(record) {
  return addRecord(
    "documents",
    record
  );
}


/*
|--------------------------------------------------------------------------
| Teacher profile
|--------------------------------------------------------------------------
*/

function updateTeacher(
  teacherUpdates
) {
  const data =
    getData();

  data.teacher = {
    ...data.teacher,
    ...teacherUpdates
  };

  saveData(data);
  refresh();
}


/*
|--------------------------------------------------------------------------
| Teaching preferences
|--------------------------------------------------------------------------
*/

function updatePreferences(
  preferenceUpdates
) {
  const data =
    getData();

  data.preferences = {
    ...data.preferences,
    ...preferenceUpdates
  };

  saveData(data);
  refresh();
}


/*
|--------------------------------------------------------------------------
| Navigation
|--------------------------------------------------------------------------
*/

function navigate(page) {
  if (!PAGE_TITLES[page]) {
    page = "dashboard";
  }

  const metadata =
    PAGE_TITLES[page];

  const title =
    $("#pageTitle");

  const subtitle =
    $("#pageSubtitle");

  if (title) {
    title.textContent =
      metadata.title;
  }

  if (subtitle) {
    subtitle.textContent =
      metadata.subtitle;
  }

  $$(
    "[data-page-section]"
  ).forEach((section) => {
    section.hidden =
      section.dataset.pageSection !==
      page;
  });

  $$(
    "[data-page]"
  ).forEach((button) => {
    const active =
      button.dataset.page === page;

    button.classList.toggle(
      "active",
      active
    );

    button.setAttribute(
      "aria-current",
      active
        ? "page"
        : "false"
    );
  });

  /*
   * Render the relevant module
   * when available.
   */

  if (
    page === "students" &&
    window.CBCMasterStudents
  ) {
    window.CBCMasterStudents.render();
  }

  if (
    page === "report-books" &&
    window.CBCMasterReportBooks
  ) {
    window.CBCMasterReportBooks.render();
  }

  if (
    page === "schemes" &&
    window.CBCMasterSchemes
  ) {
    window.CBCMasterSchemes.render();
  }

  if (
    page === "lesson-plans" &&
    window.CBCMasterLessonPlans
  ) {
    window.CBCMasterLessonPlans.render();
  }

  if (
    page === "rubrics" &&
    window.CBCMasterRubrics
  ) {
    window.CBCMasterRubrics.render();
  }

  if (
    page === "documents" &&
    window.CBCMasterDocuments
  ) {
    window.CBCMasterDocuments.render();
  }

  if (
    page === "analytics" &&
    window.CBCMasterAnalytics
  ) {
    window.CBCMasterAnalytics.render();
  }

  if (
    page === "profile" &&
    window.CBCMasterProfile
  ) {
    window.CBCMasterProfile.render();
  }

  if (
    page === "settings"
  ) {
    renderSettings();
  }

  /*
   * Close open module forms
   * when navigating away.
   */

  if (page !== "students") {
    window.CBCMasterStudents?.close();
  }

  if (page !== "report-books") {
    window.CBCMasterReportBooks?.close();
  }

  if (page !== "schemes") {
    window.CBCMasterSchemes?.close();
  }

  if (page !== "lesson-plans") {
    window.CBCMasterLessonPlans?.close();
  }

  if (page !== "rubrics") {
    window.CBCMasterRubrics?.close();
  }

  if (page !== "documents") {
    window.CBCMasterDocuments?.close();
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/*
|--------------------------------------------------------------------------
| Navigation binding
|--------------------------------------------------------------------------
*/

function bindNavigation() {
  $$(
    "[data-page]"
  ).forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        navigate(
          button.dataset.page
        );
      }
    );
  });
}


/*
|--------------------------------------------------------------------------
| Module cards
|--------------------------------------------------------------------------
|
| Dashboard module cards use:
|
|   data-module="schemes"
|
| They are intentionally different
| from sidebar navigation buttons,
| which use:
|
|   data-page="schemes"
|--------------------------------------------------------------------------
*/

function bindModuleCards() {
  $$(
    "[data-module]"
  ).forEach((card) => {
    card.addEventListener(
      "click",
      () => {
        const page =
          card.dataset.module;

        if (PAGE_TITLES[page]) {
          navigate(page);
        }
      }
    );
  });
}


/*
|--------------------------------------------------------------------------
| Quick actions
|--------------------------------------------------------------------------
|
| Handles dashboard actions such as:
|
| - Add Learner
| - Open Students
| - Open Analytics
| - Open Settings
| - Open Profile
|
| Module-specific forms remain
| controlled by their own modules.
|--------------------------------------------------------------------------
*/

function bindQuickActions() {
  $$(
    "[data-action]"
  ).forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        const action =
          button.dataset.action;

        /*
         * Add Learner
         *
         * First navigate to Students,
         * then ask the Students module
         * to open its learner form.
         */

        if (
          action ===
          "add-student"
        ) {
          navigate("students");

          window.CBCMasterStudents?.open();

          return;
        }

        /*
         * Open Students
         */

        if (
          action ===
          "open-students"
        ) {
          navigate("students");

          return;
        }

        /*
         * Open Analytics
         */

        if (
          action ===
          "open-analytics"
        ) {
          navigate("analytics");

          return;
        }

        /*
         * Open Settings
         */

        if (
          action ===
          "open-settings"
        ) {
          navigate("settings");

          return;
        }

        /*
         * Open Profile
         */

        if (
          action ===
          "open-profile"
        ) {
          navigate("profile");

          return;
        }
      }
    );
  });
}


/*
|--------------------------------------------------------------------------
| Header actions
|--------------------------------------------------------------------------
*/

function bindHeaderActions() {
  const settingsButton =
    $("#settingsButton");

  const notificationButton =
    $("#notificationButton");

  if (settingsButton) {
    settingsButton.addEventListener(
      "click",
      () => {
        navigate("settings");
      }
    );
  }

  if (notificationButton) {
    notificationButton.addEventListener(
      "click",
      () => {
        showToast(
          "No new notifications."
        );
      }
    );
  }
}


/*
|--------------------------------------------------------------------------
| Dashboard statistics
|--------------------------------------------------------------------------
*/

function renderDashboardStats() {
  const data =
    getData();

  const stats = {
    students:
      data.students.length,

    reportBooks:
      data.reportBooks.length,

    schemes:
      data.schemes.length,

    lessonPlans:
      data.lessonPlans.length,

    rubrics:
      data.rubrics.length,

    documents:
      data.documents.length
  };

  $$(
    "[data-stat]"
  ).forEach((element) => {
    const key =
      element.dataset.stat;

    element.textContent =
      String(
        stats[key] ?? 0
      );
  });
}


/*
|--------------------------------------------------------------------------
| Sidebar teacher profile
|--------------------------------------------------------------------------
*/

function renderSidebarProfile() {
  const data =
    getData();

  const teacher =
    data.teacher || {};

  const name =
    cleanDisplayText(
      teacher.name ||
        "Teacher"
    );

  const school =
    cleanDisplayText(
      teacher.school ||
        "CBC MASTER User"
    );

  const nameElement =
    $("#sidebarTeacherName");

  const schoolElement =
    $("#sidebarTeacherSchool");

  const avatar =
    $("#sidebarTeacherAvatar");

  if (nameElement) {
    nameElement.textContent =
      name;
  }

  if (schoolElement) {
    schoolElement.textContent =
      school;
  }

  if (avatar) {
    avatar.textContent =
      getInitials(name);
  }
}


/*
|--------------------------------------------------------------------------
| Initials
|--------------------------------------------------------------------------
*/

function getInitials(name) {
  const words =
    String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (!words.length) {
    return "T";
  }

  if (words.length === 1) {
    return words[0]
      .charAt(0)
      .toUpperCase();
  }

  return (
    words[0].charAt(0) +
    words[
      words.length - 1
    ].charAt(0)
  ).toUpperCase();
}


/*
|--------------------------------------------------------------------------
| Settings rendering
|--------------------------------------------------------------------------
*/

function renderSettings() {
  const data =
    getData();

  const preferences =
    data.preferences || {};

  const teacher =
    data.teacher || {};

  setValue(
    "#settingsGrade",
    preferences.grade ||
      "Grade 5"
  );

  setValue(
    "#settingsTerm",
    preferences.term ||
      "Term 1"
  );

  setValue(
    "#settingsAcademicYear",
    preferences.academicYear ||
      "2026"
  );

  const lowData =
    $("#settingsLowData");

  if (lowData) {
    lowData.checked =
      Boolean(
        preferences.lowDataMode
      );
  }

  setText(
    "#settingsTeacherName",
    teacher.name ||
      "Teacher"
  );

  setText(
    "#settingsSchool",
    teacher.school ||
      "Not set"
  );

  setText(
    "#settingsCounty",
    teacher.county ||
      "Not set"
  );

  renderStorageSummary();
}


/*
|--------------------------------------------------------------------------
| Settings controls
|--------------------------------------------------------------------------
*/

function bindSettingsControls() {
  const form =
    $("#settingsForm");

  const exportButton =
    $("#exportDataButton");

  const importInput =
    $("#importDataInput");

  const deleteButton =
    $("#deleteDataButton");

  if (form) {
    form.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();

        updatePreferences({
          grade:
            cleanDisplayText(
              $("#settingsGrade")
                .value
            ) || "Grade 5",

          term:
            cleanDisplayText(
              $("#settingsTerm")
                .value
            ) || "Term 1",

          academicYear:
            cleanDisplayText(
              $("#settingsAcademicYear")
                .value
            ) || "2026",

          lowDataMode:
            Boolean(
              $("#settingsLowData")
                .checked
            )
        });

        showToast(
          "Settings saved locally."
        );
      }
    );
  }

  if (exportButton) {
    exportButton.addEventListener(
      "click",
      exportLocalData
    );
  }

  if (importInput) {
    importInput.addEventListener(
      "change",
      handleImportFile
    );
  }

  if (deleteButton) {
    deleteButton.addEventListener(
      "click",
      deleteLocalData
    );
  }
}


/*
|--------------------------------------------------------------------------
| Set element value
|--------------------------------------------------------------------------
*/

function setValue(
  selector,
  value
) {
  const element =
    $(selector);

  if (element) {
    element.value =
      String(value ?? "");
  }
}


/*
|--------------------------------------------------------------------------
| Set text
|--------------------------------------------------------------------------
*/

function setText(
  selector,
  value
) {
  const element =
    $(selector);

  if (element) {
    element.textContent =
      cleanDisplayText(value);
  }
}


/*
|--------------------------------------------------------------------------
| Storage summary
|--------------------------------------------------------------------------
*/

function renderStorageSummary() {
  const data =
    getData();

  const counts = {
    students:
      data.students.length,

    reportBooks:
      data.reportBooks.length,

    schemes:
      data.schemes.length,

    lessonPlans:
      data.lessonPlans.length,

    rubrics:
      data.rubrics.length,

    documents:
      data.documents.length
  };

  setText(
    "#settingsStudentCount",
    counts.students
  );

  setText(
    "#settingsReportBookCount",
    counts.reportBooks
  );

  setText(
    "#settingsSchemeCount",
    counts.schemes
  );

  setText(
    "#settingsLessonPlanCount",
    counts.lessonPlans
  );

  setText(
    "#settingsRubricCount",
    counts.rubrics
  );

  setText(
    "#settingsDocumentCount",
    counts.documents
  );

  let total = 0;

  Object.values(counts)
    .forEach((value) => {
      total += value;
    });

  setText(
    "#settingsTotalRecords",
    total
  );
}


/*
|--------------------------------------------------------------------------
| Export local data
|--------------------------------------------------------------------------
*/

function exportLocalData() {
  const data =
    getData();

  const exportPayload = {
    app:
      "CBC MASTER V2",

    version:
      STORAGE_VERSION,

    exportedAt:
      new Date().toISOString(),

    data
  };

  const json =
    JSON.stringify(
      exportPayload,
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

  link.href = url;

  link.download =
    `cbc-master-backup-${getDateStamp()}.json`;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  URL.revokeObjectURL(url);

  showToast(
    "Local backup exported."
  );
}


/*
|--------------------------------------------------------------------------
| Import local data
|--------------------------------------------------------------------------
*/

function handleImportFile(event) {
  const file =
    event.target.files?.[0];

  if (!file) {
    return;
  }

  const reader =
    new FileReader();

  reader.onload = () => {
    try {
      const imported =
        JSON.parse(
          reader.result
        );

      const source =
        isObject(imported.data)
          ? imported.data
          : imported;

      const normalized =
        normaliseData(source);

      const confirmed =
        window.confirm(
          "Import this backup and replace the current local workspace?"
        );

      if (!confirmed) {
        event.target.value = "";
        return;
      }

      saveData(normalized);
      refresh();

      showToast(
        "Local backup restored."
      );
    } catch (error) {
      showToast(
        "The selected backup is not valid.",
        true
      );
    }

    event.target.value = "";
  };

  reader.onerror = () => {
    showToast(
      "Unable to read the backup file.",
      true
    );

    event.target.value = "";
  };

  reader.readAsText(file);
}


/*
|--------------------------------------------------------------------------
| Delete local data
|--------------------------------------------------------------------------
*/

function deleteLocalData() {
  const firstConfirmation =
    window.confirm(
      "Delete all CBC MASTER data stored on this device?"
    );

  if (!firstConfirmation) {
    return;
  }

  const secondConfirmation =
    window.confirm(
      "This will remove students, teaching records, documents, preferences and local activity. Continue?"
    );

  if (!secondConfirmation) {
    return;
  }

  try {
    localStorage.removeItem(
      STORAGE_KEY
    );

    refresh();

    navigate("dashboard");

    showToast(
      "All local data has been deleted."
    );
  } catch (error) {
    showToast(
      "Unable to delete local data.",
      true
    );
  }
}


/*
|--------------------------------------------------------------------------
| Date stamp
|--------------------------------------------------------------------------
*/

function getDateStamp() {
  const date =
    new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


/*
|--------------------------------------------------------------------------
| Refresh application
|--------------------------------------------------------------------------
*/

function refresh() {
  renderDashboardStats();
  renderSidebarProfile();
  renderSettings();

  window.CBCMasterStudents?.render();
  window.CBCMasterReportBooks?.render();
  window.CBCMasterSchemes?.render();
  window.CBCMasterLessonPlans?.render();
  window.CBCMasterRubrics?.render();
  window.CBCMasterDocuments?.render();
  window.CBCMasterAnalytics?.render();
  window.CBCMasterProfile?.render();
}


/*
|--------------------------------------------------------------------------
| Toast
|--------------------------------------------------------------------------
*/

function showToast(
  message,
  isError = false
) {
  const toast =
    $("#cbcToast");

  if (!toast) {
    return;
  }

  toast.textContent =
    cleanDisplayText(message);

  toast.classList.toggle(
    "error",
    Boolean(isError)
  );

  toast.classList.add(
    "show"
  );

  window.clearTimeout(
    showToast.timer
  );

  showToast.timer =
    window.setTimeout(
      () => {
        toast.classList.remove(
          "show"
        );
      },
      3200
    );
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
           * Do not expose technical
           * details to the user.
           */
        });
    }
  );
}


/*
|--------------------------------------------------------------------------
| Public CBC MASTER API
|--------------------------------------------------------------------------
*/

window.CBCMaster =
  Object.freeze({
    STORAGE_KEY,
    STORAGE_VERSION,

    $,
    $$,

    cleanDisplayText,
    createId,

    getData,
    saveData,
    loadData,

    addActivity,
    addRecord,

    addStudent,
    addReportBook,
    addScheme,
    addLessonPlan,
    addRubric,
    addDocument,

    updateTeacher,
    updatePreferences,

    navigate,
    refresh,

    showToast
  });


/*
|--------------------------------------------------------------------------
| Initialize
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


document.addEventListener(
  "DOMContentLoaded",
  init
);
