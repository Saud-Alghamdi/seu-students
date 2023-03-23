const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
const SignupValidation = require("./SignupValidation");

class DB {
  // Connect
  static async connect() {
    let con = null;
    try {
      con = await mysql.createConnection({
        host: process.env.MYSQLHOST,
        user: process.env.MYSQLUSER,
        port: process.env.MYSQLPORT,
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE,
      });
      console.log("Connected to database successfully!");
    } catch (error) {
      console.error("Error connecting to database:", error);
    }
    return con;
  }

  // Sign up
  static async signup(userData) {
    try {
      let usernameValidation = await SignupValidation.validateUsername(userData.username);
      let emailValidation = await SignupValidation.validateEmail(userData.email);
      let passwordValidation = await SignupValidation.validatePassword(userData.password);
      let genderValidation = await SignupValidation.validateGender(userData.gender);
      let usernameExists = await this.checkUsernameExists(userData.username);
      let emailExists = await this.checkEmailExists(userData.email);

      if (!usernameValidation.passed || !emailValidation.passed || !passwordValidation.passed || !genderValidation.passed || usernameExists === true || emailExists === true) {
        throw new Error("Validation failed to pass ...");
      } else {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const con = await this.connect();
        const stmt = "INSERT INTO users (username, email, password, gender) VALUES (?, ?, ?, ?);";
        await con.query(stmt, [userData.username, userData.email, hashedPassword, userData.gender]);
        return { isSuccess: true, msg: "Sign up success! (signup method inside DB.js)" };
      }
    } catch (err) {
      console.error(err.message);
      return { isSuccess: false, msg: "Sign up failed .. (signup method inside DB.js)" };
    }
  }

  // Login
  static async login(userCreds) {
    let result = { isSuccess: false, msg: "Something went wrong" };
    try {
      const con = await this.connect();
      const stmt = "SELECT * FROM users WHERE email = ? OR username = ?;";
      const [rows] = await con.query(stmt, [userCreds.usernameOrEmail, userCreds.usernameOrEmail]);

      if (rows.length === 0) {
        throw new Error("Email or password is incorrect");
      }

      const hashedPassword = rows[0].password;
      const match = await bcrypt.compare(userCreds.password, hashedPassword);
      if (match) {
        result = { isSuccess: true, msg: "Log in successful", user: rows[0] };
      } else {
        throw new Error("Email or password is incorrect");
      }
    } catch (err) {
      console.error(err.message);
      result.msg = err.message;
    }

    return result;
  }

  // Check Username Already Exists in DB, return true or false
  static async checkUsernameExists(username) {
    let exists = true;
    try {
      const con = await this.connect();
      const stmt = "SELECT username FROM users WHERE username = ?;";
      const [rows] = await con.query(stmt, [username]);

      if (rows.length > 0) {
        throw new Error("Username already exists");
      } else {
        exists = false;
      }
    } catch (err) {
      console.error(err.message);
    }

    return exists;
  }

  // Check Email Already Exists in DB, return true or false
  static async checkEmailExists(email) {
    let exists = true;
    try {
      const con = await this.connect();
      const stmt = "SELECT email FROM users WHERE email = ?;";
      const [rows] = await con.query(stmt, [email]);

      if (rows.length > 0) {
        throw new Error("Email already exists");
      } else {
        exists = false;
      }
    } catch (err) {
      console.error(err.message);
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
      INNER JOIN courseDepartments ON courses.id = courseDepartments.courseId
      INNER JOIN departments ON courseDepartments.depId = departments.id
      WHERE departments.abbr = ?
      ORDER BY LEFT(courses.code, 1) ASC, CAST(SUBSTRING_INDEX(courses.code, '-', -1) AS UNSIGNED) ASC
      ;
        `;
      const [rows] = await con.query(stmt, [depAbbr]);
      courses = rows;
      console.log(courses);
    } catch (err) {
      console.error(err.message);
    }
    return courses;
  }

  // Return posts
  static async getPosts(courseId) {
    try {
      const con = await this.connect();

      // Fetch the course code for the given courseId
      const courseCodeStmt = "SELECT code FROM courses WHERE id = ?";
      const [courseCodeRows] = await con.query(courseCodeStmt, [courseId]);
      const courseCode = courseCodeRows[0].code;

      // Fetch the posts for the given courseId
      const postsStmt = `
        SELECT
          posts.title,
          posts.fileType,
          posts.s3FileName,
          users.username,
          users.gender,
          posts.createdAt
        FROM
          posts
          JOIN users ON posts.userId = users.id
        WHERE
          posts.courseId = ?
        ORDER BY
          posts.createdAt DESC;
      `;
      const [postsRows] = await con.query(postsStmt, [courseId]);
      const posts = postsRows;

      // Return an object with the course code and posts array
      return { courseCode, posts };
    } catch (err) {
      console.error(err.message);
      return null;
    }
  }

  // Insert Post to DB
  static async insertPostInfoToDB(postInfo) {
    let isSuccess = false;
    try {
      const con = await this.connect();

      // Insert post info to DB
      const stmt = "INSERT INTO posts (userId, courseId, title, s3FileName, s3FileUrl, fileType, fileSizeInKB) VALUES (?, ?, ?, ?, ?, ?, ?);";
      const values = [postInfo.userId, postInfo.courseId, postInfo.title, postInfo.s3FileName, postInfo.s3FileUrl, postInfo.fileType, postInfo.fileSizeInKB];

      const [rows] = await con.query(stmt, values);
      isSuccess = true;
      console.log(rows);
    } catch (err) {
      console.error(err.message);
    }
    return isSuccess;
  }

  // Delete post from DB
  static async deletePostFromDB(s3FileName) {
    let isSuccess = false;
    try {
      const con = await this.connect();
      const stmt = "DELETE FROM posts WHERE s3FileName = ?";
      const [rows] = await con.query(stmt, [s3FileName]);
      isSuccess = true;
      console.log(rows);
    } catch (err) {
      console.error(err.message);
    }
    return isSuccess;
  }

  static async update() {}
}

module.exports = DB;
