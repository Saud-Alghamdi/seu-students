const sendEmailBtn = document.querySelector(".reset-password-page-container__button");
const loaderContainer = document.querySelector("#loader-container");

sendEmailBtn.addEventListener("click", (e) => {
  loaderContainer.classList.remove("visually-hidden");
});
