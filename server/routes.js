const express = require("express");
const router = express.Router();
const RouteHandler = require("./RouteHandler.js");

/*--------------------------------
------------MAIN ROUTES-------------
--------------------------------*/

//--- Home ---//
router.get("/", (req, res) => res.render("home"));

//--- Sign up ---//
router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup/signup-process", async (req, res) => {
  await RouteHandler.signupProcess(req, res);
});

router.post("/signup/checkUsernameExists", async (req, res) => {
  await RouteHandler.checkUsernameExists(req, res);
});

router.post("/signup/checkEmailExists", async (req, res) => {
  await RouteHandler.checkEmailExists(req, res);
});

//--- login ---///
router.get("/login", (req, res) => {
  const feedback = req.query

  if (Object.keys(feedback).length !== 0) {
    res.render('login', {feedback})
  } else {
    res.render('login')
  }
});

// faculties
router.get("/faculties", (req, res) => {
  res.render("faculties");
});

/*--------------------------------
------------FACULTY DEPARTMENTS ROUTES-------------
--------------------------------*/

// AFS departments
router.get("/faculties/AFS/departments", (req, res) => {
  res.render("faculties/AFS/departments");
});

// CI departments
router.get("/faculties/CI/departments", (req, res) => {
  res.render("faculties/CI/departments");
});

// HS departments
router.get("/faculties/HS/departments", (req, res) => {
  res.render("faculties/HS/departments");
});

// STS departments
router.get("/faculties/STS/departments", (req, res) => {
  res.render("faculties/STS/departments");
});

/*--------------------------------
------------DEPARTMENT POSTS ROUTES-------------
--------------------------------*/

// AFS --> acc posts
router.get("/faculties/AFS/acc/posts", (req, res) => {
  res.render("faculties/AFS/acc/posts");
});

// AFS --> ecom posts
router.get("/faculties/AFS/ecom/posts", (req, res) => {
  res.render("faculties/AFS/ecom/posts");
});

// AFS --> fin posts
router.get("/faculties/AFS/fin/posts", (req, res) => {
  res.render("faculties/AFS/fin/posts");
});

// AFS --> mng posts
router.get("/faculties/AFS/mng/posts", (req, res) => {
  res.render("faculties/AFS/mng/posts");
});

// CI --> cs posts
router.get("/faculties/CI/cs/posts", (req, res) => {
  res.render("faculties/CI/cs/posts");
});

// CI --> it posts
router.get("/faculties/CI/it/posts", (req, res) => {
  res.render("faculties/CI/it/posts");
});

// CI --> ds posts
router.get("/faculties/CI/ds/posts", (req, res) => {
  res.render("faculties/CI/ds/posts");
});

// HS --> hi posts
router.get("/faculties/HS/hi/posts", (req, res) => {
  res.render("faculties/HS/hi/posts");
});

// HS --> ph posts
router.get("/faculties/HS/ph/posts", (req, res) => {
  res.render("faculties/HS/ph/posts");
});

// STS --> dig posts
router.get("/faculties/STS/dig/posts", (req, res) => {
  res.render("faculties/STS/dig/posts");
});

// STS --> eng posts
router.get("/faculties/STS/eng/posts", (req, res) => {
  res.render("faculties/STS/eng/posts");
});

// STS --> law posts
router.get("/faculties/STS/law/posts", (req, res) => {
  res.render("faculties/STS/law/posts");
});

/*--------------------------------
------------USER DASHBOARD-------------
--------------------------------*/

// user dashboard
router.get("/dashboard/user-dashboard", (req, res) => {
  res.render("dashboard/user-dashboard");
});

/*--------------------------------
------------PROCESSING-------------
--------------------------------*/
router.post("/signup-process", async (req, res) => {
  const formData = req.body;
  const result = await signup(formData);
  if (result === true) {
    res.redirect("login");
  } else {
    res.redirect("signup");
  }
});

// test signup process
router.post("/signup/process", async (req, res) => {
  // validate data
  const formData = req.body;
  if (formData.username.length < 3 || formData.username.length > 25) {
    res.render("signup", { msg: "username must be between 3 to 25 characters long" });
  } else {
    res.render("login", { msg: "Signed up successfully!" });
  }
});

module.exports = router;
