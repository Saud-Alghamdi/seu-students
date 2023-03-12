function showToast(isSuccess, msg) {
  const greenGradient = 'linear-gradient(to right, #00b09b, #96c93d)';
  const redGradient = 'linear-gradient(107.2deg, rgb(150, 15, 15) 10.6%, rgb(247, 0, 0) 91.1%)'
  const background = isSuccess ? greenGradient : redGradient;

  Toastify({
    text: msg,
    duration: 3000,
    destination: "https://github.com/apvarun/toastify-js",
    newWindow: true,
    close: true,
    gravity: "top",
    position: "center",
    stopOnFocus: true,
    style: {
      background,
    },
  }).showToast();
}
