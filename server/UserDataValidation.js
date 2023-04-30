/* File Purpose:
a User sign up backend validation in case client side validation got bypassed (it doesn't return any feedback to the user)
*/

class userDataValidation {
  // Username validation
  static async validateUsername(username) {
    let result = { passed: false, msg: "Invalid username format" };

    const startWithLetterRegex = /^[a-zA-Z]/;
    const lettersNumbersUnderscoresRegex = /^[a-zA-Z0-9_]+$/;
    const lengthRegex = /^.{3,25}$/;

    if (!startWithLetterRegex.test(username)) {
      result = { passed: false, msg: "Username must start with a letter" };
    } else if (!lettersNumbersUnderscoresRegex.test(username)) {
      result = { passed: false, msg: "Username can only contain letters, numbers, and underscores" };
    } else if (!lengthRegex.test(username)) {
      result = { passed: false, msg: "Username must be between 3 to 25 characters" };
    } else {
      result = { passed: true, msg: "Username is valid!" };
    }

    return result;
  }

  // Email Validation
  static async validateEmail(email) {
    let result = { passed: false, msg: "Invalid email address" };

    const regex = /^(?!.*\s)\S+@\S+\.\S+$/;

    if (!regex.test(email)) {
      result = { passed: false, msg: "Invalid email address format" };
    } else {
      result = { passed: true, msg: "Email is valid!" };
    }

    return result;
  }

  // Password Validation
  static async validatePassword(password) {
    let result = { passed: false, msg: "Invalid password format" };

    const containsSpaceRegex = /\s/;
    const lengthRegex = /^.{6,}$/;

    if (containsSpaceRegex.test(password)) {
      result = { passed: false, msg: "Password can't contain spaces" };
    } else if (!lengthRegex.test(password)) {
      result = { passed: false, msg: "Password must be at least 6 characters long" };
    } else {
      result = { passed: true, msg: "Password is valid!" };
    }
    return result;
  }

  // Gender Validation
  static async validateGender(gender) {
    let result = { passed: false, msg: "Please select a gender." };

    if (gender === "male" || gender === "female") {
      result = { passed: true, msg: "Gender is valid!" };
    }

    return result;
  }
}

module.exports = userDataValidation;
