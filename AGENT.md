# Website maintenance notes

Internal implementation guidance and historical notes moved from `README.md`. Keep the README focused on the public-facing personal website. Historical test results below record prior checks; they are not a guarantee that the current checkout has been tested.

## Main implementation

Open `index.html` in your browser. This is the actual implementation based on `Preferences.md`: a full-window terminal with compact monospace text, the Neon Workbench navy palette, cyan-default accents, clickable commands, history, and Tab-to-cycle completion. The prompt follows the transcript on a single scroll surface. No build step, framework, external fonts, or server is required.

## Personalize before publishing

Edit the dedicated `config.js` file to set your name, biography, toolkit, experience, AI setup, GitHub URL, and contact details. It is populated with Youcef’s supplied biography, stack, employment history, AI setup repository, GitHub profile, and email. Projects are deferred; see `TODO.md` for the backlog. Unconfigured sections show honest empty states, not fictional work or mockup copy. Text is rendered safely as text; project/profile links accept only HTTP(S) URLs. Styling lives in `assets/terminal.css`; interactions live in `assets/terminal.js`.

Commands: `whoami`, `stack`, `experience`, `ai`, `github`, `contact`, `help`, `home`, `clear`, `theme`, `ls`, and `cat`.

`ls` lists the virtual content files: `whoami.txt`, `stack.txt`, `experience.txt`, `ai.txt`, `github.txt`, and `contact.txt`. `cat whoami.txt` prints exactly the same content as `whoami`, including formatting and links; the other files work the same way. `cat ./whoami.txt` also works. Biography content is configured in the `about` field of `config.js`; `stack` and `experience` are lists in the same file. The `ai` configuration contains a description, repository URL, and link label; `ai` and `cat ai.txt` display your Pi setup and link to its GitHub repository. Tab completes and cycles filenames after `cat `. These are virtual files backed by `config.js`, not separate files on disk. Utility commands such as theme switching and clearing the screen are not exposed as files. `theme` cycles cyan → lime → amber; `theme cyan` (or another palette name) selects one directly. Each palette changes the accent, page background, terminal surface, titlebar, borders, and background glow. Cyan retains the original navy colors; lime uses deep green. Amber is inspired by [mdBook's Rust palette](https://github.com/rust-lang/mdBook/blob/master/crates/mdbook-html/front-end/css/variables.css): muted warm-taupe parchment (`#B8B1A3`), dark brown framing (`#3B2E2A`), charcoal text, and burnt-orange accents (`#80351C`). Violet is no longer available. The browser theme-color follows the selected background. Theme selections are remembered locally and restored before styles load to avoid a default-palette flash. `theme reset` returns to cyan and clears the saved preference. Only supported theme names are restored, and unavailable storage falls back safely without disabling theme switching. A terminal-driven writing archive remains a TODO until real posts exist; no sample letters are published.

The desktop experience starts with the prompt focused: just type, without clicking a textbox. Clicking ordinary terminal text or empty space returns focus to the prompt. Returning to the browser window restores prompt focus after incidental focus loss; typing from an unfocused terminal keeps the first character. Links, focused controls, selected text, browser shortcuts, and deliberate keyboard navigation are not intercepted. Touch devices wait for a deliberate terminal tap rather than opening the software keyboard on load.

Tab completes and cycles matching commands, including theme arguments. Empty or unmatched input retains normal Tab navigation. Shift+Tab always leaves the input; Escape releases terminal focus until you explicitly focus or click back into it. Arrow keys recall commands and restore your draft. Ctrl/Command+L clears the transcript. Ctrl+C cancels a nonempty line, prints `^C`, and keeps cancelled input out of history; selecting text in the prompt or transcript preserves normal copying. Command-response paragraphs use an 80-character reading measure while menus and prompts remain full-width. Text selection colors are tailored to each palette. The prompt uses a native caret with no textbox underline or submit-button chrome. The initial command list spans the terminal width; `help` exposes additional commands and keyboard instructions.

## Preserved design comparison

Type or click `designs` (or `versions`) and follow the link to `design-studies.html`, a byte-for-byte backup of the original index. In that comparison terminal, run `designs` to compare the four standalone mockups. Each entry has **current** and **previous** buttons opening an embedded preview with instant version-toggle controls and an **Index** return button. You can also type `view 2 previous` or `view 2 current`. Original mockups and snapshots are unchanged. Mockup `index` links return to the new main website.

Optionally serve the directory:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Directions

| File | Direction | Goal |
| --- | --- | --- |
| `mockups/01-quiet-terminal.html` | Quiet Terminal · Field Log | Ruled logbook details, charcoal/sage, Tab-to-cycle completion |
| `mockups/02-paper-console.html` | Paper Console · Correspondence Archive | Cream/terracotta dispatch archive with `letters`, `read 01`, `read 02` |
| `mockups/03-neon-workbench.html` | Neon Workbench · Signal Lab | Navy/neon offline lab with `signals`, `trace checkout`, and theme commands |
| `mockups/04-orbit-desktop.html` | Orbit Terminal · Orbital Field Log | Plum/peach schematic star chart and `orbit morrow` sample telemetry |

Each mockup owns its inline CSS and JavaScript so it can be edited independently. Personal details, projects, and contact information are demo placeholders—not claims about you. All four revisions use a single full-window terminal, clickable command help, a typed prompt, and transcript-based content. There are no hero sections, sidebars, project cards, docks, or separate content windows.

## Version backups

Before each new round, all existing mockup HTML files are copied byte-for-byte into a fresh snapshot directory:

- `mockups/versions/20261001-193802/` — rejected visual/layout round, saved before rollback.
- `mockups/versions/20261001-192122/` — feature-twist versions, restored byte-for-byte as current after rejecting the layout round.
- `mockups/versions/20261001-190313/` — before the earlier feature-twist round (Previous button target).

All snapshots include the four agent-owned studies and the existing `05-full-terminal.html`, which is preserved but not modified by these rounds. Archived files are read-only by convention; future rounds should create a new snapshot directory rather than overwrite them.

The latest visual/layout round was rejected and rolled back. Current files now match the saved feature-twist versions in `20261001-192122` exactly. The index's Current/Previous controls compare these restored twists with the pre-feature versions. The **Archive** selector exposes all snapshots, including the rejected layouts, so no round is lost. Switching versions reloads the preview and does not preserve its command history. Current mockups also provide `previous` and `index` commands for direct navigation. Older pre-terminal landing-page designs were not retained earlier; this snapshot preserves the files present at the start of this round.

## Reference observations

Reference: The live homepage HTML and stylesheet were inspected alongside the screenshot. The homepage was also opened in a headless browser and its clickable `about` command exercised; the remaining interaction details were inspected in its JavaScript.

- Near-black/plum background, pink accents, warm gold secondary accent, muted gray text.
- Full-window translucent terminal, thin rose border, rounded corners, three window-control dots.
- System monospace typography, small identity and tagline, generous negative space.
- Clickable command names connected to right-aligned descriptions by dotted leaders.
- Actual input prompt; commands print content rather than navigating conventional page sections.
- Source includes command history, simulated filesystem commands, minimize/fullscreen behavior, and blurred Box2D background animation.

These studies reinterpret that visual and interaction language. They do not reuse the original author's biography, project content, assets, or implementation.

## Implementation checks

`tests/terminal.cjs` is a repeatable Playwright smoke test. With Playwright installed in your development environment, run `node tests/terminal.cjs` (optionally set `CHROMIUM_PATH` to an existing Chromium binary). The site itself has no dependency on Playwright.

The implementation passed Chromium checks at 1440px, 375px, and 320px: all content commands, theme cycling and direct selection, invalid themes, Tab cycling and theme argument completion, normal Tab fallback, Shift+Tab escape, history draft restoration, literal HTML-like input, clear/help/home, preserved current/previous comparison, theme persistence across reload/navigation, `theme reset`, invalid saved-theme fallback, graceful unavailable-storage handling, Ctrl+C cancellation and copy preservation, prose width and theme-aware selection, immediate desktop typing, recovery after incidental blur without losing the first character, terminal-wide click focus, Escape release, selection and link-focus preservation, no page errors, and no horizontal document overflow. A separate touch-emulated check verifies no initial autofocus and deliberate tap-to-focus. This is a smoke test, not a full accessibility or cross-browser audit.

## Historical mockup checks

All four terminal-only revisions were opened in Chromium at 1440px desktop and 375px mobile widths. Checks covered viewport-filling terminal dimensions, a single usable input, about/stack/projects/contact commands, clear followed by help, ArrowUp history, and HTML-like input remaining text. No JavaScript page errors or horizontal document overflow were observed. The feature-twist round was checked with its completion/letter/trace/orbit commands and `previous`/`index` links. The subsequent visual/layout revisions also passed desktop/mobile command, history, input-safety, and viewport smoke tests. The index's current/previous iframe switcher, all four archived previews, and return navigation were exercised at desktop and mobile widths. Snapshot SHA-256 hashes remain unchanged from the initial copies. This is a smoke test, not a full accessibility or cross-browser audit.

## Backlog

See [TODO.md](TODO.md) for deferred projects and writing, remaining suggestions (not yet approved), and completed polish features. The projects command and virtual file are intentionally absent until real project content is ready.

## Iteration

The main implementation combines the confirmed preferences rather than adopting one mockup wholesale. The preserved mockups remain design references, not production content. For future mockup changes, continue making fresh snapshots rather than overwriting archived files.
