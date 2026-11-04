// Regenerates docs/governance/category-review.md from the authoritative control register.
// The checker compares the published file with this rendering, so the two cannot silently diverge.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderCategoryReview } from './check-foundation.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = async relative => JSON.parse(await readFile(path.join(root, relative), 'utf8'));

const controls = await read('docs/governance/controls.json');
const verification = await read('docs/governance/verification.json');
const output = renderCategoryReview(controls.controls, verification);
await writeFile(path.join(root, 'docs/governance/category-review.md'), output, 'utf8');
console.log(`Rendered docs/governance/category-review.md from ${controls.controls.length} controls`);
