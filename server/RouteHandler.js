const DB = require("./DB.js");
const { insertFileToS3, getFileFromS3, deleteFileFromS3 } = require("./s3");
const path = require("path");
const helper = require("./helper");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 0 }); // Set cache expiry to 0 means no expiry
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

// Check user is logged in
function userIsLoggedIn(req) {
  return req.session.user ? true : false;
}

class RouteHandler {
  static renderHomePage(req, res) {
    // not logged in
    if (!userIsLoggedIn(req)) {
      res.render("home");
    }
    // just logged in
    else if (userIsLoggedIn(req) && req.query.loginSuccess === "true" && req.query.showToast === "true") {
      res.render("home", {
        justLoggedIn: true,
        toastMsg: "تم تسجيل الدخول بنجاح!",
        user: req.session.user,
      });
    }
    // already logged in
    else if (userIsLoggedIn(req)) {
      res.render("home", { user: req.session.user });
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static renderSignupPage(req, res) {
    if (req.query.signupSuccess === "false") {
      res.render("signup", {
        signupSuccess: false,
        toastMsg: "Sign up failed ..",
      });
    } else {
      res.render("signup");
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async signupProcess(req, res) {
    const userData = req.body;
    const result = await DB.signup(userData);

    if (result.isSuccess === true) {
      console.log("Sign up process successful! (signup process in RouteHandler.js)");
      res.redirect(`login?signupSuccess=true&showToast=true`);
    } else if (result.isSuccess === false) {
      console.log("Sign up process failed ... (signup process in RouteHandler.js)");
      res.redirect("signup?signupSuccess=true&showToast=true");
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static renderLoginPage(req, res) {
    // coming from signup
    if (req.query.signupSuccess === "true" && req.query.showToast === "true") {
      res.render("login", {
        signupSuccess: true,
        toastMsg: "تم التسجيل بنجاح!",
      });
    }
    // coming from logout
    else if (req.query.logoutSuccess === "true" && req.query.showToast === "true") {
      res.render("login", {
        logoutSuccess: true,
        toastMsg: "تم تسجيل الخروج بنجاح!",
      });
    }
    // coming from reset password + reset sent successfully
    else if (req.query.sendResetPasswordSuccess === "true") {
      res.render("login", {
        sendResetPasswordSuccess: true,
        toastMsg: "تم إرسال كلمة المرور الجديدة على بريدك الإلكتروني!",
      });
    }
    // coming from reset password + reset failed to send
    else if (req.query.sendResetPasswordSuccess === "false") {
      res.render("login", {
        sendResetPasswordSuccess: false,
        toastMsg: "حدث خطأ، لم نتمكن من إرسال كلمة المرور الجديدة ..",
      });
    }
    // Incorrect login credentials
    else if (req.query.loginSuccess === "false" && req.query.showToast === "true") {
      res.render("login", {
        loginSuccess: false,
        toastMsg: "اسم المستخدم أو البريد الإلكتروني أو كلمة المرور خطأ.",
      });
    }
    // coming from any other place other than the above
    else {
      res.render("login");
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async loginProcess(req, res) {
    const userCreds = req.body;
    const result = await DB.login(userCreds);

    if (result.isSuccess === true) {
      req.session.user = result.user;
      res.redirect(`/?loginSuccess=true&showToast=true`);
    } else if (result.isSuccess === false) {
      res.redirect(`/login?loginSuccess=false&showToast=true`);
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async renderResetPasswordPage(req, res) {
    if (req.query.emailExists === "false") {
      res.render("reset-password", {
        emailExists: false,
        toastMsg: "البريد الإلكتروني الذي أدخلته غير مسجل لدينا ..",
      });
    } else {
      res.render("reset-password");
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
      res.render("departments", { user: req.session.user });
    } else {
      res.render("departments");
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
      res.render("courses", { depAbbr, courses, user: req.session.user });
    } else {
      res.render("courses", { depAbbr, courses });
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async renderPostsPage(req, res) {
    const courseCode = req.params.courseCode;
    const limit = 10;
    const currentPage = parseInt(req.query.page) || 1;
    const offset = (currentPage - 1) * limit;
    const { posts, totalPosts } = await DB.getPosts(courseCode, limit, offset);
    const totalPages = Math.ceil(totalPosts / limit);

    // Non-existent course code
    if (posts === null) {
      res.redirect("/departments");
      return;
    }

    posts.forEach((post) => {
      post.createdAt = helper.formatDate(post.createdAt);
    });

    // Redirected after successfully adding post
    if (userIsLoggedIn(req) && req.query.postSuccess === "true" && req.query.showToast === "true") {
      res.render("posts", {
        courseCode,
        posts,
        currentPage,
        totalPages,
        user: req.session.user,
        postSuccess: true,
        toastMsg: "تم إضافة المنشور بنجاح!",
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
        toastMsg: "يجب تسجيل الدخول أولًا لإضافة منشور",
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
      });
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async renderAddPostPage(req, res) {
    if (userIsLoggedIn(req)) {
      res.render("add-post", { user: req.session.user });
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

    const response = await insertFileToS3(file);
    if (response.err) {
      console.log("insertFileToS3() failed ..");
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
      res.sendStatus(200);
    } else {
      res.status(400).json({ err: "insertPostToDBResponse() failed .." });
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
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
      }
      res.redirect("/login?logoutSuccess=true&showToast=true");
    });
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static renderDashboardPage(req, res) {
    if (userIsLoggedIn(req)) {
      res.render("dashboard", { user: req.session.user });
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
        toastMsg: "تم تحديث معلوماتك بنجاح!",
      });
    } else if (!userIsLoggedIn(req)) {
      res.send("<h3>Unauthorized access .. You must log in first</h3>");
    } else {
      res.render("my-account", { user: req.session.user });
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async updateUserDataProcess(req, res) {
    const userData = req.body;
    userData.id = req.session.user.id;
    const result = await DB.updateUserData(userData);
    if (result.isSuccess === true) {
      if (result.newUsername) req.session.user.username = result.newUsername;
      if (result.newEmail) req.session.user.email = result.newEmail;
      if (result.newPassword) req.session.user.password = result.newPassword;
      res.json({ isSuccess: true });
    } else {
      res.json({ isSuccess: false });
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
          toastMsg: "تم حذف المنشور بنجاح!",
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
          toastMsg: "فشل حذف المنشور ..",
        });
      }
      // Logged in + update post title successful
      else if (userIsLoggedIn(req) && req.query.updatePostTitleSuccess === "true") {
        res.render("my-posts", {
          user: req.session.user,
          posts,
          totalPages,
          currentPage,
          updatePostSuccess: true,
          toastMsg: "تم تعديل عنوان المنشور بنجاح!",
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
          updatePostSuccess: false,
          toastMsg: "فشل تعديل عنوان المنشور ..",
        });
      }
      // Logged in + there are posts
      else if (userIsLoggedIn(req) && posts.length > 0) {
        res.render("my-posts", { user: req.session.user, areTherePosts: true, posts, totalPages, currentPage });
      }
      // Logged in + there are NO posts
      else if (userIsLoggedIn(req) && posts.length === 0) {
        res.render("my-posts", { user: req.session.user, areTherePosts: false, toastMsg: "لم تقم بإضافة منشورات من قبل." });
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
      res.render("update-post-title", { user: req.session.user });
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

module.exports = RouteHandler;
