const express = require("express");
const router = express.Router();
const RouteHandler = require("./RouteHandler.js");

// multer config for file handling
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//--- ROUTES ---//

// Home page
router.get("/", RouteHandler.renderHomePage);

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
router.get("/login", RouteHandler.renderLoginPage);

// Login process
router.post("/login-process", async (req, res) => {
  await RouteHandler.loginProcess(req, res);
});

// Forgot password page
router.get("/reset-password", RouteHandler.renderForgotPasswordPage);

// Send email for Forgot password process
router.post("/send-email-for-reset-password", async (req, res) => {
  await RouteHandler.sendEmailForForgotPasswordProcess(req, res);
});

// Logout
router.get("/logout", RouteHandler.logout);

// Departments page
router.get("/departments", RouteHandler.renderDepartmentsPage);

// Courses page
router.get("/departments/:depAbbr/courses", async (req, res) => {
  await RouteHandler.renderCoursesPage(req, res);
});

// Posts page
router.get("/departments/:depAbbr/:courseId/posts", async (req, res) => {
  await RouteHandler.renderPostsPage(req, res);
});

// Add Post page
router.get("/departments/:depAbbr/:courseId/add-post", async (req, res) => {
  await RouteHandler.renderAddPostPage(req, res);
});

// Add Post Process
router.post("/departments/:depAbbr/:courseId/add-post/addPostProcess", upload.single("file"), async (req, res) => {
  await RouteHandler.addPostProcess(req, res);
});

// Download file from post
router.get("/downloadFile", async (req, res) => {
  await RouteHandler.downloadFile(req, res);
});

// User dashboard page
router.get("/dashboard", RouteHandler.renderDashboardPage);

// User account page
router.get("/dashboard/my-account", RouteHandler.renderMyAccountPage);

// Update user data process
router.post("/dashboard/updateUserData", async (req, res) => {
  await RouteHandler.updateUserDataProcess(req, res);
});

// User posts page
router.get("/dashboard/my-posts", async (req, res) => {
  await RouteHandler.renderMyPostsPage(req, res);
});

// Delete Post
router.post("/dashboard/my-posts/deletePost", async (req, res) => {
  await RouteHandler.deletePost(req, res);
});

module.exports = router;
