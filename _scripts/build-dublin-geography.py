"""Emit an apply_patch for the complete atlas; requires pyproj and shapely.

Usage: python build-dublin-geography.py postcode.geojson countries.geojson
Postal source: https://zenodo.org/records/4589220 (latest complete revision).
Context coast: Natural Earth 1:10m admin-0, public domain, generalized only.
No crime values are generated or imputed here.
"""
import json
import sys
from pathlib import Path
from pyproj import Transformer
from shapely.geometry import shape, box
from shapely.ops import transform, unary_union

postal = json.loads(Path(sys.argv[1]).read_text())
assert postal['crs']['properties']['name'].endswith('2157'), 'Expected Irish Transverse Mercator'
features = postal['features']
core = [f for f in features if f['properties']['RoutingKey'].startswith('D')]
expected = {f'D{i:02}' for i in range(1, 19)} | {'D6W', 'D20', 'D22', 'D24'}
assert {f['properties']['RoutingKey'] for f in core} == expected
# One metric coordinate system for polygons, campuses and scale bar.
core_shape = unary_union([shape(f['geometry']) for f in core])
x0, y0, x1, y1 = core_shape.bounds
x0 -= 5000; x1 += 10000; y0 -= 6500; y1 += 7500
scale = min(820 / (x1-x0), 740 / (y1-y0))
ox = (900-(x1-x0)*scale)/2; oy = (800-(y1-y0)*scale)/2
# Extend the geographic clipping window to the *whole* SVG, including padding.
# Otherwise an artificial blue strip on the western margin looks like sea.
clip = box(x0-ox/scale, y1-(800-oy)/scale, x0+(900-ox)/scale, y1+oy/scale)
def point(x, y): return [round(ox+(x-x0)*scale, 1), round(oy+(y1-y)*scale, 1)]
def path(g):
    g = g.intersection(clip).simplify(25, preserve_topology=True)
    polys = [g] if g.geom_type == 'Polygon' else list(getattr(g, 'geoms', []))
    return ''.join('M'+'L'.join(','.join(map(str, point(*p[:2]))) for p in ring.coords)+'Z'
                   for poly in polys if poly.geom_type == 'Polygon' for ring in [poly.exterior, *poly.interiors])
existing = json.loads(Path('_data/dublin_atlas.json').read_text())
colors = {r['code']:r['color'] for r in existing['regions']}
colors.update({'D6W':'#c99b72', 'D20':'#849db0', 'D22':'#a594b8', 'D24':'#7f9d82'})
regions = []
for f in sorted(features, key=lambda f: (not f['properties']['RoutingKey'].startswith('D'), f['properties']['RoutingKey'])):
    p = f['properties']; g = shape(f['geometry']); code = p['RoutingKey']
    if not g.intersects(clip): continue
    center = g.intersection(clip).representative_point()
    x, y = point(center.x, center.y)
    regions.append(dict(code=code, label=code.replace('D0','D'), name=p['Descriptor'].title(),
                        core=code in expected, color=colors.get(code, '#e2e7dc'), d=path(g), x=x, y=y))
project = Transformer.from_crs(4326, 2157, always_xy=True).transform
countries = json.loads(Path(sys.argv[2]).read_text())
ireland = next(f for f in countries['features'] if f['properties']['ADMIN']=='Ireland')
land = transform(project, shape(ireland['geometry']))
# Preserve the more detailed postal coastline where those polygons exist.
land = unary_union([land, *[shape(f['geometry']) for f in features]])
campuses = []
for id,lon,lat in [('tcd',-6.2563267624625,53.343508272526),('ucd',-(6+13/60+6.1/3600),53+18/60+32.3/3600)]:
    x,y=point(*project(lon,lat)); campuses.append(dict(id=id,x=x,y=y,label_x=650,label_y=y+(-30 if id=='tcd' else 25)))
bray = point(*project(-(6+6/60+33/3600),53+12/60+16/3600))
data = dict(checked='2026-09-14', crs='EPSG:2157', width=900,height=800,coreCount=22,
            regions=regions,land=path(land),campuses=campuses,bray=dict(x=bray[0],y=bray[1]),
            scale5km=round(5000*scale,1),bounds=[x0,y0,x1,y1],
            coastlineSource='https://www.naturalearthdata.com/downloads/10m-cultural-vectors/',
            boundarySource='https://zenodo.org/records/4589220')
dest=Path('_data/dublin_geography.json'); content=json.dumps(data,ensure_ascii=False,indent=2)+'\n'
print('*** Begin Patch')
if dest.exists():
    print('*** Update File: '+str(dest)+'\n@@')
    print('\n'.join('-'+line for line in dest.read_text().splitlines()))
else: print('*** Add File: '+str(dest))
print('\n'.join('+'+line for line in content.splitlines()))
print('*** End Patch')
