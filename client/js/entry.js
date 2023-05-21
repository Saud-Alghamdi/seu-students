// Gathers all the modules together
// Runs the appropriate module depending on the currently viewed page

import { signupValidation } from "./validation/signup.js";
import { sendPostToServer } from "./validation/addPost.js";
import { updateAccountDataValidation } from "./validation/updateAccountData.js";

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
      await updateAccountDataValidation();
      break;

    default:
      console.log("No module in this page.");
  }
}

handlePage();
