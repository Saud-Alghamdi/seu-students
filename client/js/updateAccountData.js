// Module Purpose: validate account data change on submit, if validated, send data to the server to update user info in the database.

import { removeLoader } from "./loader.js";
import axios from "axios";
import { Validation } from "../../common/Validation.js";

export async function updateAccountData() {
  await updateUsername();
  await updateEmail();
  await updatePassword();
}

async function updateUsername() {
  const updateUsernameButton = document.querySelector(".update-username-btn");
  const updateUsernameForm = document.querySelector(".new-username-form");
  const saveButton = document.querySelector(".new-username-save-btn");
  const cancelButton = document.querySelector(".new-username-cancel-btn");

  updateUsernameButton.addEventListener("click", (e) => {
    updateUsernameForm.classList.remove("visually-hidden");

    cancelButton.addEventListener("click", (e) => {
      e.preventDefault();
      updateUsernameForm.classList.add("visually-hidden");
    });

    saveButton.addEventListener("click", async (e) => {
      e.preventDefault();
      const newUsername = document.querySelector(".new-username-input").value;
      const validator = await Validation.validateUsername(newUsername);

      if (validator.passed) {
        await updateAccountDataInServer({ username: newUsername })
          .then((res) => {
            console.log(res);
            window.location.href = "/dashboard/my-account?updateSuccess=true";
          })
          .catch((err) => {
            removeLoader();
            console.log(err);
            window.location.href = "/dashboard/my-account?updateSuccess=false";
          });
      } else {
        removeLoader();
        const error = document.querySelector(".username-error-message");
        error.innerText = validator.msg;
      }
    });
  });
}

async function updateEmail() {
  const updateEmailButton = document.querySelector(".update-email-btn");
  const updateEmailForm = document.querySelector(".new-email-form");
  const saveButton = document.querySelector(".new-email-save-btn");
  const cancelButton = document.querySelector(".new-email-cancel-btn");

  updateEmailButton.addEventListener("click", (e) => {
    updateEmailForm.classList.remove("visually-hidden");

    cancelButton.addEventListener("click", (e) => {
      e.preventDefault();
      updateEmailForm.classList.add("visually-hidden");
    });

    saveButton.addEventListener("click", async (e) => {
      e.preventDefault();
      const newEmail = document.querySelector(".new-email-input").value;
      const validator = await Validation.validateEmail(newEmail);

      if (validator.passed) {
        await updateAccountDataInServer({ email: newEmail })
          .then((res) => {
            console.log(res);
            window.location.href = "/dashboard/my-account?updateSuccess=true";
          })
          .catch((err) => {
            removeLoader();
            console.log(err);
            window.location.href = "/dashboard/my-account?updateSuccess=false";
          });
      } else {
        removeLoader();
        const error = document.querySelector(".email-error-message");
        error.innerText = validator.msg;
      }
    });
  });
}

async function updatePassword() {
  const updatePasswordButton = document.querySelector(".update-password-btn");
  const updatePasswordForm = document.querySelector(".new-password-form");
  const saveButton = document.querySelector(".new-password-save-btn");
  const cancelButton = document.querySelector(".new-password-cancel-btn");

  updatePasswordButton.addEventListener("click", (e) => {
    updatePasswordForm.classList.remove("visually-hidden");

    cancelButton.addEventListener("click", (e) => {
      e.preventDefault();
      updatePasswordForm.classList.add("visually-hidden");
    });

    saveButton.addEventListener("click", async (e) => {
      e.preventDefault();
      const newPassword = document.querySelector(".new-password-input").value;
      const repeatNewPassword = document.querySelector(".repeat-new-password-input").value;
      const validator = await Validation.validatePassword(newPassword, repeatNewPassword);

      if (validator.passed) {
        await updateAccountDataInServer({ password: newPassword })
          .then((res) => {
            console.log(res);
            window.location.href = "/dashboard/my-account?updateSuccess=true";
          })
          .catch((err) => {
            removeLoader();
            console.log(err);
            window.location.href = "/dashboard/my-account?updateSuccess=false";
          });
      } else {
        removeLoader();
        const error = document.querySelector(".password-error-message");
        error.innerText = validator.msg;
      }
    });
  });
}

//---- AJAX Update data ----/// 👇
async function updateAccountDataInServer(userData) {
  let isSuccess = false;
  await axios
    .post(`/dashboard/updateAccountData`, userData)
    .then((res) => (isSuccess = true))
    .catch((err) => (isSuccess = false));

  return isSuccess;
}
