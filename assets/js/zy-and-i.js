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
    var reveals = Array.prototype.slice.call(copy.querySelectorAll("[data-love-reveal]"));

    if (reducedMotion) {
      reveals.forEach(function (reveal) { reveal.classList.add("is-visible"); });
      return;
    }

    copy.classList.add("is-typing");

    for (var lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      var line = lines[lineIndex];
      if (lineIndex > 0) await wait(line.classList.contains("love-copy__line--paragraph") ? 420 : 90);
      var characters = Array.from(line.textContent.trim());
      var accessibleText = characters.join("");

      line.setAttribute("aria-label", accessibleText);
      line.textContent = "";
      line.classList.add("is-active");
      line.classList.add("is-entering");

      for (var characterIndex = 0; characterIndex < characters.length; characterIndex += 1) {
        line.textContent += characters[characterIndex];
        await wait(38);
      }

      line.classList.remove("is-active");
      line.classList.add("is-complete");
      await wait(80);
    }

    copy.classList.remove("is-typing");
    reveals.forEach(function (reveal) { reveal.classList.add("is-visible"); });
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
    var sparkles = [];
    var lastSparkleAt = 0;

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
        target: 4.6 + Math.random() * 3.2,
        petals: 6 + Math.floor(Math.random() * 5),
        rotation: Math.random() * Math.PI,
        hue: 322 + Math.random() * 32,
        alpha: 0.21 + Math.random() * 0.18
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
      context.shadowColor = "rgba(139, 47, 114, " + (bloom.alpha * 0.42).toFixed(3) + ")";
      context.shadowBlur = 1.6;
      context.lineWidth = 0.96;

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
        var opacity = 0.29 * (1 - progress);
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
        context.shadowBlur = 2.6;
        context.lineWidth = 1.3;
        context.stroke();
        context.restore();
      }
    }

    function addSparkle(currentTime) {
      var onLeft = Math.random() < 0.5;
      sparkles.push({
        bornAt: currentTime,
        duration: 4400 + Math.random() * 1800,
        x: memory.clientWidth * (onLeft ? 0.12 + Math.random() * 0.16 : 0.72 + Math.random() * 0.16),
        y: memory.clientHeight * (0.76 + Math.random() * 0.16),
        drift: (Math.random() - 0.5) * 30,
        rise: 90 + Math.random() * 80,
        size: 7 + Math.random() * 5
      });
    }

    function drawSparkles(currentTime) {
      if (currentTime - lastSparkleAt > 1050 && sparkles.length < 7) {
        addSparkle(currentTime);
        lastSparkleAt = currentTime;
      }

      sparkles = sparkles.filter(function (sparkle) {
        var progress = (currentTime - sparkle.bornAt) / sparkle.duration;
        if (progress >= 1) return false;

        var opacity = Math.sin(progress * Math.PI) * 0.24;
        context.save();
        context.translate(sparkle.x + sparkle.drift * progress, sparkle.y - sparkle.rise * progress);
        context.rotate(Math.sin(progress * Math.PI * 2) * 0.12);
        context.fillStyle = "rgba(255, 208, 232, " + opacity.toFixed(3) + ")";
        context.font = sparkle.size.toFixed(1) + "px Georgia, serif";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText("♥", 0, 0);
        context.restore();
        return true;
      });
    }

    function render(currentTime) {
      context.clearRect(0, 0, memory.clientWidth, memory.clientHeight);

      var pulseScale = 1;
      if (heartCompletedAt !== null) {
        var pulseElapsed = currentTime - heartCompletedAt;
        pulseScale = 1.01 + Math.sin((pulseElapsed / 1650) * Math.PI * 2) * 0.04;
        drawHeartWave(pulseElapsed, pulseScale);
        drawSparkles(currentTime);
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
      sparkles = [];
      nextPoint = reducedMotion ? 20 : 0;
      heartCompletedAt = null;
      render(window.performance.now());
    }, { passive: true });

    window.setTimeout(render, startDelay);
  }

  function setupPhotoLoading() {
    var photos = document.querySelectorAll(".love-photo img");

    Array.prototype.forEach.call(photos, function (image) {
      var frame = image.closest(".love-photo");
      if (!frame) return;

      function reveal() {
        window.requestAnimationFrame(function () { frame.classList.add("is-loaded"); });
      }

      if (image.complete && image.naturalWidth > 0) reveal();
      else {
        image.addEventListener("load", reveal, { once: true });
        image.addEventListener("error", reveal, { once: true });
      }
    });
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
    var player = document.querySelector(".love-player");
    var button = document.querySelector(".love-player__toggle");
    if (!audio || !player || !button) return;

    var icon = button.querySelector(".love-player__note");
    var progress = player.querySelector(".love-player__progress");
    var currentTimeLabel = player.querySelector("[data-current-time]");
    var durationLabel = player.querySelector("[data-duration]");
    var previousLyric = player.querySelector(".love-player__lyric--previous");
    var currentLyric = player.querySelector(".love-player__lyric--current");
    var nextLyric = player.querySelector(".love-player__lyric--next");
    var titleLabel = player.querySelector("[data-track-title]");
    var artistLabel = player.querySelector("[data-track-artist]");
    var trackCountLabel = player.querySelector("[data-track-count]");
    var trackButtons = Array.prototype.slice.call(player.querySelectorAll(".love-player__track"));
    var previousButton = player.querySelector(".love-player__previous");
    var nextButton = player.querySelector(".love-player__next");
    var lyricLines = [];
    var activeLyricIndex = -1;
    var activeTrackIndex = trackButtons.findIndex(function (track) {
      return new URL(track.dataset.trackSrc, document.baseURI).pathname === new URL(audio.src, document.baseURI).pathname;
    });
    var progressFrame;

    if (activeTrackIndex < 0 && trackButtons.length) activeTrackIndex = 0;
    if (trackCountLabel) trackCountLabel.textContent = trackButtons.length + " SONG" + (trackButtons.length === 1 ? "" : "S");

    function formatTime(seconds) {
      if (!Number.isFinite(seconds)) return "00:00";
      var minutes = Math.floor(seconds / 60);
      var remainder = Math.floor(seconds % 60);
      return String(minutes).padStart(2, "0") + ":" + String(remainder).padStart(2, "0");
    }

    function parseLyrics(content) {
      var parsed = [];
      content.split(/\r?\n/).forEach(function (line) {
        var match;
        var timestampPattern = /\[(\d{1,2}):(\d{2}(?:\.\d{1,3})?)\]/g;
        var text = line.replace(timestampPattern, "").trim();
        while ((match = timestampPattern.exec(line)) !== null) {
          if (text) parsed.push({ time: Number(match[1]) * 60 + Number(match[2]), text: text });
        }
      });
      return parsed.sort(function (left, right) { return left.time - right.time; });
    }

    function resetLyrics(message) {
      lyricLines = [];
      activeLyricIndex = -1;
      previousLyric.textContent = "";
      currentLyric.textContent = message || "歌词正在赶来";
      nextLyric.textContent = "";
    }

    function loadLyrics(source) {
      resetLyrics("歌词正在赶来");
      if (!source) {
        currentLyric.textContent = "这一首暂时没有同步歌词";
        return;
      }

      fetch(source)
        .then(function (response) {
          if (!response.ok) throw new Error("Lyrics unavailable");
          return response.text();
        })
        .then(function (content) {
          lyricLines = parseLyrics(content);
          if (!lyricLines.length) throw new Error("Lyrics empty");
          renderLyric(true);
        })
        .catch(function () {
          currentLyric.textContent = "这一首暂时没有同步歌词";
        });
    }

    function renderLyric(force) {
      if (!lyricLines.length) return;

      var nextIndex = -1;
      for (var index = 0; index < lyricLines.length; index += 1) {
        if (audio.currentTime + 0.05 >= lyricLines[index].time) nextIndex = index;
        else break;
      }

      if (!force && nextIndex === activeLyricIndex) return;
      activeLyricIndex = nextIndex;
      previousLyric.textContent = nextIndex > 0 ? lyricLines[nextIndex - 1].text : "";
      currentLyric.textContent = nextIndex >= 0 ? lyricLines[nextIndex].text : "前奏响起，故事慢慢开始";
      nextLyric.textContent = lyricLines[nextIndex + 1] ? lyricLines[nextIndex + 1].text : "";
    }

    function updateProgress() {
      var ratio = audio.duration ? Math.min(1, audio.currentTime / audio.duration) : 0;
      progress.value = Math.round(ratio * 1000);
      progress.style.setProperty("--love-progress", (ratio * 100).toFixed(2) + "%");
      currentTimeLabel.textContent = formatTime(audio.currentTime);
      durationLabel.textContent = formatTime(audio.duration);
      renderLyric(false);
    }

    function followPlayback() {
      updateProgress();
      if (!audio.paused) progressFrame = window.requestAnimationFrame(followPlayback);
    }

    function updateButton(isPlaying) {
      var tooltip = isPlaying ? "暂停背景音乐" : "播放背景音乐";
      button.setAttribute("aria-pressed", isPlaying ? "true" : "false");
      button.setAttribute("aria-label", tooltip);
      button.setAttribute("data-tooltip", tooltip);
      button.setAttribute("title", tooltip);
      if (icon) icon.textContent = isPlaying ? "🎵" : "🔇";
      player.classList.toggle("is-playing", isPlaying);
    }

    function markActiveTrack() {
      trackButtons.forEach(function (track, index) {
        var isActive = index === activeTrackIndex;
        track.classList.toggle("is-active", isActive);
        if (isActive) {
          track.setAttribute("aria-current", "true");
          var list = track.closest("ol");
          var item = track.parentElement;
          if (list && item && (item.offsetTop < list.scrollTop || item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight)) {
            list.scrollTop = Math.max(0, item.offsetTop - list.clientHeight / 2 + item.offsetHeight / 2);
          }
        } else {
          track.removeAttribute("aria-current");
        }
      });
    }

    function selectTrack(index, shouldPlay) {
      if (!trackButtons.length) return;

      activeTrackIndex = (index + trackButtons.length) % trackButtons.length;
      var track = trackButtons[activeTrackIndex];
      var wasPlaying = shouldPlay === undefined ? !audio.paused : shouldPlay;

      window.cancelAnimationFrame(progressFrame);
      audio.pause();
      audio.src = track.dataset.trackSrc;
      audio.dataset.lyrics = track.dataset.trackLyrics || "";
      titleLabel.textContent = track.dataset.trackTitle || "背景音乐";
      artistLabel.textContent = track.dataset.trackArtist || "";
      progress.value = 0;
      progress.style.setProperty("--love-progress", "0%");
      currentTimeLabel.textContent = "00:00";
      durationLabel.textContent = "00:00";
      markActiveTrack();
      loadLyrics(audio.dataset.lyrics);
      audio.load();

      if (wasPlaying) audio.play().catch(function () { updateButton(false); });
    }

    button.addEventListener("click", function () {
      if (audio.paused) {
        audio.play().catch(function () { updateButton(false); });
      } else {
        audio.pause();
      }
    });

    audio.addEventListener("play", function () { updateButton(true); });
    audio.addEventListener("play", function () {
      window.cancelAnimationFrame(progressFrame);
      progressFrame = window.requestAnimationFrame(followPlayback);
    });
    audio.addEventListener("pause", function () {
      updateButton(false);
      window.cancelAnimationFrame(progressFrame);
      updateProgress();
    });
    audio.addEventListener("loadedmetadata", updateProgress);

    progress.addEventListener("input", function () {
      if (!audio.duration) return;
      audio.currentTime = (Number(progress.value) / 1000) * audio.duration;
      updateProgress();
      renderLyric(true);
    });

    trackButtons.forEach(function (track, index) {
      track.addEventListener("click", function () { selectTrack(index); });
    });
    if (previousButton) previousButton.addEventListener("click", function () { selectTrack(activeTrackIndex - 1); });
    if (nextButton) nextButton.addEventListener("click", function () { selectTrack(activeTrackIndex + 1); });
    audio.addEventListener("ended", function () { selectTrack(activeTrackIndex + 1, true); });

    markActiveTrack();
    loadLyrics(audio.dataset.lyrics);

    updateProgress();
    updateButton(!audio.paused);
  }

  function setupCosmos() {
    var widget = document.getElementById("love-cosmos");
    var canvas = document.getElementById("love-constellations");
    var sky = widget && widget.querySelector(".love-cosmos__sky");
    var celestialIcon = document.getElementById("love-celestial-icon");
    var timeLabel = document.getElementById("love-sky-time");
    if (!widget || !canvas || !sky) return;

    var context = canvas.getContext("2d");
    if (!context) return;

    var width = 0;
    var height = 0;
    var pointer = null;
    var burst = null;
    var burstUntil = 0;
    var leo = [
      { x: 0.09, y: 0.56, s: 1.5, p: 0.1 }, { x: 0.15, y: 0.45, s: 1.9, p: 1.2 },
      { x: 0.21, y: 0.35, s: 1.5, p: 2.3 }, { x: 0.27, y: 0.23, s: 2.1, p: 0.8 },
      { x: 0.34, y: 0.28, s: 1.6, p: 3.1 }, { x: 0.36, y: 0.41, s: 2, p: 1.7 },
      { x: 0.29, y: 0.49, s: 1.45, p: 2.7 }, { x: 0.20, y: 0.50, s: 1.6, p: 4.1 }
    ];
    var scorpio = [
      { x: 0.64, y: 0.30, s: 1.8, p: 0.6 }, { x: 0.70, y: 0.36, s: 1.5, p: 2.1 },
      { x: 0.76, y: 0.34, s: 2.1, p: 3.3 }, { x: 0.80, y: 0.43, s: 1.5, p: 1.4 },
      { x: 0.79, y: 0.53, s: 1.8, p: 2.8 }, { x: 0.75, y: 0.62, s: 1.5, p: 4.2 },
      { x: 0.81, y: 0.68, s: 2, p: 0.3 }, { x: 0.88, y: 0.62, s: 1.55, p: 3.7 },
      { x: 0.91, y: 0.53, s: 1.75, p: 2.5 }
    ];
    var ambient = [
      { x: 0.04, y: 0.18, s: 0.7, p: 0.2 }, { x: 0.45, y: 0.18, s: 0.65, p: 1.8 },
      { x: 0.55, y: 0.60, s: 0.75, p: 2.9 }, { x: 0.95, y: 0.24, s: 0.65, p: 4.1 },
      { x: 0.48, y: 0.72, s: 0.6, p: 3.5 }, { x: 0.58, y: 0.12, s: 0.7, p: 1.1 }
    ];

    window.loveCosmosMessages = [
      "糖宝仰头看见啦：狮子座和天蝎座正偷偷牵着手 ♡",
      "隔着星河也不怕，你们始终在同一片天空下。",
      "从早安到晚安，糖宝替你们把想念好好收着。"
    ];

    function fitCanvas() {
      var rectangle = sky.getBoundingClientRect();
      var ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rectangle.width);
      height = Math.max(1, rectangle.height);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function drawLine(points, color) {
      context.beginPath();
      points.forEach(function (star, index) {
        var x = star.x * width;
        var y = star.y * height;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.strokeStyle = color;
      context.lineWidth = 0.85;
      context.stroke();
    }

    function drawStar(star, timestamp, isAmbient) {
      var x = star.x * width;
      var y = star.y * height;
      var twinkle = reducedMotion ? 0.72 : 0.64 + Math.sin(timestamp * 0.0022 + star.p) * 0.24;
      var pointerDistance = pointer ? Math.hypot(pointer.x - x, pointer.y - y) : Infinity;
      var burstDistance = burst ? Math.hypot(burst.x - x, burst.y - y) : Infinity;
      var glow = pointerDistance < 58 ? 1 - pointerDistance / 58 : 0;
      if (timestamp < burstUntil && burstDistance < 96) glow = Math.max(glow, 1 - burstDistance / 96);
      var radius = star.s * (1 + glow * 0.62);
      var alpha = Math.min(1, twinkle + glow * 0.48) * (isAmbient ? 0.46 : 1);

      context.beginPath();
      context.arc(x, y, radius + glow * 1.8, 0, Math.PI * 2);
      context.fillStyle = "rgba(214, 112, 162," + (alpha * 0.16) + ")";
      context.fill();
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = "rgba(151, 65, 119," + alpha + ")";
      context.fill();
    }

    function drawBridge() {
      context.save();
      context.beginPath();
      context.moveTo(0.38 * width, 0.4 * height);
      context.bezierCurveTo(0.44 * width, 0.31 * height, 0.56 * width, 0.47 * height, 0.62 * width, 0.32 * height);
      context.setLineDash([2.5, 4.5]);
      context.strokeStyle = "rgba(190, 76, 137, 0.48)";
      context.lineWidth = 0.9;
      context.stroke();
      context.restore();
    }

    function drawOrbit(now) {
      var hours = now.getHours() + now.getMinutes() / 60;
      var isDay = hours >= 6 && hours < 18;
      var progress = isDay ? (hours - 6) / 12 : ((hours >= 18 ? hours - 18 : hours + 6) / 12);
      var startX = 0.11 * width;
      var endX = 0.89 * width;
      var baseline = 0.91 * height;
      var apex = 0.72 * height;
      var controlX = 0.5 * width;
      var controlY = apex - (baseline - apex);
      var x = Math.pow(1 - progress, 2) * startX + 2 * (1 - progress) * progress * controlX + Math.pow(progress, 2) * endX;
      var y = Math.pow(1 - progress, 2) * baseline + 2 * (1 - progress) * progress * controlY + Math.pow(progress, 2) * baseline;

      context.beginPath();
      context.moveTo(startX, baseline);
      context.quadraticCurveTo(controlX, controlY, endX, baseline);
      context.strokeStyle = isDay ? "rgba(200, 143, 90, 0.22)" : "rgba(114, 92, 155, 0.24)";
      context.lineWidth = 0.8;
      context.stroke();
      context.beginPath();
      context.arc(x, y, isDay ? 2.6 : 2.3, 0, Math.PI * 2);
      context.fillStyle = isDay ? "rgba(202, 139, 72, 0.9)" : "rgba(113, 92, 157, 0.88)";
      context.shadowColor = isDay ? "rgba(231, 178, 103, 0.68)" : "rgba(160, 139, 198, 0.62)";
      context.shadowBlur = 7;
      context.fill();
      context.shadowBlur = 0;
    }

    function updateSkyTime() {
      var now = new Date();
      var isDay = now.getHours() >= 6 && now.getHours() < 18;
      widget.classList.toggle("is-night", !isDay);
      if (celestialIcon) celestialIcon.textContent = isDay ? "☀︎" : "☾";
      if (timeLabel) timeLabel.textContent = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    }

    function draw(timestamp) {
      context.clearRect(0, 0, width, height);
      drawLine(leo, "rgba(166, 89, 137, 0.34)");
      drawLine(scorpio, "rgba(130, 94, 157, 0.34)");
      drawBridge();
      ambient.forEach(function (star) { drawStar(star, timestamp, true); });
      leo.forEach(function (star) { drawStar(star, timestamp, false); });
      scorpio.forEach(function (star) { drawStar(star, timestamp, false); });
      drawOrbit(new Date());
      if (!reducedMotion) window.requestAnimationFrame(draw);
    }

    function locatePointer(event) {
      var rectangle = sky.getBoundingClientRect();
      return { x: event.clientX - rectangle.left, y: event.clientY - rectangle.top };
    }

    sky.addEventListener("pointermove", function (event) { pointer = locatePointer(event); }, { passive: true });
    sky.addEventListener("pointerleave", function () { pointer = null; }, { passive: true });
    widget.addEventListener("pointerdown", function (event) {
      var rectangle = sky.getBoundingClientRect();
      burst = { x: event.clientX - rectangle.left, y: event.clientY - rectangle.top };
      burstUntil = window.performance.now() + 850;
      if (reducedMotion) draw(window.performance.now());
    }, { passive: true });

    fitCanvas();
    updateSkyTime();
    draw(window.performance.now());
    window.setInterval(updateSkyTime, 60000);
    if (window.ResizeObserver) new window.ResizeObserver(function () { fitCanvas(); if (reducedMotion) draw(window.performance.now()); }).observe(sky);
    else window.addEventListener("resize", function () { fitCanvas(); if (reducedMotion) draw(window.performance.now()); });
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

    for (var frameNumber = 1; frameNumber <= 43; frameNumber += 1) {
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
        "is-action-leap": { frames: [32, 33, 34, 35, 36, 37], duration: 165, loop: false },
        "is-action-look": { frames: [22, 23, 24, 25], duration: 270, loop: false },
        "is-action-sniff": { frames: [26, 27, 28, 27, 26], duration: 245, loop: false },
        "is-action-stretch": { frames: [26, 27, 28, 29, 30, 31], duration: 255, loop: false },
        "is-action-celebrate": { frames: [26, 30, 31, 30, 31, 26], duration: 220, loop: false },
        "is-action-ball": { frames: [38, 39, 40, 41, 42, 42, 43], duration: 275, loop: false },
        "is-action-settle": { frames: [20, 21, 22], duration: 190, loop: false },
        "is-action-rise": { frames: [25, 24, 23, 22], duration: 220, loop: false }
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
      var availableMessages = messages.concat(window.loveCosmosMessages || []);
      messageIndex = (messageIndex + 1) % availableMessages.length;
      bubble.textContent = availableMessages[messageIndex];
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
      }, 640);
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
    var actionClasses = ["is-action-trot", "is-action-dash", "is-action-leap", "is-action-look", "is-action-sniff", "is-action-stretch", "is-action-celebrate", "is-action-ball", "is-action-settle", "is-action-rise"];

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

      if (roll < 0.12) {
        action = "is-action-look";
        duration = between(1900, 2500);
      } else if (roll < 0.24) {
        action = "is-action-sniff";
        duration = between(1700, 2400);
      } else if (roll < 0.34) {
        action = "is-action-stretch";
        duration = between(2100, 2800);
      } else if (roll < 0.46) {
        action = "is-action-leap";
        duration = between(1150, 1450);
        targetVelocityX = direction * between(70, 115);
        targetVelocityY = 0;
      } else if (roll < 0.58) {
        action = "is-action-dash";
        duration = between(950, 1650);
        targetVelocityX = direction * between(145, 205);
        targetVelocityY = 0;
      } else if (roll < 0.7) {
        action = "is-action-celebrate";
        duration = between(1700, 2400);
      } else if (roll < 0.86) {
        action = "is-action-ball";
        duration = between(3000, 4200);
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
      var transitionAction = currentAction === "is-action-look" ? "is-action-rise" : "is-action-settle";
      actionClasses.forEach(function (className) { tangbao.classList.remove(className); });
      tangbao.classList.add(transitionAction);
      setFrameAction(transitionAction);
      targetVelocityX = 0;
      targetVelocityY = 0;
      actionTimer = window.setTimeout(chooseAction, transitionAction === "is-action-rise" ? 980 : between(650, 900));
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
    setupPhotoLoading();
    createHeartAnimation();
    startClock();
    setupMusic();
    setupCosmos();
    setupHeartClicks();
    setupTangbao();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
}());
