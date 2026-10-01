"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2
| Schemes of Work Module
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

  let schemeSearchQuery = "";

  const $ = (selector) => document.querySelector(selector);

  /*
  |--------------------------------------------------------------------------
  | Open form
  |--------------------------------------------------------------------------
  */

  function openSchemeForm(record = null) {
    const formCard = $("#schemeFormCard");
    const formTitle = $("#schemeFormTitle");
    const form = $("#schemeForm");

    if (!formCard || !form) {
      return;
    }

    form.reset();

    $("#schemeId").value = "";
    $("#schemeGrade").value =
      CBC.getData().preferences.grade || "Grade 5";
    $("#schemeTerm").value =
      CBC.getData().preferences.term || "Term 1";
    $("#schemeSubject").value = "";
    $("#schemeWeek").value = "";
    $("#schemeTopic").value = "";
    $("#schemeObjectives").value = "";
    $("#schemeActivities").value = "";
    $("#schemeResources").value = "";
    $("#schemeAssessment").value = "";

    if (record) {
      formTitle.textContent = "Edit Scheme of Work";

      $("#schemeId").value = record.id;
      $("#schemeGrade").value = record.grade || "";
      $("#schemeTerm").value = record.term || "";
      $("#schemeSubject").value = record.subject || "";
      $("#schemeWeek").value = record.week || "";
      $("#schemeTopic").value = record.topic || "";
      $("#schemeObjectives").value = record.objectives || "";
      $("#schemeActivities").value = record.activities || "";
      $("#schemeResources").value = record.resources || "";
      $("#schemeAssessment").value = record.assessment || "";
    } else {
      formTitle.textContent = "Create Scheme of Work";
    }

    formCard.hidden = false;

    formCard.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    const subject = $("#schemeSubject");

    if (subject) {
      setTimeout(() => subject.focus(), 100);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Close form
  |--------------------------------------------------------------------------
  */

  function closeSchemeForm() {
    const formCard = $("#schemeFormCard");

    if (formCard) {
      formCard.hidden = true;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Save scheme
  |--------------------------------------------------------------------------
  */

  function saveSchemeFromForm(event) {
    event.preventDefault();

    const data = CBC.getData();

    const id = $("#schemeId").value.trim();

    const record = {
      id: id || CBC.createId("scheme"),
      grade: CBC.cleanDisplayText(
        $("#schemeGrade").value
      ),
      term: CBC.cleanDisplayText(
        $("#schemeTerm").value
      ),
      subject: CBC.cleanDisplayText(
        $("#schemeSubject").value
      ),
      week: CBC.cleanDisplayText(
        $("#schemeWeek").value
      ),
      topic: CBC.cleanDisplayText(
        $("#schemeTopic").value
      ),
      objectives: CBC.cleanDisplayText(
        $("#schemeObjectives").value
      ),
      activities: CBC.cleanDisplayText(
        $("#schemeActivities").value
      ),
      resources: CBC.cleanDisplayText(
        $("#schemeResources").value
      ),
      assessment: CBC.cleanDisplayText(
        $("#schemeAssessment").value
      ),
      updatedAt: new Date().toISOString()
    };

    if (!record.subject || !record.topic) {
      CBC.showToast(
        "Subject and topic are required.",
        true
      );
      return;
    }

    if (id) {
      const index = data.schemes.findIndex(
        (item) => item.id === id
      );

      if (index !== -1) {
        data.schemes[index] = {
          ...data.schemes[index],
          ...record
        };
      }
    } else {
      record.createdAt = new Date().toISOString();
      data.schemes.unshift(record);
    }

    CBC.saveData(data);
    CBC.refresh();

    closeSchemeForm();

    CBC.showToast(
      id
        ? "Scheme of Work updated."
        : "Scheme of Work saved."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render page
  |--------------------------------------------------------------------------
  */

  function renderSchemesPage() {
    const list = $("#schemesList");
    const emptyState = $("#schemesEmptyState");
    const count = $("#schemeCount");

    if (!list) {
      return;
    }

    const data = CBC.getData();

    let records = Array.isArray(data.schemes)
      ? data.schemes
      : [];

    const query = schemeSearchQuery
      .trim()
      .toLowerCase();

    if (query) {
      records = records.filter((record) => {
        return [
          record.subject,
          record.topic,
          record.grade,
          record.term,
          record.week
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
    }

    list.innerHTML = "";

    if (count) {
      count.textContent = String(records.length);
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
        createSchemeCard(record)
      );
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Scheme card
  |--------------------------------------------------------------------------
  */

  function createSchemeCard(record) {
    const card = document.createElement("article");

    card.className = "module-record-card";

    const title = CBC.cleanDisplayText(
      record.topic || "Untitled Topic"
    );

    const subject = CBC.cleanDisplayText(
      record.subject || "Subject"
    );

    const grade = CBC.cleanDisplayText(
      record.grade || ""
    );

    const term = CBC.cleanDisplayText(
      record.term || ""
    );

    const week = CBC.cleanDisplayText(
      record.week || ""
    );

    const objectives = CBC.cleanDisplayText(
      record.objectives || ""
    );

    const activities = CBC.cleanDisplayText(
      record.activities || ""
    );

    const resources = CBC.cleanDisplayText(
      record.resources || ""
    );

    const assessment = CBC.cleanDisplayText(
      record.assessment || ""
    );

    card.innerHTML = `
      <div class="module-record-header">
        <div>
          <span class="record-kicker">
            ${subject}
          </span>

          <h3>
            ${title}
          </h3>
        </div>

        <span class="record-badge">
          ${week || "Week"}
        </span>
      </div>

      <div class="record-meta">
        <span>${grade}</span>
        <span>${term}</span>
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
        resources
          ? `
            <div class="module-record-preview">
              <strong>Resources</strong>
              <p>${resources}</p>
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
          data-edit-scheme="${record.id}">
          Edit
        </button>

        <button
          type="button"
          class="btn btn-danger"
          data-delete-scheme="${record.id}">
          Delete
        </button>
      </div>
    `;

    return card;
  }

  /*
  |--------------------------------------------------------------------------
  | Delete scheme
  |--------------------------------------------------------------------------
  */

  function deleteScheme(id) {
    const data = CBC.getData();

    const record = data.schemes.find(
      (item) => item.id === id
    );

    if (!record) {
      return;
    }

    const confirmed = window.confirm(
      `Delete the scheme for "${record.topic || "this topic"}"?`
    );

    if (!confirmed) {
      return;
    }

    data.schemes = data.schemes.filter(
      (item) => item.id !== id
    );

    CBC.saveData(data);
    CBC.refresh();

    CBC.showToast(
      "Scheme of Work deleted."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Bind controls
  |--------------------------------------------------------------------------
  */

  function bindSchemeControls() {
    const addButton = $("#addSchemeBtn");
    const cancelButton = $("#cancelSchemeButton");
    const form = $("#schemeForm");
    const search = $("#schemeSearch");

    if (addButton) {
      addButton.addEventListener(
        "click",
        () => openSchemeForm()
      );
    }

    if (cancelButton) {
      cancelButton.addEventListener(
        "click",
        closeSchemeForm
      );
    }

    if (form) {
      form.addEventListener(
        "submit",
        saveSchemeFromForm
      );
    }

    if (search) {
      search.addEventListener(
        "input",
        (event) => {
          schemeSearchQuery =
            event.target.value || "";

          renderSchemesPage();
        }
      );
    }

    document.addEventListener(
      "click",
      (event) => {
        const editButton =
          event.target.closest(
            "[data-edit-scheme]"
          );

        if (editButton) {
          const id =
            editButton.dataset.editScheme;

          const record =
            CBC.getData().schemes.find(
              (item) => item.id === id
            );

          if (record) {
            openSchemeForm(record);
          }

          return;
        }

        const deleteButton =
          event.target.closest(
            "[data-delete-scheme]"
          );

        if (deleteButton) {
          deleteScheme(
            deleteButton.dataset.deleteScheme
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

  function bindSchemeQuickAction() {
    document.addEventListener(
      "click",
      (event) => {
        const button =
          event.target.closest(
            '[data-action="create-scheme"]'
          );

        if (!button) {
          return;
        }

        CBC.navigate("schemes");
        openSchemeForm();
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Initialize
  |--------------------------------------------------------------------------
  */

  function initSchemesModule() {
    bindSchemeControls();
    bindSchemeQuickAction();
    renderSchemesPage();
  }

  /*
  |--------------------------------------------------------------------------
  | Public module API
  |--------------------------------------------------------------------------
  */

  window.CBCMasterSchemes = Object.freeze({
    open: openSchemeForm,
    close: closeSchemeForm,
    render: renderSchemesPage
  });

  document.addEventListener(
    "DOMContentLoaded",
    initSchemesModule
  );
})();
