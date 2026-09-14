const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const all=fs.readFileSync('assets/js/zy-and-i.js','utf8');
const source=all.slice(all.indexOf('  function setupZodiac()'),all.indexOf('  function setupHeartClicks()'));
function fixture() {
  const events=[];
  const document={activeElement:null,listeners:{},addEventListener(k,f){this.listeners[k]=f;},dispatchEvent(e){events.push(e.detail.open);}};
  function element(tag='BUTTON') {
    const set=new Set();
    return {tagName:tag,hidden:false,inert:false,isConnected:true,disabled:false,dataset:{},attrs:{},listeners:{},
      classList:{add:x=>set.add(x),remove:x=>set.delete(x),contains:x=>set.has(x)},
      setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,f){this.listeners[k]=f;},
      focus(){document.activeElement=this;},getClientRects(){return this.hidden?[]:[{}];},
      closest(s){return this.matches===s?this:null;}};
  }
  const launch=element(),dialog=element('DIV'),panel=element('SECTION'),close=element(),next=element(),main=element('MAIN'),other=element('DIV');
  dialog.hidden=true;other.inert=true;
  const nav=['profiles','love','fortune'].map(p=>Object.assign(element(),{dataset:{zodiacPage:p},matches:'[data-zodiac-page]'}));
  const sections=nav.map((n,i)=>Object.assign(element('SECTION'),{dataset:{zodiacSection:n.dataset.zodiacPage},hidden:i!==0}));
  const rituals=Array.from({length:7},()=>element('ARTICLE'));
  close.matches='[data-zodiac-close]';next.matches='[data-zodiac-next]';
  dialog.querySelector=s=>({'.zodiac-panel':panel,'button[data-zodiac-close]':close}[s]);
  dialog.querySelectorAll=s=>({'[data-zodiac-ritual]':rituals,'[data-zodiac-page]':nav,'[data-zodiac-section]':sections}[s]||[]);
  panel.querySelectorAll=()=>[close,...nav,next];
  document.body=element('BODY');document.body.children=[main,other,dialog];
  document.getElementById=id=>({'zodiac-launch':launch,'zodiac-dialog':dialog}[id]);
  vm.runInNewContext(source+'\nsetupZodiac();',{document,Element:Object,Date,CustomEvent:class{constructor(type,init){this.type=type;this.detail=init.detail;}}});
  function click(target){dialog.listeners.click({target});}
  function key(key,shiftKey=false){let prevented=false;document.listeners.keydown({key,shiftKey,preventDefault(){prevented=true;}});return prevented;}
  return {document,launch,dialog,panel,close,next,main,other,nav,sections,rituals,events,click,key};
}
test('opening pauses once, closing restores focus and previous inert states',()=>{
  const f=fixture(); f.launch.focus(); f.launch.listeners.click();f.launch.listeners.click();
  assert.deepEqual(f.events,[true]);assert.equal(f.dialog.hidden,false);assert.equal(f.main.inert,true);
  assert.equal(f.document.activeElement,f.close);assert.equal(f.launch.attrs['aria-expanded'],'true');
  f.key('Escape');assert.deepEqual(f.events,[true,false]);assert.equal(f.dialog.hidden,true);
  assert.equal(f.main.inert,false);assert.equal(f.other.inert,true);assert.equal(f.document.activeElement,f.launch);
});
test('another open widget prevents a second modal and duplicate pause events',()=>{
  const f=fixture();f.document.body.classList.add('is-crime-map-open');f.launch.listeners.click();
  assert.equal(f.dialog.hidden,true);assert.deepEqual(f.events,[]);
});
test('all three sections switch, with exactly one visible',()=>{
  const f=fixture();f.launch.listeners.click();
  for(const n of f.nav){f.click(n);assert.equal(f.sections.filter(s=>!s.hidden).length,1);
    assert.equal(f.sections.find(s=>!s.hidden).dataset.zodiacSection,n.dataset.zodiacPage);assert.equal(n.attrs['aria-pressed'],'true');}
});
test('seven proposals cycle without duplicates and persist on same-day reopen',()=>{
  const f=fixture();f.launch.listeners.click();const seen=new Set();
  for(let i=0;i<7;i++){assert.equal(f.rituals.filter(r=>!r.hidden).length,1);seen.add(f.rituals.findIndex(r=>!r.hidden));f.click(f.next);}
  assert.equal(seen.size,7);const before=f.rituals.findIndex(r=>!r.hidden);f.click(f.close);f.launch.listeners.click();
  assert.equal(f.rituals.findIndex(r=>!r.hidden),before);
});
test('keyboard focus loops inside the dialog',()=>{
  const f=fixture();f.launch.listeners.click();assert.equal(f.key('Tab',true),true);assert.equal(f.document.activeElement,f.next);
  assert.equal(f.key('Tab'),true);assert.equal(f.document.activeElement,f.close);
});
