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
    var animationFrame;
    var startDelay = reducedMotion ? 0 : 3000;
    var heartIsStatic = false;
    canvas.dataset.animationState = "waiting";

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
      var target = 4.6 + Math.random() * 3.2;
      blooms.push({
        x: point.x,
        y: point.y,
        radius: reducedMotion ? target : 0.8,
        target: target,
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

    function drawStaticHeart() {
      blooms = [];
      for (var staticStep = 10; staticStep <= 30; staticStep += 0.2) {
        addBloom(heartPoint(staticStep));
      }
      context.clearRect(0, 0, memory.clientWidth, memory.clientHeight);
      blooms.forEach(function (bloom) {
        bloom.radius = bloom.target;
        drawBloom(bloom, 1);
      });
      message.classList.add("is-visible");
      heartIsStatic = true;
      animationFrame = null;
      canvas.dataset.animationState = "static";
    }

    function render() {
      canvas.dataset.animationState = "drawing";
      context.clearRect(0, 0, memory.clientWidth, memory.clientHeight);

      var allBloomsSettled = nextPoint > 20;

      for (var index = 0; index < blooms.length; index += 1) {
        var bloom = blooms[index];
        bloom.radius = Math.min(bloom.target, bloom.radius + 0.13);
        if (bloom.radius < bloom.target) allBloomsSettled = false;
        drawBloom(bloom, 1);
      }

      if (nextPoint <= 20) {
        addBloom(heartPoint(10 + nextPoint));
        nextPoint += 0.07;
        allBloomsSettled = false;
      } else {
        message.classList.add("is-visible");
      }

      if (allBloomsSettled) {
        heartIsStatic = true;
        animationFrame = null;
        canvas.dataset.animationState = "static";
        return;
      }

      animationFrame = window.requestAnimationFrame(render);
    }

    resize();

    if (reducedMotion) {
      drawStaticHeart();
      return;
    }

    window.addEventListener("resize", function () {
      window.cancelAnimationFrame(animationFrame);
      resize();
      if (heartIsStatic) {
        drawStaticHeart();
        return;
      }
      blooms = [];
      nextPoint = 0;
      render();
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

  function setupWeatherForecast() {
    var widget = document.getElementById("love-weather");
    if (!widget) return;

    var places = Array.prototype.slice.call(widget.querySelectorAll("[data-weather-place]"));
    var cacheDuration = 30 * 60 * 1000;

    window.loveWeatherMessages = [
      "不管今天是哪一种天气，记得把牵挂好好带在身边呀。",
      "两片天空各有晴雨，两颗心一直朝着同一个方向。",
      "糖宝播报：距离会变，天气会变，坚定喜欢彼此不会变 ♡"
    ];

    function describeWeather(code, isDay) {
      if (code === 0) return { icon: isDay ? "☀️" : "🌙", label: "晴朗" };
      if (code === 1 || code === 2) return { icon: isDay ? "🌤️" : "☁️", label: "晴间多云" };
      if (code === 3) return { icon: "☁️", label: "多云" };
      if (code === 45 || code === 48) return { icon: "🌫️", label: "有雾" };
      if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { icon: "🌧️", label: "有雨" };
      if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return { icon: "🌨️", label: "有雪" };
      if (code >= 95) return { icon: "⛈️", label: "雷雨" };
      return { icon: "☁️", label: "天气温柔" };
    }

    function readCache(key) {
      try {
        var cached = JSON.parse(window.localStorage.getItem(key));
        if (cached && Date.now() - cached.savedAt < cacheDuration) return cached.data;
      } catch (error) {
        return null;
      }
      return null;
    }

    function writeCache(key, data) {
      try {
        window.localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data: data }));
      } catch (error) {
        return;
      }
    }

    function fetchPlace(place) {
      var latitude = place.dataset.latitude;
      var longitude = place.dataset.longitude;
      var timezone = place.dataset.timezone;
      var cacheKey = "zy-weather-v2-" + latitude + "-" + longitude;
      var cached = readCache(cacheKey);
      if (cached) return Promise.resolve(cached);

      var parameters = new URLSearchParams({
        latitude: latitude,
        longitude: longitude,
        current: "temperature_2m,weather_code,is_day",
        hourly: "temperature_2m,weather_code",
        daily: "weather_code,temperature_2m_max,temperature_2m_min",
        timezone: timezone,
        forecast_days: "2"
      });

      return fetch("https://api.open-meteo.com/v1/forecast?" + parameters.toString())
        .then(function (response) {
          if (!response.ok) throw new Error("Weather unavailable");
          return response.json();
        })
        .then(function (data) {
          writeCache(cacheKey, data);
          return data;
        });
    }

    function drawTemperatureChart(canvas, temperatures) {
      var context = canvas.getContext("2d");
      if (!context || !temperatures.length) return;

      var rectangle = canvas.getBoundingClientRect();
      var ratio = Math.min(window.devicePixelRatio || 1, 2);
      var width = Math.max(1, rectangle.width);
      var height = Math.max(1, rectangle.height);
      var minimum = Math.min.apply(Math, temperatures);
      var maximum = Math.max.apply(Math, temperatures);
      var spread = Math.max(3, maximum - minimum);
      var paddingX = 4;
      var paddingY = 6;

      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      var points = temperatures.map(function (temperature, index) {
        return {
          x: paddingX + index * (width - paddingX * 2) / Math.max(1, temperatures.length - 1),
          y: paddingY + (maximum - temperature) / spread * (height - paddingY * 2)
        };
      });

      var gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "rgba(213, 103, 156, 0.24)");
      gradient.addColorStop(1, "rgba(213, 103, 156, 0.01)");
      context.beginPath();
      context.moveTo(points[0].x, height - 2);
      points.forEach(function (point) { context.lineTo(point.x, point.y); });
      context.lineTo(points[points.length - 1].x, height - 2);
      context.closePath();
      context.fillStyle = gradient;
      context.fill();

      context.beginPath();
      points.forEach(function (point, index) {
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      });
      context.strokeStyle = "rgba(165, 61, 118, 0.72)";
      context.lineWidth = 1.25;
      context.lineJoin = "round";
      context.lineCap = "round";
      context.stroke();

      points.forEach(function (point, index) {
        if (index !== 0 && index !== points.length - 1 && index % 2 !== 0) return;
        context.beginPath();
        context.arc(point.x, point.y, 1.6, 0, Math.PI * 2);
        context.fillStyle = "#b84380";
        context.fill();
      });
    }

    function renderPlace(place, data) {
      var current = data.current || {};
      var daily = data.daily || {};
      var hourly = data.hourly || {};
      var currentWeather = describeWeather(Number(current.weather_code), Number(current.is_day) === 1);
      var tomorrowWeather = describeWeather(Number((daily.weather_code || [])[1]), true);
      var todayDate = (daily.time || [])[0] || "";
      var chartTemperatures = [];

      (hourly.time || []).forEach(function (time, index) {
        var hour = Number(String(time).slice(11, 13));
        var temperature = Number((hourly.temperature_2m || [])[index]);
        if (String(time).slice(0, 10) === todayDate && hour >= 6 && hour <= 23 && (hour % 3 === 0 || hour === 23) && Number.isFinite(temperature)) {
          chartTemperatures.push(temperature);
        }
      });

      var currentTemperature = Number(current.temperature_2m);
      var tomorrowHigh = Number((daily.temperature_2m_max || [])[1]);
      var tomorrowLow = Number((daily.temperature_2m_min || [])[1]);
      var chart = place.querySelector(".love-weather__chart");

      place.querySelector(".love-weather__icon").textContent = currentWeather.icon;
      place.querySelector(".love-weather__temperature").textContent = Number.isFinite(currentTemperature) ? Math.round(currentTemperature) + "°" : "--°";
      place.querySelector(".love-weather__condition").textContent = currentWeather.label;
      place.querySelector(".love-weather__tomorrow-icon").textContent = tomorrowWeather.icon;
      place.querySelector(".love-weather__tomorrow-temperature").textContent = Number.isFinite(tomorrowLow) && Number.isFinite(tomorrowHigh) ? Math.round(tomorrowLow) + "° / " + Math.round(tomorrowHigh) + "°" : "--° / --°";
      place.querySelector(".love-weather__tomorrow-condition").textContent = tomorrowWeather.label;
      chart.setAttribute("aria-label", "今天从清晨到夜晚的温度变化：" + chartTemperatures.map(function (temperature) { return Math.round(temperature) + "度"; }).join("、"));
      place._loveWeatherTemperatures = chartTemperatures;
      drawTemperatureChart(chart, chartTemperatures);
    }

    Promise.all(places.map(function (place) {
      return fetchPlace(place).then(function (data) { renderPlace(place, data); });
    })).catch(function () {
      places.forEach(function (place) {
        place.querySelector(".love-weather__condition").textContent = "天气暂时藏进云里";
        place.querySelector(".love-weather__tomorrow-condition").textContent = "晚一点再来看";
      });
    });

    if (window.ResizeObserver) {
      places.forEach(function (place) {
        var chart = place.querySelector(".love-weather__chart");
        new window.ResizeObserver(function () {
          if (place._loveWeatherTemperatures) drawTemperatureChart(chart, place._loveWeatherTemperatures);
        }).observe(chart);
      });
    }
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
      "好好吃饭，好好睡觉，也是在认真爱对方呀。",
      "今天有没有好好想她？糖宝可是有认真监督哦！",
      "你们的爱不会被距离稀释，只会被时间酿得更甜。",
      "忙碌的缝隙里想起彼此，就是藏不住的偏爱呀。",
      "哪怕今天只说了几句话，心也一直在彼此身边。",
      "糖宝把思念装进小球里，滚呀滚，滚到她身边啦！",
      "日子一天天向前，重逢也在一步步靠近。",
      "不用每一天都轰轰烈烈，安稳惦记就是长久的浪漫。",
      "她在认真奔赴未来，你也要成为她安心的后盾呀。",
      "委屈不要藏太久，最爱你的人也想被你需要。",
      "异地最甜的秘密，是两个人都在偷偷规划同一个以后。",
      "早安是今天的第一份牵挂，晚安是跨越距离的拥抱。",
      "糖宝知道，你想分享的每一件小事，最后都想讲给她听。",
      "不能随时见面，就把每一次见面都抱得更认真一点。",
      "你们各自发光，也在照亮彼此前行的路。",
      "距离会考验耐心，却带不走坚定的偏爱 ♡",
      "今天辛苦啦，别忘了你们一直都是彼此的底气。",
      "等风把想念送到，她抬头的时候一定能收到。",
      "每一个忍住没见面的今天，都在兑换更长久的明天。",
      "糖宝盖章：这份双向奔赴，比星星还要闪亮！",
      "想她就告诉她呀，被惦记本身就是很甜的礼物。",
      "你们不是隔着很远，而是在从两个方向走向同一个家。",
      "愿视频里的晚安，很快变成枕边轻轻的一句晚安。",
      "今天也给彼此多一点耐心，爱会在理解里慢慢长大。",
      "平淡的问候、认真的回应，都是异地里珍贵的拥抱。",
      "下次见面之前，先带着对方的爱把生活过得亮晶晶。",
      "糖宝最喜欢看你们：一个坚定，一个也坚定 ♡",
      "就算隔着屏幕，也要让她知道，她始终是你的特别关注。",
      "所有说出口的想念，都会在重逢那天变成真的拥抱。"
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

    var actionDefinitions = {
      "is-action-trot": { frames: [14, 15, 16, 17, 18, 19], frameDuration: 118, stepDistance: 8.5, moving: true, minimum: 2300, maximum: 3900 },
      "is-action-dash": { frames: [14, 15, 16, 17, 18, 19], frameDuration: 82, stepDistance: 11.5, moving: true, minimum: 1050, maximum: 1650 },
      "is-action-bound": { frames: [2, 3, 5, 1, 6, 7, 2], frameDuration: 132, loop: false, moving: true, minimum: 980, maximum: 1080 },
      "is-action-leap": { frames: [32, 33, 34, 35, 36, 37], frameDuration: 145, loop: false, moving: true, minimum: 900, maximum: 990 },
      "is-action-look": { frames: [22, 23, 24, 25, 24, 23, 22], frameDuration: 220, loop: false, minimum: 1750, maximum: 2050 },
      "is-action-sniff": { frames: [26, 27, 28, 29, 28, 27, 26], frameDuration: 185, loop: false, minimum: 1500, maximum: 1750 },
      "is-action-stretch": { frames: [26, 27, 28, 29, 30, 31, 30, 29, 28, 27, 26], frameDuration: 160, loop: false, minimum: 1900, maximum: 2200 },
      "is-action-celebrate": { frames: [22, 23, 24, 25, 8, 9, 8, 25, 24, 23, 22], frameDuration: 150, loop: false, minimum: 1800, maximum: 2050 },
      "is-action-ball": { frames: [38, 39, 40, 41, 42, 13, 12, 10, 11, 12, 13, 42, 41, 40, 39, 38, 43], frameDuration: 150, loop: false, minimum: 2750, maximum: 3100 },
      "is-action-settle": { frames: [19, 20, 21, 22], frameDuration: 135, loop: false, minimum: 620, maximum: 720 },
      "is-action-rise": { frames: [25, 24, 23, 22, 21, 20, 19], frameDuration: 110, loop: false, minimum: 820, maximum: 920 }
    };

    function setFrameAction(action) {
      var selected = actionDefinitions[action] || actionDefinitions["is-action-trot"];
      frameSequence = selected.frames;
      frameDuration = selected.frameDuration;
      frameLoops = selected.loop !== false;
      frameStepDistance = selected.stepDistance || 0;
      frameDistanceTravelled = 0;
      frameIndex = 0;
      currentAction = action;
      frameStartedAt = window.performance.now();
      displayedFrame = 0;
    }

    function revealMessage() {
      var availableMessages = messages.concat(window.loveWeatherMessages || []);
      messageIndex = (messageIndex + 1) % availableMessages.length;
      bubble.textContent = availableMessages[messageIndex];
      tangbao.classList.add("is-speaking");
      window.clearTimeout(bubbleTimer);
      bubbleTimer = window.setTimeout(function () {
        tangbao.classList.remove("is-speaking");
      }, 4600);
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
      applyAction("is-action-settle");

      speechPoseTimer = window.setTimeout(function () {
        applyAction(Math.random() < 0.28 ? "is-action-celebrate" : "is-action-look");
        revealMessage();
        actionTimer = window.setTimeout(function () {
          queuedAction = pickAction(movingActions);
          startAction("is-action-rise");
        }, 3800);
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
    var queuedAction = "";
    var actionClasses = ["is-action-trot", "is-action-dash", "is-action-bound", "is-action-leap", "is-action-look", "is-action-sniff", "is-action-stretch", "is-action-celebrate", "is-action-ball", "is-action-settle", "is-action-rise"];
    var movingActions = ["is-action-trot", "is-action-trot", "is-action-dash", "is-action-bound", "is-action-leap"];
    var playfulActions = ["is-action-look", "is-action-sniff", "is-action-stretch", "is-action-celebrate", "is-action-ball"];

    function between(minimum, maximum) {
      return minimum + Math.random() * (maximum - minimum);
    }

    function pickAction(actions) {
      var candidates = actions.filter(function (action) { return action !== lastAction; });
      return candidates[Math.floor(Math.random() * candidates.length)] || actions[0];
    }

    function applyAction(action) {
      actionClasses.forEach(function (className) { tangbao.classList.remove(className); });
      tangbao.classList.add(action);
      setFrameAction(action);
      if (action !== "is-action-settle" && action !== "is-action-rise") lastAction = action;

      var definition = actionDefinitions[action];
      var direction = targetVelocityX < 0 ? -1 : 1;

      if (definition.moving) {
        var hadForcedDirection = forcedDirection !== 0;
        direction = forcedDirection || direction;
        forcedDirection = 0;
        if (!hadForcedDirection && Math.random() < 0.3) direction *= -1;
        if (action === "is-action-dash") targetVelocityX = direction * between(150, 205);
        else if (action === "is-action-bound") targetVelocityX = direction * between(95, 132);
        else if (action === "is-action-leap") targetVelocityX = direction * between(78, 112);
        else targetVelocityX = direction * between(54, 88);
        targetVelocityY = between(-20, 20);
      } else if (action !== "is-action-settle") {
        velocityX = 0;
        velocityY = 0;
        targetVelocityX = 0;
        targetVelocityY = 0;
      } else {
        targetVelocityX = 0;
        targetVelocityY = 0;
      }
    }

    function startAction(action) {
      var definition = actionDefinitions[action];
      applyAction(action);
      actionTimer = window.setTimeout(finishAction, between(definition.minimum, definition.maximum));
    }

    function finishAction() {
      if (currentAction === "is-action-settle" || currentAction === "is-action-rise") {
        var nextAction = queuedAction || pickAction(currentAction === "is-action-settle" ? playfulActions : movingActions);
        queuedAction = "";
        startAction(nextAction);
        return;
      }

      if (actionDefinitions[currentAction] && actionDefinitions[currentAction].moving) {
        queuedAction = pickAction(playfulActions);
        startAction("is-action-settle");
      } else {
        queuedAction = pickAction(movingActions);
        startAction("is-action-rise");
      }
    }

    function settleThenChoose() {
      queuedAction = pickAction(playfulActions);
      startAction("is-action-settle");
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
        if (currentAction === "is-action-trot" || currentAction === "is-action-dash" || currentAction === "is-action-bound" || currentAction === "is-action-leap") {
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

    Promise.all(framePreloads.slice(13, 22).map(function (image) {
      if (image.complete) return Promise.resolve();
      return new Promise(function (resolve) {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    })).then(function () {
      previousTime = window.performance.now();
      startAction("is-action-trot");
      window.requestAnimationFrame(move);
    });
  }

  function initialize() {
    runTypewriter();
    setupPhotoLoading();
    createHeartAnimation();
    startClock();
    setupMusic();
    setupWeatherForecast();
    setupHeartClicks();
    setupTangbao();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
}());
