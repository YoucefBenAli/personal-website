(() => {
  'use strict';
  const content = window.SITE_CONTENT;
  const output = document.getElementById('output');
  const input = document.getElementById('command-input');
  const screen = document.getElementById('screen');
  const status = document.getElementById('status');
  const history = [];
  let position = 0, draft = '', completion = null, theme = 'cyan';
  let keyboardNavigation = false;
  const desktopKeyboard = matchMedia('(hover: hover) and (pointer: fine)');
  const interactive = 'a, button, input, textarea, select, [contenteditable], [tabindex]';
  const hasSelection = () => Boolean(window.getSelection()?.toString());
  function focusPrompt() {
    keyboardNavigation = false;
    input.focus({ preventScroll: true });
  }
  const themes = ['cyan', 'lime', 'amber'];
  function applyTheme(name, persist = false) {
    theme = name;
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    document.getElementById('theme-label').textContent = theme;
    if (persist) {
      try { localStorage.setItem('terminal-theme', theme); } catch { /* Optional storage. */ }
    }
  }
  const commands = [
    ['whoami', 'a little context'], ['stack', 'tools I use'],
    ['experience', 'where I’ve worked'], ['ai', 'my AI coding setup'],
    ['github', 'my code'],
    ['contact', 'get in touch'], ['theme', 'cycle the palette'],
    ['help', 'available commands'], ['home', 'back to the beginning'],
    ['clear', 'clear the transcript'], ['designs', 'saved design studies'],
    ['ls', 'list content files'], ['cat', 'read a content file']
  ];
  // Content-only commands appear as virtual files; both entry points share the
  // same renderer so links, formatting, and empty states always stay in sync.
  const files = {
    'whoami.txt': 'whoami',
    'stack.txt': 'stack',
    'experience.txt': 'experience',
    'ai.txt': 'ai',
    'github.txt': 'github',
    'contact.txt': 'contact'
  };
  const completions = [...commands.map(([name]) => name), ...themes.map(name => `theme ${name}`), 'theme reset',
    ...Object.keys(files).map(name => `cat ${name}`), 'versions'];
  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (tag === 'a') {
      element.target = '_blank';
      element.rel = 'noopener noreferrer';
    }
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  const print = (parent, text, className) => parent.append(node('p', text, className));
  function link(parent, label, url) {
    try {
      const parsed = new URL(url);
      if (!['https:', 'http:'].includes(parsed.protocol)) return false;
      const anchor = node('a', label);
      anchor.href = parsed.href;
      parent.append(anchor);
      return true;
    } catch { return false; }
  }
  function help(parent, introductory = false) {
    const menu = node('div', undefined, 'menu');
    menu.append(node('div', introductory ? 'Type/click a command' : 'Available commands', 'menu-heading'));
    for (const [name, description] of commands) {
      if (['ls', 'cat'].includes(name)) continue;
      if (introductory && ['home', 'designs'].includes(name)) continue;
      const row = node('div', undefined, 'menu-row');
      const button = node('button', name, 'command');
      button.type = 'button';
      button.dataset.command = name;
      const leader = node('span', undefined, 'leader');
      leader.setAttribute('aria-hidden', 'true');
      row.append(button, leader, node('span', description, 'description'));
      menu.append(row);
    }
    parent.append(menu);
    if (!introductory) {
      print(parent, 'theme [cyan | lime | amber] selects and remembers a palette. theme reset restores cyan and clears the preference.', 'muted');
      print(parent, 'Tab completes / cycles · ↑ ↓ history · Shift+Tab leaves input · Escape releases focus · Ctrl+C cancels a line · Ctrl/⌘+L clears.', 'muted');
    }
  }
  function welcome() {
    const intro = node('div', undefined, 'intro');
    intro.append(node('h1', content.name || 'Personal terminal'), node('p', content.tagline, 'tagline'));
    output.append(intro);
    help(output, true);
  }
  function resetInput() {
    input.value = '';
    completion = null;
    position = history.length;
    draft = '';
  }
  function finish(message = '') {
    status.textContent = message;
    focusPrompt();
    screen.scrollTop = screen.scrollHeight;
  }
  function run(raw) {
    const value = raw.trim();
    if (!value) { resetInput(); finish(); return; }
    if (history.at(-1) !== value) history.push(value);
    if (history.length > 100) history.shift();
    resetInput();
    let command = value.toLowerCase().replace(/\s+/g, ' ');
    if (command === 'clear' || command === 'home') {
      output.replaceChildren();
      if (command === 'home') welcome();
      finish(command === 'clear' ? 'Transcript cleared. Type help to list commands.' : 'Home restored.');
      return;
    }
    const entry = node('div', undefined, 'entry');
    const echo = node('div', undefined, 'echo');
    echo.append(node('span', 'youcef@home:~ $ ', 'echo-prefix'), document.createTextNode(value));
    const response = node('div', undefined, 'response');
    entry.append(echo, response);
    output.append(entry);
    if (command === 'cat' || command.startsWith('cat ')) {
      const filename = command.slice(4).replace(/^\.\//, '');
      if (!Object.hasOwn(files, filename)) {
        print(response, command === 'cat' ? 'Usage: cat <file>\nType ls to list available files.' : `cat: ${value.slice(4).trim()}: No such file\nType ls to list available files.`, 'error');
        finish();
        return;
      }
      command = files[filename];
    }
    switch (command) {
      case 'theme reset':
        applyTheme('cyan');
        try { localStorage.removeItem('terminal-theme'); } catch { /* Optional storage. */ }
        print(response, 'Theme reset to cyan. Saved preference cleared.');
        break;
      case 'ls': print(response, Object.keys(files).join('  ')); break;
      case 'help': help(response); break;
      case 'whoami':
      case 'stack':
      case 'experience': {
        const paragraphs = content[command === 'whoami' ? 'about' : command];
        if (paragraphs.length) paragraphs.forEach(text => print(response, text));
        else print(response, command === 'whoami' ? 'A personal introduction will appear here once it is configured.' : command === 'stack' ? 'No toolkit listed yet.' : 'No experience listed yet.', 'muted');
        break;
      }
      case 'ai':
        if (content.ai?.description) print(response, content.ai.description);
        if (!link(response, content.ai?.linkLabel || 'AI setup on GitHub ↗', content.ai?.url)) {
          print(response, 'No AI setup repository configured yet.', 'muted');
        }
        break;
      case 'github':
        if (!link(response, 'GitHub profile ↗', content.github)) print(response, 'No GitHub profile configured yet.', 'muted');
        break;
      case 'contact': {
        if (content.contact) print(response, content.contact);
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.email)) {
          const anchor = node('a', content.email);
          anchor.href = `mailto:${encodeURIComponent(content.email)}`;
          response.append(anchor);
        } else print(response, 'No contact address configured yet.', 'muted');
        break;
      }
      case 'designs':
      case 'versions': {
        print(response, 'The original comparison terminal is preserved with current, previous, and archived mockups.', 'muted');
        const anchor = node('a', 'Open design comparison ↗');
        anchor.href = 'design-studies.html';
        response.append(anchor);
        break;
      }
      default:
        if (command === 'theme' || command.startsWith('theme ')) {
          const requested = command === 'theme' ? themes[(themes.indexOf(theme) + 1) % themes.length] : command.slice(6);
          if (!themes.includes(requested)) print(response, 'Unknown theme. Choose cyan, lime, or amber, or use theme reset.', 'error');
          else {
            applyTheme(requested, true);
            print(response, `Theme set to ${theme}.`);
          }
        } else print(response, `Command not found: ${value}\nType help to see available commands.`, 'error');
    }
    finish();
  }
  document.getElementById('command-form').addEventListener('submit', event => {
    event.preventDefault(); run(input.value);
  });
  output.addEventListener('click', event => {
    const button = event.target.closest('button[data-command]');
    if (button && output.contains(button)) run(button.dataset.command);
  });
  input.addEventListener('input', () => { completion = null; });
  input.addEventListener('keydown', event => {
    if (event.isComposing) return;
    // Only trap Tab when completing. All other Tab presses stay native.
    if (event.key === 'Tab') keyboardNavigation = true;
    if (event.key === 'Tab' && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const prefix = input.value.trimStart().toLowerCase();
      if (!prefix) return; // Empty input retains ordinary Tab navigation.
      if (!completion || completion.value !== input.value) {
        const matches = completions.filter(name => name.startsWith(prefix) && (prefix.includes(' ') || !name.includes(' ')));
        if (!matches.length) return;
        completion = { matches, index: -1, value: input.value };
      }
      event.preventDefault();
      keyboardNavigation = false;
      completion.index = (completion.index + 1) % completion.matches.length;
      input.value = completion.matches[completion.index];
      completion.value = input.value;
      status.textContent = `Match ${completion.index + 1} of ${completion.matches.length}: ${input.value}. Tab cycles; Shift+Tab leaves the input.`;
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      if (position === history.length) draft = input.value;
      position = Math.max(0, Math.min(history.length, position + (event.key === 'ArrowUp' ? -1 : 1)));
      input.value = position === history.length ? draft : history[position] || '';
      completion = null;
      input.setSelectionRange(input.value.length, input.value.length);
    } else if (event.ctrlKey && !event.metaKey && !event.altKey && event.key.toLowerCase() === 'c') {
      // Keep native copy for both transcript selections and selected input text.
      if (!input.value || hasSelection() || input.selectionStart !== input.selectionEnd) return;
      event.preventDefault();
      const entry = node('div', undefined, 'entry');
      const echo = node('div', undefined, 'echo');
      echo.append(node('span', 'youcef@home:~ $ ', 'echo-prefix'), document.createTextNode(input.value + '^C'));
      entry.append(echo);
      output.append(entry);
      resetInput(); // Cancelled lines are not added to command history.
      finish('Line cancelled. The terminal prompt is ready.');
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') {
      event.preventDefault(); run('clear');
    } else if (event.key === 'Escape') {
      completion = null;
      keyboardNavigation = true;
      input.blur();
      status.textContent = 'Command input unfocused. Tab to navigate.';
    }
  });
  input.addEventListener('focus', () => { keyboardNavigation = false; });
  screen.addEventListener('click', event => {
    // Selection, links, and controls keep their native behavior. Ordinary terminal
    // text and empty space act as the prompt's hit area, including on touch.
    if (!event.target.closest(interactive) && !hasSelection()) focusPrompt();
  });
  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.isComposing) return;
    if (event.key === 'Tab' || event.key === 'Escape') keyboardNavigation = true;
    if (keyboardNavigation || hasSelection()) return;
    const active = document.activeElement;
    if (active === input || active?.closest(interactive)) return;
    // Resume typing after incidental focus loss without hijacking focused controls
    // or browser shortcuts. Insert the first character explicitly so it isn't lost.
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      focusPrompt();
      input.setRangeText(event.key, input.selectionStart, input.selectionEnd, 'end');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (['Enter', 'ArrowUp', 'ArrowDown'].includes(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      focusPrompt();
      if (event.key === 'Enter') run(input.value);
      else input.dispatchEvent(new KeyboardEvent('keydown', { key: event.key, bubbles: true, cancelable: true }));
    }
  });
  window.addEventListener('focus', () => {
    if (desktopKeyboard.matches && !keyboardNavigation && !hasSelection() && document.activeElement === document.body) focusPrompt();
  });
  document.getElementById('window-title').textContent = content.title;
  document.title = content.name ? `${content.name} — Terminal` : 'Personal terminal';
  applyTheme(themes.includes(document.documentElement.dataset.theme) ? document.documentElement.dataset.theme : 'cyan');
  welcome();
  // Desktop starts as a live terminal; touch devices wait for a deliberate tap
  // rather than opening the software keyboard as soon as the page loads.
  if (desktopKeyboard.matches && document.activeElement === document.body) focusPrompt();
})();
