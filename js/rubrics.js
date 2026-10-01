"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2
| Assessment Rubrics Module
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

  let rubricSearchQuery = "";

  const $ = (selector) =>
    document.querySelector(selector);

  /*
  |--------------------------------------------------------------------------
  | Open form
  |--------------------------------------------------------------------------
  */

  function openRubricForm(record = null) {
    const formCard = $("#rubricFormCard");
    const formTitle = $("#rubricFormTitle");
    const form = $("#rubricForm");

    if (!formCard || !form) {
      return;
    }

    form.reset();

    $("#rubricId").value = "";
    $("#rubricGrade").value =
      CBC.getData().preferences.grade || "Grade 5";
    $("#rubricTerm").value =
      CBC.getData().preferences.term || "Term 1";

    if (record) {
      formTitle.textContent = "Edit Assessment Rubric";

      $("#rubricId").value = record.id;
      $("#rubricGrade").value = record.grade || "";
      $("#rubricTerm").value = record.term || "";
      $("#rubricSubject").value = record.subject || "";
      $("#rubricTitle").value = record.title || "";
      $("#rubricCompetency").value =
        record.competency || "";
      $("#rubricCriteria").value =
        record.criteria || "";
      $("#rubricBeginning").value =
        record.beginning || "";
      $("#rubricDeveloping").value =
        record.developing || "";
      $("#rubricMeeting").value =
        record.meeting || "";
      $("#rubricExceeding").value =
        record.exceeding || "";
    } else {
      formTitle.textContent =
        "Create Assessment Rubric";
    }

    formCard.hidden = false;

    formCard.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    const titleInput = $("#rubricTitle");

    if (titleInput) {
      setTimeout(() => titleInput.focus(), 100);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Close form
  |--------------------------------------------------------------------------
  */

  function closeRubricForm() {
    const formCard = $("#rubricFormCard");

    if (formCard) {
      formCard.hidden = true;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Save rubric
  |--------------------------------------------------------------------------
  */

  function saveRubricFromForm(event) {
    event.preventDefault();

    const data = CBC.getData();

    const id = $("#rubricId").value.trim();

    const record = {
      id: id || CBC.createId("rubric"),

      grade: CBC.cleanDisplayText(
        $("#rubricGrade").value
      ),

      term: CBC.cleanDisplayText(
        $("#rubricTerm").value
      ),

      subject: CBC.cleanDisplayText(
        $("#rubricSubject").value
      ),

      title: CBC.cleanDisplayText(
        $("#rubricTitle").value
      ),

      competency: CBC.cleanDisplayText(
        $("#rubricCompetency").value
      ),

      criteria: CBC.cleanDisplayText(
        $("#rubricCriteria").value
      ),

      beginning: CBC.cleanDisplayText(
        $("#rubricBeginning").value
      ),

      developing: CBC.cleanDisplayText(
        $("#rubricDeveloping").value
      ),

      meeting: CBC.cleanDisplayText(
        $("#rubricMeeting").value
      ),

      exceeding: CBC.cleanDisplayText(
        $("#rubricExceeding").value
      ),

      updatedAt: new Date().toISOString()
    };

    if (
      !record.title ||
      !record.subject ||
      !record.criteria
    ) {
      CBC.showToast(
        "Title, subject and criteria are required.",
        true
      );
      return;
    }

    if (id) {
      const index =
        data.rubrics.findIndex(
          (item) => item.id === id
        );

      if (index !== -1) {
        data.rubrics[index] = {
          ...data.rubrics[index],
          ...record
        };
      }
    } else {
      record.createdAt =
        new Date().toISOString();

      data.rubrics.unshift(record);
    }

    CBC.saveData(data);
    CBC.refresh();

    closeRubricForm();

    CBC.showToast(
      id
        ? "Assessment Rubric updated."
        : "Assessment Rubric saved."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render page
  |--------------------------------------------------------------------------
  */

  function renderRubricsPage() {
    const list = $("#rubricsList");
    const emptyState =
      $("#rubricsEmptyState");
    const count = $("#rubricCount");

    if (!list) {
      return;
    }

    const data = CBC.getData();

    let records =
      Array.isArray(data.rubrics)
        ? data.rubrics
        : [];

    const query =
      rubricSearchQuery
        .trim()
        .toLowerCase();

    if (query) {
      records = records.filter(
        (record) =>
          [
            record.title,
            record.subject,
            record.grade,
            record.term,
            record.competency,
            record.criteria
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
        createRubricCard(record)
      );
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Rubric card
  |--------------------------------------------------------------------------
  */

  function createRubricCard(record) {
    const card =
      document.createElement("article");

    card.className =
      "module-record-card rubric-record-card";

    const title =
      CBC.cleanDisplayText(
        record.title ||
          "Untitled Rubric"
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

    const competency =
      CBC.cleanDisplayText(
        record.competency || ""
      );

    const criteria =
      CBC.cleanDisplayText(
        record.criteria || ""
      );

    const beginning =
      CBC.cleanDisplayText(
        record.beginning || ""
      );

    const developing =
      CBC.cleanDisplayText(
        record.developing || ""
      );

    const meeting =
      CBC.cleanDisplayText(
        record.meeting || ""
      );

    const exceeding =
      CBC.cleanDisplayText(
        record.exceeding || ""
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
          Rubric
        </span>
      </div>

      <div class="record-meta">
        <span>${grade}</span>
        <span>${term}</span>
      </div>

      ${
        competency
          ? `
            <div class="module-record-preview">
              <strong>Competency</strong>
              <p>${competency}</p>
            </div>
          `
          : ""
      }

      ${
        criteria
          ? `
            <div class="module-record-preview">
              <strong>Assessment Criteria</strong>
              <p>${criteria}</p>
            </div>
          `
          : ""
      }

      <div class="rubric-levels">

        ${
          beginning
            ? `
              <div class="rubric-level">
                <strong>Beginning</strong>
                <p>${beginning}</p>
              </div>
            `
            : ""
        }

        ${
          developing
            ? `
              <div class="rubric-level">
                <strong>Developing</strong>
                <p>${developing}</p>
              </div>
            `
            : ""
        }

        ${
          meeting
            ? `
              <div class="rubric-level">
                <strong>Meeting</strong>
                <p>${meeting}</p>
              </div>
            `
            : ""
        }

        ${
          exceeding
            ? `
              <div class="rubric-level">
                <strong>Exceeding</strong>
                <p>${exceeding}</p>
              </div>
            `
            : ""
        }

      </div>

      <div class="form-actions">

        <button
          type="button"
          class="btn btn-secondary"
          data-edit-rubric="${record.id}">
          Edit
        </button>

        <button
          type="button"
          class="btn btn-danger"
          data-delete-rubric="${record.id}">
          Delete
        </button>

      </div>
    `;

    return card;
  }

  /*
  |--------------------------------------------------------------------------
  | Delete rubric
  |--------------------------------------------------------------------------
  */

  function deleteRubric(id) {
    const data = CBC.getData();

    const record =
      data.rubrics.find(
        (item) => item.id === id
      );

    if (!record) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete the rubric "${record.title || "this rubric"}"?`
      );

    if (!confirmed) {
      return;
    }

    data.rubrics =
      data.rubrics.filter(
        (item) => item.id !== id
      );

    CBC.saveData(data);
    CBC.refresh();

    CBC.showToast(
      "Assessment Rubric deleted."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Bind controls
  |--------------------------------------------------------------------------
  */

  function bindRubricControls() {
    const addButton =
      $("#addRubricBtn");

    const cancelButton =
      $("#cancelRubricButton");

    const form =
      $("#rubricForm");

    const search =
      $("#rubricSearch");

    if (addButton) {
      addButton.addEventListener(
        "click",
        () => openRubricForm()
      );
    }

    if (cancelButton) {
      cancelButton.addEventListener(
        "click",
        closeRubricForm
      );
    }

    if (form) {
      form.addEventListener(
        "submit",
        saveRubricFromForm
      );
    }

    if (search) {
      search.addEventListener(
        "input",
        (event) => {
          rubricSearchQuery =
            event.target.value || "";

          renderRubricsPage();
        }
      );
    }

    document.addEventListener(
      "click",
      (event) => {
        const editButton =
          event.target.closest(
            "[data-edit-rubric]"
          );

        if (editButton) {
          const id =
            editButton.dataset
              .editRubric;

          const record =
            CBC.getData()
              .rubrics
              .find(
                (item) =>
                  item.id === id
              );

          if (record) {
            openRubricForm(record);
          }

          return;
        }

        const deleteButton =
          event.target.closest(
            "[data-delete-rubric]"
          );

        if (deleteButton) {
          deleteRubric(
            deleteButton.dataset
              .deleteRubric
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

  function bindRubricQuickAction() {
    document.addEventListener(
      "click",
      (event) => {
        const button =
          event.target.closest(
            '[data-action="create-rubric"]'
          );

        if (!button) {
          return;
        }

        CBC.navigate("rubrics");
        openRubricForm();
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Initialize
  |--------------------------------------------------------------------------
  */

  function initRubricsModule() {
    bindRubricControls();
    bindRubricQuickAction();
    renderRubricsPage();
  }

  /*
  |--------------------------------------------------------------------------
  | Public module API
  |--------------------------------------------------------------------------
  */

  window.CBCMasterRubrics =
    Object.freeze({
      open: openRubricForm,
      close: closeRubricForm,
      render: renderRubricsPage
    });

  document.addEventListener(
    "DOMContentLoaded",
    initRubricsModule
  );
})();
