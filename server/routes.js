import express from "express";
import RouteHandler from "./RouteHandler.js";
import multer from "multer";

const router = express.Router();

// multer config for file handling
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
router.post("/checkUsernameExists", async (req, res) => {
  await RouteHandler.checkUsernameExists(req, res);
});

// Sign up - check email exists
router.post("/checkEmailExists", async (req, res) => {
  await RouteHandler.checkEmailExists(req, res);
});

// Login page
router.get("/login", RouteHandler.renderLoginPage);

// Login process
router.post("/login-process", async (req, res) => {
  await RouteHandler.loginProcess(req, res);
});

// Reset password page
router.get("/reset-password", RouteHandler.renderResetPasswordPage);

// Send email for reset password process
router.post("/send-email-to-reset-password", async (req, res) => {
  await RouteHandler.sendEmailToResetPassword(req, res);
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
router.get("/departments/:depAbbr/:courseCode/posts", async (req, res) => {
  await RouteHandler.renderPostsPage(req, res);
});

// Add Post page
router.get("/departments/:depAbbr/:courseCode/add-post", async (req, res) => {
  await RouteHandler.renderAddPostPage(req, res);
});

// Add Post Process
router.post("/departments/:depAbbr/:courseCode/addPostProcess", upload.single("file"), async (req, res) => {
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
router.post("/dashboard/updateAccountData", async (req, res) => {
  await RouteHandler.updateAccountDataProcess(req, res);
});

// User posts page
router.get("/dashboard/my-posts", async (req, res) => {
  await RouteHandler.renderMyPostsPage(req, res);
});

// Delete Post process
router.post("/dashboard/my-posts/deletePost", async (req, res) => {
  await RouteHandler.deletePost(req, res);
});

// Update Post title page
router.get("/dashboard/my-posts/:postId/update-post-title", RouteHandler.renderUpdatePostTitlePage);

// Update Post process
router.post("/dashboard/my-posts/:postId/updatePostTitleProcess", async (req, res) => {
  await RouteHandler.updatePostTitleProcess(req, res);
});

// Send current language
router.get("/currentLang", (req, res) => {
  res.json(req.session.lang);
});

export default router;
