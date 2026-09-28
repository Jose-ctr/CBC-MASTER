

/* =========================================================
   PART 2A — CBC MASTER APPLICATION CONSTANTS
   ========================================================= */

const CBC_APP = {

  name: "CBC MASTER",

  version: "2.0",

  storageKey: "cbc_master_v2",

  defaultPage: "dashboard",

  supportedGrades: [
    "PP1",
    "PP2",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12"
  ]

};


/* =========================================================
   PART 2B — DEFAULT APPLICATION STATE
   ========================================================= */

const CBC_DEFAULT_STATE = {

  app: {
    version: "2.0",
    initialized: true
  },

  navigation: {
    currentPage: "dashboard"
  },

  teacher: {

    name: "Teacher",

    role: "CBC MASTER User",

    school: "",

    phone: "",

    email: "",

    county: "",

    photo: ""

  },

  academic: {

    selectedGrade: "Grade 5",

    selectedTerm: "Term 1",

    selectedYear: new Date().getFullYear()

  },

  dashboard: {

    students: 0,

    reportBooks: 0,

    schemes: 0,

    lessonPlans: 0,

    rubrics: 0,

    documents: 0

  },

  settings: {

    notifications: true,

    autoSave: true,

    darkMode: true

  }

};


/* =========================================================
   PART 2C — APPLICATION STATE
   ========================================================= */

let CBC_STATE = null;


/* =========================================================
   PART 2D — SAFE CLONE
   ========================================================= */

function cbcClone(value) {

  return JSON.parse(
    JSON.stringify(value)
  );

}


/* =========================================================
   PART 2E — MERGE OBJECTS
   ========================================================= */

function cbcMerge(base, saved) {

  if (
    !saved ||
    typeof saved !== "object"
  ) {
    return cbcClone(base);
  }


  const result = cbcClone(base);


  Object.keys(saved).forEach(key => {

    if (
      saved[key] &&
      typeof saved[key] === "object" &&
      !Array.isArray(saved[key]) &&
      result[key] &&
      typeof result[key] === "object" &&
      !Array.isArray(result[key])
    ) {

      result[key] = cbcMerge(
        result[key],
        saved[key]
      );

    } else {

      result[key] = saved[key];

    }

  });


  return result;

}


/* =========================================================
   PART 2F — LOAD APPLICATION STATE
   ========================================================= */

function cbcLoadState() {

  try {

    const raw =
      localStorage.getItem(
        CBC_APP.storageKey
      );


    if (!raw) {

      CBC_STATE =
        cbcClone(CBC_DEFAULT_STATE);

      cbcSaveState();

      return CBC_STATE;

    }


    const saved =
      JSON.parse(raw);


    CBC_STATE =
      cbcMerge(
        CBC_DEFAULT_STATE,
        saved
      );


    return CBC_STATE;

  }

  catch (error) {

    console.warn(
      "CBC MASTER: Could not load saved state.",
      error
    );


    CBC_STATE =
      cbcClone(CBC_DEFAULT_STATE);


    return CBC_STATE;

  }

}


/* =========================================================
   PART 2G — SAVE APPLICATION STATE
   ========================================================= */

function cbcSaveState() {

  try {

    localStorage.setItem(

      CBC_APP.storageKey,

      JSON.stringify(CBC_STATE)

    );

    return true;

  }

  catch (error) {

    console.warn(
      "CBC MASTER: Could not save state.",
      error
    );

    return false;

  }

}


/* =========================================================
   PART 2H — UPDATE STATE
   ========================================================= */

function cbcUpdateState(path, value) {

  if (!CBC_STATE) {
    cbcLoadState();
  }


  const parts =
    String(path).split(".");


  let target =
    CBC_STATE;


  for (
    let i = 0;
    i < parts.length - 1;
    i++
  ) {

    if (
      !target[parts[i]] ||
      typeof target[parts[i]] !== "object"
    ) {

      target[parts[i]] = {};

    }


    target =
      target[parts[i]];

  }


  target[
    parts[parts.length - 1]
  ] = value;


  cbcSaveState();


  document.dispatchEvent(
    new CustomEvent(
      "cbc:statechange",
      {
        detail: {
          path,
          value,
          state: CBC_STATE
        }
      }
    )
  );

}


/* =========================================================
   PART 2I — GET STATE VALUE
   ========================================================= */

