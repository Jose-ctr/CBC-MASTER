/* =========================================================
   CBC MASTER V2
   APPLICATION ENGINE
   Home Dashboard • Navigation • Local Data
   ========================================================= */

"use strict";


/* =========================================================
   1. STORAGE
   ========================================================= */

const STORAGE_KEY = "cbc_master_v2";


const DEFAULT_DATA = {
  version: 2,

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


/* =========================================================
   2. APPLICATION STATE
   ========================================================= */

let appData = loadData();

let currentPage = "dashboard";


const PAGE_TITLES = {

  dashboard: "Dashboard",

  "report-books": "Report Books",

  schemes: "Schemes of Work",

  "lesson-plans": "Lesson Plans",

  rubrics: "Assessment Rubrics",

  students: "Students",

  documents: "Saved Documents",

  analytics: "Analytics",

  profile: "Teacher Profile",

  settings: "Settings"

};


/* =========================================================
   3. DOM REFERENCES
   ========================================================= */

let pageTitle;
let notificationButton;
let settingsButton;


/* =========================================================
   4. INITIALIZE
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  initApp
);


function initApp() {

  pageTitle =
    document.getElementById(
      "pageTitle"
    );

  notificationButton =
    document.getElementById(
      "notificationButton"
    );

  settingsButton =
    document.getElementById(
      "settingsButton"
    );


  bindNavigation();

  bindDashboardModules();

  bindQuickActions();

  bindHeaderActions();

  updateHomeDashboard();

  navigateToPage(
    "dashboard"
  );

}


/* =========================================================
   5. LOAD DATA
   ========================================================= */

function loadData() {

  try {

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );


    if (!saved) {

      const fresh =
        cloneDefaults();

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(fresh)
      );

      return fresh;

    }


    const parsed =
      JSON.parse(saved);


    return mergeData(
      cloneDefaults(),
      parsed
    );


  } catch (error) {

    console.error(
      "CBC MASTER V2: Failed to load local data.",
      error
    );

    return cloneDefaults();

  }

}


/* =========================================================
   6. CLONE DEFAULT DATA
   ========================================================= */

function cloneDefaults() {

  return JSON.parse(
    JSON.stringify(
      DEFAULT_DATA
    )
  );

}


/* =========================================================
   7. MERGE SAVED DATA
   ========================================================= */

function mergeData(
  defaults,
  saved
) {

  if (
    !saved ||
    typeof saved !== "object"
  ) {

    return defaults;

  }


  Object.keys(defaults)
    .forEach((key) => {

      if (
        saved[key] === undefined ||
        saved[key] === null
      ) {

        return;

      }


      if (
        isPlainObject(defaults[key]) &&
        isPlainObject(saved[key])
      ) {

        defaults[key] = {

          ...defaults[key],

          ...saved[key]

        };

      } else {

        defaults[key] =
          saved[key];

      }

    });


  return defaults;

}


/* =========================================================
   8. OBJECT CHECK
   ========================================================= */

function isPlainObject(value) {

  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );

}


/* =========================================================
   9. SAVE DATA
   ========================================================= */

function saveData() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(appData)
    );

    return true;

  } catch (error) {

    console.error(
      "CBC MASTER V2: Failed to save local data.",
      error
    );

    showToast(
      "Unable to save local data."
    );

    return false;

  }

}


/* =========================================================
   10. NAVIGATION BINDING
   ========================================================= */

function bindNavigation() {

  const buttons =
    document.querySelectorAll(
      "[data-page]"
    );


  buttons.forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        const page =
          button.dataset.page;


        if (!page) {
          return;
        }


        navigateToPage(page);

      }
    );

  });

}


/* =========================================================
   11. DASHBOARD MODULE BINDING
   ========================================================= */

function bindDashboardModules() {

  const buttons =
    document.querySelectorAll(
      "[data-module]"
    );


  buttons.forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        const module =
          button.dataset.module;


        if (!module) {
          return;
        }


        navigateToPage(module);

      }
    );

  });

}


/* =========================================================
   12. QUICK ACTION BINDING
   ========================================================= */

function bindQuickActions() {

  const buttons =
    document.querySelectorAll(
      "[data-action]"
    );


  buttons.forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        const action =
          button.dataset.action;


        handleQuickAction(
          action
        );

      }
    );

  });

}


/* =========================================================
   13. QUICK ACTION HANDLER
   ========================================================= */

