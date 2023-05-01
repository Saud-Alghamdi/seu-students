export function showLoader() {
  const loader = document.getElementById("loader-container");
  loader.classList.remove("visually-hidden");
}

export function removeLoader() {
  const loader = document.getElementById("loader-container");
  loader.classList.add("visually-hidden");
}