function cbcGetState(path, fallback = null) {

  if (!CBC_STATE) {
    cbcLoadState();
  }


  const parts =
    String(path).split(".");


  let value =
    CBC_STATE;


  for (const part of parts) {

    if (
      value === null ||
      value === undefined ||
      !(part in value)
    ) {

      return fallback;

    }


    value =
      value[part];

  }


  return value;

}


/* =========================================================
   PART 2J — PAGE DEFINITIONS
   ========================================================= */

const CBC_PAGES = {

  dashboard: {
    title: "Dashboard",
    label: "Dashboard"
  },

  "report-books": {
    title: "Report Books",
    label: "Report Books"
  },

  schemes: {
    title: "Schemes of Work",
    label: "Schemes"
  },

  "lesson-plans": {
    title: "Lesson Plans",
    label: "Lesson Plans"
  },

  rubrics: {
    title: "Assessment Rubrics",
    label: "Assessment Rubrics"
  },

  students: {
    title: "Students",
    label: "Students"
  },

  documents: {
    title: "Saved Documents",
    label: "Documents"
  },

  analytics: {
    title: "Analytics",
    label: "Analytics"
  },

  profile: {
    title: "Teacher Profile",
    label: "Profile"
  },

  settings: {
    title: "Settings",
    label: "Settings"
  }

};


/* =========================================================
      PART 2K — GET PAGE
   ========================================================= */

function cbcGetPage(page) {

  return CBC_PAGES[page]
    ? CBC_PAGES[page]
    : CBC_PAGES.dashboard;

}


/* =========================================================
   PART 2L — UPDATE PAGE TITLE
   ========================================================= */

function cbcUpdatePageTitle(page) {

  const titleElement =
    document.getElementById(
      "pageTitle"
    );


  if (!titleElement) {
    return;
  }


  const pageData =
    cbcGetPage(page);


  titleElement.textContent =
    pageData.title;

}


/* =========================================================
   PART 2M — SET ACTIVE NAVIGATION
   ========================================================= */

function cbcSetActiveNavigation(page) {

  document
    .querySelectorAll(
      ".sidebar-link"
    )
    .forEach(button => {

      const isActive =
        button.dataset.page === page;

      button.classList.toggle(
        "active",
        isActive
      );

    });


  document
    .querySelectorAll(
      ".bottom-nav-item"
    )
    .forEach(button => {

      const isActive =
        button.dataset.page === page;

      button.classList.toggle(
        "active",
        isActive
      );

    });

}


/* =========================================================
   PART 2N — DASHBOARD VISIBILITY
   ========================================================= */

function cbcShowDashboard() {

  const dashboard =
    document.getElementById(
      "dashboardPage"
    );


  if (dashboard) {

    dashboard.style.display =
      "";

  }

}


/* =========================================================
   PART 2O — FUTURE PAGE HANDLER
   ========================================================= */

function cbcHandlePage(page) {

  /*
     Later modules can register themselves here.

     Example:

     CBC_PAGE_HANDLERS["report-books"] = function() {
       ...
     };
  */


  const handler =
    CBC_PAGE_HANDLERS[page];


  if (
    typeof handler === "function"
  ) {

    handler();

    return true;

  }


  return false;

}


/* =========================================================
   PART 2P — PAGE HANDLER REGISTRY
   ========================================================= */

const CBC_PAGE_HANDLERS = {};


/* =========================================================
   PART 2Q — REGISTER PAGE
   ========================================================= */

function cbcRegisterPage(
  page,
  handler
) {

  if (
    typeof page !== "string" ||
    typeof handler !== "function"
  ) {

    console.warn(
      "CBC MASTER: Invalid page registration.",
      page
    );

    return false;

  }


  CBC_PAGE_HANDLERS[page] =
    handler;


  return true;

}


/* =========================================================
   PART 2R — NAVIGATE
   ========================================================= */

