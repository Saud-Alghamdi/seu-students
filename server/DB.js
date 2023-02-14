const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const SignupValidation = require("./SignupValidation");

class DB {
  // Connect
  static async connect() {
    let con;
    try {
      con = await mysql.createConnection({
        host: "localhost",
        user: "root",
        database: "seu-students",
      });
    } catch (err) {
      console.log(err);
      throw new Error("Connection to DB failed");
    }
    return con;
  }

  // Sign up
  static async signup(userData) {
    let result = { success: false, errors: [] };
    try {
      let usernameValidation = await SignupValidation.validateUsername(userData.username);
      if (!usernameValidation.success) result.errors.push(usernameValidation.msg);

      let emailValidation = await SignupValidation.validateEmail(userData.email);
      if (!emailValidation.success) result.errors.push(emailValidation.msg);

      let passwordValidation = await SignupValidation.validatePassword(userData.password);
      if (!passwordValidation.success) result.errors.push(passwordValidation.msg);

      let genderValidation = await SignupValidation.validateGender(userData.gender);
      if (!genderValidation.success) result.errors.push(genderValidation.msg);

      let usernameExists = await this.checkUsernameExists(userData.username);
      if (usernameExists === true) result.errors.push("Username already exists");

      let emailExists = await this.checkEmailExists(userData.email);
      if (emailExists === true) result.errors.push("Email already exists");

      if (result.errors.length === 0) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const con = await this.connect();
        const stmt = "INSERT INTO `users` (`username`, `email`, `password`, `gender`) VALUES (?, ?, ?, ?)";
        await con.query(stmt, [userData.username, userData.email, hashedPassword, userData.gender]);
        result = { success: true, msg: "Sign up successful" };
      }
    } catch (err) {
      console.log(err.message);
      result.errors.push(err.message);
    }
    return result;
  }

  static async login(userData) {
    let result = { success: false, msg: "Something went wrong" };
    try {
      const con = await this.connect();
      const stmt = "SELECT `username`, `password` FROM `users` WHERE `email` = ?";
      const [rows] = await con.query(stmt, [userData.email]);

      if (rows.length === 0) {
        throw new Error("Email or password is incorrect");
      }

      const hashedPassword = rows[0].password;
      const match = await bcrypt.compare(userData.password, hashedPassword);
      if (match) {
        result = { success: true, msg: "Log in successful" };
      } else {
        throw new Error("Email or password is incorrect");
      }
    } catch (err) {
      console.log(err.message);
      result.msg = err.message;
    }

    return result;
  }

  static async logout() {}
  static async update() {}
  static async delete() {}

  // Check Username Already Exists in DB
  static async checkUsernameExists(username) {
    let exists = true;
    try {
      const con = await this.connect();
      const stmt = "SELECT `username` FROM `users` WHERE `username` = ?";
      const [rows] = await con.query(stmt, [username]);

      if (rows.length > 0) {
        throw new Error("Username already exists");
      } else {
        exists = false;
      }
    } catch (err) {
      console.log(err.message);
    }

    return exists;
  }

  // Check Email Already Exists in DB (FOR BACK-END)
  static async checkEmailExists(email) {
    let exists = true;
    try {
      const con = await this.connect();
      const stmt = "SELECT `email` FROM `users` WHERE `email` = ?";
      const [rows] = await con.query(stmt, [email]);

      if (rows.length > 0) {
        throw new Error("Email already exists");
      } else {
        exists = false;
      }
    } catch (err) {
      console.log(err.message);
    }

    return exists;
  }
}

module.exports = DB;
