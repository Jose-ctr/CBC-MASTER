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

  let studentSearchQuery = "";
  let studentsInitialized = false;

  /*
  |--------------------------------------------------------------------------
  | Wait for CBCMaster
  |--------------------------------------------------------------------------
  */

  function getAPI() {
    return window.CBCMaster || null;
  }

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  function $(id) {
    const API = getAPI();

    if (API && typeof API.$ === "function") {
      return API.$(id);
    }

    return document.getElementById(id);
  }

  function getData() {
    const API = getAPI();

    if (!API || typeof API.getData !== "function") {
      return {
        students: [],
        preferences: {}
      };
    }

    return API.getData();
  }

  function clean(value) {
    const API = getAPI();

    if (API && typeof API.cleanDisplayText === "function") {
      return API.cleanDisplayText(value);
    }

    return String(value ?? "").trim();
  }

  function getStudents(data) {

    if (!Array.isArray(data.students)) {
      data.students = [];
    }

    return data.students;
  }

  function getAdmissionNumber(student) {
    return (
      student.admissionNumber ||
      student.admNo ||
      ""
    );
  }

  function getStream(student) {
    return (
      student.stream ||
      student.className ||
      ""
    );
  }

  function showError(message) {

    const API = getAPI();

    if (
      API &&
      typeof API.showToast === "function"
    ) {
      API.showToast(message, true);
    } else {
      window.alert(message);
    }
  }

  function showSuccess(message) {

    const API = getAPI();

    if (
      API &&
      typeof API.showToast === "function"
    ) {
      API.showToast(message);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Open Add/Edit Learner Form
  |--------------------------------------------------------------------------
  */

  function openStudentForm(student = null) {

    const card = $("studentFormCard");
    const form = $("studentForm");

    if (!card || !form) {
      return false;
    }

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

      if (title) {
        title.textContent = "Edit Learner";
      }

      if (idField) {
        idField.value = student.id || "";
      }

      if (nameField) {
        nameField.value = student.name || "";
      }

      if (admissionField) {
        admissionField.value =
          getAdmissionNumber(student);
      }

      if (genderField) {
        genderField.value =
          student.gender || "";
      }

      if (gradeField) {
        gradeField.value =
          student.grade || "";
      }

      if (streamField) {
        streamField.value =
          getStream(student);
      }

      if (notesField) {
        notesField.value =
          student.notes || "";
      }

    } else {

      if (title) {
        title.textContent = "Add Learner";
      }

      if (idField) {
        idField.value = "";
      }

      const data = getData();

      const defaultGrade =
        data.preferences &&
        data.preferences.grade
          ? data.preferences.grade
          : "Grade 5";

      if (gradeField) {
        gradeField.value = defaultGrade;
      }
    }

    /*
     * Show the form.
     */
    card.hidden = false;
    card.removeAttribute("hidden");

    /*
     * Scroll the form into view so that
     * the user can immediately see it.
     */
    window.setTimeout(() => {

      try {
        card.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      } catch (_) {}

      nameField?.focus();

    }, 50);

    return true;
  }

  /*
  |--------------------------------------------------------------------------
  | Close Form
  |--------------------------------------------------------------------------
  */

  function closeStudentForm() {

    const card = $("studentFormCard");
    const form = $("studentForm");

    form?.reset();

    if (card) {

      card.hidden = true;

      card.setAttribute(
        "hidden",
        ""
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Save Learner
  |--------------------------------------------------------------------------
  */

  function saveStudentFromForm(event) {

    event.preventDefault();

    const API = getAPI();

    if (!API) {
      showError(
        "CBC MASTER is still loading. Please try again."
      );
      return;
    }

    const data = getData();
    const students = getStudents(data);

    const id =
      clean($("studentId")?.value);

    const name =
      clean($("studentName")?.value);

    const admissionNumber =
      clean($("studentAdmNo")?.value);

    const gender =
      clean($("studentGender")?.value);

    const grade =
      clean($("studentGrade")?.value);

    const stream =
      clean($("studentStream")?.value);

    const notes =
      clean($("studentNotes")?.value);

    /*
     * Required learner name.
     */
    if (!name) {

      showError(
        "Please enter the learner's name."
      );

      $("studentName")?.focus();

      return;
    }

    /*
     * Prevent duplicate admission numbers.
     */
    if (
      admissionNumber &&
      students.some(
        (student) =>

          student.id !== id &&

          getAdmissionNumber(student)
            .toLowerCase() ===
          admissionNumber.toLowerCase()
      )
    ) {

      showError(
        "This admission number is already in use."
      );

      $("studentAdmNo")?.focus();

      return;
    }

    const now =
      new Date().toISOString();

    /*
     |--------------------------------------------------------------------------
     | Edit existing learner
     |--------------------------------------------------------------------------
     */

    if (id) {

      const index =
        students.findIndex(
          (student) =>
            student.id === id
        );

      if (index === -1) {

        showError(
          "Learner record could not be found."
        );

        return;
      }

      const existing =
        students[index];

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

      if (
        typeof API.saveData !== "function" ||
        !API.saveData(data)
      ) {
        return;
      }

      if (
        typeof API.addActivity ===
        "function"
      ) {
        API.addActivity(
          "Updated learner record"
        );
      }

      closeStudentForm();

      if (
        typeof API.refresh === "function"
      ) {
        API.refresh();
      }

      showSuccess(
        "Learner updated successfully."
      );

      return;
    }

    /*
     |--------------------------------------------------------------------------
     | Add new learner
     |--------------------------------------------------------------------------
     */

    const createId =
      typeof API.createId === "function"
        ? API.createId("student")
        : `student-${Date.now()}`;

    students.push({

      id: createId,

      name,

      admissionNumber,

      gender,

      grade,

      stream,

      notes,

      createdAt: now,

      updatedAt: now

    });

    if (
      typeof API.saveData !== "function" ||
      !API.saveData(data)
    ) {
      return;
    }

    if (
      typeof API.addActivity ===
      "function"
    ) {
      API.addActivity(
        "Added learner record"
      );
    }

    closeStudentForm();

    if (
      typeof API.refresh === "function"
    ) {
      API.refresh();
    }

    showSuccess(
      "Learner added successfully."
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
  | Learner Card
  |--------------------------------------------------------------------------
  */

  function createStudentCard(student) {

    const card =
      document.createElement("article");

    card.className =
      "stat-card";

    card.dataset.studentId =
      student.id || "";

    /*
     * Header
     */

    const header =
      document.createElement("div");

    header.className =
      "stat-card-header";

    const title =
      document.createElement("h3");

    title.textContent =
      student.name ||
      "Unnamed Learner";

    header.appendChild(title);

    if (student.grade) {

      const badge =
        document.createElement("span");

      badge.className =
        "badge";

      badge.textContent =
        student.grade;

      header.appendChild(badge);
    }

    /*
     * Details
     */

    const details =
      document.createElement("div");

    details.className =
      "stat-card-details";

    const fields = [

      [
        "Admission No.",
        getAdmissionNumber(student)
      ],

      [
        "Gender",
        student.gender
      ],

      [
        "Stream",
        getStream(student)
      ]

    ];

    fields.forEach(
      ([label, value]) => {

        if (!value) {
          return;
        }

        const paragraph =
          document.createElement("p");

        paragraph.textContent =
          `${label}: ${value}`;

        details.appendChild(
          paragraph
        );
      }
    );

    if (student.notes) {

      const notes =
        document.createElement("p");

      notes.textContent =
        `Notes: ${student.notes}`;

      details.appendChild(
        notes
      );
    }

    /*
     * Actions
     */

    const actions =
      document.createElement("div");

    actions.className =
      "card-actions";

    const editButton =
      document.createElement("button");

    editButton.type =
      "button";

    editButton.className =
      "button secondary";

    editButton.textContent =
      "Edit";

    editButton.addEventListener(
      "click",
      () => {
        openStudentForm(student);
      }
    );

    const deleteButton =
      document.createElement("button");

    deleteButton.type =
      "button";

    deleteButton.className =
      "button danger";

    deleteButton.textContent =
      "Delete";

    deleteButton.addEventListener(
      "click",
      () => {
        deleteStudent(student.id);
      }
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
  | Render Students
  |--------------------------------------------------------------------------
  */

  function renderStudentsPage() {

    const list =
      $("studentsList");

    const emptyState =
      $("studentsEmptyState");

    const count =
      $("studentCount");

    if (!list) {
      return;
    }

    const data =
      getData();

    const students =
      getStudents(data)

        .filter(matchesSearch)

        .sort(
          (a, b) =>
            String(
              a.name || ""
            ).localeCompare(
              String(
                b.name || ""
              ),
              undefined,
              {
                sensitivity: "base"
              }
            )
        );

    list.replaceChildren();

    /*
     * Count.
     */

    if (count) {
      count.textContent =
        String(students.length);
    }

    /*
     * Empty state.
     */

    if (students.length === 0) {

      if (emptyState) {

        emptyState.hidden =
          false;

        emptyState.removeAttribute(
          "hidden"
        );
      }

      return;
    }

    /*
     * Hide empty state.
     */

    if (emptyState) {

      emptyState.hidden =
        true;

      emptyState.setAttribute(
        "hidden",
        ""
      );
    }

    /*
     * Render cards.
     */

    const fragment =
      document.createDocumentFragment();

    students.forEach(
      (student) => {

        fragment.appendChild(
          createStudentCard(student)
        );

      }
    );

    list.appendChild(
      fragment
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Delete Learner
  |--------------------------------------------------------------------------
  */

  function deleteStudent(studentId) {

    const API = getAPI();

    if (!API) {
      return;
    }

    const data =
      getData();

    const students =
      getStudents(data);

    const exists =
      students.some(
        (student) =>
          student.id === studentId
      );

    if (!exists) {

      showError(
        "Learner record not found."
      );

      return;
    }

    const confirmed =
      window.confirm(
        "Delete this learner record?"
      );

    if (!confirmed) {
      return;
    }

    data.students =
      students.filter(
        (student) =>
          student.id !== studentId
      );

    if (
      typeof API.saveData !==
        "function" ||
      !API.saveData(data)
    ) {
      return;
    }

    if (
      typeof API.addActivity ===
      "function"
    ) {
      API.addActivity(
        "Deleted learner record"
      );
    }

    if (
      typeof API.refresh ===
      "function"
    ) {
      API.refresh();
    }

    showSuccess(
      "Learner deleted."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Controls
  |--------------------------------------------------------------------------
  */

  function bindStudentControls() {

    const addButton =
      $("addStudentBtn");

    if (addButton) {

      addButton.addEventListener(
        "click",
        () => {

          openStudentForm();

        }
      );
    }

    const cancelButton =
      $("cancelStudentButton");

    if (cancelButton) {

      cancelButton.addEventListener(
        "click",
        closeStudentForm
      );
    }

    const form =
      $("studentForm");

    if (form) {

      form.addEventListener(
        "submit",
        saveStudentFromForm
      );
    }

    const search =
      $("studentSearch");

    if (search) {

      search.addEventListener(
        "input",
        (event) => {

          studentSearchQuery =
            clean(
              event.target.value
            );

          renderStudentsPage();

        }
      );
    }
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

    /*
     * CBCMaster must exist before
     * binding the Students module.
     */

    if (!getAPI()) {

      window.setTimeout(
        initStudentsModule,
        50
      );

      return;
    }

    /*
     * Students HTML must exist before
     * binding controls.
     */

    if (!$("studentsList")) {

      window.setTimeout(
        initStudentsModule,
        100
      );

      return;
    }

    studentsInitialized =
      true;

    bindStudentControls();

    renderStudentsPage();
  }

  /*
  |--------------------------------------------------------------------------
  | Public API
  |--------------------------------------------------------------------------
  */

  window.CBCMasterStudents = {

    render:
      renderStudentsPage,

    open:
      openStudentForm,

    close:
      closeStudentForm,

    delete:
      deleteStudent

  };

  /*
  |--------------------------------------------------------------------------
  | Start
  |--------------------------------------------------------------------------
  */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initStudentsModule,
      {
        once: true
      }
    );

  } else {

    initStudentsModule();

  }

})();
