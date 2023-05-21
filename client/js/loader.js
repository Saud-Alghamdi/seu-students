const loader = document.getElementById("loader-container");
const forms = document.querySelectorAll("form");

// Runs the loader automatically after any form submission
forms.forEach((form) => {
  form.addEventListener("submit", (e) => {
    loader.classList.remove("visually-hidden");
  });
});

export function removeLoader() {
  const loader = document.getElementById("loader-container");
  loader.classList.add("visually-hidden");
}
