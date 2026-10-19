import { chromium } from 'file:///C:/Users/Aidar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import path from 'node:path';
import http from 'node:http';
import fs from 'node:fs/promises';
const dist=path.resolve('dist');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.mp4':'video/mp4','.ttf':'font/ttf'};
const server=http.createServer(async(req,res)=>{try{let rel=decodeURIComponent(req.url.split('?')[0]);if(rel==='/'||!path.extname(rel))rel='/index.html';const file=path.join(dist,rel);const data=await fs.readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data)}catch{res.writeHead(404);res.end()}});
await new Promise(resolve=>server.listen(4174,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
for(const [name,viewport] of [['mobile',{width:390,height:844}],['desktop',{width:1440,height:1000}]]){
  const page=await browser.newPage({viewportSize:viewport,deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api:X8-e2j1w/**',route=>route.abort());
  await page.goto('http://127.0.0.1:4174/3?skipIntro=1',{waitUntil:'networkidle',timeout:30000});
  await page.screenshot({path:path.resolve(`verification-${name}.png`),fullPage:true});
  const report=await page.evaluate(()=>({title:document.title,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,sections:document.querySelectorAll('main section').length,names:[...document.querySelectorAll('[data-name]')].map(x=>x.textContent),calendar:document.querySelectorAll('.calendar span').length,schedule:document.querySelectorAll('.timeline-item').length}));
  console.log(name,JSON.stringify(report),'errors',JSON.stringify(errors));
  await page.close();
}
await browser.close();
server.close();
