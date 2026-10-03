"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2
| Local Analytics Module
|--------------------------------------------------------------------------
| Privacy:
| - No external analytics
| - No tracking scripts
| - No personal-data transmission
| - Reads only local CBC MASTER data
|--------------------------------------------------------------------------
*/

(function () {

  const API = window.CBCMaster;

  if (!API) {
    console.error("CBCMaster core is not available.");
    return;
  }

  const $ = API.$;

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  function getData() {
    return API.getData();
  }

  function safe(value) {
    return API.cleanDisplayText
      ? API.cleanDisplayText(value)
      : String(value ?? "").trim();
  }

  function number(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function countItems(value) {
    return Array.isArray(value) ? value.length : 0;
  }

  function getCollection(data, key) {
    return Array.isArray(data[key]) ? data[key] : [];
  }

  /*
  |--------------------------------------------------------------------------
  | Analytics calculations
  |--------------------------------------------------------------------------
  */

  function calculate(data) {

    const students = getCollection(data, "students");
    const reportBooks = getCollection(data, "reportBooks");
    const schemes = getCollection(data, "schemes");
    const lessonPlans = getCollection(data, "lessonPlans");
    const rubrics = getCollection(data, "rubrics");
    const documents = getCollection(data, "documents");
    const activities = getCollection(data, "activities");

    let totalMarks = 0;
    let markedRecords = 0;

    reportBooks.forEach(function (record) {

      const score =
        record.score !== undefined
          ? record.score
          : record.marks;

      if (score !== undefined && score !== "") {
        const value = number(score);

        if (Number.isFinite(value)) {
          totalMarks += value;
          markedRecords++;
        }
      }
    });

    const average =
      markedRecords > 0
        ? totalMarks / markedRecords
        : 0;

    const gradeCounts = {};

    students.forEach(function (student) {

      const grade = safe(
        student.grade ||
        student.classGrade ||
        "Unassigned"
      );

      gradeCounts[grade] =
        (gradeCounts[grade] || 0) + 1;
    });

    const typeCounts = {};

    documents.forEach(function (document) {

      const type = safe(
        document.type ||
        document.documentType ||
        "Other"
      );

      typeCounts[type] =
        (typeCounts[type] || 0) + 1;
    });

    return {
      students: students.length,
      reportBooks: reportBooks.length,
      schemes: schemes.length,
      lessonPlans: lessonPlans.length,
      rubrics: rubrics.length,
      documents: documents.length,
      activities: activities.length,
      average,
      markedRecords,
      gradeCounts,
      typeCounts
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Number formatting
  |--------------------------------------------------------------------------
  */

  function formatNumber(value) {
    return Number(value || 0).toLocaleString("en-KE");
  }

  function formatAverage(value) {

    if (!value) {
      return "—";
    }

    return Number(value).toFixed(1) + "%";
  }

  /*
  |--------------------------------------------------------------------------
  | Empty state
  |--------------------------------------------------------------------------
  */

  function emptyState(message) {

    return `
      <div class="empty-state">
        <div class="empty-state-icon">📊</div>
        <h3>No analytics yet</h3>
        <p>${safe(message)}</p>
      </div>
    `;
  }

  /*
  |--------------------------------------------------------------------------
  | Stat card
  |--------------------------------------------------------------------------
  */

  function statCard(label, value, icon) {

    return `
      <article class="analytics-stat-card">
        <div class="analytics-stat-icon">${icon}</div>

        <div class="analytics-stat-content">
          <span class="analytics-stat-label">
            ${safe(label)}
          </span>

          <strong class="analytics-stat-value">
            ${safe(value)}
          </strong>
        </div>
      </article>
    `;
  }

  /*
  |--------------------------------------------------------------------------
  | Grade breakdown
  |--------------------------------------------------------------------------
  */

  function renderGradeBreakdown(stats) {

    const container = $("analyticsGradeBreakdown");

    if (!container) {
      return;
    }

    const entries = Object.entries(stats.gradeCounts);

    if (!entries.length) {

      container.innerHTML =
        emptyState("Add learners to see the grade breakdown.");

      return;
    }

    entries.sort(function (a, b) {
      return a[0].localeCompare(b[0]);
    });

    container.innerHTML = entries.map(function (entry) {

      const grade = entry[0];
      const count = entry[1];

      const percentage =
        stats.students > 0
          ? Math.round((count / stats.students) * 100)
          : 0;

      return `
        <div class="analytics-row">

          <div class="analytics-row-header">
            <span>${safe(grade)}</span>
            <strong>${formatNumber(count)}</strong>
          </div>

          <div class="analytics-progress">
            <div
              class="analytics-progress-fill"
              style="width:${percentage}%"
            ></div>
          </div>

          <small>${percentage}% of learners</small>

        </div>
      `;

    }).join("");
  }

  /*
  |--------------------------------------------------------------------------
  | Document breakdown
  |--------------------------------------------------------------------------
  */

  function renderDocumentBreakdown(stats) {

    const container = $("analyticsDocumentBreakdown");

    if (!container) {
      return;
    }

    const entries = Object.entries(stats.typeCounts);

    if (!entries.length) {

      container.innerHTML =
        emptyState("Create documents to see document usage.");

      return;
    }

    entries.sort(function (a, b) {
      return b[1] - a[1];
    });

    container.innerHTML = entries.map(function (entry) {

      return `
        <div class="analytics-list-item">

          <span>${safe(entry[0])}</span>

          <strong>
            ${formatNumber(entry[1])}
          </strong>

        </div>
      `;

    }).join("");
  }

  /*
  |--------------------------------------------------------------------------
  | Activity summary
  |--------------------------------------------------------------------------
  */

  function renderActivitySummary(stats) {

    const container = $("analyticsActivitySummary");

    if (!container) {
      return;
    }

    if (!stats.activities) {

      container.innerHTML =
        emptyState("Your recent activity will appear here.");

      return;
    }

    container.innerHTML = `
      <div class="analytics-activity-total">
        <span>Total local activities</span>
        <strong>${formatNumber(stats.activities)}</strong>
      </div>

      <p class="analytics-muted">
        Activity records are stored locally on this device.
      </p>
    `;
  }

  /*
  |--------------------------------------------------------------------------
  | Main render
  |--------------------------------------------------------------------------
  */

  function render() {

    const data = getData();
    const stats = calculate(data);

    /*
    |--------------------------------------------------------------------------
    | Main stat elements
    |--------------------------------------------------------------------------
    */

    const totalStudents = $("analyticsTotalStudents");
    const totalReportBooks = $("analyticsTotalReportBooks");
    const totalSchemes = $("analyticsTotalSchemes");
    const totalLessonPlans = $("analyticsTotalLessonPlans");
    const totalRubrics = $("analyticsTotalRubrics");
    const totalDocuments = $("analyticsTotalDocuments");
    const averageScore = $("analyticsAverageScore");

    if (totalStudents) {
      totalStudents.textContent =
        formatNumber(stats.students);
    }

    if (totalReportBooks) {
      totalReportBooks.textContent =
        formatNumber(stats.reportBooks);
    }

    if (totalSchemes) {
      totalSchemes.textContent =
        formatNumber(stats.schemes);
    }

    if (totalLessonPlans) {
      totalLessonPlans.textContent =
        formatNumber(stats.lessonPlans);
    }

    if (totalRubrics) {
      totalRubrics.textContent =
        formatNumber(stats.rubrics);
    }

    if (totalDocuments) {
      totalDocuments.textContent =
        formatNumber(stats.documents);
    }

    if (averageScore) {
      averageScore.textContent =
        formatAverage(stats.average);
    }

    /*
    |--------------------------------------------------------------------------
    | Optional dynamic dashboard
    |--------------------------------------------------------------------------
    */

    const statsContainer = $("analyticsStats");

    if (
      statsContainer &&
      !statsContainer.children.length
    ) {

      statsContainer.innerHTML = [

        statCard(
          "Learners",
          formatNumber(stats.students),
          "👥"
        ),

        statCard(
          "Report Records",
          formatNumber(stats.reportBooks),
          "📘"
        ),

        statCard(
          "Schemes",
          formatNumber(stats.schemes),
          "📚"
        ),

        statCard(
          "Lesson Plans",
          formatNumber(stats.lessonPlans),
          "📝"
        ),

        statCard(
          "Rubrics",
          formatNumber(stats.rubrics),
          "📊"
        ),

        statCard(
          "Documents",
          formatNumber(stats.documents),
          "📄"
        )

      ].join("");
    }

    renderGradeBreakdown(stats);
    renderDocumentBreakdown(stats);
    renderActivitySummary(stats);
  }

  /*
  |--------------------------------------------------------------------------
  | Open / close
  |--------------------------------------------------------------------------
  */

  function open() {

    if (typeof API.navigate === "function") {
      API.navigate("analytics");
    }

    render();
  }

  function close() {
    // Navigation is handled by CBC MASTER core.
  }

  /*
  |--------------------------------------------------------------------------
  | Public API
  |--------------------------------------------------------------------------
  */

  window.CBCMasterAnalytics = {
    render,
    open,
    close,
    calculate
  };

})();
