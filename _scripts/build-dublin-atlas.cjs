// Rebuild with downloaded CSO CJA07 JSON-stat, crimestats GeoJSON, and
// autoaddress/Rowan Molony postcode GeoJSON (Zenodo 4589220, CC BY 4.0).
// Emits a patch; never fabricates a postcode crime rate from station data.
const fs = require('node:fs');
const [csoPath, policePath, postalPath] = process.argv.slice(2);
const cso = JSON.parse(fs.readFileSync(csoPath, 'utf8'));
const police = JSON.parse(fs.readFileSync(policePath, 'utf8')).features;
const postal = JSON.parse(fs.readFileSync(postalPath, 'utf8')).features;
const dim = cso.id.map(id => cso.dimension[id].category);
const year = dim[1].index.indexOf('2025');
const aliases = {'Blackrock, Co Dublin':'Blackrock(Dublin)', 'Bridewell Dublin':'Bridewell', 'Dublin Airport':'Airport'};
const stations = dim[2].index.flatMap((code, index) => {
  const label = dim[2].label[code];
  if (!label.includes('D.M.R.')) return [];
  const name = label.replace(/^\d+ /, '').split(', D.M.R.')[0];
  const boundary = police.find(f => f.properties.station === (aliases[name] || name) && f.properties.division.startsWith('DMR'));
  if (!boundary) throw new Error('Missing district: ' + name);
  const categories = Object.fromEntries(dim[3].index.map((type, k) => [type, cso.value[(year * cso.size[2] + index) * cso.size[3] + k]]));
  const included = dim[3].index.filter(type => type !== '09');
  if (included.some(type => categories[type] == null)) throw new Error('Incomplete crime categories: ' + name);
  const count = included.reduce((sum, type) => sum + categories[type], 0);
  const population = boundary.properties.population;
  return [{code, name, count, population, rate: +(count / population * 1000).toFixed(1), categories}];
}).sort((a,b) => b.rate - a.rate);
if (stations.length !== 41) throw new Error('Unexpected CSO district coverage');
const colors = ['#b75c86','#628fd1','#bc843e','#62a58d','#997ac6','#d98170','#4f9eaf','#b89a42','#8f8ac9','#76a44e','#b76f54','#5b9fc1','#c67ca3','#81a799','#b38bbb','#88995a','#be976c','#7595b7'];
const features = postal.filter(f => /^D\d\d$/.test(f.properties.RoutingKey) && +f.properties.RoutingKey.slice(1) <= 18).sort((a,b)=>a.properties.RoutingKey.localeCompare(b.properties.RoutingKey));
if (features.length !== 18) throw new Error('Expected D01–D18 boundaries');
const rings = f => f.geometry.type === 'Polygon' ? f.geometry.coordinates : f.geometry.coordinates.flat();
const points = features.flatMap(f=>rings(f).flat());
const minX = Math.min(...points.map(p=>p[0])), maxX = Math.max(...points.map(p=>p[0]));
const minY = Math.min(...points.map(p=>p[1])), maxY = Math.max(...points.map(p=>p[1]));
const ratio = Math.cos((minY+maxY)/2 * Math.PI/180);
const scale = Math.min(650/((maxX-minX)*ratio), 650/(maxY-minY));
const project = p => [25+(p[0]-minX)*ratio*scale,25+(maxY-p[1])*scale];
function simplify(points, tolerance = 0.55) {
  if (points.length < 4) return points;
  const a=points[0], b=points[points.length-1]; let max=0, idx=0;
  for(let i=1;i<points.length-1;i++) {
    const p=points[i], dx=b[0]-a[0],dy=b[1]-a[1];
    const t=dx||dy?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy))):0;
    const d=Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);
    if(d>max){max=d;idx=i;}
  }
  return max>tolerance?simplify(points.slice(0,idx+1),tolerance).slice(0,-1).concat(simplify(points.slice(idx),tolerance)):[a,b];
}
const regions = features.map((f,i)=> {
  const rr = rings(f).map(r=>simplify(r.map(project)));
  const d=rr.map(r=>'M'+r.map(p=>p.map(x=>x.toFixed(1)).join(',')).join('L')+'Z').join('');
  const largest=rr.slice().sort((a,b)=>Math.abs(area(b))-Math.abs(area(a)))[0];
  function area(r){return r.reduce((v,p,i)=>{let q=r[(i+1)%r.length];return v+p[0]*q[1]-q[0]*p[1];},0)/2;}
  let sum=0,cx=0,cy=0;largest.forEach((p,i)=>{const q=largest[(i+1)%largest.length],v=p[0]*q[1]-q[0]*p[1];sum+=v;cx+=(p[0]+q[0])*v;cy+=(p[1]+q[1])*v;});
  return {code:f.properties.RoutingKey,label:'D'+Number(f.properties.RoutingKey.slice(1)),color:colors[i],d,x:+(cx/(3*sum)).toFixed(1),y:+(cy/(3*sum)).toFixed(1)};
});
const data={checked:'2026-09-12',year:2025,csoUpdated:cso.updated,includedCategories:['03','04','05','06','07','08','10','11','12','13','14','15','16'],excludedCategories:['01','02','09'],boundarySource:'https://doi.org/10.5281/zenodo.4589220',populationSource:'https://www.crimestats.ie/faq/',stations,regions};
const content=JSON.stringify(data,null,2)+'\n';
const path='_data/dublin_atlas.json';
const old=fs.existsSync(path)?fs.readFileSync(path,'utf8'):null;
console.log('*** Begin Patch\n'+(old===null?'*** Add File: '+path+'\n':'*** Update File: '+path+'\n@@\n'+old.trimEnd().split('\n').map(l=>'-'+l).join('\n')+'\n')+content.trimEnd().split('\n').map(l=>'+'+l).join('\n')+'\n*** End Patch');
