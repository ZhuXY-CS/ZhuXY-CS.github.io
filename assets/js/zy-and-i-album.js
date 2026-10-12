(function () {
  "use strict";
  var photos = Array.from(document.querySelectorAll("[data-memory-photo]"));
  var dialog = document.querySelector(".memory-viewer");
  if (!photos.length || !dialog || typeof dialog.showModal !== "function") return;
  var image = dialog.querySelector("[data-memory-image]");
  var caption = dialog.querySelector("#memory-viewer-caption");
  var date = dialog.querySelector("[data-memory-date]");
  var counter = dialog.querySelector("[data-memory-counter]");
  var original = dialog.querySelector("[data-memory-original]");
  var status = dialog.querySelector("[data-memory-status]");
  var previous = dialog.querySelector("[data-memory-previous]");
  var next = dialog.querySelector("[data-memory-next]");
  var close = dialog.querySelector("[data-memory-close]");
  var stage = dialog.querySelector(".memory-viewer__stage");
  var index = 0;
  var opener = null;
  var overflow = "";
  var touch = null;

  function showPhoto(position) {
    index = (position + photos.length) % photos.length;
    var photo = photos[index];
    image.classList.remove("is-unavailable");
    image.alt = photo.querySelector("img").alt;
    status.textContent = "照片加载中…";
    image.src = photo.href;
    original.href = photo.href;
    caption.textContent = photo.dataset.caption;
    date.textContent = photo.dataset.date || "";
    date.hidden = !date.textContent;
    counter.textContent = (index + 1) + " / " + photos.length;
    previous.disabled = next.disabled = photos.length < 2;
    if (image.complete && image.naturalWidth) status.textContent = "";
  }

  image.addEventListener("load", function () { status.textContent = ""; });
  image.addEventListener("error", function () {
    image.classList.add("is-unavailable");
    status.textContent = "照片暂时无法显示，可以点击“打开原图”重试。";
  });
  photos.forEach(function (photo, position) {
    photo.addEventListener("click", function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      opener = photo;
      showPhoto(position);
      overflow = document.documentElement.style.overflow;
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
      close.focus();
    });
  });
  previous.addEventListener("click", function () { showPhoto(index - 1); });
  next.addEventListener("click", function () { showPhoto(index + 1); });
  close.addEventListener("click", function () { dialog.close(); });
  dialog.addEventListener("click", function (event) { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", function () {
    document.documentElement.style.overflow = overflow;
    if (opener) opener.focus();
    touch = null;
  });
  dialog.addEventListener("keydown", function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      showPhoto(index + (event.key === "ArrowRight" ? 1 : -1));
    }
  });
  stage.addEventListener("touchstart", function (event) {
    touch = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  stage.addEventListener("touchend", function (event) {
    if (!touch || event.touches.length || !event.changedTouches.length) { touch = null; return; }
    var dx = event.changedTouches[0].clientX - touch.x;
    var dy = event.changedTouches[0].clientY - touch.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) showPhoto(index + (dx < 0 ? 1 : -1));
    touch = null;
  }, { passive: true });
  stage.addEventListener("touchcancel", function () { touch = null; }, { passive: true });
})();
