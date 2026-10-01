"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2
| Report Books Module
|--------------------------------------------------------------------------
| Handles:
| - Create report book
| - Edit report book
| - Delete report book
| - Search report books
| - Local persistence
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Module state
|--------------------------------------------------------------------------
*/

let reportBookSearchQuery = "";


/*
|--------------------------------------------------------------------------
| DOM helper
|--------------------------------------------------------------------------
*/

function reportBook$(selector) {

  return document.querySelector(
    selector
  );

}


/*
|--------------------------------------------------------------------------
| Create Report Book form
|--------------------------------------------------------------------------
*/

function openReportBookForm(
  reportBook = null
) {

  const card =
    reportBook$("#reportBookFormCard");

  const title =
    reportBook$("#reportBookFormTitle");

  const id =
    reportBook$("#reportBookId");

  const name =
    reportBook$("#reportBookTitle");

  const grade =
    reportBook$("#reportBookGrade");

  const term =
    reportBook$("#reportBookTerm");

  const notes =
    reportBook$("#reportBookNotes");


  if (!card) {

    return;

  }


  card.hidden = false;


  if (reportBook) {

    if (title) {

      title.textContent =
        "Edit Report Book";

    }


    if (id) {

      id.value =
        reportBook.id || "";

    }


    if (name) {

      name.value =
        reportBook.title || "";

    }


    if (grade) {

      grade.value =
        reportBook.grade ||
        CBCMaster
          .getData()
          .preferences
          .grade ||
        "Grade 5";

    }


    if (term) {

      term.value =
        reportBook.term ||
        CBCMaster
          .getData()
          .preferences
          .term ||
        "Term 1";

    }


    if (notes) {

      notes.value =
        reportBook.notes || "";

    }

  } else {

    if (title) {

      title.textContent =
        "Create Report Book";

    }


    if (id) {

      id.value = "";

    }


    if (name) {

      name.value = "";

    }


    if (grade) {

      grade.value =
        CBCMaster
          .getData()
          .preferences
          .grade ||
        "Grade 5";

    }


    if (term) {

      term.value =
        CBCMaster
          .getData()
          .preferences
          .term ||
        "Term 1";

    }


    if (notes) {

      notes.value = "";

    }

  }


  if (name) {

    name.focus();

  }

}


/*
|--------------------------------------------------------------------------
| Close Report Book form
|--------------------------------------------------------------------------
*/

function closeReportBookForm() {

  const card =
    reportBook$("#reportBookFormCard");

  const form =
    reportBook$("#reportBookForm");


  if (form) {

    form.reset();

  }


  if (card) {

    card.hidden = true;

  }

}


/*
|--------------------------------------------------------------------------
| Save Report Book
|--------------------------------------------------------------------------
*/

function saveReportBookFromForm(
  event
) {

  event.preventDefault();


  const data =
    CBCMaster.getData();


  const id =
    CBCMaster.cleanDisplayText(
      reportBook$("#reportBookId")?.value
    );


  const title =
    CBCMaster.cleanDisplayText(
      reportBook$("#reportBookTitle")?.value
    );


  const grade =
    CBCMaster.cleanDisplayText(
      reportBook$("#reportBookGrade")?.value,
      data.preferences.grade ||
        "Grade 5"
    );


  const term =
    CBCMaster.cleanDisplayText(
      reportBook$("#reportBookTerm")?.value,
      data.preferences.term ||
        "Term 1"
    );


  const notes =
    CBCMaster.cleanDisplayText(
      reportBook$("#reportBookNotes")?.value
    );


  if (!title) {

    CBCMaster.showToast(
      "Report book title is required.",
      "error"
    );

    return;

  }


  /*
   * Edit
   */

  if (id) {

    const record =
      data.reportBooks.find(
        (item) =>
          item.id === id
      );


    if (!record) {

      CBCMaster.showToast(
        "Report book could not be found.",
        "error"
      );

      return;

    }


    record.title =
      title;


    record.grade =
      grade;


    record.term =
      term;


    record.notes =
      notes;


    record.updatedAt =
      new Date().toISOString();


    CBCMaster.saveData();

    closeReportBookForm();

    CBCMaster.refresh();

    renderReportBooksPage();


    CBCMaster.showToast(
      "Report book updated."
    );


    return;

  }


  /*
   * Create
   */

  const reportBook = {

    id:
      CBCMaster.createId(),

    title,

    grade,

    term,

    notes,

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString()

  };


  data.reportBooks.push(
    reportBook
  );


  CBCMaster.saveData();

  closeReportBookForm();

  CBCMaster.refresh();

  renderReportBooksPage();


  CBCMaster.showToast(
    "Report book created successfully."
  );

}


