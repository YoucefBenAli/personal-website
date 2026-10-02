# Personal website design preferences

This document records preferences confirmed during mockup iteration. It is a reference for the final implementation, not a request to implement every mockup feature.

## Overall direction

- Navigation and content should live in terminal commands and their transcript output.
- Keep a full-window terminal, compact monospace typography, and a prompt immediately after the transcript.
- Do not turn the console into a widget inside a conventional portfolio, sidebar layout, or desktop with separate content windows.

## Confirmed favorites

### Tab-to-cycle command completion

**Keep for the final version.**

Reference: `mockups/01-quiet-terminal.html` (Quiet Terminal / Field Log).

- Tab completes a partially typed command.
- Repeated Tab presses cycle through matching commands.
- Retain normal keyboard navigation when completion is not applicable, and provide an accessible way to leave the input.

### Letters system / future blog

**Liked, but keep as a TODO until the blog starts.**

Reference: `mockups/02-paper-console.html` (Paper Console / Correspondence Archive).

- Preserve the idea of a terminal-driven writing archive.
- The mockup uses `letters` to list entries and `read 01` / `read 02` to open them.
- Do not treat mockup letters as real published content or make the archive a launch requirement.
- TODO: revisit and implement this system when real blog content is available.
- The final command names and whether the archive is called “letters” or “blog” are not yet decided.

### Neon Workbench palette and theme switching

**Keep this visual direction and the ability to switch themes.**

Reference: `mockups/03-neon-workbench.html` (Neon Workbench / Signal Lab).

- Deep navy surfaces, cool light text, and bright accent colors.
- The current default accent is cyan.
- `theme` cycles accents; `theme cyan`, `theme lime`, `theme violet`, and `theme amber` choose directly.
- The current implementation changes the accent while retaining the same base surfaces and text colors.
- Theme persistence across visits has not been decided.

#### Exact color reference for the final version

Values copied from the current Neon Workbench CSS variables:

| CSS token | Role | Color |
| --- | --- | --- |
| `--bg` | Outer/page background | `#070B16` |
| `--terminal` | Terminal surface | `#090F1E` |
| `--titlebar` | Titlebar surface | `#0C1425` |
| `--line` | Borders and separators | `#202D43` |
| `--text` | Primary text | `#DCE7F5` |
| `--muted` | Secondary text | `#9AAAC0` |
| `--faint` | Subtle text | `#62738D` |
| `--cyan` | Default cyan accent | `#70F1FF` |
| `--lime` | Lime accent | `#C4FF78` |
| `--violet` | Violet accent | `#C5A0FF` |
| `--amber` | Amber accent | `#FFC477` |

Additional background treatment: a subtle blue radial glow using `rgba(47, 101, 155, 0.16)` over the page background. Treat this as a supporting reference, not a separately confirmed requirement.

## Iteration and preservation

- Keep older mockups backed up before changing them.
- Maintain quick current/previous comparison from the index website.
- Combine the preferred elements above rather than adopting one mockup wholesale.
- Other experimental features, such as simulated network traces and orbital telemetry, have not been selected for the final version.
