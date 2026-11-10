<script lang="ts">
  import summary from '#lib/data/incident-4471-summary.json';
  import outcome from '#lib/data/incident-4471-desk-outcome.json';

  let { ticket }: { ticket: number } = $props();

  const reports = (cause: string) => summary.groups.find((g) => g.cause === cause)?.reports ?? 0;
</script>

<p class="note">
  Source: {outcome.source}. Ticket #{ticket} closed {outcome.ticketClosed}.
</p>

<table>
  <thead>
    <tr><th>working group</th><th>reports</th><th>desk outcome</th><th>engineering note</th></tr>
  </thead>
  <tbody>
    {#each outcome.outcomes as o (o.cause)}
      <tr>
        <td><code>{o.cause}</code></td>
        <td>{reports(o.cause)}</td>
        <td><strong>{o.status}</strong></td>
        <td>{o.detail}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .note { color: var(--muted); font-size: 0.85em; }
</style>
