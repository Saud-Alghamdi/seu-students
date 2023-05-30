import pkg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

class DB {
  // Connect
  static async connect() {
    try {
      const con = await pool.connect();
      console.log("Successfully connected to the database");
      return con;
    } catch (err) {
      console.error("Error connecting to the database", err);
      throw err;
    }
  }

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //

  // Sign up
  static async signup(userData) {
    let result;
    let con;
    try {
      con = await DB.connect();
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const query = {
        text: "INSERT INTO users (username, email, password, gender) VALUES ($1, $2, $3, $4)",
        values: [userData.username, userData.email, hashedPassword, userData.gender],
      };
      await con.query(query);
      result = { isSuccess: true, msg: "Sign up success!" };
    } catch (err) {
      console.error(err.message);
      result = { isSuccess: false, msg: "Sign up failed .." };
    } finally {
      if (con) {
        con.release();
        console.log("Database connection released.");
      }
    }
    return result;
  }

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //

  // Login
  static async login(userCreds) {
    let result;
    let con;
    try {
      con = await DB.connect();
      const query = {
        text: "SELECT * FROM users WHERE email ILIKE $1 OR username ILIKE $2;",
        values: [userCreds.usernameOrEmail, userCreds.usernameOrEmail],
      };
      const { rows } = await con.query(query);

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
      result = { isSuccess: false, msg: err.message };
    } finally {
      if (con) {
        con.release();
        console.log("Database connection released.");
      }
    }

    return result;
  }

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //

