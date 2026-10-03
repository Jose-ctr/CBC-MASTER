"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2
| Local Teacher Profile Module
|--------------------------------------------------------------------------
| Privacy:
| - Teacher profile stays in localStorage
| - No tracking
| - No third-party analytics
| - No external profile requests
|--------------------------------------------------------------------------
*/

(function () {

  const API = window.CBCMaster;

  if (!API) {
    console.error("CBCMaster core is not available.");
    return;
  }

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

  function save(data) {
    API.saveData(data);
  }

  /*
  |--------------------------------------------------------------------------
  | Render profile
  |--------------------------------------------------------------------------
  */

  function render() {

    const data = getData();

    const teacher = data.teacher || {};
    const preferences = data.preferences || {};

    /*
    |--------------------------------------------------------------------------
    | Teacher name
    |--------------------------------------------------------------------------
    */

    const name =
      clean(teacher.name) ||
      "Teacher";

    const teacherName = $("profileTeacherName");

    if (teacherName) {
      teacherName.textContent = name;
    }

    const profileName = $("teacherName");

    if (profileName) {
      profileName.value = teacher.name || "";
    }

    /*
    |--------------------------------------------------------------------------
    | Email
    |--------------------------------------------------------------------------
    */

    const emailInput = $("teacherEmail");

    if (emailInput) {
      emailInput.value = teacher.email || "";
    }

    /*
    |--------------------------------------------------------------------------
    | Phone
    |--------------------------------------------------------------------------
    */

    const phoneInput = $("teacherPhone");

    if (phoneInput) {
      phoneInput.value = teacher.phone || "";
    }

    /*
    |--------------------------------------------------------------------------
    | School
    |--------------------------------------------------------------------------
    */

    const schoolInput = $("teacherSchool");

    if (schoolInput) {
      schoolInput.value = teacher.school || "";
    }

    /*
    |--------------------------------------------------------------------------
    | Grade
    |--------------------------------------------------------------------------
    */

    const gradeInput = $("teacherGrade");

    if (gradeInput) {
      gradeInput.value =
        preferences.grade ||
        teacher.grade ||
        "Grade 5";
    }

    /*
    |--------------------------------------------------------------------------
    | Term
    |--------------------------------------------------------------------------
    */

    const termInput = $("teacherTerm");

    if (termInput) {
      termInput.value =
        preferences.term ||
        teacher.term ||
        "Term 1";
    }

    /*
    |--------------------------------------------------------------------------
    | Academic year
    |--------------------------------------------------------------------------
    */

    const yearInput = $("teacherAcademicYear");

    if (yearInput) {
      yearInput.value =
        preferences.academicYear ||
        teacher.academicYear ||
        new Date().getFullYear();
    }

    /*
    |--------------------------------------------------------------------------
    | Low-data mode
    |--------------------------------------------------------------------------
    */

    const lowDataMode =
      $("lowDataMode");

    if (lowDataMode) {
      lowDataMode.checked =
        Boolean(preferences.lowDataMode);
    }

    /*
    |--------------------------------------------------------------------------
    | Profile initials
    |--------------------------------------------------------------------------
    */

    const avatar =
      $("profileAvatar");

    if (avatar) {
      avatar.textContent =
        getInitials(name);
    }

    /*
    |--------------------------------------------------------------------------
    | Display name elements
    |--------------------------------------------------------------------------
    */

    document
      .querySelectorAll("[data-profile-name]")
      .forEach(function (element) {
        element.textContent = name;
      });
  }

  /*
  |--------------------------------------------------------------------------
  | Initials
  |--------------------------------------------------------------------------
  */

  function getInitials(name) {

    const words =
      clean(name)
        .split(/\s+/)
        .filter(Boolean);

    if (!words.length) {
      return "T";
    }

    if (words.length === 1) {
      return words[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  }

  /*
  |--------------------------------------------------------------------------
  | Save profile
  |--------------------------------------------------------------------------
  */

  function saveProfile(event) {

    if (event) {
      event.preventDefault();
    }

    const data = getData();

    data.teacher =
      data.teacher || {};

    const nameInput =
      $("teacherName");

    const emailInput =
      $("teacherEmail");

    const phoneInput =
      $("teacherPhone");

    const schoolInput =
      $("teacherSchool");

    data.teacher.name =
      nameInput
        ? clean(nameInput.value)
        : data.teacher.name || "Teacher";

    data.teacher.email =
      emailInput
        ? clean(emailInput.value)
        : data.teacher.email || "";

    data.teacher.phone =
      phoneInput
        ? clean(phoneInput.value)
        : data.teacher.phone || "";

    data.teacher.school =
      schoolInput
        ? clean(schoolInput.value)
        : data.teacher.school || "";

    save(data);

    if (typeof API.showToast === "function") {
      API.showToast("Profile saved locally.");
    }

    render();
  }

  /*
  |--------------------------------------------------------------------------
  | Save preferences
  |--------------------------------------------------------------------------
  */

  function savePreferences() {

    const data = getData();

    data.preferences =
      data.preferences || {};

    const gradeInput =
      $("teacherGrade");

    const termInput =
      $("teacherTerm");

    const yearInput =
      $("teacherAcademicYear");

    const lowDataMode =
      $("lowDataMode");

    if (gradeInput) {
      data.preferences.grade =
        clean(gradeInput.value);
    }

    if (termInput) {
      data.preferences.term =
        clean(termInput.value);
    }

    if (yearInput) {
      data.preferences.academicYear =
        numberOrCurrentYear(yearInput.value);
    }

    if (lowDataMode) {
      data.preferences.lowDataMode =
        Boolean(lowDataMode.checked);
    }

    save(data);

    if (typeof API.showToast === "function") {
      API.showToast("Preferences saved locally.");
    }

    render();
  }

  /*
  |--------------------------------------------------------------------------
  | Year helper
  |--------------------------------------------------------------------------
  */

  function numberOrCurrentYear(value) {

    const year =
      Number.parseInt(value, 10);

    if (
      Number.isInteger(year) &&
      year >= 2000 &&
      year <= 2100
    ) {
      return year;
    }

    return new Date().getFullYear();
  }

  /*
  |--------------------------------------------------------------------------
  | Delete local data
  |--------------------------------------------------------------------------
  */

  function deleteLocalData() {

    const confirmed =
      window.confirm(
        "Delete all CBC MASTER data stored on this device? This cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    try {

      localStorage.removeItem(
        API.STORAGE_KEY
      );

      if (typeof API.showToast === "function") {
        API.showToast(
          "Local data deleted."
        );
      }

      window.setTimeout(function () {
        window.location.reload();
      }, 500);

    } catch (error) {

      if (typeof API.showToast === "function") {
        API.showToast(
          "Could not delete local data."
        );
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Export local data
  |--------------------------------------------------------------------------
  */

  function exportData() {

    const data = getData();

    const json =
      JSON.stringify(data, null, 2);

    const blob =
      new Blob(
        [json],
        {
          type: "application/json"
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    const date =
      new Date()
        .toISOString()
        .slice(0, 10);

    link.href = url;

    link.download =
      `cbc-master-backup-${date}.json`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    if (typeof API.showToast === "function") {
      API.showToast(
        "Backup exported."
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Event binding
  |--------------------------------------------------------------------------
  */

  function bindEvents() {

    const profileForm =
      $("profileForm");

    if (profileForm) {
      profileForm.addEventListener(
        "submit",
        saveProfile
      );
    }

    const saveProfileButton =
      $("saveProfileBtn");

    if (saveProfileButton) {
      saveProfileButton.addEventListener(
        "click",
        saveProfile
      );
    }

    const savePreferencesButton =
      $("savePreferencesBtn");

    if (savePreferencesButton) {
      savePreferencesButton.addEventListener(
        "click",
        savePreferences
      );
    }

    const lowDataMode =
      $("lowDataMode");

    if (lowDataMode) {
      lowDataMode.addEventListener(
        "change",
        savePreferences
      );
    }

    const exportButton =
      $("exportDataBtn");

    if (exportButton) {
      exportButton.addEventListener(
        "click",
        exportData
      );
    }

    const deleteButton =
      $("deleteDataBtn");

    if (deleteButton) {
      deleteButton.addEventListener(
        "click",
        deleteLocalData
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Open / close
  |--------------------------------------------------------------------------
  */

  function open() {

    if (typeof API.navigate === "function") {
      API.navigate("profile");
    }

    render();
  }

  function close() {
    // Navigation is handled by CBC MASTER core.
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

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  } else {
    init();
  }

  /*
  |--------------------------------------------------------------------------
  | Public API
  |--------------------------------------------------------------------------
  */

  window.CBCMasterProfile = {
    render,
    open,
    close,
    saveProfile,
    savePreferences,
    exportData,
    deleteLocalData
  };

})();
