import axios from "axios";
import langData from "../lang/en.json" assert { type: "json" };

export class Validation {
  // Validate Username
  static async validateUsername(username) {
    const startWithLetterRegex = /^[a-zA-Z]/;
    const lettersNumbersUnderscoresRegex = /^[a-zA-Z0-9_]+$/;
    const lengthRegex = /^.{3,25}$/;

    const checkUsernameExists = async (username) => {
      let exists = false;
      try {
        const response = await axios.post("http://localhost:3000/checkUsernameExists", {
          username,
        });
        exists = response.data;
      } catch (error) {
        console.error(error.message);
      }
      return exists;
    };

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

  // Validate Email
  static async validateEmail(email) {
    const regex = /^(?!.*\s)\S+@\S+\.\S+$/;

    const checkEmailExists = async (email) => {
      let exists = false;
      try {
        const response = await axios.post("http://localhost:3000/checkEmailExists", {
          email,
        });
        exists = response.data;
      } catch (error) {
        console.error(error.message);
      }
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

  // Validate Password
  static async validatePassword(password, repeatPassword) {
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

  // Validate Gender
  static async validateGender(gender) {
    if (!gender) {
      return { passed: false, msg: langData.val_GENDER_NOT_SELECTED };
    } else {
      return { passed: true };
    }
  }

  // Validate Post title
  static async validatePostTitle(title) {
    if (!title) {
      return { passed: false, msg: langData.val_NO_TITLE_WRITTEN };
    } else {
      return { passed: true };
    }
  }

  // Validate Post file
  static async validatePostFile(file) {
    if (!file) {
      return { passed: false, msg: langData.val_NO_FILE_SELECTED };
    }

    const allowedExtensions = [".pdf", ".doc", ".docx", ".ppt", ".pptx"];
    const maxFileSizeInKB = 50000; // = 50 MB
    const fileName = file.name.toLowerCase();
    const fileSizeInKB = file.size / 1024; // Convert bytes to KB
    const fileExtension = fileName.substring(fileName.lastIndexOf("."));

    if (!allowedExtensions.includes(fileExtension)) {
      return { passed: false, msg: langData.val_INVALID_FILE_TYPE };
    } else if (fileSizeInKB > maxFileSizeInKB) {
      return { passed: false, msg: langData.val_INVALID_FILE_SIZE };
    } else {
      return { passed: true };
    }
  }
}