function handleQuickAction(action) {

  switch (action) {

    case "add-student":

      navigateToPage(
        "students"
      );

      showToast(
        "Student workspace opened."
      );

      break;


    case "create-report-book":

      navigateToPage(
        "report-books"
      );

      showToast(
        "Report Books workspace opened."
      );

      break;


    case "create-scheme":

      navigateToPage(
        "schemes"
      );

      showToast(
        "Schemes of Work workspace opened."
      );

      break;


    case "create-lesson-plan":

      navigateToPage(
        "lesson-plans"
      );

      showToast(
        "Lesson Plans workspace opened."
      );

      break;


    default:

      console.warn(
        "CBC MASTER V2: Unknown quick action:",
        action
      );

  }

}


/* =========================================================
   14. NAVIGATE TO PAGE
   ========================================================= */

function navigateToPage(page) {

  if (
    !Object.prototype.hasOwnProperty.call(
      PAGE_TITLES,
      page
    )
  ) {

    page = "dashboard";

  }


  currentPage =
    page;


  updatePageTitle(
    page
  );

  updateActiveNavigation(
    page
  );

  showPage(
    page
  );


  if (
    page === "dashboard"
  ) {

    updateHomeDashboard();

  }

}


/* =========================================================
   15. SHOW PAGE
   ========================================================= */

function showPage(page) {

  const pages =
    document.querySelectorAll(
      ".app-page"
    );


  pages.forEach(
    (pageElement) => {

      pageElement.classList.add(
        "page-hidden"
      );

    }
  );


  const pageElement =
    getPageElement(
      page
    );


  if (pageElement) {

    pageElement.classList.remove(
      "page-hidden"
    );

  }

}


/* =========================================================
   16. PAGE ELEMENT MAP
   ========================================================= */

function getPageElement(page) {

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


  const id =
    pageMap[page];


  if (!id) {
    return null;
  }


  return document.getElementById(
    id
  );

}


/* =========================================================
   17. PAGE TITLE
   ========================================================= */

function updatePageTitle(page) {

  if (!pageTitle) {
    return;
  }


  pageTitle.textContent =
    PAGE_TITLES[page] ||
    "CBC MASTER";

}


/* =========================================================
   18. ACTIVE NAVIGATION
   ========================================================= */

function updateActiveNavigation(page) {

  const navLinks =
    document.querySelectorAll(
      "[data-page]"
    );


  navLinks.forEach(
    (button) => {

      button.classList.toggle(
        "active",
        button.dataset.page === page
      );

    }
  );

}


/* =========================================================
   19. HEADER ACTIONS
   ========================================================= */

function bindHeaderActions() {

  if (notificationButton) {

    notificationButton.addEventListener(
      "click",
      handleNotifications
    );

  }


  if (settingsButton) {

    settingsButton.addEventListener(
      "click",
      () => {

        navigateToPage(
          "settings"
        );

      }
    );

  }

}


/* =========================================================
   20. NOTIFICATIONS
   ========================================================= */

function handleNotifications() {

  const notifications =
    getNotifications();


  if (
    notifications.length === 0
  ) {

    showToast(
      "No new notifications."
    );

    return;

  }


  showToast(
    `${notifications.length} notification${
      notifications.length === 1
        ? ""
        : "s"
    } available.`
  );

}


function getNotifications() {

  const notifications = [];


  if (
    getArrayLength(
      appData.students
    ) === 0
  ) {

    notifications.push({

      type: "info",

      message:
        "Add your first learner to begin building your CBC records."

    });

  }


  if (
    getArrayLength(
      appData.documents
    ) === 0
  ) {

    notifications.push({

      type: "info",

      message:
        "Saved CBC documents will appear here."

    });

  }


  return notifications;

}


/* =========================================================
   21. HOME DASHBOARD
   ========================================================= */

function updateHomeDashboard() {

  updateTeacherIdentity();

  updateWelcomeArea();

  updateModuleCounts();

  updateQuickStatistics();

}


/* =========================================================
   22. TEACHER IDENTITY
   ========================================================= */

