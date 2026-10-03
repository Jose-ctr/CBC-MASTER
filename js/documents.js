"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2 — Documents Module
|--------------------------------------------------------------------------
| Local-first document management.
|
| Privacy:
| - Document records remain in local browser storage.
| - No third-party analytics.
| - No external requests.
| - No learner/teacher data transmission.
|--------------------------------------------------------------------------
*/

(function () {

  const API = window.CBCMaster;

  if (!API) {
    return;
  }

  let documentSearchQuery = "";
  let documentsInitialized = false;

  const $ = API.$;

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  function clean(value) {
    return API.cleanDisplayText
      ? API.cleanDisplayText(value ?? "")
      : String(value ?? "").trim();
  }

  function getDocuments() {

    const data = API.getData();

    if (!Array.isArray(data.documents)) {
      data.documents = [];
    }

    return data.documents;
  }

  /*
  |--------------------------------------------------------------------------
  | Form
  |--------------------------------------------------------------------------
  */

  function openDocumentForm(doc = null) {

    const card = $("documentFormCard");
    const form = $("documentForm");

    if (!card || !form) {
      API.showToast(
        "Document form is unavailable.",
        true
      );
      return;
    }

    const title = $("documentFormTitle");
    const idField = $("documentId");
    const titleField = $("documentTitle");
    const typeField = $("documentType");
    const subjectField = $("documentSubject");
    const gradeField = $("documentGrade");
    const termField = $("documentTerm");
    const contentField = $("documentContent");

    form.reset();

    if (doc) {

      if (title) {
        title.textContent = "Edit Document";
      }

      if (idField) {
        idField.value = doc.id || "";
      }

      if (titleField) {
        titleField.value = doc.title || "";
      }

      if (typeField) {
        typeField.value = doc.type || "";
      }

      if (subjectField) {
        subjectField.value = doc.subject || "";
      }

      if (gradeField) {
        gradeField.value = doc.grade || "";
      }

      if (termField) {
        termField.value = doc.term || "";
      }

      if (contentField) {
        contentField.value = doc.content || "";
      }

    } else {

      if (title) {
        title.textContent = "Create Document";
      }

      if (idField) {
        idField.value = "";
      }

      const data = API.getData();

      if (gradeField) {
        gradeField.value =
          data.preferences?.grade || "Grade 5";
      }

      if (termField) {
        termField.value =
          data.preferences?.term || "Term 1";
      }
    }

    card.hidden = false;
    card.removeAttribute("hidden");

    titleField?.focus();
  }

  function closeDocumentForm() {

    const card = $("documentFormCard");
    const form = $("documentForm");

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

  function saveDocument(event) {

    event.preventDefault();

    const data = API.getData();

    if (!Array.isArray(data.documents)) {
      data.documents = [];
    }

    const id =
      clean($("documentId")?.value);

    const title =
      clean($("documentTitle")?.value);

    const type =
      clean($("documentType")?.value);

    const subject =
      clean($("documentSubject")?.value);

    const grade =
      clean($("documentGrade")?.value);

    const term =
      clean($("documentTerm")?.value);

    const content =
      clean($("documentContent")?.value);

    if (!title) {

      API.showToast(
        "Enter a document title.",
        true
      );

      $("documentTitle")?.focus();

      return;
    }

    const now =
      new Date().toISOString();

    const isEditing =
      Boolean(id);

    if (isEditing) {

      const index =
        data.documents.findIndex(
          (document) =>
            document.id === id
        );

      if (index === -1) {

        API.showToast(
          "Document not found.",
          true
        );

        return;
      }

      const existing =
        data.documents[index];

      data.documents[index] = {
        ...existing,
        title,
        type,
        subject,
        grade,
        term,
        content,
        updatedAt: now
      };

    } else {

      data.documents.push({

        id:
          API.createId("document"),

        title,
        type,
        subject,
        grade,
        term,
        content,

        createdAt: now,
        updatedAt: now

      });
    }

    if (!API.saveData(data)) {
      return;
    }

    API.addActivity(
      isEditing
        ? "Updated document"
        : "Created document"
    );

    closeDocumentForm();

    API.refresh();

    API.showToast(
      isEditing
        ? "Document updated."
        : "Document created."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  function matchesSearch(documentRecord) {

    if (!documentSearchQuery) {
      return true;
    }

    const searchable = [
      documentRecord.title,
      documentRecord.type,
      documentRecord.subject,
      documentRecord.grade,
      documentRecord.term,
      documentRecord.content
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(
      documentSearchQuery.toLowerCase()
    );
  }

  /*
  |--------------------------------------------------------------------------
  | View
  |--------------------------------------------------------------------------
  */

  function viewDocument(documentRecord) {

    const viewer =
      $("documentViewer");

    const viewerTitle =
      $("documentViewerTitle");

    const viewerContent =
      $("documentViewerContent");

    if (!viewer || !viewerContent) {

      API.showToast(
        "Document viewer is unavailable.",
        true
      );

      return;
    }

    if (viewerTitle) {
      viewerTitle.textContent =
        documentRecord.title ||
        "Document";
    }

    viewerContent.textContent =
      documentRecord.content ||
      "No document content available.";

    viewer.hidden = false;
    viewer.removeAttribute("hidden");
  }

  /*
  |--------------------------------------------------------------------------
  | Close viewer
  |--------------------------------------------------------------------------
  */

  function closeDocumentViewer() {

    const viewer =
      $("documentViewer");

    if (!viewer) {
      return;
    }

    viewer.hidden = true;
    viewer.setAttribute("hidden", "");
  }

  /*
  |--------------------------------------------------------------------------
  | Card
  |--------------------------------------------------------------------------
  */

  function createDocumentCard(documentRecord) {

    const card =
      document.createElement("article");

    card.className = "stat-card";

    const header =
      document.createElement("div");

    header.className =
      "stat-card-header";

    const title =
      document.createElement("h3");

    title.textContent =
      documentRecord.title ||
      "Untitled Document";

    header.appendChild(title);

    if (documentRecord.type) {

      const badge =
        document.createElement("span");

      badge.className = "badge";

      badge.textContent =
        documentRecord.type;

      header.appendChild(badge);
    }

    const details =
      document.createElement("div");

    details.className =
      "stat-card-details";

    const fields = [
      ["Grade", documentRecord.grade],
      ["Subject", documentRecord.subject],
      ["Term", documentRecord.term]
    ];

    fields.forEach(function ([label, value]) {

      if (!value) {
        return;
      }

      const paragraph =
        document.createElement("p");

      paragraph.textContent =
        `${label}: ${value}`;

      details.appendChild(paragraph);
    });

    const actions =
      document.createElement("div");

    actions.className =
      "card-actions";

    /*
    |--------------------------------------------------------------------------
    | View
    |--------------------------------------------------------------------------
    */

    const viewButton =
      document.createElement("button");

    viewButton.type = "button";
    viewButton.className =
      "button secondary";

    viewButton.textContent =
      "View";

    viewButton.addEventListener(
      "click",
      function () {
        viewDocument(documentRecord);
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Edit
    |--------------------------------------------------------------------------
    */

    const editButton =
      document.createElement("button");

    editButton.type = "button";
    editButton.className =
      "button secondary";

    editButton.textContent =
      "Edit";

    editButton.addEventListener(
      "click",
      function () {
        openDocumentForm(documentRecord);
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    const deleteButton =
      document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className =
      "button danger";

    deleteButton.textContent =
      "Delete";

    deleteButton.addEventListener(
      "click",
      function () {
        deleteDocument(
          documentRecord.id
        );
      }
    );

    actions.append(
      viewButton,
      editButton,
      deleteButton
    );

    card.append(
      header,
      details,
      actions
    );

    return card;
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  function renderDocumentsPage() {

    const list =
      $("documentsList");

    const emptyState =
      $("documentsEmptyState");

    const count =
      $("documentCount");

    if (!list) {
      return;
    }

    const documents =
      getDocuments()
        .filter(matchesSearch)
        .sort(function (a, b) {

          return String(
            b.updatedAt || ""
          ).localeCompare(
            String(a.updatedAt || "")
          );
        });

    list.replaceChildren();

    if (count) {
      count.textContent =
        String(documents.length);
    }

    if (emptyState) {

      emptyState.hidden =
        documents.length > 0;

      if (documents.length > 0) {
        emptyState.setAttribute(
          "hidden",
          ""
        );
      } else {
        emptyState.removeAttribute(
          "hidden"
        );
      }
    }

    const fragment =
      document.createDocumentFragment();

    documents.forEach(function (doc) {

      fragment.appendChild(
        createDocumentCard(doc)
      );
    });

    list.appendChild(fragment);
  }

  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

  function deleteDocument(id) {

    const data =
      API.getData();

    if (!Array.isArray(data.documents)) {
      return;
    }

    const exists =
      data.documents.some(
        (doc) => doc.id === id
      );

    if (!exists) {

      API.showToast(
        "Document not found.",
        true
      );

      return;
    }

    const confirmed =
      window.confirm(
        "Delete this document?"
      );

    if (!confirmed) {
      return;
    }

    data.documents =
      data.documents.filter(
        (doc) => doc.id !== id
      );

    if (!API.saveData(data)) {
      return;
    }

    API.addActivity(
      "Deleted document"
    );

    closeDocumentViewer();

    API.refresh();

    API.showToast(
      "Document deleted."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Controls
  |--------------------------------------------------------------------------
  */

  function bindControls() {

    $("addDocumentBtn")?.addEventListener(
      "click",
      function () {
        openDocumentForm();
      }
    );

    $("cancelDocumentButton")?.addEventListener(
      "click",
      closeDocumentForm
    );

    $("documentForm")?.addEventListener(
      "submit",
      saveDocument
    );

    $("documentSearch")?.addEventListener(
      "input",
      function (event) {

        documentSearchQuery =
          clean(event.target.value);

        renderDocumentsPage();
      }
    );

    $("closeDocumentViewerButton")
      ?.addEventListener(
        "click",
        closeDocumentViewer
      );
  }

  /*
  |--------------------------------------------------------------------------
  | Initialization
  |--------------------------------------------------------------------------
  */

  function initDocumentsModule() {

    if (documentsInitialized) {
      return;
    }

    documentsInitialized = true;

    bindControls();

    renderDocumentsPage();
  }

  /*
  |--------------------------------------------------------------------------
  | Public API
  |--------------------------------------------------------------------------
  */

  window.CBCMasterDocuments =
    Object.freeze({

      render:
        renderDocumentsPage,

      open:
        openDocumentForm,

      close:
        closeDocumentForm,

      view:
        viewDocument,

      closeViewer:
        closeDocumentViewer,

      delete:
        deleteDocument

    });

  /*
  |--------------------------------------------------------------------------
  | Start
  |--------------------------------------------------------------------------
  */

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      initDocumentsModule,
      { once: true }
    );

  } else {

    initDocumentsModule();
  }

})();
