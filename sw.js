// 自動生成（書き出しのたびに作り直されます）。編集しないでください。
const BUILD = "sha256-d8645097c56986d448fb59c0d6ee4f2278eb0f4791591d125d3225f98a91b7e3";
const PREFIX = 'ashbound:' + new URL(self.registration.scope).pathname + ':';   // 同じサイトに別のゲームがあっても、保存領域が混ざらないように、場所ごとに分ける
const CACHE = PREFIX + BUILD;
const FILES = {"core":["./","index.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png"],"assets":[]};
self.addEventListener('install', e=>{
  e.waitUntil((async()=>{
    const c = await caches.open(CACHE);
    // 本体は必ず入れる。素材は、1つ失敗しても、ほかは入れる
    await c.addAll(FILES.core.map(u=>new Request(u,{cache:'reload'})));
    for(const u of FILES.assets){ try{ await c.add(new Request(u,{cache:'reload'})); }catch(_){} }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys()) if(k.startsWith(PREFIX) && k!==CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
async function ranged(req, res){   // 音声など、Rangeつきの要求（Safariなど）に、保存した全体から答える
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range')||''); if(!m) return res;
  const buf = await res.arrayBuffer(), n = buf.byteLength;
  let a = m[1]==='' ? Math.max(0, n-Number(m[2])) : Number(m[1]), b = (m[1]==='' || m[2]==='') ? n-1 : Math.min(n-1, Number(m[2]));
  if(!(a<=b) || a>=n) return new Response(null, {status:416, headers:{'Content-Range':'bytes */'+n}});
  return new Response(buf.slice(a,b+1), {status:206, headers:{'Content-Type':res.headers.get('Content-Type')||'application/octet-stream','Content-Range':'bytes '+a+'-'+b+'/'+n,'Content-Length':String(b-a+1)}});
}
self.addEventListener('fetch', e=>{
  const req = e.request, url = new URL(req.url);
  if(req.method!=='GET' || url.origin!==location.origin) return;
  e.respondWith((async()=>{
    const c = await caches.open(CACHE);
    let hit = await c.match(req, {ignoreSearch:true});
    if(!hit && req.mode==='navigate') hit = await c.match('index.html');
    if(hit) return req.headers.has('range') ? ranged(req, hit) : hit;
    try{ return await fetch(req); }catch(err){ return new Response('オフラインです。', {status:503, headers:{'Content-Type':'text/plain; charset=utf-8'}}); }
  })());
});
