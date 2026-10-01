"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2
| Saved Documents Module
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

  let documentSearchQuery = "";

  const $ = (selector) =>
    document.querySelector(selector);

  /*
  |--------------------------------------------------------------------------
  | Open form
  |--------------------------------------------------------------------------
  */

  function openDocumentForm(record = null) {
    const formCard = $("#documentFormCard");
    const formTitle = $("#documentFormTitle");
    const form = $("#documentForm");

    if (!formCard || !form) {
      return;
    }

    form.reset();

    $("#documentId").value = "";
    $("#documentType").value = "Other";

    if (record) {
      formTitle.textContent =
        "Edit Saved Document";

      $("#documentId").value = record.id;
      $("#documentTitle").value =
        record.title || "";
      $("#documentType").value =
        record.type || "Other";
      $("#documentSubject").value =
        record.subject || "";
      $("#documentGrade").value =
        record.grade || "";
      $("#documentTerm").value =
        record.term || "";
      $("#documentContent").value =
        record.content || "";
    } else {
      formTitle.textContent =
        "Save Document";

      const data = CBC.getData();

      $("#documentGrade").value =
        data.preferences.grade || "Grade 5";

      $("#documentTerm").value =
        data.preferences.term || "Term 1";
    }

    formCard.hidden = false;

    formCard.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    const titleInput =
      $("#documentTitle");

    if (titleInput) {
      setTimeout(
        () => titleInput.focus(),
        100
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Close form
  |--------------------------------------------------------------------------
  */

  function closeDocumentForm() {
    const formCard =
      $("#documentFormCard");

    if (formCard) {
      formCard.hidden = true;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Save document
  |--------------------------------------------------------------------------
  */

  function saveDocumentFromForm(event) {
    event.preventDefault();

    const data = CBC.getData();

    const id =
      $("#documentId").value.trim();

    const record = {
      id: id || CBC.createId("document"),

      title: CBC.cleanDisplayText(
        $("#documentTitle").value
      ),

      type: CBC.cleanDisplayText(
        $("#documentType").value
      ),

      subject: CBC.cleanDisplayText(
        $("#documentSubject").value
      ),

      grade: CBC.cleanDisplayText(
        $("#documentGrade").value
      ),

      term: CBC.cleanDisplayText(
        $("#documentTerm").value
      ),

      content: CBC.cleanDisplayText(
        $("#documentContent").value
      ),

      updatedAt:
        new Date().toISOString()
    };

    if (!record.title || !record.content) {
      CBC.showToast(
        "Document title and content are required.",
        true
      );
      return;
    }

    if (id) {
      const index =
        data.documents.findIndex(
          (item) => item.id === id
        );

      if (index !== -1) {
        data.documents[index] = {
          ...data.documents[index],
          ...record
        };
      }
    } else {
      record.createdAt =
        new Date().toISOString();

      data.documents.unshift(record);
    }

    CBC.saveData(data);
    CBC.refresh();

    closeDocumentForm();

    CBC.showToast(
      id
        ? "Document updated."
        : "Document saved."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render page
  |--------------------------------------------------------------------------
  */

  function renderDocumentsPage() {
    const list =
      $("#documentsList");

    const emptyState =
      $("#documentsEmptyState");

    const count =
      $("#documentCount");

    if (!list) {
      return;
    }

    const data = CBC.getData();

    let records =
      Array.isArray(data.documents)
        ? data.documents
        : [];

    const query =
      documentSearchQuery
        .trim()
        .toLowerCase();

    if (query) {
      records = records.filter(
        (record) =>
          [
            record.title,
            record.type,
            record.subject,
            record.grade,
            record.term,
            record.content
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
        createDocumentCard(record)
      );
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Document card
  |--------------------------------------------------------------------------
  */

  function createDocumentCard(record) {
    const card =
      document.createElement("article");

    card.className =
      "module-record-card";

    const title =
      CBC.cleanDisplayText(
        record.title ||
          "Untitled Document"
      );

    const type =
      CBC.cleanDisplayText(
        record.type ||
          "Document"
      );

    const subject =
      CBC.cleanDisplayText(
        record.subject || ""
      );

    const grade =
      CBC.cleanDisplayText(
        record.grade || ""
      );

    const term =
      CBC.cleanDisplayText(
        record.term || ""
      );

    const content =
      CBC.cleanDisplayText(
        record.content || ""
      );

    const preview =
      content.length > 260
        ? `${content.slice(0, 260)}…`
        : content;

    card.innerHTML = `
      <div class="module-record-header">
        <div>
          <span class="record-kicker">
            ${type}
          </span>

          <h3>
            ${title}
          </h3>
        </div>

        <span class="record-badge">
          Saved
        </span>
      </div>

      <div class="record-meta">
        ${
          subject
            ? `<span>${subject}</span>`
            : ""
        }

        ${
          grade
            ? `<span>${grade}</span>`
            : ""
        }

        ${
          term
            ? `<span>${term}</span>`
            : ""
        }
      </div>

      <div class="module-record-preview">
        <strong>Preview</strong>
        <p>${preview}</p>
      </div>

      <div class="form-actions">

        <button
          type="button"
          class="btn btn-secondary"
          data-view-document="${record.id}">
          View
        </button>

        <button
          type="button"
          class="btn btn-secondary"
          data-edit-document="${record.id}">
          Edit
        </button>

        <button
          type="button"
          class="btn btn-danger"
          data-delete-document="${record.id}">
          Delete
        </button>

      </div>
    `;

    return card;
  }

  /*
  |--------------------------------------------------------------------------
  | View document
  |--------------------------------------------------------------------------
  */

  function viewDocument(id) {
    const data = CBC.getData();

    const record =
      data.documents.find(
        (item) => item.id === id
      );

    if (!record) {
      return;
    }

    const content =
      CBC.cleanDisplayText(
        record.content || ""
      );

    const title =
      CBC.cleanDisplayText(
        record.title ||
          "Saved Document"
      );

    const view =
      $("#documentViewer");

    const viewerTitle =
      $("#documentViewerTitle");

    const viewerContent =
      $("#documentViewerContent");

    if (
      view &&
      viewerTitle &&
      viewerContent
    ) {
      viewerTitle.textContent =
        title;

      viewerContent.textContent =
        content;

      view.hidden = false;

      view.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Fallback for layouts without viewer
    |--------------------------------------------------------------------------
    */

    CBC.showToast(
      content
        ? content.slice(0, 120)
        : "Document has no content."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Close viewer
  |--------------------------------------------------------------------------
  */

  function closeDocumentViewer() {
    const viewer =
      $("#documentViewer");

    if (viewer) {
      viewer.hidden = true;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Delete document
  |--------------------------------------------------------------------------
  */

  function deleteDocument(id) {
    const data = CBC.getData();

    const record =
      data.documents.find(
        (item) => item.id === id
      );

    if (!record) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${record.title || "this document"}"?`
      );

    if (!confirmed) {
      return;
    }

    data.documents =
      data.documents.filter(
        (item) => item.id !== id
      );

    CBC.saveData(data);
    CBC.refresh();

    CBC.showToast(
      "Document deleted."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Bind controls
  |--------------------------------------------------------------------------
  */

  function bindDocumentControls() {
    const addButton =
      $("#addDocumentBtn");

    const cancelButton =
      $("#cancelDocumentButton");

    const form =
      $("#documentForm");

    const search =
      $("#documentSearch");

    const closeViewerButton =
      $("#closeDocumentViewerButton");

    if (addButton) {
      addButton.addEventListener(
        "click",
        () => openDocumentForm()
      );
    }

    if (cancelButton) {
      cancelButton.addEventListener(
        "click",
        closeDocumentForm
      );
    }

    if (form) {
      form.addEventListener(
        "submit",
        saveDocumentFromForm
      );
    }

    if (search) {
      search.addEventListener(
        "input",
        (event) => {
          documentSearchQuery =
            event.target.value || "";

          renderDocumentsPage();
        }
      );
    }

    if (closeViewerButton) {
      closeViewerButton.addEventListener(
        "click",
        closeDocumentViewer
      );
    }

    document.addEventListener(
      "click",
      (event) => {
        const viewButton =
          event.target.closest(
            "[data-view-document]"
          );

        if (viewButton) {
          viewDocument(
            viewButton.dataset
              .viewDocument
          );

          return;
        }

        const editButton =
          event.target.closest(
            "[data-edit-document]"
          );

        if (editButton) {
          const id =
            editButton.dataset
              .editDocument;

          const record =
            CBC.getData()
              .documents
              .find(
                (item) =>
                  item.id === id
              );

          if (record) {
            openDocumentForm(
              record
            );
          }

          return;
        }

        const deleteButton =
          event.target.closest(
            "[data-delete-document]"
          );

        if (deleteButton) {
          deleteDocument(
            deleteButton.dataset
              .deleteDocument
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

  function bindDocumentQuickAction() {
    document.addEventListener(
      "click",
      (event) => {
        const button =
          event.target.closest(
            '[data-action="save-document"]'
          );

        if (!button) {
          return;
        }

        CBC.navigate("documents");
        openDocumentForm();
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Initialize
  |--------------------------------------------------------------------------
  */

  function initDocumentsModule() {
    bindDocumentControls();
    bindDocumentQuickAction();
    renderDocumentsPage();
  }

  /*
  |--------------------------------------------------------------------------
  | Public module API
  |--------------------------------------------------------------------------
  */

  window.CBCMasterDocuments =
    Object.freeze({
      open: openDocumentForm,
      close: closeDocumentForm,
      view: viewDocument,
      closeViewer:
        closeDocumentViewer,
      render:
        renderDocumentsPage
    });

  document.addEventListener(
    "DOMContentLoaded",
    initDocumentsModule
  );
})();
