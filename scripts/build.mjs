import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, 'src'), { recursive: true });
await mkdir(resolve(dist, 'public'), { recursive: true });
await cp(resolve(root, 'index.html'), resolve(dist, 'index.html'));
await cp(resolve(root, 'src', 'app.js'), resolve(dist, 'src', 'app.js'));
await cp(resolve(root, 'src', 'style.css'), resolve(dist, 'src', 'style.css'));

console.log(`Build selesai: ${dist}`);
