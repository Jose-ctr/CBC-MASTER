"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2 — Students Module
|--------------------------------------------------------------------------
| Local-first learner management.
|
| Privacy:
| - Learner records remain in localStorage.
| - No third-party analytics.
| - No external requests.
| - No learner names/details in activity logs.
|--------------------------------------------------------------------------
*/

(function () {
  const API = window.CBCMaster;

  if (!API) return;

  let studentSearchQuery = "";
  let studentsInitialized = false;

  const $ = API.$;

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  function getData() {
    return API.getData();
  }

  function clean(value) {
    return API.cleanDisplayText
      ? API.cleanDisplayText(value)
      : String(value ?? "").trim();
  }

  function getStudents(data) {
    if (!Array.isArray(data.students)) {
      data.students = [];
    }

    return data.students;
  }

  function getAdmissionNumber(student) {
    return student.admissionNumber || student.admNo || "";
  }

  function getStream(student) {
    return student.stream || student.className || "";
  }

  function showError(message) {
    API.showToast(message, true);
  }

  /*
  |--------------------------------------------------------------------------
  | Form
  |--------------------------------------------------------------------------
  */

  function openStudentForm(student = null) {
    const card = $("studentFormCard");
    const form = $("studentForm");

    if (!card || !form) return;

    const title = $("studentFormTitle");
    const idField = $("studentId");
    const nameField = $("studentName");
    const admissionField = $("studentAdmNo");
    const genderField = $("studentGender");
    const gradeField = $("studentGrade");
    const streamField = $("studentStream");
    const notesField = $("studentNotes");

    form.reset();

    if (student) {
      if (title) title.textContent = "Edit Learner";

      if (idField) idField.value = student.id || "";
      if (nameField) nameField.value = student.name || "";
      if (admissionField) {
        admissionField.value = getAdmissionNumber(student);
      }
      if (genderField) genderField.value = student.gender || "";
      if (gradeField) gradeField.value = student.grade || "";
      if (streamField) streamField.value = getStream(student);
      if (notesField) notesField.value = student.notes || "";
    } else {
      if (title) title.textContent = "Add Learner";

      if (idField) idField.value = "";

      const data = getData();
      const defaultGrade =
        data.preferences?.grade || "Grade 5";

      if (gradeField) gradeField.value = defaultGrade;
    }

    card.hidden = false;
    card.removeAttribute("hidden");

    nameField?.focus();
  }

  function closeStudentForm() {
    const card = $("studentFormCard");
    const form = $("studentForm");

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

  function saveStudentFromForm(event) {
    event.preventDefault();

    const data = getData();
    const students = getStudents(data);

    const id = clean($("studentId")?.value);
    const name = clean($("studentName")?.value);
    const admissionNumber = clean($("studentAdmNo")?.value);
    const gender = clean($("studentGender")?.value);
    const grade = clean($("studentGrade")?.value);
    const stream = clean($("studentStream")?.value);
    const notes = clean($("studentNotes")?.value);

    if (!name) {
      showError("Please enter the learner's name.");
      $("studentName")?.focus();
      return;
    }

    if (
      admissionNumber &&
      students.some((student) =>
        student.id !== id &&
        getAdmissionNumber(student).toLowerCase() ===
          admissionNumber.toLowerCase()
      )
    ) {
      showError("This admission number is already in use.");
      $("studentAdmNo")?.focus();
      return;
    }

    const now = new Date().toISOString();

    if (id) {
      const index = students.findIndex(
        (student) => student.id === id
      );

      if (index === -1) {
        showError("Learner record could not be found.");
        return;
      }

      const existing = students[index];

      students[index] = {
        ...existing,
        name,
        admissionNumber,
        gender,
        grade,
        stream,
        notes,
        updatedAt: now
      };

      if (!API.saveData(data)) return;

      API.addActivity("Updated learner record");

      closeStudentForm();
      API.refresh();
      API.showToast("Learner updated successfully.");
      return;
    }

    students.push({
      id: API.createId("student"),
      name,
      admissionNumber,
      gender,
      grade,
      stream,
      notes,
      createdAt: now,
      updatedAt: now
    });

    if (!API.saveData(data)) return;

    API.addActivity("Added learner record");

    closeStudentForm();
    API.refresh();
    API.showToast("Learner added successfully.");
  }

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  function matchesSearch(student) {
    if (!studentSearchQuery) return true;

    const searchableText = [
      student.name,
      getAdmissionNumber(student),
      student.gender,
      student.grade,
      getStream(student),
      student.notes
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(
      studentSearchQuery.toLowerCase()
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Learner card
  |--------------------------------------------------------------------------
  */

  function createStudentCard(student) {
    const card = document.createElement("article");
    card.className = "stat-card";
    card.dataset.studentId = student.id || "";

    const header = document.createElement("div");
    header.className = "stat-card-header";

    const title = document.createElement("h3");
    title.textContent = student.name || "Unnamed Learner";

    header.appendChild(title);

    if (student.grade) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = student.grade;
      header.appendChild(badge);
    }

    const details = document.createElement("div");
    details.className = "stat-card-details";

    const fields = [
      ["Admission No.", getAdmissionNumber(student)],
      ["Gender", student.gender],
      ["Stream", getStream(student)]
    ];

    fields.forEach(([label, value]) => {
      if (!value) return;

      const paragraph = document.createElement("p");
      paragraph.textContent = `${label}: ${value}`;
      details.appendChild(paragraph);
    });

    if (student.notes) {
      const notes = document.createElement("p");
      notes.textContent = `Notes: ${student.notes}`;
      details.appendChild(notes);
    }

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "button secondary";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => {
      openStudentForm(student);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "button danger";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      deleteStudent(student.id);
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

  function renderStudentsPage() {
    const list = $("studentsList");
    const emptyState = $("studentsEmptyState");
    const count = $("studentCount");

    if (!list) return;

    const students = getStudents(getData())
      .filter(matchesSearch)
      .sort((a, b) =>
        String(a.name || "").localeCompare(
          String(b.name || ""),
          undefined,
          { sensitivity: "base" }
        )
      );

    list.replaceChildren();

    if (count) {
      count.textContent = String(students.length);
    }

    if (students.length === 0) {
      if (emptyState) {
        emptyState.hidden = false;
        emptyState.removeAttribute("hidden");
      }
      return;
    }

    if (emptyState) {
      emptyState.hidden = true;
      emptyState.setAttribute("hidden", "");
    }

    const fragment = document.createDocumentFragment();

    students.forEach((student) => {
      fragment.appendChild(createStudentCard(student));
    });

    list.appendChild(fragment);
  }

  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

  function deleteStudent(studentId) {
    const data = getData();
    const students = getStudents(data);

    const exists = students.some(
      (student) => student.id === studentId
    );

    if (!exists) {
      showError("Learner record not found.");
      return;
    }

    const confirmed = window.confirm(
      "Delete this learner record?"
    );

    if (!confirmed) return;

    data.students = students.filter(
      (student) => student.id !== studentId
    );

    if (!API.saveData(data)) return;

    API.addActivity("Deleted learner record");

    API.refresh();
    API.showToast("Learner deleted.");
  }

  /*
  |--------------------------------------------------------------------------
  | Controls
  |--------------------------------------------------------------------------
  */

  function bindStudentControls() {
    $("addStudentBtn")?.addEventListener("click", () => {
      openStudentForm();
    });

    $("cancelStudentButton")?.addEventListener(
      "click",
      closeStudentForm
    );

    $("studentForm")?.addEventListener(
      "submit",
      saveStudentFromForm
    );

    $("studentSearch")?.addEventListener("input", (event) => {
      studentSearchQuery = clean(event.target.value);
      renderStudentsPage();
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Initialization
  |--------------------------------------------------------------------------
  */

  function initStudentsModule() {
    if (studentsInitialized) return;

    studentsInitialized = true;
    bindStudentControls();
    renderStudentsPage();
  }

  /*
  |--------------------------------------------------------------------------
  | Public API
  |--------------------------------------------------------------------------
  */

  window.CBCMasterStudents = Object.freeze({
    render: renderStudentsPage,
    open: openStudentForm,
    close: closeStudentForm,
    delete: deleteStudent
  });

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initStudentsModule,
      { once: true }
    );
  } else {
    initStudentsModule();
  }
})();
