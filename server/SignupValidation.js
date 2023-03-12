class SignupValidation {
  // Username validation
  static async validateUsername(username) {
    let result = { success: false, msg: "Invalid username format" };

    const startWithLetterRegex = /^[a-zA-Z]/;
    const lettersNumbersUnderscoresRegex = /^[a-zA-Z0-9_]+$/;
    const lengthRegex = /^.{3,25}$/;

    if (!startWithLetterRegex.test(username)) {
      result = { success: false, msg: "Username must start with a letter" };
    } else if (!lettersNumbersUnderscoresRegex.test(username)) {
      result = { success: false, msg: "Username can only contain letters, numbers, and underscores" };
    } else if (!lengthRegex.test(username)) {
      result = { success: false, msg: "Username must be between 3 to 25 characters" };
    } else {
      result = { success: true, msg: "Username is valid!" };
    }

    return result;
  }

  // Email Validation
  static async validateEmail(email) {
    let result = { success: false, msg: "Invalid email address" };

    const regex = /\S+@\S+\.\S+/;

    if (!regex.test(email)) {
      result = { success: false, msg: "Invalid email address format" };
    } else {
      result = { success: true, msg: "Email is valid!" };
    }

    return result;
  }

  // Password Validation
  static async validatePassword(password) {
    let result = { success: false, msg: "Invalid password format" };

    const containsSpaceRegex = /\s/;
    const lengthRegex = /^.{6,}$/;

    if (containsSpaceRegex.test(password)) {
      result = { success: false, msg: "Password can't contain spaces" };
    } else if (!lengthRegex.test(password)) {
      result = { success: false, msg: "Password must be at least 6 characters long" };
    } else {
      result = { success: true, msg: "Password is valid!" };
    }

    return result;
  }

  // Gender Validation
  static async validateGender(gender) {
    let result = { success: false, msg: "Please select a gender." };

    if (gender === "male" || gender === "female") {
      result = { success: true, msg: "Gender is valid!" };
    }

    return result;
  }
}

module.exports = SignupValidation;
