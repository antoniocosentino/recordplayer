import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const source=(await readFile('app.js','utf8')).replace("import { catalogUrl } from './config.js';","const catalogUrl='./content/albums.json';");
import { catalog } from './fixtures.mjs';
async function start(search=''){
 const elements=new Map();const tracks=[];const audioRequests=[];const storage=new Map();
 class Element{
  constructor(){this.attrs={};this.style={setProperty(){}};this.dataset={};this.value='0';this.hidden=false;this.textContent='';}
  setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k];}
  set innerHTML(v){this.html=v;if(v.includes('class="track"')){tracks.length=0;for(const m of v.matchAll(/class="track" data-index="(\d+)"/g)){const t=new Element();t.dataset.index=m[1];t.number=new Element();t.querySelector=()=>t.number;tracks.push(t);}}}
  get innerHTML(){return this.html;}
 }
 const get=s=>{if(!elements.has(s))elements.set(s,new Element());return elements.get(s);};
 class Audio{
  constructor(){this.paused=true;this.currentTime=0;this.duration=240;this.events={};this._src='';}
  set src(v){this._src=v;audioRequests.push(v);}get src(){return this._src;}
  addEventListener(e,f){(this.events[e]??=[]).push(f);}emit(e){for(const f of this.events[e]||[])f();}
  async play(){this.paused=false;this.emit('play');}pause(){this.paused=true;this.emit('pause');}
  removeAttribute(){this._src='';}load(){this.currentTime=0;}
 }
 const document={querySelector:get,querySelectorAll:()=>tracks,documentElement:new Element(),body:new Element(),addEventListener(){}};
 const context=vm.createContext({document,Audio,URL,URLSearchParams,location:{href:'https://example.com/lab/recordplayer/'+search,search},navigator:{language:'en'},matchMedia:()=>({matches:false}),localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},fetch:async()=>({ok:true,json:async()=>structuredClone(catalog)}),console});
 await vm.runInContext(`(async()=>{${source}})()`,context);
 return {get,tracks,audioRequests,document,context};
}
test('opening each album does not load audio; playback, switching and preferences work',async()=>{
 for(const id of Object.keys(catalog.albums)){
  const app=await start('?albumId='+id);
  assert.equal(app.tracks.length,6);assert.equal(app.audioRequests.length,0);
  assert.equal(app.get('#main').attrs['aria-busy'],'false');
  await app.get('#play').onclick();assert.equal(app.audioRequests.length,1);
  assert.ok(app.audioRequests[0].endsWith(catalog.albums[id].tracks[0].src));
  assert.equal(app.get('#play').attrs['aria-label'],'Pause');
  app.get('#play').onclick();assert.equal(app.get('#play').attrs['aria-label'],'Play');
  app.get('#next').onclick();assert.equal(app.audioRequests.length,2);assert.equal(app.tracks[1].attrs['aria-current'],'true');
  app.get('#previous').onclick();assert.equal(app.tracks[0].attrs['aria-current'],'true');
  app.get('#previous').onclick();assert.equal(app.tracks[5].attrs['aria-current'],'true');
  app.get('#language').value='it';app.get('#language').onchange();assert.equal(app.document.documentElement.lang,'it');assert.equal(app.get('#bio-heading').textContent,'La band');
  app.get('#theme').onclick();assert.equal(app.document.body.dataset.theme,'light');
 }
});
test('unknown album offers release links and never loads an MP3',async()=>{
 const app=await start('?albumId=missing');assert.match(app.get('#main').innerHTML,/Record not found/);assert.equal(app.audioRequests.length,0);assert.equal(app.get('#language').disabled,true);
});
