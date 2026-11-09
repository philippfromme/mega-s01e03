import {
  groupByCause,
  ticketCause,
  uniqueById,
  type Report,
  type Tenant
} from './causes.ts';

export type IncidentSummary = {
  rawRows: number;
  uniqueReports: number;
  mergedReports: number;
  duplicateRowsRemoved: number;
  ticketCause: string | null;
  reviewCount: number;
  groups: {
    cause: string;
    reports: number;
    channels: Partial<Record<'app' | 'email' | 'form', number>>;
    taggedAs: Record<string, number>;
    tenants: number;
    firstSeen: string;
    lastSeen: string;
    flaggedForReview: number;
  }[];
  timeline: { week: string; received: number; merged: number }[];
};

const DAY = 86_400_000;
const WEEK = 7 * DAY;

function weekIndex(value: string | null, start: number, rows: { received: number; merged: number }[]) {
  if (!value) return undefined;
  const index = Math.floor((Date.parse(value.slice(0, 10)) - start) / WEEK);
  return index >= 0 && index < rows.length ? rows[index] : undefined;
}

export function buildIncidentSummary(
  reports: Report[],
  tenantOf: (report: Report) => Tenant | undefined,
  ticket: number,
  reviewIds: readonly string[] = []
): IncidentSummary {
  const unique = uniqueById(reports);
  const merged = unique.filter((report) => report.mergedInto === ticket);
  const groups = groupByCause(merged, tenantOf);
  const reviewSet = new Set(reviewIds);
  const start = Date.UTC(2026, 2, 30);
  const weekCount = Math.ceil((Date.UTC(2026, 9, 5) - start) / WEEK);
  const timeline = Array.from({ length: weekCount }, (_, index) => ({
    week: new Date(start + index * WEEK).toISOString().slice(0, 10),
    received: 0,
    merged: 0
  }));

  for (const report of merged) {
    const received = weekIndex(report.receivedAt, start, timeline);
    if (received) received.received++;
    const mergedAt = weekIndex(report.mergedAt, start, timeline);
    if (mergedAt) mergedAt.merged++;
  }

  return {
    rawRows: reports.length,
    uniqueReports: unique.length,
    mergedReports: merged.length,
    duplicateRowsRemoved: reports.length - unique.length,
    ticketCause: ticketCause(groups, ticket),
    reviewCount: merged.filter((report) => reviewSet.has(report.id)).length,
    groups: groups.map((group) => ({
      cause: group.cause,
      reports: group.reports.length,
      channels: Object.fromEntries(
        [...new Set(group.reports.map((report) => report.channel))].map((channel) => [
          channel,
          group.reports.filter((report) => report.channel === channel).length
        ])
      ),
      taggedAs: group.taggedAs,
      tenants: group.tenants,
      firstSeen: group.firstSeen,
      lastSeen: group.lastSeen,
      flaggedForReview: group.reports.filter((report) => reviewSet.has(report.id)).length
    })),
    timeline
  };
}
