const loader = document.getElementById("loader-container");
const forms = document.querySelectorAll("form");

// Runs the loader automatically after any form submission
forms.forEach((form) => {
  form.addEventListener("submit", (e) => {
    loader.classList.remove("visually-hidden");
  });
});

// this is a savior if a user has clicked the back button and a loader just hangs from the previous page
window.addEventListener("pageshow", function (e) {
  if (e.persisted) {
    removeLoader();
  }
});

export function removeLoader() {
  const loader = document.getElementById("loader-container");
  loader.classList.add("visually-hidden");
}
