const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const map = JSON.parse(fs.readFileSync('_data/dublin_geography.json', 'utf8'));
test('all 22 traditional postal districts are present exactly once', () => {
  const expected = Array.from({length:18}, (_, i) => 'D'+String(i+1).padStart(2,'0')).concat(['D6W','D20','D22','D24']).sort();
  assert.deepEqual(map.regions.filter(r=>r.core).map(r=>r.code).sort(), expected);
  assert.equal(new Set(map.regions.map(r=>r.code)).size, map.regions.length);
});
test('core polygons are complete within the view, and context land exists', () => {
  assert.equal(map.crs, 'EPSG:2157');
  assert.ok(map.land.length > 100);
  for (const r of map.regions.filter(r=>r.core)) {
    assert.ok(r.d.startsWith('M') && r.d.endsWith('Z'));
    for (const match of r.d.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)) {
      assert.ok(+match[1]>0 && +match[1]<map.width, r.code+' x clipped');
      assert.ok(+match[2]>0 && +match[2]<map.height, r.code+' y clipped');
    }
  }
  for (const code of ['K67','K78','K36','A94','A96']) assert.ok(map.regions.some(r=>r.code===code));
});
test('campus points land in their expected postal polygons', () => {
  function contains(d,x,y) {
    let inside=false;
    for (const ring of d.split('M').filter(Boolean)) {
      const pts=Array.from(ring.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g),m=>[+m[1],+m[2]]);
      for(let i=0,j=pts.length-1;i<pts.length;j=i++) {
        const [xi,yi]=pts[i], [xj,yj]=pts[j];
        if ((yi>y)!==(yj>y) && x<(xj-xi)*(y-yi)/(yj-yi)+xi) inside=!inside;
      }
    }
    return inside;
  }
  for (const [id,code] of [['tcd','D02'],['ucd','D04']]) {
    const c=map.campuses.find(c=>c.id===id);
    assert.ok(contains(map.regions.find(r=>r.code===code).d,c.x,c.y), id);
  }
});
test('geography never invents crime statistics', () => {
  for (const r of map.regions) for(const key of ['rate','count','population','safetyScore']) assert.equal(r[key],undefined);
  assert.ok(map.scale5km>0);
});
