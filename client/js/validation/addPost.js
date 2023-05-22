// Module Purpose: validates post data (title, file) on submit, and if validated it will send the post data to the server.

import { Validation } from "../../../common/Validation.js";
import {removeLoader} from "../loader.js";

const addPostForm = document.querySelector(".add-post-form");
const fileInput = document.querySelector(".file-input");
const fileErrorMsg = document.querySelector(".error-message-file-input");

export async function validatePostFile() {
  // Removes file errors on file change
  fileInput.addEventListener("change", () => {
    fileErrorMsg.innerText = "";
  });

  // On submit
  addPostForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    const fileValidation = await Validation.validatePostFile(file);

    if (!fileValidation.passed) {
      fileErrorMsg.innerText = fileValidation.msg;
      removeLoader();
    }

    // Check if error message is present
    if (fileErrorMsg.innerText) {
      return false;
    }
    // if not, submit the form
    else {
      addPostForm.submit();
    }
  });
}
