"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2
| Students Module
|--------------------------------------------------------------------------
| Handles:
| - Add learner
| - Edit learner
| - Delete learner
| - Search learners
| - Render learner records
|
| Data remains in the local CBC MASTER workspace.
|--------------------------------------------------------------------------
*/

(function () {

  /*
  |--------------------------------------------------------------------------
  | Module state
  |--------------------------------------------------------------------------
  */

  let studentSearchQuery = "";
  let studentsInitialized = false;


  /*
  |--------------------------------------------------------------------------
  | DOM helper
  |--------------------------------------------------------------------------
  */

  function $(id) {

    const API = window.CBCMaster;

    if (
      API &&
      typeof API.$ === "function"
    ) {
      return API.$(id);
    }

    return document.getElementById(id);
  }


  /*
  |--------------------------------------------------------------------------
  | API helper
  |--------------------------------------------------------------------------
  */

  function getAPI() {
    return window.CBCMaster || null;
  }


  /*
  |--------------------------------------------------------------------------
  | Data
  |--------------------------------------------------------------------------
  */

  function getData() {

    const API = getAPI();

    if (
      !API ||
      typeof API.getData !== "function"
    ) {
      return {
        students: [],
        preferences: {}
      };
    }

    return API.getData();
  }


  /*
  |--------------------------------------------------------------------------
  | Text cleaning
  |--------------------------------------------------------------------------
  */

  function clean(value) {

    const API = getAPI();

    if (
      API &&
      typeof API.cleanDisplayText === "function"
    ) {
      return API.cleanDisplayText(value);
    }

    return String(value ?? "")
      .replace(/\s+/g, " ")
      .trim();
  }


  /*
  |--------------------------------------------------------------------------
  | Toast helpers
  |--------------------------------------------------------------------------
  */

  function showError(message) {

    const API = getAPI();

    if (
      API &&
      typeof API.showToast === "function"
    ) {
      API.showToast(message, true);
      return;
    }

    window.alert(message);
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
  | Student collection
  |--------------------------------------------------------------------------
  */

  function getStudents(data) {

    if (!Array.isArray(data.students)) {
      data.students = [];
    }

    return data.students;
  }


  /*
  |--------------------------------------------------------------------------
  | Admission number
  |--------------------------------------------------------------------------
  */

  function getAdmissionNumber(student) {

    return (
      student.admissionNumber ||
      student.admNo ||
      ""
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Stream
  |--------------------------------------------------------------------------
  */

  function getStream(student) {

    return (
      student.stream ||
      student.className ||
      ""
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Open Add/Edit Learner Form
  |--------------------------------------------------------------------------
  */

  function openStudentForm(student = null) {

    const card =
      $("studentFormCard");

    const form =
      $("studentForm");

    if (!card || !form) {

      showError(
        "Learner form could not be found."
      );

      return false;
    }


    const title =
      $("studentFormTitle");

    const idField =
      $("studentId");

    const nameField =
      $("studentName");

    const admissionField =
      $("studentAdmNo");

    const genderField =
      $("studentGender");

    const gradeField =
      $("studentGrade");

    const streamField =
      $("studentStream");

    const notesField =
      $("studentNotes");


    /*
     * Reset first.
     */

    form.reset();


    /*
     * Editing existing learner.
     */

    if (student) {

      if (title) {
        title.textContent =
          "Edit Learner";
      }

      if (idField) {
        idField.value =
          student.id || "";
      }

      if (nameField) {
        nameField.value =
          student.name || "";
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

      /*
       * Adding new learner.
       */

      if (title) {
        title.textContent =
          "Add Learner";
      }

      if (idField) {
        idField.value = "";
      }

      if (nameField) {
        nameField.value = "";
      }

      if (admissionField) {
        admissionField.value = "";
      }

      if (genderField) {
        genderField.value = "";
      }

      if (streamField) {
        streamField.value = "";
      }

      if (notesField) {
        notesField.value = "";
      }


      const data =
        getData();

      const defaultGrade =
        data.preferences &&
        data.preferences.grade
          ? data.preferences.grade
          : "Grade 5";

      if (gradeField) {
        gradeField.value =
          defaultGrade;
      }
    }


    /*
     * Show form.
     */

    card.hidden = false;
    card.removeAttribute("hidden");


    /*
     * Scroll into view.
     */

    window.setTimeout(() => {

      try {

        card.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      } catch (_) {
        /* Ignore scroll errors. */
      }


      if (nameField) {
        nameField.focus();
      }

    }, 50);


    return true;
  }


  /*
  |--------------------------------------------------------------------------
  | Close form
  |--------------------------------------------------------------------------
  */

  function closeStudentForm() {

    const card =
      $("studentFormCard");

    const form =
      $("studentForm");


    if (form) {
      form.reset();
    }


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
  | Save learner
  |--------------------------------------------------------------------------
  */

  function saveStudentFromForm(event) {

    event.preventDefault();


    const API =
      getAPI();

    if (!API) {

      showError(
        "CBC MASTER is still loading. Please try again."
      );

      return;
    }


    const data =
      getData();

    const students =
      getStudents(data);


    /*
     * Read current form.
     */

    const id =
      clean(
        $("studentId")?.value
      );

    const name =
      clean(
        $("studentName")?.value
      );

    const admissionNumber =
      clean(
        $("studentAdmNo")?.value
      );

    const gender =
      clean(
        $("studentGender")?.value
      );

    const grade =
      clean(
        $("studentGrade")?.value
      );

    const stream =
      clean(
        $("studentStream")?.value
      );

    const notes =
      clean(
        $("studentNotes")?.value
      );


    /*
     * Name is required.
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
          "Updated learner record"
        );
      }


      closeStudentForm();


      if (
        typeof API.refresh ===
        "function"
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

    const idValue =
      typeof API.createId ===
      "function"
        ? API.createId("student")
        : `student-${Date.now()}`;


    students.push({

      id: idValue,

      name,

      admissionNumber,

      gender,

      grade,

      stream,

      notes,

      createdAt: now,

      updatedAt: now

    });


    /*
     * IMPORTANT:
     * Pass the modified data object.
     */

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
        "Added learner record"
      );
    }


    closeStudentForm();


    if (
      typeof API.refresh ===
      "function"
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

      getAdmissionNumber(
        student
      ),

      student.gender,

      student.grade,

      getStream(
        student
      ),

      student.notes

    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();


    return searchableText.includes(
      studentSearchQuery
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Create learner card
  |--------------------------------------------------------------------------
  */

  function createStudentCard(student) {

    const card =
      document.createElement(
        "article"
      );

    card.className =
      "stat-card";

    card.dataset.studentId =
      student.id || "";


    /*
     * Header.
     */

    const header =
      document.createElement(
        "div"
      );

    header.className =
      "stat-card-header";


    const title =
      document.createElement(
        "h3"
      );

    title.textContent =
      student.name ||
      "Unnamed Learner";


    header.appendChild(
      title
    );


    /*
     * Grade badge.
     */

    if (student.grade) {

      const badge =
        document.createElement(
          "span"
        );

      badge.className =
        "badge";

      badge.textContent =
        student.grade;

      header.appendChild(
        badge
      );
    }


    /*
     * Details.
     */

    const details =
      document.createElement(
        "div"
      );

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
          document.createElement(
            "p"
          );

        paragraph.textContent =
          `${label}: ${value}`;


        details.appendChild(
          paragraph
        );
      }
    );


    /*
     * Notes.
     */

    if (student.notes) {

      const notes =
        document.createElement(
          "p"
        );

      notes.textContent =
        `Notes: ${student.notes}`;


      details.appendChild(
        notes
      );
    }


    /*
     * Actions.
     */

    const actions =
      document.createElement(
        "div"
      );

    actions.className =
      "card-actions";


    /*
     * Edit.
     */

    const editButton =
      document.createElement(
        "button"
      );

    editButton.type =
      "button";

    editButton.className =
      "button secondary";

    editButton.textContent =
      "Edit";


    editButton.addEventListener(
      "click",
      () => {

        openStudentForm(
          student
        );

      }
    );


    /*
     * Delete.
     */

    const deleteButton =
      document.createElement(
        "button"
      );

    deleteButton.type =
      "button";

    deleteButton.className =
      "button danger";

    deleteButton.textContent =
      "Delete";


    deleteButton.addEventListener(
      "click",
      () => {

        deleteStudent(
          student.id
        );

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
  | Render students
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
        .filter(
          matchesSearch
        )
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
                sensitivity:
                  "base"
              }
            )
        );


    list.replaceChildren();


    /*
     * Count.
     */

    if (count) {

      count.textContent =
        String(
          students.length
        );
    }


    /*
     * Empty state.
     */

    if (
      students.length === 0
    ) {

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
          createStudentCard(
            student
          )
        );

      }
    );


    list.appendChild(
      fragment
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Delete learner
  |--------------------------------------------------------------------------
  */

  function deleteStudent(
    studentId
  ) {

    const API =
      getAPI();

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
          student.id ===
          studentId
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
          student.id !==
          studentId
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
  | Bind controls
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
            ).toLowerCase();


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


    const API =
      getAPI();


    if (!API) {

      window.setTimeout(
        initStudentsModule,
        50
      );

      return;
    }


    /*
     * Wait until the Students HTML
     * exists.
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
  | Public Students API
  |--------------------------------------------------------------------------
  */

  window.CBCMasterStudents =
    Object.freeze({

      render:
        renderStudentsPage,

      open:
        openStudentForm,

      close:
        closeStudentForm,

      delete:
        deleteStudent

    });


  /*
  |--------------------------------------------------------------------------
  | Start module
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
