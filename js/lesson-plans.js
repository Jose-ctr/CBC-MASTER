"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2 — Lesson Plans Module
|--------------------------------------------------------------------------
| Features:
| - Add lesson plans
| - Edit lesson plans
| - Search lesson plans
| - Delete lesson plans
| - Store records locally
|--------------------------------------------------------------------------
*/

(() => {
  let lessonPlanSearchQuery = "";
  let lessonPlansInitialized = false;

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  const $ = (selector) =>
    document.querySelector(selector);

  const clean = (value) =>
    CBCMaster.cleanDisplayText(value || "");

  function getLessonPlans() {
    const data = CBCMaster.getData();

    return Array.isArray(data.lessonPlans)
      ? data.lessonPlans
      : [];
  }

  /*
  |--------------------------------------------------------------------------
  | Form
  |--------------------------------------------------------------------------
  */

  function openLessonPlanForm(plan = null) {
    const card = $("#lessonPlanFormCard");
    const form = $("#lessonPlanForm");

    if (!card || !form) {
      CBCMaster.showToast(
        "Lesson plan form is unavailable.",
        true
      );
      return;
    }

    const fields = {
      id: $("#lessonPlanId"),
      title: $("#lessonPlanTitle"),
      grade: $("#lessonPlanGrade"),
      subject: $("#lessonPlanSubject"),
      term: $("#lessonPlanTerm"),
      week: $("#lessonPlanWeek"),
      date: $("#lessonPlanDate"),
      duration: $("#lessonPlanDuration"),
      strand: $("#lessonPlanStrand"),
      subStrand: $("#lessonPlanSubStrand"),
      objectives: $("#lessonPlanObjectives"),
      activities: $("#lessonPlanActivities"),
      resources: $("#lessonPlanResources"),
      assessment: $("#lessonPlanAssessment"),
      reflection: $("#lessonPlanReflection")
    };

    const heading = $("#lessonPlanFormTitle");

    if (plan) {
      if (heading) {
        heading.textContent = "Edit Lesson Plan";
      }

      Object.entries(fields).forEach(
        ([key, field]) => {
          if (field) {
            field.value = plan[key] ?? "";
          }
        }
      );
    } else {
      form.reset();

      if (heading) {
        heading.textContent = "Create Lesson Plan";
      }

      const data = CBCMaster.getData();

      if (fields.id) {
        fields.id.value = "";
      }

      if (fields.grade) {
        fields.grade.value =
          data.preferences?.grade || "Grade 5";
      }

      if (fields.term) {
        fields.term.value =
          data.preferences?.term || "Term 1";
      }
    }

    card.hidden = false;
    card.removeAttribute("hidden");

    fields.title?.focus();
  }

  function closeLessonPlanForm() {
    const card = $("#lessonPlanFormCard");
    const form = $("#lessonPlanForm");

    form?.reset();

    if (card) {
      card.hidden = true;
      card.setAttribute("hidden", "");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Save
  |--------------------------------------------------------------------------
  */

  function saveLessonPlan(event) {
    event.preventDefault();

    const data = CBCMaster.getData();

    if (!Array.isArray(data.lessonPlans)) {
      data.lessonPlans = [];
    }

    const plan = {
      id: clean($("#lessonPlanId")?.value),
      title: clean($("#lessonPlanTitle")?.value),
      grade: clean($("#lessonPlanGrade")?.value),
      subject: clean($("#lessonPlanSubject")?.value),
      term: clean($("#lessonPlanTerm")?.value),
      week: clean($("#lessonPlanWeek")?.value),
      date: clean($("#lessonPlanDate")?.value),
      duration: clean($("#lessonPlanDuration")?.value),
      strand: clean($("#lessonPlanStrand")?.value),
      subStrand: clean($("#lessonPlanSubStrand")?.value),
      objectives: clean($("#lessonPlanObjectives")?.value),
      activities: clean($("#lessonPlanActivities")?.value),
      resources: clean($("#lessonPlanResources")?.value),
      assessment: clean($("#lessonPlanAssessment")?.value),
      reflection: clean($("#lessonPlanReflection")?.value)
    };

    if (!plan.title) {
      CBCMaster.showToast(
        "Enter a lesson title.",
        true
      );
      $("#lessonPlanTitle")?.focus();
      return;
    }

    if (!plan.subject) {
      CBCMaster.showToast(
        "Enter a subject.",
        true
      );
      $("#lessonPlanSubject")?.focus();
      return;
    }

    const isEditing = Boolean(plan.id);
    const now = new Date().toISOString();

    if (isEditing) {
      const index = data.lessonPlans.findIndex(
        (item) => item.id === plan.id
      );

      if (index === -1) {
        CBCMaster.showToast(
          "Lesson plan not found.",
          true
        );
        return;
      }

      data.lessonPlans[index] = {
        ...data.lessonPlans[index],
        ...plan,
        updatedAt: now
      };
    } else {
      plan.id = CBCMaster.createId("lesson-plan");
      plan.createdAt = now;
      plan.updatedAt = now;

      data.lessonPlans.push(plan);
    }

    if (!CBCMaster.saveData(data)) {
      return;
    }

    CBCMaster.addActivity(
      isEditing
        ? "Updated lesson plan"
        : "Created lesson plan"
    );

    closeLessonPlanForm();
    CBCMaster.refresh();

    CBCMaster.showToast(
      isEditing
        ? "Lesson plan updated."
        : "Lesson plan created."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  function matchesSearch(plan) {
    if (!lessonPlanSearchQuery) {
      return true;
    }

    const searchable = [
      plan.title,
      plan.grade,
      plan.subject,
      plan.term,
      plan.week,
      plan.strand,
      plan.subStrand,
      plan.date
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(
      lessonPlanSearchQuery.toLowerCase()
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Card
  |--------------------------------------------------------------------------
  */

  function createLessonPlanCard(plan) {
    const card = document.createElement("article");
    card.className = "stat-card";

    const header = document.createElement("div");
    header.className = "stat-card-header";

    const title = document.createElement("h3");
    title.textContent =
      plan.title || "Untitled Lesson";

    header.appendChild(title);

    const details = document.createElement("div");
    details.className = "stat-card-details";

    const detailItems = [
      ["Grade", plan.grade],
      ["Subject", plan.subject],
      ["Term", plan.term],
      ["Week", plan.week],
      ["Date", plan.date],
      ["Duration", plan.duration],
      ["Strand", plan.strand],
      ["Sub-strand", plan.subStrand]
    ];

    detailItems.forEach(([label, value]) => {
      if (!value) return;

      const paragraph = document.createElement("p");
      paragraph.textContent = `${label}: ${value}`;

      details.appendChild(paragraph);
    });

    if (plan.objectives) {
      appendSection(
        details,
        "Learning objectives",
        plan.objectives
      );
    }

    if (plan.activities) {
      appendSection(
        details,
        "Learning activities",
        plan.activities
      );
    }

    if (plan.resources) {
      appendSection(
        details,
        "Learning resources",
        plan.resources
      );
    }

    if (plan.assessment) {
      appendSection(
        details,
        "Assessment",
        plan.assessment
      );
    }

    if (plan.reflection) {
      appendSection(
        details,
        "Reflection",
        plan.reflection
      );
    }

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "button secondary";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", () => {
      openLessonPlanForm(plan);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "button danger";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      deleteLessonPlan(plan.id);
    });

    actions.append(editButton, deleteButton);

    card.append(header, details, actions);

    return card;
  }

  function appendSection(container, label, value) {
    const section = document.createElement("div");
    section.className = "lesson-plan-section";

    const heading = document.createElement("strong");
    heading.textContent = label;

    const paragraph = document.createElement("p");
    paragraph.textContent = value;

    section.append(heading, paragraph);
    container.appendChild(section);
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  function renderLessonPlansPage() {
    const list = $("#lessonPlansList");
    const emptyState = $("#lessonPlansEmptyState");
    const count = $("#lessonPlanCount");

    if (!list) return;

    const plans = getLessonPlans()
      .filter(matchesSearch)
      .sort((a, b) =>
        String(b.updatedAt || "")
          .localeCompare(String(a.updatedAt || ""))
      );

    list.replaceChildren();

    if (count) {
      count.textContent = String(plans.length);
    }

    if (emptyState) {
      emptyState.hidden = plans.length > 0;
    }

    const fragment = document.createDocumentFragment();

    plans.forEach((plan) => {
      fragment.appendChild(
        createLessonPlanCard(plan)
      );
    });

    list.appendChild(fragment);
  }

  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

  function deleteLessonPlan(id) {
    const data = CBCMaster.getData();

    const exists = data.lessonPlans.some(
      (plan) => plan.id === id
    );

    if (!exists) {
      CBCMaster.showToast(
        "Lesson plan not found.",
        true
      );
      return;
    }

    if (!window.confirm(
      "Delete this lesson plan?"
    )) {
      return;
    }

    data.lessonPlans = data.lessonPlans.filter(
      (plan) => plan.id !== id
    );

    if (!CBCMaster.saveData(data)) {
      return;
    }

    CBCMaster.addActivity(
      "Deleted lesson plan"
    );

    CBCMaster.refresh();

    CBCMaster.showToast(
      "Lesson plan deleted."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Controls
  |--------------------------------------------------------------------------
  */

  function bindControls() {
    $("#addLessonPlanBtn")?.addEventListener(
      "click",
      () => openLessonPlanForm()
    );

    $("#cancelLessonPlanButton")?.addEventListener(
      "click",
      closeLessonPlanForm
    );

    $("#cancelLessonPlanBtn")?.addEventListener(
      "click",
      closeLessonPlanForm
    );

    $("#lessonPlanForm")?.addEventListener(
      "submit",
      saveLessonPlan
    );

    $("#lessonPlanSearch")?.addEventListener(
      "input",
      (event) => {
        lessonPlanSearchQuery = clean(
          event.target.value
        );

        renderLessonPlansPage();
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Initialization
  |--------------------------------------------------------------------------
  */

  function initLessonPlansModule() {
    if (lessonPlansInitialized) return;

    lessonPlansInitialized = true;

    bindControls();
    renderLessonPlansPage();
  }

  /*
  |--------------------------------------------------------------------------
  | Public API
  |--------------------------------------------------------------------------
  */

  window.CBCMasterLessonPlans = Object.freeze({
    render: renderLessonPlansPage,
    open: openLessonPlanForm,
    close: closeLessonPlanForm,
    delete: deleteLessonPlan
  });

  /*
  |--------------------------------------------------------------------------
  | Start
  |--------------------------------------------------------------------------
  */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initLessonPlansModule,
      { once: true }
    );
  } else {
    initLessonPlansModule();
  }
})();
