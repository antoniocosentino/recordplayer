import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
let catalog;
try { catalog=JSON.parse(await readFile('content/albums.json','utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
test('local releases have complete content and valid local audio',{skip: !catalog && 'Private catalog not installed'},async()=>{
 assert.ok(Object.keys(catalog.albums).length>0);
 assert.ok(catalog.albums[catalog.defaultAlbum]);
 for(const album of Object.values(catalog.albums)){assert.ok(album.tracks.length>0);
  assert.ok(album.bio.en.length);assert.ok(album.bio.it.length);
  assert.ok((await stat(album.cover)).size>0);
  assert.equal(new Set(album.tracks.map(t=>t.id)).size,album.tracks.length);
  for(const track of album.tracks){assert.ok(track.duration>0);assert.ok((await stat(track.src)).size>1000);}
 }
});
test('page has no remote render-blocking scripts, styles, or fonts',async()=>{
 const html=await readFile('index.html','utf8');
 assert.doesNotMatch(html,/(?:src|href)=["'](?:https?:)?\/\//);
 assert.doesNotMatch(await readFile('styles.css','utf8'),/@import|fonts\.google|myfontastic/);
});
