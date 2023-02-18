const express = require("express");
const router = express.Router();
const RouteHandler = require("./RouteHandler.js");

// Home page
router.get("/", (req, res) => {
  RouteHandler.renderHomePage(req, res);
});

// Sign up page
router.get("/signup", (req, res) => {
  RouteHandler.renderSignupPage(req, res);
});

// Sign up process
router.post("/signup-process", async (req, res) => {
  await RouteHandler.signupProcess(req, res);
});

// Sign up - check username exists
router.post("/signup/checkUsernameExists", async (req, res) => {
  await RouteHandler.checkUsernameExists(req, res);
});

// Sign up - check email exists
router.post("/signup/checkEmailExists", async (req, res) => {
  await RouteHandler.checkEmailExists(req, res);
});

// Login page
router.get("/login", (req, res) => {
  RouteHandler.renderLoginPage(req, res);
});

// Login process
router.post("/login-process", async (req, res) => {
  await RouteHandler.loginProcess(req, res);
});

// Faculties page
router.get("/faculties", (req, res) => {
  RouteHandler.renderFaculties(req, res);
});

// Departments page
router.get("/faculties/:facultyAbbr", async (req, res) => {
  await RouteHandler.renderDepartments(req, res);
});

// Posts page
router.get("/faculties/:facultyAbbr/departments/:departmentAbbr/posts", async (req, res) => {
  await RouteHandler.renderPosts(req, res);
});

// Add Post page
router.get("/faculties/:facultyAbbr/departments/:departmentAbbr/add-post", async (req, res) => {
  RouteHandler.renderAddPost(req, res);
});

// Add post process
router.post("/faculties/:facultyAbbr/departments/:departmentAbbr/add-post-process", async (req, res) => {
  await RouteHandler.addPostProcess(req, res);
});

// user dashboard page
router.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

module.exports = router;
