"use strict";

/*
|--------------------------------------------------------------------------
| CBC MASTER V2
| Teacher Profile Photo
|--------------------------------------------------------------------------
| Local-first • Offline-first • Privacy-first
|
| The teacher photo:
| - stays on this device
| - is stored in localStorage
| - is resized before storage
| - is compressed to reduce storage usage
| - is never uploaded by this script
|--------------------------------------------------------------------------
*/

const CBC_TEACHER_PHOTO_KEY = "cbc_teacher_photo";

const CBC_MAX_PHOTO_SIZE = 300;
const CBC_PHOTO_QUALITY = 0.7;
const CBC_MAX_FILE_SIZE = 10 * 1024 * 1024;


/*
|--------------------------------------------------------------------------
| Initialize
|--------------------------------------------------------------------------
*/

function initializeTeacherPhoto() {
  const photoInput = document.getElementById("photoInput");
  const profilePic = document.getElementById("profilePic");

  /*
   * Profile elements may not exist on every page.
   */
  if (!photoInput || !profilePic) {
    return;
  }

  /*
   * Load existing photo.
   */
  loadTeacherPhoto(profilePic);

  /*
   * Prevent duplicate event listeners.
   */
  if (photoInput.dataset.photoInitialized === "true") {
    return;
  }

  photoInput.dataset.photoInitialized = "true";

  photoInput.addEventListener(
    "change",
    handleTeacherPhotoChange
  );
}


/*
|--------------------------------------------------------------------------
| Load Saved Photo
|--------------------------------------------------------------------------
*/

function loadTeacherPhoto(profilePic) {
  try {
    const savedPhoto = localStorage.getItem(
      CBC_TEACHER_PHOTO_KEY
    );

    if (savedPhoto) {
      profilePic.src = savedPhoto;
    }
  } catch (error) {
    console.warn(
      "CBC MASTER: Unable to load teacher photo."
    );
  }
}


/*
|--------------------------------------------------------------------------
| Handle Photo Selection
|--------------------------------------------------------------------------
*/

function handleTeacherPhotoChange(event) {
  const input = event.target;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  /*
   * Make sure the selected file is an image.
   */
  if (!file.type.startsWith("image/")) {
    alert("Please select a valid image file.");

    input.value = "";
    return;
  }

  /*
   * Protect the device from extremely large files.
   */
  if (file.size > CBC_MAX_FILE_SIZE) {
    alert(
      "Please choose an image smaller than 10 MB."
    );

    input.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = function (readerEvent) {
    const image = new Image();

    image.onload = function () {
      compressTeacherPhoto(
        image,
        input
      );
    };

    image.onerror = function () {
      alert(
        "CBC MASTER could not read this image."
      );

      input.value = "";
    };

    image.src = readerEvent.target.result;
  };

  reader.onerror = function () {
    alert(
      "CBC MASTER could not read the selected file."
    );

    input.value = "";
  };

  reader.readAsDataURL(file);
}


/*
|--------------------------------------------------------------------------
| Resize + Compress
|--------------------------------------------------------------------------
*/

function compressTeacherPhoto(image, input) {
  let width =
    image.naturalWidth ||
    image.width;

  let height =
    image.naturalHeight ||
    image.height;

  /*
   * Validate image dimensions.
   */
  if (!width || !height) {
    alert(
      "CBC MASTER could not determine the image size."
    );

    input.value = "";
    return;
  }

  /*
   * Preserve the original aspect ratio.
   */
  if (width > height) {
    if (width > CBC_MAX_PHOTO_SIZE) {
      const ratio =
        CBC_MAX_PHOTO_SIZE / width;

      width = CBC_MAX_PHOTO_SIZE;

      height = Math.round(
        height * ratio
      );
    }
  } else {
    if (height > CBC_MAX_PHOTO_SIZE) {
      const ratio =
        CBC_MAX_PHOTO_SIZE / height;

      height = CBC_MAX_PHOTO_SIZE;

      width = Math.round(
        width * ratio
      );
    }
  }

  const canvas =
    document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context =
    canvas.getContext("2d");

  if (!context) {
    alert(
      "CBC MASTER could not process the photo."
    );

    input.value = "";
    return;
  }

  /*
   * Improve JPEG output.
   */
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  /*
   * Draw resized photo.
   */
  context.drawImage(
    image,
    0,
    0,
    width,
    height
  );

  /*
   * Convert to compressed JPEG.
   */
  const compressedPhoto =
    canvas.toDataURL(
      "image/jpeg",
      CBC_PHOTO_QUALITY
    );

  saveTeacherPhoto(
    compressedPhoto,
    input
  );
}


/*
|--------------------------------------------------------------------------
| Save Photo
|--------------------------------------------------------------------------
*/

function saveTeacherPhoto(
  photoData,
  input
) {
  const profilePic =
    document.getElementById(
      "profilePic"
    );

  if (!profilePic) {
    return;
  }

  try {
    localStorage.setItem(
      CBC_TEACHER_PHOTO_KEY,
      photoData
    );

    /*
     * Update the displayed profile photo.
     */
    profilePic.src = photoData;

    showTeacherPhotoStatus(
      "Photo saved on this device."
    );

  } catch (error) {
    console.warn(
      "CBC MASTER: Unable to save teacher photo.",
      error
    );

    alert(
      "The photo could not be saved. " +
      "Try a smaller image."
    );

    input.value = "";
  }
}


/*
|--------------------------------------------------------------------------
| Remove Photo
|--------------------------------------------------------------------------
*/

function removeTeacherPhoto() {
  const profilePic =
    document.getElementById(
      "profilePic"
    );

  try {
    localStorage.removeItem(
      CBC_TEACHER_PHOTO_KEY
    );

    if (profilePic) {
      /*
       * Remove the saved image.
       *
       * If your HTML has a default placeholder,
       * you can set profilePic.src here instead.
       */
      profilePic.removeAttribute("src");
    }

    /*
     * Clear the file input.
     */
    const photoInput =
      document.getElementById(
        "photoInput"
      );

    if (photoInput) {
      photoInput.value = "";
    }

    showTeacherPhotoStatus(
      "Profile photo removed."
    );

  } catch (error) {
    alert(
      "CBC MASTER could not remove the photo."
    );
  }
}


/*
|--------------------------------------------------------------------------
| Status Message
|--------------------------------------------------------------------------
*/

function showTeacherPhotoStatus(
  message
) {
  const status =
    document.getElementById(
      "profilePhotoStatus"
    );

  if (!status) {
    return;
  }

  status.textContent = message;
  status.hidden = false;

  window.setTimeout(
    function () {
      status.hidden = true;
    },
    2500
  );
}


/*
|--------------------------------------------------------------------------
| Initialize When Ready
|--------------------------------------------------------------------------
*/

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initializeTeacherPhoto,
    {
      once: true
    }
  );
} else {
  initializeTeacherPhoto();
}


/*
|--------------------------------------------------------------------------
| Public CBC MASTER API
|--------------------------------------------------------------------------
*/

window.CBCMasterProfilePhoto = {
  initialize:
    initializeTeacherPhoto,

  remove:
    removeTeacherPhoto
};
