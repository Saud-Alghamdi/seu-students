const loader = document.getElementById("loader-container");
const form = document.querySelector("form");

// Runs the loader automatically after any form submission
if (form) {
  form.addEventListener("submit", (e) => {
    loader.classList.remove("visually-hidden");
  });
}

export function removeLoader() {
  const loader = document.getElementById("loader-container");
  loader.classList.add("visually-hidden");
}
