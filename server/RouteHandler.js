import DB from "./DB.js";
import { insertFileToS3, getFileFromS3, deleteFileFromS3 } from "./s3.js";
import path from "path";
import * as helper from "../common/helper.js";
import NodeCache from "node-cache";
import nodemailer from "nodemailer";
import { Validation } from "../common/Validation.js";

const cache = new NodeCache({ stdTTL: 0 }); // Set cache expiry to 0 means no expiry

// Check user is logged in
function userIsLoggedIn(req) {
  return req.session.user ? true : false;
}

class RouteHandler {
  static renderHomePage(req, res) {
    // not logged in
    if (!userIsLoggedIn(req)) {
      res.render("home", {
        langData: req.session.langData,
      });
    }
    // just logged in
    else if (userIsLoggedIn(req) && req.query.loginSuccess === "true") {
      res.render("home", {
        justLoggedIn: true,
        user: req.session.user,
        langData: req.session.langData,
      });
    }
    // already logged in
    else if (userIsLoggedIn(req)) {
      res.render("home", {
        user: req.session.user,
        langData: req.session.langData,
      });
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static renderSignupPage(req, res) {
    if (req.query.signupSuccess === "false") {
      res.render("signup", {
        signupSuccess: false,
        langData: req.session.langData,
      });
    } else {
      res.render("signup", {
        langData: req.session.langData,
      });
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async signupProcess(req, res) {
    const userData = req.body;

    const validationPromises = [Validation.validateUsername(userData.username), Validation.validateEmail(userData.email), Validation.validatePassword(userData.password, userData.repeatPassword), Validation.validateGender(userData.gender)];

    const validationResults = await Promise.all(validationPromises);
    const errors = [];

    validationResults.forEach((result) => {
      if (!result.passed) {
        errors.push(result.msg);
      }
    });

    const allValidationsPassed = errors.length === 0;

    if (!allValidationsPassed) {
      console.log(errors);
      res.redirect("signup?signupSuccess=false");
      return;
    }

    const signupInDB = await DB.signup(userData);

    if (signupInDB.isSuccess === true) {
      console.log("Sign up process successful!");
      res.redirect(`login?signupSuccess=true`);
    } else if (signupInDB.isSuccess === false) {
      console.log("Sign up process failed ...");
      res.redirect("signup?signupSuccess=false");
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static renderLoginPage(req, res) {
    // coming from signup
    if (req.query.signupSuccess === "true") {
      res.render("login", {
        signupSuccess: true,
        langData: req.session.langData,
      });
    }
    // coming from logout
    else if (req.query.logoutSuccess === "true") {
      res.render("login", {
        logoutSuccess: true,
        langData: req.session.langData,
      });
    }
    // coming from reset password + reset sent successfully
    else if (req.query.sendResetPasswordSuccess === "true") {
      res.render("login", {
        sendResetPasswordSuccess: true,
        langData: req.session.langData,
      });
    }
    // coming from reset password + reset failed to send
    else if (req.query.sendResetPasswordSuccess === "false") {
      res.render("login", {
        sendResetPasswordSuccess: false,
        langData: req.session.langData,
      });
    }
    // Incorrect login credentials
    else if (req.query.loginSuccess === "false") {
      res.render("login", {
        loginSuccess: false,
        langData: req.session.langData,
      });
    }
    // coming from any other place other than the above
    else {
      res.render("login", {
        langData: req.session.langData,
      });
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async loginProcess(req, res) {
    const userCreds = req.body;
    const result = await DB.login(userCreds);

    if (result.isSuccess === true) {
      req.session.user = result.user;
      res.redirect(`/?loginSuccess=true`);
    } else if (result.isSuccess === false) {
      res.redirect(`/login?loginSuccess=false`);
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async renderResetPasswordPage(req, res) {
    if (req.query.emailExists === "false") {
      res.render("reset-password", {
        emailExists: false,
        langData: req.session.langData,
      });
    } else {
      res.render("reset-password", {
        langData: req.session.langData,
      });
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async sendEmailToResetPassword(req, res) {
    const userEmail = req.body.email;
    const newRandomPassword = Math.random().toString(36).slice(-8);
    const updatePasswordInDB = await DB.updatePasswordViaEmail(userEmail, newRandomPassword);

    if (updatePasswordInDB === false) {
      res.redirect("/reset-password?emailExists=false");
      return;
    }

    // Create a nodemailer transporter object
    const transporter = nodemailer.createTransport({
      host: "smtp.privateemail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD,
      },
    });

    // Send the password reset email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: userEmail,
      subject: "Password reset",
      text: `Your new password is: ${newRandomPassword}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        console.log("Failed to send password reset email");
        res.redirect("/login?sendResetPasswordSuccess=false");
      } else {
        console.log("Password reset email sent: " + info.response);
        res.redirect("/login?sendResetPasswordSuccess=true");
      }
    });
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async checkUsernameExists(req, res) {
    const username = req.body.username;
    const exists = await DB.checkUsernameExists(username);
    res.json(exists);
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async checkEmailExists(req, res) {
    const email = req.body.email;
    const exists = await DB.checkEmailExists(email);
    res.json(exists);
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static renderDepartmentsPage(req, res) {
    if (userIsLoggedIn(req)) {
      res.render("departments", {
        user: req.session.user,
        langData: req.session.langData,
      });
    } else {
      res.render("departments", {
        langData: req.session.langData,
      });
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async renderCoursesPage(req, res) {
    const depAbbr = req.params.depAbbr;
    let courses;

    // Check if courses data is in cache
    const cacheKey = `courses_${depAbbr}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      courses = cachedData;
    } else {
      // If courses data is not in cache, fetch from database and store in cache
      courses = await DB.getCourses(depAbbr);
      cache.set(cacheKey, courses);
    }

    if (userIsLoggedIn(req)) {
      res.render("courses", {
        depAbbr,
        courses,
        user: req.session.user,
        langData: req.session.langData,
      });
    } else {
      res.render("courses", {
        depAbbr,
        courses,
        langData: req.session.langData,
      });
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async renderPostsPage(req, res) {
    const courseCode = req.params.courseCode;
    const limit = 10;
    const currentPage = parseInt(req.query.page) || 1;
    const offset = (currentPage - 1) * limit;
    const result = await DB.getPosts(courseCode, limit, offset);

    // if course code requested does not exist
    if (result === null) {
      res.redirect("/departments");
      return;
    }

    const { posts, totalPosts } = result;
    console.log(totalPosts);
    const totalPages = Math.ceil(totalPosts / limit);

    posts.forEach((post) => {
      post.createdAt = helper.formatDate(post.createdAt);
    });

    // Redirected after successfully adding post
    if (userIsLoggedIn(req) && req.query.addPostSuccess === "true") {
      res.render("posts", {
        courseCode,
        posts,
        currentPage,
        totalPages,
        user: req.session.user,
        addPostSuccess: true,
        langData: req.session.langData,
      });
    }
    // Trying to visit add-post page while not logged in
    else if (!userIsLoggedIn(req) && "needLogin" in req.query) {
      res.render("posts", {
        courseCode,
        posts,
        currentPage,
        totalPages,
        needLogin: true,
        langData: req.session.langData,
      });
    }
    // Visit posts page anytime while logged in
    else {
      res.render("posts", {
        courseCode,
        posts,
        currentPage,
        totalPages,
        user: req.session.user,
        langData: req.session.langData,
      });
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async renderAddPostPage(req, res) {
    // Failed to add a post
    if (userIsLoggedIn(req) && req.query.addPostSuccess === "false") {
      res.render("add-post", {
        user: req.session.user,
        addPostSuccess: false,
        langData: req.session.langData,
      });
      // User is logged in and has requested the page
    } else if (userIsLoggedIn(req)) {
      res.render("add-post", {
        user: req.session.user,
        langData: req.session.langData,
      });
      // Not logged in
    } else {
      res.redirect("posts?needLogin");
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async addPostProcess(req, res) {
    const file = {
      ...(req.body || {}),
      ...(req.file || {}),
    };

    let validation = await Validation.validatePostFile(file);

    if (!validation.passed) {
      res.redirect("add-post?addPostSuccess=false");
      return;
    }

    const response = await insertFileToS3(file);
    if (response.err) {
      res.status(400).json({ err: response.err });
    }

    const post = response.post;
    const postInfo = {
      userId: req.session.user.id,
      courseCode: req.params.courseCode,
      title: post.title,
      s3FileName: post.fileName,
      s3FileUrl: post.filePath,
      fileType: post.fileType,
      fileSizeInKB: post.compressedFileSizeInKB,
    };

    const insertPostToDBResponse = await DB.insertPostInfo(postInfo);

    if (insertPostToDBResponse === true) {
      console.log("All success!");
      res.redirect("posts?addPostSuccess=true");
    } else {
      res.redirect("add-post?addPostSuccess=false");
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async downloadFile(req, res) {
    const s3FileName = req.query.s3FileName;
    const getFileFromS3Response = await getFileFromS3(s3FileName);

    // if gzip file
    if (getFileFromS3Response.success && getFileFromS3Response.ContentEncoding === "gzip") {
      const encodedTitle = encodeURIComponent(req.query.title);
      const ContentType = getFileFromS3Response.ContentType;
      const fileBuffer = getFileFromS3Response.buffer;

      res.setHeader("Content-Disposition", `attachment; filename="${encodedTitle}${path.extname(s3FileName)}"`);
      res.setHeader("Content-type", ContentType);

      res.write(fileBuffer);
      res.end();

      await DB.incrementFileDownloadCount(s3FileName);
      console.log("File downloaded successfully!");
    }
    // Not gzip file
    else if (getFileFromS3Response.success && getFileFromS3Response.ContentEncoding !== "gzip") {
      const encodedTitle = encodeURIComponent(req.query.title);

      res.setHeader("Content-Disposition", `attachment; filename="${encodedTitle}${path.extname(s3FileName)}"`);

      res.setHeader("Content-type", getFileFromS3Response.file.ContentType);

      getFileFromS3Response.file.Body.pipe(res);

      await DB.incrementFileDownloadCount(s3FileName);
      console.log("File downloaded successfully!");
    } else {
      console.log("Error downloading file", err);
      res.status(500).send({ err: "Error downloading file." });
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static logout(req, res) {
    // Delete req.session.user property
    delete req.session.user;

    // Save changes to session and redirect to logout success page
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
      }
      res.redirect("/login?logoutSuccess=true");
    });
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static renderDashboardPage(req, res) {
    if (userIsLoggedIn(req)) {
      res.render("dashboard", {
        user: req.session.user,
        langData: req.session.langData,
      });
    } else {
      res.send("<h3>Unauthorized access .. You must log in first</h3>");
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static renderMyAccountPage(req, res) {
    if (req.query.updateSuccess === "true") {
      res.render("my-account", {
        user: req.session.user,
        updateSuccess: true,
        langData: req.session.langData,
      });
    } else if (!userIsLoggedIn(req)) {
      res.send("<h3>Unauthorized access .. You must log in first</h3>");
    } else {
      res.render("my-account", {
        user: req.session.user,
        langData: req.session.langData,
      });
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async updateAccountDataProcess(req, res) {
    const userData = req.body;
    let validation;

    if (userData.username) {
      const username = userData.username;
      validation = await Validation.validateUsername(username);
    } else if (userData.email) {
      const email = userData.email;
      validation = await Validation.validateEmail(email);
    } else if (userData.password) {
      const password = userData.password;
      const repeatPassword = userData.repeatPassword;
      validation = await Validation.validatePassword(password, repeatPassword);
    }

    if (!validation.passed) {
      res.redirect("my-account?updateSuccess=false");
      console.log(validation.msg);
      return;
    }

    userData.id = req.session.user.id;
    const updateAccountDataInDB = await DB.updateAccountData(userData);

    if (updateAccountDataInDB.isSuccess === true) {
      if (updateAccountDataInDB.newUsername) {
        req.session.user.username = updateAccountDataInDB.newUsername;
      } else if (updateAccountDataInDB.newEmail) {
        req.session.user.email = updateAccountDataInDB.newEmail;
      } else if (updateAccountDataInDB.newPassword) {
        req.session.user.password = updateAccountDataInDB.newPassword;
      }
      res.redirect("my-account?updateSuccess=true");
    } else {
      res.redirect("my-account?updateSuccess=false");
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async renderMyPostsPage(req, res) {
    try {
      const userId = req.session.user.id;
      const limit = 10;
      const currentPage = parseInt(req.query.page) || 1;
      const offset = (currentPage - 1) * limit;
      const { posts, totalPosts } = await DB.getPostsOfUser(userId, limit, offset);
      const totalPages = Math.ceil(totalPosts / limit);

      posts.forEach((post) => {
        post.createdAt = helper.formatDate(post.createdAt);
      });

      // Logged in + there are posts + delete post successful
      if (userIsLoggedIn(req) && posts.length > 0 && req.query.deletePostSuccess === "true") {
        res.render("my-posts", {
          user: req.session.user,
          areTherePosts: true,
          posts,
          totalPages,
          currentPage,
          deletePostSuccess: true,
          langData: req.session.langData,
        });
      }
      // Logged in + there are posts + delete post failed
      else if (userIsLoggedIn(req) && posts.length > 0 && req.query.deletePostSuccess === "false") {
        res.render("my-posts", {
          user: req.session.user,
          areTherePosts: true,
          posts,
          totalPages,
          currentPage,
          deletePostSuccess: false,
          langData: req.session.langData,
        });
      }
      // Logged in + update post title successful
      else if (userIsLoggedIn(req) && req.query.updatePostTitleSuccess === "true") {
        res.render("my-posts", {
          user: req.session.user,
          posts,
          totalPages,
          currentPage,
          updatePostTitleSuccess: true,
          langData: req.session.langData,
        });
      }
      // Logged in + update post title failed
      else if (userIsLoggedIn(req) && req.query.updatePostTitleSuccess === "false") {
        res.render("my-posts", {
          user: req.session.user,
          areTherePosts: true,
          posts,
          totalPages,
          currentPage,
          updatePostTitleSuccess: false,
          langData: req.session.langData,
        });
      }
      // Logged in + there are posts
      else if (userIsLoggedIn(req) && posts.length > 0) {
        res.render("my-posts", {
          user: req.session.user,
          areTherePosts: true,
          posts,
          totalPages,
          currentPage,
          langData: req.session.langData,
        });
      }
      // Logged in + there are NO posts
      else if (userIsLoggedIn(req) && posts.length === 0) {
        res.render("my-posts", {
          user: req.session.user,
          areTherePosts: false,
          langData: req.session.langData,
        });
      }
      // Other - Default
      else {
        res.send("<h3>Unauthorized access .. You must log in first</h3>");
      }
    } catch (err) {
      console.error(err.message);
      res.send("<h3>Unauthorized access .. You must log in first</h3>");
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async deletePost(req, res) {
    const s3FileName = req.body.s3FileName;
    const deleteFileFromS3Response = await deleteFileFromS3(s3FileName);

    if (deleteFileFromS3Response === true) {
      await DB.deletePostFromDB(s3FileName);
      console.log("post deleted successfully!");
      res.redirect(`/dashboard/my-posts?deletePostSuccess=true`);
    } else {
      console.log("failed to delete post ...");
      res.redirect("/dashboard/my-posts?deletePostSuccess=false");
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async renderUpdatePostTitlePage(req, res) {
    if (userIsLoggedIn(req)) {
      res.render("update-post-title", {
        user: req.session.user,
        langData: req.session.langData,
      });
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async updatePostTitleProcess(req, res) {
    const postId = req.params.postId;
    const newTitle = req.body.newTitle;
    const response = await DB.updatePostTitle(postId, newTitle);

    if (response === true) {
      res.redirect("/dashboard/my-posts?updatePostTitleSuccess=true");
    } else {
      res.redirect("/dashboard/my-posts?updatePostTitleSuccess=false");
    }
  }
}

export default RouteHandler;
