// Copies the library (../src), the example pages (../examples) and the cast SVGs (../brand) into public/toon/
// so the docs always embed the current code. Runs before `dev` and `build`.
import { cpSync, rmSync, mkdirSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const out = new URL('../public/toon/', import.meta.url);

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const dir of ['src', 'examples', 'brand/cast', 'brand/logo']) {
  cpSync(new URL(`${dir}/`, root), new URL(`${dir}/`, out), { recursive: true });
}
console.log('synced src/, examples/ and brand/ → site/public/toon/');