  // Check Username Already Exists in DB, return true or false
  static async checkUsernameExists(username) {
    let exists;
    let con;
    try {
      con = await DB.connect();
      const query = {
        text: "SELECT username FROM users WHERE username ILIKE $1",
        values: [username],
      };
      const { rows } = await con.query(query);

      if (rows.length > 0) {
        exists = true;
        throw new Error("Username already exists");
      } else {
        exists = false;
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      if (con) {
        con.release();
        console.log("Database connection released.");
      }
    }

    return exists;
  }

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //

  // Check Email Already Exists in DB, return true or false
  static async checkEmailExists(email) {
    let exists;
    let con;
    try {
      con = await DB.connect();
      const query = {
        text: "SELECT email FROM users WHERE email ILIKE $1",
        values: [email],
      };
      const { rows } = await con.query(query);

      if (rows.length > 0) {
        exists = true;
        throw new Error("Email already exists");
      } else {
        exists = false;
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      if (con) {
        con.release();
        console.log("Database connection released.");
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
      con = await DB.connect();
      const query = {
        text: `
        SELECT courses.code
        FROM courses
        INNER JOIN courses_departments ON courses.id = courses_departments.course_id
        INNER JOIN departments ON courses_departments.dep_id = departments.id
        WHERE departments.abbr ILIKE $1;
        `,
        values: [depAbbr],
      };
      const { rows } = await con.query(query);
      courses = rows;
      console.log(courses);
    } catch (err) {
      console.error(err.message);
    } finally {
      if (con) {
        con.release();
        console.log("Database connection released.");
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
      con = await DB.connect();

      // Check if the course code exists in the courses table
      const query1 = {
        text: `
        SELECT COUNT(*) AS count
        FROM courses
        WHERE code ILIKE $1;
      `,
        values: [courseCode],
      };
      const checkResult = await con.query(query1);
      const count = checkResult.rows[0].count;
      if (count === 0) {
        return null;
      }

      // Fetch the posts for the given course code
      const query2 = {
        text: `
        SELECT posts.title, posts.file_type AS "fileType", posts.s3_file_name AS "s3FileName", users.username, users.gender, posts."created_at" AS "createdAt"
        FROM posts
        JOIN users ON posts."user_id" = users.id
        JOIN courses ON posts."course_id" = courses.id
        WHERE courses.code ILIKE $1
        ORDER BY posts."created_at" DESC
        LIMIT $2
        OFFSET $3;
      `,
        values: [courseCode, limit, offset],
      };
      const postsResult = await con.query(query2);
      const posts = postsResult.rows;

      // Count the total number of posts for the given course code
      const query3 = {
        text: `
          SELECT COUNT(*) AS total_posts
          FROM posts
          JOIN courses ON posts."course_id" = courses.id
          WHERE courses.code ILIKE $1;
        `,
        values: [courseCode],
      };
      const countResult = await con.query(query3);
      const totalPosts = countResult.rows[0].total_posts;

      return { posts, totalPosts };
    } catch (err) {
      console.error(err.message);
      return null;
    } finally {
      if (con) {
        con.release();
        console.log("Database connection released.");
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
      con = await DB.connect();

      // Query1: retrieve the ID of the course with the given course code
      const query1 = {
        text: "SELECT id FROM courses WHERE code = $1",
        values: [postInfo.courseCode],
      };
      const { rows } = await con.query(query1);
      const courseId = rows[0].id;

      // Query2: Insert post info to DB
      const query2 = {
        text: "INSERT INTO posts (user_id, course_id, title, s3_file_name, s3_file_url, file_type, file_size_in_kb, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id",
        values: [postInfo.userId, courseId, postInfo.title, postInfo.s3FileName, postInfo.s3FileUrl, postInfo.fileType, postInfo.fileSizeInKB],
      };
      const result = await con.query(query2);

      // Query3: Grab post ID then insert it and its default download count to file_downloads table
      const postId = result.rows[0].id;
      const query3 = {
        text: "INSERT INTO file_downloads (post_id, count) VALUES ($1, $2);",
        values: [postId, 0],
      };
      await con.query(query3);

      isSuccess = true;
      console.log(result.rows);
    } catch (err) {
      console.error(err.message);
    } finally {
      if (con) {
        con.release();
        console.log("Database connection released.");
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
      con = await DB.connect();

      const query = `
        UPDATE file_downloads
        SET count = count + 1
        WHERE post_id IN (
          SELECT id
          FROM posts
          WHERE s3_file_name = $1
        );
      `;

      await con.query(query, [s3FileName]);
      isSuccess = true;
      console.log("Incremented file download count successfully!");
    } catch (err) {
      console.error(err.message);
    } finally {
      if (con) {
        con.release();
        console.log("Database connection released.");
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
      con = await DB.connect();

      // Delete from file downloads table
      const query1 = {
        text: "DELETE FROM file_downloads WHERE post_id IN (SELECT id FROM posts WHERE s3_file_name ILIKE $1)",
        values: [s3FileName],
      };
      await con.query(query1);

      // Delete from posts table
      const query2 = {
        text: "DELETE FROM posts WHERE s3_file_name ILIKE $1",
        values: [s3FileName],
      };
      const { rowCount } = await con.query(query2);

      isSuccess = true;
      console.log(rowCount + " row(s) deleted from posts table");
    } catch (err) {
      console.error(err.message);
    } finally {
      if (con) {
        con.release();
        console.log("Database connection released.");
      }
    }
    return isSuccess;
  }

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //

  // Update user account data based on user id (Builds the query depending on the properties given dynamically)
  static async updateAccountData(userData) {
    let result = {};
    let con;
    try {
      con = await DB.connect();
      let stmt = `UPDATE users SET `;
      let values = [];

      if (userData.username) {
        stmt += `username = $1, `;
        values.push(userData.username);
        result.newUsername = userData.username;
      }

      if (userData.email) {
        stmt += `email = $2, `;
        values.push(userData.email);
        result.newEmail = userData.email;
      }

      if (userData.password) {
        stmt += `password = $3, `;
        userData.password = await bcrypt.hash(userData.password, 10);
        values.push(userData.password);
        result.newPassword = userData.password;
      }

      // Remove the trailing comma and space from the stmt string
      stmt = stmt.slice(0, -2);

      // Add the WHERE clause to identify the user to update
      stmt += ` WHERE id = $2`;
      values.push(userData.id);

      const query = {
        text: stmt,
        values: values,
      };

      await con.query(query);

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
      con = await DB.connect();
      const query = {
        text: `
        SELECT
          posts.id,
          posts.title,
          posts.file_type AS "fileType",
          posts.s3_file_name AS "s3FileName",
          users.username,
          users.gender,
          posts.created_at AS "createdAt",
          courses.code AS "courseCode"
        FROM
          posts
          JOIN users ON posts.user_id = users.id
          JOIN courses ON posts.course_id = courses.id
        WHERE
          posts.user_id = $1
        ORDER BY
          posts.created_at DESC
        LIMIT $2
        OFFSET $3;
      `,
        values: [userId, limit, offset],
      };
      const { rows } = await con.query(query);
      const posts = rows;

      const countQuery = "SELECT COUNT(*) AS total_posts FROM posts WHERE user_id = $1";
      const countResult = await con.query(countQuery, [userId]);
      const totalPosts = countResult.rows[0].total_posts;

      return { posts, totalPosts };
    } catch (err) {
      console.error(err.message);
      return null;
    } finally {
      if (con) {
        con.release();
        console.log("Database connection released.");
      }
    }
  }

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //

  static async updatePostTitle(postId, newTitle) {
    let isSuccess = false;
    let con;
    try {
      con = await DB.connect();
      const query = {
        text: "UPDATE posts SET title = $1 WHERE id = $2",
        values: [newTitle, postId],
      };
      const { rowCount } = await con.query(query);
      isSuccess = rowCount > 0;
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
      con = await DB.connect();
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const query = {
        text: "UPDATE users SET password = $1 WHERE email ILIKE $2",
        values: [hashedPassword, email],
      };
      
      const { rowCount } = await con.query(query);
      if (rowCount > 0) {
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

export default DB;