function updateTeacherIdentity() {

  const teacher =
    appData.teacher ||
    DEFAULT_DATA.teacher;


  const name =
    teacher.name &&
    teacher.name.trim()
      ? teacher.name.trim()
      : "Teacher";


  const profileName =
    document.getElementById(
      "sidebarProfileName"
    );


  const profileRole =
    document.getElementById(
      "sidebarProfileRole"
    );


  const profileAvatar =
    document.getElementById(
      "sidebarProfileAvatar"
    );


  const welcomeTitle =
    document.querySelector(
      ".welcome-title"
    );


  if (profileName) {

    profileName.textContent =
      name;

  }


  if (profileRole) {

    profileRole.textContent =
      teacher.role ||
      "CBC MASTER User";

  }


  if (profileAvatar) {

    profileAvatar.textContent =
      getInitials(
        name
      );

  }


  if (welcomeTitle) {

    welcomeTitle.textContent =
      `${getGreeting()}, ${name}`;

  }

}


/* =========================================================
   23. INITIALS
   ========================================================= */

function getInitials(name) {

  const parts =
    String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);


  if (
    parts.length === 0
  ) {

    return "T";

  }


  if (
    parts.length === 1
  ) {

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
   24. GREETING
   ========================================================= */

function getGreeting() {

  const hour =
    new Date().getHours();


  if (
    hour < 12
  ) {

    return "Good morning";

  }


  if (
    hour < 17
  ) {

    return "Good afternoon";

  }


  return "Good evening";

}


/* =========================================================
   25. WELCOME AREA
   ========================================================= */

function updateWelcomeArea() {

  const welcomeText =
    document.querySelector(
      ".welcome-text"
    );


  if (!welcomeText) {
    return;
  }


  const preferences =
    appData.preferences ||
    DEFAULT_DATA.preferences;


  const grade =
    preferences.grade ||
    "Grade 5";


  const term =
    preferences.term ||
    "Term 1";


  welcomeText.textContent =
    `Here's your teaching overview for ${grade}, ${term}.`;

}


/* =========================================================
   26. MODULE COUNTS
   ========================================================= */

function updateModuleCounts() {

  const counts = {

    "report-books":
      getArrayLength(
        appData.reportBooks
      ),

    schemes:
      getArrayLength(
        appData.schemes
      ),

    "lesson-plans":
      getArrayLength(
        appData.lessonPlans
      ),

    rubrics:
      getArrayLength(
        appData.rubrics
      )

  };


  Object.entries(
    counts
  ).forEach(
    ([module, count]) => {

      const element =
        document.querySelector(
          `[data-count="${module}"]`
        );


      if (element) {

        element.textContent =
          formatNumber(
            count
          );

      }

    }
  );

}


/* =========================================================
   27. QUICK STATISTICS
   ========================================================= */

function updateQuickStatistics() {

  const statistics = {

    students:
      getArrayLength(
        appData.students
      ),

    "report-books":
      getArrayLength(
        appData.reportBooks
      ),

    schemes:
      getArrayLength(
        appData.schemes
      ),

    documents:
      getArrayLength(
        appData.documents
      )

  };


  Object.entries(
    statistics
  ).forEach(
    ([key, value]) => {

      const element =
        document.querySelector(
          `[data-stat="${key}"]`
        );


      if (element) {

        element.textContent =
          formatNumber(
            value
          );

      }

    }
  );

}


/* =========================================================
   28. ARRAY LENGTH
   ========================================================= */

function getArrayLength(value) {

  return Array.isArray(value)
    ? value.length
    : 0;

}


/* =========================================================
   29. NUMBER FORMAT
   ========================================================= */

function formatNumber(value) {

  return new Intl.NumberFormat(
    "en-KE"
  ).format(
    Number(value) || 0
  );

}


/* =========================================================
   30. ACTIVITY
   ========================================================= */

function addActivity(
  type,
  message
) {

  if (
    !Array.isArray(
      appData.activity
    )
  ) {

    appData.activity = [];

  }


  appData.activity.unshift({

    id: createId(),

    type,

    message,

    createdAt:
      new Date().toISOString()

  });


  /*
   * Keep the local activity history
   * lightweight for the offline PWA.
   */

  if (
    appData.activity.length > 100
  ) {

    appData.activity =
      appData.activity.slice(
        0,
        100
      );

  }

}


/* =========================================================
   31. ADD STUDENT
   ========================================================= */

function addStudent(student) {

  if (
    !student ||
    typeof student !== "object"
  ) {

    return false;

  }


  appData.students.push({

    id:
      createId(),

    createdAt:
      new Date().toISOString(),

    ...student

  });


  addActivity(
    "student",
    "Student added."
  );


  if (
    saveData()
  ) {

    updateHomeDashboard();

    return true;

  }


  return false;

}


/* =========================================================
   32. ADD REPORT BOOK
   ========================================================= */

function addReportBook(
  reportBook
) {

  if (
    !reportBook ||
    typeof reportBook !== "object"
  ) {

    return false;

  }


  appData.reportBooks.push({

    id:
      createId(),

    createdAt:
      new Date().toISOString(),

    ...reportBook

  });


  addActivity(
    "report-book",
    "Report book created."
  );


  if (
    saveData()
  ) {

    updateHomeDashboard();

    return true;

  }


  return false;

}


/* =========================================================
   33. ADD SCHEME
   ========================================================= */

function addScheme(
  scheme
) {

  if (
    !scheme ||
    typeof scheme !== "object"
  ) {

    return false;

  }


  appData.schemes.push({

    id:
      createId(),

    createdAt:
      new Date().toISOString(),

    ...scheme

  });


  addActivity(
    "scheme",
    "Scheme of Work created."
  );


  if (
    saveData()
  ) {

    updateHomeDashboard();

    return true;

  }


  return false;

}


/* =========================================================
   34. ADD LESSON PLAN
   ========================================================= */

function addLessonPlan(
  lessonPlan
) {

  if (
    !lessonPlan ||
    typeof lessonPlan !== "object"
  ) {

    return false;

  }


  appData.lessonPlans.push({

    id:
      createId(),

    createdAt:
      new Date().toISOString(),

    ...lessonPlan

  });


  addActivity(
    "lesson-plan",
    "Lesson plan created."
  );


  if (
    saveData()
  ) {

    updateHomeDashboard();

    return true;

  }


  return false;

}


/* =========================================================
   35. ADD RUBRIC
   ========================================================= */

function addRubric(
  rubric
) {

  if (
    !rubric ||
    typeof rubric !== "object"
  ) {

    return false;

  }


  appData.rubrics.push({

    id:
      createId(),

    createdAt:
      new Date().toISOString(),

    ...rubric

  });


  addActivity(
    "rubric",
    "Assessment rubric created."
  );


  if (
    saveData()
  ) {

    updateHomeDashboard();

    return true;

  }


  return false;

}


/* =========================================================
   36. ADD DOCUMENT
   ========================================================= */

function addDocument(
  documentData
) {

  if (
    !documentData ||
    typeof documentData !== "object"
  ) {

    return false;

  }


  appData.documents.push({

    id:
      createId(),

    createdAt:
      new Date().toISOString(),

    ...documentData

  });


  addActivity(
    "document",
    "Document saved."
  );


  if (
    saveData()
  ) {

    updateHomeDashboard();

    return true;

  }


  return false;

}


/* =========================================================
   37. UPDATE TEACHER
   ========================================================= */

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

    ...teacher

  };


  addActivity(
    "profile",
    "Teacher profile updated."
  );


  if (
    saveData()
  ) {

    updateHomeDashboard();

    return true;

  }


  return false;

}


