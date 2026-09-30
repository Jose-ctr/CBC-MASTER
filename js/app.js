/* =========================================================
   CBC MASTER V2
   APPLICATION ENGINE
   Home Dashboard • Navigation • Local Data Foundation
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
   2. LOAD LOCAL DATA
   ========================================================= */

function loadData() {

  try {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return structuredClone(DEFAULT_DATA);
    }

    const parsed = JSON.parse(saved);

    return mergeData(
      structuredClone(DEFAULT_DATA),
      parsed
    );

  } catch (error) {

    console.error(
      "CBC MASTER: Could not load local data.",
      error
    );

    return structuredClone(DEFAULT_DATA);
  }
}


/* =========================================================
   3. MERGE DATA SAFELY
   ========================================================= */

function mergeData(defaults, saved) {

  if (!saved || typeof saved !== "object") {
    return defaults;
  }

  Object.keys(defaults).forEach((key) => {

    if (
      saved[key] !== undefined &&
      saved[key] !== null
    ) {

      if (
        typeof defaults[key] === "object" &&
        !Array.isArray(defaults[key]) &&
        typeof saved[key] === "object" &&
        !Array.isArray(saved[key])
      ) {

        defaults[key] = {
          ...defaults[key],
          ...saved[key]
        };

      } else {

        defaults[key] = saved[key];

      }
    }

  });

  return defaults;
}


/* =========================================================
   4. SAVE LOCAL DATA
   ========================================================= */

function saveData() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(appData)
    );

  } catch (error) {

    console.error(
      "CBC MASTER: Could not save local data.",
      error
    );
  }
}


/* =========================================================
   5. APPLICATION STATE
   ========================================================= */

let appData = loadData();


let currentPage = "dashboard";


/* =========================================================
   6. PAGE TITLES
   ========================================================= */

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
   7. DOM REFERENCES
   ========================================================= */

const pageTitle =
  document.getElementById("pageTitle");

const pageContainer =
  document.getElementById("pageContainer");

const notificationButton =
  document.getElementById("notificationButton");

const settingsButton =
  document.getElementById("settingsButton");


/* =========================================================
   8. INITIALIZE APPLICATION
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  initApp
);


function initApp() {

  bindNavigation();

  bindDashboardModules();

  bindHeaderActions();

  updateTeacherIdentity();

  updateHomeDashboard();

  navigateToPage("dashboard");

}


/* =========================================================
   9. SIDEBAR + BOTTOM NAVIGATION
   ========================================================= */

