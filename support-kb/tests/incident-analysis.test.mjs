import assert from 'node:assert/strict';
import test from 'node:test';
import { buildIncidentSummary } from '../src/lib/kb/summary.ts';

const tenants = new Map([
  ['day-first-v2', { handle: 'day-first-v2', name: 'Day-first V2', locale: 'en-GB', form: 'booking-v2' }],
  ['day-first-v3', { handle: 'day-first-v3', name: 'Day-first V3', locale: 'de-DE', form: 'booking-v3' }]
]);
const tenantOf = (report) => tenants.get(report.tenant);
const makeReport = (id, tenant, channel, intakeTag, receivedAt, mergedAt = null) => ({
  id,
  tenant,
  channel,
  intakeTag,
  receivedAt,
  mergedAt,
  mergedInto: 4471,
  subject: `private subject ${id}`,
  body: `private body ${id}`,
  meta: { browserLocale: 'en-US', intakeTag }
});

test('deduplicates exports and derives the parser and form-hint group counts', () => {
  const rows = [
    makeReport('fixture-parser-app', 'day-first-v2', 'app', 'parser', '2026-04-01T10:00:00Z', '2026-07-01T10:00:00Z'),
    makeReport('fixture-parser-email', 'day-first-v2', 'email', 'hint', '2026-04-08T10:00:00Z', '2026-07-08T10:00:00Z'),
    makeReport('fixture-hint-form', 'day-first-v3', 'form', 'parser', '2026-04-15T10:00:00Z', '2026-07-15T10:00:00Z'),
    makeReport('fixture-parser-app', 'day-first-v2', 'app', 'parser', '2026-04-01T10:00:00Z', '2026-07-01T10:00:00Z')
  ];

  const summary = buildIncidentSummary(rows, tenantOf, 4471, ['fixture-parser-app']);

  assert.equal(summary.rawRows, 4);
  assert.equal(summary.uniqueReports, 3);
  assert.equal(summary.mergedReports, 3);
  assert.equal(summary.duplicateRowsRemoved, 1);
  assert.equal(summary.reviewCount, 1);
  assert.deepEqual(
    Object.fromEntries(summary.groups.map((group) => [group.cause, group.reports])),
    { parser: 2, hint: 1 }
  );
  assert.deepEqual(summary.groups[0].channels, { app: 1, email: 1 });
  assert.deepEqual(summary.groups[0].taggedAs, { parser: 1, hint: 1 });
  assert.equal(summary.groups[0].flaggedForReview, 1);
  assert.equal(summary.groups[1].flaggedForReview, 0);
});

test('exports aggregates without report IDs, subjects, bodies, or tenant handles', () => {
  const rows = [
    makeReport('private-report-id', 'day-first-v2', 'app', 'parser', '2026-04-01T10:00:00Z')
  ];
  const summary = buildIncidentSummary(rows, tenantOf, 4471, ['private-report-id']);
  const serialized = JSON.stringify(summary);

  for (const privateValue of ['private-report-id', 'private subject', 'private body', 'day-first-v2']) {
    assert.ok(!serialized.includes(privateValue));
  }
});
