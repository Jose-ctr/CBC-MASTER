"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2 — Schemes of Work
|--------------------------------------------------------------------------
| Local-first scheme management.
| No third-party tracking or external requests.
|--------------------------------------------------------------------------
*/

(() => {
  let schemeSearchQuery = "";
  let schemesInitialized = false;

  const $ = (selector) =>
    document.querySelector(selector);

  const clean = (value) =>
    CBCMaster.cleanDisplayText(value || "");

  function getSchemes() {
    const data = CBCMaster.getData();
    return Array.isArray(data.schemes)
      ? data.schemes
      : [];
  }

  function openSchemeForm(scheme = null) {
    const card = $("#schemeFormCard");
    const form = $("#schemeForm");

    if (!card || !form) {
      CBCMaster.showToast(
        "Scheme form is not available.",
        true
      );
      return;
    }

    const fields = {
      id: $("#schemeId"),
      title: $("#schemeTitle"),
      grade: $("#schemeGrade"),
      subject: $("#schemeSubject"),
      term: $("#schemeTerm"),
      year: $("#schemeAcademicYear"),
      strands: $("#schemeStrands"),
      weeks: $("#schemeWeeks"),
      content: $("#schemeContent")
    };

    const title = $("#schemeFormTitle");

    if (scheme) {
      if (title) {
        title.textContent = "Edit Scheme of Work";
      }

      Object.entries(fields).forEach(([key, field]) => {
        if (field) {
          field.value = scheme[key] ?? "";
        }
      });
    } else {
      form.reset();

      if (title) {
        title.textContent = "Create Scheme of Work";
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
      if (fields.year) {
        fields.year.value =
          data.preferences?.academicYear || "2026";
      }
    }

    card.hidden = false;
    card.removeAttribute("hidden");

    fields.title?.focus();
  }

  function closeSchemeForm() {
    const card = $("#schemeFormCard");
    const form = $("#schemeForm");

    form?.reset();

    if (card) {
      card.hidden = true;
      card.setAttribute("hidden", "");
    }
  }

  function saveScheme(event) {
    event.preventDefault();

    const data = CBCMaster.getData();

    if (!Array.isArray(data.schemes)) {
      data.schemes = [];
    }

    const scheme = {
      id: clean($("#schemeId")?.value),
      title: clean($("#schemeTitle")?.value),
      grade: clean($("#schemeGrade")?.value),
      subject: clean($("#schemeSubject")?.value),
      term: clean($("#schemeTerm")?.value),
      year: clean($("#schemeAcademicYear")?.value),
      strands: clean($("#schemeStrands")?.value),
      weeks: clean($("#schemeWeeks")?.value),
      content: clean($("#schemeContent")?.value)
    };

    if (!scheme.title) {
      CBCMaster.showToast(
        "Enter a scheme title.",
        true
      );
      $("#schemeTitle")?.focus();
      return;
    }

    if (!scheme.subject) {
      CBCMaster.showToast(
        "Enter a subject.",
        true
      );
      $("#schemeSubject")?.focus();
      return;
    }

    const now = new Date().toISOString();

    if (scheme.id) {
      const index = data.schemes.findIndex(
        (item) => item.id === scheme.id
      );

      if (index === -1) {
        CBCMaster.showToast(
          "Scheme could not be found.",
          true
        );
        return;
      }

      data.schemes[index] = {
        ...data.schemes[index],
        ...scheme,
        updatedAt: now
      };
    } else {
      scheme.id = CBCMaster.createId("scheme");
      scheme.createdAt = now;
      scheme.updatedAt = now;

      data.schemes.push(scheme);
    }

    if (!CBCMaster.saveData(data)) {
      return;
    }

    CBCMaster.addActivity(
      scheme.id && data.schemes.some(
        (item) => item.id === scheme.id &&
          item.createdAt !== now
      )
        ? "Updated scheme of work"
        : "Saved scheme of work"
    );

    closeSchemeForm();
    CBCMaster.refresh();

    CBCMaster.showToast(
      "Scheme saved successfully."
    );
  }

  function matchesSearch(scheme) {
    if (!schemeSearchQuery) {
      return true;
    }

    const text = [
      scheme.title,
      scheme.grade,
      scheme.subject,
      scheme.term,
      scheme.year,
      scheme.strands
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(
      schemeSearchQuery.toLowerCase()
    );
  }

  function createSchemeCard(scheme) {
    const card = document.createElement("article");
    card.className = "stat-card";

    const header = document.createElement("div");
    header.className = "stat-card-header";

    const heading = document.createElement("h3");
    heading.textContent =
      scheme.title || "Untitled Scheme";

    header.appendChild(heading);

    const details = document.createElement("div");
    details.className = "stat-card-details";

    [
      ["Grade", scheme.grade],
      ["Subject", scheme.subject],
      ["Term", scheme.term],
      ["Academic year", scheme.year],
      ["Strands", scheme.strands],
      ["Weeks", scheme.weeks]
    ].forEach(([label, value]) => {
      if (!value) return;

      const paragraph = document.createElement("p");
      paragraph.textContent = `${label}: ${value}`;
      details.appendChild(paragraph);
    });

    if (scheme.content) {
      const content = document.createElement("p");
      content.textContent = scheme.content;
      details.appendChild(content);
    }

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "button secondary";
    edit.textContent = "Edit";
    edit.addEventListener("click", () => {
      openSchemeForm(scheme);
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "button danger";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => {
      deleteScheme(scheme.id);
    });

    actions.append(edit, remove);
    card.append(header, details, actions);

    return card;
  }

  function renderSchemesPage() {
    const list = $("#schemesList");
    const empty = $("#schemesEmptyState");
    const count = $("#schemeCount");

    if (!list) return;

    const schemes = getSchemes()
      .filter(matchesSearch)
      .sort((a, b) =>
        String(b.updatedAt || "")
          .localeCompare(String(a.updatedAt || ""))
      );

    list.replaceChildren();

    if (count) {
      count.textContent = String(schemes.length);
    }

    if (empty) {
      empty.hidden = schemes.length > 0;
    }

    const fragment = document.createDocumentFragment();

    schemes.forEach((scheme) => {
      fragment.appendChild(
        createSchemeCard(scheme)
      );
    });

    list.appendChild(fragment);
  }

  function deleteScheme(id) {
    const data = CBCMaster.getData();

    const exists = data.schemes.some(
      (scheme) => scheme.id === id
    );

    if (!exists) {
      CBCMaster.showToast(
        "Scheme not found.",
        true
      );
      return;
    }

    if (!window.confirm(
      "Delete this scheme of work?"
    )) {
      return;
    }

    data.schemes = data.schemes.filter(
      (scheme) => scheme.id !== id
    );

    if (!CBCMaster.saveData(data)) {
      return;
    }

    CBCMaster.addActivity(
      "Deleted scheme of work"
    );

    CBCMaster.refresh();
    CBCMaster.showToast("Scheme deleted.");
  }

  function bindControls() {
    $("#addSchemeBtn")?.addEventListener(
      "click",
      () => openSchemeForm()
    );

    $("#cancelSchemeButton")?.addEventListener(
      "click",
      closeSchemeForm
    );

    $("#cancelSchemeBtn")?.addEventListener(
      "click",
      closeSchemeForm
    );

    $("#schemeForm")?.addEventListener(
      "submit",
      saveScheme
    );

    $("#schemeSearch")?.addEventListener(
      "input",
      (event) => {
        schemeSearchQuery = clean(
          event.target.value
        );
        renderSchemesPage();
      }
    );
  }

  function initSchemesModule() {
    if (schemesInitialized) return;

    schemesInitialized = true;
    bindControls();
    renderSchemesPage();
  }

  window.CBCMasterSchemes = Object.freeze({
    render: renderSchemesPage,
    open: openSchemeForm,
    close: closeSchemeForm,
    delete: deleteScheme
  });

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initSchemesModule,
      { once: true }
    );
  } else {
    initSchemesModule();
  }
})();
