const express = require("express");
const router = express.Router();

/*--------------------------------
------------MAIN ROUTES-------------
--------------------------------*/

// home
router.get("/", (req, res) => {
  res.render("home");
});

// signup
router.get("/signup", (req, res) => {
  res.render("signup");
});

// login
router.get("/login", (req, res) => {
  res.render("login");
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

module.exports = router;
