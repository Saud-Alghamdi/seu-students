const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
const userDataValidation = require("./UserDataValidation");

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

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //

  // Sign up
  static async signup(userData) {
    let con;
    try {
      let usernameValidation = await userDataValidation.validateUsername(userData.username);
      let emailValidation = await userDataValidation.validateEmail(userData.email);
      let passwordValidation = await userDataValidation.validatePassword(userData.password);
      let genderValidation = await userDataValidation.validateGender(userData.gender);
      let usernameExists = await this.checkUsernameExists(userData.username);
      let emailExists = await this.checkEmailExists(userData.email);

      if (!usernameValidation.passed || !emailValidation.passed || !passwordValidation.passed || !genderValidation.passed || usernameExists === true || emailExists === true) {
        throw new Error("Validation failed to pass ...");
      } else {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        con = await this.connect();
        const stmt = "INSERT INTO users (username, email, password, gender) VALUES (?, ?, ?, ?);";
        await con.query(stmt, [userData.username, userData.email, hashedPassword, userData.gender]);
        return { isSuccess: true, msg: "Sign up success! (signup method inside DB.js)" };
      }
    } catch (err) {
      console.error(err.message);
      return { isSuccess: false, msg: "Sign up failed .. (signup method inside DB.js)" };
    } finally {
      if (con) {
        con.end();
        console.log("Database connection closed.");
      }
    }
  }

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //

  // Login
  static async login(userCreds) {
    let result = { isSuccess: false, msg: "Something went wrong" };
    let con;
    try {
      con = await this.connect();
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
      result.msg = err;
    } finally {
      if (con) {
        con.end();
        console.log("Database connection closed.");
      }
    }

    return result;
  }

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //

  // Check Username Already Exists in DB, return true or false
  static async checkUsernameExists(username) {
    let exists = true;
    let con;
    try {
      con = await this.connect();
      const stmt = "SELECT username FROM users WHERE username = ?;";
      const [rows] = await con.query(stmt, [username]);

      if (rows.length > 0) {
        throw new Error("Username already exists");
      } else {
        exists = false;
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      if (con) {
        con.end();
        console.log("Database connection closed.");
      }
    }

    return exists;
  }

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //

  // Check Email Already Exists in DB, return true or false
  static async checkEmailExists(email) {
    let exists = true;
    let con;
    try {
      con = await this.connect();
      const stmt = "SELECT email FROM users WHERE email = ?;";
      const [rows] = await con.query(stmt, [email]);

      if (rows.length > 0) {
        throw new Error("Email already exists");
      } else {
        exists = false;
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      if (con) {
        con.end();
        console.log("Database connection closed.");
      }
    }

    return exists;
  }

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //

  // Returns courses
  static async getCourses(depAbbr) {
    let courses = null;
    let con;
    try {
      con = await this.connect();
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
    } finally {
      if (con) {
        con.end();
        console.log("Database connection closed.");
      }
    }
    return courses;
  }

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //

  // Return posts
  static async getPosts(courseCode, limit = 10, offset = 0) {
    let con;
    try {
      con = await this.connect();

      // Check if the course code exists in the courses table
      const checkStmt = `
      SELECT COUNT(*) AS count
      FROM courses
      WHERE code = ?;
    `;
      const [checkRows] = await con.query(checkStmt, [courseCode]);
      const count = checkRows[0].count;
      if (count === 0) {
        return null;
      }

      // Fetch the posts for the given course code
      const postsStmt = `
      SELECT posts.title, posts.fileType, posts.s3FileName, users.username, users.gender, posts.createdAt
      FROM posts
      JOIN users ON posts.userId = users.id
      JOIN courses ON posts.courseId = courses.id
      WHERE courses.code = ?
      ORDER BY posts.createdAt DESC
      LIMIT ?
      OFFSET ?;
    `;
      const [postsRows] = await con.query(postsStmt, [courseCode, limit, offset]);
      const posts = postsRows;

      // Count the total number of posts for the given course code
      const countStmt = `
      SELECT COUNT(*) AS totalPosts
      FROM posts
      JOIN courses ON posts.courseId = courses.id
      WHERE courses.code = ?;
    `;
      const [countRows] = await con.query(countStmt, [courseCode]);
      const totalPosts = countRows[0].totalPosts;

      return { posts, totalPosts };
    } catch (err) {
      console.error(err.message);
      return null;
    } finally {
      if (con) {
        con.end();
        console.log("Database connection closed.");
      }
    }
  }

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //

  // Insert Post to DB and then grab the post ID and insert it to fileDownloads
  static async insertPostInfo(postInfo) {
    let isSuccess = false;
    let con;
    try {
      con = await this.connect();

      // Query the courses table to retrieve the ID of the course with the given code
      const [courseRows] = await con.query("SELECT id FROM courses WHERE code = ?", [postInfo.courseCode]);
      const courseId = courseRows[0].id;

      // Insert post info to DB
      const stmt1 = "INSERT INTO posts (userId, courseId, title, s3FileName, s3FileUrl, fileType, fileSizeInKB) VALUES (?, ?, ?, ?, ?, ?, ?);";
      const values = [postInfo.userId, courseId, postInfo.title, postInfo.s3FileName, postInfo.s3FileUrl, postInfo.fileType, postInfo.fileSizeInKB];

      const [postRows] = await con.query(stmt1, values);
      const postId = postRows.insertId; // Get the ID of the inserted post

      // Insert post ID and default download count to fileDownloads table
      const stmt2 = "INSERT INTO fileDownloads (postId, downloadCount) VALUES (?, ?);";
      const fileValues = [postId, 0];
      await con.query(stmt2, fileValues);

      isSuccess = true;
      console.log(postRows);
    } catch (err) {
      console.error(err.message);
    } finally {
      if (con) {
        con.end();
        console.log("Database connection closed.");
      }
    }
    return isSuccess;
  }

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //

  static async incrementFileDownloadCount(s3FileName) {
    let isSuccess = false;
    let con;
    try {
      con = await this.connect();

      const stmt = `
      UPDATE fileDownloads
      SET downloadCount = downloadCount + 1
      WHERE postId IN (
        SELECT id
        FROM posts
        WHERE s3FileName = ?
      );
      `;

      await con.query(stmt, s3FileName);
      isSuccess = true;
      console.log("Incremented file download count successfully!");
    } catch (err) {
      console.error(err.message);
    } finally {
      if (con) {
        con.end();
        console.log("Database connection closed.");
      }
    }

    return isSuccess;
  }

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //

  // Delete post from DB, then delete post record in fileDownloads
  static async deletePostFromDB(s3FileName) {
    let isSuccess = false;
    let con;
    try {
      con = await this.connect();

      // Delete from fileDownloads table
      const stmt1 = "DELETE FROM fileDownloads WHERE postId IN (SELECT id FROM posts WHERE s3FileName = ?)";
      await con.query(stmt1, [s3FileName]);

      // Delete from posts table
      const stmt2 = "DELETE FROM posts WHERE s3FileName = ?";
      const [rows] = await con.query(stmt2, [s3FileName]);

      isSuccess = true;
      console.log(rows);
    } catch (err) {
      console.error(err.message);
    } finally {
      if (con) {
        con.end();
        console.log("Database connection closed.");
      }
    }
    return isSuccess;
  }

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //

  // Update user account data based in user id (Builds the query depending on the properties given dynamically)
  static async updateUserData(userData) {
    let result = {};
    let con;
    try {
      con = await this.connect();
      let stmt = `UPDATE users SET `;
      let values = [];

      if (userData.username) {
        stmt += `username = ?, `;
        values.push(userData.username);
        result.newUsername = userData.username;
      }

      if (userData.email) {
        stmt += `email = ?, `;
        values.push(userData.email);
        result.newEmail = userData.email;
      }

      if (userData.password) {
        stmt += `password = ?, `;
        userData.password = await bcrypt.hash(userData.password, 10);
        values.push(userData.password);
        result.newPassword = userData.password;
      }

      // Remove the trailing comma and space from the stmt string
      stmt = stmt.slice(0, -2);

      // Add the WHERE clause to identify the user to update
      stmt += ` WHERE id = ?`;
      values.push(userData.id);

      const [rows] = await con.query(stmt, values);
      console.log(rows);
      result.isSuccess = true;
    } catch (err) {
      console.error(err.message);
      result.isSuccess = false;
    } finally {
      if (con) {
        con.end();
        console.log("Database connection closed.");
      }
    }
    return result;
  }

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //

  static async getPostsOfUser(userId, limit = 10, offset = 0) {
    let con;
    try {
      con = await this.connect();
      const stmt = `
        SELECT
          posts.id,
          posts.title,
          posts.fileType,
          posts.s3FileName,
          users.username,
          users.gender,
          posts.createdAt,
          courses.code AS courseCode
        FROM
          posts
          JOIN users ON posts.userId = users.id
          JOIN courses ON posts.courseId = courses.id
        WHERE
          posts.userId = ?
        ORDER BY
          posts.createdAt DESC
        LIMIT ?
        OFFSET ?;
      `;
      const [rows] = await con.query(stmt, [userId, limit, offset]);
      const posts = rows;

      const countStmt = "SELECT COUNT(*) AS totalPosts FROM posts WHERE userId = ?";
      const [countRows] = await con.query(countStmt, [userId]);
      const totalPosts = countRows[0].totalPosts;

      return { posts, totalPosts };
    } catch (err) {
      console.error(err.message);
      return null;
    } finally {
      if (con) {
        con.end();
        console.log("Database connection closed.");
      }
    }
  }

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //

  static async updatePostTitle(postId, newTitle) {
    let isSuccess = false;
    let con;
    try {
      con = await this.connect();
      const stmt = `
        UPDATE posts
        SET title = ?
        WHERE id = ?;
      `;
      const [result] = await con.query(stmt, [newTitle, postId]);
      isSuccess = result.affectedRows > 0;
    } catch (err) {
      console.error(err);
    } finally {
      if (con) {
        con.end();
        console.log("Database connection closed.");
      }
    }
    return isSuccess;
  }

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //

  static async updatePasswordViaEmail(email, newPassword) {
    let isSuccess = false;
    let con;
    try {
      con = await this.connect();
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const stmt = "UPDATE users SET password = ? WHERE email = ?";
      const [rows] = await con.query(stmt, [hashedPassword, email]);
      if (rows.affectedRows > 0) {
        isSuccess = true;
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      if (con) {
        con.end();
        console.log("Database connection closed.");
      }
    }
    return isSuccess;
  }
}

module.exports = DB;
