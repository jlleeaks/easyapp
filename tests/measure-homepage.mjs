// Local production-build measurements. Run after the fixture build documented in README.
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
const children=[];let browser;
async function waitFor(url){for(let i=0;i<100;i++){try{if((await fetch(url)).ok)return;}catch{}await new Promise(r=>setTimeout(r,200));}throw new Error('Server did not start: '+url);}
try{
 children.push(spawn(process.execPath,['tests/mock-supabase.mjs'],{stdio:'ignore'}));
 children.push(spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1'],{stdio:'ignore',env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:54321',NEXT_PUBLIC_SUPABASE_ANON_KEY:'test-anon-key-not-a-real-credential'}}));
 await waitFor('http://localhost:3000');
 browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--remote-debugging-port=9222']});
 await mkdir('test-results',{recursive:true});
 for(const preset of (process.argv[2] ? [process.argv[2]] : ['mobile','desktop'])){
  const result=await lighthouse('http://localhost:3000',{port:9222,output:'json',onlyCategories:['performance','accessibility'],},preset==='desktop'?desktopConfig:undefined);
  await writeFile(`test-results/lighthouse-${preset}.json`,result.report);
  console.log(JSON.stringify({preset,performance:result.lhr.categories.performance.score*100,accessibility:result.lhr.categories.accessibility.score*100,lcp:result.lhr.audits['largest-contentful-paint'].displayValue,cls:result.lhr.audits['cumulative-layout-shift'].displayValue,failed:Object.values(result.lhr.audits).filter(a=>a.score!==null&&a.score<1).map(a=>({id:a.id,score:a.score,title:a.title}))}));
 }
}finally{await browser?.close();for(const child of children)child.kill();}
