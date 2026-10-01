"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2
| Lesson Plans Module
|--------------------------------------------------------------------------
| Local-first
| No external requests
| No personal-data logging
|--------------------------------------------------------------------------
*/

(() => {
  const CBC = window.CBCMaster;

  if (!CBC) {
    return;
  }

  let lessonPlanSearchQuery = "";

  const $ = (selector) =>
    document.querySelector(selector);

  /*
  |--------------------------------------------------------------------------
  | Open form
  |--------------------------------------------------------------------------
  */

  function openLessonPlanForm(record = null) {
    const formCard = $("#lessonPlanFormCard");
    const formTitle = $("#lessonPlanFormTitle");
    const form = $("#lessonPlanForm");

    if (!formCard || !form) {
      return;
    }

    form.reset();

    $("#lessonPlanId").value = "";
    $("#lessonPlanGrade").value =
      CBC.getData().preferences.grade || "Grade 5";
    $("#lessonPlanTerm").value =
      CBC.getData().preferences.term || "Term 1";

    if (record) {
      formTitle.textContent = "Edit Lesson Plan";

      $("#lessonPlanId").value = record.id;
      $("#lessonPlanGrade").value = record.grade || "";
      $("#lessonPlanTerm").value = record.term || "";
      $("#lessonPlanSubject").value = record.subject || "";
      $("#lessonPlanDate").value = record.date || "";
      $("#lessonPlanDuration").value =
        record.duration || "";
      $("#lessonPlanTopic").value =
        record.topic || "";
      $("#lessonPlanObjectives").value =
        record.objectives || "";
      $("#lessonPlanIntroduction").value =
        record.introduction || "";
      $("#lessonPlanActivities").value =
        record.activities || "";
      $("#lessonPlanResources").value =
        record.resources || "";
      $("#lessonPlanAssessment").value =
        record.assessment || "";
      $("#lessonPlanReflection").value =
        record.reflection || "";
    } else {
      formTitle.textContent = "Create Lesson Plan";
    }

    formCard.hidden = false;

    formCard.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    const subject = $("#lessonPlanSubject");

    if (subject) {
      setTimeout(() => subject.focus(), 100);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Close form
  |--------------------------------------------------------------------------
  */

  function closeLessonPlanForm() {
    const formCard =
      $("#lessonPlanFormCard");

    if (formCard) {
      formCard.hidden = true;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Save lesson plan
  |--------------------------------------------------------------------------
  */

  function saveLessonPlanFromForm(event) {
    event.preventDefault();

    const data = CBC.getData();

    const id =
      $("#lessonPlanId").value.trim();

    const record = {
      id: id || CBC.createId("lesson"),
      grade: CBC.cleanDisplayText(
        $("#lessonPlanGrade").value
      ),
      term: CBC.cleanDisplayText(
        $("#lessonPlanTerm").value
      ),
      subject: CBC.cleanDisplayText(
        $("#lessonPlanSubject").value
      ),
      date: $("#lessonPlanDate").value,
      duration: CBC.cleanDisplayText(
        $("#lessonPlanDuration").value
      ),
      topic: CBC.cleanDisplayText(
        $("#lessonPlanTopic").value
      ),
      objectives: CBC.cleanDisplayText(
        $("#lessonPlanObjectives").value
      ),
      introduction: CBC.cleanDisplayText(
        $("#lessonPlanIntroduction").value
      ),
      activities: CBC.cleanDisplayText(
        $("#lessonPlanActivities").value
      ),
      resources: CBC.cleanDisplayText(
        $("#lessonPlanResources").value
      ),
      assessment: CBC.cleanDisplayText(
        $("#lessonPlanAssessment").value
      ),
      reflection: CBC.cleanDisplayText(
        $("#lessonPlanReflection").value
      ),
      updatedAt: new Date().toISOString()
    };

    if (
      !record.subject ||
      !record.topic ||
      !record.objectives
    ) {
      CBC.showToast(
        "Subject, topic and objectives are required.",
        true
      );
      return;
    }

    if (id) {
      const index =
        data.lessonPlans.findIndex(
          (item) => item.id === id
        );

      if (index !== -1) {
        data.lessonPlans[index] = {
          ...data.lessonPlans[index],
          ...record
        };
      }
    } else {
      record.createdAt =
        new Date().toISOString();

      data.lessonPlans.unshift(record);
    }

    CBC.saveData(data);
    CBC.refresh();

    closeLessonPlanForm();

    CBC.showToast(
      id
        ? "Lesson Plan updated."
        : "Lesson Plan saved."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render page
  |--------------------------------------------------------------------------
  */

  function renderLessonPlansPage() {
    const list =
      $("#lessonPlansList");

    const emptyState =
      $("#lessonPlansEmptyState");

    const count =
      $("#lessonPlanCount");

    if (!list) {
      return;
    }

    const data = CBC.getData();

    let records =
      Array.isArray(data.lessonPlans)
        ? data.lessonPlans
        : [];

    const query =
      lessonPlanSearchQuery
        .trim()
        .toLowerCase();

    if (query) {
      records = records.filter(
        (record) =>
          [
            record.subject,
            record.topic,
            record.grade,
            record.term,
            record.objectives
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query)
      );
    }

    list.innerHTML = "";

    if (count) {
      count.textContent =
        String(records.length);
    }

    if (!records.length) {
      if (emptyState) {
        emptyState.hidden = false;
      }

      return;
    }

    if (emptyState) {
      emptyState.hidden = true;
    }

    records.forEach((record) => {
      list.appendChild(
        createLessonPlanCard(record)
      );
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Create lesson plan card
  |--------------------------------------------------------------------------
  */

  function createLessonPlanCard(record) {
    const card =
      document.createElement("article");

    card.className =
      "module-record-card";

    const topic =
      CBC.cleanDisplayText(
        record.topic ||
          "Untitled Lesson"
      );

    const subject =
      CBC.cleanDisplayText(
        record.subject ||
          "Subject"
      );

    const grade =
      CBC.cleanDisplayText(
        record.grade || ""
      );

    const term =
      CBC.cleanDisplayText(
        record.term || ""
      );

    const date =
      CBC.cleanDisplayText(
        record.date || ""
      );

    const duration =
      CBC.cleanDisplayText(
        record.duration || ""
      );

    const objectives =
      CBC.cleanDisplayText(
        record.objectives || ""
      );

    const activities =
      CBC.cleanDisplayText(
        record.activities || ""
      );

    const assessment =
      CBC.cleanDisplayText(
        record.assessment || ""
      );

    card.innerHTML = `
      <div class="module-record-header">
        <div>
          <span class="record-kicker">
            ${subject}
          </span>

          <h3>
            ${topic}
          </h3>
        </div>

        <span class="record-badge">
          ${date || "Lesson"}
        </span>
      </div>

      <div class="record-meta">
        <span>${grade}</span>
        <span>${term}</span>
        ${
          duration
            ? `<span>${duration}</span>`
            : ""
        }
      </div>

      ${
        objectives
          ? `
            <div class="module-record-preview">
              <strong>Learning Objectives</strong>
              <p>${objectives}</p>
            </div>
          `
          : ""
      }

      ${
        activities
          ? `
            <div class="module-record-preview">
              <strong>Learning Activities</strong>
              <p>${activities}</p>
            </div>
          `
          : ""
      }

      ${
        assessment
          ? `
            <div class="module-record-preview">
              <strong>Assessment</strong>
              <p>${assessment}</p>
            </div>
          `
          : ""
      }

      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary"
          data-edit-lesson-plan="${record.id}">
          Edit
        </button>

        <button
          type="button"
          class="btn btn-danger"
          data-delete-lesson-plan="${record.id}">
          Delete
        </button>
      </div>
    `;

    return card;
  }

  /*
  |--------------------------------------------------------------------------
  | Delete lesson plan
  |--------------------------------------------------------------------------
  */

  function deleteLessonPlan(id) {
    const data = CBC.getData();

    const record =
      data.lessonPlans.find(
        (item) => item.id === id
      );

    if (!record) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete the lesson plan for "${record.topic || "this lesson"}"?`
      );

    if (!confirmed) {
      return;
    }

    data.lessonPlans =
      data.lessonPlans.filter(
        (item) => item.id !== id
      );

    CBC.saveData(data);
    CBC.refresh();

    CBC.showToast(
      "Lesson Plan deleted."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Bind controls
  |--------------------------------------------------------------------------
  */

  function bindLessonPlanControls() {
    const addButton =
      $("#addLessonPlanBtn");

    const cancelButton =
      $("#cancelLessonPlanButton");

    const form =
      $("#lessonPlanForm");

    const search =
      $("#lessonPlanSearch");

    if (addButton) {
      addButton.addEventListener(
        "click",
        () => openLessonPlanForm()
      );
    }

    if (cancelButton) {
      cancelButton.addEventListener(
        "click",
        closeLessonPlanForm
      );
    }

    if (form) {
      form.addEventListener(
        "submit",
        saveLessonPlanFromForm
      );
    }

    if (search) {
      search.addEventListener(
        "input",
        (event) => {
          lessonPlanSearchQuery =
            event.target.value || "";

          renderLessonPlansPage();
        }
      );
    }

    document.addEventListener(
      "click",
      (event) => {
        const editButton =
          event.target.closest(
            "[data-edit-lesson-plan]"
          );

        if (editButton) {
          const id =
            editButton.dataset
              .editLessonPlan;

          const record =
            CBC.getData()
              .lessonPlans
              .find(
                (item) =>
                  item.id === id
              );

          if (record) {
            openLessonPlanForm(
              record
            );
          }

          return;
        }

        const deleteButton =
          event.target.closest(
            "[data-delete-lesson-plan]"
          );

        if (deleteButton) {
          deleteLessonPlan(
            deleteButton.dataset
              .deleteLessonPlan
          );
        }
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Quick action
  |--------------------------------------------------------------------------
  */

  function bindLessonPlanQuickAction() {
    document.addEventListener(
      "click",
      (event) => {
        const button =
          event.target.closest(
            '[data-action="create-lesson-plan"]'
          );

        if (!button) {
          return;
        }

        CBC.navigate("lesson-plans");
        openLessonPlanForm();
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Initialize
  |--------------------------------------------------------------------------
  */

  function initLessonPlansModule() {
    bindLessonPlanControls();
    bindLessonPlanQuickAction();
    renderLessonPlansPage();
  }

  /*
  |--------------------------------------------------------------------------
  | Public module API
  |--------------------------------------------------------------------------
  */

  window.CBCMasterLessonPlans =
    Object.freeze({
      open: openLessonPlanForm,
      close: closeLessonPlanForm,
      render: renderLessonPlansPage
    });

  document.addEventListener(
    "DOMContentLoaded",
    initLessonPlansModule
  );
})();
