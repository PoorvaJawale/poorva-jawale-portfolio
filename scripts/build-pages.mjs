import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'docs');
const html = fs.readFileSync(path.join(root, 'portfolio.html'), 'utf8');
const staticMarkup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
const references = [...staticMarkup.matchAll(/(?:src|href)=["']([^"']+)["']|url\(["']?([^\s)'";]+)["']?\)/g)]
  .map(match => match[1] || match[2])
  .filter(value => !/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(value));
const assets = [...new Set(references)];
for (const asset of assets) {
  const source = path.resolve(root, asset);
  if (!source.startsWith(root + path.sep) || !fs.statSync(source).isFile()) {
    throw new Error('Invalid or missing site asset: ' + asset);
  }
}
fs.mkdirSync(output, { recursive: true });
for (const asset of assets) {
  const destination = path.resolve(output, asset);
  if (!destination.startsWith(output + path.sep)) throw new Error('Invalid output path');
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.resolve(root, asset), destination);
}
fs.writeFileSync(path.join(output, 'index.html'), html);
fs.writeFileSync(path.join(output, '.nojekyll'), '');
console.log('Prepared docs/index.html and ' + assets.length + ' local assets for GitHub Pages.');
