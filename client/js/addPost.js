// Module Purpose: validates post data (title, file) on input and on submit, and if validated it will send the post data to the server.

import {Validation} from './Validation.js'
import axios from 'axios'

const addPostForm = document.querySelector(".add-post-form");
const fileInput = document.querySelector(".file-input");
const titleInput = document.querySelector(".title-input");
const titleErrorMsg = document.querySelector(".error-message-title-input");
const fileErrorMsg = document.querySelector(".error-message-file-input");

export async function sendPostToServer() {
  // Removes title error on input change
  titleInput.addEventListener("input", () => {
    if (titleInput.value.trim().length > 0) {
      titleErrorMsg.innerText = "";
    }
  });

  // Removes file errors on file change
  fileInput.addEventListener("change", () => {
    fileErrorMsg.innerText = "";
  });

  // On submit
  addPostForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    const title = titleInput.value;

    const titleValidation = await Validation.validatePostTitle(title);
    const fileValidation = await Validation.validatePostFile(file);

    if (!titleValidation.passed) {
      titleErrorMsg.innerText = titleValidation.msg;
    }

    if (!fileValidation.passed) {
      fileErrorMsg.innerText = fileValidation.msg;
    }

    // Check if any error message is present
    if (titleErrorMsg.innerText || fileErrorMsg.innerText) {
      return false;
    }
    // if not, then send the post to the server
    else {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", file);

      await axios
        .post(`${window.location.pathname}/addPostProcess`, formData)
        .then((res) => {
          if (res.status === 200) {
            const currentPathname = window.location.pathname;
            const newPathname = currentPathname.replace("add-post", "posts?postSuccess=true&showToast=true");
            const redirectUrl = window.location.origin + newPathname;
            window.location.href = redirectUrl;
          }
        })
        .catch((err) => console.log(err));
    }
  });
}
