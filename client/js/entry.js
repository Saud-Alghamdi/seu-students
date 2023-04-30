import { signupValidation } from "./signup.js";
import { sendPostToServer } from "./addPost.js";

async function handlePage() {
  const currentPage = document.querySelector("body").getAttribute("id");

  switch (currentPage) {
    case "signup-page":
      await signupValidation();
      break;

    case "add-post-page":
      await sendPostToServer();
      break;

    default:
      console.log("No module in this page.");
  }
}

handlePage();
