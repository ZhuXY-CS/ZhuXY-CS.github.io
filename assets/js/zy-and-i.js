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

    var icon = button.querySelector(".love-music__note");

    function updateButton(isPlaying) {
      var tooltip = isPlaying ? "暂停背景音乐" : "播放背景音乐";
      button.setAttribute("aria-pressed", isPlaying ? "true" : "false");
      button.setAttribute("aria-label", tooltip);
      button.setAttribute("data-tooltip", tooltip);
      if (icon) icon.textContent = isPlaying ? "🎵" : "🔇";
    }

    button.addEventListener("click", function () {
      if (audio.paused) {
        audio.play().catch(function () { updateButton(false); });
      } else {
        audio.pause();
      }
    });

    audio.addEventListener("play", function () { updateButton(true); });
    audio.addEventListener("pause", function () { updateButton(false); });
    updateButton(!audio.paused);
  }

  function setupHeartClicks() {
    document.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      var ripple = document.createElement("span");
      ripple.className = "love-click-ripple";
      ripple.style.left = event.clientX + "px";
      ripple.style.top = event.clientY + "px";
      ripple.setAttribute("aria-hidden", "true");

      var waveCount = reducedMotion ? 0 : 2;
      for (var waveIndex = 0; waveIndex < waveCount; waveIndex += 1) {
        var wave = document.createElement("span");
        wave.className = "love-click-ripple__wave love-click-ripple__wave--" + (waveIndex + 1);
        ripple.appendChild(wave);
      }

      var heart = document.createElement("span");
      heart.className = "love-click-ripple__heart";
      heart.textContent = "♥";
      ripple.appendChild(heart);
      document.body.appendChild(ripple);

      window.setTimeout(function () { ripple.remove(); }, reducedMotion ? 420 : 1100);
    }, { passive: true });
  }

  function setupTangbao() {
    var tangbao = document.getElementById("tangbao-witness");
    if (!tangbao) return;

    var bubble = tangbao.querySelector(".tangbao-witness__bubble");
    var sprite = tangbao.querySelector(".tangbao-witness__sprite");
    var messages = [
      "糖宝会一直替你们见证 ♡",
      "你们负责相爱，糖宝负责见证！",
      "隔着一段路，也要好好爱彼此呀 ♡",
      "今天也要比昨天更爱一点哦！",
      "糖宝认证：你们就是天生一对 ♡",
      "距离只是地图上的，想念一直住在心里。",
      "以后每一个四季，都要一起过呀！",
      "世界很大，你们要一直牵着手哦！",
      "暂时不能见面的日子，也是在奔向彼此。",
      "偶尔闹别扭，也要记得抱抱呀！",
      "这份喜欢，糖宝批准长期有效！",
      "忙的时候各自努力，想的时候就说想你。",
      "你看她的时候，眼睛里有星星 ♡",
      "糖宝巡逻中：爱情状态非常好！",
      "不在同一座城市，也在分享同一片月光。",
      "往后的晴天雨天，都要把手牵紧呀！",
      "认真地偏爱彼此，就是最好的浪漫 ♡",
      "慢一点回复没关系，爱从来没有离线。",
      "糖宝偷偷告诉你：她也在很认真地爱你。",
      "被坚定选择的感觉，要珍惜很久很久哦！",
      "今天的想念，先替你们存进下次的拥抱里。",
      "愿你们把普通的日子，过成最喜欢的故事。",
      "见面时要抱久一点，想念才会慢一点呀！",
      "每一次晚安，都是跨过距离的小小拥抱。",
      "答案很长，糖宝陪你们用一生慢慢写。",
      "今天、明天，还有很多很多年，都不要走散。",
      "你认真生活的样子，也是她喜欢你的理由。",
      "你们的故事，糖宝想一直蹲在旁边听 ♡",
      "所谓浪漫，就是每一天都再选择一次彼此。",
      "异地不是暂停，是两个人一起积攒更好的未来。",
      "糖宝许愿：你们的以后，比今天还要甜！",
      "所有温柔的日子，都想留给彼此呀。",
      "把今天过好一点，就离下一次见面近一点。",
      "球可以滚远，你们可不许走散哦！",
      "糖宝把今天的快乐，也分给你们一半 ♡",
      "想念不会把你们推远，只会让拥抱更有意义。",
      "累了就告诉彼此，不必一个人假装坚强呀。",
      "两座城市，两份努力，同一个想要抵达的以后。",
      "糖宝守着倒计时，等你们下一次紧紧见面！",
      "见不到的日子里，也要把爱说得清清楚楚。",
      "真正的陪伴，是隔着距离也始终把你放在心上。",
      "愿每一次分别，都有一个确定的重逢在等候。",
      "你们只管坚定相爱，路途交给时间慢慢缩短 ♡",
      "等见面的那天，记得把欠下的抱抱全部补回来！",
      "好好吃饭，好好睡觉，也是在认真爱对方呀。"
    ];
    var messageIndex = 0;
    var bubbleTimer;
    var speechPoseTimer;
    var frameRoot = (sprite.currentSrc || sprite.src).replace(/frame-\d{2}\.webp(?:\?.*)?$/, "frame-");
    var frameSources = [];
    var frameSequence = [14, 15, 16, 17, 18, 19];
    var frameDuration = 145;
    var frameLoops = true;
    var frameStepDistance = 0;
    var frameDistanceTravelled = 0;
    var frameIndex = 0;
    var currentAction = "is-action-trot";
    var frameStartedAt = window.performance.now();
    var displayedFrame = 0;
    var framePreloads = [];

    for (var frameNumber = 1; frameNumber <= 19; frameNumber += 1) {
      var frameSource = frameRoot + String(frameNumber).padStart(2, "0") + ".webp";
      frameSources.push(frameSource);
      var preload = new Image();
      preload.src = frameSource;
      framePreloads.push(preload);
    }

    function setFrameAction(action) {
      var sequences = {
        "is-action-trot": { frames: [14, 15, 16, 17, 18, 19], duration: 125, stepDistance: 9.5 },
        "is-action-dash": { frames: [14, 15, 16, 17, 18, 19], duration: 88, stepDistance: 13 },
        "is-action-leap": { frames: [4, 1, 5, 5, 6, 7], duration: 155, loop: false },
        "is-action-look": { frames: [7, 8, 8, 7], duration: 310 },
        "is-action-celebrate": { frames: [7, 8, 9, 9, 8, 7], duration: 185, loop: false },
        "is-action-ball": { frames: [10, 11, 10, 11, 12, 6, 13, 13], duration: 225, loop: false },
        "is-action-settle": { frames: [18, 19, 15], duration: 175, loop: false }
      };
      var selected = sequences[action] || sequences["is-action-trot"];
      frameSequence = selected.frames;
      frameDuration = selected.duration;
      frameLoops = selected.loop !== false;
      frameStepDistance = selected.stepDistance || 0;
      frameDistanceTravelled = 0;
      frameIndex = 0;
      currentAction = action;
      frameStartedAt = window.performance.now();
      displayedFrame = 0;
    }

    function revealMessage() {
      messageIndex = (messageIndex + 1) % messages.length;
      bubble.textContent = messages[messageIndex];
      tangbao.classList.add("is-speaking");
      window.clearTimeout(bubbleTimer);
      bubbleTimer = window.setTimeout(function () {
        tangbao.classList.remove("is-speaking");
      }, 3600);
    }

    function speak() {
      window.clearTimeout(speechPoseTimer);

      if (reducedMotion || !actionClasses) {
        revealMessage();
        return;
      }

      window.clearTimeout(actionTimer);
      window.clearTimeout(bubbleTimer);
      tangbao.classList.remove("is-speaking");
      actionClasses.forEach(function (className) { tangbao.classList.remove(className); });
      tangbao.classList.add("is-action-settle");
      setFrameAction("is-action-settle");
      targetVelocityX = 0;
      targetVelocityY = 0;

      speechPoseTimer = window.setTimeout(function () {
        velocityX = 0;
        velocityY = 0;
        actionClasses.forEach(function (className) { tangbao.classList.remove(className); });
        tangbao.classList.add("is-action-look");
        setFrameAction("is-action-look");
        revealMessage();
        actionTimer = window.setTimeout(settleThenChoose, 3800);
      }, 560);
    }

    tangbao.addEventListener("click", speak);

    if (reducedMotion) {
      tangbao.classList.add("is-resting");
      return;
    }

    var x = Math.max(18, window.innerWidth * 0.08);
    var y = Math.max(80, window.innerHeight * 0.72);
    var velocityX = 65;
    var velocityY = 0;
    var targetVelocityX = velocityX;
    var targetVelocityY = velocityY;
    var previousTime = window.performance.now();
    var actionTimer;
    var lastAction = "is-action-trot";
    var forcedDirection = 0;
    var actionClasses = ["is-action-trot", "is-action-dash", "is-action-leap", "is-action-look", "is-action-celebrate", "is-action-ball", "is-action-settle"];

    function between(minimum, maximum) {
      return minimum + Math.random() * (maximum - minimum);
    }

    function chooseAction() {
      actionClasses.forEach(function (className) { tangbao.classList.remove(className); });

      var roll = Math.random();
      var action = "is-action-trot";
      var duration = between(1800, 3600);
      var pendingDirection = forcedDirection;
      var direction = pendingDirection || (targetVelocityX < 0 ? -1 : 1);
      forcedDirection = 0;

      if (Math.random() < 0.28) direction *= -1;

      if (roll < 0.16) {
        action = "is-action-look";
        duration = between(1250, 2100);
        targetVelocityX = 0;
        targetVelocityY = 0;
      } else if (roll < 0.3) {
        action = "is-action-leap";
        duration = between(1050, 1350);
        targetVelocityX = direction * between(70, 115);
        targetVelocityY = 0;
      } else if (roll < 0.43) {
        action = "is-action-dash";
        duration = between(950, 1650);
        targetVelocityX = direction * between(145, 205);
        targetVelocityY = 0;
      } else if (roll < 0.56) {
        action = "is-action-celebrate";
        duration = between(1100, 1750);
        targetVelocityX = 0;
        targetVelocityY = 0;
      } else if (roll < 0.76) {
        action = "is-action-ball";
        duration = between(3200, 4800);
        targetVelocityX = 0;
        targetVelocityY = 0;
      } else {
        targetVelocityX = direction * between(52, 92);
        targetVelocityY = 0;
      }

      if (action === lastAction) {
        action = action === "is-action-trot" ? "is-action-look" : "is-action-trot";
        duration = action === "is-action-look" ? between(1250, 1900) : between(1900, 3200);
        targetVelocityX = action === "is-action-look" ? 0 : direction * between(52, 82);
        targetVelocityY = 0;
      }

      var locomotionAction = action === "is-action-trot" || action === "is-action-dash" || action === "is-action-leap";
      if (!locomotionAction) {
        velocityX = 0;
        velocityY = 0;
        targetVelocityX = 0;
        targetVelocityY = 0;
        if (pendingDirection) forcedDirection = pendingDirection;
      }

      tangbao.classList.add(action);
      setFrameAction(action);
      lastAction = action;
      actionTimer = window.setTimeout(settleThenChoose, duration);
    }

    function settleThenChoose() {
      actionClasses.forEach(function (className) { tangbao.classList.remove(className); });
      tangbao.classList.add("is-action-settle");
      setFrameAction("is-action-settle");
      targetVelocityX = 0;
      targetVelocityY = 0;
      actionTimer = window.setTimeout(chooseAction, between(520, 820));
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

      var responsiveness = currentAction === "is-action-settle" ? 7.5 : 3.8;
      velocityX += (targetVelocityX - velocityX) * Math.min(1, elapsed * responsiveness);
      velocityY += (targetVelocityY - velocityY) * Math.min(1, elapsed * responsiveness);

      var movementX = velocityX * elapsed;
      var movementY = velocityY * elapsed;
      x += movementX;
      y += movementY;

      var nextFrame;
      if (frameStepDistance > 0) {
        frameDistanceTravelled += Math.abs(movementX);
        while (frameDistanceTravelled >= frameStepDistance) {
          frameDistanceTravelled -= frameStepDistance;
          frameIndex = (frameIndex + 1) % frameSequence.length;
        }
        nextFrame = frameSequence[frameIndex];
      } else {
        var elapsedFrames = Math.floor(Math.max(0, currentTime - frameStartedAt) / frameDuration);
        var framePosition = frameLoops ? elapsedFrames % frameSequence.length : Math.min(elapsedFrames, frameSequence.length - 1);
        nextFrame = frameSequence[framePosition];
      }

      if (nextFrame !== displayedFrame) {
        sprite.src = frameSources[nextFrame - 1];
        displayedFrame = nextFrame;
      }

      if (x <= padding || x >= maxX) {
        x = Math.min(maxX, Math.max(padding, x));
        if (currentAction === "is-action-trot" || currentAction === "is-action-dash" || currentAction === "is-action-leap") {
          forcedDirection = x <= padding ? 1 : -1;
          velocityX = 0;
          targetVelocityX = 0;
          window.clearTimeout(actionTimer);
          settleThenChoose();
        }
      }

      if (y <= padding || y >= maxY) {
        y = Math.min(maxY, Math.max(padding, y));
        velocityY *= -1;
        targetVelocityY = (targetVelocityY || velocityY) * -1;
      }

      if (Math.abs(velocityX) > 5) tangbao.classList.toggle("is-facing-left", velocityX < 0);
      tangbao.classList.toggle("is-near-left", x < 150);
      tangbao.classList.toggle("is-near-right", x > window.innerWidth - tangbao.offsetWidth - 150);
      tangbao.classList.toggle("is-near-top", y < 115);
      tangbao.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
      window.requestAnimationFrame(move);
    }

    scheduleSweetWords(5200);

    Promise.all(framePreloads.map(function (image) {
      if (image.complete) return Promise.resolve();
      return new Promise(function (resolve) {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    })).then(function () {
      actionClasses.forEach(function (className) { tangbao.classList.remove(className); });
      tangbao.classList.add("is-action-trot");
      setFrameAction("is-action-trot");
      previousTime = window.performance.now();
      actionTimer = window.setTimeout(settleThenChoose, 2600);
      window.requestAnimationFrame(move);
    });
  }

  function initialize() {
    runTypewriter();
    createHeartAnimation();
    startClock();
    setupMusic();
    setupHeartClicks();
    setupTangbao();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
}());
