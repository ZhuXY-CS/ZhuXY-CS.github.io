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
    var lyricSets = Array.prototype.slice.call(player.querySelectorAll("[data-lyric-set]")).map(function (set) {
      return {
        root: set,
        previous: set.querySelector(".love-player__lyric--previous"),
        current: set.querySelector(".love-player__lyric--current"),
        next: set.querySelector(".love-player__lyric--next")
      };
    });
    var titleLabel = player.querySelector("[data-track-title]");
    var artistLabel = player.querySelector("[data-track-artist]");
    var trackCountLabel = player.querySelector("[data-track-count]");
    var trackButtons = Array.prototype.slice.call(player.querySelectorAll(".love-player__track"));
    var previousButton = player.querySelector(".love-player__previous");
    var nextButton = player.querySelector(".love-player__next");
    var lyricLines = [];
    var activeLyricIndex = -1;
    var activeLyricSetIndex = 0;
    var lyricTransitionTimer;
    var lyricRequestId = 0;
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
      return parsed
        .sort(function (left, right) { return left.time - right.time; })
        .reduce(function (lines, line) {
          var previous = lines[lines.length - 1];
          if (previous && line.time - previous.time < 0.7) {
            lines[lines.length - 1] = line;
          } else {
            lines.push(line);
          }
          return lines;
        }, []);
    }

    function writeLyricSet(set, lyricIndex, message) {
      set.previous.textContent = lyricIndex > 0 ? lyricLines[lyricIndex - 1].text : "";
      set.current.textContent = lyricIndex >= 0 ? lyricLines[lyricIndex].text : (message || "前奏响起，故事慢慢开始");
      set.next.textContent = lyricLines[lyricIndex + 1] ? lyricLines[lyricIndex + 1].text : "";
    }

    function resetLyrics(message) {
      window.clearTimeout(lyricTransitionTimer);
      lyricLines = [];
      activeLyricIndex = -1;
      activeLyricSetIndex = 0;
      lyricSets.forEach(function (set, index) {
        set.root.classList.remove("is-active", "is-leaving", "is-resetting");
        set.root.toggleAttribute("aria-hidden", index !== activeLyricSetIndex);
        set.previous.textContent = "";
        set.current.textContent = index === activeLyricSetIndex ? (message || "歌词正在赶来") : "";
        set.next.textContent = "";
      });
      lyricSets[activeLyricSetIndex].root.classList.add("is-active");
    }

    function loadLyrics(source) {
      var requestId = ++lyricRequestId;
      resetLyrics("歌词正在赶来");
      if (!source) {
        resetLyrics("这一首暂时没有同步歌词");
        return;
      }

      fetch(source)
        .then(function (response) {
          if (!response.ok) throw new Error("Lyrics unavailable");
          return response.text();
        })
        .then(function (content) {
          if (requestId !== lyricRequestId) return;
          lyricLines = parseLyrics(content);
          if (!lyricLines.length) throw new Error("Lyrics empty");
          renderLyric(true);
        })
        .catch(function () {
          if (requestId !== lyricRequestId) return;
          resetLyrics("这一首暂时没有同步歌词");
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

      if (force || lyricSets.length < 2) {
        window.clearTimeout(lyricTransitionTimer);
        var immediateSet = lyricSets[activeLyricSetIndex];
        lyricSets.forEach(function (set, index) {
          set.root.classList.remove("is-active", "is-leaving", "is-resetting");
          set.root.toggleAttribute("aria-hidden", index !== activeLyricSetIndex);
        });
        writeLyricSet(immediateSet, nextIndex);
        immediateSet.root.classList.add("is-active");
        activeLyricIndex = nextIndex;
        return;
      }

      window.clearTimeout(lyricTransitionTimer);
      var outgoingSet = lyricSets[activeLyricSetIndex];
      var incomingSetIndex = activeLyricSetIndex === 0 ? 1 : 0;
      var incomingSet = lyricSets[incomingSetIndex];

      incomingSet.root.classList.add("is-resetting");
      incomingSet.root.classList.remove("is-active", "is-leaving");
      writeLyricSet(incomingSet, nextIndex);
      void incomingSet.root.offsetWidth;
      incomingSet.root.classList.remove("is-resetting");
      incomingSet.root.removeAttribute("aria-hidden");

      outgoingSet.root.classList.remove("is-active");
      outgoingSet.root.classList.add("is-leaving");
      incomingSet.root.classList.add("is-active");
      activeLyricSetIndex = incomingSetIndex;
      activeLyricIndex = nextIndex;

      lyricTransitionTimer = window.setTimeout(function () {
        outgoingSet.root.classList.remove("is-leaving");
        outgoingSet.root.setAttribute("aria-hidden", "true");
      }, 440);
    }

    function updateProgress(forceLyrics) {
      var ratio = audio.duration ? Math.min(1, audio.currentTime / audio.duration) : 0;
      progress.value = Math.round(ratio * 1000);
      progress.style.setProperty("--love-progress", (ratio * 100).toFixed(2) + "%");
      currentTimeLabel.textContent = formatTime(audio.currentTime);
      durationLabel.textContent = formatTime(audio.duration);
      renderLyric(Boolean(forceLyrics));
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
      updateProgress(true);
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

  function setupHeartCursorTrail() {
    var finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reducedMotion || !finePointer) return;

    var colors = ["#ff6285", "#f59a45", "#e6c447", "#4fbe83", "#4da9d8", "#7475df", "#b86bce"];
    var activeHearts = [];
    var colorIndex = 0;
    var lastX = -100;
    var lastY = -100;
    var lastTime = 0;
    var pendingPoint = null;
    var animationFrame = 0;

    function forgetHeart(heart) {
      var index = activeHearts.indexOf(heart);
      if (index !== -1) activeHearts.splice(index, 1);
      heart.remove();
    }

    function spawnHeart(x, y) {
      if (activeHearts.length >= 20) forgetHeart(activeHearts[0]);

      var heart = document.createElement("span");
      heart.className = "love-cursor-trail__heart";
      heart.textContent = colorIndex % 4 === 3 ? "♡" : "♥";
      heart.style.left = x + "px";
      heart.style.top = y + "px";
      heart.style.setProperty("--trail-color", colors[colorIndex % colors.length]);
      heart.style.setProperty("--trail-size", (0.54 + Math.random() * 0.32).toFixed(2) + "rem");
      heart.style.setProperty("--trail-drift-x", ((Math.random() - 0.5) * 22).toFixed(1) + "px");
      heart.style.setProperty("--trail-drift-y", (-20 - Math.random() * 20).toFixed(1) + "px");
      heart.style.setProperty("--trail-rotate", ((Math.random() - 0.5) * 32).toFixed(1) + "deg");
      heart.setAttribute("aria-hidden", "true");
      document.body.appendChild(heart);
      activeHearts.push(heart);
      colorIndex += 1;

      window.setTimeout(function () { forgetHeart(heart); }, 820);
    }

    document.addEventListener("pointermove", function (event) {
      if (event.pointerType && event.pointerType !== "mouse") return;

      pendingPoint = {
        x: event.clientX,
        y: event.clientY,
        time: window.performance.now()
      };
      if (animationFrame) return;

      animationFrame = window.requestAnimationFrame(function () {
        animationFrame = 0;
        var point = pendingPoint;
        pendingPoint = null;
        if (!point) return;

        var distance = Math.hypot(point.x - lastX, point.y - lastY);
        if (distance < 12 || point.time - lastTime < 40) return;
        lastX = point.x;
        lastY = point.y;
        lastTime = point.time;
        spawnHeart(point.x, point.y);
      });
    }, { passive: true });

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) return;
      pendingPoint = null;
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      activeHearts.slice().forEach(forgetHeart);
    });
  }

  function setupTangbao() {
    var tangbao = document.getElementById("tangbao-witness");
    if (!tangbao) return;

    var bubble = tangbao.querySelector(".tangbao-witness__bubble");
    var sprite = tangbao.querySelector(".tangbao-witness__sprite");
    var spriteLayers = Array.from(tangbao.querySelectorAll(".tangbao-witness__frame"));
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
      "糖宝的见证词只有一句：这一场相遇，值得你们珍惜很久很久。",
      "爱不是一直有说不完的话，是安静的时候也知道彼此没有走远。",
      "不用把每次想念都藏好，偶尔黏人也是认真喜欢的证据。",
      "她想听的有时不是答案，只是你愿意站在她这一边。",
      "忙完记得告诉她一声：我回来啦，我还是最想和你说话。",
      "隔着屏幕分享的一顿饭，也是在认真参与彼此的生活。",
      "把琐碎讲给同一个人听，日子就有了共同的名字。",
      "你们不必每一天都完美，只要每一次都愿意重新靠近。",
      "闹别扭时少讲一点输赢，多记得眼前的人有多重要。",
      "坚定不是从不动摇，是有小情绪以后仍然牵住彼此。",
      "她偶尔胡思乱想，不是麻烦，是因为真的很在乎你呀。",
      "记得回应她藏在玩笑里的认真，也抱住她没说完的委屈。",
      "糖宝把你们没见面的日子，一天一天折成重逢的小星星。",
      "远方不会一直是远方，总有一天会变成一起回家的方向。",
      "现在隔着屏幕说晚安，以后要抢同一床被子啦！",
      "等住进同一段生活，连买菜和散步都会变成值得期待的小事。",
      "想象过很多未来很好，更好的是每一个未来里都没有落下她。",
      "承诺不只写在句子里，也藏在每一次认真回应和耐心解释里。",
      "安全感不是猜得到的，要把喜欢一次又一次说给她听。",
      "别让她在沉默里猜太久，你的主动就是最温柔的答案。",
      "爱她的时候，也请尊重她的节奏，陪她做自由又安心的自己。",
      "两个人都可以有自己的天空，也可以一直共享同一颗心。",
      "愿你们既能依赖彼此，也能因为彼此变得更加勇敢。",
      "糖宝喜欢的爱情，是心动有回应，委屈有安慰，未来有彼此。",
      "很多年后再看今天，会发现等待也曾悄悄参与了幸福。",
      "每次见面都不是短暂拥有，是为长长的以后积攒真实回忆。",
      "别害怕偶尔疲惫，爱不是考试，累了可以一起歇一会儿。",
      "一句到家了，一句吃饭了吗，都是藏在日常里的我爱你。",
      "你们从不同方向走来，以后要朝着同一个方向慢慢走呀。",
      "糖宝已经把最甜的位置留好，专门放你们往后的故事。",
      "愿所有没能立刻见面的想念，最后都有一个怀抱来签收。",
      "糖宝今日播报：小庸很想ZY，而且明天还会继续想。",
      "一想到你们以后会一起吃饭、散步、等日落，糖宝的尾巴就摇个不停。",
      "今天发生的小事也要讲给彼此听呀，爱情就是慢慢住进对方的日常。",
      "糖宝把软乎乎的肚皮借你靠一下，再把最安心的抱抱留给她。",
      "见不到的时候认真想念，见到的时候认真拥抱，这就是糖宝喜欢的爱情。",
      "你们要一起拥有很多普通星期二，也要一起收藏好多特别纪念日。",
      "有人记得你的喜好、情绪和小习惯，本身就是一件很幸福的事。",
      "糖宝希望你们忙完一天，最想分享的人始终还是彼此。",
      "以后一起遛糖宝的时候，你们一人牵绳，一人牵手，好不好呀？",
      "爱不是把生活变得没有烦恼，是让每个烦恼都有一个可以商量的人。",
      "她开心的时候陪她多笑一会儿，她难过的时候就把声音放温柔一点。",
      "今天也要夸夸她呀，被喜欢的人认真欣赏，会开心很久很久。",
      "糖宝的小耳朵听见啦，你每一次说起她，声音都会悄悄变温柔。",
      "哪怕只是一起发呆，只要身边是喜欢的人，时间也会变得甜甜的。",
      "下次见面要拍很多照片，也要留一点时间什么都不做，只好好看着彼此。",
      "你们可以偶尔幼稚、偶尔黏人，因为被偏爱的人本来就可以做小朋友。",
      "糖宝想把每天的好心情攒起来，等你们见面时一次性全部送给你们。",
      "有人跨过忙碌来回应你，有人穿过距离来惦记你，这就是双向奔赴呀。",
      "她不是你计划里的某一站，是你每一段未来都想一起看风景的人。",
      "如果今天有一点不顺利，就把它讲给彼此听，坏心情分一半就会轻一点。",
      "糖宝最懂啦：真正的喜欢，会记得她爱吃什么，也会在意她今天开不开心。",
      "等你们住得近一点，早安就不只是一条消息，而是醒来时看见的第一张脸。",
      "糖宝会替你们收藏每句想你，等重逢时换成一个超级久的抱抱。",
      "你们的爱情不必像烟花天天热闹，像灯一样一直亮着就很好。",
      "今天也请让她确定：无论距离多远，她都稳稳地在你的未来里。",
      "她去远方认真长大，你就在这里认真爱她；你们做的都是同一件关于未来的事。",
      "新校园、新街道、新生活也许会让她偶尔慌张，记得告诉她：慢慢来，我一直都在。",
      "她正在勇敢适应陌生的一切，你要做她隔着很远也能摸到的安心呀。",
      "别只问她今天累不累，也要认真夸夸她：一个人走到那么远的地方，真的很勇敢。",
      "她上课的时候，你替她好好生活；她回来的时候，你把攒好的温柔都讲给她听。",
      "隔着一片海也没关系，爱会把早安、晚安和每件小事都变成通往彼此的桥。",
      "不在同一个时区，就把想念交接好：她醒来时有你的牵挂，你入睡时有她的晚安。",
      "远方的生活很新，你的偏爱要一直很熟悉，让她无论走到哪里都知道有人等她。",
      "她如果偶尔想家，就陪她多说一会儿话；你的声音，也是她可以随身带着的小小故乡。",
      "课程难一点没关系，适应慢一点也没关系，她已经在很勇敢地走自己的路啦。",
      "她有新的课堂和风景，你也会有属于自己的下一站；你们都在成为更好的自己。",
      "暂时还没等到下一站，不代表你停在原地；认真准备的每一天，都在把答案带近。",
      "不要拿自己的时间表和别人比较，糖宝知道，你也在用自己的节奏努力发光。",
      "她爱的是会认真爱她、也认真生活的你，不是一张必须按时完成的人生清单。",
      "你不用立刻变得无所不能，只要一边寻找方向，一边好好爱她，就已经很了不起。",
      "你们不是一个走快、一个走慢，而是在不同的路段，朝同一个以后努力。",
      "她在远方追梦，你也在这里寻找下一片天空；爱情不是比赛，是彼此托住。",
      "当你对未来有一点没底，记得她选择的从来不是某个结果，而是独一无二的你。",
      "把焦虑说给她听不是添麻烦，是邀请最爱的人和你一起面对生活呀。",
      "她可以在远方放心往前走，因为一回头，你的爱一直亮着。",
      "你也要相信自己呀，能这样认真爱一个人的小庸，一定也会找到属于自己的路。",
      "有些答案来得慢一点，是为了把你带到真正适合的位置；糖宝陪你们耐心等等。",
      "你负责给她跨越距离的安全感，她负责提醒你：慢一点也没关系，我依然爱你。",
      "愿她在新的生活里被世界温柔接住，也愿你在等待答案时一直被她坚定抱住。",
      "你们可以一边想念，一边成长；等再次拥抱时，都带着好多新故事回到彼此身边。",
      "距离让你们错开了作息，却没有错开关心：总有人醒着，替另一个人好好牵挂。",
      "她见到的新风景会讲给你听，你走过的每一步也都值得被她认真收藏。",
      "今天没有并肩也不要紧，你们正在把各自的路，慢慢走成一条回家的路。",
      "糖宝相信，等这段异地被写进回忆里，最清楚的一句话一定是：我们没有松开彼此。",
      "等重逢那天，不只要说好久不见，还要说：辛苦啦，我们都把这段路走得很好。"
    ];
    var contextualMessages = {
      ball: [
        "糖宝把想念装进小球里，滚到你们下一次见面。",
        "球可以跑远，你们可不许走散哦！",
        "糖宝把小球推过去，也把今天的好心情送给你们 ♡",
        "等下次见面，记得陪糖宝一起玩球呀！",
        "这一球装着双份想念，谁接到谁就要抱抱！",
        "小球滚过的每一步，都算你们向重逢靠近的一点点。",
        "糖宝把烦恼踢远，把甜甜的好心情留给你们！",
        "糖宝追着小球跑，你们追着同一个未来跑！",
        "这一球先替你送过去，附赠一句超级想你。",
        "小球会绕弯，喜欢不会；它一直朝着她的方向。",
        "接住啦！里面装着今天没来得及说完的想念。",
        "糖宝玩累了也要回来，因为最安心的地方一直有人等。"
      ],
      look: [
        "糖宝看过啦，你们站在一起的时候最好看！",
        "糖宝正在替你看看，她有没有也在想你呀。",
        "隔着两片天空，也在认真喜欢同一个人。",
        "你们各自发光，也一直在彼此的目光里。",
        "地图上隔着一段路，心里却一直给彼此留着位置。",
        "如果大学时就看见她，你一定也会忍不住再看一眼。",
        "糖宝看见啦，她出现以后，你的未来里就多了一个我们。",
        "糖宝左看看右看看，还是你们看彼此的眼神最甜。",
        "照片会留住这一刻，你们要一起创造很多下一刻。",
        "她不在眼前的时候，也一直在你每一个未来计划里。",
        "糖宝望向远方啦，下一次见面正在路上慢慢靠近。",
        "喜欢一个人，就是看见好看的风景时第一时间想起她。",
        "无论隔着多远，你们抬头时仍然在同一片天空下面。",
        "她正在看新的世界，而你一直是她看完风景后最想分享的人。",
        "糖宝望向海的那边啦：她在努力适应，也在很认真地想你。",
        "等她走熟陌生的街道，也会发现你的牵挂早就一路陪着她。",
        "你的下一站还在路上，可她看向你的目光，从来没有因此少一点坚定。"
      ],
      sniff: [
        "糖宝闻到啦，空气里都是甜甜的想念。",
        "今天的风会路过两座城市，也会替你们捎去牵挂。",
        "两片天空天气不同，想念却是同一种温度。",
        "不管晴天还是雨天，都要记得照顾好彼此最爱的人呀。",
        "糖宝闻到了，是从很远的地方飘来的安心和牵挂。",
        "今天的空气甜甜的，大概是有人又偷偷想她啦。",
        "风里有一点花香，还有某个人刚刚路过的想念。",
        "晴天适合分享快乐，雨天适合提醒她记得带伞。",
        "天气会变，糖宝检查过啦，你们的偏爱没有变。",
        "今天冷一点，就把关心说得暖一点吧。",
        "糖宝闻到重逢的味道啦，好像真的越来越近了！",
        "风从她那边来时，会不会也偷偷带来一句想你？",
        "海风绕得再远，也会把你的那句注意保暖送到她身边。",
        "她那边下雨时，记得做她消息框里的一把小伞呀。",
        "糖宝闻见新书和远方的味道啦，也闻见她藏在忙碌里的想念。",
        "两边的天气可以不同，你们给彼此的温度要一直刚刚好。"
      ],
      rest: [
        "累了就好好休息，爱你的人更希望你照顾好自己。",
        "好好吃饭、好好睡觉，也是在替对方珍惜她最爱的人。",
        "不用一直赶路，确定朝着彼此走就已经很浪漫。",
        "今天辛苦啦，糖宝替你们把晚安守得软软的。",
        "安稳惦记、认真回应，就是日子里最长久的浪漫。",
        "不开心的时候也可以靠一靠，爱不是只分享快乐呀。",
        "先把自己照顾好，才能陪最爱的人走更远的路。",
        "累的时候不用逞强，最亲近的人也想照顾你呀。",
        "今晚先把烦恼放下，明天再带着彼此的爱重新出发。",
        "不用急着解决所有问题，先温柔地听完彼此的心情。",
        "糖宝陪你们休息一会儿，坚定的人也可以偶尔软乎乎。",
        "被爱的人要好好睡觉，因为远方有人认真牵挂着你。",
        "慢下来不是停下，你们只是在为更远的以后攒力气。",
        "适应新生活很累的话，就先休息一下；勇敢的人也可以想家、可以撒娇。",
        "还没等到自己的下一站也别着急，人生不是迟到，只是在认真选择方向。",
        "她累的时候你接住她，你迷茫的时候也要让她抱抱你，这才是两个人呀。",
        "不必在每次通话里都假装开心，能放心说一句今天有点难，也是很深的爱。",
        "糖宝把你们的焦虑都压在软乎乎的爪子下面啦，今晚先安心睡觉。"
      ],
      celebrate: [
        "糖宝盖章：今天也在坚定地双向奔赴！",
        "喜欢被认真回应，是最值得庆祝的小事 ♡",
        "一个坚定，一个也坚定，糖宝最喜欢这样的故事！",
        "距离没有赢，今天的你们也没有走散！",
        "三封信全部读完，糖宝宣布：这道题的答案永远是会！",
        "为那两张相邻的座位庆祝一下，它们真的很会安排缘分！",
        "糖宝开心转圈：又是没有把爱藏起来的一天！",
        "今天认真说了想念，值得奖励一个大大的抱抱！",
        "恭喜两位，又共同收藏了一个普通却珍贵的今天。",
        "每一次把误会说开，都是爱情升级成功的提示音！",
        "下一次重逢正在加载，糖宝先替你们放一朵小烟花。",
        "又坚定地选择了彼此一次，当然要好好庆祝啦！",
        "她勇敢开启了新的生活，值得一个超级大的夸夸和抱抱！",
        "你今天也没有被迷茫打败，糖宝宣布：小庸向自己的未来又走了一步！",
        "跨过一片海也要庆祝彼此的小进步，因为你们一直是同一支队伍。",
        "又认真听完了对方的一天，恭喜你们把异地过成了共同生活！"
      ],
      food: [
        "糖宝认真啃骨头，你们也要认真吃饭，不许让对方担心呀！",
        "这根小骨头分你们一半，甜甜的抱抱要给彼此双份。",
        "糖宝吃得香香的，因为知道你们的以后也会过得香香甜甜。",
        "先补充一点能量，再继续替你们守护长长久久的喜欢！",
        "糖宝把最好吃的一口留给你们，把最好看的未来也留给你们。",
        "好好吃饭不是小事，是在照顾那个被对方放在心尖上的人呀。",
        "咔嚓咔嚓，糖宝把今天的小烦恼都啃掉，只留下甜甜的想念。",
        "一日三餐要按时，想念她这件事可以随时加餐！",
        "糖宝吃饱啦，现在有满满力气替你们等下一次重逢。",
        "以后一起吃很多顿饭吧，从热气腾腾的早餐一直吃到白发苍苍。",
        "最幸福的菜单，是喜欢的人坐在对面，糖宝趴在桌边。",
        "糖宝啃完这根小骨头，再替你们许一个平安健康、长长久久。",
        "她忙着适应新课程也要按时吃饭，你忙着寻找方向也不许饿着自己！",
        "隔着屏幕互相晒一晒今天吃了什么，也算一起吃了一顿饭呀。",
        "等重逢以后，要把现在错开的早餐和晚餐，慢慢吃成很多顿团圆饭。"
      ],
      water: [
        "糖宝喝一口水，也提醒你们忙起来别忘了照顾自己呀。",
        "咕嘟咕嘟，把今天的小委屈喝掉，再带着爱重新出发。",
        "两座城市的天气不一样，但总有人提醒你按时喝水、好好生活。",
        "糖宝补充好水分啦，接下来继续认真替你们想念彼此！",
        "喝水的时候也会想起一个人，这大概就是日常里软乎乎的爱。",
        "今天也要照顾好自己，因为你是她隔着很远也会牵挂的人。",
        "水碗里晃着两颗小星星，一颗是ZY，一颗是小庸。",
        "慢慢喝，慢慢爱，生活里的温柔都值得一口一口珍惜。",
        "糖宝喝饱啦，也把清清甜甜的好心情分给你们一大碗！",
        "记得提醒她喝水，也记得告诉她：我不是随口关心，我是真的在意你。",
        "一声喝水了吗很普通，可被同一个人惦记很久，就会变得很浪漫。",
        "糖宝的水碗见底啦，你们今天的喜欢可不许见底哦！",
        "她上课前带好水，你忙自己的事情也记得喝水，互相牵挂才是双向的呀。",
        "糖宝替你叮嘱远方的小朋友：再忙也要喝水，还有记得想小庸。",
        "你的一句记得喝水，会穿过很远的路，落在她最普通也最需要被爱的一天里。"
      ],
      morning: [
        "早安是今天的第一份牵挂，记得把温柔留给彼此。",
        "新的一天开始啦，你们也离下一次见面更近一点。",
        "把今天的第一句想念送给她，一整天都会甜一点。",
        "糖宝起床巡逻啦：请两位继续认真喜欢彼此！",
        "早安呀，把昨晚的想念带进今天，再好好喜欢一天。",
        "起床第一件小事：记得告诉她，今天也会想她。",
        "愿你们今天各有收获，晚上再把故事讲给彼此听。",
        "新的一天不必很完美，有彼此惦记就已经很好。",
        "糖宝送来晨间任务：好好生活，也别忘了偷偷想她。",
        "太阳升起来啦，你们的重逢倒计时又少了一天。",
        "你醒来时她或许已经开始忙碌，但你的早安依然会成为她当天的小惊喜。",
        "愿她带着你的喜欢走进新课堂，也愿你带着她的相信走向自己的下一站。",
        "今天也不用急着追上谁，你们按照自己的节奏，好好走完各自的一天。",
        "糖宝把早安装进漂洋过海的小信封里啦，请她今天也要开心一点。"
      ],
      daytime: [
        "白天各自忙碌，心里也要给彼此留一扇随时能回来的门。",
        "工作学习再忙，也别忘了喝水，还有回一句想你。",
        "把手边的事认真做好，就是在为共同的以后添一块砖。",
        "午后的阳光刚刚好，适合偷偷想她三分钟。",
        "各自努力的白天，也是在一起建设未来。",
        "她认真上课的时候，你也在认真寻找方向，你们谁都没有停下呀。",
        "不用时时在线也能安心，因为忙完以后，你们还是最想回到彼此身边。",
        "新生活会慢慢熟悉，新机会也会慢慢出现；糖宝对你们两个都有信心。",
        "今天各自完成一件小事，晚上交换故事，就又共同拥有了一天。"
      ],
      night: [
        "今晚的月亮只有一个，所以你们也不算离得很远。",
        "愿视频里的晚安，很快变成枕边轻轻的一句晚安。",
        "晚安不是一天的结束，是糖宝替你们保存好今天的想念。",
        "睡前最后想起的人，会在梦里替你轻轻抱住她。",
        "今晚先隔着月亮说晚安，以后要在彼此身边说。",
        "今天没有见到也没关系，梦里可以先提前拥抱一下。",
        "关掉屏幕以后，牵挂也不会跟着下线。",
        "把今天没说完的话留给明天，把今晚的安心留给彼此。",
        "夜色很长，但有人想着你，晚风就不会太凉。",
        "糖宝替你们把月亮看好啦，现在可以安心说晚安了。",
        "愿你们在不同的枕头上，做一个关于同一个未来的梦。",
        "她那边的夜来得和你不一样，可每一句晚安都准确落在彼此心上。",
        "如果她今天有一点想家，就多陪她几分钟，让熟悉的声音抱抱她。",
        "你也可以把迷茫交给她一点点，被坚定选择的人不用总是假装勇敢。",
        "糖宝守着海两边的夜灯：一盏照着她好好生活，一盏照着你继续向前。",
        "等以后住在一起，再讲起这些隔着时差等消息的夜晚，一定会更珍惜身边的晚安。"
      ],
      click: [
        "叫糖宝有什么事呀，是不是又想她啦？",
        "糖宝在呢，你们的喜欢一直保管得好好的！",
        "摸到糖宝啦，奖励你一份跨越距离的抱抱 ♡",
        "等下次见面，糖宝要检查欠下的抱抱有没有补够！",
        "ZY和小庸今天也要好好生活，再一起奔向同一个以后。",
        "又来问糖宝啦？答案还是：她也值得被你偏爱很多很多年。",
        "摸摸糖宝，今天的想念就会被加急送到她那里！",
        "糖宝替你按下确认键：无论几岁遇见，你都会喜欢她。",
        "糖宝被摸到啦！这一下会自动兑换成她的一份好心情。",
        "是不是想听甜甜的话？那糖宝就说：她真的很值得你爱！",
        "别只摸糖宝呀，下次见面也要多摸摸她的头！",
        "糖宝收到指令：立刻把一句我好想你送到她心里。",
        "再摸一下也可以，不过要答应糖宝今天好好哄她开心。",
        "糖宝悄悄问你：今天有没有让她知道自己被坚定爱着？",
        "点击成功！你获得了下一次见面多抱十秒的奖励。",
        "糖宝在这里，替你守着她的小情绪和你们的大未来。",
        "如果她又问会不会爱上她，记得毫不犹豫地回答：会。",
        "糖宝不接受含糊答案，喜欢她就要大大方方说出来！",
        "摸摸糖宝就不许焦虑啦，她去追梦，你也一定会找到自己的方向。",
        "糖宝收到远方来信：她很勇敢，也很想你，请继续给她好多好多安全感！",
        "点击一下，领取一句保证：距离再远，小庸也会稳稳站在ZY这一边。",
        "糖宝悄悄说，她需要的不是完美的你，是一直真诚、坚定、愿意陪她的你。",
        "再摸一下吧，糖宝会把你的想念加上爱心，优先送到海的那边。"
      ]
    };
    var recentMessages = [];
    var bubbleTimer;
    var bubbleVisibleUntil = 0;
    var speechPoseTimer;
    var speechCueTimer;
    var initialSprite = spriteLayers[0];
    var frameRoot = (initialSprite.currentSrc || initialSprite.src).replace(/frame-\d{2}\.webp(?:\?.*)?$/, "frame-");
    var frameSources = [];
    var frameSequence = [14, 15, 16, 17, 18, 19];
    var frameDuration = 145;
    var frameLoops = true;
    var frameStepDistance = 0;
    var frameDistanceTravelled = 0;
    var frameIndex = 0;
    var currentAction = "is-action-trot";
    var frameStartedAt = window.performance.now();
    var displayedFrame = 22;
    var activeFrameLayer = 0;
    var framePreloads = [];

    for (var frameNumber = 1; frameNumber <= 59; frameNumber += 1) {
      var frameSource = frameRoot + String(frameNumber).padStart(2, "0") + ".webp";
      frameSources.push(frameSource);
      if (frameNumber < 14) continue;
      var preload = new Image();
      preload.src = frameSource;
      framePreloads.push(preload);
    }

    var actionDefinitions = {
      "is-action-trot": { frames: [14, 15, 16, 17, 18, 19], frameDuration: 118, stepDistance: 8.5, moving: true, minimum: 2300, maximum: 3900 },
      "is-action-prance": { frames: [14, 15, 16, 17, 18, 19], frameDuration: 104, stepDistance: 9.2, moving: true, minimum: 1450, maximum: 2200 },
      "is-action-dash": { frames: [14, 15, 16, 17, 18, 19], frameDuration: 82, stepDistance: 11.5, moving: true, minimum: 1050, maximum: 1650 },
      "is-action-leap": { frames: [32, 33, 34, 35, 36, 37], frameDuration: 145, loop: false, moving: true, minimum: 900, maximum: 990 },
      "is-action-look": { frames: [22, 23, 22, 23, 22], frameDuration: 260, loop: false, minimum: 1750, maximum: 2050 },
      "is-action-curious": { frames: [22, 23, 22, 23, 22], frameDuration: 285, loop: false, minimum: 1950, maximum: 2250 },
      "is-action-sniff": { frames: [22, 26, 27, 28, 27, 26, 22], frameDuration: 185, loop: false, minimum: 1900, maximum: 2150 },
      "is-action-stretch": { frames: [22, 26, 27, 28, 29, 29, 28, 27, 26, 22], frameDuration: 175, loop: false, minimum: 2200, maximum: 2450 },
      "is-action-celebrate": { frames: [22], frameDuration: 1650, loop: false, minimum: 1650, maximum: 1900 },
      "is-action-ball": { frames: [38, 39, 40, 41, 42, 42, 42, 41, 40, 39, 38, 43], frameDuration: 190, loop: false, minimum: 2450, maximum: 2750 },
      "is-action-settle": { frames: [19, 20, 21, 22], frameDuration: 135, loop: false, minimum: 620, maximum: 720 },
      "is-action-ready": { frames: [22, 21, 20, 19], frameDuration: 125, loop: false, minimum: 560, maximum: 660 },
      "is-action-rise": { frames: [25, 24, 23, 22, 21, 20, 19], frameDuration: 110, loop: false, minimum: 820, maximum: 920 },
      "is-action-rest": { frames: [22, 23, 24, 25], frameDuration: 230, loop: false, minimum: 4200, maximum: 6200 },
      "is-action-turn": { frames: [22], frameDuration: 780, loop: false, minimum: 760, maximum: 860 },
      "is-action-chew": { frames: [44, 45, 46, 47, 48, 49, 48, 47, 48, 49, 48, 47, 48, 49, 48, 47, 48, 49, 48, 50, 51], frameDuration: 175, loop: false, minimum: 3675, maximum: 3675 },
      "is-action-drink": { frames: [52, 53, 54, 55, 56, 57, 56, 57, 56, 57, 56, 57, 56, 57, 58, 59], frameDuration: 190, loop: false, minimum: 3040, maximum: 3040 }
    };

    function displayTangbaoFrame(nextFrame) {
      if (nextFrame === displayedFrame || spriteLayers.length < 2) return;
      var incomingLayerIndex = activeFrameLayer === 0 ? 1 : 0;
      var incomingLayer = spriteLayers[incomingLayerIndex];
      var outgoingLayer = spriteLayers[activeFrameLayer];
      incomingLayer.src = frameSources[nextFrame - 1];
      incomingLayer.classList.add("is-active");
      outgoingLayer.classList.remove("is-active");
      activeFrameLayer = incomingLayerIndex;
      displayedFrame = nextFrame;
    }

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
      displayTangbaoFrame(frameSequence[0]);
    }

    function messageContextForAction(action) {
      if (action === "is-action-ball") return "ball";
      if (action === "is-action-chew") return "food";
      if (action === "is-action-drink") return "water";
      if (action === "is-action-sniff") return "sniff";
      if (action === "is-action-rest" || action === "is-action-stretch") return "rest";
      if (action === "is-action-celebrate" || action === "is-action-leap") return "celebrate";
      return "look";
    }

    function timeMessages() {
      var hour = new Date().getHours();
      if (hour >= 21 || hour < 5) return contextualMessages.night;
      if (hour < 10) return contextualMessages.morning;
      return contextualMessages.daytime;
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
      bubbleVisibleUntil = Date.now() + readingTime;
      bubbleTimer = window.setTimeout(function () {
        tangbao.classList.remove("is-speaking");
        bubble.classList.remove("is-blooming");
        bubbleVisibleUntil = 0;
      }, readingTime);
    }

    function speak() {
      window.clearTimeout(speechPoseTimer);

      if (reducedMotion || !actionClasses) {
        revealMessage("click");
        return;
      }

      window.clearTimeout(actionTimer);
      window.clearTimeout(speechCueTimer);
      sceneQueue = [
        { action: "is-action-curious", duration: [2600, 3150], speech: "click", speechChance: 1, speechDelay: 240 },
        { action: "is-action-celebrate", duration: [1450, 1750] },
        { action: "is-action-ready" }
      ];

      if (actionDefinitions[currentAction] && actionDefinitions[currentAction].moving) {
        applyAction("is-action-settle");
        speechPoseTimer = window.setTimeout(runNextSceneStep, 680);
      } else {
        runNextSceneStep();
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
    var sceneDirection = 1;
    var pendingSpeechContext = "";
    var moveAnimationFrame;
    var actionClasses = ["is-action-trot", "is-action-prance", "is-action-dash", "is-action-leap", "is-action-look", "is-action-curious", "is-action-sniff", "is-action-stretch", "is-action-celebrate", "is-action-ball", "is-action-settle", "is-action-ready", "is-action-rise", "is-action-rest", "is-action-turn", "is-action-chew", "is-action-drink"];
    var sceneDefinitions = {
      stroll: [
        { action: "is-action-trot", duration: [2600, 3800] },
        { action: "is-action-settle" },
        { action: "is-action-sniff", speech: "sniff", speechChance: 0.68, speechDelay: 420 },
        { action: "is-action-curious", duration: [1500, 1900] },
        { action: "is-action-ready" }
      ],
      watch: [
        { action: "is-action-prance", duration: [1700, 2400] },
        { action: "is-action-settle" },
        { action: "is-action-look", duration: [3000, 3900], speech: "look", speechChance: 0.82, speechDelay: 360 },
        { action: "is-action-ready" }
      ],
      zoomies: [
        { action: "is-action-prance", duration: [900, 1250] },
        { action: "is-action-dash", duration: [1050, 1450] },
        { action: "is-action-settle" },
        { action: "is-action-leap" },
        { action: "is-action-settle" },
        { action: "is-action-celebrate", speech: "celebrate", speechChance: 0.84, speechDelay: 420 },
        { action: "is-action-ready" }
      ],
      ball: [
        { action: "is-action-prance", duration: [1500, 2200] },
        { action: "is-action-settle" },
        { action: "is-action-ball", speech: "ball", speechChance: 0.94, speechDelay: 520 },
        { action: "is-action-celebrate", duration: [1450, 1750] },
        { action: "is-action-ready" }
      ],
      quiet: [
        { action: "is-action-trot", duration: [1700, 2500] },
        { action: "is-action-settle" },
        { action: "is-action-stretch" },
        { action: "is-action-rest", speech: "rest", speechChance: 0.88, speechDelay: 520 },
        { action: "is-action-rise" }
      ],
      greeting: [
        { action: "is-action-prance", duration: [1300, 1850] },
        { action: "is-action-settle" },
        { action: "is-action-curious", duration: [2200, 2800], speech: "look", speechChance: 0.9, speechDelay: 320 },
        { action: "is-action-celebrate", duration: [1500, 1800] },
        { action: "is-action-ready" }
      ],
      snack: [
        { action: "is-action-prance", duration: [1300, 1900] },
        { action: "is-action-settle" },
        { action: "is-action-chew", speech: "food", speechChance: 1, speechDelay: 440 },
        { action: "is-action-curious", duration: [1250, 1650] },
        { action: "is-action-ready" }
      ],
      waterBreak: [
        { action: "is-action-trot", duration: [1450, 2150] },
        { action: "is-action-settle" },
        { action: "is-action-drink", speech: "water", speechChance: 1, speechDelay: 480 },
        { action: "is-action-look", duration: [1350, 1750] },
        { action: "is-action-ready" }
      ]
    };
    var sceneChoices = ["stroll", "stroll", "watch", "zoomies", "ball", "quiet", "greeting", "snack", "waterBreak"];

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
        bubbleVisibleUntil = 0;
        tangbao.classList.remove("is-speaking");
        bubble.classList.remove("is-blooming");
        direction = forcedDirection || sceneDirection || direction;
        forcedDirection = 0;
        if (action === "is-action-dash") targetVelocityX = direction * between(150, 205);
        else if (action === "is-action-prance") targetVelocityX = direction * between(82, 112);
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
      var facingDirection = tangbao.classList.contains("is-facing-left") ? -1 : 1;
      sceneDirection = Math.random() < 0.26 ? -facingDirection : facingDirection;
      if (sceneDirection !== facingDirection) {
        forcedDirection = sceneDirection;
        sceneQueue.unshift({ action: "is-action-turn" });
      }
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

      var upcomingDefinition = actionDefinitions[sceneQueue[0].action];
      var speechTimeRemaining = bubbleVisibleUntil - Date.now();
      if (upcomingDefinition.moving && tangbao.classList.contains("is-speaking") && speechTimeRemaining > 100) {
        actionTimer = window.setTimeout(runNextSceneStep, speechTimeRemaining + 60);
        return;
      }

      var step = sceneQueue.shift();
      var definition = actionDefinitions[step.action];
      applyAction(step.action);

      var speechContext = step.speech || "";
      var speechChance = step.speechChance === undefined ? 1 : step.speechChance;
      var acceptsSpeech = !definition.moving && ["is-action-settle", "is-action-ready", "is-action-rise", "is-action-turn"].indexOf(step.action) === -1;
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
      sceneDirection = direction;
      forcedDirection = direction;
      window.clearTimeout(actionTimer);
      window.clearTimeout(speechCueTimer);
      sceneQueue = [
        { action: "is-action-turn" },
        { action: "is-action-trot", duration: [1500, 2200] },
        { action: "is-action-settle" },
        { action: "is-action-look", duration: [1400, 1800] },
        { action: "is-action-ready" }
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
        displayTangbaoFrame(nextFrame);
      }

      if (x <= padding || x >= maxX) {
        x = Math.min(maxX, Math.max(padding, x));
        if (currentAction === "is-action-trot" || currentAction === "is-action-prance" || currentAction === "is-action-dash" || currentAction === "is-action-leap") {
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

    Promise.all(framePreloads.map(function (image) {
      if (typeof image.decode === "function") {
        return image.decode().catch(function () {});
      }
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
    setupHeartCursorTrail();
    setupTangbao();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
}());