function cbcNavigate(page) {

  if (!CBC_PAGES[page]) {

    console.warn(
      "CBC MASTER: Unknown page:",
      page
    );

    page =
      CBC_APP.defaultPage;

  }


  CBC_STATE.navigation.currentPage =
    page;


  cbcSaveState();


  cbcUpdatePageTitle(page);

  cbcSetActiveNavigation(page);


  /*
     Dashboard is already part of Part 1.
     Future modules will register handlers.
  */

  const handled =
    cbcHandlePage(page);


  if (!handled) {

    cbcShowDashboardPlaceholder(page);

  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  document.dispatchEvent(
    new CustomEvent(
      "cbc:navigate",
      {
        detail: {
          page,
          state: CBC_STATE
        }
      }
    )
  );

}


/* =========================================================
   PART 2S — PLACEHOLDER FOR FUTURE MODULES
   ========================================================= */

function cbcShowDashboardPlaceholder(page) {

  if (page === "dashboard") {

    cbcShowDashboard();

    return;

  }


  /*
     IMPORTANT:

     We do not permanently replace the dashboard HTML.

     When Part 3, Part 4, etc. register their page
     handlers, those modules will take control.

     For now this function only gives feedback that
     the module is ready for integration.
  */

  const container =
    document.getElementById(
      "pageContainer"
    );


  if (!container) {
    return;
  }


  const dashboard =
    document.getElementById(
      "dashboardPage"
    );


  if (dashboard) {

    dashboard.style.display =
      "none";

  }


  let placeholder =
    document.getElementById(
      "cbcPagePlaceholder"
    );


  if (!placeholder) {

    placeholder =
      document.createElement(
        "div"
      );

    placeholder.id =
      "cbcPagePlaceholder";

    placeholder.style.cssText = `
      min-height: 420px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 30px;
    `;

    container.appendChild(
      placeholder
    );

  }


  const pageData =
    cbcGetPage(page);


  placeholder.innerHTML = `

    <div style="
      width:100%;
      max-width:520px;
      padding:40px 25px;
      background:
        linear-gradient(
          145deg,
          #102943,
          #0C2035
        );
      border:1px solid rgba(255,255,255,0.09);
      border-radius:22px;
      box-shadow:0 15px 40px rgba(0,0,0,0.25);
    ">

      <div style="
        width:64px;
        height:64px;
        margin:0 auto 18px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:18px;
        background:rgba(245,183,0,0.10);
        border:1px solid rgba(245,183,0,0.30);
        font-size:28px;
      ">
        ${cbcPageIcon(page)}
      </div>

      <h2 style="
        margin:0;
        color:#F8FAFC;
        font-size:23px;
      ">
        ${pageData.title}
      </h2>

      <p style="
        margin:10px 0 0;
        color:#AAB8CA;
        font-size:13px;
        line-height:1.6;
      ">
        This CBC MASTER module is ready
        for its dedicated engine.
      </p>

    </div>

  `;

}


/* =========================================================
   PART 2T — PAGE ICONS
   ========================================================= */

function cbcPageIcon(page) {

  const icons = {

    dashboard: "🏠",

    "report-books": "📋",

    schemes: "📅",

    "lesson-plans": "📖",

    rubrics: "☑️",

    students: "👥",

    documents: "📄",

    analytics: "📊",

    profile: "👤",

    settings: "⚙️"

  };


  return icons[page] || "📁";

}


/* =========================================================
   PART 2U — CLOSE PLACEHOLDER
   ========================================================= */

function cbcRemovePlaceholder() {

  const placeholder =
    document.getElementById(
      "cbcPagePlaceholder"
    );


  if (placeholder) {

    placeholder.remove();

  }

}


/* =========================================================
   PART 2V — DASHBOARD CARD NAVIGATION
   ========================================================= */

function cbcSetupDashboardCards() {

  document
    .querySelectorAll(
      "[data-module]"
    )
    .forEach(card => {

      card.addEventListener(
        "click",
        function() {

          const module =
            this.dataset.module;


          if (CBC_PAGES[module]) {

            cbcNavigate(module);

          }

        }
      );

    });

}


/* =========================================================
   PART 2W — SIDEBAR NAVIGATION
   ========================================================= */

function cbcSetupSidebarNavigation() {

  document
    .querySelectorAll(
      ".sidebar-link[data-page]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        function() {

          const page =
            this.dataset.page;


          cbcNavigate(page);

        }
      );

    });

}


/* =========================================================
   PART 2X — MOBILE NAVIGATION
   ========================================================= */

function cbcSetupBottomNavigation() {

  document
    .querySelectorAll(
      ".bottom-nav-item[data-page]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        function() {

          const page =
            this.dataset.page;


          cbcNavigate(page);

        }
      );

    });

}


/* =========================================================
   PART 2Y — HEADER SETTINGS BUTTON
   ========================================================= */

