// Gathers all the modules together
// Runs the appropriate module depending on the currently viewed page

import { signupValidation } from "./signup.js";
import { sendPostToServer } from "./addPost.js";
import { updateAccountData } from "./updateAccountData.js";

async function handlePage() {
  const currentPage = document.querySelector("body").getAttribute("id");

  switch (currentPage) {
    case "signup-page":
      await signupValidation();
      break;

    case "add-post-page":
      await sendPostToServer();
      break;

    case "my-account-page":
      await updateAccountData();
      break;

    default:
      console.log("No module in this page.");
  }
}

handlePage();
