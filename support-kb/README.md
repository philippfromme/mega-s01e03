# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       tenant settings and aggregate incident data
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.

## Run locally

From this directory:

```sh
npm install
npm run check
npm test
npm run build
npm run capture:desk-view
```

The build prerenders the KB routes. `capture:desk-view` copies the signed #4471 cause-review
page into `evidence/desk-view-4471-causes.html` with its built stylesheet inlined. Regenerate
that file after changing the page or its components; do not edit the rendered snapshot by hand.

The original report rows and desk notes are not included in this public repository. To refresh
the aggregate summary from a local export, run:

```sh
npm run analyze-export -- <path-to-reports-4471.json> <path-to-desk-notes.json>
```

The command writes only deduplicated totals, cause/channel/tag aggregates, date ranges,
review-flag counts and weekly counts. It does not copy report IDs, tenant names or report text.
