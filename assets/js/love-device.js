(function () {
  "use strict";
  var gate = document.getElementById("love-entry");
  var endpoint = gate && gate.dataset.deviceService;
  var configured = false;
  try { configured = !!endpoint && (new URL(endpoint).protocol === "https:" || new URL(endpoint).hostname === "127.0.0.1"); } catch (_) {}
  endpoint = (endpoint || "").replace(/\/$/, "");

  function database() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) return reject(new Error("此浏览器无法保存设备凭证，请关闭无痕模式后重试。"));
      var request = window.indexedDB.open("zy-and-i-devices", 1);
      request.onupgradeneeded = function () { request.result.createObjectStore("keys"); };
      request.onerror = request.onblocked = function () { reject(new Error("无法保存设备凭证，请检查浏览器的网站存储设置。")); };
      request.onsuccess = function () { resolve(request.result); };
    });
  }
  async function store(mode, value) {
    var db = await database();
    try {
      return await new Promise(function (resolve, reject) {
        var transaction = db.transaction("keys", mode === "read" ? "readonly" : "readwrite");
        var keys = transaction.objectStore("keys");
        var request = mode === "read" ? keys.get("current") : mode === "delete" ? keys.delete("current") : keys.put(value, "current");
        transaction.oncomplete = function () { resolve(request.result); };
        transaction.onerror = transaction.onabort = function () { reject(new Error("无法保存设备凭证，请检查浏览器的网站存储设置。")); };
      });
    } finally { db.close(); }
  }
  async function api(path, body, proofHeader) {
    var controller = new AbortController();
    var timer = window.setTimeout(function () { controller.abort(); }, 8000);
    try {
      var response = await fetch(endpoint + "/api/" + path, {
        method:"POST", mode:"cors", credentials:"omit", cache:"no-store", referrerPolicy:"no-referrer",
        headers:Object.assign({"Content-Type":"application/json"}, proofHeader ? {"X-Device-Proof":JSON.stringify(proofHeader)} : {}), body:JSON.stringify(body), signal:controller.signal
      });
      var data = await response.json();
      if (!response.ok) throw Object.assign(new Error(data.error || "设备服务暂时不可用。"), {status:response.status});
      return data;
    } finally { window.clearTimeout(timer); }
  }
  function base64url(buffer) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }
  async function proof(record, action) {
    var challenge = await api("challenge", {id:record.id});
    var prefix = ["zy-love-access:v1", window.location.origin, record.id, challenge.id, ""].join("\n");
    if (typeof challenge.message !== "string" || !challenge.message.startsWith(prefix)) throw new Error("设备验证响应无效。");
    var signature = await window.crypto.subtle.sign({name:"ECDSA", hash:"SHA-256"}, record.privateKey, new TextEncoder().encode(challenge.message));
    return api(action || "verify", {id:record.id, challenge:challenge.id, signature:base64url(signature)});
  }
  async function admin(path, body) {
    if (!configured) throw new Error("设备服务尚未启用。");
    var record = await store("read");
    if (!record || !record.registered) throw new Error("请先登记本机管理员浏览器。");
    body = body || {};
    var operation = "/api/admin/" + path;
    var hash = Array.from(new Uint8Array(await window.crypto.subtle.digest("SHA-256",new TextEncoder().encode(JSON.stringify(body)))),function (b) { return b.toString(16).padStart(2,"0"); }).join("");
    var challenge = await api("challenge", {id:record.id,action:operation,hash:hash});
    var prefix = ["zy-love-access:v1",window.location.origin,record.id,challenge.id,""] .join("\n");
    if (!challenge.message.startsWith(prefix) || !challenge.message.endsWith("\n"+operation+"\n"+hash)) throw new Error("管理操作验证响应无效。");
    var signature = await window.crypto.subtle.sign({name:"ECDSA",hash:"SHA-256"},record.privateKey,new TextEncoder().encode(challenge.message));
    return api("admin/"+path,body,{id:record.id,challenge:challenge.id,signature:base64url(signature)});
  }
  async function check() {
    if (!configured) return null;
    var record = await store("read");
    if (!record || !record.registered) return null;
    try { return await proof(record); }
    catch (error) { if (error.status === 401) await store("delete"); throw error; }
  }
  async function register(invitation, answer, label, ownerEnrollment) {
    if (!configured) throw new Error("设备授权服务尚未启用，请先使用日期验证。");
    var record = await store("read");
    if (record && record.registered) {
      try { var identity = await proof(record); if (!ownerEnrollment || identity.role === "owner") return identity; }
      catch (error) { if (error.status !== 401) throw error; record = null; }
    }
    if (!record) {
      var pair = await window.crypto.subtle.generateKey({name:"ECDSA", namedCurve:"P-256"}, false, ["sign", "verify"]);
      record = {id:window.crypto.randomUUID(), privateKey:pair.privateKey, publicKey:await window.crypto.subtle.exportKey("jwk", pair.publicKey), registered:false};
      await store("write", record);
    }
    // Confirm that this browser can retain and use the key BEFORE consuming the invitation.
    record = await store("read");
    var probe = new TextEncoder().encode("zy-love-access:key-storage-check");
    var signature = await window.crypto.subtle.sign({name:"ECDSA", hash:"SHA-256"}, record.privateKey, probe);
    var publicKey = await window.crypto.subtle.importKey("jwk", record.publicKey, {name:"ECDSA", namedCurve:"P-256"}, false, ["verify"]);
    if (record.privateKey.extractable || !await window.crypto.subtle.verify({name:"ECDSA", hash:"SHA-256"}, publicKey, signature, probe)) throw new Error("此浏览器无法保存设备凭证，请更换常用浏览器后重试。");
    var result = await api("register", {id:record.id, publicKey:record.publicKey, invitation:invitation, answer:answer, label:label});
    record.registered = true;
    record.label = result.label;
    record.expires = result.expires;
    record.role = result.role;
    await store("write", record);
    return proof(record);
  }
  window.LoveDevice = {configured:configured, check:check, register:register, admin:admin};
}());
