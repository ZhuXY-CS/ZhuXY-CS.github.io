const {test} = require('node:test');
const assert = require('node:assert/strict');
const {webcrypto} = require('node:crypto');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/js/love-entry.js', 'utf8');

function fixture({storage = new Map(), storageBlocked = false, crypto = webcrypto, deviceService, invitation = '', ownerInvitation = false} = {}) {
  let mounted = false, removed = false;
  const scripts = [];
  function element() {
    return {value:'', disabled:true, textContent:'', hidden:true, firstChild:{textContent:''}, attrs:{}, listeners:{},
      setAttribute(k,v){this.attrs[k]=v;}, removeAttribute(k){delete this.attrs[k];},
      addEventListener(k,fn){this.listeners[k]=fn;}, focus(){this.focused=true;}};
  }
  const gate = element(), template = element(), form = element(), answer = element(), status = element(), submit = element(), main = element();
  const registration = element(), deviceName = element(), title = element(), answerLabel=element(), hint=element(), policy=element(), ownerLink=element();
  gate.remove = () => {removed=true;};
  template.dataset = {script:'/assets/js/zy-and-i.js'};
  template.content = {cloneNode(){return {};}};
  template.replaceWith = () => {mounted=true;};
  const nodes = {'love-entry':gate, 'love-entry-content':template, 'love-entry-form':form,
    'love-entry-answer':answer, 'love-entry-status':status, 'love-entry-submit':submit,
    'love-entry-registration':registration, 'love-entry-device-name':deviceName, 'love-entry-title':title,
    'love-entry-answer-label':answerLabel,'love-entry-hint':hint,'love-entry-device-policy':policy,'love-owner-link':ownerLink};
  const sessionStorage = {
    getItem(k){if(storageBlocked) throw Error('blocked'); return storage.get(k);},
    setItem(k,v){if(storageBlocked) throw Error('blocked'); storage.set(k,v);},
    removeItem(k){if(storageBlocked) throw Error('blocked'); storage.delete(k);}
  };
  const document = {getElementById:id=>nodes[id], querySelector:()=>main,
    createElement:()=>({}), body:{appendChild:script=>scripts.push(script)}};
  const location={hash:invitation?'#'+(ownerInvitation?'owner-invite=':'device-invite=')+invitation:'',pathname:'/zy-and-i/',search:''};
  const history={replaceState(){location.hash='';}};
  vm.runInNewContext(source, {document, window:{sessionStorage, crypto,location,history,LoveDevice:deviceService}, TextEncoder, Uint8Array,URLSearchParams});
  return {storage, answer, status, submit, scripts, main, registration, deviceName, location, ownerLink,
    entered:()=>mounted && removed,
    async send(value){answer.value=value; await form.listeners.submit({preventDefault(){}});}};
}

test('fresh visits keep content unmounted and page scripts stopped', () => {
  const f = fixture();
  assert.equal(f.entered(), false);
  assert.equal(f.scripts.length, 0);
  assert.equal(f.submit.disabled, false);
});

test('empty, malformed and impossible calendar dates never grant entry', async () => {
  for (const value of ['', 'May 24', '2026-02-30', '2026-13-24', '2026-05-24extra']) {
    const f = fixture(); await f.send(value);
    assert.equal(f.entered(), false, value);
    assert.match(f.status.textContent, /有效/);
    assert.equal(f.answer.attrs['aria-invalid'], 'true');
    assert.equal(f.storage.size, 0);
  }
});

test('wrong answers stay locked; correcting the answer opens the page once', async () => {
  const f = fixture(); await f.send('2026-05-25');
  assert.equal(f.entered(), false); assert.equal(f.scripts.length, 0); assert.equal(f.storage.size, 0);
  assert.match(f.status.textContent, /不对/);
  await f.send('2026年5月24日');
  assert.equal(f.entered(), true); assert.equal(f.scripts.length, 1); assert.equal(f.main.focused, true);
});

