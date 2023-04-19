/* File Purpose:
Validates selected file type & size on submit. If validated, sends file to server for server to handle it.
*/
import axios from "axios";

let langData = axios
  .get("/langData")
  .then((res) => {
    langData = res.data;
  })
  .catch((err) => console.log(err));

const addPostForm = document.querySelector(".add-post-form");
const fileInput = document.querySelector(".file-input");
const titleInput = document.querySelector(".title-input");
const titleErrorMsg = document.querySelector(".error-message-title-input");
const fileErrorMsg = document.querySelector(".error-message-file-input");
const loader = document.getElementById("loader-container");
const allowedExtensions = [".pdf", ".doc", ".docx", ".ppt", ".pptx"];

// // Removes title error on input change
// titleInput.addEventListener("input", () => {
//   if (titleInput.value.trim().length > 0) {
//     titleErrorMsg.innerText = "";
//   }
// });

// // Removes file errors on file change
// fileInput.addEventListener("change", () => {
//   fileErrorMsg.innerText = "";
// });

// Checks the submitted data (file and title)
export function sendFileToServer() {
  if (addPostForm) {
    addPostForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const file = fileInput.files[0];
      const title = titleInput.value;

      if (!file) {
        fileErrorMsg.innerText = await langData.val_NO_FILE_SELECTED;
      } else {
        fileErrorMsg.innerText = "";
      }

      if (!title) {
        titleErrorMsg.innerText = await langData.val_NO_TITLE_WRITTEN;
      } else {
        titleErrorMsg.innerText = "";
      }

      const filePath = fileInput.value;
      const extension = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();
      const fileSizeInBytes = file.size;
      const fileSizeInKB = fileSizeInBytes / 1024;
      const maxfileSizeInKB = 50000; // = 50 MB

      if (!allowedExtensions.includes(extension)) {
        fileErrorMsg.innerText = await langData.val_INVALID_FILE_TYPE;
        return;
      } else {
        fileErrorMsg.innerText = "";
      }

      if (fileSizeInKB > maxfileSizeInKB) {
        fileErrorMsg.innerText = await langData.val_INVALID_FILE_SIZE;
        return;
      } else {
        fileErrorMsg.innerText = "";
      }

      if (fileErrorMsg.innerText || titleErrorMsg.innerText) {
        e.preventDefault();
        return;
      }

      /*
  All conditions above passed? Okay then start the loader!
  */
      loader.classList.remove("visually-hidden");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", file);

      // Send file to server for the server to upload it to S3 bucket
      axios
        .post(`${window.location.pathname}/addPostProcess`, formData)
        .then((response) => {
          if (response.status === 200) {
            const currentPathname = window.location.pathname;
            const newPathname = currentPathname.replace("add-post", "posts?postSuccess=true&showToast=true");
            const redirectUrl = window.location.origin + newPathname;
            window.location.href = redirectUrl;
          }
        })
        .catch((error) => {
          const data = error.response.data;
          const errMsg = data.err;
          let errorDiv = document.querySelector(".server-side-error-div");

          if (!errorDiv) {
            errorDiv = document.createElement("div");
            errorDiv.classList.add("server-side-error-div", "text-danger", "border", "border-danger", "rounded-3", "px-4", "mx-auto", "mt-3");
            const headerElement = document.querySelector("header");
            headerElement.insertAdjacentElement("afterend", errorDiv);
          }
          errorDiv.innerHTML = `
        <ul>
          <li class="mt-2"><strong class="server-side-error-msg">${errMsg}</strong></li>
        </ul>
      `;
        });
    });
  }
}
