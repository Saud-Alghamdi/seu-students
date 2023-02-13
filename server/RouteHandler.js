const DB = require("./DB.js");

class RouteHandler {
  //---HOME---//
  static renderHomePage(req, res) {
    if (typeof req.query.success === "undefined") {
      res.render("home");
    } else if (req.query.success === "true") {
      res.render("home", { success: true, msg: "Logged in successfully!" });
    } 
  }

  //---SIGN UP---//
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

  //---LOG IN---//
  static renderLoginPage(req, res) {
    if (typeof req.query.success === "undefined") {
      res.render("login");
    } else if (req.query.success === "true") {
      res.render("login", { success: true, msg: "Sign up successful!" });
    } else if (req.query.success === "false") {
      res.render("login", { success: false, msg: "Username or password is incorrect" });
    }
  }

  // Log in process (Returns {success: bool, msg: string})
  static async loginProcess(req, res) {
    const userData = req.body;
    const result = await DB.login(userData);
    if (result.success === true) {
      console.log(result);
      res.redirect(`/?success=${encodeURIComponent(result.success)}`);
    } else {
      console.log(result);
      res.redirect(`login?success=${encodeURIComponent(result.success)}`);
    }
  }

  // Check Username Already Exists in DB (FOR FRONT-END VALIDATION) (Returns bool)
  static async checkUsernameExists(req, res) {
    const username = req.body.username;
    let exists = true;

    try {
      const con = await DB.connect();
      const stmt = "SELECT `username` FROM `users` WHERE `Username` = ?";
      const [rows] = await con.query(stmt, [username]);

      if (rows.length > 0) {
        exists = true;
      } else {
        exists = false;
      }
    } catch (err) {
      console.log(err.message);
    }

    res.json(exists);
  }

  // Check Email Already Exists in DB (FOR FRONT-END VALIDATION) (Returns bool)
  static async checkEmailExists(req, res) {
    const email = req.body.email;
    let exists = true;

    try {
      const con = await DB.connect();
      const stmt = "SELECT `email` FROM `users` WHERE `email` = ?";
      const [rows] = await con.query(stmt, [email]);

      if (rows.length > 0) {
        exists = true;
      } else {
        exists = false;
      }
    } catch (err) {
      console.log(err.message);
    }

    res.json(exists);
  }
}

module.exports = RouteHandler;