function bindNavigation() {

  const navigationButtons =
    document.querySelectorAll(
      "[data-page]"
    );


  navigationButtons.forEach((button) => {

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
   10. PAGE NAVIGATION
   ========================================================= */

function navigateToPage(page) {

  if (!PAGE_TITLES[page]) {
    page = "dashboard";
  }

  currentPage = page;

  updateActiveNavigation(page);

  updatePageTitle(page);

  if (page === "dashboard") {

    renderHome();

    return;
  }


  /*
   * Other modules will be built in later stages.
   * For now, keep navigation functional without
   * pretending those modules already contain data.
   */

  renderComingSoonPage(page);
}


/* =========================================================
   11. ACTIVE NAVIGATION
   ========================================================= */

function updateActiveNavigation(page) {

  const sidebarLinks =
    document.querySelectorAll(
      ".sidebar-link"
    );

  sidebarLinks.forEach((button) => {

    button.classList.toggle(
      "active",
      button.dataset.page === page
    );

  });


  const bottomLinks =
    document.querySelectorAll(
      ".bottom-nav-item"
    );

  bottomLinks.forEach((button) => {

    button.classList.toggle(
      "active",
      button.dataset.page === page
    );

  });

}


/* =========================================================
   12. PAGE TITLE
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
   13. DASHBOARD MODULE BUTTONS
   ========================================================= */

function bindDashboardModules() {

  const moduleButtons =
    document.querySelectorAll(
      "[data-module]"
    );


  moduleButtons.forEach((button) => {

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
   14. HEADER ACTIONS
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

        navigateToPage("settings");

      }
    );

  }

}


/* =========================================================
   15. NOTIFICATIONS
   ========================================================= */

function handleNotifications() {

  const notifications =
    getNotifications();


  if (notifications.length === 0) {

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


  if (appData.students.length === 0) {

    notifications.push({
      type: "info",
      message:
        "Add your first learner to begin building your CBC records."
    });

  }


  if (appData.documents.length === 0) {

    notifications.push({
      type: "info",
      message:
        "Your saved CBC documents will appear here."
    });

  }


  return notifications;
}


/* =========================================================
   16. HOME RENDERING
   ========================================================= */

function renderHome() {

  if (!pageContainer) {
    return;
  }


  /*
   * The original dashboard markup is retained in
   * index.html. We only update its live values.
   */

  updateHomeDashboard();

}


/* =========================================================
   17. UPDATE HOME DASHBOARD
   ========================================================= */

function updateHomeDashboard() {

  updateTeacherIdentity();

  updateModuleCounts();

  updateQuickStatistics();

  updateWelcomeArea();

}


/* =========================================================
   18. TEACHER IDENTITY
   ========================================================= */

function updateTeacherIdentity() {

  const teacher =
    appData.teacher || DEFAULT_DATA.teacher;


  const teacherName =
    teacher.name &&
    teacher.name.trim()
      ? teacher.name.trim()
      : "Teacher";


  const profileName =
    document.querySelector(
      ".profile-name"
    );


  const profileAvatar =
    document.querySelector(
      ".profile-avatar"
    );


  const welcomeTitle =
    document.querySelector(
      ".welcome-title"
    );


  if (profileName) {

    profileName.textContent =
      teacherName;

  }


  if (profileAvatar) {

    profileAvatar.textContent =
      getInitials(teacherName);

  }


  if (welcomeTitle) {

    welcomeTitle.textContent =
      getGreeting() +
      ", " +
      teacherName;

  }

}


/* =========================================================
   19. INITIALS
   ========================================================= */

function getInitials(name) {

  if (!name) {
    return "T";
  }


  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);


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
   20. GREETING
   ========================================================= */

function getGreeting() {

  const hour =
    new Date().getHours();


  if (hour < 12) {
    return "Good morning";
  }


  if (hour < 17) {
    return "Good afternoon";
  }


  return "Good evening";

}


/* =========================================================
   21. WELCOME CONTEXT
   ========================================================= */

function updateWelcomeArea() {

  const welcomeText =
    document.querySelector(
      ".welcome-text"
    );


  if (!welcomeText) {
    return;
  }


  const preference =
    appData.preferences ||
    DEFAULT_DATA.preferences;


  const grade =
    preference.grade ||
    "Grade 5";


  const term =
    preference.term ||
    "Term 1";


  welcomeText.textContent =
    `Here's your teaching overview for ${grade}, ${term}.`;

}


/* =========================================================
   22. MODULE COUNTS
   ========================================================= */

function updateModuleCounts() {

  const counts = {

    "report-books":
      appData.reportBooks.length,

    schemes:
      appData.schemes.length,

    "lesson-plans":
      appData.lessonPlans.length,

    rubrics:
      appData.rubrics.length

  };


  Object.entries(counts)
    .forEach(([module, count]) => {

      const card =
        document.querySelector(
          `[data-module="${module}"]`
        );


      if (!card) {
        return;
      }


      const stat =
        card.querySelector(
          ".card-stat strong"
        );


      if (stat) {

        stat.textContent =
          formatNumber(count);

      }

    });

}


/* =========================================================
   23. QUICK STATISTICS
   ========================================================= */

function updateQuickStatistics() {

  const values = {

    students:
      appData.students.length,

    "report-books":
      appData.reportBooks.length,

    schemes:
      appData.schemes.length,

    documents:
      appData.documents.length

  };


  const statCards =
    document.querySelectorAll(
      ".stat-card"
    );


  statCards.forEach((card) => {

    const label =
      card.querySelector(
        ".stat-label"
      );


    const value =
      card.querySelector(
        ".stat-value"
      );


    if (!label || !value) {
      return;
    }


    const key =
      label.textContent
        .trim()
        .toLowerCase();


    if (key === "students") {

      value.textContent =
        formatNumber(values.students);

    }


    if (key === "report books") {

      value.textContent =
        formatNumber(values["report-books"]);

    }


    if (key === "schemes") {

      value.textContent =
        formatNumber(values.schemes);

    }


    if (key === "documents") {

      value.textContent =
        formatNumber(values.documents);

    }

  });

}


/* =========================================================
   24. NUMBER FORMAT
   ========================================================= */

function formatNumber(number) {

  return new Intl.NumberFormat(
    "en-KE"
  ).format(
    Number(number) || 0
  );

}


/* =========================================================
   25. COMING SOON PAGE
   ========================================================= */

function renderComingSoonPage(page) {

  if (!pageContainer) {
    return;
  }


  const title =
    PAGE_TITLES[page] ||
    "Module";


  pageContainer.innerHTML = `

    <section
      class="welcome-card"
      style="margin-bottom: 24px;"
    >

      <div class="welcome-content">

        <div class="welcome-eyebrow">
          CBC MASTER V2
        </div>

        <h1 class="welcome-title">
          ${escapeHtml(title)}
        </h1>

        <p class="welcome-text">
          This module is part of the CBC MASTER V2
          workspace and will be connected to local
          data in its build stage.
        </p>

      </div>

      <div
        class="welcome-badge"
        aria-hidden="true"
      >
        📚
      </div>

    </section>

  `;

}


/* =========================================================
   26. RETURN TO HOME SAFELY
   ========================================================= */

function restoreDashboardMarkup() {

  /*
   * The dashboard lives in index.html.
   * Because later modules replace pageContainer
   * temporarily, reload is intentionally avoided.
   *
   * The complete multi-page rendering system will
   * be introduced as the remaining modules are built.
   */

}


/* =========================================================
   27. TOAST
   ========================================================= */

function showToast(message) {

  let toast =
    document.getElementById(
      "cbcToast"
    );


  if (!toast) {

    toast =
      document.createElement("div");

    toast.id =
      "cbcToast";


    toast.style.position =
      "fixed";

    toast.style.left =
      "50%";

    toast.style.bottom =
      "92px";

    toast.style.transform =
      "translateX(-50%)";

    toast.style.zIndex =
      "9999";

    toast.style.maxWidth =
      "calc(100vw - 32px)";

    toast.style.padding =
      "11px 16px";

    toast.style.background =
      "#123452";

    toast.style.color =
      "#F7FAFC";

    toast.style.border =
      "1px solid rgba(255,255,255,.12)";

    toast.style.borderRadius =
      "12px";

    toast.style.fontSize =
      "13px";

    toast.style.fontWeight =
      "650";

    toast.style.boxShadow =
      "0 10px 30px rgba(0,0,0,.3)";

    toast.style.textAlign =
      "center";

    document.body.appendChild(toast);

  }


  toast.textContent =
    message;


  toast.style.opacity =
    "1";


  clearTimeout(
    toast._timeout
  );


  toast._timeout =
    setTimeout(() => {

      toast.style.opacity =
        "0";

    }, 2500);

}


/* =========================================================
   28. ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   29. PUBLIC DATA ACCESS
   ========================================================= */

window.CBCMaster = {

  getData() {

    return appData;
  },


  save() {

    saveData();

    updateHomeDashboard();
  },


  refresh() {

    appData =
      loadData();

    updateHomeDashboard();
  },


  navigate(page) {

    navigateToPage(page);
  },


  addStudent(student) {

    if (!student || typeof student !== "object") {
      return false;
    }


    appData.students.push({
      id: createId(),
      createdAt: new Date().toISOString(),
      ...student
    });


    saveData();

    updateHomeDashboard();

    return true;
  },


  addDocument(document) {

    if (!document || typeof document !== "object") {
      return false;
    }


    appData.documents.push({
      id: createId(),
      createdAt: new Date().toISOString(),
      ...document
    });


    saveData();

    updateHomeDashboard();

    return true;
  },


  setTeacher(teacher) {

    if (!teacher || typeof teacher !== "object") {
      return false;
    }


    appData.teacher = {
      ...appData.teacher,
      ...teacher
    };


    saveData();

    updateHomeDashboard();

    return true;
  }

};


/* =========================================================
   30. LOCAL ID GENERATOR
   ========================================================= */

function createId() {

  return (
    Date.now().toString(36) +
    "-" +
    Math.random()
      .toString(36)
      .slice(2, 10)
  );

}


/* =========================================================
   31. FIRST SAVE
   ========================================================= */

if (!localStorage.getItem(STORAGE_KEY)) {

  saveData();

}


/* =========================================================
   END CBC MASTER V2 APPLICATION ENGINE
   ========================================================= */
