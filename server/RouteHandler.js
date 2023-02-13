const DB = require("./DB.js");

class RouteHandler {
  // Sign up process ( Returns {success: v, msg: v} )
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

  // Log in process ( Returns true or false )
  static async loginProcess(req, res) {
    const userData = req.body;
    const exists = await DB.login(userData);
    if (exists === true) {
      console.log(exists);
      res.redirect(`home?success=${encodeURIComponent(result.success)}`);
    } else {
      console.log(exists);
      res.redirect(`login?success=${encodeURIComponent(result.success)}`);
    }
  }

  // Check Username Already Exists in DB (FOR FRONT-END)
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

  // Check Email Already Exists in DB (FOR FRONT-END)
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