test('Chinese, separated, compact and full-width date inputs work', async () => {
  for (const value of ['2026年5月24日', '2026-05-24', '2026/5/24', '2026.5.24', '20260524', '２０２６／５／２４', ' 2026 年 5 月 24 日 ']) {
    const f = fixture(); await f.send(value); assert.equal(f.entered(), true, value);
  }
});

test('same-tab navigation restores passage while a fresh session requires the answer', async () => {
  const f = fixture(); await f.send('2026-05-24');
  const next = fixture({storage:f.storage});
  assert.equal(next.entered(), true); assert.equal(next.scripts.length, 1);
  assert.equal(fixture().entered(), false);
});

test('blocked browser storage still permits verification without remembering passage', async () => {
  const f = fixture({storageBlocked:true}); await f.send('2026-05-24');
  assert.equal(f.entered(), true); assert.equal(f.storage.size, 0);
});

test('unavailable or failing verification keeps the content closed', async () => {
  const unavailable = fixture({crypto:null});
  assert.equal(unavailable.submit.disabled, true); assert.equal(unavailable.entered(), false);
  const failing = fixture({crypto:{subtle:{digest:async()=>{throw Error('failed');}}}});
  await failing.send('2026-05-24');
  assert.equal(failing.entered(), false); assert.equal(failing.scripts.length, 0);
  assert.equal(failing.submit.disabled, false); assert.equal(failing.storage.size, 0);
});

test('ordinary date passage never registers a trusted device', async () => {
  let calls=0;
  const f=fixture({deviceService:{configured:true,check:async()=>null,register:async()=>{calls++;}}});
  await f.send('2026-05-24');assert.equal(f.entered(),true);assert.equal(calls,0);
});

test('backend-approved devices enter without creating an ordinary session bypass', async () => {
  const f=fixture({deviceService:{configured:true,check:async()=>({verified:true})}});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(f.entered(),true);assert.equal(f.storage.size,0);assert.equal(f.scripts.length,1);
});

test('failed device checks keep date verification available', async () => {
  const f=fixture({deviceService:{configured:true,check:async()=>{throw Error('revoked');}}});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(f.entered(),false);await f.send('2026-05-24');assert.equal(f.entered(),true);
});

test('invitations cannot be bypassed by an existing ordinary session; name is required', async () => {
  const storage=new Map([['zy-and-i.entry.v1','verified']]);
  let calls=0;
  const f=fixture({storage,invitation:'a'.repeat(43),deviceService:{configured:true,register:async()=>{calls++;return{verified:true};}}});
  assert.equal(f.entered(),false);assert.equal(f.registration.hidden,false);assert.equal(f.location.hash,'');
  await f.send('2026-05-24');assert.equal(calls,0);assert.equal(f.entered(),false);
  f.deviceName.value='test browser';await f.send('2026年5月24日');
  assert.equal(calls,1);assert.equal(f.entered(),true);assert.equal(storage.size,0);
});

test('failed or unconfigured registration never falls back to permanent local trust',async()=>{
  for(const deviceService of [undefined,{configured:true,register:async()=>{throw Error('used invitation');}}]){
    const f=fixture({invitation:'a'.repeat(43),deviceService});f.deviceName.value='test';
    await f.send('2026-05-24');assert.equal(f.entered(),false);assert.equal(f.storage.size,0);
  }
});

test('owner enrollment skips the date but only accepts a server-confirmed owner role',async()=>{
  for(const role of ['visitor','owner']){
    const f=fixture({invitation:'a'.repeat(43),ownerInvitation:true,deviceService:{configured:true,register:async()=>({verified:true,role})}});
    assert.equal(f.answer.hidden,true);assert.equal(f.storage.size,0);
    await f.send('');assert.equal(f.entered(),role==='owner');
    assert.equal(f.ownerLink.hidden,role!=='owner');
  }
});
