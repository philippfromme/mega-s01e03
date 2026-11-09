<script lang="ts">
  import summary from '#lib/data/incident-4471-summary.json';

  let { ticket, from = '2026-03-30', to = '2026-10-05' }: { ticket: number; from?: string; to?: string } = $props();

  const weeks = $derived(summary.timeline.filter((week) => week.week >= from && week.week < to));
  const max = $derived(Math.max(1, ...weeks.flatMap((week) => [week.received, week.merged])));
  const h = (n: number) => (n / max) * 100;
</script>

<figure>
  <svg viewBox="0 0 {weeks.length * 24} 140" role="img" aria-label="reports received and merged into #{ticket}, per week">
    {#each weeks as w, i (w.week)}
      <rect class="in" x={i * 24 + 2} y={110 - h(w.received)} width="9" height={h(w.received)} />
      <rect class="merged" x={i * 24 + 12} y={110 - h(w.merged)} width="9" height={h(w.merged)} />
      {#if i % 4 === 0}<text x={i * 24 + 12} y="128">{w.week.slice(5, 10)}</text>{/if}
    {/each}
  </svg>
  <figcaption><span class="key in"></span> received · <span class="key merged"></span> merged into #{ticket} · per week</figcaption>
</figure>

<style>
  svg { width: 100%; max-width: 640px; }
  .in { fill: var(--warn); }
  .merged { fill: var(--accent); }
  text { font: 8px var(--mono); fill: var(--muted); text-anchor: middle; }
  figcaption { color: var(--muted); font-size: 0.85rem; }
  .key { display: inline-block; width: 0.7em; height: 0.7em; border-radius: 2px; }
  .key.in { background: var(--warn); }
  .key.merged { background: var(--accent); }
</style>
