const DB = require("./DB.js");
const { insertFileToS3, getFileFromS3 } = require("./s3");
const path = require("path");

// Check user is logged in
function userIsLoggedIn(req) {
  return req.session.user ? true : false;
}

class RouteHandler {
  // Render home page
  static renderHomePage(req, res) {
    if (userIsLoggedIn(req)) {
      res.render("home", {
        success: true,
        msg: "Logged in successfully!",
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
      res.redirect(`login?success=${encodeURIComponent(result.success)}&msg=${encodeURIComponent(result.msg)}`);
    } else {
      console.log(result);
      res.render("signup", { errors: result.errors });
    }
  }

  // Render login page
  static renderLoginPage(req, res) {
    if (typeof req.query.success === "undefined") {
      res.render("login");
    } else if (req.query.success === "true") {
      res.render("login", { success: true, msg: "Sign up successful!" });
    } else if (req.query.success === "false") {
      res.render("login", {
        success: false,
        msg: "Username or password is incorrect",
      });
    }
  }

  // Log in process ( Returns {success: bool, msg: string, user: obj })
  static async loginProcess(req, res) {
    const userCreds = req.body;
    const result = await DB.login(userCreds);

    if (result.success === true) {
      req.session.user = result.user;
      console.log(result);
      res.redirect(`/?success=${encodeURIComponent(result.success)}`);
    } else {
      console.log(result);
      res.redirect(`login?success=${encodeURIComponent(result.success)}`);
    }
  }

  // Check Username Already Exists in DB (For Frontend Validation), Returns json of boolean to the client side
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
    const courseId = req.params.courseId;
    const posts = await DB.getPosts(courseId);
    if (userIsLoggedIn(req)) {
      res.render("posts", { posts, user: req.session.user });
    } else if (userIsLoggedIn(req) === false && "needLogin" in req.query) {
      const err = "You must be logged in order to add a post";
      res.render("posts", { posts, err });
    } else {
      res.render("posts", { posts });
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
      res.setHeader("Content-Disposition", `attachment; filename="${req.query.title}${path.extname(req.query.s3FileName)}"`);
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
      res.redirect("/login");
    });
  }
}

module.exports = RouteHandler;
