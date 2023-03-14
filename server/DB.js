const { Client } = require("pg");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
const SignupValidation = require("./SignupValidation");

class DB {
  // Connect
  static async connect() {
    const client = new Client({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      port: process.env.DB_PORT,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    try {
      await client.connect();
      console.log("Connected to database successfully!");
      return client;
    } catch (error) {
      console.error("Error connecting to database:", error);
    }
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
        const client = await this.connect();
        const stmt = "INSERT INTO users (username, email, password, gender) VALUES ($1, $2, $3, $4);";
        await client.query(stmt, [userData.username, userData.email, hashedPassword, userData.gender]);
        result = { success: true, msg: "Sign up successful" };
        await client.end();
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
      const client = await this.connect();
      const stmt = "SELECT * FROM users WHERE email = $1 OR username = $2;";
      const res = await client.query(stmt, [userCreds.usernameOrEmail, userCreds.usernameOrEmail]);

      if (res.rows.length === 0) {
        throw new Error("Email or password is incorrect");
      }

      const hashedPassword = res.rows[0].password;
      const match = await bcrypt.compare(userCreds.password, hashedPassword);
      if (match) {
        result = { success: true, msg: "Log in successful", user: res.rows[0] };
      } else {
        throw new Error("Email or password is incorrect");
      }
      await client.end();
    } catch (err) {
      console.log(err.message);
      result.msg = err.message;
    }

    return result;
  }
  // Check Username Already Exists in DB (Backend Valdaition), return true or s3fileurl
  static async checkUsernameExists(username) {
    let exists = true;
    try {
      const client = await this.connect();
      const stmt = "SELECT username FROM users WHERE username = $1;";
      const res = await client.query(stmt, [username]);

      if (res.rows.length > 0) {
        throw new Error("Username already exists");
      } else {
        exists = false;
      }
      await client.end();
    } catch (err) {
      console.log(err.message);
    }

    return exists;
  }

  // Check Email Already Exists in DB (Backend Validation), return true or false
  static async checkEmailExists(email) {
    let exists = true;
    try {
      const client = await this.connect();
      const stmt = "SELECT email FROM users WHERE email = $1;";
      const res = await client.query(stmt, [email]);

      if (res.rows.length > 0) {
        throw new Error("Email already exists");
      } else {
        exists = false;
      }
      await client.end();
    } catch (err) {
      console.log(err.message);
    }

    return exists;
  }

  // Returns courses
  static async getCourses(depAbbr) {
    let courses = null;
    try {
      const client = await this.connect();
      const stmt = `
      SELECT courses.id, courses.code, courses.name
      FROM courses
      INNER JOIN course_departments ON courses.id = course_departments.course_id
      INNER JOIN departments ON course_departments.dep_id = departments.id
      WHERE departments.abbr = $1
      ORDER BY LEFT(courses.code, 1) ASC, CAST(SUBSTRING(courses.code FROM '[0-9]+') AS INTEGER) ASC;
        `;
      const res = await client.query(stmt, [depAbbr]);
      courses = res.rows;
      console.log(courses);
      await client.end();
    } catch (err) {
      console.log(err.message);
    }
    return courses;
  }

  // Return posts
  static async getPosts(courseId) {
    try {
      const client = await this.connect();

      // Fetch the course code for the given courseId
      const codeQuery = "SELECT code FROM courses WHERE id = $1";
      const codeResult = await client.query(codeQuery, [courseId]);
      const courseCode = codeResult.rows[0].code;

      // Fetch the posts for the given courseId
      const postsQuery = `
        SELECT
          posts.title,
          posts.file_type,
          posts.s3_file_name,
          users.username,
          users.gender,
          posts.created_at
        FROM
          posts
          JOIN users ON posts.user_id = users.id
        WHERE
          posts.course_id = $1
        ORDER BY
          posts.created_at DESC;
      `;
      const postsResult = await client.query(postsQuery, [courseId]);
      const posts = postsResult.rows;

      await client.end();

      // Return an object with the course code and posts array
      return { courseCode, posts };
    } catch (err) {
      console.log(err.message);
      return null;
    }
  }

  // Insert Post to DB
  static async insertPostInfoToDB(postInfo) {
    let isSuccess = false;
    try {
      const client = await this.connect();

      // Insert post info to DB
      const stmt = "INSERT INTO posts (user_id, course_id, title, s3_file_name, s3_file_url, file_type, file_size) VALUES ($1, $2, $3, $4, $5, $6, $7);";
      const values = [postInfo.userId, postInfo.courseId, postInfo.title, postInfo.s3FileName, postInfo.s3FileUrl, postInfo.fileType, postInfo.fileSize];

      const res = await client.query(stmt, values);
      isSuccess = true;
      console.log(res.rows);
      await client.end();
    } catch (error) {
      console.error(error);
    }
    return isSuccess;
  }

  static async update() {}
  static async delete() {}
}

module.exports = DB;
