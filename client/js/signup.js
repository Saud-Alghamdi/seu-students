// Module Purpose: validates sign up data on input and on submit.

import { showLoader } from "./loader.js";
import { Validation } from "./Validation.js";

// Input Elements
const signupForm = document.querySelector(".signup-page__form");
const usernameInput = document.querySelector(".signup-page__username-input");
const emailInput = document.querySelector(".signup-page__email-input");
const passwordInput = document.querySelector(".signup-page__password-input");
const repeatPasswordInput = document.querySelector(".signup-page__repeat-password-input");
const maleInput = document.querySelector(".signup-page__male-gender-input");
const femaleInput = document.querySelector(".signup-page__female-gender-input");

// Errors Elements
const usernameErrorMsg = document.querySelector(".signup-page__username-error-message");
const emailErrorMsg = document.querySelector(".signup-page__email-error-message");
const passwordErrorMsg = document.querySelector(".signup-page__password-error-message");
const repeatPasswordErrorMsg = document.querySelector(".signup-page__repeat-password-error-message");
const genderErrorMsg = document.querySelector(".signup-page__gender-error-message");

export async function signupValidation() {
  // On input
  usernameInput.addEventListener("input", async () => {
    const usernameValidation = await Validation.validateUsername(usernameInput.value);
    if (!usernameValidation.passed) {
      usernameErrorMsg.innerText = usernameValidation.msg;
    } else {
      usernameErrorMsg.innerText = "";
    }
  });

  emailInput.addEventListener("input", async () => {
    const emailValidation = await Validation.validateEmail(emailInput.value);
    if (!emailValidation.passed) {
      emailErrorMsg.innerText = emailValidation.msg;
    } else {
      emailErrorMsg.innerText = "";
    }
  });

  passwordInput.addEventListener("input", async () => {
    const passwordValidation = await Validation.validatePassword(passwordInput.value, repeatPasswordInput.value);
    if (!passwordValidation.passed) {
      passwordErrorMsg.innerText = passwordValidation.msg;
      repeatPasswordErrorMsg.innerText = passwordValidation.msg;
    } else {
      passwordErrorMsg.innerText = "";
      repeatPasswordErrorMsg.innerText = "";
    }
  });

  repeatPasswordInput.addEventListener("input", async () => {
    const passwordValidation = await Validation.validatePassword(passwordInput.value, repeatPasswordInput.value);
    if (!passwordValidation.passed) {
      passwordErrorMsg.innerText = passwordValidation.msg;
      repeatPasswordErrorMsg.innerText = passwordValidation.msg;
    } else {
      passwordErrorMsg.innerText = "";
      repeatPasswordErrorMsg.innerText = "";
    }
  });

  // On Submit - re-check input values
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usernameValidation = await Validation.validateUsername(usernameInput.value);
    if (!usernameValidation.passed) {
      usernameErrorMsg.innerText = usernameValidation.msg;
    } else {
      usernameErrorMsg.innerText = "";
    }

    const emailValidation = await Validation.validateEmail(emailInput.value);
    if (!emailValidation.passed) {
      emailErrorMsg.innerText = emailValidation.msg;
    } else {
      emailErrorMsg.innerText = "";
    }

    const passwordValidation = await Validation.validatePassword(passwordInput.value, repeatPasswordInput.value);
    if (!passwordValidation.passed) {
      passwordErrorMsg.innerText = passwordValidation.msg;
      repeatPasswordErrorMsg.innerText = passwordValidation.msg;
    } else {
      passwordErrorMsg.innerText = "";
      repeatPasswordErrorMsg.innerText = "";
    }

    const genderValidation = await Validation.validateGender(maleInput.checked, femaleInput.checked);
    if (!genderValidation.passed) {
      genderErrorMsg.innerText = genderValidation.msg;
    } else {
      genderErrorMsg.innerText = "";
    }

    // Check if any error message is present
    if (usernameErrorMsg.innerText || emailErrorMsg.innerText || passwordErrorMsg.innerText || repeatPasswordErrorMsg.innerText || genderErrorMsg.innerText) {
      return false;
    } else {
      showLoader();
      signupForm.submit();
    }
  });
}
