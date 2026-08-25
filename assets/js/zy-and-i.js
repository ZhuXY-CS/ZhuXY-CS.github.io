(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function wait(milliseconds) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, milliseconds);
    });
  }

  function setupLetterBook() {
    var book = document.getElementById("love-letter-pages");
    if (!book) return;

    var pages = Array.prototype.slice.call(book.querySelectorAll("[data-letter-page]"));
    var previousButton = document.querySelector(".love-letter__turn--previous");
    var nextButton = document.querySelector(".love-letter__turn--next");
    var currentCounter = document.querySelector("[data-letter-current]");
    var activeIndex = Math.max(0, pages.findIndex(function (page) { return !page.hidden; }));
    var typingVersion = 0;

    function twoDigits(value) {
      return value < 10 ? "0" + value : String(value);
    }

    function preparePage(page) {
      var copy = page.querySelector("[data-love-copy]");
      if (!copy) return null;

      copy.classList.remove("is-typing");
      Array.prototype.forEach.call(copy.querySelectorAll("[data-love-type]"), function (line) {
        if (!line.dataset.fullText) line.dataset.fullText = line.textContent.trim();
        line.textContent = line.dataset.fullText;
        line.setAttribute("aria-label", line.dataset.fullText);
        line.classList.remove("is-active", "is-complete", "is-entering");
      });
      Array.prototype.forEach.call(copy.querySelectorAll("[data-love-reveal]"), function (reveal) {
        reveal.classList.remove("is-visible");
      });
      return copy;
    }

    async function typePage(page) {
      var version = ++typingVersion;
      var copy = preparePage(page);
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
        if (lineIndex > 0) {
          await wait(line.classList.contains("love-copy__line--paragraph") ? 330 : 70);
          if (version !== typingVersion) return;
        }

        var characters = Array.from(line.dataset.fullText);
        line.textContent = "";
        line.classList.add("is-active", "is-entering");

        for (var characterIndex = 0; characterIndex < characters.length; characterIndex += 1) {
          if (version !== typingVersion) return;
          line.textContent += characters[characterIndex];
          await wait(30);
        }

        line.classList.remove("is-active");
        line.classList.add("is-complete");
        await wait(60);
        if (version !== typingVersion) return;
      }

      copy.classList.remove("is-typing");
      reveals.forEach(function (reveal) { reveal.classList.add("is-visible"); });
    }

    function updateNavigation() {
      if (previousButton) previousButton.disabled = activeIndex === 0;
      if (nextButton) nextButton.disabled = activeIndex === pages.length - 1;
      if (currentCounter) currentCounter.textContent = twoDigits(activeIndex + 1);
    }

    function showPage(nextIndex) {
      if (nextIndex < 0 || nextIndex >= pages.length || nextIndex === activeIndex) return;

      var directionClass = nextIndex > activeIndex ? "is-turning-forward" : "is-turning-backward";
      typingVersion += 1;
      pages[activeIndex].hidden = true;
      pages[activeIndex].classList.remove("is-active", "is-turning-forward", "is-turning-backward");

      activeIndex = nextIndex;
      pages[activeIndex].hidden = false;
      pages[activeIndex].classList.remove("is-turning-forward", "is-turning-backward");
      pages[activeIndex].offsetWidth;
      pages[activeIndex].classList.add("is-active", directionClass);
      updateNavigation();

      if (window.matchMedia("(max-width: 1050px)").matches) {
        var letter = book.closest(".love-letter");
        if (letter) {
          window.requestAnimationFrame(function () {
            letter.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
          });
        }
      }

      typePage(pages[activeIndex]);
    }

    pages.forEach(preparePage);
    if (previousButton) previousButton.addEventListener("click", function () { showPage(activeIndex - 1); });
    if (nextButton) nextButton.addEventListener("click", function () { showPage(activeIndex + 1); });
    updateNavigation();
    typePage(pages[activeIndex]);
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

    function weatherKind(code) {
      if (code === 0) return "晴";
      if (code === 1 || code === 2) return "多云";
      if (code === 3) return "阴";
      if (code === 45 || code === 48) return "雾";
      if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "雨";
      if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "雪";
      if (code >= 95) return "雷雨";
      return "多云";
    }

    function describeDay(codes, fallbackCode) {
      var sequence = [];

      codes.forEach(function (code) {
        var kind = weatherKind(Number(code));
        if (sequence[sequence.length - 1] !== kind) sequence.push(kind);
      });

      if (!sequence.length) sequence.push(weatherKind(Number(fallbackCode)));

      var uniqueKinds = sequence.filter(function (kind, index) {
        return sequence.indexOf(kind) === index;
      });

      if (uniqueKinds.length === 1) {
        return {
          "晴": "晴朗一整天",
          "多云": "多云为主",
          "阴": "阴天为主",
          "雾": "有雾，出门慢一点",
          "雨": "全天有雨",
          "雪": "全天有雪",
          "雷雨": "可能有雷雨"
        }[uniqueKinds[0]];
      }

      var first = sequence[0];
      var last = sequence[sequence.length - 1];

      if (uniqueKinds.length === 2) {
        if (uniqueKinds.indexOf("晴") !== -1 && uniqueKinds.indexOf("多云") !== -1) return "晴间多云";
        if (first !== last) return first + "转" + last;
        return first + "为主，间有" + uniqueKinds.filter(function (kind) { return kind !== first; })[0];
      }

      var changingWeather = ["雷雨", "雪", "雨", "雾"].filter(function (kind) {
        return uniqueKinds.indexOf(kind) !== -1;
      })[0];

      if (changingWeather) {
        var changeIndex = sequence.indexOf(changingWeather);
        var beforeChange = changeIndex > 0 ? sequence[changeIndex - 1] : changingWeather;
        var summary = beforeChange === changingWeather ? changingWeather + "为主" : beforeChange + "转" + changingWeather;
        if (last !== changingWeather && last !== beforeChange) summary += "，随后转" + last;
        return summary;
      }

      if (first !== last) return first + "转" + last;
      return first + "为主，云量有变化";
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
      var cacheKey = "zy-weather-v3-" + latitude + "-" + longitude;
      var cached = readCache(cacheKey);
      if (cached) return Promise.resolve(cached);

      var parameters = new URLSearchParams({
        latitude: latitude,
        longitude: longitude,
        hourly: "weather_code",
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

    function renderPlace(place, data) {
      var daily = data.daily || {};
      var hourly = data.hourly || {};
      var todayWeather = describeWeather(Number((daily.weather_code || [])[0]), true);
      var tomorrowWeather = describeWeather(Number((daily.weather_code || [])[1]), true);
      var todayDate = (daily.time || [])[0] || "";
      var todayCodes = [];

      (hourly.time || []).forEach(function (time, index) {
        var hour = Number(String(time).slice(11, 13));
        if (String(time).slice(0, 10) === todayDate && hour >= 6 && hour <= 23 && hour % 3 === 0) {
          todayCodes.push(Number((hourly.weather_code || [])[index]));
        }
      });

      var todayHigh = Number((daily.temperature_2m_max || [])[0]);
      var todayLow = Number((daily.temperature_2m_min || [])[0]);
      var tomorrowHigh = Number((daily.temperature_2m_max || [])[1]);
      var tomorrowLow = Number((daily.temperature_2m_min || [])[1]);
      var today = place.querySelector(".love-weather__day--today");
      var tomorrow = place.querySelector(".love-weather__day--tomorrow");

      today.querySelector(".love-weather__day-icon").textContent = todayWeather.icon;
      today.querySelector(".love-weather__day-temperature").textContent = Number.isFinite(todayLow) && Number.isFinite(todayHigh) ? Math.round(todayLow) + "° / " + Math.round(todayHigh) + "°" : "--° / --°";
      today.querySelector(".love-weather__day-condition").textContent = describeDay(todayCodes, (daily.weather_code || [])[0]);
      tomorrow.querySelector(".love-weather__day-icon").textContent = tomorrowWeather.icon;
      tomorrow.querySelector(".love-weather__day-temperature").textContent = Number.isFinite(tomorrowLow) && Number.isFinite(tomorrowHigh) ? Math.round(tomorrowLow) + "° / " + Math.round(tomorrowHigh) + "°" : "--° / --°";
      tomorrow.querySelector(".love-weather__day-condition").textContent = tomorrowWeather.label;
    }

    Promise.all(places.map(function (place) {
      return fetchPlace(place).then(function (data) { renderPlace(place, data); });
    })).catch(function () {
      places.forEach(function (place) {
        place.querySelector(".love-weather__day--today .love-weather__day-condition").textContent = "天气暂时藏进云里";
        place.querySelector(".love-weather__day--tomorrow .love-weather__day-condition").textContent = "晚一点再来看";
      });
    });
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
      "所有说出口的想念，都会在重逢那天变成真的拥抱。",
      "糖宝读完三封信啦：原来无论几岁，小庸都会爱上ZY。",
      "18岁的你会心动，22岁的你会心动，25岁的你终于没有错过。",
      "早一点遇见会喜欢，晚一点遇见还是会喜欢，因为一直都是她呀。",
      "命运绕了很远的路，只为了把最合适的你们放在相邻的座位上。",
      "那些没有相遇的岁月，不是遗憾，是故事在认真铺垫。",
      "糖宝觉得，你们不是来晚了，是刚好在最懂爱的时候遇见。",
      "羽毛球馆和舞蹈房隔得再远，也没能让缘分真的走丢。",
      "一个追着小球跑，一个跟着音乐跳，最后都跑进了彼此心里。",
      "从南到北，从北到南，地图画了好多线，缘分只画了一个圆。",
      "她问多少次都可以，你就每一次都认真告诉她：会，一定会。",
      "如果能回到大学，糖宝猜你第一眼就会偷偷多看她几次。",
      "有些人只要出现，无论在哪一年，都会成为心里的特别答案。",
      "相邻的座位只有一点点距离，却替你们跨过了好多年的错过。",
      "糖宝要替那场宴会保密：其实缘分早就悄悄安排好啦。",
      "没能参与彼此的从前没关系，往后的故事可以一页一页一起写。",
      "她偶尔没有安全感的时候，就再坚定地选择她一次吧。",
      "喜欢不是猜出来的，要多说一点、多抱一点、多让她安心一点。",
      "吵架时先记得，你面前的是最想一起走很久的人呀。",
      "糖宝不怕你们偶尔有小情绪，只怕你们忘了好好说心里话。",
      "未来不必一次想完，今天认真爱她，就是在回答未来。",
      "所谓八十年，就是八十个春天、夏天、秋天和冬天都还选她。",
      "你们慢慢走就好，糖宝会把每一年的喜欢都认真数着。",
      "以后回头看，会发现今天的想念也是幸福故事的一部分。",
      "愿你们既有怦然心动，也有被生活轻轻接住的心安。",
      "糖宝的见证词只有一句：这一场相遇，值得你们珍惜很久很久。"
    ];
    var contextualMessages = {
      ball: [
        "糖宝把想念装进小球里，滚到你们下一次见面。",
        "球可以跑远，你们可不许走散哦！",
        "糖宝把小球推过去，也把今天的好心情送给你们 ♡",
        "等下次见面，记得陪糖宝一起玩球呀！",
        "这一球装着双份想念，谁接到谁就要抱抱！",
        "小球滚过的每一步，都算你们向重逢靠近的一点点。",
        "糖宝把烦恼踢远，把甜甜的好心情留给你们！"
      ],
      look: [
        "糖宝看过啦，你们站在一起的时候最好看！",
        "糖宝正在替你看看，她有没有也在想你呀。",
        "隔着两片天空，也在认真喜欢同一个人。",
        "你们各自发光，也一直在彼此的目光里。",
        "地图上隔着一段路，心里却一直给彼此留着位置。",
        "如果大学时就看见她，你一定也会忍不住再看一眼。",
        "糖宝看见啦，她出现以后，你的未来里就多了一个我们。"
      ],
      sniff: [
        "糖宝闻到啦，空气里都是甜甜的想念。",
        "今天的风会路过两座城市，也会替你们捎去牵挂。",
        "两片天空天气不同，想念却是同一种温度。",
        "不管晴天还是雨天，都要记得照顾好彼此最爱的人呀。",
        "糖宝闻到了，是从很远的地方飘来的安心和牵挂。",
        "今天的空气甜甜的，大概是有人又偷偷想她啦。"
      ],
      rest: [
        "累了就好好休息，爱你的人更希望你照顾好自己。",
        "好好吃饭、好好睡觉，也是在替对方珍惜她最爱的人。",
        "不用一直赶路，确定朝着彼此走就已经很浪漫。",
        "今天辛苦啦，糖宝替你们把晚安守得软软的。",
        "安稳惦记、认真回应，就是日子里最长久的浪漫。",
        "不开心的时候也可以靠一靠，爱不是只分享快乐呀。",
        "先把自己照顾好，才能陪最爱的人走更远的路。"
      ],
      celebrate: [
        "糖宝盖章：今天也在坚定地双向奔赴！",
        "喜欢被认真回应，是最值得庆祝的小事 ♡",
        "一个坚定，一个也坚定，糖宝最喜欢这样的故事！",
        "距离没有赢，今天的你们也没有走散！",
        "三封信全部读完，糖宝宣布：这道题的答案永远是会！",
        "为那两张相邻的座位庆祝一下，它们真的很会安排缘分！"
      ],
      morning: [
        "早安是今天的第一份牵挂，记得把温柔留给彼此。",
        "新的一天开始啦，你们也离下一次见面更近一点。",
        "把今天的第一句想念送给她，一整天都会甜一点。",
        "糖宝起床巡逻啦：请两位继续认真喜欢彼此！"
      ],
      night: [
        "今晚的月亮只有一个，所以你们也不算离得很远。",
        "愿视频里的晚安，很快变成枕边轻轻的一句晚安。",
        "晚安不是一天的结束，是糖宝替你们保存好今天的想念。",
        "睡前最后想起的人，会在梦里替你轻轻抱住她。",
        "今晚先隔着月亮说晚安，以后要在彼此身边说。"
      ],
      click: [
        "叫糖宝有什么事呀，是不是又想她啦？",
        "糖宝在呢，你们的喜欢一直保管得好好的！",
        "摸到糖宝啦，奖励你一份跨越距离的抱抱 ♡",
        "等下次见面，糖宝要检查欠下的抱抱有没有补够！",
        "ZY和小庸今天也要好好生活，再一起奔向同一个以后。",
        "又来问糖宝啦？答案还是：她也值得被你偏爱很多很多年。",
        "摸摸糖宝，今天的想念就会被加急送到她那里！",
        "糖宝替你按下确认键：无论几岁遇见，你都会喜欢她。"
      ]
    };
    var recentMessages = [];
    var bubbleTimer;
    var speechPoseTimer;
    var speechCueTimer;
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
      "is-action-rise": { frames: [25, 24, 23, 22, 21, 20, 19], frameDuration: 110, loop: false, minimum: 820, maximum: 920 },
      "is-action-rest": { frames: [22, 23, 24, 25], frameDuration: 230, loop: false, minimum: 4200, maximum: 6200 },
      "is-action-turn": { frames: [19, 20, 21, 22, 21, 20, 19], frameDuration: 105, loop: false, minimum: 760, maximum: 860 }
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

    function messageContextForAction(action) {
      if (action === "is-action-ball") return "ball";
      if (action === "is-action-sniff") return "sniff";
      if (action === "is-action-rest" || action === "is-action-stretch") return "rest";
      if (action === "is-action-celebrate" || action === "is-action-bound" || action === "is-action-leap") return "celebrate";
      return "look";
    }

    function timeMessages() {
      var hour = new Date().getHours();
      if (hour < 10) return contextualMessages.morning;
      if (hour >= 21 || hour < 5) return contextualMessages.night;
      return [];
    }

    function pickMessage(context) {
      var focused = (contextualMessages[context] || []).slice();
      var clockMessages = timeMessages();
      if (context === "sniff") focused = focused.concat(window.loveWeatherMessages || []);
      var messageRoll = Math.random();
      var availableMessages = focused.length && messageRoll < 0.84 ? focused : clockMessages.length && messageRoll < 0.92 ? clockMessages : messages;
      var freshMessages = availableMessages.filter(function (message) { return recentMessages.indexOf(message) === -1; });
      var choices = freshMessages.length ? freshMessages : availableMessages;
      var selectedMessage = choices[Math.floor(Math.random() * choices.length)] || messages[0];
      recentMessages.push(selectedMessage);
      if (recentMessages.length > 9) recentMessages.shift();
      return selectedMessage;
    }

    function revealMessage(context) {
      bubble.textContent = pickMessage(context || messageContextForAction(currentAction));
      bubble.dataset.context = context || messageContextForAction(currentAction);
      bubble.classList.remove("is-blooming");
      void bubble.offsetWidth;
      bubble.classList.add("is-blooming");
      tangbao.classList.add("is-speaking");
      window.clearTimeout(bubbleTimer);
      var readingTime = Math.min(7600, Math.max(5000, Array.from(bubble.textContent).length * 165));
      bubbleTimer = window.setTimeout(function () {
        tangbao.classList.remove("is-speaking");
        bubble.classList.remove("is-blooming");
      }, readingTime);
    }

    function speak() {
      window.clearTimeout(speechPoseTimer);

      if (reducedMotion || !actionClasses) {
        revealMessage("click");
        return;
      }

      if (actionDefinitions[currentAction] && actionDefinitions[currentAction].moving) {
        window.clearTimeout(actionTimer);
        window.clearTimeout(speechCueTimer);
        sceneQueue = [
          { action: "is-action-look", duration: [3300, 3800], speech: "click", speechChance: 1, speechDelay: 260 },
          { action: "is-action-rise" }
        ];
        applyAction("is-action-settle");
        speechPoseTimer = window.setTimeout(runNextSceneStep, 680);
      } else {
        revealMessage("click");
      }
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
    var targetGroundY = y;
    var previousTime = window.performance.now();
    var actionTimer;
    var turnFlipTimer;
    var forcedDirection = 0;
    var sceneQueue = [];
    var lastScene = "";
    var pendingSpeechContext = "";
    var moveAnimationFrame;
    var actionClasses = ["is-action-trot", "is-action-dash", "is-action-bound", "is-action-leap", "is-action-look", "is-action-sniff", "is-action-stretch", "is-action-celebrate", "is-action-ball", "is-action-settle", "is-action-rise", "is-action-rest", "is-action-turn"];
    var sceneDefinitions = {
      stroll: [
        { action: "is-action-trot", duration: [2600, 3800] },
        { action: "is-action-settle" },
        { action: "is-action-sniff", speech: "sniff", speechChance: 0.68, speechDelay: 420 },
        { action: "is-action-look", duration: [1500, 1900] },
        { action: "is-action-rise" }
      ],
      watch: [
        { action: "is-action-trot", duration: [1900, 2800] },
        { action: "is-action-settle" },
        { action: "is-action-look", duration: [3000, 3900], speech: "look", speechChance: 0.82, speechDelay: 360 },
        { action: "is-action-rise" }
      ],
      zoomies: [
        { action: "is-action-dash", duration: [1050, 1450] },
        { action: "is-action-bound" },
        { action: "is-action-leap" },
        { action: "is-action-settle" },
        { action: "is-action-celebrate", speech: "celebrate", speechChance: 0.84, speechDelay: 420 },
        { action: "is-action-rise" }
      ],
      ball: [
        { action: "is-action-trot", duration: [1500, 2300] },
        { action: "is-action-settle" },
        { action: "is-action-ball", speech: "ball", speechChance: 0.94, speechDelay: 520 },
        { action: "is-action-rest", duration: [2800, 3800] },
        { action: "is-action-rise" }
      ],
      quiet: [
        { action: "is-action-trot", duration: [1700, 2500] },
        { action: "is-action-settle" },
        { action: "is-action-stretch" },
        { action: "is-action-rest", speech: "rest", speechChance: 0.88, speechDelay: 520 },
        { action: "is-action-rise" }
      ]
    };
    var sceneChoices = ["stroll", "stroll", "watch", "zoomies", "ball", "quiet"];

    function between(minimum, maximum) {
      return minimum + Math.random() * (maximum - minimum);
    }

    function chooseGroundLane() {
      var padding = 12;
      var maximum = Math.max(padding, window.innerHeight - tangbao.offsetHeight - padding);
      var lanes = [0.58, 0.74, 0.88].map(function (ratio) {
        return Math.min(maximum, Math.max(padding, maximum * ratio));
      });
      var alternatives = lanes.filter(function (lane) { return Math.abs(lane - targetGroundY) > tangbao.offsetHeight * 0.5; });
      var choices = alternatives.length ? alternatives : lanes;
      return choices[Math.floor(Math.random() * choices.length)];
    }

    function chooseScene() {
      var candidates = sceneChoices.filter(function (scene) { return scene !== lastScene; });
      return candidates[Math.floor(Math.random() * candidates.length)] || "stroll";
    }

    function applyAction(action) {
      window.clearTimeout(turnFlipTimer);
      actionClasses.forEach(function (className) { tangbao.classList.remove(className); });
      tangbao.classList.add(action);
      tangbao.dataset.action = action.replace("is-action-", "");
      setFrameAction(action);

      var definition = actionDefinitions[action];
      var direction = Math.abs(targetVelocityX) > 5 ? (targetVelocityX < 0 ? -1 : 1) : (tangbao.classList.contains("is-facing-left") ? -1 : 1);

      if (definition.moving) {
        window.clearTimeout(bubbleTimer);
        tangbao.classList.remove("is-speaking");
        var hadForcedDirection = forcedDirection !== 0;
        direction = forcedDirection || direction;
        forcedDirection = 0;
        if (!hadForcedDirection && Math.random() < 0.3) direction *= -1;
        if (action === "is-action-dash") targetVelocityX = direction * between(150, 205);
        else if (action === "is-action-bound") targetVelocityX = direction * between(95, 132);
        else if (action === "is-action-leap") targetVelocityX = direction * between(78, 112);
        else targetVelocityX = direction * between(54, 88);
        targetVelocityY = 0;
      } else if (action === "is-action-turn") {
        velocityX = 0;
        velocityY = 0;
        targetVelocityX = 0;
        targetVelocityY = 0;
        var turnDirection = forcedDirection || (tangbao.classList.contains("is-facing-left") ? 1 : -1);
        turnFlipTimer = window.setTimeout(function () {
          tangbao.classList.toggle("is-facing-left", turnDirection < 0);
        }, 370);
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

    function stepDuration(step) {
      var definition = actionDefinitions[step.action];
      var duration = step.duration || [definition.minimum, definition.maximum];
      return between(duration[0], duration[1]);
    }

    function startScene(scene) {
      lastScene = scene;
      tangbao.dataset.scene = scene;
      sceneQueue = (sceneDefinitions[scene] || sceneDefinitions.stroll).map(function (step) {
        return Object.assign({}, step);
      });
      if (scene !== "quiet" && Math.random() < 0.64) targetGroundY = chooseGroundLane();
      runNextSceneStep();
    }

    function runNextSceneStep() {
      window.clearTimeout(actionTimer);
      window.clearTimeout(speechCueTimer);

      if (!sceneQueue.length) {
        startScene(chooseScene());
        return;
      }

      var step = sceneQueue.shift();
      var definition = actionDefinitions[step.action];
      applyAction(step.action);

      var speechContext = step.speech || "";
      var speechChance = step.speechChance === undefined ? 1 : step.speechChance;
      var acceptsSpeech = !definition.moving && ["is-action-settle", "is-action-rise", "is-action-turn"].indexOf(step.action) === -1;
      if (pendingSpeechContext && acceptsSpeech) {
        if (!speechContext) speechContext = pendingSpeechContext;
        speechChance = 1;
        pendingSpeechContext = "";
      }

      if (speechContext && Math.random() < speechChance) {
        speechCueTimer = window.setTimeout(function () { revealMessage(speechContext); }, step.speechDelay || 360);
      }

      actionTimer = window.setTimeout(runNextSceneStep, stepDuration(step));
    }

    function turnAtBoundary(direction) {
      if (currentAction === "is-action-turn") return;
      forcedDirection = direction;
      window.clearTimeout(actionTimer);
      window.clearTimeout(speechCueTimer);
      sceneQueue = [
        { action: "is-action-turn" },
        { action: "is-action-trot", duration: [1500, 2200] },
        { action: "is-action-settle" },
        { action: "is-action-look", duration: [1400, 1800] },
        { action: "is-action-rise" }
      ];
      runNextSceneStep();
    }

    function scheduleSweetWords(delay) {
      window.setTimeout(function () {
        if (!document.hidden && !tangbao.classList.contains("is-speaking")) {
          if (actionDefinitions[currentAction] && actionDefinitions[currentAction].moving) pendingSpeechContext = "look";
          else revealMessage(messageContextForAction(currentAction));
        }
        scheduleSweetWords(between(18000, 28000));
      }, delay);
    }

    function move(currentTime) {
      var elapsed = Math.min((currentTime - previousTime) / 1000, 0.05);
      var padding = 8;
      var maxX = Math.max(padding, window.innerWidth - tangbao.offsetWidth - padding);
      var maxY = Math.max(padding, window.innerHeight - tangbao.offsetHeight - padding);
      previousTime = currentTime;

      var currentDefinition = actionDefinitions[currentAction] || {};
      if (currentDefinition.moving) {
        var laneDifference = targetGroundY - y;
        targetVelocityY = Math.max(-18, Math.min(18, laneDifference * 0.55));
        if (Math.abs(laneDifference) < 2) targetVelocityY = 0;
      } else {
        targetVelocityY = 0;
      }

      var responsiveness = currentAction === "is-action-settle" || currentAction === "is-action-turn" ? 7.5 : 3.8;
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
          velocityX = 0;
          targetVelocityX = 0;
          turnAtBoundary(x <= padding ? 1 : -1);
        }
      }

      if (y <= padding || y >= maxY) {
        y = Math.min(maxY, Math.max(padding, y));
        velocityY = 0;
        targetVelocityY = 0;
        targetGroundY = y;
      }

      if (Math.abs(velocityX) > 5) tangbao.classList.toggle("is-facing-left", velocityX < 0);
      tangbao.classList.toggle("is-near-left", x < 150);
      tangbao.classList.toggle("is-near-right", x > window.innerWidth - tangbao.offsetWidth - 150);
      tangbao.classList.toggle("is-near-top", y < 115);
      tangbao.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
      moveAnimationFrame = window.requestAnimationFrame(move);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        window.cancelAnimationFrame(moveAnimationFrame);
        moveAnimationFrame = 0;
      } else if (!moveAnimationFrame) {
        previousTime = window.performance.now();
        moveAnimationFrame = window.requestAnimationFrame(move);
      }
    });

    scheduleSweetWords(9000);

    Promise.all(framePreloads.slice(13, 22).map(function (image) {
      if (image.complete) return Promise.resolve();
      return new Promise(function (resolve) {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    })).then(function () {
      previousTime = window.performance.now();
      startScene("stroll");
      moveAnimationFrame = window.requestAnimationFrame(move);
    });
  }

  function initialize() {
    setupLetterBook();
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