function cbcSetupHeaderActions() {

  const settingsButton =
    document.getElementById(
      "settingsButton"
    );


  if (settingsButton) {

    settingsButton.addEventListener(
      "click",
      function() {

        cbcNavigate("settings");

      }
    );

  }


  const notificationButton =
    document.getElementById(
      "notificationButton"
    );


  if (notificationButton) {

    notificationButton.addEventListener(
      "click",
      function() {

        cbcShowNotification(
          "Notifications",
          "No new notifications."
        );

      }
    );

  }

}


/* =========================================================
   PART 2Z — TEACHER NAME
   ========================================================= */

function cbcUpdateTeacherName() {

  const name =
    cbcGetState(
      "teacher.name",
      "Teacher"
    );


  const welcomeTitle =
    document.querySelector(
      ".welcome-title"
    );


  if (welcomeTitle) {

    const hour =
      new Date().getHours();


    let greeting =
      "Good morning";


    if (hour >= 12 && hour < 18) {

      greeting =
        "Good afternoon";

    }


    if (hour >= 18) {

      greeting =
        "Good evening";

    }


    welcomeTitle.textContent =
      `${greeting}, ${name}`;

  }


  document
    .querySelectorAll(
      ".profile-name"
    )
    .forEach(element => {

      element.textContent =
        name;

    });

}


/* =========================================================
   PART 2AA — DASHBOARD STATISTICS
   ========================================================= */

function cbcUpdateDashboardStats() {

  const stats =
    cbcGetState(
      "dashboard",
      {}
    );


  const mapping = {

    students:
      stats.students || 0,

    reportBooks:
      stats.reportBooks || 0,

    schemes:
      stats.schemes || 0,

    lessonPlans:
      stats.lessonPlans || 0,

    rubrics:
      stats.rubrics || 0,

    documents:
      stats.documents || 0

  };


  /*
     Dashboard cards
  */

  const cardStats =
    document.querySelectorAll(
      ".dashboard-card .card-stat"
    );


  const cardValues = [

    mapping.reportBooks,

    mapping.schemes,

    mapping.lessonPlans,

    mapping.rubrics

  ];


  cardStats.forEach(
    (element, index) => {

      if (
        cardValues[index] !== undefined
      ) {

        const strong =
          element.querySelector(
            "strong"
          );


        if (strong) {

          strong.textContent =
            cardValues[index];

        }

      }

    }
  );


  /*
     Overview cards
  */

  const statValues =
    document.querySelectorAll(
      ".stats-grid .stat-value"
    );


  const overviewValues = [

    mapping.students,

    mapping.reportBooks,

    mapping.schemes,

    mapping.documents

  ];


  statValues.forEach(
    (element, index) => {

      if (
        overviewValues[index] !== undefined
      ) {

        element.textContent =
          overviewValues[index];

      }

    }
  );

}


/* =========================================================
   PART 2AB — SIMPLE NOTIFICATION SYSTEM
   ========================================================= */

function cbcShowNotification(
  title,
  message
) {

  let box =
    document.getElementById(
      "cbcToast"
    );


  if (!box) {

    box =
      document.createElement(
        "div"
      );

    box.id =
      "cbcToast";


    box.style.cssText = `

      position:fixed;

      left:50%;

      top:20px;

      transform:
        translateX(-50%)
        translateY(-20px);

      z-index:99999;

      width:
        min(90vw, 380px);

      padding:
        15px 17px;

      background:
        rgba(10,30,49,0.97);

      border:
        1px solid
        rgba(245,183,0,0.35);

      border-radius:
        15px;

      box-shadow:
        0 15px 40px
        rgba(0,0,0,0.35);

      opacity:0;

      transition:
        opacity .2s ease,
        transform .2s ease;

    `;


    document.body.appendChild(
      box
    );

  }


  box.innerHTML = `

    <div style="
      color:#F8D77A;
      font-size:13px;
      font-weight:800;
      margin-bottom:4px;
    ">
      ${title}
    </div>

    <div style="
      color:#AAB8CA;
      font-size:12px;
      line-height:1.45;
    ">
      ${message}
    </div>

  `;


  requestAnimationFrame(() => {

    box.style.opacity =
      "1";

    box.style.transform =
      "translateX(-50%) translateY(0)";

  });


  clearTimeout(
    box._cbcTimer
  );


  box._cbcTimer =
    setTimeout(() => {

      box.style.opacity =
        "0";

      box.style.transform =
        "translateX(-50%) translateY(-20px)";

    }, 2800);

}


