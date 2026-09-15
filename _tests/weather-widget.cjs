const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const all=fs.readFileSync('assets/js/zy-and-i.js','utf8');
const source=all.slice(all.indexOf('  function setupWeatherForecast()'),all.indexOf('  function setupCrimeMap()'));
async function fixture(options={}) {
  let now=Date.parse('2026-09-15T15:59:00Z'), calls=0;
  class Clock extends Date { constructor(...args){super(...(args.length?args:[now]));} static now(){return now;} }
  function el(){return {textContent:'',title:'',children:{},removeAttribute(k){delete this[k];},querySelector(k){return this.children[k] ||= el();}};}
  const places=[el(),el()];
  places.forEach((p,i)=>p.dataset={latitude:String(i),longitude:'0',timezone:i?'Asia/Shanghai':'Europe/Dublin'});
  const widget=el();widget.querySelectorAll=()=>places;
  const storage=new Map(),intervals=[],events={};
  const document={hidden:false,getElementById:()=>widget,addEventListener(k,f){events[k]=f;}};
  const window={localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setTimeout,clearTimeout,
    setInterval(f){intervals.push(f);},addEventListener(k,f){events[k]=f;}};
  const fetch=async url=>{
    calls++; const china=String(url).includes('Asia%2FShanghai');
    if(options.fail && !china) throw Error('offline');
    const date=china && now>=Date.parse('2026-09-15T16:00:00Z')?'2026-09-16':'2026-09-15';
    const tomorrow=date==='2026-09-16'?'2026-09-17':'2026-09-16';
    return {ok:true,json:async()=>({current:{time:date+'T23:45',is_day:0,weather_code:options.missing?null:0,temperature_2m:options.missing?null:20},
      daily:{time:[date,tomorrow],weather_code:[options.missing?null:3,51],temperature_2m_min:[options.missing?null:12,13],temperature_2m_max:[options.missing?null:20,21],precipitation_probability_max:[0,50]}})};
  };
  vm.runInNewContext(source+'\nsetupWeatherForecast();',{document,window,fetch,Date:Clock,Intl,URLSearchParams,AbortController,Number,Promise});
  await new Promise(setImmediate);
  return {places,document,events,intervals,calls:()=>calls,advance(ms){now+=ms;},options};
}
test('missing values stay missing instead of becoming zero or sunny',async()=>{
  const f=await fixture({missing:true}),p=f.places[0];
  assert.equal(p.querySelector('.love-weather__day--today').querySelector('.love-weather__day-temperature').textContent,'--° / --°');
  assert.equal(p.querySelector('.love-weather__day--today').querySelector('.love-weather__day-icon').textContent,'—');
  assert.equal(p.querySelector('[data-weather-current]').textContent,'当前数据缺失');
});
test('current night and daily summary are clearly separate; zero probability is preserved',async()=>{
  const f=await fixture(),p=f.places[0];
  assert.match(p.querySelector('[data-weather-current]').textContent,/🌙/);
  assert.equal(p.querySelector('.love-weather__day--today').querySelector('.love-weather__day-icon').textContent,'☁️');
  assert.match(p.querySelector('.love-weather__day--today').querySelector('.love-weather__day-condition').textContent,/降水 0%/);
});
test('one failed location does not erase the other, and the timer really retries',async()=>{
  const f=await fixture({fail:true});
  assert.equal(f.places[0].querySelector('[data-weather-current]').textContent,'暂不可用');
  assert.match(f.places[1].querySelector('[data-weather-current]').textContent,/20°/);
  f.options.fail=false;await f.intervals[0]();
  assert.match(f.places[0].querySelector('[data-weather-current]').textContent,/20°/);
  assert.equal(f.calls(),3);
});
test('midnight invalidates only the cache of the location whose date changed',async()=>{
  const f=await fixture();f.advance(120000);await f.intervals[0]();
  assert.equal(f.calls(),3);
  assert.match(f.places[1].querySelector('.love-weather__day--today').title,/2026-09-16/);
  assert.match(f.places[0].querySelector('.love-weather__day--today').title,/2026-09-15/);
});
test('hidden pages skip polling; returning refreshes expired data',async()=>{
  const f=await fixture();f.document.hidden=true;f.advance(31*60000);
  await f.intervals[0]();assert.equal(f.calls(),2);
  f.document.hidden=false;f.events.visibilitychange();await new Promise(setImmediate);
  assert.equal(f.calls(),4);
});
