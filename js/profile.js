"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2
| Local Profile Module
|--------------------------------------------------------------------------
| Privacy:
| - Teacher profile stays on this device
| - No external requests
| - No tracking
| - No personal-data transmission
|--------------------------------------------------------------------------
*/

(function () {

  const API = window.CBCMaster;

  if (!API) {
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

  function setValue(id, value) {
    const element = $(id);

    if (element) {
      element.value = value ?? "";
    }
  }

  function setText(id, value) {
    const element = $(id);

    if (element) {
      element.textContent = value ?? "";
    }
  }

  function getValue(id) {
    const element = $(id);

    return element
      ? String(element.value || "").trim()
      : "";
  }

  function showToast(message) {
    if (typeof API.showToast === "function") {
      API.showToast(message);
    }
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

    const teacherName =
      teacher.name ||
      "Teacher";

    const school =
      teacher.school ||
      "";

    const county =
      teacher.county ||
      "";

    const role =
      teacher.role ||
      "Teacher";

    const grade =
      preferences.grade ||
      "Grade 5";

    const term =
      preferences.term ||
      "Term 1";

    const academicYear =
      preferences.academicYear ||
      "2026";

    /*
    |--------------------------------------------------------------------------
    | Profile summary
    |--------------------------------------------------------------------------
    */

    setText(
      "profileDisplayName",
      teacherName
    );

    setText(
      "profileDisplaySchool",
      school || "School not set"
    );

    setText(
      "profileDisplayCounty",
      county || "County not set"
    );

    /*
    |--------------------------------------------------------------------------
    | Avatar
    |--------------------------------------------------------------------------
    */

    const avatar = $("profileAvatar");

    if (avatar) {

      const initial =
        teacherName
          .trim()
          .charAt(0)
          .toUpperCase() || "T";

      avatar.textContent = initial;
    }

    /*
    |--------------------------------------------------------------------------
    | Teacher form
    |--------------------------------------------------------------------------
    */

    setValue(
      "profileTeacherName",
      teacherName === "Teacher"
        ? ""
        : teacherName
    );

    setValue(
      "profileSchool",
      school
    );

    setValue(
      "profileCounty",
      county
    );

    setValue(
      "profileRole",
      role
    );

    /*
    |--------------------------------------------------------------------------
    | Preferences form
    |--------------------------------------------------------------------------
    */

    setValue(
      "profileGrade",
      grade
    );

    setValue(
      "profileTerm",
      term
    );

    setValue(
      "profileAcademicYear",
      academicYear
    );

    /*
    |--------------------------------------------------------------------------
    | Workspace summary
    |--------------------------------------------------------------------------
    */

    setText(
      "profileSummaryGrade",
      grade
    );

    setText(
      "profileSummaryTerm",
      term
    );

    setText(
      "profileSummaryYear",
      academicYear
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Save teacher profile
  |--------------------------------------------------------------------------
  */

  function saveTeacherProfile(event) {

    if (event) {
      event.preventDefault();
    }

    const name = getValue("profileTeacherName");
    const school = getValue("profileSchool");
    const county = getValue("profileCounty");
    const role = getValue("profileRole");

    if (!name) {
      showToast("Please enter your name.");
      return;
    }

    if (typeof API.updateTeacher === "function") {

      API.updateTeacher({
        name,
        school,
        county,
        role: role || "Teacher"
      });

    } else {

      const data = getData();

      data.teacher = {
        ...(data.teacher || {}),
        name,
        school,
        county,
        role: role || "Teacher"
      };

      API.saveData(data);
    }

    render();

    showToast("Profile saved.");
  }

  /*
  |--------------------------------------------------------------------------
  | Save workspace preferences
  |--------------------------------------------------------------------------
  */

  function savePreferences(event) {

    if (event) {
      event.preventDefault();
    }

    const grade = getValue("profileGrade");
    const term = getValue("profileTerm");
    const academicYear =
      getValue("profileAcademicYear");

    if (typeof API.updatePreferences === "function") {

      API.updatePreferences({
        grade: grade || "Grade 5",
        term: term || "Term 1",
        academicYear: academicYear || "2026"
      });

    } else {

      const data = getData();

      data.preferences = {
        ...(data.preferences || {}),
        grade: grade || "Grade 5",
        term: term || "Term 1",
        academicYear: academicYear || "2026"
      };

      API.saveData(data);
    }

    render();

    showToast("Workspace preferences saved.");
  }

  /*
  |--------------------------------------------------------------------------
  | Reset profile
  |--------------------------------------------------------------------------
  */

  function resetProfile() {

    const confirmed = window.confirm(
      "Reset the teacher profile and workspace preferences to their defaults?"
    );

    if (!confirmed) {
      return;
    }

    const data = getData();

    data.teacher = {
      name: "Teacher",
      school: "",
      county: "",
      role: "Teacher"
    };

    data.preferences = {
      ...(data.preferences || {}),
      grade: "Grade 5",
      term: "Term 1",
      academicYear: "2026"
    };

    API.saveData(data);

    render();

    showToast("Profile reset.");
  }

  /*
  |--------------------------------------------------------------------------
  | Event binding
  |--------------------------------------------------------------------------
  */

  function bindEvents() {

    const profileForm = $("profileForm");

    if (profileForm) {

      profileForm.addEventListener(
        "submit",
        saveTeacherProfile
      );
    }

    const preferencesForm =
      $("profilePreferencesForm");

    if (preferencesForm) {

      preferencesForm.addEventListener(
        "submit",
        savePreferences
      );
    }

    const resetButton =
      $("resetProfileButton");

    if (resetButton) {

      resetButton.addEventListener(
        "click",
        resetProfile
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

  /*
  |--------------------------------------------------------------------------
  | Public API
  |--------------------------------------------------------------------------
  */

  window.CBCMasterProfile = {
    render,
    open,
    close,
    saveTeacherProfile,
    savePreferences,
    resetProfile
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {
      once: true
    });
  } else {
    init();
  }

})();