/* =========================================================
   38. UPDATE PREFERENCES
   ========================================================= */

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


  addActivity(
    "settings",
    "Preferences updated."
  );


  if (
    saveData()
  ) {

    updateHomeDashboard();

    return true;

  }


  return false;

}


/* =========================================================
   39. CREATE LOCAL ID
   ========================================================= */

function createId() {

  return (
    Date.now().toString(36) +
    "-" +
    Math.random()
      .toString(36)
      .slice(
        2,
        10
      )
  );

}


/* =========================================================
   40. TOAST
   ========================================================= */

function showToast(
  message
) {

  let toast =
    document.getElementById(
      "cbcToast"
    );


  if (!toast) {

    toast =
      document.createElement(
        "div"
      );

    toast.id =
      "cbcToast";


    document.body.appendChild(
      toast
    );

  }


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toast._timeout
  );


  toast._timeout =
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
   41. PUBLIC API
   ========================================================= */

window.CBCMaster = {

  getData() {

    return appData;

  },


  save() {

    return saveData();

  },


  refresh() {

    appData =
      loadData();

    updateHomeDashboard();

  },


  navigate(page) {

    navigateToPage(
      page
    );

  },


  addStudent,

  addReportBook,

  addScheme,

  addLessonPlan,

  addRubric,

  addDocument,

  updateTeacher,

  updatePreferences

};


/* =========================================================
   END CBC MASTER V2 APPLICATION ENGINE
   ========================================================= */
