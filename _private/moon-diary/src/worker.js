const DAY = 86400;
export const cookieNames = {device:'__Host-moon_device', session:'__Host-moon_session'};
export async function digest(value) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), b=>b.toString(16).padStart(2,'0')).join('');
}
export function token() { return Array.from(crypto.getRandomValues(new Uint8Array(32)), b=>b.toString(16).padStart(2,'0')).join(''); }
export function validDate(value) {
  if(typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d=new Date(value+'T00:00:00Z');
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0,10)===value && value>='2000-01-01' && value<='2100-12-31';
}
export function validEntry(v) { return v && validDate(v.start) && (!v.end || (validDate(v.end) && v.end>=v.start && (Date.parse(v.end)-Date.parse(v.start))/86400000<=60)) && typeof v.note==='string' && v.note.length<=500; }
export function cookies(request) {
  return Object.fromEntries((request.headers.get('Cookie')||'').split(';').map(s=>s.trim().split('=')).filter(p=>p.length===2));
}
function cookie(name,value,age) { return `${name}=${value}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${age}`; }
export async function seal(value, secret) {
  const key=await crypto.subtle.importKey('raw',Uint8Array.from(atob(secret),c=>c.charCodeAt(0)),'AES-GCM',false,['encrypt']);
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const data=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(JSON.stringify(value))));
  return btoa(String.fromCharCode(...iv,...data));
}
export async function unseal(value,secret) {
  const bytes=Uint8Array.from(atob(value),c=>c.charCodeAt(0));
  const key=await crypto.subtle.importKey('raw',Uint8Array.from(atob(secret),c=>c.charCodeAt(0)),'AES-GCM',false,['decrypt']);
  return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12)},key,bytes.slice(12))));
}
function headers() { return {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",'Strict-Transport-Security':'max-age=31536000'}; }
function json(value,status=200,setCookies=[]) { const h=new Headers({...headers(),'Content-Type':'application/json; charset=utf-8'});setCookies.forEach(c=>h.append('Set-Cookie',c));return new Response(JSON.stringify(value),{status,headers:h}); }
async function limited(env,key,max) { const r=await env.DB.prepare('INSERT INTO limits(key,count) VALUES (?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key).first();return r.count>max; }
async function authorized(request,env,now) {
  const c=cookies(request);
  if(!/^[a-f0-9]{64}$/.test(c[cookieNames.session]||'') || !/^[a-f0-9]{64}$/.test(c[cookieNames.device]||'')) return null;
  const hash=await digest(c[cookieNames.session]),device=await digest(c[cookieNames.device]);
  const s=await env.DB.prepare('SELECT s.* FROM sessions s JOIN devices d ON s.device=d.hash WHERE s.hash=? AND s.device=? AND s.expires>? AND s.seen>? AND d.expires>?').bind(hash,device,now,now-1200,now).first();
  if(!s) return null;
  await env.DB.prepare('UPDATE sessions SET seen=? WHERE hash=?').bind(now,hash).run();
  return {hash,device};
}
export default { async fetch(request,env) {
  const url=new URL(request.url),now=Math.floor(Date.now()/1000),path=url.pathname;
  try {
    if(env.CONFIG) { const config=JSON.parse(env.CONFIG); env={...env,ANSWER_DIGEST:config.ANSWER_DIGEST,DATA_KEY:config.DATA_KEY,BOOTSTRAP_DIGEST:config.BOOTSTRAP_DIGEST}; }
    if(!path.startsWith('/api/')) {
      const r=await env.ASSETS.fetch(request),h=new Headers(r.headers);
      Object.entries(headers()).forEach(([k,v])=>h.set(k,v));h.set('X-Robots-Tag','noindex, nofollow');
      return new Response(r.body,{status:r.status,headers:h});
    }
    if(!env.DB || !env.ANSWER_DIGEST || !env.DATA_KEY || !env.BOOTSTRAP_DIGEST) return json({error:'服务尚未配置完成'},503);
    if(request.method!=='GET' && (request.headers.get('Origin')!==url.origin || !request.headers.get('Content-Type')?.startsWith('application/json'))) return json({error:'请求无效'},403);
    if(request.method==='POST' && path==='/api/unlock') {
      const ip=await digest(request.headers.get('CF-Connecting-IP')||'local');
      if(await limited(env,`ip:${ip}:${Math.floor(now/3600)}`,10) || await limited(env,`all:${Math.floor(now/3600)}`,100)) return json({error:'尝试过多，请稍后再试'},429);
      const raw=await request.text();if(raw.length>2048)return json({error:'请求过大'},413);
      const v=JSON.parse(raw);
      if(!validDate(v.answer) || await digest(v.answer)!==env.ANSWER_DIGEST) return json({error:'暂时无法解锁，请检查日期与设备授权'},401);
      const c=cookies(request),deviceRaw=c[cookieNames.device];let device;
      if(/^[a-f0-9]{64}$/.test(deviceRaw||'')) device=await env.DB.prepare('SELECT hash FROM devices WHERE hash=? AND expires>?').bind(await digest(deviceRaw),now).first();
      let issuedDevice;
      if(!device) {
        if(!/^[a-f0-9]{64}$/.test(v.invitation||''))return json({error:'首次使用需要填写设备授权码'},401);
        const inviteHash=await digest(v.invitation);let claimed;
        if(inviteHash===env.BOOTSTRAP_DIGEST) claimed=await env.DB.prepare('INSERT OR IGNORE INTO claims(hash) VALUES (?) RETURNING hash').bind(inviteHash).first();
        else claimed=await env.DB.prepare('DELETE FROM invitations WHERE hash=? AND expires>? RETURNING hash').bind(inviteHash,now).first();
        if(!claimed)return json({error:'授权码无效、已使用或已过期'},401);
        issuedDevice=token();device={hash:await digest(issuedDevice)};
        await env.DB.prepare('INSERT INTO devices(hash,created,expires) VALUES (?,?,?)').bind(device.hash,now,now+180*DAY).run();
      }
      const session=token();await env.DB.prepare('INSERT INTO sessions(hash,device,created,seen,expires) VALUES (?,?,?,?,?)').bind(await digest(session),device.hash,now,now,now+8*3600).run();
      const out=[cookie(cookieNames.session,session,8*3600)];if(issuedDevice)out.push(cookie(cookieNames.device,issuedDevice,180*DAY));
      return json({ok:true},200,out);
    }
    if(request.method==='POST' && path==='/api/lock') {
      const raw=cookies(request)[cookieNames.session];if(raw)await env.DB.prepare('DELETE FROM sessions WHERE hash=?').bind(await digest(raw)).run();
      return json({ok:true},200,[cookie(cookieNames.session,'',0)]);
    }
    const auth=await authorized(request,env,now);if(!auth)return json({error:'请先解锁'},401);
    if(request.method==='GET' && path==='/api/entries') {
      const rows=await env.DB.prepare('SELECT id,sealed FROM entries ORDER BY updated DESC LIMIT 500').all();
      const entries=await Promise.all(rows.results.map(async r=>({id:r.id,...await unseal(r.sealed,env.DATA_KEY)})));
      entries.sort((a,b)=>b.start.localeCompare(a.start));return json({entries});
    }
    if(request.method==='GET' && path==='/api/devices') {
      const r=await env.DB.prepare('SELECT hash,created,expires FROM devices WHERE expires>? ORDER BY created').bind(now).all();
      return json({devices:r.results.map(d=>({...d,current:d.hash===auth.device}))});
    }
    if(request.method==='POST') {
      if(await limited(env,`write:${auth.device}:${Math.floor(now/60)}`,30))return json({error:'操作频繁，请稍后再试'},429);
      const raw=await request.text();if(raw.length>4096)return json({error:'请求过大'},413);const v=JSON.parse(raw);
      if(path==='/api/entries') {
        if(!validEntry(v))return json({error:'请检查日期范围，备注最多500字'},400);
        const id=v.id||crypto.randomUUID();if(!/^[a-f0-9-]{36}$/.test(id))return json({error:'记录无效'},400);
        const sealed=await seal({start:v.start,end:v.end||'',note:v.note},env.DATA_KEY);
        await env.DB.prepare('INSERT INTO entries(id,sealed,updated) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET sealed=excluded.sealed,updated=excluded.updated').bind(id,sealed,now).run();return json({ok:true});
      }
      if(path==='/api/delete') { if(typeof v.id!=='string')return json({error:'记录无效'},400);await env.DB.prepare('DELETE FROM entries WHERE id=?').bind(v.id).run();return json({ok:true}); }
      if(path==='/api/invite') {
        const code=token();await env.DB.prepare('INSERT INTO invitations(hash,expires) VALUES (?,?)').bind(await digest(code),now+3600).run();return json({code,expires:now+3600});
      }
      if(path==='/api/revoke') {
        if(!/^[a-f0-9]{64}$/.test(v.hash||''))return json({error:'设备无效'},400);
        await env.DB.batch([env.DB.prepare('DELETE FROM devices WHERE hash=?').bind(v.hash),env.DB.prepare('DELETE FROM sessions WHERE device=?').bind(v.hash)]);return json({ok:true});
      }
    }
    return json({error:'接口不存在'},404);
  } catch { return json({error:'暂时无法完成，请稍后重试'},500); }
}};
