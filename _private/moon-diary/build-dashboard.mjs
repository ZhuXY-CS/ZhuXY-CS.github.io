import {readFileSync,writeFileSync} from 'node:fs';
const files={'/':['index.html','text/html; charset=utf-8'],'/index.html':['index.html','text/html; charset=utf-8'],'/app.js':['app.js','text/javascript; charset=utf-8'],'/style.css':['style.css','text/css; charset=utf-8']};
const assets=Object.fromEntries(Object.entries(files).map(([route,[file,mime]])=>[route,[readFileSync(new URL('public/'+file,import.meta.url),'utf8'),mime]]));
const source=readFileSync(new URL('src/worker.js',import.meta.url),'utf8').replace('const r=await env.ASSETS.fetch(request)','const r=staticAsset(request)');
writeFileSync(new URL('dashboard-worker.js',import.meta.url),`const staticFiles=${JSON.stringify(assets)};\nfunction staticAsset(request){const f=staticFiles[new URL(request.url).pathname];return f?new Response(request.method==='HEAD'?null:f[0],{headers:{'Content-Type':f[1]}}):new Response('Not found',{status:404});}\n`+source);
