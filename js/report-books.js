"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2 — Report Books Module
|--------------------------------------------------------------------------
| Local-first report book management.
|
| Privacy:
| - Report-book records stay in localStorage.
| - No third-party analytics.
| - No external requests.
| - Activity logs contain generic actions only.
|--------------------------------------------------------------------------
*/

(() => {
  let reportBookSearchQuery = "";
  let reportBooksInitialized = false;

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  function reportBook$(selector) {
    return document.querySelector(selector);
  }

  function getReportBooks() {
    const data = CBCMaster.getData();

    if (!Array.isArray(data.reportBooks)) {
      data.reportBooks = [];
    }

    return data.reportBooks;
  }

  function getStudents() {
    const data = CBCMaster.getData();

    return Array.isArray(data.students)
      ? data.students
      : [];
  }

  /*
  |--------------------------------------------------------------------------
  | Form Helpers
  |--------------------------------------------------------------------------
  */

  function findField(...selectors) {
    for (const selector of selectors) {
      const element = reportBook$(selector);

      if (element) {
        return element;
      }
    }

    return null;
  }

  function setFieldValue(element, value) {
    if (!element) {
      return;
    }

    element.value = value ?? "";
  }

  /*
  |--------------------------------------------------------------------------
  | Open Form
  |--------------------------------------------------------------------------
  */

  function openReportBookForm(reportBook = null) {
    const card = findField(
      "#reportBookFormCard"
    );

    const form = findField(
      "#reportBookForm"
    );

    if (!card || !form) {
      return;
    }

    const title = findField(
      "#reportBookFormTitle"
    );

    const idField = findField(
      "#reportBookId"
    );

    const studentField = findField(
      "#reportBookStudent",
      "#reportBookStudentId"
    );

    const subjectField = findField(
      "#reportBookSubject"
    );

    const termField = findField(
      "#reportBookTerm"
    );

    const yearField = findField(
      "#reportBookAcademicYear"
    );

    const scoreField = findField(
      "#reportBookScore",
      "#reportBookMarks"
    );

    const gradeField = findField(
      "#reportBookGrade"
    );

    const commentField = findField(
      "#reportBookComment",
      "#reportBookRemarks"
    );

    if (reportBook) {
      if (title) {
        title.textContent = "Edit Report Book";
      }

      setFieldValue(idField, reportBook.id);
      setFieldValue(
        studentField,
        reportBook.studentId
      );
      setFieldValue(
        subjectField,
        reportBook.subject
      );
      setFieldValue(
        termField,
        reportBook.term
      );
      setFieldValue(
        yearField,
        reportBook.academicYear
      );
      setFieldValue(
        scoreField,
        reportBook.score
      );
      setFieldValue(
        gradeField,
        reportBook.grade
      );
      setFieldValue(
        commentField,
        reportBook.comment
      );
    } else {
      if (title) {
        title.textContent = "Add Report Book";
      }

      form.reset();

      setFieldValue(idField, "");

      const data = CBCMaster.getData();

      setFieldValue(
        termField,
        data.preferences?.term || "Term 1"
      );

      setFieldValue(
        yearField,
        data.preferences?.academicYear || "2026"
      );
    }

    populateStudentSelect();

    if (reportBook) {
      setFieldValue(
        studentField,
        reportBook.studentId
      );
    }

    card.hidden = false;
    card.removeAttribute("hidden");

    const firstInput = findField(
      "#reportBookStudent",
      "#reportBookStudentId",
      "#reportBookSubject"
    );

    window.setTimeout(() => {
      firstInput?.focus();
    }, 50);
  }

  /*
  |--------------------------------------------------------------------------
  | Close Form
  |--------------------------------------------------------------------------
  */

  function closeReportBookForm() {
    const card = findField(
      "#reportBookFormCard"
    );

    const form = findField(
      "#reportBookForm"
    );

    if (form) {
      form.reset();
    }

    if (card) {
      card.hidden = true;
      card.setAttribute("hidden", "");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Student Select
  |--------------------------------------------------------------------------
  */

  function populateStudentSelect() {
    const select = findField(
      "#reportBookStudent",
      "#reportBookStudentId"
    );

    if (!select || select.tagName !== "SELECT") {
      return;
    }

    const currentValue = select.value;
    const students = getStudents();

    const placeholder = document.createElement(
      "option"
    );

    placeholder.value = "";
    placeholder.textContent = "Select student";

    select.replaceChildren(placeholder);

    students
      .slice()
      .sort((a, b) =>
        String(a.name || "").localeCompare(
          String(b.name || ""),
          undefined,
          { sensitivity: "base" }
        )
      )
      .forEach((student) => {
        const option = document.createElement(
          "option"
        );

        option.value = student.id;
        option.textContent =
          student.admissionNumber
            ? `${student.name} — ${student.admissionNumber}`
            : student.name;

        select.appendChild(option);
      });

    if (currentValue) {
      select.value = currentValue;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Save
  |--------------------------------------------------------------------------
  */

  function saveReportBookFromForm(event) {
    event.preventDefault();

    const data = CBCMaster.getData();

    if (!Array.isArray(data.reportBooks)) {
      data.reportBooks = [];
    }

    const idField = findField(
      "#reportBookId"
    );

    const studentField = findField(
      "#reportBookStudent",
      "#reportBookStudentId"
    );

    const subjectField = findField(
      "#reportBookSubject"
    );

    const termField = findField(
      "#reportBookTerm"
    );

    const yearField = findField(
      "#reportBookAcademicYear"
    );

    const scoreField = findField(
      "#reportBookScore",
      "#reportBookMarks"
    );

    const gradeField = findField(
      "#reportBookGrade"
    );

    const commentField = findField(
      "#reportBookComment",
      "#reportBookRemarks"
    );

    const id = CBCMaster.cleanDisplayText(
      idField?.value || ""
    );

    const studentId = CBCMaster.cleanDisplayText(
      studentField?.value || ""
    );

    const subject = CBCMaster.cleanDisplayText(
      subjectField?.value || ""
    );

    const term = CBCMaster.cleanDisplayText(
      termField?.value || ""
    );

    const academicYear = CBCMaster.cleanDisplayText(
      yearField?.value || ""
    );

    const score = CBCMaster.cleanDisplayText(
      scoreField?.value || ""
    );

    const grade = CBCMaster.cleanDisplayText(
      gradeField?.value || ""
    );

    const comment = CBCMaster.cleanDisplayText(
      commentField?.value || ""
    );

    if (!studentId) {
      CBCMaster.showToast(
        "Please select a student.",
        true
      );

      studentField?.focus();
      return;
    }

    if (!subject) {
      CBCMaster.showToast(
        "Please enter the subject.",
        true
      );

      subjectField?.focus();
      return;
    }

    const now = new Date().toISOString();

    /*
    |--------------------------------------------------------------------------
    | Edit
    |--------------------------------------------------------------------------
    */

    if (id) {
      const index = data.reportBooks.findIndex(
        (item) => item.id === id
      );

      if (index === -1) {
        CBCMaster.showToast(
          "Report-book record could not be found.",
          true
        );

        return;
      }

      const existing =
        data.reportBooks[index];

      data.reportBooks[index] = {
        ...existing,
        studentId,
        subject,
        term,
        academicYear,
        score,
        grade,
        comment,
        updatedAt: now
      };

      if (!CBCMaster.saveData(data)) {
        return;
      }

      CBCMaster.addActivity(
        "Updated report-book record"
      );

      closeReportBookForm();
      CBCMaster.refresh();

      CBCMaster.showToast(
        "Report book updated successfully."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Add
    |--------------------------------------------------------------------------
    */

    const reportBook = {
      id: CBCMaster.createId(
        "report-book"
      ),
      studentId,
      subject,
      term,
      academicYear,
      score,
      grade,
      comment,
      createdAt: now,
      updatedAt: now
    };

    data.reportBooks.push(reportBook);

    if (!CBCMaster.saveData(data)) {
      return;
    }

    CBCMaster.addActivity(
      "Added report-book record"
    );

    closeReportBookForm();
    CBCMaster.refresh();

    CBCMaster.showToast(
      "Report book added successfully."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  function matchesSearch(reportBook) {
    if (!reportBookSearchQuery) {
      return true;
    }

    const student = getStudents().find(
      (item) =>
        item.id === reportBook.studentId
    );

    const searchableText = [
      student?.name,
      student?.admissionNumber,
      reportBook.subject,
      reportBook.term,
      reportBook.academicYear,
      reportBook.grade
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(
      reportBookSearchQuery.toLowerCase()
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Student Name
  |--------------------------------------------------------------------------
  */

  function getStudentName(studentId) {
    const student = getStudents().find(
      (item) => item.id === studentId
    );

    return student?.name || "Unknown student";
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  function renderReportBooksPage() {
    const list = findField(
      "#reportBooksList"
    );

    const emptyState = findField(
      "#reportBooksEmptyState"
    );

    const count = findField(
      "#reportBookCount"
    );

    if (!list) {
      return;
    }

    const reportBooks = getReportBooks()
      .filter(matchesSearch)
      .sort((a, b) =>
        String(b.updatedAt || "")
          .localeCompare(
            String(a.updatedAt || "")
          )
      );

    list.replaceChildren();

    if (count) {
      count.textContent =
        String(reportBooks.length);
    }

    if (reportBooks.length === 0) {
      if (emptyState) {
        emptyState.hidden = false;
        emptyState.removeAttribute(
          "hidden"
        );
      }

      return;
    }

    if (emptyState) {
      emptyState.hidden = true;
      emptyState.setAttribute(
        "hidden",
        ""
      );
    }

    const fragment =
      document.createDocumentFragment();

    reportBooks.forEach((reportBook) => {
      fragment.appendChild(
        createReportBookCard(reportBook)
      );
    });

    list.appendChild(fragment);
  }

  /*
  |--------------------------------------------------------------------------
  | Card
  |--------------------------------------------------------------------------
  */

  function createReportBookCard(reportBook) {
    const card =
      document.createElement("article");

    card.className = "stat-card";
    card.dataset.reportBookId =
      reportBook.id || "";

    const header =
      document.createElement("div");

    header.className =
      "stat-card-header";

    const title =
      document.createElement("h3");

    title.textContent =
      getStudentName(
        reportBook.studentId
      );

    header.appendChild(title);

    if (reportBook.grade) {
      const badge =
        document.createElement("span");

      badge.className = "badge";
      badge.textContent =
        reportBook.grade;

      header.appendChild(badge);
    }

    const details =
      document.createElement("div");

    details.className =
      "stat-card-details";

    const subject =
      document.createElement("p");

    subject.textContent =
      `Subject: ${reportBook.subject || "—"}`;

    const term =
      document.createElement("p");

    term.textContent =
      `${reportBook.term || "—"} • ${
        reportBook.academicYear || "—"
      }`;

    details.append(
      subject,
      term
    );

    if (reportBook.score !== "") {
      const score =
        document.createElement("p");

      score.textContent =
        `Score: ${reportBook.score}`;

      details.appendChild(score);
    }

    if (reportBook.comment) {
      const comment =
        document.createElement("p");

      comment.textContent =
        `Comment: ${reportBook.comment}`;

      details.appendChild(comment);
    }

    const actions =
      document.createElement("div");

    actions.className =
      "card-actions";

    const editButton =
      document.createElement("button");

    editButton.type = "button";
    editButton.className =
      "button secondary";
    editButton.textContent =
      "Edit";

    editButton.addEventListener(
      "click",
      () => openReportBookForm(
        reportBook
      )
    );

    const deleteButton =
      document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className =
      "button danger";
    deleteButton.textContent =
      "Delete";

    deleteButton.addEventListener(
      "click",
      () => deleteReportBook(
        reportBook.id
      )
    );

    actions.append(
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
  | Delete
  |--------------------------------------------------------------------------
  */

  function deleteReportBook(reportBookId) {
    const data =
      CBCMaster.getData();

    if (!Array.isArray(
      data.reportBooks
    )) {
      return;
    }

    const reportBook =
      data.reportBooks.find(
        (item) =>
          item.id === reportBookId
      );

    if (!reportBook) {
      CBCMaster.showToast(
        "Report-book record not found.",
        true
      );

      return;
    }

    const confirmed =
      window.confirm(
        "Delete this report-book record?"
      );

    if (!confirmed) {
      return;
    }

    data.reportBooks =
      data.reportBooks.filter(
        (item) =>
          item.id !== reportBookId
      );

    if (!CBCMaster.saveData(data)) {
      return;
    }

    CBCMaster.addActivity(
      "Deleted report-book record"
    );

    CBCMaster.refresh();

    CBCMaster.showToast(
      "Report-book record deleted."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Controls
  |--------------------------------------------------------------------------
  */

  function bindReportBookControls() {
    const addButton = findField(
      "#addReportBookBtn"
    );

    const cancelButton = findField(
      "#cancelReportBookButton",
      "#cancelReportBookBtn"
    );

    const form = findField(
      "#reportBookForm"
    );

    const search = findField(
      "#reportBookSearch"
    );

    addButton?.addEventListener(
      "click",
      () => openReportBookForm()
    );

    cancelButton?.addEventListener(
      "click",
      closeReportBookForm
    );

    form?.addEventListener(
      "submit",
      saveReportBookFromForm
    );

    search?.addEventListener(
      "input",
      (event) => {
        reportBookSearchQuery =
          CBCMaster.cleanDisplayText(
            event.target.value || ""
          );

        renderReportBooksPage();
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Initialization
  |--------------------------------------------------------------------------
  */

  function initReportBooksModule() {
    if (reportBooksInitialized) {
      return;
    }

    reportBooksInitialized = true;

    bindReportBookControls();
    renderReportBooksPage();
  }

  /*
  |--------------------------------------------------------------------------
  | Public API
  |--------------------------------------------------------------------------
  */

  window.CBCMasterReportBooks =
    Object.freeze({
      render: renderReportBooksPage,
      open: openReportBookForm,
      close: closeReportBookForm,
      delete: deleteReportBook
    });

  /*
  |--------------------------------------------------------------------------
  | Start
  |--------------------------------------------------------------------------
  */

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initReportBooksModule,
      { once: true }
    );
  } else {
    initReportBooksModule();
  }
})();
