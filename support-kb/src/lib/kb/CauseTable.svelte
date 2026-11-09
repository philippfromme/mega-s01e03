<script lang="ts">
  import summary from '#lib/data/incident-4471-summary.json';

  let { ticket }: { ticket: number } = $props();

  const groups = $derived(summary.groups);
  const owner = $derived(summary.ticketCause);
  const tags = (g: { taggedAs: Record<string, number> }) =>
    Object.entries(g.taggedAs)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, n]) => `${tag} ×${n}`)
      .join(' · ');
  const channels = (groupChannels: Partial<Record<'app' | 'email' | 'form', number>>) =>
    Object.entries(groupChannels)
      .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
      .map(([channel, count]) => `${channel} ×${count}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{summary.mergedReports}</strong> unique reports merged into #{ticket} ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'working cause group' : 'working cause groups'}
</p>

<table>
  <thead>
  <tr><th>working group</th><th>reports</th><th>channels</th><th>intake tags</th><th>tenants</th><th>seen</th><th>ticket relation</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.cause)}
    <tr class:separate={g.cause !== owner}>
      <td><code>{g.cause}</code></td>
      <td>{g.reports}</td>
      <td class="tags">{channels(g.channels)}</td>
      <td class="tags">{tags(g)}</td>
      <td>{g.tenants}</td>
      <td>{g.firstSeen} → {g.lastSeen}</td>
      <td>{g.cause === owner ? `largest group in #${ticket}` : `also merged into #${ticket}`}</td>
    </tr>
  {/each}
</tbody>
</table>

<p class="note">{summary.reviewCount} reports were flagged for review; the working model places them within the groups above.</p>

<style>
  .sum { font-size: 1.1rem; }
  .tags { color: var(--muted); font-size: 0.85em; }
  .note { color: var(--muted); font-size: 0.85em; }
  .separate td { background: var(--warn-bg); }
  .separate td:last-child { color: var(--warn); font-weight: 600; }
</style>
