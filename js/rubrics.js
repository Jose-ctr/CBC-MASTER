"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2 — Rubrics Module
|--------------------------------------------------------------------------
| Local-first rubric management.
| No external requests or third-party tracking.
|--------------------------------------------------------------------------
*/

(() => {
  let rubricSearchQuery = "";
  let rubricsInitialized = false;

  const $ = (selector) =>
    document.querySelector(selector);

  const clean = (value) =>
    CBCMaster.cleanDisplayText(value || "");

  function getRubrics() {
    const data = CBCMaster.getData();

    return Array.isArray(data.rubrics)
      ? data.rubrics
      : [];
  }

  /*
  |--------------------------------------------------------------------------
  | Form
  |--------------------------------------------------------------------------
  */

  function openRubricForm(rubric = null) {
    const card = $("#rubricFormCard");
    const form = $("#rubricForm");

    if (!card || !form) {
      CBCMaster.showToast(
        "Rubric form is unavailable.",
        true
      );
      return;
    }

    const fields = {
      id: $("#rubricId"),
      title: $("#rubricTitle"),
      grade: $("#rubricGrade"),
      subject: $("#rubricSubject"),
      term: $("#rubricTerm"),
      criteria: $("#rubricCriteria"),
      levels: $("#rubricLevels"),
      description: $("#rubricDescription")
    };

    const heading = $("#rubricFormTitle");

    if (rubric) {
      if (heading) {
        heading.textContent = "Edit Rubric";
      }

      Object.entries(fields).forEach(
        ([key, field]) => {
          if (field) {
            field.value = rubric[key] ?? "";
          }
        }
      );
    } else {
      form.reset();

      if (heading) {
        heading.textContent = "Create Rubric";
      }

      const data = CBCMaster.getData();

      if (fields.id) fields.id.value = "";

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

  function closeRubricForm() {
    const card = $("#rubricFormCard");
    const form = $("#rubricForm");

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

  function saveRubric(event) {
    event.preventDefault();

    const data = CBCMaster.getData();

    if (!Array.isArray(data.rubrics)) {
      data.rubrics = [];
    }

    const rubric = {
      id: clean($("#rubricId")?.value),
      title: clean($("#rubricTitle")?.value),
      grade: clean($("#rubricGrade")?.value),
      subject: clean($("#rubricSubject")?.value),
      term: clean($("#rubricTerm")?.value),
      criteria: clean($("#rubricCriteria")?.value),
      levels: clean($("#rubricLevels")?.value),
      description: clean($("#rubricDescription")?.value)
    };

    if (!rubric.title) {
      CBCMaster.showToast(
        "Enter a rubric title.",
        true
      );
      $("#rubricTitle")?.focus();
      return;
    }

    if (!rubric.criteria) {
      CBCMaster.showToast(
        "Enter rubric criteria.",
        true
      );
      $("#rubricCriteria")?.focus();
      return;
    }

    const isEditing = Boolean(rubric.id);
    const now = new Date().toISOString();

    if (isEditing) {
      const index = data.rubrics.findIndex(
        (item) => item.id === rubric.id
      );

      if (index === -1) {
        CBCMaster.showToast(
          "Rubric not found.",
          true
        );
        return;
      }

      data.rubrics[index] = {
        ...data.rubrics[index],
        ...rubric,
        updatedAt: now
      };
    } else {
      rubric.id = CBCMaster.createId("rubric");
      rubric.createdAt = now;
      rubric.updatedAt = now;

      data.rubrics.push(rubric);
    }

    if (!CBCMaster.saveData(data)) {
      return;
    }

    CBCMaster.addActivity(
      isEditing
        ? "Updated assessment rubric"
        : "Created assessment rubric"
    );

    closeRubricForm();
    CBCMaster.refresh();

    CBCMaster.showToast(
      isEditing
        ? "Rubric updated."
        : "Rubric created."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  function matchesSearch(rubric) {
    if (!rubricSearchQuery) {
      return true;
    }

    const searchable = [
      rubric.title,
      rubric.grade,
      rubric.subject,
      rubric.term,
      rubric.criteria,
      rubric.levels,
      rubric.description
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(
      rubricSearchQuery.toLowerCase()
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Card
  |--------------------------------------------------------------------------
  */

  function createRubricCard(rubric) {
    const card = document.createElement("article");
    card.className = "stat-card";

    const header = document.createElement("div");
    header.className = "stat-card-header";

    const title = document.createElement("h3");
    title.textContent =
      rubric.title || "Untitled Rubric";

    header.appendChild(title);

    const details = document.createElement("div");
    details.className = "stat-card-details";

    const fields = [
      ["Grade", rubric.grade],
      ["Subject", rubric.subject],
      ["Term", rubric.term],
      ["Criteria", rubric.criteria],
      ["Performance levels", rubric.levels],
      ["Description", rubric.description]
    ];

    fields.forEach(([label, value]) => {
      if (!value) return;

      const paragraph = document.createElement("p");
      paragraph.textContent = `${label}: ${value}`;

      details.appendChild(paragraph);
    });

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "button secondary";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", () => {
      openRubricForm(rubric);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "button danger";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      deleteRubric(rubric.id);
    });

    actions.append(editButton, deleteButton);
    card.append(header, details, actions);

    return card;
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  function renderRubricsPage() {
    const list = $("#rubricsList");
    const emptyState = $("#rubricsEmptyState");
    const count = $("#rubricCount");

    if (!list) return;

    const rubrics = getRubrics()
      .filter(matchesSearch)
      .sort((a, b) =>
        String(b.updatedAt || "")
          .localeCompare(String(a.updatedAt || ""))
      );

    list.replaceChildren();

    if (count) {
      count.textContent = String(rubrics.length);
    }

    if (emptyState) {
      emptyState.hidden = rubrics.length > 0;
    }

    const fragment = document.createDocumentFragment();

    rubrics.forEach((rubric) => {
      fragment.appendChild(
        createRubricCard(rubric)
      );
    });

    list.appendChild(fragment);
  }

  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

  function deleteRubric(id) {
    const data = CBCMaster.getData();

    const exists = data.rubrics.some(
      (rubric) => rubric.id === id
    );

    if (!exists) {
      CBCMaster.showToast(
        "Rubric not found.",
        true
      );
      return;
    }

    if (!window.confirm(
      "Delete this rubric?"
    )) {
      return;
    }

    data.rubrics = data.rubrics.filter(
      (rubric) => rubric.id !== id
    );

    if (!CBCMaster.saveData(data)) {
      return;
    }

    CBCMaster.addActivity(
      "Deleted assessment rubric"
    );

    CBCMaster.refresh();
    CBCMaster.showToast("Rubric deleted.");
  }

  /*
  |--------------------------------------------------------------------------
  | Controls
  |--------------------------------------------------------------------------
  */

  function bindControls() {
    $("#addRubricBtn")?.addEventListener(
      "click",
      () => openRubricForm()
    );

    $("#cancelRubricButton")?.addEventListener(
      "click",
      closeRubricForm
    );

    $("#cancelRubricBtn")?.addEventListener(
      "click",
      closeRubricForm
    );

    $("#rubricForm")?.addEventListener(
      "submit",
      saveRubric
    );

    $("#rubricSearch")?.addEventListener(
      "input",
      (event) => {
        rubricSearchQuery = clean(
          event.target.value
        );
        renderRubricsPage();
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Initialization
  |--------------------------------------------------------------------------
  */

  function initRubricsModule() {
    if (rubricsInitialized) return;

    rubricsInitialized = true;
    bindControls();
    renderRubricsPage();
  }

  /*
  |--------------------------------------------------------------------------
  | Public API
  |--------------------------------------------------------------------------
  */

  window.CBCMasterRubrics = Object.freeze({
    render: renderRubricsPage,
    open: openRubricForm,
    close: closeRubricForm,
    delete: deleteRubric
  });

  /*
  |--------------------------------------------------------------------------
  | Start
  |--------------------------------------------------------------------------
  */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initRubricsModule,
      { once: true }
    );
  } else {
    initRubricsModule();
  }
})();
