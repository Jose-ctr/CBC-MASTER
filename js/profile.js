"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2
| Teacher Profile Module
|--------------------------------------------------------------------------
| Local-first
| No external requests
| No personal-data logging
|--------------------------------------------------------------------------
*/

(() => {
  const CBC = window.CBCMaster;

  if (!CBC) {
    return;
  }

  const $ = (selector) =>
    document.querySelector(selector);

  /*
  |--------------------------------------------------------------------------
  | Render profile
  |--------------------------------------------------------------------------
  */

  function renderProfilePage() {
    const data = CBC.getData();
    const teacher = data.teacher || {};
    const preferences =
      data.preferences || {};

    setValue(
      "#profileTeacherName",
      teacher.name || ""
    );

    setValue(
      "#profileSchool",
      teacher.school || ""
    );

    setValue(
      "#profileCounty",
      teacher.county || ""
    );

    setValue(
      "#profileRole",
      teacher.role ||
        "CBC MASTER User"
    );

    setValue(
      "#profileGrade",
      preferences.grade ||
        "Grade 5"
    );

    setValue(
      "#profileTerm",
      preferences.term ||
        "Term 1"
    );

    setValue(
      "#profileAcademicYear",
      preferences.academicYear ||
        "2026"
    );

    updateProfileSummary(
      teacher,
      preferences
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Set input value
  |--------------------------------------------------------------------------
  */

  function setValue(
    selector,
    value
  ) {
    const element = $(selector);

    if (!element) {
      return;
    }

    element.value = value;
  }

  /*
  |--------------------------------------------------------------------------
  | Profile summary
  |--------------------------------------------------------------------------
  */

  function updateProfileSummary(
    teacher,
    preferences
  ) {
    const name =
      CBC.cleanDisplayText(
        teacher.name ||
          "Teacher"
      );

    const school =
      CBC.cleanDisplayText(
        teacher.school ||
          "School not set"
      );

    const county =
      CBC.cleanDisplayText(
        teacher.county ||
          "County not set"
      );

    const nameElement =
      $("#profileDisplayName");

    const schoolElement =
      $("#profileDisplaySchool");

    const countyElement =
      $("#profileDisplayCounty");

    const avatar =
      $("#profileAvatar");

    if (nameElement) {
      nameElement.textContent =
        name;
    }

    if (schoolElement) {
      schoolElement.textContent =
        school;
    }

    if (countyElement) {
      countyElement.textContent =
        county;
    }

    if (avatar) {
      avatar.textContent =
        getInitials(name);
    }

    const gradeElement =
      $("#profileSummaryGrade");

    const termElement =
      $("#profileSummaryTerm");

    const yearElement =
      $("#profileSummaryYear");

    if (gradeElement) {
      gradeElement.textContent =
        preferences.grade ||
        "Grade 5";
    }

    if (termElement) {
      termElement.textContent =
        preferences.term ||
        "Term 1";
    }

    if (yearElement) {
      yearElement.textContent =
        preferences.academicYear ||
        "2026";
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Initials
  |--------------------------------------------------------------------------
  */

  function getInitials(name) {
    const words =
      String(name)
        .trim()
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
      words[words.length - 1]
        .charAt(0)
    ).toUpperCase();
  }

  /*
  |--------------------------------------------------------------------------
  | Save profile
  |--------------------------------------------------------------------------
  */

  function saveProfile(event) {
    event.preventDefault();

    const data = CBC.getData();

    const name =
      CBC.cleanDisplayText(
        $("#profileTeacherName").value
      );

    const school =
      CBC.cleanDisplayText(
        $("#profileSchool").value
      );

    const county =
      CBC.cleanDisplayText(
        $("#profileCounty").value
      );

    const role =
      CBC.cleanDisplayText(
        $("#profileRole").value
      );

    if (!name) {
      CBC.showToast(
        "Teacher name is required.",
        true
      );

      return;
    }

    data.teacher = {
      ...data.teacher,

      name,

      school,

      county,

      role:
        role ||
        "CBC MASTER User"
    };

    CBC.saveData(data);
    CBC.refresh();

    CBC.showToast(
      "Profile saved locally."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Save teaching preferences
  |--------------------------------------------------------------------------
  */

  function saveProfilePreferences(
    event
  ) {
    event.preventDefault();

    const data = CBC.getData();

    const grade =
      CBC.cleanDisplayText(
        $("#profileGrade").value
      );

    const term =
      CBC.cleanDisplayText(
        $("#profileTerm").value
      );

    const academicYear =
      CBC.cleanDisplayText(
        $("#profileAcademicYear").value
      );

    data.preferences = {
      ...data.preferences,

      grade:
        grade || "Grade 5",

      term:
        term || "Term 1",

      academicYear:
        academicYear || "2026"
    };

    CBC.saveData(data);
    CBC.refresh();

    CBC.showToast(
      "Teaching preferences saved."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Reset profile form
  |--------------------------------------------------------------------------
  */

  function resetProfileForm() {
    renderProfilePage();

    CBC.showToast(
      "Unsaved profile changes cleared."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Bind controls
  |--------------------------------------------------------------------------
  */

  function bindProfileControls() {
    const profileForm =
      $("#profileForm");

    const preferencesForm =
      $("#profilePreferencesForm");

    const resetButton =
      $("#resetProfileButton");

    if (profileForm) {
      profileForm.addEventListener(
        "submit",
        saveProfile
      );
    }

    if (preferencesForm) {
      preferencesForm.addEventListener(
        "submit",
        saveProfilePreferences
      );
    }

    if (resetButton) {
      resetButton.addEventListener(
        "click",
        resetProfileForm
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Initialize
  |--------------------------------------------------------------------------
  */

  function initProfileModule() {
    bindProfileControls();
    renderProfilePage();
  }

  /*
  |--------------------------------------------------------------------------
  | Public API
  |--------------------------------------------------------------------------
  */

  window.CBCMasterProfile =
    Object.freeze({
      render:
        renderProfilePage
    });

  document.addEventListener(
    "DOMContentLoaded",
    initProfileModule
  );
})();
