import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildIncidentSummary } from '../src/lib/kb/summary.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const [reportsPath, notesPath] = process.argv.slice(2);
if (!reportsPath || !notesPath) {
  throw new Error('Usage: npm run analyze-export -- <reports-4471.json> <desk-notes.json>');
}

const reports = JSON.parse(await readFile(path.resolve(reportsPath), 'utf8'));
const notes = JSON.parse(await readFile(path.resolve(notesPath), 'utf8'));
const tenantDirectory = path.join(root, 'src', 'lib', 'data', 'tenants');
const tenants = new Map(
  await Promise.all(
    (await readdir(tenantDirectory)).map(async (file) => {
      const tenant = JSON.parse(await readFile(path.join(tenantDirectory, file), 'utf8'));
      return [tenant.handle, tenant];
    })
  )
);
const summary = buildIncidentSummary(
  reports,
  (report) => tenants.get(report.tenant),
  4471,
  notes.oneDayMove
);
await writeFile(
  path.join(root, 'src', 'lib', 'data', 'incident-4471-summary.json'),
  `${JSON.stringify(summary, null, 2)}\n`,
  'utf8'
);
console.log(`Wrote aggregate summary for ${summary.mergedReports} reports; raw rows were not copied.`);