/* =========================================================
PART 2AC — RESET APPLICATION DATA
   ========================================================= */

function cbcResetApplication() {

  const confirmed =
    window.confirm(
      "Reset CBC MASTER data?\n\n" +
      "This will remove locally saved " +
      "application data."
    );


  if (!confirmed) {
    return false;
  }


  try {

    localStorage.removeItem(
      CBC_APP.storageKey
    );


    CBC_STATE =
      cbcClone(
        CBC_DEFAULT_STATE
      );


    cbcSaveState();


    cbcUpdateTeacherName();

    cbcUpdateDashboardStats();

    cbcNavigate("dashboard");


    cbcShowNotification(
      "CBC MASTER",
      "Application data has been reset."
    );


    return true;

  }

  catch (error) {

    console.error(
      "CBC MASTER reset error:",
      error
    );


    return false;

  }

}


/* =========================================================
   PART 2AD — APPLICATION INITIALIZATION
   ========================================================= */

function initializeCBCMaster() {

  /*
     1. Load saved state
  */

  cbcLoadState();


  /*
     2. Update dashboard
  */

  cbcUpdateTeacherName();

  cbcUpdateDashboardStats();


  /*
     3. Attach navigation
  */

  cbcSetupDashboardCards();

  cbcSetupSidebarNavigation();

  cbcSetupBottomNavigation();

  cbcSetupHeaderActions();


  /*
     4. Restore last page
  */

  const savedPage =
    cbcGetState(
      "navigation.currentPage",
      "dashboard"
    );


  /*
     Always start on dashboard for
     a clean app launch.

     The saved page remains available
     to future session logic.
  */

  cbcNavigate(
    CBC_APP.defaultPage
  );


  /*
     5. Notify other CBC modules
  */

  document.dispatchEvent(
    new CustomEvent(
      "cbc:ready",
      {
        detail: {
          state: CBC_STATE,
          app: CBC_APP
        }
      }
    )
  );


  console.log(
    "CBC MASTER V2 initialized.",
    CBC_STATE
  );

}


/* =========================================================
   PART 2AE — PUBLIC CBC MASTER API
   ========================================================= */

window.CBC_MASTER = {

  /* State */

  getState: function() {

    return CBC_STATE;

  },


  get: function(path, fallback) {

    return cbcGetState(
      path,
      fallback
    );

  },


  set: function(path, value) {

    cbcUpdateState(
      path,
      value
    );

  },


  save: function() {

    return cbcSaveState();

  },


  /* Navigation */

  navigate: function(page) {

    cbcNavigate(page);

  },


  registerPage: function(
    page,
    handler
  ) {

    return cbcRegisterPage(
      page,
      handler
    );

  },


  /* Utility */

  notify: function(
    title,
    message
  ) {

    cbcShowNotification(
      title,
      message
    );

  },


  reset: function() {

    return cbcResetApplication();

  },


  /* Configuration */

  app: CBC_APP,

  pages: CBC_PAGES

};


/* =========================================================
   PART 2AF — DOM READY
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeCBCMaster
  );

}

else {

  initializeCBCMaster();

}


/* =========================================================
   PART 2 END
   ========================================================= */





