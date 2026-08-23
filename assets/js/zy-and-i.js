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
        await wait(42);
      }

      line.classList.remove("is-active");
      line.classList.add("is-complete");
      await wait(140);
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
    var heartCompletedAt = null;
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
      var scale = Math.min(memory.clientWidth / 39, memory.clientHeight / 42) * 1.32;
      var x = 16 * Math.pow(Math.sin(angle), 3);
      var y = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
      return { x: memory.clientWidth / 2 + x * scale, y: memory.clientHeight / 2 - 55 + y * scale };
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

    function drawBloom(bloom, pulseScale) {
      var centerX = memory.clientWidth / 2;
      var centerY = memory.clientHeight / 2 - 55;

      context.save();
      context.translate(centerX, centerY);
      context.scale(pulseScale, pulseScale);
      context.translate(bloom.x - centerX, bloom.y - centerY);
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

    function drawHeartWave(elapsed, pulseScale) {
      for (var ring = 0; ring < 4; ring += 1) {
        var cycle = elapsed / 3000 - ring * 0.23;
        if (cycle < 0) continue;

        var progress = cycle % 1;
        var expansion = 1 + progress * 0.3;
        var opacity = 0.34 * (1 - progress);
        var scale = Math.min(memory.clientWidth / 39, memory.clientHeight / 42) * 1.32 * pulseScale;

        context.save();
        context.beginPath();

        for (var pointIndex = 0; pointIndex <= 140; pointIndex += 1) {
          var angle = (Math.PI * 2 * pointIndex) / 140;
          var wave = 1 + Math.sin(angle * 7 - progress * Math.PI * 2) * 0.025 * (1 - progress);
          var x = 16 * Math.pow(Math.sin(angle), 3);
          var y = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
          var drawX = memory.clientWidth / 2 + x * scale * expansion * wave;
          var drawY = memory.clientHeight / 2 - 55 + y * scale * expansion * wave;

          if (pointIndex === 0) context.moveTo(drawX, drawY);
          else context.lineTo(drawX, drawY);
        }

        context.closePath();
        context.strokeStyle = "rgba(255, 182, 222, " + opacity.toFixed(3) + ")";
        context.shadowColor = "rgba(139, 47, 114, " + (opacity * 0.7).toFixed(3) + ")";
        context.shadowBlur = 3;
        context.lineWidth = 1.6;
        context.stroke();
        context.restore();
      }
    }

    function render(currentTime) {
      context.clearRect(0, 0, memory.clientWidth, memory.clientHeight);

      var pulseScale = 1;
      if (heartCompletedAt !== null) {
        var pulseElapsed = currentTime - heartCompletedAt;
        pulseScale = 1.01 + Math.sin((pulseElapsed / 1650) * Math.PI * 2) * 0.04;
        drawHeartWave(pulseElapsed, pulseScale);
      }

      for (var index = 0; index < blooms.length; index += 1) {
        var bloom = blooms[index];
        bloom.radius = Math.min(bloom.target, bloom.radius + 0.13);
        drawBloom(bloom, pulseScale);
      }

      if (nextPoint <= 20) {
        addBloom(heartPoint(10 + nextPoint));
        nextPoint += reducedMotion ? 0.22 : 0.07;
      } else {
        message.classList.add("is-visible");
        if (heartCompletedAt === null) heartCompletedAt = currentTime;
      }

      animationFrame = window.requestAnimationFrame(render);
    }

    resize();

    if (reducedMotion) {
      for (var staticStep = 10; staticStep <= 30; staticStep += 0.2) {
        addBloom(heartPoint(staticStep));
      }
      context.clearRect(0, 0, memory.clientWidth, memory.clientHeight);
      blooms.forEach(function (bloom) { drawBloom(bloom, 1); });
      message.classList.add("is-visible");
      return;
    }

    window.addEventListener("resize", function () {
      window.cancelAnimationFrame(animationFrame);
      resize();
      blooms = [];
      nextPoint = reducedMotion ? 20 : 0;
      heartCompletedAt = null;
      render(window.performance.now());
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

  function setupTangbao() {
    var tangbao = document.getElementById("tangbao-witness");
    if (!tangbao) return;

    var bubble = tangbao.querySelector(".tangbao-witness__bubble");
    var sprite = tangbao.querySelector(".tangbao-witness__sprite");
    var messages = [
      "糖宝会一直替你们见证 ♡",
      "你们负责相爱，糖宝负责见证！",
      "今天也要比昨天更爱一点哦！",
      "糖宝认证：你们就是天生一对 ♡",
      "以后每一个四季，都要一起过呀！",
      "世界很大，你们要一直牵着手哦！",
      "偶尔闹别扭，也要记得抱抱呀！",
      "这份喜欢，糖宝批准长期有效！",
      "你看她的时候，眼睛里有星星 ♡",
      "糖宝巡逻中：爱情状态非常好！",
      "往后的晴天雨天，都要把手牵紧呀！",
      "认真地偏爱彼此，就是最好的浪漫 ♡",
      "糖宝偷偷告诉你：她也在很认真地爱你。",
      "被坚定选择的感觉，要珍惜很久很久哦！",
      "愿你们把普通的日子，过成最喜欢的故事。",
      "见面时要抱久一点，想念才会慢一点呀！",
      "答案很长，糖宝陪你们用一生慢慢写。",
      "今天、明天，还有很多很多年，都不要走散。",
      "你们的故事，糖宝想一直蹲在旁边听 ♡",
      "所谓浪漫，就是每一天都再选择一次彼此。",
      "糖宝许愿：你们的以后，比今天还要甜！",
      "所有温柔的日子，都想留给彼此呀。"
    ];
    var messageIndex = 0;
    var bubbleTimer;
    var frameRoot = (sprite.currentSrc || sprite.src).replace(/frame-01\.webp(?:\?.*)?$/, "frame-");
    var frameSources = [];
    var frameSequence = [1, 2, 3, 2];
    var frameDuration = 145;
    var frameStartedAt = window.performance.now();
    var displayedFrame = 0;

    for (var frameNumber = 1; frameNumber <= 9; frameNumber += 1) {
      var frameSource = frameRoot + String(frameNumber).padStart(2, "0") + ".webp";
      frameSources.push(frameSource);
      var preload = new Image();
      preload.src = frameSource;
    }

    function setFrameAction(action) {
      var sequences = {
        "is-action-trot": { frames: [1, 2, 3, 2], duration: 155 },
        "is-action-dash": { frames: [1, 2, 3, 2], duration: 95 },
        "is-action-leap": { frames: [4, 5, 5, 6], duration: 205 },
        "is-action-look": { frames: [7, 8, 8, 7], duration: 310 },
        "is-action-celebrate": { frames: [8, 9, 9, 8], duration: 170 }
      };
      var selected = sequences[action] || sequences["is-action-trot"];
      frameSequence = selected.frames;
      frameDuration = selected.duration;
      frameStartedAt = window.performance.now();
      displayedFrame = 0;
    }

    function speak() {
      messageIndex = (messageIndex + 1) % messages.length;
      bubble.textContent = messages[messageIndex];
      tangbao.classList.add("is-speaking");
      window.clearTimeout(bubbleTimer);
      bubbleTimer = window.setTimeout(function () {
        tangbao.classList.remove("is-speaking");
      }, 3600);
    }

    tangbao.addEventListener("click", speak);

    if (reducedMotion) {
      tangbao.classList.add("is-resting");
      return;
    }

    var x = Math.max(18, window.innerWidth * 0.08);
    var y = Math.max(80, window.innerHeight * 0.68);
    var velocityX = 65;
    var velocityY = -18;
    var targetVelocityX = velocityX;
    var targetVelocityY = velocityY;
    var previousTime = window.performance.now();
    var actionTimer;
    var actionClasses = ["is-action-trot", "is-action-dash", "is-action-leap", "is-action-look", "is-action-celebrate"];

    function between(minimum, maximum) {
      return minimum + Math.random() * (maximum - minimum);
    }

    function chooseAction() {
      actionClasses.forEach(function (className) { tangbao.classList.remove(className); });

      var roll = Math.random();
      var action = "is-action-trot";
      var duration = between(1800, 3600);
      var direction = targetVelocityX < 0 ? -1 : 1;

      if (Math.random() < 0.28) direction *= -1;

      if (roll < 0.19) {
        action = "is-action-look";
        duration = between(1250, 2100);
        targetVelocityX = 0;
        targetVelocityY = 0;
      } else if (roll < 0.36) {
        action = "is-action-leap";
        duration = between(900, 1500);
        targetVelocityX = direction * between(70, 115);
        targetVelocityY = between(-52, 52);
      } else if (roll < 0.52) {
        action = "is-action-dash";
        duration = between(950, 1650);
        targetVelocityX = direction * between(145, 205);
        targetVelocityY = between(-40, 40);
      } else if (roll < 0.66) {
        action = "is-action-celebrate";
        duration = between(1100, 1750);
        targetVelocityX = direction * between(18, 42);
        targetVelocityY = between(-12, 12);
      } else {
        targetVelocityX = direction * between(52, 92);
        targetVelocityY = between(-32, 32);
      }

      tangbao.classList.add(action);
      setFrameAction(action);
      actionTimer = window.setTimeout(chooseAction, duration);
    }

    function scheduleSweetWords(delay) {
      window.setTimeout(function () {
        if (!document.hidden) speak();
        scheduleSweetWords(between(9000, 15000));
      }, delay);
    }

    function move(currentTime) {
      var elapsed = Math.min((currentTime - previousTime) / 1000, 0.05);
      var padding = 8;
      var maxX = Math.max(padding, window.innerWidth - tangbao.offsetWidth - padding);
      var maxY = Math.max(padding, window.innerHeight - tangbao.offsetHeight - padding);
      previousTime = currentTime;

      var framePosition = Math.floor(Math.max(0, currentTime - frameStartedAt) / frameDuration) % frameSequence.length;
      var nextFrame = frameSequence[framePosition];
      if (nextFrame !== displayedFrame) {
        sprite.src = frameSources[nextFrame - 1];
        displayedFrame = nextFrame;
      }

      velocityX += (targetVelocityX - velocityX) * Math.min(1, elapsed * 3.2);
      velocityY += (targetVelocityY - velocityY) * Math.min(1, elapsed * 3.2);

      x += velocityX * elapsed;
      y += velocityY * elapsed;

      if (x <= padding || x >= maxX) {
        x = Math.min(maxX, Math.max(padding, x));
        velocityX *= -1;
        targetVelocityX = (targetVelocityX || velocityX) * -1;
      }

      if (y <= padding || y >= maxY) {
        y = Math.min(maxY, Math.max(padding, y));
        velocityY *= -1;
        targetVelocityY = (targetVelocityY || velocityY) * -1;
      }

      if (Math.abs(velocityX) > 5) tangbao.classList.toggle("is-facing-left", velocityX < 0);
      tangbao.classList.toggle("is-near-left", x < 150);
      tangbao.classList.toggle("is-near-right", x > window.innerWidth - tangbao.offsetWidth - 150);
      tangbao.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
      window.requestAnimationFrame(move);
    }

    chooseAction();
    scheduleSweetWords(5200);
    window.requestAnimationFrame(move);
  }

  function initialize() {
    runTypewriter();
    createHeartAnimation();
    startClock();
    setupMusic();
    setupTangbao();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
}());
