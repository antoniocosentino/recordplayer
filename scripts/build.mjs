import { cp, mkdir, rm } from 'node:fs/promises';
import { catalogUrl } from '../config.js';
const phpMode = catalogUrl !== './content/albums.json';
await rm('dist', { recursive:true, force:true });
await mkdir('dist');
for (const path of ['index.html','app.js','styles.css','config.js','assets','backend']) {
    await cp(path,`dist/${path}`,{recursive:true,filter: source =>
        !source.endsWith('/check.php') && !(phpMode && source.toLowerCase().endsWith('.mp3'))});
}
if (!phpMode) await cp('content','dist/content',{recursive:true});
console.log('Built dist/ — upload its contents to your FTP directory.');
