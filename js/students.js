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

(() => {
  let studentSearchQuery = "";
  let studentsInitialized = false;

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  function student$(selector) {
    return document.querySelector(selector);
  }

  function getStudents() {
    const data = CBCMaster.getData();

    if (!Array.isArray(data.students)) {
      data.students = [];
    }

    return data.students;
  }

  /*
  |--------------------------------------------------------------------------
  | Form
  |--------------------------------------------------------------------------
  */

  function openStudentForm(student = null) {
    const card = student$("#studentFormCard");
    const form = student$("#studentForm");

    if (!card || !form) {
      return;
    }

    const title = student$("#studentFormTitle");
    const idField = student$("#studentId");
    const nameField = student$("#studentName");
    const admissionField = student$("#studentAdmissionNumber");
    const gradeField = student$("#studentGrade");
    const classField = student$("#studentClass");

    if (student) {
      if (title) {
        title.textContent = "Edit Student";
      }

      if (idField) {
        idField.value = student.id || "";
      }

      if (nameField) {
        nameField.value = student.name || "";
      }

      if (admissionField) {
        admissionField.value = student.admissionNumber || "";
      }

      if (gradeField) {
        gradeField.value = student.grade || "";
      }

      if (classField) {
        classField.value = student.className || "";
      }
    } else {
      if (title) {
        title.textContent = "Add Student";
      }

      form.reset();

      if (idField) {
        idField.value = "";
      }

      const data = CBCMaster.getData();
      const defaultGrade =
        data.preferences?.grade || "Grade 5";

      if (gradeField) {
        gradeField.value = defaultGrade;
      }
    }

    card.hidden = false;
    card.removeAttribute("hidden");

    if (nameField) {
      window.setTimeout(() => {
        nameField.focus();
      }, 50);
    }
  }

  function closeStudentForm() {
    const card = student$("#studentFormCard");
    const form = student$("#studentForm");

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
  | Save Student
  |--------------------------------------------------------------------------
  */

  function saveStudentFromForm(event) {
    event.preventDefault();

    const data = CBCMaster.getData();

    if (!Array.isArray(data.students)) {
      data.students = [];
    }

    const idField = student$("#studentId");
    const nameField = student$("#studentName");
    const admissionField = student$("#studentAdmissionNumber");
    const gradeField = student$("#studentGrade");
    const classField = student$("#studentClass");

    const id = CBCMaster.cleanDisplayText(
      idField?.value || ""
    );

    const name = CBCMaster.cleanDisplayText(
      nameField?.value || ""
    );

    const admissionNumber = CBCMaster.cleanDisplayText(
      admissionField?.value || ""
    );

    const grade = CBCMaster.cleanDisplayText(
      gradeField?.value || ""
    );

    const className = CBCMaster.cleanDisplayText(
      classField?.value || ""
    );

    if (!name) {
      CBCMaster.showToast(
        "Please enter the student's name.",
        true
      );

      nameField?.focus();
      return;
    }

    const now = new Date().toISOString();

    /*
    |--------------------------------------------------------------------------
    | Edit existing student
    |--------------------------------------------------------------------------
    */

    if (id) {
      const index = data.students.findIndex(
        (student) => student.id === id
      );

      if (index === -1) {
        CBCMaster.showToast(
          "Student record could not be found.",
          true
        );
        return;
      }

      const existing = data.students[index];

      data.students[index] = {
        ...existing,
        name,
        admissionNumber,
        grade,
        className,
        updatedAt: now
      };

      if (!CBCMaster.saveData(data)) {
        return;
      }

      CBCMaster.addActivity(
        "Updated learner record"
      );

      closeStudentForm();
      CBCMaster.refresh();

      CBCMaster.showToast(
        "Student updated successfully."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Add new student
    |--------------------------------------------------------------------------
    */

    const student = {
      id: CBCMaster.createId("student"),
      name,
      admissionNumber,
      grade,
      className,
      createdAt: now,
      updatedAt: now
    };

    data.students.push(student);

    if (!CBCMaster.saveData(data)) {
      return;
    }

    CBCMaster.addActivity(
      "Added learner record"
    );

    closeStudentForm();
    CBCMaster.refresh();

    CBCMaster.showToast(
      "Student added successfully."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  function matchesSearch(student) {
    if (!studentSearchQuery) {
      return true;
    }

    const searchableText = [
      student.name,
      student.admissionNumber,
      student.grade,
      student.className
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
  | Render
  |--------------------------------------------------------------------------
  */

  function renderStudentsPage() {
    const list = student$("#studentsList");
    const emptyState = student$("#studentsEmptyState");
    const count = student$("#studentCount");

    if (!list) {
      return;
    }

    const students = getStudents()
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
      fragment.appendChild(
        createStudentCard(student)
      );
    });

    list.appendChild(fragment);
  }

  /*
  |--------------------------------------------------------------------------
  | Student Card
  |--------------------------------------------------------------------------
  */

  function createStudentCard(student) {
    const card = document.createElement("article");

    card.className = "stat-card";
    card.dataset.studentId = student.id || "";

    const header = document.createElement("div");
    header.className = "stat-card-header";

    const title = document.createElement("h3");
    title.textContent = student.name || "Unnamed Student";

    header.appendChild(title);

    if (student.grade) {
      const badge = document.createElement("span");

      badge.className = "badge";
      badge.textContent = student.grade;

      header.appendChild(badge);
    }

    const details = document.createElement("div");
    details.className = "stat-card-details";

    if (student.admissionNumber) {
      const admission = document.createElement("p");

      admission.textContent =
        `Admission: ${student.admissionNumber}`;

      details.appendChild(admission);
    }

    if (student.className) {
      const classInfo = document.createElement("p");

      classInfo.textContent =
        `Class: ${student.className}`;

      details.appendChild(classInfo);
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

  function deleteStudent(studentId) {
    const data = CBCMaster.getData();

    if (!Array.isArray(data.students)) {
      return;
    }

    const student = data.students.find(
      (item) => item.id === studentId
    );

    if (!student) {
      CBCMaster.showToast(
        "Student record not found.",
        true
      );
      return;
    }

    const confirmed = window.confirm(
      "Delete this student record?"
    );

    if (!confirmed) {
      return;
    }

    data.students = data.students.filter(
      (item) => item.id !== studentId
    );

    if (!CBCMaster.saveData(data)) {
      return;
    }

    CBCMaster.addActivity(
      "Deleted learner record"
    );

    CBCMaster.refresh();

    CBCMaster.showToast(
      "Student deleted."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Controls
  |--------------------------------------------------------------------------
  */

  function bindStudentControls() {
    const addButton = student$("#addStudentBtn");
    const cancelButton = student$("#cancelStudentButton");
    const form = student$("#studentForm");
    const search = student$("#studentSearch");

    addButton?.addEventListener(
      "click",
      () => openStudentForm()
    );

    cancelButton?.addEventListener(
      "click",
      closeStudentForm
    );

    form?.addEventListener(
      "submit",
      saveStudentFromForm
    );

    search?.addEventListener(
      "input",
      (event) => {
        studentSearchQuery =
          CBCMaster.cleanDisplayText(
            event.target.value || ""
          );

        renderStudentsPage();
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Initialization
  |--------------------------------------------------------------------------
  */

  function initStudentsModule() {
    if (studentsInitialized) {
      return;
    }

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

  /*
  |--------------------------------------------------------------------------
  | Start
  |--------------------------------------------------------------------------
  */

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
