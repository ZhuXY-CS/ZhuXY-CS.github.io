// Private Google Apps Script project. Script property MAIL_RELAY_KEY is set by the owner.
// Only fixed, discreet messages can be sent, once per Beijing calendar day.
function doPost(e) {
  const reply = value => ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
  try {
    const raw = e && e.postData && e.postData.contents;
    if (!raw || raw.length > 1024) return reply({ok:false});
    const v = JSON.parse(raw), props = PropertiesService.getScriptProperties();
    const key = props.getProperty('MAIL_RELAY_KEY');
    const now = Date.now(), day = Utilities.formatDate(new Date(now), 'Asia/Shanghai', 'yyyy-MM-dd');
    if (!key || !/^[a-f0-9]{64}$/.test(key) || v.day !== day || !Number.isSafeInteger(v.timestamp) || Math.abs(now-v.timestamp)>300000 || !/^[a-f0-9]{64}$/.test(v.signature || '')) return reply({ok:false});
    const signature = Utilities.computeHmacSha256Signature(v.day+'|'+v.timestamp,key,Utilities.Charset.UTF_8).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('');
    let mismatch=0;for(let i=0;i<64;i++)mismatch |= signature.charCodeAt(i)^v.signature.charCodeAt(i);
    if(mismatch) return reply({ok:false});
    const lock=LockService.getScriptLock();if(!lock.tryLock(10000))return reply({ok:false});
    try {
      const state=props.getProperty('LAST_MAIL_DAY');
      if(state===day)return reply({ok:true});
      // Reserve before sending: uncertain delivery must not cause duplicate mail.
      if(props.getProperty('PENDING_MAIL_DAY')===day)return reply({ok:false,uncertain:true});
      if(MailApp.getRemainingDailyQuota()<1)return reply({ok:false});
      props.setProperty('PENDING_MAIL_DAY',day);
      MailApp.sendEmail({to:'838707379@qq.com',subject:'星象日记 · 温柔提醒',body:'这几天记得多一点关心，留意她的感受。\n\n详情请打开我们的星象日记：\nhttps://our-moon-diary.zhuxycs.workers.dev/\n\n这是一条自动关怀提醒，预计时间仅供参考。',name:'星象日记'});
      props.setProperty('LAST_MAIL_DAY',day);props.deleteProperty('PENDING_MAIL_DAY');
      return reply({ok:true});
    } finally {lock.releaseLock();}
  } catch (_) {return reply({ok:false});}
}
