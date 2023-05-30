import axios from "axios";
import * as helper from "./helper.js";
import { enLangData as enLangData } from "../lang/en.js";
import { arLangData as arLangData } from "../lang/ar.js";

export class Validation {
  // Validate Username
  static async validateUsername(username) {
    const langData = (await helper.getCurrentLanguage()) === "en" ? enLangData : arLangData;

    const startWithLetterRegex = /^[a-zA-Z]/;
    const lettersNumbersUnderscoresRegex = /^[a-zA-Z0-9_]+$/;
    const lengthRegex = /^.{3,25}$/;

    const checkUsernameExists = async (username) => {
      let exists = false;
      try {
        const baseURL = "http://localhost:3000";
        const response = await axios.post(`${baseURL}/checkUsernameExists`, {
          username,
        });
        exists = response.data;
      } catch (err) {
        console.error(err.message);
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
    const langData = (await helper.getCurrentLanguage()) === "en" ? enLangData : arLangData;

    const regex = /^(?!.*\s)\S+@\S+\.\S+$/;

    const checkEmailExists = async (email) => {
      let exists = false;
      try {
        const baseURL = "http://localhost:3000";
        const response = await axios.post(`${baseURL}/checkEmailExists`, {
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
    const langData = (await helper.getCurrentLanguage()) === "en" ? enLangData : arLangData;

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
    const langData = (await helper.getCurrentLanguage()) === "en" ? enLangData : arLangData;

    if (!gender) {
      return { passed: false, msg: langData.val_GENDER_NOT_SELECTED };
    } else {
      return { passed: true };
    }
  }

  // Validate Post file
  static async validatePostFile(file) {
    const langData = (await helper.getCurrentLanguage()) === "en" ? enLangData : arLangData;

    if (!file) {
      return { passed: false, msg: langData.val_NO_FILE_SELECTED };
    }

    const fileSizeInBytes = file.size;
    const fileSizeInKB = helper.bytesToKB(fileSizeInBytes);
    const maxFileSizeInKB = 50000; // = 50 MB
    const allowedExtensions = [".pdf", ".doc", ".docx", ".ppt", ".pptx"];
    const filePath = file.name || file.originalname;
    const extension = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return { passed: false, msg: langData.val_INVALID_FILE_TYPE };
    } else if (fileSizeInKB > maxFileSizeInKB) {
      return { passed: false, msg: langData.val_INVALID_FILE_SIZE };
    } else {
      return { passed: true };
    }
  }
}
