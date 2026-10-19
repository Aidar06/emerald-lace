import { chromium } from 'file:///C:/Users/Aidar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import path from 'node:path';
import http from 'node:http';
import fs from 'node:fs/promises';
const dist=path.resolve('dist');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.mp4':'video/mp4','.ttf':'font/ttf'};
const server=http.createServer(async(req,res)=>{try{let rel=decodeURIComponent(req.url.split('?')[0]);if(rel==='/'||!path.extname(rel))rel='/index.html';const file=path.join(dist,rel);const data=await fs.readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data)}catch{res.writeHead(404);res.end()}});
await new Promise(resolve=>server.listen(4174,'127.0.0.1',resolve));
console.log('server-ready');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox']});
console.log('browser-ready');
for(const [name,viewport] of [['mobile',{width:390,height:844}],['desktop',{width:1440,height:1000}]]){
  const page=await browser.newPage({viewport,deviceScaleFactor:1});
  const cdp=await page.context().newCDPSession(page);await cdp.send('Runtime.enable');cdp.on('Runtime.exceptionThrown',event=>console.log('exception',JSON.stringify(event.exceptionDetails)));
  const errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));
  await page.route('**/api:X8-e2j1w/**',route=>route.abort());
  await page.goto('http://127.0.0.1:4174/3?skipIntro=1',{waitUntil:'domcontentloaded',timeout:15000});
  await page.waitForTimeout(1200);
  const height=await page.evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<height;y+=Math.max(300,viewport.height*.7)){await page.evaluate(value=>window.scrollTo(0,value),y);await page.waitForTimeout(70)}
  await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(300);
  await page.screenshot({path:path.resolve(`verification-${name}.png`),fullPage:true});
  const report=await page.evaluate(()=>({title:document.title,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,sections:document.querySelectorAll('main section').length,names:[...document.querySelectorAll('[data-name]')].map(x=>x.textContent),calendar:document.querySelectorAll('.calendar span').length,schedule:document.querySelectorAll('.timeline-item').length}));
  console.log(name,JSON.stringify(report),'errors',JSON.stringify(errors));
  await page.close();
}
const introPage=await browser.newPage({viewport:{width:390,height:844}});
await introPage.route('**/api:X8-e2j1w/**',route=>route.abort());
await introPage.goto('http://127.0.0.1:4174/3',{waitUntil:'domcontentloaded'});
await introPage.locator('#openInvitation').click({force:true});await introPage.waitForTimeout(2400);
await introPage.screenshot({path:path.resolve('verification-intro.png')});
console.log('intro',JSON.stringify(await introPage.evaluate(()=>({time:document.querySelector('video').currentTime,paused:document.querySelector('video').paused,readyState:document.querySelector('video').readyState,playing:document.querySelector('#intro').classList.contains('is-playing')}))));
await introPage.close();
await browser.close();
server.close();
