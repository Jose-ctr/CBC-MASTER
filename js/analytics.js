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

  function getCollection(data, key) {
    return Array.isArray(data[key]) ? data[key] : [];
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString("en-KE");
  }

  function setText(id, value) {
    const element = $(id);

    if (element) {
      element.textContent = String(value);
    }
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

    /*
    |--------------------------------------------------------------------------
    | Total workspace records
    |--------------------------------------------------------------------------
    */

    const totalRecords =
      students.length +
      reportBooks.length +
      schemes.length +
      lessonPlans.length +
      rubrics.length +
      documents.length;

    /*
    |--------------------------------------------------------------------------
    | Teaching plans
    |--------------------------------------------------------------------------
    */

    const totalTeachingPlans =
      schemes.length +
      lessonPlans.length;

    /*
    |--------------------------------------------------------------------------
    | Assessment items
    |--------------------------------------------------------------------------
    */

    const totalAssessmentItems =
      reportBooks.length +
      rubrics.length;

    /*
    |--------------------------------------------------------------------------
    | Category counts
    |--------------------------------------------------------------------------
    */

    const categories = [
      {
        key: "schemes",
        label: "Schemes of Work",
        count: schemes.length
      },
      {
        key: "lessonPlans",
        label: "Lesson Plans",
        count: lessonPlans.length
      },
      {
        key: "rubrics",
        label: "Rubrics",
        count: rubrics.length
      },
      {
        key: "documents",
        label: "Documents",
        count: documents.length
      },
      {
        key: "reportBooks",
        label: "Report Books",
        count: reportBooks.length
      }
    ];

    return {
      students: students.length,
      reportBooks: reportBooks.length,
      schemes: schemes.length,
      lessonPlans: lessonPlans.length,
      rubrics: rubrics.length,
      documents: documents.length,
      activities: activities.length,
      totalRecords,
      totalTeachingPlans,
      totalAssessmentItems,
      categories
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Progress bar
  |--------------------------------------------------------------------------
  */

  function updateBar(valueId, barId, count, total) {

    setText(valueId, formatNumber(count));

    const bar = $(barId);

    if (!bar) {
      return;
    }

    const percentage =
      total > 0
        ? Math.round((count / total) * 100)
        : 0;

    bar.style.width = percentage + "%";
    bar.setAttribute("aria-valuenow", String(percentage));
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
  }

  /*
  |--------------------------------------------------------------------------
  | Distribution
  |--------------------------------------------------------------------------
  */

  function renderDistribution(stats) {

    const container = $("analyticsDistribution");

    if (!container) {
      return;
    }

    container.replaceChildren();

    if (!stats.totalRecords) {

      const empty = document.createElement("p");

      empty.className = "analytics-muted";
      empty.textContent =
        "Your workspace distribution will appear here as you add records.";

      container.appendChild(empty);

      return;
    }

    stats.categories.forEach(function (item) {

      const percentage =
        Math.round(
          (item.count / stats.totalRecords) * 100
        );

      const row = document.createElement("div");

      row.className = "analytics-row";

      const header = document.createElement("div");

      header.className = "analytics-row-header";

      const label = document.createElement("span");

      label.textContent = item.label;

      const count = document.createElement("strong");

      count.textContent =
        formatNumber(item.count);

      header.appendChild(label);
      header.appendChild(count);

      const progress = document.createElement("div");

      progress.className = "analytics-progress";

      const fill = document.createElement("div");

      fill.className = "analytics-progress-fill";
      fill.style.width = percentage + "%";

      progress.appendChild(fill);

      const meta = document.createElement("small");

      meta.textContent =
        percentage + "% of workspace records";

      row.appendChild(header);
      row.appendChild(progress);
      row.appendChild(meta);

      container.appendChild(row);
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Recent activity
  |--------------------------------------------------------------------------
  */

  function getActivityText(activity) {

    if (!activity || typeof activity !== "object") {
      return "Workspace activity";
    }

    return safe(
      activity.message ||
      activity.text ||
      activity.action ||
      activity.title ||
      activity.type ||
      "Workspace activity"
    );
  }

  function getActivityDate(activity) {

    if (!activity || typeof activity !== "object") {
      return "";
    }

    const value =
      activity.createdAt ||
      activity.timestamp ||
      activity.date ||
      activity.created_at;

    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  function renderActivity(stats, data) {

    const container = $("analyticsActivityList");

    if (!container) {
      return;
    }

    container.replaceChildren();

    const activities = getCollection(data, "activities");

    if (!activities.length) {

      const empty = document.createElement("p");

      empty.className = "analytics-muted";
      empty.textContent =
        "Recent workspace activity will appear here.";

      container.appendChild(empty);

      return;
    }

    const recent = activities
      .slice()
      .sort(function (a, b) {

        const dateA = new Date(
          a?.createdAt ||
          a?.timestamp ||
          a?.date ||
          a?.created_at ||
          0
        ).getTime();

        const dateB = new Date(
          b?.createdAt ||
          b?.timestamp ||
          b?.date ||
          b?.created_at ||
          0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 8);

    recent.forEach(function (activity) {

      const item = document.createElement("div");

      item.className = "analytics-list-item";

      const text = document.createElement("span");

      text.textContent =
        getActivityText(activity);

      const date = document.createElement("small");

      date.textContent =
        getActivityDate(activity);

      item.appendChild(text);

      if (date.textContent) {
        item.appendChild(date);
      }

      container.appendChild(item);
    });
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
    | Top analytics cards
    |--------------------------------------------------------------------------
    */

    setText(
      "analyticsStudents",
      formatNumber(stats.students)
    );

    setText(
      "analyticsTotalRecords",
      formatNumber(stats.totalRecords)
    );

    setText(
      "analyticsTotalTeachingPlans",
      formatNumber(stats.totalTeachingPlans)
    );

    setText(
      "analyticsTotalAssessmentItems",
      formatNumber(stats.totalAssessmentItems)
    );

    /*
    |--------------------------------------------------------------------------
    | Workspace activity bars
    |--------------------------------------------------------------------------
    */

    updateBar(
      "analyticsSchemesValue",
      "analyticsSchemesBar",
      stats.schemes,
      stats.totalRecords
    );

    updateBar(
      "analyticsLessonPlansValue",
      "analyticsLessonPlansBar",
      stats.lessonPlans,
      stats.totalRecords
    );

    updateBar(
      "analyticsRubricsValue",
      "analyticsRubricsBar",
      stats.rubrics,
      stats.totalRecords
    );

    updateBar(
      "analyticsDocumentsValue",
      "analyticsDocumentsBar",
      stats.documents,
      stats.totalRecords
    );

    updateBar(
      "analyticsReportBooksValue",
      "analyticsReportBooksBar",
      stats.reportBooks,
      stats.totalRecords
    );

    /*
    |--------------------------------------------------------------------------
    | Distribution
    |--------------------------------------------------------------------------
    */

    renderDistribution(stats);

    /*
    |--------------------------------------------------------------------------
    | Recent activity
    |--------------------------------------------------------------------------
    */

    renderActivity(stats, data);
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
