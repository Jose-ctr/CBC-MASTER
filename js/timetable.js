"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2
| Live School Timetable
|--------------------------------------------------------------------------
| Local-first timetable UI.
| Uses:
| - CBCMasterTimetableStorage
| - CBCMasterTimetableClock
| - CBCMaster
|--------------------------------------------------------------------------
*/

(function () {

  const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday"
  ];

  let editingId = null;
  let unsubscribeClock = null;
  let initialised = false;

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  function $(id) {
    return document.getElementById(id);
  }

  function storage() {
    return window.CBCMasterTimetableStorage;
  }

  function clock() {
    return window.CBCMasterTimetableClock;
  }

  function app() {
    return window.CBCMaster;
  }

  function escapeText(value) {
    return String(value ?? "");
  }

  function showMessage(message) {
    if (app() && typeof app().showToast === "function") {
      app().showToast(message);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Time formatting
  |--------------------------------------------------------------------------
  */

  function formatTime(value) {
    if (!value) {
      return "";
    }

    const parts = String(value).split(":");

    if (parts.length !== 2) {
      return value;
    }

    let hour = Number(parts[0]);
    const minute = parts[1];

    if (!Number.isFinite(hour)) {
      return value;
    }

    const suffix = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;

    if (hour === 0) {
      hour = 12;
    }

    return `${hour}:${minute} ${suffix}`;
  }

  /*
  |--------------------------------------------------------------------------
  | Form
  |--------------------------------------------------------------------------
  */

  function resetForm() {
    const form = $("timetableForm");

    if (form) {
      form.reset();
    }

    editingId = null;

    const idField = $("timetableId");

    if (idField) {
      idField.value = "";
    }

    const title = $("timetableFormTitle");

    if (title) {
      title.textContent = "Add Timetable Entry";
    }
  }

  function openForm(entry = null) {
    const card = $("timetableFormCard");

    if (!card) {
      return;
    }

    card.hidden = false;

    if (entry) {
      editingId = entry.id;

      $("timetableId").value = entry.id;
      $("timetableDay").value = entry.day || "";
      $("timetableSubject").value = entry.subject || "";
      $("timetableGrade").value = entry.grade || "";
      $("timetableStart").value = entry.start || "";
      $("timetableEnd").value = entry.end || "";
      $("timetableTeacher").value = entry.teacher || "";
      $("timetableRoom").value = entry.room || "";

      const title = $("timetableFormTitle");

      if (title) {
        title.textContent = "Edit Timetable Entry";
      }
    } else {
      resetForm();

      const today = clock()?.getCurrentDay();

      if (DAYS.includes(today)) {
        $("timetableDay").value = today;
      }
    }

    card.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function closeForm() {
    const card = $("timetableFormCard");

    if (card) {
      card.hidden = true;
    }

    resetForm();
  }

  function getFormData() {
    return {
      day: $("timetableDay")?.value || "",
      subject: $("timetableSubject")?.value || "",
      grade: $("timetableGrade")?.value || "",
      start: $("timetableStart")?.value || "",
      end: $("timetableEnd")?.value || "",
      teacher: $("timetableTeacher")?.value || "",
      room: $("timetableRoom")?.value || ""
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Save
  |--------------------------------------------------------------------------
  */

  function handleSubmit(event) {
    event.preventDefault();

    const api = storage();

    if (!api) {
      showMessage("Timetable storage is not ready.");
      return;
    }

    const data = getFormData();

    try {
      if (editingId) {
        api.updateEntry(editingId, data);
        showMessage("Timetable entry updated.");
      } else {
        api.saveEntry(data);
        showMessage("Timetable entry added.");
      }

      closeForm();

      render();

      if (
        app() &&
        typeof app().refresh === "function"
      ) {
        app().refresh();
      }

    } catch (error) {
      showMessage(
        error?.message ||
        "Could not save timetable entry."
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

  function deleteEntry(id) {
    const api = storage();

    if (!api || !id) {
      return;
    }

    const entries = api.getEntries();

    const entry = entries.find(
      (item) => item.id === id
    );

    if (!entry) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${entry.subject}" from the timetable?`
    );

    if (!confirmed) {
      return;
    }

    try {
      api.deleteEntry(id);

      showMessage("Timetable entry deleted.");

      render();

      if (
        app() &&
        typeof app().refresh === "function"
      ) {
        app().refresh();
      }

    } catch (error) {
      showMessage(
        error?.message ||
        "Could not delete timetable entry."
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Lesson card
  |--------------------------------------------------------------------------
  */

  function createLessonCard(entry) {
    const article = document.createElement("article");

    article.className = "timetable-entry";

    article.dataset.id = entry.id;

    const main = document.createElement("div");
    main.className = "timetable-entry-main";

    const subject = document.createElement("h3");
    subject.textContent = escapeText(entry.subject);

    const details = document.createElement("p");

    const detailsParts = [
      entry.grade,
      entry.teacher,
      entry.room
    ].filter(Boolean);

    details.textContent =
      detailsParts.join(" • ");

    const time = document.createElement("div");

    time.className = "timetable-entry-time";

    time.textContent =
      `${formatTime(entry.start)} – ${formatTime(entry.end)}`;

    main.appendChild(subject);

    if (details.textContent) {
      main.appendChild(details);
    }

    main.appendChild(time);

    const actions = document.createElement("div");

    actions.className = "timetable-entry-actions";

    const editButton = document.createElement("button");

    editButton.type = "button";
    editButton.className = "button secondary";
    editButton.textContent = "Edit";

    editButton.addEventListener(
      "click",
      () => openForm(entry)
    );

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "button danger";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener(
      "click",
      () => deleteEntry(entry.id)
    );

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    article.appendChild(main);
    article.appendChild(actions);

    return article;
  }

  /*
  |--------------------------------------------------------------------------
  | Weekly timetable
  |--------------------------------------------------------------------------
  */

  function renderWeeklyList() {
    const list = $("timetableList");
    const empty = $("timetableEmptyState");

    if (!list) {
      return;
    }

    list.replaceChildren();

    const entries = storage()
      ? storage().getEntries()
      : [];

    if (!entries.length) {
      if (empty) {
        empty.hidden = false;
      }

      return;
    }

    if (empty) {
      empty.hidden = true;
    }

    DAYS.forEach((day) => {

      const dayEntries = entries
        .filter((entry) => entry.day === day)
        .sort((a, b) => {
          return (
            (clock().timeToMinutes(a.start) ?? 9999) -
            (clock().timeToMinutes(b.start) ?? 9999)
          );
        });

      if (!dayEntries.length) {
        return;
      }

      const section = document.createElement("section");

      section.className =
        "timetable-day-section";

      const heading = document.createElement("h3");

      heading.className =
        "timetable-day-title";

      heading.textContent = day;

      section.appendChild(heading);

      dayEntries.forEach((entry) => {
        section.appendChild(
          createLessonCard(entry)
        );
      });

      list.appendChild(section);
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Current lesson
  |--------------------------------------------------------------------------
  */

  function renderLiveState() {
    const api = storage();
    const time = clock();

    if (!api || !time) {
      return;
    }

    const result =
      time.getCurrentAndNext(
        api.getEntries()
      );

    const current = result.current;
    const next = result.next;

    /*
    |--------------------------------------------------------------------------
    | Timetable page
    |--------------------------------------------------------------------------
    */

    const liveClock = $("timetableLiveClock");

    if (liveClock) {
      liveClock.textContent =
        time.formatClock();
    }

    const currentLesson =
      $("timetableCurrentLesson");

    const currentDetails =
      $("timetableCurrentDetails");

    const currentCountdown =
      $("timetableCountdown");

    if (current) {

      if (currentLesson) {
        currentLesson.textContent =
          current.subject;
      }

      if (currentDetails) {
        currentDetails.textContent =
          [
            current.grade,
            current.teacher,
            current.room
          ]
            .filter(Boolean)
            .join(" • ");
      }

      if (currentCountdown) {
        currentCountdown.textContent =
          `${time.formatCountdown(
            time.getSecondsUntilEnd(current)
          )} remaining`;
      }

    } else {

      if (currentLesson) {
        currentLesson.textContent =
          "No lesson in progress";
      }

      if (currentDetails) {
        currentDetails.textContent =
          next
            ? `Next: ${next.subject} at ${formatTime(next.start)}`
            : "No more lessons today";
      }

      if (currentCountdown) {
        currentCountdown.textContent =
          next
            ? `Starts in ${time.formatCountdown(
                time.getSecondsUntilStart(next)
              )}`
            : "School timetable is clear";
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    const dashboardClock =
      $("liveClock");

    if (dashboardClock) {
      dashboardClock.textContent =
        time.formatClock();
    }

    const dashboardDate =
      $("liveDate");

    if (dashboardDate) {
      dashboardDate.textContent =
        time.formatDate();
    }

    const currentName =
      $("currentLessonName");

    const currentDetailsDashboard =
      $("currentLessonDetails");

    const currentCountdownDashboard =
      $("currentLessonCountdown");

    if (current) {

      if (currentName) {
        currentName.textContent =
          current.subject;
      }

      if (currentDetailsDashboard) {
        currentDetailsDashboard.textContent =
          [
            current.grade,
            current.teacher,
            current.room
          ]
            .filter(Boolean)
            .join(" • ");
      }

      if (currentCountdownDashboard) {
        currentCountdownDashboard.textContent =
          `${time.formatCountdown(
            time.getSecondsUntilEnd(current)
          )} remaining`;
      }

    } else {

      if (currentName) {
        currentName.textContent =
          "No lesson in progress";
      }

      if (currentDetailsDashboard) {
        currentDetailsDashboard.textContent =
          next
            ? `Next: ${next.subject} at ${formatTime(next.start)}`
            : "No more lessons today";
      }

      if (currentCountdownDashboard) {
        currentCountdownDashboard.textContent =
          next
            ? `Starts in ${time.formatCountdown(
                time.getSecondsUntilStart(next)
              )}`
            : "Timetable clear";
      }
    }

    const nextName =
      $("nextLessonName");

    const nextDetails =
      $("nextLessonDetails");

    if (next) {

      if (nextName) {
        nextName.textContent =
          next.subject;
      }

      if (nextDetails) {
        nextDetails.textContent =
          [
            next.grade,
            formatTime(next.start),
            next.teacher,
            next.room
          ]
            .filter(Boolean)
            .join(" • ");
      }

    } else {

      if (nextName) {
        nextName.textContent =
          "No more lessons";
      }

      if (nextDetails) {
        nextDetails.textContent =
          "The school timetable is clear for today.";
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Highlight current lesson
  |--------------------------------------------------------------------------
  */

  function highlightCurrentEntry() {
    const api = storage();
    const time = clock();

    if (!api || !time) {
      return;
    }

    const result =
      time.getCurrentAndNext(
        api.getEntries()
      );

    const current = result.current;

    document
      .querySelectorAll(".timetable-entry")
      .forEach((element) => {

        const isCurrent =
          current &&
          element.dataset.id === current.id;

        element.classList.toggle(
          "is-current",
          Boolean(isCurrent)
        );
      });
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  function render() {
    renderWeeklyList();
    renderLiveState();
    highlightCurrentEntry();
  }

  /*
  |--------------------------------------------------------------------------
  | Events
  |--------------------------------------------------------------------------
  */

  function bindEvents() {

    if (initialised) {
      return;
    }

    initialised = true;

    const addButton =
      $("addTimetableEntryBtn");

    if (addButton) {
      addButton.addEventListener(
        "click",
        () => openForm()
      );
    }

    const cancelButton =
      $("cancelTimetableButton");

    if (cancelButton) {
      cancelButton.addEventListener(
        "click",
        closeForm
      );
    }

    const form =
      $("timetableForm");

    if (form) {
      form.addEventListener(
        "submit",
        handleSubmit
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Start Kenya clock updates
    |--------------------------------------------------------------------------
    */

    const time = clock();

    if (time) {

      unsubscribeClock =
        time.subscribe(() => {

          renderLiveState();
          highlightCurrentEntry();

        });

      time.start();
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Open / close
  |--------------------------------------------------------------------------
  */

  function open() {
    const page = $("timetablePage");

    if (!page) {
      return;
    }

    page.hidden = false;

    render();
  }

  function close() {
    const form = $("timetableFormCard");

    if (form) {
      form.hidden = true;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Initialise
  |--------------------------------------------------------------------------
  */

  function init() {
    bindEvents();
    render();
  }

  /*
  |--------------------------------------------------------------------------
  | Public API
  |--------------------------------------------------------------------------
  */

  window.CBCMasterTimetable = {
    init,
    render,
    open,
    close,
    delete: deleteEntry
  };

  /*
  |--------------------------------------------------------------------------
  | Start when the document is ready
  |--------------------------------------------------------------------------
  */

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );

  } else {

    init();

  }

})();
