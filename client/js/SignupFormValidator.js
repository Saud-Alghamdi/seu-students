class SignupFormValidator {
  constructor(form, fields) {
    this.form = form;
    this.fields = fields;
  }

  initialize() {
    this.validateOnEntry();
    this.validateOnSubmit();
  }

  validateOnSubmit() {
    let self = this;
    this.form.addEventListener("submit", (e) => {
      self.fields.forEach((field) => {
        const input = document.querySelector(`.${field}`);
        self.validateFields(input);
        if (emptyOrErrorFields() === true) {
          e.preventDefault();
        } else {
          return;
        }
      });
    });
  }

  validateOnEntry() {
    let self = this;
    this.fields.forEach((field) => {
      const input = document.querySelector(`.${field}`);
      input.addEventListener("input", (event) => {
        self.validateFields(input);
      });
    });
  }

  async validateFields(field) {
    /* CHECK VALID USERNAME:
    - must start with a letter
    - between 3 and 25 characters
    - only letters, numbers, underscores, dashes and dots allowed
    - username must not already exists
    */
    if (field.name === "username") {
      const startWithLetterRegex = /^[a-zA-Z]/;
      const lettersNumbersUnderscoresRegex = /^[a-zA-Z0-9_]+$/;
      const lengthRegex = /^.{3,25}$/;

      if (!startWithLetterRegex.test(field.value)) {
        this.setStatus(field, "اسم المستخدم يجب أن يبدأ بحرف. (انجليزي فقط)", "error");
      } else if (!lettersNumbersUnderscoresRegex.test(field.value)) {
        this.setStatus(field, "اسم المستخدم يمكن أن يحتوي على حروف وأرقام أو شرطة سفلية فقط.", "error");
      } else if (!lengthRegex.test(field.value)) {
        this.setStatus(field, "اسم المستخدم يجب أن يكون ما بين 3 إلى 25 حرف.", "error");
      } else if ((await checkUsernameExists(field.value)) === true) {
        this.setStatus(field, "اسم المستخدم موجود مسبقًا.", "error");
      } else {
        this.setStatus(field, null, "success");
      }
    }

    /* CHECK VALID EMAIL
    - follows standard email regex
    - must not exist in DB
    */
    if (field.name === "email") {
      const regex = /^(?!.*\s)\S+@\S+\.\S+$/;
      if (!regex.test(field.value)) {
        this.setStatus(field, "البريد الإلكتروني خاطئ.", "error");
      } else if ((await checkEmailExists(field.value)) === true) {
        this.setStatus(field, "البريد الإلكتروني موجود مسبقًا.", "error");
      } else {
        this.setStatus(field, null, "success");
      }
    }

    /* CHECK VALID PASSWORD:
    - between 6 and 30 characters
    */
    if (field.name === "password") {
      const containsSpaceRegex = /\s/;
      const lengthRegex = /^.{6,}$/;

      if (containsSpaceRegex.test(field.value)) {
        this.setStatus(field, "لا يمكن أن تحتوي كلمة المرور على مسافة.", "error");
      } else if (!lengthRegex.test(field.value)) {
        this.setStatus(field, "يجب أن يكون طول كلمة المرور 6 أحرف على الأقل.", "error");
      } else {
        this.setStatus(field, null, "success");
      }
    }

    // CHECK REPEAT PASSWORD === PASSWORD
    if (field.name === "repeat-password") {
      const passwordField = document.getElementById("password-field");

      if (field.value !== passwordField.value) {
        this.setStatus(field, "كلمات المرور غير متطابقة.", "error");
      } else {
        this.setStatus(field, null, "success");
      }
    }

    // CHECK IF GENDER HAS BEEN SELECTED OR NOT
    if (field.name === "gender") {
      const genderRadioButtons = document.querySelectorAll("input[name='gender']");
      let isSelected = false;
      genderRadioButtons.forEach((radioButton) => {
        if (radioButton.checked) {
          isSelected = true;
        }
      });

      if (isSelected) {
        this.setStatus(field, null, "success");
      } else {
        this.setStatus(field, "فضلًا اختر نوع الجنس.", "error");
      }
    }
  }

  // Fills the error message
  setStatus(field, message, status) {
    const inputGroup = field.closest(".form__input-group");
    const errorElement = inputGroup.querySelector(".error-message");

    if (status === "success") {
      if (errorElement) {
        errorElement.innerText = "";
        this.emptyOrErrorFields = false;
      }
    }

    if (status === "error") {
      errorElement.innerText = message;
      this.emptyOrErrorFields = true;
    }
  }
}

const form = document.querySelector(".form");
const fields = ["username-field", "email-field", "password-field", "repeat-password-field", "radio-field"];

// Check username exists function:
const checkUsernameExists = async (username) => {
  let exists = false;
  await axios
    .post(`/signup/checkUsernameExists`, { username })
    .then((res) => (exists = res.data))
    .catch((err) => console.log(err));

  return exists;
};

// Check Email exists function:
const checkEmailExists = async (email) => {
  let exists = false;
  await axios
    .post(`/signup/checkEmailExists`, { email })
    .then((res) => (exists = res.data))
    .catch((err) => console.log(err));

  return exists;
};

// Check if there are error messages and/or empty fields
const emptyOrErrorFields = () => {
  let emptyOrError = true;

  const inputFields = Array.from(document.querySelectorAll(".input-field"));
  const errorElements = Array.from(document.querySelectorAll(".error-message"));

  const emptyFieldsCount = inputFields.filter((el) => {
    return el.value === "";
  }).length;

  const errorsCount = errorElements.filter((el) => {
    return el.innerText !== "";
  }).length;

  if (errorsCount === 0 && emptyFieldsCount === 0) {
    emptyOrError = false;
  }

  return emptyOrError;
};

const validator = new SignupFormValidator(form, fields);
validator.initialize();

/* 
Explanation:

Two main methods (validateOnSubmit, validateOnEntry)

validateOnEntry fires on entry, it validates the current field in real time while typing
validateOnSubmit fires on submit, it checks all the fields if they are correct or not

Two secondary methods (validateFields, setStatus)

validateFields is ran inside validateOnEntry method, so it validates each field on entry
setStatus is ran inside validateFields, so the status is updated on entry also (in real time)

each fields has a current status, either "error" or "success", which represents if field passed the validation or not
*/
