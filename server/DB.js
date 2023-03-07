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

  // Login
  static async login(userCreds) {
    let result = { success: false, msg: "Something went wrong" };
    try {
      const con = await this.connect();
      const stmt = "SELECT * FROM `users` WHERE `email` = ?";
      const [rows] = await con.query(stmt, [userCreds.email]);

      if (rows.length === 0) {
        throw new Error("Email or password is incorrect");
      }

      const hashedPassword = rows[0].password;
      const match = await bcrypt.compare(userCreds.password, hashedPassword);
      if (match) {
        result = { success: true, msg: "Log in successful", user: rows[0] };
      } else {
        throw new Error("Email or password is incorrect");
      }
    } catch (err) {
      console.log(err.message);
      result.msg = err.message;
    }

    return result;
  }

  static async update() {}
  static async delete() {}

  // Check Username Already Exists in DB (Backend Valdaition), return true or false
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

  // Check Email Already Exists in DB (Backend Validation), return true or false
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

  // Returns courses
  static async getCourses(depAbbr) {
    let courses = null;
    try {
      const con = await this.connect();
      const stmt = `
        SELECT courses.id, courses.code, courses.name
        FROM courses
        INNER JOIN departments ON courses.depId = departments.id
        WHERE departments.abbr = ?
        ORDER BY CAST(SUBSTRING_INDEX(courses.code, '-', -1) AS UNSIGNED) ASC
        `;
      const [rows] = await con.query(stmt, [depAbbr]);

      courses = rows;
      console.log(courses);
    } catch (err) {
      console.log(err.message);
    }
    return courses;
  }

  // Return posts
  static async getPosts(courseId) {
    let posts = null;
    try {
      const con = await this.connect();
      const stmt = "SELECT posts.title, posts.fileType, posts.s3FileName, users.username, users.gender, posts.createdAt FROM posts JOIN users ON posts.userId = users.id WHERE posts.courseId = ? ORDER BY posts.createdAt DESC";
      const [rows] = await con.query(stmt, [courseId]);

      posts = rows;
      console.log(posts);
    } catch (err) {
      console.log(err.message);
    }
    return posts;
  }

  // Insert Post to DB
  static async insertPostInfoToDB(postInfo) {
    let isSuccess = false;
    try {
      const con = await this.connect();

      // Get department ID based on abbreviation
      const [deptRows] = await con.query("SELECT id FROM Departments WHERE abbr = ?", [postInfo.depAbbr]);
      const deptId = deptRows[0].id;

      // Insert post info to DB
      const stmt = "INSERT INTO Posts (userId, depId, courseId, title, s3FileName, s3FileURL, fileType, fileSize) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
      const values = [postInfo.userId, deptId, postInfo.courseId, postInfo.title, postInfo.s3FileName, postInfo.s3FileUrl, postInfo.fileType, postInfo.fileSize];
      const [postRows] = await con.query(stmt, values);

      isSuccess = true;
      console.log(postRows);
    } catch (error) {
      console.error(error);
    }
    return isSuccess;
  }
}

module.exports = DB;
