import axios from "axios";
import { showLoader } from "./loader.js";

let langData = axios
  .get("/langData")
  .then((res) => {
    langData = res.data;
  })
  .catch((err) => console.log(err));

// Inputs
const signupForm = document.querySelector(".signup-page__form");
const usernameInput = document.querySelector(".signup-page__username-input");
const emailInput = document.querySelector(".signup-page__email-input");
const passwordInput = document.querySelector(".signup-page__password-input");
const repeatPasswordInput = document.querySelector(".signup-page__repeat-password-input");
const maleInput = document.querySelector(".signup-page__male-gender-input");
const femaleInput = document.querySelector(".signup-page__female-gender-input");

// Errors
const usernameErrorMsg = document.querySelector(".signup-page__username-error-message");
const emailErrorMsg = document.querySelector(".signup-page__email-error-message");
const passwordErrorMsg = document.querySelector(".signup-page__password-error-message");
const repeatPasswordErrorMsg = document.querySelector(".signup-page__repeat-password-error-message");
const genderErrorMsg = document.querySelector(".signup-page__gender-error-message");

export function signupValidation() {
  if (signupForm) {
    // On input
    usernameInput.addEventListener("input", async () => {
      const usernameValidation = await validateUsername(usernameInput.value);
      if (!usernameValidation.passed) {
        usernameErrorMsg.innerText = usernameValidation.msg;
      } else {
        usernameErrorMsg.innerText = "";
      }
    });

    emailInput.addEventListener("input", async () => {
      const emailValidation = await validateEmail(emailInput.value);
      if (!emailValidation.passed) {
        emailErrorMsg.innerText = emailValidation.msg;
      } else {
        emailErrorMsg.innerText = "";
      }
    });

    passwordInput.addEventListener("input", () => {
      const passwordValidation = validatePassword(passwordInput.value, repeatPasswordInput.value);
      if (!passwordValidation.passed) {
        passwordErrorMsg.innerText = passwordValidation.msg;
        repeatPasswordErrorMsg.innerText = passwordValidation.msg;
      } else {
        passwordErrorMsg.innerText = "";
        repeatPasswordErrorMsg.innerText = "";
      }
    });

    repeatPasswordInput.addEventListener("input", () => {
      const passwordValidation = validatePassword(passwordInput.value, repeatPasswordInput.value);
      if (!passwordValidation.passed) {
        passwordErrorMsg.innerText = passwordValidation.msg;
        repeatPasswordErrorMsg.innerText = passwordValidation.msg;
      } else {
        passwordErrorMsg.innerText = "";
        repeatPasswordErrorMsg.innerText = "";
      }
    });

    // On Submit - Recheck input values
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const usernameValidation = await validateUsername(usernameInput.value);

      if (!usernameValidation.passed) {
        usernameErrorMsg.innerText = usernameValidation.msg;
      } else {
        usernameErrorMsg.innerText = "";
      }

      const emailValidation = await validateEmail(emailInput.value);
      if (!emailValidation.passed) {
        emailErrorMsg.innerText = emailValidation.msg;
      } else {
        emailErrorMsg.innerText = "";
      }

      const passwordValidation = validatePassword(passwordInput.value, repeatPasswordInput.value);
      if (!passwordValidation.passed) {
        passwordErrorMsg.innerText = passwordValidation.msg;
        repeatPasswordErrorMsg.innerText = passwordValidation.msg;
      } else {
        passwordErrorMsg.innerText = "";
        repeatPasswordErrorMsg.innerText = "";
      }

      const genderValidation = validateGender(maleInput.checked, femaleInput.checked);
      if (!genderValidation.passed) {
        genderErrorMsg.innerText = genderValidation.msg;
      } else {
        genderErrorMsg.innerText = "";
      }

      // Check if any error message is present
      if (usernameErrorMsg.innerText || emailErrorMsg.innerText || passwordErrorMsg.innerText || repeatPasswordErrorMsg.innerText || genderErrorMsg.innerText) {
        return false;
      }

      signupForm.submit();
      showLoader();
    });
  }
}

//-----------Validation functions--------------//

async function validateUsername(username) {
  const startWithLetterRegex = /^[a-zA-Z]/;
  const lettersNumbersUnderscoresRegex = /^[a-zA-Z0-9_]+$/;
  const lengthRegex = /^.{3,25}$/;

  const checkUsernameExists = async (username) => {
    let exists = false;
    await axios
      .post(`/checkUsernameExists`, { username })
      .then((res) => (exists = res.data))
      .catch((err) => console.log(err));

    return exists;
  };

  console.log(await checkUsernameExists(username));

  if (!startWithLetterRegex.test(username)) {
    return { passed: false, msg: langData.val_USERNAME_INVALID_START };
  } else if (!lettersNumbersUnderscoresRegex.test(username)) {
    return { passed: false, msg: langData.val_USERNAME_INVALID_CONTENT };
  } else if (!lengthRegex.test(username)) {
    return { passed: false, msg: langData.val_USERNAME_INVALID_LENGTH };
  } else if ((await checkUsernameExists(username)) === true) {
    return { passed: false, msg: langData.val_USERNAME_EXISTS };
  } else {
    return { passed: true };
  }
}

async function validateEmail(email) {
  const regex = /^(?!.*\s)\S+@\S+\.\S+$/;

  const checkEmailExists = async (email) => {
    let exists = false;
    await axios
      .post(`/checkEmailExists`, { email })
      .then((res) => (exists = res.data))
      .catch((err) => console.log(err));

    return exists;
  };

  if (!regex.test(email)) {
    return { passed: false, msg: langData.val_EMAIL_INVALID };
  } else if ((await checkEmailExists(email)) === true) {
    return { passed: false, msg: langData.val_EMAIL_EXISTS };
  } else {
    return { passed: true };
  }
}

function validatePassword(password, repeatPassword) {
  const containsSpaceRegex = /\s/;
  const lengthRegex = /^.{6,}$/;

  if (containsSpaceRegex.test(password)) {
    return { passed: false, msg: langData.val_PASSWORD_HAS_SPACE };
  } else if (!lengthRegex.test(password)) {
    return { passed: false, msg: langData.val_PASSWORD_INVALID_LENGTH };
  } else if (password !== repeatPassword) {
    return { passed: false, msg: langData.val_PASSWORDS_NO_MATCH };
  } else {
    return { passed: true };
  }
}

function validateGender(male, female) {
  if (!male && !female) {
    return { passed: false, msg: langData.val_GENDER_NOT_SELECTED };
  } else {
    return { passed: true };
  }
}
