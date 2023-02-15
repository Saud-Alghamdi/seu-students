const express = require("express");
const router = express.Router();
const RouteHandler = require("./RouteHandler.js");

/*--------------------------------
------------MAIN ROUTES-------------
--------------------------------*/

//--- Home ---//
router.get("/", (req, res) => {
  RouteHandler.renderHomePage(req, res);
});

//--- Sign up ---//
router.get("/signup", (req, res) => {
  RouteHandler.renderSignupPage(req, res);
});

router.post("/signup-process", async (req, res) => {
  await RouteHandler.signupProcess(req, res);
});

router.post("/signup/checkUsernameExists", async (req, res) => {
  await RouteHandler.checkUsernameExists(req, res);
});

router.post("/signup/checkEmailExists", async (req, res) => {
  await RouteHandler.checkEmailExists(req, res);
});

//--- Login ---//
router.get("/login", (req, res) => {
  RouteHandler.renderLoginPage(req, res);
});

router.post("/login-process", async (req, res) => {
  await RouteHandler.loginProcess(req, res);
});

// faculties
router.get('/faculties', (req, res) => {
  RouteHandler.renderFaculties(req, res);
})
  
// Departments
router.get("/faculties/:facultyAbbr", async (req, res) => {
  await RouteHandler.renderDepartments(req, res);
});

// Posts
router.get("/faculties/:facultyAbbr/departments/:departmentAbbr/posts", async (req, res) => {
  await RouteHandler.renderPosts(req, res);
});

// user dashboard
router.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

module.exports = router;
