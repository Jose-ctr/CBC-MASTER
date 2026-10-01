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


/*
|--------------------------------------------------------------------------
| Module state
|--------------------------------------------------------------------------
*/

let studentSearchQuery = "";


/*
|--------------------------------------------------------------------------
| DOM helper
|--------------------------------------------------------------------------
*/

function student$(selector) {

  return document.querySelector(
    selector
  );

}


/*
|--------------------------------------------------------------------------
| Open student form
|--------------------------------------------------------------------------
*/

function openStudentForm(
  student = null
) {

  const card =
    student$("#studentFormCard");

  const formTitle =
    student$("#studentFormTitle");

  const id =
    student$("#studentId");

  const name =
    student$("#studentName");

  const admission =
    student$("#studentAdmissionNumber");

  const grade =
    student$("#studentGrade");

  const className =
    student$("#studentClass");


  if (!card) {

    return;

  }


  card.hidden = false;


  if (student) {

    if (formTitle) {

      formTitle.textContent =
        "Edit Learner";

    }


    if (id) {

      id.value =
        student.id || "";

    }


    if (name) {

      name.value =
        student.name || "";

    }


    if (admission) {

      admission.value =
        student.admissionNumber || "";

    }


    if (grade) {

      grade.value =
        student.grade ||
        CBCMaster
          .getData()
          .preferences
          .grade ||
        "Grade 5";

    }


    if (className) {

      className.value =
        student.className || "";

    }

  } else {

    if (formTitle) {

      formTitle.textContent =
        "Add Learner";

    }


    if (id) {

      id.value = "";

    }


    if (name) {

      name.value = "";

    }


    if (admission) {

      admission.value = "";

    }


    if (grade) {

      grade.value =
        CBCMaster
          .getData()
          .preferences
          .grade ||
        "Grade 5";

    }


    if (className) {

      className.value = "";

    }

  }


  if (name) {

    name.focus();

  }

}


/*
|--------------------------------------------------------------------------
| Close student form
|--------------------------------------------------------------------------
*/

function closeStudentForm() {

  const card =
    student$("#studentFormCard");

  const form =
    student$("#studentForm");


  if (form) {

    form.reset();

  }


  if (card) {

    card.hidden = true;

  }

}


/*
|--------------------------------------------------------------------------
| Save student form
|--------------------------------------------------------------------------
*/

function saveStudentFromForm(
  event
) {

  event.preventDefault();


  const data =
    CBCMaster.getData();


  const id =
    CBCMaster.cleanDisplayText(
      student$("#studentId")?.value
    );


  const name =
    CBCMaster.cleanDisplayText(
      student$("#studentName")?.value
    );


  const admissionNumber =
    CBCMaster.cleanDisplayText(
      student$("#studentAdmissionNumber")
        ?.value
    );


  const grade =
    CBCMaster.cleanDisplayText(
      student$("#studentGrade")?.value,
      data.preferences.grade ||
        "Grade 5"
    );


  const className =
    CBCMaster.cleanDisplayText(
      student$("#studentClass")?.value
    );


  if (!name) {

    CBCMaster.showToast(
      "Learner name is required.",
      "error"
    );

    return;

  }


  /*
   * Edit existing learner
   */

  if (id) {

    const student =
      data.students.find(
        (item) =>
          item.id === id
      );


    if (!student) {

      CBCMaster.showToast(
        "Learner record could not be found.",
        "error"
      );

      return;

    }


    student.name =
      name;


    student.admissionNumber =
      admissionNumber;


    student.grade =
      grade;


    student.className =
      className;


    student.updatedAt =
      new Date().toISOString();


    CBCMaster.saveData();

    closeStudentForm();

    CBCMaster.refresh();

    renderStudentsPage();


    CBCMaster.showToast(
      "Learner record updated."
    );


    return;

  }


  /*
   * Add new learner
   */

  const student = {

    id:
      CBCMaster.createId(),

    name,

    admissionNumber,

    grade,

    className,

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString()

  };


  data.students.push(
    student
  );


  CBCMaster.saveData();

  closeStudentForm();

  CBCMaster.refresh();

  renderStudentsPage();


  CBCMaster.showToast(
    "Learner added successfully."
  );

}


/*
|--------------------------------------------------------------------------
| Render students
|--------------------------------------------------------------------------
*/

