(function () {
  "use strict";

  // This static-site entry screen is a courtesy gate, not server-side access control.
  // Ordinary answers grant this tab passage only. Trusted devices require a backend proof.
  var sessionKey = "zy-and-i.entry.v1";
  var answerDigest = "f5c9dafb0468d2e6856607dd9c7f928c89a9b157e01a2f2daadca226fcff58c6";
  var gate = document.getElementById("love-entry");
  var template = document.getElementById("love-entry-content");
  var form = document.getElementById("love-entry-form");
  var answer = document.getElementById("love-entry-answer");
  var status = document.getElementById("love-entry-status");
  var submit = document.getElementById("love-entry-submit");
  var registration = document.getElementById("love-entry-registration");
  var deviceName = document.getElementById("love-entry-device-name");
  var deviceService = window.LoveDevice;
  var invitation = "";
  var ownerEnrollment = false;
  var entered = false;
  if (!gate || !template || !form || !answer || !status || !submit) return;
  if (window.addEventListener) window.addEventListener("hashchange", function () {
    // An invitation opened in an existing tab may only change its fragment.
    if (/\b(?:device|owner)-invite=/.test(window.location.hash)) window.location.reload();
  });
  // Invitation codes arrive in a fragment so they are not sent as URLs to GitHub.
  if (window.location && /\b(?:device|owner)-invite=/.test(window.location.hash)) {
    var params = new URLSearchParams(window.location.hash.slice(1));
    ownerEnrollment = params.has("owner-invite");
    invitation = params.get(ownerEnrollment ? "owner-invite" : "device-invite") || "";
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    if (registration && deviceName && /^[\w-]{43}$/.test(invitation)) {
      registration.hidden = false;
      document.getElementById("love-entry-title").textContent = "登记我们的设备";
      submit.firstChild.textContent = "登记并进入 ";
      if (ownerEnrollment) {
        document.getElementById("love-entry-title").textContent = "启用本机管理员";
        document.getElementById("love-entry-answer-label").hidden = true;
        document.getElementById("love-entry-hint").hidden = true;
        document.getElementById("love-entry-device-policy").textContent = "启用后，此浏览器可长期免验证访问，并管理其他设备。";
        answer.hidden = true;
        answer.required = false;
        deviceName.value = "管理员 Mac";
        submit.firstChild.textContent = "启用本机管理员 ";
      }
    } else {
      invitation = "";
      status.textContent = "邀请格式无效，请重新打开完整的邀请链接。";
    }
  }

  function normalizeDate(value) {
    var text = value.normalize("NFKC").replace(/\s/g, "");
    var parts = /^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})日?$/.exec(text) || /^(\d{4})(\d{2})(\d{2})$/.exec(text);
    if (!parts) return null;
    var year = Number(parts[1]), month = Number(parts[2]), day = Number(parts[3]);
    var date = new Date(Date.UTC(year, month - 1, day));
    if (year < 1000 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return String(year) + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");
  }

  function enter(moveFocus, identity) {
    if (entered) return;
    entered = true;
    var appScript = template.dataset.script;
    template.replaceWith(template.content.cloneNode(true));
    gate.remove();
    var ownerLink = document.getElementById("love-owner-link");
    if (ownerLink && identity && identity.role === "owner") ownerLink.hidden = false;
    // Mount first, then start the original page so music and animations wait for entry.
    if (appScript) {
      var script = document.createElement("script");
      script.src = appScript;
      document.body.appendChild(script);
    }
    if (moveFocus) {
      var main = document.querySelector("main");
      if (main) {
        main.setAttribute("tabindex", "-1");
        main.focus({preventScroll: true});
        main.addEventListener("blur", function () { main.removeAttribute("tabindex"); }, {once: true});
      }
    }
  }

  try {
    if (!invitation && window.sessionStorage.getItem(sessionKey) === "verified") {
      enter(false);
      return;
    }
  } catch (_) { /* Storage may be disabled; verification still works for this page. */ }

  if (!window.crypto || !window.crypto.subtle) {
    status.textContent = "当前浏览器无法完成验证，请使用新版浏览器并通过 HTTPS 打开。";
    return;
  }

  submit.disabled = false;
  if (!invitation && deviceService && deviceService.configured) {
    deviceService.check().then(function (result) {
      if (result && result.verified) enter(false, result);
    }).catch(function () {
      if (!entered) status.textContent = "设备授权暂未通过，也可以回答问题进入。";
    });
  }
  answer.addEventListener("input", function () {
    answer.removeAttribute("aria-invalid");
    status.textContent = "";
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (submit.disabled) return;
    if (invitation && (!deviceService || !deviceService.configured)) {
      status.textContent = "设备授权服务尚未启用，请稍后重新打开邀请。";
      return;
    }
    if (invitation && (!deviceName || !deviceName.value.trim())) {
      status.textContent = "请先为这台设备填写备注。";
      if (deviceName) deviceName.focus();
      return;
    }
    var normalized = ownerEnrollment ? "" : normalizeDate(answer.value);
    if (!ownerEnrollment && !normalized) {
      status.textContent = "请填写完整、有效的年月日。";
      answer.setAttribute("aria-invalid", "true");
      answer.focus();
      return;
    }
    submit.disabled = true;
    form.setAttribute("aria-busy", "true");
    try {
      if (invitation) {
        var result = await deviceService.register(invitation, normalized, deviceName.value.trim(), ownerEnrollment);
        if (!result || !result.verified) throw new Error("设备登记尚未完成，请重试。");
        if (ownerEnrollment && result.role !== "owner") throw new Error("管理员登记尚未完成，请重新打开管理员邀请。");
        // No ordinary session flag: every subsequent page load rechecks revocation.
        try { window.sessionStorage.removeItem(sessionKey); } catch (_) {}
        invitation = "";
        enter(true, result);
        return;
      }
      var buffer = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalized));
      var digest = Array.from(new Uint8Array(buffer), function (byte) { return byte.toString(16).padStart(2, "0"); }).join("");
      if (digest !== answerDigest) {
        status.textContent = "这一天好像不对，再想一想。";
        answer.setAttribute("aria-invalid", "true");
        answer.focus();
        return;
      }
      try { window.sessionStorage.setItem(sessionKey, "verified"); } catch (_) { /* No persistent bypass. */ }
      enter(true);
    } catch (error) {
      status.textContent = invitation ? (error.message || "设备登记暂时没有完成，请重试。") : "验证暂时没有完成，请再试一次。";
    } finally {
      submit.disabled = false;
      form.removeAttribute("aria-busy");
    }
  });
}());
