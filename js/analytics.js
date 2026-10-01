"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2
| Local Analytics Module
|--------------------------------------------------------------------------
| Privacy principles:
| - Uses only local CBC MASTER data
| - No third-party analytics
| - No tracking
| - No external requests
| - No personal-data transmission
|--------------------------------------------------------------------------
*/

(() => {
  const CBC = window.CBCMaster;

  if (!CBC) {
    return;
  }

  const $ = (selector) =>
    document.querySelector(selector);

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  function getAnalyticsData() {
    const data = CBC.getData();

    return {
      students: Array.isArray(data.students)
        ? data.students
        : [],

      reportBooks: Array.isArray(data.reportBooks)
        ? data.reportBooks
        : [],

      schemes: Array.isArray(data.schemes)
        ? data.schemes
        : [],

      lessonPlans: Array.isArray(data.lessonPlans)
        ? data.lessonPlans
        : [],

      rubrics: Array.isArray(data.rubrics)
        ? data.rubrics
        : [],

      documents: Array.isArray(data.documents)
        ? data.documents
        : [],

      activity: Array.isArray(data.activity)
        ? data.activity
        : []
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Calculate metrics
  |--------------------------------------------------------------------------
  */

  function calculateMetrics() {
    const data = getAnalyticsData();

    const totalRecords =
      data.reportBooks.length +
      data.schemes.length +
      data.lessonPlans.length +
      data.rubrics.length +
      data.documents.length;

    const totalTeachingPlans =
      data.schemes.length +
      data.lessonPlans.length;

    const totalAssessmentItems =
      data.reportBooks.length +
      data.rubrics.length;

    return {
      students: data.students.length,

      reportBooks:
        data.reportBooks.length,

      schemes:
        data.schemes.length,

      lessonPlans:
        data.lessonPlans.length,

      rubrics:
        data.rubrics.length,

      documents:
        data.documents.length,

      totalRecords,

      totalTeachingPlans,

      totalAssessmentItems,

      activity:
        data.activity.length
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Update metric element
  |--------------------------------------------------------------------------
  */

  function setMetric(selector, value) {
    const element = $(selector);

    if (element) {
      element.textContent =
        String(value);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Render overview
  |--------------------------------------------------------------------------
  */

  function renderAnalyticsOverview() {
    const metrics =
      calculateMetrics();

    setMetric(
      "#analyticsStudents",
      metrics.students
    );

    setMetric(
      "#analyticsReportBooks",
      metrics.reportBooks
    );

    setMetric(
      "#analyticsSchemes",
      metrics.schemes
    );

    setMetric(
      "#analyticsLessonPlans",
      metrics.lessonPlans
    );

    setMetric(
      "#analyticsRubrics",
      metrics.rubrics
    );

    setMetric(
      "#analyticsDocuments",
      metrics.documents
    );

    setMetric(
      "#analyticsTotalRecords",
      metrics.totalRecords
    );

    setMetric(
      "#analyticsTeachingPlans",
      metrics.totalTeachingPlans
    );

    setMetric(
      "#analyticsAssessmentItems",
      metrics.totalAssessmentItems
    );

    setMetric(
      "#analyticsActivity",
      metrics.activity
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render progress bars
  |--------------------------------------------------------------------------
  */

  function renderProgressBars() {
    const metrics =
      calculateMetrics();

    const maximum =
      Math.max(
        metrics.schemes,
        metrics.lessonPlans,
        metrics.rubrics,
        metrics.documents,
        metrics.reportBooks,
        1
      );

    updateProgress(
      "#analyticsSchemesBar",
      metrics.schemes,
      maximum
    );

    updateProgress(
      "#analyticsLessonPlansBar",
      metrics.lessonPlans,
      maximum
    );

    updateProgress(
      "#analyticsRubricsBar",
      metrics.rubrics,
      maximum
    );

    updateProgress(
      "#analyticsDocumentsBar",
      metrics.documents,
      maximum
    );

    updateProgress(
      "#analyticsReportBooksBar",
      metrics.reportBooks,
      maximum
    );
  }

  function updateProgress(
    selector,
    value,
    maximum
  ) {
    const element = $(selector);

    if (!element) {
      return;
    }

    const percentage =
      maximum > 0
        ? Math.round(
            (value / maximum) * 100
          )
        : 0;

    element.style.width =
      `${percentage}%`;

    element.setAttribute(
      "aria-valuenow",
      String(percentage)
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render activity
  |--------------------------------------------------------------------------
  */

  function renderActivitySummary() {
    const container =
      $("#analyticsActivityList");

    if (!container) {
      return;
    }

    const data = getAnalyticsData();

    const activity =
      data.activity
        .slice()
        .reverse()
        .slice(0, 8);

    container.innerHTML = "";

    if (!activity.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">◷</div>
          <h3>No activity yet</h3>
          <p>
            Your local workspace activity
            will appear here as you work.
          </p>
        </div>
      `;

      return;
    }

    activity.forEach((item) => {
      const row =
        document.createElement("div");

      row.className =
        "analytics-activity-item";

      const action =
        CBC.cleanDisplayText(
          item.action || "Activity"
        );

      const timestamp =
        formatDate(item.timestamp);

      row.innerHTML = `
        <div>
          <strong>${action}</strong>
          <span>${timestamp}</span>
        </div>
      `;

      container.appendChild(row);
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Render data distribution
  |--------------------------------------------------------------------------
  */

  function renderDataDistribution() {
    const container =
      $("#analyticsDistribution");

    if (!container) {
      return;
    }

    const metrics =
      calculateMetrics();

    const rows = [
      {
        label: "Students",
        value: metrics.students
      },
      {
        label: "Report Books",
        value: metrics.reportBooks
      },
      {
        label: "Schemes",
        value: metrics.schemes
      },
      {
        label: "Lesson Plans",
        value: metrics.lessonPlans
      },
      {
        label: "Rubrics",
        value: metrics.rubrics
      },
      {
        label: "Saved Documents",
        value: metrics.documents
      }
    ];

    container.innerHTML = "";

    rows.forEach((row) => {
      const item =
        document.createElement("div");

      item.className =
        "analytics-distribution-item";

      item.innerHTML = `
        <div class="analytics-distribution-label">
          <span>${row.label}</span>
          <strong>${row.value}</strong>
        </div>

        <div class="analytics-distribution-track">
          <span
            style="width:${getDistributionWidth(
              row.value,
              rows
            )}%">
          </span>
        </div>
      `;

      container.appendChild(item);
    });
  }

  function getDistributionWidth(
    value,
    rows
  ) {
    const maximum =
      Math.max(
        ...rows.map(
          (row) => row.value
        ),
        1
      );

    return Math.round(
      (value / maximum) * 100
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Date formatting
  |--------------------------------------------------------------------------
  */

  function formatDate(value) {
    if (!value) {
      return "Unknown time";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Unknown time";
    }

    return date.toLocaleString(
      "en-KE",
      {
        dateStyle: "medium",
        timeStyle: "short"
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render analytics page
  |--------------------------------------------------------------------------
  */

  function renderAnalyticsPage() {
    renderAnalyticsOverview();
    renderProgressBars();
    renderActivitySummary();
    renderDataDistribution();
  }

  /*
  |--------------------------------------------------------------------------
  | Initialize
  |--------------------------------------------------------------------------
  */

  function initAnalyticsModule() {
    renderAnalyticsPage();
  }

  /*
  |--------------------------------------------------------------------------
  | Public API
  |--------------------------------------------------------------------------
  */

  window.CBCMasterAnalytics =
    Object.freeze({
      render:
        renderAnalyticsPage,

      metrics:
        calculateMetrics
    });

  document.addEventListener(
    "DOMContentLoaded",
    initAnalyticsModule
  );
})();
