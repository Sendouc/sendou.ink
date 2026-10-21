# Living docs

`docs/living/` is a generated, committed set of HTML pages documenting every feature from two sources:

- **Modules**: the `Module.ts` files of `app/features/<feature>/core/` (capitalized file names). Shown: the comment at the top of the file, exports (types first) with their JSDoc and signature, the unit tests describing each export, where each export is used (grouped into loaders, actions, routes, components…) and a graph of who imports who.
- **E2E tests**: `e2e/<feature>*.spec.ts`, each test turned into readable steps grouped by who is logged in (`impersonate`), the page object being used and arrange/act/assert. Hovering a step shows the page object method, locator, helper or form field it was generated from.
- **Routes**: the feature's routes from `app/routes.ts`, with the e2e tests that render each one.

Open `docs/living/index.html` in a browser, <kbd>⌘K</kbd> searches everything. Regenerate with `pnpm run docs:living` (part of `pnpm run checks`, CI fails when the pages are stale). The generator lives in `scripts/living-docs/`.

## Capturing an e2e run

`pnpm run docs:living:capture [specs…]` runs the e2e tests (all, or the given spec files) with tracing on and keeps two things from the run:

- `docs/living/visits.json` (committed): the pathnames each test visited, the source of route coverage.
- `docs/living/screenshots/` (gitignored): a screenshot for each `test.step` (taken as the step passes) or, in tests without steps, each page divider (from the trace's screencast), shown as the test's storyboard. They exist only on the machine that ran the capture.

Run `pnpm run docs:living` afterwards to update the pages. Capturing a few specs only replaces their part of `visits.json`.

## Writing code that documents well

- **Module overview**: start a `Module.ts` file with a comment describing what the module is about, separated from the first export by the imports or an empty line.
- **JSDoc**: every module export should have one, exports without are flagged.
- **Unit tests**: `describe("Module.fn")` (or `describe("fn")`) is what links a test to the export it is about. Tests under other `describe`s are listed as "Other unit tests".
- **Page objects**: e2e steps are generated from page object method and locator names, e.g. `scrims.requestFirst()` reads "Request first". Name methods after what the user does and give them JSDoc, hovering a step shows it together with the code.
- **Users**: impersonate the seeded users through their constants (`ADMIN_ID`, `NZAP_TEST_ID`…), or give created users descriptive variable names (`owner.id` reads "owner").
- **Forms**: `form.fill("postText", …)` reads with the field's English label (from the schema's `label` and `locales/en/forms.json`) when the form helpers are created with `createFormHelpers(page, schema)`, select values read as their option labels.
- **Spec constants**: literal constants at the top of a spec (`const TOURNAMENT_NAME = "Swim or Sink"`) are shown with their value.
- **Comments** inside a test are shown as notes above the step they precede.

## Structuring e2e specs

`e2e/friends.spec.ts` is the reference.

- **One behaviour per test**, named after it ("accepting a request marks its notification read without opening the bell"). Set up the starting state with factories rather than replaying the UI flow of another test: a new test costs ~0.5s of worker time (context, database reset, logging in), less than the UI steps it skips.
- **Nested `test.describe` per capability** of the feature ("Requests", "Weekly schedule", "Pinning"), they become the headings of the e2e view.
- **`test.step`** where a test has phases that can't be set up from factories, typically a flow between users. Titles say what happens in the user's terms, starting with the user when it changes ("N-ZAP is notified and can accept it"). Step titles are what the docs show first, the generated steps sit under them, and each step gets a screenshot. Short single-behaviour tests don't need steps.
- **JSDoc above a test or `describe`** for the rule it establishes when the title can't carry it ("Pins only reorder within a section…"), shown under the title.
- **Shared setup** goes into a local function with JSDoc (`friendsWithSchedules(factories)`), it reads as one arrange step.

Features are matched to specs by file name prefix (`tournament-bracket-swiss.spec.ts` → `tournament-bracket`), exceptions and nav icons are configured in `scripts/living-docs/features.ts`.