function renderStudentsPage() {

  const list =
    student$("#studentsList");

  const emptyState =
    student$("#studentsEmptyState");

  const count =
    student$("#studentCount");


  if (!list) {

    return;

  }


  const data =
    CBCMaster.getData();


  const students =
    Array.isArray(data.students)
      ? data.students
      : [];


  const filtered =
    students.filter(
      (student) => {

        if (!studentSearchQuery) {

          return true;

        }


        const searchable = [

          student.name,

          student.admissionNumber,

          student.grade,

          student.className

        ]
          .map(
            (value) =>
              CBCMaster
                .cleanDisplayText(
                  value
                )
                .toLowerCase()
          )
          .join(" ");


        return searchable.includes(
          studentSearchQuery
        );

      }
    );


  list.replaceChildren();


  if (count) {

    count.textContent =
      String(
        filtered.length
      );

  }


  if (!filtered.length) {

    if (emptyState) {

      emptyState.hidden =
        false;

    }


    return;

  }


  if (emptyState) {

    emptyState.hidden =
      true;

  }


  filtered.forEach(
    (student) => {

      list.appendChild(
        createStudentCard(
          student
        )
      );

    }
  );

}


/*
|--------------------------------------------------------------------------
| Create student card
|--------------------------------------------------------------------------
*/

function createStudentCard(
  student
) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "stat-card";


  const name =
    document.createElement(
      "strong"
    );


  name.textContent =
    CBCMaster.cleanDisplayText(
      student.name,
      "Unnamed learner"
    );


  const details =
    document.createElement(
      "small"
    );


  const detailsParts = [];


  if (student.grade) {

    detailsParts.push(
      CBCMaster.cleanDisplayText(
        student.grade
      )
    );

  }


  if (student.className) {

    detailsParts.push(
      CBCMaster.cleanDisplayText(
        student.className
      )
    );

  }


  if (student.admissionNumber) {

    detailsParts.push(
      `Admission: ${
        CBCMaster.cleanDisplayText(
          student.admissionNumber
        )
      }`
    );

  }


  details.textContent =
    detailsParts.join(
      " • "
    );


  const actions =
    document.createElement(
      "div"
    );


  actions.className =
    "form-actions";


  const editButton =
    document.createElement(
      "button"
    );


  editButton.type =
    "button";


  editButton.className =
    "btn btn-secondary";


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


  const deleteButton =
    document.createElement(
      "button"
    );


  deleteButton.type =
    "button";


  deleteButton.className =
    "btn btn-danger";


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
    name,
    details,
    actions
  );


  return card;

}


/*
|--------------------------------------------------------------------------
| Delete student
|--------------------------------------------------------------------------
*/

function deleteStudent(
  studentId
) {

  const data =
    CBCMaster.getData();


  const student =
    data.students.find(
      (item) =>
        item.id === studentId
    );


  if (!student) {

    return;

  }


  const studentName =
    CBCMaster.cleanDisplayText(
      student.name,
      "this learner"
    );


  const confirmed =
    window.confirm(
      `Delete ${studentName}'s learner record?`
    );


  if (!confirmed) {

    return;

  }


  data.students =
    data.students.filter(
      (item) =>
        item.id !== studentId
    );


  CBCMaster.saveData();

  CBCMaster.refresh();

  renderStudentsPage();


  CBCMaster.showToast(
    "Learner record deleted."
  );

}


/*
|--------------------------------------------------------------------------
| Bind student controls
|--------------------------------------------------------------------------
*/

function bindStudentControls() {

  const addButton =
    student$("#addStudentBtn");


  if (addButton) {

    addButton.addEventListener(
      "click",
      () => {

        openStudentForm();

      }
    );

  }


  const cancelButton =
    student$("#cancelStudentButton");


  if (cancelButton) {

    cancelButton.addEventListener(
      "click",
      closeStudentForm
    );

  }


  const form =
    student$("#studentForm");


  if (form) {

    form.addEventListener(
      "submit",
      saveStudentFromForm
    );

  }


  const search =
    student$("#studentSearch");


  if (search) {

    search.addEventListener(
      "input",
      () => {

        studentSearchQuery =
          CBCMaster
            .cleanDisplayText(
              search.value
            )
            .toLowerCase();


        renderStudentsPage();

      }
    );

  }

}


/*
|--------------------------------------------------------------------------
| Students module initialisation
|--------------------------------------------------------------------------
*/

function initStudentsModule() {

  bindStudentControls();

  renderStudentsPage();

}


/*
|--------------------------------------------------------------------------
| Start Students module
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