/*
|--------------------------------------------------------------------------
| Render Report Books
|--------------------------------------------------------------------------
*/

function renderReportBooksPage() {

  const list =
    reportBook$("#reportBooksList");

  const emptyState =
    reportBook$("#reportBooksEmptyState");

  const count =
    reportBook$("#reportBookCount");


  if (!list) {

    return;

  }


  const data =
    CBCMaster.getData();


  const records =
    Array.isArray(
      data.reportBooks
    )
      ? data.reportBooks
      : [];


  const filtered =
    records.filter(
      (record) => {

        if (!reportBookSearchQuery) {

          return true;

        }


        const searchable = [

          record.title,

          record.grade,

          record.term,

          record.notes

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
          reportBookSearchQuery
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
    (record) => {

      list.appendChild(
        createReportBookCard(
          record
        )
      );

    }
  );

}


/*
|--------------------------------------------------------------------------
| Report Book card
|--------------------------------------------------------------------------
*/

function createReportBookCard(
  reportBook
) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "stat-card";


  const title =
    document.createElement(
      "strong"
    );


  title.textContent =
    CBCMaster.cleanDisplayText(
      reportBook.title,
      "Untitled report book"
    );


  const details =
    document.createElement(
      "small"
    );


  const detailsParts = [];


  if (reportBook.grade) {

    detailsParts.push(
      CBCMaster.cleanDisplayText(
        reportBook.grade
      )
    );

  }


  if (reportBook.term) {

    detailsParts.push(
      CBCMaster.cleanDisplayText(
        reportBook.term
      )
    );

  }


  details.textContent =
    detailsParts.join(
      " • "
    );


  const notes =
    document.createElement(
      "p"
    );


  notes.textContent =
    CBCMaster.cleanDisplayText(
      reportBook.notes
    );


  if (!reportBook.notes) {

    notes.hidden = true;

  }


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

      openReportBookForm(
        reportBook
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

      deleteReportBook(
        reportBook.id
      );

    }
  );


  actions.append(
    editButton,
    deleteButton
  );


  card.append(
    title,
    details,
    notes,
    actions
  );


  return card;

}


/*
|--------------------------------------------------------------------------
| Delete Report Book
|--------------------------------------------------------------------------
*/

function deleteReportBook(
  reportBookId
) {

  const data =
    CBCMaster.getData();


  const record =
    data.reportBooks.find(
      (item) =>
        item.id === reportBookId
    );


  if (!record) {

    return;

  }


  const title =
    CBCMaster.cleanDisplayText(
      record.title,
      "this report book"
    );


  const confirmed =
    window.confirm(
      `Delete ${title}?`
    );


  if (!confirmed) {

    return;

  }


  data.reportBooks =
    data.reportBooks.filter(
      (item) =>
        item.id !== reportBookId
    );


  CBCMaster.saveData();

  CBCMaster.refresh();

  renderReportBooksPage();


  CBCMaster.showToast(
    "Report book deleted."
  );

}


/*
|--------------------------------------------------------------------------
| Bind Report Book controls
|--------------------------------------------------------------------------
*/

function bindReportBookControls() {

  const addButton =
    reportBook$("#addReportBookBtn");


  if (addButton) {

    addButton.addEventListener(
      "click",
      () => {

        openReportBookForm();

      }
    );

  }


  const cancelButton =
    reportBook$("#cancelReportBookButton");


  if (cancelButton) {

    cancelButton.addEventListener(
      "click",
      closeReportBookForm
    );

  }


  const form =
    reportBook$("#reportBookForm");


  if (form) {

    form.addEventListener(
      "submit",
      saveReportBookFromForm
    );

  }


  const search =
    reportBook$("#reportBookSearch");


  if (search) {

    search.addEventListener(
      "input",
      () => {

        reportBookSearchQuery =
          CBCMaster
            .cleanDisplayText(
              search.value
            )
            .toLowerCase();


        renderReportBooksPage();

      }
    );

  }

}


/*
|--------------------------------------------------------------------------
| Quick action integration
|--------------------------------------------------------------------------
*/

function bindReportBookQuickAction() {

  document
    .querySelectorAll(
      '[data-action="create-report-book"]'
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            CBCMaster.navigate(
              "report-books"
            );


            openReportBookForm();

          }
        );

      }
    );

}


/*
|--------------------------------------------------------------------------
| Module initialisation
|--------------------------------------------------------------------------
*/

function initReportBooksModule() {

  bindReportBookControls();

  bindReportBookQuickAction();

  renderReportBooksPage();

}


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
    initReportBooksModule,
    {
      once: true
    }
  );

} else {

  initReportBooksModule();

}
