// Loader
const loaderContainer = document.getElementById("loader-container");

// Username selectors
const usernameLabel = document.querySelector(".username-data-wrapper");
const currentUsername = document.querySelector(".current-username");
const updateUsernameButton = document.querySelector(".update-username-btn");
const updateUsernameForm = document.querySelector(".new-username-form");

// Email selectors
const emailLabel = document.querySelector(".email-data-wrapper");
const currentEmail = document.querySelector(".current-email");
const updateEmailButton = document.querySelector(".update-email-btn");
const updateEmailForm = document.querySelector(".new-email-form");

// Password selectors
const passwordLabel = document.querySelector(".password-data-wrapper");
const currentPassword = document.querySelector(".current-password");
const updatePasswordButton = document.querySelector(".update-password-btn");
const updatePasswordForm = document.querySelector(".new-password-form");

// update username process
updateUsernameButton.addEventListener("click", async (e) => {
  updateUsernameForm.classList.remove("visually-hidden");

  const cancelButton = document.querySelector(".new-username-cancel-btn");
  cancelButton.addEventListener("click", (e) => {
    e.preventDefault();
    updateUsernameForm.classList.add("visually-hidden");
  });

  const saveButton = document.querySelector(".new-username-save-btn");
  saveButton.addEventListener("click", async (e) => {
    e.preventDefault();
    loaderContainer.classList.remove("visually-hidden");
    const newUsername = document.querySelector(".new-username-input").value;
    const validator = await validateUsername(newUsername);

    if (validator.passed === true) {
      await updateUserDataInServer({ username: newUsername })
        .then((res) => {
          console.log(res);
          loaderContainer.classList.add("visually-hidden");
          window.location.href = "/dashboard/my-account?updateSuccess=true";
        })
        .catch((err) => {
          console.log(err);
          loaderContainer.classList.add("visually-hidden");
          window.location.href = "/dashboard/my-account?updateSuccess=false";
        });
    } else {
      const error = document.querySelector(".username-error-message");
      error.innerText = validator.errorMsg;
      loaderContainer.classList.add("visually-hidden");
    }
  });
});

// update email process
updateEmailButton.addEventListener("click", async (e) => {
  updateEmailForm.classList.remove("visually-hidden");

  const cancelButton = document.querySelector(".new-email-cancel-btn");
  cancelButton.addEventListener("click", (e) => {
    e.preventDefault();
    updateEmailForm.classList.add("visually-hidden");
  });

  const saveButton = document.querySelector(".new-email-save-btn");
  saveButton.addEventListener("click", async (e) => {
    e.preventDefault();
    loaderContainer.classList.remove("visually-hidden");
    const newEmail = document.querySelector(".new-email-input").value;
    const validator = await validateEmail(newEmail);

    if (validator.passed === true) {
      await updateUserDataInServer({ email: newEmail })
        .then((res) => {
          console.log(res);
          loaderContainer.classList.add("visually-hidden");
          window.location.href = "/dashboard/my-account?updateSuccess=true";
        })
        .catch((err) => {
          console.log(err);
          loaderContainer.classList.add("visually-hidden");
          window.location.href = "/dashboard/my-account?updateSuccess=false";
        });
    } else {
      const error = document.querySelector(".email-error-message");
      error.innerText = validator.errorMsg;
      loaderContainer.classList.add("visually-hidden");
    }
  });
});

// update password process
updatePasswordButton.addEventListener("click", async (e) => {
  updatePasswordForm.classList.remove("visually-hidden");

  const cancelButton = document.querySelector(".new-password-cancel-btn");
  cancelButton.addEventListener("click", (e) => {
    e.preventDefault();
    updatePasswordForm.classList.add("visually-hidden");
  });

  const saveButton = document.querySelector(".new-password-save-btn");
  saveButton.addEventListener("click", async (e) => {
    e.preventDefault();
    loaderContainer.classList.remove("visually-hidden");
    const newPassword = document.querySelector(".new-password-input").value;
    const repeatNewPassword = document.querySelector(".repeat-new-password-input").value;
    const validator = validatePassword(newPassword, repeatNewPassword);

    if (validator.passed === true) {
      await updateUserDataInServer({ password: newPassword })
        .then((res) => {
          console.log(res);
          loaderContainer.classList.add("visually-hidden");
          window.location.href = "/dashboard/my-account?updateSuccess=true";
        })
        .catch((err) => {
          console.log(err);
          loaderContainer.classList.add("visually-hidden");
          window.location.href = "/dashboard/my-account?updateSuccess=false";
        });
    } else {
      const error = document.querySelector(".password-error-message");
      error.innerText = validator.errorMsg;
      loaderContainer.classList.add("visually-hidden");
    }
  });
});

//-----Validators-----// 👇

async function validateUsername(username) {
  const startWithLetterRegex = /^[a-zA-Z]/;
  const lettersNumbersUnderscoresRegex = /^[a-zA-Z0-9_]+$/;
  const lengthRegex = /^.{3,25}$/;

  const checkUsernameExists = async (username) => {
    let exists = false;
    await axios
      .post(`/signup/checkUsernameExists`, { username })
      .then((res) => (exists = res.data))
      .catch((err) => console.log(err));

    return exists;
  };

  if (!startWithLetterRegex.test(username)) {
    return { passed: false, errorMsg: "اسم المستخدم يجب أن يبدأ بحرف. (انجليزي فقط)" };
  } else if (!lettersNumbersUnderscoresRegex.test(username)) {
    return { passed: false, errorMsg: "اسم المستخدم يمكن أن يحتوي على حروف وأرقام أو شرطة سفلية فقط." };
  } else if (!lengthRegex.test(username)) {
    return { passed: false, errorMsg: "اسم المستخدم يجب أن يكون ما بين 3 إلى 25 حرف." };
  } else if ((await checkUsernameExists(username)) === true) {
    return { passed: false, errorMsg: "اسم المستخدم موجود مسبقًا." };
  } else {
    return { passed: true };
  }
}

async function validateEmail(email) {
  const regex = /^(?!.*\s)\S+@\S+\.\S+$/;

  const checkEmailExists = async (email) => {
    let exists = false;
    await axios
      .post(`/signup/checkEmailExists`, { email })
      .then((res) => (exists = res.data))
      .catch((err) => console.log(err));

    return exists;
  };

  if (!regex.test(email)) {
    return { passed: false, errorMsg: "البريد الإلكتروني خاطئ." };
  } else if ((await checkEmailExists(email)) === true) {
    return { passed: false, errorMsg: "البريد الإلكتروني موجود مسبقًا." };
  } else {
    return { passed: true };
  }
}

function validatePassword(password, repeatPassword) {
  const containsSpaceRegex = /\s/;
  const lengthRegex = /^.{6,}$/;

  if (password !== repeatPassword) {
    return { passed: false, errorMsg: "كلمات المرور غير متطابقة." };
  } else if (containsSpaceRegex.test(password)) {
    return { passed: false, errorMsg: "لا يمكن أن تحتوي كلمة المرور على مسافة." };
  } else if (!lengthRegex.test(password)) {
    return { passed: false, errorMsg: "يجب أن يكون طول كلمة المرور 6 أحرف على الأقل." };
  } else {
    return { passed: true };
  }
}

//---- AJAX Update data ----/// 👇
async function updateUserDataInServer(userData) {
  let isSuccess = false;
  await axios
    .post(`/dashboard/updateUserData`, userData)
    .then((res) => (isSuccess = true))
    .catch((err) => (isSuccess = false));

  return isSuccess;
}
