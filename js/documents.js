"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2 — Documents Module
|--------------------------------------------------------------------------
| Local-first document management.
|
| Privacy:
| - Records remain in local browser storage.
| - No third-party analytics.
| - No external requests.
|--------------------------------------------------------------------------
*/

(() => {
  let documentSearchQuery = "";
  let documentsInitialized = false;

  const $ = (selector) =>
    document.querySelector(selector);

  const clean = (value) =>
    CBCMaster.cleanDisplayText(value || "");

  function getDocuments() {
    const data = CBCMaster.getData();

    return Array.isArray(data.documents)
      ? data.documents
      : [];
  }

  /*
  |--------------------------------------------------------------------------
  | Form
  |--------------------------------------------------------------------------
  */

  function openDocumentForm(doc = null) {
    const card = $("#documentFormCard");
    const form = $("#documentForm");

    if (!card || !form) {
      CBCMaster.showToast(
        "Document form is unavailable.",
        true
      );
      return;
    }

    const fields = {
      id: $("#documentId"),
      title: $("#documentTitle"),
      type: $("#documentType"),
      grade: $("#documentGrade"),
      subject: $("#documentSubject"),
      term: $("#documentTerm"),
      description: $("#documentDescription"),
      content: $("#documentContent")
    };

    const heading = $("#documentFormTitle");

    if (doc) {
      if (heading) {
        heading.textContent = "Edit Document";
      }

      Object.entries(fields).forEach(
        ([key, field]) => {
          if (field) {
            field.value = doc[key] ?? "";
          }
        }
      );
    } else {
      form.reset();

      if (heading) {
        heading.textContent = "Create Document";
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

  function closeDocumentForm() {
    const card = $("#documentFormCard");
    const form = $("#documentForm");

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

    const data = CBCMaster.getData();

    if (!Array.isArray(data.documents)) {
      data.documents = [];
    }

    const doc = {
      id: clean($("#documentId")?.value),
      title: clean($("#documentTitle")?.value),
      type: clean($("#documentType")?.value),
      grade: clean($("#documentGrade")?.value),
      subject: clean($("#documentSubject")?.value),
      term: clean($("#documentTerm")?.value),
      description: clean(
        $("#documentDescription")?.value
      ),
      content: clean($("#documentContent")?.value)
    };

    if (!doc.title) {
      CBCMaster.showToast(
        "Enter a document title.",
        true
      );
      $("#documentTitle")?.focus();
      return;
    }

    const isEditing = Boolean(doc.id);
    const now = new Date().toISOString();

    if (isEditing) {
      const index = data.documents.findIndex(
        (item) => item.id === doc.id
      );

      if (index === -1) {
        CBCMaster.showToast(
          "Document not found.",
          true
        );
        return;
      }

      data.documents[index] = {
        ...data.documents[index],
        ...doc,
        updatedAt: now
      };
    } else {
      doc.id = CBCMaster.createId("document");
      doc.createdAt = now;
      doc.updatedAt = now;

      data.documents.push(doc);
    }

    if (!CBCMaster.saveData(data)) {
      return;
    }

    CBCMaster.addActivity(
      isEditing
        ? "Updated document"
        : "Created document"
    );

    closeDocumentForm();
    CBCMaster.refresh();

    CBCMaster.showToast(
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

  function matchesSearch(doc) {
    if (!documentSearchQuery) {
      return true;
    }

    const searchable = [
      doc.title,
      doc.type,
      doc.grade,
      doc.subject,
      doc.term,
      doc.description,
      doc.content
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
  | Document Card
  |--------------------------------------------------------------------------
  */

  function createDocumentCard(doc) {
    const card = document.createElement("article");
    card.className = "stat-card";

    const header = document.createElement("div");
    header.className = "stat-card-header";

    const title = document.createElement("h3");
    title.textContent =
      doc.title || "Untitled Document";

    header.appendChild(title);

    if (doc.type) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = doc.type;
      header.appendChild(badge);
    }

    const details = document.createElement("div");
    details.className = "stat-card-details";

    [
      ["Grade", doc.grade],
      ["Subject", doc.subject],
      ["Term", doc.term],
      ["Description", doc.description]
    ].forEach(([label, value]) => {
      if (!value) return;

      const paragraph = document.createElement("p");
      paragraph.textContent = `${label}: ${value}`;
      details.appendChild(paragraph);
    });

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const viewButton = document.createElement("button");
    viewButton.type = "button";
    viewButton.className = "button secondary";
    viewButton.textContent = "View";

    viewButton.addEventListener("click", () => {
      viewDocument(doc);
    });

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "button secondary";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", () => {
      openDocumentForm(doc);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "button danger";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      deleteDocument(doc.id);
    });

    actions.append(
      viewButton,
      editButton,
      deleteButton
    );

    card.append(header, details, actions);

    return card;
  }

  /*
  |--------------------------------------------------------------------------
  | View
  |--------------------------------------------------------------------------
  */

  function viewDocument(doc) {
    const content = [
      doc.title,
      "",
      doc.description || "",
      "",
      doc.content || ""
    ].join("\n");

    const viewer = $("#documentViewer");
    const viewerTitle = $("#documentViewerTitle");
    const viewerContent = $("#documentViewerContent");

    if (viewer && viewerContent) {
      if (viewerTitle) {
        viewerTitle.textContent = doc.title;
      }

      viewerContent.textContent = content;
      viewer.hidden = false;
      viewer.removeAttribute("hidden");
      return;
    }

    CBCMaster.showToast(
      "Document viewer is not available.",
      true
    );
  }

  function closeDocumentViewer() {
    const viewer = $("#documentViewer");

    if (viewer) {
      viewer.hidden = true;
      viewer.setAttribute("hidden", "");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  function renderDocumentsPage() {
    const list = $("#documentsList");
    const emptyState = $("#documentsEmptyState");
    const count = $("#documentCount");

    if (!list) return;

    const documents = getDocuments()
      .filter(matchesSearch)
      .sort((a, b) =>
        String(b.updatedAt || "")
          .localeCompare(String(a.updatedAt || ""))
      );

    list.replaceChildren();

    if (count) {
      count.textContent = String(documents.length);
    }

    if (emptyState) {
      emptyState.hidden = documents.length > 0;
    }

    const fragment = document.createDocumentFragment();

    documents.forEach((doc) => {
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
    const data = CBCMaster.getData();

    const exists = data.documents.some(
      (doc) => doc.id === id
    );

    if (!exists) {
      CBCMaster.showToast(
        "Document not found.",
        true
      );
      return;
    }

    if (!window.confirm(
      "Delete this document?"
    )) {
      return;
    }

    data.documents = data.documents.filter(
      (doc) => doc.id !== id
    );

    if (!CBCMaster.saveData(data)) {
      return;
    }

    CBCMaster.addActivity(
      "Deleted document"
    );

    CBCMaster.refresh();

    CBCMaster.showToast(
      "Document deleted."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Controls
  |--------------------------------------------------------------------------
  */

  function bindControls() {
    $("#addDocumentBtn")?.addEventListener(
      "click",
      () => openDocumentForm()
    );

    $("#cancelDocumentButton")?.addEventListener(
      "click",
      closeDocumentForm
    );

    $("#cancelDocumentBtn")?.addEventListener(
      "click",
      closeDocumentForm
    );

    $("#documentForm")?.addEventListener(
      "submit",
      saveDocument
    );

    $("#documentSearch")?.addEventListener(
      "input",
      (event) => {
        documentSearchQuery = clean(
          event.target.value
        );
        renderDocumentsPage();
      }
    );

    $("#closeDocumentViewer")?.addEventListener(
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
    if (documentsInitialized) return;

    documentsInitialized = true;
    bindControls();
    renderDocumentsPage();
  }

  /*
  |--------------------------------------------------------------------------
  | Public API
  |--------------------------------------------------------------------------
  */

  window.CBCMasterDocuments = Object.freeze({
    render: renderDocumentsPage,
    open: openDocumentForm,
    close: closeDocumentForm,
    view: viewDocument,
    closeViewer: closeDocumentViewer,
    delete: deleteDocument
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
