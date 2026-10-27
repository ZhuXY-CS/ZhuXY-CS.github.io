(function () {
  "use strict";
  var service = window.LoveDevice, busy = false;
  function get(id) { return document.getElementById("device-manager-" + id); }
  function node(tag,text) { var el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el; }
  function card(title,description,action,label) {
    var el=node("article");el.className="love-device-card";el.append(node("h3",title),node("p",description));
    if(action){var button=node("button",label);button.type="button";button.addEventListener("click",function(){run(async function(){await action();await refresh();});});el.append(button);}return el;
  }
  async function run(action) {
    if(busy)return;busy=true;get("status").textContent="处理中…";
    try{await action();get("status").textContent="";}catch(error){get("status").textContent=error.message||"管理服务暂时无法连接。";}finally{busy=false;}
  }
  async function refresh() {
    var data=await service.admin("list"),now=Date.now();
    var groups=data.groups||data.devices;
    var active=groups.filter(function(d){return !d.revoked&&d.expires>now;});
    get("content").hidden=false;get("count").textContent="已登记 "+active.length+" / "+data.limit+" 台设备。";
    get("invite").disabled=active.length>=data.limit;
    get("list").replaceChildren.apply(get("list"),groups.map(function(d){
      var state=d.revoked?"已撤销":d.expires<=now?"已到期":d.role==="owner"?"管理员 · 长期有效":"免验证至 "+new Date(d.expires).toLocaleDateString("zh-CN");
      var names=(d.browsers||[]).filter(function(b){return !b.revoked&&b.expires>now;}).map(function(b){return b.label;});
      var element=card(d.label,state+(names.length?" · 已授权："+names.join("、"):"")+" · 最近验证："+new Date(d.last_seen).toLocaleString("zh-CN"),!d.revoked&&d.expires>now&&d.role!=="owner"?function(){return service.admin("revoke",{id:d.id});}:null,"撤销整台设备的免验证");
      if(!d.revoked&&d.expires>now&&d.role!=="owner"){
        var add=node("button","为这台设备添加浏览器");add.type="button";add.addEventListener("click",function(){run(async function(){var invitation=await service.admin("invite",{machineId:d.id});get("url").value=invitation.url;get("new").hidden=false;await refresh();});});element.append(add);
      }
      return element;
    }));
    get("invitations").replaceChildren.apply(get("invitations"),data.invitations.map(function(i,n){return card("待使用邀请 "+(n+1),"到期："+new Date(i.expires).toLocaleString("zh-CN"),function(){return service.admin("cancel",{hash:i.hash});},"作废邀请");}));
    if(!data.invitations.length)get("invitations").append(node("p","没有待使用的邀请。"));
  }
  get("invite").addEventListener("click",function(){run(async function(){var data=await service.admin("invite");get("url").value=data.url;get("new").hidden=false;await refresh();});});
  get("refresh").addEventListener("click",function(){run(refresh);});
  get("copy").addEventListener("click",function(){run(function(){return navigator.clipboard.writeText(get("url").value);});});
  if(service&&service.configured)run(refresh);else get("status").textContent="设备服务尚未启用。";
}());
