import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const prerenderedRoot = path.join(root, '.svelte-kit', 'output', 'prerendered', 'pages');
const outputRoot = path.join(root, '.svelte-kit', 'output');
const renderedPath = path.join(prerenderedRoot, 'kb', 'incidents', '4471', 'causes.html');
const html = await readFile(renderedPath, 'utf8');
const styles = [];

const links = [...html.matchAll(/<link\b(?=[^>]*\brel=["']stylesheet["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/gi)];
let standalone = html;
for (const [link, href] of links) {
  const linkPath = decodeURIComponent(href.split('?')[0]);
  const pagePath = path.relative(prerenderedRoot, renderedPath).replaceAll('\\', '/');
  const asset = linkPath.startsWith('/')
    ? linkPath.slice(1)
    : path.posix.normalize(path.posix.join(path.posix.dirname(pagePath), linkPath));
  assert.match(asset, /^_app\/immutable\/assets\/[^/]+\.css$/);
  const css = await readFile(path.join(outputRoot, 'client', asset), 'utf8');
  styles.push(`<style>${css}</style>`);
  standalone = standalone.replace(link, '');
}
standalone = standalone
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<link\b(?=[^>]*\brel=["']modulepreload["'])[^>]*>/gi, '')
  .replace(/\r\n?/g, '\n')
  .replace(/[ \t]+$/gm, '')
  .replace(/^[ \t]*\r?\n/gm, '');

assert.ok(styles.length > 0, 'rendered page did not include its stylesheet');
for (const text of [
  'class="kb',
  '379',
  '33',
  'June-only',
  'time-zone',
  'report identifiers and text are intentionally not included',
  'DR-SBDK-8D58'
]) {
  assert.ok(standalone.includes(text), `rendered page is missing ${text}`);
}
assert.ok(!standalone.includes('no desk ref'), 'rendered page has no signature-derived desk reference');

const outputDirectory = path.join(root, 'evidence');
await mkdir(outputDirectory, { recursive: true });
await writeFile(
  path.join(outputDirectory, 'desk-view-4471-causes.html'),
  standalone.replace('</head>', `${styles.join('\n')}</head>`),
  'utf8'
);
