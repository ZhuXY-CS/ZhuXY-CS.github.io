(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function wait(milliseconds) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, milliseconds);
    });
  }

  async function runTypewriter() {
    var copy = document.getElementById("love-copy");
    if (!copy) return;

    var lines = Array.prototype.slice.call(copy.querySelectorAll("[data-love-type]"));
    var reveal = copy.querySelector("[data-love-reveal]");

    if (reducedMotion) {
      if (reveal) reveal.classList.add("is-visible");
      return;
    }

    copy.classList.add("is-typing");

    for (var lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      var line = lines[lineIndex];
      var characters = Array.from(line.textContent.trim());
      var accessibleText = characters.join("");

      line.setAttribute("aria-label", accessibleText);
      line.textContent = "";
      line.classList.add("is-active");

      for (var characterIndex = 0; characterIndex < characters.length; characterIndex += 1) {
        line.textContent += characters[characterIndex];
        await wait(68);
      }

      line.classList.remove("is-active");
      line.classList.add("is-complete");
      await wait(240);
    }

    copy.classList.remove("is-typing");
    if (reveal) reveal.classList.add("is-visible");
  }

  function createHeartAnimation() {
    var canvas = document.getElementById("love-heart");
    var message = document.getElementById("love-message");
    if (!canvas || !message) return;

    var context = canvas.getContext("2d");
    var memory = canvas.parentElement;
    var blooms = [];
    var nextPoint = 0;
    var animationFrame;
    var startDelay = reducedMotion ? 0 : 3000;

    function resize() {
      var rectangle = memory.getBoundingClientRect();
      var ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rectangle.width * ratio));
      canvas.height = Math.max(1, Math.round(rectangle.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function heartPoint(step) {
      var angle = step / Math.PI;
      var scale = Math.min(memory.clientWidth / 39, memory.clientHeight / 42) * 0.9;
      var x = 16 * Math.pow(Math.sin(angle), 3);
      var y = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
      return { x: memory.clientWidth / 2 + x * scale, y: memory.clientHeight / 2 - 18 + y * scale };
    }

    function addBloom(point) {
      blooms.push({
        x: point.x,
        y: point.y,
        radius: reducedMotion ? 8 : 0.8,
        target: 5 + Math.random() * 4,
        petals: 7 + Math.floor(Math.random() * 6),
        rotation: Math.random() * Math.PI,
        hue: 322 + Math.random() * 32,
        alpha: 0.22 + Math.random() * 0.22
      });
    }

    function drawBloom(bloom) {
      context.save();
      context.translate(bloom.x, bloom.y);
      context.rotate(bloom.rotation);
      context.strokeStyle = "hsla(" + bloom.hue + ", 76%, 48%, " + bloom.alpha + ")";
      context.lineWidth = 1;

      for (var petal = 0; petal < bloom.petals; petal += 1) {
        context.save();
        context.rotate((Math.PI * 2 * petal) / bloom.petals);
        context.beginPath();
        context.moveTo(0, 0);
        context.bezierCurveTo(bloom.radius * 0.36, -bloom.radius * 0.92, bloom.radius * 1.05, -bloom.radius * 0.62, 0, -bloom.radius * 1.8);
        context.stroke();
        context.restore();
      }

      context.restore();
    }

    function render() {
      context.clearRect(0, 0, memory.clientWidth, memory.clientHeight);

      for (var index = 0; index < blooms.length; index += 1) {
        var bloom = blooms[index];
        bloom.radius = Math.min(bloom.target, bloom.radius + 0.13);
        drawBloom(bloom);
      }

      if (nextPoint <= 20) {
        addBloom(heartPoint(10 + nextPoint));
        nextPoint += reducedMotion ? 0.22 : 0.07;
      } else {
        message.classList.add("is-visible");
      }

      if (nextPoint <= 20 || blooms.some(function (bloom) { return bloom.radius < bloom.target; })) {
        animationFrame = window.requestAnimationFrame(render);
      }
    }

    resize();

    if (reducedMotion) {
      for (var staticStep = 10; staticStep <= 30; staticStep += 0.2) {
        addBloom(heartPoint(staticStep));
      }
      context.clearRect(0, 0, memory.clientWidth, memory.clientHeight);
      blooms.forEach(drawBloom);
      message.classList.add("is-visible");
      return;
    }

    window.addEventListener("resize", function () {
      window.cancelAnimationFrame(animationFrame);
      resize();
      blooms = [];
      nextPoint = reducedMotion ? 20 : 0;
      render();
    }, { passive: true });

    window.setTimeout(render, startDelay);
  }

  function startClock() {
    var message = document.getElementById("love-message");
    var clock = document.getElementById("love-clock");
    if (!message || !clock) return;

    var rawStart = message.getAttribute("data-started-at");
    if (!rawStart) return;

    var startedAt = new Date(rawStart);
    if (Number.isNaN(startedAt.getTime())) return;

    function update() {
      var totalSeconds = Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000));
      var days = Math.floor(totalSeconds / 86400);
      var hours = Math.floor((totalSeconds % 86400) / 3600);
      var minutes = Math.floor((totalSeconds % 3600) / 60);
      var seconds = totalSeconds % 60;

      clock.textContent = days + " days " + String(hours).padStart(2, "0") + " hours " + String(minutes).padStart(2, "0") + " minutes " + String(seconds).padStart(2, "0") + " seconds";
    }

    update();
    window.setInterval(update, 1000);
  }

  function setupMusic() {
    var audio = document.getElementById("love-audio");
    var button = document.querySelector(".love-music");
    if (!audio || !button) return;

    button.addEventListener("click", function () {
      if (audio.paused) {
        audio.play().then(function () {
          button.setAttribute("aria-pressed", "true");
          button.setAttribute("aria-label", "暂停音乐");
        }).catch(function () {});
      } else {
        audio.pause();
        button.setAttribute("aria-pressed", "false");
        button.setAttribute("aria-label", "播放音乐");
      }
    });
  }

  function initialize() {
    runTypewriter();
    createHeartAnimation();
    startClock();
    setupMusic();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
}());
