const DB = require("./DB.js");
const { insertFileToS3, getFileFromS3 } = require("./s3");
const path = require("path");

// Check user is logged in
function userIsLoggedIn(req) {
  return req.session.user ? true : false;
}

class RouteHandler {
  // Render home page
  // home.ejs it checks for two conditions for toast note to appear only once when a user logs in and not on subsequent visit to home.ejs. It checks if there is a query parameter loginSuccess === true and if there is a user session
  static renderHomePage(req, res) {
    const loginSuccess = req.query.loginSuccess === "true";

    if (userIsLoggedIn(req)) {
      res.render("home", {
        loginSuccess,
        msg: "تم تسجيل الدخول بنجاح!",
        user: req.session.user,
      });
    } else {
      res.render("home");
    }
  }

  // Render sign up page
  static renderSignupPage(req, res) {
    res.render("signup");
  }

  // Sign up process (Returns {success: bool, msg: string} or {success: bool, msg: array})
  static async signupProcess(req, res) {
    const userData = req.body;
    const result = await DB.signup(userData);

    if (result.success === true) {
      console.log(result);
      res.redirect(`login?signupSuccess=true`);
    } else {
      console.log(result);
      res.render("signup", { errors: result.errors });
    }
  }

  // Render login page
  static renderLoginPage(req, res) {
    if (req.query.signupSuccess === "true") {
      res.render("login", { success: true, msg: "تم التسجيل بنجاح!" });
    } else if (req.query.logoutSuccess === "true") {
      res.render("login", { success: true, msg: "تم تسجيل الخروج بنجاح!" });
    } else if (req.query.loginSuccess === "false") {
      res.render("login", {
        success: false,
        msg: "اسم المستخدم، البريد الإلكتروني، أو كلمة المرور خطأ.",
      });
    } else {
      res.render("login");
    }
  }
  // Log in process ( Returns {success: bool, msg: string, user: obj })
  static async loginProcess(req, res) {
    const userCreds = req.body;
    const result = await DB.login(userCreds);

    if (result.success === true) {
      req.session.user = result.user;
      res.redirect(`/?loginSuccess=true`);
    } else {
      res.redirect(`login?loginSuccess=false`);
    }
  }

  // Check Username Already Exists in DB (For Frontend Validation), Return json of a boolean to the client side
  static async checkUsernameExists(req, res) {
    const username = req.body.username;
    const exists = await DB.checkUsernameExists(username);
    res.json(exists);
  }

  // Check Email Already Exists in DB (For Frontend Validation), Returns json of boolean to the client side
  static async checkEmailExists(req, res) {
    const email = req.body.email;
    const exists = await DB.checkEmailExists(email);
    res.json(exists);
  }

  // Render departments page
  static renderDepartments(req, res) {
    if (userIsLoggedIn(req)) {
      res.render("departments", { user: req.session.user });
    } else {
      res.render("departments");
    }
  }

  // Render courses page
  static async renderCourses(req, res) {
    const depAbbr = req.params.depAbbr;
    const courses = await DB.getCourses(depAbbr);
    if (userIsLoggedIn(req)) {
      res.render("courses", { courses, user: req.session.user });
    } else {
      res.render("courses", { courses });
    }
  }

  // Render posts page
  static async renderPosts(req, res) {
    const success = req.query.success === "true"; // for toast to work
    const courseId = req.params.courseId;
    let { courseCode, posts } = await DB.getPosts(courseId);

    // Convert date format
    posts.forEach((post) => {
      const date = new Date(post.created_at);
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      post.created_at = new Intl.DateTimeFormat("en-US", options).format(date);
    });

    if (userIsLoggedIn(req)) {
      res.render("posts", { courseCode, posts, user: req.session.user, success, msg: "تم إضافة المنشور بنجاح!" });
    } else if (userIsLoggedIn(req) === false && "needLogin" in req.query) {
      const err = "يجب تسجيل الدخول أولًا لإضافة منشور";
      res.render("posts", { courseCode, posts, err });
    } else {
      res.render("posts", { courseCode, posts });
    }
  }

  // Render add post page
  static async renderAddPost(req, res) {
    if (userIsLoggedIn(req)) {
      res.render("add-post", { user: req.session.user });
    } else {
      res.redirect("posts?needLogin");
    }
  }

  // Add post process
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
      fileSize: post.fileSize,
    };

    const insertPostToDBResponse = await DB.insertPostInfoToDB(postInfo);

    if (insertPostToDBResponse === true) {
      console.log("All success!");
      res.sendStatus(200);
    } else {
      res.status(400).json({ err: "insertPostToDBResponse() failed .." });
    }
  }

  // Download File
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

  // Logout
  static logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
      }
      res.redirect("/login?logoutSuccess=true");
    });
  }
}

module.exports = RouteHandler;
