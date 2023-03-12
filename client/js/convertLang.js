document.querySelectorAll('a[href^="/?lang="]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const lang = link.href.split("=")[1];
    document.cookie = `lang=${lang}; path=/`;
    window.location.href = link.href;
  });
});
