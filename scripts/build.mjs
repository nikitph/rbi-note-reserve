import {readFileSync, writeFileSync} from 'node:fs';
const vendor = new URL('../vendor/hairline/', import.meta.url);
const kernel = readFileSync(new URL('kernel.js', vendor), 'utf8');
const figure = readFileSync(new URL('../src/note-reserve.js', import.meta.url), 'utf8');
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>₹100 Note Reserve · Widget & Loader</title><link rel="icon" href="data:,">
<style>
:root { color-scheme:light; --ground:#fff; --ink:#232327; --muted:#6f6f78; --line:#e0e0e4; }
@media(prefers-color-scheme:dark) { :root:not([data-theme="light"]) { color-scheme:dark; --ground:#08090a; --ink:#d0d6e0; --muted:#8a8c95; --line:#29292d; } }
:root[data-theme="dark"] { color-scheme:dark; --ground:#08090a; --ink:#d0d6e0; --muted:#8a8c95; --line:#29292d; }
:root[data-theme="light"] { color-scheme:light; --ground:#fff; --ink:#232327; --muted:#6f6f78; --line:#e0e0e4; }
* { box-sizing:border-box; }
body { margin:0; min-height:100svh; display:grid; place-items:center; padding:40px 24px; background:var(--ground); color:var(--ink); font:14px/1.5 system-ui,sans-serif; }
main { width:100%; max-width:1000px; }
header { display:flex; justify-content:space-between; align-items:center; gap:20px; margin-bottom:28px; }
h1 { margin:0; font-size:22px; font-weight:500; letter-spacing:-.03em; }
header p { margin:4px 0 0; color:var(--muted); font-size:13px; }
.grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:24px; }
.panel { border:1px solid var(--line); border-radius:16px; overflow:hidden; }
.heading { padding:18px 20px 0; display:flex; justify-content:space-between; align-items:center; gap:12px; }
h2 { margin:0; font-size:13px; font-weight:500; }
.read,output,button { font:11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace; }
.read { color:var(--muted); }
.canvas { height:330px; display:grid; place-items:center; }
.stage { width:min(100%,420px); }
#loader { width:min(80%,320px); }
.stage svg { display:block; }
.status { margin:-32px 0 18px; text-align:center; color:var(--muted); font-size:12px; letter-spacing:.04em; }
.controls { padding:18px 20px 20px; border-top:1px solid var(--line); }
.row { display:flex; align-items:center; gap:14px; }
label { font-size:12px; color:var(--muted); }
input[type=range] { flex:1; width:0; min-width:30px; accent-color:var(--muted); cursor:pointer; }
output { min-width:42px; text-align:right; }
.hint { margin:9px 0 0; color:var(--muted); font-size:12px; }
button { padding:8px 12px; border:1px solid var(--line); border-radius:8px; background:transparent; color:var(--ink); cursor:pointer; }
button:focus-visible,input:focus-visible { outline:2px solid var(--muted); outline-offset:3px; }
@media(max-width:680px) { body {padding:28px 16px;} .grid {grid-template-columns:1fr;} header {align-items:flex-start;} .canvas {height:290px;} }
@media(max-width:320px) { .heading,.controls {padding-left:12px;padding-right:12px;} .canvas {height:230px;} header {gap:10px;} h1 {font-size:18px;} }
</style></head><body>
<main>
<header><div><h1>₹100 note reserve</h1><p>One reserve. Two ways to move.</p></div><button id="theme" aria-label="Switch colour theme">Dark</button></header>
<div class="grid">
<section class="panel" aria-labelledby="widget-title">
<div class="heading"><h2 id="widget-title">Interactive widget</h2><span class="read" id="widget-read">rest</span></div>
<div class="canvas"><div class="stage" id="widget"></div></div>
<div class="controls"><div class="row"><label for="intensity">Intensity</label><input id="intensity" type="range" min="0" max="1" step="0.01" value="0.5"><output id="intensity-value">50%</output></div><p class="hint">Hover over a bundle to lift it.</p></div>
</section>
<section class="panel" aria-labelledby="loader-title">
<div class="heading"><h2 id="loader-title">Loader</h2><span class="read" id="loader-read"></span></div>
<div class="canvas" aria-busy="true"><div class="stage" id="loader"></div></div><p class="status" role="status">Loading…</p>
<div class="controls"><div class="row"><label for="speed">Speed</label><input id="speed" type="range" min="0.25" max="3" step="0.25" value="1"><output id="speed-value">1×</output></div><p class="hint" id="cycle">6.6 seconds per cycle.</p></div>
</section>
</div></main>
<script id="hl-kernel">${kernel}</script>
<script>
const params = new URLSearchParams(location.search), root=document.documentElement;
const dark=()=>root.dataset.theme ? root.dataset.theme==='dark' : matchMedia('(prefers-color-scheme:dark)').matches;
if (['light','dark'].includes(params.get('theme'))) root.dataset.theme=params.get('theme');
const theme=document.getElementById('theme'), themeLabel=()=>theme.textContent=dark()?'Light':'Dark';
themeLabel(); theme.addEventListener('click',()=>{root.dataset.theme=dark()?'light':'dark'; themeLabel();});
window.hairline = figure => {
  HL.inject(document);
  const create=(id,mode,value)=>{
    const stage=document.getElementById(id); stage.dataset.mode=mode;
    stage.setAttribute('data-hairline',figure.name);
    stage.setAttribute('role','img');
    stage.setAttribute('aria-label',mode==='loader'?'Animated ₹100 note loading wave':figure.means);
    const svg=HL.mk('svg',{viewBox:mode==='loader'?'0 40 400 250':'0 0 400 320','aria-hidden':'true'},stage);
    const read={set textContent(v) {stage.dataset.phase=v; document.getElementById(id+'-read').textContent=mode==='loader'?'Repeating':v;}};
    return figure.mount({stage,svg,read},value);
  };
  const widget=create('widget','widget',40), loader=create('loader','loader',1);
  window.reserveWidget=widget; window.reserveLoader=loader;
  const intensity=document.getElementById('intensity'), speed=document.getElementById('speed');
  intensity.addEventListener('input',()=>{
    const v=Number(intensity.value),[lo,mid,hi]=figure.range;
    widget.set(v<=.5?lo+v*2*(mid-lo):mid+(v-.5)*2*(hi-mid));
    document.getElementById('intensity-value').textContent=Math.round(v*100)+'%';
  });
  speed.addEventListener('input',()=>{
    const v=Number(speed.value); loader.set(v);
    document.getElementById('speed-value').textContent=v+'×';
    document.getElementById('cycle').textContent=(6.6/v).toFixed(1)+' seconds per cycle.';
  });
  addEventListener('pagehide',()=>{widget.destroy();loader.destroy();},{once:true});
};
</script>
<script type="module" id="hl-figure">${figure}</script>
</body></html>`;
writeFileSync(new URL('../index.html',import.meta.url),html);
