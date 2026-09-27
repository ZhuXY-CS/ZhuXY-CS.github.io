const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {execFileSync}=require('node:child_process');
const atlas=JSON.parse(fs.readFileSync('_data/dublin_atlas.json','utf8'));
const geography=JSON.parse(fs.readFileSync('_data/dublin_geography.json','utf8'));
const advice=JSON.parse(execFileSync('ruby',['-ryaml','-rjson','-e','puts YAML.load_file("_data/dublin_advice.yml").to_json'],{encoding:'utf8'}));
test('every mapped region has useful advice and only existing station references',()=>{
  const names=new Set(atlas.stations.map(s=>s.name));
  for(const region of geography.regions){
    const entry=advice[region.code];assert.ok(entry,region.code);
    for(const key of ['places','advantages','drawbacks','advice'])assert.ok(entry[key]?.trim(),region.code+' '+key);
    for(const name of entry.stations||[])assert.ok(names.has(name),region.code+' unresolved station '+name);
    if(!entry.stations)assert.ok(entry.data_gap,region.code+' unexplained gap');
    if(entry.checked){assert.ok(entry.sources?.length,region.code+' missing sources');
      for(const source of entry.sources)assert.equal(new URL(source.url).protocol,'https:');}
  }
});
test('station totals use exactly the disclosed categories and never turn null into zero',()=>{
  assert.equal(new Set(atlas.stations.map(s=>s.code)).size,atlas.stations.length);
  for(const station of atlas.stations){
    const values=atlas.includedCategories.map(key=>station.categories[key]);
    assert.ok(values.every(v=>Number.isInteger(v)&&v>=0),station.name);
    assert.equal(station.count,values.reduce((a,b)=>a+b,0),station.name);
    if(station.rate!==null)assert.equal(station.rate,+(station.count/station.population*1000).toFixed(1));
    else assert.equal(station.population,null);
  }
  const added=atlas.stations.find(s=>s.name==='Ashbourne');
  assert.equal(added.count,1178);assert.equal(added.categories['09'],null);
  assert.equal(added.population,null);assert.equal(added.rate,null);
});
