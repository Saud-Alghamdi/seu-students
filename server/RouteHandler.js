const DB = require("./DB.js");
const { insertFileToS3, getFileFromS3, deleteFileFromS3 } = require("./s3");
const path = require("path");
const helper = require("./helper");

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
    }
    res.render("signup");
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

  static async renderForgotPasswordPage(req, res) {
    res.render("forgot-password");
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async sendEmailForForgotPassowrdProcess(req, res) {
    const email = req.body.email;
    // Easily done by using mailersend service, but requires DNS records for a real domain
    // send email process here
    // after sending the random password, update the database with it
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
    const courses = await DB.getCourses(depAbbr);
    if (userIsLoggedIn(req)) {
      res.render("courses", { depAbbr, courses, user: req.session.user });
    } else {
      res.render("courses", { depAbbr, courses });
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async renderPostsPage(req, res) {
    const courseId = req.params.courseId;
    let { courseCode, posts } = await DB.getPosts(courseId);

    posts.forEach((post) => {
      post.createdAt = helper.formatDate(post.createdAt);
    });

    // Redirected after successfully adding post
    if (userIsLoggedIn(req) && req.query.postSuccess === "true" && req.query.showToast === "true") {
      res.render("posts", {
        courseCode,
        posts,
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
        needLogin: true,
        toastMsg: "يجب تسجيل الدخول أولًا لإضافة منشور",
      });
    }
    // Visit posts page anytime while logged in
    else {
      res.render("posts", {
        courseCode,
        posts,
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
    const response = await insertFileToS3(req);
    if (response.err) {
      console.log("insertFileToS3() failed ..");
      res.status(400).json({ err: response.err });
    }

    const post = response.post;
    const postInfo = {
      userId: req.session.user.id,
      courseId: req.params.courseId,
      title: post.title,
      s3FileName: post.fileName,
      s3FileUrl: post.filePath,
      fileType: post.fileType,
      fileSizeInKB: post.fileSizeInKB,
    };

    const insertPostToDBResponse = await DB.insertPostInfoToDB(postInfo);

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
    const getFileFromS3Response = await getFileFromS3(req);

    if (getFileFromS3Response.success) {
      const encodedTitle = encodeURIComponent(req.query.title);
      res.setHeader("Content-Disposition", `attachment; filename="${encodedTitle}${path.extname(req.query.s3FileName)}"`);
      res.setHeader("Content-type", getFileFromS3Response.file.ContentType);
      getFileFromS3Response.file.Body.pipe(res);
    } else {
      console.log("Error downloading file", err);
      res.status(500).send({ err: "Error downloading file." });
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static async deleteFile(req, res) {
    const deleteFileFromS3Response = await deleteFileFromS3(req);
    const s3FileName = req.query.s3FileName;

    if (deleteFileFromS3Response === true) {
      await DB.deletePostFromDB(s3FileName);
      console.log("post deleted successfully!");
      res.redirect(`./posts`);
      // trigger toast success
    } else {
      console.log("failed to delete post ...");
      res.redirect("./posts");
      // trigger toast fail
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
      res.json({ isSuccess: true });
    } else {
      res.json({ isSuccess: false });
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

  static renderMyPostsPage(req, res) {
    if (userIsLoggedIn(req)) {
      res.render("my-posts", { user: req.session.user });
    } else {
      res.send("<h3>Unauthorized access .. You must log in first</h3>");
    }
  }

  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
}

module.exports = RouteHandler;