(function () {

  "use strict";


  /* =========================================================
     REPORT BOOK STORAGE KEY
     ========================================================= */

  const REPORT_BOOK_STORAGE =
    "cbc_master_report_books_v2";


  /* =========================================================
     GRADE LIST
     ========================================================= */

  const REPORT_GRADES = [

    "PP1",
    "PP2",

    "Grade 1",
    "Grade 2",
    "Grade 3",

    "Grade 4",
    "Grade 5",
    "Grade 6",

    "Grade 7",
    "Grade 8",
    "Grade 9",

    "Grade 10",
    "Grade 11",
    "Grade 12"

  ];


  /* =========================================================
     TERMS
     ========================================================= */

  const REPORT_TERMS = [

    "Term 1",
    "Term 2",
    "Term 3"

  ];


  /* =========================================================
     REPORT BOOK SUBJECT FOUNDATION
     
     Detailed CBC subject structures can be extended
     by later curriculum-data modules.
     ========================================================= */

  const CBC_REPORT_SUBJECTS = {

    "PP1": [
      "Language Activities",
      "Mathematical Activities",
      "Environmental Activities",
      "Psychomotor Activities",
      "Creative Activities",
      "Religious Activities"
    ],

    "PP2": [
      "Language Activities",
      "Mathematical Activities",
      "Environmental Activities",
      "Psychomotor Activities",
      "Creative Activities",
      "Religious Activities"
    ],

    "Grade 1": [
      "English",
      "Kiswahili",
      "Mathematics",
      "Environmental Activities",
      "Creative Activities",
      "Religious Education"
    ],

    "Grade 2": [
      "English",
      "Kiswahili",
      "Mathematics",
      "Environmental Activities",
      "Creative Activities",
      "Religious Education"
    ],

    "Grade 3": [
      "English",
      "Kiswahili",
      "Mathematics",
      "Environmental Activities",
      "Creative Activities",
      "Religious Education"
    ],

    "Grade 4": [
      "English",
      "Kiswahili",
      "Mathematics",
      "Science and Technology",
      "Social Studies",
      "Creative Arts",
      "Religious Education"
    ],

    "Grade 5": [
      "English",
      "Kiswahili",
      "Mathematics",
      "Science and Technology",
      "Social Studies",
      "Creative Arts",
      "Religious Education"
    ],

    "Grade 6": [
      "English",
      "Kiswahili",
      "Mathematics",
      "Science and Technology",
      "Social Studies",
      "Creative Arts",
      "Religious Education"
    ],

    "Grade 7": [
      "English",
      "Kiswahili",
      "Mathematics",
      "Integrated Science",
      "Social Studies",
      "Creative Arts and Sports",
      "Religious Education",
      "Agriculture and Nutrition"
    ],

    "Grade 8": [
      "English",
      "Kiswahili",
      "Mathematics",
      "Integrated Science",
      "Social Studies",
      "Creative Arts and Sports",
      "Religious Education",
      "Agriculture and Nutrition"
    ],

    "Grade 9": [
      "English",
      "Kiswahili",
      "Mathematics",
      "Integrated Science",
      "Social Studies",
      "Creative Arts and Sports",
      "Religious Education",
      "Agriculture and Nutrition"
    ],

    "Grade 10": [
      "English",
      "Kiswahili",
      "Mathematics",
      "Community Service Learning"
    ],

    "Grade 11": [
      "English",
      "Kiswahili",
      "Mathematics"
    ],

    "Grade 12": [
      "English",
      "Kiswahili",
      "Mathematics"
    ]

  };


  /* =========================================================
     REPORT BOOK STATE
     ========================================================= */

  let reportState = {

    students: [],

    selectedGrade:
      "Grade 5",

    selectedTerm:
      "Term 1",

    selectedYear:
      new Date().getFullYear(),

    selectedStudent:
      null,

    assessments: {},

    competencySummaries: {},

    reports: {}

  };


  /* =========================================================
     LOAD REPORT STATE
     ========================================================= */

  function loadReportState() {

    try {

      const raw =
        localStorage.getItem(
          REPORT_BOOK_STORAGE
        );


      if (!raw) {

        saveReportState();

        return;

      }


      const saved =
        JSON.parse(raw);


      if (
        saved &&
        typeof saved === "object"
      ) {

        reportState =
          Object.assign(
            reportState,
            saved
          );

      }

    }

    catch (error) {

      console.warn(
        "CBC MASTER: Report Books data could not be loaded.",
        error
      );

    }

  }


  /* =========================================================
     SAVE REPORT STATE
     ========================================================= */

  function saveReportState() {

    try {

      localStorage.setItem(

        REPORT_BOOK_STORAGE,

        JSON.stringify(
          reportState
        )

      );


      updateGlobalDashboardStats();

      return true;

    }

    catch (error) {

      console.warn(
        "CBC MASTER: Report Books data could not be saved.",
        error
      );

      return false;

    }

  }


  /* =========================================================
     UPDATE GLOBAL DASHBOARD STATISTICS
     ========================================================= */

  function updateGlobalDashboardStats() {

    if (
      !window.CBC_MASTER
    ) {
      return;
    }


    const students =
      reportState.students.length;


    const reports =
      Object.keys(
        reportState.reports || {}
      ).length;


    CBC_MASTER.set(
      "dashboard.students",
      students
    );


    CBC_MASTER.set(
      "dashboard.reportBooks",
      reports
    );

  }


  /* 
