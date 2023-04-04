/* File Purpose:
Validates selected file type & size on submit. If validated, sends file to server for server to handle it.
*/

const form = document.querySelector(".add-post-page-container__form");
const fileInput = document.querySelector(".file-input");
const titleInput = document.querySelector(".title-input");
const submitButton = document.querySelector(".add-post-page-container__button");
const titleErrorMsg = document.querySelector(".error-message-title-input");
const fileErrorMsg = document.querySelector(".error-message-file-input");
const loaderContainer = document.querySelector("#loader-container");
const allowedExtensions = [".pdf", ".doc", ".docx", ".ppt", ".pptx"];

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

// Checks the submitted data (file and title)
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];
  const title = titleInput.value;

  if (!file) {
    fileErrorMsg.innerText = "يجب اختيار ملف.";
  } else {
    fileErrorMsg.innerText = "";
  }

  if (!title) {
    titleErrorMsg.innerText = "يجب كتابة عنوان.";
  } else {
    titleErrorMsg.innerText = "";
  }

  const filePath = fileInput.value;
  const extension = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();
  const fileSizeInBytes = file.size;
  const fileSizeInKB = fileSizeInBytes / 1024;
  const maxfileSizeInKB = 50000; // = 50 MB

  if (!allowedExtensions.includes(extension)) {
    fileErrorMsg.innerText = "يجب أن يكون نوع الملف PDF أو Word أو Powerpoint.";
    return;
  } else {
    fileErrorMsg.innerText = "";
  }

  if (fileSizeInKB > maxfileSizeInKB) {
    fileErrorMsg.innerText = "يجب أن لا يتجاوز حجم الملف 50 MB.";
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
  loaderContainer.classList.remove("visually-hidden");

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
